import json
from urllib import request
from flask import Flask
from flask_restful import reqparse, Api, Resource
from flask_cors import CORS
from flask import request
import os
import librosa
import numpy as np
import codecs
import pandas as pd
import matplotlib, matplotlib.pyplot as plt
import sys
import mingus.core.intervals as intervals
import mingus.core.notes as notes
import mingus.core.scales as scales
import mingus.core.chords as chords
import mingus.core.progressions as progressions
import mingus.core.keys as keys
from mingus.containers import Note, NoteContainer, Bar, Track, Composition
from unidecode import unidecode
# from mingus.core.notes import augment, diminish, reduce_accidentals
# from mingus.core.keys import keys, get_notes
# from mingus.core.mt_exceptions import NoteFormatError, FormatError, RangeError

matplotlib.use('agg')

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})
api = Api(app)

parser = reqparse.RequestParser()
parser.add_argument('task')

class NpEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super(NpEncoder, self).default(obj)

CHORD = {
    'I': {},
    '1MIN': {},
    'I7': {},
    '1MIN7': {},
    'II': {},
    '2MIN': {},
    'II7': {},
    '2MIN7': {},
    'III': {},
    '3MIN': {},
    'III7': {},
    '3MIN7': {},
    'IV': {},
    '4MIN': {},
    'IV7': {},
    '4MIN7': {},
    'V': {},
    '5MIN': {},
    'V7': {},
    '5MIN7': {},
    'VI': {},
    '6MIN': {},
    'VI7': {},
    '6MIN7': {},
    'VII': {},
    '7MIN': {},
    'VII7': {},
    '7MIN7': {},
}

def detect_pitch(y, sr, times):
    pitch_values = {
        'notes': [],
        'midis': [],
        'hzs': [],
        'justs': [],
        'magnitudes': [],
    }
    pitches, magnitudes = librosa.core.piptrack(y=y, sr=sr, fmin=75, fmax=1600)
    pitches[pitches > 1e308] = 0
    for idx, t in enumerate(np.nditer(times)):
        index = magnitudes[:, t.astype(int)].argmax()
        if (f'note_{t.astype(int)}' not in pitch_values['notes'] and pitches[index, t.astype(int)]):
            pitch_values['notes'].append(librosa.hz_to_note(pitches[index, t.astype(int)]))
            pitch_values['midis'].append(librosa.hz_to_midi(pitches[index, t.astype(int)]))
            pitch_values['justs'].append(librosa.hz_to_fjs(pitches[index, t.astype(int)]))
            pitch_values['hzs'].append(pitches[index, t.astype(int)].tolist())
            pitch_values['magnitudes'].append(magnitudes[index, t.astype(int)].tolist())
    return pitch_values

@app.route('/api/onsets/<file_path>', methods=['POST'])
def onsets(file_path):
    if request.method == 'POST':
        file = request.files[file_path]
        print(file)
        y, sr = librosa.load(file)
        # # Set the hop length; at 22050 Hz, 512 samples ~= 23ms
        hop_length = 512
        print('loaded file! ', sr)
        # # Separate harmonics and percussives into two waveforms
        y_harmonic, y_percussive = librosa.effects.hpss(y)
        print('got harmonic & percussive tracks')
        # Beat track on the percussive signal
        onset_env = librosa.onset.onset_strength(y=y_percussive, sr=sr, aggregate=np.median)
        print('got onset env')
        tempo, beats = librosa.beat.beat_track(onset_envelope=onset_env, sr=sr)
        beat_times = librosa.frames_to_time(beats, sr=sr)
        print('beat tracked on percussive')
        # Compute MFCC features from the raw signal
        # numpy array corresponding to track duration in frames 
        mfcc = librosa.feature.mfcc(y=y, sr=sr, hop_length=hop_length, n_mfcc=13)

        # And the first-order differences (delta features)
        mfcc_delta = librosa.feature.delta(mfcc)

        # Stack and synchronize between beat events
        # This time, we'll use the mean value (default) instead of median
        beat_mfcc_delta = librosa.util.sync(np.vstack([mfcc, mfcc_delta]), beats)

        # Compute chroma features from the harmonic signal
        chromagram = librosa.feature.chroma_cqt(y=y_harmonic, sr=sr)

        # Aggregate chroma features between beat events
        # We'll use the median value of each feature between beat frames
        beat_chroma = librosa.util.sync(chromagram, beats, aggregate=np.median)

        # Finally, stack all beat-synchronous features together
        beat_features = np.vstack([beat_chroma, beat_mfcc_delta])

        times = librosa.frames_to_time(beats, sr=sr)

        pV = detect_pitch(y_harmonic, sr, times)
        print('sending that data!')

        return [{'data': {
            'tempo': tempo,
            'pitches': pV,
            'beatFeatures: ': beat_features.tolist(), 
            'beats': beat_times.tolist(),
            'times': times.tolist(),
        }}]

def simple_midi_name_to_num(orig_key, note):
    start = notes.note_to_int(orig_key)
    end = notes.note_to_int(note)
    note_num_in_key = end - start
    if (note_num_in_key < 0):
        note_num_in_key = note_num_in_key + 12
    return note_num_in_key

def midi_name_to_num_helper(idx, scale):
    start = notes.note_to_int(scale[0])
    end = notes.note_to_int(scale[idx])
    note_num_in_key = end - start
    if (note_num_in_key < 0):
        note_num_in_key = note_num_in_key + 12
    return note_num_in_key

def midi_name_to_num_prog_helper(idx, orig_start, scale):
    # print(idx, orig_start, scale)
    start = notes.note_to_int(orig_start[0])
    end = notes.note_to_int(scale[idx])
    note_num_in_key = end - start
    if (note_num_in_key < 0):
        note_num_in_key = note_num_in_key + 12
    return note_num_in_key

scale_degree = ''
chord_method = None
def get_chord_method(idx, variation):
    if idx == 0 and variation == 0:
        scale_degree = 'I'
        chord_method = chords.major_triad
        print('YO', str({'scale_degree': scale_degree, 'chord_method': chord_method}))
        return {'scale_degree': scale_degree, 'chord_method': chord_method}
    elif idx == 0 and variation == 1:
        scale_degree = '1MIN'
        chord_method = chords.minor_triad
        return {'scale_degree': scale_degree, 'chord_method': chord_method}
    elif idx == 0 and variation == 2:
        scale_degree = 'I7'
        chord_method = chords.major_seventh
        return {'scale_degree': scale_degree, 'chord_method': chord_method}
    elif idx == 0 and variation == 3:
        scale_degree = '1MIN7'
        # chord_method = chords.i7
        chord_method = chords.minor_seventh
        return {'scale_degree': scale_degree, 'chord_method': chord_method}
    elif idx == 1 and variation == 0:
        scale_degree = 'II'
        chord_method = chords.II
        return {'scale_degree': scale_degree, 'chord_method': chord_method}
    elif idx == 1 and variation == 1:
        scale_degree = '2MIN'
        chord_method = chords.ii
        return {'scale_degree': scale_degree, 'chord_method': chord_method}
    elif idx == 1 and variation == 2:
        scale_degree = 'II7'
        chord_method = chords.II7
        return {'scale_degree': scale_degree, 'chord_method': chord_method}
    elif idx == 1 and variation == 3:
        scale_degree = '2MIN7'
        chord_method = chords.ii7
        return {'scale_degree': scale_degree, 'chord_method': chord_method}
    elif idx == 2 and variation == 0:
        scale_degree = 'III'
        chord_method = chords.III
        return {'scale_degree': scale_degree, 'chord_method': chord_method}
    elif idx == 2 and variation == 1:
        scale_degree = '3MIN'
        chord_method = chords.iii
        return {'scale_degree': scale_degree, 'chord_method': chord_method}
    elif idx == 2 and variation == 2:
        scale_degree = 'III7'
        chord_method = chords.III7
        return {'scale_degree': scale_degree, 'chord_method': chord_method}
    elif idx == 2 and variation == 3:
        scale_degree = '3MIN7'
        chord_method = chords.iii7
        return {'scale_degree': scale_degree, 'chord_method': chord_method}
    elif idx == 3 and variation == 0:
        scale_degree = 'IV'
        chord_method = chords.IV
        return {'scale_degree': scale_degree, 'chord_method': chord_method}
    elif idx == 3 and variation == 2:
        scale_degree = 'IV7'
        chord_method = chords.IV7
        return {'scale_degree': scale_degree, 'chord_method': chord_method}
    elif idx == 4 and variation == 0:
        scale_degree = 'V'
        chord_method = chords.V
        return {'scale_degree': scale_degree, 'chord_method': chord_method}
    elif idx == 4 and variation == 2:
        scale_degree = 'V7'
        chord_method = chords.V7
        return {'scale_degree': scale_degree, 'chord_method': chord_method}
    elif idx == 5 and variation == 0:
        scale_degree = 'VI'
        chord_method = chords.VI
        return {'scale_degree': scale_degree, 'chord_method': chord_method}
    elif idx == 5 and variation == 1:
        scale_degree = '6MIN'
        chord_method = chords.vi
        return {'scale_degree': scale_degree, 'chord_method': chord_method}
    elif idx == 5 and variation == 2:
        scale_degree = 'VI7'
        chord_method = chords.VI7
        return {'scale_degree': scale_degree, 'chord_method': chord_method}
    elif idx == 5 and variation == 3:
        scale_degree = '6MIN7'
        chord_method = chords.vi7
        return {'scale_degree': scale_degree, 'chord_method': chord_method}
    elif idx == 6 and variation == 0:
        scale_degree = 'VII'
        chord_method = chords.VII
        return {'scale_degree': scale_degree, 'chord_method': chord_method}
    elif idx == 6 and variation == 1:
        scale_degree = '7MIN'
        chord_method = chords.vii
        return {'scale_degree': scale_degree, 'chord_method': chord_method}
    elif idx == 6 and variation == 2:
        scale_degree = 'VII7'
        chord_method = chords.VII7
        return {'scale_degree': scale_degree, 'chord_method': chord_method}
    elif idx == 6 and variation == 3:
        scale_degree = '7MIN7'
        chord_method = chords.vi7
        return {'scale_degree': scale_degree, 'chord_method': chord_method}
    
def progression_num_helper(note):
    ### FIRST / TONIC --------------------- //    
    ### SECOND / SUPERTONIC --------------------- //
    ### THIRD / MEDIANT --------------------- //
    ### FOURTH / SUBDOMINANT --------------------- //
    ### FIFTH / DOMINANT --------------------- //
    ### SIXTH / SUBMEDIANT --------------------- //
    ### SEVENTH / LEADING TONE - SUBTONIC ------ //

    for idx in range(0, 7):
        for variation in range(0, 4):
            cm = get_chord_method(idx, variation)
            if cm is None:
                continue
            chord_method = cm['chord_method']
            scale_degree = cm['scale_degree']  
            CHORD[scale_degree]['MAJOR'] = []
            min_converter = scale_degree if 'MIN' not in scale_degree else scale_degree.replace('MIN', f'{get_chord_method(idx, 0)}'.lower())  
            if variation == 4:
                min_converter = min_converter + '7'
            for index, i in enumerate(chord_method(note[0])):
                # CHORD[scale_degree].major = midi_name_to_num_prog_helper(index, chords.I(note[0]), chords.major_triad(note[0]))
                if variation == 0:
                    # CHORD[scale_degree]['MAJOR'].append(midi_name_to_num_prog_helper(index, chords.I(note[0]), chords.major_triad(note[0])))
                    # CHORD[scale_degree]['MAJOR'] = []
                    CHORD[scale_degree]['MAJOR'].append(chords.major_triad(i)[0])
                if variation == 1:
                    # CHORD[scale_degree]['MINOR'].append(midi_name_to_num_prog_helper(index, chords.I(note[0]), chords.minor_triad(note[0])))
                    CHORD[scale_degree]['MINOR'] = []
                    CHORD[scale_degree]['MINOR'].append(chords.minor_triad(i[0]))
                if variation == 2:
                    # CHORD[scale_degree]['MAJOR_SEVENTH'].append(midi_name_to_num_prog_helper(index, chords.I(note[0]), chords.augmented_major_seventh(note[0])))
                    CHORD[scale_degree]['MAJOR_SEVENTH'] = []
                    CHORD[scale_degree]['MAJOR_SEVENTH'].append(chords.major_seventh(i)[0])
                if variation == 3:
                    # CHORD[scale_degree]['MINOR_SEVENTH'].append(midi_name_to_num_prog_helper(index, chords.I(note[0]), chords.augmented_minor_seventh(note[0])))
                    CHORD[scale_degree]['MINOR_SEVENTH'] = []
                    CHORD[scale_degree]['MINOR_SEVENTH'].append(i[0])
                CHORD[scale_degree]['MAJ_SECOND'] = []
                CHORD[scale_degree]['MAJ_SECOND'].append(chords.major_seventh(i)[0])
                CHORD[scale_degree]['MIN_SECOND'] = []
                CHORD[scale_degree]['MIN_SECOND'].append(chords.minor_seventh(i)[0])
                    # CHORD[scale_degree]['MAJ_THIRD'].append(midi_name_to_num_prog_helper(index, chords.I(note[0]), intervals.major_third(i)))
                CHORD[scale_degree]['MAJ_THIRD'] = []
                CHORD[scale_degree]['MAJ_THIRD'].append(progressions.to_chords('III', key=note[0][0]))
                CHORD[scale_degree]['MIN_THIRD'] = []
                CHORD[scale_degree]['MIN_THIRD'].append(progressions.to_chords('iii7', key=note[0][0]))
                CHORD[scale_degree]['MAJ_FOURTH'] = []
                CHORD[scale_degree]['MAJ_FOURTH'].append(progressions.to_chords('IV', key=note[0][0]))
                CHORD[scale_degree]['PERFECT_FOURTH'] = []
                CHORD[scale_degree]['PERFECT_FOURTH'].append(i)
                CHORD[scale_degree]['PERFECT_FIFTH'] = []
                CHORD[scale_degree]['PERFECT_FIFTH'].append(i)
                CHORD[scale_degree]['MAJ_FIFTH'] = []
                CHORD[scale_degree]['MAJ_FIFTH'].append(progressions.to_chords('V', key=note[0][0]))
                CHORD[scale_degree]['MIN_FIFTH'] = []
                CHORD[scale_degree]['MIN_FIFTH'].append(progressions.to_chords('v', key=note[0][0]))
                CHORD[scale_degree]['MAJ_SIXTH'] = []
                CHORD[scale_degree]['MAJ_SIXTH'].append(progressions.to_chords('VI', key=note[0][0]))
                CHORD[scale_degree]['MIN_SIXTH'] = []
                CHORD[scale_degree]['MIN_SIXTH'].append(progressions.to_chords('vi', key=note[0][0]))
                CHORD[scale_degree]['MAJ_SEVENTH'] = []
                CHORD[scale_degree]['MAJ_SEVENTH'].append(progressions.to_chords('VII', key=note[0][0]))
                CHORD[scale_degree]['MIN_SEVENTH'] = []
                CHORD[scale_degree]['MIN_SEVENTH'].append(progressions.to_chords('vii', key=note[0][0]))
                CHORD[scale_degree]['INVERSION_1'] = []
                # print('I is ', chords.first_inversion(i))
                # CHORD[scale_degree]['INVERSION_1'].append(midi_name_to_num_prog_helper(index, chords.I(note[0]), chords.first_inversion(chord_method(note[0]))))
                # print('NOT NOTENOTW ', chord_method(note[0]))
                CHORD[scale_degree]['INVERSION_1'].append(chords.first_inversion(chord_method(note[0])))
                CHORD[scale_degree]['INVERSION_2'] = []
                CHORD[scale_degree]['INVERSION_2'].append(chords.second_inversion(chord_method(note[0])))
                CHORD[scale_degree]['INVERSION_3'] = []
                CHORD[scale_degree]['INVERSION_3'].append(chords.third_inversion(chord_method(note[0])))

                # if variation < 2 and idx != 0 and idx != 3 and idx != 4 and idx != 6:
                    # CHORD[scale_degree]['AUGMENTED'].append(midi_name_to_num_prog_helper(index, chords.I(note[0]), chords.augmented_triad(i)))
                CHORD[scale_degree]['AUGMENTED'] = []
                CHORD[scale_degree]['DIMINISHED'] = []
                CHORD[scale_degree]['AUGMENTED'].append(chords.augmented_triad(i))
                CHORD[scale_degree]['DIMINISHED'].append(chords.diminished_triad(i))
            
                CHORD[scale_degree]['DOMINANT_SIXTH'] = []
                CHORD[scale_degree]['DOMINANT_SIXTH'].append(chords.dominant_sixth(i))
                CHORD[scale_degree]['HALF_DIMINISHED_SEVENTH'] = []
                CHORD[scale_degree]['HALF_DIMINISHED_SEVENTH'].append(chords.half_diminished_seventh(i))
                CHORD[scale_degree]['SIXTH_NINTH'] = []
                CHORD[scale_degree]['SIXTH_NINTH'].append(chords.sixth_ninth(i))
                CHORD[scale_degree]['AUGMENTED_MAJ_SEVENTH'] = []
                CHORD[scale_degree]['AUGMENTED_MAJ_SEVENTH'].append(chords.augmented_major_seventh(i))
                CHORD[scale_degree]['AUGMENTED_MIN_SEVENTH'] = []
                CHORD[scale_degree]['AUGMENTED_MIN_SEVENTH'].append(chords.augmented_minor_seventh(i))
                CHORD[scale_degree]['LYDIAN_DOMINANT_SEVENTH'] = []
                CHORD[scale_degree]['LYDIAN_DOMINANT_SEVENTH'].append(chords.lydian_dominant_seventh(i))
                CHORD[scale_degree]['MAJOR_NINTH'] = []
                CHORD[scale_degree]['MAJOR_NINTH'].append(chords.major_ninth(i))
                CHORD[scale_degree]['MINOR_NINTH'] = []
                CHORD[scale_degree]['MINOR_NINTH'].append(chords.minor_ninth(i))
                CHORD[scale_degree]['DOMINANT_NINTH'] = []
                CHORD[scale_degree]['DOMINANT_NINTH'].append(chords.dominant_ninth(i))
                CHORD[scale_degree]['DOMINANT_SHARP_NINTH'] = []
                CHORD[scale_degree]['DOMINANT_SHARP_NINTH'].append(chords.dominant_sharp_ninth(i))
                CHORD[scale_degree]['DOMINANT_FLAT_NINTH'] = []
                CHORD[scale_degree]['DOMINANT_FLAT_NINTH'].append(chords.dominant_flat_ninth(i))
                if variation < 2 and idx != 0 and idx != 3 and idx != 4 and idx != 6:
                    CHORD[scale_degree]['MAJOR_ELEVENTH'] = []
                    CHORD[scale_degree]['MAJOR_ELEVENTH'].append(chords.eleventh(i))
                    CHORD[scale_degree]['MINOR_ELEVENTH'] = []
                    CHORD[scale_degree]['MINOR_ELEVENTH'].append(chords.minor_eleventh(i))
                    CHORD[scale_degree]['CHORDS_HENDRIX'] = []
                    CHORD[scale_degree]['CHORDS_HENDRIX'].append(chords.hendrix_chord(i))
                    CHORD[scale_degree]['DOMINANT_THIRTEENTH'] = []
                    CHORD[scale_degree]['DOMINANT_THIRTEENTH'].append(chords.dominant_thirteenth(i))
                    CHORD[scale_degree]['MAJOR_THIRTEENTH'] = []
                    CHORD[scale_degree]['MAJOR_THIRTEENTH'].append(chords.major_thirteenth(i))
                    CHORD[scale_degree]['MINOR_THIRTEENTH'] = []
                    CHORD[scale_degree]['MINOR_THIRTEENTH'].append(chords.minor_thirteenth(i))
                    CHORD[scale_degree]['SUSPENDED_TRIAD'] = []
                    CHORD[scale_degree]['SUSPENDED_TRIAD'].append(chords.suspended_triad(i))
                    CHORD[scale_degree]['SUSPENDED_SECOND_TRIAD'] = []
                    CHORD[scale_degree]['SUSPENDED_SECOND_TRIAD'].append(chords.suspended_second_triad(i))
                    CHORD[scale_degree]['SUSPENDED_FOURTH_TRIAD'] = []
                    CHORD[scale_degree]['SUSPENDED_FOURTH_TRIAD'].append(chords.suspended_fourth_triad(i))
                    CHORD[scale_degree]['SUSPENDED_SEVENTH'] = []
                    CHORD[scale_degree]['SUSPENDED_SEVENTH'].append(chords.suspended_seventh(i))
                    CHORD[scale_degree]['SUSPENDED_FOURTH_NINTH'] = []
                    CHORD[scale_degree]['SUSPENDED_FOURTH_NINTH'].append(chords.suspended_triad(i))

      
    return {
        'progs': {
            'I': chords.I(note[0]),
            'I7': chords.I7(note[0]),
            'II': chords.II(note[0]),
            'II7': chords.II7(note[0]),
            'III': chords.III(note[0]),
            'III7': chords.III7(note[0]),
            'IV': chords.IV(note[0]),
            'IV7': chords.IV7(note[0]),
            'V': chords.V(note[0]),
            'V7': chords.V7(note[0]),
            'VI': chords.VI(note[0]),
            'VI7': chords.VI7(note[0]),
            'VII': chords.VII(note[0]),
            'VII7': chords.VII7(note[0]),
        },
        'progs_nums': CHORD
    }

@app.route('/api/midi/<number>', methods=['POST', 'GET'])
def midi(number):
    print('what is NUM>>> ', number)
    print('what is typeof num? ', type(number))
    dynamic_key = request.args.get("key")
    if(number and int(number) < 128):
        print("wtf ", int(number))
        # lib_note = librosa.midi_to_note(int(number), octave=True, cents=False, key=dynamic_key, unicode=False)
        lib_note = librosa.midi_to_note(int(number), unicode=True)
        lib_hz = librosa.midi_to_hz(int(number))
        
        print("NUMBER: ", number)
        return {"midiNote": lib_note, "midiHz": lib_hz}

@app.route('/api/mingus_scales', methods=['POST', 'GET'])
def mingus_scales():
    data = request.get_json()
    is_sharp = False
    if data['theNote']:
        data['audioKey'] = data['theNote']
    data['audioKey'] = unidecode(data['audioKey'])
    if '#' in data['audioKey']:
        data['audioKey'] = data['audioKey'][:-1]
        is_sharp = True
    print(data)
    if not notes.is_valid_note(data['audioKey']):
        return [{"data": data['audioKey'] + ' is not a valid note!'}]
    scales_to_return = []
    if data['audioScale'] == 'Major':
        asc_note_nums_scales = []
        desc_note_nums_scales = []
        for idx, n in enumerate(scales.Major(data['audioKey']).ascending()):
            midi_num_helper = midi_name_to_num_helper(idx, scales.Major(data['audioKey']).ascending())
            asc_note_nums_scales.append(midi_num_helper)
        for idx, n in enumerate(scales.Major(data['audioKey']).descending()):
            midi_num_helper = midi_name_to_num_helper(idx, scales.Major(data['audioKey']).descending())
            desc_note_nums_scales.append(midi_num_helper)
            # # note_num_in_key = notes.note_to_int(0) - notes.note_to_int(n)
            # desc_note_nums_scales.append(notes.note_to_int(n))
        scales_to_return.append(scales.Major(data['audioKey']).ascending())
        scales_to_return.append(scales.Major(data['audioKey']).descending())
        scales_to_return.append(asc_note_nums_scales)
        scales_to_return.append(desc_note_nums_scales)
        print('Diatonic!!!!! ', scales_to_return)
    elif data['audioScale'] == 'HarmonicMajor':
        scales_to_return.append(scales.HarmonicMajor(data['audioKey']).ascending())
        scales_to_return.append(scales.HarmonicMajor(data['audioKey']).descending())  
        print('HarmonicMajor ', scales_to_return)
    elif data['audioScale'] == 'NaturalMinor':
        scales_to_return.append(scales.NaturalMinor(data['audioKey']).ascending())
        scales_to_return.append(scales.NaturalMinor(data['audioKey']).descending())  
        print('NaturalMinor ', scales_to_return)
    elif data['audioScale'] == 'HarmonicMinor':
        scales_to_return.append(scales.HarmonicMinor(data['audioKey']).ascending())
        scales_to_return.append(scales.HarmonicMinor(data['audioKey']).descending())  
        print('HarmonicMinor ', scales_to_return)
    elif data['audioScale'] == 'MelodicMinor':
        scales_to_return.append(scales.MelodicMinor(data['audioKey']).ascending())
        scales_to_return.append(scales.MelodicMinor(data['audioKey']).descending())  
        print('MelodicMinor ', scales_to_return)
    elif data['audioScale'] == 'Bachian':
        scales_to_return.append(scales.Bachian(data['audioKey']).ascending())
        scales_to_return.append(scales.Bachian(data['audioKey']).descending())  
        print('Bachian ', scales_to_return)
    elif data['audioScale'] == 'MinorNeapolitan':
        scales_to_return.append(scales.MinorNeapolitan(data['audioKey']).ascending())
        scales_to_return.append(scales.MinorNeapolitan(data['audioKey']).descending())  
        print('MinorNeapolitan ', scales_to_return)
    elif data['audioScale'] == 'Chromatic':
        scales_to_return.append(scales.Chromatic(data['audioKey']).ascending())
        scales_to_return.append(scales.Chromatic(data['audioKey']).descending())  
        print('Chromatic ', scales_to_return)
    elif data['audioScale'] == 'WholeTone':
        scales_to_return.append(scales.WholeTone(data['audioKey']).ascending())
        scales_to_return.append(scales.WholeTone(data['audioKey']).descending())  
        print('WholeTone ', scales_to_return)
    elif data['audioScale'] == 'Octatonic':
        scales_to_return.append(scales.Octatonic(data['audioKey']).ascending())
        scales_to_return.append(scales.Octatonic(data['audioKey']).descending())  
        print('Octatonic ', scales_to_return)
    elif data['audioScale'] == 'Ionian':
        scales_to_return.append(scales.Ionian(data['audioKey']).ascending())
        scales_to_return.append(scales.Ionian(data['audioKey']).descending())  
        print('Ionian ', scales_to_return)
    elif data['audioScale'] == 'Dorian':
        scales_to_return.append(scales.Dorian(data['audioKey']).ascending())
        scales_to_return.append(scales.Dorian(data['audioKey']).descending())  
        print('Dorian ', scales_to_return)
    elif data['audioScale'] == 'Phyrygian':
        scales_to_return.append(scales.Phrygian(data['audioKey']).ascending())
        scales_to_return.append(scales.Phrygian(data['audioKey']).descending())  
        print('Phyrygian ', scales_to_return)
    elif data['audioScale'] == 'Lydian':
        scales_to_return.append(scales.Lydian(data['audioKey']).ascending())
        scales_to_return.append(scales.Lydian(data['audioKey']).descending())  
        print('Lydian ', scales_to_return)
    elif data['audioScale'] == 'Mixolydian':
        scales_to_return.append(scales.Mixolydian(data['audioKey']).ascending())
        scales_to_return.append(scales.Mixolydian(data['audioKey']).descending())  
        print('Mixolydian ', scales_to_return)
    elif data['audioScale'] == 'Aeolian':
        scales_to_return.append(scales.Aeolian(data['audioKey']).ascending())
        scales_to_return.append(scales.Aeolian(data['audioKey']).descending())  
        print('Aeolian ', scales_to_return)
    elif data['audioScale'] == 'Locrian':
        scales_to_return.append(scales.Locrian(data['audioKey']).ascending())
        scales_to_return.append(scales.Locrian(data['audioKey']).descending())  
        print('Locrian')
    elif data['audioScale'] == 'Fifths':
        scales_to_return.append(notes.fifths(data['audioKey']).ascending())
        scales_to_return.append(notes.fifths(data['audioKey']).descending())  
        print('Locrian')
    print("SCALES TO REETYRN 111 ", scales_to_return)
    if is_sharp:
        for scale in scales_to_return:
            for idx, note in enumerate(scale):
                if idx == 0:
                    scale[idx] = notes.augment(note)
                if idx == 1:
                    scale[idx] = notes.diminish(note)
    print("SCALES TO REETYRN 222 ", scales_to_return)        
    return [{"data": scales_to_return}]

@app.route('/api/mingus_chords', methods=['POST', 'GET'])
def mingus_chords():
    data = request.get_json()

    nums_chords = []
    print('mingus_chords data: ', data)
    if 'audioKey' not in data.keys():
        if 'theNote' not in data.keys():
            data['audioKey'] = 'C'
        data['audioKey'] = data['theNote']

    # data['audioKey'] = notes.note_to_int(data['audioKey'])
    # print('WHAT IS THIS? ', data['audioKey'])
    if not notes.is_valid_note(data['audioKey']):
        print('WOULD THIS BE VALID? ', str(data['audioKey']))
        return [{"data": data['audioKey'] + ' is not a valid note!'}]
    
    
    if data['audioChord'] == 'M':
        print('Major Triad')
        for idx, n in enumerate(chords.major_triad(data['audioKey'])):
            midi_num_helper = midi_name_to_num_helper(idx, chords.major_triad(data['audioKey']))
            if idx == 0:
                prog_num_helper = progression_num_helper(data['audioKey'])
            nums_chords.append(midi_num_helper)
            nums_chords.append(prog_num_helper)
        return [{
            "data": chords.major_triad(data['audioKey']), 
            "nums": nums_chords,
        }]
    elif data['audioChord'] == 'm':
        print('Minor Triad')
        return chords.minor_triad(data['audioKey'] )
    elif data['audioChord'] == 'aug' or data['audioKey'] == '+':
        print('Augmented Triad')
        return chords.augmented_triad(data['audioKey'] )
    elif data['audioChord'] == 'dim':
        print('Diminished Triad')
        return chords.diminished_triad(data['audioKey'] )
    elif data['audioChord'] == 'dim7':
        print('Diminished Seventh')
        return chords.diminished_seventh(data['audioKey'] )
    elif data['audioChord'] == 'sus2':
        print('Suspended Second Triad')
        is_sharp = False
        if data['theNote']:
            data['audioKey'] = data['theNote']
        data['audioKey'] = unidecode(data['audioKey'])
        if '#' in data['audioKey']:
            data['audioKey'] = data['audioKey'][:-1]
            is_sharp = True
        print(data)
        if not notes.is_valid_note(data['audioKey']):
            return [{"data": data['audioKey'] + ' is not a valid note!'}]
        triad = chords.suspended_second_triad(data['audioKey'] )
        if (is_sharp):
            for c in triad: 
                notes.augment(c)
        
        return triad
    elif data['audioChord'] == 'sus':
        print('Suspended Triad')
        return chords.suspended_fourth_triad(data['audioKey'] )
    elif data['audioChord'] == '7b5':
        print('Dominant Flat Five')
        return chords.dominant_flat_five(data['audioKey'] )
    elif data['audioChord'] == '6' or data['audioChord'] == 'M6':
        print('Major Sixth')
        return chords.major_sixth(data['audioKey'] )
    elif data['audioChord'] == 'm6':
        print('Minor Sixth')
        return chords.minor_sixth(data['audioKey'] )
    elif data['audioChord'] == '67':
        print('Dominant Sixth')
        return chords.dominant_sixth(data['audioKey'] )
    elif data['audioChord'] == '69':
        print('Sixth Ninth')
        return chords.sixth_ninth(data['audioKey'] )
    elif data['audioChord'] == '7' or data['audioChord'] == 'M7':
        print('Major Seventh')
        return chords.major_seventh(data['audioKey'] )
    elif data['audioChord'] == 'm7':
        print('Minor Seventh')
        return chords.minor_seventh(data['audioKey'] )
    elif data['audioChord'] == 'M7+':
        print('Augmented Major Seventh ', chords.augmented_major_seventh(data['audioKey']))
        return chords.augmented_major_seventh(data['audioKey'] )
    elif data['audioChord'] == 'm7+' or data['audioChord'] == 'm7+5':
        print('Augmented Minor Seventh')
        return chords.augmented_minor_seventh(data['audioKey'] )
    elif data['audioChord'] == 'sus47' or data['audioChord'] == '7sus4':
        print('Suspended Seventh')
        return chords.suspended_seventh(data['audioKey'] )
    elif data['audioChord'] == 'm7b5':
        print('Half Diminished Seventh')
        return chords.half_diminished_seventh(data['audioKey'] )
    elif data['audioChord'] == 'dom7':
        print('Dominant Seventh')
        return chords.dominant_seventh(data['audioKey'] )  
    elif data['audioChord'] == 'mM7':
        print('Minor/Major Seventh')
        return chords.minor_major_seventh(data['audioKey'] )
    elif data['audioChord'] == '7+':
        print('Augmented Major Seventh')
        return chords.augmented_major_seventh(data['audioKey'] )
    elif data['audioChord'] == '7#5':
        print('Augmented Minor Seventh')
        return chords.augmented_minor_seventh(data['audioKey'] )
    elif data['audioChord'] == '7#11':
        print('Lydian Dominant Seventh')
        return chords.lydian_dominant_seventh(data['audioKey'] )
    elif data['audioChord'] == 'M9':
        print('Major Ninth')
        return chords.major_ninth(data['audioKey'] )
    elif data['audioChord'] == 'm9':
        print('Minor Ninth')
        return chords.minor_ninth(data['audioKey'] )
    elif data['audioChord'] == 'add9' or data['audioChord'] == '9':
        print('Dominant Ninth')
        return chords.dominant_ninth(data['audioKey'] )
    elif data['audioChord'] == '7_#9':
        print('Dominant Sharp Ninth')
        return chords.dominant_sharp_ninth(data['audioKey'] )
    elif data['audioChord'] == '7b9':
        print('Dominant Sharp Ninth')
        return chords.dominant_flat_ninth(data['audioKey'] )
    elif data['audioChord'] == 'susb9' or data['audioChord'] == 'sus4b9':
        print('Suspended Fourth Ninth')
        return chords.suspended_fourth_ninth(data['audioKey'] )
    elif data['audioChord'] == 'M9':
        print('Major Ninth')
        return chords.major_ninth(data['audioKey'] )
    elif data['audioChord'] == '6/9':
        print('Sixth Ninth')
        return chords.sixth_ninth(data['audioKey'] )
    elif data['audioChord'] == '11' or data['audioChord'] == 'add11':
        print('Eleventh')
        return chords.eleventh(data['audioKey'] ) 
    elif data['audioChord'] == 'm11':
        print('Minor Eleventh')
        return chords.minor_eleventh(data['audioKey'] )
    elif data['audioChord'] == '7b12' or data['audioChord'] == 'hendrix':
        print('Hendrix Chord')
        return chords.hendrix_chord(data['audioKey'] )
    elif data['audioChord'] == 'M13':
        print('Major Thirteeenth')
        return chords.major_thirteenth(data['audioKey'] )
    elif data['audioChord'] == 'm13':
        print('Minor Thirteenth')
        return chords.minor_thirteenth(data['audioKey'] )
    elif data['audioChord'] == '13':
        print('Dominant Thirteenth')
        return chords.dominant_thirteenth(data['audioKey'] )

@app.route('/api/note/<name>', methods=['POST', 'GET'])
def note_name(name):
    print('WTF : '  + name)
    if(name):
        lib_note = librosa.note_to_midi(name)
        lib_hz = librosa.note_to_hz(name)
        print("MIDI: ", lib_note)
        print("HZ: ", lib_hz)
        return {"midiNote": lib_note, "midiHz": lib_hz}

@app.route('/api/midi/send/<number>', methods=['POST', 'GET'])
def midi_send(midi_note, midi_hz):
    print('in midi send! midi note: ' + midi_note + ' midi hz: ' + midi_hz)

@app.route('/')
def index():
    return "<h1 style='text-align: center; min-height: 100%; min-width: 100%; background: blue; color: magenta; font-family: Open-sans, Helvetica; padding: 15% 0 0 0; margin: 0 0 0 0; border: none'>Hi Rowan! This API is under construction &#128640 </h1>" 

if __name__ == '__main__':
    app.run(debug=True)
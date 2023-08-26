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

@app.route('/api/midi/<number>', methods=['POST', 'GET'])
def midi(number):
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
    if data['theNote']:
        data['audioKey'] = data['theNote']
    print(data)
    if not notes.is_valid_note(data['audioKey']):
        return [{"data": data['audioKey'] + ' is not a valid note!'}]
    scales_to_return = []
    if data['audioScale'] == 'Major':
        scales_to_return.append(scales.Major(data['audioKey']).ascending())
        scales_to_return.append(scales.Major(data['audioKey']).descending())       
        print('Diatonic ', scales_to_return)
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
    return [{"data": data}]

@app.route('/api/mingus_chords', methods=['POST', 'GET'])
def mingus_chords():
    data = request.get_json()
    print('mingus_chords data: ', data)
    if 'audioKey' not in data.keys():
        if 'theNote' not in data.keys():
            data['audioKey'] = 'C'
        data['audioKey'] = data['theNote']
    print('WHAT IS THIS? ', data['audioKey'])
    if not notes.is_valid_note(data['audioKey']):
        print('WOULD THIS BE VALID? ', str(data['audioKey']))
        return [{"data": data['audioKey'] + ' is not a valid note!'}]
    elif data['audioChord'] == 'M':
        print('Major Triad')
        return chords.major_triad(data['audioKey'] )
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
        return chords.suspended_second_triad(data['audioKey'] )
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
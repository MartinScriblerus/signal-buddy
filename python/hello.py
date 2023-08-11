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
        lib_note = librosa.midi_to_note(int(number), unicode=False)
        lib_hz = librosa.midi_to_hz(int(number))
        
        print("NUMBER: ", number)
        return {"midiNote": lib_note, "midiHz": lib_hz}

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
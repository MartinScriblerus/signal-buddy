import React, { useState, useEffect, useMemo, useRef} from 'react';
import Chuck from '../Chuck';
import axios, { AxiosResponse } from 'axios';
import { FLASK_API_URL } from '../helpers/constants';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Example from './XYChartWrapper';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import { Button } from '@mui/material';
import styles from '../styles/KeyControls.module.css';
import { DARK_GRAY_1, WHITE_TEXT } from '../helpers/constants'

declare global {
    interface HTMLLIElement {
        data: Promise<AxiosResponse<any, any> | undefined>
    }
}

export default function CreateChuck(props: any) {
    const {game, datas} = props;
    const theChuck = useRef<any>(undefined);
    const [loaded, setLoaded] = useState(false);
    const [keysReady, setKeysReady] = useState(false);
    const [octave, setOctave] = useState('4');
    const [audioKey, setAudioKey] = useState('C');
    const [audioScale, setAudioScale] = useState('Major');
    const [audioChord, setAudioChord] = useState('None');
    const [mingusData, setMingusData] = useState<any>([]);
    const [mingusChordsData, setMingusChordsData] = useState<any>([]);

    const ranChuckInit = useRef(false);
    ranChuckInit.current = false;
    console.log('datas: ', datas);
    const headerDict = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Access-Control-Allow-Headers': 'Content-Type',
    }
    const requestOptions = {                                                                                                                                                                                 
        headers: headerDict,
        params: {
            key: game.key
        }
    };

    if (!game.audioContext) {
        game.audioContext = new AudioContext();  
    }

    const handleChangeAudioKey = (event: SelectChangeEvent) => {
        setAudioKey(event.target.value as string);
    };

    const handleChangeOctave = (event: SelectChangeEvent) => {
        setOctave(event.target.value as string);
    };

    const handleChangeScale = (event: SelectChangeEvent) => {
        setAudioScale(event.target.value as string);
    };

    const handleChangeChord = (event: SelectChangeEvent) => {
        console.log('WHAT IS EVENT? ', event);
        setAudioChord(event.target.value as string);
    };

    const loadChuck = async (theChuck: any) => {
        theChuck.loadFile('readData.ck').then(async () => {
            await theChuck.loadFile('readData.txt').then(async () => {
                theChuck.runFile('readData.ck');
            });
        });
        setLoaded(true);
    }

    useMemo(() => {  
        const serverFilesToPreload = [
            {
                serverFilename: '/midi.ck',
                virtualFilename: 'midi.ck'
            },
            {
                serverFilename: '/readData.ck',
                virtualFilename: 'readData.ck'
            },
            {
                serverFilename: '/readData.txt',
                virtualFilename: 'readData.txt'
            },
            {
                serverFilename: '/writeData.ck',
                virtualFilename: 'writeData.ck'
            },
        ];
        if (ranChuckInit.current === true || theChuck.current) {
            return;
        }
        ranChuckInit.current = true;
        (async () => {
            if (theChuck.current || game['theChuck']) {
                return;
            }
            const theChuckTemp = await Chuck.init(serverFilesToPreload, game.audioContext, 2);
            game['theChuck'] = theChuckTemp;
            if (!theChuck.current) {
                loadChuck(theChuckTemp);
            }
            theChuck.current = theChuckTemp;
        })();
    }, [game]);

    useEffect(() => {
        if (!theChuck.current || !datas) {
            return;
        }
        if (datas[0] && datas[0].data) {
            // TODO: write data to file
            // COME UP WITH A TIME DIVISION AND STRATEGY FOR CALLING CHUCK
            // ** HERE IS THE DATA **
            datas[0].data.times.map((time: any, idx: number) => {
                if (idx === datas[0].data.times.length - 1) {
                    console.log('DATA: ', datas[0].data);
                    return datas[0].data;
                }
            })

        }
    }, [datas, theChuck, loaded]);
    
    const awaitNote = async (note: string) => {
        if(keysReady) {
            return;
        }
        return new Promise((resolve) => {
            const getVals = axios.get(`${FLASK_API_URL}/note/${note}`, requestOptions);
            resolve(getVals);
        }).then(async (res: any) => {
            return await res.data;
        });
    };

    const playChuckNote = (note: any) => { 
        if (!note.target) { 
            return null;
        }
        const noteReady = note.target.attributes[3].value;
        theChuck.current.runCode(` SinOsc osc => dac; 0.2 => osc.gain; ${noteReady} => osc.freq; 3::second => now; `);
        return noteReady;
    };

    const organizeRows = async(rowNum: number, note: string) => {
        const noteReady = await awaitNote(note);
        if (noteReady) {
            setKeysReady(true);
        } else {
            return;
        }
        const parsedNote = note.charAt(1) === '♯' ? note.slice(0, 2) + "-" + note.slice(2) : note.slice(0, 1) + "-" + note.slice(1);
        const el: any = await document.getElementById(parsedNote);
        if (el && !el['data-midiNote'] && !el['data-midiHz']) {
            el.classList.add(`keyRow_${rowNum}`);
            el.setAttribute('data-midiNote', await noteReady.midiNote);
            el.setAttribute('data-midiHz', await noteReady.midiHz);
            el.setAttribute('onClick', playChuckNote(noteReady.midiHz));
        }
    }

    const createKeys = () => {
        const octaves: Array<any> = [];
        // range from 0 to 10
        for (let i = 2; i < 4; i++) {
            [`C${i}`, `C♯${i}`, `D${i}`, `D♯${i}`, `E${i}`, `F${i}`, `F♯${i}`, `G${i}`, `G♯${i}`, `A${i}`, `A♯${i}`, `B${i}`].forEach((note) => {
                organizeRows(i, note);
            });

            const octave = (
                <React.Fragment key={`octSpanWrapper-${i}`}>
                    <li id={`C-${i}`} key={`C-${i}`} onClick={(e) => playChuckNote(e)} className="white">{`C${i}`} </li>
                    <li id={`C♯-${i}`} key={`C♯-${i}`} onClick={(e) => playChuckNote(e)} className="black">{`C♯${i}`}</li>
                    <li id={`D-${i}`} key={`D-${i}`} onClick={(e) => playChuckNote(e)} className="white offset">{`D${i}`}</li>
                    <li id={`D♯-${i}`} key={`D♯-${i}`} onClick={(e) => playChuckNote(e)} className="black">{`D♯${i}`}</li>
                    <li id={`E-${i}`} key={`E-${i}`} onClick={(e) => playChuckNote(e)} className="white offset half">{`E${i}`}</li>
                    <li id={`F-${i}`} key={`F-${i}`} onClick={(e) => playChuckNote(e)} className="white">{`F${i}`}</li>
                    <li id={`F♯-${i}`} key={`F♯-${i}`} onClick={(e) => playChuckNote(e)} className="black">{`F♯${i}`}</li>
                    <li id={`G-${i}`} key={`G-${i}`} onClick={(e) => playChuckNote(e)} className="white offset">{`G${i}`}</li>
                    <li id={`G♯-${i}`} key={`G♯-${i}`} onClick={(e) => playChuckNote(e)} className="black">{`G♯${i}`}</li>
                    <li id={`A-${i}`} key={`A-${i}`} onClick={(e) => playChuckNote(e)} className="white offset">{`A${i}`}</li>
                    <li id={`A♯-${i}`} key={`A♯-${i}`} onClick={(e) => playChuckNote(e)} className="black">{`A♯${i}`}</li>
                    <li id={`B-${i}`}  key={`B-${i}`} onClick={(e) => playChuckNote(e)} className="white offset half">{`B${i}`}</li>
                </React.Fragment>
            );
            octaves.push(octave);
        }
        return octaves;
    }
    
    const vizComponent = <Example width={500} height={500} />

    const submitMingus = async () => {
        axios.post(`${process.env.REACT_APP_FLASK_API_URL}/mingus_scales`, {audioKey, audioScale, octave}, {
            headers: {
              'Content-Type': 'application/json'
            }
          }).then(({data}) => setMingusData(data));

          axios.post(`${process.env.REACT_APP_FLASK_API_URL}/mingus_chords`, {audioChord, audioKey}, {
            headers: {
              'Content-Type': 'application/json'
            }
          }).then(({data}) => setMingusChordsData(data));
    }

    useEffect(() => {
        if (mingusData) {
            console.log('MINGUS DATA: ', mingusData);
        }
    }, [mingusData]);

    useEffect(() => {
        if (mingusChordsData) {
            console.log('MINGUS CHORDS DATA: ', mingusChordsData);
        }
    }, [mingusChordsData]);

    return (
        <>
        <ParentSize>{({ width, height }) => vizComponent}</ParentSize>
        {
            theChuck.current && Object.values(theChuck.current).length
                ?
            <Box id="keyboardWrapper">
                <div id="keyboardControlsWrapper">
                    <Box sx={{ minWidth: 120, background: DARK_GRAY_1 }}>
                        <FormControl fullWidth>
                            <InputLabel id="audioKey-simple-select-label">Key</InputLabel>
                            <Select
                                sx={{color: WHITE_TEXT, fontWeight: 'bold', fontSize: '2rem'}}
                                labelId="audioKey-simple-select-label"
                                id="audioKey-simple-select"
                                value={audioKey}
                                label="Key"
                                onChange={handleChangeAudioKey}
                            >
                                <MenuItem value={'C'}>C</MenuItem>
                                <MenuItem value={'C♯'}>C♯</MenuItem>
                                <MenuItem value={'D'}>D</MenuItem>
                                <MenuItem value={'D♯'}>D♯</MenuItem>
                                <MenuItem value={'E'}>E</MenuItem>
                                <MenuItem value={'F'}>F</MenuItem>
                                <MenuItem value={'F♯'}>F♯</MenuItem>
                                <MenuItem value={'G'}>G</MenuItem>
                                <MenuItem value={'G♯'}>G♯</MenuItem>
                                <MenuItem value={'A'}>A</MenuItem>
                                <MenuItem value={'A♯'}>A♯</MenuItem>
                                <MenuItem value={'B'}>B</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    <Box sx={{ minWidth: 120, background: DARK_GRAY_1 }}>
                        <FormControl fullWidth>
                            <InputLabel id="octave-simple-select-label">Octave</InputLabel>
                            <Select
                                sx={{color: WHITE_TEXT, fontWeight: 'bold', fontSize: '2rem'}}
                                labelId="octave-simple-select-label"
                                id="octave-simple-select"
                                value={octave}
                                label="Octave"
                                onChange={handleChangeOctave}
                            >
                                <MenuItem value={'1'}>1</MenuItem>
                                <MenuItem value={'2'}>2</MenuItem>
                                <MenuItem value={'3'}>3</MenuItem>
                                <MenuItem value={'4'}>4</MenuItem>
                                <MenuItem value={'5'}>5</MenuItem>
                                <MenuItem value={'6'}>6</MenuItem>
                                <MenuItem value={'7'}>7</MenuItem>
                                <MenuItem value={'8'}>8</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    <Box sx={{ minWidth: 120, background: DARK_GRAY_1  }}>
                        <FormControl fullWidth>
                            <InputLabel id="scale-simple-select-label">Scale</InputLabel>
                            <Select
                                sx={{color: WHITE_TEXT, fontWeight: 'bold', fontSize: '2rem'}}
                                labelId="scale-simple-select-label"
                                id="scale-simple-select"
                                value={audioScale}
                                label="Scale"
                                onChange={handleChangeScale}
                            >
                                <MenuItem value={'Diatonic'}>Diatonic</MenuItem>
                                <MenuItem value={'Major'}>Major</MenuItem>
                                <MenuItem value={'HarmonicMajor'}>Harmonic Major</MenuItem>
                                <MenuItem value={'NaturalMinor'}>Natural Minor</MenuItem>
                                <MenuItem value={'Harmonic Minor'}>Harmonic Minor</MenuItem>
                                <MenuItem value={'MelodicMinor'}>Melodic Minor</MenuItem>
                                <MenuItem value={'Bachian'}>Bachian</MenuItem>
                                <MenuItem value={'MinorNeapolitan'}>Minor Neapolitan</MenuItem>
                                <MenuItem value={'Chromatic'}>Chromatic</MenuItem>
                                <MenuItem value={'WholeTone'}>Whole Tone</MenuItem>
                                <MenuItem value={'Octatonic'}>Octatonic</MenuItem>
                                <MenuItem value={'Ionian'}>Ionian</MenuItem>
                                <MenuItem value={'Dorian'}>Dorian</MenuItem>
                                <MenuItem value={'Phyrygian'}>Phrygian</MenuItem>
                                <MenuItem value={'Lydian'}>Lydian</MenuItem>
                                <MenuItem value={'Mixolydian'}>Mixolydian</MenuItem>
                                <MenuItem value={'Aeolian'}>Aeolian</MenuItem>
                                <MenuItem value={'Locrian'}>Locrian</MenuItem>
                                <MenuItem value={'Fifths'}>Fifths</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    <Box sx={{ minWidth: 120, background: DARK_GRAY_1 }}>
                        <FormControl fullWidth>
                            <InputLabel id="chord-simple-select-label">Scale</InputLabel>
                            <Select
                                labelId="chord-simple-select-label"
                                id="chord-simple-select"
                                value={audioChord}
                                label="Chord"
                                onChange={handleChangeChord}
                                sx={{
                                    color: WHITE_TEXT, 
                                    fontWeight: 'bold', 
                                    fontSize: '2rem',
                                    '& .MuiList-root': {
                                      display: 'flex',
                                      flexDirection: 'column',
                                      background: 'var(--black-20)',
                                      color: 'var(--white-20)',
                                    }
                                  }}
                            >
                                <MenuItem value={'None'}>None</MenuItem>
                                <MenuItem value={'M'}>Major Triad</MenuItem>
                                <MenuItem value={'m'}>Minor Triad</MenuItem>
                                <MenuItem value={'aug'}>Augmented Triad 1</MenuItem>
                                <MenuItem value={'+'}>Augmented Triad 2</MenuItem>
                                <MenuItem value={'dim'}>Diminished Triad</MenuItem>
                                <MenuItem value={'dim7'}>Diminished Seventh</MenuItem>
                                <MenuItem value={'sus2'}>Suspended Second Triad</MenuItem>
                                <MenuItem value={'sus'}>Suspended Fourth Triad</MenuItem>
                                <MenuItem value={'madd4'}>Minor Add Fourth</MenuItem>
                                <MenuItem value={'5'}>Perfect Fifth</MenuItem>
                                <MenuItem value={'7b5'}>Dominant Flat Five</MenuItem>
                                <MenuItem value={'6'}>Major Sixth 1</MenuItem>
                                <MenuItem value={'67'}>Dominant Sixth</MenuItem>
                                <MenuItem value={'69'}>Sixth Ninth</MenuItem>
                                <MenuItem value={'M6'}>Major Sixth 2</MenuItem>
                                <MenuItem value={'m6'}>Minor Sixth</MenuItem>
                                <MenuItem value={'M7'}>Major Seventh</MenuItem>
                                <MenuItem value={'m7'}>Minor Seventh</MenuItem>
                                <MenuItem value={'M7+'}>Augmented Major Seventh</MenuItem>
                                <MenuItem value={'m7+'}>Augmented Minor Seventh 1</MenuItem>
                                <MenuItem value={'m7+5'}>Augmented Minor Seventh 2</MenuItem>
                                <MenuItem value={'sus47'}>Suspended Seventh</MenuItem>
                                <MenuItem value={'m7b5'}>Half Diminished Seventh</MenuItem>
                                <MenuItem value={'mM7'}>Minor Major Seventh</MenuItem>
                                <MenuItem value={'dom7'}>Dominant Seventh 1</MenuItem>
                                <MenuItem value={'7'}>Dominant Seventh 2</MenuItem>
                                <MenuItem value={'7+'}>Augmented Major Seventh</MenuItem>
                                <MenuItem value={'7#5'}>Augmented Minor Seventh</MenuItem>
                                <MenuItem value={'7#11'}>Lydian Dominant Seventh</MenuItem>
                                <MenuItem value={'m/M7'}>Minor Major Seventh</MenuItem>
                                <MenuItem value={'7sus4'}>Suspended Seventh</MenuItem>
                                <MenuItem value={'M9'}>Major Ninth</MenuItem>
                                <MenuItem value={'m9'}>Minor Ninth</MenuItem>
                                <MenuItem value={'add9'}>Dominant Ninth</MenuItem>
                                <MenuItem value={'maddb9'}>Minor Add Flat Ninth</MenuItem>
                                <MenuItem value={'susb9'}>Suspended Fourth Ninth 1</MenuItem>
                                <MenuItem value={'sus4b9'}>Suspended Fourth Ninth 2</MenuItem>
                                <MenuItem value={'9'}>Dominant Ninth</MenuItem>
                                <MenuItem value={'m9b5'}>Minor Ninth Flat Five</MenuItem>
                                <MenuItem value={'7_#9'}>Dominant Sharp Ninth</MenuItem>
                                <MenuItem value={'7b9'}>Dominant Flat Ninth</MenuItem>
                                <MenuItem value={'madd9'}>Minor Add Ninth</MenuItem>
                                <MenuItem value={'6/9'}>Sixth Ninth</MenuItem>
                                <MenuItem value={'11'}>Eleventh</MenuItem>
                                <MenuItem value={'m11'}>Minor Eleventh</MenuItem>
                                <MenuItem value={'add11'}>Add Eleventh</MenuItem>
                                <MenuItem value={'madd11'}>Minor Add Eleventh</MenuItem>
                                <MenuItem value={'maddb11'}>Minor Add Flat Eleventh</MenuItem>
                                <MenuItem value={'7b12'}>Hendrix Chord 1</MenuItem>
                                <MenuItem value={'hendrix'}>Hendrix Chord 2</MenuItem>
                                <MenuItem value={'M13'}>Major Thirteenth</MenuItem>
                                <MenuItem value={'m13'}>Minor Thirteenth</MenuItem>
                                <MenuItem value={'13'}>Dominant Thirteenth</MenuItem>
                                <MenuItem value={'add13'}>Dominant Thirteenth</MenuItem>
                                <MenuItem value={'madd13'}>Minor Add Thirteenth</MenuItem>
                                <MenuItem value={'maddb13'}>Minor Add Flat Thirteenth</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    <Button id='submitMingus' onClick={submitMingus}>SUBMIT</Button>
                </div>
                <ul id="keyboard">
                    {createKeys()}
                </ul>
            </Box>
            : null}
        </>
    )
} 

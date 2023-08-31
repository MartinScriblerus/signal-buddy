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
import { Button, Checkbox, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material';
import { DragDropContext, Draggable } from 'react-beautiful-dnd';
import { StrictModeDroppable } from './Droppable';
import CLARINET, { CHORUS, STFKRP, SITAR, MOOG, MOOG2, RHODEY, BANDEDWAVE, MANDOLIN } from './stkHelpers'
// import { onMIDISuccess, onMIDIFailure } from './helpers/midiAlerts'; 
import styles from '../styles/KeyControls.module.css';
import CircularSlider from '@fseehawer/react-circular-slider';

declare global {
    interface HTMLLIElement {
        data: Promise<AxiosResponse<any, any> | undefined>
    }
}

export default function CreateChuck(props: any) {
    const {game, datas} = props;
    const theChuck = useRef<any>(undefined);
    const modsTemp: any = useRef([]);
    modsTemp.current = [];
    const [loaded, setLoaded] = useState(false);
    const [keysReady, setKeysReady] = useState(false);
    const [octave, setOctave] = useState('4');
    const [audioKey, setAudioKey] = useState('C');
    const [audioScale, setAudioScale] = useState('Major');
    const [audioChord, setAudioChord] = useState('M');
    const [mingusData, setMingusData] = useState<any>([]);
    // const [mingusChordsData, setMingusChordsData] = useState<any>([]);
    const [keysVisible, setKeysVisible] = useState(false);
    const [instrumentsVisible, setInstrumentsVisible] = useState(false);
    const [sequencerVisible, setSequencerVisible] = useState(false);
    const [synthControlsVisible, setSynthControlsVisible] = useState(false);
    const [modsCount, setModsCount] = useState(2);
    const [chuckHook, setChuckHook] = useState<Chuck>();
    const [valueReed, setValueReed] = useState(.5);
    const [valueNoiseGain, setValueNoiseGain] = useState(.5);
    const [valueVibratoFreq, setValueVibratoFreq] = useState(0);
    const [valueVibratoGain, setValueVibratoGain] = useState(.02);
    const [valuePressure, setValuePressure] = useState(.5);
    const [valueReverbGain, setValueReverbGain] = useState(0.2);
    const [valueReverbMix, setValueReverbMix] = useState(0.3);
    const [valuePickupPosition, setValuePickupPosition] = useState(0.8);
    const [valueSustain, setValueSustain] = useState(0.3);
    const [valueStretch, setValueStretch] = useState(0.2);
    const [valuePluck, setValuePluck] = useState(0.7);
    const [valueBaseLoopGain, setValueBaseLoopGain] = useState(1);
    const [valueFilterQ, setValueFilterQ] = useState(0.00);
    const [valueFilterSweepRate, setValueFilterSweepRate] = useState(0.00);
    const [valueMoogGain, setValueMoogGain] = useState(0.02);
    const [valueLfoSpeed, setValueLfoSpeed] = useState(1.0);
    const [valueLfoDepth, setValueLfoDepth] = useState(0.02);
    const [valueModSpeed, setValueModSpeed] = useState(0.0);
    const [valueModDepth, setValueModDepth] = useState(0.0);
    const [valueBodySize, setValueBodySize] = useState(0.7);
    const [valuePluckPos, setValuePluckPos] = useState(0.4);
    const [valueStringDamping, setValueStringDamping] = useState(0.4);
    const [valueStringDetune, setValueStringDetune] = useState(0.4);
    const [valueAftertouch, setValueAftertouch] = useState(0.4);
    const [valueOpMode, setValueOpMode] = useState(1);   

    const [playing, setPlaying] = useState(false);
    const [playingInstrument, setPlayingInstrument] = useState('');
    const [realTimeScalesDataObj, setRealTimeScalesDataObj] = useState<any>([]);
    const [realTimeChordsDataObj, setRealTimeChordsDataObj] = useState<any>([]);
    

    let modsDefault: any = [
        {
            key: 'mod_1', 
            id: 'mod_1', 
            className: 'mods',
            audioKey: 'C',
            octave: '3',
            audioScale: 'Minor',
            audioChord: 'm'
        }
    ];
    const [modsHook, setModsHook] = useState<any>(modsDefault);

    const lastMidiNote: any = useRef('');
    lastMidiNote.current = '';
    const lastMidiCommand: any = useRef('');
    const mingusChordsData = useRef([]); 
    const availableKnobs = useRef([]);
    availableKnobs.current = [];
    const midiNotesOn: any = useRef([]);
    midiNotesOn.current = [];
    const midiNotesOff: any = useRef([]);
    midiNotesOff.current = [];
    const ranChuckInit = useRef(false);
    ranChuckInit.current = false;
    // const playingInstrument: any = useRef([]);
    // playingInstrument.current = [];
    const midiCode = useRef('');
    midiCode.current =  midiCode.current || '';

    // console.log('datas: ', datas);

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
        // console.log('WHAT IS EVENT? ', event);
        setAudioChord(event.target.value as string);
    };

    // const loadChuck = async (theChuck: any) => {
    //     theChuck.loadFile('readData.ck').then(async () => {
    //         await theChuck.loadFile('readData.txt').then(async () => {
    //             // theChuck.runFile('readData.ck');
    //         });
    //     });
    //     setLoaded(true);
    // }

    let midi = null; // global MIDIAccess object
    const nav: any = navigator;
    
    midi = nav.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure)
    

    useMemo(() => {  
        const serverFilesToPreload = [
            {
                serverFilename: '/midiManager.ck',
                virtualFilename: 'midiManager.ck'
            },
            {
                serverFilename: '/ByronGlacier.wav',
                virtualFilename: 'ByronGlacier.wav'
            },
            // {
            //     serverFilename: '/readData.ck',
            //     virtualFilename: 'readData.ck'
            // },
            // {
            //     serverFilename: '/readData.txt',
            //     virtualFilename: 'readData.txt'
            // },
            {
                serverFilename: '/writeData.ck',
                virtualFilename: 'writeData.ck'
            },
        ];
        if (ranChuckInit.current === true || chuckHook) {
            return;
        }
        ranChuckInit.current = true;
        
        (async () => {
            const gameExists = await game['theChuck'] || chuckHook;  
            if (gameExists) {
                return;
            }
            const theChuckTemp: any = Chuck.init(serverFilesToPreload, game.audioContext, 2);
            
            Promise.resolve(theChuckTemp).then(async (i: any) => {
                game['theChuck'] = i;
                // test beep
                await i.runCode(` SinOsc osc => dac; 0.2 => osc.gain; 220 => osc.freq; .3::second => now; `);
                return setChuckHook(i);
            });       
        })();
    }, [game, chuckHook]);

    useEffect(() => {
        if (!chuckHook || !datas) {
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
        for (let i = 0; i < 10; i++) {
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
        }).then(({data}) => mingusChordsData.current = data);
    }

    const handleKeysVisible = () => {
        setKeysVisible(!keysVisible)
    }

    const handleInstrumentsVisible = () => {
        console.log('errrr');
        setInstrumentsVisible(!instrumentsVisible);
    }

    const handleSynthControlsVisible = () => {
        console.log("HEYA!");
        const el = document.getElementById('synthControlsWrapper');
        if (synthControlsVisible) {
            el?.classList.add('invisible');
        } else {
            el?.classList.remove('invisible');
        } 
        setSynthControlsVisible(!synthControlsVisible)
    }

    const handleSequencerVisible = () => {
        const el = document.getElementById('sequencerWrapperOuter');
        if (sequencerVisible) {
            el?.classList.add('invisible');
        } else {
            el?.classList.remove('invisible');
        }
        setSequencerVisible(!sequencerVisible);
    }

    const getSequenceList = () => {
        console.log('MODS!@@ ', modsHook);
        if (!modsHook || !modsHook.length) {
            return <></>;
        }
        return modsHook.map((i: any, idx: number) => {
            <Draggable key={`draggableKey_${idx}`} draggableId={`draggableId_${idx}`} index={idx}>
                {(provided) => <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}></li>}
            </Draggable>
        });
    }

    useEffect(() => {
        console.log('MINGUS DATA: ', mingusData);
        modsTemp.current.push({
            id: `mod_${modsCount}`,
            key: `mod_${modsCount}`,
            className: 'mods',
            audioKey,
            octave,
            audioChord: audioChord || '',
            audioScale,
        });
    }, [mingusData]);

    useEffect(() => {
        if (mingusChordsData.current) {
            // console.log('MINGUS CHORDS DATA: ', mingusChordsData.current);
            // console.log('MODS COPY! ', modsTemp.current);
            if (modsTemp.current !== undefined) {
                const newMod = [...modsHook, modsTemp.current[0]].filter((i: any) => i !== undefined);
                setModsCount(modsCount + 1);
                setModsHook(newMod);
            }
        }
        getSequenceList();
    }, [mingusChordsData.current]);

    const dragDone = (result: any) => {
        const newList = [... modsHook];
        const [removed] = newList.splice(result.source.index, 1);
        newList.splice(result.destination.index, 0, removed);
        console.log('drag done!');
        setModsHook(newList);
    }

    useEffect(() => {
        if (realTimeChordsDataObj && realTimeChordsDataObj.length > 0) {
            console.log('REALTIME CHORDS DATA IN USE EFFECT: ', realTimeChordsDataObj);
            // axios.post(`${process.env.REACT_APP_FLASK_API_URL}/midi_name`, JSON.stringify(realTimeChordsDataObj), {
            //     headers: {
            //         'Content-Type': 'application/json'
            //     }
            // }).then(({data}) => {
            //     console.log('WHAT IS DATA@@@??? ', data);
            //     //setRealTimeChordsDataObj((realTimeChordsDataObj) => [...realTimeChordsDataObj, data])
            // });
        }
        if (realTimeScalesDataObj) {
            console.log('REALTIME SCALES DATA IN USE EFFECT: ', realTimeScalesDataObj);
        }
    }, [realTimeChordsDataObj, realTimeScalesDataObj]);

    const noteOn = async (note: any, velocity: number) => {
        const realTimeMingus = async (note) => {
            // TODO: convert to redis sockets
            if (!note || note.length === 0) {
                return;
            }
            if (note.length > 1) {
                note = note[0];
            }
            console.log('JUST CHECKIN WHAT IS NOTE? ', note);
            axios.post(`${process.env.REACT_APP_FLASK_API_URL}/midi/${note}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(({data}) => { 
                console.log('REALTIME MINGUS DATA: ', data);
                const theOctave = data.midiNote[data.midiNote.length - 1];
                let theNote = data.midiNote.slice(0, -1);
                // console.log('OCTAVE: ', theOctave);
                // console.log('NOTE: ', theNote);
                // console.log('INDEX@!@! ', theNote.indexOf('♯'));
    
                const index = theNote.indexOf('♯');
                let convertedNote;
                if (index !== -1) {
                    convertedNote = theNote.slice(0, -1) + '#';
                }    
                if (convertedNote) {
                    theNote = convertedNote;
                }
                console.log('THE NOTE IN CREATECHUCK: ', theNote);
                axios.post(`${process.env.REACT_APP_FLASK_API_URL}/mingus_scales`, {theNote, audioScale, theOctave}, {
                    headers: {
                    'Content-Type': 'application/json'
                    }
                }).then(async ({data}) => {
                    console.log("REALTIME SCALES DATA: ", data);
                    const gotData = await data;
                    gotData.forEach((d: any) => {
                        if (realTimeScalesDataObj.indexOf(d) === -1) {
                            setRealTimeScalesDataObj((realTimeScalesDataObj) => [...realTimeScalesDataObj, d]);
                        }
                    });
                });

                axios.post(`${process.env.REACT_APP_FLASK_API_URL}/mingus_chords`, {audioChord, theNote, theOctave}, {
                    headers: {
                    'Content-Type': 'application/json'
                    }
                }).then(async ({data}) => {
                    console.log("REALTIME CHORDS DATA: ", data);
                    const gotData = await data;
                    gotData.forEach((d: any) => {
                        if (realTimeChordsDataObj.indexOf(d) === -1) {
                            setRealTimeChordsDataObj((realTimeChordsDataObj) => [...realTimeChordsDataObj, d]);
                        }
                    });

                    mingusChordsData.current = data;
                });
                
            });
        }
        lastMidiNote.current = note;
        if (midiNotesOn.current.indexOf(note) === -1) {
            midiNotesOn.current.push(note);
        }
        if (chuckHook === undefined || note === undefined) return;
        const mg = new Promise((resolve, reject) => {
            try {
                resolve(realTimeMingus(midiNotesOn.current));
            } catch {
                reject('nope');
            }
        });
        console.log('CAN WE START USING MINGUS DATA? ', mingusChordsData.current);

        console.log('whst is nope here? ', Promise.resolve(mg));

        Promise.resolve(chuckHook).then(async function(result: Chuck) {
            if (playingInstrument === '') {
                return;
            }
            if (playingInstrument === 'clarinet') {
                availableKnobs.current = ['reed','noiseGain','vibratoFreq','vibratoGain','pressure','reverbGain','reverbMix'];
                midiCode.current = CLARINET(note, velocity, valueReed, valueNoiseGain, valueVibratoFreq, valueVibratoGain, valuePressure, valueReverbGain, valueReverbMix);
            }
            if (playingInstrument === 'plucked') {
                availableKnobs.current = ['pickupPosition','sustain','stretch','pluck','baseLoopGain'];
                midiCode.current = STFKRP(note, velocity, valuePickupPosition, valueSustain, valueStretch, valuePluck, valueBaseLoopGain, valueReverbMix);
            }
            if (playingInstrument === 'sitar') {
                // result.clearChuckInstance();
                console.log('IN SITAR AT LEAST');
                midiCode.current = SITAR(note, velocity, valuePluck, valueReverbMix);
            }
            if (playingInstrument === 'moog') {
                console.log("IN MOOG ", note)
                midiCode.current = MOOG(note, velocity, valueLfoSpeed, valueLfoDepth, valueFilterQ, valueFilterSweepRate, valueVibratoFreq, valueVibratoGain, valueMoogGain, valueAftertouch, valueModSpeed, valueModDepth, valueOpMode);
            }
            if (playingInstrument === 'rhodes') {
                midiCode.current = RHODEY(note);
            }
            if (playingInstrument === 'mandolin' && realTimeScalesDataObj && realTimeChordsDataObj) {
                await chuckHook.loadFile('ByronGlacier.wav').then(() => {
                    midiCode.current = MANDOLIN(120, 4, note, velocity, valueBodySize, valuePluckPos, valueStringDamping, valueStringDetune, valueReverbMix, realTimeChordsDataObj, realTimeScalesDataObj);
                    // result.removeShred(w);
                });
            }
            if (playingInstrument === 'bandedwave') {
                // result.clearChuckInstance();
                midiCode.current = BANDEDWAVE(note);
            }
            // const midiCode.current: any = CHORUS(note);
            
            new Promise(async(resolve) => {
                const it = await result.isShredActive(1);
                resolve(it);
            }).then(async (res: any) => {
                await chuckHook.loadFile('midiManager.ck', ).then(async () => {
                    Promise.resolve(chuckHook.runFileWithArgs('midiManager.ck', `${midiCode.current.toString()}`)).then((w: any) => {
                    console.log('WHAT IS W? ', w);
                        // result.removeShred(w);
                    });
                });

                if (res === 0) {
                    Promise.resolve(result.runCode(midiCode.current)).then(async (w: any) => {
                            await Promise.resolve(w).then((i) => { 
                                // if (i) {
                                //     result.removeShred(i);
                                // }
                            });                        
                    });
                } else {
                    // await result.removeLastCode();
                    Promise.resolve(result.runCode(midiCode.current)).then(async (w: any) => {
                        await Promise.resolve(w).then((i) => { 
                            // if (i) {
                            //     result.removeShred(i);
                            // }
                        });   
                    });       
                }
                setPlaying(true);
            });

        });
        new Promise((resolve) => {
            const s = chuckHook.getIntArray('activeShreds');
            if (s) {
                resolve(s);
            }
        }
        ).then(async (s) => {
            console.log('ACTIVE SHREDS in note on!! ', s);
        });
      }
      
      const noteOff = async (note: any) => {
        if (midiNotesOn.current.indexOf(note) !== -1) {
            const index: any = midiNotesOn.current.indexOf(note);
            midiNotesOn.current.slice(index, 1);
        }
        console.log('MIDI NOTES ON IN OFF: ', midiNotesOn.current);
        new Promise((resolve) => {
            const s = chuckHook.getIntArray('activeShreds');
            if (s) {
                resolve(s);
            }
        }
        ).then(async (s) => {
            console.log('ACTIVE SHREDS in off!! ', s);
        });
        if (chuckHook === undefined) return;
        setPlaying(false);

        Promise.resolve(chuckHook).then(function(result: Chuck) {
            result.removeLastCode();
        });
        // const index = midiNotesOn.current.indexOf(note)
        // midiNotesOn.current.slice(index, 1);
      }
      
      function onMIDISuccess(midiAccess: any) {
        //   console.log("MIDI ready!");
          midi = midiAccess;
          
          const inputs = midiAccess.inputs;
          const outputs = midiAccess.outputs;
          // console.log("HOW MANY MIDI ACCESS INPUTS? ", inputs);
          for (const input of midiAccess.inputs.values()) {
            input.onmidimessage = getMIDIMessage;
          }
          return midi;
        }
        
      function onMIDIFailure(msg: any) {
          console.error(`Failed to get MIDI access - ${msg}`);
          return undefined;
      }
      
      function getMIDIMessage(message: any) {
        console.log('wjay is MSG> ', message);
        const command = message.data[0];
        const note = message.data[1];
        const velocity = (message.data.length > 2) ? message.data[2] : 0; // a velocity value might not be included with a noteOff command
        // console.log("YO MIDI MSG: ", message);
        if (playing) {
            console.log('DOES NOTE === LASTNOTE? ', note, lastMidiNote.current);
            return;
        }
        
        // console.log('MIDI MSG!: ', message);
        switch (command) {
            case 144: // noteOn
                if (velocity > 20) {
                    if (!note) {
                        return;
                    }
                    noteOn(Math.round(note), Math.round(parseInt(velocity)));
                    // console.log('note ', note);
                    // console.log('velocity ', velocity);
                } else {
                    console.log("********* TURNING OFF!");
                    noteOff(note);
                }
                break;
            case 128: // noteOff
                noteOff(note);
                break;
            // we could easily expand this switch statement to cover other types of commands such as controllers or sysex
        }
      }
        
    const playChuckNote = (note: any) => { 
       
        if (!note.target || !note.target ) { 
            return null;
        }
        console.log('NOTE??? ', note.target);
        try {
            const noteReady = note.target.attributes[2].value;
            console.log('what are options? ', note.target.attributes);
            console.log('NOTE READYYY? ', Math.round(noteReady));
            // chuckHook.runCode(` SinOsc osc => dac; 0.2 => osc.gain; ${Math.round(noteReady)} => osc.freq; 3::second => now; `);
            noteOn(Math.round(noteReady), 100);
            return noteReady;
        } catch {
            return null;
        }
    };
    //   useEffect(() => {
    //     console.log('MODSHOOK IS NOW: ', modsHook);
    //     console.log('MINGUS DATA? ', mingusData)
    //     // modsTemp.current = [];
    // }, [modsHook])

    const handleUpdateInstrument = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPlayingInstrument((event.target as HTMLInputElement).value);
        console.log("HERE 1")
        Promise.resolve(chuckHook).then(function(result: Chuck) {
            result.clearChuckInstance();
        });
        return (event.target as HTMLInputElement).value;
    }

    return (
        <>
            <Button onClick={handleKeysVisible}>KEYS</Button>
            <Button onClick={handleInstrumentsVisible}>INSTRUMENT</Button>
            <Button onClick={handleSequencerVisible}>SEQUENCER</Button>

            <Button onClick={handleSynthControlsVisible}>INSTRUMENT CONTROLS</Button>
            {/* <DragDropContext onDragEnd={dragDone}> */}
            <ParentSize>{({ width, height }) => vizComponent}</ParentSize>

            {
            chuckHook && Object.values(chuckHook).length && instrumentsVisible
            ?
            <Box id="instrumentBuilderWrapper">
                <FormControl>
                    <FormLabel id="demo-controlled-radio-buttons-group"></FormLabel>
                    <RadioGroup
                        aria-labelledby="demo-controlled-radio-buttons-group"
                        name="controlled-radio-buttons-group"
                        value={playingInstrument}
                        onChange={handleUpdateInstrument}
                    >
                        <FormControlLabel value="clarinet" control={<Radio />} label="Clarinet" />
                        <FormControlLabel value="sitar" control={<Radio />} label="Sitar" />
                        <FormControlLabel value="plucked" control={<Radio />} label="Plucked" />
                        <FormControlLabel value="moog" control={<Radio />} label="Moog" />
                        <FormControlLabel value="rhodes" control={<Radio />} label="Rhodes" />
                        <FormControlLabel value="mandolin" control={<Radio />} label="Mandolin" />
                        <FormControlLabel value="bandedwave" control={<Radio />} label="Banded Wave" />
                    </RadioGroup>
                </FormControl>
            </Box>
            :
            <></>
            }
            {
            chuckHook && Object.values(chuckHook).length && keysVisible
                ?
                    <Box id="keyboardWrapper">
                    <div id="keyboardControlsWrapper">
                    </div>
                    <ul id="keyboard">
                        {createKeys()}
                    </ul>
                    </Box>
                : null
            }
  
            <Box id="synthControlsWrapper" className="invisible">
            {
                playingInstrument === 'clarinet'
                ?
                <>
                    <Box sx={{display: "flex", flexDirection: "row", position: "relative", alignItems: "center", justifyContent: "center", paddingTop: "10vh" }}>
                        <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                            <CircularSlider
                                width={140}
                                min={0}
                                max={100}
                                label="REED"
                                labelFontSize="1rem"
                                direction={1}
                                dataIndex={valueReed * 100}
                                knobPosition="bottom"
                                appendToValue=""
                                valueFontSize="1.7rem"
                                trackColor="#eeeeee"
                                trackDraggable={true}
                                labelColor="yellow"
                                knobColor="yellow"
                                progressColorFrom="yellow"
                                progressColorTo="yellow"
                                onChange={ (value: any) => { setValueReed(value/100) } }
                            />
                        </div>
                        <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                            <CircularSlider
                                width={140}
                                min={0}
                                max={100}
                                label="NOISE GAIN"
                                dataIndex={valueNoiseGain * 100}
                                labelFontSize="1rem"
                                direction={1}
                                knobPosition="bottom"
                                appendToValue=""
                                valueFontSize="1.7rem"
                                trackColor="#eeeeee"
                                trackDraggable={true}
                                labelColor="yellow"
                                knobColor="yellow"
                                progressColorFrom="yellow"
                                progressColorTo="yellow"
                                onChange={ (value: any) => { setValueNoiseGain(value/100) } }
                            />
                        </div>
                        <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                            <CircularSlider
                                width={140}
                                min={0}
                                max={12}
                                label="VIBRATO FREQ"
                                dataIndex={valueVibratoFreq}
                                labelFontSize="1rem"
                                direction={1}
                                knobPosition="bottom"
                                appendToValue=""
                                valueFontSize="1.7rem"
                                trackColor="#eeeeee"
                                trackDraggable={true}
                                labelColor="yellow"
                                knobColor="yellow"
                                progressColorFrom="yellow"
                                progressColorTo="yellow"
                                data={[0,1,2,3,4,5,6,7,8,9,10,11,12]}
                                onChange={ (value: any) => { setValueVibratoFreq(value) } }
                            />
                        </div>
                        <div style={{ scale: 0.5,position: "relative", padding: "16px" }}>
                            <CircularSlider
                                width={140}
                                min={0}
                                max={100}
                                label="VIBRATO GAIN"
                                dataIndex={valueVibratoGain * 100}
                                labelFontSize="1rem"
                                direction={1}
                                knobPosition="bottom"
                                appendToValue=""
                                valueFontSize="1.7rem"
                                trackColor="#eeeeee"
                                trackDraggable={true}
                                labelColor="yellow"
                                knobColor="yellow"
                                progressColorFrom="yellow"
                                progressColorTo="yellow"
                                onChange={ (value: any) => { setValueVibratoGain(value/100) } }
                            />
                        </div>
                    </Box>
                    <br/>
                    <Box sx={{display: "flex", flexDirection: "row", position: "relative", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                            <CircularSlider
                                width={140}
                                min={0}
                                max={100}
                                label="PRESSURE"
                                dataIndex={valuePressure * 100}
                                labelFontSize="1rem"
                                direction={1}
                                knobPosition="bottom"
                                appendToValue=""
                                valueFontSize="1.7rem"
                                trackColor="#eeeeee"
                                trackDraggable={true}
                                labelColor="yellow"
                                knobColor="yellow"
                                progressColorFrom="yellow"
                                progressColorTo="yellow"
                                onChange={ (value: any) => { setValuePressure(value/100) } }
                            />
                        </div>
                        <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                            <CircularSlider
                                width={140}
                                min={0}
                                max={100}
                                label="REVERB GAIN"
                                dataIndex={valueReverbGain}
                                labelFontSize="1rem"
                                direction={1}
                                knobPosition="bottom"
                                appendToValue=""
                                valueFontSize="1.7rem"
                                trackColor="#eeeeee"
                                trackDraggable={true}
                                labelColor="yellow"
                                knobColor="yellow"
                                progressColorFrom="yellow"
                                progressColorTo="yellow"
                                onChange={ (value: any) => { setValueReverbGain(value) } }
                            />
                        </div>
                        <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                            <CircularSlider
                                width={140}
                                min={0}
                                max={100}
                                label="REVERB MIX"
                                dataIndex={valueReverbMix * 100}
                                labelFontSize="1rem"
                                direction={1}
                                knobPosition="bottom"
                                appendToValue=""
                                valueFontSize="1.7rem"
                                trackColor="#eeeeee"
                                trackDraggable={true}
                                labelColor="yellow"
                                knobColor="yellow"
                                progressColorFrom="yellow"
                                progressColorTo="yellow"
                                onChange={ (value: any) => { setValueReverbMix(value) } }
                            />
                        </div>
                    </Box>
                </>
                :
                null
            }
            {
                playingInstrument === 'plucked'
                ?
                <>
                    <Box sx={{display: "flex", flexDirection: "row", position: "relative", alignItems: "center", justifyContent: "center", paddingTop: "10vh" }}>
                        <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                            <CircularSlider
                                width={140}
                                min={0}
                                max={100}
                                label="PICKUP POSITION"
                                dataIndex={valuePickupPosition * 100}
                                labelFontSize="1rem"
                                direction={1}
                                initialValue={0}
                                knobPosition="bottom"
                                appendToValue=""
                                valueFontSize="1.7rem"
                                trackColor="#eeeeee"
                                trackDraggable={true}
                                labelColor="yellow"
                                knobColor="yellow"
                                progressColorFrom="yellow"
                                progressColorTo="yellow"
                                onChange={ (value: any) => { setValuePickupPosition(value/100) } }
                            />
                        </div>
                        <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                            <CircularSlider
                                width={140}
                                min={0}
                                max={100}
                                label="SUSTAIN"
                                dataIndex={valueSustain * 100}
                                labelFontSize="1rem"
                                direction={1}
                                knobPosition="bottom"
                                appendToValue=""
                                valueFontSize="1.7rem"
                                trackColor="#eeeeee"
                                trackDraggable={true}
                                labelColor="yellow"
                                knobColor="yellow"
                                progressColorFrom="yellow"
                                progressColorTo="yellow"
                                onChange={ (value: any) => { setValueSustain(value/100) } }
                            />
                        </div>
                        <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                            <CircularSlider
                                width={140}
                                min={0}
                                max={100}
                                label="STRETCH"
                                dataIndex={valueStretch * 100}
                                labelFontSize="1rem"
                                direction={1}
                                knobPosition="bottom"
                                appendToValue=""
                                valueFontSize="1.7rem"
                                trackColor="#eeeeee"
                                trackDraggable={true}
                                labelColor="yellow"
                                knobColor="yellow"
                                progressColorFrom="yellow"
                                progressColorTo="yellow"
                                onChange={ (value: any) => { setValueStretch(value/100) } }
                            />
                        </div>
                    </Box>
                    <br/>
                    <Box sx={{display: "flex", flexDirection: "row", position: "relative", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ scale: 0.5,position: "relative", padding: "16px" }}>
                            <CircularSlider
                                width={140}
                                min={0}
                                max={100}
                                label="PLUCK"
                                dataIndex={valuePluck * 100}
                                labelFontSize="1rem"
                                direction={1}
                                knobPosition="bottom"
                                appendToValue=""
                                valueFontSize="1.7rem"
                                trackColor="#eeeeee"
                                trackDraggable={true}
                                labelColor="yellow"
                                knobColor="yellow"
                                progressColorFrom="yellow"
                                progressColorTo="yellow"
                                onChange={ (value: any) => { setValuePluck(value/100) } }
                            />
                        </div>
                        <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                            <CircularSlider
                                width={140}
                                min={0}
                                max={100}
                                label="LOOP GAIN"
                                dataIndex={valueBaseLoopGain * 100}
                                labelFontSize="1rem"
                                direction={1}
                                knobPosition="bottom"
                                appendToValue=""
                                valueFontSize="1.7rem"
                                trackColor="#eeeeee"
                                trackDraggable={true}
                                labelColor="yellow"
                                knobColor="yellow"
                                progressColorFrom="yellow"
                                progressColorTo="yellow"
                                onChange={ (value: any) => { setValueBaseLoopGain(value/100) } }
                            />
                        </div>
                        <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                            <CircularSlider
                                width={140}
                                min={0}
                                max={100}
                                label="REVERB MIX"
                                dataIndex={valueReverbMix * 100}
                                labelFontSize="1rem"
                                direction={1}
                                knobPosition="bottom"
                                appendToValue=""
                                valueFontSize="1.7rem"
                                trackColor="#eeeeee"
                                trackDraggable={true}
                                labelColor="yellow"
                                knobColor="yellow"
                                progressColorFrom="yellow"
                                progressColorTo="yellow"
                                onChange={ (value: any) => { setValueReverbMix(value/100) } }
                            />
                        </div>
                    </Box>
                </>
                :
                null
            }
            {
                playingInstrument === 'sitar'
                ?                     
                    <Box sx={{display: "flex", flexDirection: "row", position: "relative", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ scale: 0.5,position: "relative", padding: "16px" }}>
                            <CircularSlider
                                width={140}
                                min={0}
                                max={100}
                                label="PLUCK"
                                dataIndex={valuePluck * 100}
                                labelFontSize="1rem"
                                direction={1}
                                knobPosition="bottom"
                                appendToValue=""
                                valueFontSize="1.7rem"
                                trackColor="#eeeeee"
                                trackDraggable={true}
                                labelColor="yellow"
                                knobColor="yellow"
                                progressColorFrom="yellow"
                                progressColorTo="yellow"
                                onChange={ (value: any) => { setValuePluck(value/100) } }
                            />
                        </div>
                        <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                            <CircularSlider
                                width={140}
                                min={0}
                                max={100}
                                label="REVERB MIX"
                                dataIndex={valueReverbMix * 100}
                                labelFontSize="1rem"
                                direction={1}
                                knobPosition="bottom"
                                appendToValue=""
                                valueFontSize="1.7rem"
                                trackColor="#eeeeee"
                                trackDraggable={true}
                                labelColor="yellow"
                                knobColor="yellow"
                                progressColorFrom="yellow"
                                progressColorTo="yellow"
                                onChange={ (value: any) => { setValueReverbMix(value/100) } }
                            />
                        </div>
                    </Box>
                :
                    null
            }
            {
                playingInstrument === 'moog'
                ?
                    <>
                        <Box sx={{display: "flex", flexDirection: "row", position: "relative", alignItems: "center", justifyContent: "center", paddingTop: "10vh" }}>
                            <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                                <CircularSlider
                                    width={140}
                                    min={0}
                                    max={100}
                                    label="GAIN"
                                    dataIndex={valueMoogGain * 100}
                                    labelFontSize="1rem"
                                    direction={1}
                                    knobPosition="bottom"
                                    appendToValue=""
                                    valueFontSize="1.7rem"
                                    trackColor="#eeeeee"
                                    trackDraggable={true}
                                    labelColor="yellow"
                                    knobColor="yellow"
                                    progressColorFrom="yellow"
                                    progressColorTo="yellow"
                                    onChange={ (value: any) => { setValueMoogGain(value/100) } }
                                />
                            </div>
                            <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                                <CircularSlider
                                    width={140}
                                    min={0}
                                    max={12}
                                    label="VIBRATO FREQ"
                                    dataIndex={valueVibratoFreq}
                                    labelFontSize="1rem"
                                    direction={1}
                                    knobPosition="bottom"
                                    appendToValue=""
                                    valueFontSize="1.7rem"
                                    trackColor="#eeeeee"
                                    trackDraggable={true}
                                    labelColor="yellow"
                                    knobColor="yellow"
                                    progressColorFrom="yellow"
                                    progressColorTo="yellow"
                                    data={[0,1,2,3,4,5,6,7,8,9,10,11,12]}
                                    onChange={ (value: any) => { setValueVibratoFreq(value) } }
                                />
                            </div>
                            <div style={{ scale: 0.5,position: "relative", padding: "16px" }}>
                                <CircularSlider
                                    width={140}
                                    min={0}
                                    max={100}
                                    label="VIBRATO GAIN"
                                    dataIndex={valueVibratoGain * 100}
                                    labelFontSize="1rem"
                                    direction={1}
                                    knobPosition="bottom"
                                    appendToValue=""
                                    valueFontSize="1.7rem"
                                    trackColor="#eeeeee"
                                    trackDraggable={true}
                                    labelColor="yellow"
                                    knobColor="yellow"
                                    progressColorFrom="yellow"
                                    progressColorTo="yellow"
                                    onChange={ (value: any) => { setValueVibratoGain(value/100) } }
                                />
                            </div>
                            <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                                <CircularSlider
                                    width={140}
                                    min={0}
                                    max={100}
                                    label="SWEEP RATE"
                                    dataIndex={valueFilterSweepRate * 100}
                                    labelFontSize="1rem"
                                    direction={1}
                                    knobPosition="bottom"
                                    appendToValue=""
                                    valueFontSize="1.7rem"
                                    trackColor="#eeeeee"
                                    trackDraggable={true}
                                    labelColor="yellow"
                                    knobColor="yellow"
                                    progressColorFrom="yellow"
                                    progressColorTo="yellow"
                                    onChange={ (value: any) => { setValueFilterSweepRate(value/100) } }
                                />
                            </div>
                        </Box>
                        <br/>
                        <Box sx={{display: "flex", flexDirection: "row", position: "relative", alignItems: "center", justifyContent: "center", paddingTop: "10vh" }}>
                            <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                                <CircularSlider
                                    width={140}
                                    min={0}
                                    max={12}
                                    label="LFO SPEED"
                                    labelFontSize="1rem"
                                    direction={1}
                                    dataIndex={valueLfoSpeed}
                                    knobPosition="bottom"
                                    appendToValue=""
                                    valueFontSize="1.7rem"
                                    trackColor="#eeeeee"
                                    trackDraggable={true}
                                    labelColor="yellow"
                                    knobColor="yellow"
                                    progressColorFrom="yellow"
                                    progressColorTo="yellow"
                                    data={[0,1,2,3,4,5,6,7,8,9,10,11,12]}
                                    onChange={ (value: any) => { setValueLfoSpeed(value) } }
                                />
                            </div>
                            <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                                <CircularSlider
                                    width={140}
                                    min={0}
                                    max={100}
                                    label="LFO DEPTH"
                                    dataIndex={valueLfoDepth * 100}
                                    labelFontSize="1rem"
                                    direction={1}
                                    knobPosition="bottom"
                                    appendToValue=""
                                    valueFontSize="1.7rem"
                                    trackColor="#eeeeee"
                                    trackDraggable={true}
                                    labelColor="yellow"
                                    knobColor="yellow"
                                    progressColorFrom="yellow"
                                    progressColorTo="yellow"
                                    onChange={ (value: any) => { setValueLfoDepth(value/100) } }
                                />
                            </div>
                            <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                                <CircularSlider
                                    width={140}
                                    min={0}
                                    max={100}
                                    label="FILTER Q"
                                    dataIndex={valueFilterQ * 100}
                                    labelFontSize="1rem"
                                    direction={1}
                                    knobPosition="bottom"
                                    appendToValue=""
                                    valueFontSize="1.7rem"
                                    trackColor="#eeeeee"
                                    trackDraggable={true}
                                    labelColor="yellow"
                                    knobColor="yellow"
                                    progressColorFrom="yellow"
                                    progressColorTo="yellow"
                                    onChange={ (value: any) => { setValueFilterQ(value/100) } }
                                />
                            </div>
                        </Box>
                        <br/>
                        <Box sx={{display: "flex", flexDirection: "row", position: "relative", alignItems: "center", justifyContent: "center", paddingTop: "10vh" }}>
                            <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                                <CircularSlider
                                    width={140}
                                    min={0}
                                    max={100}
                                    label="AFTERTOUCH"
                                    dataIndex={valueAftertouch * 100}
                                    labelFontSize="1rem"
                                    direction={1}
                                    knobPosition="bottom"
                                    appendToValue=""
                                    valueFontSize="1.7rem"
                                    trackColor="#eeeeee"
                                    trackDraggable={true}
                                    labelColor="yellow"
                                    knobColor="yellow"
                                    progressColorFrom="yellow"
                                    progressColorTo="yellow"
                                    onChange={ (value: any) => { setValueAftertouch(value/100) } }
                                />
                            </div>
                            <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                                <CircularSlider
                                    width={140}
                                    min={0}
                                    max={100}
                                    label="MOD SPEED"
                                    dataIndex={valueModSpeed * 100}
                                    labelFontSize="1rem"
                                    direction={1}
                                    knobPosition="bottom"
                                    appendToValue=""
                                    valueFontSize="1.7rem"
                                    trackColor="#eeeeee"
                                    trackDraggable={true}
                                    labelColor="yellow"
                                    knobColor="yellow"
                                    progressColorFrom="yellow"
                                    progressColorTo="yellow"
                                    onChange={ (value: any) => { setValueModSpeed(value) } }
                                />
                            </div>
                            <div style={{ scale: 0.5,position: "relative", padding: "16px" }}>
                                <CircularSlider
                                    width={140}
                                    min={0}
                                    max={100}
                                    label="MOD DEPTH"
                                    dataIndex={valueModDepth * 100}
                                    labelFontSize="1rem"
                                    direction={1}
                                    knobPosition="bottom"
                                    appendToValue=""
                                    valueFontSize="1.7rem"
                                    trackColor="#eeeeee"
                                    trackDraggable={true}
                                    labelColor="yellow"
                                    knobColor="yellow"
                                    progressColorFrom="yellow"
                                    progressColorTo="yellow"
                                    onChange={ (value: any) => { setValueModDepth(value/100) } }
                                />
                            </div>
                            <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                                <CircularSlider
                                    width={140}
                                    min={-1}
                                    max={4}
                                    label="OP MODE"
                                    dataIndex={valueOpMode}
                                    labelFontSize="1rem"
                                    direction={1}
                                    knobPosition="bottom"
                                    appendToValue=""
                                    valueFontSize="1.7rem"
                                    trackColor="#eeeeee"
                                    trackDraggable={true}
                                    labelColor="yellow"
                                    knobColor="yellow"
                                    progressColorFrom="yellow"
                                    progressColorTo="yellow"
                                    data={[-1,0,1,2,3,4]}
                                    onChange={ (value: any) => { setValueOpMode(value) } }
                                />
                            </div>
                        </Box>
                    </>
                :
                    null
            }
            { 
            playingInstrument === 'mandolin'
            ?
            <>
                <Box sx={{display: "flex", flexDirection: "row", position: "relative", alignItems: "center", justifyContent: "center", paddingTop: "10vh" }}>
                    <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                        <CircularSlider
                            width={140}
                            min={0}
                            max={100}
                            label="BODY SIZE"
                            dataIndex={valueBodySize * 100}
                            labelFontSize="1rem"
                            direction={1}
                            knobPosition="bottom"
                            appendToValue=""
                            valueFontSize="1.7rem"
                            trackColor="#eeeeee"
                            trackDraggable={true}
                            labelColor="yellow"
                            knobColor="yellow"
                            progressColorFrom="yellow"
                            progressColorTo="yellow"
                            onChange={ (value: any) => { setValueBodySize(value/100) } }
                        />
                    </div>
                    <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                        <CircularSlider
                            width={140}
                            min={0}
                            max={100}
                            label="PLUCK"
                            dataIndex={valuePluck * 100}
                            labelFontSize="1rem"
                            direction={1}
                            knobPosition="bottom"
                            appendToValue=""
                            valueFontSize="1.7rem"
                            trackColor="#eeeeee"
                            trackDraggable={true}
                            labelColor="yellow"
                            knobColor="yellow"
                            progressColorFrom="yellow"
                            progressColorTo="yellow"
                            onChange={ (value: any) => { setValuePluck(value/100) } }
                        />
                    </div>
                    <div style={{ scale: 0.5,position: "relative", padding: "16px" }}>
                        <CircularSlider
                            width={140}
                            min={0}
                            max={100}
                            label="PLUCK POS"
                            dataIndex={valuePluckPos * 100}
                            labelFontSize="1rem"
                            direction={1}
                            knobPosition="bottom"
                            appendToValue=""
                            valueFontSize="1.7rem"
                            trackColor="#eeeeee"
                            trackDraggable={true}
                            labelColor="yellow"
                            knobColor="yellow"
                            progressColorFrom="yellow"
                            progressColorTo="yellow"
                            onChange={ (value: any) => { setValuePluckPos(value/100) } }
                        />
                    </div>
                    <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                        <CircularSlider
                            width={140}
                            min={0}
                            max={100}
                            label="STRING DAMPING"
                            dataIndex={valueStringDamping * 100}
                            labelFontSize="1rem"
                            direction={1}
                            knobPosition="bottom"
                            appendToValue=""
                            valueFontSize="1.7rem"
                            trackColor="#eeeeee"
                            trackDraggable={true}
                            labelColor="yellow"
                            knobColor="yellow"
                            progressColorFrom="yellow"
                            progressColorTo="yellow"
                            onChange={ (value: any) => { setValueStringDamping(value/100) } }
                        />
                    </div>
                </Box>
                <br/>
                <Box sx={{display: "flex", flexDirection: "row", position: "relative", alignItems: "center", justifyContent: "center", paddingTop: "10vh" }}>
                    <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                        <CircularSlider
                            width={140}
                            min={0}
                            max={12}
                            label="STRING DETUNE"
                            labelFontSize="1rem"
                            direction={1}
                            dataIndex={valueStringDetune * 100}
                            knobPosition="bottom"
                            appendToValue=""
                            valueFontSize="1.7rem"
                            trackColor="#eeeeee"
                            trackDraggable={true}
                            labelColor="yellow"
                            knobColor="yellow"
                            progressColorFrom="yellow"
                            progressColorTo="yellow"
                            onChange={ (value: any) => { setValueStringDetune(value / 100) } }
                        />
                    </div>
                    <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                            <CircularSlider
                                width={140}
                                min={0}
                                max={100}
                                label="REVERB MIX"
                                dataIndex={valueReverbMix * 100}
                                labelFontSize="1rem"
                                direction={1}
                                knobPosition="bottom"
                                appendToValue=""
                                valueFontSize="1.7rem"
                                trackColor="#eeeeee"
                                trackDraggable={true}
                                labelColor="yellow"
                                knobColor="yellow"
                                progressColorFrom="yellow"
                                progressColorTo="yellow"
                                onChange={ (value: any) => { setValueReverbMix(value/100) } }
                            />
                        </div>
                </Box> 
            </>
            :
                null
            }
            </Box>



            <Box id="sequencerWrapperOuter" className="invisible">
                
                {/* REACT BEATIFUL DND */}
                <DragDropContext onDragEnd={dragDone}> 
                    <StrictModeDroppable droppableId="sequencerWrapper">
                    {(provided: any) =>
                        <ul 
                            className="sequencerWrapper" 
                            {...provided.droppableProps} 
                            ref={provided.innerRef}>
                            {
                                modsHook.filter((i: any) => i).map((i: any, idx: number) => {
                                    // i.id = i.id + `_${idx}`;
                                    // console.log('wtf is I? ', i);
                                    // return (
                                    return (<Draggable key={`draggableKey_${idx}`} draggableId={`draggableId_${idx}`} index={idx}>
                                        {(provided) => (
                                        <li className="li-to-drag-wrapper" key={`draggableId_${idx}`} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                            <div id={`draggableId_${idx}`} className="li-to-drag">
                                                {`${modsHook[idx].id}`}
                                                <br/>
                                                {`${modsHook[idx].audioScale}`}
                                                <br/>
                                                {`${modsHook[idx].audioKey} ${modsHook[idx].audioChord}  ${modsHook[idx].octave}`}
                                                <br/>
                                            </div>
                                        </li>)}
                                    </Draggable>)
                                    // )
                                })
                            }
                            {provided.placeholder}
                        </ul>
                        
                    }
                    </StrictModeDroppable>
                </DragDropContext>
                {/* ////////////////// */}

                <Button id='submitMingus' onClick={submitMingus}>SUBMIT</Button>

                <Box id="sequencerWrapperInner">
                    <Box className="sequencer-dropdown">
                        <FormControl fullWidth>
                            <InputLabel id="audioKey-simple-select-label">Key</InputLabel>
                            <Select
                                sx={{color: 'white', fontWeight: 'bold', fontSize: '1rem'}}
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
                    <Box className="sequencer-dropdown">
                        <FormControl fullWidth>
                            <InputLabel id="octave-simple-select-label">Octave</InputLabel>
                            <Select
                                sx={{color: 'white', fontWeight: 'bold', fontSize: '1rem'}}
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
                    <Box className="sequencer-dropdown">
                        <FormControl fullWidth>
                            <InputLabel id="scale-simple-select-label">Scale</InputLabel>
                            <Select
                                sx={{color: 'white', fontWeight: 'bold', fontSize: '1rem'}}
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
                                <MenuItem value={'HarmonicMinor'}>Harmonic Minor</MenuItem>
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
                    <Box className="sequencer-dropdown">
                        <FormControl fullWidth>
                            <InputLabel id="chord-simple-select-label">Chord</InputLabel>
                            <Select
                                labelId="chord-simple-select-label"
                                id="chord-simple-select"
                                value={audioChord}
                                label="Chord"
                                onChange={handleChangeChord}
                                sx={{
                                    color: 'white', 
                                    fontWeight: 'bold', 
                                    fontSize: '1rem',
                                    '& .MuiList-root': {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    background: 'var(--black-20)',
                                    color: 'var(--white-20)',
                                    }
                                }}
                            >
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
                                <MenuItem value={'susb9'}>Suspended Fourth Ninth 1</MenuItem>
                                <MenuItem value={'sus4b9'}>Suspended Fourth Ninth 2</MenuItem>
                                <MenuItem value={'9'}>Dominant Ninth</MenuItem>
                                <MenuItem value={'m9b5'}>Minor Ninth Flat Five</MenuItem>
                                <MenuItem value={'7_#9'}>Dominant Sharp Ninth</MenuItem>
                                <MenuItem value={'7b9'}>Dominant Flat Ninth</MenuItem>
                                <MenuItem value={'6/9'}>Sixth Ninth</MenuItem>
                                <MenuItem value={'11'}>Eleventh</MenuItem>
                                <MenuItem value={'m11'}>Minor Eleventh</MenuItem>
                                <MenuItem value={'add11'}>Add Eleventh</MenuItem>
                                <MenuItem value={'7b12'}>Hendrix Chord 1</MenuItem>
                                <MenuItem value={'hendrix'}>Hendrix Chord 2</MenuItem>
                                <MenuItem value={'M13'}>Major Thirteenth</MenuItem>
                                <MenuItem value={'m13'}>Minor Thirteenth</MenuItem>
                                <MenuItem value={'13'}>Dominant Thirteenth</MenuItem>
                                <MenuItem value={'add13'}>Dominant Thirteenth</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Box>

            </Box>
    </>
    )
} 

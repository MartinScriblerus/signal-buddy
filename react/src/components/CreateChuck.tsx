import React, { useState, useEffect, useMemo, useRef, createContext, useContext} from 'react';
// import Chuck from '../Chuck';
import { Chuck } from 'webchuck'
import axios, { AxiosResponse } from 'axios';
import { FLASK_API_URL } from '../helpers/constants';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Example from './XYChartWrapper';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import { useDeferredPromise } from './DefereredPromiseHook';
import { Button, FormControlLabel, FormLabel, Radio, RadioGroup, TextField, InputLabel } from '@mui/material';
import rawTree from '../helpers/rawTreeNode';
import Example2 from './TreeViz';
import CLARINET, { CHORUS, STFKRP, SITAR, MOOG, MOOG2, RHODEY, FRNCHRN, MANDOLIN, SAXOFONY, SAMPLER } from './stkHelpers'
// import { onMIDISuccess, onMIDIFailure } from './helpers/midiAlerts'; 
import CircularSlider from '@fseehawer/react-circular-slider';
import fs from 'node:fs';
import tempWrite from 'temp-write';
import { midiHzConversions } from './midiHzConversions';


declare global {
    interface HTMLLIElement {
        data: Promise<AxiosResponse<any, any> | undefined>
    }
}

export interface LibrosaData {
    beats: Array<any>,
    tempo: number,
    boundTimes: Array<number>,
    pitches: {
      times: Array<number>;
      hzs: Array<number>;
      midis: Array<number>;
      magnitudes: Array<number>;
    },
  };

// export interface TreeContext {
//     newestSetting: string;
//     setNewestSetting: React.Dispatch<React.SetStateAction<string>>;
// };

export interface TreeNode {
    name: string;
    children?: this[];
}

export interface TreeAtSelected {
    data: any;
    depth: number;
    children: any[];
    parent: any;
}

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

interface MediaStream {
    id: string;
    active: boolean;
}

interface MediaStreamAudioSourceNode extends AudioNode {
    
}

interface MediaStreamAudioDestinationNode extends AudioNode {
    stream: MediaStream;
}

interface AudioContext {
    state: string;
    close: () => void;
    createMediaStreamSource: () => MediaStreamAudioSourceNode;
    createMediaStreamDestination: () => any;
    resume: () => void;
    suspend: () => void;
}

export default function CreateChuck(props: any) {
    const {game, datas, audioReady, uploadedFiles} = props;
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
    const [librosaData, setLibrosaData] = useState<LibrosaData>({
        beats: [],
        tempo: 60,
        boundTimes: [],
        pitches: {
            times: [],
            hzs: [],
            magnitudes: [],
            midis: [],
        },
    });
    const [keysExist, setKeysExist] = useState(false);
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
    const [valuePluck, setValuePluck] = useState(0.8);
    const [valueBaseLoopGain, setValueBaseLoopGain] = useState(0.7);
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
    const [valueAperture, setValueAperture] = useState(0.4);
    const [valueOpMode, setValueOpMode] = useState(1);
    const [valueStiffness, setValueStiffness] = useState(0.4);
    const [valueBlowPosition, setValueBlowPosition] = useState(0.4);
    const [valueBowPressure, setValueBowPressure] = useState(0.7);
    const [valueBowMotion, setValueBowMotion] = useState(0.4);
    const [valueStrikePosition, setValueStrikePosition] = useState(0.1);
    const [valueBowRate, setValueBowRate] = useState(0.1);
    const [valuePreset, setValuePreset] = useState(1);
    const [valueControlOne, setValueControlOne] = useState(0.5);
    const [valueControlTwo, setValueControlTwo] = useState(0.8);
    const [playing, setPlaying] = useState(false);
    const [playingInstrument, setPlayingInstrument] = useState('');
    const [realTimeScalesDataObj, setRealTimeScalesDataObj] = useState<any>([]);
    const [realTimeChordsDataObj, setRealTimeChordsDataObj] = useState<any>([]);
    const [lastNote, setLastNote] = useState(0);

    const [bpm, setBpm] = useState(60);
    const [numeratorSignature, setNumeratorSignature] = useState<number>(4);
    const [lastBpm, setLastBpm] = useState(60);
    const [running, setRunning] = useState(1);
    const [timeSignature, setTimeSignature] = useState(5/4);
    const { defer, deferRef } = useDeferredPromise<boolean>();
    const [ showingTwoOctaves, setShowingTwoOctaves ] = useState(true);

    const [vizItem, setVizItem] = useState(0);
    const [treeDepth, setTreeDepth] = React.useState<number>(0);
    const [treeAtSelected, setTreeAtSelected] = React.useState<TreeAtSelected>({data: {}, depth: 0, children: [], parent: {}});
    const [vizComponent, setVizComponent] = useState<any>(<></>);
    const [nextTreeItem, setNextTreeItem] = useState<any>('step');
    const [ticksDatas, setTicksDatas] = useState<any>([]);

    // const [createdFilesList, setCreatedFilesList] = useState([]);

    const [isRecordingMic, setIsRecordingMic] = useState(false);

    const [positionDenominator, setPositionDenominator] = useState(2);

    const [newestSetting, setNewestSetting] = useState(rawTree);
    const [modsHook, setModsHook] = useState<any>(modsDefault);
 
    const [samplePositionStart, setSamplePositionStart] = useState(2); // hardcoded nominator for now
    const [sampleRates, setSampleRates] = useState([-0.3, -0.5, -0.7, -0.9, -1.99]); 
    const [sampleLength, setSampleLength] = useState(250); // same as above 
    // const TreeContext = createContext<TreeContext>({newestSetting: newestSetting, setNewestSetting: () => {}});
    // const treeContext = useContext(TreeContext);
    
    const createdFilesList = useRef<Array<string>>([]);
    // createdFilesList.current = [];
    const getLatestTreeSettings = (x: any) => {
        console.log("TREE SETTINGS in CREATE CHUCK: ", x);
        setTreeAtSelected(x);
    };

    const getFile = async (uploadedFiles: any) => {
        console.log("UF TEST: ", uploadedFiles);
        const fileReader  = new FileReader;
        fileReader.onload = function(){
        const arrayBuffer = this.result;
        //  snippet.log(arrayBuffer);
        //  snippet.log(arrayBuffer.byteLength);
        }
        console.log("UPLOADED FILES TESTING HERE NOW 1: ", uploadedFiles);
        if (!uploadedFiles[0]) {
            return;
        }
       
        // setCreatedFileBuffers(uploadedFiles);
        const url = URL.createObjectURL(uploadedFiles[uploadedFiles.length - 1]);
        console.log("THIS IS A TEST: ", uploadedFiles[uploadedFiles.length - 1]);
        fetch(url)
            .then(data => data.arrayBuffer())
            .then(async (buffer: any) => {
                const newestFileUpload = uploadedFiles[uploadedFiles.length - 1].name;
                console.log("NEWEST FILE UPLOAD: ", newestFileUpload);    
                console.log('THE FILE: ', uploadedFiles[uploadedFiles.length - 1]);
                await chuckHook.createFile("", `${newestFileUpload}`, new Uint8Array(buffer));
                if (uploadedFiles[uploadedFiles.length - 1].name.length < 1) {
                    return;
                }
                console.log("HOLY SHIT: ", uploadedFiles[uploadedFiles.length - 1].name);
                if (`${uploadedFiles[uploadedFiles.length - 1].name}`.length > 0) {
                    createdFilesList.current.push(`${uploadedFiles[uploadedFiles.length - 1].name}`);
                }
                console.log("CREATED FILES: ", createdFilesList.current);
                await chuckHook.runCode(`
                    SndBuf buffer => dac;
                    "${createdFilesList.current[createdFilesList.current.length - 1]}" => buffer.read;
                    buffer.samples() => buffer.pos;

                    0 => buffer.pos;
                    buffer.length() => now;
                `);
                return createdFilesList.current;
            });
    }
        //     console.log("CREATED FILES LIST: ", createdFilesList.current);

    
    
    const handleUpdateRawTree = (name: string, operation: string) => {
        const arrContainerUpdateTree = [];
        const childrenUpdated = {name: name, children: []};
        console.log('TREE DEPTH! ', treeDepth);
        if (treeDepth === 0) {
            arrContainerUpdateTree.push(childrenUpdated);
        } else {
            if (childrenUpdated) {
                if (operation === "add") {
                    if (nextTreeItem === 'pattern') {
                        childrenUpdated.name = 'pat_' + childrenUpdated.name;
                        treeAtSelected.data.children.push(childrenUpdated);
                    }
                    if (nextTreeItem === 'effect') {
                        childrenUpdated.name = 'fx_' + childrenUpdated.name;
                        treeAtSelected.data.children.push(childrenUpdated);
                    }
                    if (nextTreeItem === 'step') {
                        treeAtSelected.data.children.push(childrenUpdated);
                    }
                } else if (operation === "remove") {
                    if (treeAtSelected.data.children.length === 0) {
                        treeAtSelected.parent.data.children = treeAtSelected.parent.data.children.splice(treeAtSelected.parent.data.children.indexOf(treeAtSelected), 1);
                    } else {
                        treeAtSelected.data.children = [];
                    }
                }
                const splicedTree = {...treeAtSelected.parent, treeAtSelected: {children: [treeAtSelected.data]}};
                // this and the outer setting update the tree
                setNewestSetting(splicedTree);
            }
        }
        // here we update the tree array
        setNewestSetting({...newestSetting, children: [...newestSetting.children]});
        return childrenUpdated.name;
    };

    const handleAddStep = () => {
        const name = prompt('What is the name of your new node?');
        return handleUpdateRawTree(name, "add");
    };

    const handleRemoveStep = () => {
        return handleUpdateRawTree("", "remove");
    };

    const handleUpdateTicks = (ticks: any) => {
        setTicksDatas(ticks);
    };

    useEffect(() => {
        console.log("TICKS DATA IN CREATE CHUCK: ", ticksDatas);
    }, [ticksDatas]);

    const vizArray = [<Example width={500} height={500} librosaData={librosaData} setTicksDatas={handleUpdateTicks} ticksDatas={ticksDatas} />, <Example2 key={newestSetting.name} width={800} height={500} rawTree={newestSetting} handleUpdateRawTree={handleUpdateRawTree} currPosData={treeAtSelected} getLatestTreeSettings={getLatestTreeSettings} handleAddStep={handleAddStep} />, <Box>Updating...</Box>];

    // setVizComponent(vizArray[vizItem]);

    useEffect(() => {
        setVizComponent(vizArray[1]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newestSetting]);

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
    const currGraphEl: any = useRef()
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

    useEffect(() => {
        setVizComponent(vizArray[2]);
        // vizComponent.current = vizArray[2];
        return () => {
            console.log("CLEANING UP!");
        }
    }, [newestSetting]);

    useEffect(() => {
        if (treeDepth !== treeAtSelected.depth) {
            setTreeDepth(treeAtSelected.depth);
        }
        setVizComponent(vizArray[1]);
    }, [treeDepth, treeAtSelected]);

    useEffect(() => {
        handleSequencerVisible();
    }, [audioReady])

    useEffect(() => {
        const x = window.matchMedia("(max-width: 900px)")
        function myFunction(e) {
            setShowingTwoOctaves(!showingTwoOctaves);
        };
        x.addListener(myFunction)
        return () => x.removeListener(myFunction);
    }, [showingTwoOctaves]);

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
    //             theChuck.runFile('readData.ck');
    //         });
    //     });
    //     setLoaded(true);
    // }


    const loadChuck = async (theChuck: any) => {
        if (!uploadedFiles.length) {
            return;
        }
        // await getFile(uploadedFiles);
        const fileReader  = new FileReader;
        fileReader.onload = function(){
        const arrayBuffer = this.result;
        const url = URL.createObjectURL(uploadedFiles[uploadedFiles.length - 1]);
        console.log("THIS IS A TEST: ", uploadedFiles[uploadedFiles.length - 1]);
        fetch(url)
            .then(data => data.arrayBuffer()).then(async (buffer: any) => {
                    const newestFileUpload = uploadedFiles[uploadedFiles.length - 1].name;
                    console.log("NEWEST FILE UPLOAD: ", newestFileUpload);    
                    console.log('THE FILE in loadchuck: ', uploadedFiles[uploadedFiles.length - 1]);
                    await chuckHook.createFile("", `${newestFileUpload}`, new Uint8Array(buffer));
                    createdFilesList.current.push(`${uploadedFiles[uploadedFiles.length - 1].name}`);
                    
                    await chuckHook.runCode(`
                        SndBuf buffer => dac;
                        "${newestFileUpload}" => buffer.read;
                        buffer.samples() => buffer.pos;

                        0 => buffer.pos;
                        buffer.length() => now;
                    `);

                })
    
            
   
   
        //  snippet.log(arrayBuffer);
        //  snippet.log(arrayBuffer.byteLength);
        }
        console.log("UPLOADED FILES TESTING HERE NOW 2: ", uploadedFiles);

        
        // .then((data: any) => {

        // theChuck.loadFile(`${createdFilesList}`).then(async () => {
        console.log("BPM SHOULD BE... ", bpm);
        console.log("RUNNING???? ", running);
        console.log("created files list: ", createdFilesList.current);
        // theChuck.runFileWithArgs('writeData.ck', `${bpm}:${running}:${lastBpm}:${numeratorSignature}:${createdFilesList}`);
        theChuck.runFileWithArgs("uploadedFiles.ck", `/${createdFilesList.current}`);
        if (createdFilesList.current.length > 0) {
            console.log("GGODDAMIT: ", createdFilesList.current);
            theChuck.runFileWithArgs("runLoop.ck", `${createdFilesList.current}:${bpm}:${running}:${lastBpm}:${numeratorSignature}`);
        }
        // theChuck.runFileWithArgs("runLoop.ck", `/${createdFilesList.current}:${bpm}:${running}:${lastBpm}:${numeratorSignature}`);

        if (running === 1) {
            setRunning(0);
        } else {
            setRunning(1);
        }
        // });
        setLoaded(true);
        setLastBpm(bpm);
        // });

    }
 

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
            //     serverFilename: '//loner.wav',
            //     virtualFilename: '/loner.wav'
            // },
            {
                serverFilename: '/runLoop.ck',
                virtualFilename: 'runLoop.ck'
            },
            {
                serverFilename: '/loner.wav',
                virtualFilename: '/loner.wav'
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
            {
                serverFilename: '/MinipopsKick.wav',
                virtualFilename: 'MinipopsKick.wav'
            },
            {
                serverFilename: '/MinipopsSnare.wav',
                virtualFilename: 'MinipopsSnare.wav'
            },
            {
                serverFilename: '/uploadedFiles.ck',
                virtualFilename: 'uploadedFiles.ck'
            },
            {
                serverFilename: '/MinipopsHH.wav',
                virtualFilename: 'MinipopsHH.wav'
            },
            {
                serverFilename: '/MinipopsKick.ck',
                virtualFilename: 'MinipopsKick.ck'
            },
            {
                serverFilename: '/MinipopsSnare.ck',
                virtualFilename: 'MinipopsSnare.ck'
            },
            {
                serverFilename: '/MinipopsHH.ck',
                virtualFilename: 'MinipopsHH.ck'
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
            const theChuckTemp: any = await Chuck.init(serverFilesToPreload, undefined, 2, undefined);
            console.log("CHUCK: ", Chuck)
            // Promise.resolve(theChuckTemp.promise).then(async (i: any) => {
                game['theChuck'] = theChuckTemp;
                // test beep
                // await theChuckTemp.runCode(` SinOsc osc => dac; 0.2 => osc.gain; 220 => osc.freq; .3::second => now; `);
                // const fromS3 = await theChuckTemp.loadFile(`https://teemp.s3.us-east-2.amazonaws.com/LakeHouse_Scratch1_Redo.wav`);
                return setChuckHook(theChuckTemp);
            // });       
        })();
    }, [game, chuckHook]);

    useEffect(() => {
        getFile(uploadedFiles);
   }, [uploadedFiles.length])

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
                    setLibrosaData(datas[0].data);
                    return datas[0].data;
                }
            })
            // return;
        }
    }, [datas, theChuck, loaded, chuckHook]);
    
    const logOnly = [];
    const awaitNote = async (note: string) => {
        if(keysReady) {
            return;
        }

        return new Promise((resolve) => {
            const getVals = axios.get(`${FLASK_API_URL}/note/${note}`, requestOptions);
            resolve(getVals);
        }).then(async (res: any) => {
            logOnly.push({'note': note, 'data': res.data});
            if(note === `B9`) {
                console.log('GET THIS IN A FILE: ', JSON.stringify(logOnly));
            }
            return await res.data;
        });
    };

    const handleRecordAudio = async() => {
        // const audioCtx = await chuckHook.context;
        let recorder;
        let stream;
        const chuck = await chuckHook;
        console.log("NAV DEVICES ", navigator.mediaDevices);
        // Prompt the user to use their microphone.
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        recorder = new MediaRecorder(stream);
        if(!isRecordingMic) {
            console.log("CHUCKHOOK: ", await chuck);
            let mic = chuck.context as unknown as AudioContext;

            if (chuck.context) {
                // mic = chuck.context.destination;
                // const source = mic.createMediaStreamSource(stream);
                // source.connect(chuckHook.context.destination);
            }
            // console.log('SRC ', source);
                                // For the sake of more legible code, this sample only uses the
            // `showSaveFilePicker()` method. In production, you need to
            // cater for browsers that don't support this method, as
            // outlined in https://web.dev/patterns/files/save-a-file/.
          
            // Prompt the user to choose where to save the recording file.
            const suggestedName = "microphone-recording.webm";
            const handle = await window.showSaveFilePicker({ suggestedName });
            const writable = await handle.createWritable();
          
            // Start recording.
            recorder.start();
            recorder.addEventListener("dataavailable", async (event) => {
              // Write chunks to the file.
              await writable.write(event.data);
              if (recorder.state === "inactive") {
                // Close the file when the recording stops.
                await writable.close();
              }
            });
        } else {
            // Stop the recording.
            recorder.stop();
            // Stop the stream.
            stream.getTracks().forEach(track => track.stop());
        };
        setIsRecordingMic(!isRecordingMic);        
    }

    const tryGetNote = (note: any) => {
        const noteIndex1 = midiHzConversions.filter((i: any) => i.note === note);
        const noteReady = noteIndex1[0].data;
        return noteReady;
    };

    const organizeRows = async(rowNum: number, note: string) => {
        if (keysReady) {
            return;
        }
        console.log("NOTE: ", note);
        console.log("ROW NUM: ", rowNum);
        const noteReady = await awaitNote(note);
        console.log("NOTEREADT ", noteReady);
        // console.log("REAL NOTE READT: ", noteReady);
        // const noteReady = await tryGetNote(note);

        // const noteIndex1 = midiHzConversions.filter((i: any) => i.note === note);
        // const noteReady = noteIndex1[0].data;
        // console.log("Note ready: ", noteReady);
        // const noteIndex = midiHzConversions.findIndex((i: any) => i.note === note);
        // // const noteReady = noteIndex !== -1 ? midiHzConversions[noteIndex].data : null;

        // console.log("noteVals: ", noteIndex);
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
        console.log("here!!!")
        const octaves: Array<any> = [];
        // range from 0 to 10
        for (let i = 0; i < 9; i++) {
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
            const addBreak = (<span className="break" key={`octaveBreakWrapper_${i}`}><br key={`octaveBreak_${i}`} /></span>);
            octaves.push(octave);
            const isOdd = i % 2;

            if (isOdd > 0 && window.innerWidth < 900) {
                octaves.push(addBreak);
                octaves.map((o: any) => {
                    if (o.className === "break") {
                        o.style.display = "flex";
                    }
                });
                
            } else {
                // const breaks = document.getElementsByClassName("break")
                octaves.map((o: any) => {
                    if (o.className === "break") {
                        console.log("what is O? ", o);
                        // o.style.display = "none";
                        o.removeChild();
                    }
                });

            }
        }
        return octaves;
    }
    
    const submitMingus = async () => {
        console.log("DO WE HAVE AUDIOKEY??? ", audioKey);
        console.log("TEST HERE 1$");
        axios.post(`${process.env.REACT_APP_FLASK_API_URL}/mingus_scales`, {audioKey, audioScale, octave}, {
            headers: {
              'Content-Type': 'application/json'
            }
          }).then(({data}) => setMingusData(data));
        console.log("TEST HERE 1#");
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
        if (!audioReady){
            return;
        }
        const el = document.getElementById('sequencerWrapperOuter');
        if (sequencerVisible) {
            el?.classList.add('invisible');
            setSequencerVisible(!sequencerVisible);
        } else {
            console.log("REMOVED IT!");
            el?.classList.remove('invisible');
        }
        
    }

    const getSequenceList = () => {
        console.log('MODS!@@ ', modsHook);
        if (!modsHook || !modsHook.length) {
            return <></>;
        }
        return modsHook.map((i: any, idx: number) => {
            console.log("MODS HOOK ITEM ", idx, i);
        });
    }

    // useEffect(() => {
    //     console.log('CHHHHHECKIT: ', uploadedFiles);
    //     uploadedFiles.map(async (f: any, idx: number) => {
    //         const reader = new FileReader();
    //         // const dataURL = reader.readAsDataURL(f);
    //         // console.log('WHAT IS DATA URL? ', dataURL);
    //         console.log('CHHHHHECKIT: ', uploadedFiles);
    //         const tryFetch = await axios.get('http://3.141.15.81/');
    //         console.log('TRY FETCH SHIT: ', tryFetch);
    //         const fileURLs = {};
    //         reader.readAsDataURL(f);
    //         reader.onload = async (e) => {
    //             // fileURLs[idx] = reader.result as string;
    //             console.log('DATAURL WITHIN: ', e.target.result);

    //             const ch = chuckHook;
    //             try {
    //                 await ch.loadFile(e.target.result as string);
    //                 await ch.runCode(`
    //                 SndBuf buf => dac;

    //                 me.dir() + ${e.target.result} => string test;
    //                 test => buf.read;

    //                 0.5 => buf.gain;
    //                 1 => buf.pos;
    //                 1 => buf.rate;
    //                 0.5::second => now;
    //                 0 => buf.pos;
    //                 `)
    //             } catch (e) {
    //                 console.log('ERROR in loadfile: ', e);
    //             }
    //             console.log('CHUCK HOOK AFTER FILE UPLOAD IS ', ch);
    //         }
    //     });
    // }, [uploadedFiles.length]);

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

    useEffect(() => {
        if (realTimeScalesDataObj) {
            console.log('REALTIME SCALES DATA IN USE EFFECT: ', realTimeScalesDataObj);
        }
        if (realTimeChordsDataObj) {
            console.log('REALTIME CHORDS DATA IN USE EFFECT: ', realTimeChordsDataObj);
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
                const index = theNote.indexOf('♯');
                let convertedNote;
                if (index !== -1) {
                    convertedNote = theNote.slice(0, -1) + '#';
                }    
                if (convertedNote) {
                    theNote = convertedNote;
                }
                console.log('THE NOTE IN CREATECHUCK: ', theNote);
                console.log("TEST HERE 2$");
                axios.post(`${process.env.REACT_APP_FLASK_API_URL}/mingus_scales`, {theNote, audioScale, theOctave}, {
                    headers: {
                    'Content-Type': 'application/json'
                    }
                }).then(async ({data}) => {
                    console.log("REALTIME SCALES DATA: ", data);
                    const gotData = await data;
                    if (!gotData.length) {
                        console.log('NO MINGUS SCALES? ', gotData);
                        return;
                    }
                    gotData.forEach((d: any) => {
                        if (realTimeScalesDataObj.indexOf(d) === -1) {
                            setRealTimeScalesDataObj((realTimeScalesDataObj) => [...realTimeScalesDataObj, d]);
                        }
                    });
                });

                console.log("TEST HERE 2#");
                axios.post(`${process.env.REACT_APP_FLASK_API_URL}/mingus_chords`, {audioChord, theNote, theOctave}, {
                    headers: {
                    'Content-Type': 'application/json'
                    }
                }).then(async ({data}) => {
                    console.log("REALTIME CHORDS DATA: ", data);
                    const gotData = await data;
                    if (!gotData.length) {
                        console.log('NO DATA 2? ', gotData);
                        return;
                    }
                    // gotData.forEach((d: any) => {
                    //     if (realTimeChordsDataObj.indexOf(d) === -1) {
                    setRealTimeChordsDataObj((realTimeChordsDataObj) => [[], [gotData]]);
                    //     }
                    // });

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
        if (!mingusChordsData.current)
        console.log('what is nope here? ', Promise.resolve(mg));

        Promise.resolve(chuckHook).then(async function(result: Chuck) {
            if (playingInstrument === '') {
                return;
            }
            if (playingInstrument === 'clarinet') {
                availableKnobs.current = ['reed','noiseGain','vibratoFreq','vibratoGain','pressure','reverbGain','reverbMix'];
                setLastNote(note);
                await noteOff(note);
                midiCode.current = CLARINET(1, bpm, timeSignature, note, velocity, valueReed, valueNoiseGain, valueVibratoFreq, valueVibratoGain, valuePressure, valueReverbGain, valueReverbMix, realTimeChordsDataObj, realTimeScalesDataObj);
            }
            if (playingInstrument === 'plucked') {
                availableKnobs.current = ['pickupPosition','sustain','stretch','pluck','baseLoopGain'];
                setLastNote(note);
                await noteOff(note);
                midiCode.current = STFKRP(1, bpm, timeSignature, note, velocity, valuePickupPosition, valueSustain, valueStretch, valuePluck, valueBaseLoopGain, valueReverbMix, realTimeChordsDataObj, realTimeScalesDataObj);
            }
            if (playingInstrument === 'sitar') {
                console.log('IN SITAR AT LEAST');
                setLastNote(note);
                await noteOff(note);
                midiCode.current = SITAR(1, bpm, timeSignature, note, velocity, valuePluck, valueReverbMix, realTimeChordsDataObj, realTimeScalesDataObj);
            }
            if (playingInstrument === 'moog' && realTimeScalesDataObj && realTimeChordsDataObj) {
                console.log("IN MOOG NOTE", note);
                console.log("IN MOOG LAST NOTE: ", lastNote);
                setLastNote(note);
                if(lastNote !== note) {
                    // await noteOff(note);
                    await noteOff(lastNote);
                }
                midiCode.current = MOOG(1, bpm, timeSignature, note, velocity, valueLfoSpeed, valueLfoDepth, valueFilterQ, valueFilterSweepRate, valueVibratoFreq, valueVibratoGain, valueMoogGain, valueAftertouch, valueModSpeed, valueModDepth, valueOpMode, realTimeChordsDataObj, realTimeScalesDataObj);
            }
            if (playingInstrument === 'rhodes') {
                console.log("IN RHODEY ", note);
                setLastNote(note);
                await noteOff(note);
                midiCode.current = RHODEY(1, bpm, timeSignature, note, realTimeChordsDataObj, realTimeScalesDataObj);
            }
            if (playingInstrument === 'saxofony') {
                console.log("IN SAXOFONY ", note);
                setLastNote(note);
                await noteOff(note);
                midiCode.current = SAXOFONY(1, bpm, timeSignature, note, velocity, valueStiffness, valueAperture, valueNoiseGain, valueBlowPosition, valueVibratoFreq, valueVibratoGain, valuePressure, valueReverbMix, realTimeChordsDataObj, realTimeScalesDataObj);
            }
            if (playingInstrument === 'mandolin' && realTimeScalesDataObj && realTimeChordsDataObj) {
                setLastNote(note);
                console.log('NOTE . LAST => ', note, lastNote);
                await noteOff(note);
                // await chuckHook.loadFile('ByronGlacier.wav').then(() => {
                //     console.log('IN MANDLONE ');
                    midiCode.current = MANDOLIN(1, bpm, timeSignature, note, velocity, valueBodySize, valuePluckPos, valueStringDamping, valueStringDetune, valueReverbMix, realTimeChordsDataObj, realTimeScalesDataObj);
                    // result.removeShred(w);
                // });
            }
            if (playingInstrument === 'frenchhorn') {
                setLastNote(note);
                await noteOff(note);
                midiCode.current = FRNCHRN(1, bpm, timeSignature, note, velocity, valueLfoDepth, valueLfoSpeed, valueControlOne, valueControlTwo, valueReverbMix, realTimeChordsDataObj, realTimeScalesDataObj);
            }         
            if (playingInstrument === 'sampler' && realTimeScalesDataObj && realTimeChordsDataObj) {
                setLastNote(note);
                // await noteOff(note);
                
                await result.loadFile("./loner.wav").then(async (res: any) => {
                    const fl = fetch("./loner.wav");
                    midiCode.current = await SAMPLER(1, bpm, timeSignature, note, fl, samplePositionStart, sampleRates, sampleLength);
                });
            }
            new Promise(async (resolve, reject) => {
                const it: any = await result.isShredActive(1);
                Promise.resolve(it.promise).then((i: any) => {
                    console.log('THIS IS ACTIVE!!! ', i);
                    if (i === 0) {
                        console.log('in RES ZERO');
                        Promise.resolve(result.runCode(midiCode.current)).then(async (w: any) => {
                            await Promise.resolve(w).then((i) => { 
                                console.log('WHAT IS I (RUNNING CODE / RES IS ZERO) ', i);
                            });                        
                        });
                    } 
                    else {
                        Promise.resolve(result.runCode(midiCode.current)).then(async (w: any) => {
                            console.log('WHAT IS (RUNNING CODE) in the ELSE? ', w);
                        });       
                    }
                    setPlaying(true);
                });
            });
        });
    }
      
    const noteOff = async (note: any) => {
        if (midiNotesOn.current.indexOf(note) !== -1) {
            const index: any = midiNotesOn.current.indexOf(note);
            midiNotesOn.current.slice(index, 1);
        }
        console.log('MIDI NOTES ON IN OFF: ', midiNotesOn.current);
        if (chuckHook === undefined) return;
        setPlaying(false);
        console.log("WHAT IS CHUCKHOOK?? ", chuckHook);
        const firstShredActive = chuckHook.isShredActive(1);
        Promise.resolve(firstShredActive).then(async (i: any) => {
            chuckHook.removeLastCode();
        });
    };

    function onMIDISuccess(midiAccess: any) {
        midi = midiAccess;
          
        const inputs = midiAccess.inputs;
        const outputs = midiAccess.outputs;
        // console.log("HOW MANY MIDI ACCESS INPUTS? ", inputs);
        for (const input of midiAccess.inputs.values()) {
            input.onmidimessage = getMIDIMessage;
        }
        return midi;
    };
    
    function onMIDIFailure(msg: any) {
        console.error(`Failed to get MIDI access - ${msg}`);
        return undefined;
    };
      
    function getMIDIMessage(message: any) {
    console.log('MIDI MSG> ', message);
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

    useEffect(() => {
        console.log('MODSHOOK IS NOW: ', modsHook);
        console.log('MINGUS DATA? ', mingusData)
        // modsTemp.current = [];
    }, [modsHook, mingusData]);

    const handleUpdateInstrument = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPlayingInstrument((event.target as HTMLInputElement).value);
        Promise.resolve(chuckHook).then(function(result: Chuck) {
            result.clearChuckInstance();
        });
        return (event.target as HTMLInputElement).value;
    }

    const handleToggleViz = () => {
        console.log("vizItem.current is ", vizItem);
        if (vizItem === 0) {
            // handleSequencerVisible();
            setVizComponent(vizArray[1]);
            setVizItem(1);
        } else {
            // handleSequencerVisible();
            setVizComponent(vizArray[0]);
            setVizItem(0);
        }
    };

    const handleDrumMachine = async () => {
        const ch = await chuckHook;
        loadChuck(ch);
    };

    useEffect(() => {
        console.log("BPM IS ", bpm);
    }, [bpm]);

    const handleChangeBPM = (inputBPM: any) => {
        if (inputBPM) {
            setBpm(inputBPM);
        }
    };

    const handleChangeSampleStartPosition = (inputSampleStartPos: any) => {
        if (inputSampleStartPos) {
            setSamplePositionStart(inputSampleStartPos);
        }
    };

    const handleChangeSampleLength = (inputSampleLength: any) => {
        if (inputSampleLength) {
            setSampleLength(inputSampleLength);
        }
    };

    const handleChangeSampleRates = (inputSampleRate: any) => {
        if (inputSampleRate) {
            setSampleRates(inputSampleRate);
        }
    };

    const updateNextTreeItem = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log('CHECK!! ', (event.target).value);
        setNextTreeItem((event.target as HTMLInputElement).value);
    };

    return (
        <>
            <Button onClick={handleDrumMachine}>DRUM</Button>
            <Button onClick={handleKeysVisible}>KEYS</Button>
            <Button onClick={handleInstrumentsVisible}>INSTRUMENT</Button>
            {/* <Button onClick={handleSequencerVisible}>SEQUENCER</Button> */}

            {
                playingInstrument
                ?
                    <Button onClick={handleSynthControlsVisible}>INSTRUMENT CONTROLS</Button>
                :
                    null
            }

            <Button onClick={handleToggleViz}>TOGGLE VIZ</Button>

            {/* <Button onClick={handleAddStep}>Add Step</Button>
            <Button onClick={handleRemoveStep}>Remove Step</Button> */}


            {vizItem === 1
            ?
                <>
                    <Button onClick={handleAddStep}>Add Step</Button>
                    <Button onClick={handleRemoveStep}>Remove Step</Button>
                    <FormControl sx={{position: 'absolute', left: '32px'}} id="treeBuilderWrapper">
                    <FormLabel id="demo-controlled-radio-buttons-group-tree"></FormLabel>
                    <RadioGroup
                        aria-labelledby="demo-controlled-radio-buttons-group-tree"
                        name="controlled-radio-buttons-group-tree"
                        value={nextTreeItem}
                        onChange={updateNextTreeItem}
                    >
                        <FormControlLabel value="step" control={<Radio />} label="Step" />
                        <FormControlLabel value="pattern" control={<Radio />} label="Pattern" />
                        <FormControlLabel value="effect" control={<Radio />} label="Effect" />
                        
                    </RadioGroup>
                    </FormControl>
                    <Box id="sequencerWrapperOuter">
                    
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
            : 
                null
            };


            
            <ParentSize key={newestSetting.name} style={{overflowY: "scroll"}}>{({ width, height }) => vizArray[vizItem]}</ParentSize>
            {
            chuckHook && Object.values(chuckHook).length && instrumentsVisible
            ?
            <FormControl id="instrumentBuilderWrapper">
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
                    <FormControlLabel value="frenchhorn" control={<Radio />} label="French Horn" />
                    <FormControlLabel value="saxofony" control={<Radio />} label="Saxofony" />

                    <FormControlLabel value="sampler" control={<Radio />} label="Sampler" />
                    
                </RadioGroup>
            </FormControl>
            :
            <></>
            }
            {
            chuckHook && Object.values(chuckHook).length && keysVisible
                ?
                    <Box 
                      id="keyboardWrapper"
                      style={{display: (chuckHook && Object.values(chuckHook).length && keysVisible) ? "flex" : "none"}}
                    >
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
                                labelColor="#0fb29d"
                                knobColor="#0fb29d"
                                progressColorFrom="#0fb29d"
                                progressColorTo="#0fb29d"
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
                                labelColor="#0fb29d"
                                knobColor="#0fb29d"
                                progressColorFrom="#0fb29d"
                                progressColorTo="#0fb29d"
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
                                labelColor="#0fb29d"
                                knobColor="#0fb29d"
                                progressColorFrom="#0fb29d"
                                progressColorTo="#0fb29d"
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
                                labelColor="#0fb29d"
                                knobColor="#0fb29d"
                                progressColorFrom="#0fb29d"
                                progressColorTo="#0fb29d"
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
                                labelColor="#0fb29d"
                                knobColor="#0fb29d"
                                progressColorFrom="#0fb29d"
                                progressColorTo="#0fb29d"
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
                                labelColor="#0fb29d"
                                knobColor="#0fb29d"
                                progressColorFrom="#0fb29d"
                                progressColorTo="#0fb29d"
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
                                labelColor="#0fb29d"
                                knobColor="#0fb29d"
                                progressColorFrom="#0fb29d"
                                progressColorTo="#0fb29d"
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
                                label="PICKUP POS"
                                dataIndex={valuePickupPosition * 100}
                                labelFontSize="1rem"
                                direction={1}
                                initialValue={0}
                                knobPosition="bottom"
                                appendToValue=""
                                valueFontSize="1.7rem"
                                trackColor="#eeeeee"
                                trackDraggable={true}
                                labelColor="#0fb29d"
                                knobColor="#0fb29d"
                                progressColorFrom="#0fb29d"
                                progressColorTo="#0fb29d"
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
                                labelColor="#0fb29d"
                                knobColor="#0fb29d"
                                progressColorFrom="#0fb29d"
                                progressColorTo="#0fb29d"
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
                                labelColor="#0fb29d"
                                knobColor="#0fb29d"
                                progressColorFrom="#0fb29d"
                                progressColorTo="#0fb29d"
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
                                labelColor="#0fb29d"
                                knobColor="#0fb29d"
                                progressColorFrom="#0fb29d"
                                progressColorTo="#0fb29d"
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
                                labelColor="#0fb29d"
                                knobColor="#0fb29d"
                                progressColorFrom="#0fb29d"
                                progressColorTo="#0fb29d"
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
                                labelColor="#0fb29d"
                                knobColor="#0fb29d"
                                progressColorFrom="#0fb29d"
                                progressColorTo="#0fb29d"
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
                                labelColor="#0fb29d"
                                knobColor="#0fb29d"
                                progressColorFrom="#0fb29d"
                                progressColorTo="#0fb29d"
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
                                labelColor="#0fb29d"
                                knobColor="#0fb29d"
                                progressColorFrom="#0fb29d"
                                progressColorTo="#0fb29d"
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
                                    labelColor="#0fb29d"
                                    knobColor="#0fb29d"
                                    progressColorFrom="#0fb29d"
                                    progressColorTo="#0fb29d"
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
                                    labelColor="#0fb29d"
                                    knobColor="#0fb29d"
                                    progressColorFrom="#0fb29d"
                                    progressColorTo="#0fb29d"
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
                                    labelColor="#0fb29d"
                                    knobColor="#0fb29d"
                                    progressColorFrom="#0fb29d"
                                    progressColorTo="#0fb29d"
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
                                    labelColor="#0fb29d"
                                    knobColor="#0fb29d"
                                    progressColorFrom="#0fb29d"
                                    progressColorTo="#0fb29d"
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
                                    labelColor="#0fb29d"
                                    knobColor="#0fb29d"
                                    progressColorFrom="#0fb29d"
                                    progressColorTo="#0fb29d"
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
                                    labelColor="#0fb29d"
                                    knobColor="#0fb29d"
                                    progressColorFrom="#0fb29d"
                                    progressColorTo="#0fb29d"
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
                                    labelColor="#0fb29d"
                                    knobColor="#0fb29d"
                                    progressColorFrom="#0fb29d"
                                    progressColorTo="#0fb29d"
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
                                    labelColor="#0fb29d"
                                    knobColor="#0fb29d"
                                    progressColorFrom="#0fb29d"
                                    progressColorTo="#0fb29d"
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
                                    labelColor="#0fb29d"
                                    knobColor="#0fb29d"
                                    progressColorFrom="#0fb29d"
                                    progressColorTo="#0fb29d"
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
                                    labelColor="#0fb29d"
                                    knobColor="#0fb29d"
                                    progressColorFrom="#0fb29d"
                                    progressColorTo="#0fb29d"
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
                                    labelColor="#0fb29d"
                                    knobColor="#0fb29d"
                                    progressColorFrom="#0fb29d"
                                    progressColorTo="#0fb29d"
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
                            labelColor="#0fb29d"
                            knobColor="#0fb29d"
                            progressColorFrom="#0fb29d"
                            progressColorTo="#0fb29d"
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
                            labelColor="#0fb29d"
                            knobColor="#0fb29d"
                            progressColorFrom="#0fb29d"
                            progressColorTo="#0fb29d"
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
                            labelColor="#0fb29d"
                            knobColor="#0fb29d"
                            progressColorFrom="#0fb29d"
                            progressColorTo="#0fb29d"
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
                            labelColor="#0fb29d"
                            knobColor="#0fb29d"
                            progressColorFrom="#0fb29d"
                            progressColorTo="#0fb29d"
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
                            labelColor="#0fb29d"
                            knobColor="#0fb29d"
                            progressColorFrom="#0fb29d"
                            progressColorTo="#0fb29d"
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
                                labelColor="#0fb29d"
                                knobColor="#0fb29d"
                                progressColorFrom="#0fb29d"
                                progressColorTo="#0fb29d"
                                onChange={ (value: any) => { setValueReverbMix(value/100) } }
                            />
                        </div>
                </Box> 
            </>
            :
                null
            }
            {
                playingInstrument === 'saxofony'
                ?
                <>
                    <Box sx={{display: "flex", flexDirection: "row", position: "relative", alignItems: "center", justifyContent: "center", paddingTop: "10vh" }}>
                        <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                            <CircularSlider
                                width={140}
                                min={0}
                                max={100}
                                label="STIFFNESS"
                                labelFontSize="1rem"
                                direction={1}
                                dataIndex={valueStiffness * 100}
                                knobPosition="bottom"
                                appendToValue=""
                                valueFontSize="1.7rem"
                                trackColor="#eeeeee"
                                trackDraggable={true}
                                labelColor="#0fb29d"
                                knobColor="#0fb29d"
                                progressColorFrom="#0fb29d"
                                progressColorTo="#0fb29d"
                                onChange={ (value: any) => { setValueStiffness(value/100) } }
                            />
                        </div>
                        <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                            <CircularSlider
                                width={140}
                                min={0}
                                max={100}
                                label="APERTURE"
                                dataIndex={valueAperture * 100}
                                labelFontSize="1rem"
                                direction={1}
                                knobPosition="bottom"
                                appendToValue=""
                                valueFontSize="1.7rem"
                                trackColor="#eeeeee"
                                trackDraggable={true}
                                labelColor="#0fb29d"
                                knobColor="#0fb29d"
                                progressColorFrom="#0fb29d"
                                progressColorTo="#0fb29d"
                                onChange={ (value: any) => { setValueAperture(value/100) } }
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
                                labelColor="#0fb29d"
                                knobColor="#0fb29d"
                                progressColorFrom="#0fb29d"
                                progressColorTo="#0fb29d"
                                onChange={ (value: any) => { setValueNoiseGain(value/100) } }
                            />
                        </div>
                        <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                            <CircularSlider
                                width={140}
                                min={0}
                                max={100}
                                label="BLOW POSITION"
                                dataIndex={valueBlowPosition * 100}
                                labelFontSize="1rem"
                                direction={1}
                                knobPosition="bottom"
                                appendToValue=""
                                valueFontSize="1.7rem"
                                trackColor="#eeeeee"
                                trackDraggable={true}
                                labelColor="#0fb29d"
                                knobColor="#0fb29d"
                                progressColorFrom="#0fb29d"
                                progressColorTo="#0fb29d"
                                onChange={ (value: any) => { setValueBlowPosition(value/100) } }
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
                                labelColor="#0fb29d"
                                knobColor="#0fb29d"
                                progressColorFrom="#0fb29d"
                                progressColorTo="#0fb29d"
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
                                labelColor="#0fb29d"
                                knobColor="#0fb29d"
                                progressColorFrom="#0fb29d"
                                progressColorTo="#0fb29d"
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
                                labelColor="#0fb29d"
                                knobColor="#0fb29d"
                                progressColorFrom="#0fb29d"
                                progressColorTo="#0fb29d"
                                onChange={ (value: any) => { setValuePressure(value/100) } }
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
                                labelColor="#0fb29d"
                                knobColor="#0fb29d"
                                progressColorFrom="#0fb29d"
                                progressColorTo="#0fb29d"
                                onChange={ (value: any) => { setValueReverbMix(value) } }
                            />
                        </div>
                    </Box>
                </>
                :
                null
            }


            {
                playingInstrument === 'frenchhorn'
                ?
                    <>
                        <Box sx={{display: "flex", flexDirection: "row", position: "relative", alignItems: "center", justifyContent: "center", paddingTop: "10vh" }}>
                            <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                                <CircularSlider
                                    width={140}
                                    min={0}
                                    max={100}
                                    label="LFO SPEED"
                                    dataIndex={valueLfoSpeed * 100}
                                    labelFontSize="1rem"
                                    direction={1}
                                    knobPosition="bottom"
                                    appendToValue=""
                                    valueFontSize="1.7rem"
                                    trackColor="#eeeeee"
                                    trackDraggable={true}
                                    labelColor="#0fb29d"
                                    knobColor="#0fb29d"
                                    progressColorFrom="#0fb29d"
                                    progressColorTo="#0fb29d"
                                    onChange={ (value: any) => { setValueLfoSpeed(value/100) } }
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
                                    labelColor="#0fb29d"
                                    knobColor="#0fb29d"
                                    progressColorFrom="#0fb29d"
                                    progressColorTo="#0fb29d"
                                    onChange={ (value: any) => { setValueLfoDepth(value/100) } }
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
                                    label="CONTROL ONE"
                                    dataIndex={valueControlOne * 100}
                                    labelFontSize="1rem"
                                    direction={1}
                                    knobPosition="bottom"
                                    appendToValue=""
                                    valueFontSize="1.7rem"
                                    trackColor="#eeeeee"
                                    trackDraggable={true}
                                    labelColor="#0fb29d"
                                    knobColor="#0fb29d"
                                    progressColorFrom="#0fb29d"
                                    progressColorTo="#0fb29d"
                                    onChange={ (value: any) => { setValueControlOne(value/100) } }
                                />
                            </div>
                            <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                                <CircularSlider
                                    width={140}
                                    min={0}
                                    max={100}
                                    label="CONTROL TWO"
                                    dataIndex={valueControlTwo * 100}
                                    labelFontSize="1rem"
                                    direction={1}
                                    knobPosition="bottom"
                                    appendToValue=""
                                    valueFontSize="1.7rem"
                                    trackColor="#eeeeee"
                                    trackDraggable={true}
                                    labelColor="#0fb29d"
                                    knobColor="#0fb29d"
                                    progressColorFrom="#0fb29d"
                                    progressColorTo="#0fb29d"
                                    onChange={ (value: any) => { setValueControlTwo(value/100) } }
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
                                    labelColor="#0fb29d"
                                    knobColor="#0fb29d"
                                    progressColorFrom="#0fb29d"
                                    progressColorTo="#0fb29d"
                                    onChange={ (value: any) => { setValueReverbMix(value/100) } }
                                />
                            </div>
                        </Box>
                    </>
                :
                    null
            }
            </Box>

            <Box>
                <FormControl
                  onSubmit={(e) => {
                    e.preventDefault();
                }}>
                    <TextField
                        inputProps={{ style: { color: "#f6f6f6"} }}
                        sx={{
                            input: { color: '#f6f6f6' },
                            borderColor: "f6f6f6",
                        }}
                        placeholder="BPM"
                        type="number"
                        id="outlined-textarea"
                        InputLabelProps={{
                            shrink: false,
                        }}
                        value={bpm}
                        onInput={(event: React.ChangeEvent<HTMLInputElement>) => {
                                event.preventDefault();
                                const inputBpm: any = parseInt(event.target.value);
                                handleChangeBPM(inputBpm);
                            }
                        }
                    />
                </FormControl>
            </Box>


            
            <Box>
                <FormControl
                  onSubmit={(e) => {
                    e.preventDefault();
                }}>
                    <TextField
                        inputProps={{ style: { color: "#f6f6f6"} }}
                        sx={{
                            input: { color: '#f6f6f6' },
                            borderColor: "f6f6f6",
                        }}
                        placeholder="Sample Start"
                        type="number"
                        id="outlined-textarea"
                        InputLabelProps={{
                            shrink: false,
                        }}
                        value={samplePositionStart}
                        onInput={(event: React.ChangeEvent<HTMLInputElement>) => {
                                event.preventDefault();
                                const inputSampleStartPosition: any = parseInt(event.target.value);
                                handleChangeSampleStartPosition(inputSampleStartPosition);
                            }
                        }
                    />
                </FormControl>
            </Box>

            <Box>
                <FormControl
                  onSubmit={(e) => {
                    e.preventDefault();
                }}>
                    <TextField
                        inputProps={{ style: { color: "#f6f6f6"} }}
                        sx={{
                            input: { color: '#f6f6f6' },
                            borderColor: "f6f6f6",
                        }}
                        placeholder="Sample Length"
                        type="number"
                        id="outlined-textarea"
                        InputLabelProps={{
                            shrink: false,
                        }}
                        value={sampleLength}
                        onInput={(event: React.ChangeEvent<HTMLInputElement>) => {
                                event.preventDefault();
                                const inputSampleLength: any = parseInt(event.target.value);
                                handleChangeSampleLength(inputSampleLength);
                            }
                        }
                    />
                </FormControl>
            </Box>

            <Box>
                <FormControl
                  onSubmit={(e) => {
                    e.preventDefault();
                }}>
                    <TextField
                        inputProps={{ style: { color: "#f6f6f6"} }}
                        sx={{
                            input: { color: '#f6f6f6' },
                            borderColor: "f6f6f6",
                        }}
                        placeholder="Sample Rate"
                        type="any"
                        id="outlined-textarea"
                        InputLabelProps={{
                            shrink: false,
                        }}
                        value={sampleRates}
                        onInput={(event: React.ChangeEvent<HTMLInputElement>) => {
                                event.preventDefault();
                                const sampleRateInput: any = event.target.value;
                                handleChangeSampleRates(sampleRateInput);
                            }
                        }
                    />
                </FormControl>
            </Box>
            {/* {vizItem === 1
            ?
                <Box id="sequencerWrapperOuter" className="invisible">
                    
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
            : null} */}
            <Button id="startMicrophoneButton" onClick={handleRecordAudio}>
                {
                !isRecordingMic 
                    ? "START REC"
                    : "STOP REC"
                }
            </Button>

        </>
    )
} 

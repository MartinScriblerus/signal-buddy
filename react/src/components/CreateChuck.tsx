import React, { useState, useEffect, useMemo, useRef, createContext, useContext} from 'react';
// import Chuck from '../Chuck';
import { Chuck } from 'webchuck'
import axios, { AxiosResponse } from 'axios';
import { FLASK_API_URL, MIDDLE_FONT_SIZE } from '../helpers/constants';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Example from './XYChartWrapper';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import { useDeferredPromise } from './DefereredPromiseHook';
import { Button, FormControlLabel, FormLabel, Radio, RadioGroup, TextField, InputLabel, Typography, Popover } from '@mui/material';
import rawTree from '../helpers/rawTreeNode';
import Example2 from './TreeViz';
import CLARINET, { CHORUS, STFKRP, SITAR, MOOG, MOOG2, RHODEY, FRNCHRN, MANDOLIN, SAXOFONY, SAMPLER } from './stkHelpers'
// import { onMIDISuccess, onMIDIFailure } from '../helpers/midiAlerts'; 
import CircularSlider from '@fseehawer/react-circular-slider';
import {useMingusData} from '../hooks/useMingusData';
import { midiHzConversions } from './midiHzConversions';
import SampleTools from './SampleTools';
import PatternMapper from './PatternMapper';
import RealtimeAudioInput from './RealtimeAudioInput';
import { useAppSelector } from '../app/hooks';
import { store } from '../app/store';

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
    const {game, datas, audioReady, uploadedFiles, writableHook, handleChangeInput, rtAudio} = props;
    const theChuck = useRef<any>(undefined);
    const modsTemp: any = useRef([]);
    modsTemp.current = [];
    const [loaded, setLoaded] = useState(false);
    const [keysReady, setKeysReady] = useState(false);
    const [octave, setOctave] = useState('4');
    const [audioKey, setAudioKey] = useState('C');
    const [audioScale, setAudioScale] = useState('Major');
    const [audioChord, setAudioChord] = useState('M');
    const [mingusKeyboardData, setMingusKeyboardData] = useState<any>([]);
    const [mingusData, setMingusData] = useState<Array<any>>([]);
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
    const [vizComponent, setVizComponent] = useState<any>(0);
    const [nextTreeItem, setNextTreeItem] = useState<any>('step');
    const [ticksDatas, setTicksDatas] = useState<any>([]);

    // const [createdFilesList, setCreatedFilesList] = useState([]);

    const [positionDenominator, setPositionDenominator] = useState(2);

    const [newestSetting, setNewestSetting] = useState(rawTree);
    const [modsHook, setModsHook] = useState<any>(modsDefault);
    const [dataVizControlsOpen, setDataVizControlsOpen] = useState(false); 

    // const [isRecordingMic, setIsRecordingMic] = useState(false);
    const [isRealtime, setIsRealtime] = useState(true);

    const [samplePositionStart, setSamplePositionStart] = useState(2); // hardcoded nominator for now
    const [sampleRates, setSampleRates] = useState([-0.3, -0.5, -0.7, -0.9, -1.99]); 
    const [sampleLength, setSampleLength] = useState(250); // same as above 
    // const TreeContext = createContext<TreeContext>({newestSetting: newestSetting, setNewestSetting: () => {}});
    // const treeContext = useContext(TreeContext);
    const [keyBoard, setKeyBoard] = useState<any>();
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    };
  
    const handleClose = () => {
      setAnchorEl(null);
    };
  
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    const createdFilesList = useRef<Array<string>>([]);
    // createdFilesList.current = [];

    const getLatestTreeSettings = (x: any) => {
        console.log("TREE SETTINGS in CREATE CHUCK: ", x);
        setTreeAtSelected(x);
    };

    const getFile = async (uploadedFiles: any) => {
        if (uploadedFiles.length > 0) { 
            console.log("UPLOADED FILES: ", uploadedFiles);
        } else {
            return;
        }
        const fileReader  = new FileReader();
        fileReader.onload = function() {
            // const arrayBuffer = this.result;
            console.log('uploaded file loaded');
        }
       
        const url = URL.createObjectURL(uploadedFiles[uploadedFiles.length - 1]);

        fetch(url)
            .then(data => data.arrayBuffer())
            .then(async (buffer: any) => {
                const newestFileUpload = uploadedFiles[uploadedFiles.length - 1].name;
                console.log("NEWEST FILE UPLOAD: ", newestFileUpload);    
                await chuckHook.createFile("", `${newestFileUpload}`, new Uint8Array(buffer));
                if (uploadedFiles[uploadedFiles.length - 1].name.length < 1) {
                    return;
                } else {
                    console.log('THE FILE: ', uploadedFiles[uploadedFiles.length - 1]);
                }
                if (`${uploadedFiles[uploadedFiles.length - 1].name}`.length > 0) {
                    createdFilesList.current.push(`${uploadedFiles[uploadedFiles.length - 1].name}`);
                }
                console.log("CREATED FILES: ", createdFilesList.current);
   
                return createdFilesList.current;
            });
    }
    
    useEffect(() => {
        // const audioContext  = new AudioContext();
        console.log("RT RT RTRT ??? ", rtAudio);
        // if (!rtAudio || rtAudio.length < 1) return;
        // rtAudio.connect(audioContext.destination);
        // const analyser = audioContext.createAnalyser();
        // analyser.fftSize = 2048;
        // const bufferLength = analyser.frequencyBinCount;
        // const dataArray = new Uint8Array(bufferLength);
        // analyser.getByteTimeDomainData(dataArray);
        // console.log('HEY ANALYZER! ', analyser);
    }, [rtAudio]);

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

    const {getMingusData} = useMingusData();

    useEffect(() => {
        if (ticksDatas && ticksDatas.length > 0) {
            console.log("TICKS DATA IN CREATE CHUCK: ", ticksDatas);
        }
    }, [ticksDatas]);

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
            key: audioKey,
        }
    };

    useEffect(() => {
        if (treeAtSelected.depth && treeDepth !== treeAtSelected.depth) {
            setTreeDepth(treeAtSelected.depth);
        }
        // setVizComponent(1);
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

    const handleChangeAudioKey = (key: string) => {
        console.log('ALL GOOD ON KEY ', key);
        setAudioKey(key as string);
    };

    const handleChangeOctave = (octave: string) => {
        console.log('ALL GOOD ON OCTAVE ', octave);
        setOctave(octave);
    };

    const handleChangeScale = (event: SelectChangeEvent) => {
        console.log('WHAT IS EVENT IN HANDLECHANNGESCALE? ', event);
        setAudioScale(event.target.value as string);
    };

    const handleChangeChord = (event: SelectChangeEvent) => {
        console.log('WHAT IS EVENT IN HANDLECHANNGECHORD? ', event);
        setAudioChord(event.target.value as string);
    };

    const loadChuck = async (theChuck: any) => {
        if (!uploadedFiles.length) {
            return;
        }
        // await getFile(uploadedFiles);
        const fileReader  = new FileReader;
        fileReader.onload = function(){
        const arrayBuffer = this.result;
        const url = URL.createObjectURL(uploadedFiles[uploadedFiles.length - 1]);
        // console.log("THIS IS A TEST: ", uploadedFiles[uploadedFiles.length - 1]);
        console.log("ABOUT TO fetch(url)");
        fetch(url)
            .then(data => data.arrayBuffer()).then(async (buffer: any) => {
                    const newestFileUpload = uploadedFiles[uploadedFiles.length - 1].name;
                    // console.log("NEWEST FILE UPLOAD: ", newestFileUpload);    
                    // console.log('THE FILE in loadchuck: ', uploadedFiles[uploadedFiles.length - 1]);
                    await chuckHook.createFile("", `${newestFileUpload}`, new Uint8Array(buffer));
                    createdFilesList.current.push(`${uploadedFiles[uploadedFiles.length - 1].name}`);

                    console.log("ALL GOOD WITH CHUCK!");

                })
    
        }
 

        if (createdFilesList.current.length > 0) {
            // console.log("GGODDAMIT: ", createdFilesList.current);
            
            const filesArg = createdFilesList.current.toString().trim().replaceAll(",",":");
    
            theChuck.runFileWithArgs("runLoop.ck", `${bpm}:${running}:${lastBpm}:${numeratorSignature}:${createdFilesList.current.length}:${filesArg}`);
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
 

    // let midi = null; // global MIDIAccess object
    const midi = useRef<any>(); // global MIDIAccess object
    midi.current = null;
    const nav: any = navigator;
    // const mData = useMingusData();
    // setMingusData(mData);
    // console.log("mDATA ", mData);
    useEffect(() => {
        midi.current = nav.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
    }, [nav]);

    useEffect(() => {
        console.log("MIDI CURRENT CHANGED: ", midi.current);
    }, [midi]);

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
            const gameExists = await chuckHook;  
            if (gameExists) {
                return;
            }
            const theChuckTemp: any = await Chuck.init(serverFilesToPreload, undefined, 2, undefined);
            console.log("CHUCK: ", Chuck)
            handleKeysVisible();
            handleInstrumentsVisible();
            return setChuckHook(theChuckTemp);      
        })();
    }, [game, chuckHook]);

    useEffect(() => {
        getFile(uploadedFiles);
   }, [uploadedFiles.length]);

   useEffect(() => {
    if (writableHook && Object.keys(writableHook) && Object.keys(writableHook).length > 0) {
        console.log('WRITABLE HOOK IN CREATE CHUCK!!!!!!!! ', writableHook);
    }
   }, [writableHook])

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
                    console.log('SETTING LIBROSA DATA TO THIS: ', datas[0].data);
                    setLibrosaData(datas[0].data);
                    return datas[0].data;
                }
            })
        }
    }, [datas, theChuck, loaded, chuckHook]);
    
    const logOnly = [];
    const awaitNote = async (note: string) => {
        if(keysReady) {
            return;
        }
        // const stateData = store.getState();
        // console.log("HAVE WE GOT STATE? ", stateData);
        return new Promise((resolve) => {
            const getVals = axios.get(`${FLASK_API_URL}/note/${note}`, requestOptions);
            resolve(getVals);
        }).then(async (res: any) => {
            logOnly.push({'note': note, 'data': res.data});
            if(note === `B8`) {
                console.log('GET THIS IN A FILE: ', JSON.stringify(logOnly));
            }
            return await res.data;
        });
    };

    const tryGetNote = (note: any) => {
        const noteIndex1 = midiHzConversions.filter((i: any) => i.note === note);
        const noteReady = noteIndex1[0].data;
        return noteReady;
    };
   
    const organizeRows = async(rowNum: number, note: string) => {
        if (keysReady) {
            return;
        }
        // noteReady is single note data returned from server
        const noteReady = await awaitNote(note);
        getMingusData({...noteReady, note, rowNum});
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

    const organizeLocalStorageRows = async(theNote: any) => {
        // getMingusData({...theNote});
        const parsedNote = theNote.note.charAt(1) === '♯' ? theNote.note.slice(0, 2) + "-" + theNote.note.slice(2) : theNote.note.slice(0, 1) + "-" + theNote.note.slice(1);
        const el: any = await document.getElementById(parsedNote);
        if (el && !el['data-midiNote'] && !el['data-midiHz']) {
            el.classList.add(`keyRow_${theNote.rowNum}`);
            el.setAttribute('data-midiNote', await theNote.midiNote);
            el.setAttribute('data-midiHz', await theNote.midiHz);
            el.setAttribute('onClick', playChuckNote(theNote.midiHz));
        }
    }

    function compare( a, b ) {
        if ( a.midiNote < b.midiNote ){
          return -1;
        }
        if ( a.midiNote > b.midiNote ){
          return 1;
        }
        return 0;
    };

    const createKeys = () => {
        
        // let theNote;

        if (keysReady) {
            console.log('keys are ready');
            return;
        }

        const rData = store.getState();
        const storedNames = JSON.parse(localStorage.getItem("keyboard"));

        const octaves: Array<any> = [];
        // range from 0 to 10
        for (let i = 0; i < 9; i++) {
       
            // NEEED A CONDITIONAL ON DIFF 4LOOPS
            if (storedNames && storedNames.length === 108) {
                storedNames.sort( compare );
                [`C${i}`, `C♯${i}`, `D${i}`, `D♯${i}`, `E${i}`, `F${i}`, `F♯${i}`, `G${i}`, `G♯${i}`, `A${i}`, `A♯${i}`, `B${i}`].forEach((note) => {
                    organizeLocalStorageRows(storedNames.find((n: any) => n.note === note));
                });
                
                // console.log("STTTTTORED NAMES: ", storedNames);
            } else {
                [`C${i}`, `C♯${i}`, `D${i}`, `D♯${i}`, `E${i}`, `F${i}`, `F♯${i}`, `G${i}`, `G♯${i}`, `A${i}`, `A♯${i}`, `B${i}`].forEach((note) => {
                    organizeRows(i, note);
                });
            }

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

    useEffect(() => {
        setKeyBoard(createKeys());
    }, [chuckHook])
    
    const submitMingus = async () => {
        console.log("DO WE HAVE AUDIOKEY??? ", audioKey);
        console.log("TEST HERE 1$");
        axios.post(`${process.env.REACT_APP_FLASK_API_URL}/mingus_scales`, {audioKey, audioScale, octave}, {
            headers: {
              'Content-Type': 'application/json'
            }
        }).then(({data}) => {
            console.log("TEST SCALES HERE 1# ", data);
            //return setMingusKeyboardData(data);
        });
        axios.post(`${process.env.REACT_APP_FLASK_API_URL}/mingus_chords`, {audioChord, audioKey}, {
            headers: {
              'Content-Type': 'application/json'
            }
        }).then(({data}) => {
            console.log("TEST CHORDS 1# ", data);
            return mingusChordsData.current = data
        });
    }

    const handleKeysVisible = () => {
        setKeysVisible(!keysVisible)
    }

    const handleInstrumentsVisible = () => {
        setInstrumentsVisible(!instrumentsVisible);
    }

    // const handleSynthControlsVisible = () => {
    //     console.log("HEYA!");
    //     const el = document.getElementById('synthControlsWrapper');
    //     // if (synthControlsVisible) {
    //     //     el?.classList.add('invisible');
    //     // } else {
    //     //     el?.classList.remove('invisible');
    //     // } 
    //     // setSynthControlsVisible(!synthControlsVisible)
    // }

    const handleSequencerVisible = () => {
        if (!audioReady){
            return;
        }
        const el = document.getElementById('sequencerWrapperOuter');
        if (sequencerVisible) {
            el?.classList.add('invisible');
            setSequencerVisible(!sequencerVisible);
        } else {
            el?.classList.remove('invisible');
        }    
    }

    const getSequenceList = () => {
        // console.log('MODS!@@ ', modsHook);
        if (!modsHook || modsHook.length < 1) {
            return <></>;
        }
        return modsHook.map((i: any, idx: number) => {
            console.log("MODS HOOK ITEM ", idx, i);
        });
    }

    useEffect(() => {
        modsTemp.current.push({
            id: `mod_${modsCount}`,
            key: `mod_${modsCount}`,
            className: 'mods',
            audioKey,
            octave,
            audioChord: audioChord || '',
            audioScale,
        });
        console.log("MODS update: ", modsTemp.current);
    }, [modsHook]);

    useEffect(() => {
        if (mingusChordsData.current && mingusChordsData.current.length > 0) {
            if (modsTemp.current !== undefined) {
                const newMod = [...modsHook, modsTemp.current[0]].filter((i: any) => i !== undefined);
                setModsCount(modsCount + 1);
                setModsHook(newMod);
            }
            console.log("MINGUS CHORDS DATA: ", mingusChordsData.current);
        }
        getSequenceList();
    }, [mingusChordsData.current]);

    useEffect(() => {
        if (realTimeScalesDataObj && realTimeScalesDataObj.length > 0) {
            console.log('REALTIME SCALES DATA IN USE EFFECT: ', realTimeScalesDataObj);
        }
        if (realTimeChordsDataObj && realTimeChordsDataObj.length > 0) {
            console.log('REALTIME CHORDS DATA IN USE EFFECT: ', realTimeChordsDataObj);
        }
    }, [realTimeChordsDataObj, realTimeScalesDataObj]);

    const noteOn = async (theNote: any, midiNum: any, midiHz: any, velocity: number) => {
        // console.log('WHAT IS NOTE: ', theNote);
        // console.log('WHAT IS VELOCITY: ', velocity);
        // console.log('WHAT IS MIDI HZ? ', midiHz);
        // console.log('WHAT IS MIDI NUM? ', midiNum);
        const realTimeMingus = async (note) => {
            // TODO: convert to redis sockets
            if (!theNote || theNote.length < 1) {
                return;
            }

            const theOctave = note[0][note[0].length - 1];
            handleChangeOctave(theOctave);

            const audioKey = note[0].slice(0, -1);
            handleChangeAudioKey(audioKey);

            axios.post(`${process.env.REACT_APP_FLASK_API_URL}/mingus_scales`, {audioKey, audioScale, theOctave}, {
                headers: {
                'Content-Type': 'application/json'
                }
            }).then(async ({data}) => {
                const gotData = await data;
                if (!gotData || !gotData.data.length) {
                    console.log('NO MINGUS SCALES? ', gotData);
                    return;
                }
                gotData.data.forEach((d: any) => {
                    if (realTimeScalesDataObj.indexOf(d) === -1) {
                        setRealTimeScalesDataObj((realTimeScalesDataObj) => [...realTimeScalesDataObj, d]);
                    }
                });
            });

            axios.post(`${process.env.REACT_APP_FLASK_API_URL}/mingus_chords`, {audioChord, audioKey, theOctave}, {
                headers: {
                'Content-Type': 'application/json'
                }
            }).then(async ({data}) => {
                console.log("ONCE AGAIN VERY IIMPORTANT TO CHECK POST!@@ *** REALTIME CHORDS DATA: ", data);
                const gotData = await data;
                if (!gotData.length) {
                    console.log('NO DATA 2? ', gotData);
                    return;
                }

                setRealTimeChordsDataObj((d: any) => [...d, [gotData][0]]);
                mingusChordsData.current = data;
            });
        }
        
        lastMidiNote.current = theNote;

        if (midiNotesOn.current.indexOf(theNote) === -1) {
            midiNotesOn.current.push(theNote);
        }
        if (chuckHook === undefined || theNote === undefined) return;
        const mg = new Promise((resolve, reject) => {
            try {
                resolve(realTimeMingus(midiNotesOn.current));
            } catch {
                reject('nope');
            }
        });
        console.log('CAN WE START USING MINGUS CHORDS DATA? ', mingusChordsData.current);

        const note = midiNum;
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

                    if (i === 0) {
                        console.log('in RES ZERO');
                        Promise.resolve(result.runCode(midiCode.current)).then(async (w: any) => {
                            await Promise.resolve(w).then((i) => { 
                                console.log('WHAT IS I (RUNNING CODE / RES IS ZERO) ', i);
                            });                        
                        });
                    } else {
                        Promise.resolve(result.runCode(midiCode.current)).then(async (w: any) => {
                            console.log('WHAT IS (RUNNING CODE) in the ELSE? ', w);
                        });       
                    }
                    // TODO NEED TO GET TO THIS!!!
                    setPlaying(true);
                });
            });
        });
    }
      
    const noteOff = async (note: any) => {
        if (midiNotesOn.current.indexOf(note) !== -1) {
            const index: any = midiNotesOn.current.indexOf(note);
            midiNotesOn.current.slice(index, 1);
            console.log('removed this note: ', note);
            console.log('MIDI NOTES IN OFF: ', midiNotesOn.current);
        }
        
        if (chuckHook === undefined) return;
        setPlaying(false);
        console.log("WHAT IS CHUCKHOOK IN OFF?? ", chuckHook);
        const firstShredActive = chuckHook.isShredActive(1);
        Promise.resolve(firstShredActive).then(async (i: any) => {
            chuckHook.removeLastCode();
        });
    };

    function onMIDISuccess(midiAccess: any) {
        midi.current = midiAccess;
          
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
        const command = message.data[0];
        const note = message.data[1];
        const velocity = (message.data.length > 2) ? message.data[2] : 0; // a velocity value might not be included with a noteOff command
        // console.log("YO MIDI MSG: ", message);
        if (playing) {
            console.log('DOES NOTE === LASTNOTE? ', note, lastMidiNote.current);
            return;
        }
        // console.log('WHAT IIS NOTE IN GET MIDI MSG (see prop 1): ', message.data);

        switch (command) {
            case 144: // noteOn
                if (velocity > 20) {
                    if (!note) {
                        return;
                    }
                    // console.log("NOTE ON MIDI MSG! command ", command);
                    // console.log("NOTE ON MIDI MSG! note ", note);
                    // console.log("NOTE ON MIDI MSG! velocity ", velocity);
                    // noteOn(Math.round(note), Math.round(parseInt(velocity)));

                } else {
                    console.log("********* TURNING OFF!");
                    noteOff(note);
                }
                break;
            case 128: // noteOff
                // console.log("should be noteoff command: ", command);
                // console.log("should be noteoff note: ", note);
                // console.log("should be noteoff velocity: ", velocity);
                noteOff(note);
                break;
            // we could easily expand this switch statement to cover other types of commands such as controllers or sysex
        }
    }
        
    const playChuckNote = (note: any) => {      
        if (!note.target || !note.target ) { 
            return null;
        }
        console.log("NOTE IN PLAY CHUCK: ", note); 
        try {
            const noteReady = note.target.attributes[2].value;
            console.log('what are options? ', note.target.attributes);
            const theNoteLetter = note.target.attributes[0].value.replace('-','');
            const theMidiNum = parseInt(note.target.attributes[2].value);
            const theMidiHz = parseFloat(note.target.attributes[3].value).toFixed(2);
            console.log('NOTE READYYY? ', Math.round(noteReady));
            // chuckHook.runCode(` SinOsc osc => dac; 0.2 => osc.gain; ${Math.round(noteReady)} => osc.freq; 3::second => now; `);
            // noteOn(Math.round(noteReady), 100);
            noteOn(theNoteLetter, theMidiNum, theMidiHz, 100);
            return noteReady;
        } catch {
            return null;
        }
    };

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
            setVizComponent(1);
            setVizItem(1);
        } else {
            // handleSequencerVisible();
            setVizComponent(0);
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

    const handleChangeDataVizControls = async () => {
        console.log('here in handleChangeDataVizControls!');
        const el = await document.getElementById('vizControls');
        if (dataVizControlsOpen || vizItem !== 0) {
          setDataVizControlsOpen(false);
          document.getElementById("vizControls").style.display = "none";
        } else {
          setDataVizControlsOpen(true);
          document.getElementById("vizControls").style.display = "block";
        }
    }

    return (
        <>
            <Box>
                <Box id="sequencerWrapperOuter">
                
                    <Button id='submitMingus' onClick={submitMingus}>SUBMIT</Button>

                    <Box id="sequencerWrapperInner">
                        <Box className="sequencer-dropdown">
                            <FormControl 
                            fullWidth>
                                <InputLabel
                                    id={"audioKey-simple-select-label"} sx={{ color: 'white !important', fontFamily: 'text.primary'}}>Key
                                </InputLabel>
                                <Select
                                    sx={{color: 'white', fontWeight: 'bold', fontSize: MIDDLE_FONT_SIZE, fontFamily: 'typography.fontFamily'}}
                                    labelId="audioKey-simple-select-label"
                                    id="audioKey-simple-select"
                                    value={audioKey}

                                    // onChange={handleChangeAudioKey}
                                >
                                    <MenuItem sx={{fontFamily: 'monospace'}} value={'C'}>C</MenuItem>
                                    <MenuItem sx={{fontFamily: 'monospace'}} value={'C♯'}>C♯</MenuItem>
                                    <MenuItem sx={{fontFamily: 'typography.fontFamily'}} value={'D'}>D</MenuItem>
                                    <MenuItem sx={{fontFamily: 'typography.fontFamily'}} value={'D♯'}>D♯</MenuItem>
                                    <MenuItem sx={{fontFamily: 'typography.fontFamily'}} value={'E'}>E</MenuItem>
                                    <MenuItem sx={{fontFamily: 'typography.fontFamily'}} value={'F'}>F</MenuItem>
                                    <MenuItem sx={{fontFamily: 'typography.fontFamily'}} value={'F♯'}>F♯</MenuItem>
                                    <MenuItem sx={{fontFamily: 'typography.fontFamily'}} value={'G'}>G</MenuItem>
                                    <MenuItem sx={{fontFamily: 'typography.fontFamily'}} value={'G♯'}>G♯</MenuItem>
                                    <MenuItem sx={{fontFamily: 'typography.fontFamily'}} value={'A'}>A</MenuItem>
                                    <MenuItem sx={{fontFamily: 'typography.fontFamily'}} value={'A♯'}>A♯</MenuItem>
                                    <MenuItem sx={{fontFamily: 'typography.fontFamily'}} value={'B'}>B</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                        <Box className="sequencer-dropdown">
                            <FormControl fullWidth>
                                <InputLabel
                                    id={"octave-simple-select-label"} sx={{ color: 'white !important', fontFamily: 'text.primary'}}>Octave
                                </InputLabel>
                                <Select
                                    sx={{color: 'white', fontWeight: 'bold', fontSize: '14px'}}
                                    labelId="octave-simple-select-label"
                                    id="octave-simple-select"
                                    value={octave}
                                    label="Octave"
                                    // onChange={handleChangeOctave}
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
                                <InputLabel
                                    id={"scale-simple-select-label"} sx={{ color: 'white !important', fontFamily: 'text.primary'}}>Scale
                                </InputLabel>
                                <Select
                                    sx={{color: 'white', fontWeight: 'bold', fontSize: MIDDLE_FONT_SIZE}}
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
                                <InputLabel
                                    id={"chord-simple-select-label"} sx={{ color: 'white !important', fontFamily: 'text.primary'}}>Chord
                                </InputLabel>
                                <Select
                                    labelId="chord-simple-select-label"
                                    id="chord-simple-select"
                                    value={audioChord}
                                    label="Chord"
                                    onChange={handleChangeChord}
                                    sx={{
                                        color: 'white', 
                                        fontWeight: 'bold', 
                                        fontSize: MIDDLE_FONT_SIZE,
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
                                    <MenuItem value={'aug'}>Augmented Triad</MenuItem>
                                    <MenuItem value={'dim'}>Diminished Triad</MenuItem>
                                    <MenuItem value={'dim7'}>Diminished Seventh</MenuItem>
                                    <MenuItem value={'sus2'}>Suspended Second Triad</MenuItem>
                                    <MenuItem value={'sus'}>Suspended Fourth Triad</MenuItem>
                                    <MenuItem value={'madd4'}>Minor Add Fourth</MenuItem>
                                    <MenuItem value={'5'}>Perfect Fifth</MenuItem>
                                    <MenuItem value={'7b5'}>Dominant Flat Five</MenuItem>
                                    <MenuItem value={'6'}>Major Sixth</MenuItem>
                                    <MenuItem value={'67'}>Dominant Sixth</MenuItem>
                                    <MenuItem value={'69'}>Sixth Ninth</MenuItem>
                                    <MenuItem value={'m6'}>Minor Sixth</MenuItem>
                                    <MenuItem value={'M7'}>Major Seventh</MenuItem>
                                    <MenuItem value={'m7'}>Minor Seventh</MenuItem>
                                    <MenuItem value={'M7+'}>Augmented Major Seventh</MenuItem>
                                    <MenuItem value={'m7+'}>Augmented Minor Seventh</MenuItem>
                                    <MenuItem value={'sus47'}>Suspended Seventh</MenuItem>
                                    <MenuItem value={'m7b5'}>Half Diminished Seventh</MenuItem>
                                    <MenuItem value={'mM7'}>Minor Major Seventh</MenuItem>
                                    <MenuItem value={'dom7'}>Dominant Seventh</MenuItem>
                                    {/* <MenuItem value={'7'}>Dominant Seventh 2</MenuItem> */}
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
                                    {/* <MenuItem value={'7b12'}>Hendrix Chord</MenuItem> */}
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
            </Box>

            <Box sx={{height: "calc(100% - 13.5rem)", border: "1px solid purple", position: "absolute"}} id="vizWrapper">
                
                <Box sx={{position: "absolute", right: "0", top: "0"}}>
                    {(vizComponent === 0 || vizItem === 0) && (
                        <Button sx={{background: "green", position: "relative", top: 0, minWidth: "6rem", margin: "0.5rem", zIndex: 5}} id="btnDataVizControls" onClick={handleChangeDataVizControls}>Data Controls</Button>
                    )}
                    {(vizComponent === 1 || vizItem === 1) && (
                            <>
                                <Button sx={{background: "green", position: "relative", top: 0, minWidth: "6rem", margin: "0.5rem", zIndex: 5}} aria-describedby={id} variant="contained" onClick={handleClick}>
                                Open Popover
                                </Button>
                                <Popover
                                    id={id}
                                    open={open}
                                    sx={{position: "absolute", left: "0rem"}}
                                    anchorEl={anchorEl}
                                    onClose={handleClose}
                                    anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'left',
                                    }}
                                >
                                    <>
                                        <Typography sx={{ p: 2 }}>The content of the Popover.</Typography>
                                        <PatternMapper width={900} height={1600} />
                                    </>
                                </Popover>
                            </>

                    )}

                    <Button onClick={handleToggleViz} sx={{background: "blue", position: "relative", top: 0, minWidth: "6rem", margin: "0.5rem", zIndex: 5}}>TOGGLE VIZ</Button>

                    <Button onClick={handleChangeInput} sx={{background: "red", position: "relative", top: 0, minWidth: "6rem", margin: "0.5rem", zIndex: 5}}>AUDIO INPUT</Button>

                </Box>

                <ParentSize key={newestSetting.name}>{( { width, height } ) =>
                        vizComponent === 0 || vizItem === 0
                        ?
                            isRealtime
                            ?
                            <RealtimeAudioInput  width={width} height={height} data={rtAudio} />
                            :
                            <Example width={width} height={height} librosaData={librosaData} setTicksDatas={handleUpdateTicks} ticksDatas={ticksDatas} />
                        :
                            <Example2 key={newestSetting.name} width={width} height={height} rawTree={newestSetting} handleUpdateRawTree={handleUpdateRawTree} currPosData={treeAtSelected} getLatestTreeSettings={getLatestTreeSettings} handleAddStep={handleAddStep} />

                }
                </ParentSize>
            </Box>

            {
                vizComponent === 1
                ?
                    <Box id="sequenceToolsWrapper" sx={{ color: 'text.primary', left: 0, height: "25vh", position: "absolute", display: 'flex', flexDirection: 'row', border: '1px solid aqua', overflow: 'hidden'}}>
                        <Typography sx={{paddingRight: "10px"}}>Sequencer Tools </Typography>
                        <Box sx={{display: "flex", flexDirection: "row"}}>

                            <Box sx={{ display: "flex", flexDirection: "row", border: "1px solid #f6f6f6"}}>
                                <Button onClick={handleAddStep}>Add Step</Button>

                                <FormControl sx={{display: "flex"}} id="treeBuilderWrapper">
                                    <FormLabel id="demo-controlled-radio-buttons-group-tree"></FormLabel>
                                    <RadioGroup
                                        sx={{display: "flex", flexDirection: "row"}}
                                        aria-labelledby="demo-controlled-radio-buttons-group-tree"
                                        name="controlled-radio-buttons-group-tree"
                                        value={nextTreeItem}
                                        onChange={updateNextTreeItem}
                                    >
                                        <FormControlLabel sx={{fontSize: "12px"}} value="step" control={<Radio />} label="Step" />
                                        <FormControlLabel sx={{fontSize: "12px"}} value="pattern" control={<Radio />} label="Pattern" />
                                        <FormControlLabel sx={{fontSize: "12px"}} value="effect" control={<Radio />} label="Effect" />
                                        
                                    </RadioGroup>
                                </FormControl>
                            </Box>

                            <Box sx={{ display: "flex", flexDirection: "row", border: "1px solid #f6f6f6"}}>
                                <Button onClick={handleRemoveStep}>Remove Step</Button>
                            </Box>
                        
                        </Box>

                        <Box sx={{ width: "30%", display: "flex", flexDirection: "row", justifyContent: 'right'}}>
                            <Button sx={{ border: "1px solid green" }} onClick={handleDrumMachine}>Play Sequence</Button>
                        </Box>
                    </Box>
                :
                <Box sx={{display: "flex", flexDirection: "row"}}>
                    <SampleTools
                        bpm={bpm}
                        sampleLength={sampleLength}
                        sampleRates={sampleRates}
                        samplePositionStart={samplePositionStart}
                        handleChangeBPM={handleChangeBPM}
                        handleChangeSampleStartPosition={handleChangeSampleStartPosition}
                        handleChangeSampleLength={handleChangeSampleLength}
                        handleChangeSampleRates={handleChangeSampleRates}
                        handleDrumMachine={handleDrumMachine}
                    ></SampleTools>
                </Box>
            }
                            
            {
                chuckHook && Object.values(chuckHook).length && instrumentsVisible
                ?
                <FormControl sx={{left: 0, width: "100%"}} id="instrumentBuilderWrapper">
                    <FormLabel sx={{ color: '#f6f6f6 !important', fontSize: "12px", paddingRight: "16px" }} id="controlled-radio-buttons-group-instruments">Instruments</FormLabel>
                    <RadioGroup
                        aria-labelledby="demo-controlled-radio-buttons-group"
                        name="controlled-radio-buttons-group"
                        value={playingInstrument}
                        onChange={handleUpdateInstrument}
                        sx={{ width: "100%" }}
                    >
                        <FormControlLabel className={"instrument-radio-selector"} value="clarinet" control={<Radio />} label="Clarinet" />
                        <FormControlLabel className={"instrument-radio-selector"} value="sitar" control={<Radio />} label="Sitar" />
                        <FormControlLabel className={"instrument-radio-selector"} value="plucked" control={<Radio />} label="Plucked" />
                        <FormControlLabel className={"instrument-radio-selector"} value="moog" control={<Radio />} label="Moog" />
                        <FormControlLabel className={"instrument-radio-selector"} value="rhodes" control={<Radio />} label="Rhodes" />
                        <FormControlLabel className={"instrument-radio-selector"} value="mandolin" control={<Radio />} label="Mandolin" />
                        <FormControlLabel className={"instrument-radio-selector"} value="frenchhorn" control={<Radio />} label="French Horn" />
                        <FormControlLabel className={"instrument-radio-selector"} value="saxofony" control={<Radio />} label="Saxofony" />
                        <FormControlLabel className={"instrument-radio-selector"} value="sampler" control={<Radio />} label="Sampler" />
                    </RadioGroup>
                </FormControl>
                :
                <></>
            }

            <Box id="synthControlsWrapper" sx={{left: 0, width: "100%", border: "solid 1px white"}}>
            {
                playingInstrument === 'clarinet'
                ?
                <>
                    <Box sx={{display: "flex", flexDirection: "row", position: "relative", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ scale: 0.5, position: "relative", }}>
                            <CircularSlider
                                width={140}
                                min={0}
                                max={100}
                                label="REED"
                                labelFontSize="14px"
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
                                labelFontSize={MIDDLE_FONT_SIZE}
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
                                labelFontSize={MIDDLE_FONT_SIZE}
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
                                labelFontSize={MIDDLE_FONT_SIZE}
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
                                labelFontSize={MIDDLE_FONT_SIZE}
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
                                labelFontSize={MIDDLE_FONT_SIZE}
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
                                labelFontSize={MIDDLE_FONT_SIZE}
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
                                labelFontSize={MIDDLE_FONT_SIZE}
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
                                    labelFontSize={MIDDLE_FONT_SIZE}
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
                                    labelFontSize={MIDDLE_FONT_SIZE}
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
                                    labelFontSize={MIDDLE_FONT_SIZE}
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
                                    labelFontSize={MIDDLE_FONT_SIZE}
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
                                    labelFontSize={MIDDLE_FONT_SIZE}
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
                            labelFontSize={MIDDLE_FONT_SIZE}
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
                            labelFontSize={MIDDLE_FONT_SIZE}
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
                            labelFontSize={MIDDLE_FONT_SIZE}
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
                                labelFontSize={MIDDLE_FONT_SIZE}
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
                                labelFontSize={MIDDLE_FONT_SIZE}
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
                                labelFontSize={MIDDLE_FONT_SIZE}
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
                                labelFontSize={MIDDLE_FONT_SIZE}
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
                                    labelFontSize={MIDDLE_FONT_SIZE}
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
                                    labelFontSize={MIDDLE_FONT_SIZE}
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
                                    labelFontSize={MIDDLE_FONT_SIZE}
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



            {
                chuckHook && Object.values(chuckHook).length && keysVisible
                ?
                    <Box 
                      sx={{position: 'absolute', right: 0, bottom: 0}}
                    >
                        <ul id="keyboard">
                            {
                                !keysReady && (
                                    createKeys()

                                )
                            }

                        </ul>
                    </Box>
                : null
            }
  
            {/* <Box id="synthControlsWrapper" className="invisible">
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
                                labelFontSize="14px"
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
                                labelFontSize={MIDDLE_FONT_SIZE}
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
                                labelFontSize={MIDDLE_FONT_SIZE}
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
                                labelFontSize={MIDDLE_FONT_SIZE}
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
                                labelFontSize={MIDDLE_FONT_SIZE}
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
                                labelFontSize={MIDDLE_FONT_SIZE}
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
                                labelFontSize={MIDDLE_FONT_SIZE}
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
                                labelFontSize={MIDDLE_FONT_SIZE}
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
                                    labelFontSize={MIDDLE_FONT_SIZE}
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
                                    labelFontSize={MIDDLE_FONT_SIZE}
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
                                    labelFontSize={MIDDLE_FONT_SIZE}
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
                                    labelFontSize={MIDDLE_FONT_SIZE}
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
                                    labelFontSize={MIDDLE_FONT_SIZE}
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
                            labelFontSize={MIDDLE_FONT_SIZE}
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
                            labelFontSize={MIDDLE_FONT_SIZE}
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
                            labelFontSize={MIDDLE_FONT_SIZE}
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
                                labelFontSize={MIDDLE_FONT_SIZE}
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
                                labelFontSize={MIDDLE_FONT_SIZE}
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
                                labelFontSize={MIDDLE_FONT_SIZE}
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
                                labelFontSize={MIDDLE_FONT_SIZE}
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
                                    labelFontSize={MIDDLE_FONT_SIZE}
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
                                    labelFontSize={MIDDLE_FONT_SIZE}
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
                                    labelFontSize={MIDDLE_FONT_SIZE}
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
            </Box> */}



        </>
    )
} 

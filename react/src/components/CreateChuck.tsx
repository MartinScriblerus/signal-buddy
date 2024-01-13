import React, { useState, useEffect, useMemo, useRef} from 'react';
// import Chuck from '../Chuck';
import { Chuck } from 'webchuck'
import axios, { AxiosResponse } from 'axios';
import { FLASK_API_URL } from '../helpers/constants';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Example from './XYChartWrapper';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import { useDeferredPromise } from './DefereredPromiseHook';
import { Button, FormControlLabel, FormLabel, Radio, RadioGroup, TextField, InputLabel, Typography, Popover, Divider } from '@mui/material';
import rawTree from '../helpers/rawTreeNode';
import Example2 from './TreeViz';
import CLARINET, { CHORUS, STFKRP, SITAR, MOOG, MOOG2, RHODEY, FRNCHRN, MANDOLIN, SAXOFONY, SAMPLER } from './stkHelpers'
import { standardDeviation } from '../helpers/midiAlerts'; 
import CircularSlider from '@fseehawer/react-circular-slider';
import {useMingusData} from '../hooks/useMingusData';
import { midiHzConversions } from './midiHzConversions';
import SampleTools from './SampleTools';
import PatternMapper from './PatternMapper';
import RealtimeAudioInput from './RealtimeAudioInput';
import { useAppSelector } from '../app/hooks';
import GlobalTickViz from './GlobalTickViz';
import { store } from '../app/store';
import Keyboard from './Keyboard';
import VizHeaderRow from './VizHeaderRow';
import SequencerTools from './SequencerTools';
import MingusPopup from './MingusPopup';
import EffectsControls from './EffectsControls';
import { useResizable } from 'react-resizable-layout';
import microtoneDescsData from '../microtone_descriptions.json'; 
import {Tune} from '../tune';
import CustomAriaLive from './MicrotonesSearch';
// import HexbinKeyboard from './HexbinKeyboard';
import { data } from "./data";
import { Hexbin } from "./Hexbin";
import CreatedFilesPicker from './CreatedFilesPicker';
import { MIDIVal, MIDIValInput } from "@midival/core";
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';


declare global {
    interface HTMLLIElement {
        data: Promise<AxiosResponse<any, any> | undefined>
    }
}

interface IMIDIInput extends MIDIValInput {};

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
    const {game, datas, audioReady, uploadedFiles, writableHook, handleChangeInput, rtAudio, isRecProp, recordedFileLoaded, recordedFileToLoad, handleSetInputWrapperWid, lastFileUpload} = props;
    const theChuck = useRef<any>(undefined);
    const modsTemp: any = useRef([]);
    modsTemp.current = [];
    const [loaded, setLoaded] = useState(false);
    const [keysReady, setKeysReady] = useState(false);
    const [octave, setOctave] = useState('4');
    const [audioKey, setAudioKey] = useState('C');
    const [audioScale, setAudioScale] = useState('Major');
    const [audioChord, setAudioChord] = useState('M');
    const [lastChuckMessage, setLastChuckMessage] = useState<string>('');
    const [currentCount, setCurrentCount] = useState(0);
    const [latestCount, setLatestCount] = useState(0);
    const [mingusKeyboardData, setMingusKeyboardData] = useState<any>([]);
    const [mingusData, setMingusData] = useState<Array<any>>([]);
    const [microtonalScale, setMicrotonalScale] = useState('05-19');
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
    const [vizWid, setVizWid] = useState((`calc(100vw - 200px)`))
    // const [mingusChordsData, setMingusChordsData] = useState<any>([]);
    const [keysVisible, setKeysVisible] = useState(false);
    const [instrumentsVisible, setInstrumentsVisible] = useState(true);
    const [sequencerVisible, setSequencerVisible] = useState(false);
    const [synthControlsVisible, setSynthControlsVisible] = useState(false);
    const [modsCount, setModsCount] = useState(2);
    const [chuckHook, setChuckHook] = useState<Chuck>();
    const [valueReed, setValueReed] = useState<number>(0.5);
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
    const [playingInstrument, setPlayingInstrument] = useState('sampler');
    const [realTimeScalesDataObj, setRealTimeScalesDataObj] = useState<any>([]);
    const [realTimeChordsDataObj, setRealTimeChordsDataObj] = useState<any>([]);
    const [lastNote, setLastNote] = useState(0);

    const [selectedSideNavItem, setSelectedSideNavItem] = useState('');


    const [midiAccessHook, setMidiAccessHook] = useState<any>({});


    const [fileToCreate, setFileToCreate] = useState('');
    const [uploadedFileName, setUploadedFileName] = useState('');


    const [bpm, setBpm] = useState<number | undefined>(60);
    const [numeratorSignature, setNumeratorSignature] = useState<number>(4);
    const [denominatorSignature, setDDenominatorSignature] = useState<number>(4);
    const [lastBpm, setLastBpm] = useState(60.0);
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

    const [tActive, setTActive] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const [isGeneralKeyboard, setIsGeneralKeyboard] = useState(true); 

    // const [createdFilesList, setCreatedFilesList] = useState([]);
    const currentCountRef = useRef<number>(0);
    const latestCountRef = useRef<number>(0);
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
    const [is17EqualTemperament, setIs17EqualTemperament] = useState<boolean>(false); 
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
    const [winWid, setWinWid] = useState(null);
    const [winHeight, setWinHeight] = useState(null);
    const [tune, setTune] = useState(null);

    const loopReady = useRef(false);
    const containerRef = useRef<any>(null);
    const UTCofLatestCount = useRef<any>(null); 

    const selectRef: any = React.useCallback((selectedMicrotone: string, i: any) => {
        if (selectedMicrotone) {
            console.log('&&&selected microtone: ', selectedMicrotone);
        }
        if (i) {
            console.log('&&&selected microtone::: what is i???? ', i);
        }
    }, []);


    const theme = useTheme();


    useEffect(() => {
        setTune(new Tune());
    }, [])


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
    

    const testPlayFile = useRef(null);
    

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

    const lastTickCountRef = useRef<number>();
    lastTickCountRef.current = 0;

    useEffect(() => {
        (async() => {
            console.log('LAST CHUCK MESSAGE! ', lastChuckMessage);
            // console.log('IS LOOP READY? ', loopReady.current);
            // if (lastChuckMessage === "READY") {
            //     loopReady.current = true;
            // } 
            // if (!loopReady.current) return;
            if (lastChuckMessage.split("-")[0] === 'tick') {
                UTCofLatestCount.current = Date.now();
                // if (parseInt(lastChuckMessage.split(" ")[1].trim()) % 2 === 0) {
                //     document.getElementById("outerLevelGrid").style.background = "red";
                // } else {
                //     document.getElementById("outerLevelGrid").style.background = "green";
                // }
                // document.getElementById("outerLevelGrid").style.color = "primary.contrastText";
                setLatestCount(parseInt(lastChuckMessage.split(" ")[1].trim()));
            } 
            if (lastChuckMessage.split("-")[0] === 'subTick') { 
                // console.log("HEY CHECK THIS: ", lastChuckMessage.split(" ")[1].trim());
                currentCountRef.current = parseInt(lastChuckMessage.split(" ")[1].trim()); 
                // if (parseInt(lastChuckMessage.split(" ")[1].trim()) % 2 === 0) {
                //     document.getElementById("outerLevelGrid").style.background = "white";
                // } else {
                //     document.getElementById("outerLevelGrid").style.background = "black";
                // }
            }
        })()
    }, [lastChuckMessage])

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
    const totalTime = useRef(0);
    const totalBeats = useRef(0);
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
        alert("FUCK!!! ")
        if (!uploadedFiles.current.length) {
            return;
        }
        // await getFile(uploadedFiles);
        const fileReader  = new FileReader;
        fileReader.onload = function(){
        const arrayBuffer = this.result;
        const url = URL.createObjectURL(uploadedFiles[uploadedFiles.length - 1]);
        // console.log("THIS IS A TEST: ", uploadedFiles[uploadedFiles.length - 1]);
        console.log("ABOUT TO fetch(url)!! ", url);
        fetch(url)
            .then(data => data.arrayBuffer()).then(async (buffer: any) => {
                const newestFileUpload = uploadedFiles[uploadedFiles.length - 1].name;
                // console.log("NEWEST FILE UPLOAD: ", newestFileUpload);    
                // console.log('THE FILE in loadchuck: ', uploadedFiles[uploadedFiles.length - 1]);
                await chuckHook.createFile("", `${newestFileUpload}`, new Uint8Array(buffer));
                createdFilesList.current.push(`${uploadedFiles[uploadedFiles.length - 1].name}`);
                console.log("ALL GOOD WITH CHUCK!");
            });
        };
 

        if (createdFilesList.current.length > 0) {
            // console.log("GGODDAMIT: ", createdFilesList.current);
            
            const filesArg = createdFilesList.current.toString().trim().replaceAll(",",":");
    
            theChuck.runFileWithArgs("runLoop.ck", `${bpm}:${running}:${lastBpm}:${numeratorSignature}:${createdFilesList.current.length}:${filesArg}:'playing_file'`);
            // totalTime.current = theChuck.getFloat(`totalSeconds`);
            // totalBeats.current = theChuck.getInt(`beatCount`);
            console.log('HEY TOTAL TIME: ', totalTime.current);
            console.log('HEY TOTAL BEATS: ', totalBeats.current);
        }
        if (running === 1) {
            setRunning(0);
        } else {
            setRunning(1);
        }
        setLoaded(true);
        console.log('bpm!!: ', bpm);
        setLastBpm(bpm);
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

    const chuckTickCount = useRef<any>();
    chuckTickCount.current = 0;
    const chuckTickStart = useRef<any>();
    chuckTickStart.current = Date.now();


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
            {
                serverFilename: '/runLoop.ck',
                virtualFilename: 'runLoop.ck'
            },
            {
                serverFilename: '/testTick.ck',
                virtualFilename: 'testTick.ck'
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
                // {
                //     serverFilename: '/readData2.txt',
                //     virtualFilename: 'readData2.txt'
                // },
            {
                serverFilename: '/writeData.ck',
                virtualFilename: 'writeData.ck'
            },
            // {
            //     serverFilename: '/MinipopsKick.wav',
            //     virtualFilename: 'MinipopsKick.wav'
            // },
            // {
            //     serverFilename: '/MinipopsSnare.wav',
            //     virtualFilename: 'MinipopsSnare.wav'
            // },
            {
                serverFilename: '/uploadedFiles.ck',
                virtualFilename: 'uploadedFiles.ck'
            },
            // {
            //     serverFilename: '/MinipopsHH.wav',
            //     virtualFilename: 'MinipopsHH.wav'
            // },
            // {
            //     serverFilename: '/MinipopsKick.ck',
            //     virtualFilename: 'MinipopsKick.ck'
            // },
            // {
            //     serverFilename: '/MinipopsSnare.ck',
            //     virtualFilename: 'MinipopsSnare.ck'
            // },
            // {
            //     serverFilename: '/MinipopsHH.ck',
            //     virtualFilename: 'MinipopsHH.ck'
            // },
        ];
        if (ranChuckInit.current === true || chuckHook) {
            return;
        }
        ranChuckInit.current = true;
        
        (async () => {
            const gameExists = await chuckHook;  
            console.log('what is CHUCK HOOK? ', gameExists);
            if (gameExists) {
                return;
            }
            const theChuckTemp: any = await Chuck.init(serverFilesToPreload, undefined, 2, undefined);
            console.log("CHUCK: ", Chuck);
            handleKeysVisible();
            handleInstrumentsVisible();
            
            theChuckTemp.chuckPrint = (message) => { setLastChuckMessage(message) }
            console.log("ERRR BPM? ", bpm);
            setChuckHook(theChuckTemp); 
            await theChuckTemp.runFileWithArgs("testTick.ck", `${chuckTickCount.current}:${bpm}:${numeratorSignature}:${isRecProp}`);
            // ********* // THIS METHOD BELOW STARTS TIMER!!!! // ****************** 
            // ********* // await theChuckTemp.runFileWithArgs("testTick.ck", `${chuckTickCount.current}:${bpm}:${numeratorSignature}:${isRecProp}`); // ******************  
            // ********* // THIS METHOD ABOVE STARTS TIMER!!!! // ****************** 
            // console.log('GET THISSSS! ', process.env.PUBLIC_URL + '/uploads/');
            // return setChuckHook(theChuckTemp);      
        })();
    }, []);

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
    
    const playUploadedFile = (e?: any) => {
        if (!chuckHook) {
            return;
        }
        const theFile = e ? e: lastFileUpload;
        // if (!uploadedFileName) return;
        console.log('what are we looking at here? ', theFile);
        chuckHook.loadFile(`/uploads/${theFile}`);
        // chuckHook.loadFile("/readData.ck")
        if (!tActive) { 
            chuckHook.runFileWithArgs("/readData.ck", `${bpm}:${numeratorSignature}:${denominatorSignature}:/${theFile}`);
            setTActive(true);
        } else {
            // chuckHook.removeLastCode();
            chuckHook.replaceFileWithArgs("/readData.ck", `${bpm}:${numeratorSignature}:${denominatorSignature}:/${theFile}`);
        }
        console.log('ran chuck code');
    };

    useEffect(() => {
        console.log('use effect ran!!!!');
        playUploadedFile();
    }, [lastFileUpload])

    const playChuckFromMicrotonal = (note: any) => {
        console.log('%cYO MICRO: ', "color: #aaf;", note);

        playChuckNote(note.freq)
    }

    const logOnly = [];
    const awaitNote = async (note: string) => {
        console.log("***** ", is17EqualTemperament);
        console.log('KR ', keysReady);
        if(keysReady) {
            return;
        }
        // const stateData = store.getState();
        // console.log("HAVE WE GOT STATE? ", stateData);
        return new Promise((resolve) => {
            let getVals;
            console.log("***** ", is17EqualTemperament);
            if (is17EqualTemperament) {
                getVals = [];
                resolve(getVals);
            } else {
                getVals = axios.get(`${FLASK_API_URL}/note/${note}`, requestOptions);
                resolve(getVals);
            }
        }).then(async (res: any) => {

            logOnly.push({'note': note, 'data': res.data});
            if(note === `B8` || note === `17equal_B-9`) {
                console.log('GET THIS IN A FILE: ', JSON.stringify(logOnly));
                // setKeysReady(true);
            }
            return await res.data;
        });
    };
   
    const organizeRows = async(rowNum: number, note: string) => {
        if (keysReady) {
            return;
        }
        // noteReady is single note data returned from server
        const noteReady = await awaitNote(note);
        console.log("%cTHE PROBLEM IS MINGUS", "color: red;");
        getMingusData({...noteReady, note, rowNum});
        if (noteReady) {
            setKeysReady(true);
        } else {
            return;
        }
        const parsedNote = note.charAt(1) === '♯' ? note.slice(0, 2) + "-" + note.slice(2) : note.slice(0, 1) + "-" + note.slice(1);
        const el: any = await document.getElementById(parsedNote);
        if (el && !el['data-midiNote'] && !el['data-midiHz']) {
            el.classList.add(`keyRow`);
            el.classList.add(`keyRow_${rowNum}`);
            el.setAttribute('data-midiNote', await noteReady.midiNote);
            el.setAttribute('data-midiHz', await noteReady.midiHz);
            el.setAttribute('onClick', playChuckNote(noteReady.midiHz));
        }
    }

    const organizeLocalStorageRows = async(theNote: any) => {
        // getMingusData({...theNote});
                        // const tune = new Tune();
                // console.log("YO MICROTONES! ", microtoneDescsData);
       

        const parsedNote = theNote.note.charAt(1) === '♯' ? theNote.note.slice(0, 2) + "-" + theNote.note.slice(2) : theNote.note.slice(0, 1) + "-" + theNote.note.slice(1);
        const el: any = await document.getElementById(parsedNote);
        if (el && !el['data-midiNote'] && !el['data-midiHz']) {
            el.classList.add(`keyRow`);
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
    

    const getFile = async (uploadedFiles: any) => {
        uploadedFiles && uploadedFiles.filter((f: any, ind: number) => f && f !== 'null' && uploadedFiles.indexOf(f) === ind);
        console.log('Uploading this file: ', uploadedFiles[uploadedFiles.length - 1]);
        setUploadedFileName(uploadedFiles[uploadedFiles.length - 1]);
    }

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
            return mingusChordsData.current = data;
        });
    }

    const handleKeysVisible = () => {
        setKeysVisible(!keysVisible)
    }

    const handleInstrumentsVisible = () => {
        setInstrumentsVisible(!instrumentsVisible);
    }

    const handleSequencerVisible = () => {
        if (!audioReady){
            return;
        }
        const el = document.getElementById('sequencerWrapperOuter');
        if (!el) return;
        el.style.color = 'primary.contrastText'
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
        const keys = Array.from(document.getElementsByClassName("keyRow"));
        keys.forEach((k) => {
            if (k.classList.contains('litAscending')) {
                // setTimeout(()=>{
                    k.classList.remove(`litAscending`);
                // }, 2000);
            }
            if (k.classList.contains('litDescending')) {
                // setTimeout(()=>{
                    k.classList.remove(`litDescending`);
                // }, 2000);
            }
            
        });
        if (realTimeScalesDataObj && realTimeScalesDataObj.length > 0) {
            console.log('REALTIME SCALES DATA IN USE EFFECT: ', realTimeScalesDataObj[0]);
            realTimeScalesDataObj.filter((d) => typeof d[0] === 'string' )
            realTimeScalesDataObj.forEach((d: any) => {
                const bFlat = d.indexOf('Bb') !== -1;
                const dFlat = d.indexOf('Db') !== -1;
                const eFlat = d.indexOf('Eb') !== -1;
                const gFlat = d.indexOf('Gb') !== -1;
                const aFlat = d.indexOf('Ab') !== -1; 
                if (bFlat) {
                    d.splice(d.indexOf('Bb'), 1, `A♯`); 
                }
                if (dFlat) {
                    d.splice(d.indexOf('Db'), 1, `C♯`); 
                }
                if (eFlat) {
                    d.splice(d.indexOf('Eb'), 1, `D♯`); 
                }
                if (gFlat) {
                    d.splice(d.indexOf('Gb'), 1, `F♯`); 
                }
                if (aFlat) {
                    d.splice(d.indexOf('Ab'), 1, `G♯`); 
                }
                
                let direction = "ascending";
                if (d[0][0] < d[1][0] && d[0][0] !== 'G' && d[0][0] != `G♯`) {
                    direction = "ascending";
                    // console.log("GOT IT ASCENDING!! ", d)
                } else {
                    direction = "descending";
                    // console.log("GOT IT DESCENDING!! ", d)
                }
                d.forEach((note: any) => {

                    let adjustedOctave; 
                    if (direction === "ascending") {
                        adjustedOctave = note[0] <= d[0][0] ? `${parseInt(octave) + 1}`: octave;
                        adjustedOctave.replaceAll('#','♯');
                    } else {
                        adjustedOctave = note[0] >= d[0][0] ? `${parseInt(octave) - 1}`: octave;
                        adjustedOctave.replaceAll('#','♯');
                    }
                    const aKeyToLightUp = document.getElementById(`${note}-${adjustedOctave}`);
                    if (aKeyToLightUp && direction === "ascending") {
                        aKeyToLightUp.classList.add('litAscending');
                    } else if (aKeyToLightUp && direction === "descending") {
                        aKeyToLightUp.classList.add('litDescending');
                    }
                })
            })
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
            // setRealTimeScalesDataObj([]);
            setRealTimeChordsDataObj([]);
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
                
                // gotData.data.forEach((d: any) => {
                //     if (realTimeScalesDataObj.indexOf(d) === -1) {
                //         setRealTimeScalesDataObj((realTimeScalesDataObj) => [...realTimeScalesDataObj, d]);
                //     }
                // });
                setRealTimeScalesDataObj([...gotData.data])
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
        console.log('HOW ABOUT THIS MIDI ACCESS?>???????? ', midiAccess);
        setMidiAccessHook(midiAccess);
        // const inputs = midiAccess.inputs;
        // const outputs = midiAccess.outputs;
        // // console.log("HOW MANY MIDI ACCESS INPUTS? ", inputs);
        // for (const input of midiAccess.inputs.values()) {
        //     // input.onmidimessage = getMIDIMessage;
        // }
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
            case 248: // midi clock
                // console.log('got clock in here!!! ', message.srcElement.onMessage());
                break;
            case 144: // noteOn
                if (velocity > 20) {
                    if (!note) {
                        return;
                    }
                    console.log("NOTE ON MIDI MSG! command ", command);
                    console.log("NOTE ON MIDI MSG! note ", note);
                    console.log("NOTE ON MIDI MSG! velocity ", velocity);
                    // noteOn(Math.round(note), Math.round(parseInt(velocity)));

                } else {
                    console.log("********* TURNING OFF!");
                    noteOff(note);
                }
                break;
            case 128: // noteOff
                console.log("should be noteoff command: ", command);
                console.log("should be noteoff note: ", note);
                console.log("should be noteoff velocity: ", velocity);
                noteOff(note);
                break;
            // we could easily expand this switch statement to cover other types of commands such as controllers or sysex
        }
        // const message = event.data;
        const statusByte = message.data[0] & 0xf0;
      
        if (statusByte === 0xf8) {
          // Handle incoming MIDI clock
          console.log('Received MIDI clock ', message);
        }
    }
        
    const playChuckNote = (note: any) => {  
        // console.log('NOTE! ', note);    
        if (!note || !note.target ) { 
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
        console.log('DRUM MACH!');
        const ch = await chuckHook;
        loadChuck(ch);
    };

    // useEffect(() => {
    //     console.log("BPM IS ", bpm);
    // }, [bpm]);
    const midiBpmClockLatestArray = useRef<any>([]);
    const handleChangeBPM = (inputBPM: any) => {
        if (inputBPM) {
            console.log('Hit set bpm: ', inputBPM);
            // if (Date.now() - UTCofLatestCount.current < 100000) {
                // get std of array
                // midiBpmClockLatestArray.current
                midiBpmClockLatestArray.current.push(Number(inputBPM));
                setBpm(Number(inputBPM));

           
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

    const { position, separatorProps, setPosition, isDragging, endPosition } = useResizable({
        axis: 'x',
    })

    useEffect(() => {
        console.log("IS DRAGGING? ", isDragging);
    }, [isDragging]);

    useEffect(() => {
        console.log("end position: ", endPosition);
        setPosition(endPosition)
    }, [endPosition]);

    useEffect(() => {
        if (!position) setPosition(200);
        handleSetInputWrapperWid(position);
        console.log('what is pos? ', position);
        setVizWid(`calc(100vw - ${position}px)`);
    }, [position]);

    useEffect(() => {
        setWinWid(window.innerWidth);
        setWinHeight(window.innerHeight);
        console.log('IINNER WID WINDOW', window.innerWidth);
    }, [window, window.innerWidth, window.innerHeight]);

    const currentMicroTonalScale = (scale: any) => {
        let theScale;
        if (typeof scale === 'string') {
            theScale = '12-19';
        } else {
            console.log('and what is scale??? ', scale);
            theScale = scale.value;
        }
        console.log('ok scale is coming through: ', scale.value);
        setMicrotonalScale(scale.value);
    };


    useEffect(() => {
        console.log("###1: ", lastFileUpload);
        if (!lastFileUpload) return;
        // if (!chuckHook) return;
        axios.get('http://localhost:8080/').then((res: any) => {
            console.log('INITIAL RETURN: ', res.data.data);
            res.data.data.map((f:any) => {
                console.log('what the fuck ', f);
                // setLastFileUpload(f.name);
                if (f.name && lastFileUpload !== f.name) {
                    setUploadedFileName(f.name);
                    playUploadedFile(f.name);
                    //   setLastFileUpload(f.name);
                    console.log('HEYA FFF ', f);
                }
            });
        // setLastFileUpload(res.data.fileName)
        });
    },[lastFileUpload])

    // const connect = async () => {
    useEffect(() => {
            if (!Object.keys(midiAccessHook)) return;
            console.log('GET HOOK!!! ', midiAccessHook);
            
            MIDIVal.connect()
            .then(async (access: any) => {
                await access;
                if (!access || !access.inputs.values()) {
                    console.warn("No inputs yet");
                    return;
                } else {
                    // const vals: any = access.inputs.values()[0];
                    const vals: any = [];
                    access.inputs.forEach((input: any) => {
                        vals.push(input);
                        console.log(input.name); /* inherited property from MIDIPort */
                        input.onmidimessage = (message) => {
                          console.log(message.data);
                          getMIDIMessage(message);
                        };
                      });
                    const inputs: IMIDIInput = await new MIDIValInput(vals[0], {
                        computeClockTempo: true, // needs to be set on initialisation to make sure MIDIVal computes it.
                    });
                    console.log('HEY HEY HEY INPUTS: ', inputs);
                    if (!inputs) return;
                    // const input = inputs.input;
                    console.log('YO YO YO GOT THIS INPUT: ', inputs);
                    
                    inputs.onClockStart(() => {
                        console.log('MIDI Clock Started');
                    });

                    inputs.onClockStop(() => {
                        console.log('MIDI Clock Stoped');
                    });

                    inputs.onClockContinue(() => {
                        console.log('MIDI Clock Continued');
                    });

                    inputs.onClockPulse(async () => {
                        // console.log('Pulse');
                        // console.log('woooo haAAAAAAAAA ********* ! ', inputs.tempo);
                        const tempo: number = Number(inputs.tempo);
                        // console.log(typeof tempo);
                        // console.log('tpo: ', tempo);
                        // console.log('sanity check@! ', midiBpmClockLatestArray.current);

                        // midiBpmClockLatestArray.current.filter((i: any) => {
                        //     return Math.abs(i - mean) < stdDev
                        // });
                        const stdDev = standardDeviation(midiBpmClockLatestArray.current)
                        const mean = midiBpmClockLatestArray.current.reduce((acc, val) => acc + val, 0) / midiBpmClockLatestArray.current.length;
                        console.log('what are stddev & mean? ', stdDev, mean);
                        // console.log('THIS IS ONLY A TEST! ', midiBpmClockLatestArray.current);
                        const lightFilter = Math.abs(Number(tempo) - bpm) < stdDev;
                        console.log('light filt? ', lightFilter)
                        if (typeof tempo === 'number') {
                            // if (Date.now() - UTCofLatestCount.current % 1000 === 0) {
                                console.log('just checking ', UTCofLatestCount.current, Date.now() - UTCofLatestCount.current)
                                midiBpmClockLatestArray.current.push(Number(tempo));
                                setBpm(Number(tempo));
                            // } else {
                            //     console.log('pushing this! ', parseFloat(tempo).toFixed(3));
                            //     midiBpmClockLatestArray.current.push(parseFloat(Number(tempo)).toFixed(3));
                            // }
                            // setBpm(parseFloat(tempo).toFixed(3));
                        }
                    });

                    // inputs[0].input.onmidimessage = getMIDIMessage(message);
                    const stdDev = standardDeviation(midiBpmClockLatestArray.current)
                    const mean = midiBpmClockLatestArray.current.reduce((acc, val) => acc + val, 0) / midiBpmClockLatestArray.current.length;
                    console.log('what are stddev & mean? ', stdDev, mean);
                }
            })

            
    },[midiAccessHook]);

    const handleSelectedSideNavItem = (item: string) => {
        if (item === "KeyToggle") {
            setIsGeneralKeyboard(!isGeneralKeyboard);
        } else {
            if (isPopupOpen) {
                setIsPopupOpen(false);
            } else {
                setIsPopupOpen(true);
            }
            
            setSelectedSideNavItem(item);
        }
        if (item === 'Sequence') {
            setVizComponent(1);
        } else {
            setVizComponent(0);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            {/* // this is the popover with chord & scale info (move into separate file) */}
            <Box sx={{ display:'flex', flexDirection: 'column', paddingTop: '12rem'}}>
                <Button onClick={(e) => handleSelectedSideNavItem('Loop')}>Loop</Button>
                <Button onClick={(e) => handleSelectedSideNavItem('Sequence')}>Sequence</Button>
                <Button onClick={(e) => handleSelectedSideNavItem('Scale')}>Scale</Button>
                <Button onClick={(e) => handleSelectedSideNavItem('Instrument')}>Instrument</Button>
                <Button onClick={(e) => handleSelectedSideNavItem('Effects')}>Effects</Button>
                <Button onClick={(e) => handleSelectedSideNavItem('KeyToggle')}>Toggle Key</Button>

                <Box id="uploadedFilesUl" style={{zIndex: 10000, marginTop: "4rem", display:"flex", flexDirection: "column", overflowY: 'scroll'}}>
                {
                    uploadedFiles && (
                        uploadedFiles.map((f: any) => {
                            return ( <Button key={f.name} sx={{backgroundColor:'secondary.main', color: '#ffffff'}} onClick={() => playUploadedFile(f.name)}>{f.name}</Button>)
                        })
                    )
                }
                </Box>

            </Box>

            <Grid  
                ref={containerRef} 
                {...separatorProps} 
                className="left-block" 
                sx={{
                    position: 'absolute', 
                    boxSizing: "border-box", 
                    // width: position || '100vw', 
                    display: isPopupOpen ? "flex" : "none",
                    height: selectedSideNavItem === "Effects" ? '100vh': '',
                    top: selectedSideNavItem === "Effects" ? '0' : '25vh',
                   // bottom: selectedSideNavItem === "Effects" ? '0' : '25vh',
                    // width: selectedSideNavItem === "Effects" ? '25vw' : '50vw',
                    left: selectedSideNavItem === "Effects" ? '75vw' : '25vw',
                    right: selectedSideNavItem === "Effects" ? '0': '25vw',
                    zIndex: 10,
                    backgroundColor: 'secondary.main'
                }}
            >

                <Box style={{zIndex: 1000}}>
                    {
                        selectedSideNavItem === "Sequence" && vizComponent === 1
                        ?
                        <SequencerTools 
                            handleAddStep={handleAddStep}
                            nextTreeItem={nextTreeItem}
                            updateNextTreeItem={updateNextTreeItem}
                            handleRemoveStep={handleRemoveStep}
                            handleDrumMachine={handleDrumMachine}
                        />
                        :
                        selectedSideNavItem === "Loop" 
                        ?  
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
                        />
                        : <></>
                    }
                </Box>
                {
                    selectedSideNavItem === "Scale" 
                    ?
                    <Box sx={{
                        position: 'absolute',
                        zIndex: '1',
                        height: '2rem',
                        // width: '100%',
                        top: '0rem',
                        right: '0rem',
                        justifyContent: 'center',
                    }}>
                        <CustomAriaLive selectRef={selectRef} tune={tune} currentMicroTonalScale={currentMicroTonalScale} />
                        <MingusPopup 
                            submitMingus={submitMingus}
                            audioKey={audioKey}
                            octave={octave}
                            audioScale={audioScale}
                            audioChord={audioChord}
                            handleChangeScale={handleChangeScale}
                            handleChangeChord={handleChangeChord}
                        />
                    </Box>

          
                        : <></>
                }        
                {
                    // chuckHook && Object.values(chuckHook).length && instrumentsVisible && selectedSideNavItem === "Instrument"
                    selectedSideNavItem === "Instrument"
                    ?
                    <FormControl sx={{left: 0, width: "100%"}} id="instrumentBuilderWrapper">
                        <FormLabel sx={{ color: 'primary.contrastText', fontSize: "12px", paddingRight: "16px" }} id="controlled-radio-buttons-group-instruments">Instruments</FormLabel>
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

                {/* this is the 4th row down in side control bar -- PERFECT CASE FOR REUSABLE COMPONENT */} 
                {selectedSideNavItem === "Effects" 
                    ?
                    <EffectsControls 
                        playingInstrument={playingInstrument}
                        valueReed={valueReed}
                        setValueReed={setValueReed}
                        valueNoiseGain={valueNoiseGain}
                        setValueNoiseGain={setValueNoiseGain}
                        valueVibratoFreq={valueVibratoFreq}
                        setValueVibratoFreq={setValueVibratoFreq}
                        valueVibratoGain={valueVibratoGain} 
                        setValueVibratoGain={setValueVibratoGain}
                        valuePressure={valuePressure}
                        setValuePressure={setValuePressure}
                        valueReverbGain={valueReverbGain}
                        setValueReverbGain={setValueReverbGain}
                        valuePickupPosition={valuePickupPosition}
                        setValuePickupPosition={setValuePickupPosition}
                        valueSustain={valueSustain}
                        setValueSustain={setValueSustain}
                        valueStretch={valueStretch}
                        setValueStretch={setValueStretch}
                        valuePluck={valuePluck}
                        setValuePluck={setValuePluck}
                        valueBaseLoopGain={valueBaseLoopGain}
                        setValueBaseLoopGain={setValueBaseLoopGain}
                        valueReverbMix={valueReverbMix}
                        setValueReverbMix={setValueReverbMix}
                        valueMoogGain={valueMoogGain}
                        setValueMoogGain={setValueMoogGain}
                        valueFilterSweepRate={valueFilterSweepRate}
                        setValueFilterSweepRate={setValueFilterSweepRate}
                        valueLfoSpeed={valueLfoSpeed}
                        setValueLfoSpeed={setValueLfoSpeed}
                        valueLfoDepth={valueLfoDepth}
                        setValueLfoDepth={setValueLfoDepth}
                        valueFilterQ={valueFilterQ}
                        setValueFilterQ={setValueFilterQ}
                        valueAftertouch={valueAftertouch}
                        setValueAftertouch={setValueAftertouch}
                        valueModSpeed={valueModSpeed}
                        setValueModSpeed={setValueModSpeed}
                        valueModDepth={valueModDepth}
                        setValueModDepth={setValueModDepth}
                        valueOpMode={valueOpMode}
                        setValueOpMode={setValueOpMode}
                        valueBodySize={valueBodySize}
                        setValueBodySize={setValueBodySize}
                        valuePluckPos={valuePluckPos}
                        setValuePluckPos={setValuePluckPos}
                        valueStringDamping={valueStringDamping}
                        setValueStringDamping={setValueStringDamping}
                        valueStringDetune={valueStringDetune}
                        setValueStringDetune={setValueStringDetune}
                        valueStiffness={valueStiffness}
                        setValueStiffness={setValueStiffness}
                        valueAperture={valueAperture}
                        setValueAperture={setValueAperture}
                        valueBlowPosition={valueBlowPosition}
                        setValueBlowPosition={setValueBlowPosition}
                        valueControlOne={valueControlOne}
                        valueControlTwo={valueControlTwo}
                        setValueControlOne={setValueControlOne}
                        setValueControlTwo={setValueControlTwo}
                    />
                    : <></>
                }
            </Grid>

            <Grid className="right-block" sx={{overflow: "scroll", height: "100vh", width: "100vw", border: "solid red 5px" }}>
                {/* this is the viz area -- move into separate file & position relative */}

                {
                    createdFilesList.current && createdFilesList.current.length > 0 && (
                        <CreatedFilesPicker 
                            createdFilesList={createdFilesList.current}
                        />
                    )
                }
                <GlobalTickViz numeratorSignature={numeratorSignature} denominatorSignature={denominatorSignature} currentCount={currentCountRef.current} latestCount={latestCount} winWid={winWid} winHeight={winHeight} />
                <VizHeaderRow 
                    vizComponent={vizComponent}
                    vizItem={vizItem}
                    handleChangeDataVizControls={handleChangeDataVizControls}
                    handleToggleViz={handleToggleViz}
                    handleChangeInput={handleChangeInput}
                />

                {
                    isGeneralKeyboard
                    ?
                    <span id="microTonesParentSpan"style={{ 
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                        marginLeft: '0',     
                        // position: 'absolute',
                        top: '10vh',
                        left: '25vh', 
                        minHeight: isGeneralKeyboard ? '100vh' : '' }}>
                        {/* <HexbinKeyboard /> */}
                        <Hexbin 
                            width={winWid} 
                            height={winHeight} 
                            tune={tune} 
                            microtonalScale={microtonalScale} 
                            audioKey={audioKey} 
                            playChuckFromMicrotonal={playChuckFromMicrotonal}
                        />
                    </span>
                    :
                    <>
                        <Box sx={{position: isGeneralKeyboard ? "absolute" : "relative", width: "calc(100vw - 7rem);", height: "calc(100% - 13.5rem)", border: "1px solid purple" }} id="vizWrapper" >       
                            <ParentSize id="vizParentWrapper" key={newestSetting.name}>{( { width, height } ) =>
                                    vizComponent === 0 || vizItem === 0
                                    ?
                                        !isRealtime
                                        ?
                                        <RealtimeAudioInput width={winHeight} height={height} data={rtAudio} isRecProp={isRecProp} setTicksDatas={handleUpdateTicks} ticksDatas={ticksDatas} />
                                        :
                                        <Example width={winHeight} height={height} librosaData={librosaData} setTicksDatas={handleUpdateTicks} ticksDatas={ticksDatas} />
                                    :
                                        <Example2 key={newestSetting.name} width={winHeight} height={height} rawTree={newestSetting} handleUpdateRawTree={handleUpdateRawTree} currPosData={treeAtSelected} getLatestTreeSettings={getLatestTreeSettings} handleAddStep={handleAddStep} />
                                }
                            </ParentSize>
                        </Box>
                        <Box width={window.innerWidth} height={window.innerHeight}>
                            <Keyboard 
                                chuckHook={chuckHook}
                                keysVisible={keysVisible}
                                keysReady={keysReady}
                                organizeRows={organizeRows}
                                organizeLocalStorageRows={organizeLocalStorageRows}
                                playChuckNote={playChuckNote}
                                compare={compare}
                                keyWid={vizWid}
                                is17EqualTemperament={is17EqualTemperament}
                            />

                        </Box> 
                    </>
                }

            </Grid>
            </ThemeProvider>

    )
} 

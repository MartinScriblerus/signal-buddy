import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import CreateChuck from './components/CreateChuck';
import axios from 'axios';
import { IGame } from './interfaces/IGame';
import { Button, Box, Grid, ThemeProvider, createTheme, Input, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { set, useForm } from "react-hook-form";
import StartButton from "./components/StartButton";
import TitilliumWeb from './TitilliumWeb-Regular.ttf';
import MicNoneIcon from '@material-ui/icons/MicNone';

const theme = createTheme({
  typography: {
    fontFamily: 'monospace',
  },
  palette: {
    background: {
      // paper: 'rgb(56, 64, 93)',
      paper: 'rgba(0,0,0,0.91)',
    },
    text: {
      primary: '#f6f6f6',
      secondary: 'rgb(56, 64, 93)',
    },
    primary: {
      main: '#f6f6f6',
    }
  },
});
declare module "*.module.css";
declare module "*.module.scss";

interface MediaStreamAudioSourceNode extends AudioNode {
    
}

// interface MediaElementAudioSourceNode extends AudioNode {
//   createAnalyser(): AnalyserNode;
// }

// interface MediaStreamAudioDestinationNode extends AudioNode {
//     stream: MediaStream;
// }

function App() {
  const [audioReady, setAudioReady] = useState(false);
  const [datas, setDatas] = useState<any>([]);
  const [isRecordingMic, setIsRecordingMic] = useState(false);
  const [fileControlsVisible, setFileControlsVisible] = useState(false);
  const [writableHook, setWritableHook] = useState({});
  const [audioInputWrapperVisible, setAudioInputWrapperVisible] = useState(false);
  const [rtAudio, setRtAudio] = useState<any>(null);
  const [recordedFileToLoad, setRecordedFileToLoad] = useState(false);
  const deviceLabels = useRef<any>([]);
  const audioInputDeviceId = useRef<any>(null);

  const [deviceLabelsOpen, setDeviceLabelsOpen] = useState(false);
 
  const { register, handleSubmit } = useForm();
  const uploadedFilesRef: any = useRef([]);
  const midiNotesOn: any = useRef([]);
  const midiNotesOff: any = useRef([]);
  const suggestedNameRef = useRef<string>("");

  const nav: any = navigator;
  const [data, setData] = useState<any>([]);

  const onSubmit = async(files: any) => {
    console.log("WHAT ARE FILES? ", files);
    console.log('data out!!! ', files.file[0]);
    const file = files.file[0];
    console.log('FILE: ', file)
    uploadedFilesRef.current.push(file);
    const fileName = files.file[0].name; 
    let data = new FormData();
    const filename: any = await fileName.replaceAll(' ', '_').split('.')[0];
    data.append(filename, file);

    axios.post(`${process.env.REACT_APP_FLASK_API_URL}/onsets/${filename}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(({data}) => setDatas(data));
  }

  function handleChangeFileControls() {
    setFileControlsVisible(!fileControlsVisible);
  }

  function handleUpdateInputDevice(label: string, deviceId: string, selected: boolean) {
    if (deviceId === audioInputDeviceId.current) {
      const oldSel = document.getElementsByClassName("selected");
      if (oldSel.length > 0) {
        oldSel[0].classList.remove("selected");
      }
      document.getElementById(`devicelistbtn_${deviceId}`)?.classList.add("selected");
    } else {
      //if ( document.getElementById(`devicelistbtn_${deviceId}`)?.classList.contains("selected")) {
        document.getElementById(`devicelistbtn_${deviceId}`)?.classList.remove("selected");
      //}
    }
  };

  async function handleAudioReady(audioReadyMsg: boolean) {
    if (audioReady === false && audioReadyMsg === true) {
      setAudioReady(true);
      handleChangeFileControls();
    } else {
      setAudioReady(false);
    }
  }

  const deviceList = deviceLabels.current.filter((a: any) => a.label.length > 0).map(
    (i:any, ind: number) => 
        <ListItemButton  style={{zIndex: 3, border: i.selected ? "solid 2px magenta" : "none"}} onClick={() => {audioInputDeviceId.current = i.deviceId; handleUpdateInputDevice(i.label, i.deviceId, i.selected)}} id={`devicelistbtn_${i.deviceId}`} key={`devicelistbtn_${i.label}`}><ListItemText key={`devicelisttxt_${i.label}`} primary={i.label} /></ListItemButton>
  )

  const handleChangeInput = () => {
    setAudioInputWrapperVisible(!audioInputWrapperVisible);
  };

  const isRecRef = useRef<boolean>();
  const deviceWrapper = useRef<any>(null);
  const createFileFormCurrentRecordedData = async (recordedData: Array<any>) => {
    const blob = new Blob(recordedData , {type: "audio/wav"});
    const file = new File( [ blob ], suggestedNameRef.current, { type: "audio/wav"} );
    let url = URL.createObjectURL(blob);
    let a: any = await document.createElement("a");
    a.style = "z-index: 1000; position: absolute; top: 0px; left: 0px; background: green";
    a.href = url;
    document.body.appendChild(a);
    console.log("CHECK THIS FILE! ", file);
    uploadedFilesRef.current.push(file);
    setRecordedFileToLoad(true);
    a.download = file;
  }
  
  useEffect(() => {
    if (!nav) return; 
    (async() => {
      const devices = await nav.mediaDevices.enumerateDevices();
      devices.filter((d:any) => d.kind === 'audioinput').map((i:any, ind: number) => {
      if (deviceLabels.current.map(f => f.label).indexOf(i.label) === -1) {
          deviceLabels.current.push({'label': i.label, 'deviceId': i.deviceId, 'selected': i.deviceId === audioInputDeviceId.current ? true : false });
        }
      });
    }) ();
  }, [nav, audioReady, audioInputDeviceId]);


  const stopTracks = async (recorder: any, stream: any) => {
    if (recorder instanceof MediaRecorder) {
      recorder.stop();
    }
    if (recorder.stream) {
      await recorder.stream.getTracks().forEach(async (track: any) => {
        console.log("STOPPINNG TRACK NOOW: ", track);
        await track;
        if (track) {
          track.stop();
        }
        track.enabled = false;
      });
    }

    // // Stop the stream.
    await stream.getTracks().forEach(async (track: any) => {
      await track;
      if (track) {
        track.stop();
      }
      track.enabled = false;
    });
    stream = null;
    recorder = null;
    suggestedNameRef.current = null;
  }

  const count = useRef(0);
  const interval_global = 100;
  let requestID;

       // Animation using requestAnimationFrame
      let start = Date.now();
      let barStart = start;

      function globalRequestAnimationTick() {
        const interval = Date.now() - start;
        requestID = requestAnimationFrame(globalRequestAnimationTick);
        if (interval - (barStart * count.current) > interval_global) {
          barStart = Date.now();
          count.current = count.current + 1;
          if (!isRecRef.current) {
              cancelAnimationFrame(requestID);
          }
          
        }
      }
      





  const runAnalyserNode = async (analyser: AnalyserNode) => {
    const bufferFftSize = analyser.fftSize;
    const bufferLength = analyser.frequencyBinCount;
    const dataArrayFreqByte = new Uint8Array(bufferLength);
    const dataArrayFft = new Float32Array(bufferFftSize);
    const dataArrayFreqFloat = new Float32Array(bufferLength);
    analyser.getFloatFrequencyData(dataArrayFft);
    // analyser.getByteFrequencyData(dataArrayFreqByte);
    // analyser.getByteTimeDomainData(dataArrayFreqByte);
    analyser.getFloatTimeDomainData(dataArrayFreqFloat);
    // new Float32Array(1024);
    // console.log("YO ANALYSER => ", analyser);
    const analysisObj = {
      bufferFftSize:  bufferFftSize,
      bufferLength: bufferLength,
      // dataArrayFreqByte: dataArrayFreqByte,
      dataArrayFft: dataArrayFft,
      dataArrayFreqFloat: dataArrayFreqFloat,
      analyser: analyser,
    }
    return analysisObj;
  };

  const handleRecordAudio = async () => {
    let recorder;
    let stream;
    let writable;
    let recordedData = [];

    let audio = new Audio();
    const constraints = {
      audio: {muted: true, deviceId: audioInputDeviceId.current ? audioInputDeviceId.current : deviceLabels.current[0].deviceId},
      video: false
    };
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    audio.srcObject = stream;
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.smoothingTimeConstant = 0.2;
    analyser.fftSize = 2048;

    recorder = new MediaRecorder(stream);
    recorder.onstop = createFileFormCurrentRecordedData(recordedData);
    isRecRef.current = !isRecRef.current;

    if (!suggestedNameRef.current) {
      const suggestedName = "microphone-recording2.wav";
      suggestedNameRef.current = suggestedName;
      const handle = await window.showSaveFilePicker({ suggestedName });

      writable = await handle.createWritable();
      setIsRecordingMic(true);

      if (recorder.state !== "recording" && isRecRef.current === true) {
        (async () => {
          recorder.addEventListener("dataavailable", async (event) => {
            // Write chunks to the file.
            try {
              if (event.data && recorder.state !== "inactive" && recorder.state !== "closed") {
                writable.write(event.data);
              }
              recordedData.push(event.data);
            } catch (error) {
              console.log("ERROR: ", error);
            }
            const arrayBuffer = await new Response(new Blob(recordedData)).arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            const channelData = audioBuffer.getChannelData(0);
            // console.log("CHAN DATA: ", channelData)
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            const gain: any = audioContext.createGain();
            gain.value = 1;
            source.connect(analyser);
            source.start();
            const analysisObj = await runAnalyserNode(analyser);
            setRtAudio(analysisObj);
            if (isRecRef.current === false) {
              if (recorder.state !== "inactive" && recorder.state !== "closed") {
                writable.close();
                setWritableHook(writable);
              }
              stopTracks(recorder, stream);              
            }
          });
          /* this defines the start point - call when you want to start your audio to blob conversion */
          recorder.start(1000);
        }) ();
      } else {
        writable.close();
      }
    } else {
      isRecRef.current = false;
      setIsRecordingMic(false);
      stopTracks(recorder, stream);
    }
  }

  const handleRecordedFileLoaded = () => {
    setRecordedFileToLoad(false);
  }

  return (
    <ThemeProvider theme={theme}>
      <Grid sx={{fontFamily: 'TitilliumWeb-Regular', backgroundColor: 'background.paper', height: '100vh', maxHeight: '100vh', maxWidth: "100vw", overflow: 'hidden'}} className="App">
        <Box sx={{width: '100%', height: '100%'}}>
          {!audioReady  
          ? // this is the start screen
            <StartButton 
              handleAudioReady={(e) => handleAudioReady(e)}
            />
          : // this is the top row of side control bar (see notes below)
            <Box sx={{top: "0", bottom: "0", left: "0", right: "0", display: "flex", flexDirection: "row"}}>
              
              {/* this is the very top of left nav (make this one special in its style / positioning) */}
              <Box id="fileManagerWrapper" sx={{left: 0, top: 0, height: "12vh", background: 'background.paper', border: "1px solid yellow"}}>
                {audioReady && fileControlsVisible && (
                  <Box id="inputFileWrapper" sx={{color: 'text.primary', borderColor: "solid 10px green"}}>
                    <form style={{display: "flex", width: "100%", flexDirection: "column"}} onSubmit={handleSubmit(onSubmit)}>
                      <Input
                        id="inputBtnForFile"
                        sx={{width: "100%"}}
                        className="midSizeButtons"
                        onChange={(e) => {onSubmit((e.target as HTMLInputElement).files)}} 
                        type="file" 
                        {...register("file") } />
                      <Input 
                        id="inputBtnForSubmit" 
                        sx={{width: "100%"}}
                        type="submit" 
                        className="midSizeButtons"
                      />
                    </form>
                    <Button id="startMicrophoneButton" onClick={handleRecordAudio}>
                      <MicNoneIcon />
                      {
                      !isRecordingMic 
                          ? "START REC"
                          : "STOP REC"
                      }
                    </Button>
                  </Box>
                )}
              </Box>

              <CreateChuck
                audioReady={audioReady} 
                datas={datas}
                uploadedFiles={uploadedFilesRef.current}
                writableHook={writableHook}
                handleChangeInput={handleChangeInput}
                rtAudio={rtAudio}
                isRecProp={isRecordingMic}
                recordedFileToLoad={recordedFileToLoad}
                recordedFileLoaded={handleRecordedFileLoaded}
              />

              {/* This is a free-floating popup for audio inputs (move out of this div) */}
              {/* <List ref={deviceWrapper} id="deviceInputWrapper" sx={{position: "relative", maxHeight: "24vh", top: "calc(%100 - 38rem)", backgroundColor: 'background.paper', borderRadius: "0rem", zIndex: "300", border: "1px solid pink", overflowY: "scroll", display: audioInputWrapperVisible ? "inline-block": "none !important"}}>
                {deviceList}
              </List> */}
            </Box>
          }
                        <List ref={deviceWrapper} id="deviceInputWrapper" sx={{position: "relative", maxHeight: "24vh", top: "calc(%100 - 38rem)", backgroundColor: 'background.paper', borderRadius: "0rem", zIndex: "300", border: "1px solid pink", overflowY: "scroll", display: audioInputWrapperVisible ? "inline-block": "none !important"}}>
                {deviceList}
              </List>
        </Box>
      </Grid>
    </ThemeProvider>
  );
}

export default App;

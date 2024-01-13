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
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          // backgroundColor: '#FAACA8',
          backgroundImage: `linear-gradient(19deg, #FAACA8 0%, #DDD6F3 100%)`,
        },
      },
    },
  },
  palette: {
    primary: {
      main: 'rgba(30,34,26,0.96)',
      // light: will be calculated from palette.primary.main,
      // dark: will be calculated from palette.primary.main,
      contrastText: '#f5f5f5', //
      // contrastText: will be calculated to contrast with palette.primary.main
    },
    secondary: {
      main: 'rgba(30,34,26,0.96)',
      light: ' rgba(17,110,246,0.96)',
      // dark: will be calculated from palette.secondary.main,
      contrastText: '#000000',
    },
    background: {
      // paper: 'rgb(0, 49, 28, 0.19)',
      paper: 'rgba(51,108,214, 0.88)',
    },
  //  info: '#f5f5f5',
  //     secondary: 'rgba(0, 224, 204, 0.88)',
  //   },
  //   primary: {
  //     main: 'rgba(17,110,224,0.88)',
  //   }
    }
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
  const [inputWrapperWid, setInputWrapperWid] = useState<number>(200);
  const [lastFileUpload, setLastFileUpload] = useState('');

  const deviceLabels = useRef<any>([]);
  const inputFileWrapperRef = useRef<any>(null);
  const audioInputDeviceId = useRef<any>(null);

  const [deviceLabelsOpen, setDeviceLabelsOpen] = useState(false);
 
  const { register, handleSubmit } = useForm();
  const uploadedFilesRef: any = useRef([]);
  const midiNotesOn: any = useRef([]);
  const midiNotesOff: any = useRef([]);
  const suggestedNameRef = useRef<string>("");

  const nav: any = navigator;

  const onSubmit = async(files: any) => {
    console.log("WHAT ARE FILES? ", files);
    console.log('data out!!! ', files.file[0]);
    
    const file = files.file[0];
    console.log('FILE: ', file);

    uploadedFilesRef.current.push(file);
    const fileName = files.file[0].name; 
    let data = new FormData();
    const filename: any = await fileName.replaceAll(' ', '_').split('.')[0];
    data.append(filename, file);

    try {
      axios.post('http://localhost:8080/upload_files', data).then((res: any) => {
        console.log('NODE RETURN: ', res);
        setLastFileUpload(res.data.fileName)
      });
    } catch (e: any) {
      console.log("c%ERROR IN NODE: ", e, "color:red;")
    }
    axios.post(`${process.env.REACT_APP_FLASK_API_URL}/onsets/${filename}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(({data}) => { setDatas(data); return; });
  }

  useEffect(() => {
    (async() => {
      console.log('madde it here');
      if (!inputFileWrapperRef.current) return;
      await inputFileWrapperRef.current.click();
    })();
  }, [datas]);

  function handleChangeFileControls() {
    setFileControlsVisible(!fileControlsVisible);
  }


  
  const handleUpdateInputDevice = (label: string, deviceId: string, selected: boolean) => {
    console.log(`In handleUpdateInputDevice: ${label} // ${deviceId} // ${selected}`);
    if (deviceId === audioInputDeviceId.current) {
      const oldSel = document.getElementsByClassName("selected");
      if (oldSel.length > 0) {
        oldSel[0].classList.remove("selected");
      }
      document.getElementById(`devicelistbtn_${deviceId}`)?.classList.add("selected");
    } else {

        document.getElementById(`devicelistbtn_${deviceId}`)?.classList.remove("selected");

    }
  };

  async function handleAudioReady(audioReadyMsg: boolean) {
    if (audioReady === false && audioReadyMsg === true) {
      setAudioReady(true);
      handleChangeFileControls();
    } else {
      setAudioReady(false);
    }
  };

  const deviceList = deviceLabels.current && (deviceLabels.current.filter((a: any) => a.label.length > 0).map(
    (i:any, ind: number) => 
        <ListItemButton key={`devicelistbtn_${i.label}`} style={{zIndex: 3, border: i.selected ? "solid 2px magenta" : "none"}} onClick={() => {audioInputDeviceId.current = i.deviceId; handleUpdateInputDevice(i.label, i.deviceId, i.selected)}} id={`devicelistbtn_${i.deviceId}`}>
          <ListItemText key={`devicelisttxt_${i.label}`} primary={i.label} />
          </ListItemButton>
  ))

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
      

      useEffect(() => {
 
        axios.get('http://localhost:8080/').then((res: any) => {
          if (!res.data.data) return;

          res.data.data.map((f:any) => {
            // setLastFileUpload(f.name);
            if (f.name && lastFileUpload !== f.name) {
              if(uploadedFilesRef.current.length === 0 || uploadedFilesRef.current.map((n:any) => n.name).indexOf(f.name) === -1){
                uploadedFilesRef.current.push(f);
              }
              console.log('setting last file upload');
            }
          })
          // setLastFileUpload(res.data.fileName)
        });
      },[audioReady]);



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

  const handleSetInputWrapperWid = (wid: number) => {
    if (!wid) {
      setInputWrapperWid(200);
    } else {
      setInputWrapperWid(wid);
    }
  } 

  const handleAutoFile = () => {
    inputFileWrapperRef.current.click();
  }

  return (
    <ThemeProvider theme={theme}>
      <Grid id="mainGrid" sx={{fontFamily: 'TitilliumWeb-Regular', height: '100vh', maxHeight: '100vh', maxWidth: "100vw", overflow: 'hidden'}} className="App">
        <Box sx={{width: '100%', height: '100%'}}>
          {!audioReady  
          ? // this is the start screen
            <StartButton 
              handleAudioReady={(e) => handleAudioReady(e)}
            />
          : // this is the top row of side control bar (see notes below)
            <Box sx={{top: "0", bottom: "0", left: "0", right: "0", display: "flex", flexDirection: "row"}}>
              
              {/* this is the very top of left nav (make this one special in its style / positioning) */}
              {/* <Box id="fileManagerWrapper" sx={{position: "absolute", left: 0, top: 0, width: `${inputWrapperWid}px`, background: 'background.paper', zIndex: "10000", boxShadow: "4px 4px 1px 1px rgba(255, 255, 255, .2)", border: "1px solid yellow"}}> */}
              <Box id="fileManagerWrapper" sx={{position: "absolute", left: 0, top: 0, width: `6rem`, background: 'background.paper', zIndex: "10000", boxShadow: "4px 4px 1px 1px rgba(255, 255, 255, .2)", border: "1px solid yellow"}}>
                {audioReady && fileControlsVisible && (
                  <Box id="inputFileWrapperOuter" sx={{color: 'primary.contrastText', borderColor: "primary.main"}}>
                    <form style={{display: "flex", width: "100%", flexDirection: "column"}} onSubmit={handleSubmit(onSubmit)}>
                      <Input
                        id="inputBtnForFile"
                        sx={{color: 'secondary.contrastText', width: "100%"}}
                        className="midSizeButtons"
                        onClick={(e) => console.log('CHRIST ', e)}
                        onChange={(e: any) => {
                            // e.stopPropagation();
                            // e.preventDefault();
                            onSubmit((e.target as HTMLInputElement).files);
                            // handleAutoFile();
                          } 
                        }
                        type="file" 
                        {...register("file") 
                      } />
                      <Input 
                        id="inputFileWrapper"
                        ref={inputFileWrapperRef}
                        sx={{color: 'secondary.contrastText', width: "100%"}}
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
                handleSetInputWrapperWid={handleSetInputWrapperWid}
                lastFileUpload={lastFileUpload}
              />
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

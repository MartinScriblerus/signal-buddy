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

function App() {
  const [audioReady, setAudioReady] = useState(false);
  const [datas, setDatas] = useState<any>([]);
  const [isRecordingMic, setIsRecordingMic] = useState(false);
  const [fileControlsVisible, setFileControlsVisible] = useState(false);
  const [writableHook, setWritableHook] = useState({});
  const [audioInputWrapperVisible, setAudioInputWrapperVisible] = useState(false);

  const deviceLabels = useRef<any>([]);

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

  async function handleAudioReady(audioReadyMsg: boolean) {
    if (audioReady === false && audioReadyMsg === true) {
      setAudioReady(true);
      handleChangeFileControls();
    } else {
      setAudioReady(false);
    }
  }

  const deviceList = deviceLabels.current.map(
    (i:any, ind: number) => 
        <ListItemButton key={`devicelistbtn_${i}`}><ListItemText key={`devicelisttxt_${i}`} primary={i} /></ListItemButton>
  )

  const handleChangeInput = () => {
    setAudioInputWrapperVisible(!audioInputWrapperVisible);
  };

  // const handleStopRecording = (recorder: any, stream: any) => {
  //   if (recorder) {
  //     recorder.stop();
  //     console.log('STOPPING RECORDER: ', recorder);
  //     recorder.removeEventListener("dataavailable", async (event: any) => {        
  //     });
  //     // Close the file when the recording stops. 
  //     if (recorder.stream) {
  //       recorder.stream.getTracks().forEach(async (track: any) => {
  //         console.log("STOPPINNG TRACK: ", track);
  //         await track;
  //         if (track) {
  //           track.stop();
  //         }
  //         track.enabled = false;
  //       });
  //     }
  //   }

  //   if (stream && stream.getTracks()) { 
  //     // Stop the stream.
  //     stream.getTracks().forEach(async (track: any) => {
  //       console.log("STOPPINNG TRACK: ", track);
  //       await track;
  //       if (track) {
  //         track.stop();
  //       }
  //       track.enabled = false;
  //     });
  //   }
  //   stream = null;
  //   recorder = null;
  //   // setIsRecordingMic(false);  
  // }
  

  const isRecRef = useRef<boolean>();
  const deviceWrapper = useRef<any>(null);
  const createFileFormCurrentRecordedData = async (recordedData: Array<any>) => {
    const blob = new Blob(recordedData , {type: "audio/wav"});
    const file = new File( [ blob ], suggestedNameRef.current, { type: "audio/wav"} );
    /* then upload oder directly download your file / blob depending on your needs */

    let url = URL.createObjectURL(blob);
    let a: any = await document.createElement("a");
    a.style = "z-index: 1000; position: absolute; top: 0px; left: 0px; background: green";
    a.href = url;
    document.body.appendChild(a);
    a.download = file;
  }
  
  useEffect(() => {
    if (!nav) return; 
    (async() => {
      const devices = await nav.mediaDevices.enumerateDevices();
      console.log("devices?>??? ", devices);
      devices.filter((d:any) => d.kind === 'audioinput').map((i:any, ind: number) => {
        
        console.log('YO I: ', i.label)

        if (deviceLabels.current.indexOf(i.label) === -1) {
           deviceLabels.current.push(i.label);
        }
      });
      console.log('WHAT ARE DDEVICES> ', deviceLabels.current);
    }) ();
  }, [nav, audioReady]);



  const handleRecordAudio = async () => {
    let recorder;
    let stream;
    let writable;
    let recordedData = [];

    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorder = new MediaRecorder(stream);
    recorder.onstop = createFileFormCurrentRecordedData(recordedData);
    isRecRef.current = !isRecRef.current;

    if (!suggestedNameRef.current) {
      const suggestedName = "microphone-recording2.wav";
      suggestedNameRef.current = suggestedName;
      const handle = await window.showSaveFilePicker({ suggestedName });

      writable = await handle.createWritable();
    
      // Start recording.
      setIsRecordingMic(true);
      if (recorder.state !== "recording" && isRecRef.current === true) {
        (async () => {
          recorder.addEventListener("dataavailable", async (event) => {
            // Write chunks to the file.
            if (recorder.state !== "inactive" && recorder.state !== "closed") {
              writable.write(event.data);
            }
            recordedData.push(event.data);
            if (isRecRef.current === false) {
              if (recorder.state !== "inactive" && recorder.state !== "closed") {
                writable.close();
                setWritableHook(writable);
              }
              recorder.stop();

              if (recorder.stream) {
                recorder.stream.getTracks().forEach(async (track: any) => {
                  console.log("STOPPINNG TRACK: ", track);
                  await track;
                  if (track) {
                    track.stop();
                  }
                  track.enabled = false;
                });
              }

              // Stop the stream.
              stream.getTracks().forEach(async (track: any) => {
                console.log("STOPPINNG TRACK: ", track);
                await track;
                if (track) {
                  track.stop();
                }
                track.enabled = false;
              });
              isRecRef.current = false;
              return;
            }
          });
          /* this defines the start point - call when you want to start your audio to blob conversion */
          recorder.start(1000);
        }) ();
      } else {
        writable.close();
        // setWritableHook(writable);
      }
    } else {
      isRecRef.current = false;
      setIsRecordingMic(false);
      if (recorder instanceof MediaRecorder) {
        recorder.stop();
      }
      if (recorder.stream) {
        await recorder.stream.getTracks().forEach(async (track: any) => {
          console.log("STOPPINNG TRACK: ", track);
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
  }

  useEffect(() => {
    console.log('WRITABLE HOOK CHANGED IN APP! ', writableHook);
  }, [writableHook])

  return (
    <ThemeProvider theme={theme}>
      <Grid sx={{fontFamily: 'TitilliumWeb-Regular', backgroundColor: 'background.paper', height: '100vh', maxHeight: '100vh', maxWidth: "100vw", overflow: 'hidden'}} className="App">
        <Box sx={{width: '100%', height: '100%'}}>
          {!audioReady  
          ? 
            <StartButton 
              handleAudioReady={(e) => handleAudioReady(e)}
            />
          :
            <Box sx={{top: "0", bottom: "0", left: "0", right: "0", display: "flex", flexDirection: "row"}}>

              <Box id="fileManagerWrapper" sx={{left: 0, top: 0, height: "12vh", background: 'background.paper', border: "1px solid yellow"}}>
                {/* <Button onClick={handleChangeFileControls}>FILES</Button> */}
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
              />
              {/* <List ref={deviceWrapper} id="deviceInputWrapper" sx={{position: "relative", maxHeight: "24vh", background: 'background.paper', border: "1px solid blue", overflowY: "scroll", display: audioInputWrapperVisible ? "inline-block": "none !important"}}>
                    {deviceList}
              </List> */}
              <List ref={deviceWrapper} id="deviceInputWrapper" sx={{position: "relative", maxHeight: "24vh", top: "calc(%100 - 38rem)", backgroundColor: 'background.paper', borderRadius: "0rem", zIndex: "300", border: "1px solid pink", overflowY: "scroll", display: audioInputWrapperVisible ? "inline-block": "none !important"}}>
                {deviceList}
              </List>
            </Box>
          }
        </Box>
      </Grid>
    </ThemeProvider>
  );
}

export default App;

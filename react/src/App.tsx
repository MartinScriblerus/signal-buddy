import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import CreateChuck from './components/CreateChuck';
import axios from 'axios';
import { IGame } from './interfaces/IGame';
import { Button, Box, Grid, ThemeProvider, createTheme, Input } from '@mui/material';
import { useForm } from "react-hook-form";
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
  const { register, handleSubmit } = useForm();
  const uploadedFilesRef: any = useRef([]);
  const midiNotesOn: any = useRef([]);
  const midiNotesOff: any = useRef([]);

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

  const handleRecordAudio = async() => {
    // const audioCtx = await chuckHook.context;
    let recorder;
    let stream;
    console.log("NAV DEVICES ", navigator.mediaDevices);
    // Prompt the user to use their microphone.
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorder = new MediaRecorder(stream);
    if(!isRecordingMic) {          
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

  return (
    <ThemeProvider theme={theme}>
      <Grid sx={{fontFamily: 'TitilliumWeb-Regular', backgroundColor: 'background.paper', height: '100vh', maxHeight: '100vh', overflow: 'hidden'}} className="App">
        <Box>
          {!audioReady  
          ? 
            <StartButton 
              handleAudioReady={(e) => handleAudioReady(e)}
            />
          :
            <Box>
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

                {/* <Button id="startMicrophoneButton" onClick={handleRecordAudio}>
                    {
                    !isRecordingMic 
                        ? "START REC"
                        : "STOP REC"
                    }
                </Button> */}
              </Box>
              <CreateChuck
                audioReady={audioReady} 
                datas={datas}
                uploadedFiles={uploadedFilesRef.current}
              />
            </Box>
          }
        </Box>
      </Grid>
    </ThemeProvider>
  );
}

export default App;

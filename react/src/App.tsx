import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import CreateChuck from './components/CreateChuck';
// import { onMIDISuccess, onMIDIFailure } from './helpers/midiAlerts'; 
import axios from 'axios';
import { IGame } from './interfaces/IGame';
import { Button, Box } from '@mui/material';
import { useForm } from "react-hook-form";

declare module "*.module.css";
declare module "*.module.scss";

function App() {
  // const inputRef: any = useRef();
  const [audioReady, setAudioReady] = useState(false);
  const [datas, setDatas] = useState<any>([]);
  const [fileControlsVisible, setFileControlsVisible] = useState(false);
  const { register, handleSubmit } = useForm();
  // const [uploadedFiles, setUploadedFiles] = useState<any>([]);
  const uploadedFilesRef: any = useRef([]);
  // const [midiNotesOn, setMidiNotesOn] = useState([]);
  // const [midiNotesOff, setMidiNotesOff] = useState([]);
  // const midiNotesOn: any = useRef([]);
  // const midiNotesOff: any = useRef([]);

  // const nav: any = navigator;
  const game: IGame = {
    canvas: HTMLCanvasElement,
    key: "C:maj",
    midi: 'nav.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure)',
    theLibrosa: undefined,
    theChuck: undefined,
  };

//   let midi = null; // global MIDIAccess object

// const noteOn = (note: any, velocity: any) => {
//   console.log('NOTE ON! ', note);
//   console.log('VELOCITY: ', velocity);
//   midiNotesOn.current.push({note: note, velocity: velocity});
// } 

// const noteOff = (note: any) => {
//   console.log('NOTE OFF! ', note);
//   midiNotesOff.current.push({note: note});
// }

// function onMIDISuccess(midiAccess: any) {
//     console.log("MIDI ready!");
//     midi = midiAccess; // store in the global (in real usage, would probably keep in an object instance)
//     const inputs = midiAccess.inputs;
//     const outputs = midiAccess.outputs;
//     for (const input of midiAccess.inputs.values()) {
//       input.onmidimessage = getMIDIMessage;
//       console.log('what is MIDI?? ', input);
//     }
    
//     return midi;
//   }
  
// function onMIDIFailure(msg: any) {
//     console.error(`Failed to get MIDI access - ${msg}`);
//     return undefined;
// }

// function getMIDIMessage(message: any) {
//   const command = message.data[0];
//   const note = message.data[1];
//   const velocity = (message.data.length > 2) ? message.data[2] : 0; // a velocity value might not be included with a noteOff command
//   console.log('MIDI MSG!: ', message);
//   switch (command) {
//       case 144: // noteOn
//           if (velocity > 0) {
//               noteOn(note, velocity);
//               // console.log('note ', note);
//               // console.log('velocity ', velocity);
//           } else {
//               noteOff(note);
//           }
//           break;
//       case 128: // noteOff
//           noteOff(note);
//           // console.log('note ', note);
//           break;
//       // we could easily expand this switch statement to cover other types of commands such as controllers or sysex
//   }
// }
  
//   game.midi = nav.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure)

  const onSubmit = async(files: any) => {
    console.log("WHAT ARE FILES? ", files);
    console.log('data out!!! ', files.file[0]);
    const file = files.file[0];
   
    const reader = new FileReader();
    console.log('FILE: ', file)
    // const fileURL = reader.readAsDataURL(file);
    // console.log('FILE URL: ', fileURL)
    // setUploadedFiles((uploadedFiles) => [...uploadedFiles, file]);
    // uploadedFilesRef.current.push(file);
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

  async function handleAudioReady(audioReadyMsg: boolean) {
    if (audioReady === false && audioReadyMsg === true) {
      setAudioReady(true);
    } else {
      setAudioReady(false);
    }
  }

  function handleChangeFileControls() {
    setFileControlsVisible(!fileControlsVisible);
  }

  return (
    <div className="App">
        <>       
          {!audioReady && (<Box id="introClickBox">
              <Button className="startButton" onClick={()=> handleAudioReady(true)}>
                <span className="display-4 fw-bold">Signal Buddy</span>
              </Button>   
          </Box>)}
          <Button onClick={handleChangeFileControls}>FILES</Button>
          {audioReady && fileControlsVisible && (
          <Box id="inputFileWrapper">
            <form onSubmit={handleSubmit(onSubmit)}>
              <input
                onChange={(e) => {onSubmit(e.target.files)}} 
                type="file" 
                {...register("file") } />
              <input type="submit" />
            </form>
          </Box>
          )}
          <CreateChuck 
            audioReady={audioReady} 
            game={game} 
            datas={datas}
            uploadedFiles={uploadedFilesRef.current}
          />
        </>
    </div>
  );
}

export default App;

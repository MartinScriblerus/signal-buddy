import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import CreateChuck from './components/CreateChuck';
import { onMIDISuccess, onMIDIFailure } from './helpers/midiAlerts'; 
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
  const { register, handleSubmit } = useForm();

  const nav: any = navigator;
  const game: IGame = {
    canvas: HTMLCanvasElement,
    key: "C:maj",
    midi: nav.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure),
    theLibrosa: undefined,
    theChuck: undefined,
  };
  
  const onSubmit = async(files: any) => {
    console.log('data out!!! ', files.file[0]);
    const file = files.file[0];
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

  return (
    <div className="App">
        <>       
          {!audioReady && (<Box id="introClickBox">
              <Button onClick={()=> handleAudioReady(true)}>
                <span className="display-4 fw-bold">Signal Buddy</span>
              </Button>   
          </Box>)}
          {audioReady && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <input 
              type="file" 
              {...register("file") } />
            <input type="submit" />
          </form>
          )}
          <CreateChuck audioReady={audioReady} game={game} datas={datas} />
        </>
    </div>
  );
}

export default App;

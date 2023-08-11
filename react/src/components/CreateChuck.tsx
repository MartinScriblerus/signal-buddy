import React, { useState, useEffect, useMemo, useRef} from 'react';
import { Box } from '@mui/material';
import Chuck from '../Chuck';
import axios, { AxiosResponse } from 'axios';
import { FLASK_API_URL } from '../helpers/constants';
var Blob = require('blob');

declare global {
    interface HTMLLIElement {
        data: Promise<AxiosResponse<any, any> | undefined>
    }
}

export default function CreateChuck(props: any) {
    const {game, datas} = props;
    // const [theChuck, setTheChuck] = useState<any>(undefined);
    const theChuck = useRef<any>(undefined);
    const [loaded, setLoaded] = useState(false);
    const [keysReady, setKeysReady] = useState(false);
    const ranChuckInit = useRef(false);
    ranChuckInit.current = false;
    console.log('datas: ', datas);
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
    const serverFilesToPreload = [
        {
            serverFilename: '/midi.ck',
            virtualFilename: 'midi.ck'
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
    ];

    if (!game.audioContext) {
        game.audioContext = new AudioContext();  
    }

    const loadChuck = async (theChuck: any) => {
        console.log('thos 1 ');
        theChuck.loadFile('readData.ck').then(async () => {
            console.log('thos 1 ');
            await theChuck.loadFile('readData.txt').then(async () => {
                console.log('thos 2 ');
                theChuck.runFile('readData.ck');
            });
        });
        setLoaded(true);
    }

    useMemo(() => {  
        if (ranChuckInit.current === true || theChuck.current) {
            return;
        }
        ranChuckInit.current = true;
        (async () => {
            if (theChuck.current || game['theChuck']) {
                return;
            }
            const theChuckTemp = await Chuck.init(serverFilesToPreload, game.audioContext, 2);
            game['theChuck'] = theChuckTemp;
            if (!theChuck.current) {
                loadChuck(theChuckTemp);
            }
            theChuck.current = theChuckTemp;
        })();
    }, [game]); 

    useEffect(() => {
        if (!theChuck.current || !datas) {
            return;
        }
        if (datas[0] && datas[0].data) {
            // TODO: write data to file
            // COME UP WITH A TIME DIVISION AND STRATEGY FOR CALLING CHUCK
            // ** HERE IS THE DATA **
            datas[0].data.times.map((time: any, idx: number) => {
                if (idx === datas[0].data.times.length - 1) {
                    console.log('DATA: ', datas[0].data);
                    return null;
                }
            })

        }
    }, [datas, theChuck.current, loaded]);
    
    const awaitNote = async (note: string) => {
        if(keysReady) {
            return;
        }
        return new Promise((resolve) => {
            const getVals = axios.get(`${FLASK_API_URL}/note/${note}`, requestOptions);
            resolve(getVals);
        }).then(async (res: any) => {
            return await res.data;
            setKeysReady(true);
        });
    };

    const playChuckNote = (note: any) => { 
        if (!note.target) { 
            return null;
        }
        const noteReady = note.target.attributes[3].value;
        theChuck.current.runCode(` SinOsc osc => dac; 0.2 => osc.gain; ${noteReady} => osc.freq; 3::second => now; `);
        return null;
    };

    const createKeys = () => {
        const octaves: Array<any> = [];
        for (let i = 0; i < 10; i++) {

            [`C${i}`, `C♯${i}`, `D${i}`, `D♯${i}`, `E${i}`, `F${i}`, `F♯${i}`, `G${i}`, `G♯${i}`, `A${i}`, `A♯${i}`, `B${i}`].forEach((note) => {
                (async () => {

                    const noteReady = await awaitNote(note);
                    const parsedNote = note.charAt(1) === '♯' ? note.slice(0, 2) + "-" + note.slice(2) : note.slice(0, 1) + "-" + note.slice(1);
                    const el: any = await document.getElementById(parsedNote);
                    if (el && !el['data-midiNote'] && !el['data-midiHz']) {
                        el.setAttribute('data-midiNote', await noteReady.midiNote);
                        el.setAttribute('data-midiHz', await noteReady.midiHz);
                        el.setAttribute('onClick', playChuckNote(noteReady.midiHz));
                    }
                })();
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
    
    return (
        <Box id="keyboardWrapper">
            {
                theChuck.current && Object.values(theChuck.current).length
                ?
                    <>
                        <div id="keyboardControlsWrapper">
                            Controls
                        </div>
                        
                        <ul id="keyboard">
                            {createKeys()}
                        </ul>
                    </>
                :
                    <div id="loadingScreen">Loading!</div>
            }
        </Box>
    )
} 

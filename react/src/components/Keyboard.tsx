import { Box } from '@mui/material';
import React, {useState, useEffect, SetStateAction} from 'react';
import { store } from '../app/store';

interface Props {
    chuckHook: any;
    keysVisible: boolean;
    keysReady: boolean;
    // setKeyboard: React.Dispatch<SetStateAction<any>>;
    organizeRows: (rowNum: number, note: string) => Promise<void>;
    organizeLocalStorageRows: (theNote: any) => Promise<void>;
    playChuckNote: (note:any) => any;
    compare: (a: any, b: any) => number;
};

const Keyboard = ({chuckHook, keysVisible, keysReady, organizeRows, organizeLocalStorageRows, playChuckNote, compare}:Props) => {

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
                    <li id={`A-${i + 1}`} key={`A-${i + 1}`} onClick={(e) => playChuckNote(e)} className="white offset">{`A${i + 1}`}</li>
                    <li id={`A♯-${i + 1}`} key={`A♯-${i + 1}`} onClick={(e) => playChuckNote(e)} className="black">{`A♯${i + 1}`}</li>
                    <li id={`B-${i + 1}`}  key={`B-${i + 1}`} onClick={(e) => playChuckNote(e)} className="white offset half">{`B${i + 1}`}</li>
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

    return (
        <div>
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
        </div>
    )
};
export default Keyboard;
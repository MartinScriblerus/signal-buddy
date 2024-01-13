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
    keyWid: string;
    is17EqualTemperament: boolean;
};

const Keyboard = ({chuckHook, keysVisible, keysReady, organizeRows, organizeLocalStorageRows, playChuckNote, compare, keyWid, is17EqualTemperament}:Props) => {
    console.log("CHUCK HOOK IN KEYBOARD: ", chuckHook);
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
                // if (is17EqualTemperament === true) {
                //     [`C${i}`, `C♯${i}_1`, `C♯${i}_2`, `D${i}`, `D♯${i}_1`, `D♯${i}_2`, `E${i}`, `F${i}`, `F♯${i}_1`, `F♯${i}_2`, `G${i}`, `G♯${i}_1`, `G♯${i}_2`, `A${i}`, `A♯${i}_1`, `A♯${i}_2`, `B${i}`].forEach((note) => {
                //         organizeRows(i, note);
                //     });
                // } else {
                    [`C${i}`, `C♯${i}`, `D${i}`, `D♯${i}`, `E${i}`, `F${i}`, `F♯${i}`, `G${i}`, `G♯${i}`, `A${i}`, `A♯${i}`, `B${i}`].forEach((note) => {
                        organizeRows(i, note);
                    });
                // }
            }
            // console.log('WTF IIII? ', i);
            const octave: any = 
            is17EqualTemperament
                    ?
                    <React.Fragment key={`octSpanWrapper-${i}`}>
                        <li id={`17equal_C-${i}`} key={`17equal_C-${i}`} onClick={(e) => playChuckNote(e)} className="white">{`C${i}`} </li>
                        <li id={`17equal_C♯-${i}_1`} key={`17equal_C♯-${i}_1`} onClick={(e) => playChuckNote(e)} className="equal_black_1">{`C♯${i}_1`}</li>
                        <li id={`17equal_C♯-${i}_2`} key={`17equal_C♯-${i}_2`} onClick={(e) => playChuckNote(e)} className="equal_black_2">{`C♯${i}_2`}</li>
                        <li id={`17equal_D-${i}`} key={`17equal_D-${i}`} onClick={(e) => playChuckNote(e)} className="white offset">{`D${i}`}</li>
                        <li id={`17equal_D♯-${i}_1`} key={`17equal_D♯-${i}_1`} onClick={(e) => playChuckNote(e)} className="equal_black_1">{`D♯${i}_1`}</li>
                        <li id={`17equal_D♯-${i}_2`} key={`17equal_D♯-${i}_2`} onClick={(e) => playChuckNote(e)} className="equal_black_2">{`D♯${i}_2`}</li>
                        <li id={`17equal_E-${i}`} key={`17equal_E-${i}`} onClick={(e) => playChuckNote(e)} className="white offset half">{`E${i}`}</li>
                        <li id={`17equal_F-${i}`} key={`17equal_F-${i}`} onClick={(e) => playChuckNote(e)} className="white">{`F${i}`}</li>
                        <li id={`17equal_F♯-${i}_1`} key={`17equal_F♯-${i}_1`} onClick={(e) => playChuckNote(e)} className="equal_black_1">{`F♯${i}_1`}</li>
                        <li id={`17equal_F♯_${i}_2`} key={`17equal_F♯-${i}_2`} onClick={(e) => playChuckNote(e)} className="equal_black_2">{`F♯${i}_2`}</li>
                        <li id={`17equal_G-${i}`} key={`17equal_G-${i}`} onClick={(e) => playChuckNote(e)} className="white offset">{`G${i}`}</li>
                        <li id={`17equal_G♯-${i}_1`} key={`17equal_G♯-${i}_1`} onClick={(e) => playChuckNote(e)} className="equal_black_1">{`G♯${i}`}</li>
                        <li id={`17equal_G♯-${i}_2`} key={`17equal_G♯-${i}_2`} onClick={(e) => playChuckNote(e)} className="equal_black_2">{`G♯${i}`}</li>
                        <li id={`17equal_A-${i + 1}`} key={`17equal_A-${i + 1}`} onClick={(e) => playChuckNote(e)} className="white offset">{`A${i + 1}`}</li>
                        <li id={`17equal_A♯-${i + 1}_1`} key={`17equal_A♯-${i + 1}_1`} onClick={(e) => playChuckNote(e)} className="equal_black_1">{`A♯${i + 1}_1`}</li>
                        <li id={`17equal_A♯-${i + 1}_2`} key={`17equal_A♯-${i + 1}_2`} onClick={(e) => playChuckNote(e)} className="equal_black_2">{`A♯${i + 1}_2`}</li>
                        <li id={`17equal_B-${i + 1}`}  key={`17equal_B-${i + 1}`} onClick={(e) => playChuckNote(e)} className="white offset half">{`B${i + 1}`}</li>
                    </React.Fragment>

                        :
                    
                    <React.Fragment key={`octSpanWrapper-${i}`}>
                        (<li id={`C-${i}`} key={`C-${i}`} onClick={(e) => playChuckNote(e)} className="white">{`C${i}`} </li>
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
                        <li id={`B-${i + 1}`}  key={`B-${i + 1}`} onClick={(e) => playChuckNote(e)} className="white offset half">{`B${i + 1}`}</li>)
                    
                    
           
                    {/* </span> */}
                </React.Fragment>

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
                        // o.style.display = "none";
                        o.removeChild();
                    }
                });

            }
        }

        return octaves;
    }

    return (
        <div id="keyboardWrapper" style={{overflowX: "scroll"}}>
            {
                chuckHook && Object.values(chuckHook).length && keysVisible
                ?
                    <Box 
                      sx={{position: 'relative', width: keyWid, right: 0, bottom: 0, zIndex: '100'}}
                    >
                        <ul id="keyboard" >
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
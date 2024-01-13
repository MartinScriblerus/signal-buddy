import React, { useEffect, useState, useRef, MutableRefObject } from 'react';
import PropTypes from 'prop-types';
import { Button, Box, List, ListItem } from '@mui/material';
import '../App.css';
// import {store} from '../app/store';

interface StartButtonProps {
    handleAudioReady: any;
}

interface IntroAnim {
    effect1: string;
    effect2: string;
    speed: number;
    count: number;
    position: string;
}



const StartButton = (props: StartButtonProps) => {
    // const [startTime, setStartTime] = useState(null);
    // const [now, setNow] = useState(null);
    const {handleAudioReady} = props;
    const count = useRef(0);
    const [animating, setAnimating] = useState(false);
    const [elementArray, setElementArray] = useState<any>([]);
    const [expectedLetters] = useState<string[]>(['A', 'U', 'D', 'I', 'O', 'W', 'H', 'I', 'Z']);
    const introAnimLetter = useRef<HTMLLIElement[]>([]);
    introAnimLetter.current = [];

    // you can access the elements with itemsRef.current[n]

useEffect(() => {   
    let requestID;
    const startAnimation = () => {
         // Animation using requestAnimationFrame
        let start = Date.now();

        function playAnimation() {
          const interval = Date.now() - start;
          requestID = requestAnimationFrame(playAnimation);
          if (interval/(count.current) > 150) {
            start = Date.now();

            if (count.current < expectedLetters.length) {
                introAnimLetter.current[`${count.current}`].classList.remove('invisible');
                count.current++;
            } else {
                cancelAnimationFrame(requestID);
            }
            
          }
        }
        if (count.current <= expectedLetters.length) {
            requestAnimationFrame(playAnimation);
        }
    };
    startAnimation();
}, [elementArray, expectedLetters]);
    

    return (
        <Box id="introClickBox">
            <Button sx={{background: 'primary.contrastText', color: 'primary.contrastText', padding: '0', margin: '0', height: '100vh'}} className="startButton" onClick={(e) => {
                e.stopPropagation();
                props.handleAudioReady(true)}}>
                <List sx={{color: 'primary.contrastText', display: "flex", flexDirection: "row !important", height: "100vh", textAlign: "center", justifyContent: "center" }} className="introAnimList">
                    <ListItem key={`introAnimLetter_0`} ref={el => (introAnimLetter.current).push(el)} sx={{paddingTop: "15%", fontFamily: 'typography.fontFamily', display: "flex", flexDirection: "column"}} className="introListLetter invisible">S</ListItem>
                    <ListItem key={`introAnimLetter_1`} ref={el => (introAnimLetter.current).push(el)} sx={{paddingTop: "15%", fontFamily: 'typography.fontFamily', display: "flex", flexDirection: "column"}} className="introListLetter invisible">M</ListItem>
                    <ListItem key={`introAnimLetter_2`} ref={el => (introAnimLetter.current).push(el)} sx={{paddingTop: "15%", fontFamily: 'typography.fontFamily', display: "flex", flexDirection: "column"}} className="introListLetter invisible">A</ListItem>
                    <ListItem key={`introAnimLetter_3`} ref={el => (introAnimLetter.current).push(el)} sx={{paddingTop: "15%", fontFamily: 'typography.fontFamily', display: "flex", flexDirection: "column"}} className="introListLetter invisible">H</ListItem>
                    <ListItem key={`introAnimLetter_4`} ref={el => (introAnimLetter.current).push(el)} sx={{paddingTop: "15%", fontFamily: 'typography.fontFamily', display: "flex", flexDirection: "column"}} className="introListLetter invisible">T</ListItem>
                    <ListItem key={`introAnimLetter_5`} ref={el => (introAnimLetter.current).push(el)} sx={{paddingTop: "15%", fontFamily: 'typography.fontFamily', display: "flex", flexDirection: "column"}} className="introListLetter invisible">L</ListItem>
                    <ListItem key={`introAnimLetter_6`} ref={el => (introAnimLetter.current).push(el)} sx={{paddingTop: "15%", fontFamily: 'typography.fontFamily', display: "flex", flexDirection: "column"}} className="introListLetter invisible">O</ListItem>
                    <ListItem key={`introAnimLetter_7`} ref={el => (introAnimLetter.current).push(el)} sx={{paddingTop: "15%", fontFamily: 'typography.fontFamily', display: "flex", flexDirection: "column"}} className="introListLetter invisible">O</ListItem>
                    <ListItem key={`introAnimLetter_8`} ref={el => (introAnimLetter.current).push(el)} sx={{paddingTop: "15%", fontFamily: 'typography.fontFamily', display: "flex", flexDirection: "column"}} className="introListLetter invisible">P</ListItem>
                    {/* {elementArray} */}
                </List>
              {/* <span className="display-4 fw-bold">Signal Buddy</span> */}
            </Button>   
        </Box>
    )
};
export default StartButton;
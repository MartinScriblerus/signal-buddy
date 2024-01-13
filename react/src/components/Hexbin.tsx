import * as d3 from "d3";
import React, {useEffect, useRef, useState} from "react";
import { AxisLeft } from "./AxisLeft";
import { AxisBottom } from "./AxisBottom";
import { hexbin } from "d3-hexbin";
import axios from 'axios';
import { FLASK_API_URL, MIDDLE_FONT_SIZE } from '../helpers/constants';
import {Tune} from '../tune';

const MARGIN = { top: 0, right: 0, bottom: 0, left: 0 };
const BIN_SIZE = 1;

type HexbinProps = {
  width: number;
  height: number;
  tune: Tune;
  microtonalScale: any;
  audioKey: any;
  playChuckFromMicrotonal: (note: any) => void;
};



export const Hexbin = ({ 
  width, 
  height, 
  tune, 
  microtonalScale, 
  audioKey,
  playChuckFromMicrotonal 
}: HexbinProps) => {
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;
  const [hexbinData, setHexbinData] = useState([]);
  const [hexagonWidth, setHexagonWidth] = useState(0);
  const [hexagonHeight, setHexagonHeight] = useState(0);
  const octaveCounter = useRef(0);
  const [tonesPerOctave, setTonesPerOctave] = useState(0);
  const [lastWidHeight, setLastWidHeight] = useState({width:0,height:0})
  const radVal = 100;

  const headerDict = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
  
  const requestOptions = {                                                                                                                                                                                 
      headers: headerDict,
      params: {
          key: audioKey,
      }
  };

  useEffect(() => {
    setLastWidHeight({
      width: boundsWidth,
      height: boundsHeight
    })
  }, [boundsWidth, boundsHeight])

  // const numOctaves = Math.floor(400/tune.scale.length)
  // const octaveLen = tune.scale.length;
  let el;

  const colorSwitch = (color: any, centsForOpacity) => {
    // switch statement foor main color[0]
    // console.log("WHAT IS COLOR!>@>!@>! ", color)
    const opacity = 1 - (centsForOpacity/100);
    let colorRGBA;
    switch (color) {
      case ('A'):
        return colorRGBA = `rgba(51,108,214,${opacity})`;
        break;
      case ('B'):
        return colorRGBA = `rgba(245,96,0,${opacity})`;
        break;
      case ('C'):
        return colorRGBA = `rgba(19,92,73,${opacity})`;
        break;
      case ('D'):
        return colorRGBA = `rgba(161,136,189,${opacity})`;
        break;
      case ('E'):
        return colorRGBA = `rgba(233,178,45,${opacity})`;
        break;
      case ('F'):
        return colorRGBA = `rgba(30,34,26,${opacity})`;
        break;
      case ('G'):
        return colorRGBA = `rgba(227,44,60,${opacity})`;
        break;
      default:
        return colorRGBA = `rgba(17,159,255,${opacity})`;
        break;
    }
    // console.log('wtf color: ', colorRGBA);
    // return colorRGBA;
    //  
  }

  // useEffect(() => {
  //   const bins = tonesPerOctave * 12;
  //   const deltaWidth = (boundsWidth - lastWidHeight.width)/2;
  //   const deltaHeight = (boundsHeight - lastWidHeight.height)/2;
  //   for (let i = 0; i < bins; i++) {
  //     const el: any = document.getElementById(`microtonalH_Key_${i}`);
  //     // el.radius(boundsWidth/24)
  //     // if(el) {
  //     //   el.getDOMNode().setAttribute('transform', `translate(${deltaWidth},${deltaHeight})`);
  //     // }
  //     d3.selectAll("path")
  //       .enter().append("path")
  //       .attr("transform", d => `translate(${deltaWidth},${deltaHeight})`);
        
  //     console.log('wtf el? ', el.parentNode);
  //   }
  // }, [width, height])

  useEffect(() => {
    if (!microtonalScale || !tune) return;
    let numVal;
    const num = microtonalScale.split('-')[microtonalScale.split('-').length - 1];
    // if (typeof num === 'number') {
    //   numVal = num;
    // } else { 
    //   numVal = 17;
    // }
    (async()=>{
      const data = [];
      tune.loadScale(microtonalScale);
      setTonesPerOctave(tune.scale.length);
      // console.log('WHAT IS TUNE SCALE LEN? ', tune.scale.length)
      for(let j = 0; j < 36; j++) {
        for(let i = 0; i < ((2/2) * (tune.scale.length + Math.ceil(tune.scale.length/12))); i++) {
    
          data.push({
            x: j % 2 === 0 ? 25 + boundsWidth/14 * i : 25 + boundsWidth/14 * i +  boundsWidth/28,
            y: (boundsWidth/16) * j,
            id: `${i}_${j}`
          });
        }
      }
      setHexbinData(data.map((item) => [item.x, item.y]))

      // tune.loadScale(microtonalScale);
      for (let i = 0; i < 36 * ((2/2) * (tune.scale.length + Math.ceil(tune.scale.length/12))); i++){
        let note = tune.note(i);
      
        // console.log("NOTE: ", note);
        const getVals = await axios.get(`${FLASK_API_URL}/microtonal/${note}`, requestOptions);
        const splitter = getVals.data.microNote.indexOf('+') !== -1 ? '+' : '-';
        try {
          el = document.getElementById(`hexagonId_${i}`);
          el.setAttribute('freq', note);
          // if (getVals.data.microNote.inde)
          el.setAttribute('noteName', getVals.data.microNote.split(splitter)[0]);
          el.setAttribute('centsName', getVals.data.microNote.split(splitter)[1]);

        } catch (e) {
          // console.log('could not find ' + (i));
        }
    
        if (el && el.parentNode && el.parentNode.childNodes.length > 1 && getVals.data.microNote.split(splitter)[0] && getVals.data.microNote.split(splitter)[1]) {
          el.style.fill = colorSwitch(getVals.data.microNote.split(splitter)[0][0], getVals.data.microNote.split(splitter)[1]);
          el.parentNode.childNodes[1].innerText =
          el.parentNode.childNodes[1].innerHTML =
            `
        
              ${getVals.data.microNote.split(splitter)[0]} -
              ${getVals.data.microNote.split(splitter)[1]} 
        
            `;
            if (getVals.data.microNote.split(splitter)[0][0] !== 'E') {
              el.parentNode.childNodes[1].style.fill = 'rgba(255,255,255,1)';
            } else {
              el.parentNode.childNodes[1].style.fill = 'rgba(0,0,0,1)';
            }
            el.parentNode.childNodes[1].style.fontSize = '0.85rem'
           // console.log('is this the parent??? ', el.parentNode);
            //el.parentNode.parentNode.style.fill = colorSwitch(getVals.data.microNote.split(splitter)[0]);
            // console.log('HEYOHEYO: ',         el.parentNode.style.fill = colorSwitch(getVals.data.microNote.split(splitter)[0][0]));
        }

        tune.mode.output = 'ratio';
    
    
        // console.log('%cTUNE RATIO!!! ', 'color:green;', tune);    
    
        note = tune.note(i);
        // console.log("NOTE RATIO: ", note);
        if (el) {
          el.setAttribute('ratio', note);
          
          if ((i) % 13 === 0) {
            octaveCounter.current = octaveCounter.current + 1;
          }
        }
    
        tune.mode.output = 'MIDI';
    
        // tune.loadScale(val.value);
    
        // console.log('%cTUNE MIDI!!! ', 'color:green;', tune);    
        // for (let i = 0; i < octaveLen; i++){
        note = tune.note(i);
        // console.log("NOTE MIDI: ", note);
        if (el) {
          el.setAttribute('MIDI', note);
    
          // };
          // console.log('CHECK EL!!!!!! ', el);
        }
      }
    })();
  }, [microtonalScale, width, height]);


  // console.log('%cTUNE FREQ!!! ', 'color:green;', tune);



  // const data = [];
  // for(let j = 0; j < 53; j++) {
  //   for(let i = 0; i < 53; i++) {

  //     data.push({
  //       x: j % 2 === 0 ? boundsWidth/14 * i : boundsWidth/14 * i +  boundsWidth/28,
  //       y: (boundsWidth/16) * j,
  //       id: `${i}_${j}`
  //     });
  //   }
  // }

  // Scales
  const yScale = d3.scaleLinear().domain([0, boundsHeight]).range([boundsHeight, 0]);
  const xScale = d3.scaleLinear().domain([0, boundsWidth]).range([0, boundsWidth]);

  const hexbinGenerator = hexbin()
    .radius(boundsWidth/24)
    .extent([[0, 0],  [boundsWidth/ 2, boundsHeight]])

  // const hexbinData = data.map((item) => [item.x, item.y])

  //   const maxItemPerBin = Math.max(...hexbinData.map((hex) => hex.length));
  const maxItemPerBin = 1;

  const colorScale = d3
    .scaleSqrt<string>()
    .domain([0, maxItemPerBin])
    .range(["transparent", "cyan"]);

  const opacityScale = d3
    .scaleLinear<number>()
    .domain([0, maxItemPerBin])
    .range([0.2, 1]);

    const handleMouseOver = (e:any) => {
        console.log("E ON MOUSEOVER: ", e.target);
    }; 

    const handleClick = (e:any) => {
      console.log("E ON MOUSEOUT: ", e.target);
      const note = {
        id: parseInt(e.target.getAttribute('id').split('_')[1]),
        freq: e.target.getAttribute('freq'),
        noteName: e.target.getAttribute('noteName'),
        centsName: e.target.getAttribute('centsName'),
        ratio: e.target.getAttribute('ratio'),
        midi: e.target.getAttribute('MIDI'),
        noteLetter: e.target.parentNode.childNodes[1].innerText
      };
      console.log('HEYA NOTE: ', note);
      playChuckFromMicrotonal(note);
    }; 

    const handleMouseOut = (e:any) => {
        console.log("E ON MOUSEOUT: ", e.target);
    }; 

  const allShapes = hexbinData.map((d, i) => {

    return (
      // <>
      // {
      // i % 12 === 0
      // ?
      //   <br/>
      // :
        <g 
          key={`microtonalH_Key_${i}`}
          id={`microtonalH_Key_${i}`}
          transform={`translate(${d[0]},${d[1]})`} style={{display:'inline',textAlign: 'center'}}>
            <path
              key={i}
              id={`hexagonId_${i}`}
              className={`hexagon`}
              d={
                hexbinGenerator.hexagon()
              }
              opacity={1}
              stroke={"white"}
   
              fill={colorScale((i % 12)/12)}

              strokeOpacity={opacityScale(d.length)}
              strokeWidth={0.5}
              // onMouseOver={handleMouseOver}
              // onMouseOut={handleMouseOut}
              onClick={handleClick}
            />
            <text 
              key={`microtonalH_Key_innerText(${d[0]}_${d[1]}_${i})`}
              style={{
              textAnchor:'middle',
              fontFamily:'Helvetica',
              pointerEvents:'none'
              }}>
            {/* <textPath href="#text-path" style={{background:"transparent"}}> */}
              {/* <textPath style={{zIndex: '1001'}}> */}
                {/* {i} */}
              {/* </textPath> */}
            </text>
        </g>
      // }
      // </>
    );
  });
  // useEffect(() => {
  //   (tonesPerOctave / 12) * boundsWidth
  // }, [tonesPerOctave])

  useEffect(() => {
    if (!tonesPerOctave) return;
    const radius = boundsWidth/24;
    const gonWid = radius * 2 * Math.sin(Math.PI / 3);
    // console.log('WHAT IS GON WID? ', gonWid);
    const gonHeight = radius * (3/2);

    // console.log('WTF TUNE SCALE???? ', tune)
    setHexagonWidth(tonesPerOctave * Math.ceil(gonWid));
    setHexagonHeight(13 * gonHeight);  
  }, [tonesPerOctave, allShapes])

  return (
    <div style={{boxSizing:"border-box", position:'relative'}}>
      {hexagonWidth && allShapes.length && hexbinData.length && (
      <svg viewBox={`-100 -150 ${hexagonWidth * 1.8} ${hexagonHeight * 3.1}`} style={{width:hexagonWidth * 1.8, height:hexagonHeight * 3.1, bottom:'0', left: '0', top: '0', right: '0'}}>
          {allShapes}
      </svg>
      )}
    </div>
  );
};

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
};



export const Hexbin = ({ width, height, tune, microtonalScale, audioKey }: HexbinProps) => {
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;
  const [hexbinData, setHexbinData] = useState([]);
  const octaveCounter = useRef(0);
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
  // const numOctaves = Math.floor(400/tune.scale.length)
  // const octaveLen = tune.scale.length;
  let el;
  useEffect(() => {
    if (!microtonalScale) return;
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
      for(let j = 0; j < 12; j++) {
        for(let i = 0; i < ((9/2) * (tune.scale.length + Math.ceil(tune.scale.length/12))); i++) {
    
          data.push({
            x: j % 2 === 0 ? boundsWidth/14 * i : boundsWidth/14 * i +  boundsWidth/28,
            y: (boundsWidth/16) * j,
            id: `${i}_${j}`
          });
        }
      }
      setHexbinData(data.map((item) => [item.x, item.y]))

      // tune.loadScale(microtonalScale);
      for (let i = 0; i < 12 * ((9/2) * (tune.scale.length + Math.ceil(tune.scale.length/12))); i++){
        let note = tune.note(i);
        console.log("NOTE FREQ: ", note);
        const getVals = await axios.get(`${FLASK_API_URL}/microtonal/${note}`, requestOptions);
        console.log('get VVVVVVAAAAAAALLLLLLSSSSSSS ', getVals);
        const splitter = getVals.data.microNote.indexOf('+') !== -1 ? '+' : '-';
        try {
          el = document.getElementById(`hexagonId_${i}`);
          el.setAttribute('freq', note);
          // if (getVals.data.microNote.inde)
          el.setAttribute('noteName', getVals.data.microNote.split(splitter)[0]);
          el.setAttribute('centsName', getVals.data.microNote.split(splitter)[1]);
          
        } catch (e) {
          console.log('could not find ' + (i));
        }
        //console.log('YO YO YO ', el.parentNode.childNodes[1]);
        // el.parentNode.childNodes[1].;
        if (el && el.parentNode && el.parentNode.childNodes.length > 1 && getVals.data.microNote.split(splitter)[0] && getVals.data.microNote.split(splitter)[1]) {
          el.parentNode.childNodes[1].innerText =
          el.parentNode.childNodes[1].innerHTML =
            `
    
              ${getVals.data.microNote.split(splitter)[0]} / 
              ${note.toFixed(0)}
    
    
            `;
        }
        tune.mode.output = 'ratio';
    
    
        console.log('%cTUNE RATIO!!! ', 'color:green;', tune);    
    
        note = tune.note(i);
        console.log("NOTE RATIO: ", note);
        if (el) {
          el.setAttribute('ratio', note);
          
          if ((i) % 13 === 0) {
            octaveCounter.current = octaveCounter.current + 1;
          }
        }
    
        tune.mode.output = 'MIDI';
    
        // tune.loadScale(val.value);
    
        console.log('%cTUNE MIDI!!! ', 'color:green;', tune);    
        // for (let i = 0; i < octaveLen; i++){
        note = tune.note(i);
        console.log("NOTE MIDI: ", note);
        if (el) {
          el.setAttribute('MIDI', note);
    
          // };
          console.log('CHECK EL!!!!!! ', el);
        }
      }
    })();
  }, [microtonalScale]);


  console.log('%cTUNE FREQ!!! ', 'color:green;', tune);



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
    .extent([[0, 0],  [boundsWidth, boundsHeight]])

  // const hexbinData = data.map((item) => [item.x, item.y])

  //   const maxItemPerBin = Math.max(...hexbinData.map((hex) => hex.length));
  const maxItemPerBin = 1;

  const colorScale = d3
    .scaleSqrt<string>()
    .domain([0, maxItemPerBin])
    .range(["blue", "cyan"]);

  const opacityScale = d3
    .scaleLinear<number>()
    .domain([0, maxItemPerBin])
    .range([0.2, 1]);

    const handleMouseOver = (e:any) => {
        console.log("E ON MOUSEOVER: ", e.target);
    }; 

    const handleClick = (e:any) => {
      console.log("E ON MOUSEOUT: ", e.target);
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
              // fill={colorScale(d.length)}
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
              }}>
            {/* <textPath href="#text-path" style={{background:"transparent"}}> */}
              {/* <textPath style={{zIndex: '1001'}}> */}
                {i}
              {/* </textPath> */}
            </text>
        </g>
      // }
      // </>
    );
  });

  return (
    <div style={{boxSizing:"border-box", position:'relative'}}>
      <svg viewBox={`-0 -10 ${boundsWidth * 4} ${boundsHeight + 1}`} style={{width:boundsWidth * 4, height:boundsHeight, position: 'absolute', bottom:'0', left: '0', top: '0', right: '0'}}>
          {allShapes}
      </svg>
    </div>
  );
};

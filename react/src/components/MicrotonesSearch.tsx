import React, { CSSProperties, useEffect, useState, useRef, useMemo } from 'react';
import Select, { AriaOnFocus } from 'react-select';
import microtoneDescsData from '../microtone_descriptions.json'; 
// import { FLASK_API_URL, MIDDLE_FONT_SIZE } from '../helpers/constants';
// import {Tune} from '../microtones/tune/tune';
// import axios from 'axios';

export interface MicrotoneOption {
  readonly value: string;
  readonly label: string;
  readonly name: string;
  readonly isFixed?: boolean;
  readonly isDisabled?: boolean;
  readonly description?: string;
}

// const tune = new Tune();

interface Props {
  selectRef: any;
  tune: any;
  currentMicroTonalScale: any;
}

export default function CustomAriaLive({selectRef, tune, currentMicroTonalScale}:Props) {
  const [ariaFocusMessage, setAriaFocusMessage] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClearable, setIsClearable] = useState(true);
  const [isSearchable, setIsSearchable] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRtl, setIsRtl] = useState(false);
  const [inputValue, setValue] = useState('');
  const [selectedValue, setSelectedValue] = useState(null);
  const [microtoneDescs, setMicrotoneDescs] = useState([]);
  const chosenNameRef = useRef<any>('');
  const chosenDescRef = useRef<any>('');

  const style: { [key: string]: CSSProperties } = {
    blockquote: {
      // fontStyle: 'italic',
      fontSize: '.75rem',
      // margin: '1rem 0',
      color:'#f6f6f6',
      minHeight: "2rem",
      position: 'fixed',
      left: '35vh',
      display: isMenuOpen ? 'block' : 'none',
      background: isMenuOpen ? 'rgba(0,0,0,0.875)' : 'transparent'
    },
    label: {
      fontSize: '.75rem',
      fontWeight: 'bold',
      lineHeight: 2,
    },
  };

  const focusIndexRef = useRef<any>(-1);

  const onFocus: AriaOnFocus<MicrotoneOption> = ({ focused, isDisabled }) => {

    focusIndexRef.current = focused;

    // const msg = `${focused.label}: ${focused.description} - ${
    //   isDisabled ? ', disabled' : ''
    // }`;
    const msg = `${focused.label}: ${focused.description}`;
    chosenNameRef.current = focused.label;
    chosenDescRef.current = focused.description;
    
    setAriaFocusMessage(msg);
    // tune.loadScale(focused.label);
    // console.log('%cTUNE!!! ', 'color:green;', tune);
    // console.log('%cMSG** ', 'color:aqua;', focused.value, focused.description);
    return msg;
  };

  const onMenuOpen = () => setIsMenuOpen(true);
  const onMenuClose = () => setIsMenuOpen(false);

  useMemo(() => {
    console.log('what the fuck is i? ', microtoneDescsData[0]);
    setMicrotoneDescs(microtoneDescsData.map((i: any) => {return {
      label: i.name,
      value: i.name,
      name: i.name,
      description: i.description,
    }
    }));
  }, []); 
  // useEffect(() => {
  //   console.log('%cAriaFocusMessage: ', 'color: red;', ariaFocusMessage);
  // },[ariaFocusMessage])



  // handle input change event
  const handleInputChange = value => {
    setValue(value);
  };

  // handle selection
  const handleChange = async (event) => {
    // console.log("????? event.target.value: ", event);
    const val = event;
      // [...]

    if (val && ariaFocusMessage) {
      console.log('hey val value ', val.value);
      currentMicrotonalScale(val.value)
      // console.log('val ', val);
      // console.log('ARI FDO MES ', ariaFocusMessage);
      // tune.loadScale(val.value);

      // const numOctaves = Math.floor(400/tune.scale.length)
      // const octaveLen = tune.scale.length;

      
      // console.log('WHAT IS FUCKING SEL REF: ', selectRef.current);
      // // selectRef.current.value = val.value;
      // console.log('%cTUNE FREQ!!! ', 'color:green;', tune);
      // let el;
      // for (let i = 0; i < octaveLen; i++){
        
      //   let note = tune.note(i);
      //   console.log("NOTE FREQ: ", note);
      //   const getVals = await axios.get(`${FLASK_API_URL}/microtonal/${note}`, requestOptions);
      //   console.log('get VVVVVVAAAAAAALLLLLLSSSSSSS ', getVals);
      //   const splitter = getVals.data.microNote.indexOf('+') !== -1 ? '+' : '-';
      //   try {
      //     el = document.getElementById(`hexagonId_${i}`);
      //     el.setAttribute('freq', note);
      //     if (getVals.data.microNote.inde)
      //     el.setAttribute('noteName', getVals.data.microNote.split(splitter)[0]);
      //     el.setAttribute('centsName', getVals.data.microNote.split(splitter)[1]);
              
      //   } catch (e) {
      //     console.log('could not find ' + i);
      //   }
      //   console.log('YO YO YO ', el.parentNode.childNodes[1]);
      //   // el.parentNode.childNodes[1].;
      //   if (getVals.data.microNote.split('+')[0] && getVals.data.microNote.split(splitter)[1]) {
      //     el.parentNode.childNodes[1].innerText =
      //     el.parentNode.childNodes[1].innerHTML =
      //       `

      //         ${getVals.data.microNote.split(splitter)[0]}
    

      //       `;
      //   }
      //   tune.mode.output = 'ratio';


      //   console.log('%cTUNE RATIO!!! ', 'color:green;', tune);    

      //   note = tune.note(i);
      //   console.log("NOTE RATIO: ", note);
      //   if (el) {
      //     el.setAttribute('ratio', note);
          
      //     if (i % 13 === 0) {
      //       octaveCounter.current = octaveCounter.current + 1;
      //     }
      //   }

      //   tune.mode.output = 'MIDI';

      //   // tune.loadScale(val.value);

      //   console.log('%cTUNE MIDI!!! ', 'color:green;', tune);    
      //   // for (let i = 0; i < octaveLen; i++){
      //   note = tune.note(i);
      //   console.log("NOTE MIDI: ", note);
      //   if (el) {
      //     el.setAttribute('MIDI', note);

      //     // };
      //     console.log('CHECK EL!!!!!! ', el);
      //   }

    // }
    setSelectedValue(val.value);
  }
}

  return (
    <>
      {!!ariaFocusMessage && !!isMenuOpen && (
        <blockquote style={style.blockquote}>"{ariaFocusMessage}"</blockquote>
      )}

      <div       
        id= 'aria-live-region' 
        style={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          minHeight: '2rem',
          right: '0',
          background: isMenuOpen ? 'orange' : 'transparent',
        }}
      >

      <form>
        <label style={style.label} id="aria-label" htmlFor="aria-example-input">
          Select a microtone
        </label>

        <Select
          aria-labelledby="aria-label"
          ariaLiveMessages={{
            onFocus,
          }}
          
          // ref={innerRef}
          inputId="aria-example-input"
          name="aria-live-color"
          onMenuOpen={onMenuOpen}
          onMenuClose={onMenuClose}
          options={microtoneDescs}
          ref={selectRef}
          isDisabled={isDisabled}
          isLoading={isLoading}
          isClearable={isClearable}
          isRtl={isRtl}
          isSearchable={isSearchable}
          onInputChange={handleInputChange}
          onChange={currentMicroTonalScale}
          value={selectedValue ? selectedValue : ''}
        />
      </form>
    </div>
    </>
  );
}
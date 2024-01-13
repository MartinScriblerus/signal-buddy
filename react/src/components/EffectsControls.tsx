import CircularSlider from "@fseehawer/react-circular-slider";
import { Box } from "@mui/material";
import React from "react";

interface Props {
    playingInstrument: string;
    valueReed: any;
    setValueReed: React.Dispatch<React.SetStateAction<number>>;
    valueNoiseGain: number;
    setValueNoiseGain: React.Dispatch<React.SetStateAction<number>>;
    valueVibratoFreq: number;
    setValueVibratoFreq: React.Dispatch<React.SetStateAction<number>>;
    valueVibratoGain: number;
    setValueVibratoGain: React.Dispatch<React.SetStateAction<number>>;
    valuePressure: number;
    setValuePressure: React.Dispatch<React.SetStateAction<number>>;
    valueReverbGain: number;
    setValueReverbGain: React.Dispatch<React.SetStateAction<number>>;
    valueReverbMix: number;
    setValueReverbMix: React.Dispatch<React.SetStateAction<number>>;
    valuePickupPosition: number;
    setValuePickupPosition: React.Dispatch<React.SetStateAction<number>>;
    valueSustain: number;
    setValueSustain: React.Dispatch<React.SetStateAction<number>>;
    valueStretch: number;
    setValueStretch: React.Dispatch<React.SetStateAction<number>>;
    valuePluck: number;
    setValuePluck: React.Dispatch<React.SetStateAction<number>>;
    valueBaseLoopGain: number;
    setValueBaseLoopGain: React.Dispatch<React.SetStateAction<number>>;
    valueMoogGain: number;
    setValueMoogGain: React.Dispatch<React.SetStateAction<number>>;
    valueFilterSweepRate: number;
    setValueFilterSweepRate: React.Dispatch<React.SetStateAction<number>>;
    valueLfoSpeed: number;
    setValueLfoSpeed: React.Dispatch<React.SetStateAction<number>>;
    valueLfoDepth: number;
    setValueLfoDepth: React.Dispatch<React.SetStateAction<number>>;
    valueFilterQ: number;
    setValueFilterQ: React.Dispatch<React.SetStateAction<number>>;
    valueAftertouch: number;
    setValueAftertouch: React.Dispatch<React.SetStateAction<number>>;
    valueModSpeed: number;
    setValueModSpeed: React.Dispatch<React.SetStateAction<number>>;
    valueModDepth: number;
    setValueModDepth: React.Dispatch<React.SetStateAction<number>>;
    valueOpMode: number;
    setValueOpMode: React.Dispatch<React.SetStateAction<number>>;
    valueBodySize: number;
    setValueBodySize: React.Dispatch<React.SetStateAction<number>>;
    valuePluckPos: number;
    setValuePluckPos: React.Dispatch<React.SetStateAction<number>>;
    valueStringDamping: number;
    setValueStringDamping: React.Dispatch<React.SetStateAction<number>>;
    valueStringDetune: number;
    setValueStringDetune: React.Dispatch<React.SetStateAction<number>>;
    valueStiffness: number;
    setValueStiffness: React.Dispatch<React.SetStateAction<number>>;
    valueAperture: number;
    setValueAperture: React.Dispatch<React.SetStateAction<number>>;
    valueBlowPosition: number;
    setValueBlowPosition: React.Dispatch<React.SetStateAction<number>>;
    valueControlOne: number;
    valueControlTwo: number;
    setValueControlOne: React.Dispatch<React.SetStateAction<number>>;
    setValueControlTwo: React.Dispatch<React.SetStateAction<number>>;
}

interface ReusableSliderProps {
    data?: any;
    label: string;
    min: number; 
    max: number; 
    dataIndex: number; 
    onChange: any;
}

const ReusableSlider = ({data, label, min, max, dataIndex, onChange}: ReusableSliderProps) => {
    return (
        <Box sx={{display: "flex", position: "relative", alignItems: "left", justifyContent: "left", flexDirection: 'column' }}>
            <div style={{ scale: 0.5, position: "relative", padding: "8px" }}>
                <CircularSlider
                    width={104}
                    min={min}
                    max={max}
                    label={label}
                    dataIndex={dataIndex}
                    labelFontSize="12px"
                    direction={1}
                    knobPosition="bottom"
                    appendToValue=""
                    valueFontSize="1.3rem"
                    trackColor="#eeeeee"
                    trackDraggable={true}
                    labelColor="#0fb29d"
                    knobColor="#0f1f23"
                    progressColorFrom="#0fb29d"
                    progressColorTo="#aaf"
                    data={data || []}
                    onChange={ onChange }
                />
            </div>
        </Box>
    )
}
const EffectsControls = (
    {
        playingInstrument, 
        valueReed, 
        setValueReed, 
        valueNoiseGain, 
        setValueNoiseGain, 
        valueVibratoFreq, 
        setValueVibratoFreq, 
        valueVibratoGain, 
        setValueVibratoGain, 
        valuePressure, 
        setValuePressure,
        valueReverbGain,
        setValueReverbGain,
        valuePickupPosition,
        setValuePickupPosition,
        valueSustain,
        setValueSustain,
        valueStretch,
        setValueStretch,
        valuePluck,
        setValuePluck,
        valueBaseLoopGain,
        setValueBaseLoopGain,
        valueReverbMix,
        setValueReverbMix,
        valueMoogGain,
        setValueMoogGain,
        valueFilterSweepRate,
        setValueFilterSweepRate,
        valueLfoSpeed,
        setValueLfoSpeed,
        valueLfoDepth,
        setValueLfoDepth,
        valueFilterQ,
        setValueFilterQ,
        valueAftertouch,
        setValueAftertouch,
        valueModSpeed,
        setValueModSpeed,
        valueModDepth,
        setValueModDepth,
        valueOpMode,
        setValueOpMode,
        valueBodySize,
        setValueBodySize,
        valuePluckPos,
        setValuePluckPos,
        valueStringDamping,
        setValueStringDamping,
        valueStringDetune,
        setValueStringDetune,
        valueStiffness,
        setValueStiffness,
        valueAperture,
        setValueAperture,
        valueBlowPosition,
        setValueBlowPosition,
        valueControlOne,
        valueControlTwo,
        setValueControlOne,
        setValueControlTwo,
}: Props) => {

    return (
        <Box id="synthControlsWrapper" sx={{overflow: 'scroll', left: 0, width: "100%", height: "100%", position: 'absolute', border: "solid 1px white"}}>
        {
            playingInstrument === 'clarinet'
            ?
            <Box sx={{display: "flex", flexDirection: "row", position: "relative", alignItems: "center", justifyContent: "center" }}>
                <ReusableSlider label={"NOISE"} min={0} max={100} dataIndex={valueNoiseGain * 100} onChange={(value: any) => { setValueNoiseGain(value/100) } } />

                <ReusableSlider label={"REED"} min={0} max={100} dataIndex={valueReed * 100} onChange={(value: any) => { setValueReed(value/100) } } />

                <ReusableSlider label={"PRESSURE"} min={0} max={100} dataIndex={valuePressure * 100} onChange={ (value: any) => { setValuePressure(value/100) } } />

                <ReusableSlider label={"VIB GAIN"} min={0} max={100} dataIndex={valueVibratoGain * 100} onChange={ (value: any) => { setValueVibratoGain(value) } } />
                
                <ReusableSlider data={[0,1,2,3,4,5,6,7,8,9,10,11,12]} label={"VIB FREQ"} min={0} max={12} dataIndex={valueVibratoFreq} onChange={ (value: any) => { setValueVibratoFreq(value) } } />

                <ReusableSlider data={[]} label={"REV GAIN"} min={0} max={100} dataIndex={valueReverbGain} onChange={ (value: any) => { setValueReverbGain(value) } } />

                <ReusableSlider label={"REV MIX"} min={0} max={100} dataIndex={valueReverbMix * 100} onChange={ (value: any) => { setValueReverbMix(value) } } />
             
            </Box>
            :
            null
        }
        {
            playingInstrument === 'plucked'
            ?
                <Box sx={{display: "flex", flexDirection: "row", position: "relative", alignItems: "center", justifyContent: "center" }}>
                    
                    <ReusableSlider label={"PICKUP POS"} min={0} max={100} dataIndex={valuePickupPosition * 100} onChange={ (value: any) => { setValuePickupPosition(value/100) } } />

                    <ReusableSlider label={"SUSTAIN"} min={0} max={100} dataIndex={valueSustain * 100} onChange={ (value: any) => { setValueSustain(value/100) } } />

                    <ReusableSlider label={"STRETCH"} min={0} max={100} dataIndex={valueStretch * 100} onChange={ (value: any) => { setValueStretch(value/100) } } />
                    
                    <br />

                    <ReusableSlider label={"PLUCK"} min={0} max={100} dataIndex={valuePluck * 100} onChange={ (value: any) => { setValuePluck(value/100) } } />

                    <ReusableSlider label={"LOOP GAIN"} min={0} max={100} dataIndex={valueBaseLoopGain * 100} onChange={ (value: any) => { setValueBaseLoopGain(value/100) } } />

                    <ReusableSlider label={"REV MIX"} min={0} max={100} dataIndex={valueReverbMix * 100} onChange={ (value: any) => { setValueReverbMix(value/100) } } />

                </Box>
            :
            null
        }
        {
            playingInstrument === 'sitar'
            ?         
            
                <Box sx={{display: "flex", flexDirection: "row", position: "relative", alignItems: "center", justifyContent: "center" }}>

                    <ReusableSlider label={"PLUCK POS"} min={0} max={100} dataIndex={valuePluckPos * 100} onChange={ (value: any) => { setValuePluckPos(value/100) } } />

                    <ReusableSlider label={"REV MIX"} min={0} max={100} dataIndex={valueReverbMix * 100} onChange={ (value: any) => { setValueReverbMix(value/100) } } />

                </Box>  

            :
                null
        }
        {
            playingInstrument === 'moog'
            ?

                <Box sx={{display: "flex", flexDirection: "row", position: "relative", alignItems: "center", justifyContent: "center" }}>

                    <ReusableSlider label={"VIB GAIN"} min={0} max={100} dataIndex={valueVibratoGain * 100} onChange={ (value: any) => { setValueVibratoGain(value) } } />
                
                    <ReusableSlider data={[0,1,2,3,4,5,6,7,8,9,10,11,12]} label={"VIB FREQ"} min={0} max={12} dataIndex={valueVibratoFreq} onChange={ (value: any) => { setValueVibratoFreq(value) } } />

                    <ReusableSlider label={"MOOG GAIN"} min={0} max={100} dataIndex={valueMoogGain * 100} onChange={ (value: any) => { setValueMoogGain(value/100) } } />

                    <ReusableSlider label={"F SWEEP"} min={0} max={100} dataIndex={valueFilterSweepRate * 100} onChange={ (value: any) => { setValueFilterSweepRate(value/100) } } />

                    <ReusableSlider label={"LFO DEPTH"} min={0} max={100} dataIndex={valueLfoDepth * 100} onChange={ (value: any) => { setValueLfoDepth(value/100) } } />

                    <ReusableSlider data={[0,1,2,3,4,5,6,7,8,9,10,11,12]} label={"LFO SPEED"} min={0} max={12} dataIndex={valueLfoSpeed * 100} onChange={ (value: any) => { setValueLfoSpeed(value/100) } } />

                    <ReusableSlider label={"REV MIX"} min={0} max={100} dataIndex={valueReverbMix * 100} onChange={ (value: any) => { setValueReverbMix(value/100) } } />

                    <br/>

                    <ReusableSlider label={"AFTERTOUCH"} min={0} max={100} dataIndex={valueAftertouch * 100} onChange={ (value: any) => { setValueAftertouch(value/100) } } />

                    <ReusableSlider label={"MOD SPEED"} min={0} max={100} dataIndex={valueModSpeed * 100} onChange={ (value: any) => { setValueModSpeed(value/100) } } />

                    <ReusableSlider label={"MOD DEPTH"} min={0} max={100} dataIndex={valueModDepth * 100} onChange={ (value: any) => { setValueModDepth(value/100) } } />

                    <ReusableSlider data={[-1,0,1,2,3,4]} label={"OP MODE"} min={-1} max={4} dataIndex={valueOpMode} onChange={ (value: any) => { setValueOpMode(value) } } />
         
                </Box>
            :
                null
        }
        { 
            playingInstrument === 'mandolin'
            ?

                <Box sx={{display: "flex", flexDirection: "row", position: "relative", alignItems: "center", justifyContent: "center" }}>

                    <ReusableSlider label={"BODY SIZE"} min={0} max={100} dataIndex={valueBodySize * 100} onChange={ (value: any) => { setValueBodySize(value) } } />

                    <ReusableSlider label={"PLUCK"} min={0} max={100} dataIndex={valuePluck * 100} onChange={ (value: any) => { setValuePluck(value/100) } } />

                    <ReusableSlider label={"PLUCK POS"} min={0} max={100} dataIndex={valuePluckPos * 100} onChange={ (value: any) => { setValuePluckPos(value) } } />

                    <ReusableSlider label={"STR DAMP"} min={0} max={100} dataIndex={valueStringDamping * 100} onChange={ (value: any) => { setValueStringDamping(value) } } />
                    
                    <ReusableSlider label={"STR DETUNE"} min={0} max={12} dataIndex={valueStringDetune * 100} onChange={ (value: any) => { setValueStringDetune(value/100) } } />
                
                </Box>
            :
            null
        }
        {
            playingInstrument === 'saxofony'
            ?
            <Box sx={{display: "flex", flexDirection: "row", position: "relative", alignItems: "center", justifyContent: "center" }}>

                <ReusableSlider label={"STIFFNESS"} min={0} max={100} dataIndex={valueStiffness * 100} onChange={ (value: any) => { setValueStiffness(value) } } />

                <ReusableSlider label={"APERTURE"} min={0} max={100} dataIndex={valueAperture * 100} onChange={ (value: any) => { setValueAperture(value) } } />

                <ReusableSlider label={"NOISE"} min={0} max={100} dataIndex={valueNoiseGain * 100} onChange={(value: any) => { setValueNoiseGain(value/100) } } />

                <ReusableSlider label={"BLOW POS"} min={0} max={100} dataIndex={valueBlowPosition * 100} onChange={ (value: any) => { setValueBlowPosition(value/100) } } />

                <ReusableSlider data={[0,1,2,3,4,5,6,7,8,9,10,11,12]} label={"VIB FREQ"} min={0} max={12} dataIndex={valueVibratoFreq} onChange={ (value: any) => { setValueVibratoFreq(value) } } />

                <ReusableSlider label={"VIB GAIN"} min={0} max={100} dataIndex={valueVibratoGain * 100} onChange={ (value: any) => { setValueVibratoGain(value) } } />
     
                <br/>

                <ReusableSlider label={"PRESSURE"} min={0} max={100} dataIndex={valuePressure * 100} onChange={ (value: any) => { setValuePressure(value/100) } } />

                <ReusableSlider label={"REV GAIN"} min={0} max={100} dataIndex={valueReverbGain * 100} onChange={ (value: any) => { setValueReverbGain(value/100) } } />

            </Box>
            :
            null
        }
        {
            playingInstrument === 'frenchhorn'
            ?
                <Box sx={{display: "flex", flexDirection: "row", position: "relative", alignItems: "center", justifyContent: "center" }}>

                    <ReusableSlider label={"LFO SPEED"} min={0} max={100} dataIndex={valueLfoSpeed * 100} onChange={ (value: any) => { setValueLfoSpeed(value/100) } } />

                    <ReusableSlider label={"LFO DEPTH"} min={0} max={100} dataIndex={valueLfoDepth * 100} onChange={ (value: any) => { setValueLfoDepth(value/100) } } />

                    <br/>

                    <ReusableSlider label={"CTRL 1"} min={0} max={100} dataIndex={valueControlOne * 100} onChange={ (value: any) => { setValueControlOne(value/100) } } />

                    <ReusableSlider label={"CTRL 2"} min={0} max={100} dataIndex={valueControlTwo * 100} onChange={ (value: any) => { setValueControlTwo(value/100) } } />

                    <ReusableSlider label={"REV MIX"} min={0} max={100} dataIndex={valueReverbMix * 100} onChange={ (value: any) => { setValueReverbMix(value/100) } } />

                </Box>
            :
                null
        }
        </Box>
    )
};

export default EffectsControls;
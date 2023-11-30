import CircularSlider from "@fseehawer/react-circular-slider";
import { Box } from "@mui/material";
import React from "react";
import { set } from "react-hook-form";
import { MIDDLE_FONT_SIZE } from "../helpers/constants";

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

const EffectsControls = ({playingInstrument, 
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
    console.log('VALUE REEDDDDDD ', valueReed);
    return (
        <Box id="synthControlsWrapper" sx={{left: 0, width: "100%", border: "solid 1px white"}}>
        {
            playingInstrument === 'clarinet'
            ?
            <>
                <Box sx={{display: "flex", flexDirection: "row",  position: "relative", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ scale: 0.5, position: "relative", padding: "16px"  }}>
                        <CircularSlider
                            width={104}
                            min={0}
                            max={100}
                            label="REED"
                            labelFontSize="14px"
                            direction={1}
                            dataIndex={valueReed * 100}
                            knobPosition="bottom"
                            appendToValue=""
                            valueFontSize="1.7rem"
                            trackColor="#eeeeee"
                            trackDraggable={true}
                            labelColor="#0fb29d"
                            knobColor="#0fb29d"
                            progressColorFrom="#0fb29d"
                            progressColorTo="#0fb29d"
                            onChange={(value: any) => { setValueReed(value/100) } }
                        />
                    </div>
                    <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                        <CircularSlider
                            width={104}
                            min={0}
                            max={100}
                            label="NOISE GAIN"
                            dataIndex={valueNoiseGain * 100}
                            labelFontSize="1rem"
                            direction={1}
                            knobPosition="bottom"
                            appendToValue=""
                            valueFontSize="1.7rem"
                            trackColor="#eeeeee"
                            trackDraggable={true}
                            labelColor="#0fb29d"
                            knobColor="#0fb29d"
                            progressColorFrom="#0fb29d"
                            progressColorTo="#0fb29d"
                            onChange={(value: any) => { setValueNoiseGain(value/100) } }
                        />
                    </div>
                    <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                        <CircularSlider
                            width={104}
                            min={0}
                            max={12}
                            label="VIBRATO FREQ"
                            dataIndex={valueVibratoFreq}
                            labelFontSize={MIDDLE_FONT_SIZE}
                            direction={1}
                            knobPosition="bottom"
                            appendToValue=""
                            valueFontSize="1.7rem"
                            trackColor="#eeeeee"
                            trackDraggable={true}
                            labelColor="#0fb29d"
                            knobColor="#0fb29d"
                            progressColorFrom="#0fb29d"
                            progressColorTo="#0fb29d"
                            data={[0,1,2,3,4,5,6,7,8,9,10,11,12]}
                            onChange={ (value: any) => { setValueVibratoFreq(value) } }
                        />
                    </div>
                    <div style={{ scale: 0.5,position: "relative", padding: "16px" }}>
                        <CircularSlider
                            width={104}
                            min={0}
                            max={100}
                            label="VIBRATO GAIN"
                            dataIndex={valueVibratoGain * 100}
                            labelFontSize="1rem"
                            direction={1}
                            knobPosition="bottom"
                            appendToValue=""
                            valueFontSize="1.7rem"
                            trackColor="#eeeeee"
                            trackDraggable={true}
                            labelColor="#0fb29d"
                            knobColor="#0fb29d"
                            progressColorFrom="#0fb29d"
                            progressColorTo="#0fb29d"
                            onChange={ (value: any) => { setValueVibratoGain(value/100) } }
                        />
                    </div>
                </Box>
                <br/>
                <Box sx={{display: "flex", flexDirection: "row", position: "relative", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                        <CircularSlider
                            width={104}
                            min={0}
                            max={100}
                            label="PRESSURE"
                            dataIndex={valuePressure * 100}
                            labelFontSize={MIDDLE_FONT_SIZE}
                            direction={1}
                            knobPosition="bottom"
                            appendToValue=""
                            valueFontSize="1.7rem"
                            trackColor="#eeeeee"
                            trackDraggable={true}
                            labelColor="#0fb29d"
                            knobColor="#0fb29d"
                            progressColorFrom="#0fb29d"
                            progressColorTo="#0fb29d"
                            onChange={ (value: any) => { setValuePressure(value/100) } }
                        />
                    </div>
                    <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                        <CircularSlider
                            width={104}
                            min={0}
                            max={100}
                            label="REVERB GAIN"
                            dataIndex={valueReverbGain}
                            labelFontSize="1rem"
                            direction={1}
                            knobPosition="bottom"
                            appendToValue=""
                            valueFontSize="1.7rem"
                            trackColor="#eeeeee"
                            trackDraggable={true}
                            labelColor="#0fb29d"
                            knobColor="#0fb29d"
                            progressColorFrom="#0fb29d"
                            progressColorTo="#0fb29d"
                            onChange={ (value: any) => { setValueReverbGain(value) } }
                        />
                    </div>
                    <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                        <CircularSlider
                            width={104}
                            min={0}
                            max={100}
                            label="REVERB MIX"
                            dataIndex={valueReverbMix * 100}
                            labelFontSize={MIDDLE_FONT_SIZE}
                            direction={1}
                            knobPosition="bottom"
                            appendToValue=""
                            valueFontSize="1.7rem"
                            trackColor="#eeeeee"
                            trackDraggable={true}
                            labelColor="#0fb29d"
                            knobColor="#0fb29d"
                            progressColorFrom="#0fb29d"
                            progressColorTo="#0fb29d"
                            onChange={ (value: any) => { setValueReverbMix(value) } }
                        />
                    </div>
                </Box>
            </>
            :
            null
        }
        {
            playingInstrument === 'plucked'
            ?
            <>
                <Box sx={{display: "flex", flexDirection: "row", position: "relative", alignItems: "center", justifyContent: "center", paddingTop: "10vh" }}>
                    <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                        <CircularSlider
                            width={104}
                            min={0}
                            max={100}
                            label="PICKUP POS"
                            dataIndex={valuePickupPosition * 100}
                            labelFontSize="1rem"
                            direction={1}
                            initialValue={0}
                            knobPosition="bottom"
                            appendToValue=""
                            valueFontSize="1.7rem"
                            trackColor="#eeeeee"
                            trackDraggable={true}
                            labelColor="#0fb29d"
                            knobColor="#0fb29d"
                            progressColorFrom="#0fb29d"
                            progressColorTo="#0fb29d"
                            onChange={ (value: any) => { setValuePickupPosition(value/100) } }
                        />
                    </div>
                    <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                        <CircularSlider
                            width={104}
                            min={0}
                            max={100}
                            label="SUSTAIN"
                            dataIndex={valueSustain * 100}
                            labelFontSize={MIDDLE_FONT_SIZE}
                            direction={1}
                            knobPosition="bottom"
                            appendToValue=""
                            valueFontSize="1.7rem"
                            trackColor="#eeeeee"
                            trackDraggable={true}
                            labelColor="#0fb29d"
                            knobColor="#0fb29d"
                            progressColorFrom="#0fb29d"
                            progressColorTo="#0fb29d"
                            onChange={ (value: any) => { setValueSustain(value/100) } }
                        />
                    </div>
                    <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                        <CircularSlider
                            width={104}
                            min={0}
                            max={100}
                            label="STRETCH"
                            dataIndex={valueStretch * 100}
                            labelFontSize="1rem"
                            direction={1}
                            knobPosition="bottom"
                            appendToValue=""
                            valueFontSize="1.7rem"
                            trackColor="#eeeeee"
                            trackDraggable={true}
                            labelColor="#0fb29d"
                            knobColor="#0fb29d"
                            progressColorFrom="#0fb29d"
                            progressColorTo="#0fb29d"
                            onChange={ (value: any) => { setValueStretch(value/100) } }
                        />
                    </div>
                </Box>
                <br/>
                <Box sx={{display: "flex", flexDirection: "row", position: "relative", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ scale: 0.5,position: "relative", padding: "16px" }}>
                        <CircularSlider
                            width={104}
                            min={0}
                            max={100}
                            label="PLUCK"
                            dataIndex={valuePluck * 100}
                            labelFontSize={MIDDLE_FONT_SIZE}
                            direction={1}
                            knobPosition="bottom"
                            appendToValue=""
                            valueFontSize="1.7rem"
                            trackColor="#eeeeee"
                            trackDraggable={true}
                            labelColor="#0fb29d"
                            knobColor="#0fb29d"
                            progressColorFrom="#0fb29d"
                            progressColorTo="#0fb29d"
                            onChange={ (value: any) => { setValuePluck(value/100) } }
                        />
                    </div>
                    <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                        <CircularSlider
                            width={104}
                            min={0}
                            max={100}
                            label="LOOP GAIN"
                            dataIndex={valueBaseLoopGain * 100}
                            labelFontSize="1rem"
                            direction={1}
                            knobPosition="bottom"
                            appendToValue=""
                            valueFontSize="1.7rem"
                            trackColor="#eeeeee"
                            trackDraggable={true}
                            labelColor="#0fb29d"
                            knobColor="#0fb29d"
                            progressColorFrom="#0fb29d"
                            progressColorTo="#0fb29d"
                            onChange={ (value: any) => { setValueBaseLoopGain(value/100) } }
                        />
                    </div>
                    <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                        <CircularSlider
                            width={104}
                            min={0}
                            max={100}
                            label="REVERB MIX"
                            dataIndex={valueReverbMix * 100}
                            labelFontSize={MIDDLE_FONT_SIZE}
                            direction={1}
                            knobPosition="bottom"
                            appendToValue=""
                            valueFontSize="1.7rem"
                            trackColor="#eeeeee"
                            trackDraggable={true}
                            labelColor="#0fb29d"
                            knobColor="#0fb29d"
                            progressColorFrom="#0fb29d"
                            progressColorTo="#0fb29d"
                            onChange={ (value: any) => { setValueReverbMix(value/100) } }
                        />
                    </div>
                </Box>
            </>
            :
            null
        }
        {
            playingInstrument === 'sitar'
            ?                     
                <Box sx={{display: "flex", flexDirection: "row", position: "relative", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ scale: 0.5,position: "relative", padding: "16px" }}>
                        <CircularSlider
                            width={104}
                            min={0}
                            max={100}
                            label="PLUCK"
                            dataIndex={valuePluck * 100}
                            labelFontSize="1rem"
                            direction={1}
                            knobPosition="bottom"
                            appendToValue=""
                            valueFontSize="1.7rem"
                            trackColor="#eeeeee"
                            trackDraggable={true}
                            labelColor="#0fb29d"
                            knobColor="#0fb29d"
                            progressColorFrom="#0fb29d"
                            progressColorTo="#0fb29d"
                            onChange={ (value: any) => { setValuePluck(value/100) } }
                        />
                    </div>
                    <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                        <CircularSlider
                            width={104}
                            min={0}
                            max={100}
                            label="REVERB MIX"
                            dataIndex={valueReverbMix * 100}
                            labelFontSize={MIDDLE_FONT_SIZE}
                            direction={1}
                            knobPosition="bottom"
                            appendToValue=""
                            valueFontSize="1.7rem"
                            trackColor="#eeeeee"
                            trackDraggable={true}
                            labelColor="#0fb29d"
                            knobColor="#0fb29d"
                            progressColorFrom="#0fb29d"
                            progressColorTo="#0fb29d"
                            onChange={ (value: any) => { setValueReverbMix(value/100) } }
                        />
                    </div>
                </Box>
            :
                null
        }
        {
            playingInstrument === 'moog'
            ?
                <>
                    <Box sx={{display: "flex", flexDirection: "row", position: "relative", alignItems: "center", justifyContent: "center", paddingTop: "10vh" }}>
                        <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                            <CircularSlider
                                width={104}
                                min={0}
                                max={100}
                                label="GAIN"
                                dataIndex={valueMoogGain * 100}
                                labelFontSize="1rem"
                                direction={1}
                                knobPosition="bottom"
                                appendToValue=""
                                valueFontSize="1.7rem"
                                trackColor="#eeeeee"
                                trackDraggable={true}
                                labelColor="#0fb29d"
                                knobColor="#0fb29d"
                                progressColorFrom="#0fb29d"
                                progressColorTo="#0fb29d"
                                onChange={ (value: any) => { setValueMoogGain(value/100) } }
                            />
                        </div>
                        <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                            <CircularSlider
                                width={104}
                                min={0}
                                max={12}
                                label="VIBRATO FREQ"
                                dataIndex={valueVibratoFreq}
                                labelFontSize={MIDDLE_FONT_SIZE}
                                direction={1}
                                knobPosition="bottom"
                                appendToValue=""
                                valueFontSize="1.7rem"
                                trackColor="#eeeeee"
                                trackDraggable={true}
                                labelColor="#0fb29d"
                                knobColor="#0fb29d"
                                progressColorFrom="#0fb29d"
                                progressColorTo="#0fb29d"
                                data={[0,1,2,3,4,5,6,7,8,9,10,11,12]}
                                onChange={ (value: any) => { setValueVibratoFreq(value) } }
                            />
                        </div>
                        <div style={{ scale: 0.5,position: "relative", padding: "16px" }}>
                            <CircularSlider
                                width={104}
                                min={0}
                                max={100}
                                label="VIBRATO GAIN"
                                dataIndex={valueVibratoGain * 100}
                                labelFontSize="1rem"
                                direction={1}
                                knobPosition="bottom"
                                appendToValue=""
                                valueFontSize="1.7rem"
                                trackColor="#eeeeee"
                                trackDraggable={true}
                                labelColor="#0fb29d"
                                knobColor="#0fb29d"
                                progressColorFrom="#0fb29d"
                                progressColorTo="#0fb29d"
                                onChange={ (value: any) => { setValueVibratoGain(value/100) } }
                            />
                        </div>
                        <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                            <CircularSlider
                                width={104}
                                min={0}
                                max={100}
                                label="SWEEP RATE"
                                dataIndex={valueFilterSweepRate * 100}
                                labelFontSize={MIDDLE_FONT_SIZE}
                                direction={1}
                                knobPosition="bottom"
                                appendToValue=""
                                valueFontSize="1.7rem"
                                trackColor="#eeeeee"
                                trackDraggable={true}
                                labelColor="#0fb29d"
                                knobColor="#0fb29d"
                                progressColorFrom="#0fb29d"
                                progressColorTo="#0fb29d"
                                onChange={ (value: any) => { setValueFilterSweepRate(value/100) } }
                            />
                        </div>
                    </Box>
                    <br/>
                    <Box sx={{display: "flex", flexDirection: "row", position: "relative", alignItems: "center", justifyContent: "center", paddingTop: "10vh" }}>
                        <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                            <CircularSlider
                                width={104}
                                min={0}
                                max={12}
                                label="LFO SPEED"
                                labelFontSize="1rem"
                                direction={1}
                                dataIndex={valueLfoSpeed}
                                knobPosition="bottom"
                                appendToValue=""
                                valueFontSize="1.7rem"
                                trackColor="#eeeeee"
                                trackDraggable={true}
                                labelColor="#0fb29d"
                                knobColor="#0fb29d"
                                progressColorFrom="#0fb29d"
                                progressColorTo="#0fb29d"
                                data={[0,1,2,3,4,5,6,7,8,9,10,11,12]}
                                onChange={ (value: any) => { setValueLfoSpeed(value) } }
                            />
                        </div>
                        <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                            <CircularSlider
                                width={104}
                                min={0}
                                max={100}
                                label="LFO DEPTH"
                                dataIndex={valueLfoDepth * 100}
                                labelFontSize={MIDDLE_FONT_SIZE}
                                direction={1}
                                knobPosition="bottom"
                                appendToValue=""
                                valueFontSize="1.7rem"
                                trackColor="#eeeeee"
                                trackDraggable={true}
                                labelColor="#0fb29d"
                                knobColor="#0fb29d"
                                progressColorFrom="#0fb29d"
                                progressColorTo="#0fb29d"
                                onChange={ (value: any) => { setValueLfoDepth(value/100) } }
                            />
                        </div>
                        <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                            <CircularSlider
                                width={104}
                                min={0}
                                max={100}
                                label="FILTER Q"
                                dataIndex={valueFilterQ * 100}
                                labelFontSize="1rem"
                                direction={1}
                                knobPosition="bottom"
                                appendToValue=""
                                valueFontSize="1.7rem"
                                trackColor="#eeeeee"
                                trackDraggable={true}
                                labelColor="#0fb29d"
                                knobColor="#0fb29d"
                                progressColorFrom="#0fb29d"
                                progressColorTo="#0fb29d"
                                onChange={ (value: any) => { setValueFilterQ(value/100) } }
                            />
                        </div>
                    </Box>
                    <br/>
                    <Box sx={{display: "flex", flexDirection: "row", position: "relative", alignItems: "center", justifyContent: "center", paddingTop: "10vh" }}>
                        <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                            <CircularSlider
                                width={104}
                                min={0}
                                max={100}
                                label="AFTERTOUCH"
                                dataIndex={valueAftertouch * 100}
                                labelFontSize={MIDDLE_FONT_SIZE}
                                direction={1}
                                knobPosition="bottom"
                                appendToValue=""
                                valueFontSize="1.7rem"
                                trackColor="#eeeeee"
                                trackDraggable={true}
                                labelColor="#0fb29d"
                                knobColor="#0fb29d"
                                progressColorFrom="#0fb29d"
                                progressColorTo="#0fb29d"
                                onChange={ (value: any) => { setValueAftertouch(value/100) } }
                            />
                        </div>
                        <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                            <CircularSlider
                                width={104}
                                min={0}
                                max={100}
                                label="MOD SPEED"
                                dataIndex={valueModSpeed * 100}
                                labelFontSize="1rem"
                                direction={1}
                                knobPosition="bottom"
                                appendToValue=""
                                valueFontSize="1.7rem"
                                trackColor="#eeeeee"
                                trackDraggable={true}
                                labelColor="#0fb29d"
                                knobColor="#0fb29d"
                                progressColorFrom="#0fb29d"
                                progressColorTo="#0fb29d"
                                onChange={ (value: any) => { setValueModSpeed(value) } }
                            />
                        </div>
                        <div style={{ scale: 0.5,position: "relative", padding: "16px" }}>
                            <CircularSlider
                                width={104}
                                min={0}
                                max={100}
                                label="MOD DEPTH"
                                dataIndex={valueModDepth * 100}
                                labelFontSize={MIDDLE_FONT_SIZE}
                                direction={1}
                                knobPosition="bottom"
                                appendToValue=""
                                valueFontSize="1.7rem"
                                trackColor="#eeeeee"
                                trackDraggable={true}
                                labelColor="#0fb29d"
                                knobColor="#0fb29d"
                                progressColorFrom="#0fb29d"
                                progressColorTo="#0fb29d"
                                onChange={ (value: any) => { setValueModDepth(value/100) } }
                            />
                        </div>
                        <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                            <CircularSlider
                                width={104}
                                min={-1}
                                max={4}
                                label="OP MODE"
                                dataIndex={valueOpMode}
                                labelFontSize="1rem"
                                direction={1}
                                knobPosition="bottom"
                                appendToValue=""
                                valueFontSize="1.7rem"
                                trackColor="#eeeeee"
                                trackDraggable={true}
                                labelColor="#0fb29d"
                                knobColor="#0fb29d"
                                progressColorFrom="#0fb29d"
                                progressColorTo="#0fb29d"
                                data={[-1,0,1,2,3,4]}
                                onChange={ (value: any) => { setValueOpMode(value) } }
                            />
                        </div>
                    </Box>
                </>
            :
                null
        }
        { 
            playingInstrument === 'mandolin'
            ?
            <>
                <Box sx={{display: "flex", flexDirection: "row", position: "relative", alignItems: "center", justifyContent: "center", paddingTop: "10vh" }}>
                    <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                        <CircularSlider
                            width={104}
                            min={0}
                            max={100}
                            label="BODY SIZE"
                            dataIndex={valueBodySize * 100}
                            labelFontSize={MIDDLE_FONT_SIZE}
                            direction={1}
                            knobPosition="bottom"
                            appendToValue=""
                            valueFontSize="1.7rem"
                            trackColor="#eeeeee"
                            trackDraggable={true}
                            labelColor="#0fb29d"
                            knobColor="#0fb29d"
                            progressColorFrom="#0fb29d"
                            progressColorTo="#0fb29d"
                            onChange={ (value: any) => { setValueBodySize(value/100) } }
                        />
                    </div>
                    <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                        <CircularSlider
                            width={104}
                            min={0}
                            max={100}
                            label="PLUCK"
                            dataIndex={valuePluck * 100}
                            labelFontSize="1rem"
                            direction={1}
                            knobPosition="bottom"
                            appendToValue=""
                            valueFontSize="1.7rem"
                            trackColor="#eeeeee"
                            trackDraggable={true}
                            labelColor="#0fb29d"
                            knobColor="#0fb29d"
                            progressColorFrom="#0fb29d"
                            progressColorTo="#0fb29d"
                            onChange={ (value: any) => { setValuePluck(value/100) } }
                        />
                    </div>
                    <div style={{ scale: 0.5,position: "relative", padding: "16px" }}>
                        <CircularSlider
                            width={104}
                            min={0}
                            max={100}
                            label="PLUCK POS"
                            dataIndex={valuePluckPos * 100}
                            labelFontSize={MIDDLE_FONT_SIZE}
                            direction={1}
                            knobPosition="bottom"
                            appendToValue=""
                            valueFontSize="1.7rem"
                            trackColor="#eeeeee"
                            trackDraggable={true}
                            labelColor="#0fb29d"
                            knobColor="#0fb29d"
                            progressColorFrom="#0fb29d"
                            progressColorTo="#0fb29d"
                            onChange={ (value: any) => { setValuePluckPos(value/100) } }
                        />
                    </div>
                    <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                        <CircularSlider
                            width={104}
                            min={0}
                            max={100}
                            label="STRING DAMPING"
                            dataIndex={valueStringDamping * 100}
                            labelFontSize="1rem"
                            direction={1}
                            knobPosition="bottom"
                            appendToValue=""
                            valueFontSize="1.7rem"
                            trackColor="#eeeeee"
                            trackDraggable={true}
                            labelColor="#0fb29d"
                            knobColor="#0fb29d"
                            progressColorFrom="#0fb29d"
                            progressColorTo="#0fb29d"
                            onChange={ (value: any) => { setValueStringDamping(value/100) } }
                        />
                    </div>
                </Box>
                <br/>
                <Box sx={{display: "flex", flexDirection: "row", position: "relative", alignItems: "center", justifyContent: "center", paddingTop: "10vh" }}>
                    <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                        <CircularSlider
                            width={104}
                            min={0}
                            max={12}
                            label="STRING DETUNE"
                            labelFontSize={MIDDLE_FONT_SIZE}
                            direction={1}
                            dataIndex={valueStringDetune * 100}
                            knobPosition="bottom"
                            appendToValue=""
                            valueFontSize="1.7rem"
                            trackColor="#eeeeee"
                            trackDraggable={true}
                            labelColor="#0fb29d"
                            knobColor="#0fb29d"
                            progressColorFrom="#0fb29d"
                            progressColorTo="#0fb29d"
                            onChange={ (value: any) => { setValueStringDetune(value / 100) } }
                        />
                    </div>
                    <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                            <CircularSlider
                                width={104}
                                min={0}
                                max={100}
                                label="REVERB MIX"
                                dataIndex={valueReverbMix * 100}
                                labelFontSize="1rem"
                                direction={1}
                                knobPosition="bottom"
                                appendToValue=""
                                valueFontSize="1.7rem"
                                trackColor="#eeeeee"
                                trackDraggable={true}
                                labelColor="#0fb29d"
                                knobColor="#0fb29d"
                                progressColorFrom="#0fb29d"
                                progressColorTo="#0fb29d"
                                onChange={ (value: any) => { setValueReverbMix(value/100) } }
                            />
                        </div>
                </Box> 
            </>
            :
            null
        }
        {
            playingInstrument === 'saxofony'
            ?
            <>
                <Box sx={{display: "flex", flexDirection: "row", position: "relative", alignItems: "center", justifyContent: "center", paddingTop: "10vh" }}>
                    <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                        <CircularSlider
                            width={104}
                            min={0}
                            max={100}
                            label="STIFFNESS"
                            labelFontSize={MIDDLE_FONT_SIZE}
                            direction={1}
                            dataIndex={valueStiffness * 100}
                            knobPosition="bottom"
                            appendToValue=""
                            valueFontSize="1.7rem"
                            trackColor="#eeeeee"
                            trackDraggable={true}
                            labelColor="#0fb29d"
                            knobColor="#0fb29d"
                            progressColorFrom="#0fb29d"
                            progressColorTo="#0fb29d"
                            onChange={ (value: any) => { setValueStiffness(value/100) } }
                        />
                    </div>
                    <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                        <CircularSlider
                            width={104}
                            min={0}
                            max={100}
                            label="APERTURE"
                            dataIndex={valueAperture * 100}
                            labelFontSize="1rem"
                            direction={1}
                            knobPosition="bottom"
                            appendToValue=""
                            valueFontSize="1.7rem"
                            trackColor="#eeeeee"
                            trackDraggable={true}
                            labelColor="#0fb29d"
                            knobColor="#0fb29d"
                            progressColorFrom="#0fb29d"
                            progressColorTo="#0fb29d"
                            onChange={ (value: any) => { setValueAperture(value/100) } }
                        />
                    </div>
                    <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                        <CircularSlider
                            width={104}
                            min={0}
                            max={100}
                            label="NOISE GAIN"
                            dataIndex={valueNoiseGain * 100}
                            labelFontSize={MIDDLE_FONT_SIZE}
                            direction={1}
                            knobPosition="bottom"
                            appendToValue=""
                            valueFontSize="1.7rem"
                            trackColor="#eeeeee"
                            trackDraggable={true}
                            labelColor="#0fb29d"
                            knobColor="#0fb29d"
                            progressColorFrom="#0fb29d"
                            progressColorTo="#0fb29d"
                            onChange={ (value: any) => { setValueNoiseGain(value/100) } }
                        />
                    </div>
                    <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                        <CircularSlider
                            width={104}
                            min={0}
                            max={100}
                            label="BLOW POSITION"
                            dataIndex={valueBlowPosition * 100}
                            labelFontSize="1rem"
                            direction={1}
                            knobPosition="bottom"
                            appendToValue=""
                            valueFontSize="1.7rem"
                            trackColor="#eeeeee"
                            trackDraggable={true}
                            labelColor="#0fb29d"
                            knobColor="#0fb29d"
                            progressColorFrom="#0fb29d"
                            progressColorTo="#0fb29d"
                            onChange={ (value: any) => { setValueBlowPosition(value/100) } }
                        />
                    </div>
                    <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                        <CircularSlider
                            width={104}
                            min={0}
                            max={12}
                            label="VIBRATO FREQ"
                            dataIndex={valueVibratoFreq}
                            labelFontSize={MIDDLE_FONT_SIZE}
                            direction={1}
                            knobPosition="bottom"
                            appendToValue=""
                            valueFontSize="1.7rem"
                            trackColor="#eeeeee"
                            trackDraggable={true}
                            labelColor="#0fb29d"
                            knobColor="#0fb29d"
                            progressColorFrom="#0fb29d"
                            progressColorTo="#0fb29d"
                            data={[0,1,2,3,4,5,6,7,8,9,10,11,12]}
                            onChange={ (value: any) => { setValueVibratoFreq(value) } }
                        />
                    </div>
                    <div style={{ scale: 0.5,position: "relative", padding: "16px" }}>
                        <CircularSlider
                            width={104}
                            min={0}
                            max={100}
                            label="VIBRATO GAIN"
                            dataIndex={valueVibratoGain * 100}
                            labelFontSize="1rem"
                            direction={1}
                            knobPosition="bottom"
                            appendToValue=""
                            valueFontSize="1.7rem"
                            trackColor="#eeeeee"
                            trackDraggable={true}
                            labelColor="#0fb29d"
                            knobColor="#0fb29d"
                            progressColorFrom="#0fb29d"
                            progressColorTo="#0fb29d"
                            onChange={ (value: any) => { setValueVibratoGain(value/100) } }
                        />
                    </div>
                </Box>
                <br/>
                <Box sx={{display: "flex", flexDirection: "row", position: "relative", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                        <CircularSlider
                            width={104}
                            min={0}
                            max={100}
                            label="PRESSURE"
                            dataIndex={valuePressure * 100}
                            labelFontSize={MIDDLE_FONT_SIZE}
                            direction={1}
                            knobPosition="bottom"
                            appendToValue=""
                            valueFontSize="1.7rem"
                            trackColor="#eeeeee"
                            trackDraggable={true}
                            labelColor="#0fb29d"
                            knobColor="#0fb29d"
                            progressColorFrom="#0fb29d"
                            progressColorTo="#0fb29d"
                            onChange={ (value: any) => { setValuePressure(value/100) } }
                        />
                    </div>
                    <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                        <CircularSlider
                            width={104}
                            min={0}
                            max={100}
                            label="REVERB MIX"
                            dataIndex={valueReverbMix * 100}
                            labelFontSize="1rem"
                            direction={1}
                            knobPosition="bottom"
                            appendToValue=""
                            valueFontSize="1.7rem"
                            trackColor="#eeeeee"
                            trackDraggable={true}
                            labelColor="#0fb29d"
                            knobColor="#0fb29d"
                            progressColorFrom="#0fb29d"
                            progressColorTo="#0fb29d"
                            onChange={ (value: any) => { setValueReverbMix(value) } }
                        />
                    </div>
                </Box>
            </>
            :
            null
        }
        {
            playingInstrument === 'frenchhorn'
            ?
                <>
                    <Box sx={{display: "flex", flexDirection: "row", position: "relative", alignItems: "center", justifyContent: "center", paddingTop: "10vh" }}>
                        <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                            <CircularSlider
                                width={104}
                                min={0}
                                max={100}
                                label="LFO SPEED"
                                dataIndex={valueLfoSpeed * 100}
                                labelFontSize={MIDDLE_FONT_SIZE}
                                direction={1}
                                knobPosition="bottom"
                                appendToValue=""
                                valueFontSize="1.7rem"
                                trackColor="#eeeeee"
                                trackDraggable={true}
                                labelColor="#0fb29d"
                                knobColor="#0fb29d"
                                progressColorFrom="#0fb29d"
                                progressColorTo="#0fb29d"
                                onChange={ (value: any) => { setValueLfoSpeed(value/100) } }
                            />
                        </div>
                        <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                            <CircularSlider
                                width={104}
                                min={0}
                                max={100}
                                label="LFO DEPTH"
                                dataIndex={valueLfoDepth * 100}
                                labelFontSize="1rem"
                                direction={1}
                                knobPosition="bottom"
                                appendToValue=""
                                valueFontSize="1.7rem"
                                trackColor="#eeeeee"
                                trackDraggable={true}
                                labelColor="#0fb29d"
                                knobColor="#0fb29d"
                                progressColorFrom="#0fb29d"
                                progressColorTo="#0fb29d"
                                onChange={ (value: any) => { setValueLfoDepth(value/100) } }
                            />
                        </div>
                    </Box>
                    <br/>
                    <Box sx={{display: "flex", flexDirection: "row", position: "relative", alignItems: "center", justifyContent: "center", paddingTop: "10vh" }}>
                        <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                            <CircularSlider
                                width={104}
                                min={0}
                                max={100}
                                label="CONTROL ONE"
                                dataIndex={valueControlOne * 100}
                                labelFontSize={MIDDLE_FONT_SIZE}
                                direction={1}
                                knobPosition="bottom"
                                appendToValue=""
                                valueFontSize="1.7rem"
                                trackColor="#eeeeee"
                                trackDraggable={true}
                                labelColor="#0fb29d"
                                knobColor="#0fb29d"
                                progressColorFrom="#0fb29d"
                                progressColorTo="#0fb29d"
                                onChange={ (value: any) => { setValueControlOne(value/100) } }
                            />
                        </div>
                        <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                            <CircularSlider
                                width={104}
                                min={0}
                                max={100}
                                label="CONTROL TWO"
                                dataIndex={valueControlTwo * 100}
                                labelFontSize="1rem"
                                direction={1}
                                knobPosition="bottom"
                                appendToValue=""
                                valueFontSize="1.7rem"
                                trackColor="#eeeeee"
                                trackDraggable={true}
                                labelColor="#0fb29d"
                                knobColor="#0fb29d"
                                progressColorFrom="#0fb29d"
                                progressColorTo="#0fb29d"
                                onChange={ (value: any) => { setValueControlTwo(value/100) } }
                            />
                        </div>
                        <div style={{ scale: 0.5, position: "relative", padding: "16px" }}>
                            <CircularSlider
                                width={104}
                                min={0}
                                max={100}
                                label="REVERB MIX"
                                dataIndex={valueReverbMix * 100}
                                labelFontSize={MIDDLE_FONT_SIZE}
                                direction={1}
                                knobPosition="bottom"
                                appendToValue=""
                                valueFontSize="1.7rem"
                                trackColor="#eeeeee"
                                trackDraggable={true}
                                labelColor="#0fb29d"
                                knobColor="#0fb29d"
                                progressColorFrom="#0fb29d"
                                progressColorTo="#0fb29d"
                                onChange={ (value: any) => { setValueReverbMix(value/100) } }
                            />
                        </div>
                    </Box>
                </>
            :
                null
        }
        </Box>
    )
};
export default EffectsControls;
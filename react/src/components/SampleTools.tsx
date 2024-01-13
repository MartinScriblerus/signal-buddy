import { Box, FormControl, TextField, Typography, Button } from "@mui/material";
import React from "react";

interface SampleToolsProps {    
    bpm: number;
    sampleLength: number;
    sampleRates: number[];
    samplePositionStart: number;
    handleChangeBPM: any;
    handleChangeSampleStartPosition: any;
    handleChangeSampleLength: any;
    handleChangeSampleRates: any;
    handleDrumMachine: any;
}

const SampleTools = (props: SampleToolsProps) => {
    const { bpm, sampleLength, sampleRates, samplePositionStart, handleChangeBPM, handleChangeSampleStartPosition, handleChangeSampleLength, handleChangeSampleRates, handleDrumMachine } = props;
    return (
        <Box sx={{display: "flex", flexDirection: "row"}}>
            <Box 
                id="sampleToolsWrapper"
                sx={{
                    color: 'primary.contrastText', 
                    boxSizing: 'border-box', 
                    position: "absolute", 
                    display: 'flex', 
                    flexDirection: 'row',
                    border: '1px solid orange',
                    width: '100%',
                    backgroundColor: 'primary.main',
                    // overflow: 'scroll',
                    // height: '100%'
                }}
            >
                <Typography sx={{width: "10%", paddingRight: "10px"}}>Looper Tools </Typography>
                <Box id="sampleDropdowns" sx={{ display: "flex" }}>         
                    <Box
                        sx={{display: 'flex', flexDirection: 'column'}}
                    >
                        <Box>
                            <FormControl
                                onSubmit={(e) => {
                                    e.preventDefault();
                                }
                            }>
                                <TextField
                                    inputProps={{ style: { color: 'primary.contrastText'} }}
                                    sx={{
                                        input: { color: 'primary.contrastText' },
                                        minWidth: "2rem",
                                        color: 'primary.contrastText',
                                        paddingTop: 0,
                                        paddingBottom: 0,
                                        margin: "1rem",
                                        // maxWidth: "6rem",
                                        width: '100%',
                                    }}
                                    label={"BPM"}
                                    placeholder="BPM"
                                    type="number"
                                    id="outlined-textarea"
                                    className="inputSampleInfo"
                                    InputLabelProps={{
                                        color: "primary",
                                        // shrink: false,
                                    }}
                                    value={bpm}
                                    onInput={(event: React.ChangeEvent<HTMLInputElement>) => {
                                            event.preventDefault();
                                            const inputBpm: any = parseInt(event.target.value);
                                            handleChangeBPM(inputBpm);
                                        }
                                    }
                                />
                            </FormControl>
                        </Box>

                        <Box>
                            <FormControl
                                onSubmit={(e) => {
                                    e.preventDefault();
                                }}
                            >
                                <TextField
                                    inputProps={{ style: { color: 'primary.contrastText'} }}
                                    sx={{
                                        input: { color: 'primary.contrastText' },
                                        paddingTop: 0,
                                        paddingBottom: 0,
                                        margin: "1rem",
                                        // maxWidth: "6rem",
                                        width: '100%',
                                    }}
                                    label="Start"
                                    placeholder="Start"
                                    type="number"
                                    id="outlined-textarea"
                                    className="inputSampleInfo"
                                    InputLabelProps={{
                                        color: 'primary',
                                    }}
                                    value={samplePositionStart}
                                    onInput={(event: React.ChangeEvent<HTMLInputElement>) => {
                                            event.preventDefault();
                                            const inputSampleStartPosition: any = parseInt(event.target.value);
                                            handleChangeSampleStartPosition(inputSampleStartPosition);
                                        }
                                    }
                                />
                            </FormControl>
                        </Box>
                    </Box>
                <Box
                    sx={{display: 'flex', flexDirection: 'column'}}
                >
                    <Box>
                        <FormControl
                        onSubmit={(e) => {
                            e.preventDefault();
                        }}>
                            <TextField
                                inputProps={{ style: { color: 'primary.contrastText'} }}
                                sx={{
                                    input: { color: 'primary.contrastText' },
                                    paddingTop: 0,
                                    paddingBottom: 0,
                                    margin: "1rem",
                                    // maxWidth: "6rem",
                                    width: '100%',
                                }}
                                label={"Length"}
                                placeholder="Length"
                                type="number"
                                id="outlined-textarea"
                                className="inputSampleInfo"
                                InputLabelProps={{
                                    color: 'primary',
                                }}
                                value={sampleLength}
                                onInput={(event: React.ChangeEvent<HTMLInputElement>) => {
                                        event.preventDefault();
                                        const inputSampleLength: any = parseInt(event.target.value);
                                        handleChangeSampleLength(inputSampleLength);
                                    }
                                }
                            />
                        </FormControl>
                    </Box>

                    <Box>
                        <FormControl
                            onSubmit={(e) => {
                                e.preventDefault();
                            }}
                        >
                            <TextField
                                inputProps={{ style: { color: 'primary.contrastText'} }}
                                sx={{
                                    input: { color: 'primary.contrastText' },
                                    paddingTop: 0,
                                    paddingBottom: 0,
                                    margin: "1rem",
                                    // maxWidth: "6rem",
                                    width: '100%',
                                }}
                                label={"Rate"}
                                placeholder="Rate"
                                type="any"
                                id="outlined-textarea"
                                className="inputSampleInfo"
                                InputLabelProps={{
                                    color: 'primary',
                                }}
                                value={sampleRates}
                                onInput={(event: React.ChangeEvent<HTMLInputElement>) => {
                                        event.preventDefault();
                                        const sampleRateInput: any = event.target.value;
                                        handleChangeSampleRates(sampleRateInput);
                                    }
                                }
                            />
                        </FormControl>
                    </Box>
                </Box>
            </ Box>
            <Box sx={{ width: "30%", display: "flex", flexDirection: "row", justifyContent: "right" }}>
                <Button sx={{ border: "1px solid green" }} onClick={handleDrumMachine}>Play Sequence</Button>
            </Box>
            </Box>
        </Box>
    )
};

export default SampleTools;
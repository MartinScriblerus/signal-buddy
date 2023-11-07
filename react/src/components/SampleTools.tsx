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
        <Box 
            id="sampleToolsWrapper"
            sx={{
                color: 'primary.main', 
                left: 0, 
                height: "25vh", 
                position: "absolute", 
                display: 'flex', 
                flexDirection: 'row',
                border: '1px solid aqua',
                width: '100%',
                overflow: 'scroll'
            }}
        >
            <Typography sx={{paddingRight: "10px"}}>Looper Tools </Typography>
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
                            inputProps={{ style: { color: 'primary.main'} }}
                            sx={{
                                input: { color: 'primary.main' },
                                minWidth: "2rem",
                                color: 'primary.main',
                                paddingTop: 0,
                                paddingBottom: 0,
                                margin: "1rem"
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
                            inputProps={{ style: { color: 'primary.main'} }}
                            sx={{
                                input: { color: 'primary.main' },
                                paddingTop: 0,
                                paddingBottom: 0,
                                margin: "1rem"
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
                            inputProps={{ style: { color: 'primary.main'} }}
                            sx={{
                                input: { color: 'primary' },
                                paddingTop: 0,
                                paddingBottom: 0,
                                margin: "1rem"
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
                            inputProps={{ style: { color: 'primary.main'} }}
                            sx={{
                                input: { color: 'primary.main' },
                                paddingTop: 0,
                                paddingBottom: 0,
                                margin: "1rem"
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
            <Box sx={{ width: "30%", display: "flex", flexDirection: "row", border: "1px solid green"}}>
                <Button onClick={handleDrumMachine}>Play Sequence</Button>
            </Box>
        </Box>
    )
};

export default SampleTools;
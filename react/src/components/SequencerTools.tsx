import { Box, Button, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Typography } from "@mui/material";
import React from "react";

interface Props {
    handleAddStep: () => void;
    nextTreeItem: string;
    updateNextTreeItem: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleRemoveStep: () => any;
    handleDrumMachine: () => void;
}

const SequencerTools = ({handleAddStep, nextTreeItem, updateNextTreeItem, handleRemoveStep, handleDrumMachine}: Props) => {
  return (
    <Box 
        id="sequenceToolsWrapper" 
        sx={{ 
            color: 'primary.contrastText', 
            left: 0, 
            position: 'absolute', 
            display: 'flex', 
            flexDirection: 'row', 
            boxSizing: 'border-box', 
            border: '1px solid orange', 
            backgroundColor: 'primary.main',
            zIndex: 50,
            // overflow: 'hidden',
            // height: '100%',
        }}
    >
        <Typography sx={{paddingRight: "10px"}}>Sequencer Tools </Typography>
        <Box sx={{display: "flex", flexDirection: "row"}}>

            <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", width: "100%", textAlign: "center", border: "1px solid #f6f6f6"}}>
                <Button onClick={handleAddStep}>Add Step</Button>

                <FormControl sx={{display: "flex", flexDirection: "row", justifyContent: "center", width: "100%", textAlign: "center"}} id="treeBuilderWrapper">
                    <FormLabel id="demo-controlled-radio-buttons-group-tree"></FormLabel>
                    <RadioGroup
                        sx={{display: "flex", flexDirection: "row"}}
                        aria-labelledby="demo-controlled-radio-buttons-group-tree"
                        name="controlled-radio-buttons-group-tree"
                        value={nextTreeItem}
                        onChange={updateNextTreeItem}
                    >
                        <FormControlLabel sx={{fontSize: "12px"}} value="step" control={<Radio />} label="Step" />
                        <FormControlLabel sx={{fontSize: "12px"}} value="pattern" control={<Radio />} label="Pattern" />
                        <FormControlLabel sx={{fontSize: "12px"}} value="effect" control={<Radio />} label="Effect" />
                        
                    </RadioGroup>
                </FormControl>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "row", border: "1px solid #f6f6f6"}}>
                <Button onClick={handleRemoveStep}>Remove Step</Button>
            </Box>
        
        </Box>

        <Box sx={{ width: "30%", display: "flex", flexDirection: "row", justifyContent: 'right'}}>
            <Button sx={{ border: "1px solid green" }} onClick={handleDrumMachine}>Play Sequence</Button>
        </Box>
    </Box>);
};
export default SequencerTools;
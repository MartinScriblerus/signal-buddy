import { Box, Button } from '@mui/material';
import React from 'react';

interface Props {
    vizComponent: number;
    vizItem: number;
    handleChangeDataVizControls: () => Promise<void>,
    handleToggleViz: () => void,
    handleChangeInput: () => void;

}

const VizHeaderRow = ({vizComponent, vizItem, handleChangeDataVizControls, handleToggleViz, handleChangeInput}: Props) => {
    return (
        <Box sx={{position: "relative", width: "100%", left: "0", top: "0", border: "solid 1px orange"}}>
        {(vizComponent === 0 || vizItem === 0) && (
            <Button sx={{background: "green", position: "relative", top: 0, minWidth: "6rem", margin: "0.5rem", zIndex: 5}} id="btnDataVizControls" onClick={handleChangeDataVizControls}>Data Controls</Button>
        )}

        <Button onClick={handleToggleViz} sx={{background: "blue", position: "relative", top: 0, minWidth: "6rem", margin: "0.5rem", zIndex: 5}}>TOGGLE VIZ</Button>

        <Button onClick={handleChangeInput} sx={{background: "red", position: "relative", top: 0, minWidth: "6rem", margin: "0.5rem", zIndex: 5}}>AUDIO INPUT</Button>
    
    </Box>
    )
}
export default VizHeaderRow;
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
        <Box sx={{position: "absolute", display: "flex", flexDirection: "column", width: "10%", left: "7rem", bottom: "13.5rem", border: "solid 1px orange"}}>
            {(vizComponent === 0 || vizItem === 0) && (
                <Button sx={{background: "rgba(19, 92, 73, 1.0)", position: "relative", top: 0, minWidth: "6rem", margin: "0.5rem", zIndex: 5}} id="btnDataVizControls" onClick={handleChangeDataVizControls}>CTRLS</Button>
            )}

            <Button onClick={handleToggleViz} sx={{background: "rgba(51, 108, 214, 1.0)", position: "relative", top: 0, minWidth: "6rem", margin: "0.5rem", zIndex: 5}}>VIZ</Button>

            <Button onClick={handleChangeInput} sx={{background: "rgba(227, 44, 60, 1.0);", position: "relative", top: 0, minWidth: "6rem", margin: "0.5rem", zIndex: 5}}>INPUT</Button>
        
        </Box>
    )
}
export default VizHeaderRow;
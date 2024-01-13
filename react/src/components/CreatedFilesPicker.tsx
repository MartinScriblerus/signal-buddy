import React, {useState, useEffect, useRef} from 'react';
import Box from '@mui/material/Box';

const CreatedFilesList = ({createdFilesList}: {createdFilesList: Array<any>}) => {
    
    useEffect(() => {
        console.log("YO CREATED FILES! ", createdFilesList);
    }, [createdFilesList])

    return (
        <Box>

        </Box>
    )
}

export default CreatedFilesList; 
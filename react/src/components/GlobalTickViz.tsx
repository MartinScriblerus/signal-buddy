import React, {useRef, useEffect} from 'react';
import * as d3 from 'd3';
import { Box } from '@mui/material';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';

const GlobalTickViz = ({numeratorSignature, denominatorSignature, currentCount, latestCount, winWid, winHeight}:{numeratorSignature: number, denominatorSignature: number, currentCount: number, latestCount:number, winWid:number, winHeight:number}) => {
    const d3TickVizContainer = useRef<any>(null);
    const d3TickVizContainer2 = useRef<any>(null);
    const d3TickVizContainer3 = useRef<any>(null);
    const d3TickVizContainer4 = useRef<any>(null);
    const circles = useRef<any>([]);
    const numberOfCircles = 2 * numeratorSignature * numeratorSignature * denominatorSignature;

    const theme = useTheme();

    useEffect(() => {   
        const defaultColor = (f: number) => ((f % (numeratorSignature * 2) === 0) && f !== currentCount || f === 0) ? 'rgb(161, 136, 189)' : 'rgba(51, 108, 214, 0.93);';
        
        if (circles.current.length < numberOfCircles) {
            for (let i = 0; i < numberOfCircles; i++) {
                const horizOffset = i > 0 ? (((i) % (numberOfCircles / 4)) + 1) + 'rem' : '1rem';
                // const ids = circles.current.length > 0 && (circles.current.map((c:any) => c));
                circles.current.push(<circle key={`tick_circle_${i}`} id={`tick_circle_${i}`} cx={horizOffset} cy={'1vh'} r={'1vh'} fill={defaultColor(i)}></circle>);
            } 
        } 

        const el = document.getElementById(`tick_circle_${currentCount + (latestCount * 2 * numeratorSignature)}`);
        el && (el.style.fill = "rgba(51, 108, 214, 0.93)");

        const lastCircle = document.getElementById(`tick_circle_${currentCount + (latestCount * 2 * numeratorSignature) - 1}`);
        if (lastCircle) {
            if ((currentCount) % numeratorSignature < 1) {
                lastCircle.style.fill = 'rgba(51, 108, 214, 0.93);';
            } else {
                lastCircle.style.fill = defaultColor(currentCount - 1);
            }
        }
    }, [currentCount]); 
    
    return(
        <ThemeProvider theme={theme}>
            <Box 
                style={{
                    left: '7rem',
                    top: '1rem',
                    // width: 'calc(100vw - 7rem)',
                    position: 'absolute',
                    zIndex: 2,
                    // overflowY: 'scroll'
                }}
            >
                {winWid && winWid > 0
                ?
                <> 
                    <svg
                        className="d3-component-circles"
                        width={winWid}
                        height={24}
                        ref={d3TickVizContainer}
                        viewBox={`0 0 ${winWid} 24`}
                        style={{ fill: currentCount % 2 === 0 ? "rgba(233, 178, 45, 0.80)" : "rgba(19, 92, 73, 0.96)", overflow: "scroll" }}
                    >
                        {
                            circles.current.slice(0, numeratorSignature * numeratorSignature * 2)
                        }
                    </svg>
                    <svg
                        className="d3-component-circles-2"
                        width={winWid}
                        height={24}
                        ref={d3TickVizContainer2}
                        viewBox={`0 0 ${winWid} 24`}
                        style={{ fill: currentCount % 2 === 0 ? "rgba(233, 178, 45, 0.80)" : "rgba(19, 92, 73, 0.96)", overflow: "scroll" }}
                    >
                        {
                            circles.current.slice(numeratorSignature * numeratorSignature * 2, numeratorSignature * numeratorSignature * 4)
                        }
                    </svg>
                    <svg
                        className="d3-component-circles-3"
                        width={winWid}
                        height={24}
                        ref={d3TickVizContainer3}
                        viewBox={`0 0 ${winWid} 24`}
                        style={{ fill: currentCount % 2 === 0 ? "rgba(233, 178, 45, 0.80)" : "rgba(19, 92, 73, 0.96)", overflow: "scroll" }}
                    >
                        {
                            circles.current.slice(numeratorSignature * numeratorSignature * 4, numeratorSignature * numeratorSignature * 6)
                        }
                    </svg>
                    <svg
                        className="d3-component-circles-4"
                        width={winWid}
                        height={24}
                        ref={d3TickVizContainer4}
                        viewBox={`0 0 ${winWid} 24`}
                        style={{ fill: currentCount % 2 === 0 ? "rgba(233, 178, 45, 0.80)" : "rgba(19, 92, 73, 0.96)", overflow: "scroll" }}
                    >
                        {
                            circles.current.slice(numeratorSignature * numeratorSignature * 6, circles.current.length)
                        }
                    </svg>
                </>
                : <></>}
            </Box>
        </ThemeProvider>
    )
};

export default GlobalTickViz; 
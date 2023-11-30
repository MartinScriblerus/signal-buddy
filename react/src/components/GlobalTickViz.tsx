import React, {useRef, useEffect} from 'react';
import * as d3 from 'd3';
import { Box } from '@mui/material';

const GlobalTickViz = ({numeratorSignature, denominatorSignature, currentCount, latestCount}:{numeratorSignature: number, denominatorSignature: number, currentCount: number, latestCount:number}) => {
    const d3TickVizContainer = useRef<any>(null);
    const d3TickVizContainer2 = useRef<any>(null);
    const d3TickVizContainer3 = useRef<any>(null);
    const d3TickVizContainer4 = useRef<any>(null);
    const circles = useRef<any>([]);
    const numberOfCircles = 2 * numeratorSignature * numeratorSignature * denominatorSignature;

    useEffect(() => {   
        const defaultColor = (f: number) => ((f % (numeratorSignature * 2) === 0) && f !== currentCount || f === 0) ? 'yellow' : 'blue';
        if (circles.current.length < numberOfCircles) {
            for (let i = 0; i < numberOfCircles; i++) {
                const ids = circles.current.length > 0 && (circles.current.map((c:any) => c));
                circles.current.push(<circle key={`tick_circle_${i}`} id={`tick_circle_${i}`} cx={((i) % (numberOfCircles / 4)) + 'rem'} cy={'1vh'} r={'1vh'} fill={defaultColor(i)}></circle>);
            } 
        } 

        const el = document.getElementById(`tick_circle_${currentCount + (latestCount * 2 * numeratorSignature)}`);
        el && (el.style.fill = "pink");

        const lastCircle = document.getElementById(`tick_circle_${currentCount + (latestCount * 2 * numeratorSignature) - 1}`);
        if (lastCircle) {
            if ((currentCount) % numeratorSignature < 1) {
                lastCircle.style.fill = 'blue';
            } else {
                lastCircle.style.fill = defaultColor(currentCount - 1);
            }
        }
    }, [currentCount]); 

    return(
        <Box 
            style={{
                width: '100%',
                position: 'absolute',
            }}
        >
            <svg
                className="d3-component-circles"
                width={'100%'}
                height={'2rem'}
                ref={d3TickVizContainer}
                viewBox={`0 0 ${window.innerWidth} 2rem`}
                style={{ backgroundColor: "grey", fill: "green", overflow: "scroll" }}
            >
                {
                    circles.current.slice(0, numeratorSignature * numeratorSignature * 2)
                }
            </svg>
            <svg
                className="d3-component-circles-2"
                width={'100%'}
                height={'2rem'}
                ref={d3TickVizContainer2}
                viewBox={`0 0 ${window.innerWidth} 2rem`}
                style={{ backgroundColor: "grey", fill: "green", overflow: "scroll" }}
            >
                {
                    circles.current.slice(numeratorSignature * numeratorSignature * 2, numeratorSignature * numeratorSignature * 4)
                }
            </svg>
            <svg
                className="d3-component-circles-3"
                width={'100%'}
                height={'2rem'}
                ref={d3TickVizContainer3}
                viewBox={`0 0 ${window.innerWidth} 2rem`}
                style={{ backgroundColor: "grey", fill: "green", overflow: "scroll" }}
            >
                {
                    circles.current.slice(numeratorSignature * numeratorSignature * 4, numeratorSignature * numeratorSignature * 6)
                }
            </svg>
            <svg
                className="d3-component-circles-4"
                width={'100%'}
                height={'2rem'}
                ref={d3TickVizContainer4}
                viewBox={`0 0 ${window.innerWidth} 2rem`}
                style={{ backgroundColor: "grey", fill: "green", overflow: "scroll" }}
            >
                {
                    circles.current.slice(numeratorSignature * numeratorSignature * 6, circles.current.length)
                }
            </svg>
        </Box>
    )
};

export default GlobalTickViz; 
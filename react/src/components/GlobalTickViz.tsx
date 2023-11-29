import React, {useRef, useEffect} from 'react';
import * as d3 from 'd3';



// const getTickCircles = (numeratorSignature: number) => {
//     const circles = useRef<any>([]);
//     for (let i = 0; i < 32; i++) {
//         const ids = circles.length > 0 && (circles.current.map((c:any) => c.id));
//         console.log("IDS: ", ids);
//         if (!ids.includes(`tick_circle_${i}`)) {
//             circles.current.push(<circle id={`tick_circle_${i}`} cx={1 + i + 'rem'} cy={'1vh'} r={'1vh'} fill={i % (numeratorSignature * 2) === 0 ? 'yellow' : 'blue'}></circle>);
//         }
//     } 
//     return circles.current;
// };

const GlobalTickViz = ({numeratorSignature, denominatorSignature, currentCount, latestCount}:{numeratorSignature: number, denominatorSignature: number, currentCount: number, latestCount:number}) => {
    const d3TickVizContainer = useRef<any>(null);
    const d3TickVizContainer2 = useRef<any>(null);
    const d3TickVizContainer3 = useRef<any>(null);
    const d3TickVizContainer4 = useRef<any>(null);
    const circles = useRef<any>([]);
    const numberOfCircles = 2 * numeratorSignature * numeratorSignature * denominatorSignature;
    // const getTickCircles = (numeratorSignature: number) => {
    useEffect(() => {   
        const defaultColor = (f: number) => ((f % (numeratorSignature * 2) === 0) && f !== currentCount || f === 0) ? 'yellow' : 'blue';
        if (circles.current.length < numberOfCircles) {
            for (let i = 0; i < numberOfCircles; i++) {
                const ids = circles.current.length > 0 && (circles.current.map((c:any) => c));
                circles.current.push(<circle key={`tick_circle_${i}`} id={`tick_circle_${i}`} cx={((i) % (numberOfCircles / 4)) + 'rem'} cy={'1vh'} r={'1vh'} fill={defaultColor(i)}></circle>);
            } 
        } 
        console.log('current count is/.... ', currentCount);
        console.log('latest count is  .... ', latestCount);
        const el = document.getElementById(`tick_circle_${currentCount + (latestCount * 2 * numeratorSignature)}`);
        el && (el.style.fill = "pink");
        console.log('ARE WE GETTING EL? ', el);

        const lastCircle = document.getElementById(`tick_circle_${currentCount - 1}`);
        if (lastCircle) {
            if (currentCount < 1) {
                lastCircle.style.fill = 'yellow';
            } else {
                lastCircle.style.fill = defaultColor(currentCount - 1);
            }
        }
        // return circles.current;
    }, [currentCount]); 
    // };
    return(
        <div 
            // style={{
            //     width: '100%',
            //     height: '300px',
            //     display: 'flex',
            //     justifyContent: 'center',
            //     alignItems: 'center',
            //     flexDirection: 'column'
            // }}
        >
            <svg
                className="d3-component-circles"
                width={'100%'}
                height={'2rem'}
                ref={d3TickVizContainer}
                viewBox={`0 0 100% 2rem`}
                style={{ backgroundColor: "grey", fill: "green", overflow: "scroll" }}
            >
                {
                    // for (let i = 0; i < 32; i++) {
                    //     return <circle id='tick_circle_${i}' cx={'1vh'} cy={'1vh'} r={'1vh'}></circle>
                    // }
                    circles.current.slice(0, numeratorSignature * numeratorSignature * 2)
                }
            </svg>
            <svg
                className="d3-component-circles-2"
                width={'100%'}
                height={'2rem'}
                ref={d3TickVizContainer2}
                viewBox={`0 0 100% 2rem`}
                style={{ backgroundColor: "grey", fill: "green", overflow: "scroll" }}
            >
                {
                    // for (let i = 0; i < 32; i++) {
                    //     return <circle id='tick_circle_${i}' cx={'1vh'} cy={'1vh'} r={'1vh'}></circle>
                    // }
                    circles.current.slice(numeratorSignature * numeratorSignature * 2, numeratorSignature * numeratorSignature * 4)
                }
            </svg>
            <svg
                className="d3-component-circles-2"
                width={'100%'}
                height={'2rem'}
                ref={d3TickVizContainer2}
                viewBox={`0 0 100% 2rem`}
                style={{ backgroundColor: "grey", fill: "green", overflow: "scroll" }}
            >
                {
                    // for (let i = 0; i < 32; i++) {
                    //     return <circle id='tick_circle_${i}' cx={'1vh'} cy={'1vh'} r={'1vh'}></circle>
                    // }
                    circles.current.slice(numeratorSignature * numeratorSignature * 4, numeratorSignature * numeratorSignature * 6)
                }
            </svg>
            <svg
                className="d3-component-circles-2"
                width={'100%'}
                height={'2rem'}
                ref={d3TickVizContainer2}
                viewBox={`0 0 100% 2rem`}
                style={{ backgroundColor: "grey", fill: "green", overflow: "scroll" }}
            >
                {
                    // for (let i = 0; i < 32; i++) {
                    //     return <circle id='tick_circle_${i}' cx={'1vh'} cy={'1vh'} r={'1vh'}></circle>
                    // }
                    circles.current.slice(numeratorSignature * numeratorSignature * 6, circles.current.length)
                }
            </svg>
        </div>
    )
};

export default GlobalTickViz; 
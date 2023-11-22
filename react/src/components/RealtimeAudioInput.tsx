import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const RealtimeAudioInput = ({width,height, data, isRecProp, ticksDatas, setTicksDatas}:{width:number,height:number, data?: any, isRecProp: boolean, ticksDatas: Array<any>, setTicksDatas: Dispatch<SetStateAction<any>>}) => {
    const d3Container = useRef(null);
    const bottomA = useRef(null);
    const leftA = useRef(null);
    const pathRef = useRef(null);
    const barRef = useRef(null);
    
    const [barWidth, setBarWidth] = useState(1);
    // const [barHeight, setBarHeight] = useState(0);
    const [fftArray, setFftArray] = useState<Array<any>>([]);

    const vizSkipAdjuster = 8;

    const datums = useRef<any>([]);
    const mappedFreq = useRef([]);
    datums.current = [
        0,
        0
    ];

    useEffect(() => {
        if (!data || data.length < 1) return;
        
        datums.current = data;
        // TOGGLE VIEWS HERE
        datums.current.dataArrayFreqFloat = datums.current.dataArrayFreqFloat.filter((d:any, i: number) => {if ((i + 1) % vizSkipAdjuster === 0) {return d}});
        datums.current.dataArrayFft = datums.current.dataArrayFft.filter((d:any, i: number) => {if ((i + 1) % vizSkipAdjuster === 0) {return d}});

        setBarWidth(width / (datums.current.analyser.frequencyBinCount * 1) * vizSkipAdjuster);
        
        if (datums.current.dataArrayFft[0] !== -Infinity && datums.current.dataArrayFft[0] !== Infinity) {
            setFftArray(datums.current.dataArrayFft.filter((d:any,i:any) => {if (d && i < 1024){ return d}}));
        }
       
        if (typeof datums.current.dataArrayFft[0] !== 'number') {
            return;
        }
        for (let i = 0; i < datums.current.bufferLength; i++) {
            if ((datums.current.dataArrayFft[i] / 128.0) === -Infinity) {
                return;
            }
    
            const y = datums.current.dataArrayFft[i] / 128;
            const z = datums.current.dataArrayFreqFloat[i];

            if (z) {
                mappedFreq.current[i] = {'x': i, 'y0': 0, 'y1': z * 100};
            }
        }
    }, [data, width]);
    
    const lastTick = useRef<any>();
    const tick = useRef<any>();
    const durationRef = useRef<any>();
    const start_time = Date.now();
    const time_frame = 10000;
    // const time_frame = 10 * (tick.current - lastTick.current);
    const margin = 20;
    // const duration = durationRef.current;
    // let time = Date.now() + duration;
    let time;
    //     let xScale: any = d3.scaleTime()
    //     .domain([0, time - start_time])
    //     .range([width - (margin *2), 0]);
    // let xAxis:any = d3.axisBottom(xScale);

    function update() {
        if (!isRecProp || !datums.current || datums.current.length < 1 || !fftArray || fftArray.length < 1 ) return;  
        time = Date.now();
        // d3.select('x.axis') <= use this for time
        //     .transition() <= use this for time
        //     .ease(d3.easeLinear) <= use this for time
        //     .duration(duration)  <= use this for time
        // datums.current.push({time - start_time, data.dataArrayFreqFloat[data.dataArrayFreqFloat.length - 1]);
        // let xScale: any = d3.scaleTime() <= use this for time
        let xScale: any = d3.scaleLinear()
            // .domain([0, time - start_time]) << ==use this for time
            .domain([1023,0])
            .range([width - (margin * 2), 0]);
        xScale.ticks(4);
        let xAxis:any = d3.axisBottom(xScale).ticks(4);

        let yScale = d3.scaleLinear()
            .domain([-1,1])
            .range([height - (margin*2), 0]);
        let yAxis:any = d3.axisRight(yScale);
        d3.select(bottomA.current)
            .join('x.axis')
            .attr('fill','none')
            .attr('stroke','black')
            .attr('transform', 'translate(0,' + (height - (margin * 2)) + ')')
            .call(xAxis)

        d3.select(leftA.current)
            .classed('y axis', true)
            .join('y.axis')
            .attr('fill','none')
            .attr('stroke','black')
            .call(yAxis);
        // const lineselection = d3.select(pathRef.current).join('path').attr('d', line);
        // .attr('transform', 'translate(' + -(xScale(datums.current[datums.current.length-1].x)) + ',' + margin + ')');
        
        const line = d3.line()
            .x(function(d: any) {
                return xScale(d.x * vizSkipAdjuster);
            })
            .y(function(d: any) { 
                return yScale(d.y) / 255; 
            });

        const lineselection = d3.select(pathRef.current).join('path');
            // console.log("DURATION>?>> ", durationRef.current);
        lineselection.interrupt()
            .transition()
            .ease(d3.easeLinear)
            .duration(durationRef.current)
            // .attr('transform', 'translate(' + -(xScale.range()[0]/((duration / 100)-2)) + ',' + margin + ')');
        const mappedFft = [];
        
        fftArray.map((d:any, i:number) => mappedFft.push({'x':i, 'y':d}));
        mappedFft.filter((d, i) => i < 1024);
        mappedFreq.current.filter((d, i) => i < 1024);
        
        const svg = d3.select(d3Container.current)
            .data([mappedFft]);
        svg
            .enter()
            .select('g')
            .attr('width', width)
            .attr('height', height)
            .join('g')

        d3.select(pathRef.current)
            .join('defs')
            .join('clipPath')
            .attr('id', 'clip')
            .join('rect')
            .attr('width', (width - (margin * 2)))
            .attr('height', (height - (margin * 2)))
            // .attr('transform', 'translate(-1.5, 20)');
   
        if (!datums.current || !datums.current.dataArrayFreqFloat || datums.current.dataArrayFreqFloat.length < 1 || fftArray.length < 1) return;
        d3.select(pathRef.current).join('path')
            .data([mappedFft])
            .attr("d", line)
            .join('path')
            .classed('line', true)
            .attr('clip-path', 'url(#clip)')
            .attr("stroke-width", 1.5)
            .style('fill', 'none')
            .style('stroke', 'blue')
            .transition().ease(d3.easeLinear)
            

        const barRect = d3.area()
            .x(function(d: any) {
                return xScale(d.x * vizSkipAdjuster);
            })
            .y0(function(d: any) { 
                return height - (margin * 2) - d.y1 * 100;})
            .y1(function(d: any) { 
                return yScale(d.y1 * 100); 
            });

        d3.select(d3Container.current)
            .data([mappedFreq.current]);
        mappedFreq.current = mappedFreq.current.filter((d: any) => d && d.y1);
        mappedFreq.current && mappedFreq.current.length > 0 && (mappedFreq.current.forEach((d: any, i: number) => {            
            d3.select(barRef.current)
                .join(`rect`)
                .attr('id', `bar_rect_${i}`)
                .data([mappedFreq.current])
                .select("#bar-rect_" + i)
                .attr('clip-path', 'url(#clip)')
                .attr("fill", "#69b3a2");
            d3.selectAll("#bar-rect_" + i)
                .transition()
                .ease(d3.easeLinear)
                .duration(durationRef.current)
            d3.selectAll("#bar-rect_" + i)    
                .attr('d', barRect)
                .attr("x", d.x * vizSkipAdjuster)
                .attr("y", Math.abs(height/4 - (d.y1 * 100)))
                .attr("width", barWidth)
                .attr("height", Math.abs((height/2) - (d.y1 * 100)));

            const barselection = d3.select("#bar-rect_" + i).data(mappedFreq.current); 

            if (data && data.length > 0 && isRecProp ){
                // datums.current.dataArrayFreqFloat.shift(); use this for time
                lineselection.attr('d', line(mappedFft.map((d)=>d)))
                    .classed('line_', true)

                barselection
                    .attr('d', barRect(mappedFreq.current.map((d)=>{
                        return d
                    })))
                    .classed('bar_', true)
                }
        }));

    }
    
    useEffect(() => {
        lastTick.current = tick.current;
        tick.current = Date.now();
        durationRef.current = tick.current - lastTick.current;
        update();   
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [datums.current, d3Container, height, width, isRecProp]);

    return (
        <>
        {datums.current && datums.current.length > 0 && (
        <svg
            className="d3-component"
            width={width}
            height={height}
            ref={d3Container}
            viewBox={`0 0 ${width} ${height}`}
            style={{ backgroundColor: "grey", fill: "green", overflow: "scroll" }}
        >
            <g style={{transform:'translate(0,0)'}} width={width} height={height + 2*margin} ref={barRef}>     
                {mappedFreq.current && mappedFreq.current.length > 0 && (mappedFreq.current.map((d: any, i: number) => {
                    return <rect  key={`bar-rect_${i}`} id={`bar-rect_${i}`} className="bar_rect"></rect>
                    }))
                }  
            </g>
            <g style={{width:width, height:0}} >
                <path ref={pathRef}></path>
            </g>
            <g ref={leftA}></g>
            <g ref={bottomA}></g>
            
        </svg>)
        }
        </>
    )
};
export default RealtimeAudioInput;
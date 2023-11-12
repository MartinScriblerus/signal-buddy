import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const RealtimeAudioInput = ({width,height, data}:{width:number,height:number, data?: any}) => {
    const d3Container = useRef(null);
    
    const [parsedData, setParsedData] = useState()
    const [barWidth, setBarWidth] = useState(1);
    const [barHeight, setBarHeight] = useState(0);
    const [dataTest1, setDataTest1] = useState([0, 3, 5, 7, 8]);
    const [widthAdjusted, setWidthAdjusted] = useState(width + (dataTest1.length * barWidth));
    const datums = useRef<Array<any>>([]);
    datums.current = [{
        x : 0,
        y: 0,
    }];

    // useEffect(() => {
    //     if (!data || data.length < 1) return;
    //     console.log('GOT THAT FUCKIN DATA: ', data);
    //     setBarWidth(width / (data.analyser.frequencyBinCount * 1));
    // }, [data]);

    // setInterval(() => {
    //     console.log('er wtf ', dataTest1);
    //     setDataTest1((d) => [...d, 3])
    // }, 1000);
    
    useEffect(() => {      
        const time_frame = 10000;
        const margin = 20;
        const duration = 1000;
        let time = Date.now() + duration;
        let start_time = time - (duration * 2) - time_frame;
        
        let xScale: any = d3.scaleTime()
            .domain([time + duration, time - (duration * 2) - time_frame])
            //    .domain([time - duration, start_time + duration])
            .range([width - (margin *2), 0]);
        // console.log('what is height? ', height);
        // console.log('what is margin? ', margin);
        let yScale: any = d3.scaleLinear()
            .domain([0,10])
            .range([height - (margin*2), 0]);
        
        let xAxis: any = d3.axisBottom(xScale)
            .ticks(4);
        
        let yAxis: any = d3.axisRight(yScale)
            .ticks(4);
        
        const svg = d3.select(d3Container.current);
        // console.log('hey SVG! ', svg);
        svg
            .enter()
            .attr('width', width)
            .attr('height', height)
            .join('g')
        
        svg
            .append('g')
            .attr('transform', 'translate(' + (width - margin * 2) + ',' + margin + ')')
            .classed('y axis', true)
            .call(yAxis);
        
        svg.append('g')
            .attr('transform', 'translate(0,' + (height - margin) + ')')
            .classed('x axis', true);
        
        svg.append('defs')
            .join('clipPath')
            .attr('id', 'clip')
            .append('rect')
            .attr('width', (width - (margin * 2)))
            .attr('height', (height - (margin * 2)))
            .attr('transform', 'translate(-1.5, 20)');
        console.log("hey data 1: ", datums.current);
        svg.append('g')
            .attr('clip-path', 'url(#clip)')
            .classed('line_', true)
            .append('path')
            .datum(datums.current)
            .classed('line', true)
            .style('fill', 'none')
            .style('stroke', 'magenta')
            .style('stroke-width', '1.5px');
            
        let interval = d3.interval(update, 1000);
        
        function update(){
            time = Date.now();

           // datums && datums[datums.length - 1] ? datums[datums.length - 1].x - ((time - start_time) / 1000) : 
                datums.current.push({'x': time, 'y': d3.randomUniform(0,9)()});

            
            if (datums.current.length > 0) {
                draw();
            }
        }
        
        function draw(){
         
            const line = d3.line()
                .x(function(d: any) { 
                
                    return xScale(d.x); 
                })
                .y(function(d: any) { 
                    return yScale(d.y); 
                });
        
            const lineselection = svg.selectAll('.line_')
                .select('path');
            
                // console.log("DATUMS?? ", datums.current);
                // console.log("ae we getting line? ", line);
                // // console.log("SANITY CHECK THE ECS: ", datums[datums.length-1].x);
            lineselection.interrupt()
                .transition()
                .duration(duration)
                .ease(d3.easeLinear)
                //.attr('transform', 'translate(' + -(xScale.range()[0]/((duration / 100)-2)) + ',' + margin + ')');
                .attr('transform', 'translate(' + -(xScale(datums.current[datums.current.length-1].x) -xScale.range()[0]) + ',' + margin + ')');
            
        
            if (datums.current[0].x < time - time_frame - duration ){
                    console.log('shift');
                        datums.current.shift();
            }
                
            lineselection.attr('d',line)
                .attr('transform', 'translate(0,' + margin + ')');
        
            
            
            start_time = time - (duration * 2) - time_frame;
        
            xScale.domain([time, time + (duration * 2) - time_frame])
                .range([width - (margin *2),0]);

            // console.log("THIS COULD BE PROB... ", d3.select(d3Container.current).selectAll('.x.axis'))
            
            d3.select(d3Container.current)
                .selectAll('.x.axis')
                .transition()
                .duration(duration)
                // .ease(d3.easeLinear)
                .call(xAxis);
        }

    }, [datums.current, d3Container, height, width]);

    


    
    return (
        <>
        {datums.current && datums.current.length && (
        <svg
            className="d3-component"
            width={width}
            height={height}
            ref={d3Container}
            style={{ backgroundColor: "grey", fill: "green", overflow: "scroll" }}
        />)
        }
        </>
    )
};
export default RealtimeAudioInput;
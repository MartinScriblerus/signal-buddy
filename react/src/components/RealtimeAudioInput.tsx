import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const RealtimeAudioInput = ({width,height, data}:{width:number,height:number, data?: any}) => {
    const d3Container = useRef(null);

    useEffect(
        () => {
            if (data && d3Container.current) {
                const svg = d3.select(d3Container.current);

                // Bind D3 data
                const update = svg
                    .append('g')
                    .selectAll('text')
                    .data(data);

                // Enter new D3 elements
                update.enter()
                    .append('text')
                    .attr('x', (d, i) => i * 25)
                    .attr('y', 40)
                    .style('font-size', 24)
                    .text((d: number) => d);

                // Update existing D3 elements
                update
                    .attr('x', (d, i) => i * 40)
                    .text((d: number) => d);

                // Remove old D3 elements
                update.exit()
                    .remove();
            }
        }, [data, d3Container])

    return (
        <svg
            className="d3-component"
            width={width}
            height={height}
            ref={d3Container}
        />
    )
};
export default RealtimeAudioInput;
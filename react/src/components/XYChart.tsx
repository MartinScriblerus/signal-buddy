// import React, { useRef, useState, useMemo } from 'react';
// import { Group } from '@visx/group';
// import { curveBasis } from '@visx/curve';
// import { LinePath } from '@visx/shape';
// import { Brush } from '@visx/brush';
// import { Bounds } from '@visx/brush/lib/types';
// import BaseBrush, { BaseBrushState, UpdateBrush } from '@visx/brush/lib/BaseBrush';
// import { PatternLines } from '@visx/pattern';
// import { Threshold } from '@visx/threshold';
// import { scaleTime, scaleLinear } from '@visx/scale';
// import { AxisLeft, AxisBottom } from '@visx/axis';
// import { GridRows, GridColumns } from '@visx/grid';
// import { LinearGradient } from '@visx/gradient';
// import { max, extent } from '@visx/vendor/d3-array';
// import { BrushHandleRenderProps } from '@visx/brush/lib/BrushHandle';
// import cityTemperature, { CityTemperature } from '@visx/mock-data/lib/mocks/cityTemperature';

// // Initialize some variables
// const brushMargin = { top: 10, bottom: 15, left: 50, right: 20 };
// const chartSeparation = 30;
// const PATTERN_ID = 'brush_pattern';
// const GRADIENT_ID = 'brush_gradient';
// export const accentColor = '#f6acc8';
// // export const background = '#584153';
// export const background2 = '#af8baf';
// const selectedBrushStyle = {
//   fill: `url(#${PATTERN_ID})`,
//   stroke: 'white',
// };

// export const background = '#f3f3f3';

// // accessors
// const date = (d: any) => Number(d.date);
// const ny = (d: any) => Number(d['New York']);
// const sf = (d: any) => Number(d['San Francisco']);
// const atx = (d: any) => Number(d['Austin']);


// export type BrushProps = {
//     width: number;
//     height: number;
//     margin?: { top: number; right: number; bottom: number; left: number };
//     compact?: boolean;
// };

// // scales
// const timeScale = scaleTime<number>({
//   domain: [Math.min(...cityTemperature.map(date)), Math.max(...cityTemperature.map(date))],
// });
// const temperatureScale = scaleLinear<number>({
//   domain: [
//     Math.min(...cityTemperature.map((d) => Math.min(ny(d), sf(d)))),
//     Math.max(...cityTemperature.map((d) => Math.max(ny(d), sf(d)))),
//   ],
//   nice: true,
// });

// const defaultMargin = { top: 40, right: 30, bottom: 50, left: 40 };

// export type ThresholdProps = {
//   width: number;
//   height: number;
//   margin?: { top: number; right: number; bottom: number; left: number };
//   newData: any;
// };

// const getDate = (d: any) => d.date;

// export default function Theshold({ 
//     compact = false,
//     width,
//     height,
//     margin = {
//       top: 20,
//       left: 50,
//       bottom: 20,
//       right: 20,
//     },
//   }: BrushProps) {
//   const stock = cityTemperature.slice(10); 
//   const [filteredStock, setFilteredStock] = useState(stock);

//   const onBrushChange = (domain: Bounds | null) => {
//     if (!domain) return;
//     const { x0, x1, y0, y1 } = domain;
//     const stockCopy = stock.filter((s) => {
//         console.log('the FUCK IS S? ', s);
//       const x = getDate(s).getTime();
//       const y0 = temperatureScale(ny(s)) ?? 0;
//       const y1 =  temperatureScale(ny(s)) ?? 0;
//       const y =  temperatureScale(ny(s)) ?? 0;
//       return x > x0 && x < x1 && y > y0 && y < y1;
//     });
//     setFilteredStock(stockCopy);
//   };

//   const innerHeight = height - margin.top - margin.bottom;
//   const topChartBottomMargin = compact ? chartSeparation / 2 : chartSeparation + 10;
//   const topChartHeight = 0.8 * innerHeight - topChartBottomMargin;
//   const bottomChartHeight = innerHeight - topChartHeight - chartSeparation;

//   // bounds
//   const xMax = Math.max(width - margin.left - margin.right, 0);
//   const yMax = Math.max(topChartHeight, 0);
//   const xBrushMax = Math.max(width - brushMargin.left - brushMargin.right, 0);
//   const yBrushMax = Math.max(bottomChartHeight - brushMargin.top - brushMargin.bottom, 0);
// console.log('FUCK // STOCK! ', stock);
//   const brushDateScale = useMemo(
//     () =>
//       scaleTime<number>({
//         range: [0, xBrushMax],
//         // domain: extent(cityTemperature[0].date) as unknown as [Date, Date],
//         domain: extent(cityTemperature[0].date) as any,
//       }),
//     [xBrushMax],
//   );
  
//   // const brushStockScale = useMemo(
//   //   () =>
//   //     scaleLinear({
//   //       range: [yBrushMax, 0],
//   //       domain: [0, temperatureScale, temperatureScale) || 0],
//   //       nice: true,
//   //     }),
//   //   [yBrushMax],
//   // );
//   const initialBrushPosition = useMemo(
//     () => ({
//       start: { x: timeScale(getDate(cityTemperature[50].date)) },
//       end: { x: timeScale(getDate(cityTemperature[0].date[100])) },
//     }),
//     [brushDateScale],
//   );

//   const brushRef = useRef<BaseBrush | null>(null);
//   const [filteredTemperature, setFilteredTemperature] = useState<any>([...cityTemperature]);


//   timeScale.range([0, xMax]);
//   temperatureScale.range([yMax, 0]);
//   console.log('OUY WUF ', cityTemperature);
//   console.log('TIME SCALE: ', timeScale);
//   return (
//     <div>
//       <svg width={width} height={height}>
//         <rect x={0} y={0} width={width} height={height} fill={background} rx={14} />
//         <Group left={margin.left} top={margin.top}>
//           <GridRows scale={temperatureScale} width={xMax} height={yMax} stroke="#e0e0e0" />
//           <GridColumns scale={timeScale} width={xMax} height={yMax} stroke="#e0e0e0" />
//           <line x1={xMax} x2={xMax} y1={0} y2={yMax} stroke="#e0e0e0" />
//           <AxisBottom top={yMax} scale={timeScale} numTicks={width > 520 ? 10 : 5} />
//           <AxisLeft scale={temperatureScale} />
//           <text x="-70" y="15" transform="rotate(-90)" fontSize={10}>
//             Temp... (°F)
//           </text>
//           <Threshold<any>
//             id={`${Math.random()}`}
//             data={cityTemperature}
//             x={(d) => timeScale(date(d)) ?? 0}
//             y0={(d) => temperatureScale(ny(d)) ?? 0}
//             y1={(d) => temperatureScale(sf(d)) ?? 0}
//             clipAboveTo={0}
//             clipBelowTo={yMax}
//             curve={curveBasis}
//             belowAreaProps={{
//               fill: 'violet',
//               fillOpacity: 0.4,
//             }}
//             aboveAreaProps={{
//               fill: 'green',
//               fillOpacity: 0.4,
//             }}
//           />
//           <LinePath
//             data={cityTemperature}
//             curve={curveBasis}
//             x={(d) => timeScale(date(d)) ?? 0}
//             y={(d) => temperatureScale(sf(d)) ?? 0}
//             stroke="#222"
//             strokeWidth={1.5}
//             strokeOpacity={0.8}
//             strokeDasharray="1,2"
//           />
//           <LinePath
//             data={cityTemperature}
//             curve={curveBasis}
//             x={(d) => timeScale(date(d)) ?? 0}
//             y={(d) => temperatureScale(ny(d)) ?? 0}
//             stroke="#222"
//             strokeWidth={1.5}
//           />
//         </Group>
//       </svg>

//       <svg width={width} height={height}>
//       <Brush
//         xScale={timeScale}
//         yScale={temperatureScale}
//         width={xBrushMax}
//         height={yBrushMax}
//         margin={brushMargin}
//         handleSize={8}
//         innerRef={brushRef}
//         resizeTriggerAreas={['left', 'right']}
//         brushDirection="horizontal"
//         initialBrushPosition={initialBrushPosition}
//         onChange={onBrushChange}
//         onClick={() => setFilteredStock(stock)}
//         selectedBoxStyle={selectedBrushStyle}
//         useWindowMoveEvents
//         renderBrushHandle={(props) => <BrushHandle x={0} y={0} width={0} height={0} isBrushActive={false} className={''}  />}
//       />
//         <rect x={0} y={0} width={width} height={height} fill={background} rx={14} />
//         <Group left={margin.left} top={margin.top}>
//           <GridRows scale={temperatureScale} width={xMax} height={yMax} stroke="#e0e0e0" />
//           <GridColumns scale={timeScale} width={xMax} height={yMax} stroke="#e0e0e0" />
//           <line x1={xMax} x2={xMax} y1={0} y2={yMax} stroke="#e0e0e0" />
//           <AxisBottom top={yMax} scale={timeScale} numTicks={width > 520 ? 10 : 5} />
//           <AxisLeft scale={temperatureScale} />
//           <text x="-70" y="15" transform="rotate(-90)" fontSize={10}>
//             Temperature (°F)
//           </text>
//           <Threshold<any>
//             id={`${Math.random()}`}
//             data={cityTemperature}
//             x={(d) => timeScale(date(d)) ?? 0}
//             y0={(d) => temperatureScale(ny(d)) ?? 0}
//             y1={(d) => temperatureScale(sf(d)) ?? 0}
//             clipAboveTo={0}
//             clipBelowTo={yMax}
//             curve={curveBasis}
//             belowAreaProps={{
//               fill: 'violet',
//               fillOpacity: 0.4,
//             }}
//             aboveAreaProps={{
//               fill: 'green',
//               fillOpacity: 0.4,
//             }}
//           />
//           <LinePath
//             data={cityTemperature}
//             curve={curveBasis}
//             x={(d) => timeScale(date(d)) ?? 0}
//             y={(d) => temperatureScale(sf(d)) ?? 0}
//             stroke="#222"
//             strokeWidth={1.5}
//             strokeOpacity={0.8}
//             strokeDasharray="1,2"
//           />
//           <LinePath
//             data={cityTemperature}
//             curve={curveBasis}
//             x={(d) => timeScale(date(d)) ?? 0}
//             y={(d) => temperatureScale(ny(d)) ?? 0}
//             stroke="#222"
//             strokeWidth={1.5}
//           />
//         </Group>
//       </svg>
//     </div>
//   );
// }

// // We need to manually offset the handles for them to be rendered at the right position
// function BrushHandle({ x, height, isBrushActive }: BrushHandleRenderProps) {
//   const pathWidth = 8;
//   const pathHeight = 15;
//   if (!isBrushActive) {
//     return null;
//   }
//   return (
//     <Group left={x + pathWidth / 2} top={(height - pathHeight) / 2}>
//       <path
//         fill="#f2f2f2"
//         d="M -4.5 0.5 L 3.5 0.5 L 3.5 15.5 L -4.5 15.5 L -4.5 0.5 M -1.5 4 L -1.5 12 M 0.5 4 L 0.5 12"
//         stroke="#999999"
//         strokeWidth="1"
//         style={{ cursor: 'ew-resize' }}
//       />
//     </Group>
//   );
// }
import React from 'react';
export default function Threshold() {
  return <div>Threshold</div>;
} 
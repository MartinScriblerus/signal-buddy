import React, { useRef, useState, useEffect } from 'react';
import { CityTemperature } from '@visx/mock-data/lib/mocks/cityTemperature';
import Button from '@mui/material/Button'
import ExampleControls from './ExampleControls';
import CustomChartBackground from './CustomChartBackground';
import BaseBrush from '@visx/brush/lib/BaseBrush';
import { LibrosaData } from './CreateChuck';

export type XYChartProps = {
  width: number;
  height: number;
  librosaData: LibrosaData;
  setTicksDatas: (x) => void;
  ticksDatas: Array<number>;
};

type City = 'San Francisco' | 'New York' | 'Austin' | 'Times' | 'Hzs' | 'Magnitudes';

export default function Example({ height, librosaData, setTicksDatas, ticksDatas }: XYChartProps) {
    const [dataVizControlsOpen, setDataVizControlsOpen] = useState(true);  
    const [newData, setNewData] = useState([]);

    const handleChangeDataVizControls = async () => {
      console.log('here in handleChangeDataVizControls!');
      const el = await document.getElementById('vizControls');
      if (dataVizControlsOpen) {
        el?.classList.add('invisible');
      } else {
        el?.classList.remove('invisible');
      }
      setDataVizControlsOpen(!dataVizControlsOpen);
    }

    useEffect(() => {
      setNewData([]);
      console.log('librosaData in XYChartWrapper: ', librosaData);
      if (!librosaData) {
        return;
      }
      
      (async() => {
        const newLibrosaData: LibrosaData | Promise<LibrosaData> = await librosaData;
        // newLibrosaData.pitches.times.forEach((a: any, idx: number) => {
        const testPitchMap = newLibrosaData.pitches.times.map((a: any) => a);
        const ticksData = newLibrosaData.boundTimes.map((a: any) => a);
        setTicksDatas(ticksData);
        console.log("TICKS DATA: ", ticksData);
        console.log("TEST PITCH MAP: ", testPitchMap);
        newLibrosaData.beats.forEach((a: any, idx: number) => {
          const index = newLibrosaData.pitches.times.indexOf(Math.floor(parseInt(String(a))));
          const midiNums = librosaData.pitches.midis.map((i) => +i);
          const maxMidiNum = Math.max(...midiNums);
          const parsedString: string | number = +a;
          const d = {
            // date: librosaData.pitches.times[index],
            date: +a.toFixed(3),
          };
          d['San Francisco'] = [];
          d.date = parsedString;
          d['San Francisco'] = librosaData.pitches.midis[index];
          // d['New York'] = +d['New York'];
          // d['Austin'] = librosaData.pitches.magnitudes[index];
          d['New York'] = +librosaData.pitches.magnitudes[index] + maxMidiNum;
          setNewData((newData) => [...newData, d]);
        });

      })();
    }, [librosaData]);

    useEffect(() => {
      console.log('^^^^^^^^^^^newData in XYChartWrapper: ', newData);
    }, [newData]);

    return (
    <>
      <Button id="btnDataVizControls" onClick={handleChangeDataVizControls}>Data Controls</Button>
        {<h1>{dataVizControlsOpen}</h1>}
      <ExampleControls>
      { ({
        accessors,
        animationTrajectory,
        annotationDataKey,
        annotationDatum,
        annotationLabelPosition,
        annotationType,
        colorAccessorFactory,
        config,
        curve,
        data,
        editAnnotationLabelPosition,
        numTicks,
        renderAreaSeries,
        renderAreaStack,
        renderBarGroup,
        renderBarSeries,
        renderBarStack,
        renderGlyph,
        renderGlyphSeries,
        enableTooltipGlyph,
        renderTooltipGlyph,
        renderHorizontally,
        renderLineSeries,
        setAnnotationDataIndex,
        setAnnotationDataKey,
        setAnnotationLabelPosition,
        sharedTooltip,
        showGridColumns,
        showGridRows,
        showHorizontalCrosshair,
        showTooltip,
        showVerticalCrosshair,
        snapTooltipToDatumX,
        snapTooltipToDatumY,
        stackOffset,
        theme,
        xAxisOrientation,
        yAxisOrientation,

        // components are animated or not depending on selection
        Annotation,
        AreaSeries,
        AreaStack,
        Axis,
        BarGroup,
        BarSeries,
        BarStack,
        GlyphSeries,
        Grid,
        LineSeries,
        AnnotationCircleSubject,
        AnnotationConnector,
        AnnotationLabel,
        AnnotationLineSubject,
        Tooltip,
        XYChart,
      }) => (
        <>
        {console.log('DATA IS>>>>>>> ', config)}
        {console.log('NEWDATA IS>>>>>>> ', newData)}
        
        <XYChart

          theme={theme}
          xScale={config.x}
          yScale={config.y}
          height={window.innerHeight - 120}
          width={window.innerWidth}
          captureEvents={!editAnnotationLabelPosition}
          onPointerUp={(d) => {
            setAnnotationDataKey(d.key as 'New York' | 'San Francisco' | 'Austin');
            setAnnotationDataIndex(d.index);
          }}
        >
          <CustomChartBackground />
          <Grid
            key={`grid-${animationTrajectory}`} // force animate on update
            rows={showGridRows}
            columns={showGridColumns}
            // animationTrajectory={animationTrajectory}
            numTicks={ticksDatas.length}
          />
          {renderBarStack && (
            <BarStack offset={stackOffset}>
              <BarSeries
                dataKey="New York"
                data={newData}
                xAccessor={accessors.x['New York']}
                yAccessor={accessors.y['New York']}
              />
              <BarSeries
                dataKey="San Francisco"
                data={newData}
                xAccessor={accessors.x['San Francisco']}
                yAccessor={accessors.y['San Francisco']}
              />
              <BarSeries
                dataKey="Austin"
                data={newData}
                xAccessor={accessors.x.Austin}
                yAccessor={accessors.y.Austin}
              />
            </BarStack>
          )}
          {renderBarGroup && (
            <BarGroup>
              <BarSeries
                dataKey="New York"
                data={newData}
                xAccessor={accessors.x['New York']}
                yAccessor={accessors.y['New York']}
                colorAccessor={colorAccessorFactory('New York')}
              />
              <BarSeries
                dataKey="San Francisco"
                data={newData}
                xAccessor={accessors.x['San Francisco']}
                yAccessor={accessors.y['San Francisco']}
                colorAccessor={colorAccessorFactory('San Francisco')}
              />
              <BarSeries
                dataKey="Austin"
                data={newData}
                xAccessor={accessors.x.Austin}
                yAccessor={accessors.y.Austin}
                colorAccessor={colorAccessorFactory('Austin')}
              />
            </BarGroup>
          )}
          {renderBarSeries && (
            <BarSeries
              dataKey="New York"
              data={newData}
              xAccessor={accessors.x['New York']}
              yAccessor={accessors.y['New York']}
              colorAccessor={colorAccessorFactory('New York')}
            />
          )}
          {renderAreaSeries && (
            <>
              <AreaSeries
                dataKey="Austin"
                data={newData}
                xAccessor={accessors.x.Austin}
                yAccessor={accessors.y.Austin}
                fillOpacity={0.4}
                curve={curve}
              />
              <AreaSeries
                dataKey="New York"
                data={newData}
                xAccessor={accessors.x['New York']}
                yAccessor={accessors.y['New York']}
                fillOpacity={0.4}
                curve={curve}
              />
              <AreaSeries
                dataKey="San Francisco"
                data={newData}
                xAccessor={accessors.x['San Francisco']}
                yAccessor={accessors.y['San Francisco']}
                fillOpacity={0.4}
                curve={curve}
              />
            </>
          )}
          {renderAreaStack && (
            <AreaStack curve={curve} offset={stackOffset} renderLine={stackOffset !== 'wiggle'}>
              <AreaSeries
                dataKey="Austin"
                data={newData}
                xAccessor={accessors.x.Austin}
                yAccessor={accessors.y.Austin}
                fillOpacity={0.4}
              />
              <AreaSeries
                dataKey="New York"
                data={newData}
                xAccessor={accessors.x['New York']}
                yAccessor={accessors.y['New York']}
                fillOpacity={0.4}
              />
              <AreaSeries
                dataKey="San Francisco"
                data={newData}
                xAccessor={accessors.x['San Francisco']}
                yAccessor={accessors.y['San Francisco']}
                fillOpacity={0.4}
              />
            </AreaStack>
          )}
          {renderLineSeries && (
            <>
              <LineSeries
                dataKey="Austin"
                data={newData}
                xAccessor={accessors.x.Austin}
                yAccessor={accessors.y.Austin}
                curve={curve}
              />
              {!renderBarSeries && (
                <LineSeries
                  dataKey="New York"
                  data={newData}
                  xAccessor={accessors.x['New York']}
                  yAccessor={accessors.y['New York']}
                  curve={curve}
                />
              )}
              <LineSeries
                dataKey="San Francisco"
                data={newData}
                xAccessor={accessors.x['San Francisco']}
                yAccessor={accessors.y['San Francisco']}
                curve={curve}
              />
            </>
          )}
          {renderGlyphSeries && (
            <GlyphSeries
              dataKey="San Francisco"
              data={newData}
              xAccessor={accessors.x['San Francisco']}
              yAccessor={accessors.y['San Francisco']}
              renderGlyph={renderGlyph}
              colorAccessor={colorAccessorFactory('San Francisco')}
            />
          )}
          <Axis
            key={`time-axis-${animationTrajectory}-${renderHorizontally}`}
            orientation={renderHorizontally ? yAxisOrientation : xAxisOrientation}
            numTicks={ticksDatas.length}
            // animationTrajectory={animationTrajectory}
          />
          <Axis
            key={`temp-axis-${animationTrajectory}-${renderHorizontally}`}
            label={
              stackOffset == null
                ? 'Number (°)'
                : stackOffset === 'expand'
                ? 'Fraction of total ... '
                : ''
            }
            orientation={renderHorizontally ? xAxisOrientation : yAxisOrientation}
            numTicks={ticksDatas.length}
            // animationTrajectory={animationTrajectory}
            // values don't make sense in stream graph
            tickFormat={stackOffset === 'wiggle' ? () => '' : undefined}
          />
          {annotationDataKey && annotationDatum && (
            <Annotation
              dataKey={annotationDataKey}
              datum={annotationDatum}
              dx={annotationLabelPosition.dx}
              dy={annotationLabelPosition.dy}
              editable={editAnnotationLabelPosition}
              canEditSubject={false}
              onDragEnd={({ dx, dy }) => setAnnotationLabelPosition({ dx, dy })}
            >
              <AnnotationConnector />
              {annotationType === 'circle' ? (
                <AnnotationCircleSubject />
              ) : (
                <AnnotationLineSubject />
              )}
              {annotationDatum.date}
              <AnnotationLabel
                title={annotationDataKey}
                subtitle={`${annotationDatum.date}, ${annotationDatum[annotationDataKey]}°F`}
                width={135}
                backgroundProps={{
                  stroke: theme.gridStyles.stroke,
                  strokeOpacity: 0.5,
                  fillOpacity: 0.8,
                }}
              />
            </Annotation>
          )}
          {showTooltip && (
            <Tooltip<CityTemperature>
              showHorizontalCrosshair={showHorizontalCrosshair}
              showVerticalCrosshair={showVerticalCrosshair}
              snapTooltipToDatumX={snapTooltipToDatumX}
              snapTooltipToDatumY={snapTooltipToDatumY}
              showDatumGlyph={(snapTooltipToDatumX || snapTooltipToDatumY) && !renderBarGroup}
              showSeriesGlyphs={sharedTooltip && !renderBarGroup}
              renderGlyph={enableTooltipGlyph ? renderTooltipGlyph : undefined}
              renderTooltip={({ tooltipData, colorScale }) => (
                <>
                  {/** date */}
                  {(tooltipData?.nearestDatum?.datum &&
                    accessors.date(tooltipData?.nearestDatum?.datum)) ||
                    'No date'}
                  <br />
                  <br />
                  {/** temperatures */}
                  {(
                    (sharedTooltip
                      ? Object.keys(tooltipData?.datumByKey ?? {})
                      : [tooltipData?.nearestDatum?.key]
                    ).filter((city) => city) as City[]
                  ).map((city) => {
                    const temperature =
                      tooltipData?.nearestDatum?.datum &&
                      accessors[renderHorizontally ? 'x' : 'y'][city](
                        tooltipData?.nearestDatum?.datum,
                      );

                    return (
                      <div key={city}>
                        <em
                          style={{
                            color: colorScale?.(city),
                            textDecoration:
                              tooltipData?.nearestDatum?.key === city ? 'underline' : undefined,
                          }}
                        >
                          {city}
                        </em>{' '}
                        {temperature == null || Number.isNaN(temperature)
                          ? '–'
                          : `${temperature}° F`}
                      </div>
                    );
                  })}
                </>
              )}
            />
          )}
        </XYChart>
        </>
      )}
      </ExampleControls>
    </>
  );
}
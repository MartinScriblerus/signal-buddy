/* eslint-disable jsx-a11y/accessible-emoji */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useCallback, useMemo, useState, useRef } from 'react';
import { lightTheme, darkTheme, XYChartTheme } from '@visx/xychart';
import { PatternLines } from '@visx/pattern';
import { GlyphProps } from '@visx/xychart/lib/types';
import { AnimationTrajectory } from '@visx/react-spring/lib/types';
import cityTemperature, { CityTemperature } from '@visx/mock-data/lib/mocks/cityTemperature';
import { GlyphCross, GlyphDot, GlyphStar } from '@visx/glyph';
import { curveLinear, curveStep, curveCardinal } from '@visx/curve';
import { RenderTooltipGlyphProps } from '@visx/xychart/lib/components/Tooltip';
import customTheme from './customTheme';
import userPrefersReducedMotion from './userPrefersReducedMotion';
import getAnimatedOrUnanimatedComponents from './getAnimatedOrUnanimatedComponents';
import buildChartTheme from './customTheme';
import {Box, Typography, InputLabel} from '@mui/material';
import styles from '../styles/VizControls.module.css';

const dateScaleConfig = { type: 'band', paddingInner: 0.3 } as const;
const temperatureScaleConfig = { type: 'linear' } as const;
const numTicks = 4;

const defaultAnnotationDataIndex = 13;
const selectedDatumPatternId = 'xychart-selected-datum';

type Accessor = (d: any) => number | string;

interface Accessors {
  'San Francisco': Accessor;
  'New York': Accessor;
  'Austin': Accessor;
}

type DataKey = keyof Accessors;

type SimpleScaleConfig = { type: 'band' | 'linear'; paddingInner?: number };

type ProvidedProps = {
  width?: any;
  height?: any;
  accessors: {
    x: Accessors;
    y: Accessors;
    date: Accessor;
  };
  newData: Array<any>;
  animationTrajectory?: AnimationTrajectory;
  annotationDataKey: DataKey | null;
  annotationDatum?: any;
  annotationLabelPosition: { dx: number; dy: number };
  annotationType?: 'line' | 'circle';
  colorAccessorFactory: (key: DataKey) => (d: any) => string | null;
  config: {
    x: SimpleScaleConfig;
    y: SimpleScaleConfig;
  };
  curve: typeof curveLinear | typeof curveCardinal | typeof curveStep;
  data: Array<any>;
  editAnnotationLabelPosition: boolean;
  numTicks: number;
  setAnnotationDataIndex: (index: number) => void;
  setAnnotationDataKey: (key: DataKey | null) => void;
  setAnnotationLabelPosition: (position: { dx: number; dy: number }) => void;
  renderAreaSeries: boolean;
  renderAreaStack: boolean;
  renderBarGroup: boolean;
  renderBarSeries: boolean;
  renderBarStack: boolean;
  renderGlyph: React.FC<GlyphProps<any>>;
  renderGlyphSeries: boolean;
  enableTooltipGlyph: boolean;
  renderTooltipGlyph: React.FC<RenderTooltipGlyphProps<any>>;
  renderHorizontally: boolean;
  renderLineSeries: boolean;
  sharedTooltip: boolean;
  showGridColumns: boolean;
  showGridRows: boolean;
  showHorizontalCrosshair: boolean;
  showTooltip: boolean;
  showVerticalCrosshair: boolean;
  snapTooltipToDatumX: boolean;
  snapTooltipToDatumY: boolean;
  stackOffset?: 'wiggle' | 'expand' | 'diverging' | 'silhouette';
  theme: XYChartTheme;
  xAxisOrientation: 'top' | 'bottom';
  yAxisOrientation: 'left' | 'right';
} & ReturnType<typeof getAnimatedOrUnanimatedComponents>;

type ControlsProps = {
  children: (props: ProvidedProps) => React.ReactNode;
};

export default function ExampleControls({ children }: ControlsProps ) {
  let u;
  Object.entries(children).length > 0 ? u = {children} : u = children

  const [useAnimatedComponents, setUseAnimatedComponents] = useState(!userPrefersReducedMotion());
  const [theme, setTheme] = useState<XYChartTheme>(buildChartTheme);
  const [animationTrajectory, setAnimationTrajectory] = useState<AnimationTrajectory | undefined>(
    'center',
  );
  const [gridProps, setGridProps] = useState<[boolean, boolean]>([false, false]);
  const [showGridRows, showGridColumns] = gridProps;
  const [xAxisOrientation, setXAxisOrientation] = useState<'top' | 'bottom'>('bottom');
  const [yAxisOrientation, setYAxisOrientation] = useState<'left' | 'right'>('left');
  const [renderHorizontally, setRenderHorizontally] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  // const [newDatas, setNewDatas] = useState<ProvidedProps['newData']>(newData);
  const [annotationDataKey, setAnnotationDataKey] =
    useState<ProvidedProps['annotationDataKey']>(null);
  const [annotationType, setAnnotationType] = useState<ProvidedProps['annotationType']>('circle');
  const [showVerticalCrosshair, setShowVerticalCrosshair] = useState(true);
  const [showHorizontalCrosshair, setShowHorizontalCrosshair] = useState(true);
  const [snapTooltipToDatumX, setSnapTooltipToDatumX] = useState(true);
  const [snapTooltipToDatumY, setSnapTooltipToDatumY] = useState(true);
  const [sharedTooltip, setSharedTooltip] = useState(true);
  const [renderBarStackOrGroup, setRenderBarStackOrGroup] = useState<
    'bar' | 'barstack' | 'bargroup' | 'none'
  >('none');
  const [renderAreaLineOrStack, setRenderAreaLineOrStack] = useState<
    'line' | 'area' | 'areastack' | 'none'
  >('areastack');
  const [stackOffset, setStackOffset] = useState<ProvidedProps['stackOffset']>();
  const [renderGlyphSeries, setRenderGlyphSeries] = useState(false);
  const [editAnnotationLabelPosition, setEditAnnotationLabelPosition] = useState(false);
  const [annotationLabelPosition, setAnnotationLabelPosition] = useState({ dx: -40, dy: -20 });
  const [annotationDataIndex, setAnnotationDataIndex] = useState(defaultAnnotationDataIndex);
  const [negativeValues, setNegativeValues] = useState(false);
  const [fewerDatum, setFewerDatum] = useState(false);
  const [missingValues, setMissingValues] = useState(false);
  const [glyphComponent, setGlyphComponent] = useState<'star' | 'cross' | 'circle' | '🍍'>('star');
  const [curveType, setCurveType] = useState<'linear' | 'cardinal' | 'step'>('linear');
  // const data = cityTemperature.slice(225, 275);
  const data = [];
  const dataMissingValues = data.map((d, i) =>
    i === 10 || i === 11
      ? { ...d, 'San Francisco': 'nope', 'New York': 'notanumber', Austin: 'null' }
      : d,
  );
  const dataSmall = data.slice(0, 15);
  const dataSmallMissingValues = dataMissingValues.slice(0, 15);
  const getDate = (d: any) => parseFloat(d.date).toFixed(3);
  const getSfTemperature = (d: any) => parseFloat(Number(d['San Francisco']).toFixed(3));
  const getNegativeSfTemperature = (d: any) => -parseFloat(getSfTemperature(d).toFixed(3));
  const getNyTemperature = (d: any) => parseFloat(Number(d['New York']).toFixed(3));
  const getAustinTemperature = (d: any) => parseFloat(Number(d.Austin).toFixed(3));
  
  const glyphOutline = theme.gridStyles.stroke;
  const renderGlyph = useCallback(
    ({
      x,
      y,
      size,
      color='var(white-80)',
      onPointerMove,
      onPointerOut,
      onPointerUp,
    }: GlyphProps<any>) => {
      const handlers = { onPointerMove, onPointerOut, onPointerUp };
      if (glyphComponent === 'star') {
        return (
          <GlyphStar
            left={x}
            top={y}
            stroke={glyphOutline}
            fill={color}
            size={size * 10}
            {...handlers}
          />
        );
      }
      if (glyphComponent === 'circle') {
        return (
          <GlyphDot
            left={x}
            top={y}
            stroke={glyphOutline}
            fill={color}
            r={size / 2}
            {...handlers}
          />
        );
      }
      if (glyphComponent === 'cross') {
        return (
          <GlyphCross
            left={x}
            top={y}
            stroke={glyphOutline}
            fill={color}
            size={size * 10}
            {...handlers}
          />
        );
      }
      return (
        <text x={x} y={y} dx="-0.75em" dy="0.25em" fontSize={14} {...handlers}>
          🍍
        </text>
      );
    },
    [glyphComponent, glyphOutline],
  );
  const [enableTooltipGlyph, setEnableTooltipGlyph] = useState(false);
  const [tooltipGlyphComponent, setTooltipGlyphComponent] = useState<
    'star' | 'circle'
  >('star');
  const renderTooltipGlyph = useCallback(
    ({
      x,
      y,
      size,
      color,
      onPointerMove,
      onPointerOut,
      onPointerUp,
      isNearestDatum,
    }: RenderTooltipGlyphProps<any>) => {
      const handlers = { onPointerMove, onPointerOut, onPointerUp };
      if (tooltipGlyphComponent === 'star') {
        return (
          <GlyphStar
            left={x}
            top={y}
            stroke={glyphOutline}
            fill={color}
            size={size * 10}
            {...handlers}
          />
        );
      }
      if (tooltipGlyphComponent === 'circle') {
        return (
          <GlyphDot left={x} top={y} stroke={glyphOutline} fill={color} r={size} {...handlers} />
        );
      }
      if (tooltipGlyphComponent === 'cross') {
        return (
          <GlyphCross
            left={x}
            top={y}
            stroke={glyphOutline}
            fill={color}
            size={size * 10}
            {...handlers}
          />
        );
      }
      return (
        <text x={x} y={y} dx="-0.75em" dy="0.25em" fontSize={14} {...handlers}>
          {isNearestDatum ? '🍍' : '🍌'}
        </text>
      );
    },
    [tooltipGlyphComponent, glyphOutline],
  );
  // for series that support it, return a colorAccessor which returns a custom color if the datum is selected
  const colorAccessorFactory = useCallback(
    (dataKey: DataKey) => (d: any) =>
      annotationDataKey === dataKey && d === data[annotationDataIndex]
        ? `url(#${selectedDatumPatternId})`
        : null,
    [annotationDataIndex, annotationDataKey],
  );

  const accessors = useMemo(
    () => ({
      x: {
        'San Francisco': renderHorizontally
          ? negativeValues
            ? getNegativeSfTemperature
            : getSfTemperature
          : getDate,
        'New York': renderHorizontally ? getNyTemperature : getDate,
        'Austin': renderHorizontally ? getAustinTemperature : getDate,
      },
      y: {
        'San Francisco': renderHorizontally
          ? getDate
          : negativeValues
          ? getNegativeSfTemperature
          : getSfTemperature,
        'New York': renderHorizontally ? getDate : getNyTemperature,
        'Austin': renderHorizontally ? getDate : getAustinTemperature,
      },
      date: getDate,
    }),
    [renderHorizontally, negativeValues],
  );

  const config = useMemo(
    () => ({
      x: renderHorizontally ? temperatureScaleConfig : dateScaleConfig,
      y: renderHorizontally ? dateScaleConfig : temperatureScaleConfig,
    }),
    [renderHorizontally],
  );

  // cannot snap to a stack position
  const canSnapTooltipToDatum =
    renderBarStackOrGroup !== 'barstack' && renderAreaLineOrStack !== 'areastack';

  return (
    <>
      {children({
        accessors,
        animationTrajectory,
        annotationDataKey,
        annotationDatum: data[annotationDataIndex],
        annotationLabelPosition,
        annotationType,
        colorAccessorFactory,
        config,
        newData: fewerDatum
        ? missingValues
          ? dataSmallMissingValues
          : dataSmall
        : missingValues
        ? dataMissingValues
        : data,
        curve:
          (curveType === 'cardinal' && curveCardinal) ||
          (curveType === 'step' && curveStep) ||
          curveLinear,
        data: fewerDatum
          ? missingValues
            ? dataSmallMissingValues
            : dataSmall
          : missingValues
          ? dataMissingValues
          : data,
        editAnnotationLabelPosition,
        numTicks,
        renderBarGroup: renderBarStackOrGroup === 'bargroup',
        renderBarSeries: renderBarStackOrGroup === 'bar',
        renderBarStack: renderBarStackOrGroup === 'barstack',
        renderGlyphSeries,
        renderGlyph,
        enableTooltipGlyph,
        renderTooltipGlyph,
        renderHorizontally,
        renderAreaSeries: renderAreaLineOrStack === 'area',
        renderAreaStack: renderAreaLineOrStack === 'areastack',
        renderLineSeries: renderAreaLineOrStack === 'line',
        setAnnotationDataIndex,
        setAnnotationDataKey,
        setAnnotationLabelPosition,
        sharedTooltip,
        showGridColumns,
        showGridRows,
        showHorizontalCrosshair,
        showTooltip,
        showVerticalCrosshair,
        snapTooltipToDatumX: canSnapTooltipToDatum && snapTooltipToDatumX,
        snapTooltipToDatumY: canSnapTooltipToDatum && snapTooltipToDatumY,
        stackOffset,
        theme,
        xAxisOrientation,
        yAxisOrientation,
        ...getAnimatedOrUnanimatedComponents(useAnimatedComponents),
      })}
      {/** This style is used for annotated elements via colorAccessor. */}

      <Box sx={{fontFamily: 'text.primary', width: "100%"}} id="vizControls"
        // className="invisible"
        style={{
          position: "absolute",
          textAlign: "left",
          background: "rgba(0, 0, 0, 0.7)",
          width: "40%",
          paddingLeft: "1rem",
        }}
      >
        <Box sx={{formFamily: 'text.primary', display: "flex", flexDirection: "row", width: "100%"}}>
          <Typography sx={{formFamily: 'type.primary', width: "20%"}}>graph</Typography>
          <Box sx={{display: "flex", width: "100%", flexDirection: "column"}}>
            <InputLabel sx={{display: "flex", flexDirection: "row"}}>
              <input
                type="radio"
                onChange={() => setRenderHorizontally(false)}
                checked={!renderHorizontally}
              />
              <Typography sx={{formFamily: 'type.primary', display: "flex", flexDirection: "row"}}>
                data vertical
              </Typography>
            </InputLabel>
            <InputLabel sx={{display: "flex", flexDirection: "row"}}>
              <input
                type="radio"
                onChange={() => setRenderHorizontally(true)}
                checked={renderHorizontally}
              />
              <Typography sx={{formFamily: 'type.primary'}}>
                data horizontal
              </Typography>
            </InputLabel>
            {/* <InputLabel sx={{display: "flex", flexDirection: "row"}}>
              <input
                type="radio"
                onChange={() => setXAxisOrientation('bottom')}
                checked={xAxisOrientation === 'bottom'}
              />
              <Typography sx={{formFamily: 'type.primary'}}>
                axis bottom
              </Typography>
            </InputLabel>
            <InputLabel sx={{display: "flex", flexDirection: "row"}}>
              <input
                type="radio"
                onChange={() => setXAxisOrientation('top')}
                checked={xAxisOrientation === 'top'}
              />
              <Typography sx={{formFamily: 'type.primary'}}>
                axis top
              </Typography>
            </InputLabel>
            <InputLabel sx={{display: "flex", flexDirection: "row"}}>
              <input
                type="radio"
                onChange={() => setYAxisOrientation('left')}
                checked={yAxisOrientation === 'left'}
              />
              <Typography sx={{formFamily: 'type.primary'}}>
                axis left
              </Typography>
            </InputLabel>
            <InputLabel sx={{display: "flex", flexDirection: "row"}}>
              <input
                type="radio"
                onChange={() => setYAxisOrientation('right')}
                checked={yAxisOrientation === 'right'}
              />
              <Typography sx={{formFamily: 'type.primary'}}>
              axis right
              </Typography>
            </InputLabel> */}
            <InputLabel sx={{display: "flex", flexDirection: "row"}}>
              <input
                type="checkbox"
                onChange={() => setNegativeValues(!negativeValues)}
                checked={negativeValues}
              />
              <Typography sx={{formFamily: 'type.primary'}}>
              negative values (SF)
              </Typography>
            </InputLabel>
            <InputLabel sx={{display: "flex", flexDirection: "row"}}>
              <input
                type="checkbox"
                onChange={() => setFewerDatum(!fewerDatum)}
                checked={fewerDatum}
              />
              <Typography sx={{formFamily: 'type.primary'}}>
                fewer datum
              </Typography>
            </InputLabel>
          </Box>
        </Box>
        <Box sx={{fontFamily: 'text.primary', display: "flex", flexDirection: "row", width: "100%" }}>
          <Typography sx={{formFamily: 'type.primary', width: "20%" }}>viz</Typography>
          <Box sx={{fontFamily: 'text.primary', display: "flex",  flexDirection: "column", width: "100%"}}>
            <InputLabel sx={{display: "flex", flexDirection: "row"}}>
              <input
                type="radio"
                onChange={() => {
                  if (renderBarStackOrGroup === 'barstack' || renderBarStackOrGroup === 'bargroup') {
                    setRenderBarStackOrGroup('none');
                  }
                  setRenderAreaLineOrStack('line');
                }}
                checked={renderAreaLineOrStack === 'line'}
              />
              <Typography sx={{formFamily: 'type.primary'}}>
              line
              </Typography>
            </InputLabel>
            <InputLabel sx={{display: "flex", flexDirection: "row"}}>
              <input
                type="radio"
                onChange={() => {
                  if (renderBarStackOrGroup === 'barstack' || renderBarStackOrGroup === 'bargroup') {
                    setRenderBarStackOrGroup('none');
                  }
                  setRenderAreaLineOrStack('area');
                }}
                checked={renderAreaLineOrStack === 'area'}
              />
            <Typography sx={{formFamily: 'type.primary'}}>
            area
            </Typography>
          </InputLabel>

          <Box>
        {/* {          
        renderAreaLineOrStack !== 'none' ?
          <Box
            sx={{
              display: "flex", 
              flexDirection: "row", 
              width: "100%" 
            }}
          >
            <Typography sx={{formFamily: "text.primary"}} >curve shape</Typography>
            <Box sx={{display: "flex", width: "60%", flexDirection: "column"}}>
            <InputLabel sx={{display: "flex", flexDirection: "row"}}>
                <input
                  type="radio"
                  // disabled={renderAreaLineOrStack === 'none'}
                  onChange={() => setCurveType('linear')}
                  checked={curveType === 'linear'}
                />
                <Typography sx={{formFamily: 'type.primary'}}>
                  linear
                </Typography>
              </InputLabel>
              <InputLabel sx={{display: "flex", flexDirection: "row"}}>
                <input
                  type="radio"
                  // disabled={renderAreaLineOrStack === 'none'}
                  onChange={() => setCurveType('cardinal')}
                  checked={curveType === 'cardinal'}
                />
                <Typography sx={{formFamily: 'type.primary'}}>
                cardinal (smooth)
                </Typography>
              </InputLabel>
              <InputLabel sx={{display: "flex", flexDirection: "row"}}>
                <input
                  type="radio"
                  // disabled={renderAreaLineOrStack === 'none'}
                  onChange={() => setCurveType('step')}
                  checked={curveType === 'step'}
                />
                <Typography sx={{formFamily: 'type.primary'}}>
                step
                </Typography>
              </InputLabel> 
            </Box>
          </Box> : null
        } */}
        </Box>
        <InputLabel sx={{display: "flex", flexDirection: "row"}}>
          <input
            type="radio"
            onChange={() => {
              if (renderAreaLineOrStack === 'areastack') {
                setRenderAreaLineOrStack('none');
              }
              setRenderBarStackOrGroup('bar');
            }}
            checked={renderBarStackOrGroup === 'bar'}
          />
          <Typography sx={{formFamily: 'type.primary'}}>
          bar
          </Typography>
        </InputLabel>
        <InputLabel sx={{display: "flex", flexDirection: "row"}}>
          <input
            type="radio"
            onChange={() => {
              setRenderAreaLineOrStack('none');
              setRenderBarStackOrGroup('bargroup');
            }}
            checked={renderBarStackOrGroup === 'bargroup'}
          />
          <Typography sx={{formFamily: 'type.primary'}}>
            bar group
          </Typography>
        </InputLabel>
        <InputLabel sx={{display: "flex", flexDirection: "row"}}>
          <input
            type="radio"
            onChange={() => setRenderBarStackOrGroup('none')}
            checked={renderBarStackOrGroup === 'none'}
          />
          <Typography sx={{formFamily: 'type.primary'}}>
          none
          </Typography>
        </InputLabel>
      </Box>
      {
        renderBarStackOrGroup === 'barstack' ? (
        <div>
        <strong>stack series offset</strong>
        <label>
          <input
            type="radio"
            disabled={
              renderAreaLineOrStack !== 'areastack' && renderBarStackOrGroup !== 'barstack'
            }
            onChange={() => setStackOffset(undefined)}
            checked={stackOffset == null}
          />
          auto (zero-baseline)
        </label>
        <label>
          <input
            type="radio"
            disabled={
              renderAreaLineOrStack !== 'areastack' && renderBarStackOrGroup !== 'barstack'
            }
            onChange={() => setStackOffset('expand')}
            checked={stackOffset === 'expand'}
          />
          expand (values sum to 1)
        </label>
        <label>
          <input
            type="radio"
            disabled={
              renderAreaLineOrStack !== 'areastack' && renderBarStackOrGroup !== 'barstack'
            }
            onChange={() => setStackOffset('wiggle')}
            checked={stackOffset === 'wiggle'}
          />
          wiggle (stream graph)
        </label>
        </div>) : null
      }
      </Box>
    </Box>
    </>
  );
}

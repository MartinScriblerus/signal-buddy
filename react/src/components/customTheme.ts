import { buildChartTheme } from '@visx/xychart';

export default buildChartTheme({
  backgroundColor: 'transparent',
  colors: ['rgba(230,204,174,1.000)', 'rgba(70,86,160,1.000)', 'rgba(15,178,158,1.000)'],
  gridColor: '#336d88',
  gridColorDark: '#1d1b38',
  svgLabelBig: { fill: '#f6f6f6' },
  tickLength: 8,
    // labels
    svgLabelSmall: { fill: '#f6f6f6', color: '#f6f6f6' },
    htmlLabel: { fill: '#f6f6f6', color: '#f6f6f6' },
  
    // lines
    xAxisLineStyles: { fill: '#f6f6f6', color: '#f6f6f6' },
    yAxisLineStyles: { fill: '#f6f6f6', color: '#f6f6f6' },
    xTickLineStyles: { fill: '#f6f6f6', color: '#f6f6f6' },
    yTickLineStyles: { fill: '#f6f6f6', color: '#f6f6f6' },

  
    // grid
    // gridColor: '#f6f6f6',
    // gridColorDark: 'pink', // used for axis baseline if x/yxAxisLineStyles not set
    // gridStyles?: CSSProperties;
});

import { buildChartTheme } from '@visx/xychart';

export default buildChartTheme({
  backgroundColor: 'transparent',
  colors: ['rgba(230,204,174,1.000)', 'rgba(70,86,160,1.000)', 'rgba(15,178,158,1.000)'],
  gridColor: '#336d88',
  gridColorDark: '#1d1b38',
  svgLabelBig: { fill: '#f6f6f6' },
  tickLength: 8,
});

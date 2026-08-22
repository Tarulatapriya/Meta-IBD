import ReactECharts from 'echarts-for-react';

export const ShapSummaryChart = ({ data }: { data: any[] }) => {
  const options = {
    tooltip: { trigger: 'item', formatter: (params: any) => `SHAP: ${params.value[0].toFixed(3)}` },
    grid: { left: '5%', right: '15%', bottom: '15%', top: '25%', containLabel: true },
    xAxis: { type: 'value', name: 'SHAP value', nameLocation: 'middle', nameGap: 20, splitLine: { show: false }, axisLabel: { fontSize: 10 } },
    yAxis: { type: 'value', show: false },
    visualMap: { itemWidth: 10, itemHeight: 60, min: 0, max: 1, calculable: true, orient: 'vertical', right: 0, top: 'center', inRange: { color: ['#0055ff', '#ff0055'] }, text: ['High', 'Low'], textStyle: { color: '#fff', fontSize: 10 } },
    series: [{
      type: 'scatter', symbolSize: 4,
      data: data
    }]
  };
  return <ReactECharts option={options} style={{ height: '400px' }} />;
};

export const FeatureImportanceChart = ({ data }: { data: any[] }) => {
  const options = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '10%', bottom: '15%', top: '25%', containLabel: true },
    xAxis: { type: 'value', name: 'Mean |SHAP|', nameLocation: 'middle', nameGap: 20, axisLabel: { fontSize: 10 } },
    yAxis: { type: 'category', data: data.map(d => d.name).reverse(), axisLabel: { fontSize: 10, width: 80, overflow: 'truncate' } },
    series: [{
      type: 'bar',
      data: data.map(d => d.value).reverse(),
      itemStyle: { color: '#8e44ad' }
    }]
  };
  return <ReactECharts option={options} style={{ height: '400px' }} />;
};

export const PathwayNetworkChart = ({ data }: { data: {nodes: any[], links: any[]} }) => {
  const options = {
    tooltip: {},
    series: [{
      type: 'graph', layout: 'force',
      data: data.nodes, links: data.links,
      roam: true, label: { show: true, position: 'right', formatter: '{b}', fontSize: 9 },
      force: { repulsion: 100, edgeLength: 30 }
    }]
  };
  return <ReactECharts option={options} style={{ height: '400px' }} />;
};

export const PathwayImpactChart = ({ data }: { data: any[] }) => {
  const options = {
    tooltip: { formatter: (p: any) => `${p.value[3]}<br>Impact: ${p.value[0].toFixed(2)}<br>-log(p): ${p.value[1].toFixed(2)}` },
    grid: { left: '10%', right: '10%', bottom: '15%', top: '25%', containLabel: true },
    xAxis: { name: 'Pathway Impact', nameLocation: 'middle', nameGap: 20, axisLabel: { fontSize: 10 } },
    yAxis: { name: '-log10(P value)', nameLocation: 'middle', nameGap: 20, axisLabel: { fontSize: 10 } },
    series: [{
      type: 'scatter',
      symbolSize: (data: any) => data[2] * 40,
      itemStyle: { color: '#f39c12', opacity: 0.7 },
      label: { show: true, formatter: (p: any) => p.value[3].split(' ')[0], fontSize: 9, position: 'top' },
      data: data
    }]
  };
  return <ReactECharts option={options} style={{ height: '400px' }} />;
};

export const MicrobiomeNetworkChart = ({ data }: { data: {nodes: any[], links: any[]} }) => {
  const options = {
    tooltip: {},
    series: [{
      type: 'graph', layout: 'circular',
      data: data.nodes, links: data.links,
      roam: true, label: { show: true, position: 'right', formatter: '{b}', fontSize: 9 },
      lineStyle: { color: 'source', curveness: 0.3, width: 1 }
    }]
  };
  return <ReactECharts option={options} style={{ height: '400px' }} />;
};

export const LongitudinalChart = ({ data }: { data: {timepoints: any[], series: any[]} }) => {
  const options = {
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0, textStyle: { color: '#ccc', fontSize: 10 }, itemWidth: 10, itemHeight: 10 },
    grid: { left: '10%', right: '5%', bottom: '20%', top: '25%', containLabel: true },
    xAxis: { type: 'category', data: data.timepoints, name: 'Time (wks)', nameLocation: 'middle', nameGap: 20, axisLabel: { fontSize: 10 } },
    yAxis: { type: 'value', name: 'Abundance', nameLocation: 'middle', nameGap: 25, axisLabel: { fontSize: 10 } },
    series: data.series.map(s => ({ ...s, type: 'line', smooth: true, symbolSize: 4 }))
  };
  return <ReactECharts option={options} style={{ height: '400px' }} />;
};

export const SankeyChart = ({ data }: { data: {nodes: any[], links: any[]} }) => {
  const options = {
    tooltip: { trigger: 'item', triggerOn: 'mousemove' },
    series: [{
      type: 'sankey', layout: 'none',
      data: data.nodes, links: data.links,
      nodeWidth: 15,
      nodeGap: 16,
      top: '20%',
      bottom: '10%',
      left: '5%',
      right: '20%',
      itemStyle: { borderWidth: 0 },
      lineStyle: { color: 'source', curveness: 0.5, opacity: 0.4 },
      label: { 
        fontSize: 9, 
        color: '#fff',
        formatter: (p: any) => p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name 
      }
    }]
  };
  return <ReactECharts option={options} style={{ height: '400px' }} />;
};

export const CircosChart = ({ data }: { data: {nodes: any[], links: any[]} }) => {
  const options = {
    tooltip: {},
    series: [{
      type: 'graph', layout: 'circular',
      data: data.nodes, links: data.links,
      roam: true, label: { show: true, position: 'right', formatter: '{b}', fontSize: 9 },
      lineStyle: { color: 'source', curveness: 0.3, opacity: 0.6 }
    }]
  };
  return <ReactECharts option={options} style={{ height: '400px' }} />;
};

export const RadarChart = ({ data }: { data: {indicator: any[], series: any[]} }) => {
  const options = {
    tooltip: {},
    legend: { data: ['IBD', 'nonIBD'], bottom: 0, textStyle: { color: '#ccc', fontSize: 10 }, itemWidth: 10, itemHeight: 10 },
    radar: { 
      indicator: data.indicator,
      axisName: { fontSize: 9, color: '#ccc', formatter: (val: string) => val.split(' ')[0] },
      center: ['50%', '55%'], radius: '60%'
    },
    series: [{
      type: 'radar',
      data: data.series,
      symbolSize: 4
    }]
  };
  return <ReactECharts option={options} style={{ height: '400px' }} />;
};

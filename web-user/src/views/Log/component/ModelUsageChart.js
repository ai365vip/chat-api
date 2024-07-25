import React from 'react';
import Chart from 'react-apexcharts';
import { Card, CardContent, Typography } from '@mui/material';

const originalModelColorMap = {
  'dall-e': 'rgb(180,60,160)',        // 深红
  'dall-e-3': 'rgb(60,120,180)',     // 深蓝

  'claude-3-5-sonnet-20240620': 'rgb(120,60,160)', // 深紫
  'claude-3-opus-20240229': 'rgb(80,120,120)',     // 深橙
  'claude-3-sonnet-20240229': 'rgb(40,160,80)',    // 深绿
  'claude-3-haiku-20240307': 'rgb(160,60,120)',    // 深粉
  'claude-2.1': 'rgb(60,100,160)',                 // 深钴蓝

  'gpt-3.5-turbo': 'rgb(50,120,130)',         // 深绿
  'gpt-3.5-turbo-0125': 'rgb(110,200,190)', 
  'gpt-3.5-turbo-1106': 'rgb(160,80,20)',    // 深橙
  'gpt-3.5-turbo-16k': 'rgb(140,60,140)',    // 深紫红
  'gpt-3.5-turbo-instruct': 'rgb(60,120,180)', // 深蓝

  'gpt-4': 'rgb(20,100,180)',                // 深蓝
  'gpt-4-0613': 'rgb(180,140,20)',           // 深金
  'gpt-4-1106-preview': 'rgb(140,40,140)',    // 暗红
  'gpt-4-0125-preview': 'rgb(60,160,120)',   // 深青绿
  'gpt-4-turbo-preview': 'rgb(120,60,140)',  // 深紫
  'gpt-4-32k': 'rgb(180,80,80)',             // 深珊瑚红
  'gpt-4-turbo': 'rgb(40,140,140)',          // 深青蓝
  'gpt-4-32k-0613': 'rgb(140,100,60)',       // 深棕
  'gpt-4-all': 'rgb(100,140,60)',            // 深橄榄绿
  'gpt-4-gizmo-*': 'rgb(160,120,160)',       // 深紫红
  'gpt-4-turbo-2024-04-09': 'rgb(60,140,100)', // 深薄荷绿

  'gpt-4o': 'rgb(100,100,180)',                // 深橙
  'gpt-4o-2024-05-13': 'rgb(100,60,140)',    // 深紫
  'gpt-4o-mini': 'rgb(140,160,40)',          // 深黄绿
  'gpt-4o-mini-2024-07-18': 'rgb(160,80,120)', // 深玫瑰红
  'gpt-4o-all': 'rgb(80,120,60)',            // 深苔绿

  'midjourney': 'rgb(180,180,20)',           // 深黄
  'mj-chat': 'rgb(60,80,140)',               // 深灰蓝

  'text-embedding-ada-002': 'rgb(140,100,120)',    // 深土黄
  'text-embedding-3-small': 'rgb(100,140,100)',   // 深灰绿
  'text-embedding-3-large': 'rgb(140,80,60)',     // 深赭石

  'tts-1': 'rgb(180,60,100)',              // 深桃红
  'tts-1-1106': 'rgb(60,120,140)',         // 深青灰
  'tts-1-hd': 'rgb(240,180,160)',           // 深卡其
  'tts-1-hd-1106': 'rgb(120,100,140)',     // 深紫灰

  'whisper-1': 'rgb(80,160,60)',           // 深草绿
};
// 额外的颜色，用于未指定的模型
const extraColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#20B2AA',
  '#FF8C00', '#00CED1', '#FF69B4', '#1E90FF', '#32CD32',
  '#FF7F50', '#8A2BE2', '#00FA9A', '#FF1493', '#00BFFF',
  '#ADFF2F', '#FF00FF', '#1ABC9C', '#F39C12', '#8E44AD'
];

const ModelUsageChart = ({ data }) => {
  let extraColorIndex = 0;

  const getColorForModel = (modelName) => {
    if (Object.prototype.hasOwnProperty.call(originalModelColorMap, modelName)) {
      return originalModelColorMap[modelName];
    } else {
      const color = extraColors[extraColorIndex];
      extraColorIndex = (extraColorIndex + 1) % extraColors.length;
      return color;
    }
  };

  const chartOptions = {
    chart: {
      type: 'pie',
      height: 350,
    },
    labels: data.map(item => item.model_name),
    colors: data.map(item => getColorForModel(item.model_name)),
    tooltip: {
      y: {
        formatter: function(value, { seriesIndex }) {
          return `次数: ${value}\n金额: $${data[seriesIndex].amount.toFixed(4)}`;
        }
      }
    },
    legend: {
      position: 'bottom',
      fontSize: '12px',
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: '60%'
        }
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  const series = data.map(item => item.count);

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          模型使用统计
        </Typography>
        <Chart
          options={chartOptions}
          series={series}
          type="pie"
          width="100%"
          height={350}
        />
      </CardContent>
    </Card>
  );
};

export default ModelUsageChart;

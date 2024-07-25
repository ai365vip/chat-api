import React from 'react';
import Chart from 'react-apexcharts';
import { Card, CardContent, Typography } from '@mui/material';

const originalModelColorMap = {
    'dall-e': 'rgb(255,215,0)',
    'claude-3-5-sonnet-20240620': 'rgb(253,135,93)',
    'dall-e-3': 'rgb(255,223,0)',
    'gpt-3.5-turbo': 'rgb(255,165,0)',
    'gpt-4o-2024-05-13': 'rgb(255,209,190)',
    'gpt-4o': 'rgb(255,175,146)',
    'gpt-3.5-turbo-1106': 'rgb(255,130,171)',
    'gpt-3.5-turbo-16k': 'rgb(255,160,122)',
    'gpt-4o-mini': 'rgb(255,174,185)',
    'gpt-3.5-turbo-instruct': 'rgb(175,238,238)',
    'gpt-4': 'rgb(255,105,180)',
    'gpt-4o-mini-2024-07-18': 'rgb(219,112,147)',
    'gpt-4-0613': 'rgb(199,21,133)',
    'gpt-4-1106-preview': 'rgb(0,0,255)',
    'gpt-4-0125-preview': 'rgb(65,105,225)',
    'gpt-4-turbo-preview': 'rgb(61,71,139)',
    'gpt-4-32k': 'rgb(90,105,205)',
    'gpt-4-turbo': 'rgb(104,111,238)',
    'gpt-4-32k-0613': 'rgb(100,149,237)',
    'gpt-4-all': 'rgb(30,144,255)',
    'gpt-4-gizmo-*': 'rgb(2,177,255)',
    'gpt-4-turbo-2024-04-09': 'rgb(2,177,236)',
    'gpt-4o-all': 'rgb(70,130,180)',
    'midjourney': 'rgb(135,206,235)',
    'mj-chat': 'rgb(119,255,214)',
    'text-embedding-ada-002': 'rgb(175,238,238)',
    'text-embedding-3-small': 'rgb(149,252,206)',
    'text-embedding-3-large': 'rgb(32,178,170)',
    'tts-1': 'rgb(60,179,113)',
    'tts-1-1106': 'rgb(131,220,131)',
    'tts-1-hd': 'rgb(184,227,167)',
    'tts-1-hd-1106': 'rgb(153,50,204)',
    'whisper-1': 'rgb(147,112,219)',
    'claude-3-opus-20240229': 'rgb(255,140,0)',
    'claude-3-sonnet-20240229': 'rgb(255,182,193)',
    'claude-3-haiku-20240307': 'rgb(245,245,220)',
    'claude-2.1': 'rgb(147,112,219)',
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

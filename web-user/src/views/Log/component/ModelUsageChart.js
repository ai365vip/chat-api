import React from 'react';
import Chart from 'react-apexcharts';
import { Card, CardContent, Typography } from '@mui/material';

const originalModelColorMap = {
  'dall-e': 'rgb(100,160,240)',      // 明亮的蓝紫色
  'claude-3-5-sonnet-20240620': 'rgb(80,200,200)', // 深青色
  'dall-e-3': 'rgb(220,120,240)',    // 亮紫色
  'gpt-3.5-turbo': 'rgb(160,220,255)', // 鲜艳的浅蓝色
  'gpt-4o-2024-05-13': 'rgb(140,240,160)', // 亮绿色
  'gpt-4o': 'rgb(200,100,220)',     // 鲜艳的紫色
  'gpt-3.5-turbo-1106': 'rgb(70,180,180)', // 鲜艳的深青灰
  'gpt-3.5-turbo-16k': 'rgb(180,255,100)', // 明亮的黄绿色
  'gpt-4o-mini': 'rgb(60,140,210)', // 鲜艳的深青蓝
  'gpt-3.5-turbo-instruct': 'rgb(255,140,100)', // 明亮的橙红色
  'gpt-4': 'rgb(170,240,90)',       // 鲜艳的苹果绿
  'gpt-4o-mini-2024-07-18': 'rgb(230,180,220)', // 鲜艳的玫瑰红
  'gpt-4-0613': 'rgb(100,210,120)',   // 鲜艳的森林绿
  'gpt-4-1106-preview': 'rgb(255,180,100)', // 鲜艳的橙黄色
  'gpt-4-0125-preview': 'rgb(240,140,220)', // 鲜艳的粉紫色
  'gpt-4-turbo-preview': 'rgb(120,230,140)', // 明亮的薄荷绿
  'gpt-4-32k': 'rgb(255,130,150)',   // 鲜艳的粉红色
  'gpt-4-turbo': 'rgb(80,150,230)', // 鲜艳的蓝色
  'gpt-4-32k-0613': 'rgb(220,80,80)', // 深红色
  'gpt-4-all': 'rgb(140,220,80)',      // 亮草绿色
  'gpt-4-gizmo-*': 'rgb(160,80,200)', // 深紫色
  'gpt-4-turbo-2024-04-09': 'rgb(255,140,180)', // 鲜艳的浅粉色
  'gpt-4o-all': 'rgb(100,180,255)',   // 鲜艳的天蓝色
  'midjourney': 'rgb(180,130,230)',  // 明亮的薰衣草色
  'mj-chat': 'rgb(255,160,160)',     // 明亮的粉红色
  'text-embedding-ada-002': 'rgb(130,170,255)', // 亮蓝紫色
  'text-embedding-3-small': 'rgb(120,190,255)', // 鲜艳的红色
  'text-embedding-3-large': 'rgb(70,130,220)', // 明亮的蓝色
  'tts-1': 'rgb(60,180,100)',        // 深绿色
  'tts-1-1106': 'rgb(255,120,120)',     // 亮珊瑚红
  'tts-1-hd': 'rgb(50,120,220)',    // 深蓝色
  'tts-1-hd-1106': 'rgb(100,220,220)', // 鲜艳的青色
  'whisper-1': 'rgb(160,230,100)',   // 鲜艳的黄绿色
  'claude-3-opus-20240229': 'rgb(90,170,240)', // 明亮的蓝色
  'claude-3-sonnet-20240229': 'rgb(240,170,100)', // 亮天蓝色
  'claude-3-haiku-20240307': 'rgb(140,200,255)', // 明亮的浅蓝色
  'claude-2.1': 'rgb(80,200,120)',   // 鲜艳的绿色
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

import React from 'react';
import Chart from 'react-apexcharts';
import { Card, CardContent, Typography } from '@mui/material';

const originalModelColorMap = {
  'dall-e': 'rgb(230,90,150)',        // 现代粉红
  'dall-e-3': 'rgb(60,130,190)',      // 深蓝

  'claude-3-5-sonnet-20240620': 'rgb(80,170,100)', // 翠绿
  'claude-3-opus-20240229': 'rgb(220,150,60)',     // 橙黄
  'claude-3-sonnet-20240229': 'rgb(70,190,180)',   // 青绿
  'claude-3-haiku-20240307': 'rgb(170,190,60)',    // 柠檬绿
  'claude-3-5-sonnet-20241022': 'rgb(80,170,100)', // 翠绿
  'claude-3-5-haiku-20241022': 'rgb(170,190,60)',    // 柠檬绿
  'claude-2.1': 'rgb(60,150,200)',                 // 天蓝

  'gpt-3.5-turbo': 'rgb(100,180,90)',         // 草绿
  'gpt-3.5-turbo-0125': 'rgb(100,200,190)',   // 蓝绿
  'gpt-3.5-turbo-1106': 'rgb(200,160,60)',    // 金黄
  'gpt-3.5-turbo-16k': 'rgb(150,100,170)',    // 淡紫
  'gpt-3.5-turbo-instruct': 'rgb(60,150,210)', // 亮蓝

  'gpt-4': 'rgb(50,130,140)',                // 深青
  'gpt-4-0613': 'rgb(170,190,60)',           // 黄绿
  'gpt-4-1106-preview': 'rgb(190,80,120)',    // 玫瑰红
  'gpt-4-0125-preview': 'rgb(60,180,150)',   // 绿松石
  'gpt-4-turbo-preview': 'rgb(120,170,80)',  // 橄榄绿
  'gpt-4-32k': 'rgb(80,170,150)',             // 青绿
  'gpt-4-turbo': 'rgb(210,100,100)',          // 珊瑚红
  'gpt-4-32k-0613': 'rgb(150,170,80)',       // 橄榄黄
  'gpt-4-all': 'rgb(100,170,90)',            // 苹果绿
  'gpt-4-gizmo-*': 'rgb(170,140,170)',       // 淡紫
  'gpt-4-turbo-2024-04-09': 'rgb(80,170,130)', // 薄荷绿

  'gpt-4o': 'rgb(120,150,190)',                // 钢蓝
  'gpt-4o-2024-05-13': 'rgb(150,120,170)',    // 淡紫罗兰
  'gpt-4o-2024-08-06': 'rgb(170,190,80)',    // 芥末绿
  'gpt-4o-2024-11-20': 'rgb(180,120,150)', // 梅红
  'gpt-4o-mini': 'rgb(170,190,80)',          // 芥末绿
  'gpt-4o-mini-2024-07-18': 'rgb(180,120,150)', // 梅红
  'gpt-4o-all': 'rgb(110,150,90)',            // 森林绿
  'o1-mini': 'rgb(120,150,190)',                // 钢蓝
  'o1-mini-2024-09-12': 'rgb(150,120,170)',    // 淡紫罗兰
  'o1-preview': 'rgb(170,190,80)',          // 芥末绿
  'o1-preview-2024-09-12': 'rgb(180,120,150)', // 梅红
  'o1': 'rgb(110,150,90)',            // 森林绿
  'o1-2024-12-17': 'rgb(120,150,190)',    // 钢蓝
  'midjourney': 'rgb(200,170,60)',           // 金黄
  'mj-chat': 'rgb(80,130,170)',              // 钴蓝

  "gpt-4o-realtime-preview-2024-10-01": 'rgb(120,150,190)',
  "gpt-4o-realtime-preview": 'rgb(150,120,170)',
  "gpt-4o-realtime-preview-2024-12-17": 'rgb(180,120,150)',
  "gpt-4o-audio-preview-2024-10-01": 'rgb(190,170,150)',
  "gpt-4o-audio-preview": 'rgb(190,170,150)',
  "gpt-4o-mini-realtime-preview": 'rgb(150,180,120)',
  "gpt-4o-mini-realtime-preview-2024-12-17": 'rgb(180,150,120)',

  "gemini-1.5-pro-001": 'rgb(70,130,210)',      // 深蓝
  "gemini-1.5-pro-latest": 'rgb(90,150,230)',   // 亮蓝
  "gemini-1.5-pro-002": 'rgb(110,170,250)',     // 天蓝
  "gemini-1.5-pro-preview-0514": 'rgb(80,140,220)',  // 中蓝
  "gemini-1.5-pro-exp-0801": 'rgb(100,160,240)',    // 浅蓝
  "gemini-1.5-pro-exp-0827": 'rgb(120,180,255)',    // 淡蓝

  "gemini-1.5-flash-001": 'rgb(150,100,220)',       // 深紫
  "gemini-1.5-flash-latest": 'rgb(170,110,240)',    // 亮紫
  "gemini-1.5-flash-002": 'rgb(190,120,255)',       // 淡紫
  "gemini-1.5-flash-preview-0514": 'rgb(160,105,230)', // 中紫
  "gemini-1.5-flash-exp-0827": 'rgb(180,115,245)',     // 浅紫

  "gemini-exp-1114": 'rgb(80,170,140)',     // 青绿
  "gemini-exp-1121": 'rgb(100,190,160)',    // 浅绿
  "gemini-exp-1206": 'rgb(120,210,180)',    // 薄荷绿

  "gemini-2.0-flash-exp": 'rgb(230,150,80)',           // 橙色
  "gemini-2.0-flash-thinking-exp-1219": 'rgb(250,170,100)',  // 浅橙

  'text-embedding-ada-002': 'rgb(150,170,100)',    // 橄榄绿
  'text-embedding-3-small': 'rgb(100,170,130)',   // 青绿
  'text-embedding-3-large': 'rgb(170,150,80)',     // 芥末黄

  'tts-1': 'rgb(210,100,120)',              // 桃红
  'tts-1-1106': 'rgb(80,150,170)',          // 青蓝
  'tts-1-hd': 'rgb(190,170,150)',           // 淡褐
  'tts-1-hd-1106': 'rgb(150,170,120)',      // 苔绿

  'whisper-1': 'rgb(100,190,80)',           // 亮绿
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

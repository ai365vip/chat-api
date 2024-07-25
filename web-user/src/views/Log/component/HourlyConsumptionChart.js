import React from 'react';
import Chart from 'react-apexcharts';
import { Card, CardContent, Typography } from '@mui/material';

const HourlyConsumptionChart = ({ data }) => {
  // 添加数据验证和错误处理
  const validData = data.filter(item => item && item.hour && typeof item.hour === 'string');

  // 处理时间，将小时加12
  const processedData = validData.map(item => {
    const [hour] = item.hour.split(':');
    const newHour = (parseInt(hour)) % 24;
    return {
      ...item,
      hour: `${newHour.toString().padStart(2, '0')}:00`
    };
  });

  // 对处理后的数据进行排序
  const sortedData = processedData.sort((a, b) => a.hour.localeCompare(b.hour));

  const chartOptions = {
    chart: {
      id: 'hourly-consumption',
      type: 'line',
      height: 350,
    },
    xaxis: {
      categories: sortedData.map(item => item.hour),
      labels: {
        formatter: function(value) {
          if (value && typeof value === 'string' && value.includes(':')) {
            return value.split(':')[0] + 'h';
          }
          return value;
        }
      }
    },
    yaxis: [
      {
        title: {
          text: '次数',
        },
        labels: {
          formatter: function(val) {
            return Math.round(val);
          }
        }
      },
      {
        opposite: true,
        title: {
          text: '金额',
        },
        labels: {
          formatter: function(val) {
            return val.toFixed(2);
          }
        }
      },
    ],
    stroke: {
      curve: 'smooth',
    },
    title: {
      text: '每小时消耗统计',
      align: 'left',
    },
    legend: {
      position: 'top',
    },
    tooltip: {
      y: [
        {
          formatter: function(val) {
            return Math.round(val);
          }
        },
        {
          formatter: function(val) {
            return val.toFixed(4);
          }
        }
      ]
    }
  };

  const series = [
    {
      name: '次数',
      data: sortedData.map(item => item.count),
    },
    {
      name: '金额',
      data: sortedData.map(item => item.amount),
    },
  ];

  // 如果没有有效数据，显示提示信息
  if (sortedData.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            每小时消耗统计
          </Typography>
          <Typography>
            暂无数据
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Chart
          options={chartOptions}
          series={series}
          type="line"
          height={350}
        />
      </CardContent>
    </Card>
  );
};

export default HourlyConsumptionChart;

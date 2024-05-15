import PropTypes from 'prop-types';
import { Grid, Typography } from '@mui/material';
import Chart from 'react-apexcharts';
import SkeletonTotalGrowthBarChart from 'ui-component/cards/Skeleton/TotalGrowthBarChart';
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';

const StatisticalBarChart = ({ isLoading, chartDatas }) => {
  const renderChart = () => {
    if (!chartDatas || !chartDatas.xaxis || !chartDatas.data) {
      return <Typography variant="body2">无可用数据</Typography>;
    }
  
    const updatedChartData = {
      ...defaultChartData,
      options: {
        ...defaultChartData.options,
        xaxis: { ...defaultChartData.options.xaxis, categories: chartDatas.xaxis },
      },
      series: chartDatas.data,
    };
  
    return <Chart options={updatedChartData.options} series={updatedChartData.series} type={updatedChartData.type} height={updatedChartData.height} />;
  };
  
  return (
    <>
      {isLoading ? (
        <SkeletonTotalGrowthBarChart />
      ) : (
        <MainCard>
          <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
              <Grid container alignItems="center" justifyContent="space-between">
                <Grid item>
                  <Typography variant="h3">统计</Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              {renderChart()}
            </Grid>
          </Grid>
        </MainCard>
      )}
    </>
  );
};

StatisticalBarChart.propTypes = {
  isLoading: PropTypes.bool,
  chartDatas: PropTypes.shape({
    xaxis: PropTypes.arrayOf(PropTypes.string).isRequired,
    data: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        data: PropTypes.arrayOf(PropTypes.number).isRequired,
      })
    ).isRequired,
  }).isRequired,
};

export default StatisticalBarChart;

const defaultChartData = {
  height: 480,
  type: 'bar',
  options: {
    chart: {
      id: 'bar-chart',
      stacked: true,
      toolbar: {
        show: true
      },
      zoom: {
        enabled: true
      }
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: 'bottom',
            offsetX: -10,
            offsetY: 0
          }
        }
      }
    ],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '50%'
      }
    },
    xaxis: {
      type: 'category',
      categories: []
    },
    legend: {
      show: true,
      fontSize: '14px',
      fontFamily: `'Roboto', sans-serif`,
      position: 'bottom',
      offsetX: 20,
      labels: {
        useSeriesColors: false
      },
      markers: {
        width: 16,
        height: 16,
        radius: 5
      },
      itemMargin: {
        horizontal: 15,
        vertical: 8
      }
    },
    fill: {
      type: 'solid'
    },
    dataLabels: {
      enabled: false
    },
    grid: {
      show: true
    },
    tooltip: {
      theme: 'dark',
      fixed: {
        enabled: false
      },
      y: {
        formatter: function (val) {
          return '$' + val;
        }
      },
      marker: {
        show: false
      }
    }
  },
  series: []
};

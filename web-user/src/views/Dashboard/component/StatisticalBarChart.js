import PropTypes from 'prop-types';
import { Grid, Typography, Box, CircularProgress, TextField } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Chart from 'react-apexcharts';
import SkeletonTotalGrowthBarChart from 'ui-component/cards/Skeleton/TotalGrowthBarChart';
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import { useTheme } from '@mui/material/styles';

const StatisticalBarChart = ({ isLoading, isRefreshing, chartDatas, startDate, endDate, onDateChange }) => {
  const theme = useTheme();

  const getChartOptions = () => ({
    ...defaultChartData.options,
    chart: {
      ...defaultChartData.options.chart,
      background: 'transparent',
      foreColor: theme.palette.text.primary,
    },
    theme: {
      mode: theme.palette.mode
    },
    tooltip: {
      theme: theme.palette.mode,
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
    },
    legend: {
      ...defaultChartData.options.legend,
      labels: {
        colors: theme.palette.text.primary
      }
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 4,
      show: true
    },
    xaxis: {
      ...defaultChartData.options.xaxis,
      labels: {
        style: {
          colors: theme.palette.text.secondary
        }
      },
      axisBorder: {
        color: theme.palette.divider
      },
      axisTicks: {
        color: theme.palette.divider
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: theme.palette.text.secondary
        }
      }
    }
  });

  const renderChart = () => {
    if (!chartDatas || !chartDatas.xaxis || !chartDatas.data || chartDatas.data.length === 0 || chartDatas.data.every(series => series.data.length === 0)) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <Typography variant="h6" color="textSecondary">无可用数据</Typography>
        </Box>
      );
    }
  
    const updatedChartData = {
      ...defaultChartData,
      options: {
        ...getChartOptions(),
        xaxis: { 
          ...getChartOptions().xaxis,
          categories: chartDatas.xaxis 
        },
      },
      series: chartDatas.data,
    };
  
    return (
      <Box position="relative">
        {isRefreshing && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            bgcolor="rgba(255, 255, 255, 0.7)"
            zIndex={1}
          >
            <CircularProgress />
          </Box>
        )}
        <Chart 
          options={updatedChartData.options} 
          series={updatedChartData.series} 
          type={updatedChartData.type} 
          height={updatedChartData.height} 
        />
      </Box>
    );
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
                <Grid item>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          label="开始日期"
                          value={startDate}
                          onChange={(newValue) => onDateChange(newValue, endDate)}
                          renderInput={(params) => <TextField {...params} />}
                          disabled={isRefreshing}
                        />
                      </LocalizationProvider>
                    </Grid>
                    <Grid item>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          label="结束日期"
                          value={endDate}
                          onChange={(newValue) => onDateChange(startDate, newValue)}
                          renderInput={(params) => <TextField {...params} />}
                          disabled={isRefreshing}
                        />
                      </LocalizationProvider>
                    </Grid>
                  </Grid>
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
  isRefreshing: PropTypes.bool,
  chartDatas: PropTypes.shape({
    xaxis: PropTypes.arrayOf(PropTypes.string).isRequired,
    data: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        data: PropTypes.arrayOf(PropTypes.number).isRequired,
      })
    ).isRequired,
  }).isRequired,
  startDate: PropTypes.instanceOf(Date).isRequired,
  endDate: PropTypes.instanceOf(Date).isRequired,
  onDateChange: PropTypes.func.isRequired,
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
    fill: {
      type: 'solid'
    },
    dataLabels: {
      enabled: false
    }
  },
  series: []
};

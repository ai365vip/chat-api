import PropTypes from 'prop-types';
import { useTheme, styled } from '@mui/material/styles';
import { Box, Grid, Typography } from '@mui/material';
import Chart from 'react-apexcharts';
import MainCard from 'ui-component/cards/MainCard';
import SkeletonTotalOrderCard from 'ui-component/cards/Skeleton/EarningCard';

const CardWrapper = styled(MainCard, {
  shouldForwardProp: (prop) => prop !== 'color'
})(({ theme, color }) => {
  const colorPalette = color ? theme.palette.augmentColor({ color: { main: color } }) : theme.palette.primary;
  const bgColor = theme.palette.mode === 'dark' ? colorPalette.dark : colorPalette.lighter;
  const pseudoElementColor = theme.palette.mode === 'dark' ? theme.palette.grey[800] : colorPalette.main;

  return {
    backgroundColor: bgColor,
    color: theme.palette.mode === 'dark' ? '#fff' : colorPalette.dark,
    overflow: 'hidden',
    position: 'relative',
    '&>div': {
      position: 'relative',
      zIndex: 5
    },
    '&:after': {
      content: '""',
      position: 'absolute',
      width: 210,
      height: 210,
      background: pseudoElementColor,
      borderRadius: '50%',
      zIndex: 1,
      top: -85,
      right: -95,
      [theme.breakpoints.down('sm')]: {
        top: -105,
        right: -140
      }
    },
    '&:before': {
      content: '""',
      position: 'absolute',
      zIndex: 1,
      width: 210,
      height: 210,
      background: pseudoElementColor,
      borderRadius: '50%',
      top: -125,
      right: -15,
      opacity: 0.5,
      [theme.breakpoints.down('sm')]: {
        top: -155,
        right: -70
      }
    }
  };
});

const StatisticalLineChartCard = ({ isLoading, title, chartData, todayValue, color }) => {
  const theme = useTheme();
  const colorPalette = color ? theme.palette.augmentColor({ color: { main: color } }) : theme.palette.primary;

  return (
    <>
      {isLoading ? (
        <SkeletonTotalOrderCard />
      ) : (
        <CardWrapper border={false} content={false} color={color}>
          <Box sx={{ p: 2.25, minHeight: 160 }}>
            <Grid container direction="column">
              <Grid item sx={{ mb: 0.75 }}>
                <Grid container alignItems="center">
                  <Grid item xs={6}>
                    <Grid container alignItems="center">
                      <Grid item>
                        <Typography sx={{ fontSize: '2.125rem', fontWeight: 600, mr: 1, mt: 1.75, mb: 0.75 }}>
                          {todayValue || '0'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography
                          sx={{
                            fontSize: '1rem',
                            fontWeight: 500,
                            color: theme.palette.mode === 'dark' ? theme.palette.grey[400] : colorPalette.dark
                          }}
                        >
                          {title}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {chartData ? (
                      <Chart {...chartData} />
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          color: theme.palette.mode === 'dark' ? theme.palette.grey[400] : colorPalette.dark
                        }}
                      >
                        无数据
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </CardWrapper>
      )}
    </>
  );
};

StatisticalLineChartCard.propTypes = {
  isLoading: PropTypes.bool,
  title: PropTypes.string,
  chartData: PropTypes.object,
  todayValue: PropTypes.string,
  color: PropTypes.string
};

export default StatisticalLineChartCard;

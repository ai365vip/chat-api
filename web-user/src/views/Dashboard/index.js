import { useEffect, useState, useCallback } from 'react';
import { Grid, Typography, Box, Skeleton } from '@mui/material';
import { gridSpacing } from 'store/constant';
import StatisticalLineChartCard from './component/StatisticalLineChartCard';
import StatisticalBarChart from './component/StatisticalBarChart';
import { generateChartOptions, getDaysBetween, getTodayDay } from 'utils/chart';
import { API } from 'utils/api';
import { showError, calculateQuota, renderNumber } from 'utils/common';
import UserCard from 'ui-component/cards/UserCard';
import { useSelector } from 'react-redux';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PaymentsIcon from '@mui/icons-material/Payments';
import ApiIcon from '@mui/icons-material/Api';

const Dashboard = () => {
  const [isLoading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statisticalData, setStatisticalData] = useState({ data: [], xaxis: [] });
  const [requestChart, setRequestChart] = useState(null);
  const [quotaChart, setQuotaChart] = useState(null);
  const [tokenChart, setTokenChart] = useState(null);
  const [users, setUsers] = useState([]);
  const account = useSelector((state) => state.account);
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 7)));
  const [endDate, setEndDate] = useState(new Date());

  const fetchDashboardData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const startTimestamp = Math.floor(startDate.getTime() / 1000);
      const endTimestamp = Math.floor(endDate.getTime() / 1000);
      const res = await API.get(`/api/user/dashboard?start=${startTimestamp}&end=${endTimestamp}`);
      const { success, data } = res.data;
      if (success && Array.isArray(data)) {
        const lineData = getLineDataGroup(data, startDate, endDate);
        setRequestChart(getLineCardOption(lineData, 'RequestCount'));
        setQuotaChart(getLineCardOption(lineData, 'Quota'));
        setTokenChart(getLineCardOption(lineData, 'PromptTokens'));
        setStatisticalData(getBarDataGroup(data, startDate, endDate));
      }
    } catch (error) {
      showError(`获取仪表盘数据时出错: ${error.message}`);
    } finally {
      setIsRefreshing(false);
    }
  }, [startDate, endDate]);

  const loadUser = async () => {
    try {
      const res = await API.get('/api/user/self');
      const { success, message, data } = res.data;
      if (success) {
        setUsers(data);
      } else {
        showError(message || '获取用户数据失败');
      }
    } catch (error) {
      showError(`获取用户数据时出错: ${error.message}`);
    }
  };

  useEffect(() => {
    if (account.user) {
      setLoading(true);
      Promise.all([fetchDashboardData(), loadUser()]).finally(() => {
        setLoading(false);
      });
    }
  }, [account.user, fetchDashboardData]);

  const handleDateChange = (newStartDate, newEndDate) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    fetchDashboardData();
  };

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        <Grid container spacing={gridSpacing}>
          <Grid item lg={4} xs={12}>
            <StatisticalLineChartCard
              isLoading={isLoading}
              isRefreshing={isRefreshing}
              title="今日请求量"
              chartData={requestChart?.chartData}
              todayValue={requestChart?.todayValue}
            />
          </Grid>
          <Grid item lg={4} xs={12}>
            <StatisticalLineChartCard
              isLoading={isLoading}
              isRefreshing={isRefreshing}
              title="今日消费"
              chartData={quotaChart?.chartData}
              todayValue={quotaChart?.todayValue}
            />
          </Grid>
          <Grid item lg={4} xs={12}>
            <StatisticalLineChartCard
              isLoading={isLoading}
              isRefreshing={isRefreshing}
              title="今日Token"
              chartData={tokenChart?.chartData}
              todayValue={tokenChart?.todayValue}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={gridSpacing}>
          <Grid item lg={8} xs={12}>
            <StatisticalBarChart 
              isLoading={isLoading}
              isRefreshing={isRefreshing}
              chartDatas={statisticalData} 
              startDate={startDate}
              endDate={endDate}
              onDateChange={handleDateChange}
            />
          </Grid>
          <Grid item lg={4} xs={12}>
            <UserCard>
              <Grid 
                container 
                spacing={3} 
                sx={{
                  padding: '24px',
                  '& .MuiGrid-item': {
                    display: 'flex',
                    alignItems: 'center'
                  }
                }}
              >
                <Grid item xs={12} sm={12} md={12}>
                  <Box
                    sx={{
                      display: 'flex',
                      width: '100%',
                      alignItems: 'center',
                      backgroundColor: (theme) => theme.palette.mode === 'dark' 
                        ? 'rgba(0, 0, 0, 0.1)' 
                        : 'rgba(94, 53, 177, 0.1)',
                      borderRadius: 2,
                      padding: 2
                    }}
                  >
                    <AccountBalanceWalletIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">余额</Typography>
                      <Typography variant="h4" color="primary">
                        {isLoading ? (
                          <Skeleton width={100} />
                        ) : (
                          '$' + calculateQuota(users?.quota || 0)
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: (theme) => theme.palette.mode === 'dark' 
                        ? 'rgba(245, 124, 0, 0.15)' 
                        : 'rgba(245, 124, 0, 0.1)',
                      borderRadius: 2,
                      padding: 2
                    }}
                  >
                    <PaymentsIcon sx={{ fontSize: 32, color: 'orange.main', mr: 2 }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">已使用</Typography>
                      <Typography variant="h5" sx={{ color: 'rgb(245, 124, 0)' }}>
                        {isLoading ? (
                          <Skeleton width={80} />
                        ) : (
                          '$' + calculateQuota(users?.used_quota || 0)
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: (theme) => theme.palette.mode === 'dark' 
                        ? 'rgba(0, 200, 83, 0.15)' 
                        : 'rgba(0, 200, 83, 0.1)',
                      borderRadius: 2,
                      padding: 2
                    }}
                  >
                    <ApiIcon sx={{ fontSize: 32, color: 'success.main', mr: 2 }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">调用次数</Typography>
                      <Typography variant="h5" color="success.main">
                        {isLoading ? (
                          <Skeleton width={80} />
                        ) : (
                          renderNumber(users?.request_count || 0)
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </UserCard>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Dashboard;


const getLineDataGroup = (statisticalData, startDate, endDate) => {
  let groupedData = statisticalData.reduce((acc, cur) => {
    if (!acc[cur.Day]) {
      acc[cur.Day] = {
        date: cur.Day,
        RequestCount: 0,
        Quota: 0,
        PromptTokens: 0,
        CompletionTokens: 0
      };
    }
    acc[cur.Day].RequestCount += cur.RequestCount;
    acc[cur.Day].Quota += cur.Quota;
    acc[cur.Day].PromptTokens += cur.PromptTokens;
    acc[cur.Day].CompletionTokens += cur.CompletionTokens;
    return acc;
  }, {});

  const days = getDaysBetween(startDate, endDate);
  return days.map((day) => {
    if (!groupedData[day]) {
      return {
        date: day,
        RequestCount: 0,
        Quota: 0,
        PromptTokens: 0,
        CompletionTokens: 0
      };
    } else {
      return groupedData[day];
    }
  });
};

// Dashboard.js (continued)

const getBarDataGroup = (data, startDate, endDate) => {
  const days = getDaysBetween(startDate, endDate);
  const result = [];
  const map = new Map();

  for (const item of data) {
    if (!map.has(item.ModelName)) {
      const newData = { name: item.ModelName, data: new Array(days.length).fill(0) };
      map.set(item.ModelName, newData);
      result.push(newData);
    }
    const index = days.indexOf(item.Day);
    if (index !== -1) {
      const rawQuotaValue = item.Quota;
      const calculatedQuotaValue = parseFloat(calculateQuota(rawQuotaValue));

      if (!isNaN(calculatedQuotaValue)) {
        map.get(item.ModelName).data[index] += calculatedQuotaValue;
      } else {
        console.error(`Error: Calculated quota value is not a number for ModelName: ${item.ModelName} on Day: ${item.Day}`);
      }
    }
  }

  return { data: result, xaxis: days };
};

const getLineCardOption = (lineDataGroup, field) => {
  const today = getTodayDay();
  let todayValue = 0;
  let chartData = null;

  const lineData = lineDataGroup.map((item) => {
    const tmp = {
      date: item.date,
      value: item[field]
    };
    if (field === 'Quota') {
      tmp.value = calculateQuota(item.Quota);
    } else if (field === 'PromptTokens') {
      tmp.value += item.CompletionTokens;
    }
    if (item.date === today) {
      todayValue = tmp.value;
    }
    return tmp;
  });

  switch (field) {
    case 'RequestCount':
      chartData = generateChartOptions(lineData, '次');
      todayValue = renderNumber(todayValue);
      break;
    case 'Quota':
      chartData = generateChartOptions(lineData, '美元');
      todayValue = '$' + renderNumber(todayValue);
      break;
    case 'PromptTokens':
      chartData = generateChartOptions(lineData, '');
      todayValue = renderNumber(todayValue);
      break;
    default:
      break;
  }

  return { chartData, todayValue };
};

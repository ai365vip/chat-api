import { useEffect, useState, useCallback } from 'react';
import { Grid, Typography } from '@mui/material';
import { gridSpacing } from 'store/constant';
import StatisticalLineChartCard from './component/StatisticalLineChartCard';
import StatisticalBarChart from './component/StatisticalBarChart';
import { generateChartOptions, getDaysBetween, getTodayDay } from 'utils/chart';
import { API } from 'utils/api';
import { showError, calculateQuota, renderNumber } from 'utils/common';
import UserCard from 'ui-component/cards/UserCard';
import { useSelector } from 'react-redux';

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
              <Grid container spacing={gridSpacing} justifyContent="center" alignItems="center" paddingTop={'20px'}>
                <Grid item xs={4}>
                  <Typography variant="h4">余 额:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="h3"> {users?.quota ? '$' + calculateQuota(users.quota) : '未知'}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="h4">已使用:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="h3"> {users?.used_quota ? '$' + calculateQuota(users.used_quota) : '未知'}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="h4">调用次数:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="h3"> {users?.request_count || '未知'}</Typography>
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

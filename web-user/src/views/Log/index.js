import { useState, useEffect } from 'react';
import { showError, renderQuota, isAdmin } from 'utils/common';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import PerfectScrollbar from 'react-perfect-scrollbar';
import TablePagination from '@mui/material/TablePagination';
import LinearProgress from '@mui/material/LinearProgress';
import ButtonGroup from '@mui/material/ButtonGroup';
import Toolbar from '@mui/material/Toolbar';
import { useNavigate } from 'react-router';
import { Button, Card, Box, Grid } from '@mui/material';
import LogTableRow from './component/TableRow';
import LogTableHead from './component/TableHead';
import TableToolBar from './component/TableToolBar';
import { API } from 'utils/api';
import { ITEMS_PER_PAGE } from 'constants';
import { IconRefresh, IconSearch, IconPhoto, IconChartBar } from '@tabler/icons-react';
import HourlyConsumptionChart from './component/HourlyConsumptionChart';
import ModelUsageChart from './component/ModelUsageChart';

export default function Log() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const startOfTodayTimestamp = now.getTime() / 1000;
  const endTimestamp = new Date().getTime() / 1000 + 600;
  const originalKeyword = {
    p: 0,
    username: '',
    token_name: '',
    model_name: '',
    start_timestamp: startOfTodayTimestamp,
    end_timestamp: endTimestamp,
    type: 0,
    channel: ''
  };

  const [logs, setLogs] = useState([]);
  const [activePage, setActivePage] = useState(0);
  const [searching, setSearching] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState(originalKeyword);
  const [initPage, setInitPage] = useState(true);
  const userIsAdmin = isAdmin();
  const navigate = useNavigate();
  const [rowsPerPage, setRowsPerPage] = useState(ITEMS_PER_PAGE);
  const [logCount, setLogCount] = useState(ITEMS_PER_PAGE);
  const [stat, setStat] = useState({
    quota: 0,
    tpm: 0,
    rpm: 0
  });
  const [showChart, setShowChart] = useState(true);
  const [hourlyData, setHourlyData] = useState([]);
  const [modelData, setModelData] = useState([]);

  const toggleChart = async () => {
    if (!showChart) {
      await fetchChartData();
    }
    setShowChart(!showChart);
  };

  const fetchChartData = async () => {
    try {
      const res = await API.get('/api/log/hourly-stats', { params: searchKeyword });
      const { success, hourly_data, model_data } = res.data;
      if (success) {
        setHourlyData(hourly_data);
        setModelData(model_data);
      } else {
        showError('获取统计数据失败');
      }
    } catch (error) {
      showError('获取统计数据时发生错误');
    }
  };

  const loadLogs = async (startIdx) => {
    setSearching(true);
    const url = userIsAdmin ? '/api/log/' : '/api/log/self/';
    const query = { ...searchKeyword, p: startIdx, pageSize: rowsPerPage };
    if (!userIsAdmin) {
      delete query.username;
      delete query.channel;
    }
    try {
      const res = await API.get(url, { params: query });
      const { success, message, data, total } = res.data;
      if (success) {
        if (startIdx === 0) {
          setLogs(data);
          setLogCount(total);
        } else {
          let newLogs = [...logs];
          newLogs.splice(startIdx * rowsPerPage, data.length, ...data);
          setLogs(newLogs);
          setLogCount(total);
        }
      } else {
        showError(message);
      }
    } catch (error) {
      showError('加载日志时发生错误');
    } finally {
      setSearching(false);
    }
  };

  const getLogSelfStat = async () => {
    const query = { ...searchKeyword };
    const url = 'api/log/self/stat';
    if (!userIsAdmin) {
      delete query.username;
      delete query.channel;
    }
    try {
      const res = await API.get(url, { params: query });
      const { success, message, data } = res.data;
      if (success) {
        setStat(data);
      } else {
        showError(message);
      }
    } catch (error) {
      showError('获取统计数据时发生错误');
    }
  };

  const onPaginationChange = (event, newPage) => {
    if (newPage === Math.ceil(logs.length / rowsPerPage)) {
      loadLogs(newPage);
    }
    setActivePage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setActivePage(0);
    loadLogs(0);
  };

  const searchLogs = async (event) => {
    event.preventDefault();
    await loadLogs(0);
    setActivePage(0);
    getLogSelfStat();
    if (showChart) {
      await fetchChartData();
    }
  };

  const handleSearchKeyword = (event) => {
    setSearchKeyword({ ...searchKeyword, [event.target.name]: event.target.value });
  };

  const handleRefresh = () => {
    setInitPage(true);
    getLogSelfStat();
    if (showChart) {
      fetchChartData();
    }
  };

  const goToLogPage = () => {
    navigate('/mjlog');
  };

  useEffect(() => {
    setSearchKeyword(originalKeyword);
    setActivePage(0);
    loadLogs(0).catch((reason) => {
      showError(reason);
    });
    setInitPage(false);
    getLogSelfStat();
    fetchChartData(); 
  }, [initPage, rowsPerPage]);

  return (
    <>
      <Card>
        <Box component="form" onSubmit={searchLogs} noValidate>
          <TableToolBar filterName={searchKeyword} handleFilterName={handleSearchKeyword} userIsAdmin={userIsAdmin} />
        </Box>
        <Toolbar
          sx={{
            display: 'flex',
            flexDirection: ['column', 'row'],
            alignItems: 'center',
            justifyContent: 'space-between',
            p: (theme) => theme.spacing(0, 2),
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            minHeight: '64px',
            '& h3': {
              fontSize: '1.2rem',
              margin: '10px 0',
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start'
            },
            '& .MuiButtonGroup-root': {
              margin: (theme) => theme.spacing(1, 0),
            }
          }}
        >
          <h3>
            总消耗额度：<span style={{ color: '#5ca941' }}>{renderQuota(stat.quota, 2)}</span>,
            RPM: <span style={{ color: '#ff5722' }}>{stat.rpm}</span>,
            TPM: <span style={{ color: '#2196f3' }}>{stat.tpm}</span>
          </h3>
          <ButtonGroup variant="outlined" aria-label="outlined primary button group">
            <Button onClick={toggleChart} startIcon={<IconChartBar width={'18px'} />}>
              {showChart ? '隐藏图表' : '显示图表'}
            </Button>
            <Button onClick={handleRefresh} startIcon={<IconRefresh width={'18px'} />}>
              重置
            </Button>
            <Button onClick={searchLogs} startIcon={<IconSearch width={'18px'} />}>
              搜索
            </Button>
            <Button onClick={goToLogPage} startIcon={<IconPhoto width={'18px'} />}>
              MJ
            </Button>
          </ButtonGroup>
        </Toolbar>

        {showChart && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <ModelUsageChart data={modelData} />
            </Grid>
            <Grid item xs={12} md={6}>
              <HourlyConsumptionChart data={hourlyData} />
            </Grid>
          </Grid>
        )}

        {searching && <LinearProgress />}
        <PerfectScrollbar component="div">
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <LogTableHead userIsAdmin={userIsAdmin} />
              <TableBody>
                {logs && logs.length > 0 && logs.slice(activePage * rowsPerPage, (activePage + 1) * rowsPerPage).map((row, index) => (
                  <LogTableRow item={row} key={`${row.id}_${index}`} userIsAdmin={userIsAdmin} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </PerfectScrollbar>
        <TablePagination
          component="div"
          page={activePage}
          count={logCount}
          rowsPerPage={rowsPerPage}
          onPageChange={onPaginationChange}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </Card>
    </>
  );
}

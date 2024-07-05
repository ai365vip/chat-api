import { useState, useEffect } from 'react';
import { showError,renderQuota } from 'utils/common';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import PerfectScrollbar from 'react-perfect-scrollbar';
import TablePagination from '@mui/material/TablePagination';
import LinearProgress from '@mui/material/LinearProgress';
import ButtonGroup from '@mui/material/ButtonGroup';
import Toolbar from '@mui/material/Toolbar';
import { useNavigate } from 'react-router';
import { Button, Card, Box } from '@mui/material';
import LogTableRow from './component/TableRow';
import LogTableHead from './component/TableHead';
import TableToolBar from './component/TableToolBar';
import { API } from 'utils/api';
import { isAdmin } from 'utils/common';
import { ITEMS_PER_PAGE } from 'constants';
import { IconRefresh, IconSearch,IconPhoto } from '@tabler/icons-react';

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
  const loadLogs = async (startIdx) => {
    setSearching(true);
    const url = userIsAdmin ? '/api/log/' : '/api/log/self/';
    const query = searchKeyword;

    query.p = startIdx;
    query.pageSize = rowsPerPage;
    if (!userIsAdmin) {
      delete query.username;
      delete query.channel;
    }
    const res = await API.get(url, { params: query });
    const { success, message, data,total } = res.data;
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
    setSearching(false);
  };

  const getLogSelfStat = async () => {
    const query = searchKeyword;
    const url = 'api/log/self/stat';

    if (!userIsAdmin) {
      delete query.username;
      delete query.channel;
    }
    const res = await API.get(url, { params: query });
    const {success, message, data} = res.data;
    if (success) {
        setStat(data);
    } else {
        showError(message);
    }
};

  const onPaginationChange = (event, newPage) => {
    (async () => {
      if (newPage === Math.ceil(logs.length / rowsPerPage)) {
        // 需要加载更多数据
        await loadLogs(newPage);
      }
      setActivePage(newPage);
    })();
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
    getLogSelfStat()
    return;
  };

  const handleSearchKeyword = (event) => {
    setSearchKeyword({ ...searchKeyword, [event.target.name]: event.target.value });
  };

  // 处理刷新
  const handleRefresh = () => {
    setInitPage(true);
    getLogSelfStat()
  };
  const goToLogPage = () => {
    navigate('/mjlog');
  };

  useEffect(() => {
    setSearchKeyword(originalKeyword);
    setActivePage(0);
    loadLogs(0)
      .then()
      .catch((reason) => {
        showError(reason);
      });
    setInitPage(false);
    getLogSelfStat()
  }, [initPage,rowsPerPage]);

  return (
    <>
      <Card>
        <Box component="form" onSubmit={searchLogs} noValidate>
          <TableToolBar filterName={searchKeyword} handleFilterName={handleSearchKeyword} userIsAdmin={userIsAdmin} />
        </Box>
        <Toolbar
          sx={{
            display: 'flex',
            flexDirection: ['column', 'row'], // 在小屏设备上使用列布局，在大屏设备上使用行布局
            alignItems: 'center',
            justifyContent: 'space-between',
            p: (theme) => theme.spacing(0, 2),
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            minHeight: '64px',
            '& h3': {
              fontSize: '1.2rem',
              margin: '10px 0', // 在小屏设备上提供一些垂直间距
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start'
            },
            '& .MuiButtonGroup-root': {
              margin: (theme) => theme.spacing(1, 0), // 在小屏设备上提供一些垂直间距
            }
          }}
        >
          <h3>
            总消耗额度：<span style={{ color: '#5ca941' }}>{renderQuota(stat.quota, 2)}</span>,
            RPM: <span style={{ color: '#ff5722' }}>{stat.rpm}</span>,
            TPM: <span style={{ color: '#2196f3' }}>{stat.tpm}</span>
          </h3>
          <ButtonGroup variant="outlined" aria-label="outlined primary button group">
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
          rowsPerPageOptions={[10, 25, 50, 100]}  // 确保这里的选项包含了默认的每页行数
        />



      </Card>
    </>
  );
}

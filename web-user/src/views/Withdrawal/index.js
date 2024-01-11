import React, { useState, useEffect } from 'react';
import { showError } from 'utils/common';
import {
  Card,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,Box,Tooltip
} from '@mui/material';
import WithdrawalTableHead from './component/TableHead';
import { API } from 'utils/api';
import Pagination from '@mui/material/Pagination';

const statusMap = {
  1: { label: '待处理', color: 'orange' },
  2: { label: '已批准', color: 'blue' },
  3: { label: '已拒绝', color: 'red' },
  4: { label: '已处理', color: 'green' }
};
const ROWS_PER_PAGE = 15;

export default function Log() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [page, setPage] = useState(1); // 当前页码

  const loadWithdrawals = async () => {
    try {
      let res = await API.get('/api/user/userwithdrawals');
      const { success, message, data } = res.data;
      if (success && Array.isArray(data)) {
        setWithdrawals(data);
      } else {
        showError(message);
        setWithdrawals([]);
      }
    } catch (err) {
      showError(err.message);
      setWithdrawals([]);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000); // 假设 timestamp 是秒级别的时间戳
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} `
         + `${String(date.getHours()).padStart(2, '0')}:`
         + `${String(date.getMinutes()).padStart(2, '0')}:`
         + `${String(date.getSeconds()).padStart(2, '0')}`;
  };

  const getStatusColor = (status) => {
    return statusMap[status] ? statusMap[status].color : 'grey';
  };
  

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const paginatedWithdrawals = () => {
    const startIndex = (page - 1) * ROWS_PER_PAGE;
    const endIndex = startIndex + ROWS_PER_PAGE;
    return withdrawals.slice(startIndex, endIndex);
  };

  useEffect(() => {
    loadWithdrawals();
  }, []);

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">提现记录</Typography>
      </Stack>
      <Card>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <WithdrawalTableHead />
            <TableBody>
              {withdrawals && withdrawals.length > 0 ? (
                paginatedWithdrawals().map((withdrawals, index) => (
                  <TableRow key={index}>
                    
                    <TableCell align="right">
                      {withdrawals.created !== undefined ?
                        formatDate(withdrawals.created) : '无'}
                    </TableCell>

                    <TableCell align="right">
                      {withdrawals.order_number !== undefined  ?
                        withdrawals.order_number : '无'}
                    </TableCell>

                    <TableCell align="right">
                      {withdrawals.withdrawal_amount !== undefined && withdrawals.withdrawal_amount !== 0 ?
                        (withdrawals.withdrawal_amount/500000 ).toFixed(2) : '无'}
                    </TableCell>
                    <TableCell align="right">
                      {withdrawals.alipay_account !== undefined  ?
                        withdrawals.alipay_account : '无'}
                    </TableCell>
                    <TableCell align="right">
                      {withdrawals.comment && withdrawals.comment.length > 10 ? (
                        <Tooltip title={withdrawals.comment} placement="top">
                          <Typography noWrap>{withdrawals.comment.slice(0, 10) + '...'}</Typography>
                        </Tooltip>
                      ) : (
                        <Typography noWrap>{withdrawals.comment || '无'}</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                    <Typography style={{ color: getStatusColor(withdrawals.status) }}>
                      {withdrawals.status !== undefined ?
                        statusMap[withdrawals.status] ? statusMap[withdrawals.status].label : '未知状态' : '无'}
                    </Typography>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                   没有提现记录
                  </TableCell>
                </TableRow>
              )}

            </TableBody>
          </Table>
        </TableContainer>
      </Card>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', m: 2 }}>
      <Pagination
        count={Math.ceil(withdrawals.length / ROWS_PER_PAGE)}
        page={page}
        onChange={handleChangePage}
        color="primary"
      />
    </Box>
    </>
  );
}

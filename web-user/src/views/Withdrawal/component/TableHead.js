
import { TableCell, TableHead, TableRow } from '@mui/material';

const WithdrawalTableHead = () => {
  return (
    <TableHead>
      <TableRow>
        <TableCell>提交时间</TableCell>
        <TableCell>订单号</TableCell>
        <TableCell>提现金额</TableCell>
        <TableCell>支付宝账号</TableCell>
        <TableCell>处理信息</TableCell>
        <TableCell>处理状态</TableCell>
      </TableRow>
    </TableHead>
  );
};

export default WithdrawalTableHead;

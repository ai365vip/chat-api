
import { TableCell, TableHead, TableRow } from '@mui/material';

const LogTableHead = () => {
  return (
    <TableHead>
      <TableRow>
        <TableCell>时间</TableCell>
        <TableCell>令牌</TableCell>
        <TableCell>类型</TableCell>
        <TableCell>模型</TableCell>
        <TableCell>IP</TableCell>
        <TableCell>用时</TableCell>
        <TableCell>提示</TableCell>
        <TableCell>补全</TableCell>
        <TableCell>额度</TableCell>
        <TableCell>详情</TableCell>
      </TableRow>
    </TableHead>
  );
};

export default LogTableHead;

LogTableHead.propTypes = {

};

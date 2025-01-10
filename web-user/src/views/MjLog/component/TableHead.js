import PropTypes from 'prop-types';
import { TableCell, TableHead, TableRow } from '@mui/material';

const LogTableHead = () => {
  return (
    <TableHead>
      <TableRow>
        <TableCell>时间</TableCell>
        {<TableCell>类型</TableCell>}
        <TableCell>任务ID</TableCell>
        <TableCell>任务</TableCell>
        <TableCell>模式</TableCell>
        <TableCell>状态</TableCell>
        <TableCell>进度</TableCell>
        <TableCell>结果</TableCell>
        <TableCell>Prompt</TableCell>
        <TableCell>PromptEn</TableCell>
        <TableCell>失败原因</TableCell>
      </TableRow>
    </TableHead>
  );
};

export default LogTableHead;

LogTableHead.propTypes = {
  userIsAdmin: PropTypes.bool
};

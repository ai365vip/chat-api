
import { TableCell, TableHead, TableRow } from '@mui/material';

const ModelTableHead = () => {
  return (
    <TableHead>
      <TableRow>
        <TableCell>模型</TableCell>
        <TableCell>按次计费</TableCell>
        <TableCell>按Token输入 /1M</TableCell>
        <TableCell>按Token输出 /1M</TableCell>
      </TableRow>
    </TableHead>
  );
};

export default ModelTableHead;

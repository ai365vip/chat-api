
import { TableCell, TableHead, TableRow } from '@mui/material';

const ModelTableHead = () => {
  return (
    <TableHead>
      <TableRow>
        <TableCell>模型</TableCell>
        <TableCell>按次计费</TableCell>
        <TableCell>按Token问题/1k</TableCell>
        <TableCell>按Token回复/1k</TableCell>
      </TableRow>
    </TableHead>
  );
};

export default ModelTableHead;

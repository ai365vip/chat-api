import PropTypes from 'prop-types';
import { TableCell, TableHead, TableRow,Checkbox } from '@mui/material';

const TokenTableHead = ({ numSelected, rowCount, onSelectAllClick, modelRatioEnabled, billingByRequestEnabled,userGroupEnabled }) => {
  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
          />
        </TableCell>
        <TableCell>名称</TableCell>
        <TableCell>状态</TableCell>
        {userGroupEnabled && (
          <TableCell>分组</TableCell>
        )}
        <TableCell>已用额度</TableCell>
        <TableCell>剩余额度</TableCell>
        <TableCell>创建时间</TableCell>
        <TableCell>过期时间</TableCell>
        {modelRatioEnabled && billingByRequestEnabled && (
          <TableCell>计费策略</TableCell>
        )}
        <TableCell>操作</TableCell>
      </TableRow>
    </TableHead>
  );
};

TokenTableHead.propTypes = {
  modelRatioEnabled: PropTypes.bool,
  billingByRequestEnabled: PropTypes.bool,
  UserGroupEnabled: PropTypes.bool,
  onSelectAllClick: PropTypes.func.isRequired, // 新增 propType
  numSelected: PropTypes.number.isRequired, // 新增 propType
  rowCount: PropTypes.number.isRequired // 新增 propType
};

export default TokenTableHead;

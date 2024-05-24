import PropTypes from 'prop-types';
import { TableRow, TableCell, Chip } from '@mui/material';
import { timestamp2string, renderQuota, showSuccess, showError } from 'utils/common';

function renderIsStream(bool) {
  return bool ? (
    <Chip label="流" color="primary" size="small" variant="outlined" />
  ) : (
    <Chip label="非流" color="secondary" size="small" variant="outlined" />
  );
}

const colors = [
  'amber', 'blue', 'cyan', 'green', 'grey', 'indigo',
  'light-blue', 'lime', 'orange', 'pink', 'purple', 
  'red', 'teal', 'violet', 'yellow'
];

function stringToColor(str) {
  let sum = 0;
  for (let i = 0; i < str.length; i++) {
    sum += str.charCodeAt(i);
  }
  let i = sum % colors.length;
  return colors[i];
}

function renderType(type) {
  switch (type) {
    case 1:
      return <Chip label="充值" color="info" size="small" variant="outlined" />;
    case 2:
      return <Chip label="消费" color="success"  size="small" variant="outlined" />;
    case 3:
      return <Chip label="管理" color="warning" size="small" variant="outlined" />;
    case 4:
      return <Chip label="系统" color="error" size="small" variant="outlined" />;
    default:
      return <Chip label="未知" size="small" variant="outlined" />;
  }
}

function renderUseTime(time) {
  const parsedTime = parseInt(time);
  if (parsedTime < 101) {
    return <Chip label={`${time} s`} color="success" size="small"  variant="outlined" />;
  } else if (parsedTime < 300) {
    return <Chip label={`${time} s`} color="warning" size="small"  variant="outlined" />;
  } else {
    return <Chip label={`${time} s`} color="error" size="small"  variant="outlined" />;
  }
}

export default function LogTableRow({ item }) {
  const handleCopyToClipboard = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        showSuccess('复制成功');
      });
    } else {
      showError('复制失败，请手动复制！');
    }
  };

  return (
    <TableRow tabIndex={item.id}>
      <TableCell>{timestamp2string(item.created_at)}</TableCell>
      <TableCell onClick={() => handleCopyToClipboard(item.token_name)} style={{ cursor: 'pointer' }}>
        <Chip label={item.token_name} color="default" variant="outlined" />
      </TableCell>
      <TableCell>{renderType(item.type)}</TableCell>
      <TableCell onClick={() => handleCopyToClipboard(item.model_name)} >
        <Chip label={item.model_name} style={{ borderColor: stringToColor(item.model_name) }} variant="outlined" />
      </TableCell>
      <TableCell>
        {renderUseTime(item.use_time)}
        {renderIsStream(item.is_stream)}
      </TableCell>
      <TableCell>{item.prompt_tokens || ''}</TableCell>
      <TableCell>{item.completion_tokens || ''}</TableCell>
      <TableCell>{item.quota ? renderQuota(item.quota, 6) : ''}</TableCell>
      <TableCell>{item.multiplier}</TableCell>
    </TableRow>
  );
}

LogTableRow.propTypes = {
  item: PropTypes.object
};

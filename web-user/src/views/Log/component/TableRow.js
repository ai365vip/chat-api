import PropTypes from 'prop-types';

import { TableRow, TableCell  } from '@mui/material';
import { timestamp2string, renderQuota,showSuccess,showError } from 'utils/common';
import Label from 'ui-component/Label';
import LogType from '../type/LogType';

function renderType(type) {
  const typeOption = LogType[type];
  if (typeOption) {
    return (
      <Label variant="filled" color={typeOption.color}>
        {' '}
        {typeOption.text}{' '}
      </Label>
    );
  } else {
    return (
      <Label variant="filled" color="error">
        {' '}
        未知{' '}
      </Label>
    );
  }
}


export default function LogTableRow({ item, userIsAdmin }) {


  const handleCopyToClipboard = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        // 显示Snackbar通知
        showSuccess('复制成功');
      })
    } else {
      showError('复制失败，请手动复制！');
    }
  };
  

  return (
    <>
      <TableRow tabIndex={item.id}>
        <TableCell>{timestamp2string(item.created_at)}</TableCell>

        {userIsAdmin && <TableCell>{item.channel || ''}</TableCell>}
        {userIsAdmin && (
          <TableCell>
            <Label color="default" variant="soft">
              {item.username}
            </Label>
          </TableCell>
        )}
        <TableCell onClick={() => handleCopyToClipboard(item.token_name)} style={{ cursor: 'pointer' }}>
          {item.token_name && (
            <Label color="default" variant="soft">
              {item.token_name}
            </Label>
          )}
        </TableCell>
        <TableCell>{renderType(item.type)}</TableCell>
        <TableCell onClick={() => handleCopyToClipboard(item.model_name)} style={{ cursor: 'pointer' }}>
          {item.model_name && (
            <Label color="primary" variant="soft">
              {item.model_name}
            </Label>
          )}
        </TableCell>
        <TableCell>{item.prompt_tokens || ''}</TableCell>
        <TableCell>{item.completion_tokens || ''}</TableCell>
        <TableCell>{item.quota ? renderQuota(item.quota, 6) : ''}</TableCell>
        <TableCell>{item.multiplier}</TableCell>

      </TableRow>

    </>
  );
}

LogTableRow.propTypes = {
  item: PropTypes.object,
  userIsAdmin: PropTypes.bool
};

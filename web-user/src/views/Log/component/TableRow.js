import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { TableRow, TableCell,Snackbar  } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { timestamp2string, renderQuota } from 'utils/common';
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

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  const handleCopyToClipboard = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        // 显示Snackbar通知
        setSnackbarOpen(true);
      }).catch(err => {
        console.error('无法复制内容: ', err);
        alert('复制失败，请手动复制！');
      });
    } else {
      console.warn('Clipboard API not available.');
      alert('复制失败，请手动复制！');
    }
  };
  

  // 关闭Snackbar的函数
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return; // 如果点击是在Snackbar外部，则不关闭Snackbar
    }
    setSnackbarOpen(false);
  };
  return (
    <>
      <TableRow tabIndex={item.id}>
        <TableCell>{timestamp2string(item.created_at)}</TableCell>

        {userIsAdmin && <TableCell>{item.channel || ''}</TableCell>}
        {userIsAdmin && (
          <TableCell>
            <Label color="default" variant="outlined">
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
            <Label color="primary" variant="outlined">
              {item.model_name}
            </Label>
          )}
        </TableCell>
        <TableCell>{item.prompt_tokens || ''}</TableCell>
        <TableCell>{item.completion_tokens || ''}</TableCell>
        <TableCell>{item.quota ? renderQuota(item.quota, 6) : ''}</TableCell>
        <TableCell>{item.multiplier}</TableCell>

      </TableRow>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000} // 设置为3秒后自动隐藏
        onClose={handleSnackbarClose}
        TransitionProps={{
          onExit: () => setSnackbarOpen(false), 
        }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          内容已复制到剪贴板
        </Alert>
      </Snackbar>
    </>
  );
}

LogTableRow.propTypes = {
  item: PropTypes.object,
  userIsAdmin: PropTypes.bool
};

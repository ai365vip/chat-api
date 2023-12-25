import React from 'react';
import PropTypes from 'prop-types';
import { TableRow, TableCell,Button,Tooltip,Modal} from '@mui/material';
import Label from 'ui-component/Label';
import { TYPE, CODE, STATUS } from '../type/LogType';
import { useState } from 'react';


function renderType(typeKey) {
  const typeObj = TYPE[typeKey];
  return typeObj ? (
    <Label variant="filled" color={typeObj.color}>
      {typeObj.text}
    </Label>
  ) : (
    <Label variant="filled" color="error">
      未知
    </Label>
  );
}

function renderCode(codeKey) {
  // 确保 codeKey 被视为数字类型
  const codeKeyNum = Number(codeKey);
  const codeObj = CODE[codeKeyNum];
  return codeObj ? (
    <Label variant="filled" color={codeObj.color}>
      {codeObj.text}
    </Label>
  ) : (
    <Label variant="filled" color="error">
      未知代码
    </Label>
  );
}

function renderStatus(statusKey) {
  // 使用大写的字符串键来匹配 status 对象
  const statusObj = STATUS[statusKey.toUpperCase()];
  return statusObj ? (
    <Label variant="filled" color={statusObj.color}>
      {statusObj.text}
    </Label>
  ) : (
    <Label variant="filled" color="error">
      未知状态
    </Label>
  );
}

function renderTimestamp(timestampInSeconds) {
  const date = new Date(timestampInSeconds * 1000);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}


export default function LogTableRow({ item, userIsAdmin }) {
  const [modalImageUrl, setModalImageUrl] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleImagePreview = (imageUrl) => {
    setModalImageUrl(imageUrl); // 设置图片URL状态
    setIsModalOpen(true);       // 打开模态框
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);      // 关闭模态框
  };
  
  return (
    <TableRow tabIndex={-1} key={item.id}>
      <TableCell>
        {renderTimestamp(item.submit_time)}
      </TableCell>
  
      {userIsAdmin && (
        <TableCell>
          {item.channel_id}
        </TableCell>
      )}
      <TableCell>{renderType(item.action)}</TableCell>
      <TableCell>{item.mj_id}</TableCell>
      <TableCell>{renderCode(item.code)}</TableCell>
      <TableCell>{renderStatus(item.status)}</TableCell>
      <TableCell>{item.progress}</TableCell>
  
      <TableCell>
      <Button
            variant="outlined"
            size="small" // 将按钮尺寸设置为小
            onClick={() => handleImagePreview(item.image_url)} // 设置图片 URL 并打开模态框
          >
            查看
          </Button>
      </TableCell>
  
      <TableCell>
        <Tooltip title={item.prompt || '无'} placement="top" arrow>
          <div style={{ width: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item.prompt ? item.prompt.substring(0, 10) + (item.prompt.length > 10 ? '...' : '') : '无'}
          </div>
        </Tooltip>
      </TableCell>
  
      <TableCell>
        <Tooltip title={item.prompt_en || '无'} placement="top" arrow>
          <div style={{ width: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item.prompt_en ? item.prompt_en.substring(0, 10) + (item.prompt_en.length > 10 ? '...' : '') : '无'}
          </div>
        </Tooltip>
      </TableCell>
  
      <TableCell>
        <Tooltip title={item.fail_reason || '无'} placement="top" arrow>
          <div style={{ width: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item.fail_reason ? item.fail_reason.substring(0, 10) + (item.fail_reason.length > 10 ? '...' : '') : '无'}
          </div>
        </Tooltip>
      </TableCell>
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <div style={{ outline: 'none', background: '#fff', padding: 20 }}>
          <img src={modalImageUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '90vh' }} />
        </div>
      </Modal>
    </TableRow>
  );
  
  
}

LogTableRow.propTypes = {
  item: PropTypes.object.isRequired,
  userIsAdmin: PropTypes.bool
};


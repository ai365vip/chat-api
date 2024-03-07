import React from 'react';
import PropTypes from 'prop-types';
import { TableRow, TableCell,Button,Tooltip,Modal} from '@mui/material';
import { useState } from 'react';

import {Tag} from '@douyinfe/semi-ui';

function renderType(type) {
  switch (type) {
    case 'IMAGINE':
      return <Tag color="blue" size='large'>绘图</Tag>;
    case 'ACTION':
      return <Tag color="purple" size='large'>按钮变化</Tag>;
    case 'INPAINT':
      return <Tag color="purple" size='large'>局部重绘</Tag>;
    case 'SHORTEN':
      return <Tag color="blue" size='large'>prompt分析</Tag>
    case 'SWAPFACE':
      return <Tag color="blue" size='large'>换脸</Tag>
    case 'UPSCALE':
      return <Tag color="orange" size='large'>放大</Tag>;
    case 'VARIATION':
      return <Tag color="purple" size='large'>变换</Tag>;
    case 'DESCRIBE':
      return <Tag color="yellow" size='large'>图生文</Tag>;
    case 'REROLL':
      return <Tag color="lime" size='large'>重绘</Tag>
    case 'BLEND':
      return <Tag color="lime" size='large'>图混合</Tag>;
    case 'UPLOADS':
      return <Tag color="blue" size='large'>上传文件</Tag>
    default:
      return <Tag color="black" size='large'>未知</Tag>;
  }
}


function renderCode(code) {
  switch (code) {
    case 1:
      return <Tag color="green" size='large'>已提交</Tag>;
    case 21:
      return <Tag color="lime" size='large'>排队中</Tag>;
    case 22:
      return <Tag color="orange" size='large'>重复提交</Tag>;
    default:
      return <Tag color="black" size='large'>未知</Tag>;
  }
}
function renderMode(type) {
  // Ensure all cases are string literals by adding quotes.
  switch (type) {
    case 'turbo':
      return <Tag color="blue" size='large'>Turbo</Tag>;
    case 'relax':
      return <Tag color="orange" size='large'>Relax</Tag>;
    case 'fast':
      return <Tag color="green" size='large'>Fast</Tag>;
    default:
      return <Tag color="black" size='large'>未知</Tag>;
  }
}

function renderStatus(type) {
  // Ensure all cases are string literals by adding quotes.
  switch (type) {
    case 'SUCCESS':
      return <Tag color="green" size='large'>成功</Tag>;
    case 'NOT_START':
      return <Tag color="grey" size='large'>未启动</Tag>;
    case 'SUBMITTED':
      return <Tag color="yellow" size='large'>队列中</Tag>;
    case 'IN_PROGRESS':
      return <Tag color="blue" size='large'>执行中</Tag>;
    case 'FAILURE':
      return <Tag color="red" size='large'>失败</Tag>;
    default:
      return <Tag color="black" size='large'>未知</Tag>;
  }
}




function renderTimestamp(timestampInSeconds) {
  const date = new Date(timestampInSeconds);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}


export default function LogTableRow({ item }) {
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
      <TableCell>{renderType(item.action)}</TableCell>
      <TableCell>{item.mj_id}</TableCell>
      <TableCell>{renderCode(item.code)}</TableCell>
      <TableCell>{renderMode(item.mode)}</TableCell>
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
};


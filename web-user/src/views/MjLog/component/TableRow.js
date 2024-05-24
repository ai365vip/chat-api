import React from 'react';
import PropTypes from 'prop-types';
import { TableRow, TableCell, Button, Tooltip, Modal, Chip } from '@mui/material';

function renderType(type) {
  switch (type) {
    case 'IMAGINE':
      return <Chip label="绘图" color="primary" size="small" />;
    case 'ACTION':
    case 'INPAINT':
    case 'CUSTOMZOOM':
      return <Chip label="按钮变化" color="secondary" size="small" />;
    case 'MODAL':
      return <Chip label="窗口确认" color="lightblue" size="small" />;
    case 'SHORTEN':
    case 'SWAPFACE':
    case 'UPLOADS':
      return <Chip label="prompt分析" color="primary" size="small" />;
    case 'UPSCALE':
      return <Chip label="放大" color="orange" size="small" />;
    case 'VARIATION':
      return <Chip label="变换" color="secondary" size="small" />;
    case 'DESCRIBE':
      return <Chip label="图生文" color="warning" size="small" />;
    case 'REROLL':
      return <Chip label="重绘" color="lime" size="small" />;
    case 'BLEND':
      return <Chip label="图混合" color="info" size="small" />;
    default:
      return <Chip label="未知" color="default" size="small" />;
  }
}

function renderCode(code) {
  switch (code) {
    case 1:
      return <Chip label="已提交" color="success" size="small" />;
    case 21:
      return <Chip label="等待中" color="lime" size="small" />;
    case 22:
      return <Chip label="排队中" color="warning" size="small" />;
    default:
      return <Chip label="未知" color="default" size="small" />;
  }
}

function renderMode(type) {
  switch (type) {
    case 'turbo':
      return <Chip label="Turbo" color="primary" size="small" />;
    case 'relax':
      return <Chip label="Relax" color="warning" size="small" />;
    case 'fast':
      return <Chip label="Fast" color="success" size="small" />;
    default:
      return <Chip label="未知" color="default" size="small" />;
  }
}

function renderStatus(type) {
  switch (type) {
    case 'SUCCESS':
      return <Chip label="成功" color="success" size="small" />;
    case 'NOT_START':
      return <Chip label="未启动" color="default" size="small" />;
    case 'SUBMITTED':
      return <Chip label="队列中" color="warning" size="small" />;
    case 'IN_PROGRESS':
      return <Chip label="执行中" color="primary" size="small" />;
    case 'FAILURE':
      return <Chip label="失败" color="error" size="small" />;
    default:
      return <Chip label="未知" color="default" size="small" />;
  }
}

export default function LogTableRow({ item }) {
  const [modalImageUrl, setModalImageUrl] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleImagePreview = (imageUrl) => {
    setModalImageUrl(imageUrl);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <TableRow key={item.id}>
      <TableCell>{renderTimestamp(item.submit_time)}</TableCell>
      <TableCell>{renderType(item.action)}</TableCell>
      <TableCell>{item.mj_id}</TableCell>
      <TableCell>{renderCode(item.code)}</TableCell>
      <TableCell>{renderMode(item.mode)}</TableCell>
      <TableCell>{renderStatus(item.status)}</TableCell>
      <TableCell>{item.progress}</TableCell>
      <TableCell>
        <Button variant="outlined" size="small" onClick={() => handleImagePreview(item.image_url)}>
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
      <Modal open={isModalOpen} onClose={handleCloseModal} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

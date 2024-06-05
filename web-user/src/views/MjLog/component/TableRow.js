import React from 'react';
import PropTypes from 'prop-types';
import { TableRow, TableCell, Button, Tooltip, Modal } from '@mui/material';
import Label from 'ui-component/Label';
import { amber, blue, grey, indigo, lightBlue, lime, orange, pink, purple, red, deepOrange, deepPurple, green, lightGreen, blueGrey, teal, yellow, brown, cyan } from '@mui/material/colors';

const colors = [
  amber[500], blue[500], grey[500], indigo[500],
  lightBlue[500], lime[500], orange[500], pink[500], purple[500],
  red[500], cyan[500], teal[500], yellow[500], 
  brown[500], deepOrange[500], deepPurple[500], green[500], 
  lightGreen[500], blueGrey[500]
];

function renderType(type) {
  switch (type) {
    case 'IMAGINE':
      return <Label style={{ color: colors[0], borderColor: colors[0] }} size="small" variant="outlined">绘图</Label>;
    case 'ACTION':
      return <Label style={{ color: colors[1], borderColor: colors[1] }} size="small" variant="outlined">按钮变化</Label>;
    case 'INPAINT':
      return <Label style={{ color: colors[1], borderColor: colors[1] }} size="small" variant="outlined">局部重绘</Label>;
    case 'CUSTOMZOOM':
      return <Label style={{ color: colors[1], borderColor: colors[1] }} size="small" variant="outlined">自定义变焦</Label>;
    case 'MODAL':
      return <Label style={{ color: colors[2], borderColor: colors[2] }} size="small" variant="outlined">窗口确认</Label>;
    case 'SHORTEN':
      return <Label style={{ color: colors[3], borderColor: colors[3] }} size="small" variant="outlined">prompt分析</Label>;
    case 'SWAPFACE':
      return <Label style={{ color: colors[3], borderColor: colors[3] }} size="small" variant="outlined">换脸</Label>;
    case 'UPLOADS':
      return <Label style={{ color: colors[3], borderColor: colors[3] }} size="small" variant="outlined">上传文件</Label>;
    case 'UPSCALE':
      return <Label style={{ color: colors[4], borderColor: colors[4] }} size="small" variant="outlined">放大</Label>;
    case 'VARIATION':
      return <Label style={{ color: colors[5], borderColor: colors[5] }} size="small" variant="outlined">变换</Label>;
    case 'DESCRIBE':
      return <Label style={{ color: colors[6], borderColor: colors[6] }} size="small" variant="outlined">图生文</Label>;
    case 'REROLL':
      return <Label style={{ color: colors[7], borderColor: colors[7] }} size="small" variant="outlined">重绘</Label>;
    case 'BLEND':
      return <Label style={{ color: colors[8], borderColor: colors[8] }} size="small" variant="outlined">图混合</Label>;
    default:
      return <Label style={{ color: colors[9], borderColor: colors[9] }} size="small" variant="outlined">未知</Label>;
  }
}

function renderCode(code) {
  switch (code) {
    case 1:
      return <Label style={{ color: colors[10], borderColor: colors[10] }} size="small" variant="outlined">已提交</Label>;
    case 21:
      return <Label style={{ color: colors[11], borderColor: colors[11] }} size="small" variant="outlined">等待中</Label>;
    case 22:
      return <Label style={{ color: colors[12], borderColor: colors[12] }} size="small" variant="outlined">排队中</Label>;
    default:
      return <Label style={{ color: colors[13], borderColor: colors[13] }} size="small" variant="outlined">未知</Label>;
  }
}

function renderMode(type) {
  switch (type) {
    case 'turbo':
      return <Label style={{ color: colors[14], borderColor: colors[14] }} size="small" variant="outlined">Turbo</Label>;
    case 'relax':
      return <Label style={{ color: colors[15], borderColor: colors[15] }} size="small" variant="outlined">Relax</Label>;
    case 'fast':
      return <Label style={{ color: colors[16], borderColor: colors[16] }} size="small" variant="outlined">Fast</Label>;
    default:
      return <Label style={{ color: colors[17], borderColor: colors[17] }} size="small" variant="outlined">未知</Label>;
  }
}

const renderTimestamp = (timestampInSeconds) => {
  const date = new Date(timestampInSeconds); // 直接使用秒级时间戳

  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  const hours = ('0' + date.getHours()).slice(-2);
  const minutes = ('0' + date.getMinutes()).slice(-2);
  const seconds = ('0' + date.getSeconds()).slice(-2);

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};


function renderStatus(type) {
  switch (type) {
    case 'SUCCESS':
      return <Label style={{ color: colors[18], borderColor: colors[18] }} size="small" variant="outlined">成功</Label>;
    case 'NOT_START':
      return <Label style={{ color: colors[19], borderColor: colors[19] }} size="small" variant="outlined">未启动</Label>;
    case 'SUBMITTED':
      return <Label style={{ color: colors[0], borderColor: colors[0] }} size="small" variant="outlined">队列中</Label>;
    case 'IN_PROGRESS':
      return <Label style={{ color: colors[1], borderColor: colors[1] }} size="small" variant="outlined">执行中</Label>;
    case 'FAILURE':
      return <Label style={{ color: colors[2], borderColor: colors[2] }} size="small" variant="outlined">失败</Label>;
    default:
      return <Label style={{ color: colors[3], borderColor: colors[3] }} size="small" variant="outlined">未知</Label>;
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

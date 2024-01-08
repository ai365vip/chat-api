import PropTypes from 'prop-types';
import { useState,useEffect } from 'react';
import { useSelector } from 'react-redux';
import { API } from 'utils/api';

import {
  Popover,
  TableRow,
  MenuItem,
  TableCell,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Tooltip,
  Stack,
  ButtonGroup,Select, FormControl,Checkbox
} from '@mui/material';
import TableSwitch from 'ui-component/Switch';
import { renderQuota, showSuccess,showError, timestamp2string } from 'utils/common';
import CircularProgress from '@mui/material/CircularProgress';
import { IconDotsVertical, IconEdit, IconTrash, IconCaretDownFilled,IconEye  } from '@tabler/icons-react';

const COPY_OPTIONS = [
  {
    key: 'next',
    text: 'ChatGPT Next',
    url: 'https://chat.oneapi.pro/#/?settings={"key":"sk-{key}","url":"{serverAddress}"}',
    encode: false
  },
  { key: 'ama', text: 'AMA 问天', url: 'ama://set-api-key?server={serverAddress}&key=sk-{key}', encode: true },
  { key: 'opencat', text: 'OpenCat', url: 'opencat://team/join?domain={serverAddress}&token=sk-{key}', encode: true }
];

function replacePlaceholders(text, key, serverAddress) {
  return text.replace('{key}', key).replace('{serverAddress}', serverAddress);
}

function createMenu(menuItems) {
  return (
    <>
      {menuItems.map((menuItem, index) => (
        <MenuItem key={index} onClick={menuItem.onClick} sx={{ color: menuItem.color }}>
          {menuItem.icon}
          {menuItem.text}
        </MenuItem>
      ))}
    </>
  );
}

export default function TokensTableRow({ item, manageToken, handleOpenModal, setModalTokenId, selected, handleSelectOne }) {

  const [open, setOpen] = useState(null);
  const [menuItems, setMenuItems] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [statusSwitch, setStatusSwitch] = useState(item.status);
  const siteInfo = useSelector((state) => state.siteInfo);
  const [loading, setLoading] = useState(false);
  const [billingEnabled, setBillingEnabled] = useState(item.billing_enabled ? 1 : 0);
  const [modelRatioEnabled, setModelRatioEnabled] = useState('');
  const [billingByRequestEnabled, setBillingByRequestEnabled] = useState('');
  const [options, setOptions] = useState({});
  

  const handleBillingChange = async (event) => {
    const billingValue = event.target.value;
    setLoading(true); // 开始使用loading状态
    setBillingEnabled(billingValue); // 更新billingEnabled状态
    try {
        const res  = await API.put(`/api/token/${item.id}/billing_strategy`, {
        billing_enabled: billingValue,
      });
      if (res && res.data) {
        if (res.data.success) {
          showSuccess('计费策略已更新');

        } else {
          alert(res.data.message || '未知错误');
        }
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error) {
      alert(`更新失败: ${error.message ?? error.toString()}`);
    } finally {
      setLoading(false); // 完成请求后更新loading状态
    }
  };

  useEffect(() => {
      getOptions();
  }, []);

  const getOptions = async () => {
    const res = await API.get('/api/user/option');
    const { success, message, data } = res.data;
    if (success) {
      let newOptions = {};
      data.forEach((item) => {
        newOptions[item.key] = item.value;
      });
      setOptions(newOptions); // 设置所有选项的状态
    } else {
      showError(message);
    }
  };

  useEffect(() => {
    if (options.ModelRatioEnabled) { 
      setModelRatioEnabled(options.ModelRatioEnabled === 'true');
    }
    if (options.BillingByRequestEnabled) { 
      setBillingByRequestEnabled(options.BillingByRequestEnabled === 'true');
    }
  }, [options]);

  const handleChatClick = () => {
    if (!siteInfo?.chat_link) {
      showSuccess('管理员未设置聊天界面');
    } else {
      const chatOption = COPY_OPTIONS.find(option => option.key === 'next');
      if (chatOption) {
        handleCopy(chatOption, 'link');
      }
    }
  };
  
  

  const handleDeleteOpen = () => {
    handleCloseMenu();
    setOpenDelete(true);
  };

  const handleDeleteClose = () => {
    setOpenDelete(false);
  };

  const handleOpenMenu = (event, type) => {
    switch (type) {
      case 'copy':
        setMenuItems(copyItems);
        break;
      case 'link':
        setMenuItems(linkItems);
        break;
      default:
        setMenuItems(actionItems);
    }
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleStatus = async () => {
    const switchVlue = statusSwitch === 1 ? 2 : 1;
    const { success } = await manageToken(item.id, 'status', switchVlue);
    if (success) {
      setStatusSwitch(switchVlue);
    }
  };

  const handleDelete = async () => {
    handleCloseMenu();
    await manageToken(item.id, 'delete', '');
  };

  const actionItems = createMenu([
    {
      text: '编辑',
      icon: <IconEdit style={{ marginRight: '16px' }} />,
      onClick: () => {
        handleCloseMenu();
        handleOpenModal();
        setModalTokenId(item.id);
      },
      color: undefined
    },
    {
      text: '删除',
      icon: <IconTrash style={{ marginRight: '16px' }} />,
      onClick: handleDeleteOpen,
      color: 'error.main'
    }
  ]);

  const handleCopy = (option, type) => {
    let serverAddress = '';
    if (siteInfo?.server_address) {
      serverAddress = siteInfo.server_address;
    } else {
      serverAddress = window.location.host;
    }

    if (option.encode) {
      serverAddress = encodeURIComponent(serverAddress);
    }

    let url = option.url;

    if (!siteInfo?.chat_link && option.key === 'next') {
      showSuccess('管理员未设置聊天界面');
      return;
    }
    if (option.encode) {
      serverAddress = encodeURIComponent(serverAddress);
    }

    if (option.key === 'next') {
      url = siteInfo.chat_link + `/#/?settings={"key":"sk-{key}","url":"{serverAddress}"}`;
    }

    const key = item.key;
    const text = replacePlaceholders(url, key, serverAddress);
    if (type === 'link') {
      window.open(text);
    } else {
      navigator.clipboard.writeText(text);
      showSuccess('已复制到剪贴板！');
    }
    handleCloseMenu();
  };



  const copyItems = createMenu(
    COPY_OPTIONS.map((option) => ({
      text: option.text,
      icon: undefined,
      onClick: () => handleCopy(option, 'copy'),
      color: undefined
    }))
  );

  const linkItems = createMenu(
    COPY_OPTIONS.map((option) => ({
      text: option.text,
      icon: undefined,
      onClick: () => handleCopy(option, 'link'),
      color: undefined
    }))
  );

  return (
    <>

      <TableRow tabIndex={item.id}>
        <TableCell padding="checkbox">
          <Checkbox
            checked={selected.indexOf(item.id) !== -1}
            onChange={(event) => handleSelectOne(event, item.id)}
          />
        </TableCell>
        <TableCell onClick={async () => {
                try {
                  await navigator.clipboard.writeText(`${item.name}`);
                  showSuccess('已复制到剪贴板！');
                } catch (error) {
                  showError(`复制失败，请手动复制。${item.name}`); // 提示用户手动复制
                }
              }}
            >
          {item.name}
        </TableCell>
        <TableCell>
          <Tooltip
            title={(() => {
              switch (statusSwitch) {
                case 1:
                  return '已启用';
                case 2:
                  return '已禁用';
                case 3:
                  return '已过期';
                case 4:
                  return '已耗尽';
                default:
                  return '未知';
              }
            })()}
            placement="top"
          >
            <TableSwitch
              id={`switch-${item.id}`}
              checked={statusSwitch === 1}
              onChange={handleStatus}
            />
          </Tooltip>
        </TableCell>

        <TableCell>{renderQuota(item.used_quota)}</TableCell>

        <TableCell>{item.unlimited_quota ? '无限制' : renderQuota(item.remain_quota, 2)}</TableCell>

        <TableCell>{timestamp2string(item.created_time)}</TableCell>

        <TableCell>{item.expired_time === -1 ? '永不过期' : timestamp2string(item.expired_time)}</TableCell>
        {modelRatioEnabled && billingByRequestEnabled && (
        <TableCell>
          {loading ? (
            <CircularProgress size={24} />
          ) : (
            
              <FormControl fullWidth size="small" variant="outlined" sx={{ minWidth: 100 }}>
                <Select
                  value={billingEnabled}
                  onChange={handleBillingChange}
                  displayEmpty
                  inputProps={{ 'aria-label': 'Without label' }}
                >
                  <MenuItem value={0}>按Token计费</MenuItem>
                  <MenuItem value={1}>按次计费</MenuItem>
                </Select>
              </FormControl>

          )}
        </TableCell>
        )}

        <TableCell>
          <Stack direction="row" spacing={1}>
            <Tooltip title={`sk-${item.key}`} placement="top" >
                <IconButton
                  edge="end"
                  aria-label="view"
                  sx={{ color: 'rgb(99, 115, 129)' }}
                >
                  <IconEye />
                </IconButton>
            </Tooltip>
            <ButtonGroup size="small" aria-label="split button">
            <Button
              color="primary"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(`sk-${item.key}`);
                  showSuccess('已复制到剪贴板！');
                } catch (error) {
                  showError(`复制失败，请手动复制。sk-${item.key}`); // 提示用户手动复制
                }
              }}
            >
              复制
            </Button>

            </ButtonGroup>
            <ButtonGroup size="small" aria-label="split button">
              <Button color="primary" onClick={handleChatClick} >聊天</Button>
              <Button size="small" onClick={(e) => handleOpenMenu(e, 'link')}>
                <IconCaretDownFilled size={'16px'} />
              </Button>
            </ButtonGroup>
            <IconButton onClick={(e) => handleOpenMenu(e, 'action')} sx={{ color: 'rgb(99, 115, 129)' }}>
              <IconDotsVertical />
            </IconButton>
          </Stack>
        </TableCell>
      </TableRow>
      <Popover
        open={!!open}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { width: 140 }
        }}
      >
        {menuItems}
      </Popover>

      <Dialog open={openDelete} onClose={handleDeleteClose}>
        <DialogTitle>删除Token</DialogTitle>
        <DialogContent>
          <DialogContentText>是否删除Token {item.name}？</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose}>关闭</Button>
          <Button onClick={handleDelete} sx={{ color: 'error.main' }} autoFocus>
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

TokensTableRow.propTypes = {
  item: PropTypes.object,
  manageToken: PropTypes.func,
  handleOpenModal: PropTypes.func,
  setModalTokenId: PropTypes.func,
  selected: PropTypes.array.isRequired,
  handleSelectOne: PropTypes.func.isRequired
};

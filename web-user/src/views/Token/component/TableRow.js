import React, { useCallback, useReducer } from 'react';
import PropTypes from 'prop-types';
import { API } from 'utils/api';
import { Link } from 'react-router-dom';
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
  ButtonGroup,
  Select,
  FormControl,
  Checkbox
} from '@mui/material';
import TableSwitch from 'ui-component/Switch';
import { renderQuota, showSuccess, showError, timestamp2string } from 'utils/common';
import CircularProgress from '@mui/material/CircularProgress';
import { IconDotsVertical, IconEdit, IconTrash, IconEye } from '@tabler/icons-react';

const initialState = {
  open: null,
  menuItems: null,
  openDelete: false,
  statusSwitch: 1,
  loading: false,
  billingEnabled: 0
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_OPEN':
      return { ...state, open: action.payload };
    case 'SET_MENU_ITEMS':
      return { ...state, menuItems: action.payload };
    case 'SET_OPEN_DELETE':
      return { ...state, openDelete: action.payload };
    case 'SET_STATUS_SWITCH':
      return { ...state, statusSwitch: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_BILLING_ENABLED':
      return { ...state, billingEnabled: action.payload };
    default:
      return state;
  }
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

const TokensTableRow = React.memo(function TokensTableRow({ 
  item, 
  manageToken, 
  handleOpenModal, 
  setModalTokenId, 
  selected, 
  handleSelectOne,
  modelRatioEnabled,
  billingByRequestEnabled,
  userGroupEnabled,
  serverStatus
}) {
  const [state, dispatch] = useReducer(reducer, { 
    ...initialState, 
    statusSwitch: item.status, 
    billingEnabled: item.billing_enabled ? 1 : 0
  });

  const handleBillingChange = useCallback(async (event) => {
    const billingValue = event.target.value;
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_BILLING_ENABLED', payload: billingValue });
    try {
      const res = await API.put(`/api/token/${item.id}/billing_strategy`, {
        billing_enabled: billingValue,
      });
      if (res && res.data && res.data.success) {
        showSuccess('计费策略已更新');
      } else {
        throw new Error(res.data.message || '未知错误');
      }
    } catch (error) {
      showError(`更新失败: ${error.message ?? error.toString()}`);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [item.id]);

  const handleDeleteOpen = useCallback(() => {
    dispatch({ type: 'SET_OPEN', payload: null });
    dispatch({ type: 'SET_OPEN_DELETE', payload: true });
  }, []);

  const handleDeleteClose = useCallback(() => {
    dispatch({ type: 'SET_OPEN_DELETE', payload: false });
  }, []);

  const handleOpenMenu = useCallback((event, type) => {
    let menuItems;
    switch (type) {
      case 'action':
        menuItems = createMenu([
          {
            text: '编辑',
            icon: <IconEdit style={{ marginRight: '16px' }} />,
            onClick: () => {
              dispatch({ type: 'SET_OPEN', payload: null });
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
        break;
      default:
        menuItems = null;
    }
    dispatch({ type: 'SET_MENU_ITEMS', payload: menuItems });
    dispatch({ type: 'SET_OPEN', payload: event.currentTarget });
  }, [handleOpenModal, setModalTokenId, item.id, handleDeleteOpen]);

  const handleCloseMenu = useCallback(() => {
    dispatch({ type: 'SET_OPEN', payload: null });
  }, []);

  const handleStatus = useCallback(async () => {
    const switchValue = state.statusSwitch === 1 ? 2 : 1;
    const { success } = await manageToken(item.id, 'status', switchValue);
    if (success) {
      dispatch({ type: 'SET_STATUS_SWITCH', payload: switchValue });
    }
  }, [state.statusSwitch, manageToken, item.id]);

  const handleDelete = useCallback(async () => {
    handleCloseMenu();
    await manageToken(item.id, 'delete', '');
  }, [handleCloseMenu, manageToken, item.id]);

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
            showError(`复制失败，请手动复制。${item.name}`);
          }
        }}>
          {item.name}
        </TableCell>
        <TableCell>
          <Tooltip
            title={(() => {
              switch (state.statusSwitch) {
                case 1: return '已启用';
                case 2: return '已禁用';
                case 3: return '已过期';
                case 4: return '已耗尽';
                default: return '未知';
              }
            })()}
            placement="top"
          >
            <TableSwitch
              id={`switch-${item.id}`}
              checked={state.statusSwitch === 1}
              onChange={handleStatus}
            />
          </Tooltip>
        </TableCell>
        {userGroupEnabled && (
          <TableCell>{item.group ? item.group : '默认'}</TableCell>
        )}
        <TableCell>{renderQuota(item.used_quota)}</TableCell>
        <TableCell>{item.unlimited_quota ? '无限制' : renderQuota(item.remain_quota, 2)}</TableCell>
        <TableCell>{timestamp2string(item.created_time)}</TableCell>
        <TableCell>{item.expired_time === -1 ? '永不过期' : timestamp2string(item.expired_time)}</TableCell>
        {modelRatioEnabled && billingByRequestEnabled && (
          <TableCell>
            {state.loading ? (
              <CircularProgress size={24} />
            ) : (
              <FormControl fullWidth size="small" variant="outlined" sx={{ minWidth: 100 }}>
                <Select
                  value={state.billingEnabled}
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
            <Tooltip title={`sk-${item.key}`} placement="top">
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
                    showError(`复制失败，请手动复制。sk-${item.key}`);
                  }
                }}
              >
                复制
              </Button>
              {serverStatus.chat_link && (
                <Button
                  component={Link}
                  to={`/chatweb?chat_link=${serverStatus.chat_link}/#/?settings={"key":"sk-${item.key}","url":"${serverStatus.server_address}"}`}
                  color="primary"
                >
                  对话
                </Button>
              )}
            </ButtonGroup>
            <IconButton onClick={(e) => handleOpenMenu(e, 'action')} sx={{ color: 'rgb(99, 115, 129)' }}>
              <IconDotsVertical />
            </IconButton>
          </Stack>
        </TableCell>
      </TableRow>
      <Popover
        open={!!state.open}
        anchorEl={state.open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { width: 140 }
        }}
      >
        {state.menuItems}
      </Popover>

      <Dialog open={state.openDelete} onClose={handleDeleteClose}>
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
});

TokensTableRow.propTypes = {
  item: PropTypes.object.isRequired,
  manageToken: PropTypes.func.isRequired,
  handleOpenModal: PropTypes.func.isRequired,
  setModalTokenId: PropTypes.func.isRequired,
  selected: PropTypes.array.isRequired,
  handleSelectOne: PropTypes.func.isRequired,
  modelRatioEnabled: PropTypes.bool.isRequired,
  billingByRequestEnabled: PropTypes.bool.isRequired,
  userGroupEnabled: PropTypes.bool.isRequired,
  serverStatus: PropTypes.object.isRequired,
  options: PropTypes.object.isRequired
};

export default TokensTableRow;
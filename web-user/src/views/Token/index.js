import { useState, useEffect } from 'react';
import { showError, showSuccess } from 'utils/common';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import PerfectScrollbar from 'react-perfect-scrollbar';
import TablePagination from '@mui/material/TablePagination';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import ButtonGroup from '@mui/material/ButtonGroup';
import Toolbar from '@mui/material/Toolbar';

import { Button, Card, Box, Stack, Container,TextField } from '@mui/material';
import TokensTableRow from './component/TableRow';
import TokenTableHead from './component/TableHead';
import { API } from 'utils/api';
import { ITEMS_PER_PAGE } from 'constants';
import { IconRefresh, IconPlus,IconTrash } from '@tabler/icons-react';
import EditeModal from './component/EditModal';
import { useSelector } from 'react-redux';

export default function Token() {
  const [tokens, setTokens] = useState([]);
  const [activePage, setActivePage] = useState(0);
  const [searching, setSearching] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [editTokenId, setEditTokenId] = useState(0);
  const siteInfo = useSelector((state) => state.siteInfo);
  const [modelRatioEnabled, setModelRatioEnabled] = useState('');
  const [billingByRequestEnabled, setBillingByRequestEnabled] = useState('');
  const [options, setOptions] = useState({});
  const [selected, setSelected] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(ITEMS_PER_PAGE);
  const [searchToken, setSearchToken] = useState('');


  const loadTokens = async (startIdx, rowsPerPage = ITEMS_PER_PAGE) => {
    setSearching(true);
    try {
      const res = await API.get(`/api/token/?p=${startIdx}&size=${rowsPerPage}`);
      const { success, message, data } = res.data;
      if (success) {
        if (startIdx === 0) {
          setTokens(data);
        } else {
          let newTokens = [...tokens];
          newTokens.splice(startIdx * rowsPerPage, data.length, ...data);
          setTokens(newTokens);
        }
      } else {
        showError(message);
      }
    } catch (error) {
      showError(`加载数据时出错: ${error}`);
    }
    setSearching(false);
  };
  

  useEffect(() => {
    loadTokens(0, rowsPerPage)
      .then()
      .catch((reason) => {
        showError(reason);
      });
      getOptions();
  }, [rowsPerPage]);
  

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

  const onPaginationChange = (event, newActivePage) => {
    (async () => {
      if (newActivePage === Math.ceil(tokens.length / rowsPerPage)) {
        // In this case we have to load more data and then append them.
        await loadTokens(newActivePage);
      }
      setActivePage(newActivePage);
    })();
  };
  

  const searchTokens = async (event) => {
    event.preventDefault();
    setSearching(true);
    try {
      const query = new URLSearchParams({
        keyword: searchKeyword,
        token: searchToken // 使用 searchToken 状态值
      }).toString();
      const res = await API.get(`/api/token/search?${query}`);
      const { success, message, data } = res.data;
      if (success) {
        setTokens(data);
        setActivePage(0);
      } else {
        showError(message);
      }
    } catch (error) {
      showError(`搜索时出错: ${error}`);
    }
    setSearching(false);
  };
  

  const handleSearchTokenChange = (event) => {
    setSearchToken(event.target.value);
  };

  const handleSearchKeyword = (event) => {
    setSearchKeyword(event.target.value);
  };

  const manageToken = async (id, action, value) => {
    const url = '/api/token/';
    let data = { id };
    let res;
    switch (action) {
      case 'delete':
        res = await API.delete(url + id);
        break;
      case 'status':
        res = await API.put(url + `?status_only=true`, {
          ...data,
          status: value
        });
        break;
    }
    const { success, message } = res.data;
    if (success) {
      showSuccess('操作成功完成！');
      if (action === 'delete') {
        await loadTokens(0);
      }
    } else {
      showError(message);
    }

    return res.data;
  };

  // 处理刷新
  const handleRefresh = async () => {
    await loadTokens(0);
    setActivePage(0);
    setSearchKeyword('');
  };

  const handleOpenModal = (tokenId) => {
    setEditTokenId(tokenId);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditTokenId(0);
  };

  const handleOkModal = (status) => {
    if (status === true) {
      handleCloseModal();
      handleRefresh();
    }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = tokens.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  // 分页处理函数
  const handleRowsPerPageChange = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage); // 更新每页显示的行数
    setActivePage(0); // 重置到第一页
    loadTokens(0, newRowsPerPage); 
  };
  

  const handleDeleteSelected = async () => {

    const promises = selected.map((id) => API.delete(`/api/token/${id}`));
    const results = await Promise.allSettled(promises);
    const success = results.every((result) => result.status === 'fulfilled');
    if (success) {
      showSuccess('选中的 Token 已删除');
      setSelected([]); // 清空选中状态
      loadTokens(0); // 重新加载数据
    } else {
      showError('删除时发生错误');
    }
  };

  const handleSelectOne = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];
  
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex >= 0) {
      newSelected = newSelected.filter((selectedId) => selectedId !== id);
    }
  
    setSelected(newSelected);
  };
  
  const copySelectedKeys = () => {
    const selectedKeysText = selected.map((id) => {
      const token = tokens.find((token) => token.id === id);
      return token ? `sk-${token.key}` : ''; 
    }).join('\n');
  
    if (!navigator.clipboard) {
      showError('复制到剪贴板失败：剪贴板功能不可用');
      return;
    }
  
    navigator.clipboard.writeText(selectedKeysText)
      .then(() => {
        showSuccess('选中的 keys 已复制到剪贴板');
      })
      .catch((err) => {
        showError('复制到剪贴板失败：' + err);
      });
  };
  
  
  

  return (
    <>
      <Stack mb={5}>
        <Alert severity="info">
          将OpenAI API基础地址https://api.openai.com替换为<b>{siteInfo.server_address}</b>，复制下面的密钥即可使用。
        </Alert>
      </Stack>
      <Card>
      <Box component="form" onSubmit={searchTokens} mt={2} noValidate sx={{ display: 'flex', alignItems: 'center', gap: 4, padding: 2 }}>
        {/* 搜索名称的输入框 - 设置边距 */}
        <TextField
          label="名称"
          value={searchKeyword}
          onChange={handleSearchKeyword}
          variant="outlined"
          size="small"
          placeholder="搜索令牌的名称..."
          fullWidth // 输入框全宽
          sx={{ flex: 1, minWidth: '150px', marginX: 1 }} // 增加左右外边距
        />
        {/* 搜索 Token 的输入框 - 设置边距 */}
        <TextField
          label="令牌"
          value={searchToken}
          onChange={handleSearchTokenChange}
          variant="outlined"
          size="small"
          placeholder="搜索令牌的 key..."
          fullWidth // 输入框全宽
          sx={{ flex: 1, minWidth: '150px', marginX: 1 }} // 增加左右外边距
        />
        {/* 搜索按钮 - 设置边距 */}
        <Button type="submit" variant="contained" color="primary" sx={{ marginX: 1 }}>
          搜索
        </Button>
      </Box>

        <Toolbar
          sx={{
            textAlign: 'right',
            height: 50,
            display: 'flex',
            justifyContent: 'space-between',
            p: (theme) => theme.spacing(0, 1, 0, 3)
          }}
        >
          <Container>
            <ButtonGroup variant="outlined" aria-label="outlined primary button group">
              {selected.length > 0 && (
                <Button
                  onClick={handleDeleteSelected}
                  startIcon={<IconTrash />}
                  color="error"
                >
                  删除选中
                </Button>
              )}
              {selected.length > 0 && (
                <Button
                    onClick={copySelectedKeys}
                    disabled={selected.length === 0} // 当没有选中项时禁用按钮
                  >
                    复制选中的 Key
                  </Button>
              
              )}
              <Button 
                onClick={handleRefresh} 
                startIcon={<IconRefresh  />}
                style={{ marginRight: '8px' }}  // 添加右边距
              >
                刷新
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  handleOpenModal(0);
                }}
                startIcon={<IconPlus />}
              >
                新建令牌
              </Button>
            </ButtonGroup>
          </Container>
        </Toolbar>

        {searching && <LinearProgress />}
        <PerfectScrollbar component="div">
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <TokenTableHead 
              numSelected={selected.length}
              rowCount={tokens.length}
              onSelectAllClick={handleSelectAllClick}
              modelRatioEnabled={modelRatioEnabled}
              billingByRequestEnabled={billingByRequestEnabled}
              />
              <TableBody>
              {tokens.slice(activePage * rowsPerPage, (activePage + 1) * rowsPerPage).map((row) => (
                <TokensTableRow
                  item={row}
                  manageToken={manageToken}
                  key={row.id}
                  handleOpenModal={handleOpenModal}
                  setModalTokenId={setEditTokenId}
                  modelRatioEnabled={modelRatioEnabled}
                  billingByRequestEnabled={billingByRequestEnabled}
                  selected={selected}
                  handleSelectOne={handleSelectOne} // 这里传递 handleSelectOne
                />
              ))}

              </TableBody>
            </Table>
          </TableContainer>
        </PerfectScrollbar>
        <TablePagination
          page={activePage}
          component="div"
          count={-1} 
          rowsPerPage={rowsPerPage} 
          onPageChange={onPaginationChange}
          onRowsPerPageChange={handleRowsPerPageChange} 
          rowsPerPageOptions={[10, 30,50,100]} 
          labelRowsPerPage="每页行数：" 
          labelDisplayedRows={({ from, to }) => {
            return `${from}–${to}`;
          }}
        />
      </Card>
      <EditeModal open={openModal} onCancel={handleCloseModal} onOk={handleOkModal} tokenId={editTokenId} />
    </>
  );
}

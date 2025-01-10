import { Stack, Typography, Container, Box, 
  OutlinedInput, InputAdornment, Button,
  Modal,Paper,TextField
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SubCard from 'ui-component/cards/SubCard';
import inviteImage from 'assets/images/invite/cwok_casual_19.webp';
import { useState,useEffect } from 'react';
import { API } from 'utils/api';
import { showError, showSuccess,renderQuota,inviteQuota } from 'utils/common';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close'; 
import { useNavigate } from 'react-router';

const InviteCard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [inviteUl, setInviteUrl] = useState('');
  const [openTransfer, setOpenTransfer] = useState(false);
  const [transferAmount, setTransferAmount] = useState(0);
  const [userAffQuota, setUserAffQuota] = useState(0);
  const [userAffHistor, setUserAffHistor] = useState(0);
  const [userAffConut, setUserAffCount] = useState(0);
  const [options, setOptions] = useState({});

  const [openWithdrawal, setOpenWithdrawal] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState(0);
  const [alipayAccount, setAlipayAccount] = useState('');

  const commonButtonSx = {
    borderRadius: '8px',
    transition: 'all 0.3s ease-in-out',
    textTransform: 'none',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    }
  };

  const handleInviteUrl = async () => {
    try {
      let link = inviteUl;
      if (!link) {
        const res = await API.get('/api/user/aff');
        const { success, message, data } = res.data;
        if (success) {
          link = `${window.location.origin}/register?aff=${data}`;
          setInviteUrl(link); 
        } else {
          showError(message);
          return; 
        }
      }
      if (navigator.clipboard) {
        navigator.clipboard.writeText(link).then(() => {
          showSuccess(`邀请链接已复制到剪切板`);
        }).catch(() => {
          showError(`复制失败，请手动复制！ ${link}`);
        });
      } else {
        showError(`复制失败，请手动复制！ ${link}`);
      }
    } catch (error) {
      showError('复制到剪切板失败，请手动复制链接。');
    }
  };
  

  // 处理提现额度输入变化
  const handleWithdrawalAmountChange = (event) => {
    setWithdrawalAmount(event.target.value);
  };

  // 处理支付宝账号输入变化
  const handleAlipayAccountChange = (event) => {
    setAlipayAccount(event.target.value);
  };

  // 提交提现请求
  const withdrawal = async () => {
    if (withdrawalAmount <= 0 || alipayAccount.trim() === '') {
      showError('请输入正确的提现金额和支付宝账号');
      return;
    }
    if (withdrawalAmount < Number(options.MiniQuota)) {
      showError('提现金额最低为:' + Number(options.MiniQuota));
      return;
  }
  if (withdrawalAmount > userAffQuota) {
    showError('超出当前余额：' + renderQuota(userAffQuota));
    return;
  }
    const res = await API.post('/api/user/aff_withdrawal', {
      quota: parseFloat(withdrawalAmount),
      alipay_account: alipayAccount.trim(),
    });
    const { success, message } = res.data;
    if (success) {
      showSuccess(message);
      setOpenWithdrawal(false);
      getUserQuota();
    } else {
      showError(message);
    }
  };

  const handleOpenWithdrawal = () => {
    setOpenWithdrawal(true);
  };

  const handleCloseWithdrawal = () => {
    setOpenWithdrawal(false);
  };

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

  const getUserQuota = async () => {
    let res = await API.get(`/api/user/self`);
    
    const {success, message, data} = res.data;
    if (success) {
      setUserAffQuota(data.aff_quota);
      setUserAffHistor(data.aff_history_quota);
      setUserAffCount(data.aff_count);

    } else {
        showError(message);
    }
  }

  const transfer = async () => {
    if (transferAmount < Number(options.MiniQuota)) {
        showError('划转金额最低为:' + Number(options.MiniQuota));
        return;
    }
    if (transferAmount > userAffQuota) {
      showError('超出当前余额：' + renderQuota(userAffQuota));
      return;
    }
    const res = await API.post(
        `/api/user/aff_transfer`,
        {
            quota: parseFloat(transferAmount)
        }
    );
    const {success, message} = res.data;
    if (success) {
        showSuccess(message);
        setOpenTransfer(false);
        getUserQuota();
    } else {
        showError(message);
    }
  };

  const handleOpenTransfer = () => {
    setOpenTransfer(true);
  };

  const handleCloseTransfer = () => {
    setOpenTransfer(false);
};

  
  const handleTransferAmountChange = (event) => {
    setTransferAmount(event.target.value);
  };

  // 新函数，用于将格式化的配额字符串转换为数字
  function parseQuotaStringToNumber(quotaString) {
    const numberString = quotaString.replace(/[^\d.-]/g, '');
    return parseFloat(numberString);
  }


  useEffect(() => {
    
    getOptions(); 
    getUserQuota(); 
    setTransferAmount(options.MiniQuota); 
  }, []); 

  const goWithdrawal = () => {
    navigate('/withdrawal');
  };

  return (
    <Box component="div">
      <SubCard
        sx={{
          background: theme.palette.primary.dark
        }}
      >
        <Stack justifyContent="center" alignItems={'flex-start'} padding={'40px 24px 0px'} spacing={3}>
          <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img src={inviteImage} alt="invite" width={'250px'} />
          </Container>
        </Stack>
      </SubCard>
      <SubCard
        sx={{
          marginTop: '-20px'
        }}
      >
        <Stack justifyContent="center" alignItems={'center'} spacing={3}>
          <Typography variant="h3" sx={{ color: theme.palette.primary.dark }}>
            邀请奖励
          </Typography>
          <Typography variant="body" sx={{ color: theme.palette.primary.dark }}>
            邀请好友注册，好友充值得返现（{options.ProporTions}%）
          </Typography>

          <OutlinedInput
            id="invite-url"
            label="邀请链接"
            type="text"
            value={inviteUl}
            name="invite-url"
            placeholder="点击生成邀请链接"
            endAdornment={
              <InputAdornment position="end">
                <Button 
                  variant="contained" 
                  onClick={handleInviteUrl}
                  sx={{
                    ...commonButtonSx,
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  }}
                >
                  {inviteUl ? '复制' : '生成'}
                </Button>
              </InputAdornment>
            }
            aria-describedby="helper-text-channel-quota-label"
            disabled={true}
          />
          

          {/* 模态对话框：提现 */}
          <Modal
            open={openWithdrawal}
            onClose={handleCloseWithdrawal}
            aria-labelledby="modal-withdrawal-title"
            aria-describedby="modal-withdrawal-description"
          >
            <Paper sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              p: 4,
              borderRadius: 2,
              bgcolor: 'background.paper',
            }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography id="modal-withdrawal-title" variant="h3" component="h2">
                  提现额度
                </Typography>
                <IconButton onClick={handleCloseWithdrawal}>
                  <CloseIcon />
                </IconButton>
              </Stack>
              <Typography id="modal-transfer-description" variant="h5" sx={{ mt: 1 }}>
                可用额度: {inviteQuota(userAffQuota)}
              </Typography>
              <TextField
                margin="normal"
                fullWidth
                name="withdrawalAmount"
                label={`提现额度（最低${options.MiniQuota}）`}
                type="number"
                id="withdrawalAmount"
                value={withdrawalAmount}
                onChange={handleWithdrawalAmountChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">￥</InputAdornment>,
                }}
              />
              <TextField
                margin="normal"
                fullWidth
                name="alipayAccount"
                label="支付宝账号"
                type="text"
                id="alipayAccount"
                value={alipayAccount}
                onChange={handleAlipayAccountChange}
              />
              <Box sx={{ mt: 4 }}>
                <Button 
                  variant="contained"
                  fullWidth 
                  onClick={withdrawal}
                  disabled={!withdrawalAmount || withdrawalAmount < Number(options.MiniQuota) || !alipayAccount}
                  sx={{
                    ...commonButtonSx,
                    background: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
                    '&:disabled': {
                      background: 'linear-gradient(45deg, #9e9e9e 30%, #bdbdbd 90%)',
                      color: 'rgba(255, 255, 255, 0.8)'
                    }
                  }}
                >
                  提交提现
                </Button>
              </Box>
            </Paper>
          </Modal>


        <Modal
          open={openTransfer}
          onClose={handleOpenTransfer}
          aria-labelledby="modal-transfer-title"
          aria-describedby="modal-transfer-description"
        >
          <Paper sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            p: 4,
            borderRadius: 2,
            bgcolor: 'background.paper',
          }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography id="modal-transfer-title" variant="h3" component="h2">
                划转额度
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton onClick={handleCloseTransfer}>
                  <CloseIcon />
                </IconButton>
              </Box>
              
            </Stack>
            <Typography id="modal-transfer-description" variant="h5" sx={{ mt: 1 }}>
              可用额度: {inviteQuota(userAffQuota)}
            </Typography>
            <TextField
              margin="normal"
              fullWidth
              name="transferAmount"
              label={`划转额度（最低${options.MiniQuota}）`}
              type="number"
              id="transferAmount"
              value= {transferAmount}
              onChange={handleTransferAmountChange}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="contained"
                fullWidth 
                onClick={transfer}
                disabled={!transferAmount || transferAmount < Number(options.MiniQuota) || transferAmount > parseQuotaStringToNumber(inviteQuota(userAffQuota))}
                sx={{
                  ...commonButtonSx,
                  background: 'linear-gradient(45deg, #3f51b5 30%, #5c6bc0 90%)',
                  '&:disabled': {
                    background: 'linear-gradient(45deg, #9e9e9e 30%, #bdbdbd 90%)',
                    color: 'rgba(255, 255, 255, 0.8)'
                  }
                }}
              >
                提交划转
              </Button>
            </Box>

          </Paper>
        </Modal>
        </Stack>
        <Box sx={{ 
          boxShadow: theme.shadows[3], // 使用主题中的阴影
          borderRadius: theme.shape.borderRadius, // 使用主题中的圆角
          bgcolor: theme.palette.background.paper, // 设置背景色
          mt: 4, // 设置顶部边距
          mb: 4, // 设置底部边距
          pt: 2, // 内部上边距
          pb: 2, // 内部下边距
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
            {/* 总收益 */}
            <Stack direction="column" alignItems="center" justifyContent="center" spacing={1} sx={{ flex: 1, textAlign: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: theme.palette.info.main }}>总收益</Typography>
              <Typography variant="h4" sx={{ color: theme.palette.primary.main }}>{inviteQuota(userAffHistor)}</Typography>
            </Stack>
            
            {/* 邀请人数 */}
            <Stack direction="column" alignItems="center" justifyContent="center" spacing={1} sx={{ flex: 1, textAlign: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: theme.palette.info.main }}>邀请人数</Typography>
              <Typography variant="h4" sx={{ color: theme.palette.primary.main }}>{userAffConut}</Typography>
            </Stack>

            {/* 待使用收益 */}
            <Stack direction="column" alignItems="center" justifyContent="center" spacing={1} sx={{ flex: 1, textAlign: 'center'}}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: theme.palette.info.main }}>待使用收益</Typography>
              <Typography variant="h4" sx={{ color: theme.palette.error.main }}>{inviteQuota(userAffQuota)}</Typography>
            </Stack>
          </Box>
      
          {/* 操作按钮区域 */}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', pt: 1 }}>
            <Button 
              variant='contained' 
              onClick={handleOpenTransfer} 
              size='small' 
              sx={{ 
                ...commonButtonSx,
                mx: 1,
                background: 'linear-gradient(45deg, #3f51b5 30%, #5c6bc0 90%)',
              }}
            >
              划转
            </Button>
            {options.ProporTions !== "0" && (
              <>
                <Button 
                  variant='contained' 
                  onClick={handleOpenWithdrawal} 
                  size='small' 
                  sx={{ 
                    ...commonButtonSx,
                    mx: 1,
                    background: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
                  }}
                >
                  提现
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={goWithdrawal} 
                  size='small' 
                  sx={{ 
                    ...commonButtonSx,
                    mx: 1,
                    borderColor: '#2196F3',
                    color: '#2196F3',
                    '&:hover': {
                      ...commonButtonSx['&:hover'],
                      borderColor: '#21CBF3',
                      background: 'rgba(33, 150, 243, 0.04)'
                    }
                  }}
                >
                  提现记录
                </Button>
              </>
            )}
          </Box>
        </Box>
      </SubCard>
      
    </Box>
  );
};

export default InviteCard;

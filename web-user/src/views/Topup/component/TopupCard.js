import { Typography, Stack, OutlinedInput, InputAdornment, Button, InputLabel, FormControl,Modal,Box  } from '@mui/material';
import { IconWallet } from '@tabler/icons-react';
import { useTheme } from '@mui/material/styles';
import SubCard from 'ui-component/cards/SubCard';
import UserCard from 'ui-component/cards/UserCard';

import { API } from 'utils/api';
import React, { useEffect, useState } from 'react';
import { showError, showInfo, showSuccess, renderQuota } from 'utils/common';

const TopupCard = () => {
  const theme = useTheme();
  const [redemptionCode, setRedemptionCode] = useState('');
  const [topUpLink, setTopUpLink] = useState('');
  const [zfb, setZfb] = useState('');
  const [wx, setWx] = useState('');
  const [userQuota, setUserQuota] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [topUpCount, setTopUpCount] = useState(10); 
  const [amount, setAmount] = useState(0.0);  
  const [open, setOpen] = useState(false);
  const [payWay, setPayWay] = useState('');
  const [topUpCode, setTopUpCode] = useState(''); 



  const topUp = async () => {
    if (redemptionCode === '') {
      showInfo('请输入充值码！');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await API.post('/api/user/topup', {
        key: redemptionCode
      });
      const { success, message, data } = res.data;
      if (success) {
        showSuccess('充值成功！');
        setUserQuota((quota) => {
          return quota + data;
        });
        setRedemptionCode('');
      } else {
        showError(message);
      }
    } catch (err) {
      showError('请求失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openTopUpLink = () => {
    if (!topUpLink) {
      showError('超级管理员未设置充值链接！');
      return;
    }
    window.open(topUpLink, '_blank');
  };

  const getUserQuota = async () => {
    let res = await API.get(`/api/user/self`);
    
    const {success, message, data} = res.data;
    if (success) {
        setUserQuota(data.quota);
    } else {
        showError(message);
    }
  }

  const [options, setOptions] = useState({});

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
    getUserQuota().then();
    getOptions();
  }, []);

  useEffect(() => {
    if (options.TopUpLink) { 
      setTopUpLink(options.TopUpLink);
    }
    if (options.YzfWx) { 
      setWx(options.YzfWx);
    }
    if (options.YzfZfb) { 
      setZfb(options.YzfZfb);
    }
  }, [options]);
  

  const preTopUp = async (payment) => {
    if (amount === 0) {
      await getAmount(topUpCount);
    }
    setPayWay(payment);
    setOpen(true);
  };
  
  const onlineTopUp = async () => {
    if (amount === 0) {
        await getAmount();
    }
    setOpen(false);
    try {
        const res = await API.post('/api/user/pay', {
            amount: parseInt(topUpCount),
            top_up_code: topUpCode, 
            payment_method: payWay
        });
        if (res !== undefined) {
            const {message, data} = res.data;
            // showInfo(message);
            if (message === 'success') {

                let params = data
                let url = res.data.url
                let form = document.createElement('form')
                form.action = url
                form.method = 'POST'
                // 判断是否为safari浏览器
                let isSafari = navigator.userAgent.indexOf("Safari") > -1 && navigator.userAgent.indexOf("Chrome") < 1;
                if (!isSafari) {
                    form.target = '_blank'
                }
                for (let key in params) {
                    let input = document.createElement('input')
                    input.type = 'hidden'
                    input.name = key
                    input.value = params[key]
                    form.appendChild(input)
                }
                document.body.appendChild(form)
                form.submit()
                document.body.removeChild(form)
            } else {
                showError(data);
                // setTopUpCount(parseInt(res.data.count));
                // setAmount(parseInt(data));
            }
        } else {
            showError(res);
        }
    } catch (err) {
      showError('请求失败');
      console.error(err); // 输出错误到控制台
    }
  };

  const renderAmount = () => {
    return amount + '元';
  };

  const getAmount = async (value = topUpCount) => {
    if (value === undefined) {
        value = topUpCount;
    }
    try {
        const res = await API.post('/api/user/amount', {
            amount: parseFloat(value),
            top_up_code: setTopUpCode 
        });
        if (res !== undefined) {
            const {message, data} = res.data;
            // showInfo(message);
            if (message === 'success') {
                setAmount(parseFloat(data));
            } else {
                showError(data);
            }
        } else {
            showError(res);
        }
    } catch (err) {
      showError('请求失败');
      console.error(err); // 输出错误到控制台
    } 
  };



  return (
    <UserCard>
      <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} paddingTop={'20px'}>
        <IconWallet color={theme.palette.primary.main} />
        <Typography variant="h4">当前额度:</Typography>
        <Typography variant="h4">{renderQuota(userQuota)}</Typography>
      </Stack>
      <SubCard
        sx={{
          marginTop: '40px'
        }}
      >
        <SubCard sx={{ marginTop: '40px' }}>
        <FormControl fullWidth variant="outlined">
          <InputLabel htmlFor="key">兑换码</InputLabel>
          <OutlinedInput
            id="key"
            label="兑换码"
            type="text"
            value={redemptionCode}
            onChange={(e) => {
              setRedemptionCode(e.target.value);
            }}
            name="key"
            placeholder="请输入兑换码"
            endAdornment={
              <InputAdornment position="end">
                <Button variant="contained" onClick={topUp} disabled={isSubmitting}>
                  {isSubmitting ? '兑换中...' : '兑换'}
                </Button>
              </InputAdornment>
            }
            aria-describedby="helper-text-channel-quota-label"
          />
        </FormControl>

        {topUpLink && (
          <Stack justifyContent="center" alignItems={'center'} spacing={3} paddingTop={'20px'}>
            <Typography variant={'h4'} color={theme.palette.grey[700]}>
              还没有兑换码？ 点击获取兑换码：
            </Typography>
            <Button variant="contained" onClick={openTopUpLink}>
              获取兑换码
            </Button>
          </Stack>
        )}
        </SubCard>
       
        <SubCard sx={{ marginTop: '40px' }}>
          {/* 在线充值部分 */}
          <Typography variant="h3" color={theme.palette.grey[700]} sx={{ marginBottom: '20px' }}>
            在线充值
          </Typography>
          
          <FormControl fullWidth variant="outlined" sx={{ mt: 2, mb: 1 }}>
            <InputLabel htmlFor="amount">充值金额</InputLabel>
            <OutlinedInput
              id="amount"
              label="充值金额"
              type="number"
              value={topUpCount} 
              onChange={(e) => {
                const newTopUpCount = e.target.value;
                setTopUpCount(newTopUpCount); 
                getAmount(newTopUpCount); 
              }}
              startAdornment={<InputAdornment position="start">$</InputAdornment>}
              
            />
          </FormControl>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}> {/* 添加 Stack 的 margin-bottom */}
    {zfb === 'true' && (
      <Button variant="contained" onClick={() => preTopUp('zfb')}>
        支付宝
      </Button>
    )}
    {wx === 'true' && (
      <Button variant="contained" onClick={() => preTopUp('wx')}>
        微信
      </Button>
    )}
  </Stack>
        </SubCard>
          <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 1,
        }}>
          <Typography variant="h6" component="h2">
            确定要充值吗
          </Typography>
          <Typography sx={{ mt: 2 }}>充值金额：{topUpCount}$</Typography>
          <Typography sx={{ mt: 2 }}>实付金额：{renderAmount()}</Typography>
          <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
            <Button onClick={() => setOpen(false)} color="error">取消</Button>
            <Button onClick={() => onlineTopUp()} variant="contained" disabled={isSubmitting}>
              {isSubmitting ? '处理中...' : '确认充值'}
            </Button>
          </Stack>
        </Box>
      </Modal>
      </SubCard>
    </UserCard>
  );
};

export default TopupCard;

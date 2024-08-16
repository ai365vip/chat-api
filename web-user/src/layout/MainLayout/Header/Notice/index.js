import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Box, Stack, IconButton, Tooltip } from '@mui/material';
import { API } from 'utils/api';
import { marked } from 'marked';
import { showError, showNotice } from 'utils/common';
import Campaign from '@mui/icons-material/Campaign';

const Notice = () => {
  const account = useSelector((state) => state.account);

  const displayNotice = async () => {
    try {
      const res = await API.get('/api/notice');
      const { success, message, data } = res.data;
      if (success && data) { 
        const htmlNotice = marked(data);
        showNotice(htmlNotice, true);
        // 更新最后显示时间
        localStorage.setItem('lastNoticeTime', Date.now().toString());
      } else if (!success) {
        showError(message || '加载公告失败');
      }
    } catch (error) {
      showError('无法加载公告: ' + (error.message || '未知错误'));
    }
  };

  const checkAndDisplayNotice = () => {
    if (account.user) {
      const lastNoticeTime = localStorage.getItem('lastNoticeTime');
      const currentTime = Date.now();
      const hoursPassed = (currentTime - parseInt(lastNoticeTime || '0')) / (1000 * 60 * 60);
    
      if (!lastNoticeTime || hoursPassed >= 24) {
        displayNotice();
      }
    }
  };
  

  useEffect(() => {
    checkAndDisplayNotice();
  }, [account.user]); // 添加 account 作为依赖项

  return (
    <>
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ flexGrow: 1 }} />
      <Stack spacing={2} direction="row">
        <Tooltip title="公告">
          <IconButton onClick={displayNotice} color="primary">
            <Campaign />
          </IconButton>
        </Tooltip>
      </Stack>
    </>
  );
};

export default Notice;

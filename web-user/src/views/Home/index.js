import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { showError, showNotice } from 'utils/common';
import { API } from 'utils/api';
import { marked } from 'marked';
import BaseIndex from './baseIndex';
import { Box, Container } from '@mui/material';



const Home = () => {
  const [homePageContentLoaded, setHomePageContentLoaded] = useState(false);
  const [homePageContent, setHomePageContent] = useState('');
  const account = useSelector((state) => state.account);
  const isUserLoggedIn = () => {
    // 使用 Redux 中的 account 状态来判断用户是否登录
    return !!account.user; // 假设 token 存在即表示用户已登录
  };
  const displayNotice = async () => {
    try {
      const res = await API.get('/api/notice');
      const { success, message, data } = res.data;
      if (success && data) { 
        const htmlNotice = marked(data);
        showNotice(htmlNotice, true);
      } else if (!success) {
        showError(message);
      }
    } catch (error) {
      showError('无法加载公告');
    }
  };
  

  const displayHomePageContent = async () => {
    setHomePageContent(localStorage.getItem('home_page_content') || '');
    const res = await API.get('/api/home_page_content');
    const { success, message, data } = res.data;
    if (success) {
      let content = data;
      if (!data.startsWith('https://')) {
        content = marked.parse(data);
      }
      setHomePageContent(content);
      localStorage.setItem('home_page_content', content);
    } else {
      showError(message);
      setHomePageContent('加载首页内容失败...');
    }
    setHomePageContentLoaded(true);
  };

  const checkAndDisplayNotice = () => {
    if (!isUserLoggedIn()) {
      // 只有未登录用户才显示公告
      displayNotice();
    }
  };

  useEffect(() => {
    checkAndDisplayNotice();
    displayHomePageContent().then();
  }, []);

  return (
    <>
      {homePageContentLoaded && homePageContent === '' ? (
        <BaseIndex />
      ) : (
        <>
          <Box>
            {homePageContent.startsWith('https://') ? (
              <iframe title="home_page_content" src={homePageContent} style={{ width: '100%', height: '100vh', border: 'none' }} />
            ) : (
              <>
                <Container>
                  <div style={{ fontSize: 'larger' }} dangerouslySetInnerHTML={{ __html: homePageContent }}></div>
                </Container>
              </>
            )}
          </Box>
        </>
      )}
    </>
  );
};

export default Home;

import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Button, Stack } from '@mui/material';
import LogoSection from 'layout/MainLayout/LogoSection';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ThemeButton from 'ui-component/ThemeButton';
import { API } from 'utils/api';
const Header = () => {
  const theme = useTheme();
  const { pathname } = useLocation();
  const account = useSelector((state) => state.account);
  const [chatLink, setChatLink] = useState('');

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const res = await API.get('/api/status');
      const { success, data } = res.data;
      if (success && data.chat_link) {
        localStorage.setItem('chat_link', data.chat_link);
        setChatLink(data.chat_link);
      } else {
        localStorage.removeItem('chat_link');
        setChatLink('');
      }
    } catch (error) {
      console.error('Error loading status:', error);
      localStorage.removeItem('chat_link');
      setChatLink('');
    }
  };

  const NavButton = ({ to, children }) => (
    <Button
      component={Link}
      to={chatLink ? `${to}?chat_link=${encodeURIComponent(chatLink)}` : to}
      sx={{
        color: pathname === to ? theme.palette.primary.main : theme.palette.text.primary,
        fontWeight: pathname === to ? 'bold' : 'normal',
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          width: pathname === to ? '100%' : '0%',
          height: '2px',
          bottom: 0,
          left: 0,
          backgroundColor: theme.palette.primary.main,
          transition: 'width 0.3s ease-in-out'
        },
        '&:hover::after': {
          width: '100%'
        },
        '&:hover': {
          backgroundColor: 'transparent',
          color: theme.palette.primary.main
        }
      }}
    >
      {children}
    </Button>
  );

  return (
    <>
      <Box
        sx={{
          width: 228,
          display: 'flex',
          [theme.breakpoints.down('md')]: {
            width: 'auto'
          }
        }}
      >
        <Box component="span" sx={{ flexGrow: 1 }}>
          <LogoSection />
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ flexGrow: 1 }} />
      <Stack spacing={2} direction="row" alignItems="center">
        <NavButton to="/home">首页</NavButton>
        <NavButton to="/about">教程</NavButton>
        {chatLink && <NavButton to="/chatweb" chatLink={chatLink}>对话</NavButton>}
        <ThemeButton />
        {account.user ? (
          <Button
            component={Link}
            variant="contained"
            to="/login"
            color="primary"
            sx={{
              boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.15s ease',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)'
              }
            }}
          >
            控制台
          </Button>
        ) : (
          <Button
            component={Link}
            variant="contained"
            to="/login"
            color="primary"
            sx={{
              boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.15s ease',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)'
              }
            }}
          >
            登入
          </Button>
        )}
      </Stack>
    </>
  );
};

export default Header;
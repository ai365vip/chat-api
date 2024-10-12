import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Button, Stack, useMediaQuery } from '@mui/material';
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
  const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('xs'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

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
        fontSize: isSmallScreen ? '0.8rem' : '1rem',
        padding: isSmallScreen ? '6px 8px' : '8px 16px',
        minWidth: 'auto',
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
    <Box sx={{ 
      display: 'flex', 
      flexDirection: isExtraSmallScreen ? 'column' : 'row',
      alignItems: 'center',
      width: '100%',
      padding: isSmallScreen ? '2px' : '4px', 
      marginTop: '-8px', 
    }}>
      <Box
        sx={{
          width: isSmallScreen ? 'auto' : 228,
          marginBottom: isExtraSmallScreen ? '8px' : '0',
        }}
      >
        <LogoSection />
      </Box>

      <Stack 
        spacing={isSmallScreen ? 1 : 2} 
        direction={isExtraSmallScreen ? 'column' : 'row'} 
        alignItems="center"
        sx={{ 
          flexGrow: 1, 
          justifyContent: isExtraSmallScreen ? 'center' : 'flex-end',
          marginTop: isExtraSmallScreen ? '8px' : '0',
        }}
      >
        <NavButton to="/home">首页</NavButton>
        <NavButton to="/about">教程</NavButton>
        {chatLink && <NavButton to="/chatweb" chatLink={chatLink}>对话</NavButton>}
        <ThemeButton />
        <Button
          component={Link}
          variant="contained"
          to="/login"
          color="primary"
          sx={{
            boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.15s ease',
            fontSize: isSmallScreen ? '0.8rem' : '1rem',
            padding: isSmallScreen ? '6px 12px' : '8px 16px',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)'
            }
          }}
        >
          {account.user ? '控制台' : '登入'}
        </Button>
      </Stack>
    </Box>
  );
};

export default Header;
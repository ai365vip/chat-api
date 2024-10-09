import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import { Avatar, Box, ButtonBase, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import LogoSection from '../LogoSection';
import ProfileSection from './ProfileSection';
import Notice from './Notice';
import ThemeButton from 'ui-component/ThemeButton';
import { IconMenu2 } from '@tabler/icons-react';
import { API } from 'utils/api';

const Header = ({ handleLeftDrawerToggle }) => {
  const theme = useTheme();
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

  const NavButton = ({ to, children, chatLink }) => (
    <Button
      component={Link}
      to={chatLink ? `${to}?chat_link=${encodeURIComponent(chatLink)}` : to}
      sx={{
        color: theme.palette.text.primary,
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
        <Box component="span" sx={{ display: { xs: 'none', md: 'block' }, flexGrow: 1 }}>
          <LogoSection />
        </Box>
        <ButtonBase sx={{ borderRadius: '12px', overflow: 'hidden' }}>
          <Avatar
            variant="rounded"
            sx={{
              ...theme.typography.commonAvatar,
              ...theme.typography.mediumAvatar,
              ...theme.typography.menuButton,
              transition: 'all .2s ease-in-out',
              '&:hover': {
                background: theme.palette.secondary.dark,
                color: theme.palette.secondary.light
              }
            }}
            onClick={handleLeftDrawerToggle}
            color="inherit"
          >
            <IconMenu2 stroke={1.5} size="1.3rem" />
          </Avatar>
        </ButtonBase>
      </Box>

      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ flexGrow: 1 }} />
      <Notice />
      {chatLink && <NavButton to="/chatweb" chatLink={chatLink}>对话</NavButton>}
      <ThemeButton />
      <ProfileSection />
    </>
  );
};

Header.propTypes = {
  handleLeftDrawerToggle: PropTypes.func
};

export default Header;
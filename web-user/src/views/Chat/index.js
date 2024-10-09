import React, { useState, useEffect } from 'react';
import { Box, Container } from '@mui/material';

const Chat = () => {
  const [chatLink, setChatLink] = useState('');

  useEffect(() => {
    // 使用 window.location 获取完整的 URL
    const fullUrl = window.location.href;

    // 使用正则表达式提取完整的 chat_link 参数
    const chatLinkMatch = fullUrl.match(/chat_link=(.*)/);
    let linkFromUrl = chatLinkMatch ? chatLinkMatch[1] : null;

    if (linkFromUrl) {
      // 解码 URL，保持完整的 URL（包括 hash 部分）
      linkFromUrl = decodeURIComponent(linkFromUrl);
      setChatLink(linkFromUrl);
      // 将链接存储到 localStorage
      localStorage.setItem('chat_link', linkFromUrl);
    } else {
      // 如果 URL 中没有 chat_link，尝试从 localStorage 获取
      const storedLink = localStorage.getItem('chat_link');
      if (storedLink) {
        setChatLink(storedLink);
      }
    }
  }, []); // 空数组意味着这个 effect 只在组件挂载时运行一次

  return (
    <Container maxWidth="xl" sx={{ 
      height: '93vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <Box sx={{ 
        width: '100%', 
        height: '85vh', 
        maxWidth: '2000px', 
        maxHeight: '1100px', 
        boxShadow: 3, 
        borderRadius: 2, 
        overflow: 'hidden'
      }}>
        {chatLink && (
          <iframe 
            src={chatLink}
            title="ChatGPT Web"
            style={{ 
              width: '100%', 
              height: '100%', 
              border: 'none',
            }}
            allow="fullscreen"
          />
        )}
      </Box>
    </Container>
  );
};

export default Chat;
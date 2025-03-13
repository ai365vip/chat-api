import React from 'react';
import { enqueueSnackbar, closeSnackbar, SnackbarContent } from 'notistack';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle,Box,Typography   } from '@mui/material';
import { snackbarConstants } from 'constants/SnackbarConstants';
import { API } from './api';
export function getSystemName() {
  let system_name = localStorage.getItem('system_name');
  if (!system_name) return 'Chat API';
  return system_name;
}
import { 
  OpenAI, Claude, Gemini, DeepSeek, Zhipu, Hunyuan, 
  Spark, Minimax, Yi, Groq, Ollama, 
  Doubao, Ai360, Midjourney, Flux, Grok, Suno,
  Pika, Vidu,BaiduCloud,AlibabaCloud,Cohere,Baichuan,Kimi
} from '@lobehub/icons';


export function isMobile() {
  return window.innerWidth <= 600;
}

// eslint-disable-next-line
export function SnackbarHTMLContent({ htmlContent }) {
  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
}

export function getSnackbarOptions(variant) {
  let options = snackbarConstants.Common[variant];
  
  // 添加 anchorOrigin 属性以确定Snackbar的位置
  const positionOptions = {
    anchorOrigin: {
      vertical: 'top',
      horizontal: 'left',
    }
  };

  if (isMobile()) {
    // 合并 options、positionOptions 和 snackbarConstants.Mobile
    options = { ...options, ...positionOptions, ...snackbarConstants.Mobile };
  } else {
    // 合并 options 和 positionOptions
    options = { ...options, ...positionOptions };
  }

  return options;
}



export function showError(error) {
  if (error.message) {
    if (error.name === 'AxiosError') {
      switch (error.response.status) {
        case 429:
          enqueueSnackbar('错误：请求次数过多，请稍后再试！', getSnackbarOptions('ERROR'));
          break;
        case 500:
          enqueueSnackbar('错误：服务器内部错误，请联系管理员！', getSnackbarOptions('ERROR'));
          break;
        case 405:
          enqueueSnackbar('本站仅作演示之用，无服务端！', getSnackbarOptions('INFO'));
          break;
        default:
          enqueueSnackbar('错误：' + error.message, getSnackbarOptions('ERROR'));
      }
      return;
    }
  } else {
    enqueueSnackbar('错误：' + error, getSnackbarOptions('ERROR'));
  }
}

export function showNotice(message, isHTML = false) {
  const NoticeContent = React.forwardRef(({ id, ...props }, ref) => {
    return (
      <SnackbarContent ref={ref} role="alert" {...props}>
        <Dialog 
          open={true} 
          maxWidth="md" 
          fullWidth
          style={{ pointerEvents: 'auto' }}
          disableEscapeKeyDown
          onClose={(event, reason) => {
            if (reason !== 'backdropClick') {
              closeSnackbar(id);
            }
          }}
        >
          <DialogTitle>
            <Typography 
              variant="h4" 
              align="center" 
              sx={{ 
                fontWeight: 'bold',
                fontSize: '28px',
              }}
            >
              服务公告
            </Typography>
          </DialogTitle>
          <DialogContent>
            {isHTML ? (
              <div dangerouslySetInnerHTML={{ __html: message }} />
            ) : (
              <p>{message}</p>
            )}
          </DialogContent>
          <DialogActions>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Button 
                onClick={() => closeSnackbar(id)} 
                color="primary" 
                variant="contained"
                sx={{
                  borderRadius: '20px',
                  padding: '6px 20px',
                  textTransform: 'none',
                }}
              >
                我已知晓
              </Button>
            </Box>
          </DialogActions>
        </Dialog>
      </SnackbarContent>
    );
  });

  NoticeContent.displayName = 'NoticeContent';

  enqueueSnackbar(message, {
    content: (key) => <NoticeContent id={key} />,
    anchorOrigin: {
      vertical: 'top',
      horizontal: 'center',
    },
    persist: true,
    preventDuplicate: true,
    autoHideDuration: null,
    disableWindowBlurListener: true,
    style: { pointerEvents: 'none' },
  });
}

export function showWarning(message) {
  enqueueSnackbar(message, getSnackbarOptions('WARNING'));
}

export function showSuccess(message) {
  enqueueSnackbar(message, getSnackbarOptions('SUCCESS'));
}

export function showInfo(message) {
  enqueueSnackbar(message, getSnackbarOptions('INFO'));
}

export async function getOAuthState() {
  const res = await API.get('/api/oauth/state');
  const { success, message, data } = res.data;
  if (success) {
    return data;
  } else {
    showError(message);
    return '';
  }
}

export async function onGitHubOAuthClicked(github_client_id, openInNewTab = false) {
  const state = await getOAuthState();
  if (!state) return;
  let url = `https://github.com/login/oauth/authorize?client_id=${github_client_id}&state=${state}&scope=user:email`;
  if (openInNewTab) {
    window.open(url);
  } else {
    window.location.href = url;
  }
}

export function isAdmin() {
  let user = localStorage.getItem('user');
  if (!user) return false;
  user = JSON.parse(user);
  return user.role >= 10;
}

export function timestamp2string(timestamp) {
  let date = new Date(timestamp * 1000);
  let year = date.getFullYear().toString();
  let month = (date.getMonth() + 1).toString();
  let day = date.getDate().toString();
  let hour = date.getHours().toString();
  let minute = date.getMinutes().toString();
  let second = date.getSeconds().toString();
  if (month.length === 1) {
    month = '0' + month;
  }
  if (day.length === 1) {
    day = '0' + day;
  }
  if (hour.length === 1) {
    hour = '0' + hour;
  }
  if (minute.length === 1) {
    minute = '0' + minute;
  }
  if (second.length === 1) {
    second = '0' + second;
  }
  return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
}

export function calculateQuota(quota, digits = 2) {
  let quotaPerUnit = localStorage.getItem('quota_per_unit');
  quotaPerUnit = parseFloat(quotaPerUnit);

  return (quota / quotaPerUnit).toFixed(digits);
}

export function getQuotaPerUnit() {
  let quotaPerUnit = localStorage.getItem('quota_per_unit');
  quotaPerUnit = parseFloat(quotaPerUnit);
  return quotaPerUnit;
}



export function renderQuota(quota, digits = 2) {
  let quotaPerUnit = localStorage.getItem('quota_per_unit');
  let displayInCurrency = localStorage.getItem('display_in_currency');
  quotaPerUnit = parseFloat(quotaPerUnit);
  displayInCurrency = displayInCurrency === 'true';
  if (displayInCurrency) {
      return '$' + (quota / quotaPerUnit).toFixed(digits);
  }
  return renderNumber(quota);
}

export function inviteQuota(quota, digits = 2) {
  let quotaPerUnit = localStorage.getItem('quota_per_unit');
  let displayInCurrency = localStorage.getItem('display_in_currency');
  quotaPerUnit = parseFloat(quotaPerUnit);
  displayInCurrency = displayInCurrency === 'true';
  if (displayInCurrency) {
      return '$' + (quota / quotaPerUnit).toFixed(digits);
  }
  return renderNumber(quota);
}


export const verifyJSON = (str) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

export function renderNumber(num) {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 10000) {
    return (num / 1000).toFixed(1) + 'k';
  } else {
    return num;
  }
}

export function renderQuotaWithPrompt(quota, digits) {
  let displayInCurrency = localStorage.getItem('display_in_currency');
  displayInCurrency = displayInCurrency === 'true';
  if (displayInCurrency) {
    return `（等价金额：${renderQuota(quota*500000, digits)}）`;
  }
  return '';
}

export function downloadTextAsFile(text, filename) {
  let blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  let url = URL.createObjectURL(blob);
  let a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
}

export function removeTrailingSlash(url) {
  if (url.endsWith('/')) {
    return url.slice(0, -1);
  } else {
    return url;
  }
}

export const getModelIcon = (modelName) => {
  if (modelName.startsWith('gpt-3')) {
    return <OpenAI.Avatar size={20} type="gpt3" />;
  } else if (modelName.startsWith('gpt-4') || modelName.startsWith('chatgpt')) {
    return <OpenAI.Avatar size={20} type="gpt4" />;
  } else if (modelName.startsWith('o1') || modelName.startsWith('o3')) {
    return <OpenAI.Avatar size={20} type="o1" />;
  } else if (modelName.startsWith('tts') || modelName.startsWith('dall-e') || 
  modelName.startsWith('whisper') || modelName.startsWith('omni-') || 
  modelName.startsWith('text-embedding') || modelName.startsWith('text-moderation-')
   || modelName.startsWith('davinci') ||  modelName.startsWith('babbage')
  ) {
    return <OpenAI.Avatar size={20} />;
  }else if (modelName.startsWith('claude')) {
    return <Claude.Color size={20} />;
  } else if (modelName.startsWith('gemini')) {
    return <Gemini.Color size={20} />;
  } else if (modelName.startsWith('deepseek')) {
    return <DeepSeek.Color size={20} />;
  } else if (modelName.startsWith('glm') || modelName.startsWith('chatglm')) {
    return <Zhipu.Color size={20} />;
  } else if (modelName.startsWith('hunyuan')) {
    return <Hunyuan.Color size={20} />;
  } else if (modelName.startsWith('Spark')) {
    return <Spark.Color size={20} />;
  } else if (modelName.startsWith('abab')) {
    return <Minimax.Color size={20} />;
  } else if (modelName.startsWith('moonshot')) {
    return <Kimi.Color size={20} />;
  } else if (modelName.startsWith('yi')) {
    return <Yi.Color size={20} />;
  } else if (modelName.startsWith('groq')) {
    return <Groq size={20} />;
  } else if (modelName.startsWith('ollama') || modelName.startsWith('llama')) {
    return <Ollama size={20} />;
  } else if (modelName.startsWith('doubao')) {
    return <Doubao.Color size={20} />;
  } else if (modelName.startsWith('360')) {
    return <Ai360.Color size={20} />;
  } else if (modelName.startsWith('midjourney') || modelName.startsWith('mj-chat')) {
    return <Midjourney size={20} />;
  } else if (modelName.startsWith('flux')) {
    return <Flux size={20} />;
  } else if (modelName.startsWith('grok')) {
    return <Grok size={20} />;
  } else if (modelName.startsWith('suno')) {
    return <Suno size={20} />;
  } else if (modelName.startsWith('pika')) {
    return <Pika size={20} />;
  } else if (modelName.startsWith('vidu')) {
    return <Vidu.Color size={20} />;
  } else if (modelName.startsWith('ERNIE-')) {
    return <BaiduCloud.Color size={20} />;
  } else if (modelName.startsWith('qwen-')) {
    return <AlibabaCloud.Color size={20} />;
  } else if (modelName.startsWith('command')) {
    return <Cohere.Color size={20} />;
  } else if (modelName.startsWith('Baichuan')) {
    return <Baichuan.Color size={20} />;
  }
  return null;
};

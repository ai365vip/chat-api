import { useState, useEffect } from 'react';
import UserCard from 'ui-component/cards/UserCard';
import {
  Card,
  Button,
  InputLabel,
  FormControl,
  OutlinedInput,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,Box,Chip,Typography 
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import SubCard from 'ui-component/cards/SubCard';
import { IconBrandWechat, IconBrandGithub, IconMail } from '@tabler/icons-react';
import Label from 'ui-component/Label';
import { API } from 'utils/api';
import { showError, showSuccess,onGitHubOAuthClicked } from 'utils/common';
import * as Yup from 'yup';
import WechatModal from 'views/Authentication/AuthForms/WechatModal';
import { useSelector } from 'react-redux';
import EmailModal from './component/EmailModal';
import Turnstile from 'react-turnstile';
import { getModelIcon } from 'utils/common';
const validationSchema = Yup.object().shape({
  username: Yup.string().required('用户名 不能为空').min(3, '用户名 不能小于 3 个字符'),
  display_name: Yup.string(),
  password: Yup.string().test('password', '密码不能小于 8 个字符', (val) => {
    return !val || val.length >= 8;
  })
});

// 添加一个通用的按钮样式
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

const MODEL_CATEGORIES = [
  { key: 'OpenAI', includes: ['gpt-3', 'gpt-4', 'o1', 'o3', 'o4', 'chatgpt', 'tts', 'dall-e', 'whisper', 'omni-', 'text-embedding','text-moderation-','davinci','babbage'] },
  { key: 'Claude', includes: ['claude'] },
  { key: 'Gemini', includes: ['gemini'] },
  { key: 'Deep Seek', includes: ['deepseek'] },
  { key: 'Grok', includes: ['grok'] },
  { key: '智谱AI', includes: ['glm','chatglm'] },
  { key: '混元', includes: ['hunyuan'] },
  { key: 'Spark', includes: ['spark'] },
  { key: 'Minimax', includes: ['abad'] },
  { key: 'kimi', includes: ['moonshot'] },
  { key: '一零万物', includes: ['yi'] },
  { key: 'Groq', includes: ['groq'] },
  { key: 'Ollama', includes: ['ollama','llama'] },
  { key: '豆包', includes: ['doubao'] },
  { key: '360', includes: ['360'] },
  { key: 'Midjourney', includes: ['midjourney', 'mj-chat'] },
  { key: 'Flux', includes: ['flux'] },
  { key: 'Suno', includes: ['suno'] },
  { key: 'Pika', includes: ['pika'] },
  { key: 'Vidu', includes: ['vidu'] },
  { key: 'Baidu', includes: ['ERNIE'] },
  { key: 'Ali', includes: ['qwen'] },
  { key: 'Cohere', includes: ['command'] },
  { key: 'Baichuan', includes: ['Baichuan'] },
  { key: 'ERNIE-', includes: ['ERNIE-'] },
  { key: 'command', includes: ['command'] },
  { key: 'Baichuan', includes: ['Baichuan'] },

];

export default function Profile() {
  const [inputs, setInputs] = useState([]);
  const [showAccountDeleteModal, setShowAccountDeleteModal] = useState(false);
  const [turnstileEnabled, setTurnstileEnabled] = useState(false);
  const [turnstileSiteKey, setTurnstileSiteKey] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [openWechat, setOpenWechat] = useState(false);
  const [openEmail, setOpenEmail] = useState(false);
  const status = useSelector((state) => state.siteInfo);
  const [models, setModels] = useState([]);
  const [editMode, setEditMode] = useState(false);

  const handleWechatOpen = () => {
    setOpenWechat(true);
  };

  const handleWechatClose = () => {
    setOpenWechat(false);
  };

  const handleInputChange = (event) => {
    let { name, value } = event.target;
    setInputs((inputs) => ({ ...inputs, [name]: value }));
  };

  const loadUser = async () => {
    let res = await API.get(`/api/user/self`);
    const { success, message, data } = res.data;
    if (success) {
      setInputs(data);
    } else {
      showError(message);
    }
  };
  
  const bindWeChat = async (code) => {
    if (code === '') return;
    try {
      const res = await API.get(`/api/oauth/wechat/bind?code=${code}`);
      const { success, message } = res.data;
      if (success) {
        showSuccess('微信账户绑定成功！');
      }
      return { success, message };
    } catch (err) {
      // 请求失败，设置错误信息
      return { success: false, message: '' };
    }
  };

  const generateAccessToken = async () => {
    const res = await API.get('/api/user/token');
    const { success, message, data } = res.data;
    if (success) {
      setInputs((inputs) => ({ ...inputs, access_token: data }));
      navigator.clipboard.writeText(data);
      showSuccess(`令牌已重置并已复制到剪贴板`);
    } else {
      showError(message);
    }

    //console.log(turnstileEnabled, turnstileSiteKey, status);
  };

  const submit = async () => {
    try {
      await validationSchema.validate(inputs);
      const res = await API.put(`/api/user/self`, inputs);
      const { success, message } = res.data;
      if (success) {
        showSuccess('用户信息更新成功！');
      } else {
        showError(message);
      }
    } catch (err) {
      showError(err.message);
    }
  };

  const loadModels = async () => {
    try {
        let res = await API.get('/api/user/models');
        const { success, message, data } = res.data;
        if (success) {
            // 对模型进行分类和排序
            const sortedModels = data.sort((a, b) => {
                const getModelPriority = (model) => {
                    if (model.toLowerCase().includes('gpt')) return 1;
                    if (model.toLowerCase().includes('claude')) return 2;
                    if (model.toLowerCase().includes('gemini')) return 3;
                    return 4;
                };
                return getModelPriority(a) - getModelPriority(b);
            });
            setModels(sortedModels);
        } else {
            showError(message);
        }
    } catch (err) {
        showError(err.message);
    }
  };

  const copyAllModels = () => {
    if (!models || models.length === 0) {
      showError('没有可用的模型！');
      return;
    }

    const modelString = models.join(',');
    
    if (!navigator.clipboard) {
      showError(`复制失败，请手动复制！ ${modelString}`);
      return;
    }

    navigator.clipboard.writeText(modelString)
      .then(() => {
        showSuccess('所有模型已复制到剪贴板');
      })
      .catch(() => {
        showError(`复制失败，请手动复制！ ${modelString}`);
      });
  };

  useEffect(() => {
    if (status) {
      if (status.turnstile_check) {
        setTurnstileEnabled(true);
        setTurnstileSiteKey(status.turnstile_site_key);
      }
    }
    loadUser().then();
    loadModels();
  }, [status]);
  

  return (
    <>
      <UserCard>
        <Card sx={{ paddingTop: '20px' }}>
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} sx={{ paddingBottom: '20px' }}>
              <Label variant="ghost" color={inputs.wechat_id ? 'primary' : 'default'}>
                <IconBrandWechat /> {inputs.wechat_id || '未绑定'}
              </Label>
              <Label variant="ghost" color={inputs.github_id ? 'primary' : 'default'}>
                <IconBrandGithub /> {inputs.github_id || '未绑定'}
              </Label>
              <Label variant="ghost" color={inputs.email ? 'primary' : 'default'}>
                <IconMail /> {inputs.email || '未绑定'}
              </Label>
            </Stack>
            <SubCard title="个人信息">
              {!editMode ? (
                <Grid container spacing={2}>
                  <Grid xs={12}>
                    <Stack spacing={1.5}>
                      <Box display="flex" alignItems="center">
                        <Typography variant="subtitle1" color="textSecondary" sx={{ width: 120 }}>
                          用户名
                        </Typography>
                        <Typography variant="body1">
                          {inputs.username}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <Typography variant="subtitle1" color="textSecondary" sx={{ width: 120 }}>
                          显示名称
                        </Typography>
                        <Typography variant="body1">
                          {inputs.display_name || '未设置'}
                        </Typography>
                      </Box>
                    </Stack>
                    <Button 
                      variant="contained" 
                      onClick={() => setEditMode(true)} 
                      sx={{ 
                        mt: 3,
                        ...commonButtonSx,
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        color: 'white'
                      }}
                    >
                      修改密码
                    </Button>
                  </Grid>
                </Grid>
              ) : (
                <Grid container spacing={2}>
                  <Grid xs={12}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel htmlFor="username">用户名</InputLabel>
                      <OutlinedInput
                        id="username"
                        label="用户名"
                        type="text"
                        value={inputs.username || ''}
                        onChange={handleInputChange}
                        name="username"
                        placeholder="请输入用户名"
                      />
                    </FormControl>
                  </Grid>
                  <Grid xs={12}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel htmlFor="password">密码</InputLabel>
                      <OutlinedInput
                        id="password"
                        label="密码"
                        type="password"
                        value={inputs.password || ''}
                        onChange={handleInputChange}
                        name="password"
                        placeholder="请输入密码"
                      />
                    </FormControl>
                  </Grid>
                  <Grid xs={12}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel htmlFor="display_name">显示名称</InputLabel>
                      <OutlinedInput
                        id="display_name"
                        label="显示名称"
                        type="text"
                        value={inputs.display_name || ''}
                        onChange={handleInputChange}
                        name="display_name"
                        placeholder="请输入显示名称"
                      />
                    </FormControl>
                  </Grid>
                  <Grid xs={12}>
                    <Stack direction="row" spacing={2}>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={submit}
                        sx={{
                          ...commonButtonSx,
                          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        }}
                      >
                        提交
                      </Button>
                      <Button 
                        variant="outlined" 
                        onClick={() => setEditMode(false)}
                        sx={{
                          ...commonButtonSx,
                          borderColor: '#2196F3',
                          '&:hover': {
                            ...commonButtonSx['&:hover'],
                            borderColor: '#21CBF3',
                            background: 'rgba(33, 150, 243, 0.04)'
                          }
                        }}
                      >
                        取消
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              )}
            </SubCard>
            <SubCard title="">
              <Stack direction="row" alignItems="center" justifyContent="flex-start" mb={2} spacing={2}>
                <Typography variant="h2">可用模型</Typography>
                <Button 
                  variant="contained" 
                  onClick={copyAllModels}
                  sx={{
                    ...commonButtonSx,
                    background: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
                  }}
                >
                  复制所有模型
                </Button>
              </Stack>
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}>
                {MODEL_CATEGORIES.map(category => {
                    const categoryModels = models.filter(model => 
                        category.includes.some(prefix => 
                            model.toLowerCase().startsWith(prefix.toLowerCase())
                        )
                    );
                    
                    return categoryModels.length > 0 && (
                        <Box key={category.key}>
                            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                                {category.key}
                            </Typography>
                            <Box sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                alignItems: 'center',
                                gap: 1
                            }}>
                                {categoryModels.map((model) => (
                                    <Chip
                                        key={model}
                                        label={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {getModelIcon(model)}
                                                <span>{model}</span>
                                            </Box>
                                        }
                                        variant="outlined"
                                        size="small"
                                        onClick={() => {
                                            if (navigator.clipboard) {
                                                navigator.clipboard.writeText(model).then(() => {
                                                    showSuccess(`模型 ${model} 已复制到剪贴板`);
                                                }).catch(() => {
                                                    showError(`复制失败，请手动复制！ ${model}`);
                                                });
                                            } else {
                                                showError(`复制失败，请手动复制！ ${model}`);
                                            }
                                        }}
                                        sx={(theme) => ({ 
                                            margin: '3px',
                                            borderRadius: '4px',
                                            backgroundColor: 'rgba(33, 150, 243, 0.1)',
                                            border: '1px solid',
                                            borderColor: 'rgba(33, 150, 243, 0.2)',
                                            color: theme.palette.text.primary,
                                            '&:hover': {
                                                backgroundColor: 'rgba(76, 175,80, 0.1)',
                                                borderColor: 'rgba(76, 175,80, 0.3)',
                                                color: '#FF1493',
                                                cursor: 'pointer'
                                            },
                                            fontSize: '0.875rem',
                                            height: '24px'
                                        })} 
                                    />
                                ))}
                            </Box>
                        </Box>
                    );
                })}
                
                {(() => {
                    const otherModels = models.filter(model => 
                        !MODEL_CATEGORIES.some(category => 
                            category.includes.some(prefix => 
                                model.toLowerCase().startsWith(prefix.toLowerCase())
                            )
                        )
                    );
                    
                    return otherModels.length > 0 && (
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                                其他模型
                            </Typography>
                            <Box sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                alignItems: 'center',
                                gap: 1
                            }}>
                                {otherModels.map((model) => (
                                    <Chip
                                        key={model}
                                        label={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {getModelIcon(model)}
                                                <span>{model}</span>
                                            </Box>
                                        }
                                        variant="outlined"
                                        size="small"
                                        onClick={() => {
                                            if (navigator.clipboard) {
                                                navigator.clipboard.writeText(model).then(() => {
                                                    showSuccess(`模型 ${model} 已复制到剪贴板`);
                                                }).catch(() => {
                                                    showError(`复制失败，请手动复制！ ${model}`);
                                                });
                                            } else {
                                                showError(`复制失败，请手动复制！ ${model}`);
                                            }
                                        }}
                                        sx={(theme) => ({ 
                                            margin: '3px',
                                            borderRadius: '4px',
                                            backgroundColor: 'rgba(33, 150, 243, 0.1)',
                                            border: '1px solid',
                                            borderColor: 'rgba(33, 150, 243, 0.2)',
                                            color: theme.palette.text.primary,
                                            '&:hover': {
                                                backgroundColor: 'rgba(76, 175,80, 0.1)',
                                                borderColor: 'rgba(76, 175,80, 0.3)',
                                                color: '#FF1493',
                                                cursor: 'pointer'
                                            },
                                            fontSize: '0.875rem',
                                            height: '24px'
                                        })} 
                                    />
                                ))}
                            </Box>
                        </Box>
                    );
                })()}
              </Box>
            </SubCard>
            <SubCard title="账号绑定">
              <Grid container spacing={2}>
                {status.wechat_login && !inputs.wechat_id && (
                  <Grid xs={12} md={4}>
                    <Button variant="contained" onClick={handleWechatOpen}>
                      绑定微信账号
                    </Button>
                  </Grid>
                )}
                {status.github_oauth && !inputs.github_id && (
                  <Grid xs={12} md={4}>
                    <Button variant="contained" onClick={() => onGitHubOAuthClicked(status.github_client_id, true)}>
                      绑定GitHub账号
                    </Button>
                  </Grid>
                )}
                <Grid xs={12} md={4}>
                  <Button
                    variant="contained"
                    onClick={() => {
                      setOpenEmail(true);
                    }}
                    sx={{
                      ...commonButtonSx,
                      background: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)',
                    }}
                  >
                    {inputs.email ? '更换邮箱' : '绑定邮箱'}
                  </Button>
                  {turnstileEnabled ? (
                    <Turnstile
                      sitekey={turnstileSiteKey}
                      onVerify={(token) => {
                        setTurnstileToken(token);
                      }}
                    />
                  ) : (
                    <></>
                  )}
                </Grid>
              </Grid>
            </SubCard>
            <SubCard title="其他">
              <Grid container spacing={2}>
                <Grid xs={12}>
                  <Alert severity="info">注意，此处生成的令牌用于系统管理，而非用于请求 OpenAI 相关的服务，请知悉。</Alert>
                </Grid>
                {inputs.access_token && (
                  <Grid xs={12}>
                    <Alert severity="error">
                      你的访问令牌是: <b>{inputs.access_token}</b> <br />
                      请妥善保管。如有泄漏，请立即重置。
                    </Alert>
                  </Grid>
                )}
                <Grid xs={12}>
                  <Button 
                    variant="contained" 
                    onClick={generateAccessToken}
                    sx={{
                      ...commonButtonSx,
                      background: 'linear-gradient(45deg, #9C27B0 30%, #E040FB 90%)',
                      color: 'white',
                      '&:hover': {
                        ...commonButtonSx['&:hover'],
                        background: 'linear-gradient(45deg, #8E24AA 30%, #D500F9 90%)',
                      }
                    }}
                  >
                    {inputs.access_token ? '重置访问令牌' : '生成访问令牌'}
                  </Button>
                </Grid>

                <Grid xs={12}>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => {
                      setShowAccountDeleteModal(true);
                    }}
                  >
                    删除帐号
                  </Button>
                </Grid>
              </Grid>
            </SubCard>
          </Stack>
        </Card>
      </UserCard>
      <Dialog open={showAccountDeleteModal} onClose={() => setShowAccountDeleteModal(false)} maxWidth={'md'}>
        <DialogTitle sx={{ margin: '0px', fontWeight: 500, lineHeight: '1.55556', padding: '24px', fontSize: '1.125rem' }}>
          危险操作
        </DialogTitle>
        <Divider />
        <DialogContent>您正在删除自己的帐户，将清空所有数据且不可恢复</DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowAccountDeleteModal(false)}
            sx={{
              ...commonButtonSx,
              color: 'text.secondary',
              '&:hover': {
                ...commonButtonSx['&:hover'],
                background: 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            取消
          </Button>
          <Button
            sx={{
              ...commonButtonSx,
              background: 'linear-gradient(45deg, #f44336 30%, #ff7961 90%)',
              color: 'white',
              '&:hover': {
                ...commonButtonSx['&:hover'],
                background: 'linear-gradient(45deg, #d32f2f 30%, #f44336 90%)',
              }
            }}
            onClick={async () => {
              setShowAccountDeleteModal(false);
            }}
          >
            确定
          </Button>
        </DialogActions>
      </Dialog>
      <WechatModal open={openWechat} handleClose={handleWechatClose} wechatLogin={bindWeChat} qrCode={status.wechat_qrcode} />
      <EmailModal
        open={openEmail}
        turnstileToken={turnstileToken}
        turnstileEnabled={turnstileEnabled}
        handleClose={() => {
          setOpenEmail(false);
        }}
      />
    </>
  );
}

import React, { useState, useEffect } from 'react';
import { showError } from 'utils/common';
import {
  Card,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
  Box,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ModelTableHead from './component/TableHead';
import { API } from 'utils/api';
import { useTheme } from '@mui/material/styles';
import { PaidOutlined } from '@mui/icons-material';
import { 
  OpenAI,          // OpenAI
  Claude,          // Anthropic Claude
  Gemini,          // Google Gemini
  DeepSeek,        // deepseek
  Zhipu,           // 智谱 AI
  Hunyuan,         // 腾讯混元
  Spark,           // 讯飞星火
  Minimax,         // MiniMax
  Yi,              // 零一万物
  Groq,            // Groq
  Ollama,          // Ollama
  Doubao,          // 豆包
  Ai360,          // 360 AI
  Midjourney ,     // Midjourney
  Flux,
  Grok,
  Suno,
  Pika,
  Vidu,
  Volcengine,
  Bedrock,
  Stability,
  BaiduCloud,
  AlibabaCloud,
  Cohere,
  Baichuan,
  Kimi 
} from '@lobehub/icons';

function formatNumber(num) {
  if (num % 1 !== 0) {
    const decimalPart = num.toString().split('.')[1];
    if (decimalPart.length > 5) {
      return num.toFixed(5);
    } else {
      return num;
    }
  } else {
    return num;
  }
}

export default function Log() {
  const theme = useTheme();
  const [models, setModels] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('');

  const loadGroups = async () => {
      try {
          let res = await API.get('/api/user/group');
          const { success, message, data } = res.data;
          if (success) {
              const groupsWithDefault = [
                  { key: '', name: '默认分组' },
                  ...data
              ];
              setGroups(groupsWithDefault);
              setSelectedGroup('');
          } else {
              showError(message);
          }
      } catch (err) {
          showError(err.message);
      }
  };

  const loadModels = async (group, search) => {
    try {
      let url = '/api/user/modelbilling';
      const params = new URLSearchParams();
      if (group) params.append('group', group);
      if (search) params.append('search', search);
      if (params.toString()) url += `?${params.toString()}`;

      let res = await API.get(url);
      const { success, data } = res.data;
      if (success && Array.isArray(data)) {
        setModels(data);
      } else {
        setModels([]);
      }
    } catch (err) {
      setModels([]);
    }
  };

  useEffect(() => {
    loadGroups();
    loadModels('', '');
  }, []);
  
  useEffect(() => {
    loadModels(selectedGroup, currentSearchTerm);
  }, [selectedGroup, currentSearchTerm]);

  const handleGroupChange = (event) => {
    setSelectedGroup(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = () => {
    setCurrentSearchTerm(searchTerm);
  };

  const groupModelsByType = (models) => {
    const groupedModels = {};
    models.forEach(model => {
      // 根据模型名称确定模型类型
      let modelType = getModelTypeByName(model.model);
      
      // 如果getModelTypeByName返回other，尝试使用model_type作为备选
      if (modelType === 'other' && model.model_type) {
        modelType = model.model_type;
      }
      
      if (!groupedModels[modelType]) {
        groupedModels[modelType] = [];
      }
      groupedModels[modelType].push(model);
    });
    return groupedModels;
  };

  // 根据模型名称确定其类型
  const getModelTypeByName = (modelName) => {
    if (modelName.startsWith('gpt-') || modelName.startsWith('o1-') || 
        modelName.startsWith('o3-') || modelName.startsWith('o4-') ||
        modelName.startsWith('tts-') || modelName.startsWith('dall-e') || 
        modelName.startsWith('whisper') || modelName.startsWith('omni-') || 
        modelName.startsWith('text-embedding') || modelName.startsWith('text-moderation-') || 
        modelName.startsWith('davinci') || modelName.startsWith('babbage') ||
        modelName.startsWith('chatgpt')) {
      return 'OpenAI';
    } else if (modelName.startsWith('claude')) {
      return 'Anthropic Claude';
    } else if (modelName.startsWith('gemini')) {
      return 'Google Gemini';
    } else if (modelName.startsWith('deepseek')) {
      return 'deepseek';
    } else if (modelName.startsWith('glm') || modelName.startsWith('chatglm')) {
      return '智谱 AI';
    } else if (modelName.startsWith('hunyuan')) {
      return '腾讯混元';
    } else if (modelName.startsWith('spark') || modelName.startsWith('Spark')) {
      return '讯飞星火';
    } else if (modelName.startsWith('abab')) {
      return 'MiniMax';
    } else if (modelName.startsWith('moonshot')) {
      return 'moonshot';
    } else if (modelName.startsWith('yi')) {
      return '零一万物';
    } else if (modelName.startsWith('groq')) {
      return 'Groq';
    } else if (modelName.startsWith('ollama') || modelName.startsWith('llama')) {
      return 'Ollama';
    } else if (modelName.startsWith('doubao')) {
      return '豆包';
    } else if (modelName.startsWith('360')) {
      return '360 AI';
    } else if (modelName.startsWith('midjourney') || modelName.startsWith('mj-chat')) {
      return 'Midjourney';
    } else if (modelName.startsWith('flux')) {
      return 'Flux';
    } else if (modelName.startsWith('grok')) {
      return 'Grok';
    } else if (modelName.startsWith('suno')) {
      return 'Suno';
    } else if (modelName.startsWith('pika')) {
      return 'Pika';
    } else if (modelName.startsWith('vidu')) {
      return 'Vidu';
    } else if (modelName.startsWith('ERNIE-')) {
      return 'Baidu';
    } else if (modelName.startsWith('qwen-')) {
      return 'Ali';
    } else if (modelName.startsWith('command')) {
      return 'Cohere';
    } else if (modelName.startsWith('Baichuan')) {
      return 'Baichuan';
    } else {
      // 如果没有匹配，返回其他
      return 'other';
    }
  };

  const sortModelTypes = (groupedModels) => {
    const sortedEntries = Object.entries(groupedModels).sort(([a], [b]) => {
      if (a === 'other') return 1;
      if (b === 'other') return -1;
      if (a === 'OpenAI') return -1;
      if (b === 'OpenAI') return 1;
      return a.localeCompare(b);
    });
    return Object.fromEntries(sortedEntries);
  };
  const groupedModels = sortModelTypes(groupModelsByType(models));
  const hasModels = Object.keys(groupedModels).length > 0;

  // 获取排序后的模型类型列表
  const modelTypes = Object.keys(groupedModels);
  
  // 在搜索或切换分组时，如果当前选中的tab不在新的模型类型列表中，需要重置activeTab
  useEffect(() => {
    const modelTypes = Object.keys(groupedModels);
    if (modelTypes.length > 0) {
      if (!modelTypes.includes(activeTab)) {
        setActiveTab(modelTypes[0]);
      }
    } else {
      setActiveTab('');
    }
  }, [groupedModels, activeTab]);

  // 根据模型名称获取图标
  const getModelIcon = (modelInfo) => {
    const { model } = modelInfo;
    
    if (model.startsWith('gpt-3')) {
      return <OpenAI.Avatar size={20} type="gpt3" />;
    } else if (model.startsWith('gpt-4') || model.startsWith('chatgpt')) {
      return <OpenAI.Avatar size={20} type="gpt4" />;
    } else if (model.startsWith('o1') || model.startsWith('o3') || model.startsWith('o4')) {
      return <OpenAI.Avatar size={20} type="o1" />;
    } else if (model.startsWith('tts') || model.startsWith('dall-e') || 
    model.startsWith('whisper') || model.startsWith('omni-') || 
    model.startsWith('text-embedding') || model.startsWith('text-moderation-')
     || model.startsWith('davinci') ||  model.startsWith('babbage')
    ) {
      return <OpenAI.Avatar size={20} />;
    } else if (model.startsWith('claude')) {
      return <Claude.Color size={20} />;
    } else if (model.startsWith('gemini')) {
      return <Gemini.Color size={20} />;
    } else if (model.startsWith('deepseek')) {
      return <DeepSeek.Color size={20} />;
    } else if (model.startsWith('glm') || model.startsWith('chatglm')) {
      return <Zhipu.Color size={20} />;
    } else if (model.startsWith('hunyuan')) {
      return <Hunyuan.Color size={20} />;
    } else if (model.startsWith('spark') || model.startsWith('Spark')) {
      return <Spark.Color size={20} />;
    } else if (model.startsWith('abab')) {
      return <Minimax.Color size={20} />;
    } else if (model.startsWith('moonshot')) {
      return <Kimi.Color size={20} />;
    } else if (model.startsWith('yi')) {
      return <Yi.Color size={20} />;
    } else if (model.startsWith('groq')) {
      return <Groq size={20} />;
    } else if (model.startsWith('ollama') || model.startsWith('llama')) {
      return <Ollama size={20} />;
    } else if (model.startsWith('doubao')) {
      return <Doubao.Color size={20} />;
    } else if (model.startsWith('360')) {
      return <Ai360.Color size={20} />;
    } else if (model.startsWith('midjourney') || model.startsWith('mj-chat')) {
      return <Midjourney size={20} />;
    } else if (model.startsWith('flux')) {
      return <Flux size={20} />;
    } else if (model.startsWith('grok')) {
      return <Grok size={20} />;
    } else if (model.startsWith('suno')) {
      return <Suno size={20} />;
    } else if (model.startsWith('pika')) {
      return <Pika size={20} />;
    } else if (model.startsWith('vidu')) {
      return <Vidu.Color size={20} />;
    } else if (model.startsWith('ERNIE-')) {
      return <BaiduCloud.Color size={20} />;
    } else if (model.startsWith('qwen-')) {
      return <AlibabaCloud.Color size={20} />;
    } else if (model.startsWith('command')) {
      return <Cohere.Color size={20} />;
    } else if (model.startsWith('Baichuan')) {
      return <Baichuan.Color size={20} />;
    }
    
    // 如果没有匹配到，返回默认图标
    return <OpenAI size={20} />;
  };

  // 根据模型类型获取图标
  const getTypeIcon = (modelType) => {
    switch (modelType) {
      case 'OpenAI':
        return <OpenAI.Avatar size={16} />;
      case 'Anthropic Claude':
        return <Claude.Color size={16} />;
      case 'Google Gemini':
        return <Gemini.Color size={16} />;
      case 'deepseek':
        return <DeepSeek.Color size={16} />;
      case '智谱 AI':
        return <Zhipu.Color size={16} />;
      case '腾讯混元':
        return <Hunyuan.Color size={16} />;
      case '讯飞星火':
        return <Spark.Color size={16} />;
      case 'MiniMax':
        return <Minimax.Color size={16} />;
      case 'moonshot':
        return <Kimi.Color size={16} />;
      case '零一万物':
        return <Yi.Color size={16} />;
      case 'Groq':
        return <Groq size={16} />;
      case 'Ollama':
        return <Ollama size={16} />;
      case '豆包':
        return <Doubao.Color size={16} />;
      case '360 AI':
        return <Ai360.Color size={16} />;
      case 'Midjourney':
        return <Midjourney size={16} />;
      case 'Flux':
        return <Flux size={16} />;
      case 'Grok':
        return <Grok size={16} />;
      case 'Suno':
        return <Suno size={16} />;
      case 'Pika':
        return <Pika size={16} />;
      case 'Vidu':
        return <Vidu.Color size={16} />;
      case 'Volcengine':
        return <Volcengine.Color size={16} />;
      case 'Bedrock':
        return <Bedrock.Color size={16} />;
      case 'Stability':
        return <Stability.Color size={16} />;
      case 'Baidu':
        return <BaiduCloud.Color size={16} />;
      case 'Ali':
        return <AlibabaCloud.Color size={16} />;
      case 'Cohere':
        return <Cohere.Color size={16} />;
      case 'Baichuan':
        return <Baichuan.Color size={16} />;
      default:
        return <OpenAI size={16} />;
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: 'auto', padding: 3 }}>
      <Alert severity="info">
        按次计费与按token计费同时存在 按次计费优先。
      </Alert>
      <Stack direction="row" alignItems="center" mb={5} spacing={2}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>可用模型</Typography>
        <TextField 
          size="small"
          label="搜索模型"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="group-select-label">分组</InputLabel>
          <Select
            labelId="group-select-label"
            value={selectedGroup}
            label="分组"
            onChange={handleGroupChange}
            sx={{ fontSize: '0.875rem' }}
          >
            {groups.map((group) => (
              <MenuItem key={group.key} value={group.key}>
                {group.key === '' ? '默认分组' : group.value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
       
        <Button
          variant="contained"
          startIcon={<SearchIcon />}
          onClick={handleSearch}
          size="small"
        >
          搜索
        </Button>
      </Stack>

      <Card elevation={3}>
        <TableContainer component={Paper}>
          {hasModels ? (
            <>
              <Box sx={{ 
                width: '100%',
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch',
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': {
                  display: 'none'
                }
              }}>
                <Tabs
                  value={activeTab}
                  onChange={(e, newValue) => setActiveTab(newValue)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    backgroundColor: theme.palette.mode === 'light' 
                      ? theme.palette.grey[100] 
                      : theme.palette.grey[800],
                    minHeight: 48,
                  }}
                >
                  {modelTypes.map((modelType) => (
                    <Tab 
                      key={modelType}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getTypeIcon(modelType)}
                          {modelType}
                        </Box>
                      }
                      value={modelType}
                    />
                  ))}
                </Tabs>
              </Box>
              
              {activeTab && groupedModels[activeTab] && (
                <Box sx={{ 
                  width: '100%',
                  overflowX: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  msOverflowStyle: 'none',
                  scrollbarWidth: 'none',
                  '&::-webkit-scrollbar': {
                    display: 'none'
                  }
                }}>
                  <Table size="small" sx={{ 
                    minWidth: 800,
                    '@media (max-width: 600px)': {
                      minWidth: 600
                    },
                    '& .MuiTableCell-root': {
                      padding: '12px 16px',  // 统一的内边距
                    }
                  }}>
                    <ModelTableHead />
                    <TableBody>
                      {groupedModels[activeTab].map((modelInfo, index) => (
                        <TableRow 
                          key={index} 
                          hover
                          sx={{
                            '&:nth-of-type(odd)': {
                              backgroundColor: theme.palette.mode === 'light' 
                                ? 'rgba(0, 0, 0, 0.02)' 
                                : 'rgba(255, 255, 255, 0.02)'
                            },
                            // 最后一行添加底部边框
                            '&:last-child td, &:last-child th': {
                              borderBottom: 0
                            }
                          }}
                        >
                          <TableCell 
                            component="th" 
                            scope="row" 
                            align="left"
                            sx={{ 
                              fontWeight: 500,
                              color: theme.palette.primary.main,
                              textAlign: 'left'
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {getModelIcon(modelInfo)}
                              {modelInfo.model}
                            </Box>
                          </TableCell>
                          <TableCell 
                            align="right"
                            sx={{ 
                              fontFamily: 'monospace'
                            }}
                          >
                            {modelInfo.model_ratio_2 !== undefined && modelInfo.model_ratio_2 !== 0 ? (
                              <Box
                                component="span"
                                sx={{
                                  display: 'inline-block',
                                  backgroundColor: 'rgba(250, 140, 22, 0.1)',
                                  color: '#d46b08',
                                  px: 2,
                                  py: 0.5,
                                  borderRadius: '12px',
                                  fontSize: '0.875rem',
                                  fontWeight: 600,
                                  minWidth: '80px',
                                  textAlign: 'center'
                                }}
                              >
                                $ {modelInfo.model_ratio_2.toFixed(3)}
                              </Box>
                            ) : (
                              <Box
                                component="span"
                                sx={{
                                  display: 'inline-block',
                                  backgroundColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)',
                                  color: theme.palette.text.secondary,
                                  px: 2,
                                  py: 0.5,
                                  borderRadius: '12px',
                                  fontSize: '0.875rem',
                                  fontWeight: 600,
                                  minWidth: '80px',
                                  textAlign: 'center'
                                }}
                              >
                                无
                              </Box>
                            )}
                          </TableCell>
                          <TableCell 
                            align="right"
                            sx={{ 
                              fontFamily: 'monospace'
                            }}
                          >
                            {modelInfo.model_ratio !== undefined && modelInfo.model_ratio !== 0 ? (
                              <Box
                                component="span"
                                sx={{
                                  display: 'inline-block',
                                  backgroundColor: 'rgba(24, 144, 255, 0.1)',
                                  color: '#096dd9',
                                  px: 2,
                                  py: 0.5,
                                  borderRadius: '12px',
                                  fontSize: '0.875rem',
                                  fontWeight: 600,
                                  minWidth: '80px',
                                  textAlign: 'left'
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 0.5 }}>
                                  <PaidOutlined fontSize="small" sx={{ color: '#096dd9' }}/>
                                  {formatNumber(modelInfo.model_ratio * 2)}
                                </Box>
                              </Box>
                            ) : (
                              <Box
                                component="span"
                                sx={{
                                  display: 'inline-block',
                                  backgroundColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)',
                                  color: theme.palette.text.secondary,
                                  px: 2,
                                  py: 0.5,
                                  borderRadius: '12px',
                                  fontSize: '0.875rem',
                                  fontWeight: 600,
                                  minWidth: '80px',
                                  textAlign: 'center'
                                }}
                              >
                                无
                              </Box>
                            )}
                          </TableCell>
                          <TableCell 
                            align="right"
                            sx={{ 
                              fontFamily: 'monospace'
                            }}
                          >
                            {modelInfo.model_ratio !== undefined && modelInfo.model_ratio !== 0 ? (
                              <Box
                                component="span"
                                sx={{
                                  display: 'inline-block',
                                  backgroundColor: 'rgba(82, 196, 26, 0.1)',
                                  color: '#389e0d',
                                  px: 2,
                                  py: 0.5,
                                  borderRadius: '12px',
                                  fontSize: '0.875rem',
                                  fontWeight: 600,
                                  minWidth: '80px',
                                  textAlign: 'left'
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                  <PaidOutlined fontSize="small" sx={{ color: '#389e0d' }}/>
                                  {formatNumber(modelInfo.model_completion_ratio * 2)}
                                 </Box>
                              </Box>
                            ) : (
                              <Box
                                component="span"
                                sx={{
                                  display: 'inline-block',
                                  backgroundColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)',
                                  color: theme.palette.text.secondary,
                                  px: 2,
                                  py: 0.5,
                                  borderRadius: '12px',
                                  fontSize: '0.875rem',
                                  fontWeight: 600,
                                  minWidth: '80px',
                                  textAlign: 'center'
                                }}
                              >
                                无
                              </Box>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                {currentSearchTerm 
                  ? '没有找到匹配的模型。请尝试其他搜索词。' 
                  : '没有可用的模型数据。'}
              </Typography>
            </Box>
          )}
        </TableContainer>
      </Card>
    </Box>
  );
}
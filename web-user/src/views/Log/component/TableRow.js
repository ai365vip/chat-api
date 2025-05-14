import PropTypes from 'prop-types';
import { TableRow, TableCell, Tooltip } from '@mui/material';
import { timestamp2string, renderQuota, showSuccess, showError } from 'utils/common';
import Label from 'ui-component/Label';
import { InputOutlined, OutputOutlined, PaidOutlined } from '@mui/icons-material';

import { getModelIcon } from 'utils/common';

import {  blue, grey, orange, red, green } from '@mui/material/colors';
function renderIsStream(bool) {
  return bool ? (
    <Label style={{ color: blue[500], borderColor: blue[500] }} size="small" variant="outlined">流</Label>
  ) : (
    <Label style={{ color: grey[500], borderColor: grey[500] }} size="small" variant="outlined">非流</Label>
  );
}

const originalModelColorMap = {
  'dall-e': 'rgb(230,90,150)',        // 现代粉红
  'dall-e-3': 'rgb(60,130,190)',      // 深蓝

  'claude-3-5-sonnet-20240620': 'rgb(80,170,100)', // 翠绿
  'claude-3-opus-20240229': 'rgb(220,150,60)',     // 橙黄
  'claude-3-sonnet-20240229': 'rgb(70,190,180)',   // 青绿
  'claude-3-haiku-20240307': 'rgb(170,190,60)',    // 柠檬绿
  'claude-3-5-sonnet-20241022': 'rgb(80,170,100)', // 翠绿
  'claude-3-5-haiku-20241022': 'rgb(170,190,60)',    // 柠檬绿
  'claude-2.1': 'rgb(60,150,200)',                 // 天蓝

  'gpt-3.5-turbo': 'rgb(100,180,90)',         // 草绿
  'gpt-3.5-turbo-0125': 'rgb(100,200,190)',   // 蓝绿
  'gpt-3.5-turbo-1106': 'rgb(200,160,60)',    // 金黄
  'gpt-3.5-turbo-16k': 'rgb(150,100,170)',    // 淡紫
  'gpt-3.5-turbo-instruct': 'rgb(60,150,210)', // 亮蓝

  'gpt-4': 'rgb(50,130,140)',                // 深青
  'gpt-4-0613': 'rgb(170,190,60)',           // 黄绿
  'gpt-4-1106-preview': 'rgb(190,80,120)',    // 玫瑰红
  'gpt-4-0125-preview': 'rgb(60,180,150)',   // 绿松石
  'gpt-4-turbo-preview': 'rgb(120,170,80)',  // 橄榄绿
  'gpt-4-32k': 'rgb(80,170,150)',             // 青绿
  'gpt-4-turbo': 'rgb(210,100,100)',          // 珊瑚红
  'gpt-4-32k-0613': 'rgb(150,170,80)',       // 橄榄黄
  'gpt-4-all': 'rgb(100,170,90)',            // 苹果绿
  'gpt-4-gizmo-*': 'rgb(170,140,170)',       // 淡紫
  'gpt-4-turbo-2024-04-09': 'rgb(80,170,130)', // 薄荷绿

  'gpt-4o': 'rgb(120,150,190)',                // 钢蓝
  'gpt-4o-2024-05-13': 'rgb(150,120,170)',    // 淡紫罗兰
  'gpt-4o-2024-08-06': 'rgb(170,190,80)',    // 芥末绿
  'gpt-4o-2024-11-20': 'rgb(180,120,150)', // 梅红
  'gpt-4o-mini': 'rgb(170,190,80)',          // 芥末绿
  'gpt-4o-mini-2024-07-18': 'rgb(180,120,150)', // 梅红
  'gpt-4o-all': 'rgb(110,150,90)',            // 森林绿
  'o1-mini': 'rgb(120,150,190)',                // 钢蓝
  'o1-mini-2024-09-12': 'rgb(150,120,170)',    // 淡紫罗兰
  'o1-preview': 'rgb(170,190,80)',          // 芥末绿
  'o1-preview-2024-09-12': 'rgb(180,120,150)', // 梅红
  'o1': 'rgb(110,150,90)',            // 森林绿
  'o1-2024-12-17': 'rgb(120,150,190)',    // 钢蓝
  'midjourney': 'rgb(200,170,60)',           // 金黄
  'mj-chat': 'rgb(80,130,170)',              // 钴蓝

  "gpt-4o-realtime-preview-2024-10-01": 'rgb(120,150,190)',
  "gpt-4o-realtime-preview": 'rgb(150,120,170)',
  "gpt-4o-realtime-preview-2024-12-17": 'rgb(180,120,150)',
  "gpt-4o-audio-preview-2024-10-01": 'rgb(190,170,150)',
  "gpt-4o-audio-preview": 'rgb(190,170,150)',
  "gpt-4o-mini-realtime-preview": 'rgb(150,180,120)',
  "gpt-4o-mini-realtime-preview-2024-12-17": 'rgb(180,150,120)',

  "gemini-1.5-pro-001": 'rgb(70,130,210)',      // 深蓝
  "gemini-1.5-pro-latest": 'rgb(90,150,230)',   // 亮蓝
  "gemini-1.5-pro-002": 'rgb(110,170,250)',     // 天蓝
  "gemini-1.5-pro-preview-0514": 'rgb(80,140,220)',  // 中蓝
  "gemini-1.5-pro-exp-0801": 'rgb(100,160,240)',    // 浅蓝
  "gemini-1.5-pro-exp-0827": 'rgb(120,180,255)',    // 淡蓝

  "gemini-1.5-flash-001": 'rgb(150,100,220)',       // 深紫
  "gemini-1.5-flash-latest": 'rgb(170,110,240)',    // 亮紫
  "gemini-1.5-flash-002": 'rgb(190,120,255)',       // 淡紫
  "gemini-1.5-flash-preview-0514": 'rgb(160,105,230)', // 中紫
  "gemini-1.5-flash-exp-0827": 'rgb(180,115,245)',     // 浅紫

  "gemini-exp-1114": 'rgb(80,170,140)',     // 青绿
  "gemini-exp-1121": 'rgb(100,190,160)',    // 浅绿
  "gemini-exp-1206": 'rgb(120,210,180)',    // 薄荷绿

  "gemini-2.0-flash-exp": 'rgb(230,150,80)',           // 橙色
  "gemini-2.0-flash-thinking-exp-1219": 'rgb(250,170,100)',  // 浅橙

  'text-embedding-ada-002': 'rgb(150,170,100)',    // 橄榄绿
  'text-embedding-3-small': 'rgb(100,170,130)',   // 青绿
  'text-embedding-3-large': 'rgb(170,150,80)',     // 芥末黄

  'tts-1': 'rgb(210,100,120)',              // 桃红
  'tts-1-1106': 'rgb(80,150,170)',          // 青蓝
  'tts-1-hd': 'rgb(190,170,150)',           // 淡褐
  'tts-1-hd-1106': 'rgb(150,170,120)',      // 苔绿

  'whisper-1': 'rgb(100,190,80)',           // 亮绿
};

// 用于存储新模型的颜色映射
const dynamicModelColorMap = new Map();

// 新模型可用的颜色列表
const extraColors = [
    'rgb(180,60,160)',   // 深红
    'rgb(120,60,160)',   // 深紫
    'rgb(50,120,130)',   // 深青
    'rgb(20,100,180)',   // 深蓝
    'rgb(100,100,180)',  // 深蓝紫
    'rgb(180,180,20)',   // 深黄
    'rgb(140,100,120)',  // 深粉
    'rgb(180,60,100)',   // 深红粉
    'rgb(80,160,60)',    // 深绿
    'rgb(60,120,180)',   // 深蓝灰
];

const getModelColor = (modelName) => {
    // 1. 首先检查是否在原始映射中
    if (originalModelColorMap[modelName]) {
        return originalModelColorMap[modelName];
    }

    // 2. 检查是否已经在动态映射中
    if (dynamicModelColorMap.has(modelName)) {
        return dynamicModelColorMap.get(modelName);
    }

    // 3. 为新模型分配颜色
    const newColor = extraColors[dynamicModelColorMap.size % extraColors.length];
    dynamicModelColorMap.set(modelName, newColor);
    
    return newColor;
};

function renderType(type) {
  switch (type) {
    case 1:
      return <Label style={{ color: blue[500], borderColor: blue[500] }} size="small" variant="outlined" >充值</Label>;
    case 2:
      return <Label style={{ color: green[500], borderColor: green[500] }} size="small" variant="outlined" >消费</Label>;
    case 3:
      return <Label style={{ color: orange[500], borderColor: orange[500] }} size="small" variant="outlined" >管理</Label>;
    case 4:
      return <Label style={{ color: red[500], borderColor: red[500] }} size="small" variant="outlined" >系统</Label>;
    default:
      return <Label style={{ color: grey[500], borderColor: grey[500] }} size="small" variant="outlined" >未知</Label>;
  }
}

function renderUseTime(time) {
  const parsedTime = parseInt(time);
  if (parsedTime < 101) {
    return <Label style={{ color: green[500], borderColor: green[500] }} size="small" variant="outlined">{`${time} s`}</Label>;
  } else if (parsedTime < 300) {
    return <Label style={{ color: orange[500], borderColor: orange[500] }} size="small" variant="outlined">{`${time} s`}</Label>;
  } else {
    return <Label style={{ color: red[500], borderColor: red[500] }} size="small" variant="outlined">{`${time} s`}</Label>;
  }
}

export default function LogTableRow({ item }) {
  const handleCopyToClipboard = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        showSuccess('复制成功');
      });
    } else {
      showError('复制失败，请手动复制！');
    }
  };

  return (
    <TableRow tabIndex={item.id}>
      <TableCell>{timestamp2string(item.created_at)}</TableCell>
      <TableCell onClick={() => handleCopyToClipboard(item.token_name)} style={{ cursor: 'pointer' }}>
        <Label color="default" variant="outlined" >
        {item.token_name}
        </Label>
      </TableCell>
      <TableCell>{renderType(item.type)}</TableCell>
      <TableCell onClick={() => handleCopyToClipboard(item.model_name)}>
          <Label style={{ color: getModelColor(item.model_name) }} variant="outlined">
            {getModelIcon(item.model_name)}
            <span style={{ marginLeft: '4px' }}>{item.model_name}</span>
          </Label>
        </TableCell>
      <TableCell>{item.ip}</TableCell>  
      <TableCell>
        {renderUseTime(item.use_time)}
        {renderIsStream(item.is_stream)}
      </TableCell>
      <TableCell>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <InputOutlined fontSize="small" sx={{ color: '#2196F3', marginRight: '4px' }}/>
          {item.prompt_tokens || ''}
        </div>
      </TableCell>
      <TableCell>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <OutputOutlined fontSize="small" sx={{ color: '#4CAF50', marginRight: '4px' }}/>
          {item.completion_tokens || ''}
        </div>
      </TableCell>
      <TableCell>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <PaidOutlined fontSize="small" sx={{ color: '#FF9800', marginRight: '4px' }}/>
          {item.quota ? renderQuota(item.quota, 6) : ''}
        </div>
      </TableCell>
      <TableCell>
        {item.multiplier ? (
          <Tooltip title={
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', maxWidth: '400px', maxHeight: '300px', overflow: 'auto' }}>
              {(() => {
                try {
                  // 检查是否为图像相关模型
                  const isImageModel = item.model_name && 
                    (item.model_name.includes('gpt-image'));
                  
                  // 检查文本是否包含图像生成特征
                  const hasImageText = typeof item.multiplier === 'string' && 
                    (item.multiplier.includes('imageToken') || 
                     item.multiplier.includes('图像输出') || 
                     item.multiplier.includes('image_output') ||
                     item.multiplier.match(/\d+x\d+/));
                  
                  // 图像生成模型直接显示原始信息
                  if (isImageModel || hasImageText) {
                    return item.multiplier;
                  }
                  
                  // 常规模型处理逻辑
                  const multiplierObj = typeof item.multiplier === 'string' 
                    ? JSON.parse(item.multiplier) 
                    : item.multiplier;
                  
                  return [
                    `模型倍率: ${multiplierObj.model_ratio || 0}`,
                    `分组倍率: ${multiplierObj.group_ratio || 0}`,
                    `补全倍率: ${multiplierObj.completion_ratio || 0}`,
                    multiplierObj.audio_ratio ? `音频倍率: ${multiplierObj.audio_ratio}` : null,
                    multiplierObj.audio_completion_ratio ? `音频补全倍率: ${multiplierObj.audio_completion_ratio}` : null,
                    '------------------------',
                    multiplierObj.text_input ? `文本输入消耗: ${multiplierObj.text_input}` : null,
                    multiplierObj.text_output ? `文本输出消耗: ${multiplierObj.text_output}` : null,
                    multiplierObj.audio_input ? `音频输入消耗: ${multiplierObj.audio_input}` : null,
                    multiplierObj.audio_output ? `音频输出消耗: ${multiplierObj.audio_output}` : null,
                    multiplierObj.ws ? `WebSocket: 是` : null
                  ].filter(Boolean).join('\n');
                } catch (e) {
                  return item.multiplier;
                }
              })()}
            </pre>
          }>
            <Label 
              style={{ 
                color: getModelColor(item.model_name),
                cursor: 'pointer'
              }} 
              variant="outlined"
            >
              {(() => {
                try {
                  // 检查是否为图像相关模型
                  const isImageModel = item.model_name && 
                    (item.model_name.includes('gpt-image') || 
                     item.model_name.includes('dall-e'));
                  
                  // 检查文本是否包含图像生成特征
                  const hasImageText = typeof item.multiplier === 'string' && 
                    (item.multiplier.includes('imageToken') || 
                     item.multiplier.includes('图像输出') || 
                     item.multiplier.includes('image_output') ||
                     item.multiplier.match(/\d+x\d+/));
                  
                  // 针对图像生成的特殊显示
                  if (isImageModel || hasImageText) {
                    // 提取图像尺寸信息
                    let sizeInfo = '';
                    if (typeof item.multiplier === 'string') {
                      const sizeMatch = item.multiplier.match(/(\d+)x(\d+)/);
                      if (sizeMatch) {
                        sizeInfo = sizeMatch[0];
                      }
                    }
                    
                    return sizeInfo ? `图像生成(${sizeInfo})` : `图像生成`;
                  }
                  
                  // 常规模型显示
                  const multiplierObj = typeof item.multiplier === 'string' 
                    ? JSON.parse(item.multiplier) 
                    : item.multiplier;
                  return `模型倍率: ${multiplierObj.model_ratio || 0}倍`;
                } catch (e) {
                  return typeof item.multiplier === 'string' && item.multiplier.length > 30 
                    ? `${item.multiplier.substring(0, 30)}...` 
                    : item.multiplier;
                }
              })()}
            </Label>
          </Tooltip>
        ) : '-'}
      </TableCell>
    </TableRow>
  );
}

LogTableRow.propTypes = {
  item: PropTypes.object
};

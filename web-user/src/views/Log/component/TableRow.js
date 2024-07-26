import PropTypes from 'prop-types';
import { TableRow, TableCell } from '@mui/material';
import { timestamp2string, renderQuota, showSuccess, showError } from 'utils/common';
import Label from 'ui-component/Label';
import {  blue, grey, orange, red, green } from '@mui/material/colors';
function renderIsStream(bool) {
  return bool ? (
    <Label style={{ color: blue[500], borderColor: blue[500] }} size="small" variant="outlined">流</Label>
  ) : (
    <Label style={{ color: grey[500], borderColor: grey[500] }} size="small" variant="outlined">非流</Label>
  );
}

const originalModelColorMap = {
  'dall-e': 'rgb(180,60,160)',        // 深红
  'dall-e-3': 'rgb(60,120,180)',     // 深蓝

  'claude-3-5-sonnet-20240620': 'rgb(120,60,160)', // 深紫
  'claude-3-opus-20240229': 'rgb(80,120,120)',     // 深橙
  'claude-3-sonnet-20240229': 'rgb(40,160,80)',    // 深绿
  'claude-3-haiku-20240307': 'rgb(160,60,120)',    // 深粉
  'claude-2.1': 'rgb(60,100,160)',                 // 深钴蓝

  'gpt-3.5-turbo': 'rgb(50,120,130)',         // 深绿
  'gpt-3.5-turbo-0125': 'rgb(110,200,190)', 
  'gpt-3.5-turbo-1106': 'rgb(160,80,20)',    // 深橙
  'gpt-3.5-turbo-16k': 'rgb(140,60,140)',    // 深紫红
  'gpt-3.5-turbo-instruct': 'rgb(60,120,180)', // 深蓝

  'gpt-4': 'rgb(20,100,180)',                // 深蓝
  'gpt-4-0613': 'rgb(180,140,20)',           // 深金
  'gpt-4-1106-preview': 'rgb(140,40,140)',    // 暗红
  'gpt-4-0125-preview': 'rgb(60,160,120)',   // 深青绿
  'gpt-4-turbo-preview': 'rgb(120,60,140)',  // 深紫
  'gpt-4-32k': 'rgb(180,80,80)',             // 深珊瑚红
  'gpt-4-turbo': 'rgb(40,140,140)',          // 深青蓝
  'gpt-4-32k-0613': 'rgb(140,100,60)',       // 深棕
  'gpt-4-all': 'rgb(100,140,60)',            // 深橄榄绿
  'gpt-4-gizmo-*': 'rgb(160,120,160)',       // 深紫红
  'gpt-4-turbo-2024-04-09': 'rgb(60,140,100)', // 深薄荷绿

  'gpt-4o': 'rgb(100,100,180)',                // 深橙
  'gpt-4o-2024-05-13': 'rgb(100,60,140)',    // 深紫
  'gpt-4o-mini': 'rgb(140,160,40)',          // 深黄绿
  'gpt-4o-mini-2024-07-18': 'rgb(160,80,120)', // 深玫瑰红
  'gpt-4o-all': 'rgb(80,120,60)',            // 深苔绿

  'midjourney': 'rgb(180,180,20)',           // 深黄
  'mj-chat': 'rgb(60,80,140)',               // 深灰蓝

  'text-embedding-ada-002': 'rgb(140,100,120)',    // 深土黄
  'text-embedding-3-small': 'rgb(100,140,100)',   // 深灰绿
  'text-embedding-3-large': 'rgb(140,80,60)',     // 深赭石

  'tts-1': 'rgb(180,60,100)',              // 深桃红
  'tts-1-1106': 'rgb(60,120,140)',         // 深青灰
  'tts-1-hd': 'rgb(240,180,160)',           // 深卡其
  'tts-1-hd-1106': 'rgb(120,100,140)',     // 深紫灰

  'whisper-1': 'rgb(80,160,60)',           // 深草绿
};

const extraColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#20B2AA',
  '#FF8C00', '#00CED1', '#FF69B4', '#1E90FF', '#32CD32',
  '#FF7F50', '#8A2BE2', '#00FA9A', '#FF1493', '#00BFFF',
  '#ADFF2F', '#FF00FF', '#1ABC9C', '#F39C12', '#8E44AD'
];

const getModelColor = (modelName) => {
  if (originalModelColorMap[modelName]) {
    return originalModelColorMap[modelName];
  }
  // 如果没有对应的颜色，随机选择一个额外颜色
  return extraColors[Math.floor(Math.random() * extraColors.length)];
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
            {item.model_name}
          </Label>
        </TableCell>
      <TableCell>{item.ip}</TableCell>  
      <TableCell>
        {renderUseTime(item.use_time)}
        {renderIsStream(item.is_stream)}
      </TableCell>
      <TableCell>{item.prompt_tokens || ''}</TableCell>
      <TableCell>{item.completion_tokens || ''}</TableCell>
      <TableCell>{item.quota ? renderQuota(item.quota, 6) : ''}</TableCell>
      <TableCell>{item.multiplier}</TableCell>
    </TableRow>
  );
}

LogTableRow.propTypes = {
  item: PropTypes.object
};

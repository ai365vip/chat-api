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
  'dall-e': 'rgb(255,215,0)',
  'claude-3-5-sonnet-20240620': 'rgb(253,135,93)',
  'dall-e-3': 'rgb(255,223,0)',
  'gpt-3.5-turbo': 'rgb(255,165,0)',
  'gpt-4o-2024-05-13': 'rgb(255,209,190)',
  'gpt-4o': 'rgb(255,175,146)',
  'gpt-3.5-turbo-1106': 'rgb(255,130,171)',
  'gpt-3.5-turbo-16k': 'rgb(255,160,122)',
  'gpt-4o-mini': 'rgb(255,174,185)',
  'gpt-3.5-turbo-instruct': 'rgb(175,238,238)',
  'gpt-4': 'rgb(255,105,180)',
  'gpt-4o-mini-2024-07-18': 'rgb(219,112,147)',
  'gpt-4-0613': 'rgb(199,21,133)',
  'gpt-4-1106-preview': 'rgb(0,0,255)',
  'gpt-4-0125-preview': 'rgb(65,105,225)',
  'gpt-4-turbo-preview': 'rgb(61,71,139)',
  'gpt-4-32k': 'rgb(90,105,205)',
  'gpt-4-turbo': 'rgb(104,111,238)',
  'gpt-4-32k-0613': 'rgb(100,149,237)',
  'gpt-4-all': 'rgb(30,144,255)',
  'gpt-4-gizmo-*': 'rgb(2,177,255)',
  'gpt-4-turbo-2024-04-09': 'rgb(2,177,236)',
  'gpt-4o-all': 'rgb(70,130,180)',
  'midjourney': 'rgb(135,206,235)',
  'mj-chat': 'rgb(119,255,214)',
  'text-embedding-ada-002': 'rgb(175,238,238)',
  'text-embedding-3-small': 'rgb(149,252,206)',
  'text-embedding-3-large': 'rgb(32,178,170)',
  'tts-1': 'rgb(60,179,113)',
  'tts-1-1106': 'rgb(131,220,131)',
  'tts-1-hd': 'rgb(184,227,167)',
  'tts-1-hd-1106': 'rgb(153,50,204)',
  'whisper-1': 'rgb(147,112,219)',
  'claude-3-opus-20240229': 'rgb(255,140,0)',
  'claude-3-sonnet-20240229': 'rgb(255,182,193)',
  'claude-3-haiku-20240307': 'rgb(245,245,220)',
  'claude-2.1': 'rgb(147,112,219)',
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

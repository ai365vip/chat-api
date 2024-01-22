import PropTypes from 'prop-types';

import { TableRow, TableCell  } from '@mui/material';
import { timestamp2string, renderQuota,showSuccess,showError } from 'utils/common';

import {Tag} from '@douyinfe/semi-ui';


function renderIsStream(bool) {
  if (bool) {
      return <Tag color='blue' shape='circle'  size='large'>流</Tag>;
  } else {
      return <Tag color='purple' shape='circle'  size='large'>非流</Tag>;
  }	
}
  
const colors = ['amber', 'blue', 'cyan', 'green', 'grey', 'indigo',
    'light-blue', 'lime', 'orange', 'pink',
    'purple', 'red', 'teal', 'violet', 'yellow'
]

function stringToColor(str) {
  let sum = 0;
  // 对字符串中的每个字符进行操作
  for (let i = 0; i < str.length; i++) {
      // 将字符的ASCII值加到sum中
      sum += str.charCodeAt(i);
  }
  // 使用模运算得到个位数
  let i = sum % colors.length;
  return colors[i];
}

function renderType(type) {
  switch (type) {
      case 1:
          return <Tag color='cyan' shape='circle'  size='large'> 充值 </Tag>;
      case 2:
          return <Tag color='lime' shape='circle'  size='large'> 消费 </Tag>;
      case 3:
          return <Tag color='orange' shape='circle'   size='large'> 管理 </Tag>;
      case 4:
          return <Tag color='purple' shape='circle'  size='large'> 系统 </Tag>;
      default:
          return <Tag color='black' shape='circle'  size='large'> 未知 </Tag>;
  }
}
  
function renderUseTime(type) {
  const time = parseInt(type);
  if (time < 101) {
      return <Tag color='green' shape='circle'  size='large'> {time} s </Tag>;
  } else if (time < 300) {
      return <Tag color='orange' shape='circle'  size='large'> {time} s </Tag>;
  } else {
      return <Tag color='red' shape='circle'  size='large'> {time} s </Tag>;
  }	
}

export default function LogTableRow({ item }) {


  const handleCopyToClipboard = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        // 显示Snackbar通知
        showSuccess('复制成功');
      })
    } else {
      showError('复制失败，请手动复制！');
    }
  };
  

  return (
    <>
      <TableRow tabIndex={item.id}>
        <TableCell>{timestamp2string(item.created_at)}</TableCell>
        <TableCell onClick={() => handleCopyToClipboard(item.token_name)} style={{ cursor: 'pointer' }}>
          <Tag color='grey' shape='circle'  size='large' > {item.token_name} </Tag>
        </TableCell>
        <TableCell>{renderType(item.type)}</TableCell>
        <TableCell onClick={() => handleCopyToClipboard(item.model_name)} style={{ cursor: 'pointer' }}>
          <Tag color={stringToColor(item.model_name)} shape='circle'  size='large' > {item.model_name} </Tag>
        </TableCell>
        <TableCell >
          { renderUseTime(item.use_time)}
          {renderIsStream(item.is_stream)}
        </TableCell>
        <TableCell>{item.prompt_tokens || ''}</TableCell>
        <TableCell>{item.completion_tokens || ''}</TableCell>
        <TableCell>{item.quota ? renderQuota(item.quota, 6) : ''}</TableCell>
        <TableCell>{item.multiplier}</TableCell>

      </TableRow>

    </>
  );
}

LogTableRow.propTypes = {
  item: PropTypes.object,
};

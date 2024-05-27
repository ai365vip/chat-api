import PropTypes from 'prop-types';
import { TableRow, TableCell } from '@mui/material';
import { timestamp2string, renderQuota, showSuccess, showError } from 'utils/common';
import Label from 'ui-component/Label';
import { amber, blue, grey, indigo, lightBlue, lime, orange, pink, purple, red, deepOrange, deepPurple, green, lightGreen, blueGrey, teal, yellow, brown, cyan } from '@mui/material/colors';
function renderIsStream(bool) {
  return bool ? (
    <Label style={{ color: blue[500], borderColor: blue[500] }} size="small" variant="outlined">流</Label>
  ) : (
    <Label style={{ color: grey[500], borderColor: grey[500] }} size="small" variant="outlined">非流</Label>
  );
}

const colors = [
  amber[500], blue[500], grey[500], indigo[500],
  lightBlue[500], lime[500], orange[500], pink[500], purple[500],
  red[500], cyan[500], teal[500], yellow[500], 
  brown[500], deepOrange[500], deepPurple[500], green[500], 
  lightGreen[500], blueGrey[500]
];

function stringToColor(str) {
  let sum = 0;
  for (let i = 0; i < str.length; i++) {
    sum += str.charCodeAt(i);
  }
  let i = sum % colors.length;
  return colors[i];
}

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
      <TableCell onClick={() => handleCopyToClipboard(item.model_name)} >
        <Label style={{ color: stringToColor(item.model_name) }} variant="outlined" >
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

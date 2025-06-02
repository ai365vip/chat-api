import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Dimmer, Loader, Segment } from 'semantic-ui-react';
import { UserContext } from '../context/User';
import { API, showError, showSuccess } from '../helpers';

const DiscordOAuth = () => {
  const [searchParams] = useSearchParams();

  const [, userDispatch] = useContext(UserContext);
  const [prompt, setPrompt] = useState('处理中...');
  const [, setProcessing] = useState(true);

  let navigate = useNavigate();

  const sendCode = async (code, state, count) => {
    const res = await API.get(`/api/oauth/discord?code=${code}&state=${state}`);
    const { success, message, data } = res.data;
    if (success) {
      if (message === 'bind') {
        showSuccess('绑定成功！');
        navigate('/admin/setting');
      } else {
        userDispatch({ type: 'login', payload: data });
        localStorage.setItem('user', JSON.stringify(data));
        showSuccess('登录成功！');
        navigate('/admin');
      }
    } else {
      showError(message);
      if (count === 0) {
        setPrompt(`操作失败，重定向至登录界面中...`);
        navigate('/admin/setting'); // in case this is failed to bind Discord
        return;
      }
      count++;
      setPrompt(`出现错误，第 ${count} 次重试中...`);
      await new Promise((resolve) => setTimeout(resolve, count * 2000));
      await sendCode(code, state, count);
    }
  };

  useEffect(() => {
    let code = searchParams.get('code');
    let state = searchParams.get('state');
    sendCode(code, state, 0).then();
  }, []);

  return (
    <Segment style={{ minHeight: '300px' }}>
      <Dimmer active inverted>
        <Loader size='large'>{prompt}</Loader>
      </Dimmer>
    </Segment>
  );
};

export default DiscordOAuth;

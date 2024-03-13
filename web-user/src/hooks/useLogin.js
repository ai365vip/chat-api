import { API } from 'utils/api';
import { useDispatch } from 'react-redux';
import { LOGIN } from 'store/actions';
import { useNavigate } from 'react-router';
import { showSuccess } from 'utils/common';
const useLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  

  const login = async (username, password,turnstileEnabled,turnstileToken) => {
    if (turnstileEnabled && turnstileToken === '') {
      showInfo('请稍后几秒重试，Turnstile 正在检查用户环境！');
      return;
    }
    
    try {
      const res = await API.post(`/api/user/login?turnstile=${turnstileToken}`, {
        username,
        password
      });
      const { success, message, data } = res.data;
      if (success) {
        localStorage.setItem('user', JSON.stringify(data));
        dispatch({ type: LOGIN, payload: data });
        navigate('/');
      }
      return { success, message };
    } catch (err) {
      // 请求失败，设置错误信息
      return { success: false, message: '' };
    }
  };

  const githubLogin = async (code, state) => {
    try {
      const res = await API.get(`/api/oauth/github?code=${code}&state=${state}`);
      const { success, message, data } = res.data;
      if (success) {
        if (message === 'bind') {
          showSuccess('绑定成功！');
          navigate('/');
        } else {
          dispatch({ type: LOGIN, payload: data });
          localStorage.setItem('user', JSON.stringify(data));
          showSuccess('登录成功！');
          navigate('/');
        }
      }
      return { success, message };
    } catch (err) {
      // 请求失败，设置错误信息
      return { success: false, message: '' };
    }
  };

  const wechatLogin = async (code) => {
    try {
      const res = await API.get(`/api/oauth/wechat?code=${code}`);
      const { success, message, data } = res.data;
      if (success) {
        dispatch({ type: LOGIN, payload: data });
        localStorage.setItem('user', JSON.stringify(data));
        showSuccess('登录成功！');
        navigate('/');
      }
      return { success, message };
    } catch (err) {
      // 请求失败，设置错误信息
      return { success: false, message: '' };
    }
  };

  const logout = async () => {
    await API.get('/api/user/logout');
    localStorage.removeItem('user');
    dispatch({ type: LOGIN, payload: null });
    navigate('/login');
  };

  return { login, logout, githubLogin, wechatLogin };
};

export default useLogin;

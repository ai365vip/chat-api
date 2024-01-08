import { useEffect, useCallback, createContext } from 'react';
import { API } from 'utils/api';
import { showNotice } from 'utils/common';
import { SET_SITE_INFO } from 'store/actions';
import { useDispatch } from 'react-redux';

export const LoadStatusContext = createContext();

// eslint-disable-next-line
const StatusProvider = ({ children }) => {
  const dispatch = useDispatch();

  const loadStatus = useCallback(async () => {
    const res = await API.get('/api/status');
    const { success, data } = res.data;
    let system_name = '';
    let system_text = '';
    let server_address = '';
    if (success) {
      if (!data.chat_link) {
        delete data.chat_link;
      }
      localStorage.setItem('siteInfo', JSON.stringify(data));
      localStorage.setItem('quota_per_unit', data.quota_per_unit);
      localStorage.setItem('display_in_currency', data.display_in_currency);
      dispatch({ type: SET_SITE_INFO, payload: data });
      if (
        data.version !== process.env.REACT_APP_VERSION &&
        data.version !== 'v0.0.0' &&
        data.version !== '' &&
        process.env.REACT_APP_VERSION !== ''
      ) {
        showNotice(`新版本可用：${data.version}，请使用快捷键 Shift + F5 刷新页面`);
      }
      if (data.system_name) {
        system_name = data.system_name;
      }
      if (data.system_text) {
        system_text = data.system_text;
      }
      if (data.server_address) {
        server_address = data.server_address;
      }
      
    } else {
      const backupSiteInfo = localStorage.getItem('siteInfo');
      if (backupSiteInfo) {
        const data = JSON.parse(backupSiteInfo);
        if (data.system_name) {
          system_name = data.system_name;
        }
        if (data.system_text) {
          system_text = data.system_text;
        }
        if (data.server_address) {
          server_address = data.server_address;
        }
        dispatch({
          type: SET_SITE_INFO,
          payload: data
        });
      }
      showError('无法正常连接至服务器！');
    }

    if (system_name) {
      document.title = system_name;
    }
    if (system_text) {
      let metaDescription = document.querySelector("meta[name='description']");
      if (metaDescription) {
        metaDescription.setAttribute("content", system_text); 
      } else {
        metaDescription = document.createElement("meta");
        metaDescription.setAttribute("name", "description");
        metaDescription.setAttribute("content", system_text); 
        document.head.appendChild(metaDescription);
      }
    }
    if (server_address) {
      
      server_address = data.server_address;
      const preconnectLink = document.querySelector("link[rel='preconnect']");
      if (preconnectLink && preconnectLink.href !== server_address) {
        preconnectLink.href = server_address;
      }
    }
  }, [dispatch]);

  useEffect(() => {
    loadStatus().then();
  }, [loadStatus]);

  return <LoadStatusContext.Provider value={loadStatus}> {children} </LoadStatusContext.Provider>;
};

export default StatusProvider;

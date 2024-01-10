import { useEffect, useCallback, createContext } from 'react';
import { API } from 'utils/api';
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
    let logo = '';
    if (success) {
      if (!data.chat_link) {
        delete data.chat_link;
      }
      localStorage.setItem('siteInfo', JSON.stringify(data));
      localStorage.setItem('quota_per_unit', data.quota_per_unit);
      localStorage.setItem('display_in_currency', data.display_in_currency);
      dispatch({ type: SET_SITE_INFO, payload: data });
      if (data.system_name) {
        system_name = data.system_name;
      }

      if (data.logo) {
        logo = data.logo;
      }
      
    } else {
      const backupSiteInfo = localStorage.getItem('siteInfo');
      if (backupSiteInfo) {
        const data = JSON.parse(backupSiteInfo);
        if (data.system_name) {
          system_name = data.system_name;
        }
        if (data.logo) {
          logo = data.logo;
        }
        dispatch({
          payload: data
        });
      }
      showError('无法正常连接至服务器！');
    }

    if (system_name) {
      document.title = system_name;
    }

    
    if (logo) {
      logo = data.logo;
      const iconLink = document.querySelector("link[rel='icon']");
      if (iconLink && iconLink.href !== logo) {
        iconLink.href = logo;
      }
    }
  }, [dispatch]);

  useEffect(() => {
    loadStatus().then();
  }, [loadStatus]);

  return <LoadStatusContext.Provider value={loadStatus}> {children} </LoadStatusContext.Provider>;
};

export default StatusProvider;

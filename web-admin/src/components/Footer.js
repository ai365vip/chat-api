import React, { useEffect, useState } from 'react';

import { Container, Segment } from 'semantic-ui-react';
import { getFooterHTML, getSystemName } from '../helpers';
import {Layout} from "@douyinfe/semi-ui";

const Footer = () => {
  const systemName = getSystemName();
  const [footer, setFooter] = useState(getFooterHTML());
  const appVersion = process.env.REACT_APP_VERSION || 'v0.0.3';
  let remainCheckTimes = 5;

  const loadFooter = () => {
    let footer_html = localStorage.getItem('footer_html');
    if (footer_html) {
      setFooter(footer_html);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (remainCheckTimes <= 0) {
        clearInterval(timer);
        return;
      }
      remainCheckTimes--;
      loadFooter();
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Layout>
      <Layout.Content style={{textAlign: 'center'}}>
        {footer ? (
          <div
            className='custom-footer'
            dangerouslySetInnerHTML={{ __html: footer }}
          ></div>
        ) : (
          <div className='custom-footer'>
            当前版本 {appVersion} {/* 这里显示版本信息 */}
            ，项目地址{' '}
            <a href='https://github.com/ai365vip/chat-api'>
            GitHub
            </a>{' '}
          </div>
        )}
      </Layout.Content>
    </Layout>
  );
};

export default Footer;

import React, { useEffect, useState } from 'react';
import { Button, Form, Typography, Divider, Toast, Spin, Layout,TextArea,Input } from '@douyinfe/semi-ui';
import { API, showError, showSuccess } from '../helpers';
import { marked } from 'marked';




const OtherSetting = () => {


  let [inputs, setInputs] = useState({
    Footer: '',
    Notice: '',
    About: '',
    SystemName: '',
    SystemText: '',
    Logo: '',
    HomePageContent: ''
  });
  let [loading, setLoading] = useState(false);

  const getOptions = async () => {
    const res = await API.get('/api/option/');
    const { success, message, data } = res.data;
    if (success) {
      let newInputs = { ...inputs }; // 使用当前状态来初始化newInputs
      data.forEach((item) => {
        newInputs[item.key] = item.value; // 更新每个键的值，无论是否存在于当前状态中
      });
      setInputs(newInputs); // 使用更新后的状态
    } else {
      showError(message);
    }
  };
  

  useEffect(() => {
    getOptions();
  }, []);

  const updateOption = async (key, value) => {
    setLoading(true);
    const res = await API.put('/api/option/', {
      key,
      value
    });
    const { success, message } = res.data;
    if (success) {
      setInputs((inputs) => ({ ...inputs, [key]: value }));
    } else {
      showError(message);
    }
    setLoading(false);
  };

  const handleInputChange = (name, value) => {
    setInputs((prevInputs) => ({ ...prevInputs, [name]: value }));
  };

  const submitNotice = async () => {
    await updateOption('Notice', inputs.Notice);
  };

  const submitFooter = async () => {
    await updateOption('Footer', inputs.Footer);
  };

  const submitSystemName = async () => {
    await updateOption('SystemName', inputs.SystemName);
  };

  const submitSystemText = async () => {
    await updateOption('SystemText', inputs.SystemText);
  };

  const submitLogo = async () => {
    await updateOption('Logo', inputs.Logo);
  };

  const submitAbout = async () => {
    await updateOption('About', inputs.About);
  };

  const submitOption = async (key) => {
    await updateOption(key, inputs[key]);
  };

  return (
      <Spin spinning={loading}>
          <Layout style={{ padding: '24px' }}>
            <Typography.Title heading={5}>通用设置</Typography.Title>
                <Form>
                  {/* 公告模块 */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ marginTop: '10px' }}>
                      <Typography.Text strong>公告</Typography.Text>
                    </div>
                    <TextArea
                      placeholder='在此输入新的公告内容，支持 Markdown & HTML 代码'
                      value={inputs.Notice}
                      onChange={(value) => handleInputChange('Notice', value)}
                      autosize={{ minRows: 6 }}
                      style={{ maxHeight: '200px', overflowY: 'auto' }} 
                    />
                    <Button onClick={submitNotice} style={{ marginTop: '10px' }}>保存公告</Button>
                  </div>

                  <Divider style={{ marginTop: '20px', marginBottom: '10px'  }}/>

                  {/* 系统名称模块 */}
                <div style={{ width: '40%',marginBottom: '20px' }}>
                  <Typography.Title heading={5}>个性化设置</Typography.Title>
                  <div style={{ marginTop: '10px' }}>
                    <Typography.Text strong>系统名称</Typography.Text>
                  </div>
                  <Input
                    placeholder='在此输入系统名称'
                    value={inputs.SystemName}
                    name='SystemName'
                    onChange={(value) => handleInputChange('SystemName', value)}
                  />
                  <Button onClick={submitSystemName} style={{ marginTop: '10px' }}>设置系统名称</Button>
                </div>

                {/* 系统描述模块 */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ marginTop: '10px' }}>
                    <Typography.Text strong>系统描述</Typography.Text>
                  </div>
                  <TextArea
                      placeholder='系统描述内容'
                      value={inputs.SystemText}
                      onChange={(value) => handleInputChange('SystemText', value)}
                      autosize={{ minRows: 6 }}
                      style={{ maxHeight: '200px', overflowY: 'auto' }} 
                    />
                  <Button onClick={submitSystemText} style={{ marginTop: '10px' }}>设置系统描述</Button>
                </div>

                {/* Logo 图片地址模块 */}
                <div style={{width: '40%', marginBottom: '20px' }}>
                <div style={{ marginTop: '10px' }}>
                      <Typography.Text strong>Logo 图片地址</Typography.Text>
                    </div>
                  <Input
                    placeholder='在此输入 Logo 图片地址'
                    value={inputs.Logo}
                    onChange={(value) => handleInputChange('Logo', value)}
                    type='url'
                  />
                  <Button onClick={submitLogo} style={{ marginTop: '10px' }}>设置 Logo</Button>
                </div>
                <Divider style={{ marginTop: '20px', marginBottom: '10px'  }}/>

                {/* 首页内容模块 */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ marginTop: '10px' }}>
                      <Typography.Text strong>首页内容</Typography.Text>
                    </div>
                  <TextArea
                    placeholder='在此输入首页内容，支持 Markdown & HTML 代码...'
                    value={inputs.HomePageContent}
                    onChange={(value) => handleInputChange('HomePageContent', value)}
                    autosize={{ minRows: 6 }}
                    style={{ maxHeight: '200px', overflowY: 'auto' }} 
                  />
                  <Button onClick={() => submitOption('HomePageContent')} style={{ marginTop: '10px' }}>
                    保存首页内容
                  </Button>
                </div>
                <Divider style={{ marginTop: '20px', marginBottom: '10px'  }}/>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ marginTop: '10px' }}>
                      <Typography.Text strong>关于</Typography.Text>
                  </div>
                  <TextArea
                      label='关于'
                      placeholder='在此输入新的关于内容，支持 Markdown & HTML 代码...'
                      value={inputs.About}
                      onChange={(value) => handleInputChange('About', value )}
                      autosize={{ minRows: 6 }}
                      style={{ maxHeight: '200px', overflowY: 'auto'   }} 
                  />
                  <Button onClick={submitAbout} style={{ marginTop: '10px' }}>保存关于</Button>
                  </div>
                  <Divider style={{ marginTop: '20px', marginBottom: '10px'  }}/>

                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ marginTop: '10px' }}>
                        <Typography.Text strong>页脚</Typography.Text>
                    </div>
                  <Input
                      label='页脚'
                      placeholder='在此输入新的页脚，留空则使用默认页脚，支持 HTML 代码'
                      value={inputs.Footer}
                      onChange={(value) => handleInputChange('Footer', value )}
                  />
                  <Button onClick={submitFooter} style={{ marginTop: '10px' }}>设置页脚</Button>
                  </div>
              </Form>
          </Layout>
      </Spin>
  );
};

export default OtherSetting;

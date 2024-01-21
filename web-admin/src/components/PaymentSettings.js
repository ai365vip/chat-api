import React, {useEffect, useState} from 'react';

import {API, removeTrailingSlash, showError, verifyJSON} from '../helpers';
import { Button,Form,  Typography, Divider, Toast, Spin, Layout,TextArea,Input,Checkbox } from '@douyinfe/semi-ui';
const PaymentSetting = () => {

    let [inputs, setInputs] = useState({
        ServerAddress: '',
        EpayId: '',
        EpayKey: '',
        RedempTionCount: 30,
        TopUpLink:'',
        TopupGroupRatio: '',
        TopupRatio: '',
        PayAddress: '',
        YzfZfb: '',
        YzfWx: '',
      });
      let [loading, setLoading] = useState(false);
    const [originInputs, setOriginInputs] = useState({});

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

    const handleCheckboxChange = (name, checked) => {
        setInputs((prevInputs) => ({ ...prevInputs, [name]: checked ? 'true' : 'false' }));
    };

    const submitPayAddress = async () => {
        if (inputs.ServerAddress === '') {
            showError('请先填写服务器地址');
            return
        }
        let PayAddress = removeTrailingSlash(inputs.PayAddress);
        await updateOption('PayAddress', PayAddress);
        if (inputs.EpayId !== '') {
            await updateOption('EpayId', inputs.EpayId);
        }
        if (inputs.EpayKey !== '') {
            await updateOption('EpayKey', inputs.EpayKey);
        }
        await updateOption('YzfZfb', inputs.YzfZfb);
        await updateOption('YzfWx', inputs.YzfWx);
    };

    const submitGroupRatio = async () => {

        if (originInputs['TopupGroupRatio'] !== inputs.TopupGroupRatio) {
            if (!verifyJSON(inputs.TopupGroupRatio)) {
                showError('充值分组倍率不是合法的 JSON 字符串');
                return;
            }
            await updateOption('TopupGroupRatio', inputs.TopupGroupRatio);
        }
        if (originInputs['TopupRatio'] !== inputs.TopupRatio) {
            if (!verifyJSON(inputs.TopupRatio)) {
                showError('充值倍率不是合法的 JSON 字符串');
                return;
            }
            await updateOption('TopupRatio', inputs.TopupRatio);
        }
    };

    const submitRedemp = async () => {

        await updateOption('TopUpLink', inputs.TopUpLink);
        await updateOption('RedempTionCount', "" + inputs.RedempTionCount);
    };


    return (
        <Spin spinning={loading}>
        <Layout style={{ padding: '24px' }}>
          <Typography.Title heading={5}>易支付</Typography.Title>
 
                    <Form widths='equal'>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <div style={{ width: '30%', marginRight: '5%' }}>
                                <div style={{ marginBottom: '10px' }}>
                                <Typography.Text strong>支付地址，不填写则不启用在线支付</Typography.Text>
                                </div>
                                <Input
                                placeholder='例如：https://yourdomain.com'
                                value={inputs.PayAddress}
                                name='PayAddress'
                                onChange={(value) => handleInputChange('PayAddress', value)}
                                />
                            </div>
                            <div style={{ width: '30%', marginRight: '5%' }}>
                                <div style={{ marginBottom: '10px' }}>
                                <Typography.Text strong>易支付商户ID</Typography.Text>
                                </div>
                                <Input
                                placeholder='例如：0001'
                                value={inputs.EpayId}
                                name='EpayId'
                                onChange={(value) => handleInputChange('EpayId', value)}
                                />
                            </div>
                            <div style={{ width: '30%' }}>
                                <div style={{ marginBottom: '10px' }}>
                                <Typography.Text strong>易支付商户密钥</Typography.Text>
                                </div>
                                <Input
                                placeholder='例如：dejhfueqhujasjmndbjkqaw'
                                value={inputs.EpayKey}
                                name='EpayKey'
                                onChange={(value) => handleInputChange('EpayKey', value)}
                                />
                            </div>
                            
                        </div>
                        {/* 微信与支付宝 */}
                        <div style={{
                            display: 'flex', 
                            alignItems: 'center',
                            marginBottom: '20px',
                            gap: '10px' // 控制内部元素的空间
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <Typography.Text>支付宝</Typography.Text>
                                <Checkbox
                                    checked={inputs.YzfZfb === 'true'}
                                    name='YzfZfb'
                                    onChange={(e) => handleCheckboxChange('YzfZfb', e.target.checked)}
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <Typography.Text>微信</Typography.Text>
                                <Checkbox
                                    checked={inputs.YzfWx === 'true'}
                                    name='YzfWx'
                                    onChange={(e) => handleCheckboxChange('YzfWx', e.target.checked)}
                                />
                            </div>
                        </div>

                        
                        <Button onClick={submitPayAddress} style={{ marginTop: '3px' }}>更新支付设置</Button>
                    </Form>
                    <Divider style={{ marginTop: '20px' }}/>
                    <Form >
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ marginTop: '10px' }}>
                                <Typography.Text strong>充值天数倍率（-1为无期限）</Typography.Text>
                            </div>
                            <TextArea
                                placeholder='充值天数倍率'
                                value={inputs.TopupRatio}
                                onChange={(value) => handleInputChange('TopupRatio', value)}
                                autosize={{ minRows: 6 }}
                                style={{ maxHeight: '200px', overflowY: 'auto' }} 
                                />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ marginTop: '10px' }}>
                                <Typography.Text strong>充值分组倍率</Typography.Text>
                            </div>
                            <TextArea
                                placeholder='充值分组倍率'
                                value={inputs.TopupGroupRatio}
                                onChange={(value) => handleInputChange('TopupGroupRatio', value)}
                                autosize={{ minRows: 6 }}
                                style={{ maxHeight: '200px', overflowY: 'auto' }} 
                                />
                        </div>
                        
                    <Button onClick={submitGroupRatio} style={{ marginTop: '3px' }}>
                        更新倍率设置
                    </Button>
                    {/* Divider组件下的空间与输入框间隔 */}
                    <Divider style={{ marginTop: '20px' }}/>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div style={{ width: '48%', marginRight: '2%' }}>
                            <div style={{ marginBottom: '10px' }}>
                                <Typography.Text strong>兑换码链接</Typography.Text>
                            </div>
                            <Input
                                placeholder='例如发卡网站的购买链接'
                                value={inputs.TopUpLink}
                                name='TopUpLink'
                                onChange={(value) => handleInputChange('TopUpLink', value)}
                            />
                        </div>
                        <div style={{ width: '48%' }}>
                            <div style={{ marginBottom: '10px' }}>
                                <Typography.Text strong>兑换码额度有效期（-1为无期限）</Typography.Text>
                            </div>
                            <Input
                                placeholder='数字1为1天'
                                value={inputs.RedempTionCount}
                                name='RedempTionCount'
                                onChange={(value) => handleInputChange('RedempTionCount', value)}
                            />
                        </div> 
                    </div>

                    <Button onClick={submitRedemp} style={{ marginTop: '3px' }}>
                        更新兑换码设置
                    </Button>

                    </Form>


            </Layout>
      </Spin>
    );
};

export default PaymentSetting;
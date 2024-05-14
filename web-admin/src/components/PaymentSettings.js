import React, {useEffect, useState} from 'react';

import {API, removeTrailingSlash, showError, verifyJSON} from '../helpers';
import { Button,Form,  Typography, Divider, Toast, Spin, Layout,TextArea,Input,Checkbox } from '@douyinfe/semi-ui';

const MODEL_MAPPING_EXAMPLE = {
    "1": 1,
    "30": 0.9,
    "100": 0.8,
};
const PaymentSetting = () => {

    let [inputs, setInputs] = useState({
        ServerAddress: '',
        EpayId: '',
        EpayKey: '',
        RedempTionCount: 30,
        TopUpLink:'',
        TopupGroupRatio: '',
        TopupRatioEnabled: '',
        TopupAmountEnabled: '',
        TopupRatio: '',
        TopupAmount: '',
        PayAddress: '',
        YzfZfb: '',
        YzfWx: '',
      });
      let [loading, setLoading] = useState(false);
    const [originInputs, setOriginInputs] = useState({});

   
      const getOptions = async () => {
        const res = await API.get('/api/option/');
        const {success, message, data} = res.data;
        if (success) {
            let newInputs = {};
            data.forEach((item) => {
                if (item.key === 'TopupRatio' || item.key === 'TopupGroupRatio' ) {
                    item.value = JSON.stringify(JSON.parse(item.value), null, 2);
                }
                newInputs[item.key] = item.value;
            });
            setInputs(newInputs);
            setOriginInputs(newInputs);
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
        await updateOption('TopupAmountEnabled', inputs.TopupAmountEnabled);
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
        if (originInputs['TopupAmount'] !== inputs.TopupAmount) {
            if (!verifyJSON(inputs.TopupAmount)) {
                showError('充值倍率不是合法的 JSON 字符串');
                return;
            }
            await updateOption('TopupAmount', inputs.TopupAmount);
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', width: '80%' ,flexWrap: 'wrap', gap: '20px', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                        <div style={{ flex: '1 1 20%', minWidth: '200px' }}>
                            <Typography.Text strong>支付地址，不填写则不启用在线支付</Typography.Text>
                            <Input
                                placeholder='例如：https://yourdomain.com'
                                value={inputs.PayAddress}
                                name='PayAddress'
                                onChange={(value) => handleInputChange('PayAddress', value)}
                            />
                        </div>
                        <div style={{ flex: '1 1 20%', minWidth: '150px' }}>
                            <Typography.Text strong>易支付商户ID</Typography.Text>
                            <Input
                                placeholder='例如：0001'
                                value={inputs.EpayId}
                                name='EpayId'
                                onChange={(value) => handleInputChange('EpayId', value)}
                            />
                        </div>
                        <div style={{ flex: '1 1 20%', minWidth: '200px' }}>
                            <Typography.Text strong>易支付商户密钥</Typography.Text>
                            <Input
                                placeholder='例如：dejhfueqhujasjmndbjkqaw'
                                value={inputs.EpayKey}
                                name='EpayKey'
                                onChange={(value) => handleInputChange('EpayKey', value)}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center',width: '20%' , padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Typography.Text>支付宝</Typography.Text>
                            <Checkbox
                                checked={inputs.YzfZfb === 'true'}
                                name='YzfZfb'
                                onChange={(e) => handleCheckboxChange('YzfZfb', e.target.checked)}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Typography.Text>微信</Typography.Text>
                            <Checkbox
                                checked={inputs.YzfWx === 'true'}
                                name='YzfWx'
                                onChange={(e) => handleCheckboxChange('YzfWx', e.target.checked)}
                            />
                        </div>
                    </div>
                    <Button onClick={submitPayAddress} style={{ width: '10%', padding: '10px 0', borderRadius: '8px', backgroundColor: '#1890ff', color: '#fff', fontWeight: 'bold' }}>更新支付设置</Button>
                </div>
            </Form>

                        <Divider style={{ marginTop: '20px', marginBottom: '10px'  }}/>
            <Form>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px' }}>
                    
                    <div style={{ display: 'flex',width: '80%' , flexWrap: 'wrap', gap: '20px', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                        <div style={{ flex: '1 1 20%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <Typography.Text strong>充值天数汇率（-1为无期限）</Typography.Text>
                            <TextArea
                                placeholder='充值天数汇率'
                                value={inputs.TopupRatio}
                                onChange={(value) => handleInputChange('TopupRatio', value)}
                                autosize={{ minRows: 6 }}
                                style={{ maxHeight: '200px', overflowY: 'auto' }}
                            />
                        </div>
                        <div style={{ flex: '1 1 20%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <Typography.Text strong>充值分组倍率</Typography.Text>
                            <TextArea
                                placeholder='充值分组倍率'
                                value={inputs.TopupGroupRatio}
                                onChange={(value) => handleInputChange('TopupGroupRatio', value)}
                                autosize={{ minRows: 6 }}
                                style={{ maxHeight: '200px', overflowY: 'auto' }}
                            />
                        </div>
                        <div style={{ flex: '1 1 20%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <Typography.Text strong>充值数量折扣</Typography.Text>
                            <TextArea
                                placeholder={`${JSON.stringify(MODEL_MAPPING_EXAMPLE, null, 2)}`}
                                value={inputs.TopupAmount}
                                onChange={(value) => handleInputChange('TopupAmount', value)}
                                autosize={{ minRows: 6 }}
                                style={{ maxHeight: '200px', overflowY: 'auto' }}
                            />
                        </div>
                        
                    </div>
                    <div style={{ display: 'flex',width: '20%' , alignItems: 'center', gap: '10px', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                        <Typography.Text>充值数量折扣</Typography.Text>
                        <Checkbox
                            checked={inputs.TopupAmountEnabled === 'true'}
                            name='TopupAmountEnabled'
                            onChange={(e) => handleCheckboxChange('TopupAmountEnabled', e.target.checked)}
                        />
                    </div>
                    <Button onClick={submitGroupRatio} style={{ width: '10%', padding: '10px 0', borderRadius: '8px', backgroundColor: '#1890ff', color: '#fff', fontWeight: 'bold' }}>更新倍率设置</Button>
                    <Divider style={{ marginTop: '20px', marginBottom: '10px' }} />
                    <div style={{ display: 'flex',width: '40%' , flexWrap: 'wrap', gap: '20px', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                        <div style={{ flex: '1 1 20%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <Typography.Text strong>兑换码链接</Typography.Text>
                            <Input
                                placeholder='例如发卡网站的购买链接'
                                value={inputs.TopUpLink}
                                name='TopUpLink'
                                onChange={(value) => handleInputChange('TopUpLink', value)}
                            />
                        </div>
                        <div style={{ flex: '1 1 20%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <Typography.Text strong>兑换码额度有效期（-1为无期限）</Typography.Text>
                            <Input
                                placeholder='数字1为1天'
                                value={inputs.RedempTionCount}
                                name='RedempTionCount'
                                onChange={(value) => handleInputChange('RedempTionCount', value)}
                            />
                        </div>
                    </div>
                    <Button onClick={submitRedemp} style={{ width: '10%', padding: '10px 0', borderRadius: '8px', backgroundColor: '#1890ff', color: '#fff', fontWeight: 'bold' }}>更新兑换码设置</Button>
                </div>
            </Form>



            </Layout>
      </Spin>
    );
};

export default PaymentSetting;
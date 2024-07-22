import React, {useEffect, useState} from 'react';
import {Header} from 'semantic-ui-react';
import {API, showError, showSuccess, timestamp2string, verifyJSON} from '../helpers';

import { Button,Form,  Typography, Divider, Tooltip, Spin, Layout,TextArea,Input,Checkbox } from '@douyinfe/semi-ui';

const OperationSetting = () => {
    let now = new Date();
    let [inputs, setInputs] = useState({
        QuotaForNewUser: 0,
        QuotaForInviter: 0,
        QuotaForInvitee: 0,
        QuotaRemindThreshold: 0,
        PreConsumedQuota: 0,
        ModelRatio: '',
        ModelPrice : '',
        GroupRatio: '',
        CompletionRatio: '',
        TopUpLink: '',
        ChatLink: '',
        QuotaPerUnit: 0,
        AutomaticDisableChannelEnabled: '',
        ChannelDisableThreshold: 0,
        LogConsumeEnabled: '',
        DisplayInCurrencyEnabled: '',
        DisplayTokenStatEnabled: '',
        BillingByRequestEnabled: '',
        BlankReplyRetryEnabled: '',
        ModelRatioEnabled: '',
        DrawingEnabled: '',
        DataExportEnabled: '',
        DataExportInterval: 5,
        RetryTimes: 0,
        MiniQuota: 10,
        ProporTions: 10,
        LogContentEnabled :'',
        GroupUserRatio :'',
        UserGroupEnabled:'',
        historyTimestamp: timestamp2string(now.getTime() / 1000 - 30 * 24 * 3600),
    }); 
    const [originInputs, setOriginInputs] = useState({});
    let [loading, setLoading] = useState(false);

    const formatForDateTimeLocal = (dateTimeString) => {
        return dateTimeString.replace(" ", "T").slice(0, 16);
      };
      
      // 初始化 historyTimestamp 状态变量为一个月前的时间，格式化为 datetime-local 需要的格式
      let [historyTimestamp, setHistoryTimestamp] = useState(
        formatForDateTimeLocal(timestamp2string(now.getTime() / 1000 - 30 * 24 * 3600))
      );
      


    const getOptions = async () => {
        const res = await API.get('/api/option/');
        const {success, message, data} = res.data;
        if (success) {
            let newInputs = {};
            data.forEach((item) => {
                if (item.key === 'ModelRatio' || item.key === 'GroupRatio' || item.key === 'ModelPrice' || item.key === 'CompletionRatio') {
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

    const submiScreen = async () => {
        await updateOption('DataExportInterval',  inputs.DataExportInterval);
        await updateOption('LogConsumeEnabled',  inputs.LogConsumeEnabled);
        await updateOption('LogContentEnabled',  inputs.LogContentEnabled);
    };



    const submiTgeneral = async () => {

        await updateOption('ChatLink', inputs.ChatLink);
        if (inputs.QuotaPerUnit !== '') {
            await updateOption('QuotaPerUnit', inputs.QuotaPerUnit);
        }
        if (inputs.RetryTimes !== '') {
            await updateOption('RetryTimes', inputs.RetryTimes);
        }
        await updateOption('DisplayInCurrencyEnabled', inputs.DisplayInCurrencyEnabled);
        await updateOption('DisplayTokenStatEnabled', inputs.DisplayTokenStatEnabled);
        await updateOption('BlankReplyRetryEnabled', inputs.BlankReplyRetryEnabled);
    };

    const submiChannel = async () => {
        await updateOption('ChannelDisableThreshold', inputs.ChannelDisableThreshold);
        await updateOption('QuotaRemindThreshold', inputs.QuotaRemindThreshold);
        await updateOption('AutomaticDisableChannelEnabled', inputs.AutomaticDisableChannelEnabled);

    };

    const submiQuota = async () => {
        await updateOption('QuotaForNewUser', inputs.QuotaForNewUser);
        await updateOption('PreConsumedQuota', inputs.PreConsumedQuota);
        await updateOption('QuotaForInvitee', inputs.QuotaForInvitee);
        await updateOption('QuotaForInviter', inputs.QuotaForInviter);
        await updateOption('MiniQuota', inputs.MiniQuota);
        await updateOption('ProporTions', inputs.ProporTions);
    };

    const submitGroupRatio = async () => {

        if (originInputs['ModelRatio'] !== inputs.ModelRatio) {
            if (!verifyJSON(inputs.ModelRatio)) {
                showError('模型倍率不是合法的 JSON 字符串');
                return;
            }
            await updateOption('ModelRatio', inputs.ModelRatio);
        }
        if (originInputs['ModelPrice'] !== inputs.ModelPrice) {
            if (!verifyJSON(inputs.ModelPrice)) {
                showError('按次计费不是合法的 JSON 字符串');
                return;
            }
            await updateOption('ModelPrice', inputs.ModelPrice);
        }
        if (originInputs['GroupRatio'] !== inputs.GroupRatio) {
            if (!verifyJSON(inputs.GroupRatio)) {
                showError('分组倍率不是合法的 JSON 字符串');
                return;
            }
            await updateOption('GroupRatio', inputs.GroupRatio);
        }
        if (originInputs['CompletionRatio'] !== inputs.CompletionRatio) {
            if (!verifyJSON(inputs.GroupRatio)) {
                showError('分组倍率不是合法的 JSON 字符串');
                return;
            }
            await updateOption('CompletionRatio', inputs.CompletionRatio);
        }
        await updateOption('ModelRatioEnabled', inputs.ModelRatioEnabled);
        await updateOption('BillingByRequestEnabled', inputs.BillingByRequestEnabled);
    };

    const submitUserGroups = async () => {
        if (originInputs['UserGGroupUserRatiooups'] !== inputs.GroupUserRatio) {
            if (!verifyJSON(inputs.GroupUserRatio)) {
                showError('用户分组限制不是合法的 JSON 字符串');
                return;
            }
            await updateOption('GroupUserRatio', inputs.GroupUserRatio);
        }
        await updateOption('UserGroupEnabled', inputs.UserGroupEnabled);
    };
    

    const deleteHistoryLogs = async () => {
        const res = await API.delete(`/api/log/?target_timestamp=${Date.parse(historyTimestamp) / 1000}`);
        const {success, message, data} = res.data;
        if (success) {
            showSuccess(`${data} 条日志已清理！`);
            return;
        }
        showError('日志清理失败：' + message);
    };

    return (
        <Spin spinning={loading}>
            <Layout style={{ padding: '24px' }}>
                <Typography.Title style={{ marginBottom: '10px'}} heading={5}>通用设置</Typography.Title>
                    <Form>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '20px' }}>
                            <div style={{ width: '32%', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                                <Typography.Text strong>聊天页面链接</Typography.Text>
                                <Input
                                    placeholder='例如 ChatGPT Next Web 的部署地址'
                                    value={inputs.ChatLink}
                                    name='ChatLink'
                                    onChange={(value) => handleInputChange('ChatLink', value)}
                                />
                            </div>
                            <div style={{ width: '20%', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                                <Typography.Text strong>单位美元额度</Typography.Text>
                                <Input
                                    placeholder='一单位货币能兑换的额度'
                                    value={inputs.QuotaPerUnit}
                                    name='QuotaPerUnit'
                                    onChange={(value) => handleInputChange('QuotaPerUnit', value)}
                                />
                            </div>
                            <div style={{ width: '20%', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                                <Typography.Text strong>失败重试次数</Typography.Text>
                                <Input
                                    placeholder='失败重试次数'
                                    value={inputs.RetryTimes}
                                    name='RetryTimes'
                                    onChange={(value) => handleInputChange('RetryTimes', value)}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '20px',}}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '15%', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                                <Typography.Text>以货币形式显示额度</Typography.Text>
                                <Checkbox
                                    checked={inputs.DisplayInCurrencyEnabled === 'true'}
                                    name='DisplayInCurrencyEnabled'
                                    onChange={(e) => handleCheckboxChange('DisplayInCurrencyEnabled', e.target.checked)}
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '22%', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                                <Typography.Text>Billing 相关 API 显示令牌额度而非用户额度</Typography.Text>
                                <Checkbox
                                    checked={inputs.DisplayTokenStatEnabled === 'true'}
                                    name='DisplayTokenStatEnabled'
                                    onChange={(e) => handleCheckboxChange('DisplayTokenStatEnabled', e.target.checked)}
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '10%', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                                <Typography.Text>空回复重试</Typography.Text>
                                <Checkbox
                                    checked={inputs.BlankReplyRetryEnabled === 'true'}
                                    name='BlankReplyRetryEnabled'
                                    onChange={(e) => handleCheckboxChange('BlankReplyRetryEnabled', e.target.checked)}
                                />
                            </div>
                        </div>
                        <Button onClick={submiTgeneral} style={{ width: '15%', padding: '10px 0', borderRadius: '8px', backgroundColor: '#1890ff', color: '#fff', fontWeight: 'bold' }}>保存通用设置</Button>
                    </Form>

                    <Divider style={{ marginTop: '20px', marginBottom: '10px'  }}/>
                    <Typography.Title style={{ marginBottom: '10px'}} heading={5}>日志设置</Typography.Title>
                    
                    <Form>
                        <div style={{ display: 'flex', width: '30%' ,flexDirection: 'column', gap: '20px', marginBottom: '20px' }}>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                                    <Typography.Text strong>数据看板更新间隔（分钟，设置过短会影响数据库性能）</Typography.Text>
                                    <Input
                                        style={{ width: 70 }}
                                        name='DataExportInterval'
                                        value={inputs.DataExportInterval}
                                        onChange={(value) => handleInputChange('DataExportInterval', value)}
                                        min={0}
                                    />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Typography.Text>启用额度消费日志记录</Typography.Text>
                                    <Checkbox
                                        checked={inputs.LogConsumeEnabled === 'true'}
                                        name='LogConsumeEnabled'
                                        onChange={(e) => handleCheckboxChange('LogConsumeEnabled', e.target.checked)}
                                    />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Typography.Text>启用日志详情</Typography.Text>
                                    <Checkbox
                                        checked={inputs.LogContentEnabled === 'true'}
                                        name='LogContentEnabled'
                                        onChange={(e) => handleCheckboxChange('LogContentEnabled', e.target.checked)}
                                    />
                                </div>
                            </div>
                            <Button onClick={submiScreen} style={{ alignSelf: 'center', padding: '10px 20px', borderRadius: '8px', backgroundColor: '#1890ff', color: '#fff', fontWeight: 'bold' }}>保存日志设置</Button>
                        </div>
                    </Form>

                    <Form>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px',width: '30%'  }}>
                            <div style={{ padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <Form.DatePicker
                                    field="historyTimestamp"
                                    fluid
                                    label='日期（选择的日期之前的记录会清除）'
                                    style={{ width: '100%' }}
                                    initValue={historyTimestamp}
                                    value={historyTimestamp}
                                    type='dateTime'
                                    name='historyTimestamp'
                                    onChange={value => setHistoryTimestamp(value, 'historyTimestamp')}
                                />
                                <Button type='warning' onClick={() => {
                                    deleteHistoryLogs().then();
                                }} style={{ alignSelf: 'center', padding: '10px 20px', borderRadius: '8px', backgroundColor: '#ff4d4f', color: '#fff', fontWeight: 'bold' }}>清理历史日志</Button>
                            </div>
                        </div>
                    </Form>

                    

                    <Divider style={{ marginTop: '20px', marginBottom: '10px'  }}/>
                    <Typography.Title style={{ marginBottom: '10px'}} heading={5}>监控设置</Typography.Title>
                    <Form>
                        <div style={{ display: 'flex',width: '30%' , flexDirection: 'column', gap: '20px', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                                <div style={{ flex: '1', minWidth: '200px' }}>
                                    <Typography.Text strong>最长响应时间</Typography.Text>
                                    <Input
                                        placeholder='例如：100'
                                        value={inputs.ChannelDisableThreshold}
                                        name='ChannelDisableThreshold'
                                        onChange={(value) => handleInputChange('ChannelDisableThreshold', value)}
                                    />
                                </div>
                                <div style={{ flex: '1', minWidth: '200px' }}>
                                    <Typography.Text strong>额度提醒阈值</Typography.Text>
                                    <Input
                                        placeholder='请求结束后多退少'
                                        value={inputs.QuotaRemindThreshold}
                                        name='QuotaRemindThreshold'
                                        onChange={(value) => handleInputChange('QuotaRemindThreshold', value)}
                                    />
                                </div>
                                <div style={{ display: 'flex',width: '40%' , alignItems: 'center', justifyContent: 'space-between', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                                    <Typography.Text>失败时自动禁用通道</Typography.Text>
                                    <Checkbox
                                        checked={inputs.AutomaticDisableChannelEnabled === 'true'}
                                        name='AutomaticDisableChannelEnabled'
                                        onChange={(e) => handleCheckboxChange('AutomaticDisableChannelEnabled', e.target.checked)}
                                    />
                                </div>
                            </div>
                            
                            <Button onClick={submiChannel} style={{ alignSelf: 'center', padding: '10px 20px', borderRadius: '8px', backgroundColor: '#1890ff', color: '#fff', fontWeight: 'bold' }}>保存监控设置</Button>
                        </div>
                    </Form>

                   
                    <Divider style={{ marginTop: '20px' , marginBottom: '10px' }}/>
                    <Typography.Title style={{ marginBottom: '10px'}} heading={5}>额度设置</Typography.Title>
                    <Form>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '20px' }}>
                            <div style={{ flex: '1 1 calc(15% - 20px)', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                                <Typography.Text strong>新用户初始额度</Typography.Text>
                                <Input
                                    placeholder='例如：100'
                                    value={inputs.QuotaForNewUser}
                                    name='QuotaForNewUser'
                                    onChange={(value) => handleInputChange('QuotaForNewUser', value)}
                                />
                            </div>
                            <div style={{ flex: '1 1 calc(15% - 20px)', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                                <Typography.Text strong>请求预扣费额度</Typography.Text>
                                <Input
                                    placeholder='请求结束后多退少'
                                    value={inputs.PreConsumedQuota}
                                    name='PreConsumedQuota'
                                    onChange={(value) => handleInputChange('PreConsumedQuota', value)}
                                />
                            </div>
                            <div style={{ flex: '1 1 calc(15% - 20px)', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                                <Typography.Text strong>邀请新用户奖励额度</Typography.Text>
                                <Input
                                    placeholder='例如：2000'
                                    value={inputs.QuotaForInviter}
                                    name='QuotaForInviter'
                                    onChange={(value) => handleInputChange('QuotaForInviter', value)}
                                />
                            </div>
                            <div style={{ flex: '1 1 calc(15% - 20px)', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                                <Typography.Text strong>新用户使用邀请码奖励额度</Typography.Text>
                                <Input
                                    placeholder='例如：2000'
                                    value={inputs.QuotaForInvitee}
                                    name='QuotaForInvitee'
                                    onChange={(value) => handleInputChange('QuotaForInvitee', value)}
                                />
                            </div>
                            <div style={{ flex: '1 1 calc(15% - 20px)', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                                <Typography.Text strong>提现/划转最低金额（1=1元）</Typography.Text>
                                <Input
                                    placeholder='例如：10'
                                    value={inputs.MiniQuota}
                                    name='MiniQuota'
                                    onChange={(value) => handleInputChange('MiniQuota', value)}
                                />
                            </div>
                            <div style={{ flex: '1 1 calc(15% - 20px)', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                                <Typography.Text strong>邀请用户返现比例</Typography.Text>
                                <Input
                                    placeholder='例如：10'
                                    value={inputs.ProporTions}
                                    name='ProporTions'
                                    onChange={(value) => handleInputChange('ProporTions', value)}
                                />
                            </div>
                        </div>
                        <Button onClick={submiQuota} style={{ width: '15%', padding: '10px 0', borderRadius: '8px', backgroundColor: '#1890ff', color: '#fff', fontWeight: 'bold' }}>保存注册设置</Button>
                    </Form>

                    <Divider style={{ marginTop: '20px' , marginBottom: '10px' }}/>
                    <Typography.Title style={{ marginBottom: '10px'}} heading={5}>倍率设置</Typography.Title>

                    <Form>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px' }}>
                            <div style={{ padding: '20px', border: '1px solid #e0e0e0',width: '20%' , borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                                <Typography.Text style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '10px' }} strong>计费策略（同时开启 用户令牌可自选）</Typography.Text>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <Typography.Text>倍率</Typography.Text>
                                        <Checkbox
                                            checked={inputs.ModelRatioEnabled === 'true'}
                                            name='ModelRatioEnabled'
                                            onChange={(e) => handleCheckboxChange('ModelRatioEnabled', e.target.checked)}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <Typography.Text>按次</Typography.Text>
                                        <Checkbox
                                            checked={inputs.BillingByRequestEnabled === 'true'}
                                            name='BillingByRequestEnabled'
                                            onChange={(e) => handleCheckboxChange('BillingByRequestEnabled', e.target.checked)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                                <div style={{ flex: '1 1 calc(20% - 20px)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <Typography.Text strong>模型倍率</Typography.Text>
                                    <TextArea
                                        placeholder='为一个 JSON 文本，键为模型名称，值为倍率'
                                        value={inputs.ModelRatio}
                                        onChange={(value) => handleInputChange('ModelRatio', value)}
                                        autosize={{ minRows: 6 }}
                                        style={{ maxHeight: '400px', overflowY: 'auto' }}
                                    />
                                </div>
                                <div style={{ flex: '1 1 calc(20% - 20px)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <Typography.Text strong>补全倍率</Typography.Text>
                                    <TextArea
                                        placeholder='为一个 JSON 文本，键为模型名称，值为倍率'
                                        value={inputs.CompletionRatio}
                                        onChange={(value) => handleInputChange('CompletionRatio', value)}
                                        autosize={{ minRows: 6 }}
                                        style={{ maxHeight: '400px', overflowY: 'auto' }}
                                    />
                                </div>
                                <div style={{ flex: '1 1 calc(20% - 20px)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <Tooltip
                                        content={
                                            <div>
                                                <p>每1的设定值相当于1次使用的费用（1美元）。如果模型未特别设定，则默认采用Token计费方式。</p>
                                                <p>默认计费设置为 "default": 0.02，即未指定模型的情况下将应用该默认费率。</p>
                                                <p>若移除此项default，默认计费方式将转为Token计费。</p>
                                            </div>
                                        }
                                        position="top"
                                    >
                                        <Typography.Text strong>按次</Typography.Text>
                                    </Tooltip>
                                    <TextArea
                                        placeholder='请输入一个 JSON 格式的文本，其中键为模型名称，值为每次计费的金额，例如：{"gpt-4": 0.1} 表示 GPT-4 模型每次使用费用为0.1美元。'
                                        value={inputs.ModelPrice}
                                        onChange={(value) => handleInputChange('ModelPrice', value)}
                                        autosize={{ minRows: 6 }}
                                        style={{ maxHeight: '400px', overflowY: 'auto' }}
                                    />
                                </div>
                                <div style={{ flex: '1 1 calc(20% - 20px)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <Typography.Text strong>分组倍率</Typography.Text>
                                    <TextArea
                                        placeholder='为一个 JSON 文本，键为分组名称，值为倍率'
                                        value={inputs.GroupRatio}
                                        onChange={(value) => handleInputChange('GroupRatio', value)}
                                        autosize={{ minRows: 6 }}
                                        style={{ maxHeight: '200px', overflowY: 'auto' }}
                                    />
                                </div>
                            </div>
                            <Button onClick={submitGroupRatio} style={{ width: '15%', padding: '10px 0', borderRadius: '8px', backgroundColor: '#1890ff', color: '#fff', fontWeight: 'bold' }}>保存倍率设置</Button>
                            <Divider style={{ marginTop: '20px', marginBottom: '10px' }} />
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <Typography.Text>用户令牌分组</Typography.Text>
                                    <Checkbox
                                        checked={inputs.UserGroupEnabled === 'true'}
                                        name='UserGroupEnabled'
                                        onChange={(e) => handleCheckboxChange('UserGroupEnabled', e.target.checked)}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                                <div style={{ flex: '1 1 calc(50% - 20px)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <Typography.Text strong>可用分组</Typography.Text>
                                    <TextArea
                                        placeholder='为一个 JSON 文本，键为分组名称，值为模型'
                                        value={inputs.GroupUserRatio}
                                        onChange={(value) => handleInputChange('GroupUserRatio', value)}
                                        autosize={{ minRows: 6 }}
                                        style={{ maxHeight: '200px', overflowY: 'auto' }}
                                    />
                                </div>
                            </div>
                            <Button onClick={submitUserGroups} style={{ width: '15%', padding: '10px 0', borderRadius: '8px', backgroundColor: '#1890ff', color: '#fff', fontWeight: 'bold' }}>保存用户可用令牌分组</Button>

                        </div>
                    </Form>
            </Layout>
      </Spin>
    );
};

export default OperationSetting;

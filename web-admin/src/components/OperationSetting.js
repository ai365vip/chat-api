import React, {useEffect, useState} from 'react';
import {Divider, Form, Grid, Header,Popup } from 'semantic-ui-react';
import {API, showError, showSuccess, timestamp2string, verifyJSON} from '../helpers';


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
        TopUpLink: '',
        ChatLink: '',
        QuotaPerUnit: 0,
        AutomaticDisableChannelEnabled: '',
        ChannelDisableThreshold: 0,
        LogConsumeEnabled: '',
        DisplayInCurrencyEnabled: '',
        DisplayTokenStatEnabled: '',
        BillingByRequestEnabled: '',
        ModelRatioEnabled: '',
        DrawingEnabled: '',
        DataExportEnabled: '',
        DataExportInterval: 5,
        RetryTimes: 0,
        MiniQuota: 10,
        ProporTions: 10,
    }); 
    const [originInputs, setOriginInputs] = useState({});
    let [loading, setLoading] = useState(false);
    let [historyTimestamp, setHistoryTimestamp] = useState(timestamp2string(now.getTime() / 1000 - 30 * 24 * 3600)); // a month ago

    const getOptions = async () => {
        const res = await API.get('/api/option/');
        const {success, message, data} = res.data;
        if (success) {
            let newInputs = {};
            data.forEach((item) => {
                if (item.key === 'ModelRatio' || item.key === 'GroupRatio' || item.key === 'ModelPrice') {
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
        getOptions().then();
    }, []);

    const updateOption = async (key, value) => {
        setLoading(true);
        if (key.endsWith('Enabled')) {
            value = inputs[key] === 'true' ? 'false' : 'true';
        }
        const res = await API.put('/api/option/', {
            key,
            value
        });
        const {success, message} = res.data;
        if (success) {
            setInputs((inputs) => ({...inputs, [key]: value}));
        } else {
            showError(message);
        }
        setLoading(false);
    };

    const handleInputChange = async (e, {name, value}) => {
        if (name.endsWith('Enabled') || name === 'DataExportInterval') {
            await updateOption(name, value);
        } else {
            setInputs((inputs) => ({...inputs, [name]: value}));
        }
    };

    const submitConfig = async (group) => {
        switch (group) {
            case 'monitor':
                if (originInputs['ChannelDisableThreshold'] !== inputs.ChannelDisableThreshold) {
                    await updateOption('ChannelDisableThreshold', inputs.ChannelDisableThreshold);
                }
                if (originInputs['QuotaRemindThreshold'] !== inputs.QuotaRemindThreshold) {
                    await updateOption('QuotaRemindThreshold', inputs.QuotaRemindThreshold);
                }
                break;
            case 'ratio':
                if (originInputs['ModelRatio'] !== inputs.ModelRatio) {
                    if (!verifyJSON(inputs.ModelRatio)) {
                        showError('模型倍率不是合法的 JSON 字符串');
                        return;
                    }
                    await updateOption('ModelRatio', inputs.ModelRatio);
                }
                if (originInputs['GroupRatio'] !== inputs.GroupRatio) {
                    if (!verifyJSON(inputs.GroupRatio)) {
                        showError('分组倍率不是合法的 JSON 字符串');
                        return;
                    }
                    await updateOption('GroupRatio', inputs.GroupRatio);
                }
                if (originInputs['ModelPrice'] !== inputs.ModelPrice) {
                    if (!verifyJSON(inputs.ModelPrice)) {
                        showError('模型固定价格不是合法的 JSON 字符串');
                        return;
                    }
                    await updateOption('ModelPrice', inputs.ModelPrice);
                }
                break;
            case 'quota':
                if (originInputs['QuotaForNewUser'] !== inputs.QuotaForNewUser) {
                    await updateOption('QuotaForNewUser', inputs.QuotaForNewUser);
                }
                if (originInputs['QuotaForInvitee'] !== inputs.QuotaForInvitee) {
                    await updateOption('QuotaForInvitee', inputs.QuotaForInvitee);
                }
                if (originInputs['QuotaForInviter'] !== inputs.QuotaForInviter) {
                    await updateOption('QuotaForInviter', inputs.QuotaForInviter);
                }
                if (originInputs['PreConsumedQuota'] !== inputs.PreConsumedQuota) {
                    await updateOption('PreConsumedQuota', inputs.PreConsumedQuota);
                }
                if (originInputs['MiniQuota'] !== inputs.MiniQuota) {
                    await updateOption('MiniQuota', inputs.MiniQuota);
                }
                if (originInputs['ProporTions'] !== inputs.ProporTions) {
                    await updateOption('ProporTions', inputs.ProporTions);
                }
                break;
            case 'general':
                if (originInputs['TopUpLink'] !== inputs.TopUpLink) {
                    await updateOption('TopUpLink', inputs.TopUpLink);
                }
                if (originInputs['ChatLink'] !== inputs.ChatLink) {
                    await updateOption('ChatLink', inputs.ChatLink);
                }
                if (originInputs['QuotaPerUnit'] !== inputs.QuotaPerUnit) {
                    await updateOption('QuotaPerUnit', inputs.QuotaPerUnit);
                }
                if (originInputs['RetryTimes'] !== inputs.RetryTimes) {
                    await updateOption('RetryTimes', inputs.RetryTimes);
                }
                break;
        }
    };

    const deleteHistoryLogs = async () => {
        console.log(inputs);
        const res = await API.delete(`/api/log/?target_timestamp=${Date.parse(historyTimestamp) / 1000}`);
        const {success, message, data} = res.data;
        if (success) {
            showSuccess(`${data} 条日志已清理！`);
            return;
        }
        showError('日志清理失败：' + message);
    };
    return (
        <Grid columns={1}>
            <Grid.Column>
                <Form loading={loading}>
                    <Header as='h3'>
                        通用设置
                    </Header>
                    <Form.Group widths={4}>
                        
                        <Form.Input
                            label='聊天页面链接'
                            name='ChatLink'
                            onChange={handleInputChange}
                            autoComplete='new-password'
                            value={inputs.ChatLink}
                            type='link'
                            placeholder='例如 ChatGPT Next Web 的部署地址'
                        />
                        <Form.Input
                            label='单位美元额度'
                            name='QuotaPerUnit'
                            onChange={handleInputChange}
                            autoComplete='new-password'
                            value={inputs.QuotaPerUnit}
                            type='number'
                            step='0.01'
                            placeholder='一单位货币能兑换的额度'
                        />
                        <Form.Input
                            label='失败重试次数'
                            name='RetryTimes'
                            type={'number'}
                            step='1'
                            min='0'
                            onChange={handleInputChange}
                            autoComplete='new-password'
                            value={inputs.RetryTimes}
                            placeholder='失败重试次数'
                        />
                    </Form.Group>
                    <Form.Group inline>

                        <Form.Checkbox
                            checked={inputs.DisplayInCurrencyEnabled === 'true'}
                            label='以货币形式显示额度'
                            name='DisplayInCurrencyEnabled'
                            onChange={handleInputChange}
                        />
                        <Form.Checkbox
                            checked={inputs.DisplayTokenStatEnabled === 'true'}
                            label='Billing 相关 API 显示令牌额度而非用户额度'
                            name='DisplayTokenStatEnabled'
                            onChange={handleInputChange}
                        />
                        {/*<Form.Checkbox
                            checked={inputs.DrawingEnabled === 'true'}
                            label='启用绘图功能'
                            name='DrawingEnabled'
                            onChange={handleInputChange}
                        />*/}
                    </Form.Group>
                    <Form.Button onClick={() => {
                        submitConfig('general').then();
                    }}>保存通用设置</Form.Button><Divider/>
                    <Header as='h3'>
                        日志设置
                    </Header>
                    <Form.Group inline>
                        <Form.Checkbox
                            checked={inputs.LogConsumeEnabled === 'true'}
                            label='启用额度消费日志记录'
                            name='LogConsumeEnabled'
                            onChange={handleInputChange}
                        />

                    </Form.Group>
                    <Form.Group inline>
                        {/*<Form.Checkbox
                            checked={inputs.DataExportEnabled === 'true'}
                            label='启用数据看板（实验性）'
                            name='DataExportEnabled'
                            onChange={handleInputChange}
                />*/}
                        <Form.Input
                            label='数据看板更新间隔（分钟，设置过短会影响数据库性能）'
                            name='DataExportInterval'
                            type={'number'}
                            step='1'
                            min='1'
                            onChange={handleInputChange}
                            autoComplete='new-password'
                            value={inputs.DataExportInterval}
                            placeholder='数据看板更新间隔（分钟，设置过短会影响数据库性能）'
                        />
                    </Form.Group>
                    <Divider/>
                    <Form.Group widths={4}>
                        <Form.Input label='目标时间' value={historyTimestamp} type='datetime-local'
                                    name='history_timestamp'
                                    onChange={(e, {name, value}) => {
                                        setHistoryTimestamp(value);
                                    }}/>
                    </Form.Group>
                    <Form.Button onClick={() => {
                        deleteHistoryLogs().then();
                    }}>清理历史日志</Form.Button>
                    <Divider/>
                    <Header as='h3'>
                        监控设置
                    </Header>
                    <Form.Group widths={3}>
                        <Form.Input
                            label='最长响应时间'
                            name='ChannelDisableThreshold'
                            onChange={handleInputChange}
                            autoComplete='new-password'
                            value={inputs.ChannelDisableThreshold}
                            type='number'
                            min='0'
                            placeholder='单位秒，当运行通道全部测试时，超过此时间将自动禁用通道'
                        />
                        <Form.Input
                            label='额度提醒阈值'
                            name='QuotaRemindThreshold'
                            onChange={handleInputChange}
                            autoComplete='new-password'
                            value={inputs.QuotaRemindThreshold}
                            type='number'
                            min='0'
                            placeholder='低于此额度时将发送邮件提醒用户'
                        />
                    </Form.Group>
                    <Form.Group inline>
                        <Form.Checkbox
                            checked={inputs.AutomaticDisableChannelEnabled === 'true'}
                            label='失败时自动禁用通道'
                            name='AutomaticDisableChannelEnabled'
                            onChange={handleInputChange}
                        />
                    </Form.Group>
                    <Form.Button onClick={() => {
                        submitConfig('monitor').then();
                    }}>保存监控设置</Form.Button>
                    <Divider/>
                    <Header as='h3'>
                        额度设置
                    </Header>
                    <Form.Group widths={4}>
                        <Form.Input
                            label='新用户初始额度'
                            name='QuotaForNewUser'
                            onChange={handleInputChange}
                            autoComplete='new-password'
                            value={inputs.QuotaForNewUser}
                            type='number'
                            min='0'
                            placeholder='例如：100'
                        />
                        <Form.Input
                            label='请求预扣费额度'
                            name='PreConsumedQuota'
                            onChange={handleInputChange}
                            autoComplete='new-password'
                            value={inputs.PreConsumedQuota}
                            type='number'
                            min='0'
                            placeholder='请求结束后多退少补'
                        />
                        <Form.Input
                            label='邀请新用户奖励额度'
                            name='QuotaForInviter'
                            onChange={handleInputChange}
                            autoComplete='new-password'
                            value={inputs.QuotaForInviter}
                            type='number'
                            min='0'
                            placeholder='例如：2000'
                        />
                        <Form.Input
                            label='新用户使用邀请码奖励额度'
                            name='QuotaForInvitee'
                            onChange={handleInputChange}
                            autoComplete='new-password'
                            value={inputs.QuotaForInvitee}
                            type='number'
                            min='0'
                            placeholder='例如：1000'
                        />
                        <Form.Input
                            label='提现/划转最低金额（1=1元）'
                            name='MiniQuota'
                            onChange={handleInputChange}
                            autoComplete='new-password'
                            value={inputs.MiniQuota}
                            type='number'
                            min='0'
                            placeholder='例如：10'
                        />
                        <Form.Input
                            label='邀请用户返现比例'
                            name='ProporTions'
                            onChange={handleInputChange}
                            autoComplete='new-password'
                            value={inputs.ProporTions}
                            type='number'
                            min='0'
                            placeholder='例如：10'
                        />
                    </Form.Group>
                    <Form.Button onClick={() => {
                        submitConfig('quota').then();
                    }}>保存额度设置</Form.Button>
                    <Divider/>
                    <Header as='h3'>
                        倍率设置
                    </Header>
                    <Form.Group inline>
                    <label>计费策略</label>
                        <Form.Checkbox
                            label='倍率'
                            checked={inputs.ModelRatioEnabled === 'true'}
                            name='ModelRatioEnabled'
                            onChange={handleInputChange}
                        />
                        <Form.Checkbox
                            label='按次'
                            checked={inputs.BillingByRequestEnabled === 'true'}
                            name='BillingByRequestEnabled'
                            onChange={handleInputChange}
                        />
                    </Form.Group>
                    <Popup
                          trigger={
                            <label  style={{ fontWeight: 'bold' }}>
                              模型倍率
                            </label>
                          }
                          content='未设置的模型默认30'
                          basic
                        />
                    <Form.Group widths='equal'>
                        <Form.TextArea
                            
                            name='ModelRatio'
                            onChange={handleInputChange}
                            style={{minHeight: 250, fontFamily: 'JetBrains Mono, Consolas'}}
                            autoComplete='new-password'
                            value={inputs.ModelRatio}
                            placeholder='为一个 JSON 文本，键为模型名称，值为倍率'
                        />
                    </Form.Group>
                    <Popup
                        trigger={
                          <label style={{ fontWeight: 'bold' }}>
                            模型按次计费（默认计费设置为 "default": 0.02，即未指定模型的情况下将应用该默认费率。若移除此项，默认计费方式将转为Token计费。）
                          </label>
                        }
                        content={
                          <>
                            <p>每1的设定值相当于1次使用的费用（1美元）。如果模型未特别设定，则默认采用Token计费方式。</p>
                            <p>默认计费设置为 "default": 0.02，即未指定模型的情况下将应用该默认费率。</p>
                            <p>若移除此项，默认计费方式将转为Token计费。</p>
                          </>
                        }
                        basic
                      />
                      <Form.Group widths='equal'> 
                        <Form.TextArea
                          name='ModelPrice'
                          onChange={handleInputChange}
                          style={{ minHeight: 250, fontFamily: 'JetBrains Mono, Consolas' }}
                          autoComplete='new-password'
                          value={inputs.ModelPrice}
                          placeholder='请输入一个 JSON 格式的文本，其中键为模型名称，值为每次计费的金额，例如：{"gpt-4": 0.1} 表示 GPT-4 模型每次使用费用为0.1美元。'
                        />
                      </Form.Group>
                    <Form.Group widths='equal'>
                        <Form.TextArea
                            label='分组倍率'
                            name='GroupRatio'
                            onChange={handleInputChange}
                            style={{minHeight: 250, fontFamily: 'JetBrains Mono, Consolas'}}
                            autoComplete='new-password'
                            value={inputs.GroupRatio}
                            placeholder='为一个 JSON 文本，键为分组名称，值为倍率'
                        />
                    </Form.Group>
                    <Form.Button onClick={() => {
                        submitConfig('ratio').then();
                    }}>保存倍率设置</Form.Button>
                </Form>
            </Grid.Column>
        </Grid>
    );
};

export default OperationSetting;

import React, {useEffect, useState} from 'react';
import {Label} from 'semantic-ui-react';
import {API, copy, isAdmin, showError, showSuccess, timestamp2string} from '../helpers';

import {Table, Avatar, Tag, Form, Button, Layout, Select, Popover, Modal } from '@douyinfe/semi-ui';
import {ITEMS_PER_PAGE} from '../constants';
import {renderNumber, renderQuota, stringToColor} from '../helpers/render';


const { Header} = Layout;




const colors = ['amber', 'blue', 'cyan', 'green', 'grey', 'indigo',
    'light-blue', 'lime', 'orange', 'pink',
    'purple', 'red', 'teal', 'violet', 'yellow'
]



const LogsTable = () => {

    const columns = [
        {
            title: '时间',
            dataIndex: 'created_data',
            render: (text, record, index) => {
                return (
                    record.type === 0 || record.type === 2 ?
                        <div>
                            {<span> {text} </span>}
                        </div>
                        :
                        <></>
                );
            },
        },
        {
            title: '渠道',
            dataIndex: 'channel',
            className: isAdmin() ? 'tableShow' : 'tableHiddle',
            render: (text, record, index) => {
                return (
                    isAdminUser ?
                        (record.type === 0 || record.type === 2) ?
                            <div>
                                <Tag color={colors[parseInt(text) % colors.length]} size='large' onClick={()=>{
                                    copyText(text); // 假设copyText是用于文本复制的函数
                                }}> {text} </Tag>
                            </div>
                            :
                            <></>
                        :
                        <></>
                );
            },
        },
        {
            title: '用户',
            dataIndex: 'username',
            className: isAdmin() ? 'tableShow' : 'tableHiddle',
            render: (text, record, index) => {
                return (
                    isAdminUser ?
                        <div>
                            <Avatar size="small" color={stringToColor(text)} style={{marginRight: 4}}
                                    onClick={() => showUserInfo(record.user_id)}>
                                {typeof text === 'string' && text.slice(0, 1)}
                            </Avatar>
                            {text}
                        </div>
                        :
                        <></>
                );
            },
        },
        {
            title: '令牌',
            dataIndex: 'token_name',
            render: (text, record, index) => {
                return (
                    record.type === 0 || record.type === 2 ?
                        <div>
                            <Tag color='grey' size='large' onClick={()=>{
                                copyText(text)
                            }}> {text} </Tag>
                        </div>
                        :
                        <></>
                );
            },
        },
        {
            title: '模型',
            dataIndex: 'model_name',
            render: (text, record, index) => {
                return (
                    record.type === 0 || record.type === 2 ?
                        <div>
                            <Tag color={stringToColor(text)} size='large' onClick={()=>{
                                copyText(text)
                            }}> {text} </Tag>
                        </div>
                        :
                        <></>
                );
            },
        },
        {
            title: '提示',
            dataIndex: 'prompt_tokens',
            render: (text, record, index) => {
                return (
                    record.type === 0 || record.type === 2 ?
                        <div>
                            {<span> {text} </span>}
                        </div>
                        :
                        <></>
                );
            },
        },
        {
            title: '补全',
            dataIndex: 'completion_tokens',
            render: (text, record, index) => {
                return (
                    parseInt(text) > 0 && (record.type === 0 || record.type === 2) ?
                        <div>
                            {<span> {text} </span>}
                        </div>
                        :
                        <></>
                );
            },
        },
        {
            title: '消费',
            dataIndex: 'quota',
            render: (text, record, index) => {
                return (
                    record.type === 0 || record.type === 2 ?
                        <div>
                            {
                                renderQuota(text, 4)
                            }
                        </div>
                        :
                        <></>
                );
            }
        },
        {
            title: '请求',
            dataIndex: 'cishu',
            render: (text, record, index) => {
                return (
                    record.type === 0 || record.type === 2 ?
                        <div>
                            {<span> {text} </span>}
                        </div>
                        :
                        <></>
                );
            }
        }

    ];

    const [logs, setLogs] = useState([]);
    const [showStat, setShowStat] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activePage, setActivePage] = useState(1);
    const [logCount, setLogCount] = useState(ITEMS_PER_PAGE);
    const [logType, setLogType] = useState(0);
    const isAdminUser = isAdmin();
    let now = new Date();
    let sevenDaysAgo = new Date(); // 创建一个新的日期对象表示七天前
    sevenDaysAgo.setDate(now.getDate() - 4); // 将这个日期设置为七天前
    const [inputs, setInputs] = useState({
        username: '',
        token_name: '',
        model_name: '',
        start_timestamp: timestamp2string(sevenDaysAgo.getTime() / 1000), // 设定为七天前
        end_timestamp: timestamp2string(now.getTime() / 1000), // 设定为当前时间
        channel: ''
    });
    const {username, token_name, model_name, start_timestamp, end_timestamp, channel} = inputs;

    const [stat, setStat] = useState({
        quota: 0,
        token: 0
    });

    const handleInputChange = (value, name) => {
        setInputs((inputs) => ({...inputs, [name]: value}));
    };

    const getLogSelfStat = async () => {
        let localStartTimestamp = Date.parse(start_timestamp) / 1000;
        let localEndTimestamp = Date.parse(end_timestamp) / 1000;
        let res = await API.get(`/api/log/self/stat?type=${logType}&token_name=${token_name}&model_name=${model_name}&start_timestamp=${localStartTimestamp}&end_timestamp=${localEndTimestamp}`);
        const {success, message, data} = res.data;
        if (success) {
            setStat(data);
        } else {
            showError(message);
        }
    };

    const getLogStat = async () => {
        let localStartTimestamp = Date.parse(start_timestamp) / 1000;
        let localEndTimestamp = Date.parse(end_timestamp) / 1000;
        let res = await API.get(`/api/logall/stat?type=${logType}&username=${username}&token_name=${token_name}&model_name=${model_name}&start_timestamp=${localStartTimestamp}&end_timestamp=${localEndTimestamp}&channel=${channel}`);
        const {success, message, data} = res.data;
        if (success) {
            setStat(data);
        } else {
            showError(message);
        }
    };

    const handleEyeClick = async () => {
        if (!showStat) {
            if (isAdminUser) {
                await getLogStat();
            } else {
                await getLogSelfStat();
            }
        }
        setShowStat(!showStat);
    };

    const showUserInfo = async (userId) => {
        if (!isAdminUser) {
            return;
        }
        const res = await API.get(`/api/user/${userId}`);
        const {success, message, data} = res.data;
        if (success) {
            Modal.info({
                title: '用户信息',
                content: <div style={{padding: 12}}>
                    <p>用户名: {data.username}</p>
                    <p>余额: {renderQuota(data.quota)}</p>
                    <p>已用额度：{renderQuota(data.used_quota)}</p>
                    <p>请求次数：{renderNumber(data.request_count)}</p>
                </div>,
                centered: true,
            })
        } else {
            showError(message);
        }
    };


    const [hasMoreLogs, setHasMoreLogs] = useState(true);
    const loadLogs = async (startIdx) => {
        setLoading(true);


        let url = '';
        let localStartTimestamp = Date.parse(start_timestamp) / 1000;
        let localEndTimestamp = Date.parse(end_timestamp) / 1000;
        if (isAdminUser) {
            url = `/api/logall/?p=${startIdx}&type=${logType}&username=${username}&token_name=${token_name}&model_name=${model_name}&start_timestamp=${localStartTimestamp}&end_timestamp=${localEndTimestamp}&channel=${channel}`;
        }
        try {
            const res = await API.get(url);
            const { success, message, data, total } = res.data;  // 假设API返回了总数
            if (success) {
                if (Array.isArray(data)) {
                    setLogs(data); // 即使data为空数组也进行状态更新
                    setHasMoreLogs(data.length === ITEMS_PER_PAGE);
                    setLogCount(total);

                    if (data.length === 0) {
                        // 显示“没有数据”的提示信息
                        showSuccess('数为据0');
                    }
                } else {
                    // 如果data不是数组，那么可能是API响应格式问题
                    showError('没有更多数据');
                    // 更加具体的错误处理可根据实际情况添加
                }
            } else {
                showError(message);
            }
        } catch (error) {
            showError('无法加载数据，请重试');
        }
        setLoading(false);
    };

    const pageData = logs.slice((activePage - 1) * ITEMS_PER_PAGE, activePage * ITEMS_PER_PAGE);
    const handlePageChange = (page) => {
        setActivePage(page);
        const nextPageFirstIndex = (page - 1) * ITEMS_PER_PAGE;
        if (nextPageFirstIndex >= logs.length && hasMoreLogs) {
            loadLogs(nextPageFirstIndex);
        } else {
            // 如果已知没有更多日志，则直接显示提示信息
            showSuccess('已经是最后一页了');
        }
    };

    useEffect(() => {
        refresh();
    }, [logType]); // 确保logType变化时重新加载日志


    const refresh = async () => {
        // setLoading(true);
        setActivePage(1);
        await loadLogs(0);
    };

    const copyText = async (text) => {
        if (await copy(text)) {
            showSuccess('已复制：' + text);
        } else {
            // setSearchKeyword(text);
            Modal.error({ title: '无法复制到剪贴板，请手动复制', content: text });
        }
    }

    useEffect(() => {
        refresh().then();
    }, [logType]);


    return (
        <>
            <Layout>
                <Header>
                    <h3>使用明细（总消耗额度：
                        {showStat && renderQuota(stat.quota)}
                        {!showStat &&
                            <span onClick={handleEyeClick} style={{cursor: 'pointer', color: 'gray'}}>点击查看</span>}
                        ）
                    </h3>
                </Header>
                <Form layout='horizontal' style={{marginTop: 10}}>
                    <>
                        <Form.Input field="token_name" label='令牌名称' style={{width: 176}} value={token_name}
                                    placeholder={'可选值'} name='token_name'
                                    onChange={value => handleInputChange(value, 'token_name')}/>
                        <Form.Input field="model_name" label='模型名称' style={{width: 176}} value={model_name}
                                    placeholder='可选值'
                                    name='model_name'
                                    onChange={value => handleInputChange(value, 'model_name')}/>
                        <Form.DatePicker field="start_timestamp" label='起始时间' style={{width: 272}}
                                         value={start_timestamp} type='dateTime'
                                         name='start_timestamp'
                                         onChange={value => handleInputChange(value, 'start_timestamp')}/>
                        <Form.DatePicker field="end_timestamp" fluid label='结束时间' style={{width: 272}}
                                         value={end_timestamp} type='dateTime'
                                         name='end_timestamp'
                                         onChange={value => handleInputChange(value, 'end_timestamp')}/>
                        {/*<Form.Button fluid label='操作' width={2} onClick={refresh}>查询</Form.Button>*/}
                        {
                            isAdminUser && <>
                                <Form.Input field="channel" label='渠道 ID' style={{width: 176}} value={channel}
                                            placeholder='可选值' name='channel'
                                            onChange={value => handleInputChange(value, 'channel')}/>
                                <Form.Input field="username" label='用户名称' style={{width: 176}} value={username}
                                            placeholder={'可选值'} name='username'
                                            onChange={value => handleInputChange(value, 'username')}/>
                            </>
                        }
                        <Form.Section>
                            <Button label='查询' type="primary" htmlType="submit" className="btn-margin-right"
                                    onClick={refresh}>查询</Button>
                        </Form.Section>
                    </>
                </Form>
                <Table columns={columns} dataSource={pageData} pagination={{
                    currentPage: activePage,
                    pageSize: ITEMS_PER_PAGE,
                    total: logCount,
                    pageSizeOpts: [10, 20, 50, 100],
                    onPageChange: handlePageChange,
                }} loading={loading}/>
                <Select defaultValue="0" style={{width: 120}} onChange={
                    (value) => {
                        setLogType(parseInt(value));
                    }
                }>
                    <Select.Option value="0">全部</Select.Option>
                    <Select.Option value="1">充值</Select.Option>
                    <Select.Option value="2">消费</Select.Option>
                    <Select.Option value="3">管理</Select.Option>
                    <Select.Option value="4">系统</Select.Option>
                </Select>

            </Layout>
        </>
    );
};

export default LogsTable;

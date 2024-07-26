import React, {useEffect, useState} from 'react';
import {API, copy, isAdmin, showError, showSuccess, timestamp2string} from '../helpers';

import {Table, Avatar, Tag, Form, Button, Layout, Select, Popover, Modal,Space,Tooltip } from '@douyinfe/semi-ui';
import {ITEMS_PER_PAGE} from '../constants';
import {renderNumber, renderQuota, stringToColor} from '../helpers/render';


const { Header} = Layout;


const colors = ['amber', 'blue', 'cyan', 'green', 'grey', 'indigo',
    'light-blue', 'lime', 'orange', 'pink',
    'purple', 'red', 'teal', 'violet', 'yellow'
]

function renderType(type) {
    switch (type) {
        case 1:
            return <Tag color='cyan' size='large'> 充值 </Tag>;
        case 2:
            return <Tag color='lime' size='large'> 消费 </Tag>;
        case 3:
            return <Tag color='orange' size='large'> 管理 </Tag>;
        case 4:
            return <Tag color='purple' size='large'> 系统 </Tag>;
        default:
            return <Tag color='black' size='large'> 未知 </Tag>;
    }
}

function renderIsStream(bool) {
    if (bool) {
        return <Tag color='blue' size='large'>流</Tag>;
    } else {
        return <Tag color='purple' size='large'>非流</Tag>;
    }	
}
		

		
function renderUseTime(type) {
    const time = parseInt(type);
    if (time < 101) {
        return <Tag color='green' size='large'> {time} s </Tag>;
    } else if (time < 300) {
        return <Tag color='orange' size='large'> {time} s </Tag>;
    } else {
        return <Tag color='red' size='large'> {time} s </Tag>;
    }	
}
const LogsTable = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState('');
    const [options, setOptions] = useState({});
    const [LogContentEnabled, setLogContentEnabled] = useState('');

    const getOptions = async () => {
      const res = await API.get('/api/option/');
      const { success, message, data } = res.data;
      if (success) {
        let newOptions = {};
        data.forEach((item) => {
          newOptions[item.key] = item.value;
        });
        setOptions(newOptions); // 设置所有选项的状态
      } else {
        showError(message);
      }
    };
    useEffect(() => {
        getOptions();
    }, []);

    useEffect(() => {
        if (options.LogContentEnabled) { 
           setLogContentEnabled(options.LogContentEnabled);
        }
      }, [options]);

    const columns = [
        {
            title: '时间',
            dataIndex: 'created_at',
            render: (text) => timestamp2string(text),
        },
        
        {
            title: '渠道',
            dataIndex: 'channel',
            className: isAdmin() ? 'tableShow' : 'tableHiddle',
            render: (text, record, index) => {
                let channelName = record.channel_name || '未知渠道名称'; // 若不存在，则默认显示“未知渠道名称”
                return (
                    isAdminUser ?
                        (record.type === 0 || record.type === 2) ?
                            <div>
                                <Tooltip content={channelName} position="top">
                                    <Tag color={colors[parseInt(text) % colors.length]} size='large' onClick={()=>{
                                        copyText(text); 
                                    }}> {text} </Tag>
                                </Tooltip>
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
                            <Tag color='grey' size='large' onClick={() => {
                                copyText(text)
                            }}> {text} </Tag>
                        </div>
                        :
                        <></>
                );
            },
        },
        {
            title: '类型',
            dataIndex: 'type',
            render: (text, record, index) => {
                return (
                    <div>
                        {renderType(text)}
                    </div>
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
                            <Tag color={stringToColor(text)} size='large' onClick={() => {
                                copyText(text)
                            }}> {text} </Tag>
                        </div>
                        :
                        <></>
                );
            },
        },
        {
            title: 'IP',
            dataIndex: 'ip',
            render: (text, record, index) => {
                return (
                    record.type === 0 || record.type === 2 ?
                        <div>
                            <Tag color={stringToColor(text)} size='large' onClick={() => {
                                copyText(text)
                            }}> {text} </Tag>
                        </div>
                        :
                        <></>
                );
            },
        },
        {
            title: '用时',
            dataIndex: 'use_time',
            render: (text, record, index) => {
                return (
                    <div>
                        <Space>
                            {renderUseTime(text)}
                            {renderIsStream(record.is_stream)}
                        </Space>
                    </div>
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
                                renderQuota(text, 6)
                            }
                        </div>
                        :
                        <></>
                );
            }
        },
        {
            title: '倍率',
            dataIndex: 'multiplier',
            render: (text, record, index) => {
                return (
                    text
                );
            },
        },
        {
            title: '重试',
            dataIndex: 'attempts_log',
            render: (text, record, index) => {
                if (!text) {
                    return '无';
                }
                const formattedText = text.replace(/\n/g, '<br/>');
                return (
                    <Tooltip content={<span dangerouslySetInnerHTML={{ __html: formattedText }} />} position="top">
                        <span style={{ cursor: 'pointer' }}>过程</span>
                    </Tooltip>
                );
            },
        },
        
              
        ...(LogContentEnabled === 'true' ? [{
            title: '详情',
            dataIndex: 'content',
            render: (text, record, index) => {
                return (
                    text.length > 10 ?
                        <span 
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                                setModalContent(text);
                                setIsModalOpen(true);
                            }}
                        >
                            {`${text.slice(0, 10)}...`}
                        </span>
                        : <span>{text}</span>
                );
            },
        }] : []),
              
    ];

    const [logs, setLogs] = useState([]);
    const [showStat, setShowStat] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activePage, setActivePage] = useState(1);
    const [logCount, setLogCount] = useState(ITEMS_PER_PAGE);

    const [logType, setLogType] = useState(0);
    const isAdminUser = isAdmin();
    const [pageSize, setPageSize] = useState(parseInt(localStorage.getItem('pageSize') || ITEMS_PER_PAGE));

    const now = new Date();

    // 设置开始时间为今天的0点
    now.setHours(0, 0, 0, 0); 
    const startOfTodayTimestamp = now.getTime() / 1000; 
    const endTimestamp = new Date().getTime() / 1000 + 600; 
    const [inputs, setInputs] = useState({
        username: '',
        token_name: '',
        model_name: '',
        start_timestamp: timestamp2string(startOfTodayTimestamp),  
        end_timestamp: timestamp2string(endTimestamp),
        channel: ''
    });
    const {username, token_name, model_name, start_timestamp, end_timestamp, channel} = inputs;

    const [stat, setStat] = useState({
        quota: 0,
        tpm: 0,
        rpm: 0
    });

    const handleInputChange = (value, name) => {
        setInputs((inputs) => ({...inputs, [name]: value}));
    };

    const getLogStat = async () => {
        let localStartTimestamp = Date.parse(start_timestamp) / 1000;
        let localEndTimestamp = Date.parse(end_timestamp) / 1000;
        let res = await API.get(`/api/log/stat?type=${logType}&username=${username}&token_name=${token_name}&model_name=${model_name}&start_timestamp=${localStartTimestamp}&end_timestamp=${localEndTimestamp}&channel=${channel}`);
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
                    <p>分组: {data.group}</p>
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

    
    
    const loadLogs = async (pageIndex) => {
        setLoading(true);
        const localStartTimestamp = Date.parse(start_timestamp) / 1000;
        const localEndTimestamp = Date.parse(end_timestamp) / 1000;
        const url = `/api/log/?p=${pageIndex}&type=${logType}&username=${username}&token_name=${token_name}&model_name=${model_name}&start_timestamp=${localStartTimestamp}&end_timestamp=${localEndTimestamp}&channel=${channel}&pageSize=${pageSize}`;
        try {
            const res = await API.get(url);
            const { success, data, total } = res.data;
            if (success) {
                setLogs(data);
                setLogCount(total);
            } else {
                showError(res.data.message);
            }
        } catch (error) {
            showError('加载数据失败');
        }
        setLoading(false);
    };
    

        
    const handlePageChange = (newActivePage) => {
        setActivePage(newActivePage);
    };
    
    const handlePageSizeChange = async (size) => {
        setPageSize(size); // 更新 pageSize 状态
        localStorage.setItem('pageSize', size.toString()); // 将新的 pageSize 存储到 localStorage
        setActivePage(1); // 重置到第一页
        await loadLogs(0); // 重新加载日志
    };
    

    useEffect(() => {
        // 这里假设后端分页是从 0 开始，所以传递 activePage - 1
        loadLogs(activePage - 1);
    }, [activePage]);

    const refresh = async () => {
        // setLoading(true);
        setActivePage(1);
        await loadLogs(0);
        await handleEyeClick(0);
    };

    const copyText = async (text) => {
        if (await copy(text)) {
            showSuccess('已复制：' + text);
        } else {
            // setSearchKeyword(text);
            Modal.error({title: '无法复制到剪贴板，请手动复制', content: text});
        }
    }

    useEffect(() => {
        refresh().then();
        getOptions();
        
    }, [logType,pageSize]);

    useEffect(() => {
        const savedPageSize = localStorage.getItem('pageSize');
        if (savedPageSize) {
            setPageSize(parseInt(savedPageSize, 10)); 
        }
        
    }, []);
    
    
 
    return (
        <>
            <Layout>
                <Header>
                <h3 style={{
                    color: '#333', 
                    fontSize: '1.2rem', 
                    marginTop: '50px', 
                    marginBottom: '10px',
                    backgroundColor: '#f8f8f8', 
                    padding: '10px',
                    borderRadius: '5px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    使用明细（总消耗额度：<span style={{ color: '#5ca941' }}>{renderQuota(stat.quota)}</span>,
                    RPM: <span style={{ color: '#ff5722' }}>{stat.rpm}</span>,
                    TPM: <span style={{ color: '#2196f3' }}>{stat.tpm}</span>）
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
                                         initValue={start_timestamp}
                                         value={start_timestamp} type='dateTime'
                                         name='start_timestamp'
                                         onChange={value => handleInputChange(value, 'start_timestamp')}/>
                        <Form.DatePicker field="end_timestamp" fluid label='结束时间' style={{width: 272}}
                                         initValue={end_timestamp}
                                         value={end_timestamp} type='dateTime'
                                         name='end_timestamp'
                                         onChange={value => handleInputChange(value, 'end_timestamp')}/>
                        <Form.Input field="channel" label='渠道 ID' style={{width: 176}} value={channel}
                                            placeholder='可选值' name='channel'
                                            onChange={value => handleInputChange(value, 'channel')}/>
                        <Form.Input field="username" label='用户名称' style={{width: 176}} value={username}
                                    placeholder={'可选值'} name='username'
                                    onChange={value => handleInputChange(value, 'username')}/>
                        <Form.Section>
                            <Button label='查询' type="primary" htmlType="submit" className="btn-margin-right"
                                    onClick={refresh}>查询</Button>
                        </Form.Section>
                    </>
                </Form>
                <Table
                    columns={columns}
                    dataSource={logs}
                    loading={loading}
                    pagination={{
                        currentPage: activePage,
                        pageSize: pageSize,
                        total: logCount,
                        pageSizeOpts: [10, 20, 50, 100],
                        showSizeChanger: true,
                        onPageSizeChange: (size) => {
                            handlePageSizeChange(size).then()
                        },
                        onPageChange: handlePageChange,
                    }}
                />

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
                    <Select.Option value="5">重试</Select.Option>
                </Select>
                <Modal
                    visible={isModalOpen}
                    onOk={() => setIsModalOpen(false)}
                    onCancel={() => setIsModalOpen(false)}
                    closable={null}
                    bodyStyle={{ height: '400px', overflow: 'auto' }} // 设置模态框内容区域样式
                    width={800} // 设置模态框宽度
                >
                    <p style={{ whiteSpace: 'pre-line' }}>{modalContent}</p>
                </Modal>
            </Layout>
        </>
    );
};

export default LogsTable;

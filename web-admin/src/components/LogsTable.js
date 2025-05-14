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
        case 5:
            return <Tag color='red' size='large'> 失败 </Tag>;
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
                let channelName = record.channel_name || '未知渠道名称'; // 若不存在，则默认显示"未知渠道名称"
                return (
                    isAdminUser ?
                        (record.type === 0 || record.type === 2 || record.type === 5) ?
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
                    record.type === 0 || record.type === 2 || record.type === 5?
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
                    record.type === 0 || record.type === 2 || record.type === 5?
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
                    record.type === 0 || record.type === 2 || record.type === 5?
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
                if (!text) return '-';
                
                try {
                    // 检查是否为图像相关模型
                    const isImageModel = record.model_name && 
                        (record.model_name.includes('gpt-image') );
                         
                    // 检查文本是否包含图像生成特征
                    const hasImageText = typeof text === 'string' && 
                        (text.includes('imageToken') || 
                         text.includes('图像输出') || 
                         text.includes('image_output') ||
                         text.match(/\d+x\d+/));
                         
                    // 判断是否为图像生成记录
                    if (isImageModel || hasImageText) {
                        // 提取图像尺寸信息
                        let sizeInfo = '';
                        if (typeof text === 'string') {
                            const sizeMatch = text.match(/(\d+)x(\d+)/);
                            if (sizeMatch) {
                                sizeInfo = sizeMatch[0];
                            }
                        }
                        
                        const displayText = sizeInfo ? 
                            `图像生成(${sizeInfo})` : 
                            `图像生成`;
                            
                        return (
                            <Popover
                                content={
                                    <pre style={{ 
                                        margin: 0, 
                                        whiteSpace: 'pre-line', 
                                        maxWidth: '450px',
                                        maxHeight: '300px',
                                        overflow: 'auto'
                                    }}>
                                        {text}
                                    </pre>
                                }
                                trigger="click"
                                position="bottom"
                            >
                                <span style={{ cursor: 'pointer' }}>
                                    {displayText} <span style={{ color: '#1890ff' }}>(点击详情)</span>
                                </span>
                            </Popover>
                        );
                    }
                    
                    // 常规模型处理部分保持不变
                    const multiplierObj = typeof text === 'string' ? JSON.parse(text) : text;

                    // 格式化显示内容，包含倍率和消耗信息
                    const formattedContent = [
                        // 倍率信息
                        `模型倍率: ${multiplierObj.model_ratio || 0}`,
                        `分组倍率: ${multiplierObj.group_ratio || 0}`,
                        `补全倍率: ${multiplierObj.completion_ratio || 0}`,
                        multiplierObj.audio_ratio ? `音频倍率: ${multiplierObj.audio_ratio}` : null,
                        multiplierObj.audio_completion_ratio ? `音频补全倍率: ${multiplierObj.audio_completion_ratio}` : null,
                        // 分隔线
                        '------------------------',
                        // 消耗信息
                        multiplierObj.text_input ? `文本输入消耗: ${multiplierObj.text_input}` : null,
                        multiplierObj.text_output ? `文本输出消耗: ${multiplierObj.text_output}` : null,
                        multiplierObj.audio_input ? `音频输入消耗: ${multiplierObj.audio_input}` : null,
                        multiplierObj.audio_output ? `音频输出消耗: ${multiplierObj.audio_output}` : null,
                                               // WebSocket标记
                        multiplierObj.ws ? `WebSocket: 是` : null
                    ].filter(Boolean).join('\n');

                    return (
                        <Popover
                            content={<pre style={{ margin: 0, whiteSpace: 'pre-line' }}>{formattedContent}</pre>}
                            trigger="click"
                        >
                            <span style={{ cursor: 'pointer' }}>
                                {`模型倍率: ${multiplierObj.model_ratio || 0}倍`} <span style={{ color: '#1890ff' }}>(点击展开)</span>
                            </span>
                        </Popover>
                    );
                } catch (e) {
                    // 如果解析JSON失败，直接显示原始文本
                    if (typeof text === 'string' && text.length > 50) {
                        return (
                            <Popover
                                content={<pre style={{ margin: 0, whiteSpace: 'pre-line' }}>{text}</pre>}
                                trigger="click"
                            >
                                <span style={{ cursor: 'pointer' }}>
                                    {`${text.substring(0, 50)}...`} <span style={{ color: '#1890ff' }}>(点击查看)</span>
                                </span>
                            </Popover>
                        );
                    } else {
                        return <span>{text}</span>;
                    }
                }
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
                    marginBottom: '5px',
                    padding: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <span>使用明细</span>
                    <div style={{ 
                        display: 'flex', 
                        gap: '20px' 
                    }}>
                        <div style={{ 
                            padding: '5px 12px',
                            backgroundColor: '#f1f8ef',
                            borderRadius: '4px',
                            border: '1px solid #e8f5e3'
                        }}>
                            总消耗额度：<span style={{ color: '#5ca941' }}>{renderQuota(stat.quota)}</span>
                        </div>
                        <div style={{ 
                            padding: '5px 12px',
                            backgroundColor: '#fff4f1',
                            borderRadius: '4px',
                            border: '1px solid #ffe4de'
                        }}>
                            RPM：<span style={{ color: '#ff5722' }}>{stat.rpm}</span>
                        </div>
                        <div style={{ 
                            padding: '5px 12px',
                            backgroundColor: '#f1f8ff',
                            borderRadius: '4px',
                            border: '1px solid #e3f2fd'
                        }}>
                            TPM：<span style={{ color: '#2196f3' }}>{stat.tpm}</span>
                        </div>
                    </div>
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
                    <Select.Option value="5">失败</Select.Option>
                    <Select.Option value="6">重试</Select.Option>
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

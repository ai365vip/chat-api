import React, {useEffect, useState, useRef, useCallback} from 'react';
import { Popup} from 'semantic-ui-react';

import {Link} from 'react-router-dom';
import {
    API,
    isMobile,
    showError,
    showInfo,
    showWarning,
    showSuccess,
} from '../helpers';
import {IconTreeTriangleDown,IconTreeTriangleRight} from "@douyinfe/semi-icons";
import {CHANNEL_OPTIONS, ITEMS_PER_PAGE} from '../constants';
import {renderGroup, renderNumberWithPoint, renderQuota} from '../helpers/render';
import {
    Tag,
    Table,
    Button,
    Form,
    Modal,
    Popconfirm,
    Space,
    Tooltip,
    Switch,
    Typography, 
    InputNumber,
    Select,
    Dropdown, SplitButtonGroup,Input
} from "@douyinfe/semi-ui";
import EditChannel from "../pages/Channel/EditChannel";
import BatchEditChannels from "../pages/Channel/BatchEditChannels";

let type2label = undefined;


function renderType(type, models, rowIndex) {
    if (!type2label) {
        type2label = new Map();
        for (let i = 0; i < CHANNEL_OPTIONS.length; i++) {
            type2label[CHANNEL_OPTIONS[i].value] = CHANNEL_OPTIONS[i];
        }
        type2label[0] = { value: 0, text: '未知类型', color: 'grey' };
    }

    const modelsArray = models.split(',');
    const tooltipContent = (
        <div style={{ 
            maxHeight: '600px',  // 设置最大高度
            overflowY: 'auto',   // 添加垂直滚动条
            padding: '4px',      // 添加内边距
            // 自定义滚动条样式
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': {
                width: '6px'
            },
            '&::-webkit-scrollbar-thumb': {
                background: 'var(--semi-color-fill-2)',
                borderRadius: '3px'
            }
        }}>
            <strong>模型:</strong>
            {modelsArray.map((model, index) => (
                <div key={index} style={{ 
                    padding: '3px 0',
                    whiteSpace: 'nowrap'  // 防止文本换行
                }}>
                    {model.trim()}
                </div> 
            ))}
        </div>
    );

    return (
        <TooltipWrapper content={tooltipContent}>
            <Tag size='large' color={type2label[type]?.color}>
                {type2label[type]?.text}
            </Tag>
        </TooltipWrapper>
    );
}

// 新增一个 TooltipWrapper 组件来处理动态位置
const TooltipWrapper = ({ content, children }) => {
    const [position, setPosition] = useState('top');
    const elementRef = useRef(null);

    const updatePosition = useCallback(() => {
        if (elementRef.current) {
            const rect = elementRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const elementTop = rect.top;
            const threshold = viewportHeight * 0.3; // 设置阈值为视窗高度的 30%

            // 如果元素距离顶部的距离小于阈值，则向下展示
            setPosition(elementTop < threshold ? 'bottom' : 'top');
        }
    }, []);

    useEffect(() => {
        updatePosition();
        // 监听滚动和窗口大小变化
        window.addEventListener('scroll', updatePosition);
        window.addEventListener('resize', updatePosition);

        return () => {
            window.removeEventListener('scroll', updatePosition);
            window.removeEventListener('resize', updatePosition);
        };
    }, [updatePosition]);

    return (
        <span ref={elementRef}>
            <Tooltip 
                content={content}
                position={position}
                autoAdjustOverflow={true}
            >
                {children}
            </Tooltip>
        </span>
    );
};




const ChannelsTable = () => {
  
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            render: (text, record) => record.isTag ? (
                <Space>
                    <Tag color="blue">{record.name}</Tag>
                    {record.children?.length > 0 && (
                        <Typography.Text>
                            {record.children.filter(ch => ch.status === 1).length > 0 && (
                                <span style={{ color: 'var(--semi-color-success)' }}>
                                    启{record.children.filter(ch => ch.status === 1).length}
                                </span>
                            )}
                            {record.children.filter(ch => ch.status !== 1).length > 0 && (
                                <span style={{ color: 'var(--semi-color-danger)' }}>
                                    禁{record.children.filter(ch => ch.status !== 1).length}
                                </span>
                            )}
                        </Typography.Text>
                    )}
                </Space>
            ) : text
        },
        {
            title: '名称',
            dataIndex: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name), 
        },
        {
            title: '状态',
            dataIndex: 'status',
            sorter: (a, b) => a.status - b.status,
            render: (text, record, index) => {
                if (record.isTag) {
                    return (
                        <Space>
                            <Button
                                theme="light"
                                type="primary"
                                onClick={() => handleTagStatusChange(record, true)}
                            >
                                启用
                            </Button>
                            <Button
                                theme="light"
                                type="secondary"
                                onClick={() => handleTagStatusChange(record, false)}
                            >
                                禁用
                            </Button>
                        </Space>
                    );
                }

                const isOn = record.status === 1;
                const statusText = isOn ? '已启用' : (record.status === 3 ? '程序自动禁用' : '手动禁用');
        
                return (
                    <Tooltip content={statusText} position="top">
                        <Switch
                            checked={isOn}
                            checkedText="开" 
                            uncheckedText="关" 
                            onChange={(checked) => {
                                if (checked) {
                                    manageChannel(record.id, 'enable', record);
                                } else if (!checked && isOn) {
                                    manageChannel(record.id, 'disable', record);
                                }
                            }}
                        />
                    </Tooltip>
                );
            },
        },
        {
            title: '分组',
            dataIndex: 'group',
            render: (text, record, index) => {
                const groups = text.split(',').map((item) => item.trim()).sort();
                if (groups.length > 3) {
                    const tooltipContent = (
                        <div>
                            {groups.slice(2).map((group, idx) => (
                                <p key={idx} style={{ margin: '5px 0' }}>{group}</p>
                            ))}
                        </div>
                    );
                    return (
                        <Space spacing={2}>
                            {groups.slice(0, 2).map((group) => (
                                renderGroup(group)
                            ))}
                            <Tooltip content={tooltipContent} position="top">
                                <Tag size='large'>更多...</Tag>
                            </Tooltip>
                        </Space>
                    );
                } else {
                    return (
                        <Space spacing={2}>
                            {groups.map(group => renderGroup(group))}
                        </Space>
                    );
                }
            },
        },
        {
            title: '类型',
            dataIndex: 'type',
            sorter: (a, b) => a.type - b.type,
            render: (text, record, index) => {
                if (record.isTag) {
                    const uniqueTypes = [...new Set(record.children.map(ch => ch.type))];
                    
                    if (uniqueTypes.length > 3) {
                        const tooltipContent = (
                            <div>
                                {uniqueTypes.slice(3).map(type => {
                                    const typeOption = CHANNEL_OPTIONS.find(opt => opt.value === type) || { text: '未知类型' };
                                    return (
                                        <div key={type} style={{ padding: '3px 0' }}>
                                            {typeOption.text}
                                        </div>
                                    );
                                })}
                            </div>
                        );

                        return (
                            <Space spacing={2} wrap>
                                {uniqueTypes.slice(0, 3).map(type => (
                                    renderType(type, record.children.find(ch => ch.type === type).models, index)
                                ))}
                                <Tooltip content={tooltipContent} position="top">
                                    <Tag size='large'>更多...</Tag>
                                </Tooltip>
                            </Space>
                        );
                    } else {
                        return (
                            <Space spacing={2} wrap>
                                {uniqueTypes.map(type => 
                                    renderType(type, record.children.find(ch => ch.type === type).models, index)
                                )}
                            </Space>
                        );
                    }
                }

                return renderType(text, record.models, index);
            },
        },
             
        {
            title: '响应时间',
            dataIndex: 'response_time',
            sorter: (a, b) => a.response_time - b.response_time,
            render: (text, record, index) => {
                if (record.isTag) {
                    return null;
                }

                return renderResponseTime(text, record);
            },
        },
        {
            title: '已用/剩余/次数',
            dataIndex: 'expired_time',
            sorter: (a, b) => a.used_quota - b.used_quota,
            render: (text, record, index) => {
                return (
                    <div>
                        <Space spacing={1}>
                            <Tooltip content={'已用额度'}>
                                <Tag color='white' type='ghost' size='large'>{renderQuota(record.used_quota)}</Tag>
                            </Tooltip>
                            <Tooltip content={'剩余额度' + record.balance + '，点击更新'}>
                                <Tag color='white' type='ghost' size='large' onClick={() => {updateChannelBalance(record)}}>${renderNumberWithPoint(record.balance)}</Tag>
                            </Tooltip>
                            <Tooltip content={'调用次数'}>
                                <Tag color='white' type='ghost' size='large' >{record.used_count}</Tag>
                            </Tooltip>
                        </Space>
                    </div>
                );
            },
        },
        {
            title: '优先级',
            dataIndex: 'priority',
            sorter: (a, b) => a.priority - b.priority,
            render: (text, record, index) => {
                return (
                    <div>
                        <InputNumber
                            style={{width: 70}}
                            name='priority'
                            onChange={value => {
                                if (record.isTag) {
                                    handleTagPriorityChange(record, value);
                                } else {
                                    manageChannel(record.id, 'priority', record, value);
                                }
                            }}
                            defaultValue={record.priority}
                            min={-999}
                        />
                    </div>
                );
            },
        },
        {
            title: '权重',
            dataIndex: 'weight',
            render: (text, record, index) => {
                return (
                    <div>
                        <InputNumber
                            style={{width: 70}}
                            name='weight'
                            onChange={value => {
                                if (record.isTag) {
                                    handleTagWeightChange(record, value);
                                } else {
                                    manageChannel(record.id, 'weight', record, value);
                                }
                            }}
                            defaultValue={record.weight}
                            min={0}
                        />
                    </div>
                );
            },
        },
        {
            title: (
                <Tooltip content="自动禁用的通道间隔重启时间">
                    <span>重启(秒)</span>
                </Tooltip>
            ),
            dataIndex: 'tested_time',
            render: (text, record, index) => {
                const handleChange = (value) => {
                    if (value === '') return;
                    if (record.isTag) {
                        handleTagTestedTimeChange(record, value);
                    } else {
                        manageChannel(record.id, 'tested_time', record, value);
                    }
                };

                return (
                    <InputNumber
                        style={{width: 70}}
                        name='tested_time'
                        onChange={(value) => {
                            // 这里不立即提交，只在回车时提交
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                const value = e.target.value;
                                handleChange(value);
                            }
                        }}
                        onBlur={(e) => {
                            // 失去焦点时也提交
                            const value = e.target.value;
                            handleChange(value);
                        }}
                        defaultValue={record.tested_time}
                        min={0}
                    />
                );
            },
        },
        {
            title: '',
            dataIndex: 'operate',
            render: (text, record, index) => {
                if (record.isTag) {
                    return (
                        <Space>
                            <Button
                                theme="light"
                                onClick={() => {
                                    if (!record.children || record.children.length === 0) {
                                        showError('该标签下没有可测试的渠道');
                                        return;
                                    }
                                    const enabledChannels = record.children.filter(ch => ch.status === 1);
                                    if (enabledChannels.length === 0) {
                                        showWarning('该标签下没有已启用的渠道');
                                        return;
                                    }
                                    Modal.confirm({
                                        title: '确认测试',
                                        content: `将测试标签"${record.name}"下的 ${enabledChannels.length} 个已启用渠道，是否继续？`,
                                        onOk: () => {
                                            // 立即开始测试，不等待结果
                                            testChannels(record);
                                            showInfo('已开始测试，请等待测试完成');
                                        }
                                    });
                                }}
                            >
                                测试
                            </Button>
                           
                            <Popconfirm
                                title={`确定要删除标签 "${record.name}" 下的所有通道吗？`}
                                content="此操作不可撤销"
                                position="left"
                                onConfirm={() => handleTagDelete(record)}
                            >
                                <Button theme="light" type="danger">删除</Button>
                            </Popconfirm>
                            <Button
                                theme="light"
                                type="primary"
                                onClick={() => {
                                    setSelectedChannels(new Set(record.children.map(c => c.id)));
                                    setShowBatchEdit(true);
                                }}
                            >
                                编辑
                            </Button>
                        </Space>
                    );
                }
                
                // 普通渠道的操作按钮保持不变
                return (
                    <div>
                        <SplitButtonGroup style={{marginRight: 1}} aria-label="测试操作">
                            <Button theme="light" onClick={()=>{testChannel(record, '')}}>测试</Button>
                            <Dropdown
                                trigger="click"
                                position="bottomRight"
                                render={
                                    <Dropdown.Menu style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        {record.test_models.map((model, index) => (
                                            <Dropdown.Item
                                                key={index}
                                                onClick={() => testChannel({ ...record }, model.name)}
                                            >
                                                {model.name}
                                            </Dropdown.Item>
                                        ))}
                                    </Dropdown.Menu>
                                }
                            >
                                <Button style={{ padding: '8px 4px' }} type="primary" icon={<IconTreeTriangleDown />}></Button>
                            </Dropdown>
                        </SplitButtonGroup>

                        <Popconfirm
                            title="确定是否要删除此渠道？"
                            content="此修改将不可逆"
                            okType={'danger'}
                            position={'left'}
                            onConfirm={() => {
                                manageChannel(record.id, 'delete', record).then(
                                    () => {
                                        removeRecord(record.id);
                                    }
                                )
                            }}
                        >
                            <Button theme='light' type='danger' style={{marginRight: 1}}>删除</Button>
                        </Popconfirm>

                        <Button theme='light' type='tertiary' style={{marginRight: 1}} onClick={
                            () => {
                                setEditingChannel(record);
                                setShowEdit(true);
                            }
                        }>编辑</Button>
                    </div>
                );
            }
        },
    ];

    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activePage, setActivePage] = useState(1);
    const [idSort, setIdSort] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchGroup, setSearchGroup] = useState('');
    const [searching, setSearching] = useState(false);
    const [updatingBalance, setUpdatingBalance] = useState(false);
     // State 初始化时直接从 localStorage 读取 pageSize
     const [pageSize, setPageSize] = useState(() => {
        const savedPageSize = window.localStorage.getItem('pageSize');
        return savedPageSize ? Number(savedPageSize) : ITEMS_PER_PAGE; // 默认值作回退
    });
    const [channelCount, setChannelCount] = useState(pageSize);
    const [groupOptions, setGroupOptions] = useState([]);
    const [showEdit, setShowEdit] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);
    const [selectedChannels, setSelectedChannels] = useState(new Set());
    const [gptVersion, setGptVersion] = useState('gpt-3.5-turbo');
    const [searchTypeKey, setSearchTypeKey] = useState('');
    const [searchModel, setSearchModel] = useState('');

    const [editingChannel, setEditingChannel] = useState({
        id: undefined,
    });
    const [showBatchEdit, setShowBatchEdit] = useState(false);


    const sharedColumns = React.useMemo(() => columns, []);
    const processChannelGroups = (channelsData) => {
        const grouped = {
            tagged: {},
            untagged: []
        };
    
        channelsData.forEach(channel => {
            const tag = channel.tags ? channel.tags.trim() : '';
    
            if (tag) {
                if (!grouped.tagged[tag]) {
                    grouped.tagged[tag] = [];
                }
                grouped.tagged[tag].push({
                    ...channel,
                    key: String(channel.id)
                });
            } else {
                grouped.untagged.push({
                    ...channel,
                    key: String(channel.id)
                });
            }
        });
    
        const taggedChannels = Object.entries(grouped.tagged).map(([tag, channels]) => {
            const totalUsedQuota = channels.reduce((sum, ch) => sum + (ch.used_quota || 0), 0);
            const totalUsedCount = channels.reduce((sum, ch) => sum + (ch.used_count || 0), 0);
            const totalBalance = channels.reduce((sum, ch) => sum + (ch.balance || 0), 0);
            const baseChannel = channels[0];

            return {
                ...baseChannel,
                id: `tag_${tag}`,
                name: tag,
                isTag: true,
                status: channels.every(ch => ch.status === 1) ? 1 : 2,
                group: baseChannel.group,
                type: baseChannel.type,
                models: baseChannel.models,
                used_quota: totalUsedQuota,
                used_count: totalUsedCount,
                balance: totalBalance,
                response_time: 0,
                priority: baseChannel.priority,
                weight: baseChannel.weight,
                tested_time: baseChannel.tested_time,
                children: channels,
                key: `tag_${tag}`,
                test_models: baseChannel.test_models
            };
        });
    
        setChannels([...taggedChannels, ...grouped.untagged]);
    };

    
    const onGptVersionChange = (value) => {
        setGptVersion(value); // 直接使用传入的 value 更新状态
    };

    const removeRecord = id => {
        let newDataSource = [...channels];
        if (id != null) {
            let idx = newDataSource.findIndex(data => data.id === id);

            if (idx > -1) {
                newDataSource.splice(idx, 1);
                setChannels(newDataSource);
            }
        }
    };



    const setChannelFormat = (channelsData) => {
        const newChannels = channelsData.map((channel, i) => ({
            ...channel,
            key: String(channel.id),
            test_models: channel.models.split(',').map(model => ({
                node: 'item',
                name: model.trim(),
                onClick: () => testChannel({ ...channel }, model.trim())
            }))
        }));

        setChannels(newChannels);
        processChannelGroups(newChannels);
        setChannelCount(newChannels.length >= pageSize ? newChannels.length + pageSize : newChannels.length);
    };



    // 5. 添加批量测试函数
    const testChannels = async (record) => {
        let successCount = 0;
        const enabledChannels = record.children.filter(ch => ch.status === 1);
        
        // 使用 Promise.all 并行执行所有测试
        Promise.all(enabledChannels.map(channel => 
            testChannel(channel, '')
                .then(() => successCount++)
                .catch(() => {/* 错误已在 testChannel 中处理 */})
        )).then(() => {
            showSuccess(`测试完成：${successCount}/${enabledChannels.length} 个通道测试成功`);
            refresh();
        });
    };
    
    
    
    const loadChannels = async (startIdx, pageSize) => {
        setLoading(true);
        try {
            const res = await API.get(`/api/channel/?p=${startIdx}&page_size=${pageSize}`);
            const {success, message, data, total} = res.data;
            if (success) {
                setChannelFormat(data);
                // 使用后端返回的未标签渠道总数
                setChannelCount(total);
            } else {
                showError(message);
            }
        } catch (error) {
            showError(error.message);
        }
        setLoading(false);
    };

    const refresh = async () => {
        await loadChannels(activePage - 1, pageSize);
    };

    useEffect(() => {
        loadChannels(0, pageSize)
            .then()
            .catch((reason) => {
                showError(reason);
            });
        fetchGroups().then();
    }, [pageSize]);
   

    const manageChannel = async (id, action, record, value) => {
        let data = {id};
        let res;
        try {
            switch (action) {
                case 'delete':
                    res = await API.delete(`/api/channel/${id}/`);
                    if (res.data.success) {
                        // 删除操作直接从列表中移除该渠道
                        setChannels(prevChannels => {
                            const newChannels = prevChannels.filter(ch => {
                                if (ch.isTag && ch.children) {
                                    ch.children = ch.children.filter(child => child.id !== id);
                                    return ch.children.length > 0; // 如果标签组没有子渠道了,也移除该标签组
                                }
                                return ch.id !== id;
                            });
                            return newChannels;
                        });
                    }
                    break;
                case 'enable':
                    data.status = 1;
                    res = await API.put('/api/channel/', data);
                    break;
                case 'disable':
                    data.status = 2;
                    res = await API.put('/api/channel/', data);
                    break;
                case 'priority':
                    if (value === '') return;
                    data.priority = parseInt(value);
                    res = await API.put('/api/channel/', data);
                    break;
                case 'tested_time':
                    if (value === '') return;
                    data.tested_time = parseInt(value);
                    res = await API.put('/api/channel/', data);
                    break;
                case 'weight':
                    if (value === '') return;
                    data.weight = parseInt(value);
                    if (data.weight < 0) {
                        data.weight = 0;
                    }
                    res = await API.put('/api/channel/', data);
                    break;
            }
            
            const {success, message} = res.data;
            if (success) {
                showSuccess('操作成功完成！');
                if (action !== 'delete') {
                    // 非删除操作更新渠道信息
                    const updatedChannel = res.data.data;
                    setChannels(prevChannels => prevChannels.map(channel => {
                        if (channel.isTag && channel.children) {
                            return {
                                ...channel,
                                children: channel.children.map(child => 
                                    child.id === id ? { ...child, ...updatedChannel } : child
                                )
                            };
                        }
                        return channel.id === id ? { ...channel, ...updatedChannel } : channel;
                    }));
                }
            } else {
                showError(message);
            }
        } catch (error) {
            showError(error.message);
        }
    };

    

    function renderResponseTime(responseTime, record) {
        let time = responseTime / 1000;
        time = time.toFixed(2) + ' 秒';
        let color = 'grey';
        if (responseTime > 0) {
            if (responseTime <= 1000) {
                color = 'green';
            } else if (responseTime <= 3000) {
                color = 'lime';
            } else if (responseTime <= 5000) {
                color = 'yellow';
            } else {
                color = 'red';
            }
        }
        return (
            <div onClick={() => testChannel(record, '')} style={{ cursor: 'pointer' }}>
                <Tag size="large" color={color}>{time}</Tag>
            </div>
        );
    }

    const searchChannels = async (searchKeyword, searchGroup,searchTypeKey,searchModel) => {
        setSearching(true);
    
        let queryParameters = '';
        if (searchKeyword || searchGroup || searchTypeKey|| searchModel ) {
            setIsFiltering(true);
            queryParameters += `?keyword=${encodeURIComponent(searchKeyword)}`;
            if (searchGroup) {
                queryParameters += `&group=${encodeURIComponent(searchGroup)}`;
            }
            if (searchTypeKey) {
                queryParameters += `&typeKey=${encodeURIComponent(searchTypeKey)}`;
            }
            if (searchModel) {
                queryParameters += `&model=${encodeURIComponent(searchModel)}`;
            }
        } else {
            setIsFiltering(false); // 没有筛选条件，不处于筛选模式
        }
    
        const res = await API.get(`/api/channel/search${queryParameters}`);
        const {success, message, data} = res.data;
    
        if (success) {
            setChannelFormat(data); // 设置渠道列表
            if (!isFiltering) {
                setChannelCount(data.length); // 更新总数以反映筛选后的结果
            }
            setSelectedChannels(new Set()); // 清空之前的选择
        } else {
            showError(message);
        }
    
        setSearching(false);
    };

    
    
    const testChannel = async (record, model) => {
        try {
            const res = await API.get(`/api/channel/test/${record.id}?model=${model}`);
            const { success, message, time } = res.data;
    
            if (success) {
                // 只更新当前测试的渠道信息
                setChannels(prevChannels => prevChannels.map(channel => {
                    if (channel.isTag && channel.children) {
                        // 如果是标签组,更新其子渠道
                        return {
                            ...channel,
                            children: channel.children.map(child => 
                                child.id === record.id 
                                    ? { ...child, response_time: time * 1000, test_time: Date.now() / 1000 }
                                    : child
                            )
                        };
                    }
                    // 更新普通渠道
                    return channel.id === record.id 
                        ? { ...channel, response_time: time * 1000, test_time: Date.now() / 1000 }
                        : channel;
                }));
                showInfo(`通道 ${record.id} ${record.name}，${model} 测试成功，耗时 ${time.toFixed(2)} 秒。`);
            } else {
                if (message.includes('模型可用，但有警告')) {
                    showWarning(`通道 ${record.id} ${record.name}，${model} 测试结果：${message}`);
                } else {
                    showError(`通道 ${record.id} ${record.name}，${model} 测试失败：${message}`);
                }
            }
        } catch (error) {
            showError(`通道 ${record.id} ${record.name}，${model} 测试失败：${error.message}`);
        }
    };
    

    

    const testAllChannels = async () => {
        const res = await API.get(`/api/channel/test`);
        const {success, message} = res.data;
        if (success) {
            showInfo('已成功开始测试所有已启用通道，请刷新页面查看结果。');
        } else {
            showError(message);
        }
    };

    const deleteAllDisabledChannels = async () => {
        const res = await API.delete(`/api/channel/disabled`);
        const {success, message, data} = res.data;
        if (success) {
            showSuccess(`已删除所有禁用渠道，共计 ${data} 个`);
        } else {
            showError(message);
        }
    };

    
    // 使用异步函数删除选中的渠道
    const deleteSelectedChannels = async () => {
        if (selectedChannels.size === 0) {
            showError("没有选中的渠道");
            return;
        }
    
        Modal.confirm({
            title: '确认删除',
            content: '确定删除所选渠道吗？此操作无法撤销。',
            onOk: async () => {
                const promises = Array.from(selectedChannels).map(channelId =>
                    API.delete(`/api/channel/${channelId}/`).catch(e => ({e, channelId}))
                );
                const results = await Promise.all(promises);
    
                const failedDeletions = results.filter(result => result.e);
                failedDeletions.forEach(({channelId}) => {
                    showError(`通道ID: ${channelId} 删除失败。`);
                });
    
                if (failedDeletions.length < selectedChannels.size) {
                    showSuccess(`成功删除了 ${selectedChannels.size - failedDeletions.length} 个通道。`);
                    refresh()
                }
                setSelectedChannels(new Set());
            },
        });
    };
  

    const copySelectedChannel = async () => {
        if (selectedChannels.size !== 1) {
            showError("请选择一个渠道进行复制"); // 确保只选择了一个渠道
            return;
        }
        const channelId = Array.from(selectedChannels)[0];
        const channelToCopy = channels.find(channel => String(channel.id) === String(channelId));
        if (!channelToCopy) {
            showError("选中的渠道未找到，请刷新页面后重试。");
            return;
        }

        try {
            const newChannel = {...channelToCopy, id: undefined,key: undefined,balance: undefined,used_quota: undefined,used_count: undefined}; // 示例：清除id以创建一个新渠道
            // 发送复制请求到后端API
            const response = await API.post('/api/channel/', newChannel);
            if (response.data.success) {
                showSuccess("渠道复制成功");
                // 刷新列表来显示新的渠道
                refresh();
            } else {
                showError(response.data.message);
            }
        } catch (error) {
            showError("渠道复制失败: " + error.message);
        }
    };

      
      

    const updateChannelBalance = async (record) => {
        try {
            const res = await API.get(`/api/channel/update_balance/${record.id}/`);
            if (res.data.success) {
                setChannels(prevChannels => prevChannels.map(channel => {
                    // 如果是标签组
                    if (channel.isTag && channel.children) {
                        return {
                            ...channel,
                            children: channel.children.map(child => {
                                if (child.id === record.id) {
                                    return { 
                                        ...child, 
                                        balance: res.data.balance, 
                                        balance_updated_time: Date.now() / 1000 
                                    };
                                }
                                return child;
                            }),
                            // 更新标签组的总余额
                            balance: channel.children.reduce((sum, ch) => {
                                return sum + (ch.id === record.id ? res.data.balance : (ch.balance || 0));
                            }, 0)
                        };
                    }
                    // 如果是普通渠道
                    if (channel.id === record.id) {
                        return { 
                            ...channel, 
                            balance: res.data.balance, 
                            balance_updated_time: Date.now() / 1000 
                        };
                    }
                    return channel;
                }));
                showInfo(`通道 ${record.name} 余额更新成功！`);
            } else {
                showError(res.data.message);
            }
        } catch (error) {
            showError(`更新余额失败：${error.message}`);
        }
    };
    

    const updateAllChannelsBalance = async () => {
        setUpdatingBalance(true);
        const res = await API.get(`/api/channel/update_balance`);
        const {success, message} = res.data;
        if (success) {
            showInfo('已更新完毕所有已启用通道余额！');
        } else {
            showError(message);
        }
        setUpdatingBalance(false);
    };



    const fetchGroups = async () => {
        try {
            let res = await API.get(`/api/group/`);
            // add 'all' option
            // res.data.data.unshift('all');
            setGroupOptions(res.data.data.map((group) => ({
                label: group,
                value: group,
            })));
        } catch (error) {
            showError(error.message);
        }
    };

    const closeEdit = () => {
        setShowEdit(false);
    }

    const handleRow = (record, index) => {
        if (record.status !== 1) {
            return {
                style: {
                    background: 'var(--semi-color-disabled-border)',
                },
            };
        }
        if (record.isTag) {
            return {
                style: {
                    background: 'var(--semi-color-fill-0)',
                    cursor: 'pointer'
                },
            };
        }
        return {};
    };

    const resetSearch = () => {
        // 重置所有相关状态
        setSearchKeyword('');
        setSearchGroup('');
        setSearchTypeKey('');
        setSearchModel('');
        searchChannels('', '', '', '');
        refresh()
    };

    // 添加标签组操作的处理函数
    const handleTagStatusChange = async (record, enable) => {
        Modal.confirm({
            title: '确认操作',
            content: `确定要${enable ? '启用' : '禁用'}标签 "${record.name}" 下的所有通道吗？`,
            onOk: async () => {
                try {
                    const promises = record.children.map(channel => 
                        API.put('/api/channel/', {
                            id: channel.id,
                            status: enable ? 1 : 2
                        })
                    );
                    await Promise.all(promises);
                    showSuccess(`已${enable ? '启用' : '禁用'}标签 "${record.name}" 下的所有通道`);
                    refresh();
                } catch (error) {
                    showError(`批量${enable ? '启用' : '禁用'}失败：${error.message}`);
                }
            }
        });
    };

    const handleTagPriorityChange = async (record, value) => {
        if (value === '') return;
        Modal.confirm({
            title: '确认修',
            content: `确定要将标签 "${record.name}" 下所有通道的优先级修改为 ${value} 吗？`,
            onOk: async () => {
                try {
                    const promises = record.children.map(channel => 
                        API.put('/api/channel/', {
                            id: channel.id,
                            priority: parseInt(value)
                        })
                    );
                    await Promise.all(promises);
                    showSuccess('批量修改优先级成功');
                    refresh();
                } catch (error) {
                    showError('批量修改优先级失败：' + error.message);
                }
            }
        });
    };

    const handleTagWeightChange = async (record, value) => {
        if (value === '') return;
        Modal.confirm({
            title: '确认修改',
            content: `确定要将标签 "${record.name}" 下所有通道的权重修改为 ${value} 吗？`,
            onOk: async () => {
                try {
                    const promises = record.children.map(channel => 
                        API.put('/api/channel/', {
                            id: channel.id,
                            weight: parseInt(value)
                        })
                    );
                    await Promise.all(promises);
                    showSuccess('批量修改权重成功');
                    refresh();
                } catch (error) {
                    showError('批量修改权重失败：' + error.message);
                }
            }
        });
    };

    const handleTagTestedTimeChange = async (record, value) => {
        if (value === '') return;
        Modal.confirm({
            title: '确认修改',
            content: `确定要将标签 "${record.name}" 下所有通道的重启时间修改为 ${value} 吗？`,
            onOk: async () => {
                try {
                    const promises = record.children.map(channel => 
                        API.put('/api/channel/', {
                            id: channel.id,
                            tested_time: parseInt(value)
                        })
                    );
                    await Promise.all(promises);
                    showSuccess('批量修改重启时间成功');
                    refresh();
                } catch (error) {
                    showError('批量修改重启时间失败：' + error.message);
                }
            }
        });
    };

    const handleTagDelete = async (record) => {
        const channelIds = record.children.map(c => c.id);
        Modal.confirm({
            title: '确认删除',
            content: `将删除 ${channelIds.length} 个通道，是否继续？`,
            onOk: async () => {
                const promises = channelIds.map(id => 
                    API.delete(`/api/channel/${id}/`)
                );
                await Promise.all(promises);
                refresh();
                showSuccess(`已删除标签 "${record.name}" 下的所有通道`);
            }
        });
    };


    // 处理页面大小变化
    const handlePageSizeChange = async (size) => {
        setPageSize(size);
        // 保存到 localStorage
        window.localStorage.setItem('pageSize', size.toString());
        setActivePage(1); // 重置到第一页
        await loadChannels(0, size);
    };

    // 处理页码变化
    const handlePageChange = async (page) => {
        setActivePage(page);
        await loadChannels(page - 1, pageSize);
    };

    return (
        <>
            <EditChannel refresh={refresh} visible={showEdit} handleClose={closeEdit} editingChannel={editingChannel} />
            <BatchEditChannels
                refresh={refresh}
                visible={showBatchEdit}
                handleClose={() => setShowBatchEdit(false)}
                editingChannelIds={Array.from(selectedChannels)}
            />
    
            <div style={{ position: 'sticky', top: 0, marginTop: 10, zIndex: 1000, padding: '10px 0', backgroundColor: 'var(--semi-color-bg-1)' }}>

                <Form labelPosition='left'>
                    <div style={{ display: 'flex', marginBottom: 20 }}>
                        <Space>
                            <Input
                                field='search'
                                label='关键词'
                                placeholder='ID，名称和密钥 ...'
                                value={searchKeyword}
                                loading={searching}
                                onChange={(value) => {
                                    setSearchKeyword(value.trim());
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        searchChannels(searchKeyword, searchGroup, searchTypeKey, searchModel);
                                    }
                                }}
                            />
                            <Input
                                field='model'
                                label='模型'
                                placeholder='输入模型...'
                                value={searchModel}
                                onChange={(value) => {
                                    setSearchModel(value.trim());
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        searchChannels(searchKeyword, searchGroup, searchTypeKey, searchModel);
                                    }
                                }}
                            />
                            <Select 
                                placeholder="分组" 
                                style={{ width: 300 }}
                                field="group"
                                value={searchGroup}
                                optionList={groupOptions}
                                onChange={(value) => {
                                    setSearchGroup(value)
                                    searchChannels(searchKeyword, value, searchTypeKey, searchModel);
                                }}
                                autoComplete='new-password'
                            />
                            <Select
                                placeholder="类型"
                                style={{ width: 300 }}
                                value={searchTypeKey}
                                optionList={CHANNEL_OPTIONS.map(option => ({
                                    label: option.text,
                                    value: option.key
                                }))}
                                onChange={(value) => {
                                    setSearchTypeKey(value);
                                    searchChannels(searchKeyword, searchGroup, value, searchModel);
                                }}
                                autoComplete='new-password'
                            />
                            <Button onClick={() => searchChannels(searchKeyword, searchGroup, searchTypeKey, searchModel)}>
                                查询
                            </Button>
                            <Button type='tertiary' style={{ marginRight: 28 }} onClick={resetSearch}>
                                清除搜索条件
                            </Button>
                            <>
                                {selectedChannels.size === 0 && (
                                    <Button type='primary' style={{ marginRight: 8 }} onClick={() => {
                                        setEditingChannel({ id: undefined });
                                        setShowEdit(true);
                                    }}>添加渠道</Button>
                                )}
                                {selectedChannels.size === 1 && (
                                    <Button type='primary' style={{ marginRight: 8 }} onClick={copySelectedChannel}>复制渠道</Button>
                                )}
                                {selectedChannels.size > 1 && (
                                    <Button type='danger' style={{ marginRight: 8 }} onClick={deleteSelectedChannels}>删除选中</Button>
                                )}
                                {selectedChannels.size > 1 && (
                                    <Button type='secondary' onClick={() => {
                                        setShowBatchEdit(true);
                                    }}>批量编辑</Button>
                                )}
                            </>
                        </Space>
                    </div>
                </Form>
            </div>
    
            <div style={{ height: 'calc(100vh - 160px)', overflowY: 'auto' }}>
            <Table
                columns={sharedColumns}
                dataSource={isFiltering ? channels : channels.slice((activePage - 1) * pageSize, activePage * pageSize)}
                loading={loading}
                pagination={isFiltering ? false : {
                    currentPage: activePage,
                    pageSize: pageSize,
                    total: channelCount,
                    pageSizeOpts: [10, 20, 50, 100, 200,1000,2000,5000],
                    showSizeChanger: true,
                    formatPageText: (page) => '',
                    onPageSizeChange: handlePageSizeChange,
                    onPageChange: handlePageChange,
                }}
                rowSelection={{
                    columnWidth: 50,
                    onChange: (selectedRowKeys) => {
                        setSelectedChannels(new Set(selectedRowKeys));
                    },
                    selectedRowKeys: Array.from(selectedChannels),
                    getCheckboxProps: (record) => ({
                        disabled: record.isTag, // 禁用标签行的选择框
                        name: record.name,
                    })
                }}
                expandable={{
                    expandRowByClick: true,
                    expandIcon: ({ expanded, onExpand, record }) => 
                        record.isTag ? (
                            <div 
                                onClick={e => {
                                    e.stopPropagation();
                                    onExpand(record, e);
                                }}
                                style={{
                                    cursor: 'pointer',
                                    padding: isMobile() ? '8px' : '4px',  // 增加可点击区域
                                    display: 'inline-block'
                                }}
                            >
                                {expanded ? (
                                    <IconTreeTriangleDown 
                                        style={{ 
                                            fontSize: isMobile() ? '24px' : '16px',
                                            color: 'var(--semi-color-primary)'
                                        }} 
                                    />
                                ) : (
                                    <IconTreeTriangleRight 
                                        style={{ 
                                            fontSize: isMobile() ? '24px' : '16px',
                                            color: 'var(--semi-color-primary)'
                                        }} 
                                    />
                                )}
                            </div>
                        ) : null,
                    expandedRowRender: (record) => {
                        if (!record.isTag) return null;
                        return (
                            <Table
                                columns={sharedColumns}
                                dataSource={record.children}
                                pagination={false}
                                rowSelection={{
                                    columnWidth: 50,
                                    onChange: (selectedRowKeys) => {
                                        const newSelected = new Set(selectedChannels);
                                        selectedRowKeys.forEach(key => newSelected.add(key));
                                        setSelectedChannels(newSelected);
                                    },
                                    selectedRowKeys: Array.from(selectedChannels)
                                }}
                                onRow={handleRow}
                                style={{ margin: '0 60px' }}
                            />
                        );
                    },
                    rowExpandable: record => record.isTag
                }}
                onRow={handleRow}
                style={{ width: '100%' }}
            />
            {isFiltering && (
                <div style={{ paddingTop: '10px' }}>
                    <Typography.Text>
                        共 {channels.length} 条结果
                    </Typography.Text>
                </div>
            )}
        </div>
    
            <div style={{ 
                display: isMobile() ? '' : 'flex', 
                marginTop: isFiltering ? '10px' : (isMobile() ? '0' : '-45px'), 
                zIndex: 999, 
                position: 'relative', 
                pointerEvents: 'none' 
            }}>
                <Space style={{ pointerEvents: 'auto' }}>
                    <Popconfirm
                        title="确定？"
                        okType={'warning'}
                        onConfirm={testAllChannels}
                        position={isMobile() ? 'top' : 'top'}
                    >
                        <Button theme='light' type='warning' style={{ marginRight: 8 }}>测试已启用通道</Button>
                    </Popconfirm>
                    <Popconfirm
                        title="确定是否要删除禁用通道？"
                        content="此修改将不可逆"
                        okType={'danger'}
                        onConfirm={deleteAllDisabledChannels}
                    >
                        <Button theme='light' type='danger' style={{ marginRight: 8 }}>删除禁用通道</Button>
                    </Popconfirm>
                </Space>
            </div>
        </>
    );
    
};

export default ChannelsTable;

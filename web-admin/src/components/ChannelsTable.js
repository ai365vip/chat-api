import React, {useEffect, useState} from 'react';
import { Popup} from 'semantic-ui-react';

import {Link} from 'react-router-dom';
import {
    API,
    isMobile,
    setPromptShown,
    shouldShowPrompt,
    showError,
    showInfo,
    showSuccess,
    timestamp2string
} from '../helpers';
import {IconTreeTriangleDown} from "@douyinfe/semi-icons";
import {CHANNEL_OPTIONS, ITEMS_PER_PAGE} from '../constants';
import {renderGroup, renderNumber, renderNumberWithPoint, renderQuota, renderQuotaWithPrompt} from '../helpers/render';
import {
    Avatar,
    Tag,
    Table,
    Button,
    Popover,
    Form,
    Modal,
    Popconfirm,
    Space,
    Tooltip,
    Switch,
    Typography, 
    InputNumber,
    Select,
    AutoComplete, Dropdown, SplitButtonGroup,Input
} from "@douyinfe/semi-ui";
import EditChannel from "../pages/Channel/EditChannel";
import BatchEditChannels from "../pages/Channel/BatchEditChannels";

let type2label = undefined;


function renderType(type, models) {
    if (!type2label) {
        type2label = new Map();
        for (let i = 0; i < CHANNEL_OPTIONS.length; i++) {
            type2label[CHANNEL_OPTIONS[i].value] = CHANNEL_OPTIONS[i];
        }
        type2label[0] = { value: 0, text: '未知类型', color: 'grey' };
    }

    const modelsArray = models.split(',');
    const tooltipContent = (
        <div>
            <strong>模型:</strong>
            {modelsArray.map((model, index) => (
                <div key={index} style={{ padding: '3px 0' }}>{model.trim()}</div> 
            ))}
        </div>
    );

    return (
        <Tooltip content={tooltipContent} position="top">
            <Tag size='large' color={type2label[type]?.color}>
                {type2label[type]?.text}
            </Tag>
        </Tooltip>
    );
}




const ChannelsTable = () => {
  
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            sorter: (a, b) => a.id - b.id
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
                                    manageChannel(record.id, 'enable', record); // 启用通道
                                } else if (!checked && isOn) {
                                    manageChannel(record.id, 'disable', record); // 禁用通道
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
                return (
                    <div>
                        {renderType(text, record.models)} 
                    </div>
                );
            },
        },
             
        {
            title: '响应时间',
            dataIndex: 'response_time',
            sorter: (a, b) => a.response_time - b.response_time,
            render: (text, record, index) => {
                return (
                    <div>
                        {renderResponseTime(text)}
                    </div>
                );
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
                                manageChannel(record.id, 'priority', record, value);
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
                                manageChannel(record.id, 'weight', record, value);
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
                return (
                    <InputNumber
                        style={{width: 70}}
                        name='name'
                        onChange={value => {
                            manageChannel(record.id, 'tested_time', record, value);
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
            render: (text, record, index) => (
                <div>
                     <SplitButtonGroup style={{marginRight: 1}} aria-label="测试操作">
                        <Button theme="light" onClick={()=>{testChannel(record, '')}}>测试</Button>
                        <Dropdown trigger="click" position="bottomRight" menu={record.test_models}
                        >
                            <Button style={ { padding: '8px 4px'}} type="primary" icon={<IconTreeTriangleDown />}></Button>
                        </Dropdown>
                    </SplitButtonGroup>

                    {/*<Button theme='light' type='primary' style={{marginRight: 1}} onClick={()=>testChannel(record)}>测试</Button>*/}
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
            ),
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
        return savedPageSize ? Number(savedPageSize) : ITEMS_PER_PAGE; // 默认值作为回退
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
        const newChannels = channelsData.map((channel, i) => {
            const test_models = channel.models.split(',').map((model, index) => ({
                node: 'item',
                name: model.trim(),
                onClick: () => testChannel({ ...channel }, model.trim())
            }));
    
            return {
                ...channel, // 创建新对象以避免直接修改旧状态
                key: String(channel.id),
                test_models,
            };
        });
    
        setChannels(newChannels); // 现在这个 setState 调用的是全新的数组，因此不会影响原有状态
        setChannelCount(newChannels.length >= pageSize ? newChannels.length + pageSize : newChannels.length);
    };
    
    
    const loadChannels = async (startIdx, pageSize) => {
        setLoading(true);
        const res = await API.get(`/api/channel/?p=${startIdx}&page_size=${pageSize}`);
        const {success, message, data} = res.data;
        if (success) {
            if (startIdx === 0) {
                setChannelFormat(data);
            } else {
                let newChannels = [...channels];
                newChannels.splice(startIdx * pageSize, data.length, ...data);
                setChannelFormat(newChannels);
            }
        } else {
            showError(message);
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
        // eslint-disable-next-line default-case
        switch (action) {
            case 'delete':
                res = await API.delete(`/api/channel/${id}/`);
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
                if (value === '') {
                    return;
                }
                data.priority = parseInt(value);
                res = await API.put('/api/channel/', data);
                break;
            case 'tested_time':
                if (value === '') {
                    return;
                }
                data.tested_time = parseInt(value);
                res = await API.put('/api/channel/', data);
                break;
            case 'weight':
                if (value === '') {
                    return;
                }
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
            let channel = res.data.data;
            let newChannels = [...channels];
            if (action === 'delete') {

            } else {
                record.status = channel.status;
            }
            setChannels(newChannels);
        } else {
            showError(message);
        }
    };

    

    const renderResponseTime = (responseTime) => {
        let time = responseTime / 1000;
        time = time.toFixed(2) + ' 秒';
        if (responseTime === 0) {
            return <Tag size='large' color='grey'>未测试</Tag>;
        } else if (responseTime <= 1000) {
            return <Tag size='large' color='green'>{time}</Tag>;
        } else if (responseTime <= 3000) {
            return <Tag size='large' color='lime'>{time}</Tag>;
        } else if (responseTime <= 5000) {
            return <Tag size='large' color='yellow'>{time}</Tag>;
        } else {
            return <Tag size='large' color='red'>{time}</Tag>;
        }
    };

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
        const res = await API.get(`/api/channel/test/${record.id}?model=${model}`);
        const {success, message, time} = res.data;
        if (success) {
            setChannels((prevChannels) => prevChannels.map(channel =>
                channel.id === record.id
                    ? { ...channel, response_time: time * 1000, test_time: Date.now() / 1000 }
                    : channel
            ));
            showInfo(`通道 ${record.name}，${model} 测试成功，耗时 ${time.toFixed(2)} 秒。`);
        } else {
            showError(message);
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
            // 这里你可以加入刷新逻辑，或者按实际需要采取其他动作
            return;
        }

        try {
            const newChannel = {...channelToCopy, id: undefined}; // 示例：清除id以创建一个新渠道
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
        const res = await API.get(`/api/channel/update_balance/${record.id}/`);
        if (res.data.success) {
            const newChannels = channels.map(channel => {
                if (channel.id === record.id) {
                    return { ...channel, balance: res.data.balance, balance_updated_time: Date.now() / 1000 };
                }
                return channel;
            });
            setChannels(newChannels);
            showInfo(`通道 ${record.name} 余额更新成功！`);
        } else {
            showError(res.data.message);
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


    let pageData = channels.slice((activePage - 1) * pageSize, activePage * pageSize);

    const handlePageChange = page => {
        setActivePage(page);
        if (page === Math.ceil(channels.length / pageSize) + 1) {
            // In this case we have to load more data and then append them.
            loadChannels(page - 1, pageSize, idSort).then(r => {
            });
        }
    };

    const handlePageSizeChange = async(size) => {
        window.localStorage.setItem('pageSize', size.toString()); // 保存用户的选择到本地存储
        setPageSize(size);
        setActivePage(1);
        loadChannels(0, size, idSort)
            .then()
            .catch((reason) => {
                showError(reason);
            });
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
        } else {
            return {};
        }
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

    return (
        <>
            <EditChannel refresh={refresh} visible={showEdit} handleClose={closeEdit} editingChannel={editingChannel}/>
            <BatchEditChannels
             refresh={refresh} 
            visible={showBatchEdit}
            handleClose={() => setShowBatchEdit(false)}
            editingChannelIds={Array.from(selectedChannels)}

        />
            
            <div style={{position: 'sticky', top: 0, zIndex: 1000, backgroundColor: 'white'}}>
            
            <Form labelPosition='left'>
                <div style={{display: 'flex',marginBottom: 20 }}>
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
                                    e.preventDefault();  // 阻止表单默认行为
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
                                    e.preventDefault();  // 阻止表单默认行为
                                    searchChannels(searchKeyword, searchGroup, searchTypeKey, searchModel);
                                }
                            }}
                        />
                        <Select placeholder="分组" style={{ width: 300 }}
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
                                label: option.text, // 显示给用户的文本
                                value: option.key   // 实际的选中值
                            }))}
                            onChange={(value) => {
                                setSearchTypeKey(value);
                                // 直接使用 value 调用 searchChannels
                                searchChannels(searchKeyword, searchGroup, value, searchModel);
                            }}
                            autoComplete='new-password'
                        />

                        
                        {/* 查询按钮 */}
                        <Button
                            onClick={() => searchChannels(searchKeyword, searchGroup, searchTypeKey, searchModel)}
                        >
                            查询
                        </Button>
                        <Button style={{marginRight: 28}} 
                            theme='light'
                            type='danger'
                            onClick={resetSearch}
                        >
                            清除搜索条件
                        </Button>
                        <>
                            {selectedChannels.size === 0 && (
                                <Button theme='light' type='primary' style={{marginRight: 8}} onClick={() => {
                                    setEditingChannel({
                                        id: undefined,
                                    });
                                    setShowEdit(true);
                                }}>添加渠道</Button>
                            )}
                            
                            {selectedChannels.size === 1 && (
                                <Button theme='light' type='primary' style={{marginRight: 8}} onClick={copySelectedChannel}>复制渠道</Button>
                            )}

                            {selectedChannels.size > 1 && (
                                <Button theme='light' type='danger' style={{marginRight: 8}} onClick={deleteSelectedChannels}>删除选中</Button>
                            )}
                            {selectedChannels.size > 1 && (
                                // 在点击按钮的事件处理器中
                                <Button theme='light' type='secondary' onClick={() => {
                                    console.log('批量编辑按钮点击'); // 调试信息
                                    setShowBatchEdit(true);
                                }}>批量编辑</Button>
                            )}
                        </>

                    </Space>
                </div>
            </Form>

            </div>
            <Table
                rowSelection={{
                    onChange: (selectedRowKeys) => {
                        setSelectedChannels(new Set(selectedRowKeys));
                    },
                    selectedRowKeys: Array.from(selectedChannels),
                }}
                columns={columns}
                dataSource={isFiltering ? channels : channels.slice((activePage - 1) * pageSize, activePage * pageSize)}
                loading={loading}
                pagination={isFiltering ? false : {
                    currentPage: activePage,
                    pageSize: pageSize,
                    total: channelCount,
                    pageSizeOpts: [10, 20, 50, 100,200],
                    showSizeChanger: true,
                    formatPageText:(page) => '',
                    onPageSizeChange: (size) => {
                        handlePageSizeChange(size).then()
                    },
                    onPageChange: handlePageChange,
                    }}
                onRow={handleRow}
            />
            {isFiltering && (
                <div style={{ paddingTop: '10px' }}>
                    <Typography.Text>
                        共 {channels.length} 条结果
                    </Typography.Text>
                </div>
            )}
            <div style={{display: isMobile()?'':'flex', marginTop: isFiltering ? '10px' : (isMobile() ? '0' : '-45px'), zIndex: 999, position: 'relative', pointerEvents: 'none'}}>
                <Space style={{pointerEvents: 'auto'}}>

                    <Popconfirm
                        title="确定？"
                        okType={'warning'}
                        onConfirm={testAllChannels}
                        position={isMobile()?'top':'top'}
                    >
                        <Button theme='light' type='warning' style={{marginRight: 8}}>测试已启用通道</Button>
                    </Popconfirm>

                    <Popconfirm
                        title="确定？"
                        okType={'secondary'}
                        onConfirm={updateAllChannelsBalance}
                    >
                        <Button theme='light' type='secondary' style={{marginRight: 8}}>更新已启用通道余额</Button>
                    </Popconfirm>
                    <Popconfirm
                        title="确定是否要删除禁用通道？"
                        content="此修改将不可逆"
                        okType={'danger'}
                        onConfirm={deleteAllDisabledChannels}
                    >
                        <Button theme='light' type='danger' style={{marginRight: 8}}>删除禁用通道</Button>
                    </Popconfirm>

                </Space>
            </div>
        </>
    );
};

export default ChannelsTable;

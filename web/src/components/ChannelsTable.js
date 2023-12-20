import React, {useEffect, useState} from 'react';
import {Input, Label, Message, Popup,Dropdown} from 'semantic-ui-react';

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
    Select
    
} from "@douyinfe/semi-ui";
import EditChannel from "../pages/Channel/EditChannel";


let type2label = undefined;


function renderType(type) {
    if (!type2label) {
        type2label = new Map;
        for (let i = 0; i < CHANNEL_OPTIONS.length; i++) {
            type2label[CHANNEL_OPTIONS[i].value] = CHANNEL_OPTIONS[i];
        }
        type2label[0] = {value: 0, text: '未知类型', color: 'grey'};
    }
    return <Tag size='large' color={type2label[type]?.color}>{type2label[type]?.text}</Tag>;
}


const ChannelsTable = () => {
  
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
        },
        {
            title: '名称',
            dataIndex: 'name',
        },
        {
            title: '分组',
            dataIndex: 'group',
            render: (text, record, index) => {
                return (
                    <div>
                        <Space spacing={2}>
                            {
                                text.split(',').map((item, index) => {
                                    return (renderGroup(item))
                                })
                            }
                        </Space>
                    </div>
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
            title: '状态',
            dataIndex: 'status',
            render: (text, record, index) => {
                return (
                    <div>
                        {renderStatus(text)}
                    </div>
                );
            },
        },
        {
            title: '响应时间',
            dataIndex: 'response_time',
            render: (text, record, index) => {
                return (
                    <div>
                        {renderResponseTime(text)}
                    </div>
                );
            },
        },
        {
            title: '已用/剩余',
            dataIndex: 'expired_time',
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
                        </Space>
                    </div>
                );
            },
        },
        {
            title: '优先级',
            dataIndex: 'priority',
            render: (text, record, index) => {
                return (
                    <div>
                        <InputNumber
                            style={{width: 70}}
                            name='name'
                            onChange={value => {
                                manageChannel(record.id, 'priority', record, value);
                            }}
                            defaultValue={record.priority}
                            min={0}
                        />
                    </div>
                );
            },
        },
        {
            title: '重启',
            dataIndex: 'tested_time',
            render: (text, record, index) => {
                return (
                    <div>
                        <InputNumber
                            style={{width: 70}}
                            name='name'
                            onChange={value => {
                                manageChannel(record.id, 'tested_time', record, value);
                            }}
                            defaultValue={record.tested_time}
                            min={0}
                        />
                    </div>
                );
            },
        },
        {
            title: '',
            dataIndex: 'operate',
            render: (text, record, index) => (
                <div>
                    <Button theme='light' type='primary' style={{marginRight: 1}} onClick={()=>testChannel(record)}>测试</Button>
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
                    {
                        record.status === 1 ?
                            <Button theme='light' type='warning' style={{marginRight: 1}} onClick={
                                async () => {
                                    manageChannel(
                                        record.id,
                                        'disable',
                                        record
                                    )
                                }
                            }>禁用</Button> :
                            <Button theme='light' type='secondary' style={{marginRight: 1}} onClick={
                                async () => {
                                    manageChannel(
                                        record.id,
                                        'enable',
                                        record
                                    );
                                }
                            }>启用</Button>
                    }
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
    const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE);
    const [showPrompt, setShowPrompt] = useState(shouldShowPrompt("channel-test"));
    const [channelCount, setChannelCount] = useState(pageSize);
    const [groupOptions, setGroupOptions] = useState([]);
    const [showEdit, setShowEdit] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);
    const [selectedChannels, setSelectedChannels] = useState(new Set());
    const [gptVersion, setGptVersion] = useState('gpt-3.5-turbo');
    const [editingChannel, setEditingChannel] = useState({
        id: undefined,
    });


    const [gptOptions, setGptOptions] = useState([
      // 初始的GPT选项列表
      { key: 'gpt-3.5-turbo', text: 'GPT-3.5', value: 'gpt-3.5-turbo' },
      { key: 'gpt-4', text: 'GPT-4', value: 'gpt-4' },
      { key: 'gpt-4-1106-preview', text: 'GPT-4-1106', value: 'gpt-4-1106-preview' },
      // ...其他初始选项...
    ]);
  
    
    const onGptVersionChange = (e, { value }) => {
        setGptVersion(value); // 更新当前选中的GPT版本
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

    const setChannelFormat = (channels) => {
        for (let i = 0; i < channels.length; i++) {
            channels[i].key = '' + channels[i].id;
        }
        // data.key = '' + data.id
        setChannels(channels);
        if (channels.length >= pageSize) {
            setChannelCount(channels.length + pageSize);
        } else {
            setChannelCount(channels.length);
        }
    }

    const loadChannels = async (startIdx, pageSize, idSort) => {
        setLoading(true);
        const res = await API.get(`/api/channel/?p=${startIdx}&page_size=${pageSize}&id_sort=${idSort}`);
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
        await loadChannels(activePage - 1, pageSize, idSort);
    };

    useEffect(() => {
        // console.log('default effect')
        const localIdSort = localStorage.getItem('id-sort') === 'true';
        setIdSort(localIdSort)
        loadChannels(0, pageSize, localIdSort)
            .then()
            .catch((reason) => {
                showError(reason);
            });
        fetchGroups().then();
    }, []);


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

    const renderStatus = (status) => {
        switch (status) {
            case 1:
                return <Tag size='large' color='green'>已启用</Tag>;
            case 2:
                return (
                    <Popup
                        trigger={<Tag size='large' color='red'>
                            已禁用
                        </Tag>}
                        content='本渠道被手动禁用'
                        basic
                    />
                );
            case 3:
                return (
                    <Popup
                        trigger={<Tag size='large' color='yellow'>
                            已禁用
                        </Tag>}
                        content='本渠道被程序自动禁用'
                        basic
                    />
                );
            default:
                return (
                    <Tag size='large' color='grey'>
                        未知状态
                    </Tag>
                );
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

    const searchChannels = async (searchKeyword, searchGroup) => {
        setSearching(true);
    
        let queryParameters = '';
        if (searchKeyword || searchGroup) {
            setIsFiltering(true);
            queryParameters += `?keyword=${encodeURIComponent(searchKeyword)}`;
            if (searchGroup) {
                queryParameters += `&group=${encodeURIComponent(searchGroup)}`;
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
    
    
  

    const testChannel = async (record) => {
        const res = await API.get(`/api/channel/test/${record.id}/`, {params: {version: gptVersion}});
        const {success, message, time} = res.data;
        if (success) {
            let newChannels = [...channels];
            record.response_time = time * 1000;
            record.test_time = Date.now() / 1000;
            setChannels(newChannels);
            showInfo(`通道 ${record.name} 测试成功，耗时 ${time.toFixed(2)} 秒。`);
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
            await refresh();
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
                }
    
                await refresh();
                setSelectedChannels(new Set());
            },
        });
    };
  

    
    
  
    const testSelectedChannels = async () => {
        if (selectedChannels.size === 0) {
            showError("没有选中的渠道");
            return;
        }

        setLoading(true);
        let errors = [];
        let updatedChannels = [...channels];

        for (const channelId of selectedChannels) {
            try {
                const res = await API.get(`/api/channel/test/${channelId}/`);
                const { success, time } = res.data;
                if (success) {
                    // 更新相应渠道的测试时间和响应时间
                    const indexToUpdate = updatedChannels.findIndex(channel => channel.id === channelId);
                    if (indexToUpdate !== -1) {
                        updatedChannels[indexToUpdate].response_time = time * 1000;
                        updatedChannels[indexToUpdate].test_time = Date.now() / 1000;
                    }
                } else {
                    errors.push(`ID ${channelId}: 测试失败`);
                }
            } catch (error) {
                errors.push(`ID ${channelId}: ${error.message}`);
            }
        }

        setChannels(updatedChannels);
        setLoading(false);

        if (errors.length > 0) {
            showError(errors.join(", "));
        } else {
            showSuccess(`成功测试了 ${selectedChannels.size} 个渠道`);
        }
    };


    const updateChannelBalance = async (record) => {
        const res = await API.get(`/api/channel/update_balance/${record.id}/`);
        const {success, message, balance} = res.data;
        if (success) {
            record.balance = balance;
            record.balance_updated_time = Date.now() / 1000;
            showInfo(`通道 ${record.name} 余额更新成功！`);
            await refresh();
        } else {
            showError(message);
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
        setPageSize(size)
        setActivePage(1)
        loadChannels(0, size, idSort)
            .then()
            .catch((reason) => {
                showError(reason);
            })
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

    return (
        <>
            <EditChannel refresh={refresh} visible={showEdit} handleClose={closeEdit} editingChannel={editingChannel}/>
            <Form onSubmit={() => {searchChannels(searchKeyword, searchGroup)}} labelPosition='left'>
                <div style={{display: 'flex'}}>
                    <Space>
                    <Form.Input
                      field='search'
                      label='关键词'
                      placeholder='ID，名称和密钥 ...'
                      value={searchKeyword}
                      loading={searching}
                      onChange={(value) => {
                          setSearchKeyword(value.trim());
                      }}
                      onKeyDown={(e) => {
                          // 当用户按下 Enter 键时开始搜索
                          if (e.key === 'Enter') {
                              e.preventDefault();  // 阻止表单默认行为
                              searchChannels(searchKeyword, searchGroup);
                          }
                      }}
                  />

                        <Form.Select field="group" label='分组' optionList={groupOptions} onChange={(v) => {
                            setSearchGroup(v)
                            searchChannels(searchKeyword, v)
                        }}/>
                        <Dropdown
                            selection
                            search
                            options={gptOptions}
                            value={gptVersion} // 使用 value 而不是 defaultValue 来确保 Dropdown 反映当前状态
                            onChange={onGptVersionChange}
                            allowAdditions
                            onAddItem={(e, { value }) => {
                                const newOption = { key: value, text: value, value };
                                setGptOptions(prevOptions => [...prevOptions, newOption]);
                                setGptVersion(value); // 添加项时也更新当前选中的GPT版本
                            }}
                            style={{ alignItems: 'center', display: 'inline-flex', height: '38px' }}
                        />

                    </Space>
                </div>
            </Form>
            
            {/*
            <div style={{marginTop: 10, display: 'flex'}}>
                <Space>
                    <Typography.Text strong>使用ID排序</Typography.Text>
                    <Switch checked={idSort} label='使用ID排序' uncheckedText="关" aria-label="是否用ID排序" onChange={(v) => {
                        localStorage.setItem('id-sort', v + '')
                        setIdSort(v)
                        loadChannels(0, pageSize, v)
                            .then()
                            .catch((reason) => {
                                showError(reason);
                            })
                    }}></Switch>
                </Space>
            </div>
                */}

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
                    <Button theme='light' type='primary' style={{marginRight: 8}} onClick={
                        () => {
                            setEditingChannel({
                                id: undefined,
                            });
                            setShowEdit(true)
                        }
                    }>添加渠道</Button>
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
                    <Button theme='light' type='danger' style={{marginRight: 8}} onClick={deleteSelectedChannels} >删除选中</Button>

                    {/*<Button theme='light' type='primary' style={{marginRight: 8}} onClick={testSelectedChannels}>测试选中</Button>*/}
                    <Button theme='light' type='primary' style={{marginRight: 8}} onClick={refresh}>刷新</Button>
                </Space>
            </div>
        </>
    );
};

export default ChannelsTable;

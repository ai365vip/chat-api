import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Label, Message, Pagination, Popup, Table , Dropdown,Segment,Modal ,Checkbox} from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { API, setPromptShown, shouldShowPrompt, showError, showInfo, showSuccess, timestamp2string } from '../helpers';

import { CHANNEL_OPTIONS, ITEMS_PER_PAGE } from '../constants';
import {renderGroup, renderNumber, renderQuota} from '../helpers/render';
import EditChannel from '../pages/Channel/EditChannel';

function renderTimestamp(timestamp) {
  return (
      <>
        {timestamp2string(timestamp)}
      </>
  );
}

let type2label = undefined;

const ITEMS_PER_PAGE_OPTIONS = [
  { key: '10', text: '10', value: 10 },
  { key: '20', text: '20', value: 20 },
  { key: '50', text: '50', value: 50 },
  { key: '100', text: '100', value: 100 },
  { key: '200', text: '200', value: 200 },
];


function renderType(type) {
  if (!type2label) {
    type2label = new Map;
    for (let i = 0; i < CHANNEL_OPTIONS.length; i++) {
      type2label[CHANNEL_OPTIONS[i].value] = CHANNEL_OPTIONS[i];
    }
    type2label[0] = { value: 0, text: '未知类型', color: 'grey' };
  }
  return <Label basic color={type2label[type]?.color}>{type2label[type]?.text}</Label>;
}

function renderBalance(type, balance) {
  switch (type) {
    case 1: // OpenAI
      return <span>${balance.toFixed(2)}</span>;
    case 4: // CloseAI
      return <span>¥{balance.toFixed(2)}</span>;
    case 8: // 自定义
      return <span>${balance.toFixed(2)}</span>;
    case 5: // OpenAI-SB
      return <span>¥{(balance / 10000).toFixed(2)}</span>;
    case 10: // AI Proxy
      return <span>{renderNumber(balance)}</span>;
    case 12: // API2GPT
      return <span>¥{balance.toFixed(2)}</span>;
    case 13: // AIGC2D
      return <span>{renderNumber(balance)}</span>;
    default:
      return <span>不支持</span>;
  }
}

const ChannelsTable = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searching, setSearching] = useState(false);
  const [updatingBalance, setUpdatingBalance] = useState(false);
  const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE);
  const [showPrompt, setShowPrompt] = useState(shouldShowPrompt("channel-test"))
  const [gptVersion, setGptVersion] = useState('gpt-3.5-turbo');  // 新增状态变量来记录GPT版本选项
  const [selectedGroup, setSelectedGroup] = useState(null); // 当前选中的分组
  // 初始化空集合来保存选中的渠道ID
 const [selectedChannels, setSelectedChannels] = useState(new Set());


  const [groupOptions, setGroupOptions] = useState([
    { key: '3.5', text: '3.5', value: '3.5' },
    { key: 'default', text: 'default', value: 'default' },
    { key: 'vip', text: 'vip', value: 'vip' },
    { key: 'svip', text: 'svip', value: 'svip' },
  ]); // 分组选项列表

  // 分组下拉框值改变时的处理函数
  const onGroupChange = (e, {value}) => {
    setSelectedGroup(value);
  };

  const [gptOptions, setGptOptions] = useState([
    // 初始的GPT选项列表
    { key: 'gpt-3.5-turbo', text: 'GPT-3.5', value: 'gpt-3.5-turbo' },
    { key: 'gpt-4', text: 'GPT-4', value: 'gpt-4' },
    { key: 'gpt-4-1106-preview', text: 'GPT-4-1106-preview', value: 'gpt-4-1106-preview' },
    // ...其他初始选项...
  ]);

  const onGptVersionChange = (e, {value}) => {   // GPT版本选择的处理函数
    setGptVersion(value);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentChannelId, setCurrentChannelId] = useState(null);

  const handleEditClick = (channelId, refreshNeeded = false) => {
    setCurrentChannelId(channelId);
    setIsModalOpen(true);
    if (refreshNeeded) {
      refresh(); // 如果 refreshNeeded 为 true，则刷新渠道列表
    }
  };

  // 定义用于关闭模态框的函数
  const handleModalClose = (refreshNeeded = false) => {
    setIsModalOpen(false); // 设置状态以关闭模态框
    if (refreshNeeded) {
      refresh(); // 如果 refreshNeeded 为 true，则刷新渠道列表
    }
  };

  const handleSelectAll = (e, { checked }) => {
    // 如果复选框是选中的，则将所有渠道ID加入selectedChannels
    // 否则清空selectedChannels
    if (checked) {
      const newSelectedChannels = new Set(channels.map(channel => channel.id));
      setSelectedChannels(newSelectedChannels);
    } else {
      setSelectedChannels(new Set());
    }
  };
  
  const handleSelectOne = (channelId) => {
    const newSelectedChannels = new Set(selectedChannels);
    if (newSelectedChannels.has(channelId)) {
      newSelectedChannels.delete(channelId);
    } else {
      newSelectedChannels.add(channelId);
    }
    setSelectedChannels(newSelectedChannels);
  };
  

  const loadChannels = async (startIdx) => {
    const res = await API.get(`/api/channel/?p=${startIdx}&page_size=${pageSize}`);
    const { success, message, data } = res.data;
    if (success) {
      if (startIdx === 0) {
        setChannels(data);
      } else {
        let newChannels = [...channels];
        newChannels.splice(startIdx * pageSize, data.length, ...data);
        setChannels(newChannels);
      }
    } else {
      showError(message);
    }
    setLoading(false);
  };

  const onPaginationChange = (e, { activePage }) => {
    (async () => {
      if (activePage === Math.ceil(channels.length / pageSize) + 1) {
        // In this case we have to load more data and then append them.
        await loadChannels(activePage - 1, pageSize);
      }
      setActivePage(activePage);
    })();
  };

  const setItemsPerPage = (e) => {
    e.preventDefault(); // prevent default form submission
    const newPageSize = parseInt(e.target.elements[0].value); // get input value
    console.log(newPageSize);
    setPageSize(newPageSize);
    loadChannels(0);
  }

  const refresh = async () => {
    setLoading(true);
    await loadChannels(activePage - 1);
  };

  useEffect(() => {
    loadChannels(0);
  }, [pageSize]);


  const manageChannel = async (id, action, idx, value) => {
    let data = { id };
    let res;
    // eslint-disable-next-line default-case
    switch (action) {
      case 'delete':
        res = await API.delete(`/api/channel/${id}/`, {params: {version: gptVersion}});
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
    const { success, message } = res.data;
    if (success) {
      showSuccess('操作成功完成！');
      let channel = res.data.data;
      let newChannels = [...channels];
      let realIdx = (activePage - 1) * pageSize + idx;
      if (action === 'delete') {
        newChannels[realIdx].deleted = true;
      } else {
        newChannels[realIdx].status = channel.status;
      }
      setChannels(newChannels);
    } else {
      showError(message);
    }
  };

  // 批量删除
  const deleteSelectedChannels = async () => {
    if (selectedChannels.size === 0) {
      showError("没有选中的渠道");
      return;
    }
  
    setLoading(true);
  
    // 用于存储所有成功的操作
    let successfulDeletions = [];
    
    // 用于存储所有失败的操作信息
    let errors = [];
    
    for (const channelId of selectedChannels) {
      try {
        const res = await API.delete(`/api/channel/${channelId}/`);
        const { success } = res.data;
        if (success) {
            successfulDeletions.push(channelId);
        } else {
          errors.push(`ID ${channelId}: 删除失败`);
        }
      } catch (error) {
        errors.push(`ID ${channelId}: ${error.message}`);
      }
    }
  
    // 成功删除后，从channels列表中移除相关渠道
    if (successfulDeletions.length > 0) {
      setChannels(channels.filter(channel => !successfulDeletions.includes(channel.id)));
    }
  
    setLoading(false);
  
    // 清空已选中渠道列表
    setSelectedChannels(new Set());
  
    if (errors.length > 0) {
      showError(errors[0]);
    } else if (successfulDeletions.length > 0) {
      showSuccess(`成功删除了 ${successfulDeletions.length} 个渠道。`);
    }
  
    // 在这里可以选择再次刷新列表，也可以不刷新，因为上面的代码已经更新了本地状态
    // refresh();
  };
  


  const renderStatus = (status) => {
    switch (status) {
      case 1:
        return <Label basic color='green'>已启用</Label>;
      case 2:
        return (
            <Popup
                trigger={<Label basic color='red'>
                  已禁用
                </Label>}
                content='本渠道被手动禁用'
                basic
            />
        );
      case 3:
        return (
            <Popup
                trigger={<Label basic color='yellow'>
                  已禁用
                </Label>}
                content='本渠道被程序自动禁用'
                basic
            />
        );
      default:
        return (
            <Label basic color='grey'>
              未知状态
            </Label>
        );
    }
  };

  const renderResponseTime = (responseTime) => {
    let time = responseTime / 1000;
    time = time.toFixed(2) + ' 秒';
    if (responseTime === 0) {
      return <Label basic color='grey'>未测试</Label>;
    } else if (responseTime <= 1000) {
      return <Label basic color='green'>{time}</Label>;
    } else if (responseTime <= 3000) {
      return <Label basic color='olive'>{time}</Label>;
    } else if (responseTime <= 5000) {
      return <Label basic color='yellow'>{time}</Label>;
    } else {
      return <Label basic color='red'>{time}</Label>;
    }
  };

  const searchChannels = async () => {
    if (searchKeyword === '') {
      // if keyword is blank, load files instead.
      await loadChannels(0);
      setActivePage(1);
      return;
    }
    setSearching(true);
    const res = await API.get(`/api/channel/search?keyword=${searchKeyword}`);
    const { success, message, data } = res.data;
    if (success) {
      setChannels(data);
      setActivePage(1);
    } else {
      showError(message);
    }
    setSearching(false);
  };
  
  // 添加到useEffect中以监听页面加载时的初始搜索
  useEffect(() => {
    searchChannels();
  }, [searchKeyword]);
  

  const testChannel = async (id, name, idx) => {
    const res = await API.get(`/api/channel/test/${id}/`, {params: {version: gptVersion}});
    const { success, message, time } = res.data;
    if (success) {
      let newChannels = [...channels];
      let realIdx = (activePage - 1) * pageSize + idx;
      newChannels[realIdx].response_time = time * 1000;
      newChannels[realIdx].test_time = Date.now() / 1000;
      setChannels(newChannels);
      showInfo(`通道 ${name} 测试成功，耗时 ${time.toFixed(2)} 秒。`);
    } else {
      showError(message);
    }
  };

  const testAllChannels = async () => {
    const res = await API.get(`/api/channel/test`, {params: {version: gptVersion}});
    const { success, message } = res.data;
    if (success) {
      showInfo('已成功开始测试所有已启用通道，请刷新页面查看结果。');
    } else {
      showError(message);
    }
  };

  const deleteAllDisabledChannels = async () => {
    const res = await API.delete(`/api/channel/disabled`);
    const { success, message, data } = res.data;
    if (success) {
      showSuccess(`已删除所有禁用渠道，共计 ${data} 个`);
      await refresh();
    } else {
      showError(message);
    }
  };

  const updateChannelBalance = async (id, name, idx) => {
    const res = await API.get(`/api/channel/update_balance/${id}/`);
    const { success, message, balance } = res.data;
    if (success) {
      let newChannels = [...channels];
      let realIdx = (activePage - 1) * pageSize + idx;
      newChannels[realIdx].balance = balance;
      newChannels[realIdx].balance_updated_time = Date.now() / 1000;
      setChannels(newChannels);
      showInfo(`通道 ${name} 余额更新成功！`);
    } else {
      showError(message);
    }
  };

  const updateAllChannelsBalance = async () => {
    setUpdatingBalance(true);
    const res = await API.get(`/api/channel/update_balance`);
    const { success, message } = res.data;
    if (success) {
      showInfo('已更新完毕所有已启用通道余额！');
    } else {
      showError(message);
    }
    setUpdatingBalance(false);
  };

  const handleKeywordChange = async (e, { value }) => {
    setSearchKeyword(value.trim());
  };

  const sortChannel = (key) => {
    if (channels.length === 0) return;
    setLoading(true);
    let sortedChannels = [...channels];
    if (typeof sortedChannels[0][key] === 'string') {
      sortedChannels.sort((a, b) => {
        return ('' + a[key]).localeCompare(b[key]);
      });
    } else {
      sortedChannels.sort((a, b) => {
        if (a[key] === b[key]) return 0;
        if (a[key] > b[key]) return -1;
        if (a[key] < b[key]) return 1;
      });
    }
    if (sortedChannels[0].id === channels[0].id) {
      sortedChannels.reverse();
    }
    setChannels(sortedChannels);
    setLoading(false);
  };

  // 更新函数用于处理下拉菜单的值改变
  const onPageSizeChange = (e, { value }) => {
    setPageSize(value);
    loadChannels(0);
  }; 


  return (
      <>
        <Form onSubmit={(e) => {
            e.preventDefault();
            searchChannels();
        }} style={{ display: 'flex', alignItems: 'center' }}>

          <div style={{ display: 'flex', flex: 1, marginRight: '10px', alignItems: 'center'}}>
            <Form.Input
                icon='search'
                iconPosition='left'
                placeholder='搜索渠道的 ID，名称和密钥 ...'
                value={searchKeyword}
                loading={searching}
                onChange={handleKeywordChange}
                style={{ width: '600px' }} // 输入框填满容器宽度
            />
          </div>
          {/* 新增分组下拉框 */}
          <div style={{ display: 'flex', flex: 1, marginRight: '10px', alignItems: 'center'}}>
            <Dropdown
              placeholder='选择分组'
              fluid
              selection
              search
              options={groupOptions}
              value={selectedGroup} // 当前选中的分组
              onChange={handleKeywordChange} // 处理分组变化
              style={{ width: '200px' }} // 下拉框的最小宽度
            />
          </div>
          <Dropdown
              selection
              search
              options={gptOptions}
              onChange={onGptVersionChange}
              defaultValue='gpt-3.5-turbo'
              allowAdditions
              onAddItem={(e, { value }) => {
                // 这里更新 gptOptions 状态，包含新增加的选项
                setGptOptions(prevOptions => [...prevOptions, { key: value, text: value, value }]);
              }}
              style={{ alignItems: 'center', display: 'inline-flex', height: '38px' }} // 调整下拉菜单的样式以匹配其他元素
          />
          <span
              style={{ display: 'flex', marginRight: '250px', alignItems: 'center', fontSize: '18px', lineHeight: '38px', height: '38px' }} // 统一高度和行高
          >
            测试模型
          </span>
        </Form>

        <Table basic compact size='small'>
          <Table.Header>
            <Table.Row>
            <Table.HeaderCell>
              <Checkbox
                indeterminate={selectedChannels.size > 0 && selectedChannels.size < channels.length}
                checked={selectedChannels.size === channels.length}
                onChange={handleSelectAll}
              />
             </Table.HeaderCell>
              <Table.HeaderCell
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    sortChannel('id');
                  }}
              >
                ID
              </Table.HeaderCell>
              <Table.HeaderCell
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    sortChannel('name');
                  }}
              >
                名称
              </Table.HeaderCell>
              <Table.HeaderCell
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    sortChannel('group');
                  }}
                  width={2}
              >
                分组
              </Table.HeaderCell>
              <Table.HeaderCell
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    sortChannel('type');
                  }}
                  width={1}
              >
                类型
              </Table.HeaderCell>
              <Table.HeaderCell
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    sortChannel('status');
                  }}
                  width={1}
              >
                状态
              </Table.HeaderCell>
              <Table.HeaderCell
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    sortChannel('response_time');
                  }}
              >
                响应时间
              </Table.HeaderCell>
              <Table.HeaderCell
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    sortChannel('used_quota');
                  }}
                  width={1}
              >
                已使用
              </Table.HeaderCell>
              <Table.HeaderCell
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    sortChannel('balance');
                  }}
              >
                余额
              </Table.HeaderCell>
              <Table.HeaderCell
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    sortChannel('priority');
                  }}
              >
                优先级
              </Table.HeaderCell>
              <Table.HeaderCell>操作</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {channels
                .slice(
                    (activePage - 1) * pageSize,
                    activePage * pageSize
                )
                .map((channel, idx) => {
                  if (channel.deleted) return <></>;
                  return (
                      <Table.Row key={channel.id}>
                        <Table.Cell>
                          <Checkbox
                            checked={selectedChannels.has(channel.id)}
                            onChange={() => handleSelectOne(channel.id)}
                          />
                        </Table.Cell>
                        <Table.Cell>{channel.id}</Table.Cell>
                        <Table.Cell>{channel.name ? channel.name : '无'}</Table.Cell>
                        <Table.Cell>{renderGroup(channel.group)}</Table.Cell>
                        <Table.Cell>{renderType(channel.type)}</Table.Cell>
                        <Table.Cell>{renderStatus(channel.status)}</Table.Cell>
                        <Table.Cell>
                          <Popup
                              content={channel.test_time ? renderTimestamp(channel.test_time) : '未测试'}
                              key={channel.id}
                              trigger={renderResponseTime(channel.response_time)}
                              basic
                          />
                        </Table.Cell>
                        <Table.Cell>{renderQuota(channel.used_quota)}</Table.Cell>
                        <Table.Cell>
                          <Popup
                              trigger={<span onClick={() => {
                                updateChannelBalance(channel.id, channel.name, idx);
                              }} style={{ cursor: 'pointer' }}>
                      {renderBalance(channel.type, channel.balance)}
                    </span>}
                              content='点击更新'
                              basic
                          />
                        </Table.Cell>
                        <Table.Cell>
                          <Popup
                              trigger={<Input type='number' defaultValue={channel.priority} onBlur={(event) => {
                                manageChannel(
                                    channel.id,
                                    'priority',
                                    idx,
                                    event.target.value
                                );
                              }}>
                                <input style={{ maxWidth: '60px' }} />
                              </Input>}
                              content='渠道选择优先级，越高越优先'
                              basic
                          />
                        </Table.Cell>
                        <Table.Cell>
                          <div>
                            <Button
                                size={'small'}
                                positive
                                onClick={() => {
                                  testChannel(channel.id, channel.name, idx);
                                }}
                            >
                              测试
                            </Button>
                            {/*<Button*/}
                            {/*  size={'small'}*/}
                            {/*  positive*/}
                            {/*  loading={updatingBalance}*/}
                            {/*  onClick={() => {*/}
                            {/*    updateChannelBalance(channel.id, channel.name, idx);*/}
                            {/*  }}*/}
                            {/*>*/}
                            {/*  更新余额*/}
                            {/*</Button>*/}
                            <Popup
                                trigger={
                                  <Button size='small' negative>
                                    删除
                                  </Button>
                                }
                                on='click'
                                flowing
                                hoverable
                            >
                              <Button
                                  negative
                                  onClick={() => {
                                    manageChannel(channel.id, 'delete', idx);
                                  }}
                              >
                                删除渠道 {channel.name}
                              </Button>
                            </Popup>
                            <Button
                                size={'small'}
                                onClick={() => {
                                  manageChannel(
                                      channel.id,
                                      channel.status === 1 ? 'disable' : 'enable',
                                      idx
                                  );
                                }}
                            >
                              {channel.status === 1 ? '禁用' : '启用'}
                            </Button>
                            <Button
                                size={'small'}
                                onClick={() => handleEditClick(channel.id)}
                            >
                              编辑
                            </Button>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                  );
                })}
          </Table.Body>

          <Table.Footer>
            <Table.Row>
              <Table.HeaderCell colSpan='10'>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    {/* 其他按钮 */}
                    <Button size='small' onClick={() => handleEditClick()}>
                      添加新的渠道
                    </Button>
                    <Button size='small' loading={loading} onClick={testAllChannels}>
                      测试已启用通道
                    </Button>
                   {/*
                    <Button size='small' onClick={updateAllChannelsBalance}
                            loading={loading || updatingBalance}>更新已启用通道余额</Button>
                  */}   

                    <Popup
                        trigger={
                          <Button size='small' loading={loading}>
                            删除禁用渠道
                          </Button>
                        }
                        on='click'
                        flowing
                        hoverable
                    >
                      <Button size='small' loading={loading} negative onClick={deleteAllDisabledChannels}>
                        确认删除
                      </Button>
                    </Popup>
                    <Button
                    size='small'
                    negative
                    onClick={deleteSelectedChannels}
                  >
                    删除选中
                  </Button>


                    <Button size='small' onClick={refresh} loading={loading}>刷新</Button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' , marginRight: '200px' }}>
                    <label style={{ marginRight: '5px' }}>每页</label> {/* 加入标签 "每页" */}
                    <Dropdown
                        selection
                        compact
                        options={ITEMS_PER_PAGE_OPTIONS}
                        onChange={onPageSizeChange}
                        value={pageSize} // 使用 state 中的 pageSize 作为当前值
                        style={{marginRight: '10px'}}
                    />
                    <Pagination
                        activePage={activePage}
                        onPageChange={onPaginationChange}
                        size='small'
                        siblingRange={1}
                        totalPages={
                            Math.ceil(channels.length / pageSize) + (channels.length % pageSize === 0 ? 1 : 0)
                        }
                    />
                  </div>
                  <Modal
                      open={isModalOpen}
                      onClose={() => setIsModalOpen(false)}
                      size='large'
                  >
                    <Modal.Header>编辑渠道</Modal.Header>
                    <Modal.Content>
                      {/* 将 EditChannel 组件放在 Modal 中 */}
                      <EditChannel channelId={currentChannelId} onClose={handleModalClose} />
                    </Modal.Content>
                  </Modal>
                </div>
              </Table.HeaderCell>
            </Table.Row>
          </Table.Footer>

        </Table>
      </>
  );
};

export default ChannelsTable;

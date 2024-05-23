import React, {useEffect, useState} from 'react';
import {Label} from 'semantic-ui-react';
import {API, copy, isAdmin, showError, showSuccess, timestamp2string} from '../helpers';

import {
    Table,
    Avatar,
    Tag,
    Form,
    Button,
    Layout,
    Select,
    Popover,
    Modal,
    ImagePreview,
    Typography,TextArea
} from '@douyinfe/semi-ui';
import {ITEMS_PER_PAGE} from '../constants';
import {renderNumber, renderQuota, stringToColor} from '../helpers/render';

const { Option } = Select; 
const colors = ['amber', 'blue', 'cyan', 'green', 'grey', 'indigo',
    'light-blue', 'lime', 'orange', 'pink',
    'purple', 'red', 'teal', 'violet', 'yellow'
]



function renderStatus(code) {
  switch (code) {
    case 1:
      return <Tag color="orange" size='large'>待处理</Tag>;
    case 2:
      return <Tag color="lime" size='large'>已批准</Tag>;
    case 3:
      return <Tag color="red" size='large'>已拒绝</Tag>;
    case 4:
      return <Tag color="green" size='large'>已处理</Tag>;
    default:
      return <Tag color="black" size='large'>未知</Tag>;
  }
}




const renderTimestamp = (timestampInSeconds) => {
  const date = new Date(timestampInSeconds * 1000); // 从秒转换为毫秒

  const year = date.getFullYear(); // 获取年份
  const month = ('0' + (date.getMonth() + 1)).slice(-2); // 获取月份，从0开始需要+1，并保证两位数
  const day = ('0' + date.getDate()).slice(-2); // 获取日期，并保证两位数
  const hours = ('0' + date.getHours()).slice(-2); // 获取小时，并保证两位数
  const minutes = ('0' + date.getMinutes()).slice(-2); // 获取分钟，并保证两位数
  return `${year}-${month}-${day} ${hours}:${minutes}`; // 格式化输出
};



const WithdrawalTable = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({
        id: '',
        user_id: '',
        user_name: '',
        order_number: '',
        withdrawal_amount: '',
        alipay_account: '',
        status: '',
        priority: '',
        resolved: '',
        created: '',
        updated: '',
        timestamp2string: '',
        key: '',
        aff_quota:'',
        aff_history:'',
    });
    
    const columns = [
        {
            title: '提交时间',
            dataIndex: 'created',
            render: (text, record, index) => {
                return (
                <div>
                    {renderTimestamp(text)} 
                </div>
                );
            },
        },        
        {
            title: '用户',
            dataIndex: 'user_name',
            className: isAdmin() ? 'tableShow' : 'tableHiddle',
            render: (text, record, index) => {
                return (

                            <div>
                                <Tag color={colors[parseInt(text) % colors.length]} size='large' onClick={()=>{
                                    copyText(text); // 假设copyText是用于文本复制的函数
                                }}> {text} </Tag>
                            </div>

                );
            },
        },
        {
            title: '任务ID',
            dataIndex: 'order_number',
            render: (text, record, index) => {
                return (
                  <div>
                    {text}
                </div>
                );
            },
        },
        {
            title: '提现额度',
            dataIndex: 'withdrawal_amount',
            render: (text, record, index) => {
                return (
                  <div>
                    {text/500000.00}
                  </div>
                );
            },
        },
        {
            title: '支付宝',
            dataIndex: 'alipay_account',
            render: (text, record, index) => {
                return (
                  <div>
                     {<span> {text} </span>}
                  </div>
                );
            },
        },
        {
            title: '剩余收益',
            dataIndex: 'aff_quota',
            render: (text, record, index) => {
                return (
                  <div>
                    {text/500000.00}
                  </div>
                );
            },
        },
        {
            title: '总收益',
            dataIndex: 'aff_history',
            render: (text, record, index) => {
                return (
                  <div>
                    {text/500000.00}
                  </div>
                );
            },
        },
        {
            title: '处理意见',
            dataIndex: 'comment',
            render: (text, record, index) => {
                if (!text) {
                    return '无';
                }
        
                return (
                    <Typography.Text
                        ellipsis={{ showTooltip: true }}
                        style={{ width: 100 }}
                        onClick={() => {
                            setModalContent(text);
                            setIsModalOpen(true);
                        }}
                    >
                        {text}
                    </Typography.Text>
                );
            }
        },
        {
            title: '状态',
            dataIndex: 'status',
            className: isAdmin() ? 'tableShow' : 'tableHiddle',
            render: (text, record, index) => {
                return (
                  <div>
                    {renderStatus(text)}
                  </div>
                );
            },
        },
        {
            title: '操作',
            dataIndex: '',
            render: (text, record) => {
                return (
                    <Button onClick={() => showEditModal(record)}>编辑</Button>
                );
            },
        },

    ];

    const [order, setOrder] = useState([]);
    const [comment, setComment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activePage, setActivePage] = useState(1);
    const [orderCount, setOrderount] = useState(ITEMS_PER_PAGE);
    const isAdminUser = isAdmin();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);


    const now = new Date();
    // 取整到最近的分钟
    now.setSeconds(0, 0);

    const timestampInSeconds = Math.floor(now.getTime() / 1000);
    const oneMonthInSeconds = 2592000; // 大约30天
    const oneHourInSeconds = 3600; // 1小时

    const [inputs, setInputs] = useState({
        user_name: '',
        order_number: '',
        start_timestamp: timestamp2string(timestampInSeconds - oneMonthInSeconds), // 30天前
        end_timestamp: timestamp2string(timestampInSeconds + oneHourInSeconds), // 当前时间加1小时
    });
    const {user_name, order_number,  start_timestamp, end_timestamp} = inputs;


    const handleInputChange = (value, name) => {
        setInputs((inputs) => ({...inputs, [name]: value}));
    };



    const setOrderFormat = (order) => {
        if (!order || !Array.isArray(order)) {
            return;
        }
        for (let i = 0; i < order.length; i++) {
            order[i].timestamp2string = timestamp2string(order[i].created_at);
            order[i].key = '' + order[i].id;
        }
        setOrder(order);
        setOrderount(order.length + ITEMS_PER_PAGE);
    }

    const loadOrder = async (startIdx) => {
        setLoading(true);

        let localStartTimestampInSeconds = Math.floor(Date.parse(start_timestamp) / 1000);
        let localEndTimestampInSeconds = Math.floor(Date.parse(end_timestamp) / 1000);

        let url = `/api/user/withdrawals/?p=${startIdx}`;
        
        // 只有当用户是管理员时才添加查询参数
        if (isAdminUser) {
        url += `&user_name=${encodeURIComponent(user_name)}&order_number=${encodeURIComponent(order_number)}`;
        url += `&start_timestamp=${localStartTimestampInSeconds}&end_timestamp=${localEndTimestampInSeconds}`;
        }
        try {
            const res = await API.get(url);
            if (res && res.data) {
                const { success, message, data } = res.data;
                if (success) {
                    if (startIdx === 0) {
                        setOrderFormat(data);
                    } else {
                        let neworder = [...order];
                        neworder.splice(startIdx * ITEMS_PER_PAGE, data.length, ...data);
                        setOrderFormat(neworder);
                    }
                } else {
                    showError(message);
                }
            } else {
                showError('服务器没有返回预期的数据');
            }
        } catch (error) {
            showError(error.toString());
        }
    
        setLoading(false);
    };

    const pageData = order.slice((activePage - 1) * ITEMS_PER_PAGE, activePage * ITEMS_PER_PAGE);

    const handlePageChange = page => {
        setActivePage(page);
        if (order && order.length > 0 && page === Math.ceil(order.length / ITEMS_PER_PAGE) + 1) {
            // In this case we have to load more data and then append them.
            loadOrder(page - 1).then(r => {
            });
        }
    };

    // 显示编辑模态框的函数
    const showEditModal = (record) => {
        setComment(record.comment || '');
        setModalContent(record);
        setIsEditModalOpen(true);
    };
    

    // 更新提现订单状态的函数
    const updateOrderStatusAndComment = async () => {
        const { id, status } = modalContent; 
        try {
            const res = await API.post(`/api/user/withdrawals/${id}/status`, {
                order_id: id,
                status: status,
                comment: comment, 
            });
            const { success, message } = res.data;
            if (success) {
                showSuccess(message);
                refresh(); 
            } else {
                showError(message);
            }
            setIsEditModalOpen(false); 
        } catch (error) {
            showError(error.message);
        }
        setIsModalOpen(false); 
    };

    const refresh = async () => {
        // setLoading(true);
        setActivePage(1);
        await loadOrder(0);
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
    }, []);

    return (
        <>
         
            <Layout>
                <Form layout='horizontal' style={{marginTop: 60}}>
                    <>
                    {isAdminUser && (
                          <Form.Input
                            field="user_name"
                            label="用户"
                            style={{ width: 176 }}
                            value={user_name}
                            placeholder="可选值"
                            name="user_name"
                            onChange={value => handleInputChange(value, 'user_name')}
                          />
                        )}
                        <Form.Input
                          field="order_number"
                          label="订单 ID"
                          style={{ width: 176 }}
                          value={order_number}
                          placeholder="可选值"
                          name="order_number"
                          onChange={value => handleInputChange(value, 'order_number')}
                        />
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

                        <Form.Section>
                            <Button label='查询' type="primary" htmlType="submit" className="btn-margin-right"
                                    onClick={refresh}>查询</Button>
                        </Form.Section>
                    </>
                </Form>
                <Table columns={columns} dataSource={pageData} pagination={{
                    currentPage: activePage,
                    pageSize: ITEMS_PER_PAGE,
                    total: orderCount,
                    pageSizeOpts: [10, 20, 50, 100],
                    onPageChange: handlePageChange,
                }} loading={loading}/>

                <Modal
                    visible={isModalOpen}
                    onCancel={() => setIsModalOpen(false)}
                    footer={null} // 不显示底部按钮
                >
                    <div style={{ whiteSpace: 'pre-line' }}>
                        {modalContent}
                    </div>
                </Modal>

                <Modal
                    title="编辑提现订单"
                    visible={isEditModalOpen}
                    onOk={updateOrderStatusAndComment}
                    onCancel={() => setIsEditModalOpen(false)}
                    footer={[
                        <Button key="back" onClick={() => setIsEditModalOpen(false)}>
                        取消
                        </Button>,
                        <Button key="submit" type="primary" onClick={updateOrderStatusAndComment}>
                        提交
                        </Button>,
                    ]}
                    width={500}
                    style={{ top: '20vh' }} 
                    >
                    {/* 编辑表单 */}
                    <div style={{ marginTop: '10px' }}>
                        <Typography.Text strong>修改状态</Typography.Text>
                    </div>
                    <Select
                        value={renderStatus(modalContent.status)} // 使用 modalContent 中的状态
                        onChange={(value) => setModalContent({ ...modalContent, status: value })}
                    >
                        <Option value={1}>已提交</Option> {/* 确保 Option 的 value 是数字 */}
                        <Option value={2}>已批准</Option>
                        <Option value={3}>已拒绝</Option>
                        <Option value={4}>已处理</Option>
                    </Select>
                    <div style={{ marginTop: '10px' }}>
                        <Typography.Text strong>处理意见</Typography.Text>
                    </div>
                    
                    <TextArea
                        value={comment} // 使用 comment 状态的值
                        onChange={(value) => setComment(value)}
                        placeholder="请输入处理意见"
                        rows={4} // 增加 TextArea 的行数
                    />


                    </Modal>
            </Layout>
        </>
    );
};

export default WithdrawalTable;

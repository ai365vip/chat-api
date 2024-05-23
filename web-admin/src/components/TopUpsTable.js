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
    Typography,
    Popconfirm
} from '@douyinfe/semi-ui';
import {ITEMS_PER_PAGE} from '../constants';
import {renderNumber, renderQuota, stringToColor} from '../helpers/render';


const colors = ['amber', 'blue', 'cyan', 'green', 'grey', 'indigo',
    'light-blue', 'lime', 'orange', 'pink',
    'purple', 'red', 'teal', 'violet', 'yellow'
]



function renderStatus(type) {
  // Ensure all cases are string literals by adding quotes.
  switch (type) {
    case 'success':
      return <Tag color="green" size='large'>支付成功</Tag>;
    case 'pending':
      return <Tag color="grey" size='large'>未支付</Tag>;
    default:
      return <Tag color="black" size='large'>未知</Tag>;
  }
}

function renderMode(type) {
  switch (type) {
    case '-1':
      return <Tag color="blue" size='large'>无限制</Tag>;
    default:
      return <Tag color="orange" size='large'>{`${type} 天`}</Tag>;
  }
}


const renderTimestamp = (timestampInSeconds) => {
  const date = new Date(timestampInSeconds * 1000); // 从秒转换为毫秒

  const year = date.getFullYear(); // 获取年份
  const month = ('0' + (date.getMonth() + 1)).slice(-2); // 获取月份，从0开始需要+1，并保证两位数
  const day = ('0' + date.getDate()).slice(-2); // 获取日期，并保证两位数
  const hours = ('0' + date.getHours()).slice(-2); // 获取小时，并保证两位数
  const minutes = ('0' + date.getMinutes()).slice(-2); // 获取分钟，并保证两位数
  const seconds = ('0' + date.getSeconds()).slice(-2); // 获取秒钟，并保证两位数

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`; // 格式化输出
};



const TopUpsTable = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState('');
    const columns = [
        {
          title: '提交时间',
          dataIndex: 'create_time',
          render: (text, record, index) => {

            return (
              <div>
                {renderTimestamp(text)} 
              </div>
            );
          },
        },
      
        {
            title: '用户ID',
            dataIndex: 'user_id',
            className: isAdmin() ? 'tableShow' : 'tableHiddle',
            render: (text, record, index) => {
                return (

                    <div>
                        <Tag color={colors[parseInt(text) % colors.length]} size='large' onClick={()=>{
                            showUserInfo(text); 
                        }}> {text} </Tag>
                    </div>

                );
            },
        },

        {
            title: '任务ID',
            dataIndex: 'trade_no',
            render: (text, record, index) => {
                return (
                  <div>
                    {text}
                </div>
                );
            },
        },
        {
          title: '充值额度',
          dataIndex: 'amount',
          className: isAdmin() ? 'tableShow' : 'tableHiddle',
          render: (text, record, index) => {
              return (
                <div>
                 {text}
               </div>
              );
          },
        },
        {
          title: '实付金额',
          dataIndex: 'money',
          className: isAdmin() ? 'tableShow' : 'tableHiddle',
          render: (text, record, index) => {
            const formattedText = Number(text).toFixed(2);
            return (
              <div>
              {formattedText}
            </div>
            );
          },
        },
        {
            title: '有效期',
            dataIndex: 'topup_ratio',
            className: isAdmin() ? 'tableShow' : 'tableHiddle',
            render: (text, record, index) => {
                return (
                  <div>
                    {renderMode(text)}
                  </div>
                );
            },
        },
        {
          title: '到期时间',
          dataIndex: 'create_time', // 使用 create_time 作为开始时间
          key: 'expiry_time',
          className: isAdmin() ? 'tableShow' : 'tableHiddle',
          render: (text, record, index) => {
            if (record.topup_ratio === '-1') {
              // 如果有效期为无限期
              return <div><Tag color="blue" size='large'>无限制</Tag></div>;
            } else {
              // 计算到期日期和时间到分钟
              const startTimeInSeconds = parseInt(text, 10); // 确保是十进制数，并且以秒为单位
              const expiryDays = parseInt(record.topup_ratio, 10); // 将有效期从字符串转换为数字
              const expiryTimeInSeconds = startTimeInSeconds + expiryDays * 86400; // 计算到期时间戳（秒）
        
              return <div>{renderTimestamp(expiryTimeInSeconds)}</div>;
            }
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
        

    ];

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activePage, setActivePage] = useState(1);
    const [logCount, setLogCount] = useState(ITEMS_PER_PAGE);
    const [logType, setLogType] = useState(0);
    const isAdminUser = isAdmin();
    const [isModalOpenurl, setIsModalOpenurl] = useState(false);
    const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE); // 已经有ITEMS_PER_PAGE常量

    // 定义模态框图片URL的状态和更新函数
    const [modalImageUrl, setModalImageUrl] = useState('');
    let now = new Date();
    // 初始化start_timestamp为前一天
    const [inputs, setInputs] = useState({
        user_id: '',
        trade_no: '',
        create_time: timestamp2string(now.getTime() / 1000 - 2592000),
        status: '',
    });
    const {user_id, trade_no,  create_time,status} = inputs;

    const [stat, setStat] = useState({
        quota: 0,
        token: 0
    });
    const handlePageSizeChange = newPageSize => {
      setPageSize(newPageSize);
  };
  

    const handleInputChange = (value, name) => {
      setInputs(inputs => ({ ...inputs, [name]: value }));
    };



    const setLogsFormat = (logs) => {
      
      setLogs(logs);
      setLogCount(logs.length + ITEMS_PER_PAGE);
  }
  

    const loadLogs = async (startIdx) => {
        setLoading(true);

        let url = '';
        let localStartTimestamp = Date.parse(create_time)/1000;
        url = `/api/topups/?p=${startIdx}&user_id=${user_id}&trade_no=${trade_no}&create_time=${localStartTimestamp}&status=${status}`;

        const res = await API.get(url);
        const {success, message, data} = res.data;
        if (success) {
            if (startIdx === 0) {
                setLogsFormat(data);
            } else {
                let newLogs = [...logs];
                newLogs.splice(startIdx * ITEMS_PER_PAGE, data.length, ...data);
                setLogsFormat(newLogs);
            }
        } else {
            showError(message);
        }
        setLoading(false);
    };
    const deleteTopUps = async () => {
      setLoading(true); // 开始加载
  
      const url = '/api/topups/delete';
  
      try {
          const res = await API.delete(url); // 发送删除请求
          const { success, message } = res.data;
  
          if (success) {
              // 删除成功
              showSuccess(message);
          } else {
              // 删除失败，显示错误消息
              showError(message);
          }
      } catch (error) {
          // 处理请求错误
          console.error("Delete operation failed:", error);
          showError("Failed to delete top-ups");
      }
      refresh();
      setLoading(false); // 结束加载
  };
  
    const pageData = logs.slice((activePage - 1) * ITEMS_PER_PAGE, activePage * ITEMS_PER_PAGE);

    const handlePageChange = page => {
        setActivePage(page);
        if (page === Math.ceil(logs.length / ITEMS_PER_PAGE) + 1) {
            // In this case we have to load more data and then append them.
            loadLogs(page - 1).then(r => {
            });
        }
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
            Modal.error({title: '无法复制到剪贴板，请手动复制', content: text});
        }
    }

    useEffect(() => {
      refresh(); 
  }, [inputs.user_id, inputs.trade_no, inputs.create_time, inputs.status, pageSize]);

    return (
        <>
         
            <Layout>
                <Form layout='horizontal' style={{marginTop: 60}}>
                    <>
                    {isAdminUser && (
                          <Form.Input
                            field="user_id"
                            label="用户 ID"
                            style={{ width: 176 }}
                            value={user_id}
                            placeholder="可选值"
                            name="user_id"
                            onChange={value => handleInputChange(value, 'user_id')}
                          />
                        )}
                        <Form.Input
                          field="trade_no"
                          label="任务 ID"
                          style={{ width: 176 }}
                          value={trade_no}
                          placeholder="可选值"
                          name="trade_no"
                          onChange={value => handleInputChange(value, 'trade_no')}
                        />
                        <Form.Select
                          field="status"
                          label="支付状态"
                          style={{ width: 176 }}
                          value={inputs.status}
                          placeholder="请选择状态"
                          onChange={value => handleInputChange(value, 'status')}
                        >
                          <Select.Option value="">全部</Select.Option>
                          <Select.Option value="success">支付成功</Select.Option>
                          <Select.Option value="pending">未支付</Select.Option>
                        </Form.Select>


                        <Form.DatePicker field="create_time" label='起始时间' style={{width: 272}}
                                         initValue={create_time}
                                         value={create_time} type='dateTime'
                                         name='create_time'
                                         onChange={value => handleInputChange(value, 'create_time')}/>

                        <Form.Section>
                            <Button label='查询' type="primary" style={{marginRight: 8}} htmlType="submit" className="btn-margin-right"
                                    onClick={refresh}>查询</Button>

                        <Popconfirm
                            title="确定是否要删除未支付订单？"
                            content="此修改将不可逆"
                            okType={'danger'}
                            onConfirm={deleteTopUps}
                        >
                            <Button theme='light' type='danger' style={{marginRight: 8}}>清除未支付</Button>
                        </Popconfirm>
                        </Form.Section>
                    </>
                </Form>
                <Table
                    columns={columns}
                    dataSource={pageData}
                    pagination={{
                        currentPage: activePage,
                        pageSize: pageSize, // 使用状态
                        total: logCount,
                        pageSizeOpts: [10, 20, 50, 100],
                        onPageChange: handlePageChange,
                        onPageSizeChange: handlePageSizeChange, // 添加这行
                    }}
                    loading={loading}
                />

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
                <ImagePreview
                    src={modalImageUrl}
                    visible={isModalOpenurl}
                    onVisibleChange={(visible) => setIsModalOpenurl(visible)}
                />
               
            </Layout>
        </>
    );
};

export default TopUpsTable;

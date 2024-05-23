import React, {useEffect, useRef, useState} from 'react';
import {Button, Col, Form, Layout, Row, Spin,Divider} from "@douyinfe/semi-ui";
import VChart from '@visactor/vchart';
import {API, isAdmin, showError, timestamp2string, timestamp2string1} from "../../helpers";
import {getQuotaWithUnit, renderNumber, renderQuotaNumberWithDigit} from "../../helpers/render";


const Detail = (props) => {

    const now = new Date();

    // 设置开始时间为今天的0点
    now.setHours(0, 0, 0, 0); 
    const startOfTodayTimestamp = now.getTime() / 1000; 

    // 设置结束时间为当前时间加上10分钟
    const endTimestamp = new Date().getTime() / 1000 + 600; 

    const [inputs, setInputs] = useState({
        username: '',
        token_name: '',
        model_name: '',
        start_timestamp: timestamp2string(startOfTodayTimestamp),
        end_timestamp: timestamp2string(endTimestamp),
        channel: '',
        type: ''
    });
    const {username,  start_timestamp, end_timestamp, channel} = inputs;
    const isAdminUser = isAdmin();
    const initialized = useRef(false)
    const [modelDataChart, setModelDataChart] = useState(null);
    const [modelDataPieChart, setModelDataPieChart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quotaData, setQuotaData] = useState([]);
    const [channelDataChart, setChannelDataChart] = useState(null);
    const [typeDataChart, setTypelDataChart] = useState(null);

    const handleInputChange = (value, name) => {
        setInputs((inputs) => ({...inputs, [name]: value}));
    };

    const spec_line = {
        type: 'bar',
        data: [
            {
                id: 'barData',
                values: [] // 此处将在 updateChart 中填充实际数据
            }
        ],
        xField: 'username', // 使用用户名作为x轴
        yField: 'Quota', // 使用使用量作为y轴
        seriesField: 'username', // 按用户区分系列
        stack: false, // 前10用户的数据无需堆叠显示
        legends: {
            visible: true
        },
        title: {
            visible: true,
        },
        bar: {
            state: {
                hover: {
                    stroke: '#000',
                    lineWidth: 1
                }
            }
        },
        tooltip: {
            mark: {
                content: [
                    {
                       // key: datum => datum['username'],
                        key: `消费`,
                        value: datum => `${renderQuotaNumberWithDigit(datum['Quota'], 3)} (${datum['Count']} 次)`
                    }
                ]
            },
            dimension: {
                content: [
                    {
                       // key: datum => datum['username'],
                        key: `消费`,
                        value: datum => `${renderQuotaNumberWithDigit(datum['Quota'], 3)} (${datum['Count']} 次)`
                    }
                ]
            }
        }
    };

    const channel_line = {
        type: 'bar',
        data: [
            {
                id: 'channelData',
                values: [] // 此处将在 updateChart 中填充实际数据
            }
        ],
        xField: 'channel', // 使用用户名作为x轴
        yField: 'Quota', // 使用使用量作为y轴
        seriesField: 'channel', // 按用户区分系列
        stack: false, // 前10用户的数据无需堆叠显示
        legends: {
            visible: true
        },
        title: {
            visible: true,
        },
        bar: {
            state: {
                hover: {
                    stroke: '#000',
                    lineWidth: 1
                }
            }
        },
        tooltip: {
            mark: {
                content: [
                    {
                        //key: datum => datum['channel'],
                        key: `消费`,
                        value: datum => `${renderQuotaNumberWithDigit(datum['Quota'], 3)} (${datum['Count']} 次)`
                    }
                ]
            },
            dimension: {
                content: [
                    {
                        //key: datum => datum['channel'],
                        key: `消费`,
                        value: datum => `${renderQuotaNumberWithDigit(datum['Quota'], 3)} (${datum['Count']} 次)`
                    }
                ]
            }
        }
    };


    const type_line = {
        type: 'pie',
        data: [
            {
                id: 'typeData',
                values: [
                    { type: 'null', value: '0' },
                    { type: 'null', value: '0' },
                ]
            }
        ],
        outerRadius: 0.8,
        innerRadius: 0.5,
        padAngle: 0.6,
        valueField: 'value',
        categoryField: 'type',
        pie: {
            style: {
                cornerRadius: 10
            },
            state: {
                hover: {
                    outerRadius: 0.85,
                    stroke: '#000',
                    lineWidth: 1
                },
                selected: {
                    outerRadius: 0.85,
                    stroke: '#000',
                    lineWidth: 1
                }
            }
        },
        title: {
            visible: true,
        },
        legends: {
            visible: true,
            orient: 'left'
        },
        label: {
            visible: true
        },
        tooltip: {
            mark: {
                content: [
                    {
                        key: datum => `${datum['type']}额度`,
                        value: datum => `$${renderNumber(datum['value'])}`
                    },
                    {
                        key: datum => `${datum['type']}次数`,
                        value: datum => `${datum['count']}次`
                    }
                ]
            }
        }
    };
    

    const spec_pie = {
        type: 'pie',
        data: [
            {
                id: 'id0',
                values: [
                    { type: 'null', value: '0' },
                    { type: 'null', value: '0' },
                ]
            }
        ],
        outerRadius: 0.8,
        innerRadius: 0.5,
        padAngle: 0.6,
        valueField: 'value',
        categoryField: 'model_name',
        pie: {
            style: {
                cornerRadius: 10
            },
            state: {
                hover: {
                    outerRadius: 0.85,
                    stroke: '#000',
                    lineWidth: 1
                },
                selected: {
                    outerRadius: 0.85,
                    stroke: '#000',
                    lineWidth: 1
                }
            }
        },
        title: {
            visible: true,
        },
        legends: {
            visible: true,
            orient: 'left'
        },
        label: {
            visible: true
        },
        tooltip: {
            mark: {
                content: [
                    {
                        //key: datum => datum['model_name'],
                        key: `消费`,
                        value: datum => `${renderQuotaNumberWithDigit(datum['quota'], 3)} (${datum['value']} 次) `
                    }
                ]
            }
        }
    };

    const loadQuotaData = async (lineChart, pieChart,channelChart,typeChart) => {
        setLoading(true);
        try {
            let url = '';
            let localStartTimestamp = Date.parse(start_timestamp) / 1000;
            let localEndTimestamp = Date.parse(end_timestamp) / 1000;
            if (isAdminUser) {
                url = `/api/data/?username=${username}&start_timestamp=${localStartTimestamp}&end_timestamp=${localEndTimestamp}`;
            } 
            const res = await API.get(url);
            const {success, message, data} = res.data;
            if (success) {
                setQuotaData(data);
                if (data.length > 0) {
                    updateChartModel(pieChart, data);
                    updateChartUser(lineChart, data);
                    updateChartChannel(channelChart, data); 
                    updateQuotaComparisonChart(typeChart, data);  
                }
                
            } else {
                showError(message);
            }
        } catch (error) {
            showError(error.message); 
        } finally {
            setLoading(false); 
        }
    };

    const refresh = async () => {
        await loadQuotaData(modelDataChart, modelDataPieChart, channelDataChart,typeDataChart);
    };

    const initChart  = async () => {
        let lineChart = modelDataChart;
        if (!modelDataChart) {
            lineChart = new VChart(spec_line, {dom: 'user_data'});
            setModelDataChart(lineChart);
            await lineChart.renderAsync();
        }
        

        let channelChart = channelDataChart;
        if (!channelDataChart) {
            channelChart = new VChart(channel_line, {dom: 'channel_data'}); 
            setChannelDataChart(channelChart);
            await channelChart.renderAsync();
        }

        let typeChart = typeDataChart;
        if (!typeDataChart) {
            typeChart = new VChart(type_line, {dom: 'type_data'}); 
            setTypelDataChart(typeChart);
            await typeChart.renderAsync();
        }
        
        let pieChart = modelDataPieChart;
        if (!modelDataPieChart) {
            pieChart = new VChart(spec_pie, {dom: 'model_pie'});
            setModelDataPieChart(pieChart);
            await pieChart.renderAsync();
        }
        await loadQuotaData(lineChart, pieChart, channelChart,typeChart); 
    }

    const updateChartModel = (pieChart, data) => {
        let modelStatistics = {};
    
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            if (item.type === 2) { // 只考虑 type=2 的数据
                if (!modelStatistics[item.model_name]) {
                    modelStatistics[item.model_name] = { count: 0, quota: 0 };
                }
                modelStatistics[item.model_name].count += item.count;
                modelStatistics[item.model_name].quota += parseFloat(getQuotaWithUnit(item.quota)); 
            }
        }
        let modelUsageArray = Object.keys(modelStatistics).map(model_name => ({
            model_name,
            value: modelStatistics[model_name].count,
            quota: modelStatistics[model_name].quota, // 累加金额
        }));
    
        pieChart.updateData('id0', modelUsageArray);
        pieChart.reLayout();
    };
    

    const updateChartUser = (lineChart, data) => {
        // 初始化用户的使用量统计对象
        let userQuotaUsage = {};
    
    
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            if (item.type === 2) { // 只考虑 type=2 的数据
                if (!userQuotaUsage[item.username]) {
                    userQuotaUsage[item.username] = { Quota: 0, Count: 0 }; 
                }
                userQuotaUsage[item.username].Quota += parseFloat(getQuotaWithUnit(item.quota)); 
                userQuotaUsage[item.username].Count += item.count;                             
            }
        }
    
        // 转换为数组并排序用户的 Quota 使用量和调用次数
        let topUsersArray = Object.keys(userQuotaUsage).map(username => ({
            username,
            ...userQuotaUsage[username] // 展开Quota和Count
        })).sort((a, b) => b.Quota - a.Quota).slice(0, 10); // 取前10个元素
        
        lineChart.updateData('barData', topUsersArray);
        lineChart.reLayout();
    };
    

    const updateChartChannel = (channelChart, data) => {
        // 初始化 channel 的使用量统计对象
        let channelQuotaUsage = {};
    
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            if (item.type === 2) { // 只考虑 type=2 的数据
                if (!channelQuotaUsage[item.channel]) {
                    channelQuotaUsage[item.channel] = { Quota: 0, Count: 0 };
                }
                channelQuotaUsage[item.channel].Quota += parseFloat(getQuotaWithUnit(item.quota));
                channelQuotaUsage[item.channel].Count += item.count;
            }
        }
    
        // 转换为数组并排序 channel 的 Quota 使用量和调用次数
        let topChannelsArray = Object.keys(channelQuotaUsage).map(channel => ({
            channel,
            ...channelQuotaUsage[channel] // 展开Quota和Count
        })).sort((a, b) => b.Quota - a.Quota).slice(0, 10); // 取前10个元素
        
        channelChart.updateData('channelData', topChannelsArray);
        channelChart.reLayout();
    };
    


    
    const updateQuotaComparisonChart = (typeChart, data) => {
        // 初始化类型的使用量和次数统计对象
        let typeUsage = {
            recharge: { quota: 0, count: 0 },
            consumption: { quota: 0, count: 0 },
            admin: { quota: 0, count: 0 },
            system: { quota: 0, count: 0 }
        };
    
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            const quotaValue = parseFloat(getQuotaWithUnit(item.quota));
            // 假设 item.count 表示次数
            const countValue = item.count;
            if (quotaValue > 0) { // 只处理 quota 大于 0 的情况
                switch (item.type) {
                    case 1: // 充值
                        typeUsage.recharge.quota += quotaValue;
                        typeUsage.recharge.count += countValue;
                        break;
                    case 2: // 消费
                        typeUsage.consumption.quota += quotaValue;
                        typeUsage.consumption.count += countValue;
                        break;
                    case 3: // 管理
                        typeUsage.admin.quota += quotaValue;
                        typeUsage.admin.count += countValue;
                        break;
                    case 4: // 系统
                        typeUsage.system.quota += quotaValue;
                        typeUsage.system.count += countValue;
                        break;
                    // ... 其他case
                }
            }
        }
    
        // 转换为类型数据数组，用于图表
        let typeDataArray = [
            {
                type: '充值',
                value: typeUsage.recharge.quota.toFixed(4),
                count: typeUsage.recharge.count
            },
            {
                type: '消费',
                value: typeUsage.consumption.quota.toFixed(4),
                count: typeUsage.consumption.count
            },
            {
                type: '管理',
                value: typeUsage.admin.quota.toFixed(4),
                count: typeUsage.admin.count
            },
            {
                type: '系统',
                value: typeUsage.system.quota.toFixed(4),
                count: typeUsage.system.count
            }
        ];

    
        // 使用 typeChart 更新数据
        typeChart.updateData('typeData', typeDataArray);
        typeChart.reLayout();
    };
    
    

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            initChart();
        }
    }, []);

    return (
        <>
            <Layout>
                <Layout.Content>
                <Form layout='horizontal' style={{marginTop: 60}}>
                        <>
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
                                        onClick={refresh} loading={loading}>查询</Button>
                            </Form.Section>
                        </>
                    </Form>
                    <Spin spinning={loading}>
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Divider orientation="left">消费与充值</Divider> {/* 左侧分割线 */}
                                <div style={{ height: 300 }}>
                                    <div id="type_data" style={{ width: '100%', minHeight: 300 }}></div>
                                </div>
                            </Col>
                            <Col span={12}>
                                <Divider orientation="right">用户消耗</Divider> {/* 右侧分割线 */}
                                <div style={{ height: 300 }}>
                                    <div id="user_data" style={{ width: '100%', minHeight: 300 }}></div>
                                </div>
                            </Col>
                            <Col span={24}>
                                <Divider /> {/* 中间分割线 */}
                            </Col>
                            <Col span={12}>
                                <Divider orientation="left">模型使用量</Divider> {/* 左侧分割线 */}
                                <div style={{ height: 300 }}>
                                    <div id="model_pie" style={{ width: '100%', minHeight: 300 }}></div>
                                </div>
                            </Col>
                            <Col span={12}>
                                <Divider orientation="right">渠道使用</Divider> {/* 右侧分割线 */}
                                <div style={{ height: 300 }}>
                                    <div id="channel_data" style={{ width: '100%', minHeight: 300 }}></div>
                                </div>
                            </Col>
                        </Row>
                    </Spin>
                </Layout.Content>
            </Layout>
        </>
    );
};


export default Detail;

import React, {useEffect, useRef, useState} from 'react';
import {Button, Col, Form, Layout, Row, Spin,Divider} from "@douyinfe/semi-ui";
import VChart from '@visactor/vchart';
import {useEffectOnce} from "usehooks-ts";
import {API, isAdmin, showError, timestamp2string, timestamp2string1} from "../../helpers";
import {getQuotaWithUnit, renderNumber, renderQuotaNumberWithDigit} from "../../helpers/render";

const Detail = (props) => {

    let now = new Date();
    const [inputs, setInputs] = useState({
        username: '',
        token_name: '',
        model_name: '',
        start_timestamp: timestamp2string(now.getTime() / 1000 - 86400),
        end_timestamp: timestamp2string(now.getTime() / 1000 + 3600),
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
    const [quotaComparisonData, setQuotaComparisonData] = useState({consumption: [], recharge: []});
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
                        key: datum => datum['username'],
                        value: datum => renderQuotaNumberWithDigit(datum['Quota'], 4)
                    }
                ]
            },
            dimension: {
                content: [
                    {
                        key: datum => datum['username'],
                        value: datum => renderQuotaNumberWithDigit(datum['Quota'], 4)
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
                        key: datum => datum['channel'],
                        value: datum => renderQuotaNumberWithDigit(datum['Quota'], 4)
                    }
                ]
            },
            dimension: {
                content: [
                    {
                        key: datum => datum['channel'],
                        value: datum => renderQuotaNumberWithDigit(datum['Quota'], 4)
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
                        key: datum => datum['type'],
                        value: datum => renderNumber(datum['value'])
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
                        key: datum => datum['model_name'],
                        value: datum => renderNumber(datum['value'])
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
        // 初始化用户、channel 和 model 的使用量统计对象
        let modelCount = {};
    
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            if (item.type === 2) { // 只考虑 type=2 的数据
                // 统计每个 model 的 count
                if (!modelCount[item.model_name]) {
                    modelCount[item.model_name] = 0;
                }
                modelCount[item.model_name] += item.count;
            }
        }
        let modelUsageArray = Object.keys(modelCount).map(model_name => ({
            model_name,
            value: modelCount[model_name]
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
                    userQuotaUsage[item.username] = 0;
                }
                userQuotaUsage[item.username] += parseFloat(getQuotaWithUnit(item.quota));
            }
        }
    
        // 转换为数组并排序用户的 Quota 使用量
        let topUsersArray = Object.keys(userQuotaUsage).map(username => ({
            username,
            Quota: userQuotaUsage[username],
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
                    channelQuotaUsage[item.channel] = 0;
                }
                channelQuotaUsage[item.channel] += parseFloat(getQuotaWithUnit(item.quota));
            }
        }
    
        // 转换为数组并排序 channel 的 Quota 使用量
        let topChannelsArray = Object.keys(channelQuotaUsage).map(channel => ({
            channel,
            Quota: channelQuotaUsage[channel],
        })).sort((a, b) => b.Quota - a.Quota).slice(0, 10); // 取前10个元素
        
        // 确保使用 channelChart 而不是 lineChart
        channelChart.updateData('channelData', topChannelsArray);
        channelChart.reLayout();
    };

    
    const updateQuotaComparisonChart = (typeChart, data) => {
        // 初始化类型的使用量统计对象
        let typeUsage = {
            recharge: 0, // 充值总额
            consumption: 0, // 消费总额
            admin: 0, // 管理总额
            system: 0 // 系统总额
        };
    
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            const quotaValue = parseFloat(getQuotaWithUnit(item.quota));
            switch (item.type) {
                case 1: // 充值
                    typeUsage.recharge += quotaValue;
                    break;
                case 2: // 消费
                    typeUsage.consumption += quotaValue;
                    break;
                case 3: // 管理
                    typeUsage.admin += quotaValue;
                    break;
                case 4: // 系统
                    typeUsage.system += quotaValue;
                    break;
                default:
                    // 如果有未知类型，可以在这里处理
                    break;
            }
        }
    
        // 转换为类型数据数组，用于图表
        let typeDataArray = [
            { type: '充值', value: typeUsage.recharge.toFixed(4) },
            { type: '消费', value: typeUsage.consumption.toFixed(4) },
            { type: '管理', value: typeUsage.admin.toFixed(4) },
            { type: '系统', value: typeUsage.system.toFixed(4) }
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
                <Form layout='horizontal' style={{marginTop: 10}}>
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

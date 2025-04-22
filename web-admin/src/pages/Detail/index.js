import React, { useEffect, useRef, useState } from 'react';
import { Button, Col, Form, Layout, Row, Spin, Divider, Modal, Card, Space, Typography } from "@douyinfe/semi-ui";
import { IconPriceTag, IconHistogram, IconCreditCard } from '@douyinfe/semi-icons';
import VChart from '@visactor/vchart';
import { API, isAdmin, showError, timestamp2string } from "../../helpers";
import { getQuotaWithUnit, renderNumber, renderQuotaNumberWithDigit } from "../../helpers/render";

const Detail = (props) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const startOfTodayTimestamp = now.getTime() / 1000;
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
    const { username, start_timestamp, end_timestamp, channel } = inputs;
    const isAdminUser = isAdmin();
    const initialized = useRef(false);
    const [modelDataChart, setModelDataChart] = useState(null);
    const [modelDataPieChart, setModelDataPieChart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quotaData, setQuotaData] = useState([]);
    const [channelDataChart, setChannelDataChart] = useState(null);
    const [typeDataChart, setTypelDataChart] = useState(null);
    const [hourlyDataChart, setHourlyDataChart] = useState(null);

    // 新增统计数据状态
    const [statsData, setStatsData] = useState({
        totalSales: 0,
        totalCount: 0,
        promptTokens: 0,
        completionTokens: 0
    });

    const [selectedUser, setSelectedUser] = useState(null);
    const [userModalVisible, setUserModalVisible] = useState(false);
    const [modalLoading, setModalLoading] = useState(true);

    const [selectedModel, setSelectedModel] = useState(null);
    const [modelModalVisible, setModelModalVisible] = useState(false);
    const [modelHourlyData, setModelHourlyData] = useState([]);

    const handleInputChange = (value, name) => {
        setInputs((inputs) => ({ ...inputs, [name]: value }));
    };

    // 每小时消费的图表配置
    const hourly_chart = {
        type: 'common',
        data: [
            {
                id: 'countData',
                values: []
            },
            {
                id: 'quotaData',
                values: []
            }
        ],
        series: [
            {
                type: 'line',
                dataId: 'countData',
                xField: 'hour',
                yField: 'value',
                name: '调用次数',
                line: { 
                    smooth: true,
                },
                point: {
                    visible: true,
                    size: 4,
                    state: {
                        hover: {
                            size: 6
                        }
                    }
                }
            },
            {
                type: 'line',
                dataId: 'quotaData',
                xField: 'hour',
                yField: 'value',
                name: '消费额',
                line: { 
                    smooth: true,
                    
                },
                point: {
                    visible: true,
                    size: 4,
                    state: {
                        hover: {
                            size: 6
                        }
                    },
                    
                }
            }
        ],
        axes: [
            { orient: 'bottom', type: 'band' },
            {
                orient: 'left',
                seriesIndex: 0,  // 调用次数使用左轴
                title: {
                    visible: true,
                    text: '调用次数'
                },
                type: 'linear'
            },
            {
                orient: 'right',
                seriesIndex: 1,  // 消费金额使用右轴
                title: {
                    visible: true,
                    text: '消费金额'
                },
                type: 'linear'
            }
        ],
        legends: {
            visible: true
        },
        tooltip: {
            mark: {
                content: [
                    {
                        key: datum => datum.hasOwnProperty('name') ? datum.name : '调用次数',
                        value: datum => {
                            if (datum.hasOwnProperty('name') && datum.name === '消费额') {
                                return `$${renderQuotaNumberWithDigit(datum['value'], 3)}`;
                            } else {
                                return `${datum['value']} 次`;
                            }
                        }
                    }
                ]
            }
        }
    };

    const spec_line = {
        type: 'bar',
        data: [
            {
                id: 'barData',
                values: []
            }
        ],
        xField: 'username',
        yField: 'Quota',
        seriesField: 'username',
        stack: false,
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
                    lineWidth: 1,
                    // Optional: Add fill color change on hover
                    // fill: '#yourHoverColor' 
                }
            },
            style: {
                cornerRadius: 5 // Add rounded corners to bars
            }
        },
        tooltip: {
            mark: {
                content: [
                    {
                        key: `消费`,
                        value: datum => `${renderQuotaNumberWithDigit(datum['Quota'], 3)} (${datum['Count']} 次)`
                    }
                ]
            },
            dimension: {
                content: [
                    {
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
                values: []
            }
        ],
        xField: 'channel',
        yField: 'Quota',
        seriesField: 'channel',
        stack: false,
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
                    // Optional: Add fill color change on hover
                    // fill: '#yourHoverColor'
                }
            },
            style: {
                cornerRadius: 5 // Add rounded corners to bars
            }
        },
        tooltip: {
            mark: {
                content: [
                    {
                        key: `消费`,
                        value: datum => `${renderQuotaNumberWithDigit(datum['Quota'], 3)} (${datum['Count']} 次)`
                    }
                ]
            },
            dimension: {
                content: [
                    {
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
                    { type: '充值', value: '0', count: 0 },
                    { type: '管理', value: '0', count: 0 },
                    { type: '系统', value: '0', count: 0 }
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
                        key: '使用金额',
                        value: datum => `${renderQuotaNumberWithDigit(datum['value'], 3)}`
                    },
                    {
                        key: '使用次数',
                        value: datum => `${datum['count']} 次`
                    }
                ]
            }
        }
    };

    const loadQuotaData = async (lineChart, pieChart, channelChart, typeChart, hourlyChart) => {
        setLoading(true);
        let localStartTimestamp = Date.parse(start_timestamp) / 1000;
        let localEndTimestamp = Date.parse(end_timestamp) / 1000;
        try {
            let url = '';
            if (isAdminUser) {
                url = `/api/data/?username=${username}&start_timestamp=${localStartTimestamp}&end_timestamp=${localEndTimestamp}`;
            }
            const res = await API.get(url);
            const { success, message, data } = res.data;
            if (success) {
                setQuotaData(data);
                if (data.length > 0) {
                    updateChartModel(pieChart, data);
                    updateChartUser(lineChart, data);
                    updateChartChannel(channelChart, data);
                    updateQuotaComparisonChart(typeChart, data);
                    if (hourlyChart) { 
                        updateHourlyConsumptionChart(hourlyChart, data, localStartTimestamp, localEndTimestamp);
                    }
                    calculateStatsData(data);
                } else {
                    if (hourlyChart) {
                        hourlyChart.updateData('countData', []);
                        hourlyChart.updateData('quotaData', []);
                        hourlyChart.reLayout();
                    }
                    setStatsData({ totalSales: 0, totalCount: 0, promptTokens: 0, completionTokens: 0 });
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

    // 计算统计数据
    const calculateStatsData = (data) => {
        let totalSales = 0;
        let totalCount = 0;
        let promptTokens = 0;
        let completionTokens = 0;

        data.forEach(item => {
            if (item.type === 2) { // 消费类型
                totalSales += parseFloat(getQuotaWithUnit(item.quota));
                totalCount += item.count;
                promptTokens += item.prompt_tokens || 0; // 累加prompt_tokens
                completionTokens += item.completion_tokens || 0; // 累加completion_tokens
            }
        });

        setStatsData({
            totalSales: totalSales.toFixed(4),
            totalCount,
            promptTokens,
            completionTokens
        });
    };

    // 更新每小时消费图表 - 现在将基于选定的时间范围
    const updateHourlyConsumptionChart = (hourlyChart, data, startTime, endTime) => {
        // Filter data based on the selected time range and type
        const consumptionData = data.filter(item => 
            item.type === 2 && 
            item.created_at >= startTime && 
            item.created_at < endTime
        );

        // Use a Map for flexible hourly aggregation keyed by 'YYYY-MM-DD HH:00'
        const hourlyConsumptionMap = new Map();

        // Aggregate data into the map
        consumptionData.forEach(item => {
            const date = new Date(item.created_at * 1000);
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const hour = date.getHours();
            const key = `${year}-${month}-${day} ${hour.toString().padStart(2, '0')}:00`;

            if (!hourlyConsumptionMap.has(key)) {
                hourlyConsumptionMap.set(key, { quota: 0, count: 0 });
            }
            const current = hourlyConsumptionMap.get(key);
            current.quota += parseFloat(getQuotaWithUnit(item.quota));
            current.count += item.count;
        });

        // Generate chart data points for every hour within the range
        const countData = [];
        const quotaData = [];
        let currentTimestamp = startTime * 1000;
        const endTimestampMs = endTime * 1000;

        while (currentTimestamp < endTimestampMs) {
            const date = new Date(currentTimestamp);
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const hour = date.getHours();
            const key = `${year}-${month}-${day} ${hour.toString().padStart(2, '0')}:00`;
            const displayHour = `${hour.toString().padStart(2, '0')}:00`; // Basic hour label
            // More descriptive label if range spans multiple days
            const label = (endTime - startTime > 24 * 3600) ? key : displayHour;

            const aggregatedData = hourlyConsumptionMap.get(key) || { quota: 0, count: 0 };

            countData.push({
                hour: label, 
                value: aggregatedData.count,
                name: '调用次数'
            });
            
            quotaData.push({
                hour: label,
                value: Number(aggregatedData.quota.toFixed(3)),
                name: '消费额'
            });

            // Move to the next hour
            currentTimestamp += 3600 * 1000;
        }

        // Update VChart with two separate datasets
        hourlyChart.updateData('countData', countData);
        hourlyChart.updateData('quotaData', quotaData);
        hourlyChart.reLayout();
    };

    const refresh = async () => {
        await loadQuotaData(modelDataChart, modelDataPieChart, channelDataChart, typeDataChart, hourlyDataChart);
    };

    const initChart = async () => {
        let lineChart = modelDataChart;
        if (!modelDataChart) {
            lineChart = new VChart(spec_line, { dom: 'user_data' });
            setModelDataChart(lineChart);
            await lineChart.renderAsync();
        }

        let channelChart = channelDataChart;
        if (!channelDataChart) {
            channelChart = new VChart(channel_line, { dom: 'channel_data' });
            setChannelDataChart(channelChart);
            await channelChart.renderAsync();
        }

        let typeChart = typeDataChart;
        if (!typeDataChart) {
            typeChart = new VChart(type_line, { dom: 'type_data' });
            setTypelDataChart(typeChart);
            await typeChart.renderAsync();
        }

        let pieChart = modelDataPieChart;
        if (!modelDataPieChart) {
            pieChart = new VChart(spec_pie, { dom: 'model_pie' });
            setModelDataPieChart(pieChart);
            await pieChart.renderAsync();
        }


        let hourlyChart = hourlyDataChart;
        if (!hourlyDataChart) {
            hourlyChart = new VChart(hourly_chart, { dom: 'hourly_data' });
            setHourlyDataChart(hourlyChart);
            await hourlyChart.renderAsync();
        }
        
        await loadQuotaData(lineChart, pieChart, channelChart, typeChart, hourlyChart);
    };

     const updateUserDetailCharts = (username, data) => {
        const userData = data.filter(item => item.username === username && item.type === 2);
        setModalLoading(true);
        // Get the global start/end time for consistency
        let localStartTimestamp = Date.parse(start_timestamp) / 1000;
        let localEndTimestamp = Date.parse(end_timestamp) / 1000;
        setTimeout(() => {
            renderUserModelChart(userData);
            renderUserHourlyChart(userData, localStartTimestamp, localEndTimestamp); // Pass timestamps
            setModalLoading(false);
        }, 300);
    };
    
    const renderUserModelChart = (userData) => {
        let modelUsage = {};
        userData.forEach(item => {
            if (!modelUsage[item.model_name]) {
                modelUsage[item.model_name] = { count: 0, quota: 0 };
            }
            modelUsage[item.model_name].count += item.count;
            modelUsage[item.model_name].quota += parseFloat(getQuotaWithUnit(item.quota)); // 直接使用 quota 数据
        });
    
        const modelData = Object.keys(modelUsage).map(model => ({
            model_name: model,
            value: modelUsage[model].quota,// 确保 quota 为字符串类型
            count: modelUsage[model].count 
        }));
    
        const spec = {
            type: 'pie',
            data: [{ id: 'modelData', values: modelData }],
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
                orient: 'bottom'
            },
            label: {
                visible: true
            },
            tooltip: {
                mark: {
                    content: [
                        {
                            key: '使用金额',
                            value: datum => `${renderQuotaNumberWithDigit(datum['value'], 3)}`
                        },
                        {
                            key: '使用次数',
                            value: datum => `${datum['count']} 次`
                        }
                    ]
                }
            }
            };
    
            new VChart(spec, { dom: 'userModelChart' }).renderAsync();
    };
    
    const renderUserHourlyChart = (userData, startTime, endTime) => {
        // Filter data further by the provided time range
        const timeFilteredUserData = userData.filter(item => 
            item.created_at >= startTime && item.created_at < endTime
        );
        
        const hourlyConsumptionMap = new Map();
        timeFilteredUserData.forEach(item => {
            const date = new Date(item.created_at * 1000);
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const hour = date.getHours();
            const key = `${year}-${month}-${day} ${hour.toString().padStart(2, '0')}:00`;

            if (!hourlyConsumptionMap.has(key)) {
                hourlyConsumptionMap.set(key, { value: 0, count: 0 });
            }
            const current = hourlyConsumptionMap.get(key);
            current.value += parseFloat(getQuotaWithUnit(item.quota));
            current.count += item.count;
        });

        const countData = [];
        const quotaData = [];
        let currentTimestamp = startTime * 1000;
        const endTimestampMs = endTime * 1000;

        while (currentTimestamp < endTimestampMs) {
            const date = new Date(currentTimestamp);
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const hour = date.getHours();
            const key = `${year}-${month}-${day} ${hour.toString().padStart(2, '0')}:00`;
            const displayHour = `${hour.toString().padStart(2, '0')}:00`;
            const label = (endTime - startTime > 24 * 3600) ? key : displayHour;

            const aggregatedData = hourlyConsumptionMap.get(key) || { value: 0, count: 0 };

            countData.push({ time: label, value: aggregatedData.count, name: '次数' });
            quotaData.push({ time: label, value: Number(aggregatedData.value.toFixed(3)), name: '金额' });

            currentTimestamp += 3600 * 1000;
        }
        
        // Use 'time' for xField, matching the generated data key
        const spec = {
            type: 'common',
            data: [
                {
                    id: 'userCountData',
                    values: countData
                },
                {
                    id: 'userQuotaData',
                    values: quotaData
                }
            ],
            series: [
                {
                    type: 'line',
                    dataId: 'userCountData',
                    xField: 'time',
                    yField: 'value',
                    name: '次数',
                    line: { smooth: true },
                    point: {
                        visible: true,
                        size: 3,
                        state: {
                            hover: {
                                size: 5
                            }
                        }
                    }
                },
                {
                    type: 'line',
                    dataId: 'userQuotaData',
                    xField: 'time',
                    yField: 'value',
                    name: '金额',
                    line: { 
                        smooth: true,
                        
                    },
                    point: {
                        visible: true,
                        size: 3,
                        state: {
                            hover: {
                                size: 5
                            }
                        },
                        
                    }
                }
            ],
            axes: [
                { 
                    orient: 'bottom', 
                    type: 'band',
                    label: { rotate: 45 },
                },
                {
                    orient: 'left',
                    seriesIndex: 0,
                    title: {
                        visible: true,
                        text: '调用次数'
                    },
                    type: 'linear'
                },
                {
                    orient: 'right',
                    seriesIndex: 1,
                    title: {
                        visible: true,
                        text: '消费金额'
                    },
                    type: 'linear'
                }
            ],
            legends: { visible: true },
            tooltip: {
                mark: {
                    content: [
                        {
                            key: datum => datum.name,
                            value: datum => {
                                if (datum.name === '金额') {
                                    return `$${renderQuotaNumberWithDigit(datum['value'], 3)}`;
                                } else {
                                    return `${datum['value']} 次`;
                                }
                            }
                        }
                    ]
                }
            }
        };

        const CONTAINER_ID = 'userHourlyChart';
        // Ensure container exists before rendering
        const container = document.getElementById(CONTAINER_ID);
        if (container) {
             // Clear previous chart instance if exists?
             // Might need VChart instance management if re-rendering
             let vchart = new VChart(spec, { dom: container });
             vchart.renderSync();
             window['vchart_user'] = vchart; // Use different debug name
        } else {
             console.error(`Container with id "${CONTAINER_ID}" not found for user hourly chart.`);
        }
    };
    
    const updateChartModel = (pieChart, data) => {
        let modelStatistics = {};
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            if (item.type === 2) {
                if (!modelStatistics[item.model_name]) {
                    modelStatistics[item.model_name] = { count: 0, quota: 0 };
                }
                modelStatistics[item.model_name].count += item.count;
                modelStatistics[item.model_name].quota += parseFloat(getQuotaWithUnit(item.quota));
            }
        }
        let modelUsageArray = Object.keys(modelStatistics).map(model_name => ({
            model_name,
            value: modelStatistics[model_name].quota, // 使用金额而不是次数
            count: modelStatistics[model_name].count,
        }));

        pieChart.updateData('id0', modelUsageArray);
        pieChart.reLayout();
        pieChart.on('click', (params) => {
            if (params.datum) {
                const modelName = params.datum.model_name;
                setSelectedModel(modelName);
                setModelModalVisible(true);
                processModelHourlyData(modelName, data);
            }
        });
    };

    const processModelHourlyData = (modelName, data) => {
        const modelData = data.filter(item => item.model_name === modelName && item.type === 2);
        setModalLoading(true);
        let localStartTimestamp = Date.parse(start_timestamp) / 1000;
        let localEndTimestamp = Date.parse(end_timestamp) / 1000;
        setTimeout(() => {
            modelHourlyChart(modelData, localStartTimestamp, localEndTimestamp); // Pass timestamps
            setModalLoading(false);
        }, 300);
    };
    
    const modelHourlyChart = (modelData, startTime, endTime) => {
        // Filter data further by the provided time range
        const timeFilteredModelData = modelData.filter(item => 
            item.created_at >= startTime && item.created_at < endTime
        );

        const hourlyConsumptionMap = new Map();
        timeFilteredModelData.forEach(item => {
            const date = new Date(item.created_at * 1000);
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const hour = date.getHours();
            const key = `${year}-${month}-${day} ${hour.toString().padStart(2, '0')}:00`;

            if (!hourlyConsumptionMap.has(key)) {
                hourlyConsumptionMap.set(key, { value: 0, count: 0 });
            }
            const current = hourlyConsumptionMap.get(key);
            current.value += parseFloat(getQuotaWithUnit(item.quota));
            current.count += item.count;
        });

        const countData = [];
        const quotaData = [];
        let currentTimestamp = startTime * 1000;
        const endTimestampMs = endTime * 1000;

        while (currentTimestamp < endTimestampMs) {
            const date = new Date(currentTimestamp);
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const hour = date.getHours();
            const key = `${year}-${month}-${day} ${hour.toString().padStart(2, '0')}:00`;
            const displayHour = `${hour.toString().padStart(2, '0')}:00`;
            const label = (endTime - startTime > 24 * 3600) ? key : displayHour;

            const aggregatedData = hourlyConsumptionMap.get(key) || { value: 0, count: 0 };

            countData.push({ time: label, value: aggregatedData.count, name: '次数' });
            quotaData.push({ time: label, value: Number(aggregatedData.value.toFixed(6)), name: '金额' });

            currentTimestamp += 3600 * 1000;
        }

        const spec = {
            type: 'common',
            data: [
                {
                    id: 'modelCountData',
                    values: countData
                },
                {
                    id: 'modelQuotaData',
                    values: quotaData
                }
            ],
            series: [
                {
                    type: 'line',
                    dataId: 'modelCountData',
                    xField: 'time',
                    yField: 'value',
                    name: '次数',
                    line: { smooth: true },
                    point: {
                        visible: true,
                        size: 3,
                        state: {
                            hover: {
                                size: 5
                            }
                        }
                    }
                },
                {
                    type: 'line',
                    dataId: 'modelQuotaData',
                    xField: 'time',
                    yField: 'value',
                    name: '金额',
                    line: { 
                        smooth: true,
                       
                    },
                    point: {
                        visible: true,
                        size: 3,
                        state: {
                            hover: {
                                size: 5
                            }
                        },
                        
                    }
                }
            ],
            axes: [
                { 
                    orient: 'bottom', 
                    type: 'band',
                    label: { rotate: 45 },
                },
                {
                    orient: 'left',
                    seriesIndex: 0,
                    title: {
                        visible: true,
                        text: '调用次数'
                    },
                    type: 'linear'
                },
                {
                    orient: 'right',
                    seriesIndex: 1,
                    title: {
                        visible: true,
                        text: '消费金额'
                    },
                    type: 'linear'
                }
            ],
            legends: { visible: true }, 
            tooltip: {
                mark: {
                    content: [
                        {
                            key: datum => datum.name,
                            value: datum => {
                                if (datum.name === '金额') {
                                    return `$${renderQuotaNumberWithDigit(datum['value'], 3)}`;
                                } else {
                                    return `${datum['value']} 次`;
                                }
                            }
                        }
                    ]
                }
            }
        };

        const CONTAINER_ID = 'renderModelHourlyChart';
        const container = document.getElementById(CONTAINER_ID);
        if (!container) {
            console.error(`Container with id "${CONTAINER_ID}" not found`);
            return;
        }
        // Clear previous chart instance if exists?
        // Might need VChart instance management if re-rendering
        let vchart = new VChart(spec, { dom: container }); 
        vchart.renderSync();
        window['vchart_model'] = vchart; // Use different debug name
    };
    

    const updateChartUser = (lineChart, data) => {
        let userQuotaUsage = {};

        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            if (item.type === 2) {
                if (!userQuotaUsage[item.username]) {
                    userQuotaUsage[item.username] = { Quota: 0, Count: 0 };
                }
                userQuotaUsage[item.username].Quota += parseFloat(getQuotaWithUnit(item.quota));
                userQuotaUsage[item.username].Count += item.count;
            }
        }

        let topUsersArray = Object.keys(userQuotaUsage).map(username => ({
            username,
            ...userQuotaUsage[username]
        })).sort((a, b) => b.Quota - a.Quota).slice(0, 10);

        lineChart.updateData('barData', topUsersArray);
        lineChart.reLayout();
        lineChart.on('click', (params) => {
            if (params.datum) {
                const username = params.datum.username;
                setSelectedUser(username);
                setUserModalVisible(true);
                updateUserDetailCharts(username, data);
            }
        });
    };

    const updateChartChannel = (channelChart, data) => {
        let channelQuotaUsage = {};

        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            if (item.type === 2) {
                if (!channelQuotaUsage[item.channel]) {
                    channelQuotaUsage[item.channel] = { Quota: 0, Count: 0 };
                }
                channelQuotaUsage[item.channel].Quota += parseFloat(getQuotaWithUnit(item.quota));
                channelQuotaUsage[item.channel].Count += item.count;
            }
        }

        let topChannelsArray = Object.keys(channelQuotaUsage).map(channel => ({
            channel,
            ...channelQuotaUsage[channel]
        })).sort((a, b) => b.Quota - a.Quota).slice(0, 10);

        channelChart.updateData('channelData', topChannelsArray);
        channelChart.reLayout();
    };

    const updateQuotaComparisonChart = (typeChart, data) => {
        let typeUsage = {
            recharge: { quota: 0, count: 0 },
            admin: { quota: 0, count: 0 },
            system: { quota: 0, count: 0 }
        };

        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            const quotaValue = parseFloat(getQuotaWithUnit(item.quota));
            const countValue = item.count;
            if (quotaValue > 0) {
                switch (item.type) {
                    case 1:
                        typeUsage.recharge.quota += quotaValue;
                        typeUsage.recharge.count += countValue;
                        break;
                    case 3:
                        typeUsage.admin.quota += quotaValue;
                        typeUsage.admin.count += countValue;
                        break;
                    case 4:
                        typeUsage.system.quota += quotaValue;
                        typeUsage.system.count += countValue;
                        break;
                }
            }
        }

        // 确保即使数据为0也显示
        let typeDataArray = [
            {
                type: '充值',
                value: typeUsage.recharge.quota.toFixed(4),
                count: typeUsage.recharge.count
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

        // 检查是否所有数据都为0
        const allZero = typeDataArray.every(item => parseFloat(item.value) === 0);
        
        if (allZero) {
            // 如果所有数据都为0，添加一个小的偏移量以确保饼图能够显示
            typeDataArray = typeDataArray.map(item => ({
                ...item,
                value: '0.0001' // 添加一个很小的值，使饼图能够显示
            }));
        }

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
                <Layout.Content style={{ padding: '16px' }}>
                    <Card>
                        <Form layout='horizontal'>
                            <Row>
                                <Col span={8}>
                                    <Form.DatePicker style={{ width: '100%' }}
                                        initValue={start_timestamp}
                                        value={start_timestamp} type='dateTime'
                                        name='start_timestamp'
                                        onChange={value => handleInputChange(value, 'start_timestamp')} />
                                </Col>
                                <Col span={8}>
                                    <Form.DatePicker style={{ width: '100%' }}
                                        initValue={end_timestamp}
                                        value={end_timestamp} type='dateTime'
                                        name='end_timestamp'
                                        onChange={value => handleInputChange(value, 'end_timestamp')} />
                                </Col>
                                <Col span={8}>
                                    <Button type="primary" htmlType="submit" 
                                        style={{ marginLeft: '16px' }}
                                        onClick={refresh} loading={loading}>查询</Button>
                                </Col>
                            </Row>
                        </Form>
                    </Card>

                    <Spin spinning={loading} style={{ marginTop: '16px' }}>
                        {/* 统计卡片 */}
                        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                            <Col span={6}>
                                <Card bodyStyle={{ padding: '20px' }} shadows='hover'>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <IconPriceTag size="large" style={{ color: '#1677ff', marginBottom: '8px' }} />
                                        <Typography.Title heading={5} style={{ margin: '4px 0' }}>总销售额</Typography.Title>
                                        <Typography.Title heading={2} style={{ margin: '8px 0', color: '#1677ff' }}>{statsData.totalSales}</Typography.Title>
                                    </div>
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card bodyStyle={{ padding: '20px' }} shadows='hover'>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <IconHistogram size="large" style={{ color: '#52c41a', marginBottom: '8px' }} />
                                        <Typography.Title heading={5} style={{ margin: '4px 0' }}>总调用次数</Typography.Title>
                                        <Typography.Title heading={2} style={{ margin: '8px 0', color: '#52c41a' }}>{statsData.totalCount}</Typography.Title>
                                    </div>
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card bodyStyle={{ padding: '20px' }} shadows='hover'>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <IconCreditCard size="large" style={{ color: '#fa8c16', marginBottom: '8px' }} />
                                        <Typography.Title heading={5} style={{ margin: '4px 0' }}>Prompt Tokens</Typography.Title>
                                        <Typography.Title heading={2} style={{ margin: '8px 0', color: '#fa8c16' }}>{statsData.promptTokens}</Typography.Title>
                                    </div>
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card bodyStyle={{ padding: '20px' }} shadows='hover'>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <IconCreditCard size="large" style={{ color: '#722ed1', marginBottom: '8px' }} />
                                        <Typography.Title heading={5} style={{ margin: '4px 0' }}>Completion Tokens</Typography.Title>
                                        <Typography.Title heading={2} style={{ margin: '8px 0', color: '#722ed1' }}>{statsData.completionTokens}</Typography.Title>
                                    </div>
                                </Card>
                            </Col>
                        </Row>

                        {/* 每小时消费趋势 */}
                        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                            <Col span={24}>
                                <Card bodyStyle={{ padding: '16px' }} shadows='hover' title="每小时消费趋势">
                                    <div style={{ height: 300 }}>
                                        <div id="hourly_data" style={{ width: '100%', minHeight: 300 }}></div>
                                    </div>
                                </Card>
                            </Col>
                        </Row>

                        {/* 图表卡片组 */}
                        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                            <Col span={12}>
                                <Card bodyStyle={{ padding: '16px' }} shadows='hover' title="充值情况">
                                    <div style={{ height: 300 }}>
                                        <div id="type_data" style={{ width: '100%', minHeight: 300 }}></div>
                                        {statsData.totalSales === '0.0000' && (
                                            <div style={{ 
                                                position: 'absolute', 
                                                top: '50%', 
                                                left: '50%', 
                                                transform: 'translate(-50%, -50%)',
                                                color: '#999',
                                                fontSize: '14px'
                                            }}>
                                                暂无充值数据
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card bodyStyle={{ padding: '16px' }} shadows='hover' title="用户消耗">
                                    <div style={{ height: 300 }}>
                                        <div id="user_data" style={{ width: '100%', minHeight: 300 }}></div>
                                    </div>
                                </Card>
                            </Col>
                        </Row>

                        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                            <Col span={12}>
                                <Card bodyStyle={{ padding: '16px' }} shadows='hover' title="模型使用量">
                                    <div style={{ height: 300 }}>
                                        <div id="model_pie" style={{ width: '100%', minHeight: 300 }}></div>
                                    </div>
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card bodyStyle={{ padding: '16px' }} shadows='hover' title="渠道使用">
                                    <div style={{ height: 300 }}>
                                        <div id="channel_data" style={{ width: '100%', minHeight: 300 }}></div>
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    </Spin>
                </Layout.Content>
            </Layout>

            {/* 用户详情模态框 */}
            <Modal
                title={`${selectedUser} 的详细使用情况`}
                visible={userModalVisible}
                onCancel={() => setUserModalVisible(false)}
                width={1200}
                footer={null} 
                closable={true} 
                style={{ top: 20 }}
            >
                <Spin spinning={modalLoading}>
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Card bodyStyle={{ padding: '16px' }} shadows='hover' title="模型使用分布">
                                <div id="userModelChart" style={{ height: '400px' }}></div>
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card bodyStyle={{ padding: '16px' }} shadows='hover' title="时间消费分布">
                                <div id="userHourlyChart" style={{ height: '400px' }}></div>
                            </Card>
                        </Col>
                    </Row>
                </Spin>
            </Modal>

            {/* 模型详情模态框 */}
            <Modal
                title={`${selectedModel} 最近24小时使用情况`}
                visible={modelModalVisible}
                onCancel={() => setModelModalVisible(false)}
                width={1000}
                footer={null} 
                closable={true} 
                style={{ top: 20 }}
            >
                <Spin spinning={loading}>
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Card bodyStyle={{ padding: '16px' }} shadows='hover'>
                                <div id="renderModelHourlyChart" style={{ width: '100%', height: '400px' }}></div>
                            </Card>
                        </Col>
                    </Row>
                </Spin>
            </Modal>
        </>
    );
};

export default Detail;

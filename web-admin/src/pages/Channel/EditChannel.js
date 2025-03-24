import React, {useEffect, useRef, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {API, isMobile, showError, showInfo, showSuccess, verifyJSON} from '../../helpers';
import {CHANNEL_OPTIONS} from '../../constants';
import Title from "@douyinfe/semi-ui/lib/es/typography/title";
import {SideSheet, Space, Spin, Button, Input,TagInput, Typography, Select, TextArea, Checkbox, Banner,AutoComplete} from "@douyinfe/semi-ui";

const MODEL_MAPPING_EXAMPLE = {
    'gpt-3.5-turbo-0301': 'gpt-3.5-turbo',
    'gpt-4-0314': 'gpt-4',
    'gpt-4-32k-0314': 'gpt-4-32k'
};
const STATUS_CODE_MAPPING_EXAMPLE = {
    '400': '500',
  };
  const DEFAULT_GEMINI_MODELS = [
    'gemini-1.5-pro-002',
    'gemini-1.5-flash-002',
    'gemini-1.5-pro-latest',
    'gemini-1.5-flash-latest',
    'gemini-exp-1206',
    'gemini-2.0-flash-exp',
    'gemini-2.0-flash',
    'gemini-2.0-flash-001',
    'gemini-2.0-flash-lite-preview',
    'gemini-2.0-flash-lite-preview-02-05',
    'gemini-2.0-pro-exp',
    'gemini-2.0-pro-exp-02-05',
];
function type2secretPrompt(type) {
    // inputs.type === 15 ? '按照如下格式输入：APIKey|SecretKey' : (inputs.type === 18 ? '按照如下格式输入：APPID|APISecret|APIKey' : '请输入渠道对应的鉴权密钥')
    switch (type) {
        case 15:
            return '按照如下格式输入：APIKey|SecretKey';
        case 18:
            return '按照如下格式输入：APPID|APISecret|APIKey';
        case 22:
            return '按照如下格式输入：APIKey-AppId，例如：fastgpt-0sp2gtvfdgyi4k30jwlgwf1i-64f335d84283f05518e9e041';
        case 23:
            return '按照如下格式输入：AppId|SecretId|SecretKey';
        default:
            return '请输入渠道对应的鉴权密钥';
    }
}

const EditChannel = (props) => {
    const navigate = useNavigate();
    const channelId = props.editingChannel.id;
    const isEdit = channelId !== undefined;
    const [loading, setLoading] = useState(isEdit);
    const handleCancel = () => {
        props.handleClose()
    };
    const originInputs = {
        name: '',
        type: 1,
        key: '',
        openai_organization: '',
        base_url: '',
        other: '',
        model_mapping: '',
        status_code_mapping: '',
        headers: '',
        models: [],
        auto_ban: 1,
        is_image_url_enabled: 0,
        model_test: '', 
        tested_time:'',
        priority:'',
        weight:'',
        groups: ['default'],
        proxy_url :'',
        region: '',
        sk: '',
        ak: '',
        project_id:'',
        client_id:'',
        client_secret:'',
        refresh_token:'',
        gcp_account:'',
        rate_limit_count:'',
        gemini_model: '',
        tags: '',
    };
    const [batch, setBatch] = useState(false);
    const [autoBan, setAutoBan] = useState(true);
    // const [autoBan, setAutoBan] = useState(true);
    const [inputs, setInputs] = useState(originInputs);
    const [originModelOptions, setOriginModelOptions] = useState([]);
    const [modelOptions, setModelOptions] = useState([]);
    const [groupOptions, setGroupOptions] = useState([]);
    const [basicModels, setBasicModels] = useState([]);
    const [fullModels, setFullModels] = useState([]);
    const [customModel, setCustomModel] = useState('');
    const [batchProxy, setBatchProxy] = useState(false);
    const [proxyInputs, setProxyInputs] = useState(''); // 新增状态来存储批量代理输入
    const [restartDelay, setRestartDelay] = useState(0); 
    const [priority, setPriority] = useState(0);
    const [weight, setWeight] = useState(0);
    const [rateLimited, setRateLimited] = useState(false);
    const [rateLimitedConut, setRateLimitedConut] = useState(0);
    const [istools, setIstools] = useState(true);
    const [isimageurenabled, setIsImageURLEnabled] = useState(false);
    const [claudeoriginalrequest, setClaudeOriginalRequest] = useState(false);
    const [supportsCacheControl, setSupportsCacheControl] = useState(false);
    const [config, setConfig] = useState({
        region: '',
        sk: '',
        ak: '',
        cross: '',
        user_id: '',
        project_id:'',
        client_id:'',
        client_secret:'',
        refresh_token:'',
        gemini_model: '',
      });
    const handleInputChange = (name, value) => {
        setInputs((inputs) => ({...inputs, [name]: value}));
        if (name === 'type' && inputs.models.length === 0) {
            let localModels = [];
            // eslint-disable-next-line default-case
            switch (value) {
                case 14:
                    localModels = ['claude-instant-1.2', 'claude-2.0', 'claude-2.1', 'claude-3-haiku-20240307','claude-3-5-sonnet-20240620','claude-3-opus-20240229','claude-3-sonnet-20240229','claude-3-5-sonnet-20241022'];
                    break;
                case 42:
                    localModels = ['claude-3-haiku-20240307','claude-3-5-sonnet-20240620','claude-3-opus-20240229','claude-3-sonnet-20240229','claude-3-5-sonnet-20241022'];
                    break;
                case 35:
                    localModels = ['claude-instant-1.2', 'claude-2.0', 'claude-2.1', 'claude-3-haiku-20240307','claude-3-5-sonnet-20240620','claude-3-sonnet-20240229','claude-3-opus-20240229','claude-3-5-sonnet-20241022'];
                    break;
                case 11:
                    localModels = ['PaLM-2'];
                    break;
                case 15:
                    localModels = ['ERNIE-Bot', 'ERNIE-Bot-turbo', 'ERNIE-Bot-4', 'Embedding-V1'];
                    break;
                case 17:
                    localModels = ['qwen-turbo', 'qwen-plus', 'text-embedding-v1'];
                    break;
                case 16:
                    localModels = ['chatglm_pro', 'chatglm_std', 'chatglm_lite','glm-4', 'glm-4v','glm-v4', 'glm-3-turbo',];
                    break;
                case 18:
                    localModels = ['SparkDesk'];
                    break;
                case 19:
                    localModels = ['360GPT_S2_V9', 'embedding-bert-512-v1', 'embedding_s1_v1', 'semantic_similarity_s1_v1'];
                    break;
                case 23:
                    localModels = ['hunyuan'];
                    break;
                case 24:
                    localModels = ['gemini-1.5-pro-001','gemini-1.5-pro-latest','gemini-1.5-flash-latest','gemini-1.5-pro-exp-0801',
                        'gemini-1.5-pro-exp-0827','gemini-1.5-flash-exp-0827','gemini-1.5-pro-002','gemini-1.5-flash-002','gemini-exp-1114',
                        'gemini-exp-1206','gemini-2.0-flash-thinking-exp-1219','gemini-2.0-flash-exp'];
                    break;
                case 2:
                    localModels = ['midjourney'];
                    break;
                case 28:
                    localModels = ['stable-diffusion'];
                    break;
                case 29:
                    localModels = ['gemma-7b-it','llama2-7b-2048','llama2-70b-4096','mixtral-8x7b-32768'];
                    break;
                case 30:
                    localModels = ['Baichuan2-Turbo','Baichuan2-Turbo-192k'];
                    break;
                case 31:
                    localModels = ['abab5.5s-chat','abab5.5-chat','abab6-chat'];
                    break;
                case 32:
                    localModels = ['open-mistral-7b','open-mixtral-8x7b','mistral-small-latest','mistral-medium-latest','mistral-large-latest'];
                    break;
                case 33:
                    localModels = ['qwen:0.5b-chat'];
                    break;
                case 34:
                    localModels = ['yi-34b-chat-0205','yi-34b-chat-200k','yi-vl-plus'];
                    break;
                case 37:
                    localModels = ['command','command-nightly','command-light','command-light-nightly','command-r','command-r-plus'];
                    break;
                case 38:
                    localModels = ['deepseek-coder','deepseek-chat'];
                    break;
                case 40:
                    localModels = ['deepl-zh','deepl-en','deepl-ja'];
                    break;
                case 41:
                    localModels = ['Doubao-pro-128k','Doubao-pro-32k','Doubao-pro-4k','Doubao-lite-128k','Doubao-lite-32k','Doubao-lite-4k'];
                    break;
    
            }
            setInputs((inputs) => ({...inputs, models: localModels}));
        }
        //setAutoBan
    };
    const handleGetModels = async () => {
        try {
            if (inputs["type"] !== 1) {
                showError("仅支持 OpenAI 接口格式");
                return;
            }
    
            let url;
            let headers = {};
            let modelIds;
    
            if (isEdit) {
                url = `/api/channel/fetch_models/${channelId}`;
                const response = await fetch(url, { headers });
    
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
    
                const responseData = await response.json();
    
                // 检查编辑模式下的响应数据结构
                if (!responseData.data || !responseData.data.data || !Array.isArray(responseData.data.data)) {
                    throw new Error('Invalid data format');
                }
    
                modelIds = responseData.data.data.map(model => model.id);
            } else {
                if (!inputs.key) {
                    showError("请填写密钥");
                    return;
                }
                const baseUrl = inputs.base_url
                    ? (inputs.base_url.endsWith('/') ? inputs.base_url.slice(0, -1) : inputs.base_url)
                    : 'https://api.openai.com';
                url = `${baseUrl}/v1/models`;
                headers = {
                    'Authorization': `Bearer ${inputs.key}`
                };
    
                const response = await fetch(url, { headers });
    
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
    
                const data = await response.json();
    
                if (!data.data || !Array.isArray(data.data)) {
                    throw new Error('Invalid data format');
                }
    
                modelIds = data.data.map(model => model.id);
            }
    
            setInputs(prevInputs => ({
                ...prevInputs, 
                models: Array.from(new Set([...prevInputs.models, ...modelIds]))
            }));
    
            showSuccess("获取模型列表成功");
        } catch (error) {
            showError(`获取模型列表失败: ${error.message}`);
        }
    };
    
    const handleConfigChange = ( { name, value }) => {
        setConfig((inputs) => ({...inputs, [name]: value}));
      };

    const loadChannel = async () => {
        setLoading(true)
        let res = await API.get(`/api/channel/${channelId}`);
        const {success, message, data} = res.data;
        if (success) {
            if (data.models === '') {
                data.models = [];
            } else {
                data.models = data.models.split(',');
            }
            if (data.group === '') {
                data.groups = [];
            } else {
                data.groups = data.group.split(',');
            }
            if (data.model_mapping !== '') {
                data.model_mapping = JSON.stringify(JSON.parse(data.model_mapping), null, 2);
            }
            if (data.status_code_mapping !== '') {
                data.status_code_mapping = JSON.stringify(JSON.parse(data.status_code_mapping), null, 2);
            }
            if (data.headers !== '') {
                data.headers = JSON.stringify(JSON.parse(data.headers), null, 2);
            }
            if (data.gcp_account !== '') {
                data.gcp_account = JSON.stringify(JSON.parse(data.gcp_account), null, 2);
            }
            setInputs(data);
            if (data.config !== '') {
                setConfig(JSON.parse(data.config));
            }
            if (data.auto_ban === 0) {
                setAutoBan(false);
            } else {
                setAutoBan(true);
            }
            if (data.is_image_url_enabled === 0) {
                setIsImageURLEnabled(false);
            } else {
                setIsImageURLEnabled(true);
            }
            setRestartDelay(data.tested_time || 0);
            setPriority(data.priority || 0);
            setWeight(data.weight || 0);
            setRateLimited(data.rate_limited || false);
            setIstools(data.is_tools || false);
            setClaudeOriginalRequest(data.claude_original_request || false);
            setSupportsCacheControl(data.supports_cache_control || false);
            setRateLimitedConut(data.rate_limit_count || 0);
            // console.log(data);
        } else {
            showError(message);
        }
        setLoading(false);
    };

    const fetchModels = async () => {
        try {
            let res = await API.get(`/api/channel/models`);    
            const groupedModels = res.data.data.reduce((acc, model) => {
                if (!acc[model.owned_by]) {
                    acc[model.owned_by] = [];
                }
                acc[model.owned_by].push({ label: model.id, value: model.id });
                return acc;
            }, {});
    
            const localModelOptions = Object.entries(groupedModels).map(([owner, models]) => ({
                label: owner,
                options: models,
            }));
    
            setOriginModelOptions(localModelOptions);
    
            setFullModels(res.data.data.map((model) => model.id));
    
            setBasicModels(res.data.data
                .filter((model) => model.id.startsWith('gpt-3') || model.id.startsWith('gpt-4') || model.id.startsWith('text-'))
                .map((model) => model.id)
            );
        } catch (error) {
            showError(error.message);
        }
    };
    

    const fetchGroups = async () => {
        try {
            let res = await API.get(`/api/group/`);
            setGroupOptions(res.data.data.map((group) => ({
                label: group,
                value: group
            })));
        } catch (error) {
            showError(error.message);
        }
    };

    const handleGeminiModelChange = (value) => {
        handleConfigChange({ name: 'gemini_model', value: value.join(',') });
    };

    const resetGeminiModels = () => {
        handleConfigChange({ name: 'gemini_model', value: DEFAULT_GEMINI_MODELS.join(',') });
    };

    useEffect(() => {
        setModelOptions(originModelOptions);
    }, [originModelOptions]);

    useEffect(() => {
        if (inputs.type === 24 && !config.gemini_model) {
            setConfig(prevConfig => ({
                ...prevConfig,
                gemini_model: DEFAULT_GEMINI_MODELS.join(',')
            }));
        }
    }, [inputs.type, config.gemini_model]);
    

    useEffect(() => {
        fetchModels().then();
        fetchGroups().then();
        if (isEdit) {
            loadChannel().then(() => {});
          } else {
            setInputs(originInputs)
          }
       
    }, [props.editingChannel.id]);



    const submit = async () => {
        if (!isEdit && !batchProxy && (inputs.name === '')) {
            showInfo('请填写渠道名称！');
            return;
          }
        if (inputs.models.length === 0) {
            showInfo('请至少选择一个模型！');
            return;
        }
        
        if (inputs.model_mapping !== '' && !verifyJSON(inputs.model_mapping)) {
            showInfo('模型映射必须是合法的 JSON 格式！');
            return;
        }
        if (inputs.status_code_mapping !== '' && !verifyJSON(inputs.status_code_mapping)) {
            showInfo('状态码必须是合法的 JSON 格式！');
            return;
        }
        if (inputs.headers !== '' && !verifyJSON(inputs.headers)) {
            showInfo('自定义请求头必须是合法的 JSON 格式！');
            return;
        }
        if (inputs.gcp_account !== '' && !verifyJSON(inputs.gcp_account)) {
            showInfo('密钥文件必须是合法的 JSON 格式！');
            return;
        }
        if (inputs.type === 36 && (config.ak !== '' && config.sk !== '' && config.region !== '')) {
            inputs.key = `${config.ak}|${config.sk}|${config.region}`;
        }
        let localInputs = {...inputs};
         // 将 autoBan 状态转换为对应的整数值并添加到 localInputs 中
        localInputs.auto_ban = autoBan ? 1 : 0;
        localInputs.tested_time = restartDelay;
        localInputs.priority = priority;
        localInputs.weight = weight;
        localInputs.rate_limited = rateLimited;
        localInputs.supports_cache_control = supportsCacheControl;
        localInputs.is_tools = istools;
        localInputs.is_image_url_enabled = isimageurenabled ? 1 : 0;
        localInputs.claude_original_request = claudeoriginalrequest;
        localInputs.rate_limit_count = rateLimitedConut;
        if (localInputs.base_url && localInputs.base_url.endsWith('/')) {
            localInputs.base_url = localInputs.base_url.slice(0, localInputs.base_url.length - 1);
        }
        if (localInputs.type === 3 && localInputs.other === '') {
            localInputs.other = '2023-06-01-preview';
        }
        if (localInputs.type === 18 && localInputs.other === '') {
            localInputs.other = 'v2.1';
        }
        // 如果 model_test 为空，则设置默认值
        if (!localInputs.model_test) {
            localInputs.model_test = 'gpt-3.5-turbo';
        }
        
        let channelsToCreate = [];
        let createPromises = []; // 存储所有待执行的Promise
        // 处理批量添加代理的逻辑
        if (batchProxy) {
            const proxyEntries = proxyInputs.split('\n').filter(proxy => proxy.trim()); // 过滤空行
    
            channelsToCreate = proxyEntries.map(proxyEntry => {
            const [name, address] = proxyEntry.split(',').map(part => part.trim()); // 获取名称和代理地址
            if (!address) {
                throw new Error('代理地址格式无效。');
            }
            return {
                ...inputs, // 复制当前输入作为基础
                base_url: address,
                name: name || `Channel for ${address}`, // 如果没有指定名称，则使用默认名称
                models: inputs.models.join(','), // 将模型数组转换为字符串
                group: inputs.groups.join(','), // 将群组数组转换为字符串
                tested_time: parseInt(restartDelay, 10) || 0,
                priority: parseInt(priority, 10) || 0, 
                weight: parseInt(weight, 10) || 0, 
                rate_limited: rateLimited,
                supports_cache_control: supportsCacheControl,
                is_tools: istools,
                proxy_url: inputs.proxy_url,
                claude_original_request: claudeoriginalrequest,
                rate_limit_count: parseInt(rateLimitedConut, 10) || 0, 
            };
            });
    
            // 批量创建渠道
            for (const channelData of channelsToCreate) {
            try {
                let res = await API.post(`/api/channel/`, channelData);
                const { success, message } = res.data;
                if (success) {
                showSuccess(`渠道 ${channelData.name} 创建成功！`);
                } else {
                showError(`渠道 ${channelData.name} 创建失败：${message}`);
                }
            } catch (error) {
                showError(`渠道 ${channelData.name} 创建异常：${error.message}`);
            }
            }
            // 等待所有的创建操作完成
            await Promise.all(createPromises);

            // 创建操作完成后，刷新列表
            props.refresh();
            props.handleClose();

            return; // 结束函数执行
        }
        let res;
        if (!Array.isArray(localInputs.models)) {
            showError('提交失败，请勿重复提交！');
            handleCancel();
            return;
        }
        localInputs.models = localInputs.models.join(',');
        localInputs.group = localInputs.groups.join(',');
        localInputs.config = JSON.stringify(config);
        if (isEdit) {
            res = await API.put(`/api/channel/`, {...localInputs, id: parseInt(channelId)});
        } else {
            res = await API.post(`/api/channel/`, localInputs);
        }
        const {success, message} = res.data;
        if (success) {
            if (isEdit) {
                showSuccess('渠道更新成功！');
            } else {
                showSuccess('渠道创建成功！');
                setInputs(originInputs);
            }
            props.refresh();
            props.handleClose();
        } else {
            showError(message);
        }
    };
    
    const addCustomModel = () => {
        if (customModel.trim() === '') return;
    
        // 将输入按逗号分割，并去除每个模型名称的前后空格
        const newModels = customModel.split(',').map(model => model.trim()).filter(model => model !== '');
    
        // 过滤掉已存在的模型
        const uniqueNewModels = newModels.filter(model => !inputs.models.includes(model));
    
        if (uniqueNewModels.length === 0) return; // 如果没有新的唯一模型，直接返回
    
        // 更新输入模型数组
        handleInputChange('models', [...inputs.models, ...uniqueNewModels]);
        
        // 清空自定义模型输入
        setCustomModel('');
    };

    return (
        <>
            <SideSheet
                maskClosable={false}
                placement={isEdit ? 'right' : 'left'}
                title={<Title level={3}>{isEdit ? '更新渠道信息' : '创建新的渠道'}</Title>}
                headerStyle={{borderBottom: '1px solid var(--semi-color-border)'}}
                bodyStyle={{borderBottom: '1px solid var(--semi-color-border)'}}
                visible={props.visible}
                footer={
                    <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                        <Space>
                            <Button theme='solid' size={'large'} onClick={submit}>提交</Button>
                            <Button theme='solid' size={'large'} type={'tertiary'} onClick={handleCancel}>取消</Button>
                        </Space>
                    </div>
                }
                closeIcon={null}
                onCancel={() => handleCancel()}
                width={isMobile() ? '100%' : 600}
            >
                <Spin spinning={loading}>
                    <div style={{marginTop: 10}}>
                         <Typography.Text strong>标签：</Typography.Text>
                     </div>
                     <Input
                         label='标签'
                         name='tags'
                         placeholder={'请输入标签名称'}
                         onChange={value => {
                             handleInputChange('tags', value)
                         }}
                         value={inputs.tags}
                     autoComplete='new-password'
                     />
                    <div style={{marginTop: 10}}>
                        <Typography.Text strong>类型：</Typography.Text>
                    </div>
                    <Select
                        name='type'
                        required
                        optionList={CHANNEL_OPTIONS}
                        value={inputs.type}
                        onChange={value => handleInputChange('type', value)}
                        style={{width: '50%'}}
                    />
                    {
                        inputs.type === 3 && (
                            <>
                                <div style={{marginTop: 10}}>
                                    <Banner type={"warning"} description={
                                        <>
                                            注意，<strong>模型部署名称必须和模型名称保持一致</strong>，因为 One API 会把请求体中的
                                            model
                                            参数替换为你的部署名称（模型名称中的点会被剔除），<a target='_blank'
                                                                                              href='https://one-api/issues/133?notification_referrer_id=NT_kwDOAmJSYrM2NjIwMzI3NDgyOjM5OTk4MDUw#issuecomment-1571602271'>图片演示</a>。
                                        </>
                                    }>
                                    </Banner>
                                </div>
                                <div style={{marginTop: 10}}>
                                    <Typography.Text strong>AZURE_OPENAI_ENDPOINT：</Typography.Text>
                                </div>
                                <Input
                                    label='AZURE_OPENAI_ENDPOINT'
                                    name='azure_base_url'
                                    placeholder={'请输入 AZURE_OPENAI_ENDPOINT，例如：https://docs-test-001.openai.azure.com'}
                                    onChange={value => {
                                        handleInputChange('base_url', value)
                                    }}
                                    value={inputs.base_url}
                                    autoComplete='new-password'
                                />
                                <div style={{marginTop: 10}}>
                                    <Typography.Text strong>默认 API 版本：</Typography.Text>
                                </div>
                                <Input
                                    label='默认 API 版本'
                                    name='azure_other'
                                    placeholder={'请输入默认 API 版本，例如：2023-06-01-preview，该配置可以被实际的请求查询参数所覆盖'}
                                    onChange={value => {
                                        handleInputChange('other', value)
                                    }}
                                    value={inputs.other}
                                    autoComplete='new-password'
                                />
                            </>
                        )
                    }
                    {
                        inputs.type === 8 && (
                            <>
                                <div style={{marginTop: 10}}>
                                    <Typography.Text strong>Base URL：</Typography.Text>
                                </div>
                                <Input
                                    name='base_url'
                                    placeholder={'请输入自定义渠道的 Base URL'}
                                    onChange={value => {
                                        handleInputChange('base_url', value)
                                    }}
                                    value={inputs.base_url}
                                    autoComplete='new-password'
                                />
                            </>
                        )
                    }
                    <div style={{marginTop: 10}}>
                        <Typography.Text strong>名称：</Typography.Text>
                    </div>
                    <Input
                        required
                        name='name'
                        placeholder={'请为渠道命名'}
                        onChange={value => {
                            handleInputChange('name', value)
                        }}
                        value={inputs.name}
                        autoComplete='new-password'
                    />
                    {
                        inputs.type !== 3 && inputs.type !== 35 && inputs.type !== 8 && inputs.type !== 22 && inputs.type !== 42 && (
                            <>
                                <div style={{marginTop: 10}}>
                                    <Typography.Text strong>代理：</Typography.Text>
                                </div>
                                <Input
                                    label='代理'
                                    name='base_url'
                                    placeholder={'此项可选，用于通过代理站来进行 API 调用'}
                                    onChange={value => {
                                        handleInputChange('base_url', value)
                                    }}
                                    value={inputs.base_url}
                                    autoComplete='new-password'
                                />
                            </>
                        )
                    }
                    {
                        inputs.type !== 35 && inputs.type !== 42 && (
                            <div>
                                <div style={{marginTop: 10}}>
                                    <Typography.Text strong>密钥：</Typography.Text>
                                </div>

                                {
                                    batch ?
                                    <TextArea
                                        label='密钥'
                                        name='key'
                                        placeholder={'请输入密钥，一行一个'}
                                        onChange={value => {
                                            handleInputChange('key', value)
                                        }}
                                        value={inputs.key}
                                        style={{minHeight: 150, fontFamily: 'JetBrains Mono, Consolas'}}
                                        autoComplete='new-password'
                                    />
                                    :
                                    <Input
                                        label='密钥'
                                        name='key'
                                        placeholder={type2secretPrompt(inputs.type)}
                                        onChange={value => {
                                            handleInputChange('key', value)
                                        }}
                                        value={inputs.key}
                                        autoComplete='new-password'
                                    />
                                }
                            </div>
                        )
                    }
                    

                    {
                       inputs.type !== 35 && inputs.type !== 42 &&  !isEdit && (
                            <div style={{marginTop: 10, display: 'flex'}}>
                                <Space>
                                    <Checkbox
                                        checked={batch}
                                        label='批量创建'
                                        name='batch'
                                        onChange={() => setBatch(!batch)}
                                    />
                                    <Typography.Text strong>批量创建</Typography.Text>
                                </Space>
                            </div>
                        )
                    }
                    <div style={{marginTop: 10}}>
                        <Typography.Text strong>分组：</Typography.Text>
                    </div>
                    <Select
                        placeholder={'请选择可以使用该渠道的分组'}
                        name='groups'
                        required
                        multiple
                        selection
                        allowAdditions
                        additionLabel={'请在系统设置页面编辑分组倍率以添加新的分组：'}
                        onChange={value => {
                            handleInputChange('groups', value)
                        }}
                        value={inputs.groups}
                        autoComplete='new-password'
                        optionList={groupOptions}
                    />
                    {
                        inputs.type === 24 && (
                            <>
                                <div style={{marginTop: 10}}>
                                    <Typography.Text strong>模型版本（需要v1beta的模型）：</Typography.Text>
                                </div>
                                <TagInput
                                    style={{ width: '100%', marginTop: '10px' }}
                                    placeholder='请输入需要v1beta的模型，按回车添加'
                                    value={(config.gemini_model || DEFAULT_GEMINI_MODELS.join(',')).split(',')}
                                    onChange={handleGeminiModelChange}
                                    onInputConfirm={(text) => {
                                        const currentModels = (config.gemini_model || '').split(',').filter(Boolean);
                                        if (!currentModels.includes(text)) {
                                            handleGeminiModelChange([...currentModels, text]);
                                        }
                                    }}
                                />
                                <Button 
                                    style={{ marginTop: '10px' }}
                                    onClick={resetGeminiModels}
                                >
                                    重置为默认模型
                                </Button>
                            </>
                        )
                    }
                    {
                        inputs.type === 18 && (
                            <>
                                <div style={{marginTop: 10}}>
                                    <Typography.Text strong>模型版本：</Typography.Text>
                                </div>
                                <Input
                                    name='other'
                                    placeholder={'请输入星火大模型版本，注意是接口地址中的版本号，例如：v2.1'}
                                    onChange={value => {
                                        handleInputChange('other', value)
                                    }}
                                    value={inputs.other}
                                    autoComplete='new-password'
                                />
                            </>
                        )
                    }
                    {
                        inputs.type === 28 && (
                            <>
                                <div style={{marginTop: 10}}>
                                    <Typography.Text strong>模型版本：</Typography.Text>
                                </div>
                                <Input
                                    name='other'
                                    placeholder={'请输入engine_id 例如（stable-diffusion-v1-6）'}
                                    onChange={value => {
                                        handleInputChange('other', value)
                                    }}
                                    value={inputs.other}
                                    autoComplete='new-password'
                                />
                            </>
                        )
                    }
                    {
                        inputs.type === 21 && (
                            <>
                                <div style={{marginTop: 10}}>
                                    <Typography.Text strong>知识库 ID：</Typography.Text>
                                </div>
                                <Input
                                    label='知识库 ID'
                                    name='other'
                                    placeholder={'请输入知识库 ID，例如：123456'}
                                    onChange={value => {
                                        handleInputChange('other', value)
                                    }}
                                    value={inputs.other}
                                    autoComplete='new-password'
                                />
                            </>
                        )
                    }
                    {
                        inputs.type === 17 && (
                        <>
                            <div style={{marginTop: 10}}>
                                <Typography.Text strong>插件参数：</Typography.Text>
                            </div>
                                <Input
                                label='插件参数'
                                name='other'
                                placeholder={'请输入插件参数，即 X-DashScope-Plugin 请求头的取值'}
                                onChange={value => {
                                    handleInputChange('other', value)
                                }}
                                value={inputs.other}
                                autoComplete='new-password'
                                />
                         </>
                        )
                    }
                    {
                        inputs.type === 36 && (
                            <div style={{marginTop: 10}}>
                                <Typography.Text>
                                对于 Coze 而言，模型名称即 Bot ID，你可以添加一个前缀 `bot-`，例如：`bot-123456`。
                                </Typography.Text>
                        </div>    
                        
                        )
                    }
                    <div style={{marginTop: 10}}>
                        <Typography.Text strong>模型：</Typography.Text>
                    </div>
                    <Select
                    placeholder={'请选择该渠道所支持的模型'}
                    name='models'
                    required
                    multiple
                    selection
                    onChange={value => {
                        handleInputChange('models', value)
                    }}
                    value={inputs.models}
                    autoComplete='new-password'
                    style={{ width: '100%' }}
                >
                    {modelOptions.map(group => (
                        <Select.OptGroup key={group.label} label={group.label}>
                            {group.options.map(model => (
                                <Select.Option key={model.value} value={model.value}>
                                    {model.label}
                                </Select.Option>
                            ))}
                        </Select.OptGroup>
                    ))}
                </Select>
                <div style={{lineHeight: '40px', marginBottom: '12px'}}>
                    <Space>
                        <Button type='primary' onClick={() => {
                            handleInputChange('models', basicModels);
                        }}>填入基础模型</Button>
                        <Button type='tertiary' onClick={() => {
                            handleGetModels('models', basicModels);
                        }}>填入支持模型</Button>
                        <Button type='secondary' onClick={() => {
                            handleInputChange('models', fullModels);
                        }}>填入所有模型</Button>
                        <Button type='warning' onClick={() => {
                            handleInputChange('models', []);
                        }}>清除所有模型</Button>
                    </Space>
                    <Input
                        addonAfter={
                            <Button type='primary' onClick={addCustomModel}>填入</Button>
                        }
                        placeholder='输入自定义模型名称，多个用逗号分隔'
                        value={customModel}
                        onChange={setCustomModel}
                    />
                </div>
                    <div style={{marginTop: 10}}>
                        <Typography.Text strong>模型重定向：</Typography.Text>
                    </div>
                    <TextArea
                        placeholder={`此项可选，用于修改请求体中的模型名称，为一个 JSON 字符串，键为请求中模型名称，值为要替换的模型名称，例如：\n${JSON.stringify(MODEL_MAPPING_EXAMPLE, null, 2)}`}
                        name='model_mapping'
                        onChange={value => {
                            handleInputChange('model_mapping', value)
                        }}
                        autosize
                        value={inputs.model_mapping}
                        autoComplete='new-password'
                    />
                    <Typography.Text style={{
                        color: 'rgba(var(--semi-blue-5), 1)',
                        userSelect: 'none',
                        cursor: 'pointer'
                    }} onClick={
                        () => {
                            handleInputChange('model_mapping', JSON.stringify(MODEL_MAPPING_EXAMPLE, null, 2))
                        }
                    }>
                        填入模板
                    </Typography.Text>
                    <div style={{ marginTop: 10 }}>
                        <Typography.Text strong>
                        状态码复写（仅影响本地判断，不修改返回到上游的状态码）：
                        </Typography.Text>
                    </div>
                    <TextArea
                        placeholder={`此项可选，用于复写返回的状态码，比如将claude渠道的400错误复写为500（用于重试），请勿滥用该功能，例如：\n${JSON.stringify(STATUS_CODE_MAPPING_EXAMPLE, null, 2)}`}
                        name='status_code_mapping'
                        onChange={(value) => {
                        handleInputChange('status_code_mapping', value);
                        }}
                        autosize
                        value={inputs.status_code_mapping}
                        autoComplete='new-password'
                    />
                    <Typography.Text
                        style={{
                        color: 'rgba(var(--semi-blue-5), 1)',
                        userSelect: 'none',
                        cursor: 'pointer',
                        }}
                        onClick={() => {
                        handleInputChange(
                            'status_code_mapping',
                            JSON.stringify(STATUS_CODE_MAPPING_EXAMPLE, null, 2),
                        );
                        }}
                    >
                        填入模板
                    </Typography.Text>
                    {
                        inputs.type === 35 && (
                            <div> {/* 新增的包裹元素 */}
                                <div style={{marginTop: 10}}>
                                    <Typography.Text strong>region，例如：us-west-2：</Typography.Text>
                                </div>
                                <Input
                                    label='Region'
                                    name='region'
                                    placeholder={'region，例如：us-west-2'}
                                    onChange={(value) => handleConfigChange({ name: 'region', value })}
                                    value={config.region}
                                    autoComplete='new-password'
                                />

                                <div style={{marginTop: 10}}>
                                    <Typography.Text strong>AWS IAM Access Key：</Typography.Text>
                                </div>
                                <Input
                                    label='AK'
                                    name='ak'
                                    placeholder={'AWS IAM Access Key'}
                                    onChange={(value) => handleConfigChange({ name: 'ak', value })}
                                    value={config.ak}
                                    autoComplete='new-password'
                                />
                                <div style={{marginTop: 10}}>
                                    <Typography.Text strong>AWS IAM Secret Key：</Typography.Text>
                                </div>
                                <Input
                                    label='SK'
                                    name='sk'
                                    placeholder={'AWS IAM Secret Key'}
                                    onChange={(value) => handleConfigChange({ name: 'sk', value })}
                                    value={config.sk}
                                    autoComplete='new-password'
                                />
                                <div style={{marginTop: 10}}>
                                    <Typography.Text strong>AWS Cross：</Typography.Text>
                                </div>
                                <Input
                                    label='Cross'
                                    name='cross'
                                    placeholder={'AWS eu or us'}
                                    onChange={(value) => handleConfigChange({ name: 'cross', value })}
                                    value={config.cross}
                                    autoComplete='new-password'
                                />
                            </div> // 新增的包裹元素的结束标签
                        )
                    }
                    {
                        inputs.type === 36 && (
                        <div>
                            <div style={{marginTop: 10}}>
                                <Typography.Text strong>用户 ID：</Typography.Text>
                            </div>
                            <Input
                                label='User ID'
                                name='user_id'
                                placeholder={'生成该密钥的用户 ID'}
                                onChange={(value) => handleConfigChange({ name: 'user_id', value })}
                                value={config.user_id}
                                autoComplete='new-password'
                            />
                        </div>
                        )
                    }
                    {
                        inputs.type === 42 && (
                            <div> {/* 新增的包裹元素 */}
                            
                                <div style={{marginTop: 10}}>
                                    <Typography.Text strong>client_id：</Typography.Text>
                                </div>
                                <Input
                                    label='ClientId'
                                    name='client_id'
                                    placeholder={'client_id：'}
                                    onChange={(value) => handleConfigChange({ name: 'client_id', value })}
                                    value={config.client_id}
                                    autoComplete='new-password'
                                />
                                <div style={{marginTop: 10}}>
                                    <Typography.Text strong>client_secret：</Typography.Text>
                                </div>
                                <Input
                                    label='ClientSecret'
                                    name='client_secret'
                                    placeholder={'client_secret'}
                                    onChange={(value) => handleConfigChange({ name: 'client_secret', value })}
                                    value={config.client_secret}
                                    autoComplete='new-password'
                                />
                                <div style={{marginTop: 10}}>
                                    <Typography.Text strong>project_id：</Typography.Text>
                                </div>
                                <Input
                                    label='ProjectId'
                                    name='project_id'
                                    placeholder={'project_id'}
                                    onChange={(value) => handleConfigChange({ name: 'project_id', value })}
                                    value={config.project_id}
                                    autoComplete='new-password'
                                />
                                 <div style={{marginTop: 10}}>
                                    <Typography.Text strong>refresh_token：</Typography.Text>
                                </div>
                                <Input
                                    label='RefreshToken'
                                    name='refresh_token'
                                    placeholder={'refresh_token'}
                                    onChange={(value) => handleConfigChange({ name: 'refresh_token', value })}
                                    value={config.refresh_token}
                                    autoComplete='new-password'
                                />
                                <div style={{marginTop: 10}}>
                                    <Typography.Text strong>JSON密钥文件:</Typography.Text>
                                </div>
                                <TextArea
                                    placeholder={`填入JSON密钥文件内容`}
                                    name='gcp_account'
                                    onChange={value => {
                                        handleInputChange('gcp_account', value)
                                    }}
                                    autosize
                                    value={inputs.gcp_account}
                                    autoComplete='new-password'
                                />
                            </div> // 新增的包裹元素的结束标签
                        )
                    }
                    {
                        inputs.type !== 35 && inputs.type !== 42 && (
                            <div> 
                            <div style={{marginTop: 10}}>
                                <Typography.Text strong>组织：</Typography.Text>
                            </div>
                            <Input
                                label='组织，可选，不填则为默认组织'
                                name='openai_organization'
                                placeholder='请输入组织org-xxx'
                                onChange={value => {
                                    handleInputChange('openai_organization', value)
                                }}
                                value={inputs.openai_organization}
                            />
                        </div> 
                        )
                    }
                    <div style={{marginTop: 10, display: 'flex'}}>
                        <Space>
                            <Checkbox
                                name='auto_ban'
                                checked={autoBan}
                                onChange={() => setAutoBan(!autoBan)}
                                // onChange={handleInputChange}
                            />
                            <Typography.Text
                                strong>是否自动禁用（仅当自动禁用开启时有效），关闭后不会自动禁用该渠道：</Typography.Text>
                        </Space>
                    </div>
                    <div style={{marginTop: 10, display: 'flex'}}>
                        <Space>
                            <Checkbox
                                checked={rateLimited}
                                onChange={() => setRateLimited(!rateLimited)}
                            />
                            <Typography.Text strong>启用频率限制（每分钟限制）</Typography.Text>
                        </Space>
                        <div >
                            <AutoComplete
                                style={{ width: '100%', marginTop: 8 }}
                                placeholder={'延迟时间-毫秒'}
                                onChange={(value) => setRateLimitedConut(Number(value))}
                                onSelect={(value) => setRateLimitedConut(Number(value))}
                                value={String(rateLimitedConut)} 
                                autoComplete='off'
                                type='number'
                            />
                        </div>
                    </div>
                    <div style={{marginTop: 10, display: 'flex'}}>
                        <Space>
                            <Checkbox
                                checked={istools}
                                onChange={() => setIstools(!istools)}
                            />
                            <Typography.Text strong>是否支持FC插件</Typography.Text>
                        </Space>
                    </div>
                    {
                        inputs.type === 2 && (
                            <div style={{marginTop: 10, display: 'flex'}}>
                                <Space>
                                    <Checkbox
                                        checked={isimageurenabled}
                                        onChange={() => setIsImageURLEnabled(!isimageurenabled)}
                                    />
                                    <Typography.Text strong>启用MJ图片原始地址</Typography.Text>
                                </Space>
                            </div>
                        )
                    }
                     {
                        ((inputs.type === 42) || (inputs.type === 14) || (inputs.type === 35))  && (
                            <>
                                <div style={{marginTop: 10, display: 'flex'}}>
                                    <Space>
                                        <Checkbox
                                            checked={claudeoriginalrequest}
                                            onChange={() => setClaudeOriginalRequest(!claudeoriginalrequest)}
                                        />
                                        <Typography.Text strong>支持 Claude 原生请求格式</Typography.Text>
                                    </Space>
                                </div>
                                <div style={{marginTop: 10, display: 'flex'}}>
                                    <Space>
                                        <Checkbox
                                            checked={supportsCacheControl}
                                            onChange={() => setSupportsCacheControl(!supportsCacheControl)}
                                        />
                                        <Typography.Text strong>支持 Cache-Control 缓存控制</Typography.Text>
                                    </Space>
                                </div>
                            </>
                        )
                    }
                    <div style={{marginTop: 20, display: 'flex', alignItems: 'center'}}>
                        <div style={{flex: 1}}>
                                <Typography.Text>优先级：</Typography.Text>
                                <AutoComplete
                                    style={{ width: '100%', marginTop: 8 }}
                                    placeholder={'请选择或输入'}
                                    onChange={(value) => setPriority(Number(value))}
                                    onSelect={(value) => setPriority(Number(value))}
                                    value={String(priority)} 
                                    autoComplete='off'
                                    type='number'
                                    data={[
                                    { value: 0, label: '0' },
                                    { value: 3, label: '3' },
                                    { value: 5, label: '5' },
                                    { value: 7, label: '7' },
                                    ]}
                                />
                        </div>
                        <div style={{flex: 1,marginLeft: 20}}>
                                <Typography.Text>权重：</Typography.Text>
                                <AutoComplete
                                    style={{ width: '100%', marginTop: 8 }}
                                    placeholder={'请选择或输入'}
                                    onChange={(value) => setWeight(Number(value))}
                                    onSelect={(value) => setWeight(Number(value))}
                                    value={String(weight)} 
                                    autoComplete='off'
                                    type='number'
                                    data={[
                                    { value: 0, label: '0' },
                                    { value: 2, label: '2' },
                                    { value: 5, label: '5' },
                                    { value: 10, label: '10' },
                                    ]}
                                />
                        </div>
                        <div style={{flex: 1,marginLeft: 20}}>
                            <Typography.Text>重启：</Typography.Text>
                            <AutoComplete
                                style={{ width: '100%', marginTop: 8 }}
                                placeholder={'请选择或输入'}
                                onChange={(value) => setRestartDelay(Number(value))}
                                onSelect={(value) => setRestartDelay(Number(value))}
                                value={String(restartDelay)} 
                                autoComplete='off'
                                type='number'
                                data={[
                                { value: 0, label: '不重启' },
                                { value: 60, label: '一分钟' },
                                { value: 120, label: '两分钟' },
                                { value: 300, label: '五分钟' },
                                ]}
                            />
                        </div>
                        <div style={{flex: 1, marginLeft: 20}}>
                            <Typography.Text strong>自动测试模型：</Typography.Text>
                            <Select
                                placeholder={'请选择自动测试使用的模型'}
                                name='model_test'
                                onChange={value => handleInputChange('model_test', value)}
                                value={inputs.model_test}
                                optionList={inputs.models.map(model => ({ label: model, value: model }))}
                                style={{width: '100%'}}
                            />
                        </div>
                    </div>
                    <div style={{marginTop: 10}}>
                        <Typography.Text strong>自定义请求头：</Typography.Text>
                    </div>
                    <TextArea
                        placeholder={`例如：\n
                        {
                            “Referer”: “https://xxxcom/”
                        }`}
                        name='headers'
                        onChange={value => {
                            handleInputChange('headers', value)
                        }}
                        autosize
                        value={inputs.headers}
                        autoComplete='new-password'
                    />
                    {
                        inputs.type === 22 && (
                            <>
                                <div style={{marginTop: 10}}>
                                    <Typography.Text strong>私有部署地址：</Typography.Text>
                                </div>
                                <Input
                                    name='base_url'
                                    placeholder={'请输入私有部署地址，格式为：https://fastgpt.run/api/openapi'}
                                    onChange={value => {
                                        handleInputChange('base_url', value)
                                    }}
                                    value={inputs.base_url}
                                    autoComplete='new-password'
                                />
                            </>
                        )
                    }
                     <div style={{marginTop: 10}}>
                        <Typography.Text strong>HTTP 代理或 SOCKS5 </Typography.Text>
                    </div>
                    <Input
                        name='proxy_url'
                        placeholder={'http://127.0.0.1:8080 或者 socks5://127.0.0.1:8080'}
                        onChange={value => {
                            handleInputChange('proxy_url', value)
                        }}
                        value={inputs.proxy_url}
                        autoComplete='new-password'
                    />

                </Spin>
            </SideSheet>
        </>
    );
};

export default EditChannel;
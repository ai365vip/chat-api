import React, {useContext, useEffect, useState} from 'react';
import {Link, useNavigate, useSearchParams} from 'react-router-dom';
import {UserContext} from '../context/User';
import {API, getLogo,isAdmin, isMobile, showError, showInfo, showSuccess, showWarning} from '../helpers';
import {onGitHubOAuthClicked} from './utils';
import Turnstile from "react-turnstile";
import {Layout, Card, Image, Form, Button, Divider, Modal} from "@douyinfe/semi-ui";
import Title from "@douyinfe/semi-ui/lib/es/typography/title";
import Text from "@douyinfe/semi-ui/lib/es/typography/text";

import {IconGithubLogo} from '@douyinfe/semi-icons';

const LoginForm = () => {
    const [inputs, setInputs] = useState({
        username: '',
        password: '',
        wechat_verification_code: ''
    });
    const [searchParams, setSearchParams] = useSearchParams();
    const [submitted, setSubmitted] = useState(false);
    const {username, password} = inputs;
    const [userState, userDispatch] = useContext(UserContext);
    const [turnstileEnabled, setTurnstileEnabled] = useState(false);
    const [turnstileSiteKey, setTurnstileSiteKey] = useState('');
    const [turnstileToken, setTurnstileToken] = useState('');
    let navigate = useNavigate();
    const [status, setStatus] = useState({});
    const logo = getLogo();
    

    useEffect(() => {
        if (searchParams.get('expired')) {
            showError('未登录或登录已过期，请重新登录！');
        }
        let status = localStorage.getItem('status');
        if (status) {
            status = JSON.parse(status);
            setStatus(status);
            if (status.turnstile_check) {
                setTurnstileEnabled(true);
                setTurnstileSiteKey(status.turnstile_site_key);
            }
        }
    }, []);

    function handleChange(name, value) {
        setInputs((inputs) => ({...inputs, [name]: value}));
    }

    async function handleSubmit(e) {
        if (turnstileEnabled && turnstileToken === '') {
            showInfo('请稍后几秒重试，Turnstile 正在检查用户环境！');
            return;
        }
        setSubmitted(true);
        if (username && password) {
            const res = await API.post(`/api/user/login?turnstile=${turnstileToken}`, {
                username,
                password
            });
            const {success, message, data} = res.data;
            if (success) {
                
                userDispatch({type: 'login', payload: data});
                localStorage.setItem('user', JSON.stringify(data));
                showSuccess('登录成功！');
                const isAdminUser = isAdmin();
                if (isAdminUser) {
                    if (username === 'root' && password === '123456') {
                        Modal.error({title: '您正在使用默认密码！', content: '请立刻修改默认密码！', centered: true});
                    }
                    navigate('/admin/detail');
                    window.location.reload();
                } else {
                    navigate('/');
                    window.location.reload();
                }
                
            } else {
                showError(message);
            }
        } else {
            showError('请输入用户名和密码！');
        }
    }

    return (
        <div>
            <Layout>
                <Layout.Header>
                </Layout.Header>
                <Layout.Content>
                    <div style={{justifyContent: 'center', display: "flex", marginTop: 120}}>
                        <div style={{width: 500}}>
                            <Card>
                                <Title heading={2} style={{textAlign: 'center'}}>
                                    用户登录
                                </Title>
                                <Form>
                                    <Form.Input
                                        field={'username'}
                                        label={'用户名'}
                                        placeholder='用户名'
                                        name='username'
                                        onChange={(value) => handleChange('username', value)}
                                    />
                                    <Form.Input
                                        field={'password'}
                                        label={'密码'}
                                        placeholder='密码'
                                        name='password'
                                        type='password'
                                        onChange={(value) => handleChange('password', value)}
                                    />

                                    <Button theme='solid' style={{width: '100%'}} type={'primary'} size='large'
                                            htmlType={'submit'} onClick={handleSubmit}>
                                        登录
                                    </Button>
                                </Form>
                                <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 20}}>
                                   {/* <Text>
                                        没有账号请先 <Link to='/admin/register'>注册账号</Link>
                                    </Text>
                                    */} 
                                    <Text>
                                        忘记密码 <Link to='/admin/reset'>点击重置</Link>
                                    </Text>
                                </div>
                            </Card>
                            {turnstileEnabled ? (
                                <div style={{display: 'flex', justifyContent: 'center', marginTop: 20}}>
                                    <Turnstile
                                        sitekey={turnstileSiteKey}
                                        onVerify={(token) => {
                                            setTurnstileToken(token);
                                        }}
                                    />
                                </div>
                            ) : (
                                <></>
                            )}
                        </div>
                    </div>

                </Layout.Content>
            </Layout>
        </div>
    );
};

export default LoginForm;

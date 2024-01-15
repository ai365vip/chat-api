import React, {useContext, useEffect, useRef, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {UserContext} from '../context/User';

import {Button, Container, Icon, Menu, Segment} from 'semantic-ui-react';
import {API, getLogo, getSystemName, isAdmin, isMobile, showSuccess} from '../helpers';
import '../index.css';

import fireworks from 'react-fireworks';

import {
    IconKey,
    IconUser,
    IconHelpCircle,IconBell
} from '@douyinfe/semi-icons';
import {Nav, Avatar, Dropdown, Layout, Switch,Badge } from '@douyinfe/semi-ui';
import {stringToColor} from "../helpers/render";

// HeaderBar Buttons
let headerButtons = [
    {
        text: '关于',
        itemKey: 'withdrawal',
        to: '/admin/withdrawal',
        icon: <IconBell/>,
    },
];

if (localStorage.getItem('chat_link')) {
    headerButtons.splice(1, 0, {
        name: '聊天',
        to: '/admin/chat',
        icon: 'comments'
    });
}

const HeaderBar = () => {
    const [userState, userDispatch] = useContext(UserContext);
    let navigate = useNavigate();

    const [showSidebar, setShowSidebar] = useState(false);
    const [dark, setDark] = useState(false);
    const [withdrawalCount, setWithdrawalCount] = useState(0); // 初始化为0
    const systemName = getSystemName();
    const isAdminUser = isAdmin();
    const logo = getLogo();
    var themeMode = localStorage.getItem('theme-mode');



    async function logout() {
        setShowSidebar(false);
        await API.get('/api/user/logout');
        showSuccess('注销成功!');
        userDispatch({type: 'logout'});
        localStorage.removeItem('user');
        navigate('/admin/login');
    }

    const loadWithdrawalCount = async () => {
        try {
          let res = await API.get('/api/log/withdrawalscount');
          const { success, message, data } = res.data;
          if (success) {
            setWithdrawalCount(data); 
          } else {
            setWithdrawalCount(0);
          }
        } catch (err) {
          setWithdrawalCount(0);
        }
      };

      useEffect(() => {
        // 只有当用户已登录且是管理员时，才调用 loadWithdrawalCount
        if (userState.user && isAdminUser) {
            loadWithdrawalCount();
        }
    }, [userState.user,isAdminUser]); 


      useEffect(() => {
        if (themeMode === 'dark') {
            switchMode(true);
        }
    }, []); 
    

    const switchMode = (model) => {
        const body = document.body;
        if (!model) {
            body.removeAttribute('theme-mode');
            localStorage.setItem('theme-mode', 'light');
        } else {
            body.setAttribute('theme-mode', 'dark');
            localStorage.setItem('theme-mode', 'dark');
        }
        setDark(model);
    };
    return (
        <>
            <Layout>
                <div style={{width: '100%'}}>
                    <Nav
                        mode={'horizontal'}
                        // bodyStyle={{ height: 100 }}
                        renderWrapper={({itemElement, isSubNav, isInSubNav, props}) => {
                            const routerMap = {
                                withdrawal: "/admin/withdrawal",
                                login: "/admin/login",
                                register: "/admin/register",
                            };
                            return (
                                <Link
                                    style={{textDecoration: "none"}}
                                    to={routerMap[props.itemKey]}
                                >
                                    {itemElement}
                                </Link>
                            );
                        }}
                        selectedKeys={[]}
                        // items={headerButtons}
                        onSelect={key => {

                        }}
                        footer={
                            <> 
                                {isAdminUser && (
                                    <Nav.Item
                                        itemKey={'withdrawal'}
                                        icon={
                                        withdrawalCount > 0 ? (
                                            <Badge count={withdrawalCount} type='danger'>
                                            <IconBell size="large" />
                                            </Badge>
                                        ) : (
                                            <IconBell size="large" />
                                        )
                                        }
                                    />
                                    )}
                                <Switch checkedText="🌞" size={'large'} checked={dark} uncheckedText="🌙" onChange={switchMode} />
                                {userState.user ?
                                    <>
                                        <Dropdown
                                            position="bottomRight"
                                            render={
                                                <Dropdown.Menu>
                                                    <Dropdown.Item onClick={logout}>退出</Dropdown.Item>
                                                </Dropdown.Menu>
                                            }
                                        >
                                            <Avatar size="small" color={stringToColor(userState.user.username)} style={{ margin: 4 }}>
                                                {userState.user.username[0]}
                                            </Avatar>
                                            <span>{userState.user.username}</span>
                                        </Dropdown>
                                    </>
                                    :
                                    <>
                                        <Nav.Item itemKey={'login'} text={'登录'} icon={<IconKey />} />
                                        {/*<Nav.Item itemKey={'register'} text={'注册'} icon={<IconUser />} />*/}
                                    </>
                                }
                            </>
                        }
                    >
                    </Nav>
                </div>
            </Layout>
        </>
    );
};

export default HeaderBar;

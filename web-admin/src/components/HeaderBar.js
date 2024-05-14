import React, {useContext, useEffect, useRef, useState} from 'react';
import {Link,useNavigate,useLocation} from 'react-router-dom';
import {UserContext} from '../context/User';
import {API, getLogo, getSystemName, isAdmin, isMobile, showSuccess} from '../helpers';
import '../index.css';
import { IconHome, IconLayers, IconKey, IconGift, IconUser, IconCreditCard, IconHistogram, IconSemiLogo, IconSetting, IconBell,IconImage,IconKanban } from '@douyinfe/semi-icons';
import {Nav, Avatar, Dropdown, Layout, Switch,Badge,Tabs, TabPane } from '@douyinfe/semi-ui';
import {stringToColor} from "../helpers/render";



const HeaderBar = () => {
    const [userState, userDispatch] = useContext(UserContext);
    let navigate = useNavigate();
    const location = useLocation();
    const [showSidebar, setShowSidebar] = useState(false);
    const [dark, setDark] = useState(false);
    const [withdrawalCount, setWithdrawalCount] = useState(0); // 初始化为0
    const systemName = getSystemName();
    const isAdminUser = isAdmin();
    const logo = getLogo();
    var themeMode = localStorage.getItem('theme-mode');
    const mobile = isMobile();
    const activeKey = location.pathname;

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
                        <div style={{
                            display: 'flex',         // 使用flex布局确保内容水平排列
                            alignItems: 'center',    // 垂直居中对齐
                            height: '100%',          // 确保div填满Nav容器的高度，你可能需要根据Nav的实际高度调整这个值
                            marginRight: '2em' 
                        }}>
                            <img src={logo} alt='logo' style={{
                                maxHeight: '50px',   // 限制图片的最大高度，防止超出Nav容器
                                marginRight: '0.75em' // 图片右侧的间距
                            }}/>
                            <span style={{
                                whiteSpace: 'nowrap', // 防止文本换行
                            }}>{systemName}</span>
                        </div>

                        {isAdminUser && !mobile &&( 
                            
                        <div style={{width: '100%'}}>
                        <Tabs type="line" 
                            tabBarGutter={0} 
                            destroyInactiveTabPane 
                            activeKey={activeKey} 
                            onChange={key => navigate(key)}>
                            <TabPane tab={<Link to="/admin/detail" style={{ textDecoration: 'none' }}><IconHome />首页</Link>} itemKey="/admin/detail" />
                            <TabPane tab={<Link to="/admin/channel" style={{ textDecoration: 'none' }}><IconLayers />渠道管理</Link>} itemKey="/admin/channel" />
                            <TabPane tab={<Link to="/admin/token" style={{ textDecoration: 'none' }}><IconKey />令牌管理</Link>} itemKey="/admin/token" />
                            <TabPane tab={<Link to="/admin/redemption" style={{ textDecoration: 'none' }}><IconGift />兑换码</Link>} itemKey="/admin/redemption" />
                            <TabPane tab={<Link to="/admin/user" style={{ textDecoration: 'none' }}><IconUser />用户管理</Link>} itemKey="/admin/user" />
                            <TabPane tab={<Link to="/admin/topups" style={{ textDecoration: 'none' }}><IconCreditCard />充值记录</Link>} itemKey="/admin/topups" />
                            <TabPane tab={<Link to="/admin/log" style={{ textDecoration: 'none' }}><IconHistogram />日志详情</Link>} itemKey="/admin/log" />
                            <TabPane tab={<Link to="/admin/midjourney" style={{ textDecoration: 'none' }}><IconImage />MJ绘画</Link>} itemKey="/admin/midjourney" />
                            <TabPane tab={<Link to="/admin/setting" style={{ textDecoration: 'none' }}><IconSetting />设置</Link>} itemKey="/admin/setting" />
                        </Tabs>
                    </div>
                    )}
                    </Nav>
            </Layout>
        </>
    );
};

export default HeaderBar;

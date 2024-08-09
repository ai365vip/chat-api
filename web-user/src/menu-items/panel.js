// assets
import {
  IconDashboard,
  IconSitemap,
  IconArticle,
  IconCoin,
  IconAdjustments,
  IconKey,
  IconGardenCart,
  IconUser,
  IconUserScan,
  IconInfoCircle,
  IconBrandGoogleAnalytics
} from '@tabler/icons-react';

// constant
const icons = { IconDashboard, IconSitemap, IconArticle, IconCoin, IconAdjustments, IconKey, IconGardenCart, IconUser, IconUserScan,IconInfoCircle,IconBrandGoogleAnalytics };

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const panel = {
  id: '/',
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: '数据总览',
      type: 'item',
      url: '/dashboard',
      icon: icons.IconDashboard,
      breadcrumbs: false,
      isAdmin: false
    },
    {
      id: 'token',
      title: '令牌管理',
      type: 'item',
      url: '/token',
      icon: icons.IconKey,
      breadcrumbs: false
    },
    {
      id: 'log',
      title: '消费日志',
      type: 'item',
      url: '/log',
      icon: icons.IconBrandGoogleAnalytics,
      breadcrumbs: false
    },
    //{
    //  id: 'mjlog',
    //  title: 'MJ绘画',s
    //  type: 'item',
    //  url: '/mjlog',
    //  icon: icons.IconArticle,
    //  breadcrumbs: false
    //},
    {
      id: 'topup',
      title: '钱包充值',
      type: 'item',
      url: '/topup',
      icon: icons.IconGardenCart,
      breadcrumbs: false
    },
    {
      id: 'model',
      title: '模型计费',
      type: 'item',
      url: '/model',
      icon: icons.IconSitemap,
      breadcrumbs: false
    },
    {
      id: 'profile',
      title: '个人设置',
      type: 'item',
      url: '/profile',
      icon: icons.IconUserScan,
      breadcrumbs: false,
    },
    {
      id: 'about',
      title: '使用教程',
      type: 'item',
      url: '/about',
      icon: icons.IconInfoCircle,
      breadcrumbs: false
    }
  ]
};

export default panel;

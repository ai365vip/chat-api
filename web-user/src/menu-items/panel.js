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
  IconUserScan
} from '@tabler/icons-react';

// constant
const icons = { IconDashboard, IconSitemap, IconArticle, IconCoin, IconAdjustments, IconKey, IconGardenCart, IconUser, IconUserScan };

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const panel = {
  id: '/',
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      type: 'item',
      url: '/dashboard',
      icon: icons.IconDashboard,
      breadcrumbs: false,
      isAdmin: false
    },
    {
      id: 'token',
      title: 'Token',
      type: 'item',
      url: '/token',
      icon: icons.IconKey,
      breadcrumbs: false
    },
    {
      id: 'log',
      title: '日志',
      type: 'item',
      url: '/log',
      icon: icons.IconArticle,
      breadcrumbs: false
    },
    //{
    //  id: 'mjlog',
    //  title: 'MJ绘画',
    //  type: 'item',
    //  url: '/mjlog',
    //  icon: icons.IconArticle,
    //  breadcrumbs: false
    //},
    {
      id: 'topup',
      title: '充值',
      type: 'item',
      url: '/topup',
      icon: icons.IconGardenCart,
      breadcrumbs: false
    },
   //{
   //  id: 'profile',
   //  title: '个人设置',
   //  type: 'item',
   //  url: '/profile',
   //  icon: icons.IconUserScan,
   //  breadcrumbs: false,
   //  isAdmin: true
   //}
  ]
};

export default panel;

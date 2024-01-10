import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';

const Log = Loadable(lazy(() => import('views/Log')));
const Mjlog = Loadable(lazy(() => import('views/MjLog')));
const Model = Loadable(lazy(() => import('views/Model')));
const Token = Loadable(lazy(() => import('views/Token')));
const Topup = Loadable(lazy(() => import('views/Topup')));
const Profile = Loadable(lazy(() => import('views/Profile')));
const NotFoundView = Loadable(lazy(() => import('views/Error')));
const Withdrawal = Loadable(lazy(() => import('views/Withdrawal')));
// dashboard routing
const Dashboard = Loadable(lazy(() => import('views/Dashboard')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '',
      element: <Dashboard />
    },
    {
      path: 'dashboard',
      element: <Dashboard />
    },
    {
      path: 'log',
      element: <Log />
    },
    {
      path: 'mjlog',
      element: <Mjlog />
    },
    {
      path: 'token',
      element: <Token />
    },
    {
      path: 'topup',
      element: <Topup />
    },
    {
      path: 'profile',
      element: <Profile />
    },
    {
      path: 'model',
      element: <Model />
    },
    {
      path: 'withdrawal',
      element: <Withdrawal />
    },
    {
      path: '404',
      element: <NotFoundView />
    }
  ]
};

export default MainRoutes;

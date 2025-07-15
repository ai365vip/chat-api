import { lazy } from 'react';

// project imports
import Loadable from 'ui-component/Loadable';
import MinimalLayout from 'layout/MinimalLayout';

// login option 3 routing
const AuthLogin = Loadable(lazy(() => import('views/Authentication/Auth/Login')));
const AuthRegister = Loadable(lazy(() => import('views/Authentication/Auth/Register')));
const DiscordOAuth = Loadable(lazy(() => import('views/Authentication/Auth/DiscordOAuth')));
const GitHubOAuth = Loadable(lazy(() => import('views/Authentication/Auth/GitHubOAuth')));
const ForgetPassword = Loadable(lazy(() => import('views/Authentication/Auth/ForgetPassword')));
const ResetPassword = Loadable(lazy(() => import('views/Authentication/Auth/ResetPassword')));
const Home = Loadable(lazy(() => import('views/Home')));
const About = Loadable(lazy(() => import('views/About')));
const Chat = Loadable(lazy(() => import('views/Chat')));
const NotFoundView = Loadable(lazy(() => import('views/Error')));

// ==============================|| AUTHENTICATION ROUTING ||============================== //

const OtherRoutes = {
  path: '/',
  element: <MinimalLayout />,
  children: [
    {
      path: '/home',
      element: <Home />
    },
    {
      path: '/about',
      element: <About />
    },
    {
      path: '/login',
      element: <AuthLogin />
    },
    {
      path: '/register',
      element: <AuthRegister />
    },
    {
      path: '/reset',
      element: <ForgetPassword />
    },
    {
      path: '/user/reset',
      element: <ResetPassword />
    },
    {
      path: '/oauth/discord',
      element: <DiscordOAuth />
    },
    {
      path: '/oauth/github',
      element: <GitHubOAuth />
    },
    {
      path: '/chatweb',
      element: <Chat />
    },
    {
      path: '/404',
      element: <NotFoundView />
    }
  ]
};

export default OtherRoutes;

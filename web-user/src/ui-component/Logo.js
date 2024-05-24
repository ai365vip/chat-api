// material-ui
import logoLight from 'assets/images/logo.svg';
import logoDark from 'assets/images/logo-white.svg';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';

const Logo = () => {
  const siteInfo = useSelector((state) => state.siteInfo);
  const theme = useTheme();
  const logo = theme.palette.mode === 'light' ? logoLight : logoDark;
  return <img src={siteInfo.logo || logo} alt={siteInfo.system_name} width="80" />;
};

export default Logo;

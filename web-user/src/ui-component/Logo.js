// material-ui
import logo from 'assets/images/logo.svg';
import { useSelector } from 'react-redux';

const Logo = () => {
  const siteInfo = useSelector((state) => state.siteInfo);

  return <img src={siteInfo.logo || logo} alt={siteInfo.system_name} width="80" />;
};

export default Logo;

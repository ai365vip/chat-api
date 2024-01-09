// import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

// material-ui
import { styled, useTheme } from '@mui/material/styles';
import {
  Avatar,
  Card,
  CardContent,
  // Grid,
  // LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography
  // linearProgressClasses
} from '@mui/material';
import User1 from 'assets/images/users/user-round.svg';
import { useNavigate } from 'react-router-dom';


const CardStyle = styled(Card)(({ theme }) => ({
  background: theme.palette.primary.light,
  marginBottom: '22px',
  overflow: 'hidden',
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    width: '157px',
    height: '157px',
    background: theme.palette.primary[200],
    borderRadius: '50%',
    top: '-105px',
    right: '-96px'
  }
}));


const MenuCard = () => {
  const theme = useTheme();
  const account = useSelector((state) => state.account);
  const navigate = useNavigate();

  return (
    <CardStyle>
      <CardContent sx={{ p: 2 }}>
        <List sx={{ p: 0, m: 0 }}>
          <ListItem alignItems="flex-start" disableGutters sx={{ p: 0 }}>
            <ListItemAvatar sx={{ mt: 0 }}>
              <Avatar
                variant="rounded"
                src={User1}
                sx={{
                  ...theme.typography.commonAvatar,
                  ...theme.typography.largeAvatar,
                  color: theme.palette.primary.main,
                  border: 'none',
                  borderColor: theme.palette.primary.main,
                  background: '#fff',
                  marginRight: '12px'
                }}
                onClick={() => navigate('/profile')}
              ></Avatar>
            </ListItemAvatar>
            <ListItemText
              sx={{ mt: 0 }}
              primary={
                <Typography variant="subtitle1" sx={{ color: theme.palette.primary[800] }}>
                  {account.user?.username}
                </Typography>
              }
              secondary={<Typography variant="caption"> 欢迎回来 </Typography>}
            />
          </ListItem>
        </List>
        {/* <LinearProgressWithLabel value={80} /> */}
      </CardContent>
    </CardStyle>
  );
};

export default MenuCard;

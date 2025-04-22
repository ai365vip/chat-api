import PropTypes from 'prop-types';
import { styled, useTheme } from '@mui/material/styles';
import { Avatar, Box, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import TotalIncomeCard from 'ui-component/cards/Skeleton/TotalIncomeCard';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';

const CardWrapper = styled(MainCard)(({ theme }) => ({
  backgroundColor: theme.palette.primary.dark,
  color: theme.palette.primary.light,
  overflow: 'hidden',
  position: 'relative',
  transition: 'all .2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: theme.customShadows.primary
  },
  '&:after': {
    content: '""',
    position: 'absolute',
    width: 210,
    height: 210,
    background: `linear-gradient(210.04deg, ${theme.palette.primary[200]} -50.94%, rgba(144, 202, 249, 0.1) 83.49%)`,
    borderRadius: '50%',
    top: -30,
    right: -180
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    width: 210,
    height: 210,
    background: `linear-gradient(140.9deg, ${theme.palette.primary[200]} -14.02%, rgba(144, 202, 249, 0.1) 77.58%)`,
    borderRadius: '50%',
    top: -160,
    right: -130
  }
}));

const StatisticalCard = ({ isLoading }) => {
  const theme = useTheme();

  if (isLoading) {
    return <TotalIncomeCard />;
  }

  return (
    <CardWrapper border={false} content={false}>
      <Box sx={{ p: 2.25 }}>
        <List sx={{ py: 0 }}>
          <ListItem alignItems="center" disableGutters sx={{ py: 0 }}>
            <ListItemAvatar>
              <Avatar
                variant="rounded"
                sx={{
                  ...theme.typography.commonAvatar,
                  ...theme.typography.largeAvatar,
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? theme.palette.primary[800] 
                    : theme.palette.primary[200],
                  color: theme.palette.primary.main,
                  transition: 'all .2s ease-in-out',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.common.white
                  }
                }}
              >
                <TableChartOutlinedIcon fontSize="inherit" />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              sx={{ py: 0, mt: 0.45, mb: 0.45 }}
              primary={
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: theme.palette.mode === 'dark' 
                      ? theme.palette.common.white 
                      : theme.palette.grey[900],
                    fontWeight: 600
                  }}
                >
                  $203k
                </Typography>
              }
              secondary={
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    color: theme.palette.mode === 'dark'
                      ? theme.palette.grey[400]
                      : theme.palette.grey[700],
                    mt: 0.25 
                  }}
                >
                  Total Income
                </Typography>
              }
            />
          </ListItem>
        </List>
      </Box>
    </CardWrapper>
  );
};

StatisticalCard.propTypes = {
  isLoading: PropTypes.bool
};

export default StatisticalCard;

require('dayjs/locale/zh-cn');
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import { IconKey } from '@tabler/icons-react';
import { InputAdornment, OutlinedInput, Stack, FormControl, InputLabel} from '@mui/material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
// ----------------------------------------------------------------------

export default function TableToolBar({ filterName, handleFilterName }) {
  const theme = useTheme();
  const grey500 = theme.palette.grey[500];

  return (
    <>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2, md: 4 }} padding={'24px'} paddingBottom={'0px'}>
        <FormControl>
          <InputLabel htmlFor="channel-token_name-label">任务ID</InputLabel>
          <OutlinedInput
            id="mj_id"
            name="mj_id"
            sx={{
              minWidth: '100%'
            }}
            label="任务ID"
            value={filterName.mj_id}
            onChange={handleFilterName}
            placeholder="任务ID"
            startAdornment={
              <InputAdornment position="start">
                <IconKey stroke={1.5} size="20px" color={grey500} />
              </InputAdornment>
            }
          />
        </FormControl>

        <FormControl>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={'zh-cn'}>
            <DateTimePicker
              label="起始时间"
              ampm={false}
              name="start_timestamp"
              value={filterName.start_timestamp === 0 ? null : dayjs.unix(filterName.start_timestamp)}
              onChange={(value) => {
                if (value === null) {
                  handleFilterName({ target: { name: 'start_timestamp', value: 0 } });
                  return;
                }
                handleFilterName({ target: { name: 'start_timestamp', value: value.unix() } });
              }}
              slotProps={{
                actionBar: {
                  actions: ['clear', 'today', 'accept']
                }
              }}
            />
          </LocalizationProvider>
        </FormControl>

        <FormControl>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={'zh-cn'}>
            <DateTimePicker
              label="结束时间"
              name="end_timestamp"
              ampm={false}
              value={filterName.end_timestamp === 0 ? null : dayjs.unix(filterName.end_timestamp)}
              onChange={(value) => {
                if (value === null) {
                  handleFilterName({ target: { name: 'end_timestamp', value: 0 } });
                  return;
                }
                handleFilterName({ target: { name: 'end_timestamp', value: value.unix() } });
              }}
              slotProps={{
                actionBar: {
                  actions: ['clear', 'today', 'accept']
                }
              }}
            />
          </LocalizationProvider>
        </FormControl>
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2, md: 4 }} padding={'10px'}>

       
      </Stack>
    </>
  );
}

TableToolBar.propTypes = {
  filterName: PropTypes.object,
  handleFilterName: PropTypes.func,
  userIsAdmin: PropTypes.bool
};

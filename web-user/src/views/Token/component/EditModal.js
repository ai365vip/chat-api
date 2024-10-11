require('dayjs/locale/zh-cn');
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useTheme } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Alert,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  Switch,
  FormHelperText,TextField,Select, MenuItem,Chip,Checkbox,ListItemText,Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { renderQuotaWithPrompt, showSuccess, showError } from 'utils/common';
import { API } from 'utils/api';

const validationSchema = Yup.object().shape({
  is_edit: Yup.boolean(),
  name: Yup.string().required('名称 不能为空'),
  remain_quota: Yup.number()
    .when('unlimited_quota', {
      is: true, 
      then: Yup.number().min(0, '额度不能小于0'), 
      otherwise: Yup.number().min(0.5, '必须大于等于0.5')
    }),
  expired_time: Yup.number(),
  unlimited_quota: Yup.boolean(),
  billing_enabled: Yup.boolean(),
  models: Yup.array().of(Yup.string()),
  group: Yup.string(),
});

const originInputs = {
  is_edit: false,
  name: '',
  fixed_content:'',
  subnet:'',
  remain_quota: 1,
  expired_time: -1,
  unlimited_quota: false,
  billing_enabled:false,
  group: '',
};

const EditModal = ({ open, tokenId, onCancel, onOk }) => {
  const theme = useTheme();
  const [inputs, setInputs] = useState(originInputs);
  const [modelRatioEnabled, setModelRatioEnabled] = useState('');
  const [billingByRequestEnabled, setBillingByRequestEnabled] = useState('');
  const [userGroupEnabled, setUserGroupEnabled] = useState('');
  const [options, setOptions] = useState({});
  const [models, setModels] = useState([]);
  const [groups, setGroups] = useState([]);
  let quotaPerUnit = localStorage.getItem('quota_per_unit');
  const generateRandomSuffix = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const submit = async (values, { setErrors, setStatus, setSubmitting }) => {
    setSubmitting(true);

    if (batchAddCount < 1 || batchAddCount > 100) {
      showError('批量添加数量必须在1到100之间');
      return;
    }

    try {
      const submissions = [];
      for (let i = 0; i < batchAddCount; i++) {
        let adjustedValues = { ...values };
        if (adjustedValues.unlimited_quota) {
          adjustedValues.remain_quota = 0;
        } else {
          adjustedValues.remain_quota = parseFloat(adjustedValues.remain_quota) * quotaPerUnit;
        }
        adjustedValues.models = values.models.join(',');

        // Add 4 random chars for each token when in batch add mode
        if (batchAddCount > 1) {
          const randomSuffix = generateRandomSuffix(); // Generate 4 random characters
          adjustedValues.name = `${values.name}-${randomSuffix}`;
        }

        let res;
        if (adjustedValues.is_edit) {
          res = await API.put(`/api/token/`, { ...adjustedValues, id: parseInt(tokenId) });
        } else {
          res = await API.post(`/api/token/`, adjustedValues);
        }

        submissions.push(res.data);
      }

      const failedSubmissions = submissions.filter(submission => !submission.success);
      if (failedSubmissions.length > 0) {
        const message = failedSubmissions.map(submission => submission.message).join(', ');
        showError(message);
        setErrors({ submit: message });
      } else {
        showSuccess(batchAddCount > 1 ? '所有令牌创建成功！' : '令牌创建成功，请在列表页面点击复制获取令牌！');
        setStatus({ success: true });
        onOk(true);
      }
    } catch (error) {
      showError(error.message);
      setErrors({ submit: error.message });
    }

    setSubmitting(false);
  };

  const loadModels = async () => {
    try {
        let res = await API.get('/api/user/models');
        const { success, message, data } = res.data;
        if (success) {
            setModels(data);
        } else {
            showError(message);
        }
    } catch (err) {
        showError(err.message);
    }
  };

  const loadGroups = async () => {
    try {
        let res = await API.get('/api/user/group');
        const { success, message, data } = res.data;
        if (success) {
            setGroups(data);
        } else {
            showError(message);
        }
    } catch (err) {
        showError(err.message);
    }
  };

  const [batchAddCount, setBatchAddCount] = useState(1);

  const handleBatchAddChange = (event) => {
    const count = parseInt(event.target.value, 10);
    if (!isNaN(count) && count > 0) {
      setBatchAddCount(count);
    }
  };

  const loadToken = async () => {
    let res = await API.get(`/api/token/${tokenId}`);
    const { success, message, data } = res.data;
    if (success) {
      data.is_edit = true;
      setInputs({
        ...data,
        remain_quota: parseFloat(data.remain_quota)/quotaPerUnit, 
        models: data.models ? data.models.split(',') : [] ,
        group: data.group || '' 
      });
    } else {
      showError(message);
    }
  };

  useEffect(() => {
    if (tokenId) {
      loadToken().catch(showError);
    } else {
      setInputs({
        ...originInputs, 
        models: [], 
      });
    }
    loadModels();
    getOptions();
    loadGroups();
  }, [tokenId]);

  useEffect(() => {
    // 此处代码用于初始加载和tokenId改变时重设batchAddCount
    if (!tokenId) {
      setBatchAddCount(1);
    }
  }, [tokenId]);

  const getOptions = async () => {
    const res = await API.get('/api/user/option');
    const { success, message, data } = res.data;
    if (success) {
      let newOptions = {};
      data.forEach((item) => {
        newOptions[item.key] = item.value;
      });
      setOptions(newOptions); // 设置所有选项的状态
    } else {
      showError(message);
    }
  };

  useEffect(() => {
    if (options.ModelRatioEnabled) { 
      setModelRatioEnabled(options.ModelRatioEnabled === 'true');
    }
    if (options.BillingByRequestEnabled) { 
      setBillingByRequestEnabled(options.BillingByRequestEnabled === 'true');
    }
    if (options.UserGroupEnabled) { 
      setUserGroupEnabled(options.UserGroupEnabled === 'true');
    }
  }, [options]);

  

  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth={'md'}>
      <DialogTitle sx={{ margin: '0px', fontWeight: 700, lineHeight: '1.55556', padding: '24px', fontSize: '1.125rem' }}>
        {tokenId ? '编辑令牌' : '新建令牌'}
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Alert severity="info">注意，令牌的额度仅用于限制令牌本身的最大额度使用量，实际的使用受到账户的剩余额度限制。</Alert>
        <Formik initialValues={inputs} enableReinitialize validationSchema={validationSchema} onSubmit={submit}>
          
          {({ errors, handleBlur, handleChange, handleSubmit, touched, values, setFieldError, setFieldValue, isSubmitting }) => (
            <form noValidate onSubmit={handleSubmit}>
              <FormControl fullWidth error={Boolean(touched.name && errors.name)} sx={{ ...theme.typography.otherInput }}>
                <InputLabel htmlFor="channel-name-label">名称</InputLabel>
                <OutlinedInput
                  id="channel-name-label"
                  label="名称"
                  type="text"
                  value={values.name}
                  name="name"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  inputProps={{ autoComplete: 'name' }}
                  aria-describedby="helper-text-channel-name-label"
                />
                {touched.name && errors.name && (
                  <FormHelperText error id="helper-tex-channel-name-label">
                    {errors.name}
                  </FormHelperText>
                )}
              </FormControl>
              {values.expired_time !== -1 && (
                <FormControl fullWidth error={Boolean(touched.expired_time && errors.expired_time)} sx={{ ...theme.typography.otherInput }}>
                  <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={'zh-cn'}>
                    <DateTimePicker
                      label="过期时间"
                      ampm={false}
                      value={dayjs.unix(values.expired_time)}
                      onError={(newError) => {
                        if (newError === null) {
                          setFieldError('expired_time', null);
                        } else {
                          setFieldError('expired_time', '无效的日期');
                        }
                      }}
                      onChange={(newValue) => {
                        setFieldValue('expired_time', newValue.unix());
                      }}
                      slotProps={{
                        actionBar: {
                          actions: ['today', 'accept']
                        }
                      }}
                    />
                  </LocalizationProvider>
                  {errors.expired_time && (
                    <FormHelperText error id="helper-tex-channel-expired_time-label">
                      {errors.expired_time}
                    </FormHelperText>
                  )}
                </FormControl>
              )}
              <Switch
                checked={values.expired_time === -1}
                onClick={() => {
                  if (values.expired_time === -1) {
                    setFieldValue('expired_time', Math.floor(Date.now() / 1000));
                  } else {
                    setFieldValue('expired_time', -1);
                  }
                }}
              />{' '}
              永不过期
              <FormControl fullWidth error={Boolean(touched.remain_quota && errors.remain_quota)} sx={{ ...theme.typography.otherInput }}>
                <InputLabel htmlFor="channel-remain_quota-label">额度</InputLabel>
                <OutlinedInput
                  id="channel-remain_quota-label"
                  label="额度"
                  type="number"
                  value={values.remain_quota}
                  name="remain_quota"
                  endAdornment={<InputAdornment position="end">{renderQuotaWithPrompt(values.remain_quota)}</InputAdornment>}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  aria-describedby="helper-text-channel-remain_quota-label"
                  disabled={values.unlimited_quota}
                />

                {touched.remain_quota && errors.remain_quota && (
                  <FormHelperText error id="helper-tex-channel-remain_quota-label">
                    {errors.remain_quota}
                  </FormHelperText>
                )}
              </FormControl>
              <Switch
                checked={values.unlimited_quota === true}
                onClick={() => {
                  setFieldValue('unlimited_quota', !values.unlimited_quota);
                }}
              />{' '}
              无限额度
              <FormControl fullWidth sx={{ ...theme.typography.otherInput, mt: 2 }}>
              <InputLabel htmlFor="models-multiple-select">可用模型</InputLabel>
              <Select
                labelId="models-multiple-label"
                id="models-multiple-select"
                multiple
                value={values.models}
                onChange={(event) => {
                  setFieldValue('models', event.target.value);
                }}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={value}
                        onDelete={() => {
                          const newSelected = values.models.filter(model => model !== value);
                          setFieldValue('models', newSelected);
                        }}
                        deleteIcon={
                          <CloseIcon
                            onMouseDown={(event) => event.stopPropagation()}
                          />
                        }
                      />
                    ))}
                  </Box>
                )}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 48 * 4.5 + 8,
                      width: 250,
                    },
                  },
                }}
              >
                {models.map((model) => (
                  <MenuItem key={model} value={model}>
                    <Checkbox checked={values.models.indexOf(model) > -1} />
                    <ListItemText primary={model} />
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>选择令牌可以使用的模型，为空表示全部可用。点击模型旁的 x 可直接删除。</FormHelperText>
              {touched.models && errors.models && (
                <FormHelperText error id="helper-text-models">
                  {errors.models}
                </FormHelperText>
              )}
            </FormControl>
              {userGroupEnabled && (
                <FormControl fullWidth sx={{ ...theme.typography.otherInput, mt: 2 }}>
                  <InputLabel id="group-select-label">分组</InputLabel>
                  <Select
                    labelId="group-select-label"
                    id="group-select"
                    value={values.group}
                    onChange={(event) => {
                      setFieldValue('group', event.target.value);
                    }}
                  >
                    {groups.map((group) => (
                      <MenuItem key={group.key} value={group.key}>
                        {group.value}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>特殊渠道专用，正常使用不需要选择</FormHelperText>
                </FormControl>
              )}


              {/* 新增的计费方式选择框 */}
              {tokenId ? null : (
              modelRatioEnabled && billingByRequestEnabled && (
              <FormControl fullWidth error={Boolean(touched.billing_enabled && errors.billing_enabled)} sx={{ ...theme.typography.otherInput }}>
                  <InputLabel id="billing-enabled-label">计费方式</InputLabel>
                  <Select
                    labelId="billing-enabled-label"
                    id="billing-enabled-select"
                    value={String(values.billing_enabled)} // 将布尔值转换为字符串
                    label="计费方式"
                    name="billing_enabled"
                    onBlur={handleBlur}
                    onChange={(event) => {
                      // 更新表单状态时，将字符串转换回布尔值
                      setFieldValue('billing_enabled', event.target.value === 'true');
                    }}
                  >
                    <MenuItem value={'false'}>按Token计费</MenuItem>
                    <MenuItem value={'true'}>按次计费</MenuItem>
                  </Select>
                  {touched.billing_enabled && errors.billing_enabled && (
                    <FormHelperText error id="helper-text-billing-enabled">
                      {errors.billing_enabled}
                    </FormHelperText>
                  )}
                </FormControl>
                  )
                )}

              <FormControl fullWidth error={Boolean(touched.subnet && errors.subnet)} sx={{ ...theme.typography.otherInput }}>
                <InputLabel htmlFor="channel-subnet-label">IP 限制</InputLabel>
                <OutlinedInput
                  id="channel-subnet-label"
                  label="IP 限制"
                  type="text"
                  value={values.subnet}
                  name="subnet"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  inputProps={{ autoComplete: 'subnet' }}
                  helperText="请输入允许访问的网段，例如：192.168.0.0/24"
                  aria-describedby="helper-text-channel-subnet-label"
                />
                 <FormHelperText>请输入允许访问的网段，例如：192.168.0.0/24</FormHelperText>
                {touched.subnet && errors.subnet && (
                  <FormHelperText error id="helper-tex-channel-subnet-label">
                    {errors.subnet}
                  </FormHelperText>
                )}
              </FormControl>

              <FormControl fullWidth error={Boolean(touched.fixed_content && errors.fixed_content)} sx={{ ...theme.typography.otherInput }}>
                <InputLabel htmlFor="channel-fixed_content-label">自定义后缀</InputLabel>
                <OutlinedInput
                  id="channel-name-label"
                  label="自定义后缀"
                  type="text"
                  value={values.fixed_content}
                  name="fixed_content"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  inputProps={{ autoComplete: 'fixed_content' }}
                  helperText="使用令牌回复内容增加固定后缀"
                  aria-describedby="helper-text-channel-fixed_content-label"
                />
                {touched.fixed_content && errors.fixed_content && (
                  <FormHelperText error id="helper-tex-channel-fixed_content-label">
                    {errors.fixed_content}
                  </FormHelperText>
                )}
              </FormControl>

              {tokenId ? null : (
                <FormControl fullWidth sx={{ ...theme.typography.otherInput }}>
                  <TextField
                    label="批量添加数量"
                    type="number"
                    value={batchAddCount}
                    onChange={handleBatchAddChange}
                    margin="normal"
                    helperText="一次性创建多个Token的数量"
                  />
                </FormControl>
              )}
               
              <DialogActions>
                <Button onClick={onCancel}>取消</Button>
                <Button disableElevation disabled={isSubmitting} type="submit" variant="contained" color="primary">
                  提交
                </Button>
              </DialogActions>
              
            </form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default EditModal;

EditModal.propTypes = {
  open: PropTypes.bool,
  tokenId: PropTypes.number,
  onCancel: PropTypes.func,
  onOk: PropTypes.func
};

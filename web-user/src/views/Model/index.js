import React, { useState, useEffect } from 'react';
import { showError } from 'utils/common';
import {
  Card,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import ModelTableHead from './component/TableHead';
import { API } from 'utils/api';

function formatNumber(num) {
  if (num % 1 !== 0) {
      const decimalPart = num.toString().split('.')[1];
      if (decimalPart.length > 5) {
          return num.toFixed(5);
      } else {
          return num;
      }
  } else {
      return num;
  }
}

export default function Log() {
  const [models, setModels] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');

  const loadGroups = async () => {
      try {
          let res = await API.get('/api/user/group');
          const { success, message, data } = res.data;
          if (success) {
              const groupsWithDefault = [
                  { key: '', name: '默认分组' },
                  ...data
              ];
              setGroups(groupsWithDefault);
              
              // 默认选择"默认分组"
              setSelectedGroup('');
          } else {
              showError(message);
          }
      } catch (err) {
          showError(err.message);
      }
  };

  const loadModels = async (group) => {
    try {
      let res = await API.get(`/api/user/modelbilling${group ? `?group=${group}` : ''}`);
      const { success, message, data } = res.data;
      if (success && Array.isArray(data)) {
        setModels(data);
      } else {
        showError(message);
        setModels([]);
      }
    } catch (err) {
      showError(err.message);
      setModels([]);
    }
  };

  useEffect(() => {
    loadGroups();
    loadModels('');
  }, []);
  
  useEffect(() => {
    loadModels(selectedGroup);
  }, [selectedGroup]);

  const handleGroupChange = (event) => {
    setSelectedGroup(event.target.value);
  };

  return (
    <>
      <Stack direction="row" alignItems="center" mb={5}>
        <Typography variant="h4" sx={{ marginRight: 2 }}>可用模型</Typography>
        <FormControl size="small" sx={{ minWidth: 80 }}> {/* 设置最小宽度 */}
          <InputLabel id="group-select-label">分组</InputLabel>
          <Select
            labelId="group-select-label"
            value={selectedGroup}
            label="分组"
            onChange={handleGroupChange}
            autoWidth // 添加自动宽度
            sx={{
              fontSize: '0.875rem', // 减小字体大小
              '& .MuiSelect-select': {
                paddingRight: '24px', // 为下拉箭头留出空间
              }
            }}
          >
            {groups.map((group) => (
              <MenuItem key={group.key} value={group.key}>
                {group.key === '' ? '默认分组' : group.value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
      <Card>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <ModelTableHead />
            <TableBody>
              {models && models.length > 0 ? (
                models.map((modelInfo, index) => (
                  <TableRow key={index}>
                    <TableCell component="th" scope="row">{modelInfo.model}</TableCell>
                    
                    <TableCell align="right">
                      {modelInfo.model_ratio_2 !== undefined && modelInfo.model_ratio_2 !== 0 ?
                        modelInfo.model_ratio_2.toFixed(3) : '无'}
                    </TableCell>

                    <TableCell align="right">
                      {modelInfo.model_ratio !== undefined && modelInfo.model_ratio !== 0 ?
                      formatNumber(modelInfo.model_ratio * 0.002) : '无'}
                    </TableCell>

                    <TableCell align="right">
                      {modelInfo.model_ratio !== undefined && modelInfo.model_ratio !== 0 ?
                        formatNumber(modelInfo.model_completion_ratio * 0.002) : '无'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </>
  );
}

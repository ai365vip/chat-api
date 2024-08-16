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
  InputLabel,
  TextField,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import ModelTableHead from './component/TableHead';
import { API } from 'utils/api';
import { useTheme } from '@mui/material/styles';
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
  const theme = useTheme();
  const [models, setModels] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  
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
              setSelectedGroup('');
          } else {
              showError(message);
          }
      } catch (err) {
          showError(err.message);
      }
  };

  const loadModels = async (group, search) => {
    try {
      let url = '/api/user/modelbilling';
      const params = new URLSearchParams();
      if (group) params.append('group', group);
      if (search) params.append('search', search);
      if (params.toString()) url += `?${params.toString()}`;

      let res = await API.get(url);
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
    loadModels('', '');
  }, []);
  
  useEffect(() => {
    loadModels(selectedGroup, currentSearchTerm);
  }, [selectedGroup, currentSearchTerm]);

  const handleGroupChange = (event) => {
    setSelectedGroup(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = () => {
    setCurrentSearchTerm(searchTerm);
  };

  const groupModelsByType = (models) => {
    const groupedModels = {};
    models.forEach(model => {
      if (!groupedModels[model.model_type]) {
        groupedModels[model.model_type] = [];
      }
      groupedModels[model.model_type].push(model);
    });
    return groupedModels;
  };

  const sortModelTypes = (groupedModels) => {
    const sortedEntries = Object.entries(groupedModels).sort(([a], [b]) => {
      if (a === 'other') return 1;
      if (b === 'other') return -1;
      if (a === 'OpenAI') return -1;
      if (b === 'OpenAI') return 1;
      return a.localeCompare(b);
    });
    return Object.fromEntries(sortedEntries);
  };
  const groupedModels = sortModelTypes(groupModelsByType(models));
  const hasModels = Object.keys(groupedModels).length > 0;
  return (
    <Box sx={{ maxWidth: 1200, margin: 'auto', padding: 3 }}>
      <Alert severity="info">
        按次计费与按token计费同时存在 按次计费优先。
        </Alert>
      <Stack direction="row" alignItems="center" mb={5} spacing={2}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>可用模型</Typography>
        <TextField 
          size="small"
          label="搜索模型"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="group-select-label">分组</InputLabel>
          <Select
            labelId="group-select-label"
            value={selectedGroup}
            label="分组"
            onChange={handleGroupChange}
            sx={{ fontSize: '0.875rem' }}
          >
            {groups.map((group) => (
              <MenuItem key={group.key} value={group.key}>
                {group.key === '' ? '默认分组' : group.value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
       
        <Button
          variant="contained"
          startIcon={<SearchIcon />}
          onClick={handleSearch}
          size="small"
        >
          搜索
        </Button>
      </Stack>

      <Card elevation={3}>
        <TableContainer component={Paper}>
          {hasModels ? (
            Object.entries(groupedModels).map(([modelType, models]) => (
              <Accordion key={modelType} defaultExpanded>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ 
                    backgroundColor: theme.palette.mode === 'light' 
                      ? theme.palette.grey[100] 
                      : theme.palette.grey[800],
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'light'
                        ? theme.palette.grey[200]
                        : theme.palette.grey[500],
                    },
                    '&.Mui-expanded': {
                      minHeight: 48,
                      maxHeight: 48,
                    },
                    '& .MuiAccordionSummary-content, & .MuiAccordionSummary-expandIconWrapper': {
                      color: theme.palette.text.primary,
                    }
                  }}
                >
                  <Typography variant="h6">{modelType}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                <Table size="small">
                  <ModelTableHead />
                  <TableBody>
                    {models.map((modelInfo, index) => (
                      <TableRow 
                        key={index} 
                        hover
                      >
                        <TableCell component="th" scope="row" align="left" sx={{ fontWeight: 'medium' }}>
                          {modelInfo.model}
                        </TableCell>
                        <TableCell align="left">
                          {modelInfo.model_ratio_2 !== undefined && modelInfo.model_ratio_2 !== 0 ?
                            modelInfo.model_ratio_2.toFixed(3) : '无'}
                        </TableCell>
                        <TableCell align="left">
                          {modelInfo.model_ratio !== undefined && modelInfo.model_ratio !== 0 ?
                            formatNumber(modelInfo.model_ratio * 0.002) : '无'}
                        </TableCell>
                        <TableCell align="left">
                          {modelInfo.model_ratio !== undefined && modelInfo.model_ratio !== 0 ?
                            formatNumber(modelInfo.model_completion_ratio * 0.002) : '无'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                {currentSearchTerm 
                  ? '没有找到匹配的模型。请尝试其他搜索词。' 
                  : '没有可用的模型数据。'}
              </Typography>
            </Box>
          )}
        </TableContainer>
      </Card>
    </Box>
  );
}
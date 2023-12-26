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
  Paper
} from '@mui/material';
import ModelTableHead from './component/TableHead';
import { API } from 'utils/api';

export default function Log() {
  const [models, setModels] = useState([]);

  const loadModels = async () => {
    try {
      let res = await API.get('/api/user/modelbilling');
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
    loadModels();
  }, []);

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Model Billing</Typography>
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
                        modelInfo.model_ratio_2.toFixed(4) : '无'}
                    </TableCell>

                    <TableCell align="right">
                      {modelInfo.model_ratio !== undefined && modelInfo.model_ratio !== 0 ?
                        (modelInfo.model_ratio * 0.002).toFixed(4) : '无'}
                    </TableCell>

                    <TableCell align="right">
                      {modelInfo.model_ratio !== undefined && modelInfo.model_ratio !== 0 ?
                        (modelInfo.model_ratio * 0.002 * 2).toFixed(4) : '无'}
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

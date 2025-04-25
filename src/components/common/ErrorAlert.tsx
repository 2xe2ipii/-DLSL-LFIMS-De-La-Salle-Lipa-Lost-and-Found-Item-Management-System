import React from 'react';
import { Alert, AlertTitle, Box, Paper } from '@mui/material';

interface ErrorAlertProps {
  message: string;
  title?: string;
  severity?: 'error' | 'warning' | 'info' | 'success';
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ 
  message, 
  title = 'Error', 
  severity = 'error' 
}) => {
  return (
    <Box sx={{ my: 2 }}>
      <Paper elevation={0}>
        <Alert severity={severity}>
          {title && <AlertTitle>{title}</AlertTitle>}
          {message}
        </Alert>
      </Paper>
    </Box>
  );
};

export default ErrorAlert; 
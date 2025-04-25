import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { LockOutlined as LockIcon } from '@mui/icons-material';

const AccessDeniedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: 3,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 500,
          width: '100%',
        }}
      >
        <LockIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
        
        <Typography variant="h4" component="h1" gutterBottom color="error">
          Access Denied
        </Typography>
        
        <Typography variant="body1" align="center" sx={{ mb: 3 }}>
          You do not have permission to access this page. Please contact your administrator if you believe this is an error.
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/dashboard')}
          sx={{ mt: 2 }}
        >
          Go to Dashboard
        </Button>
      </Paper>
    </Box>
  );
};

export default AccessDeniedPage; 
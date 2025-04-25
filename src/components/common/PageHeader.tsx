import React from 'react';
import { Box, Typography, Divider, useTheme } from '@mui/material';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description, 
  action 
}) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ mb: 3 }}>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 1
        }}
      >
        <Box>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 600,
              color: theme.palette.text.primary
            }}
          >
            {title}
          </Typography>
          {description && (
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              {description}
            </Typography>
          )}
        </Box>
        
        {action && (
          <Box>
            {action}
          </Box>
        )}
      </Box>
      <Divider sx={{ mt: 2 }} />
    </Box>
  );
};

export default PageHeader; 
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: [
      'Poppins',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 600,
      fontSize: '2.5rem',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      letterSpacing: '-0.01em',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      letterSpacing: '-0.01em',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      letterSpacing: '-0.01em',
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1rem',
      letterSpacing: '0.01em',
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.875rem',
      letterSpacing: '0.01em',
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      letterSpacing: '0.01em',
      fontWeight: 400,
    },
    body2: {
      fontSize: '0.75rem',
      lineHeight: 1.6,
      letterSpacing: '0.01em',
      fontWeight: 400,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      letterSpacing: '0.01em',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
          padding: '8px 16px',
          fontSize: '0.875rem',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 6,
          '& .MuiChip-label': {
            padding: '0 12px',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          fontSize: '0.875rem',
          padding: '12px 16px',
        },
        head: {
          fontWeight: 600,
          fontSize: '0.875rem',
          backgroundColor: '#f8f9fa',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': {
              borderColor: '#e0e0e0',
            },
            '&:hover fieldset': {
              borderColor: '#bdbdbd',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
  // ... rest of your theme configuration
});

export default theme; 
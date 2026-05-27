import { createTheme } from '@mui/material/styles'

const accent = '#4A90D9'

const shared = {
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600, letterSpacing: '-0.01em' },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '8px 20px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 4px 14px rgba(74, 144, 217, 0.35)' },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 700,
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '12px 16px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 14,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined' as const,
        size: 'small' as const,
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
}

export const lightTheme = createTheme({
  ...shared,
  palette: {
    mode: 'light',
    primary: { main: accent },
    secondary: { main: '#2ecc71' },
    background: { default: '#f4f6f9', paper: '#ffffff' },
    text: { primary: '#1a1a2e', secondary: '#6b7280' },
    divider: '#e5e7eb',
  },
})

export const darkTheme = createTheme({
  ...shared,
  palette: {
    mode: 'dark',
    primary: { main: accent },
    secondary: { main: '#2ecc71' },
    background: { default: '#0f0f1a', paper: '#1a1a2e' },
    text: { primary: '#e8e8f0', secondary: '#9ca3af' },
    divider: '#2a2a3e',
  },
})

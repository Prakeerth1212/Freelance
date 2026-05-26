import { createTheme } from '@mui/material/styles'

const accent = '#4A90D9'

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: accent },
    secondary: { main: '#2ecc71' },
    background: { default: '#f0f0f0', paper: '#ffffff' },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: { borderRadius: 8 },
})

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: accent },
    secondary: { main: '#2ecc71' },
    background: { default: '#1e1e1e', paper: '#2d2d2d' },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: { borderRadius: 8 },
})

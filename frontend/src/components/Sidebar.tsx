import { useLocation, useNavigate } from 'react-router-dom'
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Button,
  Divider,
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import WorkIcon from '@mui/icons-material/Work'
import ReceiptIcon from '@mui/icons-material/Receipt'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import LogoutIcon from '@mui/icons-material/Logout'

const navItems = [
  { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { label: 'Clients', path: '/clients', icon: <PeopleIcon /> },
  { label: 'Projects & Time', path: '/projects', icon: <WorkIcon /> },
  { label: 'Invoices', path: '/invoices', icon: <ReceiptIcon /> },
  { label: 'AI Assistant', path: '/ai', icon: <SmartToyIcon /> },
]

interface SidebarProps {
  darkMode: boolean
  onToggleTheme: () => void
  onLogout: () => void
}

export default function Sidebar({ darkMode, onToggleTheme, onLogout }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const username = localStorage.getItem('username') || 'User'

  return (
    <Box
      sx={{
        width: 220,
        minHeight: '100vh',
        bgcolor: darkMode ? '#1e1e1e' : '#e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        borderRight: darkMode ? '1px solid #3d3d3d' : '1px solid #ccc',
      }}
    >
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography
          variant="h6"
          sx={{ color: '#4A90D9', fontWeight: 700, letterSpacing: 1 }}
        >
          FreelanceHub
        </Typography>
      </Box>
      <Divider />
      <List sx={{ flex: 1, px: 1 }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path
          return (
            <ListItemButton
              key={item.path}
              selected={active}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                color: active ? '#fff' : darkMode ? '#ccc' : '#333',
                '&.Mui-selected': {
                  bgcolor: '#4A90D9',
                  '&:hover': { bgcolor: '#3a7bc8' },
                },
                '&:hover': {
                  bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 36,
                  color: active ? '#fff' : darkMode ? '#ccc' : '#555',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          )
        })}
      </List>
      <Divider />
      <Box sx={{ p: 1.5 }}>
        <Button
          fullWidth
          size="small"
          startIcon={darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          onClick={onToggleTheme}
          sx={{
            color: darkMode ? '#ccc' : '#555',
            textTransform: 'none',
            justifyContent: 'flex-start',
            px: 1,
          }}
        >
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </Button>
      </Box>
      <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="caption" sx={{ color: darkMode ? '#999' : '#666', fontStyle: 'italic' }}>
          {username}
        </Typography>
        <Button
          size="small"
          startIcon={<LogoutIcon fontSize="small" />}
          onClick={() => { onLogout(); navigate('/login') }}
          sx={{
            color: darkMode ? '#ccc' : '#555',
            textTransform: 'none',
            minWidth: 0,
            px: 1,
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  )
}

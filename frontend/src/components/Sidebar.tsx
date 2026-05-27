import { useLocation, useNavigate } from 'react-router-dom'
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Divider,
  Tooltip,
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
        width: 240,
        minHeight: '100vh',
        bgcolor: darkMode ? '#12121e' : '#f8f9fc',
        borderRight: darkMode ? '1px solid #1e1e30' : '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        transition: 'background-color 0.3s ease',
      }}
    >
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
            bgcolor: '#4A90D9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            color: '#fff',
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          FH
        </Box>
        <Typography
          variant="h6"
          sx={{
            color: '#4A90D9',
            fontWeight: 800,
            letterSpacing: '0.02em',
            fontSize: '1.15rem',
          }}
        >
          FreelanceHub
        </Typography>
      </Box>

      <Divider sx={{ mx: 1.5 }} />

      <List sx={{ flex: 1, px: 1.5, pt: 1.5 }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path
          return (
            <Tooltip key={item.path} title={item.label} placement="right" arrow>
              <ListItemButton
                selected={active}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  mb: 0.3,
                  py: 1.2,
                  px: 1.5,
                  color: active ? '#fff' : darkMode ? '#9ca3af' : '#6b7280',
                  transition: 'all 0.2s ease',
                  '&.Mui-selected': {
                    bgcolor: '#4A90D9',
                    color: '#fff',
                    '&:hover': { bgcolor: '#3a7bc8' },
                    '& .MuiListItemIcon-root': { color: '#fff' },
                  },
                  '&:hover': {
                    bgcolor: active
                      ? '#3a7bc8'
                      : darkMode
                        ? 'rgba(255,255,255,0.06)'
                        : 'rgba(0,0,0,0.04)',
                    color: active ? '#fff' : darkMode ? '#e8e8f0' : '#1a1a2e',
                    '& .MuiListItemIcon-root': {
                      color: active ? '#fff' : darkMode ? '#e8e8f0' : '#1a1a2e',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 34,
                    color: active ? '#fff' : darkMode ? '#9ca3af' : '#6b7280',
                    transition: 'color 0.2s ease',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: active ? 600 : 500,
                  }}
                />
              </ListItemButton>
            </Tooltip>
          )
        })}
      </List>

      <Divider sx={{ mx: 1.5 }} />

      <Box sx={{ px: 1.5, py: 1.5 }}>
        <ListItemButton
          onClick={onToggleTheme}
          sx={{
            borderRadius: 2,
            py: 1,
            px: 1.5,
            color: darkMode ? '#9ca3af' : '#6b7280',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
              color: darkMode ? '#e8e8f0' : '#1a1a2e',
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 34,
              color: darkMode ? '#9ca3af' : '#6b7280',
            }}
          >
            {darkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText
            primary={darkMode ? 'Light Mode' : 'Dark Mode'}
            primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500 }}
          />
        </ListItemButton>
      </Box>

      <Box
        sx={{
          px: 1.5,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: darkMode ? '1px solid #1e1e30' : '1px solid #e5e7eb',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              bgcolor: '#4A90D9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 12,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {username.charAt(0).toUpperCase()}
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: darkMode ? '#9ca3af' : '#6b7280',
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {username}
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={() => { onLogout(); navigate('/login') }}
          sx={{
            color: darkMode ? '#9ca3af' : '#6b7280',
            '&:hover': { color: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)' },
            transition: 'color 0.2s ease',
          }}
        >
          <LogoutIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  )
}

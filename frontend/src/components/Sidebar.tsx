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
        width: 250,
        minHeight: '100vh',
        bgcolor: darkMode ? 'rgba(12, 12, 24, 0.85)' : 'rgba(248, 249, 252, 0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRight: darkMode ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
      }}
    >
      <Box
        sx={{
          p: 3,
          pb: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2.5,
            background: 'linear-gradient(135deg, #4A90D9, #357abd)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            color: '#fff',
            fontSize: 16,
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(74,144,217,0.3)',
          }}
        >
          FH
        </Box>
        <Typography
          variant="h6"
          sx={{
            background: 'linear-gradient(135deg, #4A90D9, #6ba8e8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            fontSize: '1.2rem',
          }}
        >
          FreelanceHub
        </Typography>
      </Box>

      <Divider sx={{ mx: 2, opacity: 0.4 }} />

      <List sx={{ flex: 1, px: 1.5, pt: 2 }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path
          return (
            <Tooltip key={item.path} title={item.label} placement="right" arrow>
              <ListItemButton
                selected={active}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2.5,
                  mb: 0.5,
                  py: 1.3,
                  px: 1.5,
                  transition: 'all 0.25s ease',
                  ...(active
                    ? {
                        background: 'linear-gradient(135deg, #4A90D9, #357abd)',
                        color: '#fff',
                        boxShadow: '0 4px 14px rgba(74,144,217,0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #357abd, #4A90D9)',
                          boxShadow: '0 6px 20px rgba(74,144,217,0.4)',
                        },
                        '& .MuiListItemIcon-root': { color: '#fff' },
                      }
                    : {
                        color: darkMode ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)',
                        '&:hover': {
                          bgcolor: darkMode
                            ? 'rgba(255,255,255,0.05)'
                            : 'rgba(74,144,217,0.06)',
                          color: darkMode ? '#e2e8f0' : '#0f172a',
                          '& .MuiListItemIcon-root': {
                            color: darkMode ? '#e2e8f0' : '#0f172a',
                          },
                        },
                      }),
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 34,
                    transition: 'color 0.25s ease',
                    ...(active
                      ? { color: '#fff' }
                      : { color: darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }),
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.85rem',
                    fontWeight: active ? 700 : 500,
                  }}
                />
              </ListItemButton>
            </Tooltip>
          )
        })}
      </List>

      <Divider sx={{ mx: 2, opacity: 0.4 }} />

      <Box sx={{ px: 1.5, py: 1.5 }}>
        <ListItemButton
          onClick={onToggleTheme}
          sx={{
            borderRadius: 2.5,
            py: 1.2,
            px: 1.5,
            color: darkMode ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(74,144,217,0.06)',
              color: darkMode ? '#e2e8f0' : '#0f172a',
              '& .MuiListItemIcon-root': {
                color: darkMode ? '#e2e8f0' : '#0f172a',
              },
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 34,
              color: darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
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
          px: 2,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: darkMode ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.04)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #4A90D9, #357abd)',
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
            variant="body2"
            sx={{
              color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontSize: '0.8rem',
            }}
          >
            {username}
          </Typography>
        </Box>
        <Tooltip title="Logout" arrow>
          <IconButton
            size="small"
            onClick={() => { onLogout(); navigate('/login') }}
            sx={{
              color: darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
              borderRadius: 1.5,
              transition: 'all 0.2s ease',
              '&:hover': {
                color: '#ef4444',
                bgcolor: 'rgba(239,68,68,0.08)',
                transform: 'scale(1.1)',
              },
            }}
          >
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
}

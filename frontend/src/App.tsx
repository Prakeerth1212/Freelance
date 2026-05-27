import { useState, useMemo, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { ThemeProvider, CssBaseline, Box, Fade } from '@mui/material'
import { lightTheme, darkTheme } from './theme'
import Sidebar from './components/Sidebar'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ClientsPage from './pages/ClientsPage'
import ProjectsPage from './pages/ProjectsPage'
import InvoicesPage from './pages/InvoicesPage'
import AIPage from './pages/AIPage'

export default function App() {
  const [darkMode, setDarkMode] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'))
  const theme = useMemo(() => (darkMode ? darkTheme : lightTheme), [darkMode])
  const location = useLocation()

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'))
  }, [location])

  const handleLogout = () => {
    localStorage.clear()
    setIsLoggedIn(false)
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        {isLoggedIn && (
          <Sidebar
            darkMode={darkMode}
            onToggleTheme={() => setDarkMode(!darkMode)}
            onLogout={handleLogout}
          />
        )}
        <Box sx={{ flex: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
          <Fade in key={location.pathname} timeout={300}>
            <Box>
              <Routes location={location}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/clients" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
                <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
                <Route path="/invoices" element={<ProtectedRoute><InvoicesPage /></ProtectedRoute>} />
                <Route path="/ai" element={<ProtectedRoute><AIPage /></ProtectedRoute>} />
              </Routes>
            </Box>
          </Fade>
        </Box>
      </Box>
    </ThemeProvider>
  )
}

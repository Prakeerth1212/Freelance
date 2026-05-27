import { useState, useMemo, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { ThemeProvider, CssBaseline, Box } from '@mui/material'
import { lightTheme, darkTheme } from './theme'
import Sidebar from './components/Sidebar'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ClientsPage from './pages/ClientsPage'
import ProjectsPage from './pages/ProjectsPage'
import InvoicesPage from './pages/InvoicesPage'
import AIPage from './pages/AIPage'

function AnimatedBackground({ darkMode }: { darkMode: boolean }) {
  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <Box
        className="animate-float"
        sx={{
          position: 'absolute',
          top: '10%',
          right: '15%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: darkMode
            ? 'radial-gradient(circle, rgba(74,144,217,0.06) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(74,144,217,0.05) 0%, transparent 70%)',
        }}
      />
      <Box
        className="animate-float"
        sx={{
          position: 'absolute',
          bottom: '15%',
          left: '10%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: darkMode
            ? 'radial-gradient(circle, rgba(46,204,113,0.04) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(46,204,113,0.04) 0%, transparent 70%)',
          animationDelay: '-3s',
        }}
      />
      <Box
        className="animate-float"
        sx={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: darkMode
            ? 'radial-gradient(circle, rgba(139,92,246,0.03) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(139,92,246,0.03) 0%, transparent 70%)',
          animationDelay: '-1.5s',
        }}
      />
    </Box>
  )
}

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
      <Box sx={{ position: 'relative', minHeight: '100vh' }}>
        <AnimatedBackground darkMode={darkMode} />
        <Box sx={{ display: 'flex', position: 'relative', zIndex: 1 }}>
          {isLoggedIn && (
            <Sidebar
              darkMode={darkMode}
              onToggleTheme={() => setDarkMode(!darkMode)}
              onLogout={handleLogout}
            />
          )}
          <Box sx={{ flex: 1, minHeight: '100vh' }}>
            <Routes location={location}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/clients" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
              <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
              <Route path="/invoices" element={<ProtectedRoute><InvoicesPage /></ProtectedRoute>} />
              <Route path="/ai" element={<ProtectedRoute><AIPage /></ProtectedRoute>} />
            </Routes>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  )
}

import { useState, useMemo } from 'react'
import { Routes, Route } from 'react-router-dom'
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

export default function App() {
  const [darkMode, setDarkMode] = useState(true)
  const theme = useMemo(() => (darkMode ? darkTheme : lightTheme), [darkMode])

  const token = localStorage.getItem('token')
  const isLoggedIn = !!token

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        {isLoggedIn && (
          <Sidebar
            darkMode={darkMode}
            onToggleTheme={() => setDarkMode(!darkMode)}
          />
        )}
        <Box sx={{ flex: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/clients" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
            <Route path="/invoices" element={<ProtectedRoute><InvoicesPage /></ProtectedRoute>} />
            <Route path="/ai" element={<ProtectedRoute><AIPage /></ProtectedRoute>} />
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  )
}

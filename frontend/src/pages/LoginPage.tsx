import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Link,
  Fade,
} from '@mui/material'
import { login, register } from '../api/auth'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [visible, setVisible] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setVisible(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = isSignUp ? await register(username, password) : await login(username, password)
      localStorage.setItem('token', res.token)
      localStorage.setItem('username', res.username)
      localStorage.setItem('role', res.role)
      navigate('/', { replace: true })
    } catch (err: any) {
      setError(err?.response?.data?.error || (isSignUp ? 'Registration failed' : 'Invalid username or password'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #0f0f1a 0%, #1a1a3e 50%, #0f0f1a 100%)'
            : 'linear-gradient(135deg, #f4f6f9 0%, #e0e7ff 50%, #f4f6f9 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(74,144,217,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -150,
          left: -150,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(46,204,113,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <Fade in={visible} timeout={500}>
        <Card
          sx={{
            width: 400,
            p: 1,
            borderRadius: 4,
            position: 'relative',
            zIndex: 1,
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 20px 60px rgba(0,0,0,0.5)'
                : '0 20px 60px rgba(0,0,0,0.1)',
          }}
          elevation={0}
        >
          <CardContent sx={{ px: 3, py: 3 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: '#4A90D9',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  color: '#fff',
                  fontSize: 20,
                  mb: 1.5,
                }}
              >
                FH
              </Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: '#4A90D9', letterSpacing: '-0.02em' }}
              >
                FreelanceHub
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </Typography>
            </Box>
            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                margin="normal"
                autoFocus
                autoComplete="username"
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
              />
              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{ mt: 2.5, py: 1.3, fontSize: '0.95rem' }}
              >
                {loading ? (
                  <CircularProgress size={22} color="inherit" />
                ) : isSignUp ? (
                  'Sign Up'
                ) : (
                  'Sign In'
                )}
              </Button>
            </Box>
            <Box sx={{ textAlign: 'center', mt: 2.5 }}>
              <Link
                component="button"
                variant="body2"
                onClick={() => { setIsSignUp(!isSignUp); setError('') }}
                underline="hover"
                sx={{ fontWeight: 500 }}
              >
                {isSignUp
                  ? 'Already have an account? Sign In'
                  : "Don't have an account? Sign Up"}
              </Link>
            </Box>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  )
}

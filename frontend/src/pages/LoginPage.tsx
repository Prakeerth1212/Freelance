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

function FloatingShapes() {
  const shapes = [
    { size: 300, top: '5%', left: '10%', delay: 0, color: 'rgba(74,144,217,0.05)', duration: 7 },
    { size: 200, top: '60%', left: '80%', delay: -2, color: 'rgba(46,204,113,0.04)', duration: 9 },
    { size: 250, top: '30%', left: '70%', delay: -4, color: 'rgba(139,92,246,0.03)', duration: 8 },
    { size: 150, top: '70%', left: '15%', delay: -1, color: 'rgba(245,158,11,0.03)', duration: 6 },
    { size: 100, top: '15%', left: '60%', delay: -3, color: 'rgba(74,144,217,0.04)', duration: 10 },
  ]

  return (
    <>
      {shapes.map((s, i) => (
        <Box
          key={i}
          className="animate-float"
          sx={{
            position: 'absolute',
            width: s.size,
            height: s.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${s.color} 0%, transparent 70%)`,
            top: s.top,
            left: s.left,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            pointerEvents: 'none',
          }}
        />
      ))}
    </>
  )
}

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
        position: 'relative',
        overflow: 'hidden',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #08080f 0%, #0f0f24 30%, #0a0a18 70%, #08080f 100%)'
            : 'linear-gradient(135deg, #f0f2f5 0%, #e8edf5 30%, #f0f2f5 70%, #f0f2f5 100%)',
      }}
    >
      <FloatingShapes />

      <Fade in={visible} timeout={800}>
        <Card
          sx={{
            width: 420,
            position: 'relative',
            zIndex: 1,
            borderRadius: 4,
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(19, 19, 31, 0.8)'
                : 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: (theme) =>
              theme.palette.mode === 'dark'
                ? '1px solid rgba(255,255,255,0.06)'
                : '1px solid rgba(255,255,255,0.8)',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 30px 80px rgba(0,0,0,0.6)'
                : '0 30px 80px rgba(0,0,0,0.08)',
          }}
          elevation={0}
        >
          <CardContent sx={{ px: 4, py: 4 }}>
            <Fade in={visible} timeout={1000}>
              <Box sx={{ textAlign: 'center', mb: 3.5 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #4A90D9, #357abd)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    color: '#fff',
                    fontSize: 22,
                    mb: 2,
                    boxShadow: '0 8px 24px rgba(74,144,217,0.3)',
                  }}
                >
                  FH
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 900,
                    fontSize: '1.75rem',
                    background: 'linear-gradient(135deg, #4A90D9, #6ba8e8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 0.5,
                  }}
                >
                  FreelanceHub
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {isSignUp ? 'Create your account to get started' : 'Welcome back! Sign in to continue'}
                </Typography>
              </Box>
            </Fade>

            {error && (
              <Fade in={!!error}>
                <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2.5 }}>
                  {error}
                </Alert>
              </Fade>
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
                sx={{
                  mt: 3,
                  py: 1.4,
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  borderRadius: 2.5,
                  background: 'linear-gradient(135deg, #4A90D9, #357abd)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #357abd, #4A90D9)',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={22} color="inherit" />
                ) : isSignUp ? (
                  'Create Account'
                ) : (
                  'Sign In'
                )}
              </Button>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Link
                component="button"
                variant="body2"
                onClick={() => { setIsSignUp(!isSignUp); setError('') }}
                underline="hover"
                sx={{ fontWeight: 600, fontSize: '0.85rem' }}
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

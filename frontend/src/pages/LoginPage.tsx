import { useState } from 'react'
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
} from '@mui/material'
import { login, register } from '../api/auth'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const navigate = useNavigate()

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
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Card sx={{ width: 380, p: 2 }} elevation={6}>
        <CardContent>
          <Typography variant="h5" sx={{ textAlign: 'center', mb: 1, color: '#4A90D9', fontWeight: 700 }}>
            FreelanceHub
          </Typography>
          <Typography variant="body2" sx={{ textAlign: 'center', mb: 3, color: 'text.secondary' }}>
            {isSignUp ? 'Create a new account' : 'Sign in to your account'}
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
              autoFocus
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ mt: 2, py: 1.2 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : (isSignUp ? 'Sign Up' : 'Sign In')}
            </Button>
          </Box>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link
              component="button"
              variant="body2"
              onClick={() => { setIsSignUp(!isSignUp); setError('') }}
              underline="hover"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

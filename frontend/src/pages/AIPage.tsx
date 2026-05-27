import { useState, useRef, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import PersonIcon from '@mui/icons-material/Person'
import { generate } from '../api/ai'
import PageLayout from '../components/PageLayout'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'error' } | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const username = localStorage.getItem('username') || 'You'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) {
      setSnackbar({ message: 'Enter a prompt first', severity: 'error' })
      return
    }
    const userMessage: Message = { role: 'user', content: input.trim() }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)
    try {
      const res = await generate(input.trim())
      setMessages((prev) => [...prev, { role: 'assistant', content: res.response }])
    } catch {
      setSnackbar({ message: 'Error contacting AI API', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <PageLayout title="AI Assistant" subtitle="Ask questions and get help with your freelance business">
      <Paper
        elevation={0}
        sx={{
          border: (theme) => `1px solid ${theme.palette.divider}`,
          borderRadius: 3,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 160px)',
          minHeight: 400,
        }}
      >
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 2.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {messages.length === 0 && !loading && (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1.5,
                color: 'text.secondary',
              }}
            >
              <SmartToyIcon sx={{ fontSize: 56, opacity: 0.2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, opacity: 0.6 }}>
                AI Assistant
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.5, maxWidth: 400, textAlign: 'center' }}>
                Ask me anything about your freelance business — I can help with invoices, project planning, client communications, and more.
              </Typography>
            </Box>
          )}

          {messages.map((msg, i) => (
            <Box
              key={i}
              sx={{
                display: 'flex',
                gap: 1.5,
                alignItems: 'flex-start',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  bgcolor: msg.role === 'user' ? '#4A90D9' : 'rgba(74,144,217,0.12)',
                  color: msg.role === 'user' ? '#fff' : '#4A90D9',
                }}
              >
                {msg.role === 'user' ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
              </Box>
              <Box
                sx={{
                  maxWidth: '75%',
                  px: 2,
                  py: 1.2,
                  borderRadius: 2,
                  bgcolor:
                    msg.role === 'user'
                      ? '#4A90D9'
                      : (theme) =>
                          theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.06)'
                            : 'rgba(0,0,0,0.04)',
                  color: msg.role === 'user' ? '#fff' : 'text.primary',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                }}
              >
                {msg.role === 'user' && (
                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5, opacity: 0.8 }}>
                    {username}
                  </Typography>
                )}
                {msg.content}
              </Box>
            </Box>
          ))}

          {loading && (
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  bgcolor: 'rgba(74,144,217,0.12)',
                  color: '#4A90D9',
                }}
              >
                <SmartToyIcon fontSize="small" />
              </Box>
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  borderRadius: 2,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <CircularProgress size={16} />
                <Typography variant="body2" color="text.secondary">
                  Generating response...
                </Typography>
              </Box>
            </Box>
          )}

          <div ref={bottomRef} />
        </Box>

        <Box
          sx={{
            p: 2,
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            display: 'flex',
            gap: 1,
            alignItems: 'flex-end',
          }}
        >
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Type your message... (Shift+Enter for new line)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={loading || !input.trim()}
            sx={{
              width: 40,
              height: 40,
              bgcolor: '#4A90D9',
              color: '#fff',
              '&:hover': { bgcolor: '#3a7bc8' },
              '&.Mui-disabled': {
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                color: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
              },
            }}
          >
            {loading ? <CircularProgress size={18} color="inherit" /> : <SendIcon fontSize="small" />}
          </IconButton>
        </Box>
      </Paper>

      {snackbar && (
        <Snackbar open autoHideDuration={3000} onClose={() => setSnackbar(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2 }}>{snackbar.message}</Alert>
        </Snackbar>
      )}
    </PageLayout>
  )
}

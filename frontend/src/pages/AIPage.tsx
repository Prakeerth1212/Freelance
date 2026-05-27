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
  Fade,
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import PersonIcon from '@mui/icons-material/Person'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import { generate } from '../api/ai'
import PageLayout from '../components/PageLayout'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

function TypingIndicator() {
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          background: 'linear-gradient(135deg, rgba(74,144,217,0.12), rgba(74,144,217,0.06))',
          color: '#4A90D9',
        }}
      >
        <SmartToyIcon fontSize="small" />
      </Box>
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderRadius: 3,
          borderBottomLeftRadius: 4,
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
          display: 'flex',
          alignItems: 'center',
          gap: 0.8,
        }}
      >
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: '#4A90D9',
              animation: 'typing-dot 1.4s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </Box>
    </Box>
  )
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
  }, [messages, loading])

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
    <PageLayout
      title={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AutoAwesomeIcon sx={{ color: '#4A90D9' }} />
          <span>AI Assistant</span>
        </Box>
      }
      subtitle="Ask questions and get help with your freelance business"
    >
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 160px)',
          minHeight: 450,
          transition: 'box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: (t) =>
              t.palette.mode === 'dark' ? '0 8px 30px rgba(0,0,0,0.3)' : '0 8px 30px rgba(0,0,0,0.06)',
          },
        }}
      >
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
          }}
        >
          {messages.length === 0 && !loading && (
            <Fade in timeout={500}>
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  color: 'text.secondary',
                }}
              >
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, rgba(74,144,217,0.08), rgba(74,144,217,0.02))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AutoAwesomeIcon sx={{ fontSize: 36, opacity: 0.3 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, opacity: 0.5 }}>
                  How can I help you?
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    opacity: 0.4,
                    maxWidth: 440,
                    textAlign: 'center',
                    lineHeight: 1.7,
                  }}
                >
                  Ask me anything about your freelance business — I can help draft invoices, suggest project plans, write client communications, and more.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {[
                    'Draft an invoice for a web project',
                    'Write a follow-up email to a client',
                    'Suggest a project timeline',
                    'How to handle scope creep?',
                  ].map((suggestion) => (
                    <Box
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      sx={{
                        px: 1.5,
                        py: 0.8,
                        borderRadius: 2,
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        color: 'text.secondary',
                        '&:hover': {
                          borderColor: '#4A90D9',
                          color: '#4A90D9',
                          bgcolor: 'rgba(74,144,217,0.04)',
                        },
                      }}
                    >
                      {suggestion}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Fade>
          )}

          {messages.map((msg, i) => (
            <Fade key={i} in timeout={300}>
              <Box
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  alignItems: 'flex-start',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                }}
              >
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    ...(msg.role === 'user'
                      ? {
                          background: 'linear-gradient(135deg, #4A90D9, #357abd)',
                          color: '#fff',
                          boxShadow: '0 4px 12px rgba(74,144,217,0.3)',
                        }
                      : {
                          background: 'linear-gradient(135deg, rgba(74,144,217,0.1), rgba(74,144,217,0.05))',
                          color: '#4A90D9',
                        }),
                  }}
                >
                  {msg.role === 'user' ? (
                    <PersonIcon fontSize="small" />
                  ) : (
                    <SmartToyIcon fontSize="small" />
                  )}
                </Box>
                <Box
                  sx={{
                    maxWidth: '72%',
                    px: 2.5,
                    py: 1.5,
                    borderRadius: 3,
                    ...(msg.role === 'user'
                      ? {
                          borderBottomRightRadius: 4,
                          background: 'linear-gradient(135deg, #4A90D9, #357abd)',
                          color: '#fff',
                          boxShadow: '0 4px 14px rgba(74,144,217,0.2)',
                        }
                      : {
                          borderBottomLeftRadius: 4,
                          bgcolor: (theme) =>
                            theme.palette.mode === 'dark'
                              ? 'rgba(255,255,255,0.04)'
                              : 'rgba(0,0,0,0.03)',
                          color: 'text.primary',
                        }),
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontSize: '0.9rem',
                    lineHeight: 1.7,
                  }}
                >
                  {msg.role === 'user' && (
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        display: 'block',
                        mb: 0.5,
                        opacity: 0.8,
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {username}
                    </Typography>
                  )}
                  {msg.content}
                </Box>
              </Box>
            </Fade>
          ))}

          {loading && <TypingIndicator />}

          <div ref={bottomRef} />
        </Box>

        <Box
          sx={{
            p: 2.5,
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            display: 'flex',
            gap: 1.5,
            alignItems: 'flex-end',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.01)',
          }}
        >
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              },
            }}
          />
          <IconButton
            onClick={handleSend}
            disabled={loading || !input.trim()}
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              background: 'linear-gradient(135deg, #4A90D9, #357abd)',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(74,144,217,0.3)',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #357abd, #4A90D9)',
                transform: 'scale(1.05)',
              },
              '&.Mui-disabled': {
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                color: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
              },
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon fontSize="small" />}
          </IconButton>
        </Box>
      </Paper>

      {snackbar && (
        <Snackbar open autoHideDuration={3000} onClose={() => setSnackbar(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2.5, fontWeight: 600 }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      )}
    </PageLayout>
  )
}

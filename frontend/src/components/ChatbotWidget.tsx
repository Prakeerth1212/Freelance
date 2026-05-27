import { useState, useRef, useEffect } from 'react'
import {
  Box,
  Typography,
  TextField,
  IconButton,
  CircularProgress,
  Fade,
  Zoom,
  Badge,
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import PersonIcon from '@mui/icons-material/Person'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import CloseIcon from '@mui/icons-material/Close'
import ForumIcon from '@mui/icons-material/Forum'
import { generate } from '../api/ai'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const suggestions = [
  'Draft an invoice for a web project',
  'Write a follow-up email to a client',
  'Suggest a project timeline',
  'How to handle scope creep?',
]

function TypingIndicator() {
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', px: 2, py: 0.5 }}>
      <Box
        sx={{
          width: 26,
          height: 26,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          background: 'linear-gradient(135deg, rgba(74,144,217,0.12), rgba(74,144,217,0.06))',
          color: '#4A90D9',
        }}
      >
        <SmartToyIcon sx={{ fontSize: 14 }} />
      </Box>
      <Box
        sx={{
          px: 1.5,
          py: 1.2,
          borderRadius: 2.5,
          borderBottomLeftRadius: 4,
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
          display: 'flex',
          alignItems: 'center',
          gap: 0.6,
        }}
      >
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: 5,
              height: 5,
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

export default function ChatbotWidget({ darkMode }: { darkMode: boolean }) {
  const [open, setOpen] = useState(false)
  const [hasOpened, setHasOpened] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const username = localStorage.getItem('username') || 'You'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (!hasOpened) {
      const timer = setTimeout(() => {
        setOpen(true)
        setHasOpened(true)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [hasOpened])

  const handleSend = async (text?: string) => {
    const prompt = (text || input).trim()
    if (!prompt) return
    const userMessage: Message = { role: 'user', content: prompt }
    setMessages((prev) => [...prev, userMessage])
    if (!text) setInput('')
    setLoading(true)
    try {
      const res = await generate(prompt)
      setMessages((prev) => [...prev, { role: 'assistant', content: res.response }])
    } catch {
      // silently fail in widget
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
    <>
      <Zoom in={!open} timeout={300}>
        <Box
          onClick={() => setOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1300,
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4A90D9, #357abd)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 6px 24px rgba(74,144,217,0.4)',
            transition: 'all 0.25s ease',
            '&:hover': {
              transform: 'scale(1.08)',
              boxShadow: '0 8px 32px rgba(74,144,217,0.5)',
            },
          }}
        >
          <Badge
            color="error"
            variant="dot"
            invisible={messages.length > 0 || loading}
            sx={{ '& .MuiBadge-dot': { width: 10, height: 10, borderRadius: '50%' } }}
          >
            <ForumIcon sx={{ color: '#fff', fontSize: 24 }} />
          </Badge>
        </Box>
      </Zoom>

      <Zoom in={open} timeout={300}>
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1300,
            width: 380,
            maxWidth: 'calc(100vw - 32px)',
            height: 560,
            maxHeight: 'calc(100vh - 100px)',
            borderRadius: 3.5,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 20px 60px rgba(0,0,0,0.6)'
                : '0 20px 60px rgba(0,0,0,0.15)',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            bgcolor: (theme) => theme.palette.background.paper,
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, #4A90D9, #357abd)',
              color: '#fff',
              flexShrink: 0,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1.5,
                  bgcolor: 'rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AutoAwesomeIcon sx={{ fontSize: 18 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                  AI Assistant
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#2ecc71' }} />
                  <Typography sx={{ fontSize: '0.7rem', opacity: 0.8 }}>
                    {loading ? 'Thinking...' : 'Online'}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <IconButton
              size="small"
              onClick={() => setOpen(false)}
              sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              px: 1.5,
              py: 1.5,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
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
                    gap: 1.5,
                    color: 'text.secondary',
                    px: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, rgba(74,144,217,0.08), rgba(74,144,217,0.02))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <AutoAwesomeIcon sx={{ fontSize: 24, opacity: 0.25 }} />
                  </Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', opacity: 0.45 }}>
                    How can I help you?
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.75rem',
                      opacity: 0.35,
                      textAlign: 'center',
                      maxWidth: 280,
                      lineHeight: 1.6,
                    }}
                  >
                    Ask about invoices, project planning, client communication, and more.
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5, width: '100%', maxWidth: 280 }}>
                    {suggestions.map((s) => (
                      <Box
                        key={s}
                        onClick={() => { setInput(s); handleSend(s) }}
                        sx={{
                          px: 1.5,
                          py: 0.8,
                          borderRadius: 2,
                          border: (theme) => `1px solid ${theme.palette.divider}`,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          color: 'text.secondary',
                          textAlign: 'center',
                          '&:hover': {
                            borderColor: '#4A90D9',
                            color: '#4A90D9',
                            bgcolor: 'rgba(74,144,217,0.04)',
                          },
                        }}
                      >
                        {s}
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
                    gap: 1,
                    alignItems: 'flex-start',
                    flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                    px: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      ...(msg.role === 'user'
                        ? {
                            background: 'linear-gradient(135deg, #4A90D9, #357abd)',
                            color: '#fff',
                          }
                        : {
                            background: 'linear-gradient(135deg, rgba(74,144,217,0.1), rgba(74,144,217,0.05))',
                            color: '#4A90D9',
                          }),
                    }}
                  >
                    {msg.role === 'user' ? <PersonIcon sx={{ fontSize: 14 }} /> : <SmartToyIcon sx={{ fontSize: 14 }} />}
                  </Box>
                  <Box
                    sx={{
                      maxWidth: '80%',
                      px: 1.5,
                      py: 1,
                      borderRadius: 2.5,
                      ...(msg.role === 'user'
                        ? {
                            borderBottomRightRadius: 4,
                            background: 'linear-gradient(135deg, #4A90D9, #357abd)',
                            color: '#fff',
                          }
                        : {
                            borderBottomLeftRadius: 4,
                            bgcolor: (theme) =>
                              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                            color: 'text.primary',
                          }),
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontSize: '0.8rem',
                      lineHeight: 1.6,
                    }}
                  >
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
              p: 1.5,
              borderTop: (theme) => `1px solid ${theme.palette.divider}`,
              display: 'flex',
              gap: 1,
              alignItems: 'flex-end',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.01)',
              flexShrink: 0,
            }}
          >
            <TextField
              fullWidth
              multiline
              maxRows={3}
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.5,
                  fontSize: '0.8rem',
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                },
              }}
            />
            <IconButton
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #4A90D9, #357abd)',
                color: '#fff',
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
              {loading ? <CircularProgress size={16} color="inherit" /> : <SendIcon sx={{ fontSize: 16 }} />}
            </IconButton>
          </Box>
        </Box>
      </Zoom>
    </>
  )
}

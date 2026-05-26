import { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import { generate } from '../api/ai'

export default function AIPage() {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'error' } | null>(null)

  const handleSend = async () => {
    if (!prompt.trim()) {
      setSnackbar({ message: 'Enter a prompt first', severity: 'error' })
      return
    }
    setLoading(true)
    setResponse('')
    try {
      const res = await generate(prompt)
      setResponse(res.response)
    } catch {
      setSnackbar({ message: 'Error contacting AI API', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>AI Assistant</Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Prompt</Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder="Enter your prompt here..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          <Button
            variant="contained"
            endIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
            onClick={handleSend}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Send'}
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Response</Typography>
        <Box
          sx={{
            minHeight: 200,
            maxHeight: 400,
            overflow: 'auto',
            p: 2,
            bgcolor: 'background.default',
            borderRadius: 1,
            whiteSpace: 'pre-wrap',
            fontFamily: '"Segoe UI", monospace',
            fontSize: 14,
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
              <CircularProgress size={16} /> Generating response...
            </Box>
          ) : response ? (
            response
          ) : (
            <Typography color="text.secondary">Response will appear here</Typography>
          )}
        </Box>
      </Paper>

      {snackbar && (
        <Snackbar open autoHideDuration={3000} onClose={() => setSnackbar(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
        </Snackbar>
      )}
    </Box>
  )
}

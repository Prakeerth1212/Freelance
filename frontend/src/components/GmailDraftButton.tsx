import { useState, useEffect, useCallback } from 'react'
import { Button, CircularProgress, Tooltip, Snackbar, Alert, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Box } from '@mui/material'
import EmailIcon from '@mui/icons-material/Email'
import { getGmailStatus, getAuthUrl, createDraft } from '../api/gmail'

interface Props {
  subject: string
  body: string
  defaultTo?: string
}

export default function GmailDraftButton({ subject, body, defaultTo }: Props) {
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [to, setTo] = useState(defaultTo || '')
  const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'error' } | null>(null)

  useEffect(() => {
    getGmailStatus()
      .then((s) => setConnected(s.connected))
      .catch(() => {})
  }, [])

  const handleConnect = useCallback(async () => {
    setLoading(true)
    try {
      const url = await getAuthUrl()
      window.open(url, '_blank', 'width=600,height=700')
      const poll = setInterval(async () => {
        try {
          const status = await getGmailStatus()
          if (status.connected) {
            setConnected(true)
            clearInterval(poll)
            setSnackbar({ message: 'Gmail connected!', severity: 'success' })
          }
        } catch {}
      }, 2000)
      setTimeout(() => clearInterval(poll), 120000)
    } catch {
      setSnackbar({ message: 'Failed to connect Gmail', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }, [])

  const handleCreateDraft = useCallback(async () => {
    if (!to.trim()) return
    setActionLoading(true)
    try {
      const res = await createDraft(to.trim(), subject, body)
      if (res.success) {
        setSnackbar({ message: 'Draft created in Gmail!', severity: 'success' })
        setDialogOpen(false)
        setTo('')
      } else if (res.reconnect) {
        setConnected(false)
        setSnackbar({ message: 'Gmail authorization expired. Please reconnect.', severity: 'error' })
        setDialogOpen(false)
      } else {
        setSnackbar({ message: res.error || 'Failed to create draft', severity: 'error' })
      }
    } catch {
      setSnackbar({ message: 'Failed to create draft', severity: 'error' })
    } finally {
      setActionLoading(false)
    }
  }, [to, subject, body])

  if (!connected) {
    return (
      <>
        <Button
          size="small"
          variant="outlined"
          startIcon={loading ? <CircularProgress size={14} /> : <EmailIcon />}
          onClick={handleConnect}
          disabled={loading}
          sx={{ textTransform: 'none', borderRadius: 2, fontSize: '0.75rem' }}
        >
          {loading ? 'Connecting...' : 'Connect Gmail'}
        </Button>
        <Snackbar
          open={!!snackbar}
          autoHideDuration={4000}
          onClose={() => setSnackbar(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          {snackbar ? <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2 }}>{snackbar.message}</Alert> : undefined}
        </Snackbar>
      </>
    )
  }

  return (
    <>
      <Tooltip title="Create Gmail draft">
        <Button
          size="small"
          variant="outlined"
          startIcon={<EmailIcon />}
          onClick={() => setDialogOpen(true)}
          sx={{ textTransform: 'none', borderRadius: 2, fontSize: '0.75rem' }}
        >
          Draft in Gmail
        </Button>
      </Tooltip>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem' }}>Create Gmail Draft</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="To"
              size="small"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="client@example.com"
              fullWidth
              required
            />
            <TextField
              label="Subject"
              size="small"
              value={subject}
              InputProps={{ readOnly: true }}
              fullWidth
              multiline
            />
            <TextField
              label="Body"
              size="small"
              value={body}
              InputProps={{ readOnly: true }}
              fullWidth
              multiline
              minRows={4}
              maxRows={10}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateDraft}
            disabled={!to.trim() || actionLoading}
            startIcon={actionLoading ? <CircularProgress size={14} /> : <EmailIcon />}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            {actionLoading ? 'Creating...' : 'Create Draft'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={4000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {snackbar ? <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2 }}>{snackbar.message}</Alert> : undefined}
      </Snackbar>
    </>
  )
}

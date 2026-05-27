import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  Snackbar,
  Tooltip,
  Skeleton,
} from '@mui/material'
import { Add, Edit, Delete, PersonAdd, People } from '@mui/icons-material'
import { getClients, createClient, updateClient, deleteClient, Client } from '../api/clients'
import PageLayout from '../components/PageLayout'

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', notes: '' })
  const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'error' } | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Client | null>(null)

  useEffect(() => { loadClients() }, [])

  const loadClients = async () => {
    setLoading(true)
    try {
      const data = await getClients()
      setClients(data)
    } catch {
      setSnackbar({ message: 'Error loading clients', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => {
    setEditing(null)
    setForm({ name: '', email: '', phone: '', company: '', notes: '' })
    setOpen(true)
  }

  const openEdit = (c: Client) => {
    setEditing(c)
    setForm({ name: c.name, email: c.email, phone: c.phone, company: c.company, notes: c.notes })
    setOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      setSnackbar({ message: 'Name is required', severity: 'error' })
      return
    }
    try {
      if (editing) {
        await updateClient(editing.id, form)
        setSnackbar({ message: 'Client updated', severity: 'success' })
      } else {
        await createClient(form)
        setSnackbar({ message: 'Client created', severity: 'success' })
      }
      setOpen(false)
      loadClients()
    } catch {
      setSnackbar({ message: 'Error saving client', severity: 'error' })
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return
    try {
      await deleteClient(deleteConfirm.id)
      setSnackbar({ message: 'Client deleted', severity: 'success' })
      setDeleteConfirm(null)
      loadClients()
    } catch {
      setSnackbar({ message: 'Error deleting client', severity: 'error' })
    }
  }

  return (
    <PageLayout
      title={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <People sx={{ color: '#4A90D9' }} />
          <span>Clients</span>
        </Box>
      }
      subtitle="Manage your client relationships"
      action={
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={openAdd}
          sx={{
            borderRadius: 2.5,
            background: 'linear-gradient(135deg, #4A90D9, #357abd)',
            '&:hover': { background: 'linear-gradient(135deg, #357abd, #4A90D9)' },
          }}
        >
          Add Client
        </Button>
      }
    >
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          border: (theme) => `1px solid ${theme.palette.divider}`,
          transition: 'box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: (t) =>
              t.palette.mode === 'dark' ? '0 8px 30px rgba(0,0,0,0.3)' : '0 8px 30px rgba(0,0,0,0.06)',
          },
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell align="center" sx={{ width: 100 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton variant="text" width={j === 6 ? 60 : j === 4 ? 80 : 100} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : clients.map((c) => (
                    <TableRow
                      key={c.id}
                      hover
                      sx={{
                        transition: 'background-color 0.15s ease',
                        '&:hover': {
                          backgroundColor: (t) =>
                            t.palette.mode === 'dark'
                              ? 'rgba(74,144,217,0.06)'
                              : 'rgba(74,144,217,0.03)',
                        },
                      }}
                    >
                      <TableCell>
                        <Typography variant="caption" sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'text.secondary' }}>
                          #{c.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: 1.5,
                              background: 'linear-gradient(135deg, #4A90D9, #357abd)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              fontSize: 13,
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {c.name.charAt(0).toUpperCase()}
                          </Box>
                          <Typography sx={{ fontWeight: 600 }}>{c.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{c.email || <Typography variant="body2" color="text.disabled">—</Typography>}</TableCell>
                      <TableCell>{c.phone || <Typography variant="body2" color="text.disabled">—</Typography>}</TableCell>
                      <TableCell>{c.company || <Typography variant="body2" color="text.disabled">—</Typography>}</TableCell>
                      <TableCell sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.notes || <Typography variant="body2" color="text.disabled">—</Typography>}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit client">
                          <IconButton
                            size="small"
                            onClick={() => openEdit(c)}
                            sx={{
                              color: '#4A90D9',
                              borderRadius: 1.5,
                              mr: 0.5,
                              '&:hover': { bgcolor: 'rgba(74,144,217,0.08)' },
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete client">
                          <IconButton
                            size="small"
                            onClick={() => setDeleteConfirm(c)}
                            sx={{
                              color: '#ef4444',
                              borderRadius: 1.5,
                              '&:hover': { bgcolor: 'rgba(239,68,68,0.08)' },
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              {!loading && clients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Box
                      sx={{
                        py: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1.5,
                        color: 'text.secondary',
                      }}
                    >
                      <PersonAdd sx={{ fontSize: 56, opacity: 0.15 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, opacity: 0.7 }}>
                        No clients yet
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.5, mb: 1 }}>
                        Add your first client to get started
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Add />}
                        onClick={openAdd}
                      >
                        Add your first client
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.15rem' }}>
          {editing ? 'Edit Client' : 'Add Client'}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            fullWidth
            label="Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            margin="dense"
            autoFocus
            required
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            margin="dense"
          />
          <TextField
            fullWidth
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            margin="dense"
          />
          <TextField
            fullWidth
            label="Company"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            margin="dense"
          />
          <TextField
            fullWidth
            label="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            margin="dense"
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setOpen(false)} color="inherit" sx={{ fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              borderRadius: 2.5,
              background: 'linear-gradient(135deg, #4A90D9, #357abd)',
              '&:hover': { background: 'linear-gradient(135deg, #357abd, #4A90D9)' },
            }}
          >
            {editing ? 'Update Client' : 'Add Client'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Client</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteConfirm(null)} color="inherit" sx={{ fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            sx={{ borderRadius: 2.5 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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

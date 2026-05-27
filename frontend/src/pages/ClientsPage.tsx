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
import { Add, Edit, Delete, PersonAdd } from '@mui/icons-material'
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
      title="Clients"
      subtitle="Manage your client relationships"
      action={
        <Button variant="contained" startIcon={<Add />} onClick={openAdd}>
          Add Client
        </Button>
      }
    >
      <Paper
        elevation={0}
        sx={{
          border: (theme) => `1px solid ${theme.palette.divider}`,
          borderRadius: 3,
          overflow: 'hidden',
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
                    <TableRow key={c.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{c.id}</TableCell>
                      <TableCell>{c.name}</TableCell>
                      <TableCell>{c.email || '-'}</TableCell>
                      <TableCell>{c.phone || '-'}</TableCell>
                      <TableCell>{c.company || '-'}</TableCell>
                      <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.notes || '-'}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit">
                          <IconButton size="small" color="primary" onClick={() => openEdit(c)}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => setDeleteConfirm(c)}>
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
                        py: 6,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                        color: 'text.secondary',
                      }}
                    >
                      <PersonAdd sx={{ fontSize: 48, opacity: 0.3 }} />
                      <Typography>No clients yet</Typography>
                      <Button size="small" startIcon={<Add />} onClick={openAdd}>
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
        <DialogTitle sx={{ fontWeight: 700 }}>{editing ? 'Edit Client' : 'Add Client'}</DialogTitle>
        <DialogContent>
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
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editing ? 'Update' : 'Add'}
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
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteConfirm(null)} color="inherit">Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {snackbar && (
        <Snackbar open autoHideDuration={3000} onClose={() => setSnackbar(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2 }}>{snackbar.message}</Alert>
        </Snackbar>
      )}
    </PageLayout>
  )
}

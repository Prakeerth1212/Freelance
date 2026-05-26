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
} from '@mui/material'
import { Add, Edit, Delete } from '@mui/icons-material'
import { getClients, createClient, updateClient, deleteClient, Client } from '../api/clients'

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', notes: '' })
  const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'error' } | null>(null)

  useEffect(() => { loadClients() }, [])

  const loadClients = async () => {
    try {
      const data = await getClients()
      setClients(data)
    } catch {
      setSnackbar({ message: 'Error loading clients', severity: 'error' })
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

  const handleDelete = async (id: number) => {
    try {
      await deleteClient(id)
      setSnackbar({ message: 'Client deleted', severity: 'success' })
      loadClients()
    } catch {
      setSnackbar({ message: 'Error deleting client', severity: 'error' })
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Clients</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openAdd}>Add Client</Button>
      </Box>

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map((c) => (
              <TableRow key={c.id} hover>
                <TableCell>{c.id}</TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>{c.phone}</TableCell>
                <TableCell>{c.company}</TableCell>
                <TableCell>{c.notes}</TableCell>
                <TableCell align="center">
                  <IconButton size="small" color="primary" onClick={() => openEdit(c)}>
                    <Edit />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(c.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {clients.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">No clients found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Client' : 'Add Client'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} margin="dense" autoFocus />
          <TextField fullWidth label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} margin="dense" />
          <TextField fullWidth label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} margin="dense" />
          <TextField fullWidth label="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} margin="dense" />
          <TextField fullWidth label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} margin="dense" multiline rows={2} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>{editing ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>

      {snackbar && (
        <Snackbar open autoHideDuration={3000} onClose={() => setSnackbar(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
        </Snackbar>
      )}
    </Box>
  )
}

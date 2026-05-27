import { useEffect, useState, useMemo } from 'react'
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  IconButton, Tooltip, Skeleton, TablePagination,
} from '@mui/material'
import { Add, Edit, Delete, PersonAdd, People, Search, Download } from '@mui/icons-material'
import { getClients, createClient, updateClient, deleteClient, Client } from '../api/clients'
import PageLayout from '../components/PageLayout'
import { useToast } from '../utils/Toast'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(form: typeof emptyForm): string | null {
  if (!form.name.trim()) return 'Name is required'
  if (form.email && !EMAIL_REGEX.test(form.email)) return 'Invalid email format'
  return null
}

function toCsv(clients: Client[]): string {
  const rows = clients.map((c) =>
    [c.id, c.name, c.email, c.phone, c.company, c.notes]
      .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
      .join(',')
  )
  return '\uFEFFID,Name,Email,Phone,Company,Notes\n' + rows.join('\n')
}

function downloadCsv(clients: Client[]) {
  const blob = new Blob([toCsv(clients)], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'clients.csv'; a.click()
  URL.revokeObjectURL(url)
}

const emptyForm = { name: '', email: '', phone: '', company: '', notes: '' }

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<Client | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const toast = useToast()

  useEffect(() => { loadClients() }, [])

  const loadClients = async () => {
    setLoading(true)
    try { setClients(await getClients()) }
    catch { toast('Error loading clients', 'error') }
    finally { setLoading(false) }
  }

  const filtered = useMemo(() => {
    if (!search) return clients
    const q = search.toLowerCase()
    return clients.filter((c) =>
      [c.name, c.email, c.phone, c.company].some((v) => v?.toLowerCase().includes(q))
    )
  }, [clients, search])

  const paginated = useMemo(() =>
    filtered.slice(page * rowsPerPage, (page + 1) * rowsPerPage),
    [filtered, page, rowsPerPage]
  )

  const openAdd = () => {
    setEditing(null); setForm(emptyForm); setFormError(''); setOpen(true)
  }

  const openEdit = (c: Client) => {
    setEditing(c)
    setForm({ name: c.name, email: c.email, phone: c.phone, company: c.company, notes: c.notes })
    setFormError(''); setOpen(true)
  }

  const handleSave = async () => {
    const err = validate(form)
    if (err) { setFormError(err); return }
    try {
      if (editing) {
        await updateClient(editing.id, form)
        toast('Client updated', 'success')
      } else {
        await createClient(form)
        toast('Client created', 'success')
      }
      setOpen(false); loadClients()
    } catch { toast('Error saving client', 'error') }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      await deleteClient(deleteConfirm.id)
      toast('Client deleted', 'success')
      setDeleteConfirm(null); loadClients()
    } catch { toast('Error deleting client', 'error') }
  }

  return (
    <PageLayout
      title={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><People sx={{ color: '#4A90D9' }} /><span>Clients</span></Box>}
      subtitle="Manage your client relationships"
      action={
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            size="small" placeholder="Search clients..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            InputProps={{ startAdornment: <Search sx={{ color: 'text.secondary', mr: 0.5, fontSize: 18 }} /> }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, fontSize: '0.85rem' } }}
          />
          <Tooltip title="Export CSV">
            <IconButton onClick={() => downloadCsv(filtered)} sx={{ borderRadius: 2 }}>
              <Download />
            </IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<Add />} onClick={openAdd}
            sx={{ borderRadius: 2.5, background: 'linear-gradient(135deg, #4A90D9, #357abd)', '&:hover': { background: 'linear-gradient(135deg, #357abd, #4A90D9)' } }}>
            Add Client
          </Button>
        </Box>
      }
    >
      <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', border: (theme) => `1px solid ${theme.palette.divider}` }}>
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
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>{Array.from({ length: 7 }).map((_, j) => <TableCell key={j}><Skeleton variant="text" width={j === 6 ? 60 : j === 4 ? 80 : 100} /></TableCell>)}</TableRow>
              )) : paginated.map((c) => (
                <TableRow key={c.id} hover sx={{ '&:hover': { bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(74,144,217,0.06)' : 'rgba(74,144,217,0.03)' } }}>
                  <TableCell><Typography variant="caption" sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'text.secondary' }}>#{c.id}</Typography></TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 32, height: 32, borderRadius: 1.5, background: 'linear-gradient(135deg, #4A90D9, #357abd)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
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
                    <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(c)} sx={{ color: '#4A90D9', borderRadius: 1.5, mr: 0.5, '&:hover': { bgcolor: 'rgba(74,144,217,0.08)' } }}><Edit fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton size="small" onClick={() => setDeleteConfirm(c)} sx={{ color: '#ef4444', borderRadius: 1.5, '&:hover': { bgcolor: 'rgba(239,68,68,0.08)' } }}><Delete fontSize="small" /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Box sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, color: 'text.secondary' }}>
                      <PersonAdd sx={{ fontSize: 56, opacity: 0.15 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, opacity: 0.7 }}>{search ? 'No matching clients' : 'No clients yet'}</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.5, mb: 1 }}>{search ? 'Try a different search term' : 'Add your first client to get started'}</Typography>
                      {!search && <Button variant="outlined" size="small" startIcon={<Add />} onClick={openAdd}>Add your first client</Button>}
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div" count={filtered.length} page={page} onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0) }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.15rem' }}>{editing ? 'Edit Client' : 'Add Client'}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {formError && <Typography color="error" sx={{ mb: 1, fontSize: '0.85rem', fontWeight: 600 }}>{formError}</Typography>}
          <TextField fullWidth label="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} margin="dense" autoFocus required error={formError === 'Name is required'} />
          <TextField fullWidth label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} margin="dense" error={formError === 'Invalid email format'} helperText={formError === 'Invalid email format' ? formError : ''} />
          <TextField fullWidth label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} margin="dense" />
          <TextField fullWidth label="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} margin="dense" />
          <TextField fullWidth label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} margin="dense" multiline rows={2} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setOpen(false)} color="inherit" sx={{ fontWeight: 600 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} sx={{ borderRadius: 2.5, background: 'linear-gradient(135deg, #4A90D9, #357abd)', '&:hover': { background: 'linear-gradient(135deg, #357abd, #4A90D9)' } }}>
            {editing ? 'Update Client' : 'Add Client'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Client</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteConfirm(null)} color="inherit" sx={{ fontWeight: 600 }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} sx={{ borderRadius: 2.5 }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  )
}

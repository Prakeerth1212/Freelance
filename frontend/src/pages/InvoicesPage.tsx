import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Alert,
  Snackbar,
  Chip,
} from '@mui/material'
import { getProjects, Project } from '../api/projects'
import {
  getInvoicesByProjectId,
  createInvoice,
  toggleInvoicePaid,
  downloadInvoicePdf,
  getUnbilledAmount,
  Invoice,
} from '../api/invoices'

export default function InvoicesPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<number | ''>('')
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [unbilled, setUnbilled] = useState(0)
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null)
  const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'error' } | null>(null)

  useEffect(() => {
    getProjects().then(setProjects).catch(() => {})
  }, [])

  useEffect(() => {
    if (selectedProjectId === '') {
      setInvoices([])
      setUnbilled(0)
      return
    }
    loadInvoices(selectedProjectId as number)
    loadUnbilled(selectedProjectId as number)
  }, [selectedProjectId])

  const loadInvoices = async (projectId: number) => {
    try {
      const data = await getInvoicesByProjectId(projectId)
      setInvoices(data)
    } catch {
      setSnackbar({ message: 'Error loading invoices', severity: 'error' })
    }
  }

  const loadUnbilled = async (projectId: number) => {
    try {
      const amount = await getUnbilledAmount(projectId)
      setUnbilled(amount)
    } catch {
      setUnbilled(0)
    }
  }

  const handleGenerate = async () => {
    if (selectedProjectId === '') {
      setSnackbar({ message: 'Select a project first', severity: 'error' })
      return
    }
    if (unbilled <= 0) {
      setSnackbar({ message: 'No unbilled hours to invoice', severity: 'error' })
      return
    }
    const project = projects.find((p) => p.id === selectedProjectId)
    if (!project) return
    const invoiceNumber = `INV-${project.id}-${Date.now()}`
    const today = new Date().toISOString().slice(0, 10)
    const dueDate = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
    try {
      await createInvoice({
        projectId: project.id,
        invoiceNumber,
        amount: unbilled,
        status: 'Unpaid',
        issuedDate: today,
        dueDate,
      })
      setSnackbar({ message: `Invoice ${invoiceNumber} generated`, severity: 'success' })
      loadInvoices(project.id)
      loadUnbilled(project.id)
    } catch {
      setSnackbar({ message: 'Error generating invoice', severity: 'error' })
    }
  }

  const handleTogglePaid = async () => {
    if (selectedInvoiceId === null) {
      setSnackbar({ message: 'Select an invoice first', severity: 'error' })
      return
    }
    try {
      await toggleInvoicePaid(selectedInvoiceId)
      setSnackbar({ message: 'Invoice status updated', severity: 'success' })
      if (selectedProjectId !== '') {
        loadInvoices(selectedProjectId as number)
        loadUnbilled(selectedProjectId as number)
      }
    } catch {
      setSnackbar({ message: 'Error updating invoice', severity: 'error' })
    }
  }

  const handleExportPdf = async () => {
    if (selectedInvoiceId === null) {
      setSnackbar({ message: 'Select an invoice first', severity: 'error' })
      return
    }
    try {
      const blob = await downloadInvoicePdf(selectedInvoiceId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${selectedInvoiceId}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      setSnackbar({ message: 'PDF downloaded', severity: 'success' })
    } catch {
      setSnackbar({ message: 'Error exporting PDF', severity: 'error' })
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>Invoices</Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Project</InputLabel>
              <Select
                value={selectedProjectId}
                label="Project"
                onChange={(e) => setSelectedProjectId(e.target.value as number | '')}
              >
                {projects.map((p) => (
                  <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="text.secondary">Available to Invoice</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: unbilled > 0 ? '#27ae60' : 'text.secondary' }}>
              ${unbilled.toFixed(2)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Invoices</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Invoice #</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Issued</TableCell>
                <TableCell>Due</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow
                  key={inv.id}
                  hover
                  selected={selectedInvoiceId === inv.id}
                  onClick={() => setSelectedInvoiceId(inv.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{inv.id}</TableCell>
                  <TableCell>{inv.invoiceNumber}</TableCell>
                  <TableCell align="right">${inv.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      label={inv.status}
                      size="small"
                      color={inv.status === 'Paid' ? 'success' : inv.status === 'Overdue' ? 'error' : 'warning'}
                    />
                  </TableCell>
                  <TableCell>{inv.issuedDate}</TableCell>
                  <TableCell>{inv.dueDate}</TableCell>
                </TableRow>
              ))}
              {invoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">No invoices</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="contained" color="primary" onClick={handleGenerate}>Generate Invoice</Button>
        <Button variant="outlined" color="secondary" onClick={handleTogglePaid}>Mark as Paid</Button>
        <Button variant="outlined" onClick={handleExportPdf}>Export PDF</Button>
      </Box>

      {snackbar && (
        <Snackbar open autoHideDuration={3000} onClose={() => setSnackbar(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
        </Snackbar>
      )}
    </Box>
  )
}

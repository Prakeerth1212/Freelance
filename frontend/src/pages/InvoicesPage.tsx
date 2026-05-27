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
  Skeleton,
} from '@mui/material'
import { Receipt, CheckCircle, FileDownload, Description } from '@mui/icons-material'
import { getProjects, Project } from '../api/projects'
import {
  getInvoicesByProjectId,
  createInvoice,
  toggleInvoicePaid,
  downloadInvoicePdf,
  getUnbilledAmount,
  Invoice,
} from '../api/invoices'
import PageLayout from '../components/PageLayout'
import { formatCurrency } from '../utils/currency'

const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
  Paid: { bg: 'rgba(46,204,113,0.12)', color: '#2ecc71', label: 'Paid' },
  Unpaid: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', label: 'Unpaid' },
  Overdue: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', label: 'Overdue' },
}

export default function InvoicesPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<number | ''>('')
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loadingInvoices, setLoadingInvoices] = useState(false)
  const [unbilled, setUnbilled] = useState<number | null>(null)
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null)
  const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'error' } | null>(null)

  useEffect(() => {
    getProjects().then(setProjects).catch(() => {})
  }, [])

  useEffect(() => {
    if (selectedProjectId === '') {
      setInvoices([])
      setUnbilled(null)
      return
    }
    loadInvoices(selectedProjectId as number)
    loadUnbilled(selectedProjectId as number)
  }, [selectedProjectId])

  const loadInvoices = async (projectId: number) => {
    setLoadingInvoices(true)
    try {
      const data = await getInvoicesByProjectId(projectId)
      setInvoices(data)
    } catch {
      setSnackbar({ message: 'Error loading invoices', severity: 'error' })
    } finally {
      setLoadingInvoices(false)
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
    if (unbilled !== null && unbilled <= 0) {
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
        amount: unbilled!,
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

  const selectedProject = selectedProjectId !== '' ? projects.find((p) => p.id === selectedProjectId) : null

  return (
    <PageLayout
      title={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Description sx={{ color: '#4A90D9' }} />
          <span>Invoices</span>
        </Box>
      }
      subtitle="Generate and manage invoices"
    >
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 3,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          transition: 'box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: (t) =>
              t.palette.mode === 'dark' ? '0 8px 30px rgba(0,0,0,0.3)' : '0 8px 30px rgba(0,0,0,0.06)',
          },
        }}
      >
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
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Available
            </Typography>
            {unbilled === null ? (
              <Skeleton variant="text" width={80} height={32} />
            ) : (
              <Typography variant="h5" sx={{ fontWeight: 800, color: unbilled > 0 ? '#2ecc71' : 'text.secondary' }}>
                {formatCurrency(unbilled)}
              </Typography>
            )}
          </Grid>
          {selectedProject && (
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Rate
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {formatCurrency(selectedProject.hourlyRate)}/hr
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 3,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          transition: 'box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: (t) =>
              t.palette.mode === 'dark' ? '0 8px 30px rgba(0,0,0,0.3)' : '0 8px 30px rgba(0,0,0,0.06)',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg, #4A90D9, #357abd)' }} />
          <Typography variant="h6">
            Invoices
            {selectedProject && (
              <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1, fontWeight: 400 }}>
                — {selectedProject.name}
              </Typography>
            )}
          </Typography>
        </Box>
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
              {loadingInvoices
                ? Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}><Skeleton variant="text" width={j === 1 ? 140 : 70} /></TableCell>
                      ))}
                    </TableRow>
                  ))
                : invoices.map((inv) => {
                    const st = statusStyles[inv.status] || statusStyles.Unpaid
                    return (
                      <TableRow
                        key={inv.id}
                        hover
                        selected={selectedInvoiceId === inv.id}
                        onClick={() => setSelectedInvoiceId(inv.id)}
                        sx={{
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          '&.Mui-selected': {
                            bgcolor: (t) =>
                              t.palette.mode === 'dark' ? 'rgba(74,144,217,0.12)' : 'rgba(74,144,217,0.06)',
                          },
                        }}
                      >
                        <TableCell>
                          <Typography variant="caption" sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'text.secondary' }}>
                            #{inv.id}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{inv.invoiceNumber}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                          {formatCurrency(inv.amount)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={st.label}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              bgcolor: st.bg,
                              color: st.color,
                            }}
                          />
                        </TableCell>
                        <TableCell>{inv.issuedDate}</TableCell>
                        <TableCell>{inv.dueDate}</TableCell>
                      </TableRow>
                    )
                  })}
              {!loadingInvoices && invoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    {selectedProjectId !== '' ? 'No invoices for this project' : 'Select a project above'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          onClick={handleGenerate}
          startIcon={<Receipt />}
          disabled={selectedProjectId === '' || (unbilled !== null && unbilled <= 0)}
          sx={{
            borderRadius: 2.5,
            background: 'linear-gradient(135deg, #4A90D9, #357abd)',
            '&:hover': { background: 'linear-gradient(135deg, #357abd, #4A90D9)' },
            '&.Mui-disabled': { background: 'rgba(255,255,255,0.04)' },
          }}
        >
          Generate Invoice
        </Button>
        <Button
          variant="outlined"
          color="success"
          onClick={handleTogglePaid}
          startIcon={<CheckCircle />}
          disabled={selectedInvoiceId === null}
          sx={{ borderRadius: 2.5 }}
        >
          Mark as Paid
        </Button>
        <Button
          variant="outlined"
          onClick={handleExportPdf}
          startIcon={<FileDownload />}
          disabled={selectedInvoiceId === null}
          sx={{ borderRadius: 2.5 }}
        >
          Export PDF
        </Button>
      </Box>

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

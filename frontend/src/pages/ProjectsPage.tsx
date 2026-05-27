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
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Alert,
  Snackbar,
  Skeleton,
} from '@mui/material'
import { Add, WorkHistory } from '@mui/icons-material'
import { getClients, Client } from '../api/clients'
import { getProjectsByClientId, createProject, Project } from '../api/projects'
import { getTimeLogsByProjectId, createTimeLog, TimeLog } from '../api/timeLogs'
import PageLayout from '../components/PageLayout'

export default function ProjectsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClientId, setSelectedClientId] = useState<number | ''>('')
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [totalHours, setTotalHours] = useState(0)
  const [totalEarnings, setTotalEarnings] = useState(0)

  const [projectForm, setProjectForm] = useState({ name: '', hourlyRate: '', status: 'Active' })
  const [logForm, setLogForm] = useState({ date: new Date().toISOString().slice(0, 10), hours: '', description: '' })
  const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'error' } | null>(null)

  useEffect(() => {
    getClients().then(setClients).catch(() => {})
  }, [])

  useEffect(() => {
    if (selectedClientId === '') {
      setProjects([])
      setSelectedProjectId(null)
      setTimeLogs([])
      updateTotals([])
      return
    }
    setLoadingProjects(true)
    getProjectsByClientId(selectedClientId as number)
      .then(setProjects)
      .catch(() => {})
      .finally(() => setLoadingProjects(false))
    setSelectedProjectId(null)
    setTimeLogs([])
    updateTotals([])
  }, [selectedClientId])

  useEffect(() => {
    if (selectedProjectId === null) {
      setTimeLogs([])
      updateTotals([])
      return
    }
    setLoadingLogs(true)
    getTimeLogsByProjectId(selectedProjectId)
      .then((logs) => {
        setTimeLogs(logs)
        updateTotals(logs)
      })
      .catch(() => {})
      .finally(() => setLoadingLogs(false))
  }, [selectedProjectId])

  const updateTotals = (logs: TimeLog[]) => {
    const totalH = logs.reduce((sum, l) => sum + l.hours, 0)
    setTotalHours(totalH)
    const project = projects.find((p) => p.id === selectedProjectId)
    setTotalEarnings(project ? totalH * project.hourlyRate : 0)
  }

  const handleAddProject = async () => {
    if (selectedClientId === '') {
      setSnackbar({ message: 'Select a client first', severity: 'error' })
      return
    }
    if (!projectForm.name.trim()) {
      setSnackbar({ message: 'Project name is required', severity: 'error' })
      return
    }
    const rate = parseFloat(projectForm.hourlyRate)
    if (isNaN(rate) || rate < 0) {
      setSnackbar({ message: 'Enter a valid hourly rate', severity: 'error' })
      return
    }
    try {
      await createProject({
        clientId: selectedClientId as number,
        name: projectForm.name,
        description: '',
        hourlyRate: rate,
        status: projectForm.status,
      })
      setProjectForm({ name: '', hourlyRate: '', status: 'Active' })
      setSnackbar({ message: 'Project created', severity: 'success' })
      const data = await getProjectsByClientId(selectedClientId as number)
      setProjects(data)
    } catch {
      setSnackbar({ message: 'Error creating project', severity: 'error' })
    }
  }

  const handleAddLog = async () => {
    if (selectedProjectId === null) {
      setSnackbar({ message: 'Select a project first', severity: 'error' })
      return
    }
    if (!logForm.date) {
      setSnackbar({ message: 'Enter a valid date', severity: 'error' })
      return
    }
    const hours = parseFloat(logForm.hours)
    if (isNaN(hours) || hours <= 0 || hours > 24) {
      setSnackbar({ message: 'Enter valid hours (0-24)', severity: 'error' })
      return
    }
    try {
      await createTimeLog({
        projectId: selectedProjectId,
        date: logForm.date,
        hours,
        description: logForm.description,
      })
      setLogForm({ date: new Date().toISOString().slice(0, 10), hours: '', description: '' })
      setSnackbar({ message: 'Time log added', severity: 'success' })
      const logs = await getTimeLogsByProjectId(selectedProjectId)
      setTimeLogs(logs)
      updateTotals(logs)
    } catch {
      setSnackbar({ message: 'Error adding time log', severity: 'error' })
    }
  }

  const selectedClient = selectedClientId !== '' ? clients.find((c) => c.id === selectedClientId) : null

  return (
    <PageLayout
      title="Projects & Time"
      subtitle="Track projects and log your work hours"
    >
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          borderRadius: 3,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Client</InputLabel>
              <Select
                value={selectedClientId}
                label="Client"
                onChange={(e) => setSelectedClientId(e.target.value as number | '')}
              >
                {clients.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={4} md={3}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              Total Hours
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {totalHours.toFixed(2)}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={4} md={3}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              Earnings
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#27ae60' }}>
              ${totalEarnings.toFixed(2)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Projects
              {selectedClient && (
                <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  — {selectedClient.name}
                </Typography>
              )}
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Rate</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingProjects
                    ? Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 4 }).map((_, j) => (
                            <TableCell key={j}>
                              <Skeleton variant="text" width={j === 2 ? 60 : 80} />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    : projects.map((p) => (
                        <TableRow
                          key={p.id}
                          hover
                          selected={selectedProjectId === p.id}
                          onClick={() => setSelectedProjectId(p.id)}
                          sx={{
                            cursor: 'pointer',
                            '&.Mui-selected': {
                              bgcolor: (theme) =>
                                theme.palette.mode === 'dark'
                                  ? 'rgba(74,144,217,0.15)'
                                  : 'rgba(74,144,217,0.08)',
                            },
                          }}
                        >
                          <TableCell sx={{ fontWeight: 600 }}>{p.id}</TableCell>
                          <TableCell>{p.name}</TableCell>
                          <TableCell align="right">${p.hourlyRate.toFixed(2)}</TableCell>
                          <TableCell>
                            <Typography
                              variant="caption"
                              sx={{
                                px: 1,
                                py: 0.3,
                                borderRadius: 1,
                                bgcolor:
                                  p.status === 'Active'
                                    ? 'rgba(46,204,113,0.12)'
                                    : p.status === 'Completed'
                                      ? 'rgba(74,144,217,0.12)'
                                      : 'rgba(243,156,18,0.12)',
                                color:
                                  p.status === 'Active'
                                    ? '#2ecc71'
                                    : p.status === 'Completed'
                                      ? '#4A90D9'
                                      : '#f39c12',
                                fontWeight: 600,
                              }}
                            >
                              {p.status}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                  {!loadingProjects && projects.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        {selectedClientId !== '' ? 'No projects for this client' : 'Select a client above'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 2.5, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField size="small" label="Project name" value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} sx={{ flex: 1, minWidth: 140 }} />
              <TextField size="small" label="$/hr" type="number" value={projectForm.hourlyRate} onChange={(e) => setProjectForm({ ...projectForm, hourlyRate: e.target.value })} sx={{ width: 80 }} inputProps={{ step: 0.5, min: 0 }} />
              <FormControl size="small" sx={{ width: 110 }}>
                <InputLabel>Status</InputLabel>
                <Select value={projectForm.status} label="Status" onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="On Hold">On Hold</MenuItem>
                </Select>
              </FormControl>
              <Button variant="contained" size="small" onClick={handleAddProject} startIcon={<Add />}>
                Add
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Time Logs
              {selectedProjectId && (
                <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  — {projects.find((p) => p.id === selectedProjectId)?.name}
                </Typography>
              )}
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Hours</TableCell>
                    <TableCell>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingLogs
                    ? Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 4 }).map((_, j) => (
                            <TableCell key={j}>
                              <Skeleton variant="text" width={j === 3 ? 120 : 60} />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    : timeLogs.map((t) => (
                        <TableRow key={t.id} hover>
                          <TableCell sx={{ fontWeight: 600 }}>{t.id}</TableCell>
                          <TableCell>{t.date}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>{t.hours.toFixed(2)}</TableCell>
                          <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {t.description || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                  {!loadingLogs && timeLogs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        {selectedProjectId !== null ? 'No time logs yet' : 'Select a project above'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 2.5, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                size="small"
                label="Date"
                type="date"
                value={logForm.date}
                onChange={(e) => setLogForm({ ...logForm, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 140 }}
              />
              <TextField size="small" label="Hours" type="number" value={logForm.hours} onChange={(e) => setLogForm({ ...logForm, hours: e.target.value })} sx={{ width: 80 }} inputProps={{ step: 0.25, min: 0, max: 24 }} />
              <TextField size="small" label="Description" value={logForm.description} onChange={(e) => setLogForm({ ...logForm, description: e.target.value })} sx={{ flex: 1, minWidth: 120 }} />
              <Button variant="contained" size="small" onClick={handleAddLog} startIcon={<WorkHistory />}>
                Add Log
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {snackbar && (
        <Snackbar open autoHideDuration={3000} onClose={() => setSnackbar(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2 }}>{snackbar.message}</Alert>
        </Snackbar>
      )}
    </PageLayout>
  )
}

import { useEffect, useState } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
} from '@mui/material'
import PeopleIcon from '@mui/icons-material/People'
import WorkIcon from '@mui/icons-material/Work'
import ReceiptIcon from '@mui/icons-material/Receipt'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { getSummary, DashboardSummary } from '../api/dashboard'
import PageLayout from '../components/PageLayout'

const metricCards = [
  { label: 'Clients', key: 'totalClients', icon: <PeopleIcon />, color: '#3498db' },
  { label: 'Projects', key: 'totalProjects', icon: <WorkIcon />, color: '#2ecc71' },
  { label: 'Invoices', key: 'totalInvoices', icon: <ReceiptIcon />, color: '#9b59b6' },
  { label: 'Revenue', key: 'totalRevenue', icon: <AttachMoneyIcon />, color: '#27ae60', prefix: '$' },
  { label: 'Overdue', key: 'overdueCount', icon: <WarningAmberIcon />, color: '#e74c3c' },
]

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSummary()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const chartData = data
    ? Object.entries(data.monthlyRevenue || {}).map(([month, amount]) => ({
        month,
        revenue: amount,
      }))
    : []

  const formatValue = (key: string, value: number) => {
    if (key === 'totalRevenue') return `$${value.toFixed(2)}`
    return value
  }

  return (
    <PageLayout title="Dashboard" subtitle="Your business at a glance">
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {metricCards.map((card) => (
          <Grid item xs={12} sm={6} md={2.4} key={card.key}>
            <Card
              elevation={0}
              sx={{
                border: (theme) => `1px solid ${theme.palette.divider}`,
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: (theme) =>
                    theme.palette.mode === 'dark'
                      ? '0 8px 25px rgba(0,0,0,0.3)'
                      : '0 8px 25px rgba(0,0,0,0.08)',
                },
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
                <Box sx={{ color: card.color, mb: 1, opacity: 0.85 }}>{card.icon}</Box>
                {loading ? (
                  <Skeleton variant="text" width={60} height={40} sx={{ mx: 'auto' }} />
                ) : (
                  <Typography variant="h4" sx={{ fontWeight: 800, color: card.color }}>
                    {formatValue(card.key, (data as any)[card.key] ?? 0)}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
                  {card.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Monthly Revenue
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                    contentStyle={{
                      borderRadius: 8,
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  />
                  <Bar dataKey="revenue" fill="#4A90D9" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box
                sx={{
                  height: 280,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'text.secondary',
                }}
              >
                No revenue data yet
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Overdue Invoices
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
            ) : data?.overdueInvoices && data.overdueInvoices.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Invoice #</TableCell>
                      <TableCell>Project</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell>Due</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.overdueInvoices.map((inv, i) => (
                      <TableRow key={i} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{inv.invoiceNumber}</TableCell>
                        <TableCell>{inv.projectName}</TableCell>
                        <TableCell align="right" sx={{ color: '#e74c3c', fontWeight: 600 }}>
                          ${inv.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>{inv.dueDate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box
                sx={{
                  height: 280,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 1,
                  color: 'text.secondary',
                }}
              >
                <WarningAmberIcon sx={{ opacity: 0.3, fontSize: 40 }} />
                <Typography>No overdue invoices</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </PageLayout>
  )
}

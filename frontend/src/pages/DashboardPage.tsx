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
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
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
import { formatCurrency, currencySymbol } from '../utils/currency'

const metricCards = [
  {
    label: 'Clients',
    key: 'totalClients',
    icon: <PeopleIcon />,
    gradient: 'linear-gradient(135deg, #3498db, #2980b9)',
  },
  {
    label: 'Projects',
    key: 'totalProjects',
    icon: <WorkIcon />,
    gradient: 'linear-gradient(135deg, #2ecc71, #27ae60)',
  },
  {
    label: 'Invoices',
    key: 'totalInvoices',
    icon: <ReceiptIcon />,
    gradient: 'linear-gradient(135deg, #9b59b6, #8e44ad)',
  },
  {
    label: 'Revenue',
    key: 'totalRevenue',
    icon: <AttachMoneyIcon />,
    gradient: 'linear-gradient(135deg, #1abc9c, #16a085)',
    prefix: '$',
  },
  {
    label: 'Overdue',
    key: 'overdueCount',
    icon: <WarningAmberIcon />,
    gradient: 'linear-gradient(135deg, #e74c3c, #c0392b)',
  },
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

  const chartData = data?.monthlyRevenue
    ? Object.entries(data.monthlyRevenue).map(([month, amount]) => ({
        month,
        revenue: amount,
      }))
    : []

  const formatValue = (key: string, value: number) => {
    if (key === 'totalRevenue') return formatCurrency(value)
    return value
  }

  return (
    <PageLayout
      title={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <TrendingUpIcon sx={{ color: '#4A90D9' }} />
          <span>Dashboard</span>
        </Box>
      }
      subtitle="Your business at a glance"
    >
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {metricCards.map((card) => (
          <Grid item xs={12} sm={6} md={2.4} key={card.key}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                overflow: 'visible',
                position: 'relative',
                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                },
              }}
            >
              <Box
                sx={{
                  height: 4,
                  background: card.gradient,
                  borderRadius: '3px 3px 0 0',
                }}
              />
              <CardContent
                sx={{
                  textAlign: 'center',
                  py: 2.5,
                  px: 1.5,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: -10,
                    right: -10,
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    opacity: 0.04,
                    background: card.gradient,
                  }}
                />
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    background: card.gradient,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    mb: 1.5,
                    boxShadow: (t) =>
                      `0 4px 12px ${t.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.08)'}`,
                  }}
                >
                  {card.icon}
                </Box>
                {loading ? (
                  <Skeleton variant="text" width={60} height={36} sx={{ mx: 'auto' }} />
                ) : (
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 900,
                      fontSize: '1.75rem',
                      background: card.gradient,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {formatValue(card.key, (data as any)?.[card.key] ?? 0)}
                  </Typography>
                )}
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'text.secondary',
                    display: 'block',
                    mt: 0.5,
                  }}
                >
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
              borderRadius: 3,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              transition: 'box-shadow 0.3s ease',
              '&:hover': {
                boxShadow: (t) =>
                  t.palette.mode === 'dark'
                    ? '0 8px 30px rgba(0,0,0,0.3)'
                    : '0 8px 30px rgba(0,0,0,0.06)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4A90D9, #6ba8e8)',
                }}
              />
              <Typography variant="h6">Monthly Revenue</Typography>
            </Box>
            {loading ? (
              <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                    contentStyle={{
                      borderRadius: 12,
                      border: 'none',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                      padding: '10px 14px',
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="url(#revenueGradient)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={42}
                  />
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4A90D9" />
                      <stop offset="100%" stopColor="#357abd" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box
                sx={{
                  height: 280,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1.5,
                  color: 'text.secondary',
                }}
              >
                <AttachMoneyIcon sx={{ fontSize: 48, opacity: 0.15 }} />
                <Typography>No revenue data yet</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              transition: 'box-shadow 0.3s ease',
              '&:hover': {
                boxShadow: (t) =>
                  t.palette.mode === 'dark'
                    ? '0 8px 30px rgba(0,0,0,0.3)'
                    : '0 8px 30px rgba(0,0,0,0.06)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
                }}
              />
              <Typography variant="h6">Overdue Invoices</Typography>
            </Box>
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
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
                          {inv.invoiceNumber}
                        </TableCell>
                        <TableCell>{inv.projectName}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: '#ef4444' }}>
                          {formatCurrency(inv.amount)}
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
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1.5,
                  color: 'text.secondary',
                }}
              >
                <WarningAmberIcon sx={{ fontSize: 48, opacity: 0.15 }} />
                <Typography>No overdue invoices</Typography>
                <Typography variant="caption" sx={{ opacity: 0.6 }}>
                  Everything is up to date!
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </PageLayout>
  )
}

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

const metricCards = [
  { label: 'Clients', key: 'totalClients', icon: <PeopleIcon />, color: '#3498db' },
  { label: 'Projects', key: 'totalProjects', icon: <WorkIcon />, color: '#2ecc71' },
  { label: 'Invoices', key: 'totalInvoices', icon: <ReceiptIcon />, color: '#9b59b6' },
  { label: 'Revenue', key: 'totalRevenue', icon: <AttachMoneyIcon />, color: '#27ae60', prefix: '$' },
  { label: 'Overdue', key: 'overdueCount', icon: <WarningAmberIcon />, color: '#e74c3c' },
]

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null)

  useEffect(() => {
    getSummary().then(setData).catch(() => {})
  }, [])

  if (!data) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>Dashboard</Typography>
        <Typography color="text.secondary">Loading dashboard data...</Typography>
      </Box>
    )
  }

  const chartData = Object.entries(data.monthlyRevenue || {}).map(([month, amount]) => ({
    month,
    revenue: amount,
  }))

  const formatValue = (key: string, value: number) => {
    if (key === 'totalRevenue') return `$${value.toFixed(2)}`
    return value
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>Dashboard</Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {metricCards.map((card) => (
          <Grid item xs={12} sm={6} md={2.4} key={card.key}>
            <Card elevation={3}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Box sx={{ color: card.color, mb: 1 }}>{card.icon}</Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: card.color }}>
                  {formatValue(card.key, (data as any)[card.key] ?? 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Monthly Revenue</Typography>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#4A90D9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>
                No data yet
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Overdue Invoices</Typography>
            {data.overdueInvoices && data.overdueInvoices.length > 0 ? (
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
                      <TableRow key={i}>
                        <TableCell>{inv.invoiceNumber}</TableCell>
                        <TableCell>{inv.projectName}</TableCell>
                        <TableCell align="right">${inv.amount.toFixed(2)}</TableCell>
                        <TableCell>{inv.dueDate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>
                No overdue invoices
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

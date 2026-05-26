import apiClient from './client'

export interface DashboardSummary {
  totalClients: number
  totalProjects: number
  totalInvoices: number
  totalRevenue: number
  overdueCount: number
  monthlyRevenue: Record<string, number>
  overdueInvoices: Array<{
    invoiceNumber: string
    projectName: string
    amount: number
    dueDate: string
  }>
}

export async function getSummary(): Promise<DashboardSummary> {
  const res = await apiClient.get<DashboardSummary>('/dashboard/summary')
  return res.data
}

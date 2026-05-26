import apiClient from './client'

export interface Invoice {
  id: number
  projectId: number
  invoiceNumber: string
  amount: number
  status: string
  issuedDate: string
  dueDate: string
  createdAt?: string
  updatedAt?: string
}

export async function getInvoices(): Promise<Invoice[]> {
  const res = await apiClient.get<Invoice[]>('/invoices')
  return res.data
}

export async function getInvoice(id: number): Promise<Invoice> {
  const res = await apiClient.get<Invoice>(`/invoices/${id}`)
  return res.data
}

export async function getInvoicesByProjectId(projectId: number): Promise<Invoice[]> {
  const res = await apiClient.get<Invoice[]>(`/invoices/by-project/${projectId}`)
  return res.data
}

export async function createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
  const res = await apiClient.post<Invoice>('/invoices', invoice)
  return res.data
}

export async function updateInvoice(id: number, invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
  const res = await apiClient.put<Invoice>(`/invoices/${id}`, invoice)
  return res.data
}

export async function deleteInvoice(id: number): Promise<void> {
  await apiClient.delete(`/invoices/${id}`)
}

export async function toggleInvoicePaid(id: number): Promise<Invoice> {
  const res = await apiClient.put<Invoice>(`/invoices/${id}/toggle-paid`)
  return res.data
}

export async function downloadInvoicePdf(id: number): Promise<Blob> {
  const res = await apiClient.get<Blob>(`/invoices/${id}/pdf`, { responseType: 'blob' })
  return res.data
}

export async function getUnbilledAmount(projectId: number): Promise<number> {
  const res = await apiClient.get<{ unbilled: number }>(`/invoices/unbilled/${projectId}`)
  return res.data.unbilled
}

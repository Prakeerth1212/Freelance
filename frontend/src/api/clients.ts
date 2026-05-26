import apiClient from './client'

export interface Client {
  id: number
  name: string
  email: string
  phone: string
  company: string
  notes: string
  createdAt?: string
}

export async function getClients(): Promise<Client[]> {
  const res = await apiClient.get<Client[]>('/clients')
  return res.data
}

export async function getClient(id: number): Promise<Client> {
  const res = await apiClient.get<Client>(`/clients/${id}`)
  return res.data
}

export async function createClient(client: Omit<Client, 'id' | 'createdAt'>): Promise<Client> {
  const res = await apiClient.post<Client>('/clients', client)
  return res.data
}

export async function updateClient(id: number, client: Omit<Client, 'id' | 'createdAt'>): Promise<Client> {
  const res = await apiClient.put<Client>(`/clients/${id}`, client)
  return res.data
}

export async function deleteClient(id: number): Promise<void> {
  await apiClient.delete(`/clients/${id}`)
}

import apiClient from './client'

export interface TimeLog {
  id: number
  projectId: number
  date: string
  hours: number
  description: string
  createdAt?: string
}

export async function getTimeLogs(): Promise<TimeLog[]> {
  const res = await apiClient.get<TimeLog[]>('/timelogs')
  return res.data
}

export async function getTimeLogsByProjectId(projectId: number): Promise<TimeLog[]> {
  const res = await apiClient.get<TimeLog[]>(`/timelogs/by-project/${projectId}`)
  return res.data
}

export async function createTimeLog(log: Omit<TimeLog, 'id' | 'createdAt'>): Promise<TimeLog> {
  const res = await apiClient.post<TimeLog>('/timelogs', log)
  return res.data
}

export async function updateTimeLog(id: number, log: Omit<TimeLog, 'id' | 'createdAt'>): Promise<TimeLog> {
  const res = await apiClient.put<TimeLog>(`/timelogs/${id}`, log)
  return res.data
}

export async function deleteTimeLog(id: number): Promise<void> {
  await apiClient.delete(`/timelogs/${id}`)
}

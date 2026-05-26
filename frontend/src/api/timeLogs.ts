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
  const res = await apiClient.get<TimeLog[]>('/time-logs')
  return res.data
}

export async function getTimeLogsByProjectId(projectId: number): Promise<TimeLog[]> {
  const res = await apiClient.get<TimeLog[]>(`/time-logs/by-project/${projectId}`)
  return res.data
}

export async function createTimeLog(log: Omit<TimeLog, 'id' | 'createdAt'>): Promise<TimeLog> {
  const res = await apiClient.post<TimeLog>('/time-logs', log)
  return res.data
}

export async function updateTimeLog(id: number, log: Omit<TimeLog, 'id' | 'createdAt'>): Promise<TimeLog> {
  const res = await apiClient.put<TimeLog>(`/time-logs/${id}`, log)
  return res.data
}

export async function deleteTimeLog(id: number): Promise<void> {
  await apiClient.delete(`/time-logs/${id}`)
}

import apiClient from './client'

export interface Project {
  id: number
  clientId: number
  name: string
  description: string
  hourlyRate: number
  status: string
  createdAt?: string
  updatedAt?: string
}

export async function getProjects(): Promise<Project[]> {
  const res = await apiClient.get<Project[]>('/projects')
  return res.data
}

export async function getProject(id: number): Promise<Project> {
  const res = await apiClient.get<Project>(`/projects/${id}`)
  return res.data
}

export async function getProjectsByClientId(clientId: number): Promise<Project[]> {
  const res = await apiClient.get<Project[]>(`/projects/by-client/${clientId}`)
  return res.data
}

export async function createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
  const res = await apiClient.post<Project>('/projects', project)
  return res.data
}

export async function updateProject(id: number, project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
  const res = await apiClient.put<Project>(`/projects/${id}`, project)
  return res.data
}

export async function deleteProject(id: number): Promise<void> {
  await apiClient.delete(`/projects/${id}`)
}

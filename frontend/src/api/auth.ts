import apiClient from './client'

export interface AuthResponse {
  token: string
  username: string
  role: string
}

export async function login(username: string, password: string): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>('/auth/login', { username, password })
  return res.data
}

export async function register(username: string, password: string): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>('/auth/register', { username, password })
  return res.data
}

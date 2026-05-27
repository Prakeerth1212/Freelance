import apiClient from './client'

interface GmailStatus {
  connected: boolean
  error?: string
}

interface AuthUrlResponse {
  url: string
}

interface DraftResponse {
  success: boolean
  message: string
  error?: string
  reconnect?: boolean
}

export async function getGmailStatus(): Promise<GmailStatus> {
  const res = await apiClient.get<GmailStatus>('/gmail/status')
  return res.data
}

export async function getAuthUrl(): Promise<string> {
  const res = await apiClient.get<AuthUrlResponse>('/gmail/auth')
  return res.data.url
}

export async function createDraft(to: string, subject: string, body: string): Promise<DraftResponse> {
  const res = await apiClient.post<DraftResponse>('/gmail/draft', { to, subject, body })
  return res.data
}

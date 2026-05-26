import apiClient from './client'

export interface AIResponse {
  response: string
}

export async function generate(prompt: string): Promise<AIResponse> {
  const res = await apiClient.post<AIResponse>('/ai/generate', { prompt })
  return res.data
}

import { request } from './client'
import type { ApiMeta, Application } from './types'

export const applications = {
  submit(fields: unknown) {
    return request<{ application: Application }>('/api/v1/applications', { method: 'POST', body: fields })
  },
  list({ page = 1, limit = 20 }: { page?: number; limit?: number } = {}) {
    return request<{ applications: Application[]; meta: ApiMeta }>(`/api/v1/applications?page=${page}&limit=${limit}`)
  },
  get(id: string) {
    return request<{ application: Application }>(`/api/v1/applications/${id}`)
  },
}

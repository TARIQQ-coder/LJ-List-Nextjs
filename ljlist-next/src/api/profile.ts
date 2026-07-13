import { request } from './client'
import type { ApiUser } from './types'

export const profile = {
  get() {
    return request<{ user: ApiUser }>('/api/v1/profile')
  },
  update(fields) {
    return request<{ user: ApiUser }>('/api/v1/profile', { method: 'PATCH', body: fields })
  },
}

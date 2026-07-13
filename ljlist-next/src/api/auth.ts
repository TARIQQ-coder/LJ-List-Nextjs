import { request } from './client'
import type { AuthResponse } from './types'

export const auth = {
  signup(fields) {
    return request<AuthResponse>('/api/v1/auth/signup', { method: 'POST', body: fields })
  },
  verifyOtp(fields) {
    return request<AuthResponse>('/api/v1/auth/verify-otp', { method: 'POST', body: fields })
  },
  resendOtp(phone_number) {
    return request<AuthResponse>('/api/v1/auth/resend-otp', { method: 'POST', body: { phone_number } })
  },
  login(fields) {
    return request<AuthResponse>('/api/v1/auth/login', { method: 'POST', body: fields })
  },
  refresh() {
    return request('/api/v1/auth/refresh', { method: 'POST' })
  },
  logout() {
    return request('/api/v1/auth/logout', { method: 'POST' })
  },
}

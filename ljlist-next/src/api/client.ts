const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://lj-list-api.onrender.com'

type RequestOptions = {
  body?: unknown
  method?: string
  multipart?: boolean
  skipRefresh?: boolean
}

export async function request<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, method = 'GET', multipart = false, skipRefresh = false } = options

  const headers: Record<string, string> = {}
  if (body && !multipart) headers['Content-Type'] = 'application/json'

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body ? (multipart ? body as BodyInit : JSON.stringify(body)) : undefined,
  })

  const json = await res.json().catch(() => ({}))

  if (!res.ok) {
    if (res.status === 401 && !skipRefresh && path !== '/api/v1/auth/refresh') {
      const refreshed = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      }).then(r => r.ok).catch(() => false)

      if (refreshed) {
        return request<T>(path, { ...options, skipRefresh: true })
      }
    }

    throw {
      message: json.message || 'Something went wrong. Please try again.',
      errors: json.errors || {},
      code: json.code || 'ERROR',
      status: res.status,
      requestId: json.request_id,
    }
  }

  return json.data ?? json
}

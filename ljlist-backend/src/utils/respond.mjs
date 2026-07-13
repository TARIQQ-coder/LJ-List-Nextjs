import crypto from 'node:crypto'

// Success envelope. Storefront reads `json.data ?? json`; admin reads `res.data.data`
// and (for dashboard stats) `res.data.meta` — so meta is exposed at both levels.
export function ok(res, data, { message, meta, status = 200 } = {}) {
  const body = { data }
  if (message) body.message = message
  if (meta) { body.meta = meta; if (data && typeof data === 'object' && !Array.isArray(data)) data.meta = data.meta ?? meta }
  return res.status(status).json(body)
}

export class ApiError extends Error {
  constructor(status, message, { code = 'ERROR', errors = {} } = {}) {
    super(message)
    this.status = status
    this.code = code
    this.errors = errors
  }
}

export const badRequest = (message, errors) => new ApiError(400, message, { code: 'BAD_REQUEST', errors })
export const unauthorized = (message = 'Authentication required.') => new ApiError(401, message, { code: 'UNAUTHORIZED' })
export const forbidden = (message = 'You do not have access to this resource.') => new ApiError(403, message, { code: 'FORBIDDEN' })
export const notFound = (message = 'Resource not found.') => new ApiError(404, message, { code: 'NOT_FOUND' })

export const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

export function errorMiddleware(err, req, res, _next) {
  const requestId = crypto.randomUUID()
  const status = err.status || 500
  if (status >= 500) console.error(`[${requestId}]`, err)
  res.status(status).json({
    message: status >= 500 ? 'Something went wrong. Please try again.' : err.message,
    errors: err.errors || {},
    code: err.code || 'INTERNAL_ERROR',
    request_id: requestId,
  })
}

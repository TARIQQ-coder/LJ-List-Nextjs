import jwt from 'jsonwebtoken'
import { config } from '../config.mjs'

const ACCESS_COOKIE = 'lj_access'
const REFRESH_COOKIE = 'lj_refresh'

export function signAccess(user) {
  return jwt.sign({ sub: String(user._id), role: user.role }, config.jwtSecret, { expiresIn: config.accessTtl })
}

export function signRefresh(user) {
  return jwt.sign({ sub: String(user._id), type: 'refresh', tv: user.token_version || 0 },
    config.jwtSecret, { expiresIn: `${config.refreshTtlDays}d` })
}

function cookieOpts(maxAgeMs) {
  return {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: config.cookieSameSite,
    path: '/',
    maxAge: maxAgeMs,
  }
}

export function setAuthCookies(res, user) {
  res.cookie(ACCESS_COOKIE, signAccess(user), cookieOpts(15 * 60 * 1000))
  res.cookie(REFRESH_COOKIE, signRefresh(user), cookieOpts(config.refreshTtlDays * 24 * 3600 * 1000))
}

export function clearAuthCookies(res) {
  res.clearCookie(ACCESS_COOKIE, { path: '/' })
  res.clearCookie(REFRESH_COOKIE, { path: '/' })
}

export function readAccess(req) {
  const token = req.cookies?.[ACCESS_COOKIE]
  if (!token) return null
  try { return jwt.verify(token, config.jwtSecret) } catch { return null }
}

export function readRefresh(req) {
  const token = req.cookies?.[REFRESH_COOKIE]
  if (!token) return null
  try {
    const payload = jwt.verify(token, config.jwtSecret)
    return payload.type === 'refresh' ? payload : null
  } catch { return null }
}

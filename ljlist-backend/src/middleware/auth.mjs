import { User } from '../models/index.mjs'
import { readAccess } from '../utils/tokens.mjs'
import { asyncHandler, unauthorized, forbidden } from '../utils/respond.mjs'

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const payload = readAccess(req)
  if (!payload) throw unauthorized()
  const user = await User.findById(payload.sub)
  if (!user) throw unauthorized()
  req.user = user
  next()
})

export const requireAdmin = [
  requireAuth,
  (req, _res, next) => {
    if (req.user.role !== 'admin') return next(forbidden('Admin access required.'))
    next()
  },
]

import { Router } from 'express'
import { serializeUser } from '../models/index.mjs'
import { ok, asyncHandler } from '../utils/respond.mjs'
import { requireAuth } from '../middleware/auth.mjs'

const router = Router()

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  ok(res, { user: serializeUser(req.user) })
}))

router.patch('/', requireAuth, asyncHandler(async (req, res) => {
  const allowed = ['display_name', 'staff_number', 'institution', 'ghana_card_number', 'address', 'landmark', 'region', 'city']
  for (const key of allowed) {
    if (key in (req.body || {})) req.user[key] = req.body[key]
  }
  await req.user.save()
  ok(res, { user: serializeUser(req.user) }, { message: 'Profile updated.' })
}))

export default router

import { Router } from 'express'
import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import { User, serializeUser } from '../models/index.mjs'
import { ok, asyncHandler, badRequest, unauthorized } from '../utils/respond.mjs'
import { setAuthCookies, clearAuthCookies, readRefresh } from '../utils/tokens.mjs'
import { config } from '../config.mjs'
import { sendSms } from '../utils/sms.mjs'

const router = Router()

const normalizePhone = (raw = '') => {
  let p = String(raw).replace(/[\s-]/g, '')
  if (/^0\d{9}$/.test(p)) p = `+233${p.slice(1)}` // Ghana local format → E.164
  return p
}

async function issueOtp(user) {
  const otp = String(crypto.randomInt(100000, 1000000))
  user.otp_hash = await bcrypt.hash(otp, 8)
  user.otp_expires_at = new Date(Date.now() + config.otpTtlMinutes * 60 * 1000)
  await user.save()
  // TODO: plug an SMS provider (Hubtel/Arkesel/Twilio) here. Until then, the
  // code is printed to the server console so you can test the full flow.
  await sendSms(
    user.phone_number,
    `Your LJ-list verification code is ${otp}. It expires in ${config.otpTtlMinutes} minutes.`,
  )
  return { phone_number: user.phone_number, expires_in_minutes: config.otpTtlMinutes }
}

router.post('/signup', asyncHandler(async (req, res) => {
  const { display_name, phone_number, password, staff_number, institution, ghana_card_number } = req.body || {}
  const errors = {}
  if (!display_name?.trim()) errors.display_name = ['Full name is required.']
  const phone = normalizePhone(phone_number)
  if (!/^\+\d{10,14}$/.test(phone)) errors.phone_number = ['Enter a valid phone number, e.g. +233244000000.']
  if (!password || password.length < 8) errors.password = ['Password must be at least 8 characters.']
  if (Object.keys(errors).length) throw badRequest('Please fix the highlighted fields.', errors)

  const existing = await User.findOne({ phone_number: phone })
  if (existing) throw badRequest('An account with this phone number already exists.', { phone_number: ['Phone number already registered.'] })

  const user = await User.create({
    display_name: display_name.trim(),
    phone_number: phone,
    password_hash: await bcrypt.hash(password, 10),
    staff_number, institution, ghana_card_number,
  })
  const verification = await issueOtp(user)
  ok(res, { user: serializeUser(user), verification }, { message: 'Account created. Verify the code sent to your phone.', status: 201 })
}))

router.post('/verify-otp', asyncHandler(async (req, res) => {
  const phone = normalizePhone(req.body?.phone_number)
  const otp = String(req.body?.otp || '')
  const user = await User.findOne({ phone_number: phone })
  if (!user || !user.otp_hash) throw badRequest('Invalid or expired code.', { otp: ['Invalid or expired code.'] })
  if (user.otp_expires_at < new Date()) throw badRequest('Code expired. Request a new one.', { otp: ['Code expired.'] })
  const valid = await bcrypt.compare(otp, user.otp_hash)
  if (!valid) throw badRequest('Invalid code.', { otp: ['Invalid code.'] })

  user.phone_verified = true
  user.otp_hash = undefined
  user.otp_expires_at = undefined
  await user.save()
  setAuthCookies(res, user)
  ok(res, { user: serializeUser(user) }, { message: 'Phone verified. Welcome!' })
}))

router.post('/resend-otp', asyncHandler(async (req, res) => {
  const phone = normalizePhone(req.body?.phone_number)
  const user = await User.findOne({ phone_number: phone })
  if (!user) throw badRequest('No account found for this phone number.')
  const verification = await issueOtp(user)
  ok(res, { verification }, { message: 'A new code was sent to your phone.' })
}))

router.post('/login', asyncHandler(async (req, res) => {
  const phone = normalizePhone(req.body?.phone_number)
  const user = await User.findOne({ phone_number: phone })
  const valid = user && (await bcrypt.compare(String(req.body?.password || ''), user.password_hash))
  if (!valid) throw unauthorized('Incorrect phone number or password.')

  if (!user.phone_verified) {
    const verification = await issueOtp(user)
    return ok(res, { user: serializeUser(user), verification }, { message: 'Verify your phone number to continue.' })
  }
  setAuthCookies(res, user)
  ok(res, { user: serializeUser(user) }, { message: 'Signed in.' })
}))

router.post('/refresh', asyncHandler(async (req, res) => {
  const payload = readRefresh(req)
  if (!payload) throw unauthorized('Session expired. Please sign in again.')
  const user = await User.findById(payload.sub)
  if (!user || (user.token_version || 0) !== (payload.tv || 0)) throw unauthorized('Session expired. Please sign in again.')
  setAuthCookies(res, user)
  ok(res, { user: serializeUser(user) })
}))

router.post('/logout', asyncHandler(async (_req, res) => {
  clearAuthCookies(res)
  ok(res, {}, { message: 'Signed out.' })
}))

export default router

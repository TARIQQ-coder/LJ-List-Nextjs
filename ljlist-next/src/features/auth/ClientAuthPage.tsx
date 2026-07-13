'use client'

import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from '@/lib/router'
import { auth as authApi } from '../../api'
import { LogoMark } from '../../layout/LogoMark'

export const AuthField = ({ label, name, type = 'text', placeholder, value, onChange, required }: any) => (
  <div>
    <label className="block text-gray-700 text-sm font-semibold mb-1.5">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    <input
      name={name}
      value={value}
      onChange={onChange}
      type={type}
      placeholder={placeholder}
      autoComplete="off"
      className="w-full border border-gray-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 bg-white text-gray-800 placeholder-gray-400 rounded-lg px-4 py-2.5 text-sm outline-none transition-all"
    />
  </div>
)

const PageShell = ({ title, subtitle, children, footer }: any) => (
  <div className="min-h-screen bg-gray-50">
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-semibold transition-colors">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-900">
            <LogoMark size={20} />
          </span>
          Back to Store
        </Link>
        <div className="flex items-center gap-2">
          <p className="font-black text-gray-900 text-sm">{title}</p>
        </div>
      </div>
    </div>

    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-black text-gray-900 mb-1">{title}</h1>
        <p className="text-gray-500 text-sm">{subtitle}</p>
      </div>

      <div className="mt-8">{children}</div>
      {footer}
    </div>
  </div>
)

export const AuthLoginPage = ({ onSuccess }: any) => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ phone_number: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: any) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await authApi.login(form)
      await onSuccess?.(data.user || null)
      navigate('/', { replace: true })
    } catch (err: any) {
      if (err?.code === 'FORBIDDEN' || err?.status === 403) {
        navigate(`/auth/otp-verify?phone=${encodeURIComponent(form.phone_number)}`, { replace: true })
        return
      }
      setError(err?.errors?.auth?.[0] || err?.message || 'Incorrect phone number or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell
      title="Sign In"
      subtitle="Use your phone number and password to access your account."
      footer={<p className="mt-6 text-sm text-gray-500">No account yet? <Link to="/auth/register" className="text-amber-600 font-semibold hover:underline">Create one</Link></p>}
    >
      <form onSubmit={submit} className="max-w-xl bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <AuthField label="Phone Number" name="phone_number" type="tel" placeholder="+233244000000" value={form.phone_number} onChange={(e: any) => setForm((p) => ({ ...p, phone_number: e.target.value }))} required />
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-1.5">Password <span className="text-red-400 ml-0.5">*</span></label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={(e: any) => setForm((p) => ({ ...p, password: e.target.value }))}
            placeholder="••••••••"
            className="w-full border border-gray-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 bg-white text-gray-800 placeholder-gray-400 rounded-lg px-4 py-2.5 text-sm outline-none transition-all"
          />
        </div>
        {error && <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 font-medium">{error}</p>}
        <div className="flex items-center justify-between gap-3">
          <Link to="/auth/register" className="text-sm text-gray-500 hover:text-gray-900">Register</Link>
          <button type="submit" disabled={loading} className="bg-gray-900 hover:bg-gray-800 text-white font-black text-sm px-5 py-3 rounded-xl transition-colors disabled:opacity-60">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
      </form>
    </PageShell>
  )
}

export const AuthRegisterPage = ({ onSuccess }: any) => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    display_name: '',
    phone_number: '',
    staff_number: '',
    institution: '',
    ghana_card_number: '',
    password: '',
    confirm: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: any) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      const data = await authApi.signup({
        display_name: form.display_name,
        phone_number: form.phone_number,
        staff_number: form.staff_number,
        institution: form.institution,
        ghana_card_number: form.ghana_card_number,
        password: form.password,
      })
      await onSuccess?.(data.user || null)
      navigate(`/auth/otp-verify?phone=${encodeURIComponent(data.verification?.phone_number || form.phone_number)}`, { replace: true })
    } catch (err: any) {
      const first = Object.values(err?.errors || {}).flat()[0]
      setError(first || err?.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell
      title="Register"
      subtitle="Create your customer account."
      footer={<p className="mt-6 text-sm text-gray-500">Already have an account? <Link to="/auth/login" className="text-amber-600 font-semibold hover:underline">Sign in</Link></p>}
    >
      <form onSubmit={submit} className="max-w-2xl bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AuthField label="Full Name" name="display_name" placeholder="e.g. Kwame Asante" value={form.display_name} onChange={(e: any) => setForm((p) => ({ ...p, display_name: e.target.value }))} required />
          <AuthField label="Phone Number" name="phone_number" type="tel" placeholder="+233244000000" value={form.phone_number} onChange={(e: any) => setForm((p) => ({ ...p, phone_number: e.target.value }))} required />
          <AuthField label="Staff Number" name="staff_number" placeholder="e.g. GES-2024-0018" value={form.staff_number} onChange={(e: any) => setForm((p) => ({ ...p, staff_number: e.target.value }))} required />
          <AuthField label="Institution" name="institution" placeholder="e.g. Ghana Education Service" value={form.institution} onChange={(e: any) => setForm((p) => ({ ...p, institution: e.target.value }))} required />
          <AuthField label="Ghana Card Number" name="ghana_card_number" placeholder="GHA-123456789-0" value={form.ghana_card_number} onChange={(e: any) => setForm((p) => ({ ...p, ghana_card_number: e.target.value }))} required />
          <AuthField label="Password" name="password" type="password" placeholder="Minimum 8 characters" value={form.password} onChange={(e: any) => setForm((p) => ({ ...p, password: e.target.value }))} required />
          <AuthField label="Confirm Password" name="confirm" type="password" placeholder="Repeat your password" value={form.confirm} onChange={(e: any) => setForm((p) => ({ ...p, confirm: e.target.value }))} required />
        </div>
        {error && <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 font-medium">{error}</p>}
        <div className="flex items-center justify-between gap-3">
          <Link to="/auth/login" className="text-sm text-gray-500 hover:text-gray-900">Sign in</Link>
          <button type="submit" disabled={loading} className="bg-gray-900 hover:bg-gray-800 text-white font-black text-sm px-5 py-3 rounded-xl transition-colors disabled:opacity-60">
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </div>
      </form>
    </PageShell>
  )
}

export const AuthOtpVerifyPage = ({ onSuccess }: any) => {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const phone = params.get('phone') || ''
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const verify = async (e: any) => {
    e.preventDefault()
    if (!phone) {
      navigate('/auth/register', { replace: true })
      return
    }
    setError('')
    setLoading(true)
    try {
      const data = await authApi.verifyOtp({ phone_number: phone, otp })
      await onSuccess?.(data.user || null)
      navigate('/', { replace: true })
    } catch (err: any) {
      setError(err?.errors?.otp?.[0] || err?.message || 'Invalid or expired code.')
    } finally {
      setLoading(false)
    }
  }

  const resend = async () => {
    if (!phone) return
    setResending(true)
    setMessage('')
    try {
      await authApi.resendOtp(phone)
      setMessage('A new code was sent to your phone.')
    } catch (err: any) {
      setError(err?.message || 'Could not resend the code.')
    } finally {
      setResending(false)
    }
  }

  return (
    <PageShell
      title="Verify OTP"
      subtitle={phone ? `We sent a 6-digit code to ${phone}.` : 'Enter the phone number used during registration.'}
      footer={<p className="mt-6 text-sm text-gray-500">Need an account? <Link to="/auth/register" className="text-amber-600 font-semibold hover:underline">Register</Link></p>}
    >
      <form onSubmit={verify} className="max-w-md bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <AuthField label="OTP Code" name="otp" placeholder="123456" value={otp} onChange={(e: any) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} required />
        {error && <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 font-medium">{error}</p>}
        {message && <p className="text-green-700 text-xs bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 font-medium">{message}</p>}
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={resend} disabled={resending || !phone} className="text-sm text-amber-700 hover:text-amber-800 font-semibold disabled:opacity-50">
            {resending ? 'Sending...' : 'Resend code'}
          </button>
          <button type="submit" disabled={loading || otp.length < 6 || !phone} className="bg-gray-900 hover:bg-gray-800 text-white font-black text-sm px-5 py-3 rounded-xl transition-colors disabled:opacity-60">
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </form>
    </PageShell>
  )
}

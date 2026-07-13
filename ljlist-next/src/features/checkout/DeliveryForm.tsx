'use client'

import { useState } from 'react'
import { useNavigate } from '@/lib/router'
import { profile as profileApi } from '../../api'
import { fmt } from '../../utils/format'

// ─── DELIVERY FORM ────────────────────────────────────────────────────────────
// DeliveryStep — shown after application submission ONLY if the user's profile
//   has no address yet. Once they fill it in, it saves to their profile so all
//   future applications use it as the default.
//
// DeliveryCard — shown on ApplicationDetailPage. Displays the snapshotted
//   delivery details that were stored on the application at submission time.
//   These never change even if the user updates their profile address later.

const REGIONS = [
  'Greater Accra','Ashanti','Western','Eastern','Central','Northern',
  'Upper East','Upper West','Volta','Brong-Ahafo','Bono East','Ahafo',
  'Savannah','North East','Oti','Western North',
]

const DField = ({ label, name, type = 'text', placeholder, value, onChange, required, as: As }: any) => (
  <div>
    <label className="block text-gray-600 text-xs font-bold uppercase tracking-wider mb-1.5">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {As === 'textarea' ? (
      <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} rows={3}
        className="w-full bg-white border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 text-gray-800 placeholder-gray-300 rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none" />
    ) : (
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} required={required}
        className="w-full bg-white border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 text-gray-800 placeholder-gray-300 rounded-xl px-4 py-3 text-sm outline-none transition-all" />
    )}
  </div>
)

// ── DeliveryCard — read-only snapshot on ApplicationDetailPage ────────────────
export const DeliveryCard = ({ application }: { application: any }) => {
  const hasDelivery = application.address || application.city || application.region

  if (!hasDelivery) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h2 className="text-gray-900 font-black text-sm mb-2">Delivery Details</h2>
        <p className="text-gray-400 text-sm">
          No delivery address was recorded for this application.
          Update your profile address and it will be used for future applications.
        </p>
        <a href="/profile/settings"
          className="inline-block mt-3 text-amber-600 text-xs font-bold hover:underline">
          Update profile address →
        </a>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-gray-900 font-black text-sm">Delivery Details</h2>
        <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-1 rounded-full font-medium">
          Snapshot at submission
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { label: 'Delivery Address', value: application.address },
          { label: 'Nearest Landmark', value: application.landmark || '—' },
          { label: 'City / Town',      value: application.city },
          { label: 'Region',           value: application.region },
          { label: 'Preferred Date',   value: application.preferred_date || '—' },
        ].map(row => (
          <div key={row.label} className="bg-gray-50 rounded-xl px-4 py-3">
            <p className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">{row.label}</p>
            <p className="text-gray-800 text-sm font-semibold mt-1">{row.value}</p>
          </div>
        ))}
        {application.notes && (
          <div className="sm:col-span-2 bg-gray-50 rounded-xl px-4 py-3">
            <p className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">Driver Notes</p>
            <p className="text-gray-800 text-sm mt-1">{application.notes}</p>
          </div>
        )}
      </div>
      <p className="text-gray-300 text-xs mt-3">
        This address was used at the time of submission. To update your default address, visit{' '}
        <a href="/profile/settings" className="text-amber-500 hover:underline">your profile</a>.
      </p>
    </div>
  )
}

// ── DeliveryStep — step 2 after submission when profile has no address ─────────
export const DeliveryStep = ({
  application,
  onDone,
  onSkip,
}: {
  application?: any
  onDone: () => void
  onSkip: () => void
}) => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    address: '', landmark: '', city: '', region: '', preferred_date: '', notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const onChange = (e: any) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const save = async () => {
    if (!form.address.trim() || !form.city.trim() || !form.region) {
      setError('Address, city and region are required.'); return
    }
    setSaving(true); setError('')
    try {
      // Save to profile so it becomes the default for future applications
      await profileApi.update({
        address:  form.address,
        landmark: form.landmark  || undefined,
        city:     form.city,
        region:   form.region,
      })
      onDone()
    } catch (err: any) {
      setError(err.message || 'Could not save your address. You can update it later from your profile.')
    } finally { setSaving(false) }
  }

  return (
    <section id="apply" className="bg-white py-12 px-4 border-b border-gray-100">
      <div className="max-w-3xl mx-auto">

        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gray-800 text-white flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <span className="text-xs font-bold text-gray-400">Application submitted</span>
          </div>
          <div className="flex-1 h-px bg-amber-200" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-amber-400 text-gray-900 text-xs font-black flex items-center justify-center flex-shrink-0">2</div>
            <span className="text-xs font-black text-gray-800">Delivery Address</span>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200">
            <h2 className="text-gray-900 font-black text-xl mb-1">Where should we deliver?</h2>
            <p className="text-gray-400 text-sm">
              We'll save this as your default delivery address. You can change it any time from your profile.
            </p>
          </div>

          <div className="px-8 py-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <DField label="Delivery Address" name="address" value={form.address} onChange={onChange}
                placeholder="e.g. House No. 14, Mango Street" required />
            </div>
            <DField label="Nearest Landmark" name="landmark" value={form.landmark} onChange={onChange}
              placeholder="e.g. Near Shell Filling Station" />
            <DField label="City / Town" name="city" value={form.city} onChange={onChange}
              placeholder="e.g. Madina" required />
            <div>
              <label className="block text-gray-600 text-xs font-bold uppercase tracking-wider mb-1.5">
                Region <span className="text-red-400">*</span>
              </label>
              <select name="region" value={form.region} onChange={onChange}
                className="w-full bg-white border border-gray-200 focus:border-amber-400 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none transition-all">
                <option value="">— Select region —</option>
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <DField label="Preferred Delivery Date" name="preferred_date" type="date"
              value={form.preferred_date} onChange={onChange} />
            <div className="md:col-span-2">
              <DField label="Notes for Driver" name="notes" value={form.notes} as="textarea" onChange={onChange}
                placeholder="e.g. Call before arriving, available 9am–5pm" />
            </div>

            {error && (
              <div className="md:col-span-2 bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-2.5 rounded-xl font-medium">
                {error}
              </div>
            )}

            <div className="md:col-span-2 flex flex-col sm:flex-row gap-3">
              <button onClick={save} disabled={saving}
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-black text-sm py-4 rounded-2xl transition-all active:scale-95 disabled:opacity-60 shadow-sm">
                {saving ? 'Saving...' : 'Save Address & Finish →'}
              </button>
              <button onClick={onSkip}
                className="sm:w-auto px-6 py-4 text-gray-400 hover:text-gray-600 text-sm font-semibold transition-colors">
                Skip for now
              </button>
            </div>
            <p className="md:col-span-2 text-center text-gray-300 text-xs">
              You can add or update your delivery address from{' '}
              <button onClick={() => navigate('/profile/settings')}
                className="text-amber-500 hover:underline">
                your profile
              </button>{' '}at any time.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

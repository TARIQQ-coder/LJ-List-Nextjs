'use client'

import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from '@/lib/router'
import { applications as applicationsApi } from '../../api'
import { DeliveryCard } from '../checkout/DeliveryForm'
import { LogoMark } from '../../layout/LogoMark'
import { ApplicationSkeleton } from '../loading/LoadingSkeletons'
import { fmt } from '../../utils/format'

export const ApplicationDetailPage = ({ user, loading = false }: any) => {
  const navigate = useNavigate()
  const { applicationId } = useParams()
  const [application, setApplication] = useState<any>(null)
  const [loadedId, setLoadedId] = useState<string | null>(null)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    if (!applicationId) return

    let mounted = true

    applicationsApi.get(applicationId)
      .then(data => {
        if (!mounted) return
        setApplication(data)
        setLoadedId(applicationId)
        setMissing(false)
      })
      .catch(() => {
        if (!mounted) return
        setLoadedId(applicationId)
        setMissing(true)
      })

    return () => { mounted = false }
  }, [applicationId])

  if (loading && !user) {
    return <ApplicationSkeleton />
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />
  }

  const isLoading = Boolean(applicationId && loadedId !== applicationId)

  if (isLoading) {
    return <ApplicationSkeleton />
  }

  if (missing || !application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md w-full text-center">
          <LogoMark size={32} />
          <h1 className="mt-4 text-xl font-black text-gray-900">Application not found</h1>
          <p className="mt-2 text-sm text-gray-500">This application could not be loaded.</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => navigate('/profile/applications')}
              className="bg-gray-900 hover:bg-gray-800 text-white font-black text-sm px-5 py-3 rounded-xl"
            >
              Back to Applications
            </button>
            <Link to="/" className="text-sm font-semibold text-gray-600 hover:text-gray-900">Back to Store</Link>
          </div>
        </div>
      </div>
    )
  }

  const createdAt = application.created_at
    ? new Date(application.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—'

  return (
    <div className="min-h-screen bg-gray-50 overflow-y-auto">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate('/profile/applications')}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-sm font-semibold transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Applications
          </button>
          <div className="flex items-center gap-2">
            <LogoMark size={26} />
            <p className="font-black text-gray-900 text-sm">Application {application.id}</p>
          </div>
          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
            {
              pending: 'bg-amber-100 text-amber-700',
              reviewed: 'bg-purple-100 text-purple-700',
              approved: 'bg-green-100 text-green-700',
              declined: 'bg-red-100 text-red-700',
            }[application.status] || 'bg-gray-100 text-gray-600'
          }`}>{application.status}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider font-bold">Application ID</p>
              <p className="text-gray-900 font-black text-lg mt-1">{application.id}</p>
              <p className="text-gray-400 text-sm mt-1">Submitted on {createdAt}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 min-w-[280px]">
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-gray-400 text-[11px] uppercase tracking-wider font-bold">Total</p>
                <p className="text-gray-900 font-black text-base mt-1">{fmt(application.total_amount)}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-gray-400 text-[11px] uppercase tracking-wider font-bold">Monthly</p>
                <p className="text-gray-900 font-black text-base mt-1">{fmt(application.monthly_amount)}/mo</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Package Type', value: application.package_type },
            { label: 'Package Name', value: application.package_name || '—' },
            { label: 'Mandate Number', value: application.mandate_number || '—' },
            { label: 'Staff Number', value: application.staff_number || '—' },
            { label: 'Institution', value: application.institution || '—' },
            { label: 'Ghana Card Number', value: application.ghana_card_number || '—' },
          ].map(field => (
            <div key={field.label} className="bg-white rounded-2xl border border-gray-200 p-5">
              <p className="text-gray-400 text-[11px] uppercase tracking-wider font-bold">{field.label}</p>
              <p className="text-gray-900 font-semibold mt-2 break-words">{field.value}</p>
            </div>
          ))}
        </div>

        <DeliveryCard application={application} />

        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="text-gray-900 font-black text-sm mb-4">Cart Items</h2>
          {application.cart_items?.length > 0 ? (
            <div className="space-y-3">
              {application.cart_items.map((item: any) => (
                <div key={item.product_id} className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-gray-900 font-semibold truncate">{item.name}</p>
                    <p className="text-gray-400 text-xs mt-0.5">Qty {item.quantity}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-gray-900 font-black">{fmt(item.subtotal)}</p>
                    <p className="text-gray-400 text-xs">{fmt(item.price)} each</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No cart items recorded for this application.</p>
          )}
        </div>
      </div>
    </div>
  )
}

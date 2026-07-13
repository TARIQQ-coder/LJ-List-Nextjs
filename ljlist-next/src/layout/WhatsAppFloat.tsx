'use client'

import { useState, useEffect } from 'react'
import { useNavigate } from '@/lib/router'

const WA_NUMBER = '233593041474'
const WA_TEXT   = encodeURIComponent("Hello List J! I'm interested in the 3-month grocery plan.")
const WA_HREF   = `https://wa.me/${WA_NUMBER}?text=${WA_TEXT}`

const WaIcon = ({ size = 28 }: { size?: number }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} style={{ fill: 'white' }}>
    <path d="M16.001 2C8.268 2 2 8.268 2 16.001c0 2.49.653 4.83 1.794 6.85L2 30l7.335-1.763A13.942 13.942 0 0 0 16.001 30C23.732 30 30 23.732 30 16.001 30 8.268 23.732 2 16.001 2zm0 25.471a11.433 11.433 0 0 1-5.833-1.597l-.418-.248-4.332 1.042 1.075-4.217-.273-.433A11.432 11.432 0 0 1 4.53 16c0-6.33 5.142-11.471 11.471-11.471S27.471 9.67 27.471 16c0 6.33-5.142 11.471-11.47 11.471zm6.29-8.583c-.344-.172-2.036-1.004-2.352-1.118-.317-.115-.547-.172-.778.172-.23.344-.892 1.118-1.094 1.349-.201.23-.402.258-.747.086-.344-.172-1.452-.535-2.766-1.706-1.022-.912-1.713-2.038-1.913-2.382-.201-.344-.021-.53.151-.701.155-.154.344-.402.516-.603.172-.2.23-.344.344-.574.115-.23.058-.43-.029-.603-.086-.172-.778-1.878-1.066-2.571-.281-.675-.566-.584-.778-.595l-.663-.011c-.23 0-.603.086-.919.43-.316.344-1.208 1.18-1.208 2.878s1.237 3.337 1.409 3.567c.172.23 2.435 3.717 5.9 5.213.824.356 1.468.568 1.97.728.827.263 1.58.226 2.175.137.663-.099 2.036-.832 2.323-1.635.287-.804.287-1.492.201-1.635-.086-.143-.316-.23-.66-.402z"/>
  </svg>
)

export const WhatsAppFloat = ({ user }: { user?: any }) => {
  const navigate          = useNavigate()
  const [open, setOpen]   = useState(false)
  const [pulse, setPulse] = useState(true)
  const isLoggedIn        = !!user

  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 5000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-float-panel]')) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [open])

  const handleClick = () => {
    if (isLoggedIn) {
      navigate('/profile/messages')
    } else {
      setOpen(o => !o)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">

      {/* Sign-in / WhatsApp panel — only when NOT logged in */}
      {!isLoggedIn && open && (
        <div data-float-panel className="w-[300px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 flex items-center gap-3" style={{ backgroundColor: '#128C7E' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#25D366' }}>
              <WaIcon size={16} />
            </div>
            <div className="flex-1">
              <p className="text-white font-black text-sm">List "J" Support</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#25D366' }} />
                <p className="text-green-100 text-xs">We reply within a few hours</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-green-200 hover:text-white p-1 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div className="px-5 py-5 text-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: '#e9fbe9' }}>
              <WaIcon size={24} />
            </div>
            <p className="text-gray-900 font-black text-sm mb-1">Chat on WhatsApp</p>
            <p className="text-gray-400 text-xs mb-4 leading-relaxed">
              Send us a message about our grocery packages, pricing, or your application.
            </p>
            <a
              href={WA_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full text-white font-black text-sm py-2.5 rounded-xl transition-all active:scale-95 mb-3"
              style={{ backgroundColor: '#25D366' }}
            >
              <WaIcon size={16} />
              WhatsApp 0593041474
            </a>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-gray-300 text-xs">or</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
            <button
              onClick={() => { setOpen(false); navigate('/auth/login') }}
              className="w-full border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold text-sm py-2.5 rounded-xl transition-all cursor-pointer"
            >
              Sign In to message us
            </button>
          </div>
        </div>
      )}

      {/* Float button — WhatsApp green via inline style */}
      <button
        onClick={handleClick}
        className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer"
        style={{ backgroundColor: '#25D366' }}
        aria-label="WhatsApp"
      >
        {pulse && !open && (
          <span
            className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{ backgroundColor: '#25D366' }}
          />
        )}
        <WaIcon size={28} />
      </button>
    </div>
  )
}

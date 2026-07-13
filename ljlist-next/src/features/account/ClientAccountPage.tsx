'use client'

import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from '@/lib/router'
import { applications as applicationsApi, auth as authApi, conversations as convsApi, pollMessages, profile as profileApi } from '../../api'
import { LogoMark } from '../../layout/LogoMark'
import { ApplicationsSkeleton, MessagesSkeleton, ProfileSkeleton } from '../loading/LoadingSkeletons'
import { fmt } from '../../utils/format'

export const ClientAccountPage = ({ user, loading = false, section = 'overview', onLogout, onApply, onUserChange }: any) => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<any[]>([])
  const [ordersLoad, setOrdersLoad] = useState(false)
  const [conv, setConv] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [msgInput, setMsgInput] = useState('')
  const [msgLoading, setMsgLoading] = useState(false)
  const [convLoading, setConvLoading] = useState(false)
  const msgEnd = useRef<HTMLDivElement | null>(null)

  const [profileForm, setProfileForm] = useState({
    display_name: user?.display_name || user?.name || '',
    phone_number: user?.phone_number || user?.phone || '',
    staff_number: user?.staff_number || '',
    institution: user?.institution || '',
    ghana_card_number: user?.ghana_card_number || '',
    password: '',
  })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')
  const [profileErr, setProfileErr] = useState('')

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : 'Recently'

  useEffect(() => {
    if (!user) return
    setProfileForm({
      display_name: user.display_name || user.name || '',
      phone_number: user.phone_number || user.phone || '',
      staff_number: user.staff_number || '',
      institution: user.institution || '',
      ghana_card_number: user.ghana_card_number || '',
      password: '',
    })
  }, [user])

  useEffect(() => {
    if (!user) return
    setOrdersLoad(true)
    applicationsApi.list().then(data => {
      setOrders(data.applications || [])
    }).catch(() => {
      setOrders([])
    }).finally(() => setOrdersLoad(false))
  }, [user])

  useEffect(() => {
    if (section !== 'messages' || !user) return
    setConvLoading(true)
    convsApi.list({ limit: 1 }).then(async data => {
      const existing = (data.conversations || [])[0]
      if (existing) {
        setConv(existing)
        const msgData = await convsApi.messages(existing.id, { limit: 50 })
        setMessages(msgData.messages || [])
        setTimeout(() => msgEnd.current?.scrollIntoView({ behavior: 'smooth' }), 150)
      }
    }).catch(() => {
      setConv(null)
      setMessages([])
    }).finally(() => setConvLoading(false))
  }, [section, user])

  useEffect(() => {
    if (section !== 'messages' || !conv) return
    const stop = pollMessages(conv.id, (msgs) => {
      setMessages(msgs)
      setTimeout(() => msgEnd.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }, 60000)
    return stop
  }, [section, conv])

  const statusStyle = (s: string) => ({
    pending: 'bg-amber-100 text-amber-700',
    reviewed: 'bg-purple-100 text-purple-700',
    approved: 'bg-green-100 text-green-700',
    declined: 'bg-red-100 text-red-700',
  }[s] || 'bg-gray-100 text-gray-600')

  const doLogout = async () => {
    try {
      await authApi.logout()
    } catch {
      // fall through
    }
    onLogout?.()
    navigate('/', { replace: true })
  }

  const saveProfile = async (e: any) => {
    e.preventDefault()
    setProfileSaving(true)
    setProfileMsg('')
    setProfileErr('')
    try {
      const fields = Object.fromEntries(
        Object.entries(profileForm).filter(([, value]) => String(value || '').trim() !== '')
      )
      const data = await profileApi.update(fields)
      setProfileMsg('Profile updated successfully.')
      if (data.user) onUserChange?.(data.user)
    } catch (err: any) {
      const first = Object.values(err?.errors || {}).flat()[0]
      setProfileErr(first || err?.message || 'Could not update profile.')
    } finally {
      setProfileSaving(false)
    }
  }

  const sendMsg = async () => {
    if (!msgInput.trim() || msgLoading) return
    const text = msgInput.trim()
    setMsgInput('')
    setMsgLoading(true)
    try {
      if (!conv) {
        const data = await convsApi.start(text)
        const newConv = data.conversation || data
        setConv(newConv)
        const msgData = await convsApi.messages(newConv.id, { limit: 50 })
        setMessages(msgData.messages || [])
      } else {
        await convsApi.send(conv.id, text)
        const msgData = await convsApi.messages(conv.id, { limit: 50 })
        setMessages(msgData.messages || [])
      }
      setTimeout(() => msgEnd.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch {
      // keep input cleared; user can retry
    } finally {
      setMsgLoading(false)
    }
  }

  const unreadCount = messages.filter(m => m.sender_id !== user?.id && !m.read_at).length

  if (loading && !user) {
    return <ProfileSkeleton />
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md w-full text-center">
          <LogoMark size={32} />
          <h1 className="mt-4 text-xl font-black text-gray-900">Sign in required</h1>
          <p className="mt-2 text-sm text-gray-500">You need an account to view your profile and applications.</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link to="/auth/login" className="bg-gray-900 hover:bg-gray-800 text-white font-black text-sm px-5 py-3 rounded-xl">Sign In</Link>
            <Link to="/" className="text-sm font-semibold text-gray-600 hover:text-gray-900">Back to Store</Link>
          </div>
        </div>
      </div>
    )
  }

  const displayName = user.display_name || user.name || 'User'

  return (
    <div className="min-h-screen bg-gray-50 overflow-y-auto">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-sm font-semibold transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Store
          </Link>
          <div className="flex items-center gap-2">
            <LogoMark size={26} />
            <p className="font-black text-gray-900 text-sm">My Account</p>
          </div>
          <button onClick={doLogout} className="text-xs font-semibold text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors">
            Sign Out
          </button>
        </div>
        <div className="border-t border-gray-100">
          <div className="max-w-5xl mx-auto px-4 flex gap-2 py-2 overflow-x-auto">
            <Link to="/profile" className={`px-4 py-2 text-xs font-bold rounded-full border transition-colors ${section === 'overview' ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-white border-gray-200 text-gray-500 hover:text-gray-800'}`}>Overview</Link>
            <Link to="/profile/applications" className={`px-4 py-2 text-xs font-bold rounded-full border transition-colors ${section === 'applications' ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-white border-gray-200 text-gray-500 hover:text-gray-800'}`}>Applications</Link>
            <Link to="/profile/messages" className={`px-4 py-2 text-xs font-bold rounded-full border transition-colors ${section === 'messages' ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-white border-gray-200 text-gray-500 hover:text-gray-800'}`}>Messages{unreadCount > 0 ? ` (${unreadCount})` : ''}</Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-amber-400 flex items-center justify-center text-gray-900 font-black text-xl flex-shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-900 font-black text-lg">{displayName}</p>
            <p className="text-gray-400 text-sm">{user.phone_number}</p>
            {user.staff_number && <p className="text-gray-400 text-xs mt-0.5">Staff No: {user.staff_number}</p>}
            {user.institution && <p className="text-gray-400 text-xs">{user.institution}</p>}
            <p className="text-gray-300 text-xs mt-0.5">Member since {memberSince}</p>
          </div>
          <button onClick={() => onApply?.()} className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-black text-xs px-4 py-2.5 rounded-xl transition-colors flex-shrink-0">
            Apply Now
          </button>
        </div>

        {section === 'overview' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Orders', value: ordersLoad ? '...' : String(orders.length) },
                { label: 'Active Plans', value: ordersLoad ? '...' : String(orders.filter(o => o.status === 'approved').length) },
                { label: 'Pending Review', value: ordersLoad ? '...' : String(orders.filter(o => o.status === 'pending' || o.status === 'reviewed').length) },
                { label: 'Member Status', value: 'Active' },
              ].map((s) => (
                <button key={s.label} onClick={() => navigate('/profile/applications')} className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
                  <p className="text-gray-900 font-black text-2xl">{s.value}</p>
                  <p className="text-gray-400 text-xs mt-1">{s.label}</p>
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-gray-900 font-black text-sm mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Apply for Package', action: () => onApply?.(), icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /> },
                  { label: 'My Applications', action: () => navigate('/profile/applications'), icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /> },
                  { label: 'Messages', action: () => navigate('/profile/messages'), icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /> },
                ].map(a => (
                  <button key={a.label} onClick={a.action} className="flex items-center gap-3 bg-gray-50 hover:bg-amber-50 border border-gray-200 hover:border-amber-200 rounded-xl px-4 py-3.5 transition-all group text-left">
                    <div className="w-8 h-8 bg-white group-hover:bg-amber-100 border border-gray-200 group-hover:border-amber-200 rounded-lg flex items-center justify-center flex-shrink-0 transition-all">
                      <svg className="w-4 h-4 text-gray-500 group-hover:text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">{a.icon}</svg>
                    </div>
                    <span className="text-xs font-semibold text-gray-600 group-hover:text-amber-700 leading-tight">{a.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={saveProfile} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 max-w-xl">
              <h2 className="text-gray-900 font-black text-sm">Profile Details</h2>
              {[
                { label: 'Full Name', name: 'display_name', type: 'text' },
                { label: 'Phone', name: 'phone_number', type: 'tel' },
                { label: 'Staff Number', name: 'staff_number', type: 'text' },
                { label: 'Institution', name: 'institution', type: 'text' },
                { label: 'Ghana Card', name: 'ghana_card_number', type: 'text' },
                { label: 'New Password', name: 'password', type: 'password' },
              ].map(field => (
                <div key={field.name}>
                  <label className="block text-gray-500 text-xs uppercase tracking-wider font-bold mb-1.5">{field.label}</label>
                  <input
                    type={field.type}
                    value={(profileForm as any)[field.name]}
                    onChange={e => setProfileForm(f => ({ ...f, [field.name]: e.target.value }))}
                    placeholder={field.name === 'password' ? 'Leave blank to keep current password' : ''}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-amber-400 focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  />
                </div>
              ))}
              {profileMsg && <p className="text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-xs font-bold">{profileMsg}</p>}
              {profileErr && <p className="text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs font-bold">{profileErr}</p>}
              <button type="submit" disabled={profileSaving} className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white font-black text-sm py-3 rounded-xl transition-colors">
                {profileSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>
        )}

        {section === 'applications' && (
          <div className="space-y-4">
            {ordersLoad ? (
              <ApplicationsSkeleton />
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
                <p className="text-gray-700 font-black text-base mb-2">No applications yet</p>
                <p className="text-gray-400 text-sm mb-5">Submit a package application to see it here.</p>
                <button onClick={() => onApply?.()} className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-black text-sm px-8 py-3 rounded-xl transition-colors active:scale-95">
                  Apply for a Package
                </button>
              </div>
            ) : (
              orders.map((o) => (
                <div key={o.id} className="bg-white rounded-2xl border border-gray-200 p-5">
                  <div className="flex items-start justify-between mb-3 gap-3">
                    <div>
                      <p className="text-gray-900 font-black">{o.package_name || o.package_type}</p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {new Date(o.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${statusStyle(o.status)}`}>{o.status}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 border-t border-gray-100 pt-3 flex-wrap gap-2">
                    <span>Total: <span className="font-black text-gray-900">{fmt(o.total_amount)}</span></span>
                    <span>Monthly: <span className="font-black text-gray-900">{fmt(o.monthly_amount)}/mo</span></span>
                    <span>Type: <span className="font-black text-gray-900 capitalize">{o.package_type}</span></span>
                  </div>
                  <button
                    onClick={() => navigate(`/profile/application/${o.id}`)}
                    className="mt-4 text-xs font-bold text-amber-700 hover:text-amber-800 border border-amber-200 hover:border-amber-300 rounded-lg px-3 py-2 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {section === 'messages' && (
          convLoading ? (
            <MessagesSkeleton />
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <LogoMark size={22} />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 font-black text-sm">List "J" Support</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    <p className="text-gray-400 text-xs">We reply within a few hours</p>
                  </div>
                </div>
              </div>

              <div className="h-80 overflow-y-auto px-5 py-5 space-y-3 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <p className="text-gray-500 text-sm font-semibold mb-1">No messages yet</p>
                    <p className="text-gray-400 text-xs">Send us a message about your application.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isSupport = msg.sender_id !== user.id
                    const time = new Date(msg.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                    const date = new Date(msg.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                    return (
                      <div key={msg.id} className={`flex ${isSupport ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[72%] flex flex-col gap-1 ${isSupport ? 'items-start' : 'items-end'}`}>
                          {isSupport && <p className="text-gray-400 text-[10px] px-1">List "J" Support</p>}
                          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isSupport ? 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm' : 'bg-gray-900 text-white rounded-tr-sm'}`}>
                            {msg.content}
                          </div>
                          <p className="text-gray-300 text-[10px] px-1">{date} · {time}</p>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={msgEnd} />
              </div>

              <div className="px-5 py-4 border-t border-gray-100 flex gap-3 items-end">
                <textarea
                  value={msgInput}
                  onChange={e => setMsgInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg() } }}
                  placeholder="Type your message... (Enter to send)"
                  rows={2}
                  className="flex-1 bg-gray-50 border border-gray-200 focus:border-amber-400 focus:bg-white text-gray-800 placeholder-gray-400 rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none"
                />
                <button onClick={sendMsg} disabled={!msgInput.trim() || msgLoading} className="w-11 h-11 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 text-white disabled:text-gray-400 rounded-xl flex items-center justify-center transition-all flex-shrink-0 active:scale-95">
                  {msgLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '→'}
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}

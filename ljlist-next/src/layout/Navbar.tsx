'use client'

import { useState } from 'react'
import { LogoMark } from './LogoMark'

export const Navbar = ({ cartCount, onCartOpen, onApply, onDeptClick, onSearch, onAccountClick, user, categories = [] }: any) => {
  const [search, setSearch]             = useState('')
  const [appliancesOpen, setAppliancesOpen] = useState(false)

  const handleSearch = (val) => {
    setSearch(val)
    if (onSearch) onSearch(val.trim().toLowerCase())
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && onSearch) onSearch(search.trim().toLowerCase())
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-gray-900 text-amber-400 py-2.5 text-center tracking-widest font-black text-sm uppercase">
        🛒 Buy Groceries in Bulk and Pay Within 3 Months
      </div>

      {/* Main nav */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <LogoMark size={38} />
          <div className="hidden sm:block leading-tight">
            <p className="font-black text-gray-900 text-base leading-none">List <span className="text-amber-500">"J"</span></p>
            <p className="text-gray-400 text-[10px] font-semibold tracking-widest uppercase">Grocery Shop</p>
          </div>
        </div>

        <div className="flex-1 relative max-w-xl">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input value={search} onChange={e => handleSearch(e.target.value)} onKeyDown={handleKey}
            placeholder="Search rice, oil, sardines, chicken..."
            className="w-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-amber-400 rounded-xl pl-10 pr-10 py-2.5 text-sm outline-none transition-all" />
          {search && (
            <button onClick={() => handleSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-lg leading-none">×</button>
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Account icon — GH Basket style */}
          <button onClick={onAccountClick}
            className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-gray-800 transition-colors relative">
            {user ? (
              <>
                <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-gray-900 font-black text-xs">
                  {(user.display_name || user.name)?.charAt(0).toUpperCase()}
                </div>
                <span className="text-[10px] font-semibold max-w-[52px] truncate">{(user.display_name || user.name)?.split(' ')[0]}</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                <span className="text-[10px]">Sign In</span>
              </>
            )}
          </button>

          {/* Cart */}
          <button onClick={onCartOpen} className="relative flex flex-col items-center gap-0.5 text-gray-500 hover:text-gray-800 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <span className="text-[10px]">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>
            )}
          </button>

          <button onClick={onApply}
            className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-black text-xs px-4 py-2.5 rounded-xl transition-colors shadow-sm uppercase tracking-wider">
            Apply Now
          </button>
        </div>
      </div>

      {/* Category tabs */}
      <div className="border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
          <div className="flex items-stretch gap-2 py-2 min-w-max">
            <button
              onClick={() => onDeptClick && onDeptClick('all')}
              className="shrink-0 flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-100 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span>All</span>
            </button>
            <button
              onClick={() => onDeptClick && onDeptClick('packages')}
              className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100 transition-colors"
            >
              Packages
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => onDeptClick && onDeptClick(cat.id)}
                className="shrink-0 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:border-gray-300 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                {cat.label}
              </button>
            ))}
            {/* Kitchen Appliances — hardcoded, opens image lightbox */}
            <button
              onClick={() => setAppliancesOpen(true)}
              className="shrink-0 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-bold text-orange-700 hover:bg-orange-100 transition-colors"
            >
              Kitchen Appliances
            </button>
          </div>
        </div>
      </div>

      {/* Kitchen Appliances lightbox */}
      {appliancesOpen && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
          onClick={() => setAppliancesOpen(false)}
        >
          <button
            onClick={e => { e.stopPropagation(); setAppliancesOpen(false) }}
            className="absolute top-4 right-4 w-11 h-11 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
            style={{ zIndex: 10000 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
          <img
            src="/images/Kitchen-Appliances.jpeg"
            alt="Kitchen Appliances"
            onClick={e => e.stopPropagation()}
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
          />
          <p className="absolute bottom-4 left-0 right-0 text-center text-white/40 text-xs">
            Click outside image to close
          </p>
        </div>
      )}
    </header>
  )
}

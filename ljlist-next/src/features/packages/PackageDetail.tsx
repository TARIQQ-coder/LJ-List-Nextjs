'use client'

import { useEffect } from 'react'
import { packageOptionFor } from '../../utils/catalog'

export const PackageDetail = ({ pkg, onBack, onApply, idx, packageOptions = [], allProducts = [] }: any) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const totalItems = pkg.items.reduce((s, i) => s + i.qty, 0)

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 overflow-y-auto">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack}
            className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 text-sm font-semibold transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
            Back
          </button>
          <span className="text-gray-300">|</span>
          <nav className="flex items-center gap-1.5 text-xs text-gray-400">
            <button onClick={onBack} className="hover:text-gray-700 transition-colors">Home</button>
            <span>/</span>
            <button onClick={onBack} className="hover:text-gray-700 transition-colors">Packages</button>
            <span>/</span>
            <span className="text-gray-800 font-medium">{pkg.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full ${pkg.popular ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                {pkg.tag}
              </span>
              {pkg.popular && (
                <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full bg-amber-400 text-gray-900">
                  Most Popular
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-1">{pkg.name}</h1>
            <p className="text-gray-500 text-sm">{pkg.tagline}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-3xl font-black text-gray-900">{pkg.price}</p>
            <p className="text-gray-400 text-sm mt-0.5">≈ {pkg.monthly} over 3 months</p>
            <p className="text-gray-400 text-xs mt-0.5">{totalItems} items included</p>
          </div>
        </div>

        {/* 3-month callout */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex items-center gap-4">
          <span className="text-2xl flex-shrink-0">📅</span>
          <div>
            <p className="text-amber-800 font-black text-sm">Pay comfortably over 3 months</p>
            <p className="text-amber-700 text-xs mt-0.5">
              No interest · Open to all Ghana govt workers · Ghana Card & Mandate Number required
            </p>
          </div>
        </div>

        {/* Rice options callout */}
        {pkg.riceOptions && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-4">
            <span className="text-2xl flex-shrink-0">🌾</span>
            <div>
              <p className="text-green-800 font-black text-sm">Rice Options</p>
              <p className="text-green-700 text-xs mt-0.5 font-semibold">{pkg.riceOptions}</p>
              <p className="text-green-600 text-xs mt-0.5">WhatsApp us your preferred brand after applying.</p>
            </div>
          </div>
        )}

        {/* Items list */}
        {pkg.id === 'custom' ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center mb-6">
            <p className="text-4xl mb-4">📞</p>
            <h2 className="text-gray-800 font-black text-lg mb-2">Customized Request</h2>
            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-5">
              Tell us exactly what you need and we'll build a custom package tailored to your household.
            </p>
            <a href="https://wa.me/233244854206"
              className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm">
              💬 WhatsApp 0244854206
            </a>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <div className="col-span-1">#</div>
              <div className="col-span-2">Image</div>
              <div className="col-span-6">Item</div>
              <div className="col-span-1 text-center">Qty</div>
              <div className="col-span-2 text-right">Unit</div>
            </div>

            {/* Items rows */}
            {pkg.items.map((item, i) => (
              <div key={i}
                className={`grid grid-cols-12 gap-3 items-center px-5 py-4 border-b border-gray-50 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                {/* Row number */}
                <div className="col-span-1 text-gray-300 text-sm font-bold">{String(i + 1).padStart(2, '0')}</div>

                {/* Product image / emoji */}
                <div className="col-span-2">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border border-gray-200">
                    {item.img
                      ? <img src={item.img} alt={item.label} className="w-full h-full object-contain p-1.5" />
                      : <span className="text-2xl">{item.emoji}</span>
                    }
                  </div>
                </div>

                {/* Item name */}
                <div className="col-span-6">
                  <p className="text-gray-800 text-sm font-semibold">{item.label}</p>
                  {item.qty > 1 && (
                    <p className="text-amber-600 text-xs font-bold mt-0.5">× {item.qty} units</p>
                  )}
                </div>

                {/* Qty badge */}
                <div className="col-span-1 flex justify-center">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${item.qty > 1 ? 'bg-amber-400 text-gray-900' : 'bg-gray-100 text-gray-600'}`}>
                    {item.qty}
                  </span>
                </div>

                {/* Unit type from the loaded product catalog */}
                <div className="col-span-2 text-right">
                  {(() => {
                    const p = allProducts.find(pr => pr.id === item.productId || pr.legacyId === item.productId || pr.id === String(item.productId))
                    return <span className="text-gray-400 text-xs uppercase tracking-wider">{p?.unit || '—'}</span>
                  })()}
                </div>
              </div>
            ))}

            {/* Total row */}
            <div className="grid grid-cols-12 gap-3 items-center px-5 py-4 bg-gray-800 text-white">
              <div className="col-span-9 font-black text-sm">Total Items in Package</div>
              <div className="col-span-1 flex justify-center">
                <span className="w-7 h-7 rounded-full bg-amber-400 text-gray-900 flex items-center justify-center text-xs font-black">{totalItems}</span>
              </div>
              <div className="col-span-2 text-right font-black text-sm">{pkg.price}</div>
            </div>
          </div>
        )}

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => { onApply(pkg.id === 'custom' ? packageOptions[packageOptions.length - 1] : packageOptions[idx] || packageOptionFor(pkg)); onBack() }}
            className={`flex-1 py-4 rounded-2xl font-black text-base transition-all active:scale-95 shadow-sm ${pkg.popular ? 'bg-amber-400 hover:bg-amber-500 text-gray-900' : 'bg-gray-800 hover:bg-gray-900 text-white'}`}>
            {pkg.id === 'custom' ? '💬 WhatsApp Us to Customise' : 'Select This Package & Apply →'}
          </button>
          <button onClick={onBack}
            className="sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all">
            View Other Packages
          </button>
        </div>
      </div>
    </div>
  )
}

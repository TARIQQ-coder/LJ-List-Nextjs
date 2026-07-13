'use client'

import { useState } from 'react'
export const DeptPackageSection = ({ packages, accentColor = 'amber', onApply }: any) => {
  const [viewing, setViewing] = useState(null)

  const accent = {
    amber: { top: 'bg-amber-400', tag: 'bg-amber-100 text-amber-700', price: 'text-gray-900', btn: 'bg-amber-400 hover:bg-amber-500 text-gray-900', border: 'border-gray-200', viewBtn: 'border border-gray-300 text-gray-700 hover:bg-gray-50' },
    blue:  { top: 'bg-blue-500',  tag: 'bg-blue-100 text-blue-700',   price: 'text-gray-900', btn: 'bg-blue-600 hover:bg-blue-700 text-white',       border: 'border-gray-200', viewBtn: 'border border-gray-300 text-gray-700 hover:bg-gray-50' },
  }[accentColor] || {}

  return (
    <>
      {/* Package cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {packages.map((pkg, idx) => (
          <div key={pkg.id} className={`relative rounded-2xl border overflow-hidden hover:-translate-y-0.5 transition-all duration-200 ${accent.border}`}>
            <div className={`h-1 w-full ${accent.top}`} />
            <div className="p-5 bg-white">
              <span className={`inline-block text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full mb-3 ${accent.tag}`}>
                Package {idx + 1}
              </span>
              <h3 className="text-gray-900 font-black text-base mb-1">{pkg.name}</h3>
              {pkg.price
                ? <p className={`font-black text-xl mb-0.5 ${accent.price}`}>GH₵{pkg.price}</p>
                : <p className="text-gray-400 text-sm mb-0.5 italic">Price on request</p>
              }
              {pkg.price && <p className="text-gray-400 text-xs mb-4">≈ GH₵{Math.ceil(pkg.price / 3)}/mo over 3 months</p>}

              {/* Item dot previews */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {pkg.items.split(' · ').slice(0, 4).map((item, i) => (
                  <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{item.split('(')[0].trim()}</span>
                ))}
                {pkg.items.split(' · ').length > 4 && (
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-full">+{pkg.items.split(' · ').length - 4} more</span>
                )}
              </div>

              <div className="flex gap-2">
                <button onClick={() => setViewing(pkg)}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${accent.viewBtn}`}>
                  View Items
                </button>
                <button onClick={() => onApply && onApply(pkg.name + (pkg.price ? ` (GHC${pkg.price})` : ''))}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${accent.btn}`}>
                  Apply →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View Items modal overlay */}
      {viewing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setViewing(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className={`h-1.5 w-full ${accent.top}`} />
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className={`inline-block text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full mb-2 ${accent.tag}`}>Package Details</span>
                  <h2 className="text-gray-900 font-black text-xl">{viewing.name}</h2>
                  {viewing.price && <p className="text-gray-500 text-sm mt-0.5">GH₵{viewing.price} · ≈ GH₵{Math.ceil(viewing.price / 3)}/mo</p>}
                </div>
                <button onClick={() => setViewing(null)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none mt-1">×</button>
              </div>
              <ul className="space-y-2 mb-6">
                {viewing.items.split(' · ').map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${accent.top}`} />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <button onClick={() => setViewing(null)}
                  className="flex-1 py-3 rounded-xl font-bold text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all">
                  Close
                </button>
                <button onClick={() => { if (onApply) onApply(viewing.name + (viewing.price ? ` (GHC${viewing.price})` : '')); setViewing(null) }}
                  className={`flex-1 py-3 rounded-xl font-black text-sm transition-all active:scale-95 ${accent.btn}`}>
                  Apply for this →
                </button>
              </div>
              <p className="text-center text-gray-400 text-xs mt-3">
                Requirements: Ghana Card & Mandate Number
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── ROTATING PRODUCT SHOWCASE ────────────────────────────────────────────────
// Picks 3 products from each category, rotates through them every 4s.
// Clicking "Browse all" or a category pill opens the full cart drawer flow.

'use client'

import { useState } from 'react'
import { disc, fmt } from '../../utils/format'

// Inquiry WhatsApp link — built from product name
const inquiryHref = (name: string) =>
  `https://wa.me/233244854206?text=Hello%20List%20J!%20I'd%20like%20to%20enquire%20about%20${encodeURIComponent(name)}.`

export const ProductCard = ({ product, qty, onAdd, onRemove, onView }: any) => {
  const [added, setAdded] = useState(false)

  // ── Display rules — driven by API fields ──────────────────────────────────
  const requiresInquiry = product.requires_inquiry === true
  const isOrderable     = product.orderable !== false        // default true
  const hasPrice        = product.price !== null && product.price !== undefined && product.price > 0
  const showPrice       = hasPrice && !requiresInquiry
  const pct             = showPrice && product.oldPrice && product.oldPrice > product.price
                          ? disc(product.price, product.oldPrice) : 0

  // Tag styling — driven by display_tag from API
  const tag = product.tag || product.display_tag
  const tagStyle = (() => {
    if (!tag) return ''
    const t = tag.toLowerCase()
    if (t === 'seasonal')  return 'border-lime-300 text-lime-700'
    if (t === 'premium')   return 'border-purple-200 text-purple-700'
    if (t === 'new')       return 'border-blue-200 text-blue-700'
    return 'border-gray-200 text-gray-600'
  })()

  const handleAdd = (e: any) => {
    e.stopPropagation()
    onAdd()
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  const handleRemove = (e: any) => {
    e.stopPropagation()
    onRemove()
  }

  return (
    <div
      onClick={() => onView && onView(product)}
      className="bg-white rounded-xl border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all duration-200 group flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Image */}
      <div className="relative bg-gray-50 flex items-center justify-center border-b border-gray-100 overflow-hidden" style={{ height: '130px' }}>
        {product.img
          ? <img src={product.img} alt={product.name} className="w-full h-full object-contain p-2.5 group-hover:scale-105 transition-transform duration-300" />
          : <span className="text-5xl group-hover:scale-110 transition-transform duration-200 select-none">{product.emoji || '📦'}</span>
        }
        {/* Discount badge */}
        {pct > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none">-{pct}%</span>
        )}
        {/* Display tag from API */}
        {tag && (
          <span className={`absolute bottom-2 right-2 bg-white border text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none ${tagStyle}`}>
            {tag}
          </span>
        )}
        {/* Cart qty badge */}
        {qty > 0 && (
          <span className="absolute top-2 right-2 bg-amber-400 text-gray-900 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow">{qty}</span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <p className="text-gray-800 text-xs font-semibold line-clamp-2 leading-snug mb-1">{product.name}</p>
        <p className="text-gray-500 text-[11px] font-medium uppercase tracking-wide mb-auto">{product.unit}</p>

        {/* Price */}
        {showPrice ? (
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-gray-900 font-black text-sm">{fmt(product.price)}</span>
            {pct > 0 && (
              <span className="text-gray-300 text-[10px] line-through">{fmt(product.oldPrice)}</span>
            )}
          </div>
        ) : (
          <p className="text-lime-700 font-black text-xs mt-2">Price on Request</p>
        )}

        {/* CTA button */}
        {requiresInquiry || !isOrderable ? (
          /* Inquiry — WhatsApp */
          <a
            href={inquiryHref(product.name)}
            target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="mt-2 w-full py-1.5 rounded-lg text-xs font-bold bg-lime-100 hover:bg-lime-200 text-lime-800 text-center transition-all active:scale-95 block"
          >
            Enquire
          </a>
        ) : qty === 0 ? (
          <button onClick={handleAdd}
            className={`mt-2 w-full py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${added ? 'bg-gray-800 text-white' : 'bg-amber-400 hover:bg-amber-500 text-gray-900'}`}>
            {added ? '✓ Added' : '+ Add'}
          </button>
        ) : (
          <div className="mt-2 flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button onClick={handleRemove} className="flex-1 h-7 bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-500 font-black text-base active:scale-90 transition-all">−</button>
            <span className="w-8 text-center font-black text-sm text-gray-800 border-x border-gray-200">{qty}</span>
            <button onClick={handleAdd} className="flex-1 h-7 bg-gray-50 hover:bg-amber-50 text-gray-500 hover:text-amber-600 font-black text-base active:scale-90 transition-all">+</button>
          </div>
        )}

        {/* Instructions hint — shown below CTA if present */}
        {product.instructions && (
          <p className="mt-1.5 text-[10px] text-gray-400 leading-snug line-clamp-2">{product.instructions}</p>
        )}
      </div>
    </div>
  )
}

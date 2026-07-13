'use client'

import { useEffect, useState } from 'react'
import { Navbar } from '../../layout/Navbar'
import { ProductCard } from './ProductCard'
import { fmt } from '../../utils/format'

export const ProductDetail = ({ product, onAdd, onBack, onViewProduct, cartCount, onCartOpen, onDeptClick, user, onAccountClick, categories = [], allProducts = [] }: any) => {
  const [localQty, setLocalQty] = useState(1)
  const [added, setAdded] = useState(false)
  const cat = categories.find(c => c.id === product.cat)
  const related = allProducts.filter(p => p.cat === product.cat && p.id !== product.id).slice(0, 6)

  const requiresInquiry = product.requires_inquiry === true
  const isOrderable     = product.orderable !== false
  const hasPrice        = product.price !== null && product.price !== undefined && product.price > 0
  const showPrice       = hasPrice && !requiresInquiry
  const inquiryHref     = `https://wa.me/233244854206?text=Hello%20List%20J!%20I'd%20like%20to%20enquire%20about%20${encodeURIComponent(product.name)}.`

  const handleAddToCart = () => {
    for (let i = 0; i < localQty; i++) onAdd()
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 overflow-y-auto">
      {/* Full Navbar — so cart count stays visible */}
      <Navbar
        cartCount={cartCount}
        onCartOpen={onCartOpen}
        onApply={onBack}
        user={user}
        onAccountClick={onAccountClick}
        onDeptClick={(catId) => { onBack(); setTimeout(() => onDeptClick(catId), 100) }}
      />

      {/* Breadcrumb bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-3">
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
            <button
              onClick={() => { onBack(); setTimeout(() => onDeptClick(product.cat), 150) }}
              className="text-amber-600 hover:text-amber-700 hover:underline font-semibold transition-colors">
              {cat?.label}
            </button>
            <span>/</span>
            <span className="text-gray-800 font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Main product section */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8">
          <div className="flex flex-col md:flex-row">

            {/* LEFT — product image */}
            <div className="w-full md:w-[420px] flex-shrink-0 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-100 flex items-center justify-center p-10" style={{ minHeight: '380px' }}>
              {product.img
                ? <img src={product.img} alt={product.name} className="max-h-72 w-full object-contain drop-shadow-sm" />
                : <span className="text-[120px] select-none leading-none">{product.emoji}</span>
              }
            </div>

            {/* RIGHT — product info */}
            <div className="flex-1 p-8 flex flex-col">
              {/* Category badge */}
              <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full mb-3 w-fit">
                {cat?.label}
              </span>

              {/* Name */}
              <h1 className="text-2xl font-black text-gray-900 leading-tight mb-2">{product.name}</h1>

              {/* Description */}
              {product.description && (
                <p className="text-gray-500 text-sm leading-relaxed mb-3">{product.description}</p>
              )}

              {/* Instructions banner */}
              {product.instructions && (
                <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-3">
                  <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p className="text-amber-800 text-xs leading-relaxed">{product.instructions}</p>
                </div>
              )}

              {/* Rating placeholder */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <svg key={s} className={`w-4 h-4 ${s <= 4 ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
                <span className="text-gray-400 text-xs">(Available in stock)</span>
              </div>

              {/* Price block */}
              <div className="flex items-baseline gap-3 mb-1">
                {showPrice
                  ? <span className="text-3xl font-black text-gray-900">{fmt(product.price)}</span>
                  : <span className="text-2xl font-black text-lime-700">Price on Request</span>
                }
              </div>
              <p className="text-gray-400 text-xs mb-6">Per <span className="font-semibold text-gray-600">{product.unit}</span></p>

              {/* Quantity + Add to cart */}
              <div className="flex items-center gap-3 mb-4">
                {requiresInquiry || !isOrderable ? (
                  <a href={inquiryHref}
                    target="_blank" rel="noopener noreferrer"
                    className="flex-1 h-11 rounded-xl font-black text-sm bg-lime-100 hover:bg-lime-200 text-lime-800 transition-all active:scale-95 flex items-center justify-center gap-2">
                    {requiresInquiry ? 'Enquire via WhatsApp' : 'Contact Us to Order'}
                  </a>
                ) : !added ? (
                  <>
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setLocalQty(q => Math.max(1, q - 1))}
                        className="w-10 h-11 bg-gray-50 hover:bg-gray-100 text-gray-600 font-black text-lg flex items-center justify-center transition-colors">
                        −
                      </button>
                      <span className="w-12 text-center font-black text-base text-gray-800 border-x border-gray-200 h-11 flex items-center justify-center">
                        {localQty}
                      </span>
                      <button
                        onClick={() => setLocalQty(q => q + 1)}
                        className="w-10 h-11 bg-gray-50 hover:bg-gray-100 text-gray-600 font-black text-lg flex items-center justify-center transition-colors">
                        +
                      </button>
                    </div>
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 h-11 rounded-xl font-black text-sm bg-amber-400 hover:bg-amber-500 text-gray-900 transition-all active:scale-95">
                      Add {localQty > 1 ? `(${localQty}) ` : ''}to Cart
                    </button>
                  </>
                ) : (
                  <button
                    onClick={onCartOpen}
                    className="w-full h-11 rounded-xl font-black text-sm bg-gray-800 hover:bg-gray-900 text-white transition-all active:scale-95 flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                    View Cart
                  </button>
                )}
              </div>

              {/* Product meta */}
              <div className="border-t border-gray-100 pt-5 space-y-2.5">
                {[
                  { label: 'Category',    value: cat?.label },
                  { label: 'Unit',        value: product.unit },
                  { label: 'SKU',         value: `LJ-${String(product.id).padStart(4,'0')}` },
                  { label: 'Availability',value: 'In Stock' },
                  { label: 'Payment',     value: '3-Month Hire Purchase Plan' },
                ].map(row => (
                  <div key={row.label} className="flex gap-3 text-sm">
                    <span className="text-gray-400 w-24 flex-shrink-0">{row.label}:</span>
                    <span className="text-gray-700 font-medium">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <span className="w-1 h-5 bg-amber-400 rounded-full inline-block" />
              <h2 className="text-base font-black text-gray-800">More from {cat?.label}</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {related.map(p => (
                <ProductCard key={p.id} product={p}
                  qty={0}
                  onAdd={() => {}}
                  onRemove={() => {}}
                  onView={() => onViewProduct(p)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

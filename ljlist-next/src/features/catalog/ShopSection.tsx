'use client'

import { useEffect, useState } from 'react'
import { DeptPackageSection } from '../packages/DeptPackageSection'
import { ProductCard } from './ProductCard'
import { Pulse } from '../loading/LoadingSkeletons'
import { fmt } from '../../utils/format'

export const SHOWCASE_SIZE = 9   // 3 columns × 3 rows visible at once
const ROTATE_MS    = 4000 // ms between rotations

export const ShopSection = ({ cart, onAdd, onRemove, onCartOpen, cartTotal, cartCount, onView, defaultCat, onApply, products: allProducts = [], productsLoading = false, categories = [], minOrder = 0, provisionPackages = [], detergentPackages = [] }: any) => {
  const [offset, setOffset]       = useState(0)
  const [visible, setVisible]     = useState(true)
  const [activeCat, setActiveCat] = useState(defaultCat || 'all')
  const [appliancesOpen, setAppliancesOpen] = useState(false)
  const pct = minOrder > 0 ? Math.min(100, Math.round((cartTotal / minOrder) * 100)) : 0

  // Build showcase pool from live products — 3 per category
  const showcasePool = (() => {
    const pool = []
    categories.forEach(cat => {
      allProducts.filter(p => p.cat === cat.id).slice(0, 3).forEach(p => pool.push(p))
    })
    return pool
  })()

  // Sync when parent changes department via navbar
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (defaultCat) { setActiveCat(defaultCat); setOffset(0); setVisible(true) }
  }, [defaultCat])

  // Filter pool by active category
  const pool = activeCat === 'all'
    ? showcasePool
    : allProducts.filter(p => p.cat === activeCat)

  const total = pool.length
  // Clamp offset when pool shrinks
  const safeOffset = total <= SHOWCASE_SIZE ? 0 : offset % total

  // Auto-rotate — ONLY when showing "All" categories
  useEffect(() => {
    if (activeCat !== 'all') return
    if (total <= SHOWCASE_SIZE) return
    const id = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setOffset(o => (o + SHOWCASE_SIZE) % total)
        setVisible(true)
      }, 350)
    }, ROTATE_MS)
    return () => clearInterval(id)
  }, [total, activeCat])

  // Reset offset when category changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOffset(0); setVisible(true)
  }, [activeCat])

  // Slice window of products to show
  const shown = total === 0 ? [] : Array.from({ length: Math.min(SHOWCASE_SIZE, total) }, (_, i) =>
    pool[(safeOffset + i) % total]
  )

  // Dot indicators — one per page
  const pages = total <= SHOWCASE_SIZE ? 1 : Math.ceil(total / SHOWCASE_SIZE)
  const currentPage = Math.floor(safeOffset / SHOWCASE_SIZE)

  return (
    <>
    <section id="shop" className="bg-white py-10 px-4 border-b border-gray-100">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-1 gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="w-1 h-5 bg-amber-400 rounded-full inline-block" />
              <h2 className="text-base font-black text-gray-800">Build Your Own Package</h2>
            </div>
            <p className="text-gray-400 text-xs ml-3.5">
              Add items to your cart — pay over 3 months. Items rotate automatically.
            </p>
          </div>

          {/* Cart pill */}
          {cartCount > 0 && (
            <button onClick={onCartOpen}
              className="flex-shrink-0 flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white font-black text-xs px-4 py-2.5 rounded-xl transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              {cartCount} items · {fmt(cartTotal)}
              {minOrder > 0 && pct < 100 && <span className="text-amber-300 font-medium">· {fmt(minOrder - cartTotal)} to min</span>}
              {pct >= 100 && <span className="text-green-400 font-medium">· ✓ Ready</span>}
            </button>
          )}
        </div>

        {/* Progress bar — only when cart has items */}
        {cartCount > 0 && (
          <div className="ml-3.5 mb-5 mt-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-xs">
                <div className={`h-full rounded-full transition-all duration-500 ${pct >= 100 ? 'bg-gray-800' : 'bg-amber-400'}`} style={{ width: `${pct}%` }} />
              </div>
              <span className={`text-xs font-bold ${pct >= 100 ? 'text-gray-800' : 'text-amber-600'}`}>
                {pct}% of min order
              </span>
            </div>
          </div>
        )}

        {/* Category filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 mt-4">
          <button onClick={() => setActiveCat('all')}
            className={`whitespace-nowrap text-xs font-bold px-4 py-2 rounded-full transition-all flex-shrink-0 ${activeCat === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-50 border border-gray-200 text-gray-600 hover:border-gray-400'}`}>
            All
          </button>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setActiveCat(cat.id)}
              className={`whitespace-nowrap text-xs font-bold px-4 py-2 rounded-full transition-all flex-shrink-0 ${activeCat === cat.id ? 'bg-gray-800 text-white' : 'bg-gray-50 border border-gray-200 text-gray-600 hover:border-gray-400'}`}>
              {cat.label}
            </button>
          ))}
          {/* Kitchen Appliances — hardcoded pill, opens image lightbox */}
          <button
            onClick={() => setAppliancesOpen(true)}
            className="whitespace-nowrap text-xs font-bold px-4 py-2 rounded-full transition-all flex-shrink-0 bg-orange-50 border border-orange-200 text-orange-700 hover:bg-orange-100 cursor-pointer"
          >
            Kitchen Appliances
          </button>
        </div>

        {/* Vegetables seasonal notice */}
        {activeCat === 'fresh' && (
          <div className="flex items-start gap-3 bg-lime-50 border border-lime-200 rounded-xl px-4 py-3 mb-5">
            <span className="text-xl flex-shrink-0 mt-0.5">🌿</span>
            <p className="text-lime-800 text-xs leading-relaxed">
              <span className="font-black">Seasonal availability.</span> Fresh vegetables depend on harvest seasons and may not always be in stock. Prices may also vary with market conditions.{' '}
              <a href="https://wa.me/233244854206?text=Hello%20List%20J!%20I'd%20like%20to%20check%20on%20vegetable%20availability."
                className="underline font-bold hover:text-lime-900 transition-colors" target="_blank" rel="noopener noreferrer">
                WhatsApp us to confirm availability →
              </a>
            </p>
          </div>
        )}

        {/* Rice custom request notice — shown when rice dept is selected */}
        {activeCat === 'rice' && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
            <span className="text-xl flex-shrink-0 mt-0.5">🌾</span>
            <p className="text-amber-800 text-xs leading-relaxed">
              <span className="font-black">Don't see your preferred rice brand?</span> We can source and deliver any rice brand on request.{' '}
              <a href="https://wa.me/233244854206?text=Hello%20List%20J!%20I'd%20like%20to%20request%20a%20specific%20rice%20brand."
                className="underline font-bold hover:text-amber-900 transition-colors" target="_blank" rel="noopener noreferrer">
                WhatsApp us to request →
              </a>
            </p>
          </div>
        )}

        {/* Provisions sub-packages */}
        {(activeCat === 'provisions' || activeCat?.toLowerCase?.().includes('provision')) && (
          <div className="mb-2">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-1 h-5 bg-amber-400 rounded-full inline-block" />
              <h3 className="text-sm font-black text-gray-800">Choose a Provisions Package</h3>
            </div>
            <DeptPackageSection packages={provisionPackages} accentColor="amber" onApply={onApply} />
          </div>
        )}

        {/* Detergent sub-packages */}
        {(activeCat === 'cleaning' || activeCat?.toLowerCase?.().includes('detergent') || activeCat?.toLowerCase?.().includes('cleaning')) && (
          <div className="mb-2">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-1 h-5 bg-blue-400 rounded-full inline-block" />
              <h3 className="text-sm font-black text-gray-800">Choose a Detergent Package</h3>
            </div>
            <DeptPackageSection packages={detergentPackages} accentColor="blue" onApply={onApply} />
          </div>
        )}

        {/* Rotating 3-column grid — hidden for provisions & cleaning (packages only) */}
        {(activeCat === 'provisions' || activeCat?.toLowerCase?.().includes('provision') || activeCat === 'cleaning' || activeCat?.toLowerCase?.().includes('detergent') || activeCat?.toLowerCase?.().includes('cleaning')) ? null : productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-200 bg-white p-3 space-y-3">
                <Pulse className="h-36 w-full rounded-xl" />
                <Pulse className="h-4 w-4/5" />
                <Pulse className="h-4 w-1/2" />
                <div className="flex gap-2">
                  <Pulse className="h-9 flex-1" />
                  <Pulse className="h-9 w-9" />
                </div>
              </div>
            ))}
          </div>
        ) : shown.length === 0 ? (
          <div className="text-center py-14 px-6">
            <span className="text-5xl block mb-4">🥦</span>
            <h3 className="text-gray-700 font-black text-base mb-2">
              {activeCat === 'fresh' ? 'No Vegetables in Stock Right Now' : 'No products in this category yet'}
            </h3>
            <p className="text-gray-400 text-sm max-w-sm mx-auto">
              {activeCat === 'fresh'
                ? 'Fresh vegetable stock changes regularly. WhatsApp us to check current availability or place a specific request.'
                : 'Check back soon or WhatsApp us for availability.'
              }
            </p>
            {activeCat === 'fresh' && (
              <a href="https://wa.me/233244854206?text=Hello%20List%20J!%20I'd%20like%20to%20ask%20about%20vegetable%20availability."
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-5 bg-gray-800 hover:bg-gray-900 text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors">
                💬 Ask about availability
              </a>
            )}
          </div>
        ) : (
          <>
            <div
              className={`grid grid-cols-3 gap-3 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
              {shown.map((p, i) => (
                <ProductCard key={`${p.id}-${i}`} product={p}
                  qty={cart[p.id] || 0}
                  onAdd={() => onAdd(p.id)}
                  onRemove={() => onRemove(p.id)}
                  onView={onView} />
              ))}
            </div>

            {/* Dots + nav */}
            {pages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-6">
                {/* Prev */}
                <button
                  onClick={() => {
                    setVisible(false)
                    setTimeout(() => {
                      setOffset(o => (o - SHOWCASE_SIZE + total) % total)
                      setVisible(true)
                    }, 300)
                  }}
                  className="w-7 h-7 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-all">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>

                {/* Dot indicators */}
                <div className="flex gap-1.5">
                  {Array.from({ length: pages }).map((_, i) => (
                    <button key={i}
                      onClick={() => { setOffset(i * SHOWCASE_SIZE); setVisible(true) }}
                      className="rounded-full transition-all duration-300"
                      style={{
                        width: i === currentPage ? '20px' : '6px',
                        height: '6px',
                        background: i === currentPage ? '#1f2937' : '#d1d5db',
                      }} />
                  ))}
                </div>

                {/* Next */}
                <button
                  onClick={() => {
                    setVisible(false)
                    setTimeout(() => {
                      setOffset(o => (o + SHOWCASE_SIZE) % total)
                      setVisible(true)
                    }, 300)
                  }}
                  className="w-7 h-7 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-all">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            )}

            {/* Auto-rotate indicator — only for All */}
            {pages > 1 && activeCat === 'all' && (
              <p className="text-center text-gray-300 text-[11px] mt-2">
                Rotating every {ROTATE_MS / 1000}s · {total} products available
              </p>
            )}
            {pages > 1 && activeCat !== 'all' && (
              <p className="text-center text-gray-300 text-[11px] mt-2">
                {total} products · use arrows to browse
              </p>
            )}
          </>
        )}

        {/* View full catalogue CTA — only for depts with individual products */}
        {!(activeCat === 'provisions' || activeCat?.toLowerCase?.().includes('provision') || activeCat === 'cleaning' || activeCat?.toLowerCase?.().includes('detergent') || activeCat?.toLowerCase?.().includes('cleaning')) && (
        <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-400 text-xs">
            Showing {shown.length} of {total} products
            {activeCat !== 'all' && ` in ${categories.find(c => c.id === activeCat)?.label}`}
          </p>
          <button onClick={onCartOpen}
            className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-black text-sm px-6 py-2.5 rounded-xl transition-colors active:scale-95">
            View Cart & Apply →
          </button>
        </div>
        )}

      </div>
    </section>

    {/* Kitchen Appliances lightbox — rendered outside section to avoid fixed positioning issues */}
    {appliancesOpen && (
      <div
        className="fixed inset-0 bg-black/90 flex items-center justify-center p-4"
        style={{ zIndex: 9999 }}
        onClick={() => setAppliancesOpen(false)}
      >
        {/* Close button — high z-index, pointer-events-auto */}
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
    </>
  )
}

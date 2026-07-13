'use client'

import { useEffect } from 'react'
import { Navbar } from '../../layout/Navbar'
import { fmt } from '../../utils/format'

export const CartPage = ({ cart, onAdd, onRemove, onClear, onBack, onCheckout, cartCount, onCartOpen, onDeptClick, onShop, user, onAccountClick, allProducts = [], minOrder = 0 }: any) => {
  const findP = (id) => allProducts.find(pr => pr.id === id || pr.id === parseInt(id))
  const cartItems = (Object.entries(cart) as [string, number][]).filter(([, q]) => q > 0)
  const subtotal  = cartItems.reduce((s, [id, q]) => {
    const p = findP(id); return s + (p?.price ? p.price * q : 0)
  }, 0)
  const pct       = minOrder > 0 ? Math.min(100, Math.round((subtotal / minOrder) * 100)) : 0
  const remaining = Math.max(0, minOrder - subtotal)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 overflow-y-auto">
      <Navbar cartCount={cartCount} onCartOpen={onCartOpen} onApply={onBack}
        user={user}
        onAccountClick={onAccountClick}
        onDeptClick={(catId) => { onBack(); setTimeout(() => onDeptClick(catId), 100) }} />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-3">
          <button onClick={onShop} className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 text-sm font-semibold transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
            Continue Shopping
          </button>
          <span className="text-gray-300">|</span>
          <nav className="flex items-center gap-1.5 text-xs text-gray-400">
            <button onClick={onBack} className="hover:text-gray-700">Home</button>
            <span>/</span>
            <span className="text-gray-800 font-medium">Your Cart</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-black text-gray-900 mb-6">
          Your Cart
          {cartCount > 0 && <span className="ml-2 text-base font-normal text-gray-400">({cartCount} items)</span>}
        </h1>

        {cartItems.length === 0 ? (
          /* Empty state */
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
            <svg className="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <h2 className="text-gray-700 font-black text-lg mb-2">Your cart is empty</h2>
            <p className="text-gray-400 text-sm mb-6">Add some products to get started on your 3-month package.</p>
            <button onClick={onShop} className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-black text-sm px-8 py-3 rounded-xl transition-colors active:scale-95">
              Browse Products
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 items-start">

            {/* LEFT — cart table */}
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">

                {/* Table header */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <div className="col-span-5">Product</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-3 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Subtotal</div>
                </div>

                {/* Cart rows */}
                {cartItems.map(([id, qty], rowIdx) => {
                  const p = findP(id)
                  if (!p) return null
                  return (
                    <div key={id}
                      className={`flex flex-col md:grid md:grid-cols-12 gap-4 items-center px-6 py-5 border-b border-gray-50 last:border-0 ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>

                      {/* Product col */}
                      <div className="col-span-5 flex items-center gap-4 w-full">
                        {/* Remove button */}
                        <button onClick={() => {
                          // Remove all qty of this item
                          const n = { ...cart }; delete n[parseInt(id)]
                          onClear(parseInt(id))
                        }}
                          className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                          title="Remove item">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                        </button>
                        {/* Image */}
                        <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {p.img
                            ? <img src={p.img} alt={p.name} className="w-full h-full object-contain p-1.5"/>
                            : <span className="text-2xl">{p.emoji}</span>}
                        </div>
                        {/* Name + unit */}
                        <div>
                          <p className="text-gray-800 text-sm font-semibold leading-snug">{p.name}</p>
                          <p className="text-gray-400 text-xs uppercase tracking-wider mt-0.5">{p.unit}</p>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="col-span-2 text-center">
                        <span className="text-gray-700 font-semibold text-sm">{fmt(p.price)}</span>
                      </div>

                      {/* Qty stepper */}
                      <div className="col-span-3 flex justify-center">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <button onClick={() => onRemove(p.id)}
                            className="w-8 h-8 bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-500 font-black text-base flex items-center justify-center transition-colors">
                            −
                          </button>
                          <span className="w-10 text-center font-black text-sm text-gray-800 border-x border-gray-200 h-8 flex items-center justify-center">
                            {qty}
                          </span>
                          <button onClick={() => onAdd(p.id)}
                            className="w-8 h-8 bg-gray-50 hover:bg-amber-50 text-gray-500 hover:text-amber-600 font-black text-base flex items-center justify-center transition-colors">
                            +
                          </button>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="col-span-2 text-right">
                        <span className="text-gray-900 font-black text-sm">{fmt(p.price * qty)}</span>
                      </div>
                    </div>
                  )
                })}

                {/* Table footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                  <button onClick={() => onClear('all')}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium">
                    Clear cart
                  </button>
                  <button onClick={onShop}
                    className="text-xs text-amber-600 hover:text-amber-700 font-semibold hover:underline">
                    ← Continue shopping
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT — order summary */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden sticky top-[140px]">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h2 className="font-black text-gray-800 text-base">Order Summary</h2>
                </div>

                <div className="px-5 py-4 space-y-3">
                  {/* Min order progress */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-bold text-gray-600">Minimum Order</span>
                      <span className="font-black text-gray-800">{pct}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${pct >= 100 ? 'bg-gray-800' : 'bg-amber-400'}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between mt-1.5 text-[11px] text-gray-400">
                      <span>{fmt(subtotal)} added</span>
                      {pct < 100
                        ? <span className="text-amber-600 font-semibold">Add {fmt(remaining)} more</span>
                        : <span className="text-gray-800 font-bold">✓ Minimum reached!</span>}
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-3 space-y-2">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Subtotal ({cartCount} items)</span>
                      <span className="font-semibold text-gray-700">{fmt(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Payment plan</span>
                      <span className="font-semibold text-gray-700">3 months</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Monthly instalment</span>
                      <span className="font-semibold text-gray-700">{fmt(Math.ceil(subtotal / 3))}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-3">
                    <div className="flex justify-between items-baseline">
                      <span className="font-black text-gray-800 text-base">Total</span>
                      <span className="font-black text-gray-900 text-2xl">{fmt(subtotal)}</span>
                    </div>
                    <p className="text-gray-400 text-[11px] mt-0.5">Pay over 3 months — no interest</p>
                  </div>
                </div>

                {/* CTA */}
                <div className="px-5 pb-5 pt-1 space-y-2">
                  <button
                    onClick={onCheckout}
                    disabled={pct < 100}
                    className={`w-full py-3.5 rounded-xl font-black text-sm transition-all active:scale-95 ${pct >= 100 ? 'bg-gray-800 hover:bg-gray-900 text-white' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}>
                    {pct >= 100 ? 'Proceed to Apply →' : `Add ${fmt(remaining)} more to continue`}
                  </button>
                  <button onClick={onShop}
                    className="w-full py-2.5 rounded-xl font-semibold text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                    Continue Shopping
                  </button>
                </div>

                {/* Trust badges */}
                <div className="px-5 pb-5 space-y-2 border-t border-gray-100 pt-4">
                  {[
                    { icon: '🏛️', text: 'Open to all Ghana govt workers' },
                    { icon: '📅', text: 'Pay over 1–3 months, no interest' },
                    { icon: '🚚', text: 'Nationwide delivery' },
                  ].map(b => (
                    <div key={b.text} className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{b.icon}</span><span>{b.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}

// ─── CART DRAWER (quick slide-in) ─────────────────────────────────────────────
export const CartDrawer = ({ open, onClose, cart, onAdd, onRemove, onClear, onCheckout, total, allProducts = [], minOrder = 0 }: any) => {
  const findP = (id) => allProducts.find(pr => pr.id === id || pr.id === parseInt(id))
  const pct = minOrder > 0 ? Math.min(100, Math.round((total / minOrder) * 100)) : 0
  const remaining = Math.max(0, minOrder - total)
  const cartItems = (Object.entries(cart) as [string, number][]).filter(([, qty]) => qty > 0)

  return (
    <>
      {open && <div onClick={onClose} className="fixed inset-0 bg-black/40 z-40" />}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-50 flex flex-col shadow-2xl border-l border-gray-200 transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <h2 className="font-black text-gray-800 text-base">Your Package</h2>
            <span className="text-gray-400 text-xs">({cartItems.length} items)</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Progress */}
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
          <div className="flex justify-between text-xs mb-2">
            <span className="font-bold text-gray-700">Minimum Order</span>
            <span className="font-black text-gray-800">{pct}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${pct >= 100 ? 'bg-gray-800' : 'bg-amber-400'}`} style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between text-[11px] mt-1.5 text-gray-400">
            <span>Cart: <span className="text-gray-700 font-bold">{fmt(total)}</span></span>
            {pct < 100
              ? <span>Add <span className="text-amber-600 font-bold">{fmt(remaining)}</span> more</span>
              : <span className="text-gray-800 font-bold">✓ Minimum reached!</span>}
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2.5">
          {cartItems.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-5xl">🛒</span>
              <p className="text-gray-400 text-sm mt-4">Your cart is empty</p>
            </div>
          ) : cartItems.map(([id, qty]) => {
            const p = findP(id)
            if (!p) return null
            return (
              <div key={id} className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl p-3">
                <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {p.img ? <img src={p.img} alt={p.name} className="w-full h-full object-contain p-1" />
                         : <span className="text-xl">{p.emoji}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 text-xs font-semibold truncate">{p.name}</p>
                  <p className="text-gray-500 text-xs">{fmt(p.price)} × {qty} = <span className="font-bold text-gray-800">{fmt(p.price * qty)}</span></p>
                </div>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  <button onClick={() => onRemove(p.id)} className="w-6 h-6 bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-500 font-black text-sm flex items-center justify-center active:scale-90 transition-all">−</button>
                  <span className="w-6 text-center font-black text-xs text-gray-800 border-x border-gray-200">{qty}</span>
                  <button onClick={() => onAdd(p.id)} className="w-6 h-6 bg-gray-50 hover:bg-amber-50 text-gray-500 hover:text-amber-600 font-black text-sm flex items-center justify-center active:scale-90 transition-all">+</button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 space-y-3 bg-white">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">Total</span>
            <span className="text-gray-900 font-black text-xl">{fmt(total)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>Monthly (÷3)</span>
            <span className="font-semibold text-gray-600">{fmt(Math.ceil(total / 3))}/mo</span>
          </div>
          <button onClick={onCheckout} disabled={pct < 100}
            className={`w-full py-3.5 rounded-xl font-black text-sm transition-all active:scale-95 ${pct >= 100 ? 'bg-gray-800 hover:bg-gray-900 text-white' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}>
            {pct >= 100 ? 'Proceed to Apply →' : `Add ${fmt(remaining)} more to continue`}
          </button>
          {cartItems.length > 0 && (
            <button onClick={onClear} className="w-full py-2 text-gray-300 hover:text-red-400 text-xs transition-colors">Clear cart</button>
          )}
        </div>
      </div>
    </>
  )
}

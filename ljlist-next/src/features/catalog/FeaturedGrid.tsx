'use client'

import { ProductCard } from './ProductCard'

const FEATURED_IDS = [
  // Rice
  101, 109, 112, 113, 114, 115,
  // Oil, Canned, Spaghetti
  201, 202, 401, 402, 403, 301,
  // Canned, Frozen & Vegetables
  404, 405, 601, 602, 1001, 1002,
]

export const FeaturedGrid = ({ cart, onAdd, onRemove, onShop, onView, products: featured = [] }: any) => {
  const items = featured
  return (
    <section className="bg-white py-7 px-4 border-b border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2.5">
            <span className="w-1 h-5 bg-amber-400 rounded-full inline-block" />
            <h2 className="text-base font-black text-gray-800">Featured Products</h2>
          </div>
          <button onClick={onShop}
            className="text-amber-600 hover:text-amber-700 text-xs font-semibold flex items-center gap-1 hover:underline">
            View all products
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
        <p className="text-gray-400 text-xs mb-5">A mix of our most popular items across all departments</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {items.map(p => (
            <ProductCard key={p.id} product={p}
              qty={cart[p.id] || 0}
              onAdd={() => onAdd(p.id)}
              onRemove={() => onRemove(p.id)}
              onView={onView} />
          ))}
        </div>
      </div>
    </section>
  )
}

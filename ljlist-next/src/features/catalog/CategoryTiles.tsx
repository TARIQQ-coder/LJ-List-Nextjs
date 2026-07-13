'use client'

import { useState } from 'react'
import { SectionTitle } from '../../layout/SectionTitle'

const CAT_BANNERS = {
  rice:       { bg: 'bg-amber-50',   border: 'border-amber-100',  title: 'text-amber-800',  imgs: ['/images/royal25.webp', '/images/Oba-Spagetti-405x330.jpg'] },
  oil:        { bg: 'bg-yellow-50',  border: 'border-yellow-100', title: 'text-yellow-800', imgs: ['/images/Sunflower-Oil-1L.png', '/images/Sunflower-Oil-5L.jpeg'] },
  canned:     { bg: 'bg-red-50',     border: 'border-red-100',    title: 'text-red-800',    imgs: ['/images/African-Queen-420g.jpeg', '/images/Hondi.jpg'] },
  provisions: { bg: 'bg-purple-50',  border: 'border-purple-100', title: 'text-purple-800', imgs: ['/images/Milo-Antigen-E-400g-405x330.jpg', '/images/cornflakes.jpg'] },
  frozen:     { bg: 'bg-sky-50',     border: 'border-sky-100',    title: 'text-sky-800',    imgs: ['/images/Chicken-thigh.jpeg', '/images/drumstick.jpeg'] },
  cleaning:   { bg: 'bg-blue-50',    border: 'border-blue-100',   title: 'text-blue-800',   imgs: ['/images/power-zone-405x330.jpg', '/images/Madar-Soap-Large-Size-405x330.png'] },
  fresh:      { bg: 'bg-lime-50',    border: 'border-lime-100',   title: 'text-lime-800',   imgs: ['/images/Basket-tomatoes.png', '/images/Basket-Onions.jpg'] },
}

// ─── KITCHEN APPLIANCES LIGHTBOX ─────────────────────────────────────────────
// Hardcoded tile — not from the API. Displays a full-screen image when clicked.
const KitchenAppliancesLightbox = ({ onClose }: { onClose: () => void }) => (
  <div
    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
    onClick={onClose}
  >
    {/* Close button */}
    <button
      onClick={onClose}
      className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors z-10"
      aria-label="Close"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </button>

    {/* Image — stop propagation so clicking the image itself doesn't close */}
    <img
      src="/images/Kitchen-Appliances.jpeg"
      alt="Kitchen Appliances"
      onClick={e => e.stopPropagation()}
      className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
    />

    <p className="absolute bottom-4 left-0 right-0 text-center text-white/40 text-xs">
      Click outside to close
    </p>
  </div>
)

// ─── CATEGORY TILES ───────────────────────────────────────────────────────────
export const CategoryTiles = ({ onCatClick, categories = [] }: any) => {
  const [lightboxOpen, setLightboxOpen] = useState(false)

  return (
    <section className="bg-white py-6 px-4 border-b border-gray-100">
      <div className="max-w-7xl mx-auto">
        <SectionTitle label="Shop by Department" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">

          {/* ── API-driven department tiles ── */}
          {categories.map((cat: any) => {
            const banner = CAT_BANNERS[cat.id] || { bg: 'bg-gray-50', border: 'border-gray-200', title: 'text-gray-800', imgs: [] }
            const imgs = banner.imgs
            return (
              <button
                key={cat.id}
                onClick={() => onCatClick(cat.id)}
                className={`group relative overflow-hidden rounded-xl border ${banner.border} ${banner.bg} hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left`}
                style={{ height: '130px' }}
              >
                {imgs.length === 1 && (
                  <img
                    src={imgs[0]} alt={cat.label}
                    className="absolute right-0 bottom-0 h-full w-2/3 object-cover object-left opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                    style={{ maskImage: 'linear-gradient(to left, rgba(0,0,0,0.9) 40%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,0.9) 40%, transparent 100%)' }}
                  />
                )}
                {imgs.length >= 2 && (
                  <div className="absolute right-0 bottom-0 h-full w-3/5 flex gap-1 p-1">
                    {imgs.slice(0, 2).map((src: string, i: number) => (
                      <img key={i} src={src} alt=""
                        className="flex-1 h-full object-contain object-center opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" />
                    ))}
                  </div>
                )}
                <div className="absolute inset-0 flex flex-col justify-between p-3 pointer-events-none">
                  <p className={`text-xs font-black leading-snug ${banner.title} max-w-[55%]`}>{cat.label}</p>
                  <p className="text-[10px] font-semibold text-gray-500 group-hover:text-gray-700 transition-colors">Shop now →</p>
                </div>
              </button>
            )
          })}

          {/* ── Kitchen Appliances — hardcoded, opens image lightbox ── */}
          <button
            onClick={() => setLightboxOpen(true)}
            className="group relative overflow-hidden rounded-xl border border-orange-100 bg-orange-50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left"
            style={{ height: '130px' }}
          >
            {/* Full tile background image */}
            <img
              src="/images/Kitchen-Appliances.jpeg"
              alt="Kitchen Appliances"
              className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-300"
            />
            {/* Dark gradient overlay so text is always readable */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
            {/* Text label */}
            <div className="absolute inset-0 flex flex-col justify-between p-3 pointer-events-none">
              <p className="text-xs font-black leading-snug text-white drop-shadow max-w-[70%]">
                Kitchen Appliances
              </p>
              <p className="text-[10px] font-semibold text-white/80 group-hover:text-white transition-colors">
                View details →
              </p>
            </div>
          </button>

        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <KitchenAppliancesLightbox onClose={() => setLightboxOpen(false)} />
      )}
    </section>
  )
}

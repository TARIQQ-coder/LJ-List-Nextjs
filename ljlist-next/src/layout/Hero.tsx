'use client'

import { useEffect, useState } from 'react'
import { HERO_IMAGES } from '../data/marketingContent'
import { LogoMark } from './LogoMark'

export const Hero = ({ onShop }: any) => {
  const [active, setActive] = useState(0)
  const [fading, setFading] = useState(false)
  const [prevIdx, setPrevIdx] = useState(null)

  useEffect(() => {
    const id = setInterval(() => {
      const next = (active + 1) % HERO_IMAGES.length
      setPrevIdx(active); setFading(true)
      setTimeout(() => { setActive(next); setPrevIdx(null); setFading(false) }, 500)
    }, 4500)
    return () => clearInterval(id)
  }, [active])

  const goTo = (i) => {
    if (i === active) return
    setPrevIdx(active); setFading(true)
    setTimeout(() => { setActive(i); setPrevIdx(null); setFading(false) }, 500)
  }

  return (
    <section className="bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row gap-4">

        {/* LEFT — static message panel */}
        <div className="w-full md:w-[44%] flex-shrink-0 bg-white border border-gray-200 rounded-2xl px-8 py-10 flex flex-col justify-center relative overflow-hidden">
          {/* Subtle pattern */}
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: 'radial-gradient(#374151 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold px-3 py-1.5 rounded-full mb-6 tracking-wider uppercase">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
              🇬🇭 Open to Govt Workers in Ghana
            </div>

            <div className="flex items-center gap-3 mb-5">
              <LogoMark size={52} />
              <div>
                <p className="text-gray-800 font-black text-xl leading-none">List <span className="text-amber-500">"J"</span></p>
                <p className="text-gray-400 text-xs font-semibold tracking-widest uppercase">Grocery Shop</p>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-2" style={{ fontFamily: 'Georgia,serif' }}>
              Feast in <span className="text-amber-500">Comfort.</span>
            </h1>
            <p className="text-gray-500 text-base italic mb-4" style={{ fontFamily: 'Georgia,serif' }}>Super 3 Months Plan</p>
            <p className="text-gray-500 text-sm leading-relaxed mb-7 max-w-sm">
              Buy your groceries in bulk and pay over <span className="text-gray-800 font-semibold">1–3 months</span>.
              No interest, no stress. Pick from our packages or build your own.
            </p>

            {/* Trust pills */}
            <div className="flex flex-wrap gap-2 mb-7">
              {['📅 Pay in 3 months', '🚚 Bulk delivery', '🏛️ Govt workers', '📞 WhatsApp us'].map(t => (
                <span key={t} className="text-xs font-medium px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full border border-gray-200">{t}</span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={onShop}
                className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-black text-sm px-7 py-3.5 rounded-xl active:scale-95 transition-all shadow-sm">
                🛒 Build Your Package
              </button>
              <a href="#packages"
                className="border border-gray-300 text-gray-700 font-semibold text-sm px-7 py-3.5 rounded-xl hover:bg-gray-50 transition-all text-center">
                View Fixed Plans
              </a>
            </div>

            <p className="mt-5 text-gray-400 text-xs">
              Questions? <a href="https://wa.me/233244854206" className="text-amber-600 hover:underline font-semibold">WhatsApp 0244854206</a>
            </p>
          </div>
        </div>

        {/* RIGHT — image slider */}
        <div className="flex-1 relative rounded-2xl overflow-hidden border border-gray-200" style={{ minHeight: '360px' }}>
          {prevIdx !== null && (
            <img key={`p${prevIdx}`} src={HERO_IMAGES[prevIdx].src} alt=""
              className="absolute inset-0 w-full h-full object-cover"
              style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.5s', zIndex: 1 }} />
          )}
          <img key={`a${active}`} src={HERO_IMAGES[active].src} alt={HERO_IMAGES[active].alt}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.5s', zIndex: 2 }} />

          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10 pointer-events-none" />

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {HERO_IMAGES.map((_, i) => (
              <button key={i} onClick={() => goTo(i)}
                className="rounded-full transition-all duration-300"
                style={{ width: i === active ? '24px' : '8px', height: '8px', background: i === active ? '#fbbf24' : 'rgba(255,255,255,0.6)' }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}


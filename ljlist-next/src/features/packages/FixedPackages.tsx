'use client'

import { SectionTitle } from '../../layout/SectionTitle'
import { packageOptionFor } from '../../utils/catalog'

export const FixedPackages = ({ onApplyWithPackage, onViewPackage, packages = [], packageOptions = [] }: any) => (
  <section id="packages" className="bg-white py-10 px-4 border-b border-gray-100">
    <div className="max-w-7xl mx-auto">
      <SectionTitle label="Ready-Made Packages" />
      <p className="text-gray-400 text-xs mb-6 -mt-3">Choose a plan that fits your household — click to see full item list.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages.map((pkg, idx) => (
          <div key={pkg.id}
            className={`relative rounded-2xl border overflow-hidden hover:-translate-y-0.5 transition-all duration-200 ${pkg.popular ? 'border-amber-400 shadow-lg shadow-amber-50' : 'border-gray-200 hover:border-gray-300'}`}>
            {pkg.popular && <div className="absolute top-3 right-3 bg-amber-400 text-gray-900 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider z-10">Most Popular</div>}
            <div className={`h-1 w-full ${pkg.popular ? 'bg-amber-400' : 'bg-gray-200'}`} />
            <div className="p-5 bg-white">
              <span className={`inline-block text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full mb-3 ${pkg.popular ? 'bg-amber-100 text-amber-700' : pkg.id === 'valentine' ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-600'}`}>
                {pkg.tag}
              </span>
              <h3 className="text-gray-900 font-black text-base mb-1">{pkg.name}</h3>
              <p className="text-gray-400 text-xs mb-2">{pkg.tagline}</p>
              <p className="text-gray-900 font-black text-xl mb-0.5">{pkg.price}</p>
              <p className="text-gray-400 text-xs mb-2">≈ {pkg.monthly} over 3 months</p>

              {/* Rice options */}
              {pkg.riceOptions && (
                <p className="text-green-700 text-[11px] font-bold mb-4">🌾 Rice: {pkg.riceOptions}</p>
              )}

              {/* Item previews — show first 4 with images/emoji */}
              {pkg.items.length > 0 && (
                <div className="flex items-center gap-1.5 mb-4">
                  {pkg.items.slice(0, 4).map((item, i) => (
                    <div key={i} className="w-9 h-9 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0" title={item.label}>
                      {item.img
                        ? <img src={item.img} alt={item.label} className="w-full h-full object-contain p-0.5" />
                        : <span className="text-lg">{item.emoji}</span>
                      }
                    </div>
                  ))}
                  {pkg.items.length > 4 && (
                    <div className="w-9 h-9 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-500 text-[10px] font-black">+{pkg.items.length - 4}</span>
                    </div>
                  )}
                  <span className="text-gray-400 text-xs ml-1">{pkg.items.length} items</span>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-2">
                {pkg.id !== 'custom' && (
                  <button
                    onClick={() => onViewPackage(pkg, idx)}
                    className="flex-1 py-2.5 rounded-xl font-bold text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all active:scale-95">
                    View Items
                  </button>
                )}
                <button
                  onClick={() => onApplyWithPackage(pkg.id === 'custom' ? packageOptions[packageOptions.length - 1] : packageOptions[idx] || packageOptionFor(pkg))}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${pkg.popular ? 'bg-amber-400 hover:bg-amber-500 text-gray-900' : pkg.id === 'valentine' ? 'bg-pink-500 hover:bg-pink-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                  {pkg.id === 'custom' ? 'Call 0244854206' : 'Apply →'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
)


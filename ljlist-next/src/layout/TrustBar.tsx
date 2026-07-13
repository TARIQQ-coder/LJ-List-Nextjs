'use client'

import { TRUST } from '../data/marketingContent'

export const TrustBar = () => (
  <section className="bg-white border-b border-gray-100">
    <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
      {TRUST.map(t => (
        <div key={t.title} className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">{t.icon}</div>
          <div>
            <p className="text-gray-800 font-bold text-sm">{t.title}</p>
            <p className="text-gray-400 text-xs">{t.sub}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
)


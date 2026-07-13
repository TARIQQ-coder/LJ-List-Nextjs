'use client'

export const PromoStrip = ({ onApply, onShop }: any) => (
  <section className="bg-gray-50 py-6 px-4 border-b border-gray-100">
    <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[
        { bg: 'bg-gray-800', textColor: 'text-white', sub: 'text-gray-400', icon: '🛒', title: 'Build Your Own Package', sub2: 'Choose exactly what you need', action: onShop },
        { bg: 'bg-amber-400', textColor: 'text-gray-900', sub: 'text-gray-700', icon: '📋', title: 'Apply in Minutes', sub2: 'Quick form — fast approval', action: onApply },
        { bg: 'bg-gray-100', textColor: 'text-gray-800', sub: 'text-gray-500', icon: '📅', title: 'Pay Over 3 Months', sub2: 'No interest · No stress', action: null },
      ].map(b => (
        <div key={b.title} onClick={b.action}
          className={`${b.bg} rounded-2xl px-5 py-4 flex items-center gap-4 ${b.action ? 'cursor-pointer hover:opacity-90 active:scale-[0.98]' : ''} transition-all border border-transparent hover:border-gray-200`}>
          <span className="text-3xl">{b.icon}</span>
          <div>
            <p className={`font-black text-sm ${b.textColor}`}>{b.title}</p>
            <p className={`text-xs ${b.sub}`}>{b.sub2}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
)



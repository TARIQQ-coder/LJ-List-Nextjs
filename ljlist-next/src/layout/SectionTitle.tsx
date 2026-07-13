'use client'

export const SectionTitle = ({ label, onSeeAll }: any) => (
  <div className="flex items-center justify-between mb-5">
    <div className="flex items-center gap-2.5">
      <span className="w-1 h-5 bg-amber-400 rounded-full inline-block" />
      <h2 className="text-base font-black text-gray-800">{label}</h2>
    </div>
    {onSeeAll && (
      <button onClick={onSeeAll} className="text-amber-600 hover:text-amber-700 text-xs font-semibold flex items-center gap-1 hover:underline">
        See all
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
        </svg>
      </button>
    )}
  </div>
)



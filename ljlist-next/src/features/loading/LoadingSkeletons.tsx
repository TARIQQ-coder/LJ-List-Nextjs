'use client'

export const Pulse = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse rounded-xl bg-gray-200/80 ${className}`} />
)

export const PageSkeleton = () => (
  <div className="min-h-screen bg-gray-50 px-4 py-8">
    <div className="max-w-5xl mx-auto space-y-4">
      <Pulse className="h-8 w-40" />
      <Pulse className="h-4 w-72" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3">
            <Pulse className="h-4 w-24" />
            <Pulse className="h-8 w-16" />
          </div>
        ))}
      </div>
    </div>
  </div>
)

export const ProfileSkeleton = () => (
  <div className="space-y-5">
    <div className="rounded-2xl border border-gray-200 bg-white p-5 flex items-center gap-4">
      <Pulse className="h-14 w-14 rounded-full" />
      <div className="flex-1 space-y-2">
        <Pulse className="h-5 w-48" />
        <Pulse className="h-4 w-36" />
        <Pulse className="h-3 w-28" />
      </div>
      <Pulse className="h-10 w-28" />
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3">
          <Pulse className="h-8 w-12 mx-auto" />
          <Pulse className="h-3 w-20 mx-auto" />
        </div>
      ))}
    </div>
  </div>
)

export const ApplicationsSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <Pulse className="h-5 w-48" />
            <Pulse className="h-3 w-28" />
          </div>
          <Pulse className="h-6 w-20" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Pulse className="h-4 w-full" />
          <Pulse className="h-4 w-full" />
        </div>
        <Pulse className="h-9 w-32" />
      </div>
    ))}
  </div>
)

export const ApplicationSkeleton = () => (
  <div className="min-h-screen bg-gray-50 px-4 py-8">
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Pulse className="h-4 w-28" />
          <Pulse className="h-6 w-64" />
          <Pulse className="h-4 w-40" />
        </div>
        <Pulse className="h-6 w-20 rounded-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3">
            <Pulse className="h-3 w-24" />
            <Pulse className="h-5 w-2/3" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3">
        <Pulse className="h-4 w-24" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-2">
            <Pulse className="h-4 w-40" />
            <Pulse className="h-3 w-20" />
          </div>
        ))}
      </div>
    </div>
  </div>
)

export const MessagesSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
    <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
      <Pulse className="h-9 w-9 rounded-full" />
      <div className="flex-1 space-y-2">
        <Pulse className="h-4 w-32" />
        <Pulse className="h-3 w-40" />
      </div>
    </div>
    <div className="h-80 bg-gray-50 px-5 py-5 space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
          <div className={`max-w-[72%] space-y-2 ${i % 2 === 0 ? 'items-start' : 'items-end'}`}>
            <Pulse className={`h-3 w-20 ${i % 2 === 0 ? '' : 'ml-auto'}`} />
            <Pulse className={`h-10 ${i % 2 === 0 ? 'w-56' : 'w-48 ml-auto'}`} />
            <Pulse className={`h-3 w-16 ${i % 2 === 0 ? '' : 'ml-auto'}`} />
          </div>
        </div>
      ))}
    </div>
    <div className="px-5 py-4 border-t border-gray-100 flex gap-3 items-end">
      <Pulse className="h-20 flex-1" />
      <Pulse className="h-11 w-11 rounded-xl" />
    </div>
  </div>
)

export const ProductSkeleton = () => (
  <div className="min-h-screen bg-gray-50 px-4 py-8">
    <div className="max-w-7xl mx-auto space-y-6">
      <Pulse className="h-6 w-24" />
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div className="grid md:grid-cols-[420px_1fr]">
          <Pulse className="min-h-[380px] rounded-none" />
          <div className="p-8 space-y-5">
            <Pulse className="h-5 w-24" />
            <Pulse className="h-8 w-3/4" />
            <Pulse className="h-4 w-40" />
            <div className="flex gap-3">
              <Pulse className="h-11 w-32" />
              <Pulse className="h-11 flex-1" />
            </div>
            <div className="space-y-3 pt-2">
              {Array.from({ length: 5 }).map((_, i) => <Pulse key={i} className="h-4 w-2/3" />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

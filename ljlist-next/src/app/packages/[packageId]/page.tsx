'use client'

import { Navigate, useNavigate, useParams } from '@/lib/router'
import { useStore } from '@/store/StoreProvider'
import { PackageDetail } from '@/features/packages/PackageDetail'

export default function PackagePage() {
  const navigate = useNavigate()
  const { packageId } = useParams<{ packageId: string }>()
  const { fixedPackages, packageOptions, liveProducts, setPrefilled, scrollHome, productsLoading } = useStore()

  if (productsLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400 text-sm font-semibold">Loading package…</div>
  }

  const pkg = fixedPackages.find((pk) => String(pk.id) === packageId)
  if (!pkg) return <Navigate to="/" replace />
  const idx = fixedPackages.findIndex((pk) => pk.id === pkg.id)

  return (
    <PackageDetail
      pkg={pkg}
      idx={idx}
      packageOptions={packageOptions}
      allProducts={liveProducts}
      onBack={() => navigate('/')}
      onApply={(pkgOption: string) => {
        setPrefilled(pkgOption)
        scrollHome('apply', 150)
      }}
    />
  )
}

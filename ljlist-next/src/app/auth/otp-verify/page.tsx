'use client'

import { Suspense } from 'react'
import { useStore } from '@/store/StoreProvider'
import { AuthOtpVerifyPage } from '@/features/auth/ClientAuthPage'

export default function OtpVerifyRoute() {
  const { refreshUserFromApi } = useStore()
  return (
    <Suspense>
      <AuthOtpVerifyPage onSuccess={refreshUserFromApi} />
    </Suspense>
  )
}

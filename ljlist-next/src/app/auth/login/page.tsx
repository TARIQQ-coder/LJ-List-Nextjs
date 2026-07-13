'use client'

import { Suspense } from 'react'
import { useStore } from '@/store/StoreProvider'
import { AuthLoginPage } from '@/features/auth/ClientAuthPage'

export default function LoginRoute() {
  const { refreshUserFromApi } = useStore()
  return (
    <Suspense>
      <AuthLoginPage onSuccess={refreshUserFromApi} />
    </Suspense>
  )
}

'use client'

import { Suspense } from 'react'
import { useStore } from '@/store/StoreProvider'
import { AuthRegisterPage } from '@/features/auth/ClientAuthPage'

export default function RegisterRoute() {
  const { refreshUserFromApi } = useStore()
  return (
    <Suspense>
      <AuthRegisterPage onSuccess={refreshUserFromApi} />
    </Suspense>
  )
}

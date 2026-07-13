'use client'

import { useStore } from '@/store/StoreProvider'
import { ApplicationDetailPage } from '@/features/account/ApplicationDetailPage'

export function ApplicationDetailRoute() {
  const { user, profileLoading } = useStore()
  return <ApplicationDetailPage user={user} loading={profileLoading} />
}

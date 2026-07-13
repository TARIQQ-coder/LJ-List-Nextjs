'use client'

import { useStore } from '@/store/StoreProvider'
import { ClientAccountPage } from '@/features/account/ClientAccountPage'

export function AccountRoute({ section }: { section: 'overview' | 'applications' | 'messages' }) {
  const { user, profileLoading, logoutUser, toApply, refreshUserFromApi } = useStore()
  return (
    <ClientAccountPage
      user={user}
      loading={profileLoading}
      section={section}
      onLogout={logoutUser}
      onApply={toApply}
      onUserChange={refreshUserFromApi}
    />
  )
}

import type { Metadata, Viewport } from 'next'
import { StoreProvider } from '@/store/StoreProvider'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'LJ-list — Groceries on Flexible Payment Plans for Govt Workers',
  description:
    'Order rice, oil, provisions, detergents and full grocery packages with 1–3 month payment plans. Bulk delivery nationwide across Ghana for government workers.',
  icons: { icon: '/favicon.svg' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  )
}

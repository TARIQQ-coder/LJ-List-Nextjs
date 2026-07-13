'use client'

import type { SVGProps } from 'react'

export const LogoMark = ({ size = 40 }: { size?: number } & SVGProps<SVGSVGElement>) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <linearGradient id="gld" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#f5c842" /><stop offset="60%" stopColor="#d4a017" /><stop offset="100%" stopColor="#a07010" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="46" stroke="url(#gld)" strokeWidth="6" />
    <text x="50" y="68" textAnchor="middle" fontSize="52" fontWeight="900" fontFamily="Georgia,serif" fill="url(#gld)">J</text>
  </svg>
)



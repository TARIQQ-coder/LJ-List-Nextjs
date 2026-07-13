import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  async rewrites() {
    const target = process.env.API_PROXY_TARGET
    if (!target) return []
    return [
      { source: '/api/:path*', destination: `${target}/api/:path*` },
      { source: '/uploads/:path*', destination: `${target}/uploads/:path*` },
    ]
  },
}

export default nextConfig
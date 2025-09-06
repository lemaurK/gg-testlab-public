import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Redirect apex to canonical www
      {
        source: '/:path*',
        has: [{ type: 'header', key: 'host', value: 'thrustbench.app' }],
        destination: 'https://www.thrustbench.app/:path*',
        permanent: true,
      },
      // Redirect any vercel preview host to canonical www (explicit variants)
      {
        source: '/:path*',
        has: [{ type: 'header', key: 'host', value: '.*\\.vercel\\.app$' }],
        destination: 'https://www.thrustbench.app/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'header', key: 'host', value: '.*\\.vercel\\.sh$' }],
        destination: 'https://www.thrustbench.app/:path*',
        permanent: true,
      },
    ]
  },
}

export default nextConfig

'use server'

import { NextResponse, type NextRequest } from 'next/server'

// Canonical host for production
const CANONICAL_HOST = 'www.thrustbench.app'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const host = request.headers.get('host') || ''

  // Enforce canonical host in production: redirect apex and any vercel.app host
  const isApex = host === 'thrustbench.app'
  const isVercelHost = host.endsWith('.vercel.app') || host.endsWith('.vercel.sh')

  if (isApex || isVercelHost) {
    url.host = CANONICAL_HOST
    url.protocol = 'https:'
    return NextResponse.redirect(url, { status: 308 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Apply to all paths
    '/:path*',
  ],
}


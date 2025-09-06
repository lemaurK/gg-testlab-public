import { NextResponse, type NextRequest } from 'next/server'

// Canonical host for production
const CANONICAL_HOST = 'www.thrustbench.app'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const headerHost = request.headers.get('host') || ''
  const forwardedHost = request.headers.get('x-forwarded-host') || ''
  const host = forwardedHost || headerHost

  // Enforce canonical host in production: redirect apex and any vercel.app host
  const isApex = host === 'thrustbench.app'
  const isVercelHost = /\.vercel\.(app|sh)$/.test(host)

  if (isApex || isVercelHost) {
    url.host = CANONICAL_HOST
    url.protocol = 'https:'
    return NextResponse.redirect(url, { status: 308 })
  }

  return NextResponse.next()
}

export const config = {
  // Exclude Next assets and files with extensions
  matcher: ['/((?!_next/|.*\..*).*)', '/'],
}

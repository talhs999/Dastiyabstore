import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const method = request.method

  // Protect Admin UI pages
  if (pathname.startsWith('/admin')) {
    const session = request.cookies.get('admin_session')
    if (!session) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Protect Admin APIs and Settings mutations (POST, PUT, DELETE, PATCH)
  if (
    pathname.startsWith('/api/admin') ||
    (pathname.startsWith('/api/settings') && method !== 'GET')
  ) {
    const session = request.cookies.get('admin_session')
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/settings/:path*'],
}

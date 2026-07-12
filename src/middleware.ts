import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const session = request.cookies.get('admin_session')
    if (!session) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}

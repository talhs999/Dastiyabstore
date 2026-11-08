import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory sliding window rate limiter
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Cleanup stale IP entries every 3 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 180000);

// Attack signatures and malicious paths commonly targeted by automated vulnerability scanners & botnets
const BLOCKED_PATH_PATTERNS = [
  /\.env($|\/|\.)/i,
  /\.git($|\/)/i,
  /\.php($|\?)/i,
  /wp-admin|wp-login|xmlrpc/i,
  /phpmyadmin|pma|adminer/i,
  /cgi-bin|actuator|eval-stdin/i,
  /\.sql($|\?)/i,
  /\.bak($|\?)/i,
  /\.config($|\?)/i,
  /\/etc\/passwd/i,
  /\.\.\//, // Path traversal
  /<script>/i, // Basic XSS probe in path
  /union(\s+|\/\*.*\*\/)+select/i, // SQL injection probe in path
];

function checkRateLimit(ip: string, prefix: string, maxRequests: number, windowMs: number): boolean {
  const key = `${prefix}:${ip}`;
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count += 1;
  return true;
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const method = request.method;
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';

  // 1. Immediately drop common vulnerability scanning and exploit probe requests
  let fullUrl = `${pathname}${search}`;
  try {
    fullUrl = decodeURIComponent(fullUrl);
  } catch {}

  for (const pattern of BLOCKED_PATH_PATTERNS) {
    if (pattern.test(fullUrl)) {
      return new NextResponse('Access Denied', {
        status: 403,
        headers: {
          'Content-Type': 'text/plain',
          'X-Security-Block': 'Attack Pattern Detected'
        }
      });
    }
  }

  // 2. Protect Admin UI pages
  if (pathname.startsWith('/admin')) {
    const session = request.cookies.get('admin_session');
    if (!session) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // 3. Protect Admin APIs and Settings mutations (POST, PUT, DELETE, PATCH)
  if (
    pathname.startsWith('/api/admin') ||
    (pathname.startsWith('/api/settings') && method !== 'GET')
  ) {
    const session = request.cookies.get('admin_session');
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // 4. Intelligent Rate Limiting for API routes
  if (pathname.startsWith('/api/')) {
    // Stricter limits for authentication and checkout endpoints (prevent brute force & fake order spam)
    if (pathname.startsWith('/api/auth/') || pathname.startsWith('/api/checkout/order')) {
      const allowed = checkRateLimit(ip, 'auth', 20, 60000); // 20 requests per minute
      if (!allowed) {
        return NextResponse.json(
          { error: 'Too many requests. Please wait a minute and try again.' },
          { status: 429, headers: { 'Retry-After': '60' } }
        );
      }
    } 
    // Chatbot rate limit (prevent Gemini API quota draining by botnets)
    else if (pathname.startsWith('/api/chat')) {
      const allowed = checkRateLimit(ip, 'chat', 30, 60000); // 30 messages per minute
      if (!allowed) {
        return NextResponse.json(
          { error: 'Rate limit reached for AI Assistant. Please slow down.' },
          { status: 429, headers: { 'Retry-After': '60' } }
        );
      }
    } 
    // General API rate limit (prevent database connection flooding)
    else {
      const allowed = checkRateLimit(ip, 'api', 120, 60000); // 120 requests per minute
      if (!allowed) {
        return NextResponse.json(
          { error: 'Too many API requests. Please try again shortly.' },
          { status: 429, headers: { 'Retry-After': '60' } }
        );
      }
    }
  }

  // 5. Attach standard OWASP security response headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public asset folders
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images/|icons/).*)',
  ],
};

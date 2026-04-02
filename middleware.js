// middleware.js
// Runs on every request matching the config below
import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // ── Security headers (applied to all routes) ──────────────────────────────
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  // ── API: protect admin endpoints ────────────────────────────────────────
  // Allow /api/admin/auth through (it handles its own validation)
  // Other admin routes require x-admin-user / x-admin-pass headers
  if (pathname.startsWith('/api/admin/') && !pathname.startsWith('/api/admin/auth')) {
    const adminUser = request.headers.get('x-admin-user');
    const adminPass = request.headers.get('x-admin-pass');

    // Also allow legacy x-admin-password header for backward compat
    if (!adminUser && !adminPass && !request.headers.get('x-admin-password')) {
      return NextResponse.json(
        { error: 'Admin credentials required' },
        { status: 401 }
      );
    }
  }

  // ── Rate limiting hint (implement with Upstash Redis for production) ─────
  // For production, replace with:
  // import { Ratelimit } from '@upstash/ratelimit'
  // import { Redis } from '@upstash/redis'

  return response;
}

export const config = {
  // Apply middleware to API routes (not static files or Next.js internals)
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json).*)',
  ],
};

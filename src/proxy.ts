import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware to protect admin routes and sensitive API endpoints.
 * 
 * - Admin pages (/admin/*) require the ADMIN_API_KEY cookie
 * - API routes (/api/sync/*, /api/health) require Bearer token or x-api-key header
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // --- Protect API routes ---
  if (pathname.startsWith('/api/sync') || pathname.startsWith('/api/health')) {
    const authHeader = request.headers.get('authorization')
    const apiKeyHeader = request.headers.get('x-api-key')
    const apiKey = process.env.ADMIN_API_KEY

    if (!apiKey) {
      // If ADMIN_API_KEY is not configured, block all access
      return NextResponse.json(
        { error: 'Server misconfigured: ADMIN_API_KEY not set' },
        { status: 500 }
      )
    }

    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
    const providedKey = token || apiKeyHeader

    if (providedKey !== apiKey) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
  }

  // --- Protect Admin pages ---
  if (pathname.startsWith('/admin')) {
    const adminCookie = request.cookies.get('admin_session')?.value
    const apiKey = process.env.ADMIN_API_KEY

    // Allow access if valid admin cookie, or if API key matches query param (for initial login)
    const loginKey = request.nextUrl.searchParams.get('key')

    if (loginKey && loginKey === apiKey) {
      // Set the admin session cookie and redirect without the key in URL
      const url = request.nextUrl.clone()
      url.searchParams.delete('key')
      const response = NextResponse.redirect(url)
      response.cookies.set('admin_session', apiKey, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/admin',
      })
      return response
    }

    if (adminCookie !== apiKey) {
      // Return a simple login page
      return new NextResponse(
        `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin Login - Press &amp; Co OMS</title>
<style>
  body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
  .login { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); max-width: 360px; width: 100%; }
  h1 { font-size: 1.125rem; margin: 0 0 1.5rem; color: #1a1a1a; }
  input { width: 100%; padding: 0.75rem; border: 1px solid #e5e5e5; border-radius: 4px; font-size: 0.875rem; box-sizing: border-box; }
  button { width: 100%; padding: 0.75rem; background: #1a1a1a; color: white; border: none; border-radius: 4px; font-size: 0.875rem; cursor: pointer; margin-top: 0.75rem; }
  button:hover { background: #333; }
  .brand { color: #999; font-size: 0.75rem; margin-bottom: 0.25rem; }
</style>
</head>
<body>
  <div class="login">
    <p class="brand">Press & Co OMS</p>
    <h1>Admin Login</h1>
    <form method="GET">
      <input type="password" name="key" placeholder="Enter admin key" required autofocus />
      <button type="submit">Sign In</button>
    </form>
  </div>
</body>
</html>`,
        {
          status: 401,
          headers: { 'Content-Type': 'text/html' },
        }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/sync/:path*',
    '/api/health',
  ],
}

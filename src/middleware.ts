import { NextRequest, NextResponse } from 'next/server'
import { validateSession, compareSecrets } from '@/lib/session'
import { adminEnv } from '@/lib/env'

/**
 * Middleware to protect admin routes and sensitive API endpoints.
 * 
 * - Admin pages (/admin/*) require a valid session cookie
 * - API routes (/api/sync/*, /api/health) require Bearer token or x-api-key header
 * - Webhooks (/api/webhooks/*) are NOT protected here (HMAC verified in route)
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // --- Protect API routes ---
  if (pathname.startsWith('/api/sync') || pathname === '/api/health') {
    const authHeader = request.headers.get('authorization')
    const apiKeyHeader = request.headers.get('x-api-key')

    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
    const providedKey = token || apiKeyHeader

    if (!providedKey || !compareSecrets(providedKey, adminEnv.ADMIN_API_KEY)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
  }

  // --- Protect Admin pages ---
  if (pathname.startsWith('/admin')) {
    const sessionToken = request.cookies.get('admin_session')?.value

    // Skip protection if login page (allow the auth/login API)
    if (pathname === '/admin/login') {
      return NextResponse.next()
    }

    if (!sessionToken || !(await validateSession(sessionToken))) {
      // Return a simple login page that POSTs to /api/auth/login
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
  .error { color: #EF4444; font-size: 0.8rem; margin-top: 0.5rem; display: none; }
</style>
</head>
<body>
  <div class="login">
    <p class="brand">Press & Co OMS</p>
    <h1>Admin Login</h1>
    <form id="loginForm">
      <input type="password" id="key" placeholder="Enter admin key" required autofocus />
      <button type="submit">Sign In</button>
      <p class="error" id="error">Invalid admin key</p>
    </form>
  </div>
  <script>
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const key = document.getElementById('key').value;
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });
      if (res.ok) {
        window.location.reload();
      } else {
        document.getElementById('error').style.display = 'block';
      }
    });
  </script>
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

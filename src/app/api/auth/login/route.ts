import { NextRequest, NextResponse } from 'next/server'
import { rateLimiters, getClientIp } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // Rate limit login attempts (5 per minute per IP)
  const ip = getClientIp(request.headers)
  const rateLimit = rateLimiters.login(ip)

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.reset.toString(),
          'Retry-After': Math.ceil((rateLimit.reset - Date.now()) / 1000).toString(),
        }
      }
    )
  }

  const apiKey = process.env.ADMIN_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Server misconfigured' },
      { status: 500 }
    )
  }

  const body = await request.json()
  const { key } = body

  if (!key || key !== apiKey) {
    return NextResponse.json(
      { error: 'Invalid admin key' },
      { status: 401 }
    )
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set('admin_session', apiKey, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/admin',
  })

  return response
}

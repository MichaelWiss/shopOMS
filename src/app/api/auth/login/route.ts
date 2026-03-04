import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
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

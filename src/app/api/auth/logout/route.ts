import { NextRequest, NextResponse } from 'next/server'
import { invalidateSession } from '@/lib/session'

export async function POST(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value

  if (token) {
    await invalidateSession(token)
  }

  const response = NextResponse.json({ message: 'Logged out successfully' })

  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })

  return response
}
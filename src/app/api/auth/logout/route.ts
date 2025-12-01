import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest } from '@/lib/jwt'
import { invalidateSession, invalidateUserSessions } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const { logoutType = 'current' } = await request.json().catch(() => ({}))
    const token = getTokenFromRequest(request) || request.cookies.get('auth-token')?.value

    if (token) {
      if (logoutType === 'all') {
        // Get user ID from token to invalidate all sessions
        const { verifyToken } = await import('@/lib/jwt')
        const payload = await verifyToken(token)
        if (payload) {
          await invalidateUserSessions(payload.userId)
        }
      } else {
        // Invalidate only current session
        await invalidateSession(token)
      }
    }

    const response = NextResponse.json({ message: 'Logged out successfully' })

    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
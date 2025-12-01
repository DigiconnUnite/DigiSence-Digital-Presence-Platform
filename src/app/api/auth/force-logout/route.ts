import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest, verifyToken } from '@/lib/jwt'
import { invalidateUserSessionsExceptCurrent } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request) || request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Invalidate all sessions except the current one
    await invalidateUserSessionsExceptCurrent(payload.userId, token)

    return NextResponse.json({
      message: 'All other sessions have been invalidated successfully'
    })

  } catch (error) {
    console.error('Force logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
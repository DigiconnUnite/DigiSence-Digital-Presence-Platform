import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, generateToken } from '@/lib/auth'
import { createSession, getUserActiveSessions, invalidateUserSessions } from '@/lib/session'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  force: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  try {
    console.log('Login attempt started')
    const body = await request.json()
    console.log('Login request body received')

    const { email, password, force = false } = loginSchema.parse(body)
    console.log(`Login attempt for email: ${email}`)

    const user = await authenticateUser(email, password)

    if (!user) {
      console.log(`Login failed: Invalid credentials for ${email}`)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // If force logout is requested, invalidate all existing sessions
    if (force) {
      await invalidateUserSessions(user.id)
      console.log(`Force logout: Invalidated all sessions for user ${user.email}`)
    } else {
      // Check for active sessions
      const activeSessions = await getUserActiveSessions(user.id)
      if (activeSessions.length > 0) {
        console.log(`Login blocked: User ${user.email} already has an active session`)
        return NextResponse.json(
          { error: 'This account is already logged in on another device.' },
          { status: 403 }
        )
      }
    }

    console.log(`Login successful for user: ${user.email} (${user.role})`)
    const token = generateToken(user)
    console.log('JWT token generated')

    // Create session in database
    await createSession(user, token)
    console.log('Session created in database')

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        businessId: user.businessId,
      },
      token,
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    console.log('Login response sent with token')
    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, generateToken } from '@/lib/auth'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(request: NextRequest) {
  try {
    console.log('Login attempt started')
    const body = await request.json()
    console.log('Login request body received')

    const { email, password } = loginSchema.parse(body)
    console.log(`Login attempt for email: ${email}`)

    const user = await authenticateUser(email, password)

    if (!user) {
      console.log(`Login failed: Invalid credentials for ${email}`)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    console.log(`Login successful for user: ${user.email} (${user.role})`)
    const token = generateToken(user)
    console.log('JWT token generated')

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
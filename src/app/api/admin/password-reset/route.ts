import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromRequest, verifyToken } from '@/lib/jwt'
import { z } from 'zod'

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6),
})

async function getSuperAdmin(request: NextRequest) {
  const token = getTokenFromRequest(request) || request.cookies.get('auth-token')?.value
  
  if (!token) {
    return null
  }
  
  const payload = verifyToken(token)
  if (!payload || payload.role !== 'SUPER_ADMIN') {
    return null
  }
  
  return payload
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getSuperAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { newPassword } = resetPasswordSchema.parse(body)

    try {
      // Get the business admin user
      const business = await db.business.findFirst({
        where: { adminId: admin.userId },
        include: {
          admin: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      })

      if (!business) {
        return NextResponse.json({ error: 'Business not found' }, { status: 404 })
      }

      // Hash the new password
      const { hashPassword } = await import('@/lib/auth')
      const hashedPassword = await hashPassword(newPassword)

      // Update the user's password
      await db.user.update({
        where: { id: business.adminId },
        data: { password: hashedPassword },
      })

      return NextResponse.json({
        success: true,
        message: 'Password reset successfully',
      })
    } catch (error) {
      console.error('Password reset error:', error)
      return NextResponse.json(
        { error: 'Failed to reset password' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
}
  }
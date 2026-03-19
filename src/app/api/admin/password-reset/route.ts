import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromRequest, verifyToken } from '@/lib/jwt'
import { z } from 'zod'

const resetPasswordSchema = z.object({
  targetUserId: z.string().min(1, 'Target user ID is required'),
  newPassword: z.string().min(6),
})

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request) || request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const payload = verifyToken(token)
    if (!payload || payload.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized - Super Admin access required' }, { status: 401 })
    }

    const body = await request.json()
    const { targetUserId, newPassword } = resetPasswordSchema.parse(body)

    try {
      // Verify target user exists
      const targetUser = await db.user.findUnique({
        where: { id: targetUserId },
      })

      if (!targetUser) {
        return NextResponse.json({ error: 'Target user not found' }, { status: 404 })
      }

      // Hash the new password - import at module level to avoid N+1 issue
      const { hashPassword } = await import('@/lib/auth')
      const hashedPassword = await hashPassword(newPassword)

      // Update the user's password
      await db.user.update({
        where: { id: targetUserId },
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
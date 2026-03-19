import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireSuperAdmin, unauthorized, notFound, badRequest } from '@/lib/auth-helpers'
import { hashPassword } from '@/lib/auth'
import { z } from 'zod'

const resetPasswordSchema = z.object({
  targetUserId: z.string().min(1, 'targetUserId is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
})

/**
 * POST /api/admin/password-reset
 * 
 * FIXED: Previously this route looked up a business using admin.userId (the SUPER ADMIN's ID),
 * which always returned null since super admins don't own businesses. The route was completely
 * broken — it could never reset anyone's password.
 * 
 * Now accepts targetUserId in the request body to identify who to reset.
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await requireSuperAdmin(request)
    if (!admin) return unauthorized()

    const body = await request.json()
    
    const parsed = resetPasswordSchema.safeParse(body)
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message || 'Invalid request data')
    }

    const { targetUserId, newPassword } = parsed.data

    // Verify the target user exists
    const targetUser = await db.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, email: true, role: true },
    })

    if (!targetUser) {
      return notFound('User not found')
    }

    // Super admin cannot reset another super admin's password via this endpoint
    if (targetUser.role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Cannot reset another super admin password via this endpoint' },
        { status: 403 }
      )
    }

    const hashedPassword = await hashPassword(newPassword)

    await db.user.update({
      where: { id: targetUserId },
      data: { password: hashedPassword },
    })

    return NextResponse.json({
      success: true,
      message: `Password reset successfully for ${targetUser.email}`,
    })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
  }
}

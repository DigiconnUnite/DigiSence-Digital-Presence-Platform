import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromRequest, verifyToken } from '@/lib/jwt'
import { z } from 'zod'
import { getNoStoreHeaders, getInvalidationHeaders } from '@/lib/cache'

const bulkStatusSchema = z.object({
  ids: z.array(z.string()).min(1),
  isActive: z.boolean(),
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
    const { ids, isActive } = bulkStatusSchema.parse(body)

    // Update all professionals in one transaction
    await db.professional.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        isActive,
      },
    })

    // Emit Socket.IO events for real-time updates
    if (global.io) {
      for (const id of ids) {
        const professional = await db.professional.findUnique({ where: { id } })
        if (professional) {
          global.io.emit('professional-status-updated', {
            professional: { ...professional, isActive },
            action: 'status_update',
            timestamp: new Date().toISOString(),
            adminId: admin.userId
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${ids.length} professional(s) ${isActive ? 'activated' : 'deactivated'}`,
      count: ids.length,
    }, {
      headers: {
        ...getNoStoreHeaders(),
        ...getInvalidationHeaders('update'),
      },
    })
  } catch (error) {
    console.error('Bulk status update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

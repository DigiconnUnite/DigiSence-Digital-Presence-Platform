import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromRequest, verifyToken } from '@/lib/jwt'
import { z } from 'zod'

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

const bulkDeleteSchema = z.object({
  businessIds: z.array(z.string()).min(1),
})

// POST /api/admin/businesses/bulk/delete - Bulk delete businesses
export async function POST(request: NextRequest) {
  try {
    const admin = await getSuperAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    if (!body.businessIds || !Array.isArray(body.businessIds)) {
      return NextResponse.json({ error: 'Business IDs array is required' }, { status: 400 })
    }

    const parseResult = bulkDeleteSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    const { businessIds } = parseResult.data

    // Get businesses to delete (for response and cascade)
    const businessesToDelete = await db.business.findMany({
      where: { id: { in: businessIds } },
      select: { id: true, adminId: true, name: true },
    })

    if (businessesToDelete.length === 0) {
      return NextResponse.json({ error: 'No businesses found' }, { status: 404 })
    }

    // Use transaction to delete all related records
    await db.$transaction(async (tx) => {
      for (const business of businessesToDelete) {
        // Delete related records
        await tx.product.deleteMany({ where: { businessId: business.id } })
        await tx.inquiry.deleteMany({ where: { businessId: business.id } })
        // Delete business
        await tx.business.delete({ where: { id: business.id } })
        // Delete associated admin user
        await tx.user.delete({ where: { id: business.adminId } })
      }
    })

    // Emit Socket.IO event
    if (global.io) {
      global.io.emit('business-bulk-deleted', {
        businessIds,
        deletedCount: businessesToDelete.length,
        action: 'bulk-delete',
        timestamp: new Date().toISOString(),
        adminId: admin.userId
      })
    }

    return NextResponse.json({
      success: true,
      message: `Deleted ${businessesToDelete.length} businesses`,
      deletedCount: businessesToDelete.length,
      deletedNames: businessesToDelete.map(b => b.name),
    })
  } catch (error) {
    console.error('Bulk delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

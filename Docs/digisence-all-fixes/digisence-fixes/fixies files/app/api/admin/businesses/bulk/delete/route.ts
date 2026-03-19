import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireSuperAdmin, unauthorized, badRequest } from '@/lib/auth-helpers'
import { z } from 'zod'

const bulkDeleteSchema = z.object({
  businessIds: z.array(z.string()).min(1, 'At least one business ID required'),
})

/**
 * POST /api/admin/businesses/bulk/delete
 * 
 * FIXED: Previously used a for-loop inside a transaction doing 4 sequential DB calls
 * per business (deleteMany products, deleteMany inquiries, delete business, delete user).
 * For 50 businesses = 200 sequential queries inside one open transaction.
 * 
 * Now uses batch deleteMany operations — 4 total queries regardless of count.
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await requireSuperAdmin(request)
    if (!admin) return unauthorized()

    const body = await request.json()
    const parsed = bulkDeleteSchema.safeParse(body)
    
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message || 'Invalid request data')
    }

    const { businessIds } = parsed.data

    // Get businesses to validate they exist and get admin IDs
    const businessesToDelete = await db.business.findMany({
      where: { id: { in: businessIds } },
      select: { id: true, adminId: true, name: true },
    })

    if (businessesToDelete.length === 0) {
      return NextResponse.json({ error: 'No businesses found' }, { status: 404 })
    }

    const foundIds = businessesToDelete.map((b) => b.id)
    const adminIds = businessesToDelete.map((b) => b.adminId)

    // FIXED: 4 batch operations instead of N*4 sequential operations
    await db.$transaction([
      db.product.deleteMany({ where: { businessId: { in: foundIds } } }),
      db.inquiry.deleteMany({ where: { businessId: { in: foundIds } } }),
      db.business.deleteMany({ where: { id: { in: foundIds } } }),
      db.user.deleteMany({ where: { id: { in: adminIds } } }),
    ])

    // Emit Socket.IO event
    if (global.io) {
      global.io.emit('business-bulk-deleted', {
        businessIds: foundIds,
        deletedCount: businessesToDelete.length,
        action: 'bulk-delete',
        timestamp: new Date().toISOString(),
        adminId: admin.userId,
      })
    }

    return NextResponse.json({
      success: true,
      message: `Deleted ${businessesToDelete.length} businesses`,
      deletedCount: businessesToDelete.length,
      deletedNames: businessesToDelete.map((b) => b.name),
    })
  } catch (error) {
    console.error('Bulk delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

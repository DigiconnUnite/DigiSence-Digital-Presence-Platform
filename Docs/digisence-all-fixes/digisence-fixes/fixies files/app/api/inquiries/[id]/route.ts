import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requireSuperAdmin, unauthorized } from '@/lib/auth-helpers'
import { z } from 'zod'

const updateSchema = z.object({
  status: z.enum(['NEW', 'READ', 'REPLIED', 'CLOSED']).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    if (!user) return unauthorized()

    const { id } = await params
    const inquiry = await db.inquiry.findUnique({
      where: { id },
      include: {
        business: { select: { id: true, name: true } },
        product: { select: { id: true, name: true } },
      },
    })

    if (!inquiry) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ inquiry })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    if (!user) return unauthorized()

    const { id } = await params
    const body = await request.json()
    const { status } = updateSchema.parse(body)

    const inquiry = await db.inquiry.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json({ success: true, inquiry })
  } catch (error) {
    console.error('Inquiry update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/inquiries/[id]
 * 
 * FIXED: Previously the admin dashboard's confirmDeleteInquiry() only removed from
 * React state with no API call. Inquiry "deletions" were phantom — refreshing the
 * page would bring them back. This endpoint actually deletes from the database.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    if (!user) return unauthorized()

    const { id } = await params

    const inquiry = await db.inquiry.findUnique({ where: { id } })
    if (!inquiry) return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })

    // Super admins can delete any inquiry
    // Business admins can only delete their own business's inquiries
    if (user.role === 'BUSINESS_ADMIN') {
      const business = await db.business.findFirst({ where: { adminId: user.userId } })
      if (!business || business.id !== inquiry.businessId) {
        return unauthorized()
      }
    }

    await db.inquiry.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Inquiry deleted' })
  } catch (error) {
    console.error('Inquiry deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

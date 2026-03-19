import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireSuperAdmin, unauthorized, notFound, badRequest } from '@/lib/auth-helpers'
import { z } from 'zod'

const rejectSchema = z.object({
  reason: z.string().optional(),
})

/**
 * POST /api/admin/registration-inquiries/[id]/reject
 * 
 * NEW ENDPOINT: Previously missing — the frontend called this but got 404.
 * Rejects a registration inquiry with an optional reason.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireSuperAdmin(request)
    if (!admin) return unauthorized()

    const { id: inquiryId } = await params

    const inquiry = await db.registrationInquiry.findUnique({
      where: { id: inquiryId },
    })

    if (!inquiry) return notFound('Registration inquiry not found')

    if (inquiry.status === 'COMPLETED') {
      return badRequest('This inquiry has already been approved and cannot be rejected')
    }

    if (inquiry.status === 'REJECTED') {
      return badRequest('This inquiry has already been rejected')
    }

    const body = await request.json().catch(() => ({}))
    const { reason } = rejectSchema.parse(body)

    const updatedInquiry = await db.registrationInquiry.update({
      where: { id: inquiryId },
      data: {
        status: 'REJECTED',
        adminNotes: reason || 'No reason provided',
        reviewedBy: admin.userId,
        reviewedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Registration inquiry rejected',
      inquiry: updatedInquiry,
    })
  } catch (error) {
    console.error('Reject inquiry error:', error)
    return NextResponse.json({ error: 'Failed to reject registration' }, { status: 500 })
  }
}

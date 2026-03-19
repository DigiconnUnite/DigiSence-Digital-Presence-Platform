import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireSuperAdmin, unauthorized, notFound } from '@/lib/auth-helpers'

/**
 * GET /api/admin/registration-inquiries
 * 
 * Returns all registration inquiries for admin review.
 * Supports filtering by status (PENDING, COMPLETED, REJECTED).
 */
export async function GET(request: NextRequest) {
  try {
    const admin = await requireSuperAdmin(request)
    if (!admin) return unauthorized()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as 'PENDING' | 'COMPLETED' | 'REJECTED' | null

    const where = status ? { status } : {}

    const inquiries = await db.registrationInquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      inquiries,
      total: inquiries.length,
    })
  } catch (error) {
    console.error('Get registration inquiries error:', error)
    return NextResponse.json({ error: 'Failed to fetch registration inquiries' }, { status: 500 })
  }
}

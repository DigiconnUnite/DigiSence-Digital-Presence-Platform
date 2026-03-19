import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireSuperAdmin, unauthorized } from '@/lib/auth-helpers'

/**
 * GET /api/admin/stats
 * 
 * Returns accurate platform-wide statistics using proper aggregation queries.
 * 
 * Previously the admin dashboard fetched /api/admin/businesses (paginated, max 20 results)
 * and computed stats from that — showing wrong numbers (e.g. "20 businesses" when there are 200).
 * This endpoint uses db.model.count() which is O(1) and accurate.
 */
export async function GET(request: NextRequest) {
  try {
    const admin = await requireSuperAdmin(request)
    if (!admin) return unauthorized()

    // All counts run in parallel — single round trip to DB
    const [
      totalBusinesses,
      activeBusinesses,
      totalProfessionals,
      activeProfessionals,
      totalInquiries,
      pendingRegistrations,
      totalProducts,
      activeProducts,
    ] = await Promise.all([
      db.business.count(),
      db.business.count({ where: { isActive: true } }),
      db.professional.count(),
      db.professional.count({ where: { isActive: true } }),
      db.inquiry.count(),
      db.registrationInquiry.count({ where: { status: 'PENDING' } }),
      db.product.count(),
      db.product.count({ where: { isActive: true } }),
    ])

    return NextResponse.json({
      totalBusinesses,
      activeBusinesses,
      inactiveBusinesses: totalBusinesses - activeBusinesses,
      totalProfessionals,
      activeProfessionals,
      inactiveProfessionals: totalProfessionals - activeProfessionals,
      totalInquiries,
      pendingRegistrations,
      totalProducts,
      activeProducts,
      totalUsers: totalBusinesses + totalProfessionals,
    })
  } catch (error) {
    console.error('Stats fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}

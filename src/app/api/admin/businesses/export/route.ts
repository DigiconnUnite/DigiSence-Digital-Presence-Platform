import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromRequest, verifyToken } from '@/lib/jwt'

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

// GET /api/admin/businesses/export - Export businesses to CSV
export async function GET(request: NextRequest) {
  try {
    const admin = await getSuperAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    
    // Fetch all businesses (without pagination for export)
    const businesses = await db.business.findMany({
      include: {
        admin: { select: { email: true, name: true } },
        category: { select: { name: true } },
        _count: { select: { products: true, inquiries: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (format === 'csv') {
      // Generate CSV
      const headers = ['Name', 'Email', 'Admin Name', 'Admin Email', 'Category', 'Address', 'Phone', 'Website', 'Products', 'Inquiries', 'Status', 'Created At']
      
      const rows = businesses.map(b => [
        b.name,
        b.email || '',
        b.admin.name || '',
        b.admin.email,
        b.category?.name || 'Uncategorized',
        b.address || '',
        b.phone || '',
        b.website || '',
        b._count.products.toString(),
        b._count.inquiries.toString(),
        b.isActive ? 'Active' : 'Inactive',
        new Date(b.createdAt).toISOString(),
      ])

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n')

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="businesses-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }

    return NextResponse.json({
      success: true,
      businesses,
      exportedAt: new Date().toISOString(),
      totalCount: businesses.length,
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

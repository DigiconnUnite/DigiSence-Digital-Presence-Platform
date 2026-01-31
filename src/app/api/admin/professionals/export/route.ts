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

// GET /api/admin/professionals/export - Export professionals to CSV
export async function GET(request: NextRequest) {
  try {
    const admin = await getSuperAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    
    // Fetch all professionals (without pagination for export)
    const professionals = await db.professional.findMany({
      include: {
        admin: { select: { email: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (format === 'csv') {
      // Generate CSV
      const headers = ['Name', 'Email', 'Admin Name', 'Admin Email', 'Phone', 'Headline', 'Location', 'Website', 'Status', 'Created At']
      
      const rows = professionals.map(p => [
        p.name,
        p.email || '',
        p.admin.name || '',
        p.admin.email,
        p.phone || '',
        p.professionalHeadline || '',
        p.location || '',
        p.website || '',
        p.isActive ? 'Active' : 'Inactive',
        new Date(p.createdAt).toISOString(),
      ])

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n')

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="professionals-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }

    return NextResponse.json({
      success: true,
      professionals,
      exportedAt: new Date().toISOString(),
      totalCount: professionals.length,
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

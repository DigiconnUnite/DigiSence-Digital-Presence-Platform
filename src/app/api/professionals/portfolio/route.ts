import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromRequest, verifyToken } from '@/lib/jwt'

async function getProfessionalAdmin(request: NextRequest) {
  const token = getTokenFromRequest(request) || request.cookies.get('auth-token')?.value

  if (!token) {
    return null
  }

  const payload = verifyToken(token)
  if (!payload || payload.role !== 'PROFESSIONAL_ADMIN') {
    return null
  }

  return payload
}

export async function GET(request: NextRequest) {
  try {
    const admin = await getProfessionalAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the professional associated with this admin
    const professional = await db.professional.findFirst({
      where: { adminId: admin.userId },
      select: {
        id: true,
        portfolio: true,
      },
    })

    if (!professional) {
      return NextResponse.json({ error: 'Professional not found' }, { status: 404 })
    }

    const portfolio = professional.portfolio || []

    return NextResponse.json({ portfolio })
  } catch (error) {
    console.error('Professional portfolio fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await getProfessionalAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { portfolio } = body

    // Find the professional associated with this admin
    const professional = await db.professional.findFirst({
      where: { adminId: admin.userId },
    })

    if (!professional) {
      return NextResponse.json({ error: 'Professional not found' }, { status: 404 })
    }

    // Update the portfolio
    const updatedProfessional = await db.professional.update({
      where: { id: professional.id },
      data: {
        portfolio: portfolio,
      },
    })

    return NextResponse.json({
      success: true,
      portfolio: updatedProfessional.portfolio
    })
  } catch (error) {
    console.error('Professional portfolio update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
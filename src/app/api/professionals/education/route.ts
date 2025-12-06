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
        education: true,
      },
    })

    if (!professional) {
      return NextResponse.json({ error: 'Professional not found' }, { status: 404 })
    }

    const education = professional.education || []

    return NextResponse.json({ education })
  } catch (error) {
    console.error('Professional education fetch error:', error)
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
    const { education } = body

    // Find the professional associated with this admin
    const professional = await db.professional.findFirst({
      where: { adminId: admin.userId },
    })

    if (!professional) {
      return NextResponse.json({ error: 'Professional not found' }, { status: 404 })
    }

    // Update the education
    const updatedProfessional = await db.professional.update({
      where: { id: professional.id },
      data: {
        education: education,
      },
    })

    return NextResponse.json({
      success: true,
      education: updatedProfessional.education
    })
  } catch (error) {
    console.error('Professional education update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
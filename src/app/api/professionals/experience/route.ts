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
        workExperience: true,
      },
    })

    if (!professional) {
      return NextResponse.json({ error: 'Professional not found' }, { status: 404 })
    }

    const workExperience = professional.workExperience || []

    return NextResponse.json({ workExperience })
  } catch (error) {
    console.error('Professional work experience fetch error:', error)
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
    const { workExperience } = body

    // Find the professional associated with this admin
    const professional = await db.professional.findFirst({
      where: { adminId: admin.userId },
    })

    if (!professional) {
      return NextResponse.json({ error: 'Professional not found' }, { status: 404 })
    }

    // Update the work experience
    const updatedProfessional = await db.professional.update({
      where: { id: professional.id },
      data: {
        workExperience: workExperience,
      },
    })

    return NextResponse.json({
      success: true,
      workExperience: updatedProfessional.workExperience
    })
  } catch (error) {
    console.error('Professional work experience update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
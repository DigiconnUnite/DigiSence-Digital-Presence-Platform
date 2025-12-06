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
        skills: true,
      },
    })

    if (!professional) {
      return NextResponse.json({ error: 'Professional not found' }, { status: 404 })
    }

    const skills = professional.skills || []

    return NextResponse.json({ skills })
  } catch (error) {
    console.error('Professional skills fetch error:', error)
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
    const { skills } = body

    // Find the professional associated with this admin
    const professional = await db.professional.findFirst({
      where: { adminId: admin.userId },
    })

    if (!professional) {
      return NextResponse.json({ error: 'Professional not found' }, { status: 404 })
    }

    // Update the skills
    const updatedProfessional = await db.professional.update({
      where: { id: professional.id },
      data: {
        skills: skills,
      },
    })

    return NextResponse.json({
      success: true,
      skills: updatedProfessional.skills
    })
  } catch (error) {
    console.error('Professional skills update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
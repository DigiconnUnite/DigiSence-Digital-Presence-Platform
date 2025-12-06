import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromRequest, verifyToken } from '@/lib/jwt'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

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

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const admin = await getProfessionalAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const inquiry = await (db as any).professionalInquiry.findUnique({
      where: { id },
      include: {
        professional: {
          select: {
            name: true,
            email: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
    }

    // Check if the inquiry belongs to the professional's admin
    const professional = await db.professional.findFirst({
      where: { adminId: admin.userId },
    })

    if (!professional || inquiry.professionalId !== professional.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({ inquiry })
  } catch (error) {
    console.error('Professional inquiry fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const admin = await getProfessionalAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // First check if the inquiry belongs to this professional
    const existingInquiry = await (db as any).professionalInquiry.findUnique({
      where: { id },
    })

    if (!existingInquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
    }

    const professional = await db.professional.findFirst({
      where: { adminId: admin.userId },
    })

    if (!professional || existingInquiry.professionalId !== professional.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const inquiry = await (db as any).professionalInquiry.update({
      where: { id },
      data: body,
    })

    return NextResponse.json({ inquiry })
  } catch (error) {
    console.error('Professional inquiry update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const admin = await getProfessionalAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // First check if the inquiry belongs to this professional
    const existingInquiry = await (db as any).professionalInquiry.findUnique({
      where: { id },
    })

    if (!existingInquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
    }

    const professional = await db.professional.findFirst({
      where: { adminId: admin.userId },
    })

    if (!professional || existingInquiry.professionalId !== professional.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await (db as any).professionalInquiry.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Inquiry deleted successfully' })
  } catch (error) {
    console.error('Professional inquiry deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
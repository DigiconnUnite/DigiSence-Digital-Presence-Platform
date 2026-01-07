import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromRequest, verifyToken } from '@/lib/jwt'
import { z } from 'zod'

const updateSchema = z.object({
  status: z.enum(['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED']),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
})

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getSuperAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: inquiryId } = await params

    if (!inquiryId) {
      return NextResponse.json({ error: 'Missing inquiry ID' }, { status: 400 })
    }

    const inquiry = await db.businessListingInquiry.findUnique({
      where: { id: inquiryId },
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
    }

    return NextResponse.json({ inquiry })
  } catch (error) {
    console.error('Business listing inquiry fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getSuperAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: inquiryId } = await params
    const body = await request.json()
    const { status, assignedTo, notes } = updateSchema.parse(body)

    const inquiry = await db.businessListingInquiry.update({
      where: { id: inquiryId },
      data: {
        status,
        assignedTo: assignedTo || null,
        notes: notes || null,
      },
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      inquiry,
    })
  } catch (error) {
    console.error('Business listing inquiry update error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getSuperAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: inquiryId } = await params

    if (!inquiryId) {
      return NextResponse.json({ error: 'Missing inquiry ID' }, { status: 400 })
    }

    // Delete the inquiry
    await db.businessListingInquiry.delete({
      where: { id: inquiryId },
    })

    return NextResponse.json({
      success: true,
      message: 'Business listing inquiry deleted successfully',
    })
  } catch (error) {
    console.error('Business listing inquiry deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
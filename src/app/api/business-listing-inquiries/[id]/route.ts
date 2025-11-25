import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromRequest, verifyToken } from '@/lib/jwt'
import { z } from 'zod'

const updateInquirySchema = z.object({
  status: z.enum(['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED']).optional(),
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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await getSuperAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status, assignedTo, notes } = updateInquirySchema.parse(body)

    const inquiryId = params.id

    // Check if inquiry exists
    const existingInquiry = await db.businessListingInquiry.findUnique({
      where: { id: inquiryId },
    })

    if (!existingInquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
    }

    // If assigning to a user, verify the user exists
    if (assignedTo) {
      const user = await db.user.findUnique({
        where: { id: assignedTo },
      })
      if (!user) {
        return NextResponse.json({ error: 'Assigned user not found' }, { status: 404 })
      }
    }

    // Update inquiry
    const updatedInquiry = await db.businessListingInquiry.update({
      where: { id: inquiryId },
      data: {
        ...(status && { status }),
        ...(assignedTo !== undefined && { assignedTo }),
        ...(notes !== undefined && { notes }),
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

    // Send email notification to user if status changed
    if (status && status !== existingInquiry.status) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications?businessListingInquiryId=${inquiryId}&statusUpdate=true`, {
          method: 'POST',
        })

        if (!response.ok) {
          console.error('Failed to send status update email notification')
        }
      } catch (error) {
        console.error('Status update email notification error:', error)
      }
    }

    return NextResponse.json({
      success: true,
      inquiry: updatedInquiry,
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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await getSuperAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const inquiryId = params.id

    // Check if inquiry exists
    const existingInquiry = await db.businessListingInquiry.findUnique({
      where: { id: inquiryId },
    })

    if (!existingInquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
    }

    // Delete inquiry
    await db.businessListingInquiry.delete({
      where: { id: inquiryId },
    })

    return NextResponse.json({
      success: true,
      message: 'Inquiry deleted successfully',
    })
  } catch (error) {
    console.error('Business listing inquiry delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromRequest, verifyToken } from '@/lib/jwt'
import { z } from 'zod'

const businessListingInquirySchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  businessDescription: z.string().optional(),
  contactName: z.string().min(2, 'Contact name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  requirements: z.string().min(10, 'Requirements must be at least 10 characters'),
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

export async function GET(request: NextRequest) {
  try {
    const admin = await getSuperAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const inquiries = await db.businessListingInquiry.findMany({
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ inquiries })
  } catch (error) {
    console.error('Business listing inquiries fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { businessName, businessDescription, contactName, email, phone, requirements } = businessListingInquirySchema.parse(body)

    // Create inquiry
    const inquiry = await db.businessListingInquiry.create({
      data: {
        businessName,
        businessDescription: businessDescription || null,
        contactName,
        email,
        phone: phone || null,
        requirements,
        status: 'PENDING',
      },
    })

    // Send email notification to admins
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'businessListingInquiry',
          businessListingInquiryId: inquiry.id,
        }),
      })

      if (!response.ok) {
        console.error('Failed to send email notification')
      }
    } catch (error) {
      console.error('Email notification error:', error)
    }

    return NextResponse.json({
      success: true,
      inquiry: {
        id: inquiry.id,
        businessName: inquiry.businessName,
        contactName: inquiry.contactName,
        email: inquiry.email,
        phone: inquiry.phone,
        requirements: inquiry.requirements,
        status: inquiry.status,
        createdAt: inquiry.createdAt,
      },
    })
  } catch (error) {
    console.error('Business listing inquiry submission error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
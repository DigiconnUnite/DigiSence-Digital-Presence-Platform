import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromRequest, verifyToken } from '@/lib/jwt'
import { z } from 'zod'

const registrationInquirySchema = z.object({
  type: z.enum(['BUSINESS', 'PROFESSIONAL']),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  businessName: z.string().optional(),
  location: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
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

    const inquiries = await db.registrationInquiry.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ inquiries })
  } catch (error) {
    console.error('Registration inquiries fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { type, name, businessName, location, email, phone } = registrationInquirySchema.parse(body)

    // Create inquiry
    const inquiry = await db.registrationInquiry.create({
      data: {
        type,
        name,
        businessName: businessName || null,
        location: location || null,
        email,
        phone: phone || null,
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
          type: 'registrationInquiry',
          registrationInquiryId: inquiry.id,
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
        type: inquiry.type,
        name: inquiry.name,
        businessName: inquiry.businessName,
        location: inquiry.location,
        email: inquiry.email,
        phone: inquiry.phone,
        status: inquiry.status,
        createdAt: inquiry.createdAt,
      },
    })
  } catch (error) {
    console.error('Registration inquiry submission error:', error)
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
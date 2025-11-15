import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromRequest, verifyToken } from '@/lib/jwt'
import { z } from 'zod'

const inquirySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(10),
  businessId: z.string(),
  productId: z.string().optional(),
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

    const inquiries = await db.inquiry.findMany({
      include: {
        business: {
          select: {
            name: true,
            email: true,
          },
        },
        product: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ inquiries })
  } catch (error) {
    console.error('Inquiries fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { name, email, phone, message, businessId, productId } = inquirySchema.parse(body)

    // Verify business exists
    const business = await db.business.findUnique({
      where: { id: businessId },
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Create inquiry
    const inquiry = await db.inquiry.create({
      data: {
        name,
        email,
        phone: phone ?? null,
        message,
        businessId,
        productId: productId ?? null,
        status: 'NEW',
      },
      include: {
        business: {
          select: {
            name: true,
            email: true,
          },
        },
        product: productId
          ? {
              select: {
                name: true,
              },
            }
          : undefined,
      },
    })

    // Send email notification to business
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications?inquiryId=${inquiry.id}`, {
        method: 'POST',
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
        name: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone,
        message: inquiry.message,
        status: inquiry.status,
        createdAt: inquiry.createdAt,
        business: inquiry.business,
        product: inquiry.product,
      },
    })
  } catch (error) {
    console.error('Inquiry submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
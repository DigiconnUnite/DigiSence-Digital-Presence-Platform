import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, unauthorized } from '@/lib/auth-helpers'

/**
 * GET /api/inquiries - List inquiries
 * POST /api/inquiries - Create inquiry (public)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    if (!user) return unauthorized()

    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {}
    if (businessId) where.businessId = businessId
    // Business admins can only see their own inquiries
    if (user.role === 'BUSINESS_ADMIN') {
      const business = await db.business.findFirst({ where: { adminId: user.userId } })
      if (business) where.businessId = business.id
    }

    const [total, inquiries] = await Promise.all([
      db.inquiry.count({ where }),
      db.inquiry.findMany({
        where,
        include: {
          business: { select: { id: true, name: true } },
          product: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])

    return NextResponse.json({
      inquiries,
      pagination: { page, limit, totalItems: total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Inquiries fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, message, businessId, productId } = body

    if (!name || !email || !message || !businessId) {
      return NextResponse.json(
        { error: 'Name, email, message, and businessId are required' },
        { status: 400 }
      )
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const business = await db.business.findUnique({
      where: { id: businessId },
      select: { id: true, isActive: true, email: true, name: true },
    })

    if (!business || !business.isActive) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const inquiry = await db.inquiry.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        message: message.trim(),
        businessId,
        productId: productId || null,
      },
    })

    return NextResponse.json({ success: true, inquiry })
  } catch (error) {
    console.error('Inquiry creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

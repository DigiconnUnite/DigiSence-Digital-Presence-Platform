import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromRequest, verifyToken } from '@/lib/jwt'
import { z } from 'zod'
import { headers } from 'next/headers'

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100 // Max requests per window

function checkRateLimit(identifier: string): boolean {
  const now = Date.now()
  const userLimit = rateLimitMap.get(identifier)

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false
  }

  userLimit.count++
  return true
}

const updateBusinessSchema = z.object({
  name: z.string().min(2).max(100).regex(/^[a-zA-Z0-9\s\-&.,()]+$/, 'Name contains invalid characters').optional(),
  description: z.string().max(1000).optional(),
  logo: z.string().url().optional().or(z.literal('')),
  address: z.string().max(500).optional(),
  phone: z.string().regex(/^[\+]?[1-9][\d\s\-\(\)]{0,20}$/, 'Invalid phone format').optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional().or(z.literal('')),
  categoryId: z.string().uuid().optional(),
  heroContent: z.any().optional(),
  brandContent: z.any().optional(),
  portfolioContent: z.any().optional(),
  isActive: z.boolean().optional(),
  ownerName: z.string().min(2).max(100).regex(/^[a-zA-Z\s\-.,]+$/, 'Owner name contains invalid characters').optional(),
  slug: z.string().optional(),
})

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6),
})

async function getBusinessAdmin(request: NextRequest) {
  const token = getTokenFromRequest(request) || request.cookies.get('auth-token')?.value
  
  if (!token) {
    return null
  }
  
  const payload = verifyToken(token)
  if (!payload || payload.role !== 'BUSINESS_ADMIN') {
    return null
  }
  
  return payload
}

export async function GET(request: NextRequest) {
  try {
    const admin = await getBusinessAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const business = await db.business.findUnique({
      where: { adminId: admin.userId },
      include: {
        admin: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            products: true,
            inquiries: true,
          },
        },
      },
    })

    // Ensure content fields are included in response
    if (business) {
      const businessWithContent = business as any
      businessWithContent.heroContent = businessWithContent.heroContent || { slides: [] }
      businessWithContent.brandContent = businessWithContent.brandContent || { brands: [] }
      businessWithContent.portfolioContent = businessWithContent.portfolioContent || { images: [] }
      return NextResponse.json({ business: businessWithContent })
    }

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    return NextResponse.json({ business })
  } catch (error) {
    console.error('Business fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await getBusinessAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    if (!checkRateLimit(`business_update_${admin.userId}`)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const updateData = updateBusinessSchema.parse(body)

    // Check if business exists and belongs to this admin
    const existingBusiness = await db.business.findUnique({
      where: { adminId: admin.userId },
    })

    if (!existingBusiness) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Extract ownerName from updateData before updating business
    const { ownerName, ...businessUpdateData } = updateData

    // Filter out empty strings and convert to null for database
    const cleanBusinessUpdateData = Object.fromEntries(
      Object.entries(businessUpdateData).map(([key, value]) => [
        key,
        value === "" ? null : value
      ])
    )

    // Update slug if name changed
    let updateFields = { ...cleanBusinessUpdateData }
    if (businessUpdateData.name && businessUpdateData.name !== existingBusiness.name) {
      const newSlug = businessUpdateData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

      // Check if new slug is already taken
      const slugExists = await db.business.findFirst({
        where: {
          slug: newSlug,
          id: { not: existingBusiness.id }
        },
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'Business with this name already exists' },
          { status: 400 }
        )
      }

      updateFields.slug = newSlug
    }

    const business = await db.business.update({
      where: { id: existingBusiness.id },
      data: updateFields,
      include: {
        admin: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Update owner name if provided and not empty
    if (ownerName !== undefined && ownerName.trim() !== "") {
      await db.user.update({
        where: { id: admin.userId },
        data: { name: ownerName.trim() },
      })
      // Update the business response to include the new name
      business.admin.name = ownerName.trim()
    }

    // Ensure content fields are included in response
    const businessWithContent = business as any
    businessWithContent.heroContent = businessWithContent.heroContent || { slides: [] }
    businessWithContent.brandContent = businessWithContent.brandContent || { brands: [] }
    businessWithContent.portfolioContent = businessWithContent.portfolioContent || { images: [] }

    return NextResponse.json({
      success: true,
      business: businessWithContent,
    })
  } catch (error) {
    console.error('Business update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getBusinessAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { newPassword } = resetPasswordSchema.parse(body)

    // Check if business exists and belongs to this admin
    const business = await db.business.findUnique({
      where: { adminId: admin.userId },
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Generate new password
    const { hashPassword } = await import('@/lib/auth')
    const hashedPassword = await hashPassword(newPassword)

    // Update user password
    await db.user.update({
      where: { id: business.adminId },
      data: { password: hashedPassword },
    })

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
      newPassword,
    })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
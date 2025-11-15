import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromRequest, verifyToken } from '@/lib/jwt'
import { z } from 'zod'

const updateBusinessSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  logo: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
  categoryId: z.string().optional(),
  heroContent: z.any().optional(),
  brandContent: z.any().optional(),
  additionalContent: z.string().optional(),
  isActive: z.boolean().optional(),
  ownerName: z.string().optional(),
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

    return NextResponse.json({
      success: true,
      business,
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
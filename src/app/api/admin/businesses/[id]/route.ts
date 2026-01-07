import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromRequest, verifyToken } from '@/lib/jwt'
import { z } from 'zod'

const updateBusinessSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  logo: z.string().url().optional().or(z.literal('')),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional().or(z.literal('')),
  categoryId: z.string().optional(),
  heroContent: z.any().optional(),
  brandContent: z.any().optional(),
  isActive: z.boolean().optional(),
  slug: z.string().optional(),
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getSuperAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Extract ID from params (proper Next.js way)
    const { id: businessId } = await params

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const updateData = updateBusinessSchema.parse(body)

    // Check if business exists and belongs to this admin
    const existingBusiness = await db.business.findUnique({
      where: { id: businessId },
    })

    if (!existingBusiness) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Update slug if name changed
    let updateFields = { ...updateData }
    if (updateData.name && updateData.name !== existingBusiness.name) {
      const newSlug = updateData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      
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
      data: {
        ...updateFields,
        description: updateFields.description && updateFields.description !== '' ? updateFields.description : undefined,
        address: updateFields.address && updateFields.address !== '' ? updateFields.address : undefined,
        phone: updateFields.phone && updateFields.phone !== '' ? updateFields.phone : undefined,
        website: updateFields.website && updateFields.website !== '' ? updateFields.website : undefined,
        categoryId: updateFields.categoryId && updateFields.categoryId !== '' ? updateFields.categoryId : undefined,
      },
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

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getSuperAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Extract ID from params (proper Next.js way)
    const { id: businessId } = await params

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 })
    }

    // Check if business exists
    const existingBusiness = await db.business.findUnique({
      where: { id: businessId },
    })

    if (!existingBusiness) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Use transaction to ensure all deletions succeed or fail together
    await db.$transaction(async (tx) => {
      // Delete related records first (products, inquiries)
      await tx.product.deleteMany({
        where: { businessId },
      })

      await tx.inquiry.deleteMany({
        where: { businessId },
      })

      // Delete the business
      await tx.business.delete({
        where: { id: businessId },
      })

      // Also delete the associated admin user
      await tx.user.delete({
        where: { id: existingBusiness.adminId },
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Business and associated user deleted successfully',
    })
  } catch (error) {
    console.error('Business deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete business and associated user' },
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

    // Extract ID from params (proper Next.js way)
    const { id: businessId } = await params

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 })
    }

    // Check if business exists
    const existingBusiness = await db.business.findUnique({
      where: { id: businessId },
    })

    if (!existingBusiness) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const body = await request.json()
    const { isActive } = body

    const business = await db.business.update({
      where: { id: businessId },
      data: { isActive },
    })

    return NextResponse.json({
      success: true,
      business,
    })
  } catch (error) {
    console.error('Business toggle error:', error)
    return NextResponse.json(
      { error: 'Failed to toggle business status' },
      { status: 500 }
    )
  }
}
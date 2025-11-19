import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromRequest, verifyToken } from '@/lib/jwt'
import { z } from 'zod'

const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  price: z.string().optional(),
  image: z.string().optional(),
  categoryId: z.string().optional(),
  brandName: z.string().optional(),
  inStock: z.boolean().optional(),
  isActive: z.boolean().optional(),
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

async function getBusinessId(adminId: string) {
  const business = await db.business.findUnique({
    where: { adminId },
    select: { id: true }
  })
  return business?.id
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getBusinessAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const businessId = await getBusinessId(admin.userId)
    if (!businessId) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const { id: productId } = await params
    
    // Check if product exists and belongs to this business
    const existingProduct = await db.product.findFirst({
      where: { 
        id: productId,
        businessId 
      },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const body = await request.json()
    const updateData = updateProductSchema.parse(body)

    const product = await db.product.update({
      where: { id: productId },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      product,
    })
  } catch (error) {
    console.error('Product update error:', error)
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
    const admin = await getBusinessAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const businessId = await getBusinessId(admin.userId)
    if (!businessId) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const { id: productId } = await params
    
    // Check if product exists and belongs to this business
    const existingProduct = await db.product.findFirst({
      where: { 
        id: productId,
        businessId 
      },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    await db.product.delete({
      where: { id: productId },
    })

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    })
  } catch (error) {
    console.error('Product deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromRequest, verifyToken } from '@/lib/jwt'
import { z } from 'zod'

const brandSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  logo: z.string().optional(),
})

async function getAdminUser(request: NextRequest) {
  const token = getTokenFromRequest(request) || request.cookies.get('auth-token')?.value
  
  if (!token) {
    return null
  }
  
  const payload = verifyToken(token)
  if (!payload || (payload.role !== 'BUSINESS_ADMIN' && payload.role !== 'SUPER_ADMIN')) {
    return null
  }
  
  return payload
}

export async function GET(request: NextRequest) {
  try {
    const brands = await db.brand.findMany({
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ brands })
  } catch (error) {
    console.error('Brands fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminUser(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const brandData = brandSchema.parse(body)

    // Generate slug from name
    const slug = brandData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const brand = await db.brand.create({
      data: {
        ...brandData,
        slug,
      },
    })

    return NextResponse.json({
      success: true,
      brand,
    })
  } catch (error) {
    console.error('Brand creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await getAdminUser(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body
    
    if (!id) {
      return NextResponse.json({ error: 'Brand ID is required' }, { status: 400 })
    }

    const brandData = brandSchema.partial().parse(updateData)
    
    // Prepare update data with slug if name is being changed
    const updateDataWithSlug = {
      ...brandData,
      ...(brandData.name && {
        slug: brandData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      })
    }

    const brand = await db.brand.update({
      where: { id },
      data: updateDataWithSlug,
    })

    return NextResponse.json({
      success: true,
      brand,
    })
  } catch (error) {
    console.error('Brand update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await getAdminUser(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Brand ID is required' }, { status: 400 })
    }

    // Check if brand is being used by any products
    const productsUsingBrand = await db.product.count({
      where: { brandId: id },
    })

    if (productsUsingBrand > 0) {
      return NextResponse.json(
        { error: 'Cannot delete brand that is being used by products' },
        { status: 400 }
      )
    }

    await db.brand.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Brand deleted successfully',
    })
  } catch (error) {
    console.error('Brand deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
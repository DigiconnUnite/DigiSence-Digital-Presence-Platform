import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromRequest, verifyToken } from '@/lib/jwt'
import { z } from 'zod'

const createBusinessSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  adminName: z.string().min(2),
  categoryId: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional().transform((val) => {
    if (!val || val === '') return '';
    if (!val.startsWith('http://') && !val.startsWith('https://')) {
      return 'https://' + val;
    }
    return val;
  }).pipe(z.union([z.string().url(), z.literal('')])),
})

const updateBusinessSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  logo: z.union([z.string().url(), z.literal('')]).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().optional().transform((val) => {
    if (!val || val === '') return '';
    if (!val.startsWith('http://') && !val.startsWith('https://')) {
      return 'https://' + val;
    }
    return val;
  }).pipe(z.union([z.string().url(), z.literal('')])),
  categoryId: z.string().optional(),
  heroContent: z.any().optional(),
  brandContent: z.any().optional(),
  additionalContent: z.string().optional(),
  isActive: z.boolean().optional(),
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

    const businesses = await db.business.findMany({
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
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ businesses })
  } catch (error) {
    console.error('Businesses fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getSuperAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const createData = createBusinessSchema.parse(body)

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email: createData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    // Create slug from name
    const slug = createData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    // Check if slug is already taken
    const slugExists = await db.business.findUnique({
      where: { slug },
    })

    if (slugExists) {
      return NextResponse.json(
        { error: 'Business with this name already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const { hashPassword } = await import('@/lib/auth')
    const hashedPassword = await hashPassword(createData.password)

    // Create user and business in transaction
    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: createData.email,
          password: hashedPassword,
          name: createData.adminName,
          role: 'BUSINESS_ADMIN',
        },
      })

      const business = await tx.business.create({
        data: {
          name: createData.name,
          slug,
          description: createData.description && createData.description !== '' ? createData.description : undefined,
          address: createData.address && createData.address !== '' ? createData.address : undefined,
          phone: createData.phone && createData.phone !== '' ? createData.phone : undefined,
          email: createData.email,
          website: createData.website && createData.website !== '' ? createData.website : undefined,
          categoryId: createData.categoryId && createData.categoryId !== '' ? createData.categoryId : undefined,
          adminId: user.id,
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

      return { user, business }
    })

    return NextResponse.json({
      success: true,
      business: result.business,
      loginCredentials: {
        email: createData.email,
        password: createData.password,
      },
    })
  } catch (error) {
    console.error('Business creation error:', error)
    console.error('Error stack:', (error as any).stack)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await getSuperAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 })
    }

    // Check if business exists
    const existingBusiness = await db.business.findUnique({
      where: { id },
    })

    if (!existingBusiness) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Delete related records (products, inquiries)
    await db.product.deleteMany({
      where: { businessId: id },
    })

    await db.inquiry.deleteMany({
      where: { businessId: id },
    })

    // Delete the business
    await db.business.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Business deleted successfully',
    })
  } catch (error) {
    console.error('Business deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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

    const { id: businessId } = await params
    
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
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireSuperAdmin, unauthorized, badRequest } from '@/lib/auth-helpers'
import { generateUniqueBusinessSlug } from '@/lib/slug-helpers'
import { hashPassword } from '@/lib/auth'  // FIXED: top-level import, not dynamic inside transaction
import { z } from 'zod'
import { sendAccountCreationNotification } from '@/lib/email'

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
    if (!val || val === '') return undefined
    if (!val.startsWith('http://') && !val.startsWith('https://')) return 'https://' + val
    return val
  }),
})

export async function GET(request: NextRequest) {
  try {
    const admin = await requireSuperAdmin(request)
    if (!admin) return unauthorized()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const status = searchParams.get('status') || 'all'
    const categoryId = searchParams.get('categoryId') || ''

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { admin: { email: { contains: search, mode: 'insensitive' } } },
      ]
    }
    if (status !== 'all') where.isActive = status === 'active'
    if (categoryId) where.categoryId = categoryId

    const [total, businesses] = await Promise.all([
      db.business.count({ where }),
      db.business.findMany({
        where,
        include: {
          admin: { select: { id: true, email: true, name: true } },
          category: { select: { id: true, name: true } },
          _count: { select: { products: true, inquiries: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])

    return NextResponse.json({
      businesses,
      pagination: {
        page,
        limit,
        // FIXED: standardized to 'totalItems' (was 'total' which didn't match frontend interfaces)
        totalItems: total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Businesses fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireSuperAdmin(request)
    if (!admin) return unauthorized()

    const body = await request.json()
    const createData = createBusinessSchema.parse(body)

    const existingUser = await db.user.findUnique({ where: { email: createData.email } })
    if (existingUser) return badRequest('Email already exists')

    const slug = await generateUniqueBusinessSlug(createData.name)

    // FIXED: hashPassword imported at top level — no longer inside transaction
    const hashedPassword = await hashPassword(createData.password)

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
          description: createData.description || undefined,
          address: createData.address || undefined,
          phone: createData.phone || undefined,
          email: createData.email,
          website: createData.website || undefined,
          categoryId: createData.categoryId || undefined,
          adminId: user.id,
        },
        include: {
          admin: { select: { id: true, email: true, name: true } },
          category: { select: { id: true, name: true } },
          _count: { select: { products: true, inquiries: true } },
        },
      })

      return { user, business }
    })

    try {
      await sendAccountCreationNotification({
        name: createData.adminName,
        email: createData.email,
        password: createData.password,
        accountType: 'business',
        loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://mydigisence.com'}/login`,
      })
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
    }

    if (global.io) {
      global.io.emit('business-created', {
        business: result.business,
        action: 'create',
        timestamp: new Date().toISOString(),
        adminId: admin.userId,
      })
    }

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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireSuperAdmin(request)
    if (!admin) return unauthorized()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return badRequest('Business ID is required')

    const existingBusiness = await db.business.findUnique({ where: { id } })
    if (!existingBusiness) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // FIXED: Now deletes the associated user too (previously it didn't)
    await db.$transaction([
      db.product.deleteMany({ where: { businessId: id } }),
      db.inquiry.deleteMany({ where: { businessId: id } }),
      db.business.delete({ where: { id } }),
      db.user.delete({ where: { id: existingBusiness.adminId } }),
    ])

    if (global.io) {
      global.io.emit('business-deleted', {
        businessId: id,
        action: 'delete',
        timestamp: new Date().toISOString(),
        adminId: admin.userId,
      })
    }

    return NextResponse.json({ success: true, message: 'Business and associated user deleted' })
  } catch (error) {
    console.error('Business deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

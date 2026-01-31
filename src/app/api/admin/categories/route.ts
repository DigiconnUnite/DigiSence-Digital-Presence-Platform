import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromRequest, verifyToken } from '@/lib/jwt'
import { z } from 'zod'

const categorySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  parentId: z.string().nullable().optional(),
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

    const categories = await db.category.findMany({
      where: {
        type: 'BUSINESS',
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            businesses: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Categories fetch error:', error)
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
    const categoryData = categorySchema.parse(body)

    // Generate slug from name
    const slug = categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    // Check if slug is already taken
    const existingCategory = await db.category.findUnique({
      where: { slug }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 400 }
      )
    }

    const createData: any = {
      name: categoryData.name,
      slug,
      description: categoryData.description,
      type: 'BUSINESS',
    }

    if (categoryData.parentId) {
      createData.parentId = categoryData.parentId
    }

    const category = await db.category.create({
      data: createData,
    })

    return NextResponse.json({
      success: true,
      category,
    })
  } catch (error) {
    console.error('Category creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
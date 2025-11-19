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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getSuperAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: categoryId } = await params

    const body = await request.json()
    const updateData = categorySchema.parse(body)

    // Get existing category to check if name changed
    const existingCategory = await db.category.findUnique({
      where: { id: categoryId }
    })

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const finalUpdateData: any = { ...updateData }

    // Generate new slug if name changed
    if (updateData.name && updateData.name !== existingCategory.name) {
      const newSlug = updateData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

      // Check if new slug is already taken by another category
      const slugExists = await db.category.findFirst({
        where: {
          slug: newSlug,
          id: { not: categoryId }
        }
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'Category with this name already exists' },
          { status: 400 }
        )
      }

      finalUpdateData.slug = newSlug
    }

    const category = await db.category.update({
      where: { id: categoryId },
      data: finalUpdateData,
    })

    return NextResponse.json({
      success: true,
      category,
    })
  } catch (error) {
    console.error('Category update error:', error)
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getSuperAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: categoryId } = await params

    // Check if category has children
    const hasChildren = await db.category.findFirst({
      where: { parentId: categoryId }
    })

    if (hasChildren) {
      return NextResponse.json(
        { error: 'Cannot delete category with child categories. Please delete child categories first.' },
        { status: 400 }
      )
    }

    await db.category.delete({
      where: { id: categoryId },
    })

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    })
  } catch (error) {
    console.error('Category deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const id = searchParams.get('id')

    if (!slug && !id) {
      return NextResponse.json({ error: 'Slug or ID parameter required' }, { status: 400 })
    }

    const whereClause = slug ? { slug, isActive: true } : { id: id as string, isActive: true }

    const business = await db.business.findFirst({
      where: whereClause,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logo: true,
        address: true,
        phone: true,
        email: true,
        website: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        adminId: true,
        categoryId: true,
        heroContent: true,
        brandContent: true,
        portfolioContent: true,
        admin: {
          select: {
            name: true,
            email: true,
          },
        },
        category: true,
        products: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            image: true,
            inStock: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            businessId: true,
            categoryId: true,
            brandName: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
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
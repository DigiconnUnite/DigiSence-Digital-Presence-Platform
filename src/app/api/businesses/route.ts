import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const id = searchParams.get('id')

    if (slug || id) {
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
        facebook: true,
        twitter: true,
        instagram: true,
        linkedin: true,
        about: true,
        catalogPdf: true,
        openingHours: true,
        gstNumber: true,
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
            additionalInfo: true,
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
  } else {
    // List all active businesses
    const businesses = await db.business.findMany({
      where: { isActive: true },
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
        category: {
          select: {
            name: true,
          },
        },
        products: {
          where: { isActive: true },
          select: {
            id: true,
          },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ businesses })
  }
  } catch (error) {
    console.error('Business fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
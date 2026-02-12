import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Use optimized query with proper indexing
    const categories = await db.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        parentId: true,
        type: true,
        createdAt: true,
        updatedAt: true,
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
        // Use a more efficient count query
        _count: {
          select: {
            businesses: {
              where: {
                isActive: true
              }
            }
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    // Add caching headers - cache for 60 seconds with stale-while-revalidate
    const response = NextResponse.json({ categories })
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    
    return response
  } catch (error) {
    console.error('Categories fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
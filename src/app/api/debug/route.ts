import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const businesses = await db.business.findMany({
      select: {
        id: true,
        name: true,
        logo: true,
        heroContent: true,
        brandContent: true,
        portfolioContent: true,
        products: {
          select: {
            id: true,
            name: true,
            image: true,
          },
          take: 3
        }
      },
      take: 5
    })

    const professionals = await db.professional.findMany({
      select: {
        id: true,
        name: true,
        profilePicture: true,
        banner: true,
        professionalHeadline: true,
        location: true,
        isActive: true,
      },
      take: 10
    })

    return NextResponse.json({ businesses, professionals })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({ error: 'Debug failed' }, { status: 500 })
  }
}
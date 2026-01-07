import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromRequest, verifyToken } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  try {
    const admin = await getSuperAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Set headers for Server-Sent Events
    const headers = new Headers()
    headers.set('Content-Type', 'text/event-stream')
    headers.set('Cache-Control', 'no-cache')
    headers.set('Connection', 'keep-alive')
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Access-Control-Allow-Headers', 'Cache-Control')

    const stream = new ReadableStream({
      start(controller) {
        // Send initial data
        sendInitialData(controller, admin)

        // Set up interval to send updates
        const interval = setInterval(async () => {
          try {
            const updateData = await getUpdateData()
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify(updateData)}\n\n`)
            )
          } catch (error) {
            console.error('SSE update error:', error)
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify({ error: 'Update failed' })}\n\n`)
            )
          }
        }, 5000) // Send updates every 5 seconds

        // Clean up on close
        request.signal.addEventListener('abort', () => {
          clearInterval(interval)
          controller.close()
        })
      }
    })

    return new NextResponse(stream, { headers })
  } catch (error) {
    console.error('SSE connection error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

async function sendInitialData(controller: ReadableStreamDefaultController, admin: any) {
  try {
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

    const professionals = await db.professional.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        professionalHeadline: true,
        profilePicture: true,
        banner: true,
        location: true,
        email: true,
        website: true,
        adminId: true,
        workExperience: true,
        education: true,
        skills: true,
        servicesOffered: true,
        portfolio: true,
        isActive: true,
        admin: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const categories = await db.category.findMany({
      orderBy: { createdAt: 'desc' },
    })

    const inquiries = await db.inquiry.findMany({
      orderBy: { createdAt: 'desc' },
    })

    const businessListingInquiries = await db.businessListingInquiry.findMany({
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const registrationInquiries = await db.registrationInquiry.findMany({
      orderBy: { createdAt: 'desc' },
    })

    const initialData = {
      type: 'initial',
      timestamp: new Date().toISOString(),
      data: {
        businesses,
        professionals,
        categories,
        inquiries,
        businessListingInquiries,
        registrationInquiries,
      }
    }

    controller.enqueue(
      new TextEncoder().encode(`data: ${JSON.stringify(initialData)}\n\n`)
    )
  } catch (error) {
    console.error('SSE initial data error:', error)
    controller.enqueue(
      new TextEncoder().encode(`data: ${JSON.stringify({ error: 'Initial data failed' })}\n\n`)
    )
  }
}

async function getUpdateData() {
  try {
    // Get counts and recent changes
    const businessCount = await db.business.count()
    const professionalCount = await db.professional.count()
    const categoryCount = await db.category.count()
    const inquiryCount = await db.inquiry.count()
    const businessListingInquiryCount = await db.businessListingInquiry.count()
    const registrationInquiryCount = await db.registrationInquiry.count()

    // Get recent changes (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    
    const recentBusinesses = await db.business.findMany({
      where: {
        updatedAt: {
          gte: fiveMinutesAgo,
        },
      },
      select: {
        id: true,
        name: true,
        updatedAt: true,
        isActive: true,
      },
    })

    const recentProfessionals = await db.professional.findMany({
      where: {
        updatedAt: {
          gte: fiveMinutesAgo,
        },
      },
      select: {
        id: true,
        name: true,
        updatedAt: true,
        isActive: true,
      },
    })

    const recentInquiries = await db.inquiry.findMany({
      where: {
        updatedAt: {
          gte: fiveMinutesAgo,
        },
      },
      select: {
        id: true,
        name: true,
        updatedAt: true,
        status: true,
      },
    })

    return {
      type: 'update',
      timestamp: new Date().toISOString(),
      data: {
        counts: {
          businesses: businessCount,
          professionals: professionalCount,
          categories: categoryCount,
          inquiries: inquiryCount,
          businessListingInquiries: businessListingInquiryCount,
          registrationInquiries: registrationInquiryCount,
        },
        recentChanges: {
          businesses: recentBusinesses,
          professionals: recentProfessionals,
          inquiries: recentInquiries,
        }
      }
    }
  } catch (error) {
    console.error('SSE update data error:', error)
    throw error
  }
}
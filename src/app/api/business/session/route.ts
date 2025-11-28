import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromRequest, verifyToken } from '@/lib/jwt'

async function getBusinessAdmin(request: NextRequest) {
  const token = getTokenFromRequest(request) || request.cookies.get('auth-token')?.value

  if (!token) {
    return null
  }

  const payload = verifyToken(token)
  if (!payload || payload.role !== 'BUSINESS_ADMIN') {
    return null
  }

  return payload
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getBusinessAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action } = await request.json()

    if (action === 'start') {
      // Check if another user is already active
      const activeSession = await db.businessAdminSession.findFirst({
        where: {
          businessId: admin.businessId!,
          isActive: true,
          userId: { not: admin.userId }
        },
        include: {
          user: { select: { name: true, email: true } }
        }
      })

      if (activeSession) {
        return NextResponse.json({
          error: 'Access denied',
          message: `Another user (${activeSession.user.name || activeSession.user.email}) is currently accessing the admin panel.`,
          activeUser: {
            name: activeSession.user.name,
            email: activeSession.user.email
          }
        }, { status: 409 })
      }

      // Create or update session
      const userSession = await db.businessAdminSession.upsert({
        where: {
          businessId_userId: {
            businessId: admin.businessId!,
            userId: admin.userId
          }
        },
        update: {
          lastActivity: new Date(),
          isActive: true
        },
        create: {
          businessId: admin.businessId!,
          userId: admin.userId
        }
      })

      return NextResponse.json({ success: true, session: userSession })
    }

    if (action === 'heartbeat') {
      // Update last activity
      await db.businessAdminSession.updateMany({
        where: {
          businessId: admin.businessId!,
          userId: admin.userId,
          isActive: true
        },
        data: {
          lastActivity: new Date()
        }
      })

      return NextResponse.json({ success: true })
    }

    if (action === 'end') {
      // End session
      await db.businessAdminSession.updateMany({
        where: {
          businessId: admin.businessId!,
          userId: admin.userId,
          isActive: true
        },
        data: {
          isActive: false
        }
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Session management error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const admin = await getBusinessAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check current active session for this business
    const activeSession = await db.businessAdminSession.findFirst({
      where: {
        businessId: admin.businessId!,
        isActive: true
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    })

    if (!activeSession) {
      return NextResponse.json({ hasActiveSession: false })
    }

    const isCurrentUser = activeSession.userId === admin.userId

    return NextResponse.json({
      hasActiveSession: true,
      isCurrentUser,
      activeUser: isCurrentUser ? null : {
        name: activeSession.user.name,
        email: activeSession.user.email
      }
    })

  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
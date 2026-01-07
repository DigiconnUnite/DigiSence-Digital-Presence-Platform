import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromRequest, verifyToken } from '@/lib/jwt'
import { z } from 'zod'

const updateSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED']),
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
  { params }: { params: { id: string } }
) {
  try {
    // Alternative approach: extract ID from URL pathname
    const url = new URL(request.url)
    const pathname = url.pathname
    const pathSegments = pathname.split('/')
    const extractedId = pathSegments[pathSegments.length - 1]
    
    // Use the extracted ID if params.id is undefined
    const inquiryId = params.id || extractedId

    if (!inquiryId) {
      return NextResponse.json({ error: 'Missing registration inquiry ID' }, { status: 400 })
    }

    const admin = await getSuperAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status } = updateSchema.parse(body)

    const inquiry = await db.registrationInquiry.update({
      where: { id: inquiryId },
      data: { status },
    })

    return NextResponse.json({
      success: true,
      inquiry,
    })
  } catch (error) {
    console.error('Registration inquiry update error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
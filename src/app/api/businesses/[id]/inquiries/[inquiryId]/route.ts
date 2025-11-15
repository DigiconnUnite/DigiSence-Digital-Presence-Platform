import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromRequest, verifyToken } from '@/lib/jwt'
import { z } from 'zod'

const updateInquirySchema = z.object({
  status: z.enum(['NEW', 'READ', 'REPLIED', 'CLOSED']),
})

async function getBusinessAdmin(request: NextRequest, businessId: string) {
  const token = getTokenFromRequest(request) || request.cookies.get('auth-token')?.value
  
  if (!token) {
    return null
  }
  
  const payload = verifyToken(token)
  if (!payload || payload.role !== 'BUSINESS_ADMIN' || payload.businessId !== businessId) {
    return null
  }
  
  return payload
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; inquiryId: string }> }
) {
  try {
    const { id, inquiryId } = await params
    const admin = await getBusinessAdmin(request, id)
    
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify inquiry belongs to this business
    const existingInquiry = await db.inquiry.findFirst({
      where: { 
        id: inquiryId,
        businessId: id 
      },
    })

    if (!existingInquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
    }

    const body = await request.json()
    const { status } = updateInquirySchema.parse(body)

    const inquiry = await db.inquiry.update({
      where: { id: inquiryId },
      data: { status },
    })

    return NextResponse.json({
      success: true,
      inquiry,
    })
  } catch (error) {
    console.error('Inquiry update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
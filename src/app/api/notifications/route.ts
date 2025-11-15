import { NextRequest, NextResponse } from 'next/server'
import { sendInquiryNotification } from '@/lib/email'

interface NotificationData {
  type: 'inquiry' | 'general'
  inquiryId?: string
  message?: string
}

export async function POST(request: NextRequest) {
  try {
    const data: NotificationData = await request.json()
    
    if (data.type === 'inquiry' && data.inquiryId) {
      // Send inquiry notification
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inquiries/${data.inquiryId}`)
      if (response.ok) {
        const inquiry = await response.json()
        
        if (inquiry.inquiry) {
          await sendInquiryNotification({
            businessName: inquiry.business.name,
            businessEmail: inquiry.business.email,
            customerName: inquiry.name,
            customerEmail: inquiry.email,
            customerPhone: inquiry.phone,
            message: inquiry.message,
            productName: inquiry.product?.name,
            inquiryUrl: `${process.env.NEXT_PUBLIC_API_URL}/dashboard/inquiries`,
          })
        }
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Notification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
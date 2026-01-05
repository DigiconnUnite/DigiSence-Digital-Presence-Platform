import { NextRequest, NextResponse } from 'next/server'
import { sendInquiryNotification, sendAccountCreationNotification } from '@/lib/email'

interface NotificationData {
  type: 'inquiry' | 'businessListingInquiry' | 'accountCreation' | 'general'
  inquiryId?: string
  businessListingInquiryId?: string
  statusUpdate?: boolean
  message?: string
  // Account creation fields
  name?: string
  email?: string
  password?: string
  accountType?: 'business' | 'professional'
  loginUrl?: string
}

export async function POST(request: NextRequest) {
  try {
    const data: NotificationData = await request.json()

    if (data.type === 'inquiry' && data.inquiryId) {
      // For inquiry notifications, we need to fetch the inquiry data
      // Since this is an internal call, we'll fetch it directly from DB
      const { db } = await import('@/lib/db')
      const inquiry = await db.inquiry.findUnique({
        where: { id: data.inquiryId },
        include: {
          business: {
            select: {
              name: true,
              email: true,
            },
          },
          product: {
            select: {
              name: true,
            },
          },
        },
      })

      if (inquiry) {
        await sendInquiryNotification({
          businessName: inquiry.business.name,
          businessEmail: inquiry.business.email || '',
          customerName: inquiry.name,
          customerEmail: inquiry.email,
          customerPhone: inquiry.phone || undefined,
          message: inquiry.message,
          productName: inquiry.product?.name,
          inquiryUrl: `${process.env.NEXT_PUBLIC_API_URL}/dashboard/inquiries`,
        })
      }
    } else if (data.type === 'businessListingInquiry' && data.businessListingInquiryId) {
      // Send business listing inquiry notification to admins
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/business-listing-inquiries/${data.businessListingInquiryId}`)
      if (response.ok) {
        const inquiry = await response.json()

        if (inquiry.inquiry) {
          // Send notification to admin email (you might want to get admin emails from database)
          const adminEmail = process.env.ADMIN_EMAIL || 'admin@digisence.com'

          // For now, send a simple notification
          // You can extend sendInquiryNotification or create a new function
          console.log('Business listing inquiry submitted:', inquiry.inquiry.businessName)
          // TODO: Implement admin notification email
        }
      }
    } else if (data.type === 'accountCreation' && data.name && data.email && data.password && data.accountType && data.loginUrl) {
      // Send account creation notification
      await sendAccountCreationNotification({
        name: data.name,
        email: data.email,
        password: data.password,
        accountType: data.accountType,
        loginUrl: data.loginUrl,
      })
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
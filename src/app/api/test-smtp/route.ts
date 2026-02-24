import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { sendTestEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    // Get the test email from request body
    const body = await request.json()
    const testEmail = body.email

    if (!testEmail) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      )
    }

    // Use the sendTestEmail function
    const result = await sendTestEmail({ email: testEmail })

    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Failed to send test email',
          details: result.error
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      messageId: result.messageId,
    })
  } catch (error) {
    console.error('SMTP Test Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Return SMTP configuration status (without sensitive data)
  return NextResponse.json({
    configured: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
    host: process.env.SMTP_HOST || 'Not configured',
    port: process.env.SMTP_PORT || 'Not configured',
    secure: process.env.SMTP_SECURE || 'Not configured',
    from: process.env.SMTP_FROM || 'Not configured',
  })
}

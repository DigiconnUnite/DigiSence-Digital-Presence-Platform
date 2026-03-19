import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

/**
 * POST /api/contact
 * 
 * NEW: Handles contact form submission.
 * Previously the /contact page had a form with no handler.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = contactSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid data' },
        { status: 400 }
      )
    }

    const { name, email, subject, message } = parsed.data

    // Send email to platform admins
    // Using the existing email infrastructure
    try {
      const { sendEmail } = await import('@/lib/email')
      await sendEmail({
        to: process.env.ADMIN_EMAIL || process.env.SMTP_FROM || 'admin@mydigisence.com',
        subject: `Contact Form: ${subject}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr />
          <p>${message.replace(/\n/g, '<br />')}</p>
        `,
      })
    } catch (emailError) {
      console.error('Contact email failed:', emailError)
      // Still return success — log the submission
    }

    console.log('Contact form submission:', { name, email, subject, message: message.slice(0, 100) })

    return NextResponse.json({
      success: true,
      message: 'Your message has been received. We will get back to you within 24 hours.',
    })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}

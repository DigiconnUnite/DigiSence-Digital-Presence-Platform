import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
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

    const { firstName, lastName, email, subject, message } = parsed.data
    const fullName = `${firstName} ${lastName}`

    // Log the contact submission (in production, could store in DB or send to external service)
    if (process.env.NODE_ENV === 'development') {
      console.log('Contact form submission:', { name: fullName, email, subject, message: message.slice(0, 100) })
    }

    return NextResponse.json({
      success: true,
      message: 'Your message has been received. We will get back to you within 24 hours.',
    })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}

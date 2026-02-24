import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromRequest, verifyToken } from '@/lib/jwt'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import { sendRegistrationApproved, sendRegistrationRejected } from '@/lib/email'

const updateSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
  reason: z.string().optional(),
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

// Generate random password
function generateRandomPassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: inquiryId } = await params

    if (!inquiryId) {
      return NextResponse.json({ error: 'Missing registration inquiry ID' }, { status: 400 })
    }

    const inquiry = await db.registrationInquiry.findUnique({
      where: { id: inquiryId },
    })

    if (!inquiry) {
      return NextResponse.json({ error: 'Registration inquiry not found' }, { status: 404 })
    }

    return NextResponse.json({ inquiry })
  } catch (error) {
    console.error('Registration inquiry fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: inquiryId } = await params

    if (!inquiryId) {
      return NextResponse.json({ error: 'Missing registration inquiry ID' }, { status: 400 })
    }

    const admin = await getSuperAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status, reason } = updateSchema.parse(body)

    // Get the current inquiry to check its status
    const existingInquiry = await db.registrationInquiry.findUnique({
      where: { id: inquiryId },
    })

    if (!existingInquiry) {
      return NextResponse.json({ error: 'Registration inquiry not found' }, { status: 404 })
    }

    // Only process if status is actually changing
    if (existingInquiry.status === status) {
      return NextResponse.json({
        success: true,
        message: 'Status is already ' + status,
        inquiry: existingInquiry,
      })
    }

    // Update the inquiry status
    const inquiry = await db.registrationInquiry.update({
      where: { id: inquiryId },
      data: { status },
    })

    // Get admin name for notification
    const adminUser = await db.user.findUnique({
      where: { id: admin.userId },
      select: { name: true },
    })
    const adminName = adminUser?.name || 'Admin'

    // If APPROVED, create the actual user account and send credentials
    if (status === 'APPROVED') {
      // Check if user already exists
      const existingUser = await db.user.findUnique({
        where: { email: inquiry.email },
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        )
      }

      // Generate password
      const password = generateRandomPassword()
      const hashedPassword = await bcrypt.hash(password, 12)

      // Determine account type based on inquiry (you might need to add a field to track this)
      // For now, default to BUSINESS_ADMIN
      const accountType = 'business'

      // Create the user
      const user = await db.user.create({
        data: {
          email: inquiry.email,
          password: hashedPassword,
          name: inquiry.name,
          role: 'BUSINESS_ADMIN',
        },
      })

      // Create business profile
      const baseSlug = inquiry.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'business'
      let slug = baseSlug
      let counter = 1
      while (await db.business.findFirst({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`
        counter++
      }
      
      await db.business.create({
        data: {
          name: inquiry.name,
          slug,
          email: inquiry.email,
          phone: inquiry.phone || undefined,
          adminId: user.id,
          isActive: true,
        },
      })

      // Send approval email with credentials
      try {
        await sendRegistrationApproved({
          name: inquiry.name,
          email: inquiry.email,
          password: password,
          accountType: accountType as 'business' | 'professional',
          loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://mydigisence.com'}/login`,
        })
        console.log('Registration approved email sent to:', inquiry.email)
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError)
        // Don't fail the request if email fails
      }
    }
    // If REJECTED, send rejection email
    else if (status === 'REJECTED') {
      try {
        await sendRegistrationRejected({
          name: inquiry.name,
          email: inquiry.email,
          reason: reason,
        })
        console.log('Registration rejected email sent to:', inquiry.email)
      } catch (emailError) {
        console.error('Failed to send rejection email:', emailError)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: status === 'APPROVED' ? 'Registration approved and user account created' : 'Registration rejected',
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

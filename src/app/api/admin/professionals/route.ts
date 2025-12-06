import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import type { UserRole } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      password,
      adminName,
      phone,
    } = body

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    // Create user and professional in a transaction
    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name: adminName,
          role: 'PROFESSIONAL_ADMIN' as UserRole,
        },
      })

      const professional = await tx.professional.create({
        data: {
          name,
          slug,
          phone,
          email: email, // Professional's contact email
          adminId: user.id,
          // All other profile fields are set to null - professionals will fill them in their dashboard
          professionalHeadline: null,
          aboutMe: null,
          profilePicture: null,
          banner: null,
          location: null,
          website: null,
          facebook: null,
          twitter: null,
          instagram: null,
          linkedin: null,
          workExperience: [],
          education: [],
          skills: [],
          servicesOffered: [],
          portfolio: [],
        },
      })

      return { user, professional }
    })

    return NextResponse.json({
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
      },
      professional: {
        id: result.professional.id,
        name: result.professional.name,
        slug: result.professional.slug,
        phone: result.professional.phone,
        email: result.professional.email,
        isActive: result.professional.isActive,
        createdAt: result.professional.createdAt,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Professional creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
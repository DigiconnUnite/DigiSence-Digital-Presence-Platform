import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromRequest, verifyToken } from '@/lib/jwt'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

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

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const professional = await db.professional.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        professionalHeadline: true,
        aboutMe: true,
        profilePicture: true,
        banner: true,
        location: true,
        phone: true,
        email: true,
        website: true,
        facebook: true,
        twitter: true,
        instagram: true,
        linkedin: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        adminId: true,
        workExperience: true,
        education: true,
        skills: true,
        servicesOffered: true,
        contactInfo: true,
        portfolio: true,
        contactDetails: true,
        ctaButton: true,
        admin: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!professional) {
      return NextResponse.json({ error: 'Professional not found' }, { status: 404 })
    }

    return NextResponse.json({ professional })
  } catch (error) {
    console.error('Professional fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function generateUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
  let slug = baseSlug
  let counter = 1
  while (true) {
    const existing = await db.professional.findFirst({
      where: {
        slug,
        id: excludeId ? { not: excludeId } : undefined
      }
    })
    if (!existing) break
    slug = `${baseSlug}-${counter}`
    counter++
  }
  return slug
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const admin = await getSuperAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // If name is being updated, generate a new unique slug
    if (body.name) {
      const baseSlug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      body.slug = await generateUniqueSlug(baseSlug, id)
    }

    const professional = await db.professional.update({
      where: { id },
      data: body,
      include: {
        admin: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    })

    // Emit Socket.IO event for real-time update
    if (global.io) {
      global.io.emit('professional-updated', {
        professional: professional,
        action: 'update',
        timestamp: new Date().toISOString(),
        adminId: admin.userId
      });
    }

    return NextResponse.json({ professional })
  } catch (error) {
    console.error('Professional update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const admin = await getSuperAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Professional ID is required' }, { status: 400 })
    }

    // Check if professional exists first
    const existingProfessional = await db.professional.findUnique({
      where: { id },
    })

    if (!existingProfessional) {
      return NextResponse.json({ error: 'Professional not found' }, { status: 404 })
    }

    // Use transaction to ensure all deletions succeed or fail together
    await db.$transaction(async (tx) => {
      // Delete the professional
      await tx.professional.delete({
        where: { id },
      })

      // Also delete the associated admin user
      await tx.user.delete({
        where: { id: existingProfessional.adminId },
      })
    })

    // Emit Socket.IO event for real-time update
    if (global.io) {
      global.io.emit('professional-deleted', {
        professionalId: id,
        action: 'delete',
        timestamp: new Date().toISOString(),
        adminId: admin.userId
      });
    }

    return NextResponse.json({ message: 'Professional and associated user deleted successfully' })
  } catch (error) {
    console.error('Professional deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete professional and associated user' },
      { status: 500 }
    )
  }
}

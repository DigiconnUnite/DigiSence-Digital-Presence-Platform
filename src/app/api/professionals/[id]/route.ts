import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface RouteParams {
  params: Promise<{
    id: string
  }>
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
    })

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
    const { id } = await params

    await db.professional.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Professional deleted successfully' })
  } catch (error) {
    console.error('Professional deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
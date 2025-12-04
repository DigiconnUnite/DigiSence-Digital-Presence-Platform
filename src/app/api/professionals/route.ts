import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const id = searchParams.get('id')

    if (slug || id) {
      const whereClause = slug ? { slug, isActive: true } : { id: id as string, isActive: true }

      const professional = await db.professional.findFirst({
        where: whereClause,
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
    } else {
      // List all active professionals
      const professionals = await db.professional.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          slug: true,
          professionalHeadline: true,
          profilePicture: true,
          location: true,
          email: true,
          website: true,
        },
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json({ professionals })
    }
  } catch (error) {
    console.error('Professional fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      professionalHeadline,
      aboutMe,
      profilePicture,
      banner,
      location,
      phone,
      email,
      website,
      facebook,
      twitter,
      instagram,
      linkedin,
      workExperience,
      education,
      skills,
      servicesOffered,
      contactInfo,
      portfolio,
      contactDetails,
      ctaButton,
      adminId,
    } = body

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    const professional = await db.professional.create({
      data: {
        name,
        slug,
        professionalHeadline,
        aboutMe,
        profilePicture,
        banner,
        location,
        phone,
        email,
        website,
        facebook,
        twitter,
        instagram,
        linkedin,
        workExperience,
        education,
        skills,
        servicesOffered,
        contactInfo,
        portfolio,
        contactDetails,
        ctaButton,
        adminId,
      },
    })

    return NextResponse.json({ professional }, { status: 201 })
  } catch (error) {
    console.error('Professional creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
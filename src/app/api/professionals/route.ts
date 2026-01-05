import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromRequest, verifyToken } from '@/lib/jwt'

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
          resume: true,
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
      // Check for authentication - if authenticated, return only the user's professional
      const token = getTokenFromRequest(request) || request.cookies.get('auth-token')?.value

      if (token) {
        const payload = verifyToken(token)
        if (payload && payload.role === 'PROFESSIONAL_ADMIN') {
          // Return only the professional for the authenticated user
          const professional = await db.professional.findFirst({
            where: { adminId: payload.userId },
            select: {
              id: true,
              name: true,
              slug: true,
              professionalHeadline: true,
              aboutMe: true,
              profilePicture: true,
              banner: true,
              resume: true,
              location: true,
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

          if (professional) {
            return NextResponse.json({ professionals: [professional] })
          } else {
            return NextResponse.json({ professionals: [] })
          }
        }
      }

      // List all active professionals (fallback for non-authenticated requests)
      const professionals = await db.professional.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          slug: true,
          professionalHeadline: true,
          profilePicture: true,
          banner: true,
          location: true,
          email: true,
          website: true,
          adminId: true,
          workExperience: true,
          education: true,
          skills: true,
          servicesOffered: true,
          portfolio: true,
          admin: {
            select: {
              name: true,
              email: true,
            },
          },
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

async function generateUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug
  let counter = 1
  while (await db.professional.findFirst({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`
    counter++
  }
  return slug
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

    // Check if professional already exists for this adminId
    const existingProfessional = await db.professional.findFirst({
      where: { adminId },
    })
    if (existingProfessional) {
      return NextResponse.json(
        { error: 'A professional profile already exists for this user' },
        { status: 400 }
      )
    }

    // Generate base slug from name
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    // Generate unique slug
    const slug = await generateUniqueSlug(baseSlug)

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

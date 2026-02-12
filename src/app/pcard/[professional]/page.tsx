import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import ProfessionalProfile from '../../../components/ProfessionalProfile'
import { db } from '@/lib/db'

interface PageProps {
  params: Promise<{
    professional: string
  }>
}

// Enable static rendering for better performance
export const dynamic = 'force-static'
export const revalidate = 3600 // Revalidate every hour

export async function generateStaticParams() {
  // Pre-render the most recent active professionals
  const professionals = await db.professional.findMany({
    where: { isActive: true },
    select: { slug: true },
    orderBy: { createdAt: 'desc' },
    take: 100, // Pre-render top 100 most recent
  })
  
  return professionals.map((p) => ({ professional: p.slug }))
}

export default async function ProfessionalPage({ params }: PageProps) {
  const { professional: professionalSlug } = await params

  // Fetch directly from database instead of API to avoid double-fetching
  const professional = await db.professional.findFirst({
    where: { slug: professionalSlug, isActive: true },
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
    notFound()
  }

  return <ProfessionalProfile professional={professional} />
}

export async function generateMetadata({ params }: PageProps) {
  const { professional: professionalSlug } = await params

  // Fetch directly from database to avoid double API call
  const professional = await db.professional.findFirst({
    where: { slug: professionalSlug, isActive: true },
    select: {
      name: true,
      professionalHeadline: true,
      aboutMe: true,
      profilePicture: true,
      admin: { select: { name: true } },
    },
  })

  if (!professional) {
    return {
      title: 'Professional Not Found',
    }
  }

  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = headersList.get('x-forwarded-proto') || 'http'
  const baseUrl = `${protocol}://${host}`

  const pageUrl = `${baseUrl}/pcard/${professionalSlug}`
  const imageUrl = professional.profilePicture ? `${baseUrl}/api/placeholder/1200/630?text=${encodeURIComponent(professional.name)}` : `${baseUrl}`

  const description = (professional.aboutMe || `Professional profile for ${professional.name}`).slice(0, 160)

  return {
    title: `${professional.name} - Professional Profile`,
    description,
    keywords: `${professional.name}, ${professional.professionalHeadline || 'professional'}, services`,
    authors: [{ name: professional.admin?.name || professional.name }],
    openGraph: {
      title: `${professional.name} - Professional Profile`,
      description,
      url: pageUrl,
      siteName: 'DigiSence',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${professional.name} profile picture`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${professional.name} - Professional Profile`,
      description,
      images: [imageUrl],
    },
  }
}
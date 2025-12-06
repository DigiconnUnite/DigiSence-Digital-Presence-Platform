import { notFound } from 'next/navigation'
import ProfessionalProfile from '../../../components/ProfessionalProfile'


interface PageProps {
  params: Promise<{
    professional: string
  }>
}

export default async function ProfessionalPage({ params }: PageProps) {
  const { professional: professionalSlug } = await params

  // Fetch data from API instead of direct Prisma access
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/professionals?slug=${professionalSlug}`, {
    cache: 'no-store'
  })

  if (!response.ok) {
    notFound()
  }

  const data = await response.json()
  const professional = data.professional

  if (!professional || !professional.isActive) {
    notFound()
  }

  return <ProfessionalProfile professional={professional} />
}

export async function generateMetadata({ params }: PageProps) {
  const { professional: professionalSlug } = await params

  // Fetch data from API instead of direct Prisma access
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/professionals?slug=${professionalSlug}`, {
    cache: 'no-store'
  })

  if (!response.ok) {
    return {
      title: 'Professional Not Found',
    }
  }

  const data = await response.json()
  const professional = data.professional

  if (!professional) {
    return {
      title: 'Professional Not Found',
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const pageUrl = `${baseUrl}/pcard/${professionalSlug}`
  const imageUrl = professional.profilePicture ? `${baseUrl}/api/placeholder/1200/630?text=${encodeURIComponent(professional.name)}` : `${baseUrl}/placeholder.png`

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
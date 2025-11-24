import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import BusinessProfile from '@/components/BusinessProfile'

interface PageProps {
  params: Promise<{
    business: string
  }>
}

export default async function BusinessPage({ params }: PageProps) {
  const { business: businessSlug } = await params

  const business = await db.business.findUnique({
    where: { slug: businessSlug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      logo: true,
      address: true,
      phone: true,
      email: true,
      website: true,
      facebook: true,
      twitter: true,
      instagram: true,
      linkedin: true,
      about: true,
      catalogPdf: true,
      openingHours: true,
      gstNumber: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      adminId: true,
      categoryId: true,
      heroContent: true,
      brandContent: true,
      portfolioContent: true,
      admin: {
        select: {
          name: true,
          email: true,
        },
      },
      category: true,
      products: {
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          image: true,
          inStock: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          businessId: true,
          categoryId: true,
          brandName: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!business || !business.isActive) {
    notFound()
  }

  // Process openingHours to match the expected type
  const processedBusiness = {
    ...business,
    openingHours: business.openingHours ? (Array.isArray(business.openingHours) ? business.openingHours : JSON.parse(business.openingHours as string)) as any[] : undefined
  } as any

  return <BusinessProfile business={processedBusiness} />
}

export async function generateMetadata({ params }: PageProps) {
  const { business: businessSlug } = await params

  const business = await db.business.findUnique({
    where: { slug: businessSlug },
    select: {
      name: true,
      description: true,
    },
  })

  if (!business) {
    return {
      title: 'Business Not Found',
    }
  }

  return {
    title: `${business.name} - Business Profile`,
    description: business.description || `Professional profile for ${business.name}`,
  }
}
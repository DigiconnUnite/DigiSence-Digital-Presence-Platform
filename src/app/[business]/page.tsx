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
    include: {
      admin: {
        select: {
          name: true,
          email: true,
        },
      },
      category: true,
      products: {
        where: { isActive: true },
        include: {
          category: true,
          brand: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!business || !business.isActive) {
    notFound()
  }

  return <BusinessProfile business={business} />
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
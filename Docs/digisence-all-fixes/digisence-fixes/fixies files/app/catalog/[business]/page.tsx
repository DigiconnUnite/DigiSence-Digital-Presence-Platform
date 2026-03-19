import { notFound } from 'next/navigation'
import { cache } from 'react'
import { db } from '@/lib/db'
import BusinessProfile from '@/components/BusinessProfile'
import { getOptimizedImageUrl } from '@/lib/image-utils'
import { headers } from 'next/headers'

export const revalidate = 60

interface PageProps {
  params: Promise<{ business: string }>
}

/**
 * FIXED: Previously called db.business.findUnique() twice — once in page() and once
 * in generateMetadata(). With React's cache(), only one DB query is made regardless
 * of how many times getBusiness() is called with the same slug.
 */
const getBusiness = cache(async (slug: string) => {
  return db.business.findUnique({
    where: { slug },
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
      admin: { select: { name: true, email: true } },
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
          additionalInfo: true,
          createdAt: true,
          updatedAt: true,
          businessId: true,
          categoryId: true,
          brandName: true,
          category: { select: { id: true, name: true } },
        } as any,
        orderBy: { createdAt: 'desc' },
      },
    },
  })
})

export default async function BusinessPage({ params }: PageProps) {
  const { business: businessSlug } = await params
  const business = await getBusiness(businessSlug)

  if (!business || !business.isActive) {
    notFound()
  }

  const categories = await db.category.findMany({
    where: {
      type: 'PRODUCT',
      products: { some: { businessId: business.id, isActive: true } },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      parentId: true,
      businessId: true,
      _count: { select: { products: true } },
    },
    orderBy: { name: 'asc' },
  })

  const mappedCategories = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description || undefined,
    parentId: cat.parentId || undefined,
    _count: cat._count,
  }))

  const processedBusiness = {
    ...business,
    openingHours: business.openingHours
      ? Array.isArray(business.openingHours)
        ? business.openingHours
        : JSON.parse(business.openingHours as string)
      : undefined,
  } as any

  return <BusinessProfile business={processedBusiness} categories={mappedCategories} />
}

export async function generateMetadata({ params }: PageProps) {
  const { business: businessSlug } = await params
  // FIXED: Uses the same cached getBusiness() — no second DB query
  const business = await getBusiness(businessSlug)

  if (!business) {
    return {
      title: 'Business Not Found | Mydigisence',
      description: "The business you are looking for could not be found on Mydigisence.",
    }
  }

  const headersList = headers()
  const host = (await headersList).get('host') || 'localhost:3000'
  const protocol = (await headersList).get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https')
  const baseUrl = `${protocol}://${host}`
  const pageUrl = `${baseUrl}/catalog/${businessSlug}`

  const imageUrl = business.logo
    ? getOptimizedImageUrl(business.logo, { width: 1200, height: 630, quality: 85, format: 'auto', crop: 'fill', gravity: 'center' })
    : `${baseUrl}/og-image.png`

  const fullDescription = business.description || `${business.name} on Mydigisence.`
  const description = fullDescription.length > 160 ? fullDescription.substring(0, 157) + '...' : fullDescription
  const categoryName = business.category?.name || 'Business'

  return {
    title: `${business.name} | ${categoryName} | Mydigisence`,
    description,
    openGraph: {
      title: `${business.name} | ${categoryName} | Mydigisence`,
      description,
      url: pageUrl,
      siteName: 'Mydigisence',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: `${business.name} on Mydigisence` }],
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${business.name} | ${categoryName} | Mydigisence`,
      description,
      images: [imageUrl],
    },
    alternates: { canonical: pageUrl },
    robots: { index: true, follow: true },
  }
}

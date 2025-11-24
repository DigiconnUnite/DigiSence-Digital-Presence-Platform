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

  // Fetch business-specific categories
  const categories = await db.category.findMany({
    where: {
      businessId: business?.id,
      type: 'PRODUCT'
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      parentId: true,
      _count: {
        select: {
          products: true
        }
      }
    },
    orderBy: { name: 'asc' }
  })

  if (!business || !business.isActive) {
    notFound()
  }

  console.log('Categories fetched from DB:', categories)
  const mappedCategories = categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description || undefined,
    parentId: cat.parentId || undefined,
    _count: cat._count
  }))
  console.log('Mapped categories:', mappedCategories)

  return <BusinessProfile business={{
    ...business,
    openingHours: (business.openingHours as any) || undefined
  }} categories={mappedCategories} />
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
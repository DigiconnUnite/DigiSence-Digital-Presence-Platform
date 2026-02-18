import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mydigisence.com';

  // Static pages that are always available
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/businesses`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/professionals`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/login/professional`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/login/business`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/register/professional`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register/business`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/forgot-password`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  return staticPages;
}

// Optional: Add function to fetch dynamic pages from database
// Uncomment and modify if you want to include dynamic business/professional pages
/*
import { db } from '@/lib/db';

export async function getDynamicPages(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mydigisence.com';

  try {
    // Fetch active businesses
    const businesses = await db.business.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
      take: 1000,
    });

    const businessPages = businesses.map((business) => ({
      url: `${baseUrl}/catalog/${business.slug}`,
      lastModified: business.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    // Fetch active professionals
    const professionals = await db.professional.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
      take: 1000,
    });

    const professionalPages = professionals.map((professional) => ({
      url: `${baseUrl}/pcard/${professional.slug}`,
      lastModified: professional.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [...businessPages, ...professionalPages];
  } catch (error) {
    console.error('Error fetching dynamic pages for sitemap:', error);
    return [];
  }
}
*/

import { db } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { MapPin, Phone, Mail, Globe } from 'lucide-react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default async function BusinessListingPage() {
  const businesses = await db.business.findMany({
    where: { isActive: true },
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
      category: {
        select: {
          name: true,
        },
      },
      products: {
        where: { isActive: true },
        select: {
          id: true,
        },
        take: 1, // Just to check if there are products
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Discover Businesses
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our directory of professional businesses. Find the services and products you need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <Card key={business.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start space-x-4">
                    {business.logo ? (
                      <img
                        src={business.logo}
                        alt={business.name}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-500 text-sm font-medium">
                          {business.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                        {business.name}
                      </CardTitle>
                      {business.category && (
                        <Badge variant="secondary" className="mt-1">
                          {business.category.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {business.description && (
                    <CardDescription className="text-gray-600 mb-4 line-clamp-2">
                      {business.description}
                    </CardDescription>
                  )}

                  <div className="space-y-2 mb-4">
                    {business.address && (
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{business.address}</span>
                      </div>
                    )}
                    {business.phone && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{business.phone}</span>
                      </div>
                    )}
                    {business.website && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Globe className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{business.website}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {business.products.length > 0 && (
                        <span>{business.products.length}+ products</span>
                      )}
                    </div>
                    <Button asChild>
                      <Link href={`/catalog/${business.slug}`}>
                        View Profile
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {businesses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No businesses found.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}

export const metadata = {
  title: 'Business Directory - DigiSence',
  description: 'Discover and connect with professional businesses in our directory.',
}
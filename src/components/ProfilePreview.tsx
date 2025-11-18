'use client'

import { useState } from 'react'
import { Business, Product } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel'
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  ChevronRight,
  Eye
} from 'lucide-react'

interface ProfilePreviewProps {
    business: Business & {
      admin: { name?: string | null; email: string }
      category?: { name: string } | null
      products: Product[]
    }
    selectedSection: string | null
    sectionTitles?: Record<string, string>
    heroContent?: any
    brandContent?: any
    onSectionClick: (section: string) => void
    businessFormData?: {
      name: string
      description: string
      logo: string
      address: string
      phone: string
      email: string
      website: string
      ownerName: string
    }
  }

export default function ProfilePreview({ business, selectedSection, sectionTitles = {}, heroContent: propHeroContent, brandContent: propBrandContent, onSectionClick, businessFormData }: ProfilePreviewProps) {
    // Merge business data with form data for real-time preview
    const mergedBusiness = businessFormData ? {
      ...business,
      name: businessFormData.name || business.name,
      description: businessFormData.description || business.description,
      logo: businessFormData.logo || business.logo,
      address: businessFormData.address || business.address,
      phone: businessFormData.phone || business.phone,
      email: businessFormData.email || business.email,
      website: businessFormData.website || business.website,
      admin: {
        ...business.admin,
        name: businessFormData.ownerName || business.admin?.name
      }
    } : business

    // Use prop hero content or default
    const heroContent = propHeroContent || mergedBusiness.heroContent as any || {
      slides: [
        {
          image: '/api/placeholder/1200/600',
          headline: 'Welcome to ' + mergedBusiness.name,
          subheadline: mergedBusiness.description || 'Discover our amazing products and services',
          cta: 'Get in Touch'
        }
      ]
    }

  // Use prop brand content or default
  const brandContent = propBrandContent || business.brandContent as any || {
    brands: []
  }

  const renderFullPreview = () => (
    <div className="bg-white border rounded-lg overflow-hidden max-h-[600px] overflow-y-auto scale-75 origin-top transform-gpu">
      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="sticky top-0 z-40 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                {mergedBusiness.logo && (
                  <img
                    src={mergedBusiness.logo}
                    alt={mergedBusiness.name}
                    className="h-8 w-auto"
                  />
                )}
                <span className="font-semibold text-lg">{mergedBusiness.name}</span>
              </div>
              <div className="hidden md:flex space-x-8">
                <a href="#about" className="text-gray-600 hover:text-gray-900">About</a>
                <a href="#products" className="text-gray-600 hover:text-gray-900">Products</a>
                <a href="#contact" className="text-gray-600 hover:text-gray-900">Contact</a>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section
          className="relative cursor-pointer hover:bg-blue-50 transition-colors"
          onClick={() => onSectionClick('hero')}
        >
          <div className="max-w-7xl mx-auto rounded-2xl mt-3 overflow-hidden">
            <Carousel className="w-full">
              <CarouselContent>
                {heroContent.slides?.map((slide: any, index: number) => (
                  <CarouselItem key={index}>
                    <div className="relative h-96 w-full md:h-[500px] bg-gray-200 rounded-2xl overflow-hidden">
                      {slide.mediaType === 'video' ? (
                        <video
                          src={slide.media || '/api/placeholder/1200/600'}
                          className="w-full h-full object-cover rounded-2xl"
                          autoPlay
                          muted
                          loop
                        />
                      ) : (
                        <img
                          src={slide.media || slide.image || '/api/placeholder/1200/600'}
                          alt={slide.headline}
                          className="w-full h-full object-cover rounded-2xl"
                        />
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-2xl">
                        <div className={`text-white px-4 max-w-4xl ${slide.headlineAlignment === 'left' ? 'text-left' : slide.headlineAlignment === 'right' ? 'text-right' : 'text-center'}`}>
                          <h1
                            className={`font-bold mb-4 ${slide.headlineSize || 'text-4xl md:text-6xl'}`}
                            style={{ color: slide.headlineColor || '#ffffff' }}
                          >
                            {slide.headline}
                          </h1>
                          <p
                            className={`mb-8 ${slide.subtextSize || 'text-xl md:text-2xl'}`}
                            style={{ color: slide.subtextColor || '#ffffff', textAlign: slide.subtextAlignment || 'center' }}
                          >
                            {slide.subheadline || slide.subtext}
                          </p>
                          <div className={`${slide.headlineAlignment === 'left' ? 'text-left' : slide.headlineAlignment === 'right' ? 'text-right' : 'text-center'}`}>
                            <Button size="lg">
                              {slide.cta || 'Get in Touch'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </Carousel>
          </div>
        </section>

        {/* Business Information Section */}
        <section
          id="about"
          className="py-16 px-4 sm:px-6 lg:px-8 cursor-pointer hover:bg-blue-50 transition-colors"
          onClick={() => onSectionClick('info')}
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {business.logo && (
                      <img
                        src={business.logo}
                        alt={business.name}
                        className="h-20 w-20 rounded-full object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{business.name}</h3>
                      {business.category && (
                        <Badge variant="secondary" className="mb-3">{business.category.name}</Badge>
                      )}
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {business.description || 'No description available yet.'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-amber-50 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle>Get in Touch</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {business.address && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <span>{business.address}</span>
                    </div>
                  )}
                  {business.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <span>{business.phone}</span>
                    </div>
                  )}
                  {business.email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <span>{business.email}</span>
                    </div>
                  )}
                  {business.website && (
                    <div className="flex items-center space-x-3">
                      <Globe className="h-5 w-5 text-gray-400" />
                      <span>Visit Website</span>
                    </div>
                  )}
                  <Separator />
                  <Button className="w-full">Get a Quote</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Brand Slider */}
        {brandContent.brands?.length > 0 && (
          <section
            className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 cursor-pointer hover:bg-blue-100 transition-colors"
            onClick={() => onSectionClick('brands')}
          >
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Trusted By</h2>
                <Button variant="outline">View All</Button>
              </div>
              <Carousel className="w-full">
                <CarouselContent>
                  {brandContent.brands.map((brand: any, index: number) => (
                    <CarouselItem key={index} className="basis-1/3 md:basis-1/4 lg:basis-1/5">
                      <Card className="overflow-hidden">
                        <div className="h-32 bg-white flex items-center justify-center p-4">
                          <img
                            src={brand.logo}
                            alt={brand.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <CardHeader>
                          <CardTitle className="text-center">{brand.name}</CardTitle>
                        </CardHeader>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          </section>
        )}

        {/* Products Section */}
        {business.products.length > 0 && (
          <section
            id="products"
            className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 cursor-pointer hover:bg-blue-100 transition-colors"
            onClick={() => onSectionClick('products')}
          >
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Our Products & Services</h2>
                <Button variant="outline">View All</Button>
              </div>
              <Carousel className="w-full">
                <CarouselContent>
                  {business.products.map((product) => (
                    <CarouselItem key={product.id} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
                      <Card className="overflow-hidden">
                        {product.image && (
                          <div className="h-48 bg-gray-200">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <CardHeader>
                          <CardTitle>{product.name}</CardTitle>
                          {product.price && (
                            <Badge variant="outline" className="w-fit">
                              {product.price}
                            </Badge>
                          )}
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="mb-4">
                            {product.description}
                          </CardDescription>
                          <Button className="w-full">
                            Inquire Now
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </Button>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          </section>
        )}

        {/* Additional Content */}
        {business.additionalContent && (
          <section
            className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 cursor-pointer hover:bg-blue-100 transition-colors"
            onClick={() => onSectionClick('content')}
          >
            <div className="max-w-4xl mx-auto prose prose-lg">
              <div dangerouslySetInnerHTML={{ __html: business.additionalContent as string }} />
            </div>
          </section>
        )}

        {/* Footer */}
        <footer
          id="contact"
          className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8 cursor-pointer hover:bg-blue-900 transition-colors"
          onClick={() => onSectionClick('footer')}
        >
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              {mergedBusiness.logo && (
                <img
                  src={mergedBusiness.logo}
                  alt={mergedBusiness.name}
                  className="h-8 w-auto"
                />
              )}
              <span className="text-lg font-semibold">{mergedBusiness.name}</span>
            </div>
            <p className="text-gray-400 mb-4">
              © 2024 {mergedBusiness.name}. All rights reserved.
            </p>
            <Button variant="outline">Contact Us</Button>
          </div>
        </footer>
      </div>
    </div>
  )

  const renderFocusedPreview = () => {
    const defaultTitles = {
      hero: 'Hero Section',
      info: 'Business Info Section',
      brands: 'Brand Slider Section',
      products: 'Products Section',
      content: 'Additional Content Section',
      footer: 'Footer Section'
    }
    const displayTitles = { ...defaultTitles, ...sectionTitles }

    return (
      <div className="bg-white border rounded-lg p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            FOCUSED PREVIEW: {displayTitles[selectedSection as keyof typeof displayTitles]}
          </h3>
        </div>

        {selectedSection === 'hero' && (
           <section className="relative">
             <div className="max-w-7xl mx-auto rounded-2xl overflow-hidden">
               <Carousel className="w-full">
                 <CarouselContent>
                   {heroContent.slides?.map((slide: any, index: number) => (
                     <CarouselItem key={index}>
                       <div className="relative h-96 w-full md:h-[500px] bg-gray-200 rounded-2xl overflow-hidden">
                         {slide.mediaType === 'video' ? (
                           <video
                             src={slide.media || '/api/placeholder/1200/600'}
                             className="w-full h-full object-cover rounded-2xl"
                             autoPlay
                             muted
                             loop
                           />
                         ) : (
                           <img
                             src={slide.media || slide.image || '/api/placeholder/1200/600'}
                             alt={slide.headline}
                             className="w-full h-full object-cover rounded-2xl"
                           />
                         )}
                         <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-2xl">
                           <div className={`text-white px-4 max-w-4xl ${slide.headlineAlignment === 'left' ? 'text-left' : slide.headlineAlignment === 'right' ? 'text-right' : 'text-center'}`}>
                             <h1
                               className={`font-bold mb-4 ${slide.headlineSize || 'text-4xl md:text-6xl'}`}
                               style={{ color: slide.headlineColor || '#ffffff' }}
                             >
                               {slide.headline}
                             </h1>
                             <p
                               className={`mb-8 ${slide.subtextSize || 'text-xl md:text-2xl'}`}
                               style={{ color: slide.subtextColor || '#ffffff', textAlign: slide.subtextAlignment || 'center' }}
                             >
                               {slide.subheadline || slide.subtext}
                             </p>
                             <div className={`${slide.headlineAlignment === 'left' ? 'text-left' : slide.headlineAlignment === 'right' ? 'text-right' : 'text-center'}`}>
                               <Button size="lg">
                                 {slide.cta || 'Get in Touch'}
                               </Button>
                             </div>
                           </div>
                         </div>
                       </div>
                     </CarouselItem>
                   ))}
                 </CarouselContent>
                 <CarouselPrevious className="left-4" />
                 <CarouselNext className="right-4" />
               </Carousel>
             </div>
           </section>
         )}

        {selectedSection === 'info' && (
          <section className="py-8">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      {mergedBusiness.logo && (
                        <img
                          src={mergedBusiness.logo}
                          alt={mergedBusiness.name}
                          className="h-20 w-20 rounded-full object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{mergedBusiness.name}</h3>
                        {mergedBusiness.category && (
                          <Badge variant="secondary" className="mb-3">{mergedBusiness.category.name}</Badge>
                        )}
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          {mergedBusiness.description || 'No description available yet.'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-amber-50 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle>Get in Touch</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mergedBusiness.address && (
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <span>{mergedBusiness.address}</span>
                      </div>
                    )}
                    {mergedBusiness.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <span>{mergedBusiness.phone}</span>
                      </div>
                    )}
                    {mergedBusiness.email && (
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <span>{mergedBusiness.email}</span>
                      </div>
                    )}
                    {mergedBusiness.website && (
                      <div className="flex items-center space-x-3">
                        <Globe className="h-5 w-5 text-gray-400" />
                        <span>Visit Website</span>
                      </div>
                    )}
                    <Separator />
                    <Button className="w-full">Get a Quote</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        )}

        {selectedSection === 'brands' && brandContent.brands?.length > 0 && (
          <section className="py-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Trusted By</h2>
                <Button variant="outline">View All</Button>
              </div>
              <Carousel className="w-full">
                <CarouselContent>
                  {brandContent.brands.map((brand: any, index: number) => (
                    <CarouselItem key={index} className="basis-1/3 md:basis-1/4 lg:basis-1/5">
                      <Card className="overflow-hidden">
                        <div className="h-32 bg-white flex items-center justify-center p-4">
                          <img
                            src={brand.logo}
                            alt={brand.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <CardHeader>
                          <CardTitle className="text-center">{brand.name}</CardTitle>
                        </CardHeader>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          </section>
        )}

        {selectedSection === 'products' && business.products.length > 0 && (
          <section className="py-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Our Products & Services</h2>
                <Button variant="outline">View All</Button>
              </div>
              <Carousel className="w-full">
                <CarouselContent>
                  {business.products.map((product) => (
                    <CarouselItem key={product.id} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
                      <Card className="overflow-hidden">
                        {product.image && (
                          <div className="h-48 bg-gray-200">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <CardHeader>
                          <CardTitle>{product.name}</CardTitle>
                          {product.price && (
                            <Badge variant="outline" className="w-fit">
                              {product.price}
                            </Badge>
                          )}
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="mb-4">
                            {product.description}
                          </CardDescription>
                          <Button className="w-full">
                            Inquire Now
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </Button>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          </section>
        )}

        {selectedSection === 'content' && business.additionalContent && (
          <section className="py-8 bg-gray-50">
            <div className="max-w-4xl mx-auto prose prose-lg">
              <div dangerouslySetInnerHTML={{ __html: business.additionalContent as string }} />
            </div>
          </section>
        )}

        {selectedSection === 'footer' && (
          <footer className="bg-gray-900 text-white py-8">
            <div className="max-w-7xl mx-auto text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                {business.logo && (
                  <img
                    src={business.logo}
                    alt={business.name}
                    className="h-8 w-auto"
                  />
                )}
                <span className="text-lg font-semibold">{business.name}</span>
              </div>
              <p className="text-gray-400 mb-4">
                © 2024 {business.name}. All rights reserved.
              </p>
              <Button variant="outline">Contact Us</Button>
            </div>
          </footer>
        )}
      </div>
    )
  }

  return selectedSection ? renderFocusedPreview() : renderFullPreview()
}
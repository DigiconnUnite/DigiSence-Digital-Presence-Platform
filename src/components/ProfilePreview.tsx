'use client'

import { useState } from 'react'
import { Business } from '@prisma/client'

// Define custom Product type to match the updated schema
interface Product {
  id: string
  name: string
  description: string | null
  price: string | null
  image: string | null
  inStock: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  businessId: string
  categoryId: string | null
  brandName: string | null
  category?: {
    id: string
    name: string
  }
}
import { Button } from '@/components/ui/button'
import { getOptimizedImageUrl } from '@/lib/cloudinary'
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
      portfolioContent?: any
      products: Product[]
    }
    selectedSection: string | null
    sectionTitles?: Record<string, string>
    heroContent?: any
    brandContent?: any
  portfolioContent?: any
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
  products?: (Product & {
    category?: { id: string; name: string } | null
  })[]
  }

export default function ProfilePreview({ business, selectedSection, sectionTitles = {}, heroContent: propHeroContent, brandContent: propBrandContent, portfolioContent: propPortfolioContent, onSectionClick, businessFormData, products: propProducts }: ProfilePreviewProps) {
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

  // Use prop portfolio content or default
  const portfolioContent = propPortfolioContent || business.portfolioContent as any || {
    images: []
  }

  // Use prop products or business products
  const currentProducts = propProducts || business.products

  // Categories and filtered products for search/filter
  const categoryMap = new Map<string, { id: string; name: string }>()
  currentProducts.forEach(p => {
    if (p.category) categoryMap.set(p.category.id, p.category)
  })
  const categories = Array.from(categoryMap.values())

  const renderFullPreview = () => (
    <div className="bg-amber-50 border rounded-lg overflow-hidden max-h-[600px] overflow-y-auto scale-75 origin-top transform-gpu" suppressHydrationWarning>
      <div className="min-h-screen bg-amber-50">
        {/* Navigation */}
        <nav className="sticky top-0 z-40 bg-white/95 border-b backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex relative items-center space-x-4">
                {mergedBusiness.logo && mergedBusiness.logo.trim() !== '' && (
                  <img
                    src={getOptimizedImageUrl(mergedBusiness.logo, { width: 200, height: 200, quality: 85 })}
                    alt={mergedBusiness.name}
                    className="h-12 w-auto"
                    loading="lazy"
                  />
                )}
                <span className="font-semibold text-lg">{mergedBusiness.name}</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="hidden font-bold md:flex space-x-8">
                  <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Home</a>
                  <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">About</a>
                  <a href="#brands" className="text-gray-700 hover:text-gray-900 transition-colors ">Brands</a>
                  <a href="#products" className="text-gray-600 hover:text-gray-900 transition-colors">Products</a>
                  <a href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</a>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section with Slider */}
        <section className="relative">
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
        <section id="about" className="py-16 px-4 sm:px-6 lg:px-8 cursor-pointer hover:bg-blue-50 transition-colors" onClick={() => onSectionClick('info')}>
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8 items-stretch">
              {/* Logo Card */}
              <Card className="rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center justify-center w-64 h-64 md:shrink-0">
                {mergedBusiness.logo && mergedBusiness.logo.trim() !== '' ? (
                  <img
                    src={getOptimizedImageUrl(mergedBusiness.logo, { width: 300, height: 300, quality: 90 })}
                    alt={mergedBusiness.name}
                    className="w-56 h-56 rounded-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-56 h-56 rounded-full bg-gray-200 flex items-center justify-center">
                    <Eye className="w-28 h-28 text-gray-400" />
                  </div>
                )}
              </Card>

              {/* Business Info Card */}
              <Card className="rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 flex-1 h-64">
                <h3 className="text-3xl text-gray-700 font-bold mb-2">{mergedBusiness.name}</h3>
                {mergedBusiness.category && (
                  <Badge variant="outline" className="mb-3">{mergedBusiness.category.name}</Badge>
                )}
                <p className="text-gray-600 leading-relaxed text-sm">
                  {mergedBusiness.description || 'No description available yet.'}
                </p>
              </Card>

              {/* Contact Card */}
              <Card className="rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 flex-1 h-64 flex flex-row justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                  {mergedBusiness.address && (
                    <div className="flex items-center space-x-3 mb-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(mergedBusiness.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-md text-orange-600 hover:underline"
                      >
                        {mergedBusiness.address}
                      </a>
                    </div>
                  )}
                  {mergedBusiness.phone && (
                    <div className="flex items-center space-x-3 mb-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <a
                        href={`tel:${mergedBusiness.phone}`}
                        className="text-md text-orange-600 hover:underline"
                      >
                        {mergedBusiness.phone}
                      </a>
                    </div>
                  )}
                  {mergedBusiness.email && (
                    <div className="flex items-center space-x-3 mb-3">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <a
                        href={`mailto:${mergedBusiness.email}`}
                        className="text-md text-orange-600 hover:underline"
                      >
                        {mergedBusiness.email}
                      </a>
                    </div>
                  )}
                </div>
                <div className="flex items-center bg-white shadow-md p-2 h-fit rounded-2xl my-auto border">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/${business.slug}`)}`}
                    alt="Profile QR Code"
                    className="w-30 h-30"
                  />
                </div>
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
                            src={getOptimizedImageUrl(brand.logo, { width: 150, height: 150, quality: 85 })}
                            alt={brand.name}
                            className="max-w-full max-h-full object-contain"
                            loading="lazy"
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

        {/* Category Slider */}
        {
          categories.length > 0 && (
            <section className="py-12 px-4 sm:px-6 lg:px-8 cursor-pointer hover:bg-blue-100 transition-colors" onClick={() => onSectionClick('categories')}>
              <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold">Categories</h2>
                  <Button variant="outline">View All</Button>
                </div>
                <Carousel className="w-full">
                  <CarouselContent>
                    {categories.map((category, index: number) => (
                      <CarouselItem key={index} className="basis-1/3 md:basis-1/4 lg:basis-1/5">
                        <Card className="overflow-hidden bg-transparent">
                          <CardHeader>
                            <CardTitle className="text-center">{category.name}</CardTitle>
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
          )
        }

        {/* Portfolio Section */}
        {portfolioContent.images?.length > 0 && (
          <section className="max-w-7xl mx-auto my-12 cursor-pointer hover:bg-blue-100 transition-colors" id="portfolio" onClick={() => onSectionClick('portfolio')}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Portfolio</h2>
            </div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-4 md:grid-rows-2">
              {portfolioContent.images.slice(0, 6).map((image: any, index: number) => {
                // Define grid positions for the bento layout
                const gridClasses = [
                  "md:row-span-2 md:col-span-2 col-span-1 row-span-1", // Large top-left
                  "md:row-span-1 md:col-span-1", // Top-right small
                  "md:row-span-1 md:col-span-1", // Top-right small
                  "md:row-span-2 md:col-span-2 col-span-1 row-span-1 md:col-start-3 md:row-start-1", // Large bottom
                  "md:row-span-1 md:col-span-1", // Bottom-left small
                  "md:row-span-1 md:col-span-1"  // Bottom-right small
                ]

                const isVideo = image.url && (image.url.includes('.mp4') || image.url.includes('.webm') || image.url.includes('.ogg'))

                return (
                  <div
                    key={index}
                    className={`bg-gray-100 border rounded-xl shadow-sm flex items-center justify-center hover:shadow transition-shadow bg-center bg-cover relative overflow-hidden ${gridClasses[index] || "md:row-span-1 md:col-span-1"}`}
                    style={{
                      minHeight: index === 0 || index === 3 ? "180px" : "120px",
                      aspectRatio: index === 0 || index === 3 ? "2/1" : "1/1"
                    }}
                  >
                    {isVideo ? (
                      <video
                        src={image.url}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        playsInline
                        style={{ pointerEvents: 'none' }}
                      />
                    ) : image.url ? (
                      <img
                        src={getOptimizedImageUrl(image.url, {
                          width: index === 0 || index === 3 ? 600 : 300,
                          height: index === 0 || index === 3 ? 300 : 300,
                          quality: 85
                        })}
                        alt={image.alt || 'Portfolio image'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="flex items-center justify-center rounded-full bg-gray-200"
                        style={{
                          width: index === 0 || index === 3 ? "80px" : "56px",
                          height: index === 0 || index === 3 ? "80px" : "56px"
                        }}>
                        <Eye className="text-gray-400" style={{ width: index === 0 || index === 3 ? "40px" : "32px", height: index === 0 || index === 3 ? "40px" : "32px" }} />
                      </span>
                    )}

                    {isVideo && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black bg-opacity-50 rounded-full p-2">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Products Section */}
        {currentProducts.length > 0 && (
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
                  {currentProducts.map((product) => (
                    <CarouselItem key={product.id} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
                      <Card className="overflow-hidden">
                        {product.image && (
                          <div className="h-48 bg-gray-200">
                            <img
                              src={getOptimizedImageUrl(product.image, { width: 400, height: 300, quality: 85 })}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
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
                  src={getOptimizedImageUrl(mergedBusiness.logo, { width: 150, height: 150, quality: 85 })}
                  alt={mergedBusiness.name}
                  className="h-8 w-auto"
                  loading="lazy"
                />
              )}
              <span className="text-lg font-semibold">{mergedBusiness.name}</span>
            </div>
            <Separator className="my-4 bg-gray-700" />
            <p className="text-gray-400 mb-2">
              © {new Date().getFullYear()} {mergedBusiness.name}. All rights reserved.
            </p>
            {mergedBusiness.admin?.name && (
              <p className="text-gray-500 text-sm mb-4">
                Founded by {mergedBusiness.admin.name}
              </p>
            )}
            <p className="text-gray-400 text-sm mb-4">
              Powered by DigiSence - Your Trusted Portal Developers.
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
      categories: 'Categories Section',
      portfolio: 'Portfolio Section',
      products: 'Products Section',
      footer: 'Footer Section'
    }
    const displayTitles = { ...defaultTitles, ...sectionTitles }

    return (
      <div className="bg-amber-50 border rounded-lg p-6" suppressHydrationWarning>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            FOCUSED PREVIEW: {displayTitles[selectedSection as keyof typeof displayTitles]}
          </h3>
        </div>

        {selectedSection === 'hero' && (
          <section className="relative">
            <div className="max-w-7xl mx-auto rounded-3xl mt-3 overflow-hidden">
              <Carousel className="w-full">
                <CarouselContent>
                  {heroContent.slides?.map((slide: any, index: number) => (
                    <CarouselItem key={index}>
                      <div className="relative h-96 w-full md:h-[500px] bg-transparent rounded-2xl overflow-hidden">
                        {slide.mediaType === 'video' || (slide.media && (slide.media.includes('.mp4') || slide.media.includes('.webm') || slide.media.includes('.ogg'))) ? (
                          <video
                            src={slide.media || slide.video || slide.image}
                            className="w-full h-full object-cover rounded-2xl"
                            autoPlay
                            muted
                            loop
                            playsInline
                            poster={slide.poster || slide.image}
                          />
                        ) : (
                          <img
                              src={(slide.media || slide.image) && (slide.media || slide.image).trim() !== '' ? getOptimizedImageUrl(slide.media || slide.image, { width: 1200, height: 600, quality: 85 }) : '/api/placeholder/1200/600'}
                              alt={slide.headline}
                              className="w-full h-full object-cover rounded-2xl"
                              loading="lazy"
                          />
                        )}
                        <div className="absolute inset-0 bg-opacity-40 flex items-center justify-center rounded-2xl">
                          <div className={`text-center text-white px-4 ${slide.headlineAlignment === 'left' ? 'text-left' : slide.headlineAlignment === 'right' ? 'text-right' : 'text-center'}`}>
                            <h1
                              className={`${slide.headlineSize || 'text-4xl md:text-6xl'} font-bold mb-4`}
                              style={{ color: slide.headlineColor || '#ffffff' }}
                            >
                              {slide.headline}
                            </h1>
                            <p
                              className={`${slide.subtextSize || 'text-xl md:text-2xl'} mb-8 ${slide.subtextAlignment === 'left' ? 'text-left' : slide.subtextAlignment === 'right' ? 'text-right' : 'text-center'}`}
                              style={{ color: slide.subtextColor || '#ffffff' }}
                            >
                              {slide.subheadline}
                            </p>
                            <Button size="lg">
                              {slide.cta || 'Get in Touch'}
                            </Button>
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
          <section className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row gap-8 items-stretch">
                {/* Logo Card */}
                <Card className="rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center justify-center w-64 h-64 md:shrink-0">
                  {mergedBusiness.logo && mergedBusiness.logo.trim() !== '' ? (
                    <img
                      src={getOptimizedImageUrl(mergedBusiness.logo, { width: 300, height: 300, quality: 90 })}
                      alt={mergedBusiness.name}
                      className="w-56 h-56 rounded-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-56 h-56 rounded-full bg-gray-200 flex items-center justify-center">
                      <Eye className="w-28 h-28 text-gray-400" />
                    </div>
                  )}
                </Card>

                {/* Business Info Card */}
                <Card className="rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 flex-1 h-64">
                  <h3 className="text-3xl text-gray-700 font-bold mb-2">{mergedBusiness.name}</h3>
                  {mergedBusiness.category && (
                    <Badge variant="outline" className="mb-3">{mergedBusiness.category.name}</Badge>
                  )}
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {mergedBusiness.description || 'No description available yet.'}
                  </p>
                </Card>

                {/* Contact Card */}
                <Card className="rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 flex-1 h-64 flex flex-row justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                    {mergedBusiness.address && (
                      <div className="flex items-center space-x-3 mb-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <a
                          href={`https://maps.google.com/?q=${encodeURIComponent(mergedBusiness.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-md text-orange-600 hover:underline"
                        >
                          {mergedBusiness.address}
                        </a>
                      </div>
                    )}
                    {mergedBusiness.phone && (
                      <div className="flex items-center space-x-3 mb-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <a
                          href={`tel:${mergedBusiness.phone}`}
                          className="text-md text-orange-600 hover:underline"
                        >
                          {mergedBusiness.phone}
                        </a>
                      </div>
                    )}
                    {mergedBusiness.email && (
                      <div className="flex items-center space-x-3 mb-3">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <a
                          href={`mailto:${mergedBusiness.email}`}
                          className="text-md text-orange-600 hover:underline"
                        >
                          {mergedBusiness.email}
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center bg-white shadow-md p-2 h-fit rounded-2xl my-auto border">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/${business.slug}`)}`}
                      alt="Profile QR Code"
                      className="w-30 h-30"
                    />
                  </div>
                </Card>
              </div>
            </div>
          </section>
        )}

        {selectedSection === 'categories' && categories.length > 0 && (
          <section className="py-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">{sectionTitles?.categories || 'Categories'}</h2>
                <Button variant="outline">View All</Button>
              </div>
              <Carousel className="w-full">
                <CarouselContent>
                  {categories.map((category, index: number) => (
                    <CarouselItem key={index} className="basis-1/3 md:basis-1/4 lg:basis-1/5">
                      <Card className="overflow-hidden bg-transparent">
                        <CardHeader>
                          <CardTitle className="text-center">{category.name}</CardTitle>
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

        {selectedSection === 'portfolio' && portfolioContent.images?.length > 0 && (
          <section className="max-w-7xl mx-auto my-12">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">{sectionTitles?.portfolio || 'Portfolio'}</h2>
            </div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-4 md:grid-rows-2">
              {portfolioContent.images.slice(0, 6).map((image: any, index: number) => {
                // Define grid positions for the bento layout
                const gridClasses = [
                  "md:row-span-2 md:col-span-2 col-span-1 row-span-1", // Large top-left
                  "md:row-span-1 md:col-span-1", // Top-right small
                  "md:row-span-1 md:col-span-1", // Top-right small
                  "md:row-span-2 md:col-span-2 col-span-1 row-span-1 md:col-start-3 md:row-start-1", // Large bottom
                  "md:row-span-1 md:col-span-1", // Bottom-left small
                  "md:row-span-1 md:col-span-1"  // Bottom-right small
                ]

                const isVideo = image.url && (image.url.includes('.mp4') || image.url.includes('.webm') || image.url.includes('.ogg'))

                return (
                  <div
                    key={index}
                    className={`bg-gray-100 border rounded-xl shadow-sm flex items-center justify-center hover:shadow transition-shadow bg-center bg-cover relative overflow-hidden ${gridClasses[index] || "md:row-span-1 md:col-span-1"}`}
                    style={{
                      minHeight: index === 0 || index === 3 ? "180px" : "120px",
                      aspectRatio: index === 0 || index === 3 ? "2/1" : "1/1"
                    }}
                  >
                    {isVideo ? (
                      <video
                        src={image.url}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        playsInline
                        style={{ pointerEvents: 'none' }}
                      />
                    ) : image.url ? (
                      <img
                        src={getOptimizedImageUrl(image.url, {
                          width: index === 0 || index === 3 ? 600 : 300,
                          height: index === 0 || index === 3 ? 300 : 300,
                          quality: 85
                        })}
                        alt={image.alt || 'Portfolio image'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="flex items-center justify-center rounded-full bg-gray-200"
                        style={{
                          width: index === 0 || index === 3 ? "80px" : "56px",
                          height: index === 0 || index === 3 ? "80px" : "56px"
                        }}>
                        <Eye className="text-gray-400" style={{ width: index === 0 || index === 3 ? "40px" : "32px", height: index === 0 || index === 3 ? "40px" : "32px" }} />
                      </span>
                    )}

                    {isVideo && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black bg-opacity-50 rounded-full p-2">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {selectedSection === 'brands' && brandContent.brands?.length > 0 && (
          <section className="py-12 px-4 sm:px-6 lg:px-8 bg-transparent">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">{sectionTitles?.brands || 'Trusted By'}</h2>
                <Button variant="outline">View All</Button>
              </div>
              <Carousel className="w-full" suppressHydrationWarning>
                <CarouselContent>
                  {brandContent.brands.map((brand: any, index: number) => (
                    <CarouselItem key={index} className="basis-1/3 md:basis-1/4 lg:basis-1/5">
                      <Card className="overflow-hidden bg-white">
                        <div className="h-32  flex items-center justify-center p-4">
                          {brand.logo && brand.logo.trim() !== '' ? (
                            <img
                              src={getOptimizedImageUrl(brand.logo, { width: 150, height: 150, quality: 85 })}
                              alt={brand.name}
                              className="max-w-full max-h-full object-contain"
                              loading="lazy"
                            />
                          ) : (
                            <Eye className="h-16 w-16 text-gray-400" />
                          )}
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

        {selectedSection === 'products' && currentProducts.length > 0 && (
          <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">{sectionTitles?.products || 'Our Products & Services'}</h2>
                <Button variant="outline">View All</Button>
              </div>
              <Carousel className="w-full">
                <CarouselContent>
                  {currentProducts.map((product) => (
                    <CarouselItem key={product.id} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
                      <Card className="overflow-hidden">
                        {product.image && (
                          <div className="h-48 bg-gray-200">
                            <img
                              src={getOptimizedImageUrl(product.image, { width: 400, height: 300, quality: 85 })}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
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


        {selectedSection === 'footer' && (
          <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                {mergedBusiness.logo && (
                  <img
                    src={getOptimizedImageUrl(mergedBusiness.logo, { width: 150, height: 150, quality: 85 })}
                    alt={mergedBusiness.name}
                    className="h-8 w-auto"
                    loading="lazy"
                  />
                )}
                <span className="text-lg font-semibold">{mergedBusiness.name}</span>
              </div>
              <Separator className="my-4 bg-gray-700" />
              <p className="text-gray-400 mb-2">
                © {new Date().getFullYear()} {mergedBusiness.name}. All rights reserved.
              </p>
              {mergedBusiness.admin?.name && (
                <p className="text-gray-500 text-sm mb-4">
                  Founded by {mergedBusiness.admin.name}
                </p>
              )}
              <p className="text-gray-400 text-sm mb-4">
                Powered by DigiSence - Your Trusted Portal Developers.
              </p>
              <Button variant="outline" className="mt-4">{sectionTitles?.footer || 'Contact Us'}</Button>
            </div>
          </footer>
        )}
      </div>
    )
  }

  return selectedSection ? renderFocusedPreview() : renderFullPreview()
}
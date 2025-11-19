'use client'

import { useState, useEffect } from 'react'
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
import { getOptimizedImageUrl, generateSrcSet } from '@/lib/cloudinary'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
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
  Send,
  X,
  MessageCircle,
  Image,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Menu,
  Fullscreen
} from 'lucide-react'

interface BusinessProfileProps {
  business: Business & {
    admin: { name?: string | null; email: string }
    category?: { name: string } | null
    portfolioContent?: any
    products: (Product & {
      category?: { id: string; name: string } | null
    })[]
  }
}

interface InquiryFormData {
  name: string
  email: string
  phone: string
  message: string
  productId?: string
}

export default function BusinessProfile({ business }: BusinessProfileProps) {
  const [inquiryModal, setInquiryModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [inquiryData, setInquiryData] = useState<InquiryFormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [mounted, setMounted] = useState(false)
  const [viewAllBrands, setViewAllBrands] = useState(false)
  const [viewAllCategories, setViewAllCategories] = useState(false)
  const [viewAllProducts, setViewAllProducts] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    // Simulate loading time for skeleton
    const timer = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  // Default hero content if not set
  const heroContent = business.heroContent as any || {
    slides: [
      {
        image: '/api/placeholder/1200/600',
        headline: 'Welcome to ' + business.name,
        subheadline: business.description || 'Discover our amazing products and services',
        cta: 'Get in Touch'
      }
    ]
  }

  // Default brand content if not set
  const brandContent = business.brandContent as any || {
    brands: []
  }

  // Default category content if not set
  const categoryContent = business.category ? {
    categories: [business.category]
  } : {
    categories: []
  }

  // Default portfolio content if not set
  const portfolioContent = business.portfolioContent as any || { images: [] }

  // Categories and filtered products for search/filter
  const categoryMap = new Map<string, { id: string; name: string }>()
  business.products.forEach(p => {
    if (p.category) categoryMap.set(p.category.id, p.category)
  })
  const categories = Array.from(categoryMap.values())
  const filteredProducts = business.products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === 'all' || product.category?.id === selectedCategory)
  )

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...inquiryData,
          businessId: business.id,
          productId: selectedProduct?.id,
        }),
      })

      if (response.ok) {
        alert('Inquiry submitted successfully!')
        setInquiryModal(false)
        setInquiryData({ name: '', email: '', phone: '', message: '' })
        setSelectedProduct(null)
      } else {
        alert('Failed to submit inquiry. Please try again.')
      }
    } catch (error) {
      alert('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openInquiryModal = (product?: Product) => {
    setSelectedProduct(product || null)
    setInquiryData(prev => ({
      ...prev,
      message: product ? `I'm interested in ${product.name}` : '',
    }))
    setInquiryModal(true)
  }

  const SkeletonLayout = () => (
    <div className="min-h-screen bg-white">
      {/* Navigation Skeleton */}
      <nav className="sticky top-0 z-40 bg-white/95 border-b backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="hidden md:flex space-x-8">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-6 w-6 md:hidden" />
          </div>
        </div>
      </nav>

      {/* Hero Section Skeleton */}
      <section className="relative">
        <div className="max-w-7xl mx-auto rounded-3xl mt-3 overflow-hidden">
          <Skeleton className="w-full h-96 md:h-[500px] rounded-2xl" />
        </div>
      </section>

      {/* Business Information Section Skeleton */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 items-stretch">
            <Skeleton className="rounded-full w-64 h-64 md:shrink-0" />
            <Skeleton className="rounded-3xl p-6 flex-1 h-64" />
            <Skeleton className="rounded-3xl p-6 flex-1 h-64" />
          </div>
        </div>
      </section>

      {/* Brands Section Skeleton */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-3xl" />
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section Skeleton */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        </div>
      </section>

      {/* Products Section Skeleton */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-20" />
          </div>
          <div className="flex gap-4 mb-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-48" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-xl" />
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Section Skeleton */}
      <section className="max-w-7xl mx-auto my-12 px-4">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4 md:grid-rows-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="rounded-xl h-32 md:h-40" />
          ))}
        </div>
      </section>

      {/* Footer Skeleton */}
      <footer className="bg-gray-950 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-6 w-24 bg-gray-700" />
                <Skeleton className="h-4 w-32 bg-gray-700" />
                <Skeleton className="h-4 w-28 bg-gray-700" />
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <Skeleton className="h-4 w-48 bg-gray-700" />
              <Skeleton className="h-4 w-40 bg-gray-700" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )

  if (isLoading) {
    return <SkeletonLayout />
  }

  return (
    <div className="min-h-screen bg-amber-50" suppressHydrationWarning>
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/95 border-b backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex relative items-center space-x-4">
              {business.logo && business.logo.trim() !== '' && (
                <img
                  src={getOptimizedImageUrl(business.logo, { width: 200, height: 200, quality: 85 })}
                  alt={business.name}
                  className="h-12 w-auto"
                  loading="lazy"
                />
              )}
              <span className="font-semibold text-lg">{business.name}</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden font-bold md:flex space-x-8">
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Home</a>
                <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">About</a>
                <a href="#brands" className="text-gray-700 hover:text-gray-900 transition-colors ">Brands</a>
                <a href="#products" className="text-gray-600 hover:text-gray-900 transition-colors">Products</a>
                <a href="#portfolio" className="text-gray-600 hover:text-gray-900 transition-colors">Portfolio</a>
                <a href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</a>
              </div>
              <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="fixed top-0 right-0 w-64 h-full bg-white shadow-lg p-4 transform transition-transform duration-300 ease-in-out">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-lg">{business.name}</span>
              <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            <nav className="space-y-4">
              <a href="#" className="block text-gray-600 hover:text-gray-900 transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>Home</a>
              <a href="#about" className="block text-gray-600 hover:text-gray-900 transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>About</a>
              <a href="#brands" className="block text-gray-600 hover:text-gray-900 transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>Brands</a>
              <a href="#products" className="block text-gray-600 hover:text-gray-900 transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>Products</a>
              <a href="#portfolio" className="block text-gray-600 hover:text-gray-900 transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>Portfolio</a>
              <a href="#contact" className="block text-gray-600 hover:text-gray-900 transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>Contact</a>
            </nav>
          </div>
        </div>
      )}

      {/* Hero Section with Slider */}
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
                          src={(slide.media || slide.image) && (slide.media || slide.image).trim() !== '' ? getOptimizedImageUrl(slide.media || slide.image, { width: 1200, height: 600, quality: 85, format: 'auto' }) : '/api/placeholder/1200/600'}
                          srcSet={(slide.media || slide.image) && (slide.media || slide.image).trim() !== '' ? generateSrcSet(slide.media || slide.image) : undefined}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
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
                        <Button size="lg" onClick={() => openInquiryModal()}>
                          {slide.cta || 'Get in Touch'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 md:left-4 bg-white/80 hover:bg-white text-gray-800 border-0 shadow-lg" />
            <CarouselNext className="right-2 md:right-4 bg-white/80 hover:bg-white text-gray-800 border-0 shadow-lg" />
          </Carousel>
        </div>
      </section>

      {/* Business Information Section */}
      <section id="about" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 items-stretch">
            {/* Logo Card */}
            <Card className="rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center justify-center w-48 h-48 md:w-64 md:h-64 md:shrink-0 mx-auto md:mx-0">
              {business.logo && business.logo.trim() !== '' ? (
                <img
                  src={getOptimizedImageUrl(business.logo, { width: 300, height: 300, quality: 90 })}
                  alt={business.name}
                  className="w-40 h-40 md:w-56 md:h-56 rounded-full object-cover"
                  loading="lazy"
                />
              ) : (
                  <div className="w-40 h-40 md:w-56 md:h-56 rounded-full bg-gray-50 flex items-center justify-center">
                    <Image className="w-20 h-20 md:w-28 md:h-28 text-gray-400" />
                </div>
              )}
            </Card>

            {/* Business Info Card */}
            <Card className="rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 flex-1">
              <h3 className="text-3xl text-gray-700 font-bold mb-2">{business.name}</h3>
              {business.category && (
                <Badge variant="outline" className="mb-3">{business.category.name}</Badge>
              )}
              <p className="text-gray-600 leading-relaxed text-sm">
                {business.description || 'No description available yet.'}
              </p>
            </Card>

            {/* Contact Card */}
            <Card className="rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 flex-1 flex flex-col md:flex-row justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                {business.address && (
                  <div className="flex items-center space-x-3 mb-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(business.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-md text-orange-600 hover:underline"
                    >
                      {business.address}
                    </a>
                  </div>
                )}
                {business.phone && (
                  <div className="flex items-center space-x-3 mb-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <a
                      href={`tel:${business.phone}`}
                      className="text-md text-orange-600 hover:underline"
                    >
                      {business.phone}
                    </a>
                  </div>
                )}
                {business.email && (
                  <div className="flex items-center space-x-3 mb-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <a
                      href={`mailto:${business.email}`}
                      className="text-md text-orange-600 hover:underline"
                    >
                      {business.email}
                    </a>
                  </div>
                )}
              </div>
              <div className="flex items-center bg-white shadow-md p-2 h-fit rounded-2xl my-auto border mt-4 md:mt-0">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/${business.slug}`)}`}
                  alt="Profile QR Code"
                  className="w-20  h-20"
                />
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Brand Slider */}
      {
        brandContent.brands?.length > 0 && (
          <section id="brands" className="py-12 px-4 sm:px-6 lg:px-8 bg-transparent">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Trusted By</h2>
                <Button variant="outline" onClick={() => { setViewAllBrands(!viewAllBrands); }}>
                  {viewAllBrands ? 'Show Less' : 'View All'}
                </Button>
              </div>
              {viewAllBrands ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {brandContent.brands.map((brand: any, index: number) => (
                    <Card key={index} className="overflow-hidden rounded-3xl py-6 bg-white h-full flex flex-col">
                      <div className="h-32 flex items-center justify-center p-2">
                        {brand.logo && brand.logo.trim() !== '' ? (
                          <img
                            src={getOptimizedImageUrl(brand.logo, { width: 400, height: 300, quality: 85, format: 'auto' })}
                            srcSet={generateSrcSet(brand.logo)}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            alt={brand.name}
                            className="w-full h-full object-contain"
                            loading="lazy"
                          />
                        ) : (
                          <Image className="h-full w-full text-gray-400" />
                        )}
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-center text-sm md:text-base">{brand.name}</CardTitle>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : (
                <Carousel className="w-full" suppressHydrationWarning>
                  <CarouselContent>
                    {brandContent.brands.map((brand: any, index: number) => (
                      <CarouselItem key={index} className="basis-1/2 md:basis-1/4 lg:basis-1/5">
                        <Card className="overflow-hidden rounded-3xl py-6 bg-white h-full flex flex-col">
                          <div className="h-32 flex items-center justify-center p-2">
                            {brand.logo && brand.logo.trim() !== '' ? (
                              <img
                                src={getOptimizedImageUrl(brand.logo, { width: 400, height: 300, quality: 85, format: 'auto' })}
                                srcSet={generateSrcSet(brand.logo)}
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                alt={brand.name}
                                className="w-full h-full object-contain"
                                loading="lazy"
                              />
                            ) : (
                              <Image className="h-full w-full text-gray-400" />
                            )}
                          </div>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-center text-sm md:text-base">{brand.name}</CardTitle>
                          </CardHeader>
                        </Card>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                    <CarouselPrevious className="left-2 md:left-4 bg-white/80 hover:bg-white text-gray-800 border-0 shadow-lg" />
                    <CarouselNext className="right-2 md:right-4 bg-white/80 hover:bg-white text-gray-800 border-0 shadow-lg" />
                </Carousel>
              )}
            </div>
          </section>
        )
      }

      {/* Category Slider */}
      {categoryContent.categories?.length > 0 && (
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Categories</h2>
              <Button variant="outline" onClick={() => { setViewAllCategories(!viewAllCategories); }}>
                {viewAllCategories ? 'Show Less' : 'View All'}
              </Button>
            </div>
            {viewAllCategories ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {categoryContent.categories.map((category: any, index: number) => (
                  <Card key={index} className="overflow-hidden bg-transparent h-full flex items-center justify-center">
                    <CardHeader>
                      <CardTitle className="text-center text-sm md:text-base">{category.name}</CardTitle>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <Carousel className="w-full">
                <CarouselContent>
                  {categoryContent.categories.map((category: any, index: number) => (
                    <CarouselItem key={index} className="basis-1/2 md:basis-1/4 lg:basis-1/5">
                      <Card className="overflow-hidden bg-transparent h-full flex items-center justify-center">
                        <CardHeader>
                          <CardTitle className="text-center text-sm md:text-base">{category.name}</CardTitle>
                        </CardHeader>
                      </Card>
                    </CarouselItem>
                  ))}
                  </CarouselContent>
                <CarouselPrevious className="left-2 md:left-4 bg-white/80 hover:bg-white text-gray-800 border-0 shadow-lg" />
                <CarouselNext className="right-2 md:right-4 bg-white/80 hover:bg-white text-gray-800 border-0 shadow-lg" />
              </Carousel>
            )}
          </div>
        </section>
      )
      }

      {/* Products/Services Section */}
      {
        business.products.length > 0 && (
          <section id="products" className="py-16 px-4 sm:px-6 lg:px-8 bg-transparent">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Our Products & Services</h2>
                <Button variant="outline" onClick={() => { setViewAllProducts(!viewAllProducts); }}>
                  {viewAllProducts ? 'Show Less' : 'View All'}
                </Button>
              </div>
              {mounted && (
                <div className="flex flex-col sm:flex-row gap-4 mb-4" suppressHydrationWarning>
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-white"
                  />
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full bg-white sm:w-48">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {viewAllProducts ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredProducts.map((product) => (
                    <Card id={`product-${product.id}`} key={product.id} className="overflow-hidden pt-0 bg-white hover:shadow-lg transition-shadow duration-300" style={{ height: '24rem' }}>
                      <div className="relative h-48">
                        {product.image && product.image.trim() !== '' ? (
                          <img
                            src={getOptimizedImageUrl(product.image, { width: 400, height: 300, quality: 85, format: 'auto' })}
                            srcSet={generateSrcSet(product.image)}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            alt={product.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Image className="h-16 w-16 text-gray-400" />
                            </div>
                        )}
                        <Badge
                          className={`absolute top-2 bg-linear-to-l from-gray-900 to-lime-900 border border-gray-50/25 rounded-full right-2 `}
                          variant={product.inStock ? "default" : "destructive"}
                        >
                          {product.inStock ? (
                            <span className="flex items-center gap-1">
                              {product.inStock && (
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                              )}  In Stock
                            </span>
                          ) : "Out of Stock"}
                        </Badge>
                      </div>
                      <CardHeader className="pb-2 px-3 md:px-6">
                        <CardTitle className="text-base md:text-lg line-clamp-1">{product.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 px-3 md:px-6">
                        <div className="flex flex-row flex-nowrap gap-1 mb-3 overflow-x-auto hide-scrollbar">
                          {product.brandName && (
                            <Badge variant="outline" className="text-[10px] md:text-xs px-2 py-0.5 h-5 min-w-max">
                              {product.brandName}
                            </Badge>
                          )}
                          {product.category && (
                            <Badge variant="outline" className="text-[10px] md:text-xs px-2 py-0.5 h-5 min-w-max">
                              {product.category.name}
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="mb-4 text-xs md:text-sm leading-relaxed line-clamp-2">
                          {product.description || "No description available"}
                        </CardDescription>
                        <Button
                          className="w-full bg-green-500 hover:bg-green-700 cursor-pointer"
                          onClick={() => {
                            if (business.phone) {
                              const productLink = `${window.location.origin}/${business.slug}#product-${product.id}`;
                              const message = `I want to purchase this product: ${product.name}\n\nDescription: ${product.description || 'No description available'}\n\nLink: ${productLink}`;
                              const whatsappUrl = `https://wa.me/${business.phone}?text=${encodeURIComponent(message)}`;
                              window.open(whatsappUrl, '_blank');
                            } else {
                              alert('Phone number not available');
                            }
                          }}
                        >
                          Enquire
                          <svg className="h-4 w-4 ml-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                          </svg>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Carousel className="w-full">
                  <CarouselContent>
                    {filteredProducts.map((product) => (
                      <CarouselItem key={product.id} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
                        <Card id={`product-${product.id}`} className="overflow-hidden bg-white hover:shadow-lg pt-0 transition-shadow duration-300" style={{ height: '24rem' }}>
                          <div className="relative h-48">
                            {product.image && product.image.trim() !== '' ? (
                              <img
                                src={getOptimizedImageUrl(product.image, { width: 400, height: 300, quality: 85, format: 'auto' })}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <Image className="h-16 w-16 text-gray-400" />
                                </div>
                            )}
                            <Badge
                              className={`absolute top-2 rounded-full bg-linear-to-l from-gray-900 to-lime-900 border border-gray-50/25 right-2 `}
                              variant={product.inStock ? "default" : "destructive"}
                            >
                              {product.inStock ? (
                                <span className="flex items-center gap-1">
                                  {product.inStock && (
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                  )}  In Stock
                                </span>
                              ) : "Out of Stock"}
                            </Badge>
                          </div>
                          <CardHeader className="pb-2 px-3 md:px-6">
                            <CardTitle className="text-base md:text-lg line-clamp-1">{product.name}</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0 px-3 md:px-6">
                            <div className="flex flex-wrap gap-1 mb-3">
                              {product.brandName && (
                                <Badge variant="outline" className="text-xs">
                                  {product.brandName}
                                </Badge>
                              )}
                              {product.category && (
                                <Badge variant="outline" className="text-xs">
                                  {product.category.name}
                                </Badge>
                              )}
                            </div>
                            <CardDescription className="mb-4 text-xs md:text-sm leading-relaxed line-clamp-2">
                              {product.description || "No description available"}
                            </CardDescription>
                            <Button
                              className="w-full bg-green-500 hover:bg-green-700 cursor-pointer"
                              onClick={() => {
                                if (business.phone) {
                                  const productLink = `${window.location.origin}/${business.slug}#product-${product.id}`;
                                  const message = `I want to purchase this product: ${product.name}\n\nDescription: ${product.description || 'No description available'}\n\nLink: ${productLink}`;
                                  const whatsappUrl = `https://wa.me/${business.phone}?text=${encodeURIComponent(message)}`;
                                  window.open(whatsappUrl, '_blank');
                                } else {
                                  alert('Phone number not available');
                                }
                              }}
                            >
                              Enquire
                              <svg className="h-4 w-4 ml-2" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                              </svg>
                            </Button>
                          </CardContent>
                        </Card>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                    <CarouselPrevious className="left-2 md:left-4 bg-white/80 hover:bg-white text-gray-800 border-0 shadow-lg" />
                    <CarouselNext className="right-2 md:right-4 bg-white/80 hover:bg-white text-gray-800 border-0 shadow-lg" />
                </Carousel>
              )}
            </div>
          </section>
        )
      }

      {/* Start of Portfolio Section */}
      {portfolioContent.images?.length > 0 && (
        <section className="max-w-7xl mx-auto my-12" id="portfolio">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Portfolio</h2>
          </div>

          <div className="grid gap-4 grid-cols-2 md:grid-cols-4 md:grid-rows-2">
            {portfolioContent.images.slice(0, 6).map((image: any, index: number) => {
              // Define grid positions for bento layout
              const gridClasses = [
                "md:row-span-2 md:col-span-2 col-span-2 row-span-1", // Large top-left
                "md:row-span-1 md:col-span-1 col-span-1", // Top-right small
                "md:row-span-1 md:col-span-1 col-span-1", // Top-right small
                "md:row-span-2 md:col-span-2 col-span-2 row-span-1 md:col-start-3 md:row-start-1", // Large bottom
                "md:row-span-1 md:col-span-1 col-span-1", // Bottom-left small
                "md:row-span-1 md:col-span-1 col-span-1"  // Bottom-right small
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
                      <Image className={`text-gray-400 ${index === 0 || index === 3 ? "w-10 h-10" : "w-8 h-8"}`} />
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

      {/* Footer */}
      <footer id="contact" className="relative bg-linear-to-b from-gray-950 to-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Glowing Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-800 rounded-full filter blur-3xl opacity-10 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-zinc-800 rounded-full filter blur-3xl opacity-10 translate-x-1/2 translate-y-1/2"></div>
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-cyan-800 rounded-full filter blur-3xl opacity-5 -translate-x-1/2 -translate-y-1/2"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                {business.logo && business.logo.trim() !== '' && (
                  <img
                    src={getOptimizedImageUrl(business.logo, { width: 150, height: 150, quality: 85 })}
                    alt={business.name}
                    className="h-8 w-auto"
                    loading="lazy"
                  />
                )}
                <span className="text-lg font-semibold">{business.name}</span>
              </div>
              <p className="text-gray-400 text-sm">
                {business.description || 'Your trusted business partner'}
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#about" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#products" className="text-gray-400 hover:text-white transition-colors">Products & Services</a></li>
                <li><a href="#contact" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Info</h3>
              <div className="space-y-2">
                {business.address && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-400 text-sm">{business.address}</span>
                  </div>
                )}
                {business.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <a href={`tel:${business.phone}`} className="text-gray-400 hover:text-white transition-colors text-sm">{business.phone}</a>
                  </div>
                )}
                {business.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <a href={`mailto:${business.email}`} className="text-gray-400 hover:text-white transition-colors text-sm">{business.email}</a>
                  </div>
                )}
              </div>
            </div>

            {/* DigiSence Online Presence CTA Card */}
            <div className="space-y-4">
              <div className="bg-linear-to-br from-gray-900 via-gray-900 to-lime-900 rounded-xl shadow-lg p-6 flex flex-col items-center text-center">
                <a
                  href="https://www.digisence.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button
                    variant="default"
                    className="w-full bg-white text-[#027BE6] hover:bg-[#f0f7ff] hover:text-[#01b1e6] font-bold shadow"
                  >
                    Get Started
                  </Button>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} <span className='font-bold'>{business.name}</span>. All rights reserved.
              </p>
              <p className="text-gray-400 text-sm">
                Powered by <a className='font-bold' href="">DigiSence</a> - The Product of <a className='font-bold ' href="https://digiconnunite.com/">Digiconn Unite Pvt. Ltd.</a>
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Inquiry Modal */}
      <Dialog open={inquiryModal} onOpenChange={setInquiryModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? `Inquire about ${selectedProduct.name}` : 'Get in Touch'}
            </DialogTitle>
            <DialogDescription>
              Send us a message and we'll get back to you soon.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInquiry} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={inquiryData.name}
                onChange={(e) => setInquiryData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={inquiryData.email}
                onChange={(e) => setInquiryData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={inquiryData.phone}
                onChange={(e) => setInquiryData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={inquiryData.message}
                onChange={(e) => setInquiryData(prev => ({ ...prev, message: e.target.value }))}
                rows={4}
                required
              />
            </div>
            <div className="flex space-x-3">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>Sending...</>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Inquiry
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setInquiryModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
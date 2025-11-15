'use client'

import { useState, useEffect } from 'react'
import { Business, Product } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
  X
} from 'lucide-react'

interface BusinessProfileProps {
  business: Business & {
    admin: { name?: string | null; email: string }
    category?: { name: string } | null
    products: (Product & {
      category?: { id: string; name: string } | null
      brand?: { id: string; name: string } | null
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

  console.log('BusinessProfile render, mounted:', mounted)

  useEffect(() => {
    console.log('setting mounted to true')
    setMounted(true)
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

  return (
    <div className="min-h-screen bg-white" suppressHydrationWarning>
  {/* Navigation */ }
  <nav className="sticky top-0 z-40 bg-white border-b">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center space-x-4">
              {business.logo && business.logo.trim() !== '' && (
            <img
              src={business.logo}
              alt={business.name}
              className="h-8 w-auto"
            />
          )}
          <span className="font-semibold text-lg">{business.name}</span>
        </div>
        <div className="hidden md:flex space-x-8">
          <a href="#about" className="text-gray-600 hover:text-gray-900">About</a>
          <a href="#products" className="text-gray-600 hover:text-gray-900">Products</a>
          <a href="#contact" className="text-gray-600 hover:text-gray-900">Contact</a>
        </div>
      </div>
    </div>
  </nav>

  {/* Hero Section with Slider */ }
  <section className="relative">
    <div className="max-w-7xl mx-auto rounded-2xl mt-3   overflow-hidden">
      <Carousel className="w-full">
        <CarouselContent>
          {heroContent.slides?.map((slide: any, index: number) => (
            <CarouselItem key={index}>
              <div className="relative h-96 w-full md:h-[500px] bg-gray-200 rounded-2xl overflow-hidden">
                <img
                  src={slide.image && slide.image.trim() !== '' ? slide.image : '/api/placeholder/1200/600'}
                  alt={slide.headline}
                  className="w-full h-full object-cover rounded-2xl"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-2xl">
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
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
    </div>
  </section>

  {/* Business Information Section */ }
  <section id="about" className="py-16 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Card - About */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
                  {business.logo && business.logo.trim() !== '' && (
                <img
                  src={business.logo}
                  alt={business.name}
                  className="h-40 w-40 rounded-full object-cover flex-shrink-0"
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

        {/* Right Card - Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Get in Touch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {business.address && (
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(business.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {business.address}
                </a>
              </div>
            )}
            {business.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <a
                  href={`tel:${business.phone}`}
                  className="text-blue-600 hover:underline"
                >
                  {business.phone}
                </a>
              </div>
            )}
            {business.email && (
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <a
                  href={`mailto:${business.email}`}
                  className="text-blue-600 hover:underline"
                >
                  {business.email}
                </a>
              </div>
            )}
            {business.website && (
              <div className="flex items-center space-x-3">
                <Globe className="h-5 w-5 text-gray-400" />
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Visit Website
                </a>
              </div>
            )}
            <Separator />
            <Button className="w-full" onClick={() => openInquiryModal()}>
              Get a Quote
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>

  {/* Brand Slider */ }
  {
    brandContent.brands?.length > 0 && (
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Trusted By</h2>
            <Button variant="outline">View All</Button>
          </div>
              <Carousel className="w-full" suppressHydrationWarning>
            <CarouselContent>
              {brandContent.brands.map((brand: any, index: number) => (
                <CarouselItem key={index} className="basis-1/3 md:basis-1/4 lg:basis-1/5">
                  <Card className="overflow-hidden">
                    <div className="h-32 bg-white flex items-center justify-center p-4">
                      <img
                        src={brand.logo && brand.logo.trim() !== '' ? brand.logo : '/api/placeholder/200/100'}
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
    )
  }

  {/* Category Slider */ }
  {
    categoryContent.categories?.length > 0 && (
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Categories</h2>
            <Button variant="outline">View All</Button>
          </div>
          <Carousel className="w-full">
            <CarouselContent>
              {categoryContent.categories.map((category: any, index: number) => (
                <CarouselItem key={index} className="basis-1/3 md:basis-1/4 lg:basis-1/5">
                  <Card className="overflow-hidden">
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

  {/* Products/Services Section */ }
  {
    business.products.length > 0 && (
      <section id="products" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">

              <h2 className="text-2xl font-bold mb-8">Our Products & Services</h2>
              {mounted && (
                <div className="flex flex-col sm:flex-row gap-4 mb-4" suppressHydrationWarning>
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-48">
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
          <Carousel className="w-full">
            <CarouselContent>
                  {filteredProducts.map((product) => (
                <CarouselItem key={product.id} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                        <div className="relative">
                      <div className="h-48 bg-gray-200">
                        <img
                              src={product.image && product.image.trim() !== '' ? product.image : '/api/placeholder/400/300'}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                          <Badge
                            className="absolute top-2 right-2"
                            variant={product.inStock ? "default" : "destructive"}
                          >
                            {product.inStock ? "In Stock" : "Out of Stock"}
                          </Badge>
                        </div>
                    <CardHeader>
                          <CardTitle className="text-lg">{product.name}</CardTitle>
                    </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex flex-wrap gap-2 mb-3">
                            {product.brand && (
                              <Badge variant="outline" className="text-xs">
                                {product.brand.name}
                              </Badge>
                            )}
                            {product.category && (
                              <Badge variant="outline" className="text-xs">
                                {product.category.name}
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="mb-4 text-sm leading-relaxed">
                            {product.description || "No description available"}
                      </CardDescription>
                      <Button
                        className="w-full"
                        onClick={() => openInquiryModal(product)}
                      >
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
    )
  }

  {/* Additional Content Section */ }
  {
    business.additionalContent && (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto prose prose-lg">
          <div dangerouslySetInnerHTML={{ __html: business.additionalContent as string }} />
        </div>
      </section>
    )
  }

  {/* Footer */ }
  <footer id="contact" className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto text-center">
      <div className="flex items-center justify-center space-x-2 mb-4">
            {business.logo && business.logo.trim() !== '' && (
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
      <Button variant="outline" onClick={() => openInquiryModal()}>
        Contact Us
      </Button>
    </div>
  </footer>

  {/* Inquiry Modal */ }
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
    </div >
  )
}
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
  X,
  MessageCircle,
  Image,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
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
  const [viewAllBrands, setViewAllBrands] = useState(false)
  const [viewAllCategories, setViewAllCategories] = useState(false)
  const [viewAllProducts, setViewAllProducts] = useState(false)

  console.log('BusinessProfile render, mounted:', mounted)
  console.log('viewAllBrands:', viewAllBrands, 'viewAllCategories:', viewAllCategories, 'viewAllProducts:', viewAllProducts)

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
    <div className="min-h-screen bg-linear-to-b from-amber-100 to-white  " suppressHydrationWarning>
  {/* Navigation */ }
      <nav className="sticky top-0 z-40 bg-amber-50/80 border-b backdrop-blur-md">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
            <div className="flex relative items-center space-x-4">
              {business.logo && business.logo.trim() !== '' && (
            <img
              src={business.logo}
              alt={business.name}
                  className="h-12 w-auto"
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
        <div className="max-w-7xl mx-auto rounded-3xl mt-3   overflow-hidden">
      <Carousel className="w-full">
        <CarouselContent>
          {heroContent.slides?.map((slide: any, index: number) => (
            <CarouselItem key={index}>
              <div className="relative h-96 w-full md:h-[500px] bg-transparent rounded-2xl overflow-hidden">
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
            <Card className="rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300 text-white relative overflow-hidden" style={{ backgroundImage: 'linear-gradient(to bottom right, rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url(/card-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
              <CardContent className="p-6 relative z-10">
            <div className="flex items-start space-x-4">
                  {business.logo && business.logo.trim() !== '' && (
                <img
                  src={business.logo}
                  alt={business.name}
                      className="h-40 w-40 rounded-full border-2 object-cover shrink-0"
                />
              )}
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{business.name}</h3>
                {business.category && (
                      <Badge variant="outline" className="mb-3 border-white/20 text-white bg-white/10">{business.category.name}</Badge>
                )}
                    <p className="text-gray-100 mb-4 leading-relaxed">
                  {business.description || 'No description available yet.'}
                </p>

              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Card - Contact */}
            <Card className="rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300 text-white relative overflow-hidden" style={{ backgroundImage: 'linear-gradient(to bottom right, rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url(/card-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
              <CardHeader className="relative z-10">
                <CardTitle className="text-white">Get in Touch</CardTitle>
          </CardHeader>
              <CardContent className="space-y-4 relative z-10">
            {business.address && (
              <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-300" />
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(business.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                      className="text-blue-300 hover:underline"
                >
                  {business.address}
                </a>
              </div>
            )}
            {business.phone && (
              <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-300" />
                <a
                  href={`tel:${business.phone}`}
                      className="text-blue-300 hover:underline"
                >
                  {business.phone}
                </a>
              </div>
            )}
            {business.email && (
              <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-300" />
                <a
                  href={`mailto:${business.email}`}
                      className="text-blue-300 hover:underline"
                >
                  {business.email}
                </a>
              </div>
            )}
            {business.website && (
              <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-gray-300" />
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                      className="text-blue-300 hover:underline"
                >
                  Visit Website
                </a>
              </div>
            )}
                <Separator className="bg-white/20" />
                <Button variant="outline" className="w-full border-white text-gray-900 hover:bg-white hover:text-gray-800" onClick={() => openInquiryModal()}>
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
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Trusted By</h2>
            <Button variant="outline" onClick={() => { console.log('View All Brands clicked'); setViewAllBrands(!viewAllBrands); }}>
              {viewAllBrands ? 'Show Less' : 'View All'}
            </Button>
          </div>
          {viewAllBrands ? (
            <div className="flex flex-wrap gap-4">
              {brandContent.brands.map((brand: any, index: number) => (
                <Card key={index} className="overflow-hidden shrink-0 w-48 bg-transparent">
                  <div className="h-32 bg-transparent flex items-center justify-center p-4">
                    {brand.logo && brand.logo.trim() !== '' ? (
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <Image className="h-16 w-16 text-gray-400" />
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="text-center">{brand.name}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <Carousel className="w-full" suppressHydrationWarning>
              <CarouselContent>
                {brandContent.brands.map((brand: any, index: number) => (
                  <CarouselItem key={index} className="basis-1/3 md:basis-1/4 lg:basis-1/5">
                    <Card className="overflow-hidden bg-transparent">
                      <div className="h-32 bg-white flex items-center justify-center p-4">
                        {brand.logo && brand.logo.trim() !== '' ? (
                          <img
                            src={brand.logo}
                            alt={brand.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <Image className="h-16 w-16 text-gray-400" />
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
          )}
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
            <Button variant="outline" onClick={() => { console.log('View All Categories clicked'); setViewAllCategories(!viewAllCategories); }}>
              {viewAllCategories ? 'Show Less' : 'View All'}
            </Button>
          </div>
          {viewAllCategories ? (
            <div className="flex flex-wrap gap-4">
              {categoryContent.categories.map((category: any, index: number) => (
                <Card key={index} className="overflow-hidden shrink-0 w-48 bg-transparent">
                  <CardHeader>
                    <CardTitle className="text-center">{category.name}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <Carousel className="w-full">
              <CarouselContent>
                {categoryContent.categories.map((category: any, index: number) => (
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
          )}
        </div>
      </section>
    )
  }

  {/* Products/Services Section */ }
  {
    business.products.length > 0 && (
      <section id="products" className="py-16 px-4 sm:px-6 lg:px-8 bg-transparent">
        <div className="max-w-7xl mx-auto">

              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Our Products & Services</h2>
                <Button variant="outline" onClick={() => { console.log('View All Products clicked'); setViewAllProducts(!viewAllProducts); }}>
                  {viewAllProducts ? 'Show Less' : 'View All'}
                </Button>
              </div>
              {mounted && (
                <div className="flex flex-col  sm:flex-row gap-4 mb-4" suppressHydrationWarning>
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
                <div className="flex flex-wrap gap-4">
                  {filteredProducts.map((product) => (
                    <Card id={`product-${product.id}`} key={product.id} className="overflow-hidden bg-white hover:shadow-lg transition-shadow duration-300 shrink-0 w-80 ">
                      <div className="relative h-48">
                        {product.image && product.image.trim() !== '' ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Image className="h-16 w-16 text-gray-400" />
                            </div>
                        )}
                        <Badge
                          className={`absolute top-2 rounded-full right-2 `}
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
                          className="w-full bg-green-500 hover:bg-green-700 cursor-pointer "
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
                        <Card id={`product-${product.id}`} className="overflow-hidden bg-white hover:shadow-lg transition-shadow duration-300 ">
                          <div className="relative h-48">
                            {product.image && product.image.trim() !== '' ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <Image className="h-16 w-16 text-gray-400" />
                                </div>
                            )}
                            <Badge
                              className={`absolute top-2 rounded-full right-2 `}
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
                              className="w-full bg-green-500 hover:bg-green-700 cursor-pointer "
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
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              )}
        </div>
      </section>
    )
  }


      {/* Start of Bento Section */}
      <section
        className="max-w-7xl mx-auto my-12 px-4 sm:px-6 lg:px-8"
        id="bento"
      >
        {/* Responsive 4x2 Bento Grid, with 2 big cards */}
        <div className="
    grid 
    gap-6 
    grid-cols-1 
    md:grid-cols-4 
    md:grid-rows-2
    "
        >
          {/* Main Highlight (About) - Top Left Big Card */}
          <div
            className="
        bg-gray-100 
        border 
        rounded-xl 
        shadow-sm 
        flex 
        items-center 
        justify-center 
        aspect-2/1 
        min-h-[180px] 
        min-w-[200px] 
        hover:shadow 
        transition-shadow 
        bg-center bg-cover
        md:row-span-2 md:col-span-2
        col-span-1 row-span-1
      "
            style={{
              backgroundImage: business.logo
                ? `url(${business.logo})`
                : undefined
            }}
          >
            {!business.logo && (
              <span className="flex items-center justify-center w-20 h-20 rounded-full bg-gray-200">
                <Image className="w-10 h-10 text-gray-400" />
              </span>
            )}
          </div>

          {/* Product/Service Card 1 - Top Right Small Card */}
          <div
            className="
        bg-gray-100 border rounded-xl shadow-sm flex items-center justify-center
        aspect-square min-h-[120px] min-w-[120px] hover:shadow transition-shadow
        bg-center bg-cover
        md:row-span-1 md:col-span-1
      "
            style={{
              backgroundImage: business.products && business.products[1]?.image
                ? `url(${business.products[1].image})`
                : undefined
            }}
          >
            {!(business.products && business.products[1]?.image) && (
              <span className="flex items-center justify-center w-14 h-14 rounded-full bg-gray-200">
                <Image className="w-8 h-8 text-gray-400" />
              </span>
            )}
          </div>

          {/* Contact 1 - Top Right Small Card */}
          <div
            className="
        bg-gray-100 border rounded-xl shadow-sm flex items-center justify-center
        aspect-square min-h-[120px] min-w-[120px] hover:shadow transition-shadow
        bg-center bg-cover
        md:row-span-1 md:col-span-1
      "
            style={{
              backgroundImage: business.logo
                ? `url(${business.logo})`
                : undefined
            }}
          >
            {!business.logo && (
              <span className="flex items-center justify-center w-14 h-14 rounded-full bg-gray-200">
                <Image className="w-8 h-8 text-gray-400" />
              </span>
            )}
          </div>

          {/* -- Second Large Card -- - Bottom Left Big Card */}
          <div
            className="
        bg-gray-100 
        border 
        rounded-xl 
        shadow-sm 
        flex 
        flex-col
        items-center 
        justify-center 
        aspect-2/1 
        min-h-[180px] 
        min-w-[200px] 
        hover:shadow 
        transition-shadow 
        bg-center bg-cover
        md:row-span-2 md:col-span-2
        col-span-1 row-span-1
        md:col-start-3 md:row-start-1
      "
            // Use a featured product image or fallback
            style={{
              backgroundImage:
                business.products && business.products[0]?.image
                  ? `url(${business.products[0].image})`
                  : undefined
            }}
          >
            {!(business.products && business.products[0]?.image) && (
              <span className="flex items-center justify-center w-20 h-20 rounded-full bg-gray-200">
                <Image className="w-10 h-10 text-gray-400" />
              </span>
            )}
            {/* Content for featured product/service */}
            {business.products && business.products[0] && (
              <div className="bg-white/80 rounded-lg px-4 py-2 mt-4 text-center max-w-[80%]">
                <h3 className="text-lg font-semibold mb-1 line-clamp-1">
                  {business.products[0].name}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {business.products[0].description || "No description available"}
                </p>
              </div>
            )}
          </div>

          {/* Product/Service Card 2 - Bottom Right Small Card */}
          <div
            className="
        bg-gray-100 border rounded-xl shadow-sm flex items-center justify-center
        aspect-square min-h-[120px] min-w-[120px] hover:shadow transition-shadow
        bg-center bg-cover
        md:row-span-1 md:col-span-1
      "
            style={{
              backgroundImage: business.products && business.products[2]?.image
                ? `url(${business.products[2].image})`
                : undefined
            }}
          >
            {!(business.products && business.products[2]?.image) && (
              <span className="flex items-center justify-center w-14 h-14 rounded-full bg-gray-200">
                <Image className="w-8 h-8 text-gray-400" />
              </span>
            )}
          </div>

          {/* Contact 2 - Bottom Right Small Card */}
          <div
            className="
        bg-gray-100 border rounded-xl shadow-sm flex items-center justify-center
        aspect-square min-h-[120px] min-w-[120px] hover:shadow transition-shadow
        bg-center bg-cover
        md:row-span-1 md:col-span-1
      "
            style={{
              backgroundImage: business.logo
                ? `url(${business.logo})`
                : undefined
            }}
          >
            {!business.logo && (
              <span className="flex items-center justify-center w-14 h-14 rounded-full bg-gray-200">
                <Image className="w-8 h-8 text-gray-400" />
              </span>
            )}
          </div>
        </div>
      </section>
      {/* End of Bento Section */}


  {/* Footer */ }
      <footer id="contact" className="bg-gray-950 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
            {business.logo && business.logo.trim() !== '' && (
                  <img
                    src={business.logo}
                    alt={business.name}
                    className="h-8 w-auto"
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

            {/* Social Media & CTA */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
              <Button variant="outline" className="w-full border-white text-white hover:bg-white hover:text-gray-900" onClick={() => openInquiryModal()}>
                Get in Touch
              </Button>
            </div>
      </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-gray-400 text-sm">
                © 2024 {business.name}. All rights reserved.
              </p>
              <p className="text-gray-400 text-sm">
                Powered by DigiSence - Your Trusted Portal Developers.
              </p>
            </div>
          </div>
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
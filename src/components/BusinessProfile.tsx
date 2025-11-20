'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
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
  Fullscreen,
  Home,
  ShoppingBag,
  Grid3X3,
  MessageSquare,
  User,
  Briefcase
} from 'lucide-react'

interface BusinessProfileProps {
  business: Business & {
    admin: { name?: string | null; email: string }
    category?: { name: string } | null
    portfolioContent?: any
    facebook?: string | null
    twitter?: string | null
    instagram?: string | null
    linkedin?: string | null
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

export default function BusinessProfile({ business: initialBusiness }: BusinessProfileProps) {
  const [business, setBusiness] = useState(initialBusiness)
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
  const [activeSection, setActiveSection] = useState('home')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [lastUpdateCheck, setLastUpdateCheck] = useState(Date.now())

  // Refs for smooth scrolling
  const aboutRef = useRef<HTMLDivElement>(null)
  const brandsRef = useRef<HTMLDivElement>(null)
  const productsRef = useRef<HTMLDivElement>(null)
  const portfolioRef = useRef<HTMLDivElement>(null)
  const contactRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    // Simulate loading time for skeleton
    const timer = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  // Real-time synchronization - check for updates every 30 seconds
  useEffect(() => {
    if (!mounted || !business?.id) return

    const checkForUpdates = async () => {
      try {
        const response = await fetch(`/api/businesses?${business.slug ? `slug=${business.slug}` : `id=${business.id}`}`)
        if (response.ok) {
          const data = await response.json()
          const updatedBusiness = data.business

          // Check if business data has changed
          const hasChanged =
            updatedBusiness.updatedAt !== business.updatedAt ||
            JSON.stringify(updatedBusiness.heroContent) !== JSON.stringify(business.heroContent) ||
            JSON.stringify(updatedBusiness.brandContent) !== JSON.stringify(business.brandContent) ||
            JSON.stringify(updatedBusiness.portfolioContent) !== JSON.stringify(business.portfolioContent) ||
            updatedBusiness.name !== business.name ||
            updatedBusiness.description !== business.description ||
            updatedBusiness.logo !== business.logo ||
            updatedBusiness.address !== business.address ||
            updatedBusiness.phone !== business.phone ||
            updatedBusiness.email !== business.email ||
            updatedBusiness.website !== business.website ||
            updatedBusiness.facebook !== business.facebook ||
            updatedBusiness.twitter !== business.twitter ||
            updatedBusiness.instagram !== business.instagram ||
            updatedBusiness.linkedin !== business.linkedin

          if (hasChanged) {
            setBusiness(updatedBusiness)
            setLastUpdateCheck(Date.now())
            console.log('Business data updated from server')
          }
        }
      } catch (error) {
        console.warn('Failed to check for business updates:', error)
      }
    }

    // Check immediately and then every 30 seconds
    checkForUpdates()
    const interval = setInterval(checkForUpdates, 30000)

    return () => clearInterval(interval)
  }, [mounted, business?.id, business?.slug])


  // Default hero content if not set
  const heroContent = business.heroContent as any || {
    slides: [
      {
        mediaType: 'image',
        media: '',
        headline: 'Welcome to ' + business.name,
        headlineSize: 'text-4xl md:text-6xl',
        headlineColor: '#ffffff',
        headlineAlignment: 'center',
        subheadline: business.description || 'Discover our amazing products and services',
        subtextSize: 'text-xl md:text-2xl',
        subtextColor: '#ffffff',
        subtextAlignment: 'center',
        cta: 'Get in Touch',
        ctaLink: ''
      }
    ],
    autoPlay: true,
    transitionSpeed: 5
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

  // News items for bento grid
  const newsItems = [
    { headline: "Exciting New Product Launch", image: "/placeholder.png", summary: "We're thrilled to announce the launch of our latest product that will revolutionize the industry." },
    { headline: "Company Milestone Achieved", image: "/placeholder.png", summary: "Celebrating 10 years of innovation and customer satisfaction with this special milestone." },
    { headline: "Industry Recognition Award", image: "/placeholder.png", summary: "Proud to receive the Innovation Award for our groundbreaking technology solutions." },
    { headline: "Partnership Announcement", image: "/placeholder.png", summary: "Exciting news about our new strategic partnership that will expand our market reach." },
    { headline: "Customer Success Story", image: "/placeholder.png", summary: "Hear how our solutions helped a client achieve remarkable business growth." },
    { headline: "Sustainability Initiative", image: "/placeholder.png", summary: "Our commitment to environmental responsibility through new green initiatives." }
  ]

  // Categories and filtered products for search/filter - memoized for performance
  const { categories, filteredProducts } = useMemo(() => {
    const categoryMap = new Map<string, { id: string; name: string }>()
    business.products.forEach(p => {
      if (p.category) categoryMap.set(p.category.id, p.category)
    })
    const categories = Array.from(categoryMap.values())
    const filteredProducts = business.products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === 'all' || product.category?.id === selectedCategory)
    )
    return { categories, filteredProducts }
  }, [business.products, searchTerm, selectedCategory])

  const handleInquiry = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Comprehensive validation
      const errors: string[] = []

      // Name validation
      if (!inquiryData.name.trim()) {
        errors.push('Name is required')
      } else if (inquiryData.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long')
      } else if (inquiryData.name.trim().length > 100) {
        errors.push('Name must be less than 100 characters')
      }

      // Email validation
      if (!inquiryData.email.trim()) {
        errors.push('Email is required')
      } else {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        if (!emailRegex.test(inquiryData.email.trim())) {
          errors.push('Please enter a valid email address')
        }
      }

      // Phone validation (optional but if provided, validate format)
      if (inquiryData.phone.trim()) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
        if (!phoneRegex.test(inquiryData.phone.replace(/[\s\-\(\)]/g, ''))) {
          errors.push('Please enter a valid phone number')
        }
      }

      // Message validation
      if (!inquiryData.message.trim()) {
        errors.push('Message is required')
      } else if (inquiryData.message.trim().length < 10) {
        errors.push('Message must be at least 10 characters long')
      } else if (inquiryData.message.trim().length > 2000) {
        errors.push('Message must be less than 2000 characters')
      }

      if (errors.length > 0) {
        alert(`Please fix the following errors:\n${errors.join('\n')}`)
        setIsSubmitting(false)
        return
      }

      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: inquiryData.name.trim(),
          email: inquiryData.email.trim().toLowerCase(),
          phone: inquiryData.phone.trim() || null,
          message: inquiryData.message.trim(),
          businessId: business.id,
          productId: selectedProduct?.id,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        alert('Inquiry submitted successfully! We will get back to you soon.')
        setInquiryModal(false)
        setInquiryData({ name: '', email: '', phone: '', message: '' })
        setSelectedProduct(null)
      } else {
        alert(`Failed to submit inquiry: ${result.error || 'Please try again.'}`)
      }
    } catch (error) {
      console.error('Inquiry submission error:', error)
      alert('An error occurred while submitting your inquiry. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [inquiryData, business.id, selectedProduct])

  const openInquiryModal = (product?: Product) => {
    setSelectedProduct(product || null)
    setInquiryData(prev => ({
      ...prev,
      message: product ? `I'm interested in ${product.name}` : '',
    }))
    setInquiryModal(true)
  }

  // Smooth scroll function - memoized for performance
  const scrollToSection = useCallback((ref: React.RefObject<HTMLDivElement>, sectionName: string) => {
    setActiveSection(sectionName)
    if (ref.current) {
      const offset = 80; // Offset for the fixed header
      const elementPosition = ref.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
    // Close mobile menu if open
    setMobileMenuOpen(false);
  }, [])

  // Intersection Observer for active section tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionName = entry.target.id;
            if (sectionName) {
              setActiveSection(sectionName);
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    // Observe all sections
    const sections = [aboutRef.current, brandsRef.current, productsRef.current, portfolioRef.current, contactRef.current];
    sections.forEach(section => {
      if (section) observer.observe(section);
    });

    return () => {
      sections.forEach(section => {
        if (section) observer.unobserve(section);
      });
    };
  }, []);

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
      {/* Navigation - Hidden on Mobile */}
      <nav className="hidden md:block sticky top-0 z-40 bg-white/95 border-b backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex relative items-center space-x-4">
              {business.logo && business.logo.trim() !== '' && (
                <img
                  src={getOptimizedImageUrl(business.logo, {
                    width: 200,
                    height: 200,
                    quality: 85,
                    format: 'auto',
                    crop: 'fit'
                  })}
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
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 rounded-t-3xl bg-white/95 backdrop-blur-md border-t border-gray-200 z-50 shadow-lg">
        <div className="flex justify-around items-center h-16 px-2">
          <button
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-0 flex-1 ${activeSection === 'home'
              ? 'text-orange-600 bg-orange-50'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1 font-medium">Home</span>
          </button>
          <button
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-0 flex-1 ${activeSection === 'about'
              ? 'text-orange-600 bg-orange-50'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            onClick={() => scrollToSection(aboutRef as React.RefObject<HTMLDivElement>, 'about')}
          >
            <User className="h-5 w-5" />
            <span className="text-xs mt-1 font-medium">About</span>
          </button>
          <button
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-0 flex-1 ${activeSection === 'brands'
              ? 'text-orange-600 bg-orange-50'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            onClick={() => scrollToSection(brandsRef as React.RefObject<HTMLDivElement>, 'brands')}
          >
            <Grid3X3 className="h-5 w-5" />
            <span className="text-xs mt-1 font-medium">Brands</span>
          </button>
          <button
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-0 flex-1 ${activeSection === 'products'
              ? 'text-orange-600 bg-orange-50'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            onClick={() => scrollToSection(productsRef as React.RefObject<HTMLDivElement>, 'products')}
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="text-xs mt-1 font-medium">Products</span>
          </button>
          <button
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-0 flex-1 ${activeSection === 'contact'
              ? 'text-orange-600 bg-orange-50'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            onClick={() => scrollToSection(contactRef as React.RefObject<HTMLDivElement>, 'contact')}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="text-xs mt-1 font-medium">Contact</span>
          </button>
        </div>
      </div>

      {/* Hero Section with Slider - Enhanced for Mobile */}
      <section className="relative mx-auto px-2 pt-2 pb-4 md:pb-0">
        <div className="max-w-7xl mx-auto rounded-2xl sm:rounded-3xl mt-0 sm:mt-3 overflow-hidden shadow-lg">
          {heroContent.slides && heroContent.slides.length > 0 ? (
            <Carousel
              className="w-full"
            >
              <CarouselContent>
                {heroContent.slides.map((slide: any, index: number) => {
                  const isVideo = slide.mediaType === 'video' || (slide.media && (slide.media.includes('.mp4') || slide.media.includes('.webm') || slide.media.includes('.ogg')));
                  const mediaUrl = slide.media || slide.image;

                  return (
                    <CarouselItem key={index}>
                      <div className="relative h-[40vw] min-h-[160px] max-h-[240px] w-full md:h-[500px] md:min-h-[320px] md:max-h-full bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl overflow-hidden">
                        {isVideo && mediaUrl ? (
                          <video
                            src={mediaUrl}
                            className="w-full h-full object-cover rounded-2xl"
                            autoPlay
                            muted
                            loop
                            playsInline
                            poster={slide.poster || (slide.image && slide.image !== mediaUrl ? slide.image : undefined)}
                            onError={(e) => {
                              console.error('Video failed to load:', mediaUrl);
                              const target = e.target as HTMLVideoElement;
                              target.style.display = 'none';
                              const fallbackImg = target.nextElementSibling as HTMLImageElement;
                              if (fallbackImg) {
                                fallbackImg.style.display = 'block';
                              }
                            }}
                          />
                        ) : null}
                        <img
                          src={mediaUrl && mediaUrl.trim() !== '' ? getOptimizedImageUrl(mediaUrl, {
                            width: 1200,
                            height: 600,
                            quality: 85,
                            format: 'auto',
                            crop: 'fill',
                            gravity: 'auto'
                          }) : '/api/placeholder/1200/600'}
                          srcSet={mediaUrl && mediaUrl.trim() !== '' ? generateSrcSet(mediaUrl) : undefined}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                          alt={slide.headline || 'Hero image'}
                          className={`w-full h-full object-cover rounded-2xl ${isVideo ? 'hidden' : ''}`}
                          loading={index === 0 ? "eager" : "lazy"}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/api/placeholder/1200/600';
                          }}
                        />
                        <div className="absolute inset-0 bg-opacity-40 flex items-center justify-center rounded-2xl">
                          <div
                            className={`
                              text-white px-2 md:px-4 py-2 md:py-4
                              ${slide.headlineAlignment === 'left'
                                ? 'text-left items-start justify-start'
                                : slide.headlineAlignment === 'right'
                                  ? 'text-right items-end justify-end'
                                  : 'text-center items-center justify-center'}
                              max-w-[95vw] md:max-w-4xl mx-auto flex flex-col h-full
                            `}
                          >
                            {slide.headline && (
                              <h1
                                className={`
                                  ${slide.headlineSize
                                    ? slide.headlineSize
                                    : 'text-base xs:text-lg sm:text-xl md:text-3xl lg:text-5xl xl:text-6xl'}
                                  font-bold mb-3 md:mb-6
                                  leading-tight md:leading-tight
                                  drop-shadow-lg
                                `}
                                style={{
                                  color: slide.headlineColor || '#ffffff',
                                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                                }}
                              >
                                {slide.headline}
                              </h1>
                            )}
                            {slide.subheadline && (
                              <p
                                className={`
                                  ${slide.subtextSize
                                    ? slide.subtextSize
                                    : 'text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl'}
                                  mb-4 sm:mb-6 md:mb-8
                                  leading-relaxed md:leading-relaxed
                                  drop-shadow-md
                                  max-w-2xl
                                `}
                                style={{
                                  color: slide.subtextColor || '#ffffff',
                                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                                }}
                              >
                                {slide.subheadline}
                              </p>
                            )}
                            {slide.cta && (
                              <div className="flex justify-center sm:justify-start">
                                <Button
                                  size="lg"
                                  onClick={() => openInquiryModal()}
                                  className="text-sm xs:text-base md:text-lg px-4 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 bg-white text-gray-900 hover:bg-gray-100"
                                >
                                  {slide.cta}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              {/* Desktop Navigation */}
              <div className="hidden md:block">
                <CarouselPrevious className="left-4 bg-white/90 hover:bg-white text-gray-800 border-0 shadow-xl hover:shadow-2xl transition-all duration-300" />
                <CarouselNext className="right-4 bg-white/90 hover:bg-white text-gray-800 border-0 shadow-xl hover:shadow-2xl transition-all duration-300" />
              </div>
            </Carousel>
          ) : (
            // Default hero when no slides are configured
            <div className="relative h-[40vw] min-h-[160px] max-h-[240px] w-full md:h-[500px] md:min-h-[320px] bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl overflow-hidden shadow-lg">
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-2xl">
                <div className="text-white text-center px-4 py-4 max-w-4xl mx-auto">
                  <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight drop-shadow-lg">
                    Welcome to {business.name}
                  </h1>
                  <p className="text-base xs:text-lg sm:text-xl md:text-2xl mb-6 md:mb-8 leading-relaxed drop-shadow-md">
                    {business.description || 'Discover our amazing products and services'}
                  </p>
                  <Button
                    size="lg"
                    onClick={() => openInquiryModal()}
                    className="text-lg px-8 py-4 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 bg-white text-gray-900 hover:bg-gray-100"
                  >
                    Get in Touch
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Business Information Section */}
      <section
        id="about"
        ref={aboutRef}
        className="py-4 md:py-16 px-3 sm:px-5 md:px-8 lg:px-12"
      >
        <div className="max-w-7xl mx-auto">
          {/* Two column row: Logo+Info and Contact/QR */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 lg:gap-12">
            {/* Logo + Name/Info Card */}
            <div className="w-full md:w-1/2 flex flex-col items-center md:items-stretch">
              <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 px-4 py-5 md:p-8 h-full flex flex-col items-center md:items-start justify-center w-full bg-white relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 via-amber-500/15 to-yellow-400/20 rounded-2xl blur-2xl -z-10"></div>
                <div className="flex flex-row items-center gap-4 md:gap-6 w-full relative z-10">
                  {/* Logo */}
                  <div className="shrink-0">
                    {business.logo && business.logo.trim() !== '' ? (
                      <img
                        src={getOptimizedImageUrl(business.logo, {
                          width: 300,
                          height: 300,
                          quality: 90,
                          format: 'auto',
                          crop: 'fill',
                          gravity: 'center'
                        })}
                        alt={business.name}
                        className="w-20 h-20 xs:w-28 xs:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full object-cover border border-gray-200 shadow-sm"
                        loading="lazy"
                      />
                    ) : (
                        <div className="w-20 h-20 xs:w-28 xs:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full bg-gray-50 flex items-center justify-center border shadow-sm">
                          <Image className="w-10 h-10 md:w-16 md:h-16 lg:w-20 lg:h-20 text-gray-400" />
                        </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex flex-col flex-1 gap-1 w-full min-w-0 items-center sm:items-start">
                    <h3 className="text-lg md:text-2xl lg:text-3xl text-gray-800 font-extrabold mb-1 md:mb-2 truncate w-full sm:text-left">
                      {business.name || 'Business Name'}
                    </h3>
                    {/* Owner Name and Category combined */}
                    <div className="flex flex-wrap gap-2 items-center mb-1 md:mb-2 w-full">
                      {business.admin?.name && (
                        <span className="flex items-center text-xs border rounded-full py-0.5 px-1.5 md:text-sm text-gray-500 font-medium bg-gray-50">
                          <User className="w-4 h-4 mr-1 text-gray-400" />
                          Owner: {business.admin.name}
                        </span>
                      )}
                      {business.category && (
                        <span className="flex items-center text-xs border rounded-full py-0.5 px-1.5 md:text-sm text-gray-500 font-medium bg-gray-50">
                          <Briefcase className="w-4 h-4 mr-1 text-gray-400" />
                          Category: {business.category.name}
                        </span>
                      )}
                    </div>
                    {/* Description */}
                    {business.description && (
                      <p className="text-xs md:text-sm text-gray-600 line-clamp-2 w-full sm:text-left">
                        {business.description}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </div>
            {/* Contact Info + QR Card */}
            <div className="w-full md:w-1/2 flex flex-col items-center md:items-stretch mt-4 md:mt-0">
              <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 px-4 py-3 md:p-6 flex flex-col items-stretch h-full w-full relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 via-amber-500/15 to-yellow-400/20 rounded-2xl blur-2xl -z-10"></div>
                {/* Contact Information Header */}
                <h3 className="text-sm md:text-lg font-semibold mb-3 md:mb-5 text-gray-700 px-1 w-full relative z-10">
                  Contact Information
                </h3>
                {/* Row: Contact Details + QR Code */}
                <div className="flex flex-row gap-2 md:gap-4 w-full items-center justify-between relative z-10">
                  {/* Contact Text Info */}
                  <div className="flex flex-col flex-1 min-w-0 space-y-2">
                    {business.address && business.address.trim() !== '' && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-[2px] text-gray-500 flex-shrink-0" />
                        <a
                          href={`https://maps.google.com/?q=${encodeURIComponent(business.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs md:text-sm text-orange-600 hover:underline break-words"
                          title="Open in Google Maps"
                        >
                          {business.address}
                        </a>
                      </div>
                    )}
                    {business.phone && business.phone.trim() !== '' && (
                      <div className="flex items-start gap-2">
                        <Phone className="h-4 w-4 mt-[2px] text-gray-500 flex-shrink-0" />
                        <a
                          href={`tel:${business.phone}`}
                          className="text-xs md:text-sm text-orange-600 hover:underline break-all"
                          title="Call this number"
                        >
                          {business.phone}
                        </a>
                      </div>
                    )}
                    {business.email && business.email.trim() !== '' && (
                      <div className="flex items-start gap-2">
                        <Mail className="h-4 w-4 mt-[2px] text-gray-500 flex-shrink-0" />
                        <a
                          href={`mailto:${business.email}`}
                          className="text-xs md:text-sm text-orange-600 hover:underline break-all"
                          title="Send email"
                        >
                          {business.email}
                        </a>
                      </div>
                    )}
                    {(!business.address || business.address.trim() === '') &&
                      (!business.phone || business.phone.trim() === '') &&
                      (!business.email || business.email.trim() === '') && (
                        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
                          <MessageCircle className="h-4 w-4 text-gray-400" />
                          Contact information not available
                      </div>
                      )}
                  </div>
                  {/* QR Code */}
                  <div className="flex flex-col items-center gap-1 bg-white shadow-md p-2 rounded-2xl border border-gray-100 ml-3">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/${business.slug || business.id}`)}`}
                      alt="Profile QR Code"
                      className="w-16 h-16 md:w-20 md:h-20"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        // Could add a fallback icon here
                      }}
                      loading="lazy"
                    />
                    <span className="text-[10px] md:text-xs text-gray-400 mt-1">Scan Me</span>
                  </div>
                </div>
                {/* Social Links Bar */}
                {(business.facebook || business.twitter || business.instagram || business.linkedin || business.website) && (
                  <div className="w-full mt-1 md:mt-4 relative z-10">
                    <div className="
                      flex flex-wrap gap-3 w-full
                      border border-gray-100
                      rounded-xl
                      px-4 py-1 bg-white/50
                      backdrop-blur-md
                      justify-center items-center
                      shadow-inner
                    ">
                      {business.website && (
                        <a
                          href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full border border-gray-200 p-2 hover:bg-gray-100 transition"
                          aria-label="Website"
                        >
                          <Globe className="h-5 w-5 text-gray-600" />
                        </a>
                      )}
                      {business.facebook && (
                        <a
                          href={business.facebook.startsWith('http') ? business.facebook : `https://${business.facebook}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full border border-gray-200 p-2 hover:bg-blue-50 transition"
                          aria-label="Facebook"
                        >
                          <Facebook className="h-5 w-5 text-[#1877F3]" />
                        </a>
                      )}
                      {business.twitter && (
                        <a
                          href={business.twitter.startsWith('http') ? business.twitter : `https://${business.twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full border border-gray-200 p-2 hover:bg-blue-50 transition"
                          aria-label="Twitter"
                        >
                          <Twitter className="h-5 w-5 text-[#1DA1F2]" />
                        </a>
                      )}
                      {business.instagram && (
                        <a
                          href={business.instagram.startsWith('http') ? business.instagram : `https://${business.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full border border-gray-200 p-2 hover:bg-pink-50 transition"
                          aria-label="Instagram"
                        >
                          <Instagram className="h-5 w-5 text-[#E4405F]" />
                        </a>
                      )}
                      {business.linkedin && (
                        <a
                          href={business.linkedin.startsWith('http') ? business.linkedin : `https://${business.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full border border-gray-200 p-2 hover:bg-blue-50 transition"
                          aria-label="Linkedin"
                        >
                          <Linkedin className="h-5 w-5 text-[#0A66C2]" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Slider - Enhanced for Mobile */}
      {
        brandContent.brands?.length > 0 && (
          <section id="brands" ref={brandsRef} className="py-6 md:py-12 px-3 md:px-4 sm:px-6 lg:px-8 bg-transparent">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-4 md:mb-8">
                <h2 className="text-lg md:text-2xl font-bold">Trusted By</h2>
                <Button variant="outline" size="sm" onClick={() => { setViewAllBrands(!viewAllBrands); }}>
                  {viewAllBrands ? 'Show Less' : 'View All'}
                </Button>
              </div>
              {viewAllBrands ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4">
                  {brandContent.brands.map((brand: any, index: number) => (
                    <Card key={index} className="overflow-hidden rounded-2xl md:rounded-3xl py-3 md:py-6 bg-white h-full flex flex-col">
                      <div className="h-20 md:h-32 flex items-center justify-center p-2">
                        {brand.logo && brand.logo.trim() !== '' ? (
                          <img
                            src={getOptimizedImageUrl(brand.logo, {
                              width: 400,
                              height: 300,
                              quality: 85,
                              format: 'auto',
                              crop: 'fit',
                              gravity: 'center' 
                            })}
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
                        <CardTitle className="text-center text-xs md:text-sm md:text-base">{brand.name}</CardTitle>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : (
                <Carousel className="w-full" suppressHydrationWarning>
                  <CarouselContent>
                    {brandContent.brands.map((brand: any, index: number) => (
                      <CarouselItem key={index} className="basis-1/2 md:basis-1/4 lg:basis-1/5">
                        <Card className="overflow-hidden rounded-2xl md:rounded-3xl py-3 md:py-6 bg-white h-full flex flex-col">
                          <div className="h-20 md:h-32 flex items-center justify-center p-2">
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
                            <CardTitle className="text-center text-xs md:text-sm md:text-base">{brand.name}</CardTitle>
                          </CardHeader>
                        </Card>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                    {/* Desktop Navigation */}
                    <div className="hidden md:block">
                    <CarouselPrevious className="left-2 md:left-4 bg-white/80 hover:bg-white text-gray-800 border-0 shadow-lg" />
                    <CarouselNext className="right-2 md:right-4 bg-white/80 hover:bg-white text-gray-800 border-0 shadow-lg" />
                    </div>
                </Carousel>
              )}
            </div>
          </section>
        )
      }

      {/* Category Slider - Enhanced for Mobile */}
      {categoryContent.categories?.length > 0 && (
        <section className="py-6 md:py-12 px-3 md:px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-4 md:mb-8">
              <h2 className="text-lg md:text-2xl font-bold">Categories</h2>
              <Button variant="outline" size="sm" onClick={() => { setViewAllCategories(!viewAllCategories); }}>
                {viewAllCategories ? 'Show Less' : 'View All'}
              </Button>
            </div>
            {viewAllCategories ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4">
                {categoryContent.categories.map((category: any, index: number) => (
                  <Card key={index} className="overflow-hidden bg-transparent h-full flex items-center justify-center">
                    <CardHeader className="p-2 md:p-4">
                      <CardTitle className="text-center text-xs md:text-sm md:text-base">{category.name}</CardTitle>
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
                        <CardHeader className="p-2 md:p-4">
                          <CardTitle className="text-center text-xs md:text-sm md:text-base">{category.name}</CardTitle>
                        </CardHeader>
                      </Card>
                    </CarouselItem>
                  ))}
                  </CarouselContent>
                  {/* Desktop Navigation */}
                  <div className="hidden md:block">
                    <CarouselPrevious className="left-2 md:left-4 bg-white/80 hover:bg-white text-gray-800 border-0 shadow-lg" />
                    <CarouselNext className="right-2 md:right-4 bg-white/80 hover:bg-white text-gray-800 border-0 shadow-lg" />
                  </div>
              </Carousel>
            )}
          </div>
        </section>
      )
      }

      {/* Products/Services Section - Enhanced for Mobile */}
      {
        business.products.length > 0 && (
          <section id="products" ref={productsRef} className="py-8 md:py-16 px-3 md:px-4 sm:px-6 lg:px-8 bg-transparent">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-4 md:mb-8">
                <h2 className="text-lg md:text-2xl font-bold">Our Products & Services</h2>
                <Button variant="outline" size="sm" onClick={() => { setViewAllProducts(!viewAllProducts); }}>
                  {viewAllProducts ? 'Show Less' : 'View All'}
                </Button>
              </div>

              {/* Search Bar */}
              {/* Make the search bar sticky by wrapping it in a sticky div at the parent level */}
              <div className="sticky top-0 z-30  mb-4" ref={searchRef}>
                {mounted && (
                  <div
                    className="flex flex-row  sm:flex-row gap-2 md:gap-4 py-3"
                    suppressHydrationWarning
                  >
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 bg-white text-sm"
                    />
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-fit bg-white sm:w-48 text-sm">
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
              </div>

              {viewAllProducts ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
                  {filteredProducts.map((product) => (
                    <Card id={`product-${product.id}`} key={product.id} className="overflow-hidden pt-0 bg-white hover:shadow-lg transition-shadow duration-300 h-80 md:h-96">
                      <div className="relative h-32 md:h-48">
                        {product.image && product.image.trim() !== '' ? (
                          <img
                            src={getOptimizedImageUrl(product.image, {
                              width: 400,
                              height: 300,
                              quality: 85,
                              format: 'auto',
                              crop: 'fill',
                              gravity: 'center'
                            })}
                            srcSet={generateSrcSet(product.image)}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            alt={product.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                              <Image className="h-10 w-10 md:h-16 md:w-16 text-gray-400" />
                            </div>
                        )}
                        <Badge
                          className={`absolute top-2 bg-gradient-to-l from-gray-900 to-lime-900 border border-gray-50/25 rounded-full right-2 text-xs`}
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
                      <CardHeader className="pb-2 px-2 md:px-3 md:px-6">
                        <CardTitle className="text-xs md:text-sm md:text-base md:text-lg line-clamp-1">{product.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 px-2 md:px-3 md:px-6">
                        <div className="flex flex-row flex-nowrap gap-1 mb-2 md:mb-3 overflow-x-auto hide-scrollbar">
                          {product.brandName && (
                            <Badge variant="outline" className="text-[8px] md:text-xs px-1 md:px-2 py-0.5 h-4 md:h-5 min-w-max">
                              {product.brandName}
                            </Badge>
                          )}
                          {product.category && (
                            <Badge variant="outline" className="text-[8px] md:text-xs px-1 md:px-2 py-0.5 h-4 md:h-5 min-w-max">
                              {product.category.name}
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="mb-2 md:mb-4 text-[10px] md:text-xs md:text-sm leading-relaxed line-clamp-2">
                          {product.description || "No description available"}
                        </CardDescription>
                        <Button
                          className="w-full bg-green-500 hover:bg-green-700 cursor-pointer text-xs md:text-sm"
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
                          <MessageCircle className="h-3 w-3 md:h-4 md:w-4 ml-1 md:ml-2" />
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
                        <Card id={`product-${product.id}`} className="overflow-hidden bg-white hover:shadow-lg pt-0 transition-shadow duration-300 h-80 md:h-96">
                          <div className="relative h-32 md:h-48">
                            {product.image && product.image.trim() !== '' ? (
                              <img
                                src={getOptimizedImageUrl(product.image, { width: 400, height: 300, quality: 85, format: 'auto' })}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                  <Image className="h-10 w-10 md:h-16 md:w-16 text-gray-400" />
                                </div>
                            )}
                            <Badge
                              className={`absolute top-2 rounded-full bg-gradient-to-l from-gray-900 to-lime-900 border border-gray-50/25 right-2 text-xs`}
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
                          <CardHeader className="pb-2 px-2 md:px-3 md:px-6">
                            <CardTitle className="text-xs md:text-sm md:text-base md:text-lg line-clamp-1">{product.name}</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0 px-2 md:px-3 md:px-6">
                            <div className="flex flex-wrap gap-1 mb-2 md:mb-3">
                              {product.brandName && (
                                <Badge variant="outline" className="text-[8px] md:text-xs px-1 md:px-2 py-0.5 h-4 md:h-5 min-w-max">
                                  {product.brandName}
                                </Badge>
                              )}
                              {product.category && (
                                <Badge variant="outline" className="text-[8px] md:text-xs px-1 md:px-2 py-0.5 h-4 md:h-5 min-w-max">
                                  {product.category.name}
                                </Badge>
                              )}
                            </div>
                            <CardDescription className="mb-2 md:mb-4 text-[10px] md:text-xs md:text-sm leading-relaxed line-clamp-2">
                              {product.description || "No description available"}
                            </CardDescription>
                            <Button
                              className="w-full bg-green-500 hover:bg-green-700 cursor-pointer text-xs md:text-sm"
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
                              <MessageCircle className="h-3 w-3 md:h-4 md:w-4 ml-1 md:ml-2" />
                            </Button>
                          </CardContent>
                        </Card>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                    {/* Desktop Navigation */}
                    <div className="hidden md:block">
                    <CarouselPrevious className="left-2 md:left-4 bg-white/80 hover:bg-white text-gray-800 border-0 shadow-lg" />
                    <CarouselNext className="right-2 md:right-4 bg-white/80 hover:bg-white text-gray-800 border-0 shadow-lg" />
                    </div>
                </Carousel>
              )}
            </div>
          </section>
        )
      }

      {/* Portfolio Section - Enhanced for Mobile */}
      {portfolioContent.images?.length > 0 && (
        <section className="max-w-7xl mx-auto my-8 md:my-12 px-3 md:px-4" id="portfolio" ref={portfolioRef}>
          <div className="flex justify-between items-center mb-4 md:mb-8">
            <h2 className="text-lg md:text-2xl font-bold">Portfolio</h2>
          </div>

          <div className="grid gap-2 md:gap-4 grid-cols-2 md:grid-cols-4 md:grid-rows-2">
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
                  className={`bg-gray-100 border rounded-xl shadow-sm flex items-center justify-center hover:shadow transition-shadow bg-center bg-cover relative overflow-hidden ${gridClasses[index] || "md:row-span-1 md:col-span-1"} ${index === 0 || index === 3 ? "min-h-[140px] md:min-h-[180px]" : "min-h-[100px] md:min-h-[120px]"}`}
                  style={{
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
                        quality: 85,
                        format: 'auto',
                        crop: 'fill',
                        gravity: 'auto'
                      })}
                      alt={image.alt || 'Portfolio image'}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                        <span className={`flex items-center justify-center rounded-full bg-gray-200 ${index === 0 || index === 3 ? "w-[60px] h-[60px] md:w-[80px] md:h-[80px]" : "w-[40px] h-[40px] md:w-[56px] md:h-[56px]"}`}>
                          <Image className={`text-gray-400 ${index === 0 || index === 3 ? "w-8 h-8 md:w-10 md:h-10" : "w-6 h-6 md:w-8 md:h-8"}`} />
                    </span>
                  )}

                  {isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black bg-opacity-50 rounded-full p-2">
                        <svg className="w-4 h-4 md:w-6 md:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
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

      {/* Footer - Enhanced for Mobile */}
      <footer id="contact" ref={contactRef} className="relative bg-gradient-to-b from-gray-950 to-gray-900 text-white py-8 md:py-12 px-3 md:px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Glowing Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-800 rounded-full filter blur-3xl opacity-10 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-zinc-800 rounded-full filter blur-3xl opacity-10 translate-x-1/2 translate-y-1/2"></div>
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-cyan-800 rounded-full filter blur-3xl opacity-5 -translate-x-1/2 -translate-y-1/2"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-6 md:mb-8">
            {/* Company Info */}
            <div className="space-y-2 md:space-y-4">
              <div className="flex items-center space-x-2">
                {business.logo && business.logo.trim() !== '' && (
                  <img
                    src={getOptimizedImageUrl(business.logo, {
                      width: 150,
                      height: 150,
                      quality: 85,
                      format: 'auto',
                      crop: 'fit'
                    })}
                    alt={business.name}
                    className="h-6 md:h-8 w-auto"
                    loading="lazy"
                  />
                )}
                <span className="text-sm md:text-lg font-semibold">{business.name}</span>
              </div>
              <p className="text-gray-400 text-xs md:text-sm">
                {business.description || 'Your trusted business partner'}
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-2 md:space-y-4">
              <h3 className="text-sm md:text-lg font-semibold">Quick Links</h3>
              <ul className="space-y-1 md:space-y-2">
                <li><a href="#about" className="text-gray-400 hover:text-white transition-colors text-xs md:text-sm">About Us</a></li>
                <li><a href="#products" className="text-gray-400 hover:text-white transition-colors text-xs md:text-sm">Products & Services</a></li>
                <li><a href="#contact" className="text-gray-400 hover:text-white transition-colors text-xs md:text-sm">Contact</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 md:space-y-4">
              <h3 className="text-sm md:text-lg font-semibold">Contact Info</h3>
              <div className="space-y-1 md:space-y-2">
                {business.address && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-3 w-3 md:h-4 md:w-4 text-gray-400" />
                    <span className="text-gray-400 text-xs md:text-sm">{business.address}</span>
                  </div>
                )}
                {business.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-3 w-3 md:h-4 md:w-4 text-gray-400" />
                    <a href={`tel:${business.phone}`} className="text-gray-400 hover:text-white transition-colors text-xs md:text-sm">{business.phone}</a>
                  </div>
                )}
                {business.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-3 w-3 md:h-4 md:w-4 text-gray-400" />
                    <a href={`mailto:${business.email}`} className="text-gray-400 hover:text-white transition-colors text-xs md:text-sm">{business.email}</a>
                  </div>
                )}
              </div>
            </div>

            {/* DigiSence Online Presence CTA Card */}
            <div className="space-y-2 md:space-y-4">
              <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-lime-900 rounded-xl shadow-lg p-4 md:p-6 flex flex-col items-center text-center">
                <a
                  href="https://www.digisence.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button
                    variant="default"
                    className="w-full bg-white text-[#027BE6] hover:bg-[#f0f7ff] hover:text-[#01b1e6] font-bold shadow text-xs md:text-sm"
                  >
                    Get Started
                  </Button>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-800 pt-4 md:pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
              <p className="text-gray-400 text-xs md:text-sm">
                © {new Date().getFullYear()} <span className='font-bold'>{business.name}</span>. All rights reserved.
              </p>
              <p className="text-gray-400 text-xs md:text-sm">
                Powered by <a className='font-bold' href="https://www.digisence.io/">DigiSence</a> - The Product of <a className='font-bold ' href="https://digiconnunite.com/">Digiconn Unite Pvt. Ltd.</a>
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

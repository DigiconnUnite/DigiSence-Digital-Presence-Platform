'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'

// Define Business type since Prisma doesn't export it for MongoDB
interface Business {
  id: string
  name: string
  slug: string
  description: string | null
  about: string | null
  logo: string | null
  address: string | null
  phone: string | null
  email: string | null
  website: string | null
  facebook: string | null
  twitter: string | null
  instagram: string | null
  linkedin: string | null
  catalogPdf: string | null
  openingHours: any
  gstNumber: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  adminId: string
  categoryId: string | null
  heroContent: any
  brandContent: any
  portfolioContent: any
}

// Define custom Product type to match the updated schema
interface Product {
  id: string
  name: string
  description: string | null
  price: string | null
  image: string | null
  inStock: boolean
  isActive: boolean
  additionalInfo: Record<string, string>
  createdAt: Date
  updatedAt: Date
  businessId: string
  categoryId: string | null
  brandName: string | null
  category?: {
    id: string
    name: string
  } | null
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
  Briefcase,
  UserPlus,
  Share2,
  Download,
  Building2
} from 'lucide-react'
import { FaWhatsapp, FaWhatsappSquare } from "react-icons/fa";
import { SiFacebook, SiX, SiInstagram, SiLinkedin, SiWhatsapp } from "react-icons/si";
import { LampContainer } from './ui/lamp'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface BusinessProfileProps {
  business: Business & {
    admin: { name?: string | null; email: string }
    category?: { name: string } | null
    portfolioContent?: any
    facebook?: string | null
    twitter?: string | null
    instagram?: string | null
    linkedin?: string | null
    about?: string | null
    catalogPdf?: string | null
    openingHours?: any[]
    gstNumber?: string | null
    products: (Product & {
      category?: { id: string; name: string } | null
    })[]
  }
  categories?: Array<{
    id: string
    name: string
    slug: string
    description?: string
    parentId?: string
    _count?: {
      products: number
    }
  }>
}

interface InquiryFormData {
  name: string
  email: string
  phone: string
  message: string
  productId?: string
}

export default function BusinessProfile({ business: initialBusiness, categories: initialCategories = [] }: BusinessProfileProps) {
  const searchParams = useSearchParams()
  const [business, setBusiness] = useState(initialBusiness)
  const [inquiryModal, setInquiryModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productModal, setProductModal] = useState(false)
  const [selectedProductModal, setSelectedProductModal] = useState<Product | null>(null)
  const [inquiryData, setInquiryData] = useState<InquiryFormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [viewAllBrands, setViewAllBrands] = useState(false)
  const [viewAllCategories, setViewAllCategories] = useState(false)
  const [viewAllProducts, setViewAllProducts] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('home')
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
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

  // Check URL parameters for auto-opening product modal
  useEffect(() => {
    if (!mounted || !business.products) return

    const productId = searchParams.get('product')
    const modal = searchParams.get('modal')

    if (productId && modal === 'open') {
      const product = business.products.find(p => p.id === productId)
      if (product) {
        setSelectedProductModal(product)
        setProductModal(true)
        // Clear the URL parameters after opening modal
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href)
          url.searchParams.delete('product')
          url.searchParams.delete('modal')
          window.history.replaceState({}, '', url.toString())
        }
      } else {
        console.warn('Product not found for ID:', productId)
        // Optionally show an alert for invalid product
        if (typeof window !== 'undefined') {
          alert('The requested product could not be found.')
        }
      }
    }
  }, [mounted, business.products, searchParams])

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

  // Autoplay functionality for hero carousel
  useEffect(() => {
    if (heroContent.slides && heroContent.slides.length > 1 && heroContent.autoPlay) {
      const interval = setInterval(() => {
        setCurrentSlideIndex(prev => (prev + 1) % heroContent.slides.length)
      }, (heroContent.transitionSpeed || 5) * 1000)
      return () => clearInterval(interval)
    }
  }, [heroContent.slides, heroContent.autoPlay, heroContent.transitionSpeed])

  // Reset slide index when slides change
  useEffect(() => {
    setCurrentSlideIndex(0)
  }, [heroContent.slides?.length])

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



  // Categories and filtered products for search/filter - memoized for performance
  const { categories, filteredProducts } = useMemo(() => {
    console.log('DEBUG: initialCategories received:', initialCategories)
    const categories = initialCategories.map(cat => ({
      id: cat.id,
      name: cat.name
    }))
    console.log('DEBUG: categories for dropdown:', categories)
    const filteredProducts = business.products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || product.category?.id === selectedCategory
      const matchesBrand = selectedBrand === null || product.brandName === selectedBrand
      return matchesSearch && matchesCategory && matchesBrand
    })
    return { categories, filteredProducts }
  }, [initialCategories, business.products, searchTerm, selectedCategory, selectedBrand])

  // Related products for modal - memoized for performance
  const relatedProducts = useMemo(() => {
    if (!selectedProductModal) return []

    const mainProduct = selectedProductModal
    const allProducts = business.products.filter(p => p.id !== mainProduct.id && p.isActive)

    // Keywords that indicate a product is a component/spare part
    const componentKeywords = ['spare', 'part', 'component', 'accessory', 'kit', 'module', 'unit', 'assembly', 'replacement']

    // Score products based on relevance
    const scoredProducts = allProducts.map(product => {
      let score = 0

      // Higher score for products in same category
      if (product.category?.id === mainProduct.category?.id) {
        score += 3
      }

      // Higher score for products with same brand
      if (product.brandName === mainProduct.brandName) {
        score += 2
      }

      // Very high score if product name contains main product name (suggests it's a component)
      const mainProductWords = mainProduct.name.toLowerCase().split(' ')
      const productWords = product.name.toLowerCase().split(' ')

      for (const mainWord of mainProductWords) {
        if (mainWord.length > 3 && product.name.toLowerCase().includes(mainWord)) {
          score += 5
          break
        }
      }

      // High score for component keywords in product name or description
      const productText = (product.name + ' ' + (product.description || '')).toLowerCase()
      for (const keyword of componentKeywords) {
        if (productText.includes(keyword)) {
          score += 4
          break
        }
      }

      // Medium score for products that share significant words with main product
      const commonWords = mainProductWords.filter(word =>
        word.length > 3 && productWords.includes(word)
      )
      score += commonWords.length * 2

      return { product, score }
    })

    // Sort by score (highest first) and return top 4
    return scoredProducts
      .sort((a, b) => b.score - a.score)
      .filter(item => item.score > 0)
      .slice(0, 4)
      .map(item => item.product)
  }, [business.products, selectedProductModal])

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

  const handleShare = useCallback((product: Product) => {
    const shareUrl = `${window.location.origin}/catalog/${business.slug}?product=${product.id}&modal=open`;
    const shareData = {
      title: product.name,
      text: `Check out this product: ${product.name}`,
      url: shareUrl,
    };
    if (navigator.share) {
      navigator.share(shareData).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Link copied to clipboard!');
      }).catch(() => {
        alert('Failed to copy link');
      });
    }
  }, [business.slug]);

  const openInquiryModal = (product?: Product) => {
    setSelectedProduct(product || null)
    setInquiryData(prev => ({
      ...prev,
      message: product ? `I'm interested in ${product.name}` : '',
    }))
    setInquiryModal(true)
  }

  const openProductModal = (product: Product) => {
    setSelectedProductModal(product)
    setProductModal(true)
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
      {/* <section className="py-12 px-4 sm:px-6 lg:px-8">
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
      </section> */}

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
    <div className="min-h-screen  bg-slate-100  " suppressHydrationWarning>
      {/* Navigation - Hidden on Mobile */}
      <nav className="hidden md:block sticky top-0 z-40 bg-white/90 border-b backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex relative  items-center space-x-4">
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
              ? 'text-cyan-600 bg-cyan-50'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1 font-medium">Home</span>
          </button>
          <button
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-0 flex-1 ${activeSection === 'about'
              ? 'text-cyan-600 bg-cyan-50'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            onClick={() => scrollToSection(aboutRef as React.RefObject<HTMLDivElement>, 'about')}
          >
            <User className="h-5 w-5" />
            <span className="text-xs mt-1 font-medium">About</span>
          </button>
          <button
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-0 flex-1 ${activeSection === 'brands'
              ? 'text-cyan-600 bg-cyan-50'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            onClick={() => scrollToSection(brandsRef as React.RefObject<HTMLDivElement>, 'brands')}
          >
            <Grid3X3 className="h-5 w-5" />
            <span className="text-xs mt-1 font-medium">Brands</span>
          </button>
          <button
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-0 flex-1 ${activeSection === 'products'
              ? 'text-cyan-600 bg-cyan-50'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            onClick={() => scrollToSection(productsRef as React.RefObject<HTMLDivElement>, 'products')}
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="text-xs mt-1 font-medium">Products</span>
          </button>
          <button
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-0 flex-1 ${activeSection === 'portfolio'
              ? 'text-cyan-600 bg-cyan-50'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            onClick={() => scrollToSection(portfolioRef as React.RefObject<HTMLDivElement>, 'portfolio')}
          >
            <Briefcase className="h-5 w-5" />
            <span className="text-xs mt-1 font-medium">Portfolio</span>
          </button>
        </div>
      </div>

      {/* Hero Section with Slider - Enhanced for Mobile */}
      <section className="relative mx-auto px-2 pt-2 pb-4 md:pb-0">
        <div className="max-w-7xl mx-auto rounded-2xl sm:rounded-3xl mt-0 sm:mt-3 overflow-hidden shadow-lg">
          {heroContent.slides && heroContent.slides.length > 0 ? (
            <div className="relative w-full">
              <div className="overflow-hidden rounded-2xl">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlideIndex * 100}%)` }}
                >
                  {heroContent.slides.map((slide: any, index: number) => {
                    const isVideo = slide.mediaType === 'video' || (slide.media && (slide.media.includes('.mp4') || slide.media.includes('.webm') || slide.media.includes('.ogg')));
                    const mediaUrl = slide.media || slide.image;

                    return (
                      <div key={index} className="w-full shrink-0">
                        <div className="relative w-full h-[40vw] min-h-[160px] max-h-[240px] md:h-[500px] md:min-h-[320px] md:max-h-full bg-linear-to-br from-gray-900 to-gray-700 rounded-2xl overflow-hidden">
                          {isVideo && mediaUrl ? (
                            <video
                              src={mediaUrl}
                              className="w-full h-full object-cover rounded-2xl absolute top-0 left-0"
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
                            }) : '/placeholder.png'}
                            srcSet={mediaUrl && mediaUrl.trim() !== '' ? generateSrcSet(mediaUrl) : undefined}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                            alt={slide.headline || 'Hero image'}
                            className={`w-full h-full object-cover rounded-2xl ${isVideo ? 'hidden' : ''} absolute top-0 left-0`}
                            loading={index === 0 ? "eager" : "lazy"}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder.png';
                            }}
                          />
                          {slide.showText !== false && (
                            <div className="absolute inset-0  bg-opacity-40 flex items-center justify-center rounded-2xl">
                              <div
                                className={`
                                  text-white
                                  px-2 py-1
                                  md:px-4 md:py-4
                                  ${slide.headlineAlignment === 'left'
                                    ? 'text-left items-start justify-start'
                                    : slide.headlineAlignment === 'right'
                                      ? 'text-right items-end justify-end'
                                      : 'text-center items-center justify-center'}
                                  max-w-[95vw]
                                  md:max-w-4xl
                                  mx-auto
                                  flex flex-col
                                  h-full
                                  justify-center
                                `}
                              >
                                {slide.headline && (
                                  <h1
                                    className={`
                                      font-bold
                                      leading-tight
                                      drop-shadow-lg
                                      mb-1 xs:mb-2 md:mb-4
                                      tracking-tight
                                      font-display
                                      whitespace-pre-line
                                      ${slide.headlineSize
                                        ? slide.headlineSize
                                        : 'text-sm xs:text-base sm:text-lg md:text-2xl lg:text-4xl xl:text-5xl'}
                                      ${slide.headlineAlignment === 'left'
                                        ? 'text-left'
                                        : slide.headlineAlignment === 'right'
                                          ? 'text-right'
                                          : 'text-center'}
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
                                      drop-shadow-md
                                      max-w-2xl
                                      leading-relaxed
                                      tracking-normal
                                      font-normal
                                      font-sans
                                      mb-2 xs:mb-3 sm:mb-4 md:mb-6
                                      ${slide.subtextSize
                                        ? slide.subtextSize
                                        : 'text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl'}
                                      ${slide.headlineAlignment === 'left'
                                        ? 'text-left'
                                        : slide.headlineAlignment === 'right'
                                          ? 'text-right'
                                          : 'text-center'}
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
                                  <div className={`
                                    flex w-full
                                    ${slide.headlineAlignment === 'left'
                                      ? 'justify-start'
                                      : slide.headlineAlignment === 'right'
                                        ? 'justify-end'
                                        : 'justify-center'}
                                    mt-0 md:mt-4
                                  `}>
                                    <Button
                                      size="lg"
                                      onClick={() => openInquiryModal()}
                                      className={`
                                        text-sm xs:text-base md:text-lg
                                        px-4 xs:px-6 md:px-8
                                        py-2 xs:py-3 md:py-4
                                        font-semibold rounded-xl md:rounded-2xl
                                        shadow-xl hover:shadow-2xl
                                        transition-all duration-300
                                        bg-white text-gray-900 hover:bg-gray-100
                                      `}
                                    >
                                      {slide.cta}
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {heroContent.showArrows !== false && heroContent.slides.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentSlideIndex(prev => prev > 0 ? prev - 1 : heroContent.slides.length - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-full p-2"
                  >
                    <ChevronRight className="h-4 w-4 rotate-180" />
                  </button>
                  <button
                    onClick={() => setCurrentSlideIndex(prev => prev < heroContent.slides.length - 1 ? prev + 1 : 0)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-full p-2"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
              {heroContent.showDots !== false && heroContent.slides.length > 1 && (
                <div className="flex justify-center mt-4 space-x-2">
                  {heroContent.slides.map((_: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlideIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${index === currentSlideIndex ? 'bg-white' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Default hero when no slides are configured
              <div className="relative w-full h-[40vw] min-h-[160px] max-h-[240px] md:h-[500px] md:min-h-[320px] bg-linear-to-br from-cyan-400 via-cyan-500 to-cyan-600 rounded-2xl overflow-hidden shadow-lg">
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-2xl">
                  <div className="text-white text-center px-2 py-2 max-w-[95vw] md:max-w-4xl mx-auto flex flex-col justify-center h-full">
                    <h1 className="text-sm xs:text-base sm:text-lg md:text-5xl lg:text-6xl font-bold mb-1 xs:mb-2 md:mb-6 leading-tight drop-shadow-lg whitespace-pre-line">
                    Welcome to {business.name}
                  </h1>
                    <p className="text-xs xs:text-sm sm:text-base md:text-2xl mb-2 xs:mb-3 md:mb-8 leading-relaxed drop-shadow-md max-w-2xl">
                    {business.description || 'Discover our amazing products and services'}
                  </p>
                  <Button
                    size="lg"
                    onClick={() => openInquiryModal()}
                      className="text-sm xs:text-base md:text-lg px-4 xs:px-6 md:px-8 py-2 xs:py-3 md:py-4 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 bg-white text-gray-900 hover:bg-gray-100"
                  >
                    Get in Touch
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>


      <section
        id="about"
        ref={aboutRef}
        className="py-4 md:py-16 px-3 sm:px-5 md:px-8 lg:px-12"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 lg:gap-12">
            <div className="w-full md:w-1/2 flex flex-col items-center md:items-stretch">
              <Card className="relative bg-linear-to-bl from-cyan-50 via-cyan-100/30 to-cyan-200/20 border border-cyan-500  rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-4 md:p-4 lg:p-6 flex flex-row items-center md:items-stretch w-full max-w-full overflow-hidden">
                <div className="flex w-full flex-row items-center gap-4 md:gap-6 lg:gap-10">
                  <div className="shrink-0 flex items-center justify-center">
                    {business.logo && business.logo.trim() !== '' ? (
                      <img
                        src={getOptimizedImageUrl(business.logo, {
                          width: 280,
                          height: 280,
                          quality: 90,
                          format: 'auto',
                          crop: 'fill',
                          gravity: 'center',
                        })}
                        alt={business.name}
                        className="w-20 h-20 xs:w-24 xs:h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full object-cover border border-gray-200 shadow-sm"
                        loading="lazy"
                      />
                    ) : (
                        <div className="w-20 h-20 xs:w-24 xs:h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full bg-gray-50 flex items-center justify-center border shadow-sm">
                          <Image className="w-12 h-12 md:w-20 md:h-20 lg:w-28 lg:h-28 text-gray-400" />
                        </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col gap-2 md:gap-3 w-full min-w-0">
                    <h3 className="font-extrabold text-lg xs:text-xl sm:text-2xl md:text-3xl text-gray-800 mb-0.5 truncate w-full">
                      {business.name || "Business Name"}
                    </h3>
                    {business.category && (
                      <span className="inline-flex items-center text-xs xs:text-sm md:text-sm px-2 py-0.5 rounded-full border border-cyan-200 bg-cyan-50 text-cyan-700 font-medium mb-1 md:mb-2 w-fit">
                        <Building2 className="w-4 h-4 mr-1 text-cyan-700" />
                        {business.category.name}
                      </span>
                    )}
                    {business.description && (
                      <p className="text-xs xs:text-sm sm:text-base md:text-lg text-gray-600 mb-1 md:mb-2 w-full line-clamp-3">
                        {business.description}
                      </p>
                    )}
                    <div className="flex flex-row items-center gap-2 md:gap-4 mt-1">
                      {business.admin?.name && (
                        <span className="flex items-center text-xs xs:text-sm md:text-base flex-1 rounded-full py-0.5 px-2 bg-linear-to-r from-cyan-900 via-slate-900 to-slate-900  text-gray-200 border border-gray-200 font-semibold">
                          <User className="w-4 h-4 mr-1 text-gray-100" />
                          {business.admin.name}
                        </span>
                      )}
                      {/* <Button
                        variant="outline"
                        size="xs"
                        className="flex items-center text-xs xs:text-sm md:text-base rounded-full py-0.5 cursor-pointer px-3 bg-linear-to-r  from-cyan-900 via-slate-900  to-slate-900 hover:text-gray-100  text-gray-200 border border-gray-200 font-semibold gap-1 shadow-none active:scale-95 transition"
                        onClick={() => {
                          if (business.catalogPdf) {
                            const link = document.createElement('a');
                            link.href = business.catalogPdf;
                            link.download = `${business.name}-catalog.pdf`;
                            link.target = '_blank';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          } else {
                            alert('Catalog not available for download');
                          }
                        }}
                        title="Download catalog PDF"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Catalog
                      </Button> */}
                    </div>
                  </div>
                </div>
              </Card>
              <div className="flex gap-2 mt-3 md:mt-4 w-full relative z-10">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-xs md:text-sm font-medium shadow-sm cursor-pointer"
                  onClick={() => {
                    const vCardData = `BEGIN:VCARD
                        VERSION:3.0
                        FN:${business.name || ''}
                        ORG:${business.category?.name || ''}
                        TEL:${business.phone || ''}
                        EMAIL:${business.email || ''}
                        ADR:;;${business.address || ''};;;;
                        END:VCARD`;

                    const blob = new Blob([vCardData], { type: 'text/vcard' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${business.name || 'contact'}.vcf`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }}
                  title="Save contact to your device"
                >
                  <UserPlus className="h-4 w-4" />
                  Save Contact
                </Button>
                {/* WhatsApp Button */}
                <Button
                  size="sm"
                  className="flex-1 flex items-center justify-center gap-2 rounded-full bg-[#25D366] text-white hover:bg-[#1DA851] transition-colors text-xs md:text-sm font-medium shadow-sm border-0 cursor-pointer"
                  style={{ backgroundColor: '#25D366' }}
                  onClick={() => {
                    if (business.phone) {
                      const phoneNum = business.phone.replace(/[^\d]/g, '');
                      const waUrl = `https://wa.me/${phoneNum}?text=${encodeURIComponent(`Hi, I'm interested in ${business.name}${business.category?.name ? ` (${business.category.name})` : ''}`)}`;
                      window.open(waUrl, '_blank');
                    } else {
                      alert('No WhatsApp number available');
                    }
                  }}
                  title="Contact via WhatsApp"
                >
                  <SiWhatsapp className=' h-3 w-3 md:h-4 md:w-4 ml-1 md:ml-2' />
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-xs md:text-sm font-medium shadow-sm cursor-pointer"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: business.name || 'Business Profile',
                        text: business.description || `Check out ${business.name}`,
                        url: window.location.href
                      }).catch(err => console.log('Error sharing:', err));
                    } else {
                      navigator.clipboard.writeText(window.location.href).then(() => {
                        alert('Link copied to clipboard!');
                      }).catch(err => console.log('Error copying link:', err));
                    }
                  }}
                  title="Share this business profile"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
            <div className="w-full md:w-1/2 flex flex-col items-center md:items-stretch mt-4 md:mt-0">
              <Card className="rounded-2xl sm:rounded-3xl shadow-md bg-linear-60 from-cyan-950 via-slate-950 to-cyan-900 hover:shadow-md transition-shadow duration-300 px-4 py-3 md:p-4  flex flex-col items-stretch h-full w-full relative " >

                <div className="flex flex-row gap-2 md:gap-4 w-full items-center justify-between relative z-10">
                  <div className="flex flex-col flex-1 min-w-0 space-y-3">
                    {business.address && business.address.trim() !== '' && (
                      <div className="flex items-center gap-4 group">
                        <span className="inline-flex items-center justify-center rounded-full border bg-white/15 border-cyan-300/50 group-hover:border-cyan-400 transition-colors w-9 h-9 ">
                          <MapPin className="h-4 w-4 text-gray-100 group-hover:text-cyan-300 transition-colors shrink-0" />
                        </span>
                        <span
                          className="text-xs xs:text-sm md:text-base text-white hover:text-cyan-300 hover:underline font-semibold wrap-break-words transition-colors"
                        >
                          {business.address}
                        </span>
                      </div>
                    )}
                    {business.phone && business.phone.trim() !== '' && (
                      <div className="flex items-center gap-4 group">
                        <span className="inline-flex items-center justify-center rounded-full border bg-white/15 border-cyan-300/50 group-hover:border-cyan-400 transition-colors w-9 h-9 ">
                          <Phone className="h-4 w-4  text-gray-100 group-hover:text-cyan-300 transition-colors shrink-0" />
                        </span>
                        <a
                          href={`tel:${business.phone}`}
                          className="text-xs xs:text-sm md:text-base text-white hover:text-cyan-300 hover:underline font-semibold wrap-break-words transition-colors"
                          title="Call this number"
                        >
                          {business.phone}
                        </a>
                      </div>
                    )}
                    {business.email && business.email.trim() !== '' && (
                      <div className="flex items-center gap-4 group">
                        <span className="inline-flex items-center justify-center rounded-full border bg-white/15 border-cyan-300/50 group-hover:border-cyan-400 transition-colors w-9 h-9 ">
                          <Mail className="h-4 w-4  text-gray-100 group-hover:text-cyan-300 transition-colors shrink-0" />
                        </span>
                        <a
                          href={`mailto:${business.email}`}
                          className="text-xs xs:text-sm md:text-base text-white hover:text-cyan-300 hover:underline font-semibold wrap-break-words transition-colors"
                          title="Send email"
                        >
                          {business.email}
                        </a>
                      </div>
                    )}
                    {(!business.address || business.address.trim() === '') &&
                      (!business.phone || business.phone.trim() === '') &&
                      (!business.email || business.email.trim() === '') && (
                      <div className="flex items-center gap-3 text-[15px] sm:text-base md:text-lg text-gray-300">
                        <span className="inline-flex items-center justify-center rounded-full border border-gray-400 w-8 h-8 bg-gray-900">
                          <MessageCircle className="h-5 w-5 text-gray-400" />
                        </span>
                        Contact information not available
                      </div>
                      )}
                  </div>
                  <div className="flex flex-col items-center gap-1  bg-linear-120 from-cyan-900 via-slate-800 to-slate-900 shadow-md p-3 rounded-lg border border-gray-500 ml-3">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/catalog/${business.slug || business.id}`)}`}
                      alt="Profile QR Code"
                      className="w-16 h-16 md:w-20 md:h-20"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                      loading="lazy"
                    />
                    <span className="text-[10px] md:text-xs text-gray-300 mt-1">Scan Me</span>
                  </div>
                </div>
                {(business.facebook || business.twitter || business.instagram || business.linkedin || business.website) && (
                  <div className="w-full border-t  pt-4 border-gray-200/80 mt-auto md:mt-auto relative z-10">
                    <div className="flex flex-wrap gap-3 w-full justify-center items-center">
                      {business.website && (
                        <a
                          href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors group"
                          aria-label="Website"
                        >
                          <Globe className="h-5 w-5 text-gray-600 group-hover:text-gray-800" />
                        </a>
                      )}
                      {business.facebook && (
                        <a
                          href={business.facebook.startsWith('http') ? business.facebook : `https://${business.facebook}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors group"
                          aria-label="Facebook"
                        >
                          <SiFacebook className="h-5 w-5 text-blue-600 group-hover:text-blue-800" />
                        </a>
                      )}
                      {business.twitter && (
                        <a
                          href={business.twitter.startsWith('http') ? business.twitter : `https://${business.twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors group"
                          aria-label="Twitter"
                        >
                          <SiX className="h-5 w-5 text-gray-600 group-hover:text-gray-800" />
                        </a>
                      )}
                      {business.instagram && (
                        <a
                          href={business.instagram.startsWith('http') ? business.instagram : `https://${business.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-pink-100 hover:bg-pink-200 transition-colors group"
                          aria-label="Instagram"
                        >
                          <SiInstagram className="h-5 w-5 text-pink-600 group-hover:text-pink-800" />
                        </a>
                      )}
                      {business.linkedin && (
                        <a
                          href={business.linkedin.startsWith('http') ? business.linkedin : `https://${business.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors group"
                          aria-label="LinkedIn"
                        >
                          <SiLinkedin className="h-5 w-5 text-blue-600 group-hover:text-blue-800" />
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 py-1 lg:grid-cols-5 gap-2 md:gap-4">
                  {brandContent.brands.map((brand: any, index: number) => (
                    <Card
                      key={index}
                      className={`overflow-hidden rounded-2xl md:rounded-3xl pb-3 pt-0 cursor-pointer transition-all duration-300 h-full flex flex-col ${selectedBrand === brand.name
                        ? 'bg-cyan-50 border border-cyan-500 shadow-lg '
                        : 'bg-white/70 hover:bg-white/90 hover:shadow-md'
                        }`}
                      onClick={() => setSelectedBrand(selectedBrand === brand.name ? null : brand.name)}
                    >
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
                        <CardTitle className={`text-center text-xs md:text-base transition-colors ${selectedBrand === brand.name ? 'text-cyan-700 font-semibold' : ''
                          }`}>
                          {brand.name}
                        </CardTitle>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : (
                  <Carousel opts={{ loop: true, dragFree: false, align: 'start', watchDrag: true, watchResize: true, watchSlides: true }} className="w-full" suppressHydrationWarning>
                  <CarouselContent>
                    {brandContent.brands.map((brand: any, index: number) => (
                      <CarouselItem key={index} className="basis-1/2 md:basis-1/4 lg:basis-1/5">
                        <Card
                          className={`overflow-hidden rounded-2xl md:rounded-3xl pb-3 pt-0 cursor-pointer transition-all duration-300 h-full flex flex-col ${selectedBrand === brand.name
                            ? 'bg-cyan-50 border border-cyan-500 shadow-lg'
                            : 'bg-white/70 hover:bg-white/90 hover:shadow-md'
                            }`}
                          onClick={() => setSelectedBrand(selectedBrand === brand.name ? null : brand.name)}
                        >
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
                            <CardTitle className={`text-center text-xs md:text-base transition-colors ${selectedBrand === brand.name ? 'text-cyan-700 font-semibold' : ''
                              }`}>
                              {brand.name}
                            </CardTitle>
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
      {/* {categories?.length > 0 && (
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
                {categories.map((category, index: number) => (
                  <Card
                    key={category.id}
                    className="overflow-hidden flex flex-col items-center justify-center backdrop-blur-md bg-white/50 w-full min-h-[70px] md:min-h-[100px]"
                  >
                    <CardHeader className="p-2 w-full flex justify-center items-center">
                      <CardTitle className="w-full text-center text-xs md:text-base">{category.name}</CardTitle>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <Carousel className="w-full transition-all duration-300 ease-in-out">
                <CarouselContent>
                    {categories.map((category) => (
                      <CarouselItem key={category.id} className="basis-1/2 md:basis-1/4 lg:basis-1/5 flex">
                        <Card
                          className="overflow-hidden flex flex-col items-center justify-center backdrop-blur-md bg-white/50 w-full min-h-[70px] md:min-h-[100px]"
                        >
                          <CardHeader className="p-2 w-full flex justify-center items-center">
                            <CardTitle className="w-full text-center text-xs md:text-base">{category.name}</CardTitle>
                        </CardHeader>
                      </Card>
                    </CarouselItem>
                  ))}
                  </CarouselContent>

                  <div className="hidden md:block">
                    <CarouselPrevious className="left-2 md:left-4 bg-white/80 hover:bg-white text-gray-800 border-0 shadow-lg" />
                    <CarouselNext className="right-2 md:right-4 bg-white/80 hover:bg-white text-gray-800 border-0 shadow-lg" />
                  </div>
              </Carousel>
            )}
          </div>
        </section>
      )} */}

      {/* Products/Services Section - Enhanced for Mobile */}
      {
        business.products.length > 0 && (
          <section id="products" ref={productsRef} className="py-8 md:py-16 px-3 md:px-4 sm:px-6 lg:px-8 bg-transparent">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-4 md:mb-8">
                <div className="flex flex-col gap-2">
                  <h2 className="text-lg md:text-2xl font-bold">Our Products & Services</h2>
                  {selectedBrand && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-cyan-100 text-cyan-800 border-cyan-300">
                        Filtered by: {selectedBrand}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedBrand(null)}
                        className="text-cyan-600 hover:text-cyan-800 hover:bg-cyan-50 h-6 px-2 text-xs"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Clear
                      </Button>
                    </div>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={() => { setViewAllProducts(!viewAllProducts); }}>
                  {viewAllProducts ? 'Show Less' : 'View All'}
                </Button>
              </div>

              {/* Search Bar */}
              {/* Make the search bar sticky by wrapping it in a sticky div at the parent level */}
              <div className="sticky top-0 backdrop-blur-2xl z-30  mb-4" ref={searchRef}>
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
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 transition-all duration-300 ease-in-out">
                  {filteredProducts.map((product) => (
                    <Card id={`product-${product.id}`} className="overflow-hidden bg-white hover:shadow-lg pt-0 transition-shadow duration-300 pb-2">
                      <div className="relative h-32 md:h-48 cursor-pointer" onClick={() => openProductModal(product)}>
                        {product.image && product.image.trim() !== '' ? (
                          <img
                            src={getOptimizedImageUrl(product.image, { width: 400, height: 300, quality: 85, format: 'auto' })}
                            alt={product.name}
                            className="w-full h-full object-contain"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                              <Image className="h-10 w-10 md:h-16 md:w-16 text-gray-400" />
                            </div>
                        )}
                        <Badge
                          className={`absolute top-2 rounded-full ${product.inStock ? 'bg-linear-to-l from-gray-900 to-lime-900' : 'bg-linear-to-l from-gray-900 to-red-900'} border border-gray-50/25 right-2 text-xs`}
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
                          ) : (
                            <span className="flex items-center gap-1">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                              </span>  Out of Stock
                            </span>
                          )}
                        </Badge>
                      </div>
                      <CardHeader className="pb-2 px-2 md:px-6">
                        <CardTitle className="text-xs e md:text-lg line-clamp-1 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => openProductModal(product)}>{product.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 px-2  md:px-6">
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
                        <CardDescription className="mb-2 md:mb-4 text-[10px]  md:text-sm leading-relaxed line-clamp-2">
                          {product.description || "No description available"}
                        </CardDescription>
                        <div className="flex gap-2 mt-auto">
                          <Button
                            className="flex-1 bg-green-500 hover:bg-green-700 cursor-pointer text-xs md:text-sm"
                            onClick={() => {
                              if (business.phone) {
                                const productLink = `${window.location.origin}/catalog/${business.slug}?product=${product.id}&modal=open`;
                                const message = `${product.name}\n\nDescription: ${product.description}\n\nLink: ${productLink}`;
                                const whatsappUrl = `https://wa.me/${business.phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`;
                                try {
                                  window.open(whatsappUrl, '_blank');
                                } catch (error) {
                                  alert('Unable to open WhatsApp. Please ensure WhatsApp is installed or try on a mobile device.');
                                }
                              } else {
                                alert('Phone number not available');
                              }
                            }}
                          >
                            Inquire Now
                            <SiWhatsapp className=' h-3 w-3 md:h-4 md:w-4 ml-1 md:ml-2' />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShare(product);
                            }}
                          >
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Share2 className="h-4 w-4" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Share this product</p>
                              </TooltipContent>
                            </Tooltip>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                  <Carousel opts={{ loop: true, dragFree: false, align: 'start', watchDrag: true, watchResize: true, watchSlides: true }} className="w-full" suppressHydrationWarning>
                  <CarouselContent>
                    {filteredProducts.map((product) => (
                      <CarouselItem key={product.id} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
                        <Card id={`product-${product.id}`} className="overflow-hidden bg-white hover:shadow-lg pt-0 transition-shadow duration-300 pb-2">
                          <div className="relative h-32 md:h-48 cursor-pointer" onClick={() => openProductModal(product)}>
                            {product.image && product.image.trim() !== '' ? (
                              <img
                                src={getOptimizedImageUrl(product.image, { width: 400, height: 300, quality: 85, format: 'auto' })}
                                alt={product.name}
                                className="w-full h-full object-contain"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                  <Image className="h-10 w-10 md:h-16 md:w-16 text-gray-400" />
                                </div>
                            )}
                            <Badge
                              className={`absolute top-2 rounded-full ${product.inStock ? 'bg-linear-to-l from-gray-900 to-lime-900' : 'bg-linear-to-l from-gray-900 to-red-900'} border border-gray-50/25 right-2 text-xs`}
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
                              ) : (
                                <span className="flex items-center gap-1">
                                  <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                  </span>  Out of Stock
                                </span>
                              )}
                            </Badge>
                          </div>
                          <CardHeader className="pb-2 px-2 md:px-6">
                            <CardTitle className="text-xs e md:text-lg line-clamp-1 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => openProductModal(product)}>{product.name}</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0 px-2  md:px-6">
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
                            <CardDescription className="mb-2 md:mb-4 text-[10px]  md:text-sm leading-relaxed line-clamp-2">
                              {product.description || "No description available"}
                            </CardDescription>
                            <div className="flex gap-2 mt-auto">
                              <Button
                                className="flex-1 bg-green-500 hover:bg-green-700 cursor-pointer text-xs md:text-sm"
                                onClick={() => {
                                  if (business.phone) {
                                    const productLink = `${window.location.origin}/catalog/${business.slug}?product=${product.id}&modal=open`;
                                    const message = `${product.name}\n\nDescription: ${product.description}\n\nLink: ${productLink}`;
                                    const whatsappUrl = `https://wa.me/${business.phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`;
                                    try {
                                      window.open(whatsappUrl, '_blank');
                                    } catch (error) {
                                      alert('Unable to open WhatsApp. Please ensure WhatsApp is installed or try on a mobile device.');
                                    }
                                  } else {
                                    alert('Phone number not available');
                                  }
                                }}
                              >
                                Inquire Now
                                <SiWhatsapp className=' h-3 w-3 md:h-4 md:w-4 ml-1 md:ml-2' />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="px-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShare(product);
                                }}
                              >
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Share2 className="h-4 w-4" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Share this product</p>
                                  </TooltipContent>
                                </Tooltip>
                              </Button>
                            </div>
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



          <div className="w-full mt-8">
            <div className="flex flex-col md:flex-row gap-8 md:gap-12">
              {/* Left Side: About Us */}
              <div className="flex-1">
                <h2 className="text-xl md:text-2xl font-bold mb-3">About Us</h2>
                <p className="text-gray-700 md:text-base text-sm leading-relaxed whitespace-pre-line">
                  {business.about || "We are a leading business offering top quality products and services to our customers. Our mission is to deliver excellence and build lasting relationships."}
                </p>
              </div>
              {/* Separator */}
              <div className="hidden md:flex flex-col items-center justify-center">
                <Separator orientation="vertical" className="h-32" />
              </div>
              {/* Right Side: Opening Hours & GST Number */}
              <div className="flex-1">
                <h2 className="text-xl md:text-2xl font-bold mb-3">Opening Hours & Details</h2>
                <div className="space-y-4 flex justify-between">
                  <div>
                    <Label className="flex flex-2  text-gray-600 mb-1">Opening Hours</Label>
                    {business.openingHours && business.openingHours.length > 0 ? (
                      <ul className="text-sm flex-1 text-gray-800">
                        {business.openingHours.map((item: any, idx: number) => (
                          <li key={idx} className="flex flex-1 gap-5 justify-between items-center py-0.5">
                            <span className="font-medium">{item.day}</span>
                            <span></span>
                            <span></span>
                            <span>
                              {item.open && item.close
                                ? `${item.open} - ${item.close}`
                                : "Closed"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-400">Not provided</p>
                    )}
                  </div>
                  <div>
                    <Label className="block text-gray-600 mb-1">GST Number</Label>
                    <p className="text-sm text-gray-800">{business.gstNumber || <span className="text-gray-400">Not provided</span>}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>







        </section>
      )}

      {/* Footer - Enhanced for Mobile */}
      <LampContainer>
        <footer className="relative  text-white py-8 pb-10 mb-10 sm:mb-0 md:py-12 px-3 md:px-4 sm:px-6 lg:px-8 overflow-hidden">


        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-6 md:mb-8">

            {/* DigiSence Online Presence CTA Card */}
              <div className="space-y-2 bg-linear-120 from-cyan-900 via-gray-800 to-gray-900 rounded-xl  md:space-y-4">
                <div className="bg-lienar-to-br from-gray-900 via-gray-900 to-cyan-900 rounded-xl shadow-lg p-4 md:p-6 flex flex-col items-center text-center">
                <p className="mb-3 text-sm md:text-base text-white font-medium">
                  Make your online presence with DigiSence
                </p>
                <a
                    href="#"
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
      </LampContainer>

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

      {/* Product Modal */}
      <Dialog open={productModal} onOpenChange={setProductModal}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto hide-scrollbar">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl">{selectedProductModal?.name}</DialogTitle>
            <DialogDescription>
              Product details and related items
            </DialogDescription>
          </DialogHeader>

          {selectedProductModal && (
            <div className="space-y-6">
              {/* Product Image */}
              <div className="flex justify-center">
                <div className="relative w-full max-w-md h-64 md:h-80 rounded-lg overflow-hidden border border-gray-200 shadow-sm ">
                  {selectedProductModal.image && selectedProductModal.image.trim() !== '' ? (
                    <img
                      src={getOptimizedImageUrl(selectedProductModal.image, {
                        width: 600,
                        height: 400,
                        quality: 90,
                        format: 'auto',
                        crop: 'fill',
                        gravity: 'center'
                      })}
                      srcSet={generateSrcSet(selectedProductModal.image)}
                      sizes="(max-width: 768px) 100vw, 600px"
                      alt={selectedProductModal.name}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100">
                      <Image className="h-16 w-16 md:h-24 md:w-24 text-gray-400" />
                    </div>
                  )}
                  <Badge
                    className={`absolute top-3 right-3 ${selectedProductModal.inStock
                      ? 'bg-linear-to-l from-gray-900 to-lime-900'
                      : 'bg-linear-to-l from-gray-900 to-red-900'
                      } text-white border-0`}
                  >
                    {selectedProductModal.inStock ? (
                      <span className="flex items-center gap-1">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                        </span> In Stock
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400"></span>
                        </span> Out of Stock
                      </span>
                    )}
                  </Badge>
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {selectedProductModal.brandName && (
                    <Badge variant="outline" className="text-sm">
                      {selectedProductModal.brandName}
                    </Badge>
                  )}
                  {selectedProductModal.category && (
                    <Badge variant="outline" className="text-sm">
                      {selectedProductModal.category.name}
                    </Badge>
                  )}
                </div>

                {selectedProductModal.price && (
                  <div className="text-2xl font-bold text-green-600">
                    {selectedProductModal.price}
                  </div>
                )}

                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {selectedProductModal.description || "No description available"}
                  </p>
                </div>

                {/* Additional Information Section */}
                {(selectedProductModal.additionalInfo && Object.keys(selectedProductModal.additionalInfo).length > 0) && (
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold text-gray-900">Additional Information</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Property</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {Object.entries(selectedProductModal.additionalInfo).map(([key, value], index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm font-medium text-gray-900 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-700">{value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Related Products */}
              {relatedProducts.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Products Components</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {relatedProducts.map((product) => (
                      <Card key={product.id} className="overflow-hidden pt-0 bg-white hover:shadow-lg transition-shadow duration-300 pb-2 cursor-pointer" onClick={() => setSelectedProductModal(product)}>
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
                              className="w-full h-full object-contain"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Image className="h-10 w-10 md:h-16 md:w-16 text-gray-400" />
                            </div>
                          )}
                          <Badge
                            className={`absolute top-2 ${product.inStock ? 'bg-linear-to-l from-gray-900 to-lime-900' : 'bg-linear-to-l from-gray-900 to-red-900'} border border-gray-50/25 rounded-full right-2 text-xs`}
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
                            ) : (
                              <span className="flex items-center gap-1">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>  Out of Stock
                              </span>
                            )}
                          </Badge>
                        </div>
                        <CardHeader className="pb-2 px-2 md:px-3 ">
                          <CardTitle className="text-xs  md:text-lg line-clamp-1">{product.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 px-2 md:px-3 ">
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
                          <CardDescription className="mb-2 md:mb-4 text-[10px]  md:text-sm leading-relaxed line-clamp-2">
                            {product.description || "No description available"}
                          </CardDescription>
                          <Button
                            className="w-full mt-auto bg-green-500 hover:bg-green-700 cursor-pointer text-xs md:text-sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (business.phone) {
                                const productLink = `${window.location.origin}/catalog/${business.slug}?product=${product.id}&modal=open`;
                                const message = `${product.name}\n\nDescription: ${product.description}\n\nLink: ${productLink}`;
                                const whatsappUrl = `https://wa.me/${business.phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`;
                                try {
                                  window.open(whatsappUrl, '_blank');
                                } catch (error) {
                                  alert('Unable to open WhatsApp. Please ensure WhatsApp is installed or try on a mobile device.');
                                }
                              } else {
                                alert('Phone number not available');
                              }
                            }}
                          >
                            Inquire Now
                            <SiWhatsapp className=' h-3 w-3 md:h-4 md:w-4 ml-1 md:ml-2' />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  )
}

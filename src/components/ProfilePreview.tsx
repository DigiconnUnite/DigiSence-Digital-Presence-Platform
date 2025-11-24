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
  Eye,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  User,
  Download,
  Share2,
  UserPlus,
  MessageCircle,
  Image
} from 'lucide-react'
import { FaWhatsapp } from "react-icons/fa";
import { SiFacebook, SiX, SiInstagram, SiLinkedin } from "react-icons/si";

interface ProfilePreviewProps {
    business: Business & {
      admin: { name?: string | null; email: string }
      category?: { name: string } | null
      portfolioContent?: any
      products: Product[]
      about?: string | null
      catalogPdf?: string | null
      openingHours?: any[]
      gstNumber?: string | null
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
      about: string
      logo: string
      address: string
      phone: string
      email: string
      website: string
      ownerName: string
      catalogPdf: string
      openingHours: any[]
      gstNumber: string
    }
  products?: (Product & {
    category?: { id: string; name: string } | null
  })[]
  }

export default function ProfilePreview({ business, selectedSection, sectionTitles = {}, heroContent: propHeroContent, brandContent: propBrandContent, portfolioContent: propPortfolioContent, onSectionClick, businessFormData, products: propProducts }: ProfilePreviewProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)

    // Merge business data with form data for real-time preview
    const mergedBusiness = businessFormData ? {
      ...business,
      name: businessFormData.name || business.name,
      description: businessFormData.description || business.description,
      about: businessFormData.about || business.about,
      logo: businessFormData.logo || business.logo,
      address: businessFormData.address || business.address,
      phone: businessFormData.phone || business.phone,
      email: businessFormData.email || business.email,
      website: businessFormData.website || business.website,
      catalogPdf: businessFormData.catalogPdf || business.catalogPdf,
      openingHours: businessFormData.openingHours || business.openingHours,
      gstNumber: businessFormData.gstNumber || business.gstNumber,
      facebook: (business as any).facebook,
      twitter: (business as any).twitter,
      instagram: (business as any).instagram,
      linkedin: (business as any).linkedin,
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

  // Reset slide index when slides change
  useEffect(() => {
    setCurrentSlideIndex(0)
  }, [heroContent.slides?.length])

  // Autoplay functionality for hero carousel
  useEffect(() => {
    if (heroContent.slides && heroContent.slides.length > 1 && heroContent.autoPlay) {
      const interval = setInterval(() => {
        setCurrentSlideIndex(prev => (prev + 1) % heroContent.slides.length)
      }, (heroContent.transitionSpeed || 5) * 1000)
      return () => clearInterval(interval)
    }
  }, [heroContent.slides, heroContent.autoPlay, heroContent.transitionSpeed])

  const renderFullPreview = () => (
    <div className="w-full h-[80vh] rounded-lg" suppressHydrationWarning>
      <iframe
        src={`/catalog/${business.slug}`}
        className="w-full h-full border-0"
        title="Business Profile Preview"
      />
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
      full: 'Full Preview'
    }
    const displayTitles = { ...defaultTitles, ...sectionTitles }

    // Debug logs for contact data
    if (selectedSection === 'info') {
      console.log('Contact cards debug:', {
        address: mergedBusiness.address,
        phone: mergedBusiness.phone,
        email: mergedBusiness.email,
        website: mergedBusiness.website,
        facebook: (mergedBusiness as any).facebook,
        twitter: (mergedBusiness as any).twitter,
        instagram: (mergedBusiness as any).instagram,
        linkedin: (mergedBusiness as any).linkedin
      })
    }

    return (
      <div className="bg-amber-50 border rounded-lg p-6" suppressHydrationWarning>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Focused Section: {displayTitles[selectedSection as keyof typeof displayTitles]}
          </h3>
        </div>

        {selectedSection === 'hero' && (
          <section className="relative">
            <div className="max-w-7xl mx-auto rounded-3xl mt-3 overflow-hidden shadow-lg">
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
                          <div key={index} className="w-full flex-shrink-0">
                            <div className="relative h-96 w-full bg-linear-to-br from-gray-900 to-gray-700 rounded-2xl overflow-hidden">
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
                              {slide.showText !== false && (
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
                                            : 'text-sm xs:text-base sm:text-lg md:text-2xl lg:text-4xl xl:text-5xl'}
                                          font-bold mb-1 xs:mb-2 md:mb-4
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
                                          mb-2 xs:mb-3 sm:mb-4 md:mb-6
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
                                          className="text-sm xs:text-base md:text-lg px-4 xs:px-6 md:px-8 py-2 xs:py-3 md:py-4 rounded-xl md:rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 bg-white text-gray-900 hover:bg-gray-100"
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
                      {heroContent.slides.map((_, index) => (
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
                <div className="relative h-96 w-full bg-linear-to-br from-orange-400 to-amber-500 rounded-2xl overflow-hidden shadow-lg">
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-2xl">
                    <div className="text-white text-center px-2 py-2 max-w-[95vw] md:max-w-4xl mx-auto">
                      <h1 className="text-sm xs:text-base sm:text-lg md:text-5xl lg:text-6xl font-bold mb-1 xs:mb-2 md:mb-6 leading-tight drop-shadow-lg">
                        Welcome to {mergedBusiness.name}
                      </h1>
                      <p className="text-xs xs:text-sm sm:text-base md:text-2xl mb-2 xs:mb-3 md:mb-8 leading-relaxed drop-shadow-md">
                        {mergedBusiness.description || 'Discover our amazing products and services'}
                      </p>
                      <Button
                        size="lg"
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
        )}

        {selectedSection === 'info' && (
          <section className="py-4 md:py-8 px-3 sm:px-5 md:px-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-8">
                <div className="w-full md:w-1/2 flex flex-col items-center md:items-stretch">
                  <Card className="relative bg-linear-to-bl from-[#ffe4e6] to-[#ccfbf1] rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-4 md:p-4 lg:p-6 flex flex-row items-center md:items-stretch w-full max-w-full overflow-hidden">
                    <div className="flex w-full flex-row items-center gap-4 md:gap-6 lg:gap-10">
                      <div className="flex-shrink-0 flex items-center justify-center">
                        {mergedBusiness.logo && mergedBusiness.logo.trim() !== '' ? (
                          <img
                            src={getOptimizedImageUrl(mergedBusiness.logo, {
                              width: 140,
                              height: 140,
                              quality: 90,
                              format: 'auto',
                              crop: 'fill',
                              gravity: 'center',
                            })}
                            alt={mergedBusiness.name}
                            className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full object-cover border border-gray-200 shadow-sm"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full bg-gray-50 flex items-center justify-center border shadow-sm">
                            <Image className="w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col gap-2 md:gap-3 w-full min-w-0">
                        <h3 className="font-extrabold text-lg xs:text-xl sm:text-2xl md:text-2xl text-gray-800 mb-0.5 truncate w-full">
                          {mergedBusiness.name || "Business Name"}
                        </h3>
                        {mergedBusiness.category && (
                          <span className="inline-block text-xs xs:text-sm md:text-sm px-2 py-0.5 rounded-full border border-orange-200 bg-orange-50 text-orange-700 font-medium mb-1 md:mb-2 w-fit">
                            {mergedBusiness.category.name}
                          </span>
                        )}
                        {mergedBusiness.description && (
                          <p className="text-xs xs:text-sm sm:text-base md:text-base text-gray-600 mb-1 md:mb-2 w-full line-clamp-3">
                            {mergedBusiness.description}
                          </p>
                        )}
                        <div className="flex flex-row items-center gap-2 md:gap-4 mt-1">
                          {mergedBusiness.admin?.name && (
                            <span className="flex items-center text-xs xs:text-sm md:text-sm rounded-full py-0.5 px-2 bg-gray-100 text-gray-700 border border-gray-200 font-semibold">
                              <User className="w-3 h-3 mr-1 text-gray-400" />
                              {mergedBusiness.admin.name}
                            </span>
                          )}
                          {mergedBusiness.catalogPdf && (
                            <Button
                              variant="outline"
                              size="xs"
                              className="flex items-center text-xs xs:text-sm md:text-sm rounded-full py-0.5 px-2 bg-gray-100 text-gray-700 border border-gray-200 font-semibold gap-1 shadow-none hover:shadow active:scale-95 transition"
                              onClick={() => {
                                if (mergedBusiness.catalogPdf) {
                                  const link = document.createElement('a');
                                  link.href = mergedBusiness.catalogPdf;
                                  link.download = `${mergedBusiness.name}-catalog.pdf`;
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
                              <Download className="w-3 h-3 mr-1" />
                              Download Catalog
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                  <div className="flex gap-2 mt-3 md:mt-4 w-full relative z-10">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-xs md:text-sm font-medium shadow-sm"
                    >
                      <UserPlus className="h-3 w-3" />
                      Save Contact
                    </Button>
                    {mergedBusiness.phone && (
                      <Button
                        size="sm"
                        className="flex-1 flex items-center justify-center gap-2 rounded-full bg-[#25D366] text-white hover:bg-[#1DA851] transition-colors text-xs md:text-sm font-medium shadow-sm border-0"
                      >
                        <FaWhatsapp className="h-3 w-3" />
                        WhatsApp
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-xs md:text-sm font-medium shadow-sm"
                    >
                      <Share2 className="h-3 w-3" />
                      Share
                    </Button>
                  </div>
                </div>
                <div className="w-full md:w-1/2 flex flex-col items-center md:items-stretch mt-4 md:mt-0">
                  <Card className="rounded-2xl sm:rounded-3xl shadow-md hover:shadow-md transition-shadow duration-300 px-4 py-3 md:p-4 flex flex-col items-stretch h-full w-full relative">
                    <div className="flex flex-row gap-2 md:gap-4 w-full items-center justify-between relative z-10">
                      <div className="flex flex-col flex-1 min-w-0 space-y-2">
                        {mergedBusiness.address && mergedBusiness.address.trim() !== '' && (
                          <div className="flex items-center gap-3 group">
                            <MapPin className="h-5 w-5 text-blue-600 group-hover:text-blue-800 transition-colors shrink-0" />
                            <a
                              href={`https://maps.google.com/?q=${encodeURIComponent(mergedBusiness.address)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-words"
                            >
                              {mergedBusiness.address}
                            </a>
                          </div>
                        )}
                        {mergedBusiness.phone && mergedBusiness.phone.trim() !== '' && (
                          <div className="flex items-center gap-3 group">
                            <Phone className="h-5 w-5 text-green-600 group-hover:text-green-800 transition-colors shrink-0" />
                            <a
                              href={`tel:${mergedBusiness.phone}`}
                              className="text-sm text-green-600 hover:text-green-800 hover:underline break-words"
                            >
                              {mergedBusiness.phone}
                            </a>
                          </div>
                        )}
                        {mergedBusiness.email && mergedBusiness.email.trim() !== '' && (
                          <div className="flex items-center gap-3 group">
                            <Mail className="h-5 w-5 text-purple-600 group-hover:text-purple-800 transition-colors shrink-0" />
                            <a
                              href={`mailto:${mergedBusiness.email}`}
                              className="text-sm text-purple-600 hover:text-purple-800 hover:underline break-words"
                            >
                              {mergedBusiness.email}
                            </a>
                          </div>
                        )}
                        {(!mergedBusiness.address || mergedBusiness.address.trim() === '') &&
                          (!mergedBusiness.phone || mergedBusiness.phone.trim() === '') &&
                          (!mergedBusiness.email || mergedBusiness.email.trim() === '') && (
                            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400">
                              <MessageCircle className="h-4 w-4 text-gray-500" />
                              Contact information not available
                          </div>
                          )}
                      </div>
                      <div className="flex flex-col items-center gap-1 bg-linear-120 from-lime-900 via-gray-800 to-gray-900 shadow-md p-2 rounded-lg border border-gray-700 ml-3">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/catalog/${mergedBusiness.slug || mergedBusiness.id}`)}`}
                          alt="Profile QR Code"
                          className="w-12 h-12 md:w-16 md:h-16"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                          loading="lazy"
                        />
                        <span className="text-[8px] md:text-xs text-gray-300 mt-1">Scan Me</span>
                      </div>
                    </div>
                    {((mergedBusiness as any).facebook || (mergedBusiness as any).twitter || (mergedBusiness as any).instagram || (mergedBusiness as any).linkedin || mergedBusiness.website) && (
                      <div className="w-full mt-auto md:mt-auto relative z-10">
                        <div className="flex flex-wrap gap-3 w-full justify-center items-center">
                          {mergedBusiness.website && (
                            <a
                              href={mergedBusiness.website.startsWith('http') ? mergedBusiness.website : `https://${mergedBusiness.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors group"
                              aria-label="Website"
                            >
                              <Globe className="h-5 w-5 text-gray-600 group-hover:text-gray-800" />
                            </a>
                          )}
                          {(mergedBusiness as any).facebook && (
                            <a
                              href={(mergedBusiness as any).facebook.startsWith('http') ? (mergedBusiness as any).facebook : `https://${(mergedBusiness as any).facebook}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors group"
                              aria-label="Facebook"
                            >
                              <SiFacebook className="h-5 w-5 text-blue-600 group-hover:text-blue-800" />
                            </a>
                          )}
                          {(mergedBusiness as any).twitter && (
                            <a
                              href={(mergedBusiness as any).twitter.startsWith('http') ? (mergedBusiness as any).twitter : `https://${(mergedBusiness as any).twitter}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors group"
                              aria-label="Twitter"
                            >
                              <SiX className="h-5 w-5 text-gray-600 group-hover:text-gray-800" />
                            </a>
                          )}
                          {(mergedBusiness as any).instagram && (
                            <a
                              href={(mergedBusiness as any).instagram.startsWith('http') ? (mergedBusiness as any).instagram : `https://${(mergedBusiness as any).instagram}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-full bg-pink-100 hover:bg-pink-200 transition-colors group"
                              aria-label="Instagram"
                            >
                              <SiInstagram className="h-5 w-5 text-pink-600 group-hover:text-pink-800" />
                            </a>
                          )}
                          {(mergedBusiness as any).linkedin && (
                            <a
                              href={(mergedBusiness as any).linkedin.startsWith('http') ? (mergedBusiness as any).linkedin : `https://${(mergedBusiness as any).linkedin}`}
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

              <div className="w-full mt-6">
                <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                  <div className="flex-1">
                    <h2 className="text-lg md:text-xl font-bold mb-3">About Us</h2>
                    <p className="text-gray-700 md:text-base text-sm leading-relaxed whitespace-pre-line">
                      {mergedBusiness.about || "We are a leading business offering top quality products and services to our customers. Our mission is to deliver excellence and build lasting relationships."}
                    </p>
                  </div>
                  <div className="hidden md:flex flex-col items-center justify-center">
                    <Separator orientation="vertical" className="h-24" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg md:text-xl font-bold mb-3">Opening Hours & Details</h2>
                    <div className="space-y-4 flex justify-between">
                      <div className="flex-1">
                        <div className="text-gray-600 mb-2 text-sm font-medium">Opening Hours</div>
                        {mergedBusiness.openingHours && mergedBusiness.openingHours.length > 0 ? (
                          <ul className="text-sm text-gray-800 space-y-1">
                            {mergedBusiness.openingHours.map((item: any, idx: number) => (
                              <li key={idx} className="flex justify-between items-center py-0.5">
                                <span className="font-medium">{item.day}</span>
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
                      <div className="ml-4">
                        <div className="text-gray-600 mb-2 text-sm font-medium">GST Number</div>
                        <p className="text-sm text-gray-800">{mergedBusiness.gstNumber || <span className="text-gray-400">Not provided</span>}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {selectedSection === 'categories' && categories.length > 0 && (
          <section className="py-8">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold mb-8">Categories</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {categories.map((category, index) => (
                  <Card key={index} className="overflow-hidden bg-transparent h-full flex items-center justify-center">
                    <CardHeader className="p-4">
                      <CardTitle className="text-center text-lg">{category.name}</CardTitle>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {selectedSection === 'portfolio' && portfolioContent.images?.length > 0 && (
          <section className="max-w-7xl mx-auto my-12">
            <h2 className="text-2xl font-bold mb-8">Portfolio</h2>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4 md:grid-rows-2">
              {portfolioContent.images.slice(0, 6).map((image: any, index: number) => (
                <div key={index} className="bg-gray-100 border rounded-xl flex items-center justify-center overflow-hidden">
                  <img src={getOptimizedImageUrl(image.url, { width: 200, height: 150, quality: 85, format: 'auto', crop: 'fill' })} alt={image.alt || 'Portfolio'} className="w-full h-24 object-cover" />
                </div>
              ))}
            </div>
          </section>
        )}

        {selectedSection === 'brands' && brandContent.brands?.length > 0 && (
          <section className="py-12 px-4 sm:px-6 lg:px-8 bg-transparent">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold mb-8">Trusted By</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {brandContent.brands.map((brand: any, index: number) => (
                  <Card key={index} className="overflow-hidden rounded-3xl py-6 bg-white h-full flex flex-col">
                    <div className="h-20 flex items-center justify-center p-2">
                      {brand.logo ? (
                        <img src={getOptimizedImageUrl(brand.logo, { width: 100, height: 60, quality: 85, format: 'auto' })} alt={brand.name} className="max-h-full max-w-full object-contain" />
                      ) : (
                        <span className="text-gray-400">{brand.name}</span>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {selectedSection === 'products' && currentProducts.length > 0 && (
          <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold mb-8">Our Products</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {currentProducts.slice(0, 8).map((product) => (
                  <Card key={product.id} className="overflow-hidden bg-white hover:shadow-lg transition-shadow duration-300 h-80">
                    <div className="relative h-48">
                      {product.image ? (
                        <img src={getOptimizedImageUrl(product.image, { width: 300, height: 200, quality: 85, format: 'auto', crop: 'fill' })} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gray-200">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                      <Badge className="absolute top-2 right-2" variant={product.inStock ? "default" : "destructive"}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                      <Button className="w-full mt-2" size="sm">Enquire</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}


      </div>
    )
  }

  return selectedSection ? renderFocusedPreview() : renderFullPreview()
}
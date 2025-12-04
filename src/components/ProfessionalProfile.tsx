'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'

// Define Professional type since Prisma doesn't export it for MongoDB
interface Professional {
  id: string
  name: string
  slug: string
  professionalHeadline: string | null
  aboutMe: string | null
  profilePicture: string | null
  banner: string | null
  location: string | null
  phone: string | null
  email: string | null
  website: string | null
  facebook: string | null
  twitter: string | null
  instagram: string | null
  linkedin: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  adminId: string
  workExperience: any
  education: any
  skills: any
  servicesOffered: any
  contactInfo: any
  portfolio: any
  contactDetails: any
  ctaButton: any
}

import { Button } from '@/components/ui/button'
import { getOptimizedImageUrl } from '@/lib/cloudinary'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
  Briefcase,
  GraduationCap,
  Award,
  Users,
  Star,
  Share2,
  Download,
  User,
  Calendar,
  Building2
} from 'lucide-react'
import { FaWhatsapp, FaWhatsappSquare } from "react-icons/fa";
import { SiFacebook, SiX, SiInstagram, SiLinkedin, SiWhatsapp } from "react-icons/si";
import { LampContainer } from './ui/lamp'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface ProfessionalProfileProps {
  professional: Professional & {
    admin: { name?: string | null; email: string }
  }
}

interface InquiryFormData {
  name: string
  email: string
  phone: string
  message: string
}

export default function ProfessionalProfile({ professional: initialProfessional }: ProfessionalProfileProps) {
  const searchParams = useSearchParams()
  const [professional, setProfessional] = useState(initialProfessional)
  const [inquiryModal, setInquiryModal] = useState(false)
  const [inquiryData, setInquiryData] = useState<InquiryFormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Refs for smooth scrolling
  const aboutRef = useRef<HTMLDivElement>(null)
  const experienceRef = useRef<HTMLDivElement>(null)
  const educationRef = useRef<HTMLDivElement>(null)
  const skillsRef = useRef<HTMLDivElement>(null)
  const servicesRef = useRef<HTMLDivElement>(null)
  const portfolioRef = useRef<HTMLDivElement>(null)
  const contactRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Real-time synchronization - check for updates every 30 seconds
  useEffect(() => {
    if (!mounted || !professional?.id) return

    const checkForUpdates = async () => {
      try {
        const response = await fetch(`/api/professionals?${professional.slug ? `slug=${professional.slug}` : `id=${professional.id}`}`)
        if (response.ok) {
          const data = await response.json()
          const updatedProfessional = data.professional

          // Check if professional data has changed
          const hasChanged =
            updatedProfessional.updatedAt !== professional.updatedAt ||
            updatedProfessional.name !== professional.name ||
            updatedProfessional.professionalHeadline !== professional.professionalHeadline ||
            updatedProfessional.aboutMe !== professional.aboutMe ||
            updatedProfessional.profilePicture !== professional.profilePicture ||
            updatedProfessional.banner !== professional.banner ||
            updatedProfessional.location !== professional.location ||
            updatedProfessional.phone !== professional.phone ||
            updatedProfessional.email !== professional.email ||
            updatedProfessional.website !== professional.website ||
            updatedProfessional.facebook !== professional.facebook ||
            updatedProfessional.twitter !== professional.twitter ||
            updatedProfessional.instagram !== professional.instagram ||
            updatedProfessional.linkedin !== professional.linkedin

          if (hasChanged) {
            setProfessional(updatedProfessional)
            console.log('Professional data updated from server')
          }
        }
      } catch (error) {
        console.warn('Failed to check for professional updates:', error)
      }
    }

    // Check immediately and then every 30 seconds
    checkForUpdates()
    const interval = setInterval(checkForUpdates, 30000)

    return () => clearInterval(interval)
  }, [mounted, professional?.id, professional?.slug])

  const handleInquiry = async (e: React.FormEvent) => {
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
          businessId: null, // Professionals don't have businessId, but we can extend inquiry model later
          userId: null,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        alert('Inquiry submitted successfully! We will get back to you soon.')
        setInquiryModal(false)
        setInquiryData({ name: '', email: '', phone: '', message: '' })
      } else {
        alert(`Failed to submit inquiry: ${result.error || 'Please try again.'}`)
      }
    } catch (error) {
      console.error('Inquiry submission error:', error)
      alert('An error occurred while submitting your inquiry. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/pcard/${professional.slug}`;
    const shareData = {
      title: professional.name,
      text: `Check out ${professional.name}'s professional profile`,
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
  }

  // Smooth scroll function - memoized for performance
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>, sectionName: string) => {
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
  }

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
    const sections = [aboutRef.current, experienceRef.current, educationRef.current, skillsRef.current, servicesRef.current, portfolioRef.current, contactRef.current];
    sections.forEach(section => {
      if (section) observer.observe(section);
    });

    return () => {
      sections.forEach(section => {
        if (section) observer.unobserve(section);
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-100" suppressHydrationWarning>
      {/* Navigation - Hidden on Mobile */}
      <nav className="hidden md:block sticky top-0 z-40 bg-white/90 border-b backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex relative items-center space-x-4">
              {professional.profilePicture && professional.profilePicture.trim() !== '' && (
                <img
                  src={getOptimizedImageUrl(professional.profilePicture, {
                    width: 200,
                    height: 200,
                    quality: 85,
                    format: 'auto',
                    crop: 'fit'
                  })}
                  alt={professional.name}
                  className="h-12 w-auto"
                  loading="lazy"
                />
              )}
              <span className="font-semibold text-lg">{professional.name}</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden font-bold md:flex space-x-8">
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Home</a>
                <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">About</a>
                <a href="#experience" className="text-gray-600 hover:text-gray-900 transition-colors">Experience</a>
                <a href="#education" className="text-gray-600 hover:text-gray-900 transition-colors">Education</a>
                <a href="#skills" className="text-gray-600 hover:text-gray-900 transition-colors">Skills</a>
                <a href="#services" className="text-gray-600 hover:text-gray-900 transition-colors">Services</a>
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
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-0 flex-1 ${activeSection === 'experience'
              ? 'text-cyan-600 bg-cyan-50'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            onClick={() => scrollToSection(experienceRef as React.RefObject<HTMLDivElement>, 'experience')}
          >
            <Briefcase className="h-5 w-5" />
            <span className="text-xs mt-1 font-medium">Experience</span>
          </button>
          <button
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-0 flex-1 ${activeSection === 'skills'
              ? 'text-cyan-600 bg-cyan-50'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            onClick={() => scrollToSection(skillsRef as React.RefObject<HTMLDivElement>, 'skills')}
          >
            <Award className="h-5 w-5" />
            <span className="text-xs mt-1 font-medium">Skills</span>
          </button>
          <button
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-0 flex-1 ${activeSection === 'contact'
              ? 'text-cyan-600 bg-cyan-50'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            onClick={() => scrollToSection(contactRef as React.RefObject<HTMLDivElement>, 'contact')}
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-xs mt-1 font-medium">Contact</span>
          </button>
        </div>
      </div>

      {/* Hero Section with Banner */}
      <section className="relative mx-auto px-2 pt-2 pb-4 md:pb-0">
        <div className="max-w-7xl mx-auto rounded-2xl sm:rounded-3xl mt-0 sm:mt-3 overflow-hidden shadow-lg">
          <div className="relative w-full h-[40vw] min-h-[160px] max-h-[240px] md:h-[500px] md:min-h-[320px] bg-linear-to-br from-cyan-400 via-cyan-500 to-cyan-600 rounded-2xl overflow-hidden shadow-lg">
            {professional.banner && professional.banner.trim() !== '' ? (
              <img
                src={getOptimizedImageUrl(professional.banner, {
                  width: 1200,
                  height: 600,
                  quality: 85,
                  format: 'auto',
                  crop: 'fill',
                  gravity: 'auto'
                })}
                alt={`${professional.name} banner`}
                className="w-full h-full object-cover rounded-2xl"
                loading="eager"
              />
            ) : null}
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-2xl">
              <div className="text-white text-center px-2 py-2 max-w-[95vw] md:max-w-4xl mx-auto flex flex-col justify-center h-full">
                <h1 className="text-sm xs:text-base sm:text-lg md:text-5xl lg:text-6xl font-bold mb-1 xs:mb-2 md:mb-6 leading-tight drop-shadow-lg whitespace-pre-line">
                  {professional.name}
                </h1>
                {professional.professionalHeadline && (
                  <p className="text-xs xs:text-sm sm:text-base md:text-2xl mb-2 xs:mb-3 md:mb-8 leading-relaxed drop-shadow-md max-w-2xl">
                    {professional.professionalHeadline}
                  </p>
                )}
                <Button
                  size="lg"
                  onClick={() => setInquiryModal(true)}
                  className="text-sm xs:text-base md:text-lg px-4 xs:px-6 md:px-8 py-2 xs:py-3 md:py-4 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 bg-white text-gray-900 hover:bg-gray-100"
                >
                  Get in Touch
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        ref={aboutRef}
        className="py-4 md:py-16 px-3 sm:px-5 md:px-8 lg:px-12"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 lg:gap-12">
            <div className="w-full md:w-1/2 flex flex-col items-center md:items-stretch">
              <Card className="relative bg-linear-to-bl from-cyan-50 via-cyan-100/30 to-cyan-200/20 border border-cyan-500 rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-4 md:p-4 lg:p-6 flex flex-row items-center md:items-stretch w-full max-w-full overflow-hidden">
                <div className="flex w-full flex-row items-center gap-4 md:gap-6 lg:gap-10">
                  <div className="shrink-0 flex items-center justify-center">
                    {professional.profilePicture && professional.profilePicture.trim() !== '' ? (
                      <img
                        src={getOptimizedImageUrl(professional.profilePicture, {
                          width: 280,
                          height: 280,
                          quality: 90,
                          format: 'auto',
                          crop: 'fill',
                          gravity: 'center',
                        })}
                        alt={professional.name}
                        className="w-20 h-20 xs:w-24 xs:h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full object-cover border border-gray-200 shadow-sm"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-20 h-20 xs:w-24 xs:h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full bg-gray-50 flex items-center justify-center border shadow-sm">
                        <User className="w-12 h-12 md:w-20 md:h-20 lg:w-28 lg:h-28 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col gap-2 md:gap-3 w-full min-w-0">
                    <h3 className="font-extrabold text-lg xs:text-xl sm:text-2xl md:text-3xl text-gray-800 mb-0.5 truncate w-full">
                      {professional.name}
                    </h3>
                    {professional.professionalHeadline && (
                      <span className="inline-flex items-center text-xs xs:text-sm md:text-sm px-2 py-0.5 rounded-full border border-cyan-200 bg-cyan-50 text-cyan-700 font-medium mb-1 md:mb-2 w-fit">
                        <Briefcase className="w-4 h-4 mr-1 text-cyan-700" />
                        {professional.professionalHeadline}
                      </span>
                    )}
                    {professional.location && (
                      <span className="inline-flex items-center text-xs xs:text-sm md:text-sm px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-gray-700 font-medium mb-1 md:mb-2 w-fit">
                        <MapPin className="w-4 h-4 mr-1 text-gray-700" />
                        {professional.location}
                      </span>
                    )}
                    {professional.aboutMe && (
                      <p className="text-xs xs:text-sm sm:text-base md:text-lg text-gray-600 mb-1 md:mb-2 w-full line-clamp-3">
                        {professional.aboutMe}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </div>
            <div className="w-full md:w-1/2 flex flex-col items-center md:items-stretch mt-4 md:mt-0">
              <Card className="rounded-2xl sm:rounded-3xl shadow-md bg-linear-60 from-cyan-950 via-slate-950 to-cyan-900 hover:shadow-md transition-shadow duration-300 px-4 py-3 md:p-4 flex flex-col items-stretch h-full w-full relative">
                <div className="flex flex-row gap-2 md:gap-4 w-full items-center justify-between relative z-10">
                  <div className="flex flex-col flex-1 min-w-0 space-y-3">
                    {professional.location && (
                      <div className="flex items-center gap-4 group">
                        <span className="inline-flex items-center justify-center rounded-full border bg-white/15 border-cyan-300/50 group-hover:border-cyan-400 transition-colors w-9 h-9">
                          <MapPin className="h-4 w-4 text-gray-100 group-hover:text-cyan-300 transition-colors shrink-0" />
                        </span>
                        <span className="text-xs xs:text-sm md:text-base text-white hover:text-cyan-300 hover:underline font-semibold wrap-break-words transition-colors">
                          {professional.location}
                        </span>
                      </div>
                    )}
                    {professional.phone && (
                      <div className="flex items-center gap-4 group">
                        <span className="inline-flex items-center justify-center rounded-full border bg-white/15 border-cyan-300/50 group-hover:border-cyan-400 transition-colors w-9 h-9">
                          <Phone className="h-4 w-4 text-gray-100 group-hover:text-cyan-300 transition-colors shrink-0" />
                        </span>
                        <a
                          href={`tel:${professional.phone}`}
                          className="text-xs xs:text-sm md:text-base text-white hover:text-cyan-300 hover:underline font-semibold wrap-break-words transition-colors"
                        >
                          {professional.phone}
                        </a>
                      </div>
                    )}
                    {professional.email && (
                      <div className="flex items-center gap-4 group">
                        <span className="inline-flex items-center justify-center rounded-full border bg-white/15 border-cyan-300/50 group-hover:border-cyan-400 transition-colors w-9 h-9">
                          <Mail className="h-4 w-4 text-gray-100 group-hover:text-cyan-300 transition-colors shrink-0" />
                        </span>
                        <a
                          href={`mailto:${professional.email}`}
                          className="text-xs xs:text-sm md:text-base text-white hover:text-cyan-300 hover:underline font-semibold wrap-break-words transition-colors"
                        >
                          {professional.email}
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-center gap-1 bg-linear-120 from-cyan-900 via-slate-800 to-slate-900 shadow-md p-3 rounded-lg border border-gray-500 ml-3">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/pcard/${professional.slug}`)}`}
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
                {(professional.facebook || professional.twitter || professional.instagram || professional.linkedin || professional.website) && (
                  <div className="w-full border-t pt-4 border-gray-200/80 mt-auto md:mt-auto relative z-10">
                    <div className="flex flex-wrap gap-3 w-full justify-center items-center">
                      {professional.website && (
                        <a
                          href={professional.website.startsWith('http') ? professional.website : `https://${professional.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors group"
                          aria-label="Website"
                        >
                          <Globe className="h-5 w-5 text-gray-600 group-hover:text-gray-800" />
                        </a>
                      )}
                      {professional.facebook && (
                        <a
                          href={professional.facebook.startsWith('http') ? professional.facebook : `https://${professional.facebook}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors group"
                          aria-label="Facebook"
                        >
                          <SiFacebook className="h-5 w-5 text-blue-600 group-hover:text-blue-800" />
                        </a>
                      )}
                      {professional.twitter && (
                        <a
                          href={professional.twitter.startsWith('http') ? professional.twitter : `https://${professional.twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors group"
                          aria-label="Twitter"
                        >
                          <SiX className="h-5 w-5 text-gray-600 group-hover:text-gray-800" />
                        </a>
                      )}
                      {professional.instagram && (
                        <a
                          href={professional.instagram.startsWith('http') ? professional.instagram : `https://${professional.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-pink-100 hover:bg-pink-200 transition-colors group"
                          aria-label="Instagram"
                        >
                          <SiInstagram className="h-5 w-5 text-pink-600 group-hover:text-pink-800" />
                        </a>
                      )}
                      {professional.linkedin && (
                        <a
                          href={professional.linkedin.startsWith('http') ? professional.linkedin : `https://${professional.linkedin}`}
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

      {/* Work Experience Section */}
      {professional.workExperience && (
        <section id="experience" ref={experienceRef} className="py-8 md:py-16 px-3 md:px-4 sm:px-6 lg:px-8 bg-transparent">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-lg md:text-2xl font-bold mb-8">Work Experience</h2>
            <div className="grid gap-6">
              {Array.isArray(professional.workExperience) && professional.workExperience.map((exp: any, index: number) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0">
                      <Building2 className="h-8 w-8 text-cyan-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">{exp.position}</h3>
                      <p className="text-cyan-600 font-medium">{exp.company}</p>
                      <p className="text-sm text-gray-600">{exp.duration}</p>
                      {exp.description && (
                        <p className="mt-2 text-gray-700">{exp.description}</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Education Section */}
      {professional.education && (
        <section id="education" ref={educationRef} className="py-8 md:py-16 px-3 md:px-4 sm:px-6 lg:px-8 bg-transparent">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-lg md:text-2xl font-bold mb-8">Education</h2>
            <div className="grid gap-6">
              {Array.isArray(professional.education) && professional.education.map((edu: any, index: number) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0">
                      <GraduationCap className="h-8 w-8 text-cyan-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">{edu.degree}</h3>
                      <p className="text-cyan-600 font-medium">{edu.institution}</p>
                      <p className="text-sm text-gray-600">{edu.year}</p>
                      {edu.description && (
                        <p className="mt-2 text-gray-700">{edu.description}</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Skills Section */}
      {professional.skills && (
        <section id="skills" ref={skillsRef} className="py-8 md:py-16 px-3 md:px-4 sm:px-6 lg:px-8 bg-transparent">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-lg md:text-2xl font-bold mb-8">Skills & Expertise</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.isArray(professional.skills) && professional.skills.map((skill: string, index: number) => (
                <Card key={index} className="p-4 text-center">
                  <Award className="h-8 w-8 text-cyan-600 mx-auto mb-2" />
                  <h3 className="font-semibold">{skill}</h3>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services Offered Section */}
      {professional.servicesOffered && (
        <section id="services" ref={servicesRef} className="py-8 md:py-16 px-3 md:px-4 sm:px-6 lg:px-8 bg-transparent">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-lg md:text-2xl font-bold mb-8">Services Offered</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.isArray(professional.servicesOffered) && professional.servicesOffered.map((service: any, index: number) => (
                <Card key={index} className="p-6">
                  <Users className="h-8 w-8 text-cyan-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                  <p className="text-gray-700">{service.description}</p>
                  {service.price && (
                    <p className="text-cyan-600 font-semibold mt-2">{service.price}</p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Portfolio Section */}
      {professional.portfolio && (
        <section className="max-w-7xl mx-auto my-8 md:my-12 px-3 md:px-4" id="portfolio" ref={portfolioRef}>
          <div className="flex justify-between items-center mb-4 md:mb-8">
            <h2 className="text-lg md:text-2xl font-bold">Portfolio</h2>
          </div>

          <div className="grid gap-2 md:gap-4 grid-cols-2 md:grid-cols-4 md:grid-rows-2">
            {Array.isArray(professional.portfolio) && professional.portfolio.slice(0, 6).map((item: any, index: number) => {
              // Define grid positions for bento layout
              const gridClasses = [
                "md:row-span-2 md:col-span-2 col-span-2 row-span-1", // Large top-left
                "md:row-span-1 md:col-span-1 col-span-1", // Top-right small
                "md:row-span-1 md:col-span-1 col-span-1", // Top-right small
                "md:row-span-2 md:col-span-2 col-span-2 row-span-1 md:col-start-3 md:row-start-1", // Large bottom
                "md:row-span-1 md:col-span-1 col-span-1", // Bottom-left small
                "md:row-span-1 md:col-span-1 col-span-1"  // Bottom-right small
              ]

              const isVideo = item.url && (item.url.includes('.mp4') || item.url.includes('.webm') || item.url.includes('.ogg'))

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
                      src={item.url}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                      style={{ pointerEvents: 'none' }}
                    />
                  ) : item.url ? (
                    <img
                      src={getOptimizedImageUrl(item.url, {
                        width: index === 0 || index === 3 ? 600 : 300,
                        height: index === 0 || index === 3 ? 300 : 300,
                        quality: 85,
                        format: 'auto',
                        crop: 'fill',
                        gravity: 'auto'
                      })}
                      alt={item.title || 'Portfolio item'}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className={`flex items-center justify-center rounded-full bg-gray-200 ${index === 0 || index === 3 ? "w-[60px] h-[60px] md:w-[80px] md:h-[80px]" : "w-[40px] h-[40px] md:w-[56px] md:h-[56px]"}`}>
                      <Image className={`text-gray-400 ${index === 0 || index === 3 ? "w-8 h-8 md:w-10 md:h-10" : "w-6 h-6  md:w-8"}`} />
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

      {/* Footer */}
      <LampContainer>
        <footer className="relative text-white py-8 pb-10 mb-10 sm:mb-0 md:py-12 px-3 md:px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-6 md:mb-8">
              <div className="space-y-2 bg-linear-120 from-cyan-900 via-gray-800 to-gray-900 rounded-xl md:space-y-4">
                <div className="bg-linear-to-br from-gray-900 via-gray-900 to-cyan-900 rounded-xl shadow-lg p-4 md:p-6 flex flex-col items-center text-center">
                  <p className="mb-3 text-sm md:text-base text-white font-medium">
                    Connect with {professional.name}
                  </p>
                  <Button
                    variant="default"
                    onClick={() => setInquiryModal(true)}
                    className="w-full bg-white text-[#027BE6] hover:bg-[#f0f7ff] hover:text-[#01b1e6] font-bold shadow text-xs md:text-sm"
                  >
                    Get in Touch
                  </Button>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="border-t border-gray-800 pt-4 md:pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
                <p className="text-gray-400 text-xs md:text-sm">
                  © {new Date().getFullYear()} <span className='font-bold'>{professional.name}</span>. All rights reserved.
                </p>
                <p className="text-gray-400 text-xs md:text-sm">
                  Powered by <a className='font-bold' href="https://www.digisence.io/">DigiSence</a>
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
              Contact {professional.name}
            </DialogTitle>
            <DialogDescription>
              Send a message and we'll get back to you soon.
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
                    Send Message
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
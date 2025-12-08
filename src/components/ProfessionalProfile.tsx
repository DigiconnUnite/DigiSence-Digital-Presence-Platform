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
import { getOptimizedImageUrl } from '@/lib/image-utils'
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
  const [activeTab, setActiveTab] = useState('experience')

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
        const response = await fetch(`/api/professionals?${professional.slug ? `slug=${professional.slug}` : `id=${professional.id}`}`, { cache: 'no-store' })
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
            updatedProfessional.linkedin !== professional.linkedin ||
            JSON.stringify(updatedProfessional.workExperience) !== JSON.stringify(professional.workExperience) ||
            JSON.stringify(updatedProfessional.education) !== JSON.stringify(professional.education) ||
            JSON.stringify(updatedProfessional.skills) !== JSON.stringify(professional.skills) ||
            JSON.stringify(updatedProfessional.servicesOffered) !== JSON.stringify(professional.servicesOffered) ||
            JSON.stringify(updatedProfessional.portfolio) !== JSON.stringify(professional.portfolio)

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
      const isDesktop = window.innerWidth >= 768; // md breakpoint
      const offset = isDesktop ? 64 : 80; // 64px for desktop nav (h-16), 80px for mobile
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100" suppressHydrationWarning>
      {/* Desktop Navigation */}
      <nav className="hidden md:block sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-900">{professional.name}</span>
            </div>
            <div className="flex space-x-8">
              <button
                className={`text-sm font-medium transition-colors ${activeSection === 'home'
                  ? 'text-amber-600'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                Home
              </button>
              <button
                className={`text-sm font-medium transition-colors ${activeSection === 'about'
                  ? 'text-amber-600'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
                onClick={() => scrollToSection(aboutRef as React.RefObject<HTMLDivElement>, 'about')}
              >
                About
              </button>
              <button
                className={`text-sm font-medium transition-colors ${activeSection === 'experience'
                  ? 'text-amber-600'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
                onClick={() => scrollToSection(experienceRef as React.RefObject<HTMLDivElement>, 'experience')}
              >
                Experience
              </button>
              <button
                className={`text-sm font-medium transition-colors ${activeSection === 'skills'
                  ? 'text-amber-600'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
                onClick={() => scrollToSection(skillsRef as React.RefObject<HTMLDivElement>, 'skills')}
              >
                Skills
              </button>
              <button
                className={`text-sm font-medium transition-colors ${activeSection === 'services'
                  ? 'text-amber-600'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
                onClick={() => scrollToSection(servicesRef as React.RefObject<HTMLDivElement>, 'services')}
              >
                Services
              </button>
              <button
                className={`text-sm font-medium transition-colors ${activeSection === 'portfolio'
                  ? 'text-amber-600'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
                onClick={() => scrollToSection(portfolioRef as React.RefObject<HTMLDivElement>, 'portfolio')}
              >
                Portfolio
              </button>
              <button
                className={`text-sm font-medium transition-colors ${activeSection === 'contact'
                  ? 'text-amber-600'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
                onClick={() => scrollToSection(contactRef as React.RefObject<HTMLDivElement>, 'contact')}
              >
                Contact
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                title="Share Profile"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 rounded-t-3xl bg-white/95 backdrop-blur-md border-t border-gray-200 z-50 shadow-lg">
        <div className="flex justify-around items-center h-16 px-2">
          <button
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-0 flex-1 ${activeSection === 'home'
              ? 'text-amber-600 bg-amber-50'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1 font-medium">Home</span>
          </button>
          <button
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-0 flex-1 ${activeSection === 'about'
              ? 'text-amber-600 bg-amber-50'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            onClick={() => scrollToSection(aboutRef as React.RefObject<HTMLDivElement>, 'about')}
          >
            <User className="h-5 w-5" />
            <span className="text-xs mt-1 font-medium">About</span>
          </button>
          <button
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-0 flex-1 ${activeSection === 'experience'
              ? 'text-amber-600 bg-amber-50'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            onClick={() => scrollToSection(experienceRef as React.RefObject<HTMLDivElement>, 'experience')}
          >
            <Briefcase className="h-5 w-5" />
            <span className="text-xs mt-1 font-medium">Experience</span>
          </button>
          <button
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-0 flex-1 ${activeSection === 'skills'
              ? 'text-amber-600 bg-amber-50'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            onClick={() => scrollToSection(skillsRef as React.RefObject<HTMLDivElement>, 'skills')}
          >
            <Award className="h-5 w-5" />
            <span className="text-xs mt-1 font-medium">Skills</span>
          </button>
          <button
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-0 flex-1 ${activeSection === 'contact'
              ? 'text-amber-600 bg-amber-50'
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
      <section className="relative mx-auto md:pb-0">
        <div className="max-w-7xl mx-auto">
          <div
            className="
              relative w-full 
              overflow-hidden shadow-lg 
              bg-linear-to-br from-amber-400 via-amber-500 to-amber-600
              aspect-[3/1]       
              xs:aspect-[4/3] 
              sm:aspect-[16/6] 
              md:aspect-[3/1]
            "
          >
            {professional.banner && professional.banner.trim() !== '' ? (
              <>
                <img
                  src={getOptimizedImageUrl(professional.banner, {
                    width: 1200,
                    height: 400,
                    quality: 85,
                    format: 'auto',
                    crop: 'fill',
                    gravity: 'auto'
                  })}
                  alt={`${professional.name} banner`}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-x-0 bottom-0 h-[5%] bg-gradient-to-t from-black/30 to-transparent"></div>
              </>
            ) : null}
          </div>

          {/* Profile Picture, Name, Headline, Location in one group */}
          <div className="px-2 sm:px-4 md:px-8 border py-4 sm:py-6">
            <div className="flex flex-col md:flex-row md:items-center md:gap-6 gap-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6 w-full">
                {/* Profile Picture */}
                <div className="shrink-0 -mt-12 md:-mt-16 relative z-10 flex justify-center sm:justify-start">
                  {professional.profilePicture && professional.profilePicture.trim() !== '' ? (
                    <img
                      src={getOptimizedImageUrl(professional.profilePicture, {
                        width: 350,
                        height: 350,
                        quality: 90,
                        format: 'auto',
                        crop: 'fill',
                        gravity: 'center',
                      })}
                      alt={professional.name}
                      className="w-24 h-24 xs:w-28 xs:h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-lg"
                      loading="lazy"
                    />
                  ) : (
                      <div className="w-24 h-24 xs:w-28 xs:h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full bg-gray-50 flex items-center justify-center border-4 border-white shadow-lg">
                        <User className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-gray-400" />
                    </div>
                  )}
                </div>
                {/* All Info in one container */}
                <div className="flex flex-col flex-1 items-center sm:items-start text-center sm:text-left">
                  <h1 className="text-xl xs:text-2xl md:text-3xl font-bold text-gray-900 break-words">
                    {professional.name}
                  </h1>
                  {professional.professionalHeadline && (
                    <p className="text-sm xs:text-base md:text-lg text-gray-700 mt-1 xs:mt-2 break-words">
                      {professional.professionalHeadline}
                    </p>
                  )}
                  {professional.location && (
                    <div className="flex items-center justify-center sm:justify-start mt-2 xs:mt-3">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 mr-2" />
                      <span className="text-sm text-gray-600">{professional.location}</span>
                    </div>
                  )}
                </div>
              </div>
              {/* Tag-style Contact Buttons */}
              <div className="flex flex-row md:flex-col w-full md:w-52 mt-2 md:mt-0 gap-2 md:gap-0">
                {professional.phone && (
                  <button
                    type="button"
                    onClick={() => window.open(`tel:${professional.phone}`, "_self")}
                    className="flex w-full items-center px-1.5 sm:px-2 py-1.5 sm:py-2 bg-white rounded-full border border-amber-200 text-left text-xs sm:text-sm"
                  >
                    <span className="flex items-center justify-center border-r border-gray-200 pr-1.5 sm:pr-2 mr-1.5 sm:mr-2">
                      <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                    </span>
                    <span className="font-medium text-gray-900 truncate">{professional.phone}</span>
                  </button>
                )}
                {professional.email && (
                  <button
                    type="button"
                    onClick={() => window.open(`mailto:${professional.email}`, "_self")}
                    className="flex w-full items-center px-1.5 sm:px-2 py-1.5 sm:py-2 bg-white rounded-full border border-amber-200 text-left text-xs sm:text-sm md:mt-2"
                  >
                    <span className="flex items-center justify-center border-r border-gray-200 pr-1.5 sm:pr-2 mr-1.5 sm:mr-2">
                      <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                    </span>
                    <span className="font-medium text-gray-900 truncate">{professional.email}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setInquiryModal(true)}
                  className="flex w-full items-center px-1.5 sm:px-2 py-1.5 sm:py-2 bg-white rounded-full border border-green-400 text-left text-xs sm:text-sm md:mt-2"
                >
                  <span className="flex items-center justify-center border-r border-gray-200 pr-1.5 sm:pr-2 mr-1.5 sm:mr-2">
                    <SiWhatsapp className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                  </span>
                  <span className="font-medium text-green-600">Whatsapp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About and Skills Grid Section */}
      <section className="">
        <div className="max-w-7xl mx-auto">
          <div className="border-l border-r border-b border-gray-200 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
              {/* About Section */}

              <div
                id="about"
                ref={aboutRef}
              >
                <div className="flex justify-between items-center p-4 sm:p-6">
                  <h2 className="text-lg md:text-xl font-bold text-gray-800">About Me</h2>
                </div>

                <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                  <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                    {professional.aboutMe || "I'm a passionate professional with expertise in my field. I strive to deliver exceptional results and continuously improve my skills to stay at the forefront of industry trends."}
                  </p>
                </div>

                {/* Experience, Education, Certification Tabs */}
                <div className="">
                  <div className="h-full bg-white">
                    <div className="flex px-3 sm:px-4 md:px-6 bg-gradient-to-r from-amber-50 to-white border-y border-gray-100 shadow-sm overflow-x-auto">
                      <button
                        className={`px-3 sm:px-4 py-2 font-semibold text-xs sm:text-sm transition-all duration-200 whitespace-nowrap ${activeTab === 'experience'
                          ? 'text-white bg-amber-600 shadow-md transform'
                          : 'text-gray-600 hover:text-amber-600 hover:bg-amber-50'
                          }`}
                        onClick={() => setActiveTab('experience')}
                      >
                        Experience
                      </button>
                      <button
                        className={`px-3 sm:px-4 py-2 font-semibold text-xs sm:text-sm transition-all duration-200 ml-2 sm:ml-3 whitespace-nowrap ${activeTab === 'education'
                          ? 'text-white bg-amber-600 shadow-md transform'
                          : 'text-gray-600 hover:text-amber-600 hover:bg-amber-50'
                          }`}
                        onClick={() => setActiveTab('education')}
                      >
                        Education
                      </button>
                      <button
                        className={`px-3 sm:px-4 py-2 font-semibold text-xs sm:text-sm transition-all duration-200 ml-2 sm:ml-3 whitespace-nowrap ${activeTab === 'certification'
                          ? 'text-white bg-amber-600 shadow-md transform'
                          : 'text-gray-600 hover:text-amber-600 hover:bg-amber-50'
                          }`}
                        onClick={() => setActiveTab('certification')}
                      >
                        Certification
                      </button>
                    </div>

                    <div className="">
                      {activeTab === 'experience' && (
                        <div id="experience" ref={experienceRef}>
                          {professional.workExperience.map((exp: any, index: number) => (
                            <div key={index} className="bg-white p-3 sm:p-5 border-b border-gray-200 transition-shadow duration-200">
                              <div className="flex items-start gap-3 sm:gap-4 relative">
                                <div className="shrink-0 p-1.5 sm:p-2 bg-amber-100 rounded-lg">
                                  <Building2 className="h-4 w-4 sm:h-6 sm:w-6 text-amber-600" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-bold text-gray-900 text-sm sm:text-lg mb-1">{exp.position}</h4>
                                  <p className="text-amber-600 font-semibold text-xs sm:text-sm mb-2">{exp.company}</p>
                                  {exp.description && (
                                    <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">{exp.description}</p>
                                  )}
                                </div>
                                {/* Date/Duration in top right */}
                                <div className="absolute right-0 top-0 mt-1 mr-2">
                                  <span className="text-xs sm:text-sm text-gray-500">{exp.duration}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeTab === 'education' && (
                        <div id="education" ref={educationRef}>
                          {professional.education.map((edu: any, index: number) => (
                            <div key={index} className="bg-white p-3 sm:p-5 border-b border-gray-200 transition-shadow duration-200">
                              <div className="flex items-start gap-3 sm:gap-4 relative">
                                <div className="shrink-0 p-1.5 sm:p-2 bg-amber-100 rounded-lg">
                                  <GraduationCap className="h-4 w-4 sm:h-6 sm:w-6 text-amber-600" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-bold text-gray-900 text-sm sm:text-lg mb-1">{edu.degree}</h4>
                                  <p className="text-amber-600 font-semibold text-xs sm:text-sm mb-2">{edu.institution}</p>
                                  {edu.description && (
                                    <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">{edu.description}</p>
                                  )}
                                </div>
                                {/* Year/Date in top right */}
                                <div className="absolute right-0 top-0 mt-1 mr-2">
                                  <span className="text-xs sm:text-sm text-gray-500">{edu.year}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeTab === 'certification' && (
                        <div className="bg-white p-3 sm:p-5 border-b border-gray-200 transition-shadow duration-200">
                          <div className="flex items-start gap-3 sm:gap-4 relative">
                            <div className="shrink-0 p-1.5 sm:p-2 bg-amber-100 rounded-lg">
                              <Award className="h-4 w-4 sm:h-6 sm:w-6 text-amber-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900 text-sm sm:text-lg mb-1">Professional Certification</h4>
                              <p className="text-amber-600 font-semibold text-xs sm:text-sm mb-2">Certification Body</p>
                              <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">Advanced certification in professional skills and industry best practices.</p>
                            </div>
                            {/* Certification Duration in top right */}
                            <div className="absolute right-0 top-0 mt-1 mr-2">
                              <span className="text-xs sm:text-sm text-gray-500">2022 - 2025</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>


              {/* Skills Section */}
              <div id="skills" ref={skillsRef} className="">
                <div className="flex justify-between items-center p-4 sm:p-6">
                  <h2 className="text-lg md:text-xl font-bold text-gray-800">Skills & Expertise</h2>
                </div>
                <div className="rounded-xl px-3 sm:px-4 pb-4 mb-6">
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-3">
                    {professional.skills.map((skill: string, index: number) => (
                      <div
                        key={index}
                        className="inline-flex items-center gap-1 sm:gap-1.5 md:gap-2 bg-linear-to-r from-gray-700 to-gray-950 text-white px-2 py-1 sm:px-2.5 sm:py-1.5 md:px-3 md:py-2 rounded-full text-xs sm:text-xs md:text-sm font-medium shadow-sm"
                      >
                        <Award className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-amber-400" />
                        <span className="text-xs sm:text-xs md:text-sm">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Services Section */}
                <div id="services" ref={servicesRef} className="border-t border-gray-200">
                  <div className="flex justify-between items-center p-4 sm:p-6">
                    <h3 className="text-lg md:text-xl font-bold text-gray-800">Services Offered</h3>
                  </div>
                  <div className="bg-white rounded-t-3xl p-3 sm:p-4 shadow-sm border border-gray-100">
                    <div className="grid grid-cols-1 gap-3">
                      {professional.servicesOffered.map((service: any, index: number) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <div className="flex items-start gap-3">
                            <div className="shrink-0">
                              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 mt-1" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800 text-sm sm:text-base">{service.name}</h4>
                              <p className="text-gray-700 text-xs sm:text-sm mt-1">{service.description}</p>
                              {service.price && (
                                <p className="text-amber-600 font-semibold text-xs sm:text-sm mt-2">{service.price}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Portfolio Section */}
      <section id="portfolio" ref={portfolioRef} className="py-6 md:py-12 px-3 sm:px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-800">Portfolio</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {professional.portfolio.map((item: any, index: number) => (
              <div
                key={index}
                className="relative rounded-xl overflow-hidden shadow-sm aspect-[3/2] group"
              >
                <img
                  src={getOptimizedImageUrl(item.url, {
                    width: 400,
                    height: 400,
                    quality: 85,
                    format: 'auto',
                    crop: 'fill',
                    gravity: 'center',
                  })}
                  alt={item.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                {/* Bottom shadow gradient overlay */}
                <div className="absolute inset-x-0 bottom-0 h-2/5 pointer-events-none">
                  <div className="w-full h-full bg-linear-to-t from-black/75 via-black/20 to-transparent" />
                </div>
                {/* Portfolio details at the bottom */}
                <div className="absolute left-0 right-0 bottom-0 p-2 sm:p-3 z-10 flex flex-col text-white transition-all duration-200">
                  <span className="font-semibold text-xs sm:text-sm md:text-base truncate">{item.title}</span>
                  {item.description && (
                    <span className="text-xs sm:text-xs md:text-sm mt-1 line-clamp-2">{item.description}</span>
                  )}
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-300 text-xs mt-1 sm:mt-2 hover:underline"
                    >
                      View Project
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-8 md:py-16 px-3 sm:px-4 md:px-8  md:mb-0">
        <div className="max-w-7xl mx-auto">

          {/* Maintain aspect ratio (3:2) at ALL breakpoints */}
          <div className="relative rounded-2xl sm:rounded-4xl shadow-2xl overflow-hidden bg-gradient-to-br from-[#ff8a06] to-[#ff6b08] aspect-2/1 sm:aspect-3/1"
            style={{
              backgroundImage: 'url(/card-bg.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Dark Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-transparent rounded-[24px] sm:rounded-[32px]"></div>

            {/* Content absolutely centered (with max width for responsiveness) */}
            <div className="absolute inset-0 flex items-center justify-start">
              <div className="relative z-10 text-left max-w-sm sm:max-w-md md:max-w-xl p-4 sm:p-6 md:p-8 lg:p-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-4">
                  Let's Get In Touch.
                </h2>
                <p className="text-white/80 text-xs sm:text-base md:text-lg lg:text-xl leading-relaxed max-w-xs sm:max-w-md md:max-w-lg mb-3 sm:mb-8 md:mb-10">
                  Your laboratory instruments should serve you, not the other way around. We're happy to help you.
                </p>
                {/* Call and WhatsApp CTA Buttons */}
                <div className="flex flex-row gap-2 sm:gap-4 mb-3 sm:mb-8">
                  {professional.phone && (
                    <button
                      onClick={() => window.open(`tel:${professional.phone}`, "_self")}
                      className="group border hover:bg-amber-700 text-white font-semibold px-3 sm:px-6 md:px-7 py-1.5 sm:py-3 rounded-full shadow-xl flex items-center justify-center gap-1.5 sm:gap-3 hover:scale-105 transition-all duration-300 w-fit text-xs sm:text-base"
                    >
                      <Phone className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                      Call Now
                    </button>
                  )}

                  {professional.phone && (
                    <button
                      onClick={() => {
                        if (professional.phone) {
                          window.open(`https://wa.me/${professional.phone.replace(/\D/g, '')}`, "_blank");
                        }
                      }}
                      className="group bg-green-500 hover:bg-green-600 text-white font-semibold px-3 sm:px-6 md:px-7 py-1.5 sm:py-3 rounded-full shadow-xl flex items-center justify-center gap-1.5 sm:gap-3 hover:scale-105 transition-all duration-300 w-fit text-xs sm:text-base"
                    >
                      <SiWhatsapp className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                      WhatsApp
                    </button>
                  )}
                </div>

                {/* Social Icons */}
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="flex gap-1.5 sm:gap-3">
                    {professional.facebook && (
                      <a
                        href={professional.facebook.startsWith('http') ? professional.facebook : `https://${professional.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/40 p-0 sm:p-0"
                      >
                        <SiFacebook className="h-3 w-3 sm:h-6 sm:w-6 text-white" />
                      </a>
                    )}
                    {professional.twitter && (
                      <a
                        href={professional.twitter.startsWith('http') ? professional.twitter : `https://${professional.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/40 p-0 sm:p-0"
                      >
                        <SiX className="h-3 w-3 sm:h-6 sm:w-6 text-white" />
                      </a>
                    )}
                    {professional.instagram && (
                      <a
                        href={professional.instagram.startsWith('http') ? professional.instagram : `https://${professional.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/40 p-0 sm:p-0"
                      >
                        <SiInstagram className="h-3 w-3 sm:h-6 sm:w-6 text-white" />
                      </a>
                    )}
                    {professional.linkedin && (
                      <a
                        href={professional.linkedin.startsWith('http') ? professional.linkedin : `https://${professional.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/40 p-0 sm:p-0"
                      >
                        <SiLinkedin className="h-3 w-3 sm:h-6 sm:w-6 text-white" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* Footer - Enhanced for Mobile */}
      <LampContainer>
        <footer className="relative text-white py-6 sm:py-8 pb-20 sm:pb-10 md:py-12 px-3 sm:px-4 md:px-6 lg:px-8 overflow-hidden">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-4 md:mb-6">

              {/* DigiSence Online Presence CTA Card */}
              <div className="space-y-2 md:space-y-4 col-span-1 md:col-span-2 lg:col-span-1">
                <div className="bg-linear-120 from-cyan-900 via-gray-800 to-gray-900 rounded-xl">
                  <div className="bg-linear-to-br from-gray-900 via-gray-900 to-cyan-900 rounded-xl shadow-lg p-4 sm:p-6 flex flex-col items-center text-center">
                    <p className="mb-3 text-sm sm:text-base text-white font-medium">
                      Make your online presence with DigiSence
                    </p>
                    <a
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full max-w-xs"
                    >
                      <Button
                        variant="default"
                        className="w-full bg-white text-[#027BE6] hover:bg-[#f0f7ff] hover:text-[#01b1e6] font-bold shadow text-xs sm:text-sm"
                      >
                        Get Started
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="border-t border-gray-800 pt-3 sm:pt-4 md:pt-6">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
                <p className="text-gray-400 text-xs sm:text-sm">
                  © {new Date().getFullYear()} <span className='font-bold'>{professional.name}</span>. All rights reserved.
                </p>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Powered by <a className='font-bold' href="https://www.digisence.io/">DigiSence</a> - The Product of <a className='font-bold' href="https://digiconnunite.com/">Digiconn Unite Pvt. Ltd.</a>
                </p>
              </div>
            </div>
          </div>
        </footer>
      </LampContainer>

      {/* Inquiry Modal */}
      <Dialog open={inquiryModal} onOpenChange={setInquiryModal}>
        <DialogContent className="sm:max-w-md mx-4">
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
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-amber-600 hover:bg-amber-700">
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
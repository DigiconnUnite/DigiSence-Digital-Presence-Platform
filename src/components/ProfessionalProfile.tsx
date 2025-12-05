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
                  ? 'text-cyan-600'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                Home
              </button>
              <button
                className={`text-sm font-medium transition-colors ${activeSection === 'about'
                  ? 'text-cyan-600'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
                onClick={() => scrollToSection(aboutRef as React.RefObject<HTMLDivElement>, 'about')}
              >
                About
              </button>
              <button
                className={`text-sm font-medium transition-colors ${activeSection === 'experience'
                  ? 'text-cyan-600'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
                onClick={() => scrollToSection(experienceRef as React.RefObject<HTMLDivElement>, 'experience')}
              >
                Experience
              </button>
              <button
                className={`text-sm font-medium transition-colors ${activeSection === 'skills'
                  ? 'text-cyan-600'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
                onClick={() => scrollToSection(skillsRef as React.RefObject<HTMLDivElement>, 'skills')}
              >
                Skills
              </button>
              <button
                className={`text-sm font-medium transition-colors ${activeSection === 'services'
                  ? 'text-cyan-600'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
                onClick={() => scrollToSection(servicesRef as React.RefObject<HTMLDivElement>, 'services')}
              >
                Services
              </button>
              <button
                className={`text-sm font-medium transition-colors ${activeSection === 'portfolio'
                  ? 'text-cyan-600'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
                onClick={() => scrollToSection(portfolioRef as React.RefObject<HTMLDivElement>, 'portfolio')}
              >
                Portfolio
              </button>
              <button
                className={`text-sm font-medium transition-colors ${activeSection === 'contact'
                  ? 'text-cyan-600'
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
      <section className="relative mx-auto   md:pb-0">
        <div className="max-w-7xl mx-auto">
          <div
            className="
              relative w-full 
              overflow-hidden shadow-lg 
              bg-gradient-to-br from-cyan-400 via-cyan-500 to-cyan-600
              aspect-[3/1]       
              sm:aspect-[3/1] 
              md:aspect-[3/1]
              lg:aspect-[3/1]
              xl:aspect-[3/1]
              aspect-[3/1]
              xs:aspect-[4/3]   
              sm:aspect-[16/6]  
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
          <div className="px-2 sm:px-4 md:px-8 border py-6">
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
                      className="w-28 h-28 xs:w-32 xs:h-32 sm:w-40 sm:h-40 md:w-52 md:h-52 rounded-full object-cover border-4 border-white shadow-lg"
                      loading="lazy"
                    />
                  ) : (
                      <div className="w-28 h-28 xs:w-32 xs:h-32 sm:w-40 sm:h-40 md:w-52 md:h-52 rounded-full bg-gray-50 flex items-center justify-center border-4 border-white shadow-lg">
                        <User className="w-12 h-12 xs:w-16 xs:h-16 sm:w-16 sm:h-16 md:w-20 md:h-20 text-gray-400" />
                    </div>
                  )}
                </div>
                {/* All Info in one container */}
                <div className="flex flex-col flex-1 items-center sm:items-start text-center sm:text-left">
                  <h1 className="text-2xl xs:text-3xl md:text-4xl font-bold text-gray-900 break-words">
                    {professional.name}
                  </h1>
                  {professional.professionalHeadline && (
                    <p className="text-base xs:text-lg md:text-xl text-gray-700 mt-1 xs:mt-2 break-words">
                      {professional.professionalHeadline}
                    </p>
                  )}
                  {professional.location && (
                    <div className="flex items-center justify-center sm:justify-start mt-2 xs:mt-3">
                      <MapPin className="h-5 w-5 text-gray-600 mr-2" />
                      <span className="text-base text-gray-600">{professional.location}</span>
                    </div>
                  )}
                </div>
              </div>
              {/* CTA Buttons */}
              <div className="flex flex-row md:flex-col gap-2 md:gap-4 justify-center items-center w-full md:w-auto mt-4 md:mt-0">
                {professional.phone && (
                  <a
                    href={`tel:${professional.phone}`}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white rounded-full px-3 py-2 shadow-md hover:shadow-lg transition-shadow text-xs xs:text-sm"
                  >
                    <Phone className="h-5 w-5 text-cyan-600" />
                    <span className="font-medium">Call</span>
                  </a>
                )}
                {professional.email && (
                  <a
                    href={`mailto:${professional.email}`}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white rounded-full px-3 py-2 shadow-md hover:shadow-lg transition-shadow text-xs xs:text-sm"
                  >
                    <Mail className="h-5 w-5 text-cyan-600" />
                    <span className="font-medium">Email</span>
                  </a>
                )}
                <button
                  onClick={() => setInquiryModal(true)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-500 text-white rounded-full px-3 py-2 shadow-md hover:bg-cyan-700 transition-colors text-xs xs:text-sm"
                >
                  <SiWhatsapp className="h-5 w-5" />
                  <span className="font-medium">Message</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About and Skills Grid Section */}
      <section className=" " >
        <div className="max-w-7xl mx-auto">
          <div className="border-l border-r border-b border-gray-200 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
              {/* About Section */}
              <div
                id="about"
                ref={aboutRef}
                className="p-6"
              >
                <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">About Me</h2>

                <div className="   mb-6">
                  <p className="text-gray-700 leading-relaxed">
                    {professional.aboutMe || "I'm a passionate professional with expertise in my field. I strive to deliver exceptional results and continuously improve my skills to stay at the forefront of industry trends."}
                  </p>
                </div>

                {/* Experience, Education, Certification Tabs */}
                <div className="">
                  <div className=" shadow-sm">
                    <div className="flex bg-white pt-1 border-y border-gray-200 mb-4">
                      <button
                        className={`pb-2 px-3 font-medium text-sm ${activeTab === 'experience' ? 'text-cyan-600 border-b-2 border-cyan-600' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('experience')}
                      >
                        Experience
                      </button>
                      <button
                        className={`pb-2 px-3 font-medium text-sm ml-4 ${activeTab === 'education' ? 'text-cyan-600 border-b-2 border-cyan-600' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('education')}
                      >
                        Education
                      </button>
                      <button
                        className={`pb-2 px-3 font-medium text-sm ml-4 ${activeTab === 'certification' ? 'text-cyan-600 border-b-2 border-cyan-600' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('certification')}
                      >
                        Certification
                      </button>
                    </div>

                    <div className="space-y-3">
                      {activeTab === 'experience' && (
                        <div id="experience" ref={experienceRef}>
                          {professional.workExperience.map((exp: any, index: number) => (
                            <div key={index} className="bg-gray-50 ">
                              <div className="flex items-start gap-3">
                                <div className="shrink-0">
                                  <Building2 className="h-5 w-5 text-cyan-600" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-800">{exp.position}</h4>
                                  <p className="text-cyan-600 font-medium text-sm">{exp.company}</p>
                                  <p className="text-sm text-gray-600 mb-1">{exp.duration}</p>
                                  {exp.description && (
                                    <p className="text-gray-700 text-sm">{exp.description}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeTab === 'education' && (
                        <div id="education" ref={educationRef}>
                          {professional.education.map((edu: any, index: number) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-start gap-3">
                                <div className="shrink-0">
                                  <GraduationCap className="h-5 w-5 text-cyan-600" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-800">{edu.degree}</h4>
                                  <p className="text-cyan-600 font-medium text-sm">{edu.institution}</p>
                                  <p className="text-sm text-gray-600 mb-1">{edu.year}</p>
                                  {edu.description && (
                                    <p className="text-gray-700 text-sm">{edu.description}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeTab === 'certification' && (
                        <div className="bg-gray-50 rounded-lg p-3 ">
                          <div className="flex items-start gap-3">
                            <div className="shrink-0">
                              <Award className="h-5 w-5 text-cyan-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800">Professional Certification</h4>
                              <p className="text-cyan-600 font-medium text-sm">Certification Body</p>
                              <p className="text-sm text-gray-600 mb-1">2022 - 2025</p>
                              <p className="text-gray-700 text-sm">Advanced certification in professional skills and industry best practices.</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>


              {/* Skills Section */}
              <div id="skills" ref={skillsRef} className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">Skills & Expertise</h2>
                  <button className="text-cyan-600 font-medium flex items-center gap-1">
                    View All
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {professional.skills.map((skill: string, index: number) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg p-3 shadow-sm text-center border border-gray-100"
                      >
                        <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Award className="h-5 w-5 text-cyan-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-800">{skill}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Services Section */}
                <div id="services" ref={servicesRef} className="border-t border-gray-200 pt-6">
                  <h3 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">Services Offered</h3>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="grid grid-cols-1 gap-3">
                      {professional.servicesOffered.map((service: any, index: number) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <div className="flex items-start gap-3">
                            <div className="shrink-0">
                              <Users className="h-5 w-5 text-cyan-600 mt-1" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800">{service.name}</h4>
                              <p className="text-gray-700 text-sm mt-1">{service.description}</p>
                              {service.price && (
                                <p className="text-cyan-600 font-semibold text-sm mt-2">{service.price}</p>
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
      <section id="portfolio" ref={portfolioRef} className="py-8 md:py-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">Portfolio</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {professional.portfolio.map((item: any, index: number) => (
              <div key={index} className="rounded-xl overflow-hidden shadow-sm aspect-square">
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" ref={contactRef} className="py-8 md:py-16 px-4 md:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">Get In Touch</h2>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {professional.phone && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                    <Phone className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <a href={`tel:${professional.phone}`} className="text-gray-800 font-medium">{professional.phone}</a>
                  </div>
                </div>
              )}
              {professional.email && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                    <Mail className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <a href={`mailto:${professional.email}`} className="text-gray-800 font-medium">{professional.email}</a>
                  </div>
                </div>
              )}
              {professional.location && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-gray-800 font-medium">{professional.location}</p>
                  </div>
                </div>
              )}
              {professional.website && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                    <Globe className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Website</p>
                    <a href={professional.website} target="_blank" rel="noopener noreferrer" className="text-gray-800 font-medium">{professional.website}</a>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8">
              <Button
                onClick={() => setInquiryModal(true)}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white rounded-full py-3"
              >
                Send Message
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400 mb-4 md:mb-0">
              © {new Date().getFullYear()} {professional.name}. All rights reserved.
            </p>
            <div className="flex gap-4">
              {professional.facebook && (
                <a
                  href={professional.facebook.startsWith('http') ? professional.facebook : `https://${professional.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <SiFacebook className="h-5 w-5" />
                </a>
              )}
              {professional.twitter && (
                <a
                  href={professional.twitter.startsWith('http') ? professional.twitter : `https://${professional.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <SiX className="h-5 w-5" />
                </a>
              )}
              {professional.instagram && (
                <a
                  href={professional.instagram.startsWith('http') ? professional.instagram : `https://${professional.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <SiInstagram className="h-5 w-5" />
                </a>
              )}
              {professional.linkedin && (
                <a
                  href={professional.linkedin.startsWith('http') ? professional.linkedin : `https://${professional.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <SiLinkedin className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Powered by <a href="https://www.digisence.io/" className="text-cyan-400 hover:text-cyan-300 transition-colors">DigiSence</a>
            </p>
          </div>
        </div>
      </footer>

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
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-cyan-600 hover:bg-cyan-700">
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
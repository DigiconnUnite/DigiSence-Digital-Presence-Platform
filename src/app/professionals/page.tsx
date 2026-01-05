'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { getOptimizedImageUrl, handleImageError, isValidImageUrl } from '@/lib/image-utils'
import Aurora from '@/components/Aurora'
import Footer from '@/components/Footer'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import {
  Search,
  User,
  MapPin,
  Phone,
  Mail,
  Globe,
  Eye,
  ArrowRight,
  X,
  Menu,
  Network,
  BookOpen,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Code,
  Stethoscope,
  Scale,
  Wrench,
  GraduationCap,
  Calculator,
  Palette,
  Megaphone,
  Users,
  Camera,
  ChefHat,
  Briefcase,
  Building,
  Heart,
  Pill,
  Zap,
  Droplets,
  Truck
} from 'lucide-react'

interface Professional {
  id: string
  name: string
  slug: string
  professionalHeadline: string | null
  profilePicture: string | null
  banner: string | null
  location: string | null
  phone: string | null
  email: string | null
  website: string | null
}

interface Category {
  id: string
  name: string
  slug: string
}

export default function ProfessionalsPage() {
   const [professionals, setProfessionals] = useState<Professional[]>([])
   const [filteredProfessionals, setFilteredProfessionals] = useState<Professional[]>([])
   const [categories, setCategories] = useState<Category[]>([])
   const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
   const [isLoading, setIsLoading] = useState(true)
   const [searchTerm, setSearchTerm] = useState('')
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
   const pathname = usePathname()

  useEffect(() => {
    fetchProfessionals()
    fetchCategories()
  }, [])

  useEffect(() => {
    const filtered = professionals.filter(professional => {
      const matchesSearch = professional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        professional.professionalHeadline?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        professional.location?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !selectedCategory || professional.professionalHeadline === selectedCategory
      return matchesSearch && matchesCategory
    })
    setFilteredProfessionals(filtered)
  }, [professionals, searchTerm, selectedCategory])

  const fetchProfessionals = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/professionals')
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched professionals data:', data.professionals)
        setProfessionals(data.professionals)
        setFilteredProfessionals(data.professionals)
      } else {
        console.error('Failed to fetch professionals')
      }
    } catch (error) {
      console.error('Error fetching professionals:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    // Placeholder categories for professionals
    setCategories([
      { id: '1', name: 'All', slug: 'all' },
      { id: '2', name: 'Developers', slug: 'developers' },
      { id: '3', name: 'Designers', slug: 'designers' },
      { id: '4', name: 'Marketers', slug: 'marketers' },
      { id: '5', name: 'Consultants', slug: 'consultants' }
    ])
  }

  const professions = [
    { name: 'Developer', icon: Code },
    { name: 'Doctor', icon: Stethoscope },
    { name: 'Lawyer', icon: Scale },
    { name: 'Engineer', icon: Wrench },
    { name: 'Teacher', icon: GraduationCap },
    { name: 'Accountant', icon: Calculator },
    { name: 'Designer', icon: Palette },
    { name: 'Marketer', icon: Megaphone },
    { name: 'Consultant', icon: Users },
    { name: 'Photographer', icon: Camera },
    { name: 'Chef', icon: ChefHat },
    { name: 'Manager', icon: Briefcase },
    { name: 'Architect', icon: Building },
    { name: 'Nurse', icon: Heart },
    { name: 'Pharmacist', icon: Pill },
    { name: 'Electrician', icon: Zap },
    { name: 'Plumber', icon: Droplets },
    { name: 'Driver', icon: Truck }
  ]

  const scrollCategories = (direction: 'left' | 'right') => {
    // Placeholder for scrolling
  }

  const features = [
    {
      icon: <Network className="h-8 w-8 text-primary" />,
      title: "Networking Opportunities",
      description: "Connect with industry leaders and build valuable professional relationships that can open doors to new opportunities."
    },
    {
      icon: <BookOpen className="h-8 w-8 text-primary" />,
      title: "Skill Development",
      description: "Access cutting-edge training programs and workshops to enhance your skills and stay ahead in your field."
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      title: "Career Advancement",
      description: "Get personalized career guidance and mentorship to accelerate your professional growth and achieve your goals."
    }
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Engineer",
      quote: "DigiSence helped me connect with amazing professionals in my field. The networking opportunities led to my dream job!",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Marketing Director",
      quote: "The skill development programs are top-notch. I've learned so much and advanced my career significantly.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Project Manager",
      quote: "The career advancement support and mentorship I received were invaluable. Highly recommend to any professional.",
      rating: 5
    }
  ]

  return (
    <>
      <div className="min-h-screen secondary-light-gradient pb-16 md:pb-0 relative">
        <div className="absolute inset-0 z-0">
          <Aurora />
        </div>
        {/* Navigation Bar - Fixed at Top */}
        <nav className="fixed inset-x-0 top-0 z-40 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link
                  href="/"
                  className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-gray-900"
                >
                  <img src="/logo.svg" alt="DigiSence" className="h-7 w-auto" />

                  <span className="font-bold text-xl text-slate-700">
                    DigiSence
                  </span>
                </Link>
              </div>
              <div className="hidden md:flex space-x-8 flex-1 justify-center">
                <Link
                  href="/"
                  className={cn(
                    "hover:text-cyan-400 transition-colors px-2 py-1 rounded-md",
                    pathname === "/"
                      ? "bg-white text-slate-800 font-bold"
                      : "text-gray-700"
                  )}
                >
                  Home
                </Link>
                <Link
                  href="/businesses"
                  className={cn(
                    "hover:text-cyan-400 transition-colors px-2 py-1 rounded-md",
                    pathname === "/businesses"
                      ? "bg-white text-slate-800 font-bold"
                      : "text-gray-700"
                  )}
                >
                  Businesses
                </Link>
                <Link
                  href="/professionals"
                  className={cn(
                    "hover:text-cyan-400 transition-colors px-2 py-1 rounded-md",
                    pathname === "/professionals"
                      ? "bg-white text-slate-800 font-bold"
                      : "text-gray-700"
                  )}
                >
                  Professionals
                </Link>
                <Link
                  href="/pricing"
                  className={cn(
                    "hover:text-cyan-400 transition-colors px-2 py-1 rounded-md",
                    pathname === "/pricing"
                      ? "bg-white text-slate-800 font-bold"
                      : "text-gray-700"
                  )}
                >
                  Pricing
                </Link>
                <Link
                  href="/contact"
                  className={cn(
                    "hover:text-cyan-400 transition-colors px-2 py-1 rounded-md",
                    pathname === "/contact"
                      ? "bg-white text-slate-800 font-bold"
                      : "text-gray-700"
                  )}
                >
                  Contact Us
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  className=" text-white bg-slate-800  border-gray-800"
                  asChild
                >
                  <Link href="/register">Make Your Profile</Link>
                </Button>
                <Button
                  variant="outline"
                  className="bg-white text-gray-900 hover:bg-slate-800 hover:text-white border-gray-800"
                  asChild
                >
                  <Link href="/login">Login</Link>
                </Button>
                {/* Mobile menu button */}
                <button
                  className="md:hidden ml-2 p-2 rounded-md text-gray-700 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Category Slider - Full Width */}
          <div className="bg-gray-50  border-t border-gray-200">
            <div className="max-w-7xl mx-auto ">
              <div
                className="flex items-center overflow-x-auto scrollbar-hide px-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {professions.map((profession) => {
                  const IconComponent = profession.icon
                  return (
                    <button
                      key={profession.name}
                      onClick={() =>
                        setSelectedCategory(
                          selectedCategory === profession.name
                            ? null
                            : profession.name
                        )
                      }
                      className={cn(
                        "px-4 py-1 text-sm hover:bg-slate-800 hover:text-white font-semibold whitespace-nowrap cursor-pointer transition-colors shrink-0 border-r border-gray-300 last:border-r-0 flex items-center space-x-2",
                        selectedCategory === profession.name
                          ? "bg-slate-800 text-white"
                          : " text-gray-500 "
                      )}
                    >
                      <IconComponent className="h-5 w-5" />
                      <span>{profession.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200 py-2">
              <div className="px-4 sm:px-6 lg:px-8 space-y-1">
                <Link
                  href="/"
                  className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Home
                </Link>
                <Link
                  href="/businesses"
                  className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Businesses
                </Link>
                <Link
                  href="/professionals"
                  className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Professionals
                </Link>
                <Link
                  href="/pricing"
                  className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Pricing
                </Link>
                <Link
                  href="/contact"
                  className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Contact Us
                </Link>
                <Link
                  href="/register"
                  className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Make Your Profile
                </Link>
                <Link
                  href="/login"
                  className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Login
                </Link>
              </div>
            </div>
          )}
        </nav>

        {/* Main Content */}
        <main className="pt-30  relative ">
          {/* Hero Banner - 16:9 Ratio */}
          <section className=" px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-linear-to-r from-slate-950 to-cyan-800 aspect-3/1 md:aspect-4/1 flex items-center justify-start pl-4 md:pl-16">
                <div className="relative z-10 text-white max-w-md">
                  <h1 className="text-xl md:text-5xl lg:text-6xl font-bold mb-4">Find Top <br /> Professionals</h1>
                  <p className="text-xs md:text-lg lg:text-xl mb-6">Connect with skilled professionals in your area.</p>
                </div>
                <img src="/pr-banner-shape.png" alt="" className="absolute bottom-0 right-0 w-auto h-full" />
              </div>
            </div>
          </section>

          {/* Search Bar and Filters - Sticky */}
          <div className="sticky top-20 z-30 px-4 sm:px-6 py-8 lg:px-8">
            <div className="max-w-7xl mx-auto ">
              <div className="w-auto sm:w-auto  relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search professionals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:border-primary bg-background"
                />
              </div>
            </div>
          </div>

          {/* Professional Cards Section */}
          <section className="pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              {isLoading ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card
                      key={i}
                      className="overflow-hidden p-0 bg-white/80 backdrop-blur-sm relative"
                    >
                      <div className="relative h-24 md:h-32 bg-muted rounded-t-lg">
                      </div>
                      <Skeleton className="absolute top-28 md:top-32 left-4 h-18 w-18 md:h-22 md:w-22 rounded-full" />
                      <CardHeader className="pt-8 pb-2 md:pb-4">
                        <div className="flex items-center space-x-2 md:space-x-4">
                          <div className="w-18 md:w-22"></div>
                          <div className="flex-1">
                            <Skeleton className="h-5 md:h-6 w-24 md:w-32 mb-2" />
                            <Skeleton className="h-3 md:h-4 w-16 md:w-24" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-1 md:space-y-2 px-2 md:px-3">
                        <Skeleton className="h-3 md:h-4 w-full mb-1 md:mb-2" />
                        <Skeleton className="h-3 md:h-4 w-3/4 mb-2 md:mb-4" />
                        <div className="flex justify-between items-center pt-2 md:pt-4 border-t border-border">
                          <Skeleton className="h-4 md:h-6 w-12 md:w-16" />
                          <Skeleton className="h-6 md:h-8 w-16 md:w-24 rounded-full" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredProfessionals.length === 0 ? (
                <div className="text-center py-16">
                  <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-primary mb-2">
                    {searchTerm
                      ? "No professionals found"
                      : "No professionals available"}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm
                      ? "Try adjusting your search terms"
                      : "Check back later for new professionals"}
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-12">
                        <h2 className="text-2xl font-bold text-slate-800">
                      {searchTerm
                        ? `Search Results (${filteredProfessionals.length})`
                        : `All Professionals (${filteredProfessionals.length})`}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProfessionals.map((professional) => (
                      <Card
                        key={professional.id}
                        className="overflow-hidden  pt-0 backdrop-blur-sm relative"
                      >
                        <div className="relative h-24 md:h-32 m-1.5 mb-0 pb-0 rounded-lg overflow-hidden" style={{ minHeight: '96px' }}>
                          {/* Banner image background */}
                          {professional.banner ? (
                            <img
                              src={professional.banner}
                              alt="Banner"
                              className="w-full h-full object-cover"
                              style={{ zIndex: 0 }}
                              onError={(e) => {
                                console.error('Banner image failed to load:', professional.banner);
                                handleImageError(e);
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-linear-to-r from-gray-100 to-gray-200 flex items-center justify-center" style={{ zIndex: 0 }}>
                              <div className="text-center text-gray-400">
                                <div className="text-4xl mb-2">🖼️</div>
                                <div className="text-sm">No banner</div>
                              </div>
                            </div>
                          )}
                        </div>
                        {professional.profilePicture ? (
                          <img
                            src={professional.profilePicture}
                            alt={professional.name}
                            className="absolute top-28 md:top-32 left-4 h-18 w-18 md:h-22 md:w-22 rounded-full object-cover border-3 border-white shadow-md"
                            loading="lazy"
                            onError={(e) => {
                              console.error('Profile picture failed to load:', professional.profilePicture);
                              handleImageError(e);
                            }}
                            style={{ zIndex: 20 }}
                          />
                        ) : (
                          <div className="absolute top-28 md:top-32 left-4 h-18 w-18 md:h-22 md:w-22 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center border-2 border-white shadow-md" style={{ zIndex: 20 }}>
                            <User className="h-9 w-9 md:h-11 md:w-11 text-gray-600" />
                          </div>
                        )}
                        <CardHeader className="pt-0  pb-2 md:pb-4">
                          <div className="flex items-center space-x-2 md:space-x-4">
                            <div className="w-18 md:w-22"></div>
                            <div className="flex-1 min-w-0">
                              <Link href={`/pcard/${professional.slug}`}>
                              <CardTitle className="text-lg md:text-lg hover:text-slate-600  font-semibold text-slate-700 truncate">
                                {professional.name}
                              </CardTitle>
                              </Link>
                              {professional.professionalHeadline && (
                                <Badge
                                  variant="secondary"
                                  className="mt-1 text-xs truncate"
                                >
                                  {professional.professionalHeadline}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-1 md:space-y-2 px-2 md:px-3">
                     

                          {/* Stats */}
                          <div className="flex items-center justify-between pt-2 md:pt-4 border-t border-border">
                            <div className="flex items-center text-xs md:text-sm text-muted-foreground">
                              <User className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                              <span>Professional</span>
                            </div>
                            <Button
                              asChild
                              size="sm"
                              className="bg-sky-900 hover:bg-sky-800 text-primary-foreground rounded-full text-xs md:text-sm"
                            >
                              <Link href={`/pcard/${professional.slug}`}>
                                <Eye className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                                <span className="hidden sm:inline">
                                  View Profile
                                </span>
                                <ArrowRight className="h-3 w-3 md:h-4 md:w-4 ml-1 md:ml-2" />
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </>
  );
}
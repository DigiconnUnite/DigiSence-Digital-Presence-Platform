'use client'

import { useState, useEffect, useRef } from 'react'
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
  Truck,
  Home,
  Building2,
  Filter,
  ImageIcon
} from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'

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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const categoryScrollRef = useRef<HTMLDivElement>(null)
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
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
      } else {
        console.error('Failed to fetch categories')
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
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
    if (categoryScrollRef.current) {
      const scrollAmount = 200
      const currentScroll = categoryScrollRef.current.scrollLeft
      const newScroll = direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount
      categoryScrollRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      })
    }
  }

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  return (
    <>
      <div className="min-h-screen secondary-light-gradient pb-16 md:pb-0 relative">
        <div className="absolute inset-0 z-0">
          <Aurora />
        </div>

        {/* Sidebar - Hidden by default on all screens */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <Link href="/" className="flex items-center space-x-2">
                <img src="/logo.svg" alt="DigiSence" className="h-7 w-auto" />
                <span className="font-bold text-xl text-slate-800">DigiSence</span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Sidebar Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              <Link
                href="/"
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200",
                  pathname === "/"
                    ? "bg-slate-800 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Home className="mr-3 h-5 w-5" />
                Home
              </Link>
              <Link
                href="/businesses"
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200",
                  pathname === "/businesses"
                    ? "bg-slate-800 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Building2 className="mr-3 h-5 w-5" />
                Businesses
              </Link>
              <Link
                href="/professionals"
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200",
                  pathname === "/professionals"
                    ? "bg-slate-800 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Users className="mr-3 h-5 w-5" />
                Professionals
              </Link>
              <Link
                href="/pricing"
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200",
                  pathname === "/pricing"
                    ? "bg-slate-800 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Calculator className="mr-3 h-5 w-5" />
                Pricing
              </Link>
              <Link
                href="/contact"
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200",
                  pathname === "/contact"
                    ? "bg-slate-800 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Mail className="mr-3 h-5 w-5" />
                Contact Us
              </Link>

              {/* Categories Section in Sidebar */}
              <div className="pt-6 mt-6 border-t border-gray-200">
                <div className="flex items-center px-3 mb-3">
                  <Filter className="mr-2 h-4 w-4 text-gray-500" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Categories</span>
                </div>
                <div className="space-y-1">
                  {professions.map((profession) => {
                    const IconComponent = profession.icon;
                    return (
                      <button
                        key={profession.name}
                        onClick={() => {
                          setSelectedCategory(
                            selectedCategory === profession.name
                              ? null
                              : profession.name
                          );
                          setSidebarOpen(false); // Close sidebar after selection
                        }}
                        className={cn(
                          "w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors duration-200",
                          selectedCategory === profession.name
                            ? "bg-slate-800 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        )}
                      >
                        <IconComponent className="mr-3 h-4 w-4" />
                        {profession.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-gray-200 space-y-2">
              <Button
                variant="outline"
                className="w-full text-white bg-slate-800 border-gray-800 hover:bg-slate-700 transition-colors duration-200"
                asChild
              >
                <Link href="/register">Make Your Profile</Link>
              </Button>
              <Button
                variant="outline"
                className="w-full bg-white text-gray-900 hover:bg-slate-800 hover:text-white border-gray-800 transition-colors duration-200"
                asChild
              >
                <Link href="/login">Login</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Overlay for sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Navigation Bar - Fixed at Top */}
        <nav className="fixed inset-x-0 top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
            <div className="flex justify-between items-center h-14 md:h-16">
              <div className="flex items-center ">

                <Link
                  href="/"
                  className="flex items-center space-x-2"
                >
                  <img src="/logo.svg" alt="DigiSence" className="h-6 w-auto sm:h-7" />
                  <span className="font-bold text-lg sm:text-xl text-slate-800">
                    DigiSence
                  </span>
                </Link>

              </div>
              <div className="hidden md:flex space-x-4 lg:space-x-8 flex-1 justify-center">
                <Link
                  href="/"
                  className={cn(
                    "hover:text-cyan-400 transition-all flex duration-200 px-2 py-1 rounded-md text-sm lg:text-base",
                    pathname === "/"
                      ? "bg-white text-slate-800 font-bold"
                      : "text-gray-700"
                  )}
                >
                  <Home className="mr-1 h-5 w-5" />
                  Home
                </Link>
                <Link
                  href="/businesses"
                  className={cn(
                    "hover:text-cyan-400 transition-all flex duration-200 px-2 py-1 rounded-md text-sm lg:text-base",
                    pathname === "/businesses"
                      ? "bg-white text-slate-800 font-bold"
                      : "text-gray-700"
                  )}
                >
                  <Building2 className="mr-1 h-5 w-5" />
                  Businesses
                </Link>
                <Link
                  href="/professionals"
                  className={cn(
                    "hover:text-cyan-400 transition-all flex duration-200 px-2 py-1 rounded-md text-sm lg:text-base",
                    pathname === "/professionals"
                      ? "bg-white text-slate-800 font-bold"
                      : "text-gray-700"
                  )}
                >
                  <Users className="mr-1 h-5 w-5" />
                  Professionals
                </Link>
                <Link
                  href="/pricing"
                  className={cn(
                    "hover:text-cyan-400 transition-all flex duration-200 px-2 py-1 rounded-md text-sm lg:text-base",
                    pathname === "/pricing"
                      ? "bg-white text-slate-800 font-bold"
                      : "text-gray-700"
                  )}
                >
                  <Calculator className="mr-1 h-5 w-5" />
                  Pricing
                </Link>
                <Link
                  href="/contact"
                  className={cn(
                    "hover:text-cyan-400 transition-all duration-200 flex px-2 py-1 rounded-md text-sm lg:text-base",
                    pathname === "/contact"
                      ? "bg-white text-slate-800 font-bold"
                      : "text-gray-700"
                  )}
                >
                  <Mail className="mr-1 h-5 w-5" />
                  Contact Us
                </Link>
              </div>
              <div className="hidden md:flex items-center space-x-2 sm:space-x-4">
                <Button
                  variant="outline"
                  className="text-white bg-slate-800 border-gray-800 text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4"
                  asChild
                >
                  <Link href="/register">Make Your Profile</Link>
                </Button>
                <Button
                  variant="outline"
                  className="bg-white text-gray-900 hover:bg-slate-800 hover:text-white border-gray-800 text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4"
                  asChild
                >
                  <Link href="/login">Login</Link>
                </Button>
              </div>
              {/* Sidebar Toggle Button - Visible on all screens */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="mr-2 p-2 rounded-md text-gray-700 md:hidden hover:bg-gray-100 transition-colors duration-200"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Category Slider - Only visible on desktop */}
          <div className="hidden md:block bg-gray-50 border-t border-gray-200">
            <div className="max-w-7xl mx-auto">
              <div className="relative">
                <button
                  onClick={() => scrollCategories('left')}
                  className="absolute left-0 top-0 bottom-0 z-10 bg-gray-50 hover:bg-white flex items-center justify-center pr-1 border-r  transition-all duration-200 "
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600" />
                </button>
                <button
                  onClick={() => scrollCategories('right')}
                  className="absolute right-0 top-0 bottom-0 z-10 bg-gray-50 hover:bg-white flex items-center justify-center pl-1 border-l transition-all duration-200 "
                  aria-label="Scroll right"
                >
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                </button>
                <div
                  ref={categoryScrollRef}
                  className="flex items-center overflow-x-auto scrollbar-hide px-8 "
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {professions.map((profession) => {
                    const IconComponent = profession.icon;
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
                          "px-3 py-1 text-xs sm:text-sm font-semibold hover:bg-slate-800 hover:text-white whitespace-nowrap cursor-pointer transition-all duration-200 shrink-0 border-r border-gray-300 last:border-r-0 flex items-center space-x-1 sm:space-x-2",
                          selectedCategory === profession.name
                            ? "bg-slate-800 text-white"
                            : "text-gray-500"
                        )}
                      >
                        <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="hidden sm:inline">{profession.name}</span>
                        <span className="sm:hidden">{profession.name.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="pt-20 md:pt-32">
          {/* Hero Banner - Keeping exact aspect ratio */}
          <section className="px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="relative overflow-hidden rounded-xl md:rounded-2xl lg:rounded-3xl bg-gradient-to-r from-slate-950 to-cyan-800 aspect-4/2 md:aspect-4/1  flex items-center justify-start pl-4 sm:pl-6 md:pl-12 lg:pl-16">
                <div className="relative z-10 text-white max-w-xs sm:max-w-md">
                  <h1 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 sm:mb-4">
                    Find Top <br /> Professionals
                  </h1>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6">
                    Connect with skilled professionals in your area.
                  </p>
                </div>
                <img
                  src="/pr-banner-shape.png"
                  alt=""
                  className="absolute bottom-0 right-0 w-auto h-3/4 sm:h-4/5 md:h-full opacity-80"
                />
              </div>
            </div>
          </section>

          {/* Search Bar and Filters */}
          <div className="w-full py-4 sm:py-6">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
              <div className="w-full relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 sm:h-5 sm:w-5" />
                <Input
                  type="text"
                  placeholder="Search professionals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 sm:py-3 rounded-full border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-background"
                />
              </div>
            </div>
          </div>

          {/* Professional Cards Section */}
          <section className="pb-16 sm:pb-20 px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Card
                      key={i}
                      className="overflow-hidden pt-0 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="relative h-24 md:h-32 m-1.5 mb-0 pb-0 rounded-lg overflow-hidden">
                        <Skeleton className="w-full h-full" />
                      </div>
                      <Skeleton className="absolute top-28 md:top-32 left-4 h-18 w-18 md:h-22 md:w-22 rounded-full" />
                      <CardHeader className="pt-8 pb-2 md:pb-4">
                        <div className="flex items-center space-x-2 md:space-x-4">
                          <div className="w-18 md:w-22"></div>
                          <div className="flex-1">
                            <Skeleton className="h-4 w-20 sm:w-24 md:w-28 mb-2" />
                            <Skeleton className="h-3 w-16 sm:w-20" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 sm:space-y-4 px-4 sm:px-6">
                        <Skeleton className="h-3 w-full mb-1" />
                        <Skeleton className="h-3 w-3/4 mb-2 sm:mb-4" />
                        <div className="flex gap-2 mb-2 sm:mb-4">
                          <Skeleton className="h-8 w-full rounded-full" />
                          <Skeleton className="h-8 w-full rounded-full" />
                        </div>
                        <div className="flex justify-between items-center pt-2 sm:pt-4 border-t border-border">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-8 w-20 rounded-full" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredProfessionals.length === 0 ? (
                <div className="text-center py-16">
                    <User className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg sm:text-xl font-semibold text-primary mb-2">
                    {searchTerm
                      ? "No professionals found"
                      : "No professionals available"}
                  </h3>
                    <p className="text-muted-foreground text-sm sm:text-base">
                    {searchTerm
                      ? "Try adjusting your search terms"
                      : "Check back later for new professionals"}
                  </p>
                </div>
              ) : (
                <>
                      <div className="flex justify-between items-center mb-6 sm:mb-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                      {searchTerm
                        ? `Search Results (${filteredProfessionals.length})`
                        : `All Professionals (${filteredProfessionals.length})`}
                    </h2>
                  </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
                    {filteredProfessionals.map((professional) => (
                      <Card
                        key={professional.id}
                        className="overflow-hidden pt-0 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-300 relative"
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
                              <div className="w-full h-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center" style={{ zIndex: 0 }}>
                                <div className="text-center text-gray-400">
                                  <ImageIcon
                                    className="h-10 mx-auto w-10 text-gray-400"
                                  />
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
                        <CardHeader className="pt-0 pb-2 md:pb-4">
                          <div className="flex items-center space-x-2 md:space-x-4">
                            <div className="w-18 md:w-22"></div>
                            <div className="flex-1 min-w-0">
                              <Link href={`/pcard/${professional.slug}`}>
                                <CardTitle className="text-lg md:text-lg hover:text-slate-600 font-semibold text-slate-700 truncate">
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
                          {/* Contact Info - Now more compact */}
                          <div className="flex flex-wrap gap-1 mb-2 sm:mb-4">
                            {professional.location && (
                              <div className="flex items-center text-xs text-muted-foreground bg-gray-50 py-1 rounded-full">
                                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-muted-foreground shrink-0" />
                                <span className="truncate max-w-[150px] sm:max-w-none">
                                  {professional.location}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Spacer to push the bottom section to the bottom */}
                          <div className="flex-1"></div>

                          {/* Contact CTA Buttons */}
                          <div className="flex gap-2 mb-2 sm:mb-4">
                            {professional.phone && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 rounded-full text-xs h-8 transition-all duration-200 hover:bg-gray-100"
                                asChild
                              >
                                <a href={`tel:${professional.phone}`}>
                                  <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                  <span className="hidden sm:inline">Call</span>
                                </a>
                              </Button>
                            )}
                            {professional.phone && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 rounded-full text-white text-xs h-8 bg-green-500 hover:bg-green-600 border-green-500 transition-all duration-200"
                                asChild
                              >
                                <a
                                  href={`https://wa.me/${professional.phone.replace(
                                    /[^0-9]/g,
                                    ""
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <FaWhatsapp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-white" />
                                  <span className="hidden sm:inline">
                                    WhatsApp
                                  </span>
                                </a>
                              </Button>
                            )}
                            {professional.email && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 rounded-full text-xs h-8 transition-all duration-200 hover:bg-gray-100"
                                asChild
                              >
                                <a href={`mailto:${professional.email}`}>
                                  <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                  <span className="hidden sm:inline">
                                    Email
                                  </span>
                                </a>
                              </Button>
                            )}
                          </div>

                          {/* Stats - Fixed at bottom */}
                          <div className="flex items-center justify-between pt-2 sm:pt-4 border-t border-border mt-auto">
                            <div className="flex items-center text-xs text-muted-foreground">
                              <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              <span>Professional</span>
                            </div>
                            <Button
                              asChild
                              size="sm"
                              className="bg-sky-900 hover:bg-sky-800 text-primary-foreground rounded-full text-xs h-8 transition-all duration-200"
                            >
                              <Link href={`/pcard/${professional.slug}`}>
                                <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                <span className="hidden sm:inline">
                                  View Profile
                                </span>
                                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
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
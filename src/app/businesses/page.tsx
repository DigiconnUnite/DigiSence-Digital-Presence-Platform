'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { getOptimizedImageUrl } from '@/lib/image-utils'
import Aurora from '@/components/Aurora'
import Footer from '@/components/Footer'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import {
  Search,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Package,
  Eye,
  ArrowRight,
  X,
  Menu,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface Business {
  id: string
  name: string
  slug: string
  description: string | null
  logo: string | null
  address: string | null
  phone: string | null
  email: string | null
  website: string | null
  category: {
    name: string
  } | null
  products: {
    id: string
  }[]
}

interface Category {
  id: string
  name: string
  slug: string
}

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const categoryScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchBusinesses()
    fetchCategories()
  }, [])

  useEffect(() => {
    const filtered = businesses.filter(business => {
      const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !selectedCategory || business.category?.name === selectedCategory
      return matchesSearch && matchesCategory
    })
    setFilteredBusinesses(filtered)
  }, [businesses, searchTerm, selectedCategory])

  const fetchBusinesses = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/businesses')
      if (response.ok) {
        const data = await response.json()
        setBusinesses(data.businesses)
        setFilteredBusinesses(data.businesses)
      } else {
        console.error('Failed to fetch businesses')
      }
    } catch (error) {
      console.error('Error fetching businesses:', error)
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


  return (
    <>
      <div className="min-h-screen bg-linear-0 pb-16 md:pb-0 relative">
        <div className="absolute inset-0 -z-10">
          <Aurora colorStops={['#93c5fd', '#a5b4fc', '#ddd6fe']} amplitude={0.5} blend={0.3} />
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

                  <span className="font-bold text-xl text-primary">DigiSence</span>
                </Link>
              </div>
              <div className="hidden md:flex space-x-8">
                <Link href="/" className="text-gray-700 hover:text-primary transition-colors">
                  Home
                </Link>
                <Link href="/businesses" className="text-gray-700 hover:text-primary transition-colors">
                  Businesses
                </Link>
                <Link href="/professionals" className="text-gray-700 hover:text-primary transition-colors">
                  Professionals
                </Link>
                <Link href="/contact" className="text-gray-700 hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" className="bg-gray-800 text-white hover:bg-gray-700 border-gray-800" asChild>
                  <Link href="/dashboard/business">Register</Link>
                </Button>
                <Button variant="outline" className="bg-gray-800 text-white hover:bg-gray-700 border-gray-800" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                {/* Mobile menu button */}
                <button
                  className="md:hidden ml-2 p-2 rounded-md text-gray-700 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>

          {/* Category Slider - Full Width */}
          <div className="bg-gray-50 py-2 border-t border-gray-200">
            <div className="max-w-7xl mx-auto ">
              <div
                ref={categoryScrollRef}
                className="flex items-center overflow-x-auto scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)}
                    className={cn(
                      "px-4  text-xs font-medium whitespace-nowrap cursor-pointer transition-colors shrink-0 border-r border-gray-300 last:border-r-0",
                      selectedCategory === category.name
                        ? "bg-primary text-primary-foreground"
                        : " text-gray-500 "
                    )}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200 py-2">
              <div className="px-4 sm:px-6 lg:px-8 space-y-1">
                <Link href="/" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                  Home
                </Link>
                <Link href="/businesses" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                  Businesses
                </Link>
                <Link href="/professionals" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                  Professionals
                </Link>
                <Link href="/contact" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                  Contact Us
                </Link>
                <Link href="/dashboard/business" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                  Register
                </Link>
                <Link href="/login" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                  Login
                </Link>
              </div>
            </div>
          )}
        </nav>

        {/* Main Content */}
        <main className="pt-30  ">
          {/* Hero Banner - 16:9 Ratio */}
          <section className=" px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-linear-to-r from-slate-950 to-cyan-600 aspect-3/1 md:aspect-4/1 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/20"></div>
              </div>
            </div>
          </section>

          {/* Search Bar and Filters */}
          <div className=" w-full py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-0">
              <div className="w-auto sm:w-auto  relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search businesses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:border-primary bg-background"
                />
              </div>
            </div>
          </div>


          {/* Business Cards Section */}
          <section className="pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              {isLoading ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden border-0  bg-white/80 backdrop-blur-sm">
                      <CardHeader className="pb-2 md:pb-4">
                        <div className="flex items-center space-x-2 md:space-x-4">
                          <Skeleton className="h-12 w-12 md:h-16 md:w-16 rounded-full" />
                          <div className="flex-1">
                            <Skeleton className="h-5 md:h-6 w-24 md:w-32 mb-2" />
                            <Skeleton className="h-3 md:h-4 w-16 md:w-24" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 md:space-y-4 px-4 md:px-6">
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
              ) : filteredBusinesses.length === 0 ? (
                <div className="text-center py-16">
                  <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-primary mb-2">
                    {searchTerm ? 'No businesses found' : 'No businesses available'}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm
                      ? 'Try adjusting your search terms'
                      : 'Check back later for new businesses'
                    }
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-12">
                    <h2 className="text-2xl font-bold text-primary">
                      {searchTerm ? `Search Results (${filteredBusinesses.length})` : `All Businesses (${filteredBusinesses.length})`}
                    </h2>
                  </div>

                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBusinesses.map((business) => (
                          <Card
                            key={business.id}
                            className="overflow-hidden border  bg-white/80 backdrop-blur-sm"
                          >
                            <CardHeader className="pb-2 md:pb-4">
                              <div className="flex items-center space-x-2 md:space-x-4">
                                <div className="shrink-0">
                                  {business.logo ? (
                                    <img
                                      src={getOptimizedImageUrl(business.logo, {
                                        width: 48,
                                        height: 48,
                                        quality: 85,
                                        format: 'auto',
                                        crop: 'fill',
                                        gravity: 'center'
                                      })}
                                      alt={business.name}
                                      className="h-12 w-12 md:h-16 md:w-16 rounded-full object-cover border-2 border-border"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                                      <Building2 className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <CardTitle className="text-lg md:text-xl font-bold text-primary truncate">
                                    {business.name}
                                  </CardTitle>
                                  {business.category && (
                                    <Badge variant="secondary" className="mt-1 text-xs">
                                      {business.category.name}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </CardHeader>

                            <CardContent className="space-y-2 md:space-y-4 px-4 md:px-6">
                              {business.description && (
                                <CardDescription className="text-muted-foreground line-clamp-2 md:line-clamp-3 text-sm md:text-base">
                                  {business.description}
                                </CardDescription>
                              )}

                              {/* Contact Info */}
                              <div className="space-y-2">
                                {business.address && (
                                  <div className="flex items-center text-sm text-muted-foreground">
                                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
                                    <span className="truncate">{business.address}</span>
                                  </div>
                                )}
                                {business.phone && (
                                  <div className="flex items-center text-sm text-muted-foreground">
                                    <Phone className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
                                    <span>{business.phone}</span>
                                  </div>
                                )}
                                {business.email && (
                                  <div className="flex items-center text-sm text-muted-foreground">
                                    <Mail className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
                                    <span className="truncate">{business.email}</span>
                                  </div>
                                )}
                                {business.website && (
                                  <div className="flex items-center text-sm text-muted-foreground">
                                    <Globe className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
                                    <a
                                      href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline truncate"
                                    >
                                      Visit Website
                                    </a>
                                  </div>
                                )}
                              </div>

                              {/* Stats */}
                              <div className="flex items-center justify-between pt-2 md:pt-4 border-t border-border">
                                <div className="flex items-center text-xs md:text-sm text-muted-foreground">
                                  <Package className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                  <span>{business.products.length} products</span>
                                </div>
                                <Button
                                  asChild
                                  size="sm"
                                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-xs md:text-sm"
                                >
                                  <Link href={`/catalog/${business.slug}`}>
                                    <Eye className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                                    <span className="hidden sm:inline">View Profile</span>
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
  )
}
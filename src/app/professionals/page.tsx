'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { getOptimizedImageUrl } from '@/lib/cloudinary'
import { AuroraBackground } from '@/components/ui/aurora-background'
import Footer from '@/components/Footer'
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from '@/components/ui/resizable-navbar'
import { usePathname } from 'next/navigation'
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
  ArrowRight
} from 'lucide-react'

interface Professional {
  id: string
  name: string
  slug: string
  professionalHeadline: string | null
  profilePicture: string | null
  location: string | null
  phone: string | null
  email: string | null
  website: string | null
}

export default function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [filteredProfessionals, setFilteredProfessionals] = useState<Professional[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const navItems = [
    {
      name: "Home",
      link: "/",
    },
    {
      name: "Businesses",
      link: "/businesses",
    },
    {
      name: "Professionals",
      link: "/professionals",
    },
    {
      name: "Contact Us",
      link: "/contact",
    },
  ]

  useEffect(() => {
    fetchProfessionals()
  }, [])

  useEffect(() => {
    const filtered = professionals.filter(professional =>
      professional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professional.professionalHeadline?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professional.location?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredProfessionals(filtered)
  }, [professionals, searchTerm])

  const fetchProfessionals = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/professionals')
      if (response.ok) {
        const data = await response.json()
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

  const handleViewProfessional = (slug: string) => {
    router.push(`/pcard/${slug}`)
  }

  return (
    <>
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <Link
            href="/"
            className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-gray-900"
          >
            <span className="font-medium text-gray-900 dark:text-gray-100">DigiSence</span>
          </Link>
          <NavItems items={navItems} />
          <div className="flex items-center gap-4">
            <NavbarButton variant="dark" as={Link} href="/dashboard/admin">Login</NavbarButton>
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <Link
              href="/"
              className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-gray-900"
            >
              <span className="font-medium text-gray-900 dark:text-gray-100">DigiSence</span>
            </Link>
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => {
              const isActive = pathname === item.link;
              return (
                <Link
                  key={`mobile-link-${idx}`}
                  href={item.link}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "relative text-neutral-600 dark:text-neutral-300",
                    isActive && "text-blue-600 dark:text-blue-400 font-semibold"
                  )}
                >
                  <span className="block">{item.name}</span>
                </Link>
              );
            })}
            <div className="flex w-full flex-col gap-4">
              <NavbarButton
                onClick={() => setIsMobileMenuOpen(false)}
                variant="dark"
                className="w-full"
                as={Link}
                href="/dashboard/admin"
              >
                Login
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      <AuroraBackground className="pt-24">
        {/* Header Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-6">
              Discover Amazing Professionals
            </h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              Explore our curated collection of professionals offering quality services.
              Find the perfect professional for your needs.
            </p>

            {/* Search Bar */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Search professionals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg rounded-full border-2 border-border focus:border-primary bg-background"
              />
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-6 w-32 mb-2" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4 mb-4" />
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-8 w-24" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredProfessionals.length === 0 ? (
              <div className="text-center py-16">
                <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-primary mb-2">
                  {searchTerm ? 'No professionals found' : 'No professionals available'}
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm
                    ? 'Try adjusting your search terms'
                    : 'Check back later for new professionals'
                  }
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-12">
                  <h2 className="text-2xl font-bold text-primary">
                    {searchTerm ? `Search Results (${filteredProfessionals.length})` : `All Professionals (${filteredProfessionals.length})`}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProfessionals.map((professional) => (
                    <Card
                      key={professional.id}
                      className="overflow-hidden hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:bg-white/90"
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-center space-x-4">
                          <div className="shrink-0">
                            {professional.profilePicture ? (
                              <img
                                src={getOptimizedImageUrl(professional.profilePicture, {
                                  width: 64,
                                  height: 64,
                                  quality: 85,
                                  format: 'auto',
                                  crop: 'fill',
                                  gravity: 'center'
                                })}
                                alt={professional.name}
                                className="h-16 w-16 rounded-full object-cover border-2 border-border"
                                loading="lazy"
                              />
                            ) : (
                              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                                <User className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-xl font-bold text-primary truncate">
                              {professional.name}
                            </CardTitle>
                            {professional.professionalHeadline && (
                              <Badge variant="secondary" className="mt-1">
                                {professional.professionalHeadline}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Contact Info */}
                        <div className="space-y-2">
                          {professional.location && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
                              <span className="truncate">{professional.location}</span>
                            </div>
                          )}
                          {professional.phone && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Phone className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
                              <span>{professional.phone}</span>
                            </div>
                          )}
                          {professional.email && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Mail className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
                              <span className="truncate">{professional.email}</span>
                            </div>
                          )}
                          {professional.website && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Globe className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
                              <a
                                href={professional.website.startsWith('http') ? professional.website : `https://${professional.website}`}
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
                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <User className="h-4 w-4 mr-1" />
                            <span>Professional</span>
                          </div>
                          <Button
                            onClick={() => handleViewProfessional(professional.slug)}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Profile
                            <ArrowRight className="h-4 w-4 ml-2" />
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
      </AuroraBackground>
      <Footer />
    </>
  )
}
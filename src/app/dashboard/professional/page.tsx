'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import type { UserRole } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ArrayFieldManager,
  WorkExperienceForm,
  EducationForm,
  SkillForm,
  ServiceForm,
  PortfolioItemForm
} from '@/components/ui/array-field-manager'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Plus,
  Edit,
  Eye,
  EyeOff,
  Users,
  Building,
  MessageSquare,
  Key,
  BarChart3,
  FileText,
  Mail,
  Shield,
  Search,
  Download,
  Settings,
  Package,
  TrendingUp,
  Activity,
  Crown,
  Globe,
  UserCheck,
  AlertTriangle,
  Home,
  Grid3X3,
  FolderTree,
  MessageCircle,
  LineChart,
  Cog,
  MoreHorizontal,
  LogOut,
  User,
  Briefcase,
  MapPin,
  Phone,
  Globe as GlobeIcon,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Image
} from 'lucide-react'
import Link from 'next/link'

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
  createdAt: string
  updatedAt: string
  adminId: string
}

interface MenuItem {
  title: string
  icon: any
  mobileIcon: any
  value: string
  mobileTitle: string
}

export default function ProfessionalDashboard() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [professional, setProfessional] = useState<Professional | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [currentView, setCurrentView] = useState('overview')

  // Professional form state
  const [professionalWorkExperience, setProfessionalWorkExperience] = useState<any[]>([])
  const [professionalEducation, setProfessionalEducation] = useState<any[]>([])
  const [professionalSkills, setProfessionalSkills] = useState<string[]>([])
  const [professionalServices, setProfessionalServices] = useState<any[]>([])
  const [professionalPortfolio, setProfessionalPortfolio] = useState<any[]>([])
  const [professionalSocialMedia, setProfessionalSocialMedia] = useState({
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: ''
  })
  const [isEditing, setIsEditing] = useState(false)

  // Services state
  const [services, setServices] = useState<any[]>([])
  const [isEditingServices, setIsEditingServices] = useState(false)

  // Portfolio state
  const [portfolio, setPortfolio] = useState<any[]>([])
  const [isEditingPortfolio, setIsEditingPortfolio] = useState(false)

  // Inquiries state
  const [inquiries, setInquiries] = useState<any[]>([])
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null)
  const [showInquiryDialog, setShowInquiryDialog] = useState(false)

  // Stats state
  const [stats, setStats] = useState({
    totalInquiries: 0,
    newInquiries: 0,
    profileViews: 0,
  })

  // Create professional state
  const [isCreatingProfile, setIsCreatingProfile] = useState(false)

  useEffect(() => {
    // Check if mobile on initial load and on resize
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setSidebarOpen(false)
      }
    }

    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)

    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  useEffect(() => {
    if (!loading && (!user || (user.role as string) !== 'PROFESSIONAL_ADMIN')) {
      router.push('/login')
      return
    }

    if (user?.role === ('PROFESSIONAL_ADMIN' as UserRole)) {
      fetchProfessionalData()
    }
  }, [user, loading, router])

  const fetchProfessionalData = async () => {
    try {
      setIsLoading(true)

      // Fetch professional profile
      const response = await fetch('/api/professionals')
      if (response.ok) {
        const data = await response.json()
        // Find the professional associated with this user
        const userProfessional = data.professionals.find((p: Professional) => p.adminId === user?.id)
        if (userProfessional) {
          setProfessional(userProfessional)

          // Load structured data into form state
          setProfessionalWorkExperience(userProfessional.workExperience || [])
          setProfessionalEducation(userProfessional.education || [])
          setProfessionalSkills(userProfessional.skills || [])
          setProfessionalServices(userProfessional.servicesOffered || [])
          setProfessionalPortfolio(userProfessional.portfolio || [])
          setProfessionalSocialMedia({
            facebook: userProfessional.facebook || '',
            twitter: userProfessional.twitter || '',
            instagram: userProfessional.instagram || '',
            linkedin: userProfessional.linkedin || ''
          })

          // Load services and portfolio
          setServices(userProfessional.servicesOffered || [])
          setPortfolio(userProfessional.portfolio || [])
        }
      }

      // Fetch inquiries
      try {
        const inquiriesResponse = await fetch('/api/professionals/inquiries')
        if (inquiriesResponse.ok) {
          const inquiriesData = await inquiriesResponse.json()
          setInquiries(inquiriesData.inquiries)

          // Calculate stats
          const totalInquiries = inquiriesData.inquiries.length
          const newInquiries = inquiriesData.inquiries.filter((i: any) => i.status === 'NEW').length

          setStats(prev => ({
            ...prev,
            totalInquiries,
            newInquiries,
          }))
        }
      } catch (inquiriesError) {
        console.error('Failed to fetch inquiries:', inquiriesError)
      }
    } catch (error) {
      console.error('Failed to fetch professional data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateProfessional = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    const formData = new FormData(e.currentTarget)

    const createData = {
      name: formData.get('name') as string,
      professionalHeadline: formData.get('professionalHeadline') as string,
      aboutMe: formData.get('aboutMe') as string,
      profilePicture: formData.get('profilePicture') as string,
      banner: formData.get('banner') as string,
      location: formData.get('location') as string,
      phone: formData.get('phone') as string,
      website: formData.get('website') as string,
      email: formData.get('email') as string,
      facebook: professionalSocialMedia.facebook,
      twitter: professionalSocialMedia.twitter,
      instagram: professionalSocialMedia.instagram,
      linkedin: professionalSocialMedia.linkedin,
      workExperience: professionalWorkExperience,
      education: professionalEducation,
      skills: professionalSkills,
      servicesOffered: professionalServices,
      portfolio: professionalPortfolio,
      adminId: user.id,
    }

    try {
      const response = await fetch('/api/professionals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createData),
      })

      if (response.ok) {
        const data = await response.json()
        setProfessional(data.professional)

        // Load structured data into form state
        setProfessionalWorkExperience(data.professional.workExperience || [])
        setProfessionalEducation(data.professional.education || [])
        setProfessionalSkills(data.professional.skills || [])
        setProfessionalServices(data.professional.servicesOffered || [])
        setProfessionalPortfolio(data.professional.portfolio || [])
        setProfessionalSocialMedia({
          facebook: data.professional.facebook || '',
          twitter: data.professional.twitter || '',
          instagram: data.professional.instagram || '',
          linkedin: data.professional.linkedin || ''
        })

        setIsCreatingProfile(false)
        toast({
          title: "Success",
          description: "Professional profile created successfully!",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: `Failed to create profile: ${error.error}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Create error:', error)
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateProfessional = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!professional) return

    setIsLoading(true)
    const formData = new FormData(e.currentTarget)

    const updateData = {
      name: formData.get('name') as string,
      professionalHeadline: formData.get('professionalHeadline') as string,
      aboutMe: formData.get('aboutMe') as string,
      profilePicture: formData.get('profilePicture') as string,
      banner: formData.get('banner') as string,
      location: formData.get('location') as string,
      phone: formData.get('phone') as string,
      website: formData.get('website') as string,
      email: formData.get('email') as string,
      facebook: professionalSocialMedia.facebook,
      twitter: professionalSocialMedia.twitter,
      instagram: professionalSocialMedia.instagram,
      linkedin: professionalSocialMedia.linkedin,
      workExperience: professionalWorkExperience,
      education: professionalEducation,
      skills: professionalSkills,
      servicesOffered: professionalServices,
      portfolio: professionalPortfolio,
    }

    try {
      const response = await fetch(`/api/professionals/${professional.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        const data = await response.json()
        setProfessional(data.professional)

        // Update structured data in form state
        setProfessionalWorkExperience(data.professional.workExperience || [])
        setProfessionalEducation(data.professional.education || [])
        setProfessionalSkills(data.professional.skills || [])
        setProfessionalServices(data.professional.servicesOffered || [])
        setProfessionalPortfolio(data.professional.portfolio || [])
        setProfessionalSocialMedia({
          facebook: data.professional.facebook || '',
          twitter: data.professional.twitter || '',
          instagram: data.professional.instagram || '',
          linkedin: data.professional.linkedin || ''
        })

        setIsEditing(false)
        toast({
          title: "Success",
          description: "Professional profile updated successfully!",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: `Failed to update profile: ${error.error}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Update error:', error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateServices = async () => {
    try {
      const response = await fetch('/api/professionals/services', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ services }),
      })

      if (response.ok) {
        await fetchProfessionalData()
        setIsEditingServices(false)
        toast({
          title: "Success",
          description: "Services updated successfully!",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: `Failed to update services: ${error.error}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Services update error:', error)
      toast({
        title: "Error",
        description: "Failed to update services. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdatePortfolio = async () => {
    try {
      const response = await fetch('/api/professionals/portfolio', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ portfolio }),
      })

      if (response.ok) {
        await fetchProfessionalData()
        setIsEditingPortfolio(false)
        toast({
          title: "Success",
          description: "Portfolio updated successfully!",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: `Failed to update portfolio: ${error.error}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Portfolio update error:', error)
      toast({
        title: "Error",
        description: "Failed to update portfolio. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleInquiryStatusUpdate = async (inquiryId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/professionals/inquiries/${inquiryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        await fetchProfessionalData()
        toast({
          title: "Success",
          description: "Inquiry status updated successfully!",
        })
      } else {
        const errorResult = await response.json()
        toast({
          title: "Error",
          description: `Failed to update status: ${errorResult.error}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update inquiry status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const menuItems: MenuItem[] = [
    {
      title: 'Overview',
      icon: BarChart3,
      mobileIcon: Home,
      value: 'overview',
      mobileTitle: 'Home'
    },
    {
      title: 'My Profile',
      icon: User,
      mobileIcon: User,
      value: 'profile',
      mobileTitle: 'Profile'
    },
    {
      title: 'Inquiries',
      icon: MessageSquare,
      mobileIcon: MessageCircle,
      value: 'inquiries',
      mobileTitle: 'Inquiries'
    },
    {
      title: 'Analytics',
      icon: TrendingUp,
      mobileIcon: LineChart,
      value: 'analytics',
      mobileTitle: 'Analytics'
    },
    {
      title: 'Settings',
      icon: Settings,
      mobileIcon: Cog,
      value: 'settings',
      mobileTitle: 'Settings'
    },
  ]

  const renderSkeletonContent = () => {
    return (
      <div className="space-y-6 pb-20 md:pb-0">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-white border border-gray-200 shadow-sm rounded-3xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const renderMiddleContent = () => {
    if (isLoading) {
      return renderSkeletonContent()
    }

    switch (currentView) {
      case 'overview':
        return (
          <div className="space-y-6 pb-20 md:pb-0">
            <div className="mb-8">
              <h1 className="text-xl font-bold text-gray-900 mb-2">Professional Dashboard Overview</h1>
              <p className="text-xl text-gray-600">Welcome back! Here's your professional profile overview.</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl transition-all duration-300 hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">Profile Views</CardTitle>
                  <Eye className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">0</div>
                  <p className="text-xs text-gray-500">This month</p>
                </CardContent>
              </Card>
              <Card className="bg-white border border-gray-200 shadow-sm rounded-2xl transition-all duration-300 hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">Profile Status</CardTitle>
                  <UserCheck className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {professional?.isActive ? 'Active' : 'Inactive'}
                  </div>
                  <p className="text-xs text-gray-500">Current status</p>
                </CardContent>
              </Card>
              <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl transition-all duration-300 hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">Profile URL</CardTitle>
                  <Globe className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-bold text-gray-900 truncate">
                    {professional ? `/pcard/${professional.slug}` : 'Not set'}
                  </div>
                  <p className="text-xs text-gray-500">Your public profile</p>
                </CardContent>
              </Card>
              <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl transition-all duration-300 hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">Platform Health</CardTitle>
                  <Activity className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">Good</div>
                  <p className="text-xs text-gray-500">System status</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    View My Profile
                  </CardTitle>
                  <CardDescription>
                    See how your professional profile appears to visitors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    onClick={() => professional && window.open(`/pcard/${professional.slug}`, '_blank')}
                    disabled={!professional}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Public Profile
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit className="h-5 w-5" />
                    Edit Profile
                  </CardTitle>
                  <CardDescription>
                    Update your professional information and portfolio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setCurrentView('profile')}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      case 'profile':
        return (
          <div className="space-y-6 pb-20 md:pb-0">
            <div className="mb-8">
              <h1 className="text-xl font-bold text-gray-900 mb-2">My Professional Profile</h1>
              <p className="text-xl text-gray-600">Manage your professional information and portfolio.</p>
            </div>

            {!professional ? (
              <div className="space-y-6">
                {/* Create Profile Prompt */}
                <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Professional Profile Found</h3>
                      <p className="text-gray-600 mb-6">
                        You haven't created your professional profile yet. Create one to showcase your services and attract clients.
                      </p>
                      <Button onClick={() => setIsCreatingProfile(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Professional Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {isCreatingProfile && (
                  <form onSubmit={handleCreateProfessional} className="space-y-6">
                    {/* Basic Information */}
                    <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <User className="h-5 w-5 mr-2" />
                          Basic Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label>Professional Name *</Label>
                            <Input name="name" required className="rounded-2xl" />
                          </div>
                          <div className="space-y-2">
                            <Label>Professional Headline</Label>
                            <Input name="professionalHeadline" className="rounded-2xl" />
                          </div>
                          <div className="space-y-2">
                            <Label>About Me</Label>
                            <Textarea name="aboutMe" className="rounded-2xl" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Profile Picture URL</Label>
                              <Input name="profilePicture" className="rounded-2xl" />
                            </div>
                            <div className="space-y-2">
                              <Label>Banner Image URL</Label>
                              <Input name="banner" className="rounded-2xl" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Location</Label>
                              <Input name="location" className="rounded-2xl" />
                            </div>
                            <div className="space-y-2">
                              <Label>Phone</Label>
                              <Input name="phone" className="rounded-2xl" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Website</Label>
                              <Input name="website" className="rounded-2xl" />
                            </div>
                            <div className="space-y-2">
                              <Label>Email</Label>
                              <Input name="email" type="email" className="rounded-2xl" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Social Media */}
                    <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <GlobeIcon className="h-5 w-5 mr-2" />
                          Social Media Links
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label className="flex items-center">
                              <Facebook className="h-4 w-4 mr-2 text-amber-600" />
                              Facebook
                            </Label>
                            <Input
                              value={professionalSocialMedia.facebook}
                              onChange={(e) => setProfessionalSocialMedia(prev => ({ ...prev, facebook: e.target.value }))}
                              placeholder="https://facebook.com/username"
                              className="rounded-2xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="flex items-center">
                              <Twitter className="h-4 w-4 mr-2 text-amber-400" />
                              Twitter
                            </Label>
                            <Input
                              value={professionalSocialMedia.twitter}
                              onChange={(e) => setProfessionalSocialMedia(prev => ({ ...prev, twitter: e.target.value }))}
                              placeholder="https://twitter.com/username"
                              className="rounded-2xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="flex items-center">
                              <Instagram className="h-4 w-4 mr-2 text-pink-600" />
                              Instagram
                            </Label>
                            <Input
                              value={professionalSocialMedia.instagram}
                              onChange={(e) => setProfessionalSocialMedia(prev => ({ ...prev, instagram: e.target.value }))}
                              placeholder="https://instagram.com/username"
                              className="rounded-2xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="flex items-center">
                              <Linkedin className="h-4 w-4 mr-2 text-amber-700" />
                              LinkedIn
                            </Label>
                            <Input
                              value={professionalSocialMedia.linkedin}
                              onChange={(e) => setProfessionalSocialMedia(prev => ({ ...prev, linkedin: e.target.value }))}
                              placeholder="https://linkedin.com/in/username"
                              className="rounded-2xl"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Work Experience */}
                    <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl">
                      <CardContent className="p-6">
                        <ArrayFieldManager
                          title="Work Experience"
                          items={professionalWorkExperience}
                          onChange={setProfessionalWorkExperience}
                          renderItem={(item: any, index: number) => (
                            <div>
                              <h4 className="font-semibold">{item.position}</h4>
                              <p className="text-amber-600">{item.company}</p>
                              <p className="text-sm text-gray-600">{item.duration}</p>
                              {item.description && <p className="text-sm mt-1">{item.description}</p>}
                            </div>
                          )}
                          createNewItem={() => ({ position: '', company: '', duration: '', description: '' })}
                          renderForm={(item: any, onSave: (item: any) => void, onCancel: () => void) => (
                            <WorkExperienceForm item={item} onSave={onSave} onCancel={onCancel} />
                          )}
                          itemName="Work Experience"
                        />
                      </CardContent>
                    </Card>

                    {/* Education */}
                    <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl">
                      <CardContent className="p-6">
                        <ArrayFieldManager
                          title="Education"
                          items={professionalEducation}
                          onChange={setProfessionalEducation}
                          renderItem={(item: any, index: number) => (
                            <div>
                              <h4 className="font-semibold">{item.degree}</h4>
                              <p className="text-amber-600">{item.institution}</p>
                              <p className="text-sm text-gray-600">{item.year}</p>
                              {item.description && <p className="text-sm mt-1">{item.description}</p>}
                            </div>
                          )}
                          createNewItem={() => ({ degree: '', institution: '', year: '', description: '' })}
                          renderForm={(item: any, onSave: (item: any) => void, onCancel: () => void) => (
                            <EducationForm item={item} onSave={onSave} onCancel={onCancel} />
                          )}
                          itemName="Education"
                        />
                      </CardContent>
                    </Card>

                    {/* Skills */}
                    <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl">
                      <CardContent className="p-6">
                        <ArrayFieldManager
                          title="Skills & Expertise"
                          items={professionalSkills}
                          onChange={setProfessionalSkills}
                          renderItem={(skill: string, index: number) => (
                            <div>
                              <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-medium">
                                {skill}
                              </span>
                            </div>
                          )}
                          createNewItem={() => ''}
                          renderForm={(item: string | null, onSave: (item: string) => void, onCancel: () => void) => (
                            <SkillForm item={item} onSave={onSave} onCancel={onCancel} />
                          )}
                          itemName="Skill"
                        />
                      </CardContent>
                    </Card>

                    {/* Services Offered */}
                    <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl">
                      <CardContent className="p-6">
                        <ArrayFieldManager
                          title="Services Offered"
                          items={professionalServices}
                          onChange={setProfessionalServices}
                          renderItem={(service: any, index: number) => (
                            <div>
                              <h4 className="font-semibold">{service.name}</h4>
                              <p className="text-sm text-gray-600">{service.description}</p>
                              {service.price && <p className="text-amber-600 font-medium">{service.price}</p>}
                            </div>
                          )}
                          createNewItem={() => ({ name: '', description: '', price: '' })}
                          renderForm={(item: any, onSave: (item: any) => void, onCancel: () => void) => (
                            <ServiceForm item={item} onSave={onSave} onCancel={onCancel} />
                          )}
                          itemName="Service"
                        />
                      </CardContent>
                    </Card>

                    {/* Portfolio */}
                    <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl">
                      <CardContent className="p-6">
                        <ArrayFieldManager
                          title="Portfolio"
                          items={professionalPortfolio}
                          onChange={setProfessionalPortfolio}
                          renderItem={(item: any, index: number) => (
                            <div>
                              <h4 className="font-semibold">{item.title}</h4>
                              {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
                              <p className="text-xs text-gray-500">{item.type === 'video' ? 'Video' : 'Image'}</p>
                            </div>
                          )}
                          createNewItem={() => ({ title: '', description: '', url: '', type: 'image' })}
                          renderForm={(item: any, onSave: (item: any) => void, onCancel: () => void) => (
                            <PortfolioItemForm item={item} onSave={onSave} onCancel={onCancel} />
                          )}
                          itemName="Portfolio Item"
                        />
                      </CardContent>
                    </Card>

                    {/* Form Actions */}
                    <div className="flex gap-4">
                      <Button type="submit" disabled={isLoading} className="flex-1">
                        {isLoading ? 'Creating...' : 'Create Profile'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsCreatingProfile(false)} className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Profile Actions */}
                <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">Profile Status</h3>
                        <p className="text-sm text-gray-500">
                          {professional.isActive ? 'Your profile is active and visible to the public' : 'Your profile is currently inactive'}
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <Badge variant={professional.isActive ? "default" : "secondary"} className="rounded-full">
                          {professional.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button onClick={() => professional && window.open(`/pcard/${professional.slug}`, '_blank')}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Profile
                        </Button>
                        <Button
                          variant={isEditing ? "outline" : "default"}
                          onClick={() => setIsEditing(!isEditing)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {isEditing ? (
                  <form onSubmit={handleUpdateProfessional} className="space-y-6">
                    {/* Basic Information */}
                    <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <User className="h-5 w-5 mr-2" />
                          Basic Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label>Professional Name</Label>
                            <Input name="name" defaultValue={professional.name} required className="rounded-2xl" />
                          </div>
                          <div className="space-y-2">
                            <Label>Professional Headline</Label>
                            <Input name="professionalHeadline" defaultValue={professional.professionalHeadline || ''} className="rounded-2xl" />
                          </div>
                          <div className="space-y-2">
                            <Label>About Me</Label>
                            <Textarea name="aboutMe" defaultValue={professional.aboutMe || ''} className="rounded-2xl" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Profile Picture URL</Label>
                              <Input name="profilePicture" defaultValue={professional.profilePicture || ''} className="rounded-2xl" />
                            </div>
                            <div className="space-y-2">
                              <Label>Banner Image URL</Label>
                              <Input name="banner" defaultValue={professional.banner || ''} className="rounded-2xl" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Location</Label>
                              <Input name="location" defaultValue={professional.location || ''} className="rounded-2xl" />
                            </div>
                            <div className="space-y-2">
                              <Label>Phone</Label>
                              <Input name="phone" defaultValue={professional.phone || ''} className="rounded-2xl" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Website</Label>
                              <Input name="website" defaultValue={professional.website || ''} className="rounded-2xl" />
                            </div>
                            <div className="space-y-2">
                              <Label>Email</Label>
                              <Input name="email" defaultValue={professional.email || ''} type="email" className="rounded-2xl" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Social Media */}
                    <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <GlobeIcon className="h-5 w-5 mr-2" />
                          Social Media Links
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label className="flex items-center">
                                <Facebook className="h-4 w-4 mr-2 text-amber-600" />
                              Facebook
                            </Label>
                            <Input
                              value={professionalSocialMedia.facebook}
                              onChange={(e) => setProfessionalSocialMedia(prev => ({ ...prev, facebook: e.target.value }))}
                              placeholder="https://facebook.com/username"
                              className="rounded-2xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="flex items-center">
                                <Twitter className="h-4 w-4 mr-2 text-amber-400" />
                              Twitter
                            </Label>
                            <Input
                              value={professionalSocialMedia.twitter}
                              onChange={(e) => setProfessionalSocialMedia(prev => ({ ...prev, twitter: e.target.value }))}
                              placeholder="https://twitter.com/username"
                              className="rounded-2xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="flex items-center">
                              <Instagram className="h-4 w-4 mr-2 text-pink-600" />
                              Instagram
                            </Label>
                            <Input
                              value={professionalSocialMedia.instagram}
                              onChange={(e) => setProfessionalSocialMedia(prev => ({ ...prev, instagram: e.target.value }))}
                              placeholder="https://instagram.com/username"
                              className="rounded-2xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="flex items-center">
                                <Linkedin className="h-4 w-4 mr-2 text-amber-700" />
                              LinkedIn
                            </Label>
                            <Input
                              value={professionalSocialMedia.linkedin}
                              onChange={(e) => setProfessionalSocialMedia(prev => ({ ...prev, linkedin: e.target.value }))}
                              placeholder="https://linkedin.com/in/username"
                              className="rounded-2xl"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Work Experience */}
                    <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl">
                      <CardContent className="p-6">
                        <ArrayFieldManager
                          title="Work Experience"
                          items={professionalWorkExperience}
                          onChange={setProfessionalWorkExperience}
                          renderItem={(item: any, index: number) => (
                            <div>
                              <h4 className="font-semibold">{item.position}</h4>
                              <p className="text-amber-600">{item.company}</p>
                              <p className="text-sm text-gray-600">{item.duration}</p>
                              {item.description && <p className="text-sm mt-1">{item.description}</p>}
                            </div>
                          )}
                          createNewItem={() => ({ position: '', company: '', duration: '', description: '' })}
                          renderForm={(item: any, onSave: (item: any) => void, onCancel: () => void) => (
                            <WorkExperienceForm item={item} onSave={onSave} onCancel={onCancel} />
                          )}
                          itemName="Work Experience"
                        />
                      </CardContent>
                    </Card>

                    {/* Education */}
                    <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl">
                      <CardContent className="p-6">
                        <ArrayFieldManager
                          title="Education"
                          items={professionalEducation}
                          onChange={setProfessionalEducation}
                          renderItem={(item: any, index: number) => (
                            <div>
                              <h4 className="font-semibold">{item.degree}</h4>
                              <p className="text-amber-600">{item.institution}</p>
                              <p className="text-sm text-gray-600">{item.year}</p>
                              {item.description && <p className="text-sm mt-1">{item.description}</p>}
                            </div>
                          )}
                          createNewItem={() => ({ degree: '', institution: '', year: '', description: '' })}
                          renderForm={(item: any, onSave: (item: any) => void, onCancel: () => void) => (
                            <EducationForm item={item} onSave={onSave} onCancel={onCancel} />
                          )}
                          itemName="Education"
                        />
                      </CardContent>
                    </Card>

                    {/* Skills */}
                    <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl">
                      <CardContent className="p-6">
                        <ArrayFieldManager
                          title="Skills & Expertise"
                          items={professionalSkills}
                          onChange={setProfessionalSkills}
                          renderItem={(skill: string, index: number) => (
                            <div>
                              <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-medium">
                                {skill}
                              </span>
                            </div>
                          )}
                          createNewItem={() => ''}
                          renderForm={(item: string | null, onSave: (item: string) => void, onCancel: () => void) => (
                            <SkillForm item={item} onSave={onSave} onCancel={onCancel} />
                          )}
                          itemName="Skill"
                        />
                      </CardContent>
                    </Card>

                    {/* Services Offered */}
                    <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl">
                      <CardContent className="p-6">
                        <ArrayFieldManager
                          title="Services Offered"
                          items={professionalServices}
                          onChange={setProfessionalServices}
                          renderItem={(service: any, index: number) => (
                            <div>
                              <h4 className="font-semibold">{service.name}</h4>
                              <p className="text-sm text-gray-600">{service.description}</p>
                              {service.price && <p className="text-amber-600 font-medium">{service.price}</p>}
                            </div>
                          )}
                          createNewItem={() => ({ name: '', description: '', price: '' })}
                          renderForm={(item: any, onSave: (item: any) => void, onCancel: () => void) => (
                            <ServiceForm item={item} onSave={onSave} onCancel={onCancel} />
                          )}
                          itemName="Service"
                        />
                      </CardContent>
                    </Card>

                    {/* Portfolio */}
                    <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl">
                      <CardContent className="p-6">
                        <ArrayFieldManager
                          title="Portfolio"
                          items={professionalPortfolio}
                          onChange={setProfessionalPortfolio}
                          renderItem={(item: any, index: number) => (
                            <div>
                              <h4 className="font-semibold">{item.title}</h4>
                              {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
                              <p className="text-xs text-gray-500">{item.type === 'video' ? 'Video' : 'Image'}</p>
                            </div>
                          )}
                          createNewItem={() => ({ title: '', description: '', url: '', type: 'image' })}
                          renderForm={(item: any, onSave: (item: any) => void, onCancel: () => void) => (
                            <PortfolioItemForm item={item} onSave={onSave} onCancel={onCancel} />
                          )}
                          itemName="Portfolio Item"
                        />
                      </CardContent>
                    </Card>

                    {/* Form Actions */}
                    <div className="flex gap-4">
                      <Button type="submit" disabled={isLoading} className="flex-1">
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl">
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>
                        Your professional details and contact information
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input value={professional.name} readOnly className="bg-gray-50" />
                        </div>
                        <div className="space-y-2">
                          <Label>Professional Headline</Label>
                          <Input value={professional.professionalHeadline || ''} readOnly className="bg-gray-50" />
                        </div>
                        <div className="space-y-2">
                          <Label>Location</Label>
                          <Input value={professional.location || ''} readOnly className="bg-gray-50" />
                        </div>
                        <div className="space-y-2">
                          <Label>Phone</Label>
                          <Input value={professional.phone || ''} readOnly className="bg-gray-50" />
                        </div>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input value={professional.email || ''} readOnly className="bg-gray-50" />
                        </div>
                        <div className="space-y-2">
                          <Label>Website</Label>
                          <Input value={professional.website || ''} readOnly className="bg-gray-50" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>About Me</Label>
                        <Textarea value={professional.aboutMe || ''} readOnly className="bg-gray-50 min-h-[100px]" />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        )
      case 'inquiries':
        return (
          <div className="space-y-6 pb-20 md:pb-0">
            <div className="mb-8">
              <h1 className="text-xl font-bold text-gray-900 mb-2">Client Inquiries</h1>
              <p className="text-xl text-gray-600">Manage inquiries from potential clients.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">Total Inquiries</CardTitle>
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalInquiries}</div>
                  <p className="text-xs text-gray-500">All time</p>
                </CardContent>
              </Card>
              <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">New Inquiries</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stats.newInquiries}</div>
                  <p className="text-xs text-gray-500">Requires attention</p>
                </CardContent>
              </Card>
              <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">Response Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.totalInquiries > 0 ? Math.round(((stats.totalInquiries - stats.newInquiries) / stats.totalInquiries) * 100) : 0}%
                  </div>
                  <p className="text-xs text-gray-500">Inquiries handled</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl">
              <CardContent className="p-6">
                <div className="overflow-x-auto rounded-2xl border border-gray-200">
                  <Table>
                    <TableHeader className='bg-amber-100'>
                      <TableRow>
                        <TableHead className="text-gray-900">Client</TableHead>
                        <TableHead className="text-gray-900">Message</TableHead>
                        <TableHead className="text-gray-900">Status</TableHead>
                        <TableHead className="text-gray-900">Date</TableHead>
                        <TableHead className="text-gray-900">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inquiries.map((inquiry: any) => (
                        <TableRow key={inquiry.id}>
                          <TableCell className="text-gray-900">
                            <div>
                              <div className="font-medium">{inquiry.name}</div>
                              <div className="text-sm text-gray-500">{inquiry.email}</div>
                              {inquiry.phone && (
                                <div className="text-sm text-gray-500">{inquiry.phone}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-900 max-w-xs truncate">{inquiry.message}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="rounded-full">{inquiry.status}</Badge>
                          </TableCell>
                          <TableCell className="text-gray-900">{new Date(inquiry.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-xl"
                                onClick={() => {
                                  setSelectedInquiry(inquiry)
                                  setShowInquiryDialog(true)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {inquiry.status === 'NEW' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-xl"
                                  onClick={() => handleInquiryStatusUpdate(inquiry.id, 'READ')}
                                >
                                  Mark Read
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {inquiries.length === 0 && (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No inquiries yet</h3>
                    <p className="text-gray-600">Inquiries from potential clients will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )
      case 'analytics':
        return (
          <div className="space-y-6 pb-20 md:pb-0">
            <div className="mb-8">
              <h1 className="text-xl font-bold text-gray-900 mb-2">Profile Analytics</h1>
              <p className="text-xl text-gray-600">Track your profile performance and engagement.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl">
                <CardHeader>
                  <CardTitle>Profile Views</CardTitle>
                  <CardDescription>Number of times your profile has been viewed</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.profileViews}</div>
                  <p className="text-sm text-gray-500">Analytics coming soon</p>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl">
                <CardHeader>
                  <CardTitle>Contact Requests</CardTitle>
                  <CardDescription>Inquiries received through your profile</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalInquiries}</div>
                  <p className="text-sm text-gray-500">Total inquiries received</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      case 'settings':
        return (
          <div className="space-y-6 pb-20 md:pb-0">
            <div className="mb-8">
              <h1 className="text-xl font-bold text-gray-900 mb-2">Account Settings</h1>
              <p className="text-xl text-gray-600">Manage your account preferences and security.</p>
            </div>

            <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your account details and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={user?.name || ''} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={user?.email || ''} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input value={user?.role || ''} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Member Since</Label>
                    <Input value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''} readOnly className="bg-gray-50" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      default:
        return <div>Select a menu item</div>
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen relative flex flex-col">
        <div className="fixed inset-0 bg-linear-to-b from-amber-300 to-white bg-center blur-sm -z-10"></div>
        {/* Top Header Bar */}
        <div className="bg-white border rounded-3xl mt-3 mx-3 border-gray-200 shadow-sm">
          <div className="flex justify-between items-center px-4 sm:px-6 py-2">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-2xl">
                <Skeleton className="h-8 w-8" />
              </div>
              <div>
                <Skeleton className="h-6 w-32" />
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Skeleton className="h-8 w-24 rounded-2xl hidden sm:flex" />
              <Skeleton className="h-8 w-20 rounded-2xl hidden sm:flex" />
              <div className="text-right hidden sm:block">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-8 w-8 sm:h-12 sm:w-12 rounded-2xl" />
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="flex flex-1 h-fit overflow-hidden">
          {/* Left Sidebar - Desktop Only */}
          {!isMobile && (
            <div className="w-64 m-4 border rounded-3xl bg-white border-r border-gray-200 flex flex-col shadow-sm overflow-auto hide-scrollbar">
              <div className="p-4 border-b border-gray-200 rounded-t-3xl">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-6 w-6" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <nav className="flex-1 p-4">
                <ul className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <li key={i}>
                      <div className="w-full flex items-center space-x-3 px-3 py-2 rounded-2xl">
                        <Skeleton className="h-5 w-5" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="p-4 border-t border-gray-200 mb-5 mt-auto">
                <div className="w-full flex items-center space-x-3 px-3 py-2 rounded-2xl">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
          )}

          {/* Middle Content */}
          <div className={`flex-1 m-4 rounded-3xl bg-white/50 backdrop-blur-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 ease-in-out pb-20 md:pb-0`}>
            <div className="flex-1 p-4 sm:p-6 overflow-auto hide-scrollbar">
              {renderSkeletonContent()}
            </div>
          </div>
        </div>

        {/* Inquiry Details Dialog */}
        <Dialog open={showInquiryDialog} onOpenChange={setShowInquiryDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Inquiry Details</DialogTitle>
              <DialogDescription>
                Review and respond to this client inquiry
              </DialogDescription>
            </DialogHeader>

            {selectedInquiry && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Client Name</Label>
                    <p className="text-sm text-gray-600 mt-1">{selectedInquiry.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm text-gray-600 mt-1">{selectedInquiry.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Phone</Label>
                    <p className="text-sm text-gray-600 mt-1">{selectedInquiry.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="mt-1">
                      <Badge variant="outline" className="rounded-full">{selectedInquiry.status}</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Message</Label>
                  <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{selectedInquiry.message}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Date Received</Label>
                  <p className="text-sm text-gray-600 mt-1">{new Date(selectedInquiry.createdAt).toLocaleString()}</p>
                </div>

                <div className="flex gap-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowInquiryDialog(false)
                      setSelectedInquiry(null)
                    }}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  {selectedInquiry.status === 'NEW' && (
                    <Button
                      onClick={() => {
                        handleInquiryStatusUpdate(selectedInquiry.id, 'READ')
                        setShowInquiryDialog(false)
                        setSelectedInquiry(null)
                      }}
                      className="flex-1"
                    >
                      Mark as Read
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl border-t border-gray-200 z-40">
            <div className="flex justify-around items-center py-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center justify-center py-2 px-3 rounded-xl">
                  <Skeleton className="h-5 w-5 mb-1" />
                  <Skeleton className="h-3 w-12" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (!user || user.role !== ('PROFESSIONAL_ADMIN' as UserRole)) {
    return null
  }

  return (
    <div className="max-h-screen min-h-screen relative flex flex-col">
      <div className="fixed inset-0 bg-linear-to-b from-amber-300 to-white bg-center blur-sm -z-10"></div>
      {/* Top Header Bar */}
      <div className="bg-white border rounded-3xl mt-3 mx-3 border-gray-200 shadow-sm">
        <div className="flex justify-between items-center px-3 sm:px-4 py-2">
          <div className="flex items-center">
            <img src="/logo.svg" alt="DigiSence" className="h-8 w-auto" />
            <span className="h-8 border-l border-gray-300 mx-2"></span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Professional Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.name || 'Professional'}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
            <span className="h-8 border-l border-gray-300 mx-2"></span>
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-amber-600 rounded-2xl flex items-center justify-center">
              <User className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout: Three Column Grid */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Desktop Only */}
        {!isMobile && (
          <div className="w-64 m-4 border rounded-3xl bg-white border-r border-gray-200 flex flex-col shadow-sm">
            <div className="p-4 border-b border-gray-200 rounded-t-3xl">
              <div className="flex items-center space-x-2">
                <User className="h-6 w-6" />
                <span className="font-semibold">Professional</span>
              </div>
            </div>
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.value}>
                    <button
                      onClick={() => setCurrentView(item.value)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-2xl text-left transition-colors ${currentView === item.value
                        ? 'bg-amber-100 text-amber-600'
                        : 'text-gray-700 hover:bg-amber-50'
                        }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Logout Section */}
            <div className="p-4 border-t border-gray-200 mb-5 mt-auto">
              <button
                onClick={async () => {
                  await logout()
                  router.push('/login')
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-2xl text-left transition-colors text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}

        {/* Middle Content */}
        <div className={`flex-1 m-4 rounded-3xl bg-white/50 backdrop-blur-xl border border-gray-200 shadow-sm overflow-auto hide-scrollbar transition-all duration-300 ease-in-out pb-20 md:pb-0`}>
          <div className="flex-1 p-4 sm:p-6 overflow-auto hide-scrollbar">
            {renderMiddleContent()}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <>
          {/* More Menu Overlay */}
          {showMoreMenu && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowMoreMenu(false)}>
              <div className="absolute bottom-16 left-0 right-0 bg-white rounded-t-3xl p-4" onClick={(e) => e.stopPropagation()}>
                <div className="space-y-2">
                  {menuItems.slice(3).map((item) => {
                    const MobileIcon = item.mobileIcon
                    return (
                      <button
                        key={item.value}
                        onClick={() => {
                          setCurrentView(item.value)
                          setShowMoreMenu(false)
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 ${currentView === item.value
                          ? 'bg-amber-100 text-amber-600'
                          : 'text-gray-700 hover:bg-gray-100'
                          }`}
                      >
                        <MobileIcon className="h-5 w-5" />
                        <span className="font-medium">{item.title}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Bottom Navigation Bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl border-t border-gray-200 z-40">
            <div className="flex justify-around items-center py-2">
              {menuItems.slice(0, 4).map((item) => {
                const MobileIcon = item.mobileIcon
                return (
                  <button
                    key={item.value}
                    onClick={() => setCurrentView(item.value)}
                    className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 ${currentView === item.value
                      ? 'text-amber-500'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    <MobileIcon className="h-5 w-5 mb-1" />
                    <span className="text-xs font-medium">{item.mobileTitle}</span>
                  </button>
                )
              })}
              {/* More button for additional items */}
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 ${showMoreMenu || menuItems.slice(4).some(item => item.value === currentView)
                  ? 'text-amber-500'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <MoreHorizontal className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">More</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
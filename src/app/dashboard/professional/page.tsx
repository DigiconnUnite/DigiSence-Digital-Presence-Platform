'use client'

import React, { useState, useEffect, useRef } from 'react'
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
import ImageUpload from '@/components/ui/image-upload'
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
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
  Image,
  Building2,
  GraduationCap,
  Upload,
  X
} from 'lucide-react'
import Link from 'next/link'

type ButtonVariant = "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | null | undefined;

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
  const [activeProfileTab, setActiveProfileTab] = useState('basic')

  // Professional form state
  const [professionalWorkExperience, setProfessionalWorkExperience] = useState<any[]>([])
  const [professionalEducation, setProfessionalEducation] = useState<any[]>([])
  const [professionalServices, setProfessionalServices] = useState<any[]>([])
  const [professionalPortfolio, setProfessionalPortfolio] = useState<any[]>([])
  const [professionalSocialMedia, setProfessionalSocialMedia] = useState({
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: ''
  })
  const [profilePictureUrl, setProfilePictureUrl] = useState('')
  const [bannerUrl, setBannerUrl] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  // Inline editing states for profile fields
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingHeadline, setIsEditingHeadline] = useState(false)
  const [isEditingAboutMe, setIsEditingAboutMe] = useState(false)
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [isEditingPhone, setIsEditingPhone] = useState(false)
  const [isEditingLocation, setIsEditingLocation] = useState(false)
  const [isEditingWebsite, setIsEditingWebsite] = useState(false)
  const [isEditingFacebook, setIsEditingFacebook] = useState(false)
  const [isEditingTwitter, setIsEditingTwitter] = useState(false)
  const [isEditingInstagram, setIsEditingInstagram] = useState(false)
  const [isEditingLinkedin, setIsEditingLinkedin] = useState(false)

  // Local state for editing values to prevent focus loss
  const [editingName, setEditingName] = useState('')
  const [editingHeadline, setEditingHeadline] = useState('')
  const [editingAboutMe, setEditingAboutMe] = useState('')
  const [editingEmail, setEditingEmail] = useState('')
  const [editingPhone, setEditingPhone] = useState('')
  const [editingLocation, setEditingLocation] = useState('')
  const [editingWebsite, setEditingWebsite] = useState('')
  const [editingFacebook, setEditingFacebook] = useState('')
  const [editingTwitter, setEditingTwitter] = useState('')
  const [editingInstagram, setEditingInstagram] = useState('')
  const [editingLinkedin, setEditingLinkedin] = useState('')

  // Services state
  const [services, setServices] = useState<any[]>([])
  const [isEditingServices, setIsEditingServices] = useState(false)

  // Portfolio state
  const [portfolio, setPortfolio] = useState<any[]>([])
  const [isEditingPortfolio, setIsEditingPortfolio] = useState(false)

  // Skills state - enhanced with proficiency levels
  const [skills, setSkills] = useState<Array<{ name: string, level: 'beginner' | 'intermediate' | 'expert' | 'master' }>>([])
  const [isEditingSkills, setIsEditingSkills] = useState(false)
  const [skillSearchQuery, setSkillSearchQuery] = useState('')
  const [selectedSkillCategory, setSelectedSkillCategory] = useState('all')

  // Work Experience state
  const [workExperience, setWorkExperience] = useState<any[]>([])
  const [isEditingExperience, setIsEditingExperience] = useState(false)

  // Education state
  const [education, setEducation] = useState<any[]>([])
  const [isEditingEducation, setIsEditingEducation] = useState(false)

  // Image upload modal states
  const [showProfilePictureModal, setShowProfilePictureModal] = useState(false)
  const [showBannerModal, setShowBannerModal] = useState(false)


  // Input refs for maintaining focus
  const nameInputRef = useRef<HTMLInputElement>(null)
  const headlineInputRef = useRef<HTMLInputElement>(null)
  const aboutMeInputRef = useRef<HTMLTextAreaElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const phoneInputRef = useRef<HTMLInputElement>(null)
  const locationInputRef = useRef<HTMLInputElement>(null)
  const websiteInputRef = useRef<HTMLInputElement>(null)
  const facebookInputRef = useRef<HTMLInputElement>(null)
  const twitterInputRef = useRef<HTMLInputElement>(null)
  const instagramInputRef = useRef<HTMLInputElement>(null)
  const linkedinInputRef = useRef<HTMLInputElement>(null)

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

  // Focus inputs when entering edit mode
  useEffect(() => {
    if (isEditingName) nameInputRef.current?.focus()
  }, [isEditingName])

  useEffect(() => {
    if (isEditingHeadline) headlineInputRef.current?.focus()
  }, [isEditingHeadline])

  useEffect(() => {
    if (isEditingAboutMe) aboutMeInputRef.current?.focus()
  }, [isEditingAboutMe])

  useEffect(() => {
    if (isEditingEmail) emailInputRef.current?.focus()
  }, [isEditingEmail])

  useEffect(() => {
    if (isEditingPhone) phoneInputRef.current?.focus()
  }, [isEditingPhone])

  useEffect(() => {
    if (isEditingLocation) locationInputRef.current?.focus()
  }, [isEditingLocation])

  useEffect(() => {
    if (isEditingWebsite) websiteInputRef.current?.focus()
  }, [isEditingWebsite])

  useEffect(() => {
    if (isEditingFacebook) facebookInputRef.current?.focus()
  }, [isEditingFacebook])

  useEffect(() => {
    if (isEditingTwitter) twitterInputRef.current?.focus()
  }, [isEditingTwitter])

  useEffect(() => {
    if (isEditingInstagram) instagramInputRef.current?.focus()
  }, [isEditingInstagram])

  useEffect(() => {
    if (isEditingLinkedin) linkedinInputRef.current?.focus()
  }, [isEditingLinkedin])

  const fetchProfessionalData = async () => {
    try {
      setIsLoading(true)

      // Fetch basic professional profile
      const response = await fetch('/api/professionals', { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        // Find the professional associated with this user
        const userProfessional = data.professionals.find((p: Professional) => p.adminId === user?.id)
        if (userProfessional) {
          setProfessional(userProfessional)
          setProfessionalSocialMedia({
            facebook: userProfessional.facebook || '',
            twitter: userProfessional.twitter || '',
            instagram: userProfessional.instagram || '',
            linkedin: userProfessional.linkedin || ''
          })
          setProfilePictureUrl(userProfessional.profilePicture || '')
          setBannerUrl(userProfessional.banner || '')
        }
      }

      // Fetch individual data sections
      const fetchPromises = [
        fetch('/api/professionals/experience', { cache: 'no-store' }).then(r => r.ok ? r.json() : { workExperience: [] }),
        fetch('/api/professionals/education', { cache: 'no-store' }).then(r => r.ok ? r.json() : { education: [] }),
        fetch('/api/professionals/skills', { cache: 'no-store' }).then(r => r.ok ? r.json() : { skills: [] }),
        fetch('/api/professionals/services', { cache: 'no-store' }).then(r => r.ok ? r.json() : { services: [] }),
        fetch('/api/professionals/portfolio', { cache: 'no-store' }).then(r => r.ok ? r.json() : { portfolio: [] }),
      ]

      const [experienceData, educationData, skillsData, servicesData, portfolioData] = await Promise.all(fetchPromises)

      // Load structured data into form state
      setProfessionalWorkExperience(experienceData.workExperience || [])
      setProfessionalEducation(educationData.education || [])
      // Handle skills with proficiency levels
      const processedSkills = (skillsData.skills || []).map((skill: any) => {
        if (typeof skill === 'string') {
          return { name: skill, level: 'intermediate' as const }
        }
        return skill
      })
      setSkills(processedSkills)
      setWorkExperience(experienceData.workExperience || [])
      setEducation(educationData.education || [])
      setProfessionalServices(servicesData.services || [])
      setProfessionalPortfolio(portfolioData.portfolio || [])

      // Load services and portfolio
      setServices(servicesData.services || [])
      setPortfolio(portfolioData.portfolio || [])

      // Fetch inquiries
      try {
        const inquiriesResponse = await fetch('/api/professionals/inquiries', { cache: 'no-store' })
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
      profilePicture: profilePictureUrl,
      banner: bannerUrl,
      location: formData.get('location') as string,
      phone: formData.get('phone') as string,
      website: formData.get('website') as string,
      email: formData.get('email') as string,
      facebook: professionalSocialMedia.facebook,
      twitter: professionalSocialMedia.twitter,
      instagram: professionalSocialMedia.instagram,
      linkedin: professionalSocialMedia.linkedin,
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
        // Handle skills with proficiency levels
        const processedSkills = (data.professional.skills || []).map((skill: any) => {
          if (typeof skill === 'string') {
            return { name: skill, level: 'intermediate' as const }
          }
          return skill
        })
        setSkills(processedSkills)
        setWorkExperience(data.professional.workExperience || [])
        setEducation(data.professional.education || [])
        setProfessionalServices(data.professional.servicesOffered || [])
        setProfessionalPortfolio(data.professional.portfolio || [])
        setProfessionalSocialMedia({
          facebook: data.professional.facebook || '',
          twitter: data.professional.twitter || '',
          instagram: data.professional.instagram || '',
          linkedin: data.professional.linkedin || ''
        })
        setProfilePictureUrl(data.professional.profilePicture || '')
        setBannerUrl(data.professional.banner || '')

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
      profilePicture: profilePictureUrl,
      banner: bannerUrl,
      location: formData.get('location') as string,
      phone: formData.get('phone') as string,
      website: formData.get('website') as string,
      email: formData.get('email') as string,
      facebook: professionalSocialMedia.facebook,
      twitter: professionalSocialMedia.twitter,
      instagram: professionalSocialMedia.instagram,
      linkedin: professionalSocialMedia.linkedin,
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
        setSkills(data.professional.skills || [])
        setWorkExperience(data.professional.workExperience || [])
        setEducation(data.professional.education || [])
        setProfessionalSocialMedia({
          facebook: data.professional.facebook || '',
          twitter: data.professional.twitter || '',
          instagram: data.professional.instagram || '',
          linkedin: data.professional.linkedin || ''
        })
        setProfilePictureUrl(data.professional.profilePicture || '')
        setBannerUrl(data.professional.banner || '')

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

  const handleFieldUpdate = async (field: string, value: string) => {
    if (!professional) return

    setIsLoading(true)
    const updateData = { [field]: value }

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

        toast({
          title: "Success",
          description: `${field} updated successfully!`,
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: `Failed to update ${field}: ${error.error}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Update error:', error)
      toast({
        title: "Error",
        description: `Failed to update ${field}. Please try again.`,
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
        cache: 'no-store',
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
        cache: 'no-store',
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

  const handleUpdateSkills = async () => {
    try {
      const response = await fetch('/api/professionals/skills', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ skills }),
        cache: 'no-store',
      })

      if (response.ok) {
        await fetchProfessionalData()
        setIsEditingSkills(false)
        toast({
          title: "Success",
          description: "Skills updated successfully!",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: `Failed to update skills: ${error.error}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Skills update error:', error)
      toast({
        title: "Error",
        description: "Failed to update skills. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateExperience = async () => {
    try {
      const response = await fetch('/api/professionals/experience', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workExperience }),
        cache: 'no-store',
      })

      if (response.ok) {
        await fetchProfessionalData()
        setIsEditingExperience(false)
        toast({
          title: "Success",
          description: "Work experience updated successfully!",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: `Failed to update work experience: ${error.error}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Work experience update error:', error)
      toast({
        title: "Error",
        description: "Failed to update work experience. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateEducation = async () => {
    try {
      const response = await fetch('/api/professionals/education', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ education }),
        cache: 'no-store',
      })

      if (response.ok) {
        await fetchProfessionalData()
        setIsEditingEducation(false)
        toast({
          title: "Success",
          description: "Education updated successfully!",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: `Failed to update education: ${error.error}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Education update error:', error)
      toast({
        title: "Error",
        description: "Failed to update education. Please try again.",
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
        cache: 'no-store',
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
      return renderSkeletonContent();
    }

    switch (currentView) {
      case 'overview':
        return (
          <div className="space-y-6 pb-20 md:pb-0 animate-fadeIn">
            <div className="mb-8">
              <h1 className="text-xl font-bold text-gray-900 mb-2">Professional Dashboard Overview</h1>
              <p className="text-xl text-gray-600">Welcome back! Here's your professional profile overview.</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Profile Views"
                value="0"
                subtitle="This month"
                icon={<Eye className="h-4 w-4 text-gray-400" />}
              />
              <StatCard
                title="Profile Status"
                value={professional?.isActive ? 'Active' : 'Inactive'}
                subtitle="Current status"
                icon={<UserCheck className="h-4 w-4 text-gray-400" />}
              />
              <StatCard
                title="Profile URL"
                value={professional ? `/pcard/${professional.slug}` : 'Not set'}
                subtitle="Your public profile"
                icon={<Globe className="h-4 w-4 text-gray-400" />}
                truncate
              />
              <StatCard
                title="Platform Health"
                value="Good"
                subtitle="System status"
                icon={<Activity className="h-4 w-4 text-gray-400" />}
              />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ActionCard
                title="View My Profile"
                description="See how your professional profile appears to visitors"
                icon={<Eye className="h-5 w-5" />}
                buttonText="View Public Profile"
                buttonAction={() => professional && window.open(`/pcard/${professional.slug}`, '_blank')}
                disabled={!professional}
              />
              <ActionCard
                title="Edit Profile"
                description="Update your professional information and portfolio"
                icon={<Edit className="h-5 w-5" />}
                buttonText="Edit Profile"
                buttonAction={() => setCurrentView('profile')}
                variant="outline"
              />
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6 pb-20 md:pb-0 animate-fadeIn">
            <div className="mb-8">
              <h1 className="text-xl font-bold text-gray-900 mb-2">My Professional Profile</h1>
              <p className="text-xl text-gray-600">Manage your professional information and portfolio.</p>
            </div>

            {!professional ? (
              <CreateProfileView
                isCreatingProfile={isCreatingProfile}
                setIsCreatingProfile={setIsCreatingProfile}
                handleCreateProfessional={handleCreateProfessional}
                professionalSocialMedia={professionalSocialMedia}
                setProfessionalSocialMedia={setProfessionalSocialMedia}
                profilePictureUrl={profilePictureUrl}
                setProfilePictureUrl={setProfilePictureUrl}
                bannerUrl={bannerUrl}
                setBannerUrl={setBannerUrl}
                isLoading={isLoading}
              />
            ) : (
              <div className="space-y-6">
                {/* Header Section with Profile Completion */}
                <Card className="bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 shadow-lg rounded-3xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                      <div className="flex items-start gap-4">
                        {/* Profile Completion Indicator */}
                        <div className="shrink-0 relative">
                          <div className="w-24 h-24 rounded-full bg-white border-4 border-amber-200 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-lg font-bold text-amber-600">
                                {Math.round(((skills.length > 0 ? 1 : 0) + (workExperience.length > 0 ? 1 : 0) + (education.length > 0 ? 1 : 0) + (services.length > 0 ? 1 : 0) + (portfolio.length > 0 ? 1 : 0) + (professional.aboutMe ? 1 : 0) + (professional.profilePicture ? 1 : 0)) / 7 * 100)}%
                              </div>
                              <div className="text-xs text-gray-500">Complete</div>
                            </div>
                          </div>
                          <div className="absolute -top-1 -right-1">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${professional.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                              {professional.isActive ? <UserCheck className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">Profile Status</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {professional.isActive ? 'Your profile is live and visible to potential clients' : 'Complete your profile to go live'}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={professional.isActive ? "default" : "secondary"} className="rounded-full px-3 py-1">
                              {professional.isActive ? 'Live' : 'Draft'}
                            </Badge>
                            {professional.isActive && (
                              <span className="text-xs text-gray-500">Last updated: {new Date(professional.updatedAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 flex-wrap">
                        <Button
                          variant="outline"
                          onClick={() => professional && window.open(`/pcard/${professional.slug}`, '_blank')}
                          className="rounded-xl border-amber-300 hover:bg-amber-50"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Public Profile
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(!isEditing)}
                          className="rounded-xl"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tab-based Navigation */}
                <Tabs value={activeProfileTab} onValueChange={setActiveProfileTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 rounded-2xl bg-gray-100 p-1">
                    <TabsTrigger value="basic" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      <User className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Basic Info</span>
                      <span className="sm:hidden">Basic</span>
                    </TabsTrigger>
                    <TabsTrigger value="skills" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      <Crown className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Skills</span>
                    </TabsTrigger>
                    <TabsTrigger value="experience" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      <Briefcase className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Experience</span>
                    </TabsTrigger>
                    <TabsTrigger value="education" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Education</span>
                    </TabsTrigger>
                    <TabsTrigger value="services" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      <Package className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Services</span>
                    </TabsTrigger>
                    <TabsTrigger value="portfolio" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      <Image className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Portfolio</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Basic Profile Information Tab */}
                  <TabsContent value="basic" className="mt-6">
                    <div className="space-y-6">
                      <ProfileInfoCard professional={professional} />
                    </div>
                  </TabsContent>

                  {/* Skills & Expertise Tab */}
                  <TabsContent value="skills" className="mt-6">
                    <Card className="bg-white border border-gray-200 shadow-lg rounded-3xl overflow-hidden hover:shadow-xl p-0 transition-shadow duration-300">
                      <CardHeader className="bg-linear-to-r from-blue-50 pt-5 to-indigo-50 border-b border-gray-100">
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                              <Crown className="h-4 w-4 text-amber-600" />
                            </div>
                            <span className="text-lg font-semibold text-gray-900">Skills & Expertise</span>
                            {skills.length > 0 && (
                              <Badge variant="secondary" className="rounded-full px-2 py-1 text-xs">
                                {skills.length}
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditingSkills(!isEditingSkills)}
                            className="rounded-xl border-gray-300 hover:border-amber-300 hover:bg-amber-50 transition-colors"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            {isEditingSkills ? 'Cancel' : 'Manage Skills'}
                          </Button>
                        </CardTitle>
                      </CardHeader>
                        <CardContent className="p-6">
                          {isEditingSkills ? (
                            <div className="space-y-6 animate-fadeIn">
                              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                                <p className="text-sm text-amber-800">
                                  <Edit className="h-4 w-4 inline mr-2" />
                                  You're now managing your skills. Add, edit, or remove skills below.
                                </p>
                              </div>

                              {/* Skills Management Interface */}
                              <div className="space-y-6">
                                {/* Search and Filter */}
                                <div className="flex flex-col sm:flex-row gap-4">
                                  <div className="flex-1">
                                    <Input
                                      placeholder="Search skills..."
                                      value={skillSearchQuery}
                                      onChange={(e) => setSkillSearchQuery(e.target.value)}
                                      className="rounded-xl"
                                    />
                                  </div>
                                  <Select value={selectedSkillCategory} onValueChange={setSelectedSkillCategory}>
                                    <SelectTrigger className="w-full sm:w-48 rounded-xl">
                                      <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="all">All Categories</SelectItem>
                                      <SelectItem value="technical">Technical</SelectItem>
                                      <SelectItem value="design">Design</SelectItem>
                                      <SelectItem value="business">Business</SelectItem>
                                      <SelectItem value="soft">Soft Skills</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* Current Skills Grid */}
                                <div className="space-y-4">
                                  <h4 className="font-medium text-gray-900">Your Skills</h4>
                                  {skills.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                      {skills
                                        .filter(skill =>
                                          skill.name.toLowerCase().includes(skillSearchQuery.toLowerCase())
                                        )
                                        .map((skill, index) => {
                                          const levelColors = {
                                            beginner: 'from-gray-100 to-gray-200 text-gray-800 border-gray-300 hover:shadow-gray-200',
                                            intermediate: 'from-blue-100 to-blue-200 text-blue-800 border-blue-300 hover:shadow-blue-200',
                                            expert: 'from-purple-100 to-purple-200 text-purple-800 border-purple-300 hover:shadow-purple-200',
                                            master: 'from-amber-100 to-orange-100 text-amber-800 border-amber-300 hover:shadow-amber-200'
                                          }
                                          const levelLabels = {
                                            beginner: 'Beginner',
                                            intermediate: 'Intermediate',
                                            expert: 'Expert',
                                            master: 'Master'
                                          }
                                          return (
                                            <div
                                              key={index}
                                              className={`group relative p-3 rounded-xl bg-linear-to-r ${levelColors[skill.level]} border hover:shadow-md transition-all duration-200 cursor-pointer`}
                                            >
                                              <div className="flex items-center justify-between">
                                                <span className="font-medium text-sm">{skill.name}</span>
                                                <div className="flex items-center gap-2">
                                                  <span className="text-xs opacity-75">
                                                    {levelLabels[skill.level]}
                                                  </span>
                                                  <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => {
                                                      const newSkills = skills.filter((_, i) => i !== index)
                                                      setSkills(newSkills)
                                                    }}
                                                  >
                                                    <X className="h-3 w-3" />
                                                  </Button>
                                                </div>
                                              </div>
                                            </div>
                                          )
                                        })}
                                    </div>
                                  ) : (
                                    <div className="text-center py-8 text-gray-500">
                                      No skills added yet. Add your first skill below.
                                    </div>
                                  )}
                                </div>

                                {/* Add New Skill */}
                                <ArrayFieldManager
                                  title=""
                                  items={skills}
                                  onChange={setSkills}
                                  renderItem={() => null}
                                  createNewItem={() => ({ name: '', level: 'intermediate' as const })}
                                  renderForm={(item, onSave, onCancel) => (
                                    <SkillForm item={item} onSave={onSave} onCancel={onCancel} />
                                  )}
                                  itemName="Skill"
                                />
                              </div>

                              <div className="flex gap-4 pt-4 border-t border-gray-100">
                                <Button onClick={handleUpdateSkills} className="flex-1 rounded-xl">
                                  <Edit className="h-4 w-4 mr-2" />
                                  Save Skills
                                </Button>
                                <Button variant="outline" onClick={() => setIsEditingSkills(false)} className="flex-1 rounded-xl">
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="animate-fadeIn">
                              {skills.length > 0 ? (
                                <div className="space-y-6">
                                  {/* Skills Cloud Visualization */}
                                  <div className="space-y-4">
                                    <h4 className="font-medium text-gray-900">Skills Overview</h4>
                                    <div className="flex flex-wrap gap-3">
                                      {skills.map((skill, index) => {
                                        const levelColors = {
                                          beginner: 'from-gray-100 to-gray-200 text-gray-800 border-gray-300',
                                          intermediate: 'from-blue-100 to-blue-200 text-blue-800 border-blue-300',
                                          expert: 'from-purple-100 to-purple-200 text-purple-800 border-purple-300',
                                          master: 'from-amber-100 to-orange-100 text-amber-800 border-amber-300'
                                        }
                                        const levelSizes = {
                                          beginner: 'text-sm px-3 py-2',
                                          intermediate: 'text-sm px-4 py-2',
                                          expert: 'text-base px-4 py-2',
                                          master: 'text-base px-5 py-3'
                                        }
                                        return (
                                          <span
                                            key={index}
                                            className={`inline-flex items-center rounded-full bg-linear-to-r ${levelColors[skill.level]} ${levelSizes[skill.level]} font-medium border hover:shadow-md transition-all duration-200`}
                                          >
                                            {skill.name}
                                          </span>
                                        )
                                      })}
                                    </div>
                                  </div>

                                  {/* Skills by Proficiency Level */}
                                  <div className="space-y-4">
                                    <h4 className="font-medium text-gray-900">Skills by Proficiency</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {(['master', 'expert', 'intermediate', 'beginner'] as const).map(level => {
                                        const levelSkills = skills.filter(skill => skill.level === level)
                                        if (levelSkills.length === 0) return null

                                        const levelLabels = {
                                          beginner: 'Beginner',
                                          intermediate: 'Intermediate',
                                          expert: 'Expert',
                                          master: 'Master'
                                        }
                                        const levelColors = {
                                          beginner: 'text-gray-600',
                                          intermediate: 'text-blue-600',
                                          expert: 'text-purple-600',
                                          master: 'text-amber-600'
                                        }

                                        return (
                                          <div key={level} className="bg-gray-50 rounded-xl p-4">
                                            <h5 className={`font-medium mb-3 ${levelColors[level]}`}>
                                              {levelLabels[level]} ({levelSkills.length})
                                            </h5>
                                            <div className="flex flex-wrap gap-2">
                                              {levelSkills.map((skill, index) => (
                                                <span
                                                  key={index}
                                                  className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border border-gray-200"
                                                >
                                                  {skill.name}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center py-12">
                                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                    <Crown className="h-8 w-8 text-gray-400" />
                                  </div>
                                  <h3 className="text-lg font-medium text-gray-900 mb-2">No skills yet</h3>
                                  <p className="text-gray-500 mb-4">Showcase your skills and expertise to attract clients.</p>
                                  <Button
                                    variant="outline"
                                    onClick={() => setIsEditingSkills(true)}
                                    className="rounded-xl border-dashed border-2 border-gray-300 hover:border-amber-300 hover:bg-amber-50"
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Your First Skill
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                  </TabsContent>

                  {/* Work Experience Tab */}
                  <TabsContent value="experience" className="mt-6">
                    <ProfileSectionCard
                      title="Work Experience"
                      items={workExperience}
                      isEditing={isEditingExperience}
                      setIsEditing={setIsEditingExperience}
                      handleUpdate={handleUpdateExperience}
                      emptyMessage="Add your professional experience to build credibility."
                      renderItem={(item) => (
                        <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-4">
                            <div className="shrink-0">
                              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-blue-600" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 text-lg">{item.position}</h4>
                              <p className="text-blue-600 font-medium text-sm mb-1">{item.company}</p>
                              <p className="text-sm text-gray-600 mb-2">{item.duration}</p>
                              {item.description && (
                                <p className="text-gray-700 text-sm leading-relaxed">{item.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      formComponent={WorkExperienceForm}
                      itemName="Work Experience"
                      setItems={setWorkExperience}
                      icon={Briefcase}
                    />
                  </TabsContent>

                  {/* Education Tab */}
                  <TabsContent value="education" className="mt-6">
                    <ProfileSectionCard
                      title="Education"
                      items={education}
                      isEditing={isEditingEducation}
                      setIsEditing={setIsEditingEducation}
                      handleUpdate={handleUpdateEducation}
                      emptyMessage="Highlight your educational background and qualifications."
                      renderItem={(item) => (
                        <div className="bg-linear-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100 hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-4">
                            <div className="shrink-0">
                              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                <GraduationCap className="h-5 w-5 text-green-600" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 text-lg">{item.degree}</h4>
                              <p className="text-green-600 font-medium text-sm mb-1">{item.institution}</p>
                              <p className="text-sm text-gray-600 mb-2">{item.year}</p>
                              {item.description && (
                                <p className="text-gray-700 text-sm leading-relaxed">{item.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      formComponent={EducationForm}
                      itemName="Education"
                      setItems={setEducation}
                      icon={GraduationCap}
                    />
                  </TabsContent>

                  {/* Services Offered Tab */}
                  <TabsContent value="services" className="mt-6">
                    <ProfileSectionCard
                      title="Services Offered"
                      items={services}
                      isEditing={isEditingServices}
                      setIsEditing={setIsEditingServices}
                      handleUpdate={handleUpdateServices}
                      emptyMessage="Define your services to attract potential clients."
                      renderItem={(service) => (
                        <div className="bg-linear-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100 hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-4">
                            <div className="shrink-0">
                              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                <Users className="h-5 w-5 text-purple-600" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 text-lg">{service.name}</h4>
                              <p className="text-gray-700 text-sm leading-relaxed mb-2">{service.description}</p>
                              {service.price && (
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-sm font-semibold">
                                  {service.price}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      formComponent={ServiceForm}
                      itemName="Service"
                      setItems={setServices}
                      icon={Package}
                    />
                  </TabsContent>

                  {/* Portfolio Tab */}
                  <TabsContent value="portfolio" className="mt-6">
                    <ProfileSectionCard
                      title="Portfolio"
                      items={portfolio}
                      isEditing={isEditingPortfolio}
                      setIsEditing={setIsEditingPortfolio}
                      handleUpdate={handleUpdatePortfolio}
                      emptyMessage="Showcase your work with photos and videos."
                      renderGrid={true}
                      renderItem={(item) => (
                        <div className="group relative rounded-xl overflow-hidden shadow-lg aspect-square hover:shadow-xl transition-all duration-300">
                          <img
                            src={item.url}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2">
                              <p className="text-sm font-medium text-gray-900">{item.title}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      formComponent={PortfolioItemForm}
                      itemName="Portfolio Item"
                      setItems={setPortfolio}
                      icon={Image}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        );

      case 'inquiries':
        return (
          <div className="space-y-6 pb-20 md:pb-0 animate-fadeIn">
            <div className="mb-8">
              <h1 className="text-xl font-bold text-gray-900 mb-2">Client Inquiries</h1>
              <p className="text-xl text-gray-600">Manage inquiries from potential clients.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard
                title="Total Inquiries"
                value={stats.totalInquiries}
                subtitle="All time"
                icon={<MessageSquare className="h-4 w-4 text-gray-400" />}
              />
              <StatCard
                title="New Inquiries"
                value={stats.newInquiries}
                subtitle="Requires attention"
                icon={<AlertTriangle className="h-4 w-4 text-gray-400" />}
              />
              <StatCard
                title="Response Rate"
                value={`${stats.totalInquiries > 0 ? Math.round(((stats.totalInquiries - stats.newInquiries) / stats.totalInquiries) * 100) : 0}%`}
                subtitle="Inquiries handled"
                icon={<TrendingUp className="h-4 w-4 text-gray-400" />}
              />
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
        );

      case 'analytics':
        return (
          <div className="space-y-6 pb-20 md:pb-0 animate-fadeIn">
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
        );

      case 'settings':
        return (
          <div className="space-y-6 pb-20 md:pb-0 animate-fadeIn">
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
        );

      default:
        return <div>Select a menu item</div>;
    }
  };

  // Reusable Components

  const StatCard = ({ title, value, subtitle, icon, truncate = false }) => (
    <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl transition-all duration-300 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-900">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold text-gray-900 ${truncate ? 'truncate' : ''}`}>{value}</div>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </CardContent>
    </Card>
  );

  const ActionCard = ({ title, description, icon, buttonText, buttonAction, disabled = false, variant = "default" }: { title: string, description: string, icon: any, buttonText: string, buttonAction: () => void, disabled?: boolean, variant?: ButtonVariant }) => (
    <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          className="w-full"
          variant={variant}
          onClick={buttonAction}
          disabled={disabled}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );

  const CreateProfileView = ({
    isCreatingProfile,
    setIsCreatingProfile,
    handleCreateProfessional,
    professionalSocialMedia,
    setProfessionalSocialMedia,
    profilePictureUrl,
    setProfilePictureUrl,
    bannerUrl,
    setBannerUrl,
    isLoading
  }) => (
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Profile Picture</Label>
                    <ImageUpload
                      onUpload={setProfilePictureUrl}
                      className="max-w-md"
                      uploadUrl="/api/professionals/upload"
                      uploadType="profile"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Banner Image</Label>
                    <ImageUpload
                      onUpload={setBannerUrl}
                      className="max-w-md"
                      uploadUrl="/api/professionals/upload"
                      uploadType="banner"
                    />
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
  );

  const EditProfileForm = ({
    professional,
    handleUpdateProfessional,
    professionalSocialMedia,
    setProfessionalSocialMedia,
    profilePictureUrl,
    setProfilePictureUrl,
    bannerUrl,
    setBannerUrl,
    professionalServices,
    setProfessionalServices,
    professionalPortfolio,
    setProfessionalPortfolio,
    isLoading
  }) => (
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Profile Picture</Label>
                <ImageUpload
                  onUpload={setProfilePictureUrl}
                  className="max-w-md"
                  uploadUrl="/api/professionals/upload"
                  uploadType="profile"
                />
                {profilePictureUrl && (
                  <p className="text-sm text-gray-600">Current: {profilePictureUrl}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Banner Image</Label>
                <ImageUpload
                  onUpload={setBannerUrl}
                  className="max-w-md"
                  uploadUrl="/api/professionals/upload"
                  uploadType="banner"
                />
                {bannerUrl && (
                  <p className="text-sm text-gray-600">Current: {bannerUrl}</p>
                )}
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
  );
  const ProfileInfoCard = ({ professional }) => {
    // Add state variables for tracking editing state
    const [isEditingName, setIsEditingName] = useState(false);
    const [editingName, setEditingName] = useState('');
    const nameInputRef = useRef(null);

    const [isEditingHeadline, setIsEditingHeadline] = useState(false);
    const [editingHeadline, setEditingHeadline] = useState('');
    const headlineInputRef = useRef(null);

    const [isEditingAboutMe, setIsEditingAboutMe] = useState(false);
    const [editingAboutMe, setEditingAboutMe] = useState('');
    const aboutMeInputRef = useRef(null);

    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [editingEmail, setEditingEmail] = useState('');
    const emailInputRef = useRef(null);

    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [editingPhone, setEditingPhone] = useState('');
    const phoneInputRef = useRef(null);

    const [isEditingLocation, setIsEditingLocation] = useState(false);
    const [editingLocation, setEditingLocation] = useState('');
    const locationInputRef = useRef(null);

    const [isEditingWebsite, setIsEditingWebsite] = useState(false);
    const [editingWebsite, setEditingWebsite] = useState('');
    const websiteInputRef = useRef(null);

    const [isEditingFacebook, setIsEditingFacebook] = useState(false);
    const [editingFacebook, setEditingFacebook] = useState('');
    const facebookInputRef = useRef(null);

    const [isEditingTwitter, setIsEditingTwitter] = useState(false);
    const [editingTwitter, setEditingTwitter] = useState('');
    const twitterInputRef = useRef(null);

    const [isEditingInstagram, setIsEditingInstagram] = useState(false);
    const [editingInstagram, setEditingInstagram] = useState('');
    const instagramInputRef = useRef(null);

    const [isEditingLinkedin, setIsEditingLinkedin] = useState(false);
    const [editingLinkedin, setEditingLinkedin] = useState('');
    const linkedinInputRef = useRef(null);


    return (
      <Card className="bg-white border border-gray-200 shadow-lg rounded-3xl overflow-hidden hover:shadow-xl p-0 transition-shadow duration-300">
        <CardHeader className="bg-linear-to-r from-blue-50 pt-5 to-indigo-50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl text-gray-900">Basic Profile Information</CardTitle>
              <CardDescription className="text-gray-600">
                Your professional details and contact information
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-sm font-semibold text-gray-700">Banner Image</Label>
                <div className="relative group cursor-pointer" onClick={() => setShowBannerModal(true)}>
                  <div className="w-full aspect-3/1 rounded-xl overflow-hidden border-4 border-white shadow-lg">
                    {professional.banner ? (
                      <img
                        src={professional.banner}
                        alt="Profile banner"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                        <Image className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  {/* Small edit icon in top corner */}
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Edit className="h-3 w-3 text-gray-700" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center">Recommended dimensions: 1200x300px • Click to edit</p>
              </div>

              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="shrink-0 flex flex-col items-center space-y-2 mt-6 md:mt-0">
                  <div className="relative group cursor-pointer" onClick={() => setShowProfilePictureModal(true)}>
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                      {professional.profilePicture ? (
                        <img
                          src={professional.profilePicture}
                          alt={professional.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <User className="h-10 w-10 text-gray-400" />
                        </div>
                      )}
                    </div>
                    {/* Small edit icon in top corner */}
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Edit className="h-3 w-3 text-gray-700" />
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  {/* Professional Name */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <User className="h-5 w-5 text-gray-400 shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Name</p>
                        {isEditingName ? (
                          <Input
                            key="name-input"
                            ref={nameInputRef}
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="mt-1"
                            autoFocus
                          />
                        ) : (
                          <p className="text-md text-gray-900 font-medium ">{professional.name || 'Not provided'}</p>
                        )}
                      </div>
                      {isEditingName ? (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => { handleFieldUpdate('name', editingName); setIsEditingName(false); }}>
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setIsEditingName(false)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="ghost" className="rounded-xl shrink-0" onClick={() => { setEditingName(professional.name || ''); setIsEditingName(true); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {/* Professional Headline */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <Edit className="h-5 w-5 text-gray-400 shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Headline</p>
                        {isEditingHeadline ? (
                          <Input
                            key="headline-input"
                            ref={headlineInputRef}
                            value={editingHeadline}
                            onChange={(e) => setEditingHeadline(e.target.value)}
                            className="mt-1"
                            autoFocus
                          />
                        ) : (
                          <p className="text-md text-amber-600 font-medium">{professional.professionalHeadline || 'Not provided'}</p>
                        )}
                      </div>
                      {isEditingHeadline ? (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => { handleFieldUpdate('professionalHeadline', editingHeadline); setIsEditingHeadline(false); }}>
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setIsEditingHeadline(false)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="ghost" className="rounded-xl shrink-0" onClick={() => { setEditingHeadline(professional.professionalHeadline || ''); setIsEditingHeadline(true); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* About Me - Fifth */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">About Me</Label>
                {isEditingAboutMe ? (
                  <Textarea
                    key="aboutme-input"
                    ref={aboutMeInputRef}
                    value={editingAboutMe}
                    onChange={(e) => setEditingAboutMe(e.target.value)}
                    placeholder="Tell clients about yourself, your experience, and what makes you unique..."
                    className="rounded-xl border-gray-200 min-h-[120px] leading-relaxed"
                    autoFocus
                  />
                ) : (
                  <Textarea
                    value={professional.aboutMe || ''}
                    readOnly
                    placeholder="Tell clients about yourself, your experience, and what makes you unique..."
                    className="rounded-xl bg-gray-50 border-gray-200 min-h-[120px] leading-relaxed"
                  />
                )}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {professional.aboutMe ? `${professional.aboutMe.length} characters` : '0 characters'}
                  </span>
                  {isEditingAboutMe ? (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => { handleFieldUpdate('aboutMe', editingAboutMe); setIsEditingAboutMe(false); }}>
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setIsEditingAboutMe(false)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="ghost" className="rounded-xl" onClick={() => { setEditingAboutMe(professional.aboutMe || ''); setIsEditingAboutMe(true); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Contact Information and Social Links */}
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <Label className="text-sm font-semibold text-gray-700">Contact Information</Label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Mail className="h-5 w-5 text-gray-400 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                      {isEditingEmail ? (
                        <Input
                          key="email-input"
                          ref={emailInputRef}
                          type="email"
                          value={editingEmail}
                          onChange={(e) => setEditingEmail(e.target.value)}
                          className="mt-1"
                          autoFocus
                        />
                      ) : (
                        <p className="text-sm text-gray-900">{professional.email || 'Not provided'}</p>
                      )}
                    </div>
                    {isEditingEmail ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => { handleFieldUpdate('email', editingEmail); setIsEditingEmail(false); }}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setIsEditingEmail(false)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="ghost" className="rounded-xl shrink-0" onClick={() => { setEditingEmail(professional.email || ''); setIsEditingEmail(true); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Phone className="h-5 w-5 text-gray-400 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
                      {isEditingPhone ? (
                        <Input
                          key="phone-input"
                          ref={phoneInputRef}
                          value={editingPhone}
                          onChange={(e) => setEditingPhone(e.target.value)}
                          className="mt-1"
                          autoFocus
                        />
                      ) : (
                        <p className="text-sm text-gray-900">{professional.phone || 'Not provided'}</p>
                      )}
                    </div>
                    {isEditingPhone ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => { handleFieldUpdate('phone', editingPhone); setIsEditingPhone(false); }}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setIsEditingPhone(false)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="ghost" className="rounded-xl shrink-0" onClick={() => { setEditingPhone(professional.phone || ''); setIsEditingPhone(true); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <MapPin className="h-5 w-5 text-gray-400 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Location</p>
                      {isEditingLocation ? (
                        <Input
                          key="location-input"
                          ref={locationInputRef}
                          value={editingLocation}
                          onChange={(e) => setEditingLocation(e.target.value)}
                          className="mt-1"
                          autoFocus
                        />
                      ) : (
                        <p className="text-sm text-gray-900">{professional.location || 'Not provided'}</p>
                      )}
                    </div>
                    {isEditingLocation ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => { handleFieldUpdate('location', editingLocation); setIsEditingLocation(false); }}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setIsEditingLocation(false)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="ghost" className="rounded-xl shrink-0" onClick={() => { setEditingLocation(professional.location || ''); setIsEditingLocation(true); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Globe className="h-5 w-5 text-gray-400 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Website</p>
                      {isEditingWebsite ? (
                        <Input
                          key="website-input"
                          ref={websiteInputRef}
                          value={editingWebsite}
                          onChange={(e) => setEditingWebsite(e.target.value)}
                          className="mt-1"
                          autoFocus
                        />
                      ) : (
                        <p className="text-sm text-gray-900">
                          {professional.website ? (
                            <a href={professional.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {professional.website}
                            </a>
                          ) : (
                            'Not provided'
                          )}
                        </p>
                      )}
                    </div>
                    {isEditingWebsite ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => { handleFieldUpdate('website', editingWebsite); setIsEditingWebsite(false); }}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setIsEditingWebsite(false)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="ghost" className="rounded-xl shrink-0" onClick={() => { setEditingWebsite(professional.website || ''); setIsEditingWebsite(true); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="space-y-4">
                <Label className="text-sm font-semibold text-gray-700">Social Media Links</Label>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Facebook className="h-5 w-5 text-blue-600 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Facebook</p>
                      {isEditingFacebook ? (
                        <Input
                          key="facebook-input"
                          ref={facebookInputRef}
                          value={editingFacebook}
                          onChange={(e) => setEditingFacebook(e.target.value)}
                          placeholder="https://facebook.com/username"
                          className="mt-1"
                          autoFocus
                        />
                      ) : (
                        <p className="text-sm text-gray-900">
                          {professional.facebook ? (
                            <a href={professional.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              Connected
                            </a>
                          ) : (
                            'Not connected'
                          )}
                        </p>
                      )}
                    </div>
                    {isEditingFacebook ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => { handleFieldUpdate('facebook', editingFacebook); setIsEditingFacebook(false); }}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setIsEditingFacebook(false)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="ghost" className="rounded-xl shrink-0" onClick={() => { setEditingFacebook(professional.facebook || ''); setIsEditingFacebook(true); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Twitter className="h-5 w-5 text-sky-500 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Twitter</p>
                      {isEditingTwitter ? (
                        <Input
                          key="twitter-input"
                          ref={twitterInputRef}
                          value={editingTwitter}
                          onChange={(e) => setEditingTwitter(e.target.value)}
                          placeholder="https://twitter.com/username"
                          className="mt-1"
                          autoFocus
                        />
                      ) : (
                        <p className="text-sm text-gray-900">
                          {professional.twitter ? (
                            <a href={professional.twitter} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">
                              Connected
                            </a>
                          ) : (
                            'Not connected'
                          )}
                        </p>
                      )}
                    </div>
                    {isEditingTwitter ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => { handleFieldUpdate('twitter', editingTwitter); setIsEditingTwitter(false); }}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setIsEditingTwitter(false)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="ghost" className="rounded-xl shrink-0" onClick={() => { setEditingTwitter(professional.twitter || ''); setIsEditingTwitter(true); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Instagram className="h-5 w-5 text-pink-600 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Instagram</p>
                      {isEditingInstagram ? (
                        <Input
                          key="instagram-input"
                          ref={instagramInputRef}
                          value={editingInstagram}
                          onChange={(e) => setEditingInstagram(e.target.value)}
                          placeholder="https://instagram.com/username"
                          className="mt-1"
                          autoFocus
                        />
                      ) : (
                        <p className="text-sm text-gray-900">
                          {professional.instagram ? (
                            <a href={professional.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:underline">
                              Connected
                            </a>
                          ) : (
                            'Not connected'
                          )}
                        </p>
                      )}
                    </div>
                    {isEditingInstagram ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => { handleFieldUpdate('instagram', editingInstagram); setIsEditingInstagram(false); }}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setIsEditingInstagram(false)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="ghost" className="rounded-xl shrink-0" onClick={() => { setEditingInstagram(professional.instagram || ''); setIsEditingInstagram(true); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Linkedin className="h-5 w-5 text-blue-700 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">LinkedIn</p>
                      {isEditingLinkedin ? (
                        <Input
                          key="linkedin-input"
                          ref={linkedinInputRef}
                          value={editingLinkedin}
                          onChange={(e) => setEditingLinkedin(e.target.value)}
                          placeholder="https://linkedin.com/in/username"
                          className="mt-1"
                          autoFocus
                        />
                      ) : (
                        <p className="text-sm text-gray-900">
                          {professional.linkedin ? (
                            <a href={professional.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">
                              Connected
                            </a>
                          ) : (
                            'Not connected'
                          )}
                        </p>
                      )}
                    </div>
                    {isEditingLinkedin ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => { handleFieldUpdate('linkedin', editingLinkedin); setIsEditingLinkedin(false); }}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setIsEditingLinkedin(false)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="ghost" className="rounded-xl shrink-0" onClick={() => { setEditingLinkedin(professional.linkedin || ''); setIsEditingLinkedin(true); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <Button variant="outline" className="w-full rounded-xl mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add More Social Links
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ProfileSectionCard = ({
    title,
    items,
    isEditing,
    setIsEditing,
    handleUpdate,
    emptyMessage,
    renderItem,
    renderGrid = false,
    formComponent,
    itemName,
    setItems,
    icon: IconComponent
  }) => (
    <Card className="bg-white border border-gray-200 shadow-lg rounded-3xl overflow-hidden hover:shadow-xl p-0 transition-shadow duration-300">
      <CardHeader className="bg-linear-to-r from-blue-50 pt-5 to-indigo-50 border-b border-gray-100">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {IconComponent && (
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                <IconComponent className="h-4 w-4 text-amber-600" />
              </div>
            )}
            <span className="text-lg font-semibold text-gray-900">{title}</span>
            {items.length > 0 && (
              <Badge variant="secondary" className="rounded-full px-2 py-1 text-xs">
                {items.length}
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="rounded-xl border-gray-300 hover:border-amber-300 hover:bg-amber-50 transition-colors"
          >
            <Edit className="h-4 w-4 mr-2" />
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isEditing ? (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-sm text-amber-800">
                <Edit className="h-4 w-4 inline mr-2" />
                You're now editing {title.toLowerCase()}. Add, edit, or remove items below.
              </p>
            </div>
            <ArrayFieldManager
              title=""
              items={items}
              onChange={setItems}
              renderItem={renderItem}
              createNewItem={() => ({})}
              renderForm={(item, onSave, onCancel) => React.createElement(formComponent, { item, onSave, onCancel })}
              itemName={itemName}
            />
            <div className="flex gap-4 pt-4 border-t border-gray-100">
              <Button onClick={handleUpdate} className="flex-1 rounded-xl">
                <Edit className="h-4 w-4 mr-2" />
                Save {title}
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1 rounded-xl">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
            <div className="animate-fadeIn">
              {renderGrid ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.length > 0 ? (
                    items.map((item: any, index: number) => (
                      <div key={index} className="transform hover:scale-105 transition-transform duration-200">
                        {renderItem(item, index)}
                      </div>
                    ))
                  ) : (
                      <div className="col-span-full text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                          {IconComponent ? <IconComponent className="h-8 w-8 text-gray-400" /> : <Plus className="h-8 w-8 text-gray-400" />}
                        </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No {title.toLowerCase()} yet</h3>
                      <p className="text-gray-500 mb-4">{emptyMessage}</p>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(true)}
                        className="rounded-xl border-dashed border-2 border-gray-300 hover:border-amber-300 hover:bg-amber-50"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First {itemName}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {items.length > 0 ? (
                    items.map((item: any, index: number) => (
                      <div key={index} className="transform hover:translate-x-1 transition-transform duration-200">
                        {renderItem(item, index)}
                      </div>
                    ))
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                          {IconComponent ? <IconComponent className="h-8 w-8 text-gray-400" /> : <Plus className="h-8 w-8 text-gray-400" />}
                        </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No {title.toLowerCase()} yet</h3>
                          <p className="text-gray-500 mb-4">{emptyMessage}</p>
                          <Button
                            variant="outline"
                            onClick={() => setIsEditing(true)}
                            className="rounded-xl border-dashed border-2 border-gray-300 hover:border-amber-300 hover:bg-amber-50"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Your First {itemName}
                          </Button>
                        </div>
                    )}
                  </div>
              )}
            </div>
        )}
      </CardContent>
    </Card>
  );

  // Add CSS for animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out;
    }
  `;
    document.head.appendChild(style);

    // Cleanup function to remove the style when component unmounts
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

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
    <div className="max-h-screen min-h-screen ratio-16x9   relative flex flex-col">
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
            <div className="fixed inset-0 bg-black/10 backdrop-blur-sm  bg-opacity-50 z-40" onClick={() => setShowMoreMenu(false)}>
              <div className="absolute bottom-20 left-0 right-0 bg-white  rounded-3xl  p-4" onClick={(e) => e.stopPropagation()}>
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

      {/* Image Upload Modals */}
      {/* Banner Image Upload Modal */}
      <Dialog open={showBannerModal} onOpenChange={setShowBannerModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Banner Image</DialogTitle>
            <DialogDescription>
              Upload and crop your banner image. Recommended dimensions: 1200x300px
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <ImageUpload
              accept="image/*"
              aspectRatio={4 / 1}
              uploadUrl="/api/professionals/upload"
              uploadType="banner"
              onUpload={(url) => {
                setBannerUrl(url)
                setShowBannerModal(false)
                toast({
                  title: "Success",
                  description: "Banner image updated successfully!",
                })
              }}
              onError={(error) => toast({
                title: "Upload Error",
                description: error,
                variant: "destructive",
              })}
            />

            {professional?.banner && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Current Banner</h4>
                <div className="relative">
                  <img
                    src={professional.banner}
                    alt="Current banner"
                    className="w-full h-32 object-cover rounded-xl border"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowBannerModal(false)}
                className="flex-1 rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Picture Upload Modal */}
      <Dialog open={showProfilePictureModal} onOpenChange={setShowProfilePictureModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Profile Picture</DialogTitle>
            <DialogDescription>
              Upload and crop your profile picture. Recommended dimensions: 400x400px (square)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <ImageUpload
              accept="image/*"
              aspectRatio={1}
              uploadUrl="/api/professionals/upload"
              uploadType="profile"
              onUpload={(url) => {
                setProfilePictureUrl(url)
                setShowProfilePictureModal(false)
                toast({
                  title: "Success",
                  description: "Profile picture updated successfully!",
                })
              }}
              onError={(error) => toast({
                title: "Upload Error",
                description: error,
                variant: "destructive",
              })}
            />

            {professional?.profilePicture && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Current Profile Picture</h4>
                <div className="flex justify-center">
                  <div className="relative">
                    <img
                      src={professional.profilePicture}
                      alt="Current profile picture"
                      className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-lg"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowProfilePictureModal(false)}
                className="flex-1 rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
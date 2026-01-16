'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { getOptimizedImageUrl } from '@/lib/image-utils'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Edit,
  Trash2,
  Save,
  Eye,
  Package,
  BarChart3,
  Users,
  Building,
  FileText,
  Mail,
  Key,
  Shield,
  Phone,
  Calendar,
  Image as ImageIcon,
  Upload,
  Link,
  MessageSquare,
  Settings,
  Palette,
  Globe,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  User,
  LogOut,
  Search,
  Filter,
  MoreHorizontal,
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Home,
  Grid3X3,
  FolderTree,
  MessageCircle,
  LineChart,
  Cog,
  Fullscreen,
  Share2,
  Tag
} from 'lucide-react'
import RichTextEditor from '@/components/ui/rich-text-editor'
import ImageUpload from '@/components/ui/image-upload'
import ProfilePreview from '@/components/ProfilePreview'
import HeroBannerPreview from '@/components/ui/hero-banner-preview'

interface Product {
  id: string
  name: string
  description: string | null
  price: string | null
  image: string | null
  inStock: boolean
  isActive: boolean
  additionalInfo?: Record<string, string>
  createdAt: Date
  updatedAt: Date
  businessId: string
  categoryId: string | null
  brandName: string | null
  category?: {
    id: string
    name: string
  }
  brand?: {
    id: string
    name: string
  }
}

interface Inquiry {
  id: string
  name: string
  email: string
  phone?: string
  message: string
  status: 'NEW' | 'READ' | 'REPLIED' | 'CLOSED'
  createdAt: string
  updatedAt: string
  product?: {
    id: string
    name: string
  }
}

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
  facebook: string | null
  twitter: string | null
  instagram: string | null
  linkedin: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  adminId: string
  categoryId: string | null
  heroContent: any
  brandContent: any
  portfolioContent: any
  additionalContent: any
  admin: {
    name?: string | null
    email: string
  }
  category?: {
    id: string
    name: string
  }
  products: Product[]
}

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  parentId?: string
  parent?: {
    id: string
    name: string
  }
  children?: {
    id: string
    name: string
  }[]
  _count?: {
    products: number
  }
}

export default function BusinessAdminDashboard() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [business, setBusiness] = useState<Business | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [businessCategories, setBusinessCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [images, setImages] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [brandFilterText, setBrandFilterText] = useState('')
  const [activeSection, setActiveSection] = useState<any>('dashboard')
  const [expandedSections, setExpandedSections] = useState<string[]>(['info'])
  const [editingSection, setEditingSection] = useState<string | null>(null)

  // Dialog states
  // const [showHeroEditor, setShowHeroEditor] = useState(false) // never used
  const [showContentEditor, setShowContentEditor] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showProductRightbar, setShowProductRightbar] = useState(false)
  const [showProductDialog, setShowProductDialog] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmDialogData, setConfirmDialogData] = useState<{
    title: string
    description: string
    action: () => void
  } | null>(null)

  // Form states
  const [productFormData, setProductFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    categoryId: '',
    brandName: '',
    additionalInfo: {} as Record<string, string>,
    inStock: true,
    isActive: true,
  })
  const [businessInfoFormData, setBusinessInfoFormData] = useState<{
    name: string
    description: string
    about: string
    logo: string
    address: string
    phone: string
    email: string
    website: string
    ownerName: string
    facebook: string
    twitter: string
    instagram: string
    linkedin: string
    catalogPdf: string
    openingHours: { day: string; open: string; close: string }[]
    gstNumber: string
  }>({
    name: '',
    description: '',
    about: '',
    logo: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    ownerName: '',
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: '',
    catalogPdf: '',
    openingHours: [],
    gstNumber: '',
  })
  const [editorContent, setEditorContent] = useState('')
  const [brandContent, setBrandContent] = useState<any>({ brands: [] })
  const [portfolioContent, setPortfolioContent] = useState<any>({ images: [] })
  const [newsContent, setNewsContent] = useState<any>({ news: [] })
  const [footerContent, setFooterContent] = useState<any>({})
  const [heroContent, setHeroContent] = useState<any>({
    slides: [],
    autoPlay: true,
    transitionSpeed: 5
  })
  const [sectionTitles, setSectionTitles] = useState({
    full: 'Full Preview',
    hero: 'Hero',
    info: 'Business Info',
    brands: 'Brand Slider',
    categories: 'Categories',
    portfolio: 'Portfolio',
    footer: 'Footer',
  })
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number>(0)
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'settings'>('content')
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({})
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [newInfoKey, setNewInfoKey] = useState('')
  const [newInfoValue, setNewInfoValue] = useState('')
  const [savingProduct, setSavingProduct] = useState(false)
  const [savingCategory, setSavingCategory] = useState(false)
  const [savingBrand, setSavingBrand] = useState(false)
  const [savingPortfolio, setSavingPortfolio] = useState(false)
  const [savingHero, setSavingHero] = useState(false)
  const [updatingInquiry, setUpdatingInquiry] = useState<string | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<string | null>(null)

  // Categories management state
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    parentId: '',
  })
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  // Additional state variables
  const [rightPanelContent, setRightPanelContent] = useState<string | null>(null)
  const [showRightPanel, setShowRightPanel] = useState(false)
  const [selectedProfileSection, setSelectedProfileSection] = useState<string | null>(null)
  const safeCategories = categories

  // Mobile responsiveness states
  const [isMobile, setIsMobile] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)


  const getEditorTitle = () => {
    if (activeSection === 'info') return 'Business Info Editor'
    if (activeSection === 'hero') return 'Hero Section Editor'
    if (activeSection === 'brands') return 'Brand Slider Editor'
    if (activeSection === 'categories') return 'Categories Editor'
    return 'Editor Panel'
  }

  // Stats
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalInquiries: 0,
    newInquiries: 0,
    readInquiries: 0,
    repliedInquiries: 0,
  })

  useEffect(() => {
    // Check if mobile on initial load and on resize
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)

    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  useEffect(() => {
    if (!loading && (!user || user.role !== 'BUSINESS_ADMIN')) {
      router.push('/login')
      return
    }

    if (user?.role === 'BUSINESS_ADMIN') {
      fetchData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, router])

  useEffect(() => {
    setMounted(true)
  }, [])


  const fetchData = async () => {
    try {
      setIsLoading(true)

      // Use temporary arrays for stats calculation
      let tempProducts: Product[] = []
      let tempInquiries: Inquiry[] = []

      // Fetch business data
      try {
        const businessRes = await fetch('/api/business')
        if (businessRes.ok) {
          const data = await businessRes.json()
          setBusiness(data.business)
          setBrandContent(data.business.brandContent || { brands: [] })
          setPortfolioContent(data.business.portfolioContent || { images: [] })
          setFooterContent(data.business.footerContent || {})
          setHeroContent(data.business.heroContent || {
            slides: [],
            autoPlay: true,
            transitionSpeed: 5
          })
          setBusinessInfoFormData({
            name: data.business.name || '',
            description: data.business.description || '',
            about: data.business.about || '',
            logo: data.business.logo || '',
            address: data.business.address || '',
            phone: data.business.phone || '',
            email: data.business.email || '',
            website: data.business.website || '',
            ownerName: data.business.admin?.name || '',
            facebook: data.business.facebook || '',
            twitter: data.business.twitter || '',
            instagram: data.business.instagram || '',
            linkedin: data.business.linkedin || '',
            catalogPdf: data.business.catalogPdf || '',
            openingHours: data.business.openingHours || [],
            gstNumber: data.business.gstNumber || '',
          })
        } else {
          const errorData = await businessRes.json()
          toast({
            title: "Error",
            description: `Failed to load business data: ${errorData.error}`,
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Business data fetch error:', error)
        toast({
          title: "Error",
          description: "Failed to load business data. Please refresh the page.",
          variant: "destructive",
        })
      }

      // Fetch categories
      try {
        const categoriesRes = await fetch('/api/business/categories')
        if (categoriesRes.ok) {
          const data = await categoriesRes.json()
          setCategories(data.categories)
        } else {
          console.warn('Failed to fetch categories')
          setCategories([])
        }
      } catch (error) {
        console.error('Categories fetch error:', error)
        setCategories([])
      }

      // Fetch products
      try {
        const productsRes = await fetch('/api/business/products')
        if (productsRes.ok) {
          const data = await productsRes.json()
          setProducts(data.products)
          setImages([...new Set(data.products.map(p => p.image).filter(Boolean))] as string[])
          tempProducts = data.products
        } else {
          const errorData = await productsRes.json()
          console.warn('Products fetch failed:', errorData.error)
          setProducts([])
          setImages([])
          tempProducts = []
          toast({
            title: "Warning",
            description: "Failed to load products data.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Products fetch error:', error)
        setProducts([])
        setImages([])
        tempProducts = []
        toast({
          title: "Error",
          description: "Failed to load products. Please check your connection.",
          variant: "destructive",
        })
      }

      // Fetch inquiries
      try {
        const inquiriesRes = await fetch('/api/business/inquiries')
        if (inquiriesRes.ok) {
          const data = await inquiriesRes.json()
          setInquiries(data.inquiries)
          tempInquiries = data.inquiries
        } else {
          const errorData = await inquiriesRes.json()
          console.warn('Inquiries fetch failed:', errorData.error)
          setInquiries([])
          tempInquiries = []
          toast({
            title: "Warning",
            description: "Failed to load inquiries data.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Inquiries fetch error:', error)
        setInquiries([])
        tempInquiries = []
        toast({
          title: "Error",
          description: "Failed to load inquiries. Please check your connection.",
          variant: "destructive",
        })
      }

      // Calculate stats after fetching all data, use locally fetched data
      setTimeout(() => {
        const totalProducts = tempProducts.length
        const activeProducts = tempProducts.filter(p => p.isActive).length
        const totalInquiries = tempInquiries.length
        const newInquiriesCt = tempInquiries.filter(i => i.status === 'NEW').length
        const readInquiriesCt = tempInquiries.filter(i => i.status === 'READ').length
        const repliedInquiriesCt = tempInquiries.filter(i => i.status === 'REPLIED').length

        setStats({
          totalProducts,
          activeProducts,
          totalInquiries,
          newInquiries: newInquiriesCt,
          readInquiries: readInquiriesCt,
          repliedInquiries: repliedInquiriesCt,
        })
      }, 100)

    } catch (error) {
      console.error('Failed to fetch data:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading data. Please refresh the page.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }


  const handleProductEdit = (product: Product) => {
    setEditingProduct(product)
    setProductFormData({
      name: product.name,
      description: product.description || '',
      price: product.price || '',
      image: product.image || '',
      categoryId: product.categoryId || '',
      brandName: product.brandName || '',
      additionalInfo: product.additionalInfo || {},
      inStock: product.inStock,
      isActive: product.isActive,
    })
  }

  const handleProductDelete = async (product: Product) => {
    setConfirmDialogData({
      title: 'Delete Product',
      description: `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      action: async () => {
        setDeletingProduct(product.id)
        try {
          const response = await fetch(`/api/business/products/${product.id}`, {
            method: 'DELETE',
          })

          if (response.ok) {
            setProducts(prev => prev.filter(p => p.id !== product.id))
            setStats(prev => ({
              ...prev,
              totalProducts: prev.totalProducts - 1,
              activeProducts: product.isActive ? prev.activeProducts - 1 : prev.activeProducts,
            }))
            toast({
              title: "Success",
              description: "Product deleted successfully!",
            })
          } else {
            const errorResult = await response.json()
            toast({
              title: "Error",
              description: `Failed to delete product: ${errorResult.error}`,
              variant: "destructive",
            })
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to delete product. Please try again.",
            variant: "destructive",
          })
        } finally {
          setDeletingProduct(null)
        }
      }
    })
    setShowConfirmDialog(true)
  }

  const handleInquiryStatusUpdate = async (inquiryId: string, newStatus: string) => {
    setUpdatingInquiry(inquiryId)
    try {
      const response = await fetch(`/api/business/inquiries/${inquiryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setInquiries(prev => prev.map(i => i.id === inquiryId ? { ...i, status: newStatus as any } : i))
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
    } finally {
      setUpdatingInquiry(null)
    }
  }

  const handleShare = (product: Product) => {
    const shareUrl = `${window.location.origin}/catalog/${business?.slug}?product=${product.id}&modal=open`;
    const shareData = {
      title: product.name,
      text: `Check out this product: ${product.name}\n\n Description: ${product.description}`,
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


  const handleAddInfo = () => {
    const key = newInfoKey.trim()
    const value = newInfoValue.trim()
    if (!key || !value) return

    const normalizedKey = key.toLowerCase()
    const currentInfo = productFormData.additionalInfo || {}

    if (currentInfo[normalizedKey]) {
      toast({
        title: "Error",
        description: "This key already exists",
        variant: "destructive",
      })
      return
    }

    setProductFormData(prev => ({
      ...prev,
      additionalInfo: {
        ...prev.additionalInfo,
        [key]: value
      }
    }))
    setNewInfoKey('')
    setNewInfoValue('')
  }

  const handleRemoveInfo = (keyToRemove: string) => {
    setProductFormData(prev => {
      const newInfo = { ...prev.additionalInfo }
      delete newInfo[keyToRemove]
      return {
        ...prev,
        additionalInfo: newInfo
      }
    })
  }

  const handleBasicInfoSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSavingStates(prev => ({ ...prev, basicInfo: true }))

    const updateData = {
      name: businessInfoFormData.name,
      description: businessInfoFormData.description,
      about: businessInfoFormData.about,
      logo: businessInfoFormData.logo,
      address: businessInfoFormData.address,
      phone: businessInfoFormData.phone,
      email: businessInfoFormData.email,
      website: businessInfoFormData.website,
      ownerName: businessInfoFormData.ownerName,
      facebook: businessInfoFormData.facebook,
      twitter: businessInfoFormData.twitter,
      instagram: businessInfoFormData.instagram,
      linkedin: businessInfoFormData.linkedin,
      catalogPdf: businessInfoFormData.catalogPdf,
      openingHours: businessInfoFormData.openingHours,
      gstNumber: businessInfoFormData.gstNumber,
    }

    console.log('Frontend updateData being sent:', updateData)

    // Validation
    if (!updateData.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Business name is required.",
        variant: "destructive",
      })
      setSavingStates(prev => ({ ...prev, basicInfo: false }))
      return
    }

    if (updateData.name.length < 2) {
      toast({
        title: "Validation Error",
        description: "Business name must be at least 2 characters long.",
        variant: "destructive",
      })
      setSavingStates(prev => ({ ...prev, basicInfo: false }))
      return
    }

    if (updateData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updateData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      setSavingStates(prev => ({ ...prev, basicInfo: false }))
      return
    }

    if (updateData.website && updateData.website.trim() && !updateData.website.startsWith('http://') && !updateData.website.startsWith('https://')) {
      updateData.website = `https://${updateData.website}`
    }

    if (updateData.logo && updateData.logo.trim() && !updateData.logo.startsWith('http://') && !updateData.logo.startsWith('https://')) {
      updateData.logo = `https://${updateData.logo}`
    }

    // Social links validation and URL formatting
    const socialFields = ['facebook', 'twitter', 'instagram', 'linkedin']
    socialFields.forEach(field => {
      const value = updateData[field as keyof typeof updateData] as string
      if (value && value.trim()) {
        if (!value.startsWith('http')) {
          (updateData as any)[field] = `https://${value}`
        }
        // Basic URL validation
        try {
          new URL((updateData as any)[field])
        } catch {
          toast({
            title: "Validation Error",
            description: `Please enter a valid URL for ${field.charAt(0).toUpperCase() + field.slice(1)}.`,
            variant: "destructive",
          })
          setSavingStates(prev => ({ ...prev, basicInfo: false }))
          return
        }
      }
    })

    try {
      const response = await fetch('/api/business', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        const result = await response.json()
        setBusiness(result.business)
        toast({
          title: "Success",
          description: "Business information updated successfully!",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: `Failed to update: ${error.error}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Business update error:', error)
      toast({
        title: "Error",
        description: "Failed to update business information. Please check your connection and try again.",
        variant: "destructive",
      })
    } finally {
      setSavingStates(prev => ({ ...prev, basicInfo: false }))
    }
  }


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const toggleSectionExpansion = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const handleSectionEdit = (section: string) => {
    setEditingSection(section)
  }

  const handleCloseEditor = () => {
    setEditingSection(null)
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setCategoryFormData({
      name: category.name,
      description: category.description || '',
      parentId: category.parentId || '',
    })
    setRightPanelContent("edit-category")
    setShowRightPanel(true)
  }

  const handleDeleteCategory = async (category: Category) => {
    setConfirmDialogData({
      title: 'Delete Category',
      description: `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      action: async () => {
        try {
          const response = await fetch(`/api/business/categories?id=${category.id}`, {
            method: 'DELETE',
          })

          if (response.ok) {
            await fetchData()
            toast({
              title: "Success",
              description: "Category deleted successfully!",
            })
          } else {
            const errorResult = await response.json()
            toast({
              title: "Error",
              description: `Failed to delete category: ${errorResult.error}`,
              variant: "destructive",
            })
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to delete category. Please try again.",
            variant: "destructive",
          })
        }
      }
    })
    setShowConfirmDialog(true)
  }

  const renderSkeletonContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className=" mx-auto">
            <div className="mb-8">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-6 w-96" />
            </div>

            {/* Stats Overview */}
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

            {/* Quick Actions and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="rounded-3xl">
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full rounded-2xl" />
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-3xl">
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-56" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl">
                        <Skeleton className="h-5 w-5 rounded" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-48 mb-1" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      case 'products':
        return (
          <div className=" mx-auto">
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-6 w-64" />
              </div>
              <Skeleton className="h-10 w-32 rounded-2xl" />
            </div>

            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <Skeleton className="h-10 flex-1 rounded-2xl" />
              <Skeleton className="h-10 w-48 rounded-2xl" />
            </div>

            <Card className="rounded-3xl">
              <CardContent className="p-0">
                <div className="overflow-x-auto border border-gray-200">
                  <div className="bg-amber-100 p-4">
                    <div className="flex space-x-4">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <div className="space-y-4 p-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex space-x-4">
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-12 w-12 rounded-2xl" />
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <div className="flex space-x-2">
                          <Skeleton className="h-8 w-8 rounded-xl" />
                          <Skeleton className="h-8 w-8 rounded-xl" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      case 'inquiries':
        return (
          <div className=" mx-auto">
            <div className="mb-8">
              <Skeleton className="h-8 w-56 mb-2" />
              <Skeleton className="h-6 w-72" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="bg-white border border-gray-200 shadow-sm rounded-3xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-4 rounded" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-12 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="border-l-4 border-l-blue-500 rounded-3xl">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Skeleton className="h-6 w-32" />
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-16 w-full mb-4" />
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Skeleton className="h-8 w-24 rounded-xl" />
                      <Skeleton className="h-8 w-28 rounded-xl" />
                      <Skeleton className="h-8 w-20 rounded-xl" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      default:
        return (
          <div className=" mx-auto">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-32 w-full" />
          </div>
        )
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col relative">
        <div className="fixed inset-0 bg-linear-to-b from-blue-400 to-white bg-center blur-sm -z-10"></div>
        {/* Top Header Bar */}
        <div className="bg-white border-gray-200 shadow-sm">
          <div className="flex justify-between items-center px-4 sm:px-6 py-1">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-2xl">
                <Skeleton className="h-8 w-8" />
              </div>
              <div>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Skeleton className="h-8 w-24 rounded-2xl hidden sm:flex" />
              <Skeleton className="h-8 w-20 rounded-2xl hidden sm:flex" />
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
            <div className="w-64  bg-white border-r border-gray-200 flex flex-col shadow-sm">
              <div className="p-4 border-b border-gray-200 rounded-t-3xl">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-6 w-6" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <nav className="flex-1 p-4">
                <ul className="space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => (
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
          <div className={`flex-1  bg-white/50 backdrop-blur-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 ease-in-out pb-20 md:pb-0`}>
            <div className="flex-1 p-4 sm:p-6 overflow-auto hide-scrollbar">
              {renderSkeletonContent()}
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl border-t border-gray-200 z-40">
            <div className="flex justify-around items-center py-2">
              {Array.from({ length: 5 }).map((_, i) => (
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

  if (!user || user.role !== 'BUSINESS_ADMIN' || !business) {
    return null
  }

  const heroSlides = business.heroContent?.slides || []

  // Menu items for navigation
  const menuItems = [
    {
      title: 'Dashboard',
      icon: BarChart3,
      mobileIcon: Home,
      value: 'dashboard',
      mobileTitle: 'Home'
    },
    {
      title: 'Business Info',
      icon: Building,
      mobileIcon: Building,
      value: 'info',
      mobileTitle: 'Info'
    },
    {
      title: 'Hero Banner',
      icon: ImageIcon,
      mobileIcon: ImageIcon,
      value: 'hero',
      mobileTitle: 'Hero'
    },
    {
      title: 'Brand Slider',
      icon: Palette,
      mobileIcon: Palette,
      value: 'brands',
      mobileTitle: 'Brands'
    },
    {
      title: 'Category',
      icon: Grid3X3,
      mobileIcon: Grid3X3,
      value: 'categories',
      mobileTitle: 'Category'
    },
    {
      title: 'Products',
      icon: Package,
      mobileIcon: Grid3X3,
      value: 'products',
      mobileTitle: 'Products'
    },
 
  ]

  return (
    <div className="min-h-screen flex h-screen  flex-col relative">
      <div className="fixed inset-0 bg-linear-to-b from-blue-400 to-white bg-center blur-sm -z-10"></div>
      {/* Top Header Bar */}
      <div className="bg-white border  border-gray-200 shadow-sm">
        <div className="flex justify-between items-center px-3 sm:px-4 py-1">
          <div className="flex items-center ">
            <img src="/logo.svg" alt="DigiSense" className="h-8 w-auto" />
            <span className="h-8 border-l border-gray-300 mx-2"></span>
            <div>
               <span className="font-semibold">{business.name}</span>
            </div>
          </div>
          <div className="flex items-center leading-tight space-x-2 sm:space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">
                {user?.name || "Business Admin"}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <span className="h-8 border-l border-gray-300 mx-2"></span>
            <div className="w-8 h-8  rounded-full  bg-black  flex items-center justify-center">
              <Shield className="h-4 w-4 sm:h-4 sm:w-4 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout: Three Column Grid */}
      <div className="flex  flex-1  overflow-hidden">
        {/* Left Sidebar - Desktop Only */}
        {!isMobile && (
          <div className="w-64    bg-white border-r border-gray-200 flex flex-col shadow-sm">
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.value}>
                    <button
                      onClick={() => setActiveSection(item.value)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-2xl text-left transition-colors ${
                        activeSection === item.value
                          ? " bg-linear-to-r from-orange-400 to-amber-500 text-white"
                          : "text-gray-700 hover:bg-orange-50"
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
                  await logout();
                  router.push('/login');
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
        <div className="flex-1 overflow-auto hide-scrollbar pb-20 md:pb-0">
          <div className="flex-1  p-4 sm:p-6 overflow-auto hide-scrollbar">
            {/* Main Content based on activeSection */}
            {activeSection === 'dashboard' && (
              <>
                <div className="  mx-auto">
                  <div className="mb-8">
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
                    <p className="text-xl text-gray-600">Welcome back! Here's what's happening with your business.</p>
                  </div>

                  {/* Stats Overview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl transition-all duration-300 hover:shadow-lg">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-900">Total Products</CardTitle>
                        <Package className="h-4 w-4 text-gray-400" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{stats.totalProducts}</div>
                        <p className="text-xs text-gray-500">{stats.activeProducts} active</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl transition-all duration-300 hover:shadow-lg">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-900">Total Inquiries</CardTitle>
                        <Mail className="h-4 w-4 text-gray-400" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{stats.totalInquiries}</div>
                        <p className="text-xs text-gray-500">{stats.newInquiries} new</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl transition-all duration-300 hover:shadow-lg">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-900">Profile Completion</CardTitle>
                        <BarChart3 className="h-4 w-4 text-gray-400" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                          {business ? (
                            (() => {
                              const keys = [
                                business.name ? 25 : 0,
                                business.description ? 25 : 0,
                                business.logo ? 25 : 0,
                                business.address ? 25 : 0,
                                business.phone ? 25 : 0,
                                business.email != null ? 25 : 0,
                                business.website ? 25 : 0,
                                (heroSlides && heroSlides.length > 0) ? 25 : 0
                              ]
                              let percent = keys.reduce((sum, val) => sum + val, 0)
                              // prevent >100%
                              percent = Math.min(percent, 100)
                              return percent + '%'
                            })()
                          ) : '0%'}
                        </div>
                        <p className="text-xs text-gray-500">Profile completion</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl transition-all duration-300 hover:shadow-lg">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-900">Business Health</CardTitle>
                        <Building className="h-4 w-4 text-gray-400" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                          {business.isActive ? 'Active' : 'Inactive'}
                        </div>
                        <p className="text-xs text-gray-500">Status</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Actions and Recent Activity */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="rounded-3xl transition-all duration-300 hover:shadow-lg">
                      <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common tasks to get you started</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Button onClick={() => {
                          setActiveSection('products');
                          setEditingProduct(null);
                          setProductFormData({
                            name: '',
                            description: '',
                            price: '',
                            image: '',
                            categoryId: '',
                            brandName: '',
                            additionalInfo: {},
                            inStock: true,
                            isActive: true,
                          });
                          setShowProductDialog(true);
                        }} className="w-full justify-start rounded-2xl">
                          <Plus className="h-4 w-4 mr-2" />
                          Add New Product
                        </Button>
                        <Button variant="outline" onClick={() => setActiveSection('profile')} className="w-full justify-start rounded-2xl">
                          <Settings className="h-4 w-4 mr-2" />
                          Update Business Profile
                        </Button>
                        <Button variant="outline" onClick={() => setActiveSection('inquiries')} className="w-full justify-start rounded-2xl">
                          <Mail className="h-4 w-4 mr-2" />
                          Check New Inquiries
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="rounded-3xl transition-all duration-300 hover:shadow-lg">
                      <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest updates and interactions</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {inquiries.slice(0, 3).map((inquiry) => (
                            <div key={inquiry.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl">
                              <div className="shrink-0">
                                <Mail className="h-5 w-5 text-blue-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  New inquiry from {inquiry.name}
                                </p>
                                <p className="text-sm text-gray-500 truncate">
                                  {formatDate(inquiry.createdAt)}
                                </p>
                              </div>
                              <Badge variant={inquiry.status === 'NEW' ? 'destructive' : 'secondary'} className="rounded-full">
                                {inquiry.status}
                              </Badge>
                            </div>
                          ))}
                          {inquiries.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            )}

            {activeSection === 'info' && (
              <div className=" mx-auto">
                <div className="mb-6">
                  <h1 className="text-xl font-bold text-gray-900 mb-2">Business Info</h1>
                  <p className="text-xl text-gray-600">Manage your business information</p>
                </div>

                <div>
                  <div className="mt-2 space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-1">Business Name</Label>
                      <Input
                        name="name"
                        value={businessInfoFormData.name}
                        onChange={(e) => setBusinessInfoFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="bg-white rounded-2xl"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-1">Owner Name</Label>
                      <Input
                        value={businessInfoFormData.ownerName}
                        onChange={(e) => setBusinessInfoFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                        className="bg-white rounded-2xl"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-1">Description</Label>
                      <Textarea
                        value={businessInfoFormData.description}
                        onChange={(e) => setBusinessInfoFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="bg-white rounded-2xl"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-1">About Section</Label>
                      <Textarea
                        value={businessInfoFormData.about}
                        onChange={(e) => setBusinessInfoFormData(prev => ({ ...prev, about: e.target.value }))}
                        rows={3}
                        placeholder="Detailed about section content"
                        className="bg-white rounded-2xl"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-1">GST Number</Label>
                      <Input
                        value={businessInfoFormData.gstNumber}
                        onChange={(e) => setBusinessInfoFormData(prev => ({ ...prev, gstNumber: e.target.value }))}
                        placeholder="Enter GST number"
                        className="bg-white rounded-2xl"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-1">Opening Hours</Label>
                      <div className="space-y-2">
                        {businessInfoFormData.openingHours?.map((hour: any, index: number) => (
                          <div key={index} className="flex gap-2 items-center">
                            <Input
                              value={hour.day}
                              onChange={(e) => {
                                const newHours = [...businessInfoFormData.openingHours]
                                newHours[index].day = e.target.value
                                setBusinessInfoFormData(prev => ({ ...prev, openingHours: newHours }))
                              }}
                              placeholder="Day"
                              className="bg-white rounded-2xl"
                            />
                            <Input
                              value={hour.open}
                              onChange={(e) => {
                                const newHours = [...businessInfoFormData.openingHours]
                                newHours[index].open = e.target.value
                                setBusinessInfoFormData(prev => ({ ...prev, openingHours: newHours }))
                              }}
                              placeholder="Open"
                              className="bg-white rounded-2xl"
                            />
                            <Input
                              value={hour.close}
                              onChange={(e) => {
                                const newHours = [...businessInfoFormData.openingHours]
                                newHours[index].close = e.target.value
                                setBusinessInfoFormData(prev => ({ ...prev, openingHours: newHours }))
                              }}
                              placeholder="Close"
                              className="bg-white rounded-2xl"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newHours = businessInfoFormData.openingHours.filter((_, i) => i !== index)
                                setBusinessInfoFormData(prev => ({ ...prev, openingHours: newHours }))
                              }}
                              className="rounded-xl"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newHours = [...(businessInfoFormData.openingHours || []), { day: '', open: '', close: '' }]
                            setBusinessInfoFormData(prev => ({ ...prev, openingHours: newHours }))
                          }}
                          className="rounded-2xl"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Opening Hour
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-1">Logo URL</Label>
                      <div className="space-y-2">
                        <Input
                          value={businessInfoFormData.logo}
                          onChange={(e) => setBusinessInfoFormData(prev => ({ ...prev, logo: e.target.value }))}
                          placeholder="https://..."
                          className="bg-white rounded-2xl"
                        />
                        <div className="space-y-2">
                          <ImageUpload
                            accept="image/*"
                            onUpload={(url) => setBusinessInfoFormData(prev => ({ ...prev, logo: url }))}
                            onError={(error) => toast({
                              title: "Upload Error",
                              description: error,
                              variant: "destructive",
                            })}
                          />

                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-1">Address</Label>
                      <Input
                        value={businessInfoFormData.address}
                        onChange={(e) => setBusinessInfoFormData(prev => ({ ...prev, address: e.target.value }))}
                        className="bg-white rounded-2xl"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-1">Phone</Label>
                      <Input
                        value={businessInfoFormData.phone}
                        onChange={(e) => setBusinessInfoFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="bg-white rounded-2xl"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-1">Email</Label>
                      <Input
                        value={businessInfoFormData.email}
                        onChange={(e) => setBusinessInfoFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="bg-white rounded-2xl"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-1">Website</Label>
                      <Input
                        value={businessInfoFormData.website}
                        onChange={(e) => setBusinessInfoFormData(prev => ({ ...prev, website: e.target.value }))}
                        className="bg-white rounded-2xl"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-1">Facebook</Label>
                      <Input
                        value={businessInfoFormData.facebook}
                        onChange={(e) => setBusinessInfoFormData(prev => ({ ...prev, facebook: e.target.value }))}
                        placeholder="https://facebook.com/yourpage"
                        className="bg-white rounded-2xl"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-1">Twitter</Label>
                      <Input
                        value={businessInfoFormData.twitter}
                        onChange={(e) => setBusinessInfoFormData(prev => ({ ...prev, twitter: e.target.value }))}
                        placeholder="https://twitter.com/yourhandle"
                        className="bg-white rounded-2xl"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-1">Instagram</Label>
                      <Input
                        value={businessInfoFormData.instagram}
                        onChange={(e) => setBusinessInfoFormData(prev => ({ ...prev, instagram: e.target.value }))}
                        placeholder="https://instagram.com/yourhandle"
                        className="bg-white rounded-2xl"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-1">LinkedIn</Label>
                      <Input
                        value={businessInfoFormData.linkedin}
                        onChange={(e) => setBusinessInfoFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                        placeholder="https://linkedin.com/in/yourprofile"
                        className="bg-white rounded-2xl"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'hero' && (
              <div className=" mx-auto">
                <div className="mb-6">
                  <h1 className="text-xl font-bold text-gray-900 mb-2">Hero Banner</h1>
                  <p className="text-xl text-gray-600">Manage your hero section</p>
                </div>

                {/* Hero Banner Preview */}
                <div className="mb-6">
                  <HeroBannerPreview heroContent={heroContent} selectedSlideIndex={selectedSlideIndex} />
                </div>

                <div className="space-y-6">
                  {/* Section Title */}
                  <div>
                    <Label className="text-sm font-medium">Section Title</Label>
                    <Input
                      value={sectionTitles.hero}
                      onChange={(e) => setSectionTitles(prev => ({ ...prev, hero: e.target.value }))}
                      placeholder="Enter section title"
                      className="rounded-2xl"
                    />
                  </div>

                  {/* Slide Selector and Add Button */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex-1 w-full">
                      <Label className="text-sm font-medium">Select Slide</Label>
                      <Select
                        value={selectedSlideIndex?.toString()}
                        onValueChange={(value) => setSelectedSlideIndex(parseInt(value))}
                      >
                        <SelectTrigger className="rounded-2xl w-full">
                          <SelectValue placeholder="Select a slide to edit" />
                        </SelectTrigger>
                        <SelectContent>
                          {heroContent.slides?.map((slide: any, index: number) => (
                            <SelectItem key={index} value={index.toString()}>
                              {index + 1}: {slide.headline || 'Untitled'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2 mt-4 sm:mt-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (selectedSlideIndex > 0) {
                            const newSlides = [...heroContent.slides]
                            const temp = newSlides[selectedSlideIndex]
                            newSlides[selectedSlideIndex] = newSlides[selectedSlideIndex - 1]
                            newSlides[selectedSlideIndex - 1] = temp
                            setHeroContent(prev => ({ ...prev, slides: newSlides }))
                            setSelectedSlideIndex(selectedSlideIndex - 1)
                          }
                        }}
                        disabled={selectedSlideIndex === 0}
                        className="rounded-xl"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (selectedSlideIndex < heroContent.slides.length - 1) {
                            const newSlides = [...heroContent.slides]
                            const temp = newSlides[selectedSlideIndex]
                            newSlides[selectedSlideIndex] = newSlides[selectedSlideIndex + 1]
                            newSlides[selectedSlideIndex + 1] = temp
                            setHeroContent(prev => ({ ...prev, slides: newSlides }))
                            setSelectedSlideIndex(selectedSlideIndex + 1)
                          }
                        }}
                        disabled={selectedSlideIndex === heroContent.slides.length - 1}
                        className="rounded-xl"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newSlides = heroContent.slides.filter((_, i) => i !== selectedSlideIndex)
                          setHeroContent(prev => ({ ...prev, slides: newSlides }))
                          setSelectedSlideIndex(Math.max(0, selectedSlideIndex - 1))
                        }}
                        className="rounded-xl"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => {
                          const newSlide = {
                            mediaType: 'image',
                            media: '',
                            headline: '',
                            headlineSize: 'text-4xl md:text-6xl',
                            headlineColor: '#ffffff',
                            headlineAlignment: 'center',
                            subtext: '',
                            subtextSize: 'text-xl md:text-2xl',
                            subtextColor: '#ffffff',
                            subtextAlignment: 'center',
                            cta: 'Get in Touch',
                            ctaLink: ''
                          }
                          setHeroContent(prev => ({ ...prev, slides: [...prev.slides, newSlide] }))
                          setSelectedSlideIndex(heroContent.slides.length)
                        }}
                        className="rounded-2xl"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Slide
                      </Button>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="border-b">
                    <div className="flex space-x-8 overflow-x-auto">
                      <button
                        className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'content'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                        onClick={() => setActiveTab('content')}
                      >
                        Content
                      </button>
                      <button
                        className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'style'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                        onClick={() => setActiveTab('style')}
                      >
                        Style
                      </button>
                      <button
                        className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'settings'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                        onClick={() => setActiveTab('settings')}
                      >
                        Settings
                      </button>
                    </div>
                  </div>

                  {/* Tab Content */}
                  {selectedSlideIndex !== null && heroContent.slides[selectedSlideIndex] && (
                    <div className="space-y-6">
                      {activeTab === 'content' && (
                        <Card className="rounded-3xl">
                          <CardContent className="pt-6">
                            <div className="space-y-6">
                              {/* Background Media */}
                              <div>
                                <Label className="text-sm font-medium">Background Media</Label>
                                <div className="mt-2 space-y-3">
                                  <Select
                                    value={heroContent.slides[selectedSlideIndex].mediaType || 'image'}
                                    onValueChange={(value) => {
                                      const newSlides = [...heroContent.slides]
                                      newSlides[selectedSlideIndex] = { ...newSlides[selectedSlideIndex], mediaType: value }
                                      setHeroContent(prev => ({ ...prev, slides: newSlides }))
                                    }}
                                  >
                                    <SelectTrigger className="rounded-2xl">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="image">Image</SelectItem>
                                      <SelectItem value="video">Video</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Input
                                    placeholder="Media URL"
                                    value={heroContent.slides[selectedSlideIndex].media || ''}
                                    onChange={(e) => {
                                      const newSlides = [...heroContent.slides]
                                      newSlides[selectedSlideIndex] = { ...newSlides[selectedSlideIndex], media: e.target.value }
                                      setHeroContent(prev => ({ ...prev, slides: newSlides }))
                                    }}
                                    className="bg-white rounded-2xl"
                                  />
                                  <ImageUpload
                                    allowVideo={true}
                                    aspectRatio={16/9}
                                    onUpload={(url) => {
                                      const newSlides = [...heroContent.slides]
                                      newSlides[selectedSlideIndex] = { ...newSlides[selectedSlideIndex], media: url }
                                      setHeroContent(prev => ({ ...prev, slides: newSlides }))
                                    }}
                                  />
                                </div>
                              </div>

                              {/* Headline */}
                              <div>
                                <Label className="text-sm font-medium">Headline</Label>
                                <Input
                                  placeholder="Enter headline"
                                  value={heroContent.slides[selectedSlideIndex].headline || ''}
                                  onChange={(e) => {
                                    const newSlides = [...heroContent.slides]
                                    newSlides[selectedSlideIndex] = { ...newSlides[selectedSlideIndex], headline: e.target.value }
                                    setHeroContent(prev => ({ ...prev, slides: newSlides }))
                                  }}
                                  className="mt-2 bg-white rounded-2xl"
                                />
                              </div>

                              {/* Subtext */}
                              <div>
                                <Label className="text-sm font-medium">Subtext</Label>
                                <Textarea
                                  placeholder="Enter subtext"
                                  rows={3}
                                  value={heroContent.slides[selectedSlideIndex].subtext || ''}
                                  onChange={(e) => {
                                    const newSlides = [...heroContent.slides]
                                    newSlides[selectedSlideIndex] = { ...newSlides[selectedSlideIndex], subtext: e.target.value }
                                    setHeroContent(prev => ({ ...prev, slides: newSlides }))
                                  }}
                                  className="mt-2 bg-white rounded-2xl"
                                />
                              </div>

                              {/* CTA */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">CTA Text</Label>
                                  <Input
                                    placeholder="Call to action text"
                                    value={heroContent.slides[selectedSlideIndex].cta || ''}
                                    onChange={(e) => {
                                      const newSlides = [...heroContent.slides]
                                      newSlides[selectedSlideIndex] = { ...newSlides[selectedSlideIndex], cta: e.target.value }
                                      setHeroContent(prev => ({ ...prev, slides: newSlides }))
                                    }}
                                    className="mt-2 bg-white rounded-2xl"
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">CTA Link</Label>
                                  <Input
                                    placeholder="https://..."
                                    value={heroContent.slides[selectedSlideIndex].ctaLink || ''}
                                    onChange={(e) => {
                                      const newSlides = [...heroContent.slides]
                                      newSlides[selectedSlideIndex] = { ...newSlides[selectedSlideIndex], ctaLink: e.target.value }
                                      setHeroContent(prev => ({ ...prev, slides: newSlides }))
                                    }}
                                    className="mt-2 bg-white rounded-2xl"
                                  />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {activeTab === 'style' && (
                        <Card className="rounded-3xl">
                          <CardContent className="pt-6">
                            <div className="space-y-6">
                              {/* Headline Style */}
                              <div>
                                <h3 className="text-sm font-medium mb-4">Headline Style</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm">Size</Label>
                                    <Select
                                      value={heroContent.slides[selectedSlideIndex].headlineSize || 'text-4xl md:text-6xl'}
                                      onValueChange={(value) => {
                                        const newSlides = [...heroContent.slides]
                                        newSlides[selectedSlideIndex] = { ...newSlides[selectedSlideIndex], headlineSize: value }
                                        setHeroContent(prev => ({ ...prev, slides: newSlides }))
                                      }}
                                    >
                                      <SelectTrigger className="mt-2 rounded-2xl">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">Small</SelectItem>
                                        <SelectItem value="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">Medium</SelectItem>
                                        <SelectItem value="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">Large</SelectItem>
                                        <SelectItem value="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">Extra Large</SelectItem>
                                        <SelectItem value="text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl">Huge</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label className="text-sm">Color</Label>
                                    <div className="flex items-center gap-2 mt-2">
                                      <Input
                                        type="color"
                                        value={heroContent.slides[selectedSlideIndex].headlineColor || '#ffffff'}
                                        onChange={(e) => {
                                          const newSlides = [...heroContent.slides]
                                          newSlides[selectedSlideIndex] = { ...newSlides[selectedSlideIndex], headlineColor: e.target.value }
                                          setHeroContent(prev => ({ ...prev, slides: newSlides }))
                                        }}
                                        className="w-12 h-10 p-1 rounded-2xl"
                                      />
                                      <Input
                                        value={heroContent.slides[selectedSlideIndex].headlineColor || '#ffffff'}
                                        onChange={(e) => {
                                          const newSlides = [...heroContent.slides]
                                          newSlides[selectedSlideIndex] = { ...newSlides[selectedSlideIndex], headlineColor: e.target.value }
                                          setHeroContent(prev => ({ ...prev, slides: newSlides }))
                                        }}
                                        placeholder="#ffffff"
                                        className="rounded-2xl"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-sm">Alignment</Label>
                                    <Select
                                      value={heroContent.slides[selectedSlideIndex].headlineAlignment || 'center'}
                                      onValueChange={(value) => {
                                        const newSlides = [...heroContent.slides]
                                        newSlides[selectedSlideIndex] = { ...newSlides[selectedSlideIndex], headlineAlignment: value }
                                        setHeroContent(prev => ({ ...prev, slides: newSlides }))
                                      }}
                                    >
                                      <SelectTrigger className="mt-2 rounded-2xl">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="left">Left</SelectItem>
                                        <SelectItem value="center">Center</SelectItem>
                                        <SelectItem value="right">Right</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>

                              {/* Subtext Style */}
                              <div>
                                <h3 className="text-sm font-medium mb-4">Subtext Style</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm">Size</Label>
                                    <Select
                                      value={heroContent.slides[selectedSlideIndex].subtextSize || 'text-xl md:text-2xl'}
                                      onValueChange={(value) => {
                                        const newSlides = [...heroContent.slides]
                                        newSlides[selectedSlideIndex] = { ...newSlides[selectedSlideIndex], subtextSize: value }
                                        setHeroContent(prev => ({ ...prev, slides: newSlides }))
                                      }}
                                    >
                                      <SelectTrigger className="mt-2 rounded-2xl">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl">Small</SelectItem>
                                        <SelectItem value="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl">Medium</SelectItem>
                                        <SelectItem value="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl">Large</SelectItem>
                                        <SelectItem value="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl">Extra Large</SelectItem>
                                        <SelectItem value="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl">Huge</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label className="text-sm">Color</Label>
                                    <div className="flex items-center gap-2 mt-2">
                                      <Input
                                        type="color"
                                        value={heroContent.slides[selectedSlideIndex].subtextColor || '#ffffff'}
                                        onChange={(e) => {
                                          const newSlides = [...heroContent.slides]
                                          newSlides[selectedSlideIndex] = { ...newSlides[selectedSlideIndex], subtextColor: e.target.value }
                                          setHeroContent(prev => ({ ...prev, slides: newSlides }))
                                        }}
                                        className="w-12 h-10 p-1 rounded-2xl"
                                      />
                                      <Input
                                        value={heroContent.slides[selectedSlideIndex].subtextColor || '#ffffff'}
                                        onChange={(e) => {
                                          const newSlides = [...heroContent.slides]
                                          newSlides[selectedSlideIndex] = { ...newSlides[selectedSlideIndex], subtextColor: e.target.value }
                                          setHeroContent(prev => ({ ...prev, slides: newSlides }))
                                        }}
                                        placeholder="#ffffff"
                                        className="rounded-2xl"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-sm">Alignment</Label>
                                    <Select
                                      value={heroContent.slides[selectedSlideIndex].subtextAlignment || 'center'}
                                      onValueChange={(value) => {
                                        const newSlides = [...heroContent.slides]
                                        newSlides[selectedSlideIndex] = { ...newSlides[selectedSlideIndex], subtextAlignment: value }
                                        setHeroContent(prev => ({ ...prev, slides: newSlides }))
                                      }}
                                    >
                                      <SelectTrigger className="mt-2 rounded-2xl">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="left">Left</SelectItem>
                                        <SelectItem value="center">Center</SelectItem>
                                        <SelectItem value="right">Right</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {activeTab === 'settings' && (
                        <Card className="rounded-3xl">
                          <CardContent className="pt-6">
                            <div className="space-y-6">
                              <h3 className="text-sm font-medium">Slider Settings</h3>

                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="showText" className="text-sm">Show Text Overlay</Label>
                                  <Switch
                                    id="showText"
                                    checked={heroContent.slides[selectedSlideIndex]?.showText !== false}
                                    onCheckedChange={(checked) => {
                                      const newSlides = [...heroContent.slides]
                                      newSlides[selectedSlideIndex] = { ...newSlides[selectedSlideIndex], showText: checked }
                                      setHeroContent(prev => ({ ...prev, slides: newSlides }))
                                    }}
                                  />
                                </div>

                                <div className="flex items-center justify-between">
                                  <Label htmlFor="autoplay" className="text-sm">Auto-play</Label>
                                  <Switch
                                    id="autoplay"
                                    checked={heroContent.autoPlay}
                                    onCheckedChange={(checked) => setHeroContent(prev => ({ ...prev, autoPlay: checked }))}
                                  />
                                </div>

                                <div>
                                  <Label className="text-sm">Transition Speed (seconds)</Label>
                                  <Select
                                    value={heroContent.transitionSpeed?.toString()}
                                    onValueChange={(value) => setHeroContent(prev => ({ ...prev, transitionSpeed: parseInt(value) }))}
                                  >
                                    <SelectTrigger className="mt-2 rounded-2xl">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="3">3 seconds</SelectItem>
                                      <SelectItem value="5">5 seconds</SelectItem>
                                      <SelectItem value="7">7 seconds</SelectItem>
                                      <SelectItem value="10">10 seconds</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div>
                                  <Label className="text-sm">Transition Effect</Label>
                                  <Select
                                    value={heroContent.transitionEffect || 'fade'}
                                    onValueChange={(value) => setHeroContent(prev => ({ ...prev, transitionEffect: value }))}
                                  >
                                    <SelectTrigger className="mt-2 rounded-2xl">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="fade">Fade</SelectItem>
                                      <SelectItem value="slide">Slide</SelectItem>
                                      <SelectItem value="zoom">Zoom</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="flex items-center justify-between">
                                  <Label htmlFor="showDots" className="text-sm">Show Navigation Dots</Label>
                                  <Switch
                                    id="showDots"
                                    checked={heroContent.showDots !== false}
                                    onCheckedChange={(checked) => setHeroContent(prev => ({ ...prev, showDots: checked }))}
                                  />
                                </div>

                                <div className="flex items-center justify-between">
                                  <Label htmlFor="showArrows" className="text-sm">Show Navigation Arrows</Label>
                                  <Switch
                                    id="showArrows"
                                    checked={heroContent.showArrows !== false}
                                    onCheckedChange={(checked) => setHeroContent(prev => ({ ...prev, showArrows: checked }))}
                                  />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}

                </div>
              </div>
            )}

            {activeSection === 'brands' && (
              <div className=" mx-auto">
                <div className="mb-6">
                  <h1 className="text-xl font-bold text-gray-900 mb-2">Brand Slider</h1>
                  <p className="text-xl text-gray-600">Manage your brand slider</p>
                </div>

                <div className="space-y-6">
                  {/* Section Title */}
                  <div>
                    <Label className="text-sm font-medium">Page Title for Brand Section</Label>
                    <Input
                      value={sectionTitles.brands}
                      onChange={(e) => setSectionTitles(prev => ({ ...prev, brands: e.target.value }))}
                      placeholder="Enter section title"
                      className="rounded-2xl"
                    />
                  </div>

                  {/* Add New Brand Section */}
                  <Card className="rounded-3xl">
                    <CardHeader>
                      <CardTitle className="text-lg">Add New Brand</CardTitle>
                      <CardDescription>Add a new brand to your brand slider</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Brand Name</Label>
                        <Input
                          placeholder="Enter brand name"
                          value={brandContent.newBrandName || ''}
                          onChange={(e) => setBrandContent(prev => ({ ...prev, newBrandName: e.target.value }))}
                          className="bg-white rounded-2xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Brand Photo</Label>
                        <div className="space-y-2">
                          <Input
                            placeholder="Photo URL or upload below"
                            value={brandContent.newBrandLogo || ''}
                            onChange={(e) => setBrandContent(prev => ({ ...prev, newBrandLogo: e.target.value }))}
                            className="bg-white rounded-2xl"
                          />
                          <ImageUpload
                            onUpload={(url) => setBrandContent(prev => ({ ...prev, newBrandLogo: url }))}
                          />
                        </div>
                      </div>
                      <Button
                        onClick={async () => {
                          if (!brandContent.newBrandName?.trim()) {
                            toast({
                              title: "Error",
                              description: "Please enter a brand name",
                              variant: "destructive",
                            })
                            return
                          }

                          setSavingBrand(true)
                          const newBrand = {
                            name: brandContent.newBrandName.trim(),
                            logo: brandContent.newBrandLogo || '',
                          }

                          const updatedBrands = [...(brandContent.brands || []), newBrand]

                          try {
                            const response = await fetch('/api/business', {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ brandContent: { brands: updatedBrands } }),
                            })

                            if (response.ok) {
                              setBrandContent(prev => ({
                                ...prev,
                                brands: updatedBrands,
                                newBrandName: '',
                                newBrandLogo: '',
                              }))
                              toast({
                                title: "Success",
                                description: "Brand added successfully!",
                              })
                            } else {
                              const errorResult = await response.json()
                              toast({
                                title: "Error",
                                description: `Failed to add brand: ${errorResult.error}`,
                                variant: "destructive",
                              })
                            }
                          } catch (error) {
                            toast({
                              title: "Error",
                              description: "Failed to add brand. Please try again.",
                              variant: "destructive",
                            })
                          } finally {
                            setSavingBrand(false)
                          }
                        }}
                        disabled={savingBrand}
                        className="w-full rounded-2xl"
                      >
                        {savingBrand ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Adding...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Brand
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Brands Table Section */}
                  <Card className="rounded-3xl">
                    <CardContent>
                      {brandContent.brands?.length > 0 ? (
                        <Table>
                          <TableHeader  >
                            <TableRow>
                              <TableHead>Brand Name</TableHead>
                              <TableHead>Logo</TableHead>
                              <TableHead className="w-32">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {brandContent.brands.map((brand: any, index: number) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{brand.name}</TableCell>
                                <TableCell>
                                  {brand.logo ? (
                                    <img
                                      src={getOptimizedImageUrl(brand.logo, { width: 32, height: 32, quality: 85, format: 'auto' })}
                                      alt={brand.name}
                                      className="h-8 w-8 object-cover rounded-2xl"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <div className="h-8 w-8 bg-gray-200 rounded-2xl flex items-center justify-center">
                                      <ImageIcon className="h-4 w-4 text-gray-400" />
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={async () => {
                                        const newName = prompt('Edit brand name:', brand.name)
                                        if (newName && newName.trim()) {
                                          const updatedBrands = [...brandContent.brands]
                                          updatedBrands[index] = { ...brand, name: newName.trim() }

                                          try {
                                            const response = await fetch('/api/business', {
                                              method: 'PUT',
                                              headers: { 'Content-Type': 'application/json' },
                                              body: JSON.stringify({ brandContent: { brands: updatedBrands } }),
                                            })

                                            if (response.ok) {
                                              setBrandContent(prev => ({
                                                ...prev,
                                                brands: updatedBrands
                                              }))
                                              toast({
                                                title: "Success",
                                                description: "Brand updated successfully!",
                                              })
                                            } else {
                                              const errorResult = await response.json()
                                              toast({
                                                title: "Error",
                                                description: `Failed to update brand: ${errorResult.error}`,
                                                variant: "destructive",
                                              })
                                            }
                                          } catch (error) {
                                            toast({
                                              title: "Error",
                                              description: "Failed to update brand. Please try again.",
                                              variant: "destructive",
                                            })
                                          }
                                        }
                                      }}
                                      className="rounded-xl"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setConfirmDialogData({
                                          title: 'Delete Brand',
                                          description: `Are you sure you want to delete "${brand.name}"?`,
                                          action: async () => {
                                            const updatedBrands = brandContent.brands.filter((_, i) => i !== index)

                                            try {
                                              const response = await fetch('/api/business', {
                                                method: 'PUT',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ brandContent: { brands: updatedBrands } }),
                                              })

                                              if (response.ok) {
                                                setBrandContent(prev => ({
                                                  ...prev,
                                                  brands: updatedBrands
                                                }))
                                                toast({
                                                  title: "Success",
                                                  description: "Brand deleted successfully!",
                                                })
                                              } else {
                                                const errorResult = await response.json()
                                                toast({
                                                  title: "Error",
                                                  description: `Failed to delete brand: ${errorResult.error}`,
                                                  variant: "destructive",
                                                })
                                              }
                                            } catch (error) {
                                              toast({
                                                title: "Error",
                                                description: "Failed to delete brand. Please try again.",
                                                variant: "destructive",
                                              })
                                            }

                                            setShowConfirmDialog(false)
                                          }
                                        })
                                        setShowConfirmDialog(true)
                                      }}
                                      className="rounded-xl"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-8">
                          <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No brands to manage</h3>
                          <p className="text-gray-600">Add brands using the editor panel</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeSection === 'categories' && (
              <div className=" mx-auto">
                <div className="mb-6">
                  <h1 className="text-xl font-bold text-gray-900 mb-2">Category Manager</h1>
                  <p className="text-xl text-gray-600">Configure business categories and classifications</p>
                </div>

                <div className="space-y-6">
                  {/* Section Title */}
                  <div>
                    <Label className="text-sm font-medium mb-1">Section Title</Label>
                    <Input
                      value={sectionTitles.categories}
                      onChange={(e) => setSectionTitles(prev => ({ ...prev, categories: e.target.value }))}
                      placeholder="Enter section title"
                      className="bg-white rounded-2xl"
                    />
                  </div>

                  {/* Add New Category Section */}
                  <Card className="rounded-3xl">
                    <CardHeader>
                      <CardTitle className="text-lg">Add New Category</CardTitle>
                      <CardDescription>Add a new category for your products</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Category Name *</Label>
                        <Input
                          placeholder="Enter category name"
                          value={categoryFormData.name}
                          onChange={(e) => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="bg-white rounded-2xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          placeholder="Describe this category"
                          value={categoryFormData.description}
                          onChange={(e) => setCategoryFormData(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                          className="bg-white rounded-2xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Parent Category</Label>
                        <Select
                          value={categoryFormData.parentId || "none"}
                          onValueChange={(value) => setCategoryFormData(prev => ({ ...prev, parentId: value === "none" ? "" : value }))}
                        >
                          <SelectTrigger className="bg-white rounded-2xl">
                            <SelectValue placeholder="Select parent category (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No parent</SelectItem>
                            {categories.filter(cat => !cat.parentId).map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={async () => {
                            if (!categoryFormData.name.trim()) {
                              toast({
                                title: "Error",
                                description: "Category name is required",
                                variant: "destructive",
                              })
                              return
                            }

                            setSavingCategory(true)
                            try {
                              const url = editingCategory
                                ? `/api/business/categories?id=${editingCategory.id}`
                                : '/api/business/categories'
                              const method = editingCategory ? 'PUT' : 'POST'

                              const response = await fetch(url, {
                                method,
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(categoryFormData),
                              })

                              if (response.ok) {
                                const data = await response.json()
                                if (editingCategory) {
                                  setCategories(prev => prev.map(c => c.id === editingCategory.id ? data.category : c))
                                } else {
                                  setCategories(prev => [...prev, data.category])
                                }
                                setCategoryFormData({ name: '', description: '', parentId: '' })
                                setEditingCategory(null)
                                toast({
                                  title: "Success",
                                  description: editingCategory ? 'Category updated successfully!' : 'Category created successfully!',
                                })
                              } else {
                                const errorResult = await response.json()
                                toast({
                                  title: "Error",
                                  description: `Failed to ${editingCategory ? 'update' : 'create'} category: ${errorResult.error}`,
                                  variant: "destructive",
                                })
                              }
                            } catch (error) {
                              toast({
                                title: "Error",
                                description: `Failed to ${editingCategory ? 'update' : 'create'} category`,
                                variant: "destructive",
                              })
                            } finally {
                              setSavingCategory(false)
                            }
                          }}
                          disabled={savingCategory}
                          className="rounded-2xl"
                        >
                          {savingCategory ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Saving...
                            </>
                          ) : (
                            editingCategory ? 'Update Category' : 'Add Category'
                          )}
                        </Button>
                        {editingCategory && (
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEditingCategory(null)
                              setCategoryFormData({ name: '', description: '', parentId: '' })
                            }}
                            className="rounded-2xl"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Categories Table Section */}
                  <Card className="rounded-3xl">
                    <CardContent>
                      {categories.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Category Name</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Parent</TableHead>
                              <TableHead className="w-32">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {categories.map((category) => (
                              <TableRow key={category.id}>
                                <TableCell className="font-medium">{category.name}</TableCell>
                                <TableCell>{category.description || '—'}</TableCell>
                                <TableCell>
                                  {category.parent ? category.parent.name : '—'}
                                </TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setEditingCategory(category)
                                        setCategoryFormData({
                                          name: category.name,
                                          description: category.description || '',
                                          parentId: category.parentId || '',
                                        })
                                      }}
                                      className="rounded-xl"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDeleteCategory(category)}
                                      className="rounded-xl"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-8">
                          <Grid3X3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
                          <p className="text-gray-600">Add your first category using the form above</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeSection === 'products' && (
              <div className=" mx-auto">
                <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Products & Services</h1>
                    <p className="text-xl text-gray-600">Manage your product offerings</p>
                  </div>
                  <Button onClick={() => {
                    setEditingProduct(null);
                    setProductFormData({
                      name: '',
                      description: '',
                      price: '',
                      image: '',
                      categoryId: '',
                      brandName: '',
                      additionalInfo: {},
                      inStock: true,
                      isActive: true,
                    });
                    setShowProductDialog(true);
                  }} className="rounded-2xl">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </div>

                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search products..."
                      className="w-full bg-white rounded-2xl"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value === "all" ? "" : value)}>
                    <SelectTrigger className="w-full bg-white sm:w-48 rounded-2xl">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Card className="rounded-3xl">
                  <CardContent className="p-0">
                    {mounted && selectedProducts.length > 0 && (
                      <div className="p-4 bg-blue-50 border-b border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-blue-900">
                            {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setConfirmDialogData({
                                title: 'Activate Products',
                                description: `Are you sure you want to activate ${selectedProducts.length} product${selectedProducts.length > 1 ? 's' : ''}?`,
                                action: async () => {
                                  try {
                                    await Promise.all(selectedProducts.map(id =>
                                      fetch(`/api/business/products/${id}`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ isActive: true }),
                                      })
                                    ))
                                    await fetchData()
                                    setSelectedProducts([])
                                    toast({
                                      title: "Success",
                                      description: "Products activated successfully!",
                                    })
                                  } catch (error) {
                                    toast({
                                      title: "Error",
                                      description: "Failed to activate products",
                                      variant: "destructive",
                                    })
                                  }
                                }
                              })
                              setShowConfirmDialog(true)
                            }}
                            className="rounded-xl"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Activate
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setConfirmDialogData({
                                title: 'Deactivate Products',
                                description: `Are you sure you want to deactivate ${selectedProducts.length} product${selectedProducts.length > 1 ? 's' : ''}?`,
                                action: async () => {
                                  try {
                                    await Promise.all(selectedProducts.map(id =>
                                      fetch(`/api/business/products/${id}`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ isActive: false }),
                                      })
                                    ))
                                    await fetchData()
                                    setSelectedProducts([])
                                    toast({
                                      title: "Success",
                                      description: "Products deactivated successfully!",
                                    })
                                  } catch (error) {
                                    toast({
                                      title: "Error",
                                      description: "Failed to deactivate products",
                                      variant: "destructive",
                                    })
                                  }
                                }
                              })
                              setShowConfirmDialog(true)
                            }}
                            className="rounded-xl"
                          >
                            <Pause className="h-4 w-4 mr-2" />
                            Deactivate
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setConfirmDialogData({
                                title: 'Delete Products',
                                description: `Are you sure you want to delete ${selectedProducts.length} product${selectedProducts.length > 1 ? 's' : ''}? This action cannot be undone.`,
                                action: async () => {
                                  try {
                                    await Promise.all(selectedProducts.map(id =>
                                      fetch(`/api/business/products/${id}`, { method: 'DELETE' })
                                    ))
                                    await fetchData()
                                    setSelectedProducts([])
                                    toast({
                                      title: "Success",
                                      description: "Products deleted successfully!",
                                    })
                                  } catch (error) {
                                    toast({
                                      title: "Error",
                                      description: "Failed to delete products",
                                      variant: "destructive",
                                    })
                                  }
                                }
                              })
                              setShowConfirmDialog(true)
                            }}
                            className="rounded-xl"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => setSelectedProducts([])} className="rounded-xl">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <div className="overflow-x-auto border border-gray-200">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">
                              <Checkbox
                                checked={selectedProducts.length === products.filter(p =>
                                  p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                                  (selectedCategory === '' || p.categoryId === selectedCategory)
                                ).length && selectedProducts.length > 0}
                                onCheckedChange={(checked) => {
                                  const filteredProducts = products.filter(p =>
                                    p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                                    (selectedCategory === '' || p.categoryId === selectedCategory)
                                  )
                                  if (checked) {
                                    setSelectedProducts(filteredProducts.map(p => p.id))
                                  } else {
                                    setSelectedProducts([])
                                  }
                                }}
                              />
                            </TableHead>
                            <TableHead>Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Brand</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-32">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {products
                            .filter((product) =>
                              product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                              (selectedCategory === '' || product.categoryId === selectedCategory)
                            )
                            .map((product) => (
                              <TableRow key={product.id}>
                                <TableCell>
                                  <Checkbox
                                    checked={selectedProducts.includes(product.id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedProducts(prev => [...prev, product.id])
                                      } else {
                                        setSelectedProducts(prev => prev.filter(id => id !== product.id))
                                      }
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  {product.image ? (
                                    <img
                                      src={getOptimizedImageUrl(product.image, { width: 50, height: 50, quality: 85, format: 'auto' })}
                                      alt={product.name}
                                      className="w-12 h-12 object-cover rounded-2xl"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 bg-gray-200 rounded-2xl flex items-center justify-center">
                                      <ImageIcon className="h-6 w-6 text-gray-400" />
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell>
                                  {product.category ? (
                                    <Badge variant="secondary" className="rounded-full">{product.category.name}</Badge>
                                  ) : (
                                    <span className="text-gray-400">—</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {product.brandName ? (
                                    <Badge variant="outline" className="rounded-full">{product.brandName}</Badge>
                                  ) : (
                                    <span className="text-gray-400">—</span>
                                  )}
                                </TableCell>
                                <TableCell>{product.price || '—'}</TableCell>
                                <TableCell>
                                  <Badge variant={product.inStock ? "default" : "destructive"} className="rounded-full">
                                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button size="sm" variant="outline" onClick={() => {
                                      handleProductEdit(product);
                                      setShowProductDialog(true);
                                    }} className="rounded-xl">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => handleShare(product)} className="rounded-xl">
                                      <Share2 className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleProductDelete(product)} className="rounded-xl">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                    {products.length === 0 && (
                      <div className="text-center py-12">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
                        <p className="text-gray-600 mb-4">Add your first product or service to get started</p>
                        <Button onClick={() => {
                          setEditingProduct(null);
                          setProductFormData({
                            name: '',
                            description: '',
                            price: '',
                            image: '',
                            categoryId: '',
                            brandName: '',
                            additionalInfo: {},
                            inStock: true,
                            isActive: true,
                          });
                          setShowProductDialog(true);
                        }} className="rounded-2xl">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Product
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === 'inquiries' && (
              <div className=" mx-auto">
                <div className="mb-8">
                  <h1 className="text-xl font-bold text-gray-900 mb-2">Customer Inquiries</h1>
                  <p className="text-xl text-gray-600">View and respond to customer inquiries</p>
                </div>

                {inquiries.length === 0 ? (
                  <Card className="rounded-3xl">
                    <CardContent className="text-center py-12">
                      <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No inquiries yet</h3>
                      <p className="text-gray-600">Customer inquiries will appear here when people contact you</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl transition-all duration-300 hover:shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-gray-900">Total</CardTitle>
                          <Mail className="h-4 w-4 text-gray-400" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-gray-900">{stats.totalInquiries}</div>
                          <p className="text-xs text-gray-500">All inquiries</p>
                        </CardContent>
                      </Card>
                        <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl transition-all duration-300 hover:shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-gray-900">New</CardTitle>
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-gray-900">{stats.newInquiries}</div>
                          <p className="text-xs text-gray-500">Awaiting review</p>
                        </CardContent>
                      </Card>
                        <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl transition-all duration-300 hover:shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-gray-900">Read</CardTitle>
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-gray-900">{stats.readInquiries}</div>
                          <p className="text-xs text-gray-500">Viewed</p>
                        </CardContent>
                      </Card>
                        <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl transition-all duration-300 hover:shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-gray-900">Replied</CardTitle>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-gray-900">{stats.repliedInquiries}</div>
                          <p className="text-xs text-gray-500">Response sent</p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-4">
                      {inquiries.slice(0, 10).map((inquiry) => (
                        <Card key={inquiry.id} className="border-l-4 border-l-blue-500 rounded-3xl transition-all duration-300 hover:shadow-lg">
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h4 className="font-semibold text-lg">{inquiry.name}</h4>
                                  <Badge variant={
                                    inquiry.status === 'NEW' ? 'destructive' :
                                      inquiry.status === 'READ' ? 'default' :
                                        inquiry.status === 'REPLIED' ? 'secondary' :
                                          'outline'
                                  } className="rounded-full">
                                    {inquiry.status === 'NEW' ? 'New' :
                                      inquiry.status === 'READ' ? 'Read' :
                                        inquiry.status === 'REPLIED' ? 'Replied' : 'Closed'}
                                  </Badge>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-gray-600">
                                  <div className="flex items-center space-x-1">
                                    <Mail className="h-4 w-4" />
                                    <a href={`mailto:${inquiry.email}`} className="text-blue-600 hover:underline">
                                      {inquiry.email}
                                    </a>
                                  </div>
                                  {inquiry.phone && (
                                    <div className="flex items-center space-x-1">
                                      <Phone className="h-4 w-4" />
                                      <a href={`tel:${inquiry.phone}`} className="text-blue-600 hover:underline">
                                        {inquiry.phone}
                                      </a>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{formatDate(inquiry.createdAt)}</span>
                                </div>
                              </div>
                              {inquiry.product && (
                                <div className="flex items-center space-x-2 mt-2">
                                  <Package className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm text-gray-600">
                                    Regarding: <strong>{inquiry.product.name}</strong>
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="mb-4">
                              <p className="text-gray-700 whitespace-pre-wrap">{inquiry.message}</p>
                              <Separator />

                              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                                {inquiry.status === 'NEW' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleInquiryStatusUpdate(inquiry.id, 'READ')}
                                    className="rounded-xl"
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    Mark as Read
                                  </Button>
                                )}
                                {(inquiry.status === 'NEW' || inquiry.status === 'READ') && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleInquiryStatusUpdate(inquiry.id, 'REPLIED')}
                                    className="rounded-xl"
                                  >
                                    <Mail className="h-4 w-4 mr-1" />
                                    Mark as Replied
                                  </Button>
                                )}
                                {(inquiry.status === 'NEW' || inquiry.status === 'READ' || inquiry.status === 'REPLIED') && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleInquiryStatusUpdate(inquiry.id, 'CLOSED')}
                                    className="rounded-xl"
                                  >
                                    <FileText className="h-4 w-4 mr-1" />
                                    Close
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                      {/* Fixed Action Buttons */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg z-10">
                        <div className="flex justify-end space-x-3">
                          <Button
                            variant="outline"
                            onClick={() => {
                              // Cancel logic for other sections
                            }}
                            className="rounded-2xl flex-1"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={async () => {
                              if (activeSection === 'info') {
                                await handleBasicInfoSave({ preventDefault: () => { } } as any);
                              } else if (activeSection === 'hero') {
                                if (!business) return;
                                try {
                                  const response = await fetch('/api/business', {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ heroContent }),
                                  });
                                  if (response.ok) {
                                    const result = await response.json();
                                    setBusiness(result.business);
                                    toast({
                                      title: "Success",
                                      description: "Hero content saved successfully!",
                                    });
                                  } else {
                                    toast({
                                      title: "Error",
                                      description: "Failed to save hero content",
                                      variant: "destructive",
                                    });
                                  }
                                } catch (error) {
                                  toast({
                                    title: "Error",
                                    description: "Failed to save hero content",
                                    variant: "destructive",
                                  });
                                }
                              } else if (activeSection === 'brands') {
                                if (!business) return;
                                try {
                                  const { newBrandName, newBrandLogo, ...cleanBrandContent } = brandContent;
                                  const response = await fetch('/api/business', {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ brandContent: cleanBrandContent }),
                                  });
                                  if (response.ok) {
                                    const result = await response.json();
                                    setBusiness(result.business);
                                    toast({
                                      title: "Success",
                                      description: "Brand content saved successfully!",
                                    });
                                  } else {
                                    toast({
                                      title: "Error",
                                      description: "Failed to save brand content",
                                      variant: "destructive",
                                    });
                                  }
                                } catch (error) {
                                  toast({
                                    title: "Error",
                                    description: "Failed to save brand content",
                                    variant: "destructive",
                                  });
                                }
                              } else if (activeSection === 'products' && showProductRightbar) {
                                setIsLoading(true);
                                try {
                                  const url = editingProduct
                                    ? `/api/business/products/${editingProduct.id}`
                                    : '/api/business/products';
                                  const method = editingProduct ? 'PUT' : 'POST';
                                  const response = await fetch(url, {
                                    method,
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(productFormData),
                                  });
                                  if (response.ok) {
                                    await fetchData();
                                    setShowProductRightbar(false);
                                    setEditingProduct(null);
                                    setProductFormData({
                                      name: '',
                                      description: '',
                                      price: '',
                                      image: '',
                                      categoryId: '',
                                      brandName: '',
                                      additionalInfo: {},
                                      inStock: true,
                                      isActive: true,
                                    });
                                    toast({
                                      title: "Success",
                                      description: editingProduct ? 'Product updated successfully!' : 'Product added successfully!',
                                    });
                                  } else {
                                    const errorResult = await response.json();
                                    toast({
                                      title: "Error",
                                      description: `Failed to ${editingProduct ? 'update' : 'add'} product: ${errorResult.error}`,
                                      variant: "destructive",
                                    });
                                  }
                                } catch (error) {
                                  toast({
                                    title: "Error",
                                    description: `Failed to ${editingProduct ? 'update' : 'add'} product. Please try again.`,
                                    variant: "destructive",
                                  });
                                } finally {
                                  setIsLoading(false);
                                }
                              } else if (activeSection === 'categories' && showRightPanel) {
                                setShowRightPanel(false);
                                setEditingCategory(null);
                                setCategoryFormData({ name: '', description: '', parentId: '' });
                              }
                            }}
                            disabled={savingStates.basicInfo || isLoading}
                            className="rounded-2xl flex-1"
                          >
                            {savingStates.basicInfo || isLoading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'analytics' && (
              <div className=" mx-auto">
                <div className="mb-8">
                  <h1 className="text-xl font-bold text-gray-900 mb-2">Analytics</h1>
                  <p className="text-xl text-gray-600">Track your business performance</p>
                </div>
                <Card className="rounded-3xl">
                  <CardContent className="text-center py-12">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Coming Soon</h3>
                    <p className="text-gray-600">Detailed analytics and insights will be available here</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === 'settings' && (
              <div className=" mx-auto">
                <div className="mb-8">
                  <h1 className="text-xl font-bold text-gray-900 mb-2">Settings</h1>
                  <p className="text-xl text-gray-600">Manage your account and preferences</p>
                </div>
                <Card className="rounded-3xl">
                  <CardContent className="text-center py-12">
                    <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Settings Coming Soon</h3>
                    <p className="text-gray-600">Account settings and preferences will be available here</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Right Editor Panel - Fixed Width */}
        {(activeSection === 'categories' && showRightPanel) || (activeSection === 'profile' && showRightPanel) && (
          <div className={`${isMobile ? 'fixed bottom-0 left-0 right-0 z-50 h-96' : 'w-[480px]'} m-4 border rounded-3xl bg-white border-gray-200 flex flex-col shadow-sm transition-all duration-300 ease-in-out relative`}>
            <div className="p-4  px-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {selectedProfileSection === 'hero' && ' Hero Section Editor'}
                {selectedProfileSection === 'info' && 'Business Info Editor'}
                {selectedProfileSection === 'brands' && ' Brand Slider Editor'}
                {selectedProfileSection === 'categories' && ' Categories Editor'}
                {selectedProfileSection === 'portfolio' && ' Portfolio Editor'}
                {selectedProfileSection === 'content' && ' Additional Content Editor'}
                {selectedProfileSection === 'footer' && ' Footer Editor'}
                {activeSection === 'products' && showProductRightbar && (editingProduct ? 'Edit Product' : 'Add New Product')}
                {activeSection === 'categories' && showRightPanel && (editingCategory ? 'Edit Category' : 'Add New Category')}
              </h3>
              {activeSection === 'products' && showProductRightbar ? (
                <Button variant="outline" size="sm" onClick={() => {
                  setShowProductRightbar(false)
                  setEditingProduct(null)
                  setProductFormData({
                    name: '',
                    description: '',
                    price: '',
                    image: '',
                    categoryId: '',
                    brandName: '',
                    additionalInfo: {},
                    inStock: true,
                    isActive: true,
                  })
                }} className="rounded-xl">
                  <X className="h-4 w-4" />
                </Button>
              ) : activeSection === 'categories' && showRightPanel ? (
                <Button variant="outline" size="sm" onClick={() => {
                  setShowRightPanel(false)
                  setEditingCategory(null)
                  setCategoryFormData({ name: '', description: '', parentId: '' })
                }} className="rounded-xl">
                  <X className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
            <div className="flex-1 overflow-auto p-4 sm:p-6 hide-scrollbar">
              {activeSection === 'profile' && (
                <>
                  {selectedProfileSection ? (
                    <>

                    </>
                  ) : (
                    <div className="text-center py-12">
                      <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Get Started</h3>
                      <p className="text-gray-600 mb-6">
                          Click on any section tab above or in preview to start editing your profile.
                        </p>
                        <p className="text-sm text-gray-500">
                        Tip: You can also click directly on sections in full page preview to edit them.
                      </p>
                    </div>
                  )}

                  {selectedProfileSection === 'hero' && (
                    <div className="space-y-6">
                      {/* Section Title */}
                      <div>
                        <Label className="text-sm font-medium">Section Title</Label>
                        <Input
                          value={sectionTitles.hero}
                          onChange={(e) => setSectionTitles(prev => ({ ...prev, hero: e.target.value }))}
                          placeholder="Enter section title"
                          className="bg-white rounded-2xl"
                        />
                      </div>

                      {/* Slide Selector and Add Button */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="flex-1 w-full">
                          <Label className="text-sm font-medium">Select Slide</Label>
                          <Select
                            value={selectedSlideIndex?.toString()}
                            onValueChange={(value) => setSelectedSlideIndex(parseInt(value))}
                          >
                            <SelectTrigger className="rounded-2xl w-full">
                              <SelectValue placeholder="Select a slide to edit" />
                            </SelectTrigger>
                            <SelectContent>
                              {heroContent.slides?.map((slide: any, index: number) => (
                                <SelectItem key={index} value={index.toString()}>
                                  {index + 1}: {slide.headline || 'Untitled'}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-2 mt-4 sm:mt-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (selectedSlideIndex > 0) {
                                const newSlides = [...heroContent.slides]
                                const temp = newSlides[selectedSlideIndex]
                                newSlides[selectedSlideIndex] = newSlides[selectedSlideIndex - 1]
                                newSlides[selectedSlideIndex - 1] = temp
                                setHeroContent(prev => ({ ...prev, slides: newSlides }))
                                setSelectedSlideIndex(selectedSlideIndex - 1)
                              }
                            }}
                            disabled={selectedSlideIndex === 0}
                            className="rounded-xl"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (selectedSlideIndex < heroContent.slides.length - 1) {
                                const newSlides = [...heroContent.slides]
                                const temp = newSlides[selectedSlideIndex]
                                newSlides[selectedSlideIndex] = newSlides[selectedSlideIndex + 1]
                                newSlides[selectedSlideIndex + 1] = temp
                                setHeroContent(prev => ({ ...prev, slides: newSlides }))
                                setSelectedSlideIndex(selectedSlideIndex + 1)
                              }
                            }}
                            disabled={selectedSlideIndex === heroContent.slides.length - 1}
                            className="rounded-xl"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newSlides = heroContent.slides.filter((_, i) => i !== selectedSlideIndex)
                              setHeroContent(prev => ({ ...prev, slides: newSlides }))
                              setSelectedSlideIndex(Math.max(0, selectedSlideIndex - 1))
                            }}
                            className="rounded-xl"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => {
                              const newSlide = {
                                mediaType: 'image',
                                media: '',
                                headline: '',
                                headlineSize: 'text-4xl md:text-6xl',
                                headlineColor: '#ffffff',
                                headlineAlignment: 'center',
                                subtext: '',
                                subtextSize: 'text-xl md:text-2xl',
                                subtextColor: '#ffffff',
                                subtextAlignment: 'center',
                                cta: 'Get in Touch',
                                ctaLink: ''
                              }
                              setHeroContent(prev => ({ ...prev, slides: [...prev.slides, newSlide] }))
                              setSelectedSlideIndex(heroContent.slides.length)
                            }}
                            className="rounded-2xl"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Slide
                          </Button>
                        </div>
                      </div>

                      {/* Tabs */}
                      <div className="border-b">
                        <div className="flex space-x-8 overflow-x-auto">
                          <button
                            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'content'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700'
                              }`}
                            onClick={() => setActiveTab('content')}
                          >
                            Content
                          </button>
                          <button
                            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'style'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700'
                              }`}
                            onClick={() => setActiveTab('style')}
                          >
                            Style
                          </button>
                          <button
                            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'settings'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700'
                              }`}
                            onClick={() => setActiveTab('settings')}
                          >
                            Settings
                          </button>
                        </div>
                      </div>

                      {/* Tab Content */}
                      {selectedSlideIndex !== null && heroContent.slides[selectedSlideIndex] && (
                        <div className="space-y-6">
                          {activeTab === 'content' && (
                            <Card className="rounded-3xl">
                              <CardContent className="pt-6">
                                <div className="space-y-6">
                                  {/* Background Media */}
                                  <div>
                                    <Label className="text-sm font-medium">Background Media</Label>
                                    <div className="mt-2 space-y-3">
                                      <Select
                                        value={heroContent.slides[selectedSlideIndex].mediaType || 'image'}
                                        onValueChange={(value) => {
                                          const newSlides = [...heroContent.slides]
                                          newSlides[selectedSlideIndex] = { ...newSlides[selectedSlideIndex], mediaType: value }
                                          setHeroContent(prev => ({ ...prev, slides: newSlides }))
                                        }}
                                      >
                                        <SelectTrigger className="rounded-2xl">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="image">Image</SelectItem>
                                          <SelectItem value="video">Video</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <Input
                                        placeholder="Media URL"
                                        value={heroContent.slides[selectedSlideIndex].media || ''}
                                        onChange={(e) => {
                                          const newSlides = [...heroContent.slides]
                                          newSlides[selectedSlideIndex] = { ...newSlides[selectedSlideIndex], media: e.target.value }
                                          setHeroContent(prev => ({ ...prev, slides: newSlides }))
                                        }}
                                        className="rounded-2xl"
                                      />
                                      <ImageUpload
                                        allowVideo={true}
                                        aspectRatio={16/9}
                                        onUpload={(url) => {
                                          const newSlides = [...heroContent.slides]
                                          newSlides[selectedSlideIndex] = { ...newSlides[selectedSlideIndex], media: url }
                                          setHeroContent(prev => ({ ...prev, slides: newSlides }))
                                        }}
                                      />
                                    </div>
                                  </div>

                                  {/* Headline */}
                                  <div>
                                    <Label className="text-sm font-medium">Headline</Label>
                                    <Input
                                      placeholder="Enter headline"
                                      value={heroContent.slides[selectedSlideIndex].headline || ''}
                                      onChange={(e) => {
                                        const newSlides = [...heroContent.slides]
                                        newSlides[selectedSlideIndex] = { ...newSlides[selectedSlideIndex], headline: e.target.value }
                                        setHeroContent(prev => ({ ...prev, slides: newSlides }))
                                      }}
                                      className="mt-2 rounded-2xl"
                                    />
                                  </div>

                                  {/* Subtext */}
                                  <div>
                                    <Label className="text-sm font-medium">Subtext</Label>
                                    <Textarea
                                      placeholder="Enter subtext"
                                      rows={3}
                                      value={heroContent.slides[selectedSlideIndex].subtext || ''}
                                      onChange={(e) => {
                                        const newSlides = [...heroContent.slides]
                                        newSlides[selectedSlideIndex] = { ...newSlides[selectedSlideIndex], subtext: e.target.value }
                                        setHeroContent(prev => ({ ...prev, slides: newSlides }))
                                      }}
                                      className="mt-2 rounded-2xl"
                                    />
                                  </div>

                                  {/* CTA */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm font-medium">CTA Text</Label>
                                      <Input
                                        placeholder="Call to action text"
                                        value={heroContent.slides[selectedSlideIndex].cta || ''}
                                        onChange={(e) => {
                                          const newSlides = [...heroContent.slides]
                                          newSlides[selectedSlideIndex] = { ...newSlides[selectedSlideIndex], cta: e.target.value }
                                          setHeroContent(prev => ({ ...prev, slides: newSlides }))
                                        }}
                                        className="mt-2 rounded-2xl"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">CTA Link</Label>
                                      <Input
                                        placeholder="https://..."
                                        value={heroContent.slides[selectedSlideIndex].ctaLink || ''}
                                        onChange={(e) => {
                                          const newSlides = [...heroContent.slides]
                                          newSlides[selectedSlideIndex] = { ...newSlides[selectedSlideIndex], ctaLink: e.target.value }
                                          setHeroContent(prev => ({ ...prev, slides: newSlides }))
                                        }}
                                        className="mt-2 rounded-2xl"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {activeTab === 'style' && (
                            <Card className="rounded-3xl">
                              <CardContent className="pt-6">
                                <div className="space-y-6">
                                  {/* Headline Style */}
                                  <div>
                                    <h3 className="text-sm font-medium mb-4">Headline Style</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div>
                                        <Label className="text-sm">Size</Label>
                                        <Select
                                          value={heroContent.slides[selectedSlideIndex].headlineSize || 'text-4xl md:text-6xl'}
                                          onValueChange={(value) => {
                                            const newSlides = [...heroContent.slides]
                                            newSlides[selectedSlideIndex] = { ...newSlides[selectedSlideIndex], headlineSize: value }
                                            setHeroContent(prev => ({ ...prev, slides: newSlides }))
                                          }}
                                        >
                                          <SelectTrigger className="mt-2 rounded-2xl">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">Small</SelectItem>
                                            <SelectItem value="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">Medium</SelectItem>
                                            <SelectItem value="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">Large</SelectItem>
                                            <SelectItem value="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">Extra Large</SelectItem>
                                            <SelectItem value="text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl">Huge</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div>
                                        <Label className="text-sm">Color</Label>
                                        <div className="flex items-center gap-2 mt-2">
                                          <Input
                                            type="color"
                                            value={heroContent.slides[selectedSlideIndex].headlineColor || '#ffffff'}
                                            onChange={(e) => {
                                              const newSlides = [...heroContent.slides]
                                              newSlides[selectedSlideIndex] = { ...newSlides[selectedSlideIndex], headlineColor: e.target.value }
                                              setHeroContent(prev => ({ ...prev, slides: newSlides }))
                                            }}
                                            className="w-12 h-10 p-1 rounded-2xl"
                                          />
                                          <Input
                                            value={heroContent.slides[selectedSlideIndex].headlineColor || '#ffffff'}
                                            onChange={(e) => {
                                              const newSlides = [...heroContent.slides]
                                              newSlides[selectedSlideIndex] = { ...newSlides[selectedSlideIndex], headlineColor: e.target.value }
                                              setHeroContent(prev => ({ ...prev, slides: newSlides }))
                                            }}
                                            placeholder="#ffffff"
                                            className="rounded-2xl"
                                          />
                                        </div>
                                      </div>
                                      <div>
                                        <Label className="text-sm">Alignment</Label>
                                        <Select
                                          value={heroContent.slides[selectedSlideIndex].headlineAlignment || 'center'}
                                          onValueChange={(value) => {
                                            const newSlides = [...heroContent.slides]
                                            newSlides[selectedSlideIndex] = { ...newSlides[selectedSlideIndex], headlineAlignment: value }
                                            setHeroContent(prev => ({ ...prev, slides: newSlides }))
                                          }}
                                        >
                                          <SelectTrigger className="mt-2 rounded-2xl">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="left">Left</SelectItem>
                                            <SelectItem value="center">Center</SelectItem>
                                            <SelectItem value="right">Right</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Subtext Style */}
                                  <div>
                                    <h3 className="text-sm font-medium mb-4">Subtext Style</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div>
                                        <Label className="text-sm">Size</Label>
                                        <Select
                                          value={heroContent.slides[selectedSlideIndex].subtextSize || 'text-xl md:text-2xl'}
                                          onValueChange={(value) => {
                                            const newSlides = [...heroContent.slides]
                                            newSlides[selectedSlideIndex] = { ...newSlides[selectedSlideIndex], subtextSize: value }
                                            setHeroContent(prev => ({ ...prev, slides: newSlides }))
                                          }}
                                        >
                                          <SelectTrigger className="mt-2 rounded-2xl">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl">Small</SelectItem>
                                            <SelectItem value="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl">Medium</SelectItem>
                                            <SelectItem value="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl">Large</SelectItem>
                                            <SelectItem value="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl">Extra Large</SelectItem>
                                            <SelectItem value="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl">Huge</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div>
                                        <Label className="text-sm">Color</Label>
                                        <div className="flex items-center gap-2 mt-2">
                                          <Input
                                            type="color"
                                            value={heroContent.slides[selectedSlideIndex].subtextColor || '#ffffff'}
                                            onChange={(e) => {
                                              const newSlides = [...heroContent.slides]
                                              newSlides[selectedSlideIndex] = { ...newSlides[selectedSlideIndex], subtextColor: e.target.value }
                                              setHeroContent(prev => ({ ...prev, slides: newSlides }))
                                            }}
                                            className="w-12 h-10 p-1 rounded-2xl"
                                          />
                                          <Input
                                            value={heroContent.slides[selectedSlideIndex].subtextColor || '#ffffff'}
                                            onChange={(e) => {
                                              const newSlides = [...heroContent.slides]
                                              newSlides[selectedSlideIndex] = { ...newSlides[selectedSlideIndex], subtextColor: e.target.value }
                                              setHeroContent(prev => ({ ...prev, slides: newSlides }))
                                            }}
                                            placeholder="#ffffff"
                                            className="rounded-2xl"
                                          />
                                        </div>
                                      </div>
                                      <div>
                                        <Label className="text-sm">Alignment</Label>
                                        <Select
                                          value={heroContent.slides[selectedSlideIndex].subtextAlignment || 'center'}
                                          onValueChange={(value) => {
                                            const newSlides = [...heroContent.slides]
                                            newSlides[selectedSlideIndex] = { ...newSlides[selectedSlideIndex], subtextAlignment: value }
                                            setHeroContent(prev => ({ ...prev, slides: newSlides }))
                                          }}
                                        >
                                          <SelectTrigger className="mt-2 rounded-2xl">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="left">Left</SelectItem>
                                            <SelectItem value="center">Center</SelectItem>
                                            <SelectItem value="right">Right</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {activeTab === 'settings' && (
                            <Card className="rounded-3xl">
                              <CardContent className="pt-6">
                                <div className="space-y-6">
                                  <h3 className="text-sm font-medium">Slider Settings</h3>

                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <Label htmlFor="showText" className="text-sm">Show Text Overlay</Label>
                                      <Switch
                                        id="showText"
                                        checked={heroContent.slides[selectedSlideIndex]?.showText !== false}
                                        onCheckedChange={(checked) => {
                                          const newSlides = [...heroContent.slides]
                                          newSlides[selectedSlideIndex] = { ...newSlides[selectedSlideIndex], showText: checked }
                                          setHeroContent(prev => ({ ...prev, slides: newSlides }))
                                        }}
                                      />
                                    </div>

                                    <div className="flex items-center justify-between">
                                      <Label htmlFor="autoplay" className="text-sm">Auto-play</Label>
                                      <Switch
                                        id="autoplay"
                                        checked={heroContent.autoPlay}
                                        onCheckedChange={(checked) => setHeroContent(prev => ({ ...prev, autoPlay: checked }))}
                                      />
                                    </div>

                                    <div>
                                      <Label className="text-sm">Transition Speed (seconds)</Label>
                                      <Select
                                        value={heroContent.transitionSpeed?.toString()}
                                        onValueChange={(value) => setHeroContent(prev => ({ ...prev, transitionSpeed: parseInt(value) }))}
                                      >
                                        <SelectTrigger className="mt-2 rounded-2xl">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="3">3 seconds</SelectItem>
                                          <SelectItem value="5">5 seconds</SelectItem>
                                          <SelectItem value="7">7 seconds</SelectItem>
                                          <SelectItem value="10">10 seconds</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div>
                                      <Label className="text-sm">Transition Effect</Label>
                                      <Select
                                        value={heroContent.transitionEffect || 'fade'}
                                        onValueChange={(value) => setHeroContent(prev => ({ ...prev, transitionEffect: value }))}
                                      >
                                        <SelectTrigger className="mt-2 rounded-2xl">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="fade">Fade</SelectItem>
                                          <SelectItem value="slide">Slide</SelectItem>
                                          <SelectItem value="zoom">Zoom</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div className="flex items-center justify-between">
                                      <Label htmlFor="showDots" className="text-sm">Show Navigation Dots</Label>
                                      <Switch
                                        id="showDots"
                                        checked={heroContent.showDots !== false}
                                        onCheckedChange={(checked) => setHeroContent(prev => ({ ...prev, showDots: checked }))}
                                      />
                                    </div>

                                    <div className="flex items-center justify-between">
                                      <Label htmlFor="showArrows" className="text-sm">Show Navigation Arrows</Label>
                                      <Switch
                                        id="showArrows"
                                        checked={heroContent.showArrows !== false}
                                        onCheckedChange={(checked) => setHeroContent(prev => ({ ...prev, showArrows: checked }))}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      )}

                    </div>
                  )}

                  {selectedProfileSection === 'info' && (
                    <div className="space-y-6">
                      <div>
                        <Label className="text-sm font-medium">Section Title</Label>
                        <Input
                          value={sectionTitles.info}
                          onChange={(e) => setSectionTitles(prev => ({ ...prev, info: e.target.value }))}
                          placeholder="Enter section title"
                          className="rounded-2xl"
                        />
                      </div>

                      <div>

                        <div className="mt-2 space-y-4">
                          <div>
                            <Label>Business Name</Label>
                            <Input
                              name="name"
                              value={businessInfoFormData.name}
                              onChange={(e) => setBusinessInfoFormData(prev => ({ ...prev, name: e.target.value }))}
                              className="bg-white rounded-2xl"
                              required
                            />
                          </div>
                          <div>
                            <Label>Owner Name</Label>
                            <Input
                              value={businessInfoFormData.ownerName}
                              onChange={(e) => setBusinessInfoFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                              className="rounded-2xl"
                            />
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Textarea
                              value={businessInfoFormData.description}
                              onChange={(e) => setBusinessInfoFormData(prev => ({ ...prev, description: e.target.value }))}
                              rows={3}
                              className="rounded-2xl"
                            />
                          </div>
                          <div>
                            <Label>About Section</Label>
                            <Textarea
                              value={businessInfoFormData.about}
                              onChange={(e) => setBusinessInfoFormData(prev => ({ ...prev, about: e.target.value }))}
                              rows={3}
                              placeholder="Detailed about section content"
                              className="rounded-2xl"
                            />
                          </div>
                          {/* <div>
                            <Label>Catalog PDF URL</Label>
                            <div className="space-y-2">
                              <Input
                                value={businessInfoFormData.catalogPdf}
                                onChange={(e) => setBusinessInfoFormData(prev => ({ ...prev, catalogPdf: e.target.value }))}
                                placeholder="https://..."
                                className="rounded-2xl"
                              />
                              <ImageUpload
                                accept=".pdf"
                                onUpload={(url) => setBusinessInfoFormData(prev => ({ ...prev, catalogPdf: url }))}
                              />
                            </div>
                          </div> */}
                          <div>
                            <Label>GST Number</Label>
                            <Input
                              value={businessInfoFormData.gstNumber}
                              onChange={(e) => setBusinessInfoFormData(prev => ({ ...prev, gstNumber: e.target.value }))}
                              placeholder="Enter GST number"
                              className="rounded-2xl"
                            />
                          </div>
                          <div>
                            <Label>Opening Hours</Label>
                            <div className="space-y-2">
                              {businessInfoFormData.openingHours?.map((hour: any, index: number) => (
                                <div key={index} className="flex gap-2 items-center">
                                  <Input
                                    value={hour.day}
                                    onChange={(e) => {
                                      const newHours = [...businessInfoFormData.openingHours]
                                      newHours[index].day = e.target.value
                                      setBusinessInfoFormData(prev => ({ ...prev, openingHours: newHours }))
                                    }}
                                    placeholder="Day"
                                    className="rounded-2xl"
                                  />
                                  <Input
                                    value={hour.open}
                                    onChange={(e) => {
                                      const newHours = [...businessInfoFormData.openingHours]
                                      newHours[index].open = e.target.value
                                      setBusinessInfoFormData(prev => ({ ...prev, openingHours: newHours }))
                                    }}
                                    placeholder="Open"
                                    className="rounded-2xl"
                                  />
                                  <Input
                                    value={hour.close}
                                    onChange={(e) => {
                                      const newHours = [...businessInfoFormData.openingHours]
                                      newHours[index].close = e.target.value
                                      setBusinessInfoFormData(prev => ({ ...prev, openingHours: newHours }))
                                    }}
                                    placeholder="Close"
                                    className="rounded-2xl"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const newHours = businessInfoFormData.openingHours.filter((_, i) => i !== index)
                                      setBusinessInfoFormData(prev => ({ ...prev, openingHours: newHours }))
                                    }}
                                    className="rounded-xl"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newHours = [...(businessInfoFormData.openingHours || []), { day: '', open: '', close: '' }]
                                  setBusinessInfoFormData(prev => ({ ...prev, openingHours: newHours }))
                                }}
                                className="rounded-2xl"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Opening Hour
                              </Button>
                            </div>
                          </div>
                          <div>
                            <Label>Logo URL</Label>
                            <div className="space-y-2">
                              <Input
                                value={businessInfoFormData.logo}
                                onChange={(e) => setBusinessInfoFormData(prev => ({ ...prev, logo: e.target.value }))}
                                placeholder="https://..."
                                className="rounded-2xl"
                              />
                              <div className="space-y-2">
                                <ImageUpload
                                  accept="image/*"
                                  onUpload={(url) => setBusinessInfoFormData(prev => ({ ...prev, logo: url }))}
                                  onError={(error) => toast({
                                    title: "Upload Error",
                                    description: error,
                                    variant: "destructive",
                                  })}
                                />

                              </div>
                            </div>
                          </div>
                          <div>
                            <Label>Address</Label>
                            <Input
                              value={businessInfoFormData.address}
                              onChange={(e) => setBusinessInfoFormData(prev => ({ ...prev, address: e.target.value }))}
                              className="rounded-2xl"
                            />
                          </div>
                          <div>
                            <Label>Phone</Label>
                            <Input
                              value={businessInfoFormData.phone}
                              onChange={(e) => setBusinessInfoFormData(prev => ({ ...prev, phone: e.target.value }))}
                              className="rounded-2xl"
                            />
                          </div>
                          <div>
                            <Label>Email</Label>
                            <Input
                              value={businessInfoFormData.email}
                              onChange={(e) => setBusinessInfoFormData(prev => ({ ...prev, email: e.target.value }))}
                              className="rounded-2xl"
                            />
                          </div>
                          <div>
                            <Label>Website</Label>
                            <Input
                              value={businessInfoFormData.website}
                              onChange={(e) => setBusinessInfoFormData(prev => ({ ...prev, website: e.target.value }))}
                              className="rounded-2xl"
                            />
                          </div>
                          <div>
                            <Label>Facebook</Label>
                            <Input
                              value={businessInfoFormData.facebook}
                              onChange={(e) => setBusinessInfoFormData(prev => ({ ...prev, facebook: e.target.value }))}
                              placeholder="https://facebook.com/yourpage"
                              className="rounded-2xl"
                            />
                          </div>
                          <div>
                            <Label>Twitter</Label>
                            <Input
                              value={businessInfoFormData.twitter}
                              onChange={(e) => setBusinessInfoFormData(prev => ({ ...prev, twitter: e.target.value }))}
                              placeholder="https://twitter.com/yourhandle"
                              className="rounded-2xl"
                            />
                          </div>
                          <div>
                            <Label>Instagram</Label>
                            <Input
                              value={businessInfoFormData.instagram}
                              onChange={(e) => setBusinessInfoFormData(prev => ({ ...prev, instagram: e.target.value }))}
                              placeholder="https://instagram.com/yourhandle"
                              className="rounded-2xl"
                            />
                          </div>
                          <div>
                            <Label>LinkedIn</Label>
                            <Input
                              value={businessInfoFormData.linkedin}
                              onChange={(e) => setBusinessInfoFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                              placeholder="https://linkedin.com/in/yourprofile"
                              className="rounded-2xl"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}


                  {selectedProfileSection === 'brands' && (
                    <div className="space-y-6">
                      {/* Section Title */}
                      <div>
                        <Label className="text-sm font-medium">Page Title for Brand Section</Label>
                        <Input
                          value={sectionTitles.brands}
                          onChange={(e) => setSectionTitles(prev => ({ ...prev, brands: e.target.value }))}
                          placeholder="Enter section title"
                          className="rounded-2xl"
                        />
                      </div>

                      {/* Add New Brand Section */}
                      <Card className="rounded-3xl">
                        <CardHeader>
                          <CardTitle className="text-lg">Add New Brand</CardTitle>
                          <CardDescription>Add a new brand to your brand slider</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label>Brand Name</Label>
                            <Input
                              placeholder="Enter brand name"
                              value={brandContent.newBrandName || ''}
                              onChange={(e) => setBrandContent(prev => ({ ...prev, newBrandName: e.target.value }))}
                              className="rounded-2xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Brand Photo</Label>
                            <div className="space-y-2">
                              <Input
                                placeholder="Photo URL or upload below"
                                value={brandContent.newBrandLogo || ''}
                                onChange={(e) => setBrandContent(prev => ({ ...prev, newBrandLogo: e.target.value }))}
                                className="rounded-2xl"
                              />
                              <ImageUpload
                                onUpload={(url) => setBrandContent(prev => ({ ...prev, newBrandLogo: url }))}
                              />
                            </div>
                          </div>
                          <Button
                            onClick={() => {
                              if (!brandContent.newBrandName?.trim()) {
                                toast({
                                  title: "Error",
                                  description: "Please enter a brand name",
                                  variant: "destructive",
                                })
                                return
                              }
                              const newBrand = {
                                name: brandContent.newBrandName.trim(),
                                logo: brandContent.newBrandLogo || '',
                              }
                              setBrandContent(prev => ({
                                ...prev,
                                brands: [...(prev.brands || []), newBrand],
                                newBrandName: '',
                                newBrandLogo: '',
                              }))
                            }}
                            className="w-full rounded-2xl"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Brand
                          </Button>
                        </CardContent>
                      </Card>


                    </div>
                  )}


                  {selectedProfileSection === 'portfolio' && (
                    <div className="space-y-6">
                      {/* Section Title */}
                      <div>
                        <Label className="text-sm font-medium">Section Title</Label>
                        <Input
                          value={sectionTitles.portfolio}
                          onChange={(e) => setSectionTitles(prev => ({ ...prev, portfolio: e.target.value }))}
                          placeholder="Enter section title"
                          className="rounded-2xl"
                        />
                      </div>

                      {/* Add New Portfolio Image Section */}
                      <Card className="rounded-3xl">
                        <CardHeader>
                          <CardTitle className="text-lg">Add New Portfolio Image</CardTitle>
                          <CardDescription>Add a new image to your portfolio gallery</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label>Image URL</Label>
                            <div className="space-y-2">
                              <Input
                                placeholder="Image URL or upload below"
                                value={portfolioContent.newImageUrl || ''}
                                onChange={(e) => setPortfolioContent(prev => ({ ...prev, newImageUrl: e.target.value }))}
                                className="bg-white rounded-2xl"
                              />
                              <ImageUpload
                                allowVideo={true}
                                onUpload={(url) => setPortfolioContent(prev => ({ ...prev, newImageUrl: url }))}
                              />
                            </div>
                          </div>
                          <Button
                            onClick={async () => {
                              if (!portfolioContent.newImageUrl?.trim()) {
                                toast({
                                  title: "Error",
                                  description: "Please provide an image URL",
                                  variant: "destructive",
                                })
                                return
                              }

                              setSavingPortfolio(true)
                              const newImage = {
                                url: portfolioContent.newImageUrl.trim(),
                                alt: 'Portfolio image',
                              }

                              const updatedImages = [...(portfolioContent.images || []), newImage]

                              try {
                                const response = await fetch('/api/business', {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ portfolioContent: { images: updatedImages } }),
                                })

                                if (response.ok) {
                                  setPortfolioContent(prev => ({
                                    ...prev,
                                    images: updatedImages,
                                    newImageUrl: '',
                                  }))
                                  toast({
                                    title: "Success",
                                    description: "Portfolio image added successfully!",
                                  })
                                } else {
                                  const errorResult = await response.json()
                                  toast({
                                    title: "Error",
                                    description: `Failed to add portfolio image: ${errorResult.error}`,
                                    variant: "destructive",
                                  })
                                }
                              } catch (error) {
                                toast({
                                  title: "Error",
                                  description: "Failed to add portfolio image. Please try again.",
                                  variant: "destructive",
                                })
                              } finally {
                                setSavingPortfolio(false)
                              }
                            }}
                            disabled={savingPortfolio}
                            className="w-full rounded-2xl"
                          >
                            {savingPortfolio ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Adding...
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Image
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>


                      {/* Portfolio Images Table Section */}
                      <Card className="rounded-3xl">

                        <CardContent>
                          {portfolioContent.images?.length > 0 ? (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Image</TableHead>
                                  <TableHead>Alt Text</TableHead>
                                  <TableHead className="w-32">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {portfolioContent.images.map((image: any, index: number) => (
                                  <TableRow key={index}>
                                    <TableCell>
                                      <img
                                        src={getOptimizedImageUrl(image.url, { width: 32, height: 32, quality: 85, format: 'auto' })}
                                        alt={image.alt || 'Portfolio image'}
                                        className="h-8 w-8 object-cover rounded-2xl"
                                        loading="lazy"
                                      />
                                    </TableCell>
                                    <TableCell className="font-medium">{image.alt || 'Portfolio image'}</TableCell>
                                    <TableCell>
                                      <div className="flex space-x-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={async () => {
                                            const newAlt = prompt('Edit alt text:', image.alt || 'Portfolio image')
                                            if (newAlt !== null) {
                                              const updatedImages = [...portfolioContent.images]
                                              updatedImages[index] = { ...image, alt: newAlt.trim() || 'Portfolio image' }

                                              try {
                                                const response = await fetch('/api/business', {
                                                  method: 'PUT',
                                                  headers: { 'Content-Type': 'application/json' },
                                                  body: JSON.stringify({ portfolioContent: { images: updatedImages } }),
                                                })

                                                if (response.ok) {
                                                  setPortfolioContent(prev => ({
                                                    ...prev,
                                                    images: updatedImages
                                                  }))
                                                  toast({
                                                    title: "Success",
                                                    description: "Portfolio image updated successfully!",
                                                  })
                                                } else {
                                                  const errorResult = await response.json()
                                                  toast({
                                                    title: "Error",
                                                    description: `Failed to update portfolio image: ${errorResult.error}`,
                                                    variant: "destructive",
                                                  })
                                                }
                                              } catch (error) {
                                                toast({
                                                  title: "Error",
                                                  description: "Failed to update portfolio image. Please try again.",
                                                  variant: "destructive",
                                                })
                                              }
                                            }
                                          }}
                                          className="rounded-xl"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            setConfirmDialogData({
                                              title: 'Delete Portfolio Image',
                                              description: `Are you sure you want to delete this portfolio image?`,
                                              action: async () => {
                                                const updatedImages = portfolioContent.images.filter((_, i) => i !== index)

                                                try {
                                                  const response = await fetch('/api/business', {
                                                    method: 'PUT',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ portfolioContent: { images: updatedImages } }),
                                                  })

                                                  if (response.ok) {
                                                    setPortfolioContent(prev => ({
                                                      ...prev,
                                                      images: updatedImages
                                                    }))
                                                    toast({
                                                      title: "Success",
                                                      description: "Portfolio image deleted successfully!",
                                                    })
                                                  } else {
                                                    const errorResult = await response.json()
                                                    toast({
                                                      title: "Error",
                                                      description: `Failed to delete portfolio image: ${errorResult.error}`,
                                                      variant: "destructive",
                                                    })
                                                  }
                                                } catch (error) {
                                                  toast({
                                                    title: "Error",
                                                    description: "Failed to delete portfolio image. Please try again.",
                                                    variant: "destructive",
                                                  })
                                                }

                                                setShowConfirmDialog(false)
                                              }
                                            })
                                            setShowConfirmDialog(true)
                                          }}
                                          className="rounded-xl"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          ) : (
                            <div className="text-center py-8">
                              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No portfolio images to manage</h3>
                                <p className="text-gray-600">Add portfolio images using the editor panel</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>



                    </div>
                  )}

                  {selectedProfileSection === 'footer' && (
                    <div className="space-y-6">
                      <div>
                        <Label className="text-sm font-medium">Section Title</Label>
                        <Input
                          value={sectionTitles.footer}
                          onChange={(e) => setSectionTitles(prev => ({ ...prev, footer: e.target.value }))}
                          placeholder="Enter section title"
                          className="rounded-2xl"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Footer Settings</Label>
                        <div className="mt-2 space-y-4">
                          <div>
                            <Label>Copyright Text</Label>
                            <Input placeholder="© 2024 Your Business Name. All rights reserved." className="rounded-2xl" />
                          </div>
                          <div>
                            <Label>Footer Links</Label>
                            <div className="space-y-2">
                              <div className="flex space-x-2">
                                <Input placeholder="Link Text" className="rounded-2xl" />
                                <Input placeholder="URL" className="rounded-2xl" />
                                <Button size="sm" variant="outline" className="rounded-xl">
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              <Button variant="outline" size="sm" className="rounded-2xl">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Link
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch />
                            <Label>Show Social Media Links</Label>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {selectedProfileSection === 'categories' && (
                    <div className="space-y-6">
                      <div>
                        <Label className="text-sm font-medium">Section Title</Label>
                        <Input
                          value={sectionTitles.categories}
                          onChange={(e) => setSectionTitles(prev => ({ ...prev, categories: e.target.value }))}
                          placeholder="Enter section title"
                          className="rounded-2xl"
                        />
                      </div>

                      {/* Add New Category Section */}
                      <Card className="rounded-3xl">
                        <CardHeader>
                          <CardTitle className="text-lg">{editingCategory ? 'Edit Category' : 'Add New Category'}</CardTitle>
                          <CardDescription>
                            {editingCategory ? 'Update category details' : 'Create a new category for your products'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label>Category Name *</Label>
                            <Input
                              placeholder="Enter category name"
                              value={categoryFormData.name}
                              onChange={(e) => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                              className="bg-white rounded-2xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                              placeholder="Describe this category"
                              value={categoryFormData.description}
                              onChange={(e) => setCategoryFormData(prev => ({ ...prev, description: e.target.value }))}
                              rows={3}
                              className="bg-white rounded-2xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Parent Category</Label>
                            <Select
                              value={categoryFormData.parentId || "none"}
                              onValueChange={(value) => setCategoryFormData(prev => ({ ...prev, parentId: value === "none" ? "" : value }))}
                            >
                              <SelectTrigger className="rounded-2xl">
                                <SelectValue placeholder="Select parent category (optional)" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No parent</SelectItem>
                                {categories.filter(cat => !cat.parentId).map((category) => (
                                  <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={async () => {
                                if (!categoryFormData.name.trim()) {
                                  toast({
                                    title: "Error",
                                    description: "Category name is required",
                                    variant: "destructive",
                                  })
                                  return
                                }

                                try {
                                  const url = editingCategory
                                    ? `/api/business/categories?id=${editingCategory.id}`
                                    : '/api/business/categories'
                                  const method = editingCategory ? 'PUT' : 'POST'

                                  const response = await fetch(url, {
                                    method,
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(categoryFormData),
                                  })

                                  if (response.ok) {
                                    await fetchData()
                                    setCategoryFormData({ name: '', description: '', parentId: '' })
                                    setEditingCategory(null)
                                    toast({
                                      title: "Success",
                                      description: editingCategory ? 'Category updated successfully!' : 'Category created successfully!',
                                    })
                                  } else {
                                    const errorResult = await response.json()
                                    toast({
                                      title: "Error",
                                      description: `Failed to ${editingCategory ? 'update' : 'create'} category: ${errorResult.error}`,
                                      variant: "destructive",
                                    })
                                  }
                                } catch (error) {
                                  toast({
                                    title: "Error",
                                    description: `Failed to ${editingCategory ? 'update' : 'create'} category`,
                                    variant: "destructive",
                                  })
                                }
                              }}
                              className="rounded-2xl"
                            >
                              {editingCategory ? 'Update Category' : 'Add Category'}
                            </Button>
                            {editingCategory && (
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setEditingCategory(null)
                                  setCategoryFormData({ name: '', description: '', parentId: '' })
                                }}
                                className="rounded-2xl"
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>


                    </div>
                  )}

                </>
              )}

              {activeSection === 'categories' && showRightPanel && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium">Section Title</Label>
                    <Input
                      value={sectionTitles.categories}
                      onChange={(e) => setSectionTitles(prev => ({ ...prev, categories: e.target.value }))}
                      placeholder="Enter section title"
                      className="rounded-2xl"
                    />
                  </div>

                  {/* Add New Category Section */}
                  <Card className="rounded-3xl">
                    <CardHeader>
                      <CardTitle className="text-lg">{editingCategory ? 'Edit Category' : 'Add New Category'}</CardTitle>
                      <CardDescription>
                        {editingCategory ? 'Update category details' : 'Create a new category for your products'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Category Name *</Label>
                        <Input
                          placeholder="Enter category name"
                          value={categoryFormData.name}
                          onChange={(e) => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="rounded-2xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          placeholder="Describe this category"
                          value={categoryFormData.description}
                          onChange={(e) => setCategoryFormData(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                          className="rounded-2xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Parent Category</Label>
                        <Select
                          value={categoryFormData.parentId || "none"}
                          onValueChange={(value) => setCategoryFormData(prev => ({ ...prev, parentId: value === "none" ? "" : value }))}
                        >
                          <SelectTrigger className="rounded-2xl">
                            <SelectValue placeholder="Select parent category (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No parent</SelectItem>
                            {categories.filter(cat => !cat.parentId).map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={async () => {
                            if (!categoryFormData.name.trim()) {
                              toast({
                                title: "Error",
                                description: "Category name is required",
                                variant: "destructive",
                              })
                              return
                            }

                            try {
                              const url = editingCategory
                                ? `/api/business/categories?id=${editingCategory.id}`
                                : '/api/business/categories'
                              const method = editingCategory ? 'PUT' : 'POST'

                              const response = await fetch(url, {
                                method,
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(categoryFormData),
                              })

                              if (response.ok) {
                                await fetchData()
                                setCategoryFormData({ name: '', description: '', parentId: '' })
                                setEditingCategory(null)
                                setShowRightPanel(false)
                                toast({
                                  title: "Success",
                                  description: editingCategory ? 'Category updated successfully!' : 'Category created successfully!',
                                })
                              } else {
                                const errorResult = await response.json()
                                toast({
                                  title: "Error",
                                  description: `Failed to ${editingCategory ? 'update' : 'create'} category: ${errorResult.error}`,
                                  variant: "destructive",
                                })
                              }
                            } catch (error) {
                              toast({
                                title: "Error",
                                description: `Failed to ${editingCategory ? 'update' : 'create'} category`,
                                variant: "destructive",
                              })
                            }
                          }}
                          className="rounded-2xl"
                        >
                          {editingCategory ? 'Update Category' : 'Add Category'}
                        </Button>
                        {editingCategory && (
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEditingCategory(null)
                              setCategoryFormData({ name: '', description: '', parentId: '' })
                            }}
                            className="rounded-2xl"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}



            </div>
            {/* Fixed Action Buttons for Rightbar */}
            <div className="p-3   border-t border-gray-200 shadow-lg">
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (activeSection === 'profile') setSelectedProfileSection(null);
                    if (activeSection === 'products') {
                      setShowProductRightbar(false);
                      setEditingProduct(null);
                      setProductFormData({
                        name: '',
                        description: '',
                        price: '',
                        image: '',
                        categoryId: '',
                        brandName: '',
                        additionalInfo: {},
                        inStock: true,
                        isActive: true,
                      });
                    }
                    if (activeSection === 'categories') {
                      setShowRightPanel(false);
                      setEditingCategory(null);
                      setCategoryFormData({ name: '', description: '', parentId: '' });
                    }
                  }}
                  className="rounded-2xl  "
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    if (activeSection === 'profile') {
                      if (selectedProfileSection === 'info') {
                        await handleBasicInfoSave({ preventDefault: () => { } } as any);
                      } else if (selectedProfileSection === 'hero') {
                        if (!business) return;
                        try {
                          const response = await fetch('/api/business', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ heroContent }),
                          });
                          if (response.ok) {
                            const result = await response.json();
                            setBusiness(result.business);
                            toast({
                              title: "Success",
                              description: "Hero content saved successfully!",
                            });
                          } else {
                            toast({
                              title: "Error",
                              description: "Failed to save hero content",
                              variant: "destructive",
                            });
                          }
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Failed to save hero content",
                            variant: "destructive",
                          });
                        }
                      } else if (selectedProfileSection === 'brands') {
                        if (!business) return;
                        try {
                          const { newBrandName, newBrandLogo, ...cleanBrandContent } = brandContent;
                          const response = await fetch('/api/business', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ brandContent: cleanBrandContent }),
                          });
                          if (response.ok) {
                            const result = await response.json();
                            setBusiness(result.business);
                            toast({
                              title: "Success",
                              description: "Brand content saved successfully!",
                            });
                          } else {
                            toast({
                              title: "Error",
                              description: "Failed to save brand content",
                              variant: "destructive",
                            });
                          }
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Failed to save brand content",
                            variant: "destructive",
                          });
                        }
                      } else if (selectedProfileSection === 'portfolio') {
                        if (!business) return;
                        try {
                          const { newImageUrl, ...cleanPortfolioContent } = portfolioContent;
                          const response = await fetch('/api/business', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ portfolioContent: cleanPortfolioContent }),
                          });
                          if (response.ok) {
                            const result = await response.json();
                            setBusiness(result.business);
                            toast({
                              title: "Success",
                              description: "Portfolio content saved successfully!",
                            });
                          } else {
                            toast({
                              title: "Error",
                              description: "Failed to save portfolio content",
                              variant: "destructive",
                            });
                          }
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Failed to save portfolio content",
                            variant: "destructive",
                          });
                        }
                      }
                    }
                  }}
                  disabled={savingStates.basicInfo || isLoading}
                  className="rounded-2xl "
                >
                  {savingStates.basicInfo || isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={(open) => {
        if (!open) {
          setShowProductDialog(false);
          setEditingProduct(null);
          setProductFormData({
            name: '',
            description: '',
            price: '',
            image: '',
            categoryId: '',
            brandName: '',
            additionalInfo: {},
            inStock: true,
            isActive: true,
          });
        }
      }}>
        <DialogContent className="max-w-4xl w-[95%] h-[90vh] border  overflow-hidden bg-white p-0 top-4 bottom-4 left-1/2 translate-x-[-50%] translate-y-0">
          <div className="flex flex-col h-[90vh] relative">
            {/* Fixed Header */}
            <DialogHeader className="px-6 pt-4 pb-2 border-b shrink-0 space-y-1.5 bg-white z-10">
              <div className="flex justify-between items-start w-full">
                <div className="">
                  <DialogTitle className="text-md font-semibold leading-none tracking-tight">{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                  <DialogDescription className="text-xs text-gray-500 font-normal">
                    {editingProduct ? 'Update product details' : 'Create a new product or service'}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* Scrollable Body */}
            <div className="flex-1 px-6 py-4 min-h-0">
              <div className="h-full px-2 overflow-y-auto hide-scrollbar">
                <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={productFormData.name}
                    onChange={(e) => setProductFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter product name"
                    required
                    className="bg-white rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={productFormData.description}
                    onChange={(e) => setProductFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your product or service"
                    rows={4}
                    className="bg-white rounded-xl"
                  />
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-1/2 space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      value={productFormData.price}
                      onChange={(e) => setProductFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="e.g., ₹50, Starting at ₹100, Free consultation"
                      className="bg-white rounded-xl"
                    />
                  </div>
                  <div className="w-full md:w-1/2 space-y-2">
                    <Label htmlFor="image">Image URL</Label>
                    <Input
                      id="image"
                      value={productFormData.image}
                      onChange={(e) => setProductFormData(prev => ({ ...prev, image: e.target.value }))}
                      placeholder="https://..."
                      className="bg-white rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Select Existing Image</Label>
                  <Select
                    key={images.length}
                    value={productFormData.image || "no-image"}
                    onValueChange={(value) =>
                      setProductFormData(prev => ({
                        ...prev,
                        image: value === "no-image" ? "" : value
                      }))
                    }
                  >
                    <SelectTrigger className="rounded-xl w-full">
                      <SelectValue placeholder="Choose an existing image" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-image">No image</SelectItem>
                      {images.map((image) => {
                        // Display with image and ellipsized URL
                        const MAX_URL_LENGTH = 32;
                        let displayUrl = image;
                        if (image.length > MAX_URL_LENGTH) {
                          displayUrl = image.slice(0, MAX_URL_LENGTH) + "...";
                        }
                        return (
                          <SelectItem className=" flex items-center gap-2" key={image} value={image}>
                            <img
                              src={image}
                              alt={displayUrl}
                              className="inline-block h-8 w-8  rounded-full object-cover border pr-2"
                              style={{ minWidth: "2rem" }}
                            />
                            <span className="truncate border-l px-2 border-l-gray-300 " title={image}>
                              {displayUrl}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  {mounted && (
                    <ImageUpload
                      onUpload={(url) => setProductFormData(prev => ({ ...prev, image: url }))}
                    />
                  )}
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Category Selection */}
                  <div className="w-full md:w-1/2 space-y-2">
                    <Label>Category</Label>
                    <Select
                      key={categories.length}
                      value={productFormData.categoryId}
                      onValueChange={(value) => setProductFormData(prev => ({ ...prev, categoryId: value }))}
                    >
                      <SelectTrigger className="rounded-xl w-full">
                        <SelectValue placeholder="Choose a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Brand Selection */}
                  <div className="w-full md:w-1/2 space-y-2">
                    <Label>Brand</Label>
                    <div className="relative">
                      <Select
                        value={productFormData.brandName}
                        onValueChange={(value) => setProductFormData(prev => ({ ...prev, brandName: value }))}
                      >
                        <SelectTrigger className="rounded-xl w-full">
                          <SelectValue placeholder="Choose a brand" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="sticky top-0 bg-white border-b pb-2 mb-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Manage brands flow
                                setActiveSection('profile')
                                setSelectedProfileSection('brands')
                                setShowProductDialog(false)
                              }}
                              className="w-full rounded-xl"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Manage Brands
                            </Button>
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            {(brandContent.brands || []).filter(brand =>
                              typeof brand.name === 'string' &&
                              brand.name.toLowerCase().includes(brandFilterText.toLowerCase())
                            ).map((brand) => (
                              <SelectItem key={brand.name} value={brand.name}>
                                {brand.name}
                              </SelectItem>
                            ))}
                            {((brandContent.brands || []).filter(brand =>
                              typeof brand.name === 'string' &&
                              brand.name.toLowerCase().includes(brandFilterText.toLowerCase())
                            ).length === 0) && (
                                <div className="p-3 text-center text-sm text-gray-500">
                                  No brands found matching "{brandFilterText}"
                                </div>
                              )}
                          </div>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex border-t border-b py-2 items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="inStock"
                      checked={productFormData.inStock}
                      onCheckedChange={(checked) => setProductFormData(prev => ({ ...prev, inStock: checked }))}
                    />
                    <Label htmlFor="inStock">In Stock</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={productFormData.isActive}
                      onCheckedChange={(checked) => setProductFormData(prev => ({ ...prev, isActive: checked }))}
                    />
                    <Label htmlFor="isActive">Visible </Label>
                  </div>
                </div>

                {/* Additional Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Additional Information</h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Key (e.g., Material)"
                        value={newInfoKey || ''}
                        onChange={(e) => setNewInfoKey(e.target.value)}
                        className="bg-white rounded-xl"
                      />
                      <div className="flex gap-2">
                        <Input
                          placeholder="Value (e.g., Cotton)"
                          value={newInfoValue || ''}
                          onChange={(e) => setNewInfoValue(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleAddInfo()
                            }
                          }}
                          className="flex-1 bg-white rounded-xl"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddInfo}
                          disabled={!newInfoKey?.trim() || !newInfoValue?.trim()}
                          className="rounded-xl"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {productFormData.additionalInfo && Object.keys(productFormData.additionalInfo).length > 0 && (
                      <div className="overflow-x-auto mt-4">
                        <table className="min-w-full bg-gray-50 rounded-xl">
                          <tbody>
                            {Object.entries(productFormData.additionalInfo).map(([key, value], index) => (
                              <tr key={index} className="border-b last:border-b-0">
                                <td className="px-3 py-2 font-medium text-sm">{key}</td>
                                <td className="px-3 py-2 text-sm">{value}</td>
                                <td className="py-2 text-right pr-4">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveInfo(key)}
                                    className="h-6 w-6 p-0 hover:bg-gray-200 rounded-full flex items-center justify-center ml-auto"
                                    title="Remove field"
                                  >
                                    <span className="sr-only">Remove</span>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />
                </div>
              </div>
            </div>

            {/* Fixed Footer */}
            <DialogFooter className="px-6 py-3 flex flex-row justify-center border-t bg-white z-10 shrink-0">
              <Button type="button" variant="outline" onClick={() => {
                setShowProductDialog(false);
                setEditingProduct(null);
                setProductFormData({
                  name: '',
                  description: '',
                  price: '',
                  image: '',
                  categoryId: '',
                  brandName: '',
                  additionalInfo: {},
                  inStock: true,
                  isActive: true,
                });
              }} className="rounded-full w-auto flex-1">
                Cancel
              </Button>
              <Button onClick={async () => {
                // Client-side validation
                if (!productFormData.name.trim()) {
                  toast({
                    title: "Validation Error",
                    description: "Product name is required",
                    variant: "destructive",
                  });
                  return;
                }

                if (productFormData.name.length < 2) {
                  toast({
                    title: "Validation Error",
                    description: "Product name must be at least 2 characters long",
                    variant: "destructive",
                  });
                  return;
                }

                setSavingProduct(true);
                try {
                  const url = editingProduct
                    ? `/api/business/products/${editingProduct.id}`
                    : '/api/business/products';
                  const method = editingProduct ? 'PUT' : 'POST';
                  const response = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productFormData),
                  });
                  if (response.ok) {
                    const data = await response.json();
                    if (editingProduct) {
                      // Update existing product
                      setProducts(prev => prev.map(p => p.id === editingProduct.id ? data.product : p));
                      if (data.product.image && !images.includes(data.product.image)) {
                        setImages(prev => [...new Set([...prev, data.product.image])]);
                      }
                      // Update stats if active status changed
                      if (editingProduct.isActive !== data.product.isActive) {
                        setStats(prev => ({
                          ...prev,
                          activeProducts: data.product.isActive ? prev.activeProducts + 1 : prev.activeProducts - 1,
                        }));
                      }
                    } else {
                      // Add new product
                      setProducts(prev => [...prev, data.product]);
                      if (data.product.image) {
                        setImages(prev => [...new Set([...prev, data.product.image])]);
                      }
                      setStats(prev => ({
                        ...prev,
                        totalProducts: prev.totalProducts + 1,
                        activeProducts: data.product.isActive ? prev.activeProducts + 1 : prev.activeProducts,
                      }));
                    }
                    setShowProductDialog(false);
                    setEditingProduct(null);
                    setProductFormData({
                      name: '',
                      description: '',
                      price: '',
                      image: '',
                      categoryId: '',
                      brandName: '',
                      additionalInfo: {},
                      inStock: true,
                      isActive: true,
                    });
                    toast({
                      title: "Success",
                      description: editingProduct ? 'Product updated successfully!' : 'Product added successfully!',
                    });
                  } else {
                    const errorResult = await response.json();
                    toast({
                      title: "Error",
                      description: `Failed to ${editingProduct ? 'update' : 'add'} product: ${errorResult.error}`,
                      variant: "destructive",
                    });
                  }
                } catch (error) {
                  toast({
                    title: "Error",
                    description: `Failed to ${editingProduct ? 'update' : 'add'} product. Please try again.`,
                    variant: "destructive",
                  });
                } finally {
                  setSavingProduct(false);
                }
              }} disabled={savingProduct} className="rounded-full w-auto flex-1">
                {savingProduct ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <>
          {/* More Menu Overlay */}
          {showMoreMenu && (
            <div className="fixed inset-0 bg-black/30 bg-opacity-50 z-40" onClick={() => setShowMoreMenu(false)}>
              <div className="absolute bottom-16 left-0 right-0 bg-white rounded-t-3xl p-4" onClick={(e) => e.stopPropagation()}>
                <div className="space-y-2">
                  {(() => {
                    const moreMenuItems = menuItems.slice(4);
                    console.log('More menu items:', moreMenuItems);
                    return moreMenuItems.map((item) => {
                      const MobileIcon = item.mobileIcon
                      return (
                        <button
                          key={item.value}
                          onClick={() => {
                            setActiveSection(item.value)
                            setShowMoreMenu(false)
                          }}
                          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 ${activeSection === item.value
                            ? 'bg-orange-100 text-orange-600'
                            : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                          <MobileIcon className="h-5 w-5" />
                          <span className="font-medium">{item.title}</span>
                        </button>
                      )
                    })
                  })()}
                  <button
                    onClick={async () => {
                      await logout()
                      router.push('/login')
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Navigation Bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl border-t border-gray-200 z-40">
            <div className="flex justify-around items-center py-2">
              {(() => {
                const mobileNavItems = menuItems.slice(0, 4);
                console.log('Mobile nav items:', mobileNavItems);
                return mobileNavItems.map((item) => {
                  const MobileIcon = item.mobileIcon
                  return (
                    <button
                      key={item.value}
                      onClick={() => setActiveSection(item.value)}
                      className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 ${activeSection === item.value
                        ? 'text-orange-500'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      <MobileIcon className="h-5 w-5 mb-1" />
                      <span className="text-xs font-medium">{item.mobileTitle}</span>
                    </button>
                  )
                })
              })()}
              {/* More button for additional items */}
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 ${showMoreMenu || menuItems.slice(4).some(item => item.value === activeSection)
                  ? 'text-orange-500'
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

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialogData?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialogData?.description}  
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              confirmDialogData?.action()
              setShowConfirmDialog(false)
            }}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

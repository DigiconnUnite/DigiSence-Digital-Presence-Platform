'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  TrendingUp
} from 'lucide-react'
import RichTextEditor from '@/components/ui/rich-text-editor'
import ImageUpload from '@/components/ui/image-upload'
import ProfilePreview from '@/components/ProfilePreview'

interface Product {
  id: string
  name: string
  description: string | null
  price: string | null
  image: string | null
  inStock: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  businessId: string
  categoryId: string | null
  brandId: string | null
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
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  adminId: string
  categoryId: string | null
  heroContent: any
  brandContent: any
  additionalContent: string | null
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
  parentId?: string
}

export default function BusinessAdminDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [business, setBusiness] = useState<Business | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<{id: string, name: string}[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [images, setImages] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('dashboard')
  const [expandedSections, setExpandedSections] = useState<string[]>(['profile'])
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [selectedProfileSection, setSelectedProfileSection] = useState<string | null>(null)

  // Dialog states
  const [showProductDialog, setShowProductDialog] = useState(false)
  // const [showHeroEditor, setShowHeroEditor] = useState(false) // never used
  const [showContentEditor, setShowContentEditor] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Form states
   const [productFormData, setProductFormData] = useState({
     name: '',
     description: '',
     price: '',
     image: '',
     categoryId: '',
     brandId: '',
     inStock: true,
     isActive: true,
   })
   const [businessInfoFormData, setBusinessInfoFormData] = useState({
     name: '',
     description: '',
     logo: '',
     address: '',
     phone: '',
     email: '',
     website: '',
     ownerName: '',
   })
   const [editorContent, setEditorContent] = useState('')
   const [brandContent, setBrandContent] = useState<any>({ brands: [] })
   const [footerContent, setFooterContent] = useState<any>({})
   const [heroContent, setHeroContent] = useState<any>({
     slides: [],
     autoPlay: true,
     transitionSpeed: 5
   })
  const [sectionTitles, setSectionTitles] = useState({
    hero: 'Hero',
    info: 'Business Info',
    brands: 'Brand Slider',
    products: 'Products',
    content: 'Additional Content',
    footer: 'Footer'
  })
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number>(0)
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'settings'>('content')
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])

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
       const businessRes = await fetch('/api/business')
       if (businessRes.ok) {
         const data = await businessRes.json()
         setBusiness(data.business)
         setEditorContent(data.business.additionalContent || '')
         setBrandContent(data.business.brandContent || { brands: [] })
         setFooterContent(data.business.footerContent || {})
         setHeroContent(data.business.heroContent || {
           slides: [],
           autoPlay: true,
           transitionSpeed: 5
         })
         setBusinessInfoFormData({
           name: data.business.name || '',
           description: data.business.description || '',
           logo: data.business.logo || '',
           address: data.business.address || '',
           phone: data.business.phone || '',
           email: data.business.email || '',
           website: data.business.website || '',
           ownerName: data.business.admin?.name || '',
         })
       }

      // Fetch categories
      const categoriesRes = await fetch('/api/categories')
      if (categoriesRes.ok) {
        const data = await categoriesRes.json()
        setCategories(data.categories)
      }

      // Fetch brands
      const brandsRes = await fetch('/api/brands')
      if (brandsRes.ok) {
        const data = await brandsRes.json()
        setBrands(data.brands)
      }

      // Fetch products
      const productsRes = await fetch('/api/business/products')
      if (productsRes.ok) {
        const data = await productsRes.json()
        setProducts(data.products)
        setImages([...new Set(data.products.map(p => p.image).filter(Boolean))] as string[])
        tempProducts = data.products
      } else {
        setProducts([])
        setImages([])
        tempProducts = []
      }

      // Fetch inquiries
      const inquiriesRes = await fetch('/api/business/inquiries')
      if (inquiriesRes.ok) {
        const data = await inquiriesRes.json()
        setInquiries(data.inquiries)
        tempInquiries = data.inquiries
      } else {
        setInquiries([])
        tempInquiries = []
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
    } finally {
      setIsLoading(false)
    }
  }

  const handleProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = editingProduct
        ? `/api/business/products/${editingProduct.id}`
        : '/api/business/products'

      const method = editingProduct ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productFormData),
      })

      if (response.ok) {
        await fetchData()
        setShowProductDialog(false)
        setEditingProduct(null)
        setProductFormData({
          name: '',
          description: '',
          price: '',
          image: '',
          categoryId: '',
          brandId: '',
          inStock: true,
          isActive: true,
        })
        alert(editingProduct ? 'Product updated successfully!' : 'Product added successfully!')
      } else {
        const errorResult = await response.json()
        alert(`Failed to ${editingProduct ? 'update' : 'add'} product: ${errorResult.error}`)
      }
    } catch (error) {
      alert(`Failed to ${editingProduct ? 'update' : 'add'} product. Please try again.`)
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
      brandId: product.brandId || '',
      inStock: product.inStock,
      isActive: product.isActive,
    })
    setShowProductDialog(true)
  }

  const handleProductDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/business/products/${product.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchData()
        alert('Product deleted successfully!')
      } else {
        const errorResult = await response.json()
        alert(`Failed to delete product: ${errorResult.error}`)
      }
    } catch (error) {
      alert('Failed to delete product. Please try again.')
    }
  }

  const handleInquiryStatusUpdate = async (inquiryId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/business/inquiries/${inquiryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        await fetchData()
        alert('Inquiry status updated successfully!')
      } else {
        const errorResult = await response.json()
        alert(`Failed to update status: ${errorResult.error}`)
      }
    } catch (error) {
      alert('Failed to update inquiry status. Please try again.')
    }
  }

  const handleBasicInfoSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const updateData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      logo: formData.get('logo') as string,
      address: formData.get('address') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      website: formData.get('website') as string,
    }

    setIsLoading(true)
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
        alert('Business information updated successfully!')
      } else {
        const error = await response.json()
        alert(`Failed to update: ${error.error}`)
      }
    } catch (error) {
      alert('Failed to update business information. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdditionalContentSave = async () => {
    if (!business) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/business', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ additionalContent: editorContent }),
      })

      if (response.ok) {
        const result = await response.json()
        setBusiness(result.business)
        setShowContentEditor(false)
        alert('Additional content updated successfully!')
      } else {
        const error = await response.json()
        alert(`Failed to update: ${error.error}`)
      }
    } catch (error) {
      alert('Failed to update additional content. Please try again.')
    } finally {
      setIsLoading(false)
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

  if (loading || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user || user.role !== 'BUSINESS_ADMIN' || !business) {
    return null
  }

  const heroSlides = business.heroContent?.slides || []

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-black rounded-xl">
              <Building className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{business.name}</h1>
              <p className="text-sm text-gray-500">Business Admin Panel</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button size="sm" className="bg-black hover:bg-gray-800 text-white">
              <Globe className="h-4 w-4 mr-2" />
              Publish
            </Button>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name || user.email}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout: Three Column Grid */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Building className="h-6 w-6" />
              <span className="font-semibold">Business Admin</span>
            </div>
          </div>
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveSection('dashboard')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeSection === 'dashboard'
                      ? 'bg-black text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <BarChart3 className="h-5 w-5" />
                  <span>Dashboard</span>
                </button>
              </li>

              {/* Profile Section with Submenu */}
              <li>
                <button
                  onClick={() => {
                    setActiveSection('profile')
                    toggleSectionExpansion('profile')
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                    activeSection === 'profile'
                      ? 'bg-black text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Palette className="h-5 w-5" />
                    <span>Profile</span>
                  </div>
                  {expandedSections.includes('profile') ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                {expandedSections.includes('profile') && (
                  <ul className="ml-8 mt-1 space-y-1">
                    <li>
                      <button
                        onClick={() => handleSectionEdit('hero')}
                        className="flex items-center w-full px-3 py-1 text-sm text-left hover:bg-gray-100 rounded"
                      >
                        Hero
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleSectionEdit('info')}
                        className="flex items-center w-full px-3 py-1 text-sm text-left hover:bg-gray-100 rounded"
                      >
                        Info
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleSectionEdit('brands')}
                        className="flex items-center w-full px-3 py-1 text-sm text-left hover:bg-gray-100 rounded"
                      >
                        Brands
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleSectionEdit('content')}
                        className="flex items-center w-full px-3 py-1 text-sm text-left hover:bg-gray-100 rounded"
                      >
                        Content
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleSectionEdit('footer')}
                        className="flex items-center w-full px-3 py-1 text-sm text-left hover:bg-gray-100 rounded"
                      >
                        Footer
                      </button>
                    </li>
                  </ul>
                )}
              </li>

              <li>
                <button
                  onClick={() => setActiveSection('products')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeSection === 'products'
                      ? 'bg-black text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Package className="h-5 w-5" />
                  <span>Products</span>
                </button>
              </li>

              <li>
                <button
                  onClick={() => setActiveSection('inquiries')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeSection === 'inquiries'
                      ? 'bg-black text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Mail className="h-5 w-5" />
                  <span>Inquiries</span>
                </button>
              </li>

              <li>
                <button
                  onClick={() => setActiveSection('analytics')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeSection === 'analytics'
                      ? 'bg-black text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <TrendingUp className="h-5 w-5" />
                  <span>Analytics</span>
                </button>
              </li>

              <li>
                <button
                  onClick={() => setActiveSection('settings')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeSection === 'settings'
                      ? 'bg-black text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Middle Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-6 overflow-auto">
            {/* Main Content based on activeSection */}
            {activeSection === 'dashboard' && (
              <>
                <div className="max-w-7xl mx-auto">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
                    <p className="text-gray-600">Welcome back! Here's what's happening with your business.</p>
                  </div>

                  {/* Stats Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-white border border-gray-200 shadow-sm">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-900">Total Products</CardTitle>
                        <Package className="h-4 w-4 text-gray-400" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{stats.totalProducts}</div>
                        <p className="text-xs text-gray-500">{stats.activeProducts} active</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-white border border-gray-200 shadow-sm">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-900">Total Inquiries</CardTitle>
                        <Mail className="h-4 w-4 text-gray-400" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{stats.totalInquiries}</div>
                        <p className="text-xs text-gray-500">{stats.newInquiries} new</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-white border border-gray-200 shadow-sm">
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
                                (heroSlides && heroSlides.length > 0) ? 25 : 0,
                                business.additionalContent ? 25 : 0
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
                    <Card className="bg-white border border-gray-200 shadow-sm">
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
                    <Card>
                      <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common tasks to get you started</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Button onClick={() => setShowProductDialog(true)} className="w-full justify-start">
                          <Plus className="h-4 w-4 mr-2" />
                          Add New Product
                        </Button>
                        <Button variant="outline" onClick={() => setActiveSection('profile')} className="w-full justify-start">
                          <Settings className="h-4 w-4 mr-2" />
                          Update Business Profile
                        </Button>
                        <Button variant="outline" onClick={() => setActiveSection('inquiries')} className="w-full justify-start">
                          <Mail className="h-4 w-4 mr-2" />
                          Check New Inquiries
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest updates and interactions</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {inquiries.slice(0, 3).map((inquiry) => (
                            <div key={inquiry.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                              <div className="flex-shrink-0">
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
                              <Badge variant={inquiry.status === 'NEW' ? 'destructive' : 'secondary'}>
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

            {activeSection === 'profile' && (
              <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Profile Management</h2>
                  <p className="text-gray-600">Manage your business profile sections</p>
                </div>

                {/* Section Tabs */}
                <div className="mb-6">
                  <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                    {[
                      { id: 'hero', label: sectionTitles.hero, icon: ImageIcon },
                      { id: 'info', label: sectionTitles.info, icon: Building },
                      { id: 'brands', label: sectionTitles.brands, icon: Palette },
                      { id: 'products', label: sectionTitles.products, icon: Package },
                      { id: 'content', label: sectionTitles.content, icon: FileText },
                      { id: 'footer', label: sectionTitles.footer, icon: Globe }
                    ].map((tab) => {
                      const Icon = tab.icon
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setSelectedProfileSection(tab.id)
                            setEditingSection(tab.id)
                          }}
                          className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            selectedProfileSection === tab.id
                              ? 'bg-white text-black shadow-sm'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                          }`}
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          {tab.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Dynamic Preview Area */}
                <div className="flex-1 overflow-hidden">
                  <ProfilePreview
                    business={{
                      ...business,
                      email: business.email ?? null,
                      products
                    }}
                    selectedSection={selectedProfileSection}
                    sectionTitles={sectionTitles}
                    heroContent={heroContent}
                    brandContent={brandContent}
                    businessFormData={businessInfoFormData}
                    onSectionClick={(section) => {
                      setSelectedProfileSection(section)
                      setEditingSection(section)
                    }}
                  />
                </div>
              </div>
            )}

            {activeSection === 'products' && (
              <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Products & Services</h2>
                    <p className="text-gray-600">Manage your product offerings</p>
                  </div>
                  <Button onClick={() => setShowProductDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </div>

                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search products..."
                      className="w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Card>
                  <CardContent className="p-0">
                    {mounted && selectedProducts.length > 0 && (
                      <div className="p-4 bg-blue-50 border-b border-blue-200 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-blue-900">
                            {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              if (confirm(`Activate ${selectedProducts.length} product${selectedProducts.length > 1 ? 's' : ''}?`)) {
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
                                  alert('Products activated successfully!')
                                } catch (error) {
                                  alert('Failed to activate products')
                                }
                              }
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Activate
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              if (confirm(`Deactivate ${selectedProducts.length} product${selectedProducts.length > 1 ? 's' : ''}?`)) {
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
                                  alert('Products deactivated successfully!')
                                } catch (error) {
                                  alert('Failed to deactivate products')
                                }
                              }
                            }}
                          >
                            <Pause className="h-4 w-4 mr-2" />
                            Deactivate
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              if (confirm(`Delete ${selectedProducts.length} product${selectedProducts.length > 1 ? 's' : ''}? This action cannot be undone.`)) {
                                try {
                                  await Promise.all(selectedProducts.map(id =>
                                    fetch(`/api/business/products/${id}`, { method: 'DELETE' })
                                  ))
                                  await fetchData()
                                  setSelectedProducts([])
                                  alert('Products deleted successfully!')
                                } catch (error) {
                                  alert('Failed to delete products')
                                }
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => setSelectedProducts([])}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {mounted && (
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
                              )}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {mounted ? products
                            .filter((product) =>
                              product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                              (selectedCategory === '' || product.categoryId === selectedCategory)
                            )
                            .map((product) => (
                            <tr key={product.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {mounted && (
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
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {product.image && (
                                    <img className="h-10 w-10 rounded-full object-cover mr-3" src={product.image} alt={product.name} />
                                  )}
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                    <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {product.category?.name || 'Uncategorized'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {product.price || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant={product.isActive ? "default" : "secondary"}>
                                  {product.isActive ? 'Active' : 'Draft'}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="outline" onClick={() => handleProductEdit(product)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => handleProductDelete(product)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                            )) : products.map((product) => (
                              <tr key={product.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    {product.image && (
                                      <img className="h-10 w-10 rounded-full object-cover mr-3" src={product.image} alt={product.name} />
                                    )}
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                      <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {product.category?.name || 'Uncategorized'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {product.price || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <Badge variant={product.isActive ? "default" : "secondary"}>
                                    {product.isActive ? 'Active' : 'Draft'}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex space-x-2">
                                    <Button size="sm" variant="outline" onClick={() => handleProductEdit(product)}>
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => handleProductDelete(product)}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                      </table>
                    </div>
                    {products.length === 0 && (
                      <div className="text-center py-12">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
                        <p className="text-gray-600 mb-4">Add your first product or service to get started</p>
                        <Button onClick={() => setShowProductDialog(true)}>
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
              <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Customer Inquiries</h2>
                  <p className="text-gray-600">View and respond to customer inquiries</p>
                </div>

                {inquiries.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No inquiries yet</h3>
                      <p className="text-gray-600">Customer inquiries will appear here when people contact you</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <Card className="bg-white border border-gray-200 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-gray-900">Total</CardTitle>
                          <Mail className="h-4 w-4 text-gray-400" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-gray-900">{stats.totalInquiries}</div>
                          <p className="text-xs text-gray-500">All inquiries</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-white border border-gray-200 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-gray-900">New</CardTitle>
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-gray-900">{stats.newInquiries}</div>
                          <p className="text-xs text-gray-500">Awaiting review</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-white border border-gray-200 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-gray-900">Read</CardTitle>
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-gray-900">{stats.readInquiries}</div>
                          <p className="text-xs text-gray-500">Viewed</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-white border border-gray-200 shadow-sm">
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
                        <Card key={inquiry.id} className="border-l-4 border-l-blue-500">
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
                                  }>
                                    {inquiry.status === 'NEW' ? 'New' :
                                     inquiry.status === 'READ' ? 'Read' :
                                     inquiry.status === 'REPLIED' ? 'Replied' : 'Closed'}
                                  </Badge>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
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

                              <div className="flex space-x-2 mt-4">
                                {inquiry.status === 'NEW' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleInquiryStatusUpdate(inquiry.id, 'READ')}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    Mark as Read
                                  </Button>
                                )}
                                {(inquiry.status === 'NEW' || inquiry.status === 'READ') && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleInquiryStatusUpdate(inquiry.id, 'REPLIED')}
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
                  </div>
                )}
              </div>
            )}

            {activeSection === 'analytics' && (
              <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h2>
                  <p className="text-gray-600">Track your business performance</p>
                </div>
                <Card>
                  <CardContent className="text-center py-12">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Coming Soon</h3>
                    <p className="text-gray-600">Detailed analytics and insights will be available here</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === 'settings' && (
              <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Settings</h2>
                  <p className="text-gray-600">Manage your account and preferences</p>
                </div>
                <Card>
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

        {/* Right Editor Panel */}
        {activeSection === 'profile' && (
          <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
            <div className="flex-1 overflow-auto p-6">
              {selectedProfileSection ? (
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">
                    {selectedProfileSection === 'hero' && ' Hero Section Editor'}
                    {selectedProfileSection === 'info' && 'Business Info Editor'}
                    {selectedProfileSection === 'brands' && ' Brand Slider Editor'}
                    {selectedProfileSection === 'products' && ' Products Editor'}
                    {selectedProfileSection === 'content' && ' Additional Content Editor'}
                    {selectedProfileSection === 'footer' && '🔗 Footer Editor'}
                  </h3>
                  <Button variant="outline" size="sm" onClick={() => setSelectedProfileSection(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Get Started</h3>
                  <p className="text-gray-600 mb-6">
                    Click on any section tab above or in the preview to start editing your profile.
                  </p>
                  <p className="text-sm text-gray-500">
                    Tip: You can also click directly on sections in the full page preview to edit them.
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
                    />
                  </div>

                  {/* Slide Selector and Add Button */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Label className="text-sm font-medium">Select Slide</Label>
                      <Select
                        value={selectedSlideIndex?.toString()}
                        onValueChange={(value) => setSelectedSlideIndex(parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a slide to edit" />
                        </SelectTrigger>
                        <SelectContent>
                          {heroContent.slides?.map((slide: any, index: number) => (
                            <SelectItem key={index} value={index.toString()}>
                              Slide {index + 1}: {slide.headline || 'Untitled'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end gap-2">
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
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Slide
                      </Button>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="border-b">
                    <div className="flex space-x-8">
                      <button
                        className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'content'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                        onClick={() => setActiveTab('content')}
                      >
                        Content
                      </button>
                      <button
                        className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'style'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                        onClick={() => setActiveTab('style')}
                      >
                        Style
                      </button>
                      <button
                        className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'settings'
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
                        <Card>
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
                                    <SelectTrigger>
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
                                  />
                                  <Button variant="outline" className="w-full">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload Media
                                  </Button>
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
                                  className="mt-2"
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
                                  className="mt-2"
                                />
                              </div>

                              {/* CTA */}
                              <div className="grid grid-cols-2 gap-4">
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
                                    className="mt-2"
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
                                    className="mt-2"
                                  />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {activeTab === 'style' && (
                        <Card>
                          <CardContent className="pt-6">
                            <div className="space-y-6">
                              {/* Headline Style */}
                              <div>
                                <h3 className="text-sm font-medium mb-4">Headline Style</h3>
                                <div className="grid grid-cols-2 gap-4">
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
                                      <SelectTrigger className="mt-2">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="text-2xl md:text-4xl">Small</SelectItem>
                                        <SelectItem value="text-3xl md:text-5xl">Medium</SelectItem>
                                        <SelectItem value="text-4xl md:text-6xl">Large</SelectItem>
                                        <SelectItem value="text-5xl md:text-7xl">Extra Large</SelectItem>
                                        <SelectItem value="text-6xl md:text-8xl">Huge</SelectItem>
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
                                        className="w-12 h-10 p-1"
                                      />
                                      <Input
                                        value={heroContent.slides[selectedSlideIndex].headlineColor || '#ffffff'}
                                        onChange={(e) => {
                                          const newSlides = [...heroContent.slides]
                                          newSlides[selectedSlideIndex] = { ...newSlides[selectedSlideIndex], headlineColor: e.target.value }
                                          setHeroContent(prev => ({ ...prev, slides: newSlides }))
                                        }}
                                        placeholder="#ffffff"
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
                                      <SelectTrigger className="mt-2">
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
                                <div className="grid grid-cols-2 gap-4">
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
                                      <SelectTrigger className="mt-2">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="text-sm md:text-base">Small</SelectItem>
                                        <SelectItem value="text-base md:text-lg">Medium</SelectItem>
                                        <SelectItem value="text-lg md:text-xl">Large</SelectItem>
                                        <SelectItem value="text-xl md:text-2xl">Extra Large</SelectItem>
                                        <SelectItem value="text-2xl md:text-3xl">Huge</SelectItem>
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
                                        className="w-12 h-10 p-1"
                                      />
                                      <Input
                                        value={heroContent.slides[selectedSlideIndex].subtextColor || '#ffffff'}
                                        onChange={(e) => {
                                          const newSlides = [...heroContent.slides]
                                          newSlides[selectedSlideIndex] = { ...newSlides[selectedSlideIndex], subtextColor: e.target.value }
                                          setHeroContent(prev => ({ ...prev, slides: newSlides }))
                                        }}
                                        placeholder="#ffffff"
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
                                      <SelectTrigger className="mt-2">
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
                        <Card>
                          <CardContent className="pt-6">
                            <div className="space-y-6">
                              <h3 className="text-sm font-medium">Slider Settings</h3>

                              <div className="space-y-4">
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
                                    <SelectTrigger className="mt-2">
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
                                    <SelectTrigger className="mt-2">
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

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-6 border-t">
                    <Button variant="outline" onClick={handleCloseEditor}>
                      Cancel
                    </Button>
                    <Button onClick={async () => {
                      if (!business) return
                      setIsLoading(true)
                      try {
                        const response = await fetch('/api/business', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ heroContent }),
                        })
                        if (response.ok) {
                          alert('Hero content saved successfully!')
                        } else {
                          alert('Failed to save hero content')
                        }
                      } catch (error) {
                        alert('Failed to save hero content')
                      } finally {
                        setIsLoading(false)
                      }
                    }}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
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
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Business Information</Label>
                    <div className="mt-2 space-y-4">
                      <div>
                        <Label>Business Name</Label>
                        <Input
                          value={businessInfoFormData.name}
                          onChange={(e) => setBusinessInfoFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Owner Name</Label>
                        <Input
                          value={businessInfoFormData.ownerName}
                          onChange={(e) => setBusinessInfoFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={businessInfoFormData.description}
                          onChange={(e) => setBusinessInfoFormData(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label>Logo URL</Label>
                        <div className="space-y-2">
                          <Input
                            value={businessInfoFormData.logo}
                            onChange={(e) => setBusinessInfoFormData(prev => ({ ...prev, logo: e.target.value }))}
                            placeholder="https://..."
                          />
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const input = document.createElement('input')
                                input.type = 'file'
                                input.accept = 'image/*'
                                input.onchange = async (e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0]
                                  if (file) {
                                    const formData = new FormData()
                                    formData.append('image', file)
                                    try {
                                      const response = await fetch('/api/business/upload', {
                                        method: 'POST',
                                        body: formData,
                                      })
                                      if (response.ok) {
                                        const data = await response.json()
                                        setBusinessInfoFormData(prev => ({ ...prev, logo: data.url }))
                                      } else {
                                        alert('Failed to upload image')
                                      }
                                    } catch (error) {
                                      alert('Failed to upload image')
                                    }
                                  }
                                }
                                input.click()
                              }}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Logo
                            </Button>
                            {businessInfoFormData.logo && (
                              <img src={businessInfoFormData.logo} alt="Logo preview" className="h-8 w-8 object-cover rounded" />
                            )}
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label>Address</Label>
                        <Input
                          value={businessInfoFormData.address}
                          onChange={(e) => setBusinessInfoFormData(prev => ({ ...prev, address: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input
                          value={businessInfoFormData.phone}
                          onChange={(e) => setBusinessInfoFormData(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          value={businessInfoFormData.email}
                          onChange={(e) => setBusinessInfoFormData(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Website</Label>
                        <Input
                          value={businessInfoFormData.website}
                          onChange={(e) => setBusinessInfoFormData(prev => ({ ...prev, website: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-6">
                    <Button variant="outline" onClick={handleCloseEditor}>
                      Cancel
                    </Button>
                    <Button onClick={async () => {
                      setIsLoading(true)
                      try {
                        // Filter out empty strings for optional fields
                        const cleanData = Object.fromEntries(
                          Object.entries(businessInfoFormData).map(([key, value]) => [
                            key,
                            value === "" ? undefined : value
                          ])
                        )

                        const response = await fetch('/api/business', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(cleanData),
                        })
                        if (response.ok) {
                          const result = await response.json()
                          setBusiness(result.business)
                          alert('Business information updated successfully!')
                        } else {
                          const error = await response.json()
                          alert(`Failed to update: ${error.error}`)
                        }
                      } catch (error) {
                        alert('Failed to update business information. Please try again.')
                      } finally {
                        setIsLoading(false)
                      }
                    }}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}

              {selectedProfileSection === 'content' && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium">Section Title</Label>
                    <Input
                      value={sectionTitles.content}
                      onChange={(e) => setSectionTitles(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Enter section title"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Additional Content</Label>
                    <div className="mt-2">
                      <RichTextEditor
                        content={editorContent}
                        onChange={setEditorContent}
                        placeholder="Add testimonials, FAQ, or additional information..."
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-6">
                    <Button variant="outline" onClick={handleCloseEditor}>
                      Cancel
                    </Button>
                    <Button onClick={handleAdditionalContentSave}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Content
                    </Button>
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
                    />
                  </div>

                  {/* Add New Brand Section */}
                  <Card>
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
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Brand Photo</Label>
                        <div className="space-y-2">
                          <Input
                            placeholder="Photo URL or upload below"
                            value={brandContent.newBrandLogo || ''}
                            onChange={(e) => setBrandContent(prev => ({ ...prev, newBrandLogo: e.target.value }))}
                          />
                          <ImageUpload
                            onUpload={(url) => setBrandContent(prev => ({ ...prev, newBrandLogo: url }))}
                          />
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          if (!brandContent.newBrandName?.trim()) {
                            alert('Please enter a brand name')
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
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Brand
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Brands Table */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Added Brands</CardTitle>
                      <CardDescription>Manage your brand collection</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {brandContent.brands?.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Brand Name</TableHead>
                              <TableHead>Logo</TableHead>
                              <TableHead className="w-20">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {brandContent.brands.map((brand: any, index: number) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{brand.name}</TableCell>
                                <TableCell>
                                  {brand.logo ? (
                                    <img
                                      src={brand.logo}
                                      alt={brand.name}
                                      className="h-8 w-8 object-cover rounded"
                                    />
                                  ) : (
                                    <div className="h-8 w-8 bg-gray-200 rounded flex items-center justify-center">
                                      <ImageIcon className="h-4 w-4 text-gray-400" />
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setBrandContent(prev => ({
                                        ...prev,
                                        brands: prev.brands.filter((_, i) => i !== index)
                                      }))
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-8">
                          <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No brands added yet</h3>
                          <p className="text-gray-600">Add your first brand using the form above</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-6 border-t">
                    <Button variant="outline" onClick={handleCloseEditor}>
                      Cancel
                    </Button>
                    <Button onClick={async () => {
                      if (!business) return
                      setIsLoading(true)
                      try {
                        // Clean up temporary form fields before saving
                        const { newBrandName, newBrandLogo, ...cleanBrandContent } = brandContent
                        const response = await fetch('/api/business', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ brandContent: cleanBrandContent }),
                        })
                        if (response.ok) {
                          alert('Brand content saved successfully!')
                        } else {
                          alert('Failed to save brand content')
                        }
                      } catch (error) {
                        alert('Failed to save brand content')
                      } finally {
                        setIsLoading(false)
                      }
                    }}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
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
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Footer Settings</Label>
                    <div className="mt-2 space-y-4">
                      <div>
                        <Label>Copyright Text</Label>
                        <Input placeholder="© 2024 Your Business Name. All rights reserved." />
                      </div>
                      <div>
                        <Label>Footer Links</Label>
                        <div className="space-y-2">
                          <div className="flex space-x-2">
                            <Input placeholder="Link Text" />
                            <Input placeholder="URL" />
                            <Button size="sm" variant="outline">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button variant="outline" size="sm">
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

                  <div className="flex justify-end space-x-3 pt-6">
                    <Button variant="outline" onClick={handleCloseEditor}>
                      Cancel
                    </Button>
                    <Button>
                      <Save className="h-4 w-4 mr-2" />
                      Save Footer
                    </Button>
                  </div>
                </div>
              )}

              {selectedProfileSection === 'products' && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium">Section Title</Label>
                    <Input
                      value={sectionTitles.products}
                      onChange={(e) => setSectionTitles(prev => ({ ...prev, products: e.target.value }))}
                      placeholder="Enter section title"
                    />
                  </div>

                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Products Manager</h3>
                    <p className="text-gray-600 mb-6">
                      Manage your products and services from the Products section in the sidebar.
                    </p>
                    <Button onClick={() => setActiveSection('products')}>
                      Go to Products Section
                    </Button>
                  </div>

                  <div className="flex justify-end space-x-3 pt-6">
                    <Button variant="outline" onClick={handleCloseEditor}>
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update product information below' : 'Fill in the details to add a new product or service'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleProductSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={productFormData.name}
                onChange={(e) => setProductFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter product name"
                required
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                value={productFormData.price}
                onChange={(e) => setProductFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="e.g., $50, Starting at $100, Free consultation"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={productFormData.image}
                onChange={(e) => setProductFormData(prev => ({ ...prev, image: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label>Select Existing Image</Label>
              <Select
                key={images.length}
                value={productFormData.image}
                onValueChange={(value) => setProductFormData(prev => ({ ...prev, image: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an existing image" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No image</SelectItem>
                  {images.map((image) => (
                    <SelectItem key={image} value={image}>
                      {image}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Upload New Image</Label>
              {mounted && (
                <ImageUpload
                  onUpload={(url) => setProductFormData(prev => ({ ...prev, image: url }))}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                key={categories.length}
                value={productFormData.categoryId}
                onValueChange={(value) => setProductFormData(prev => ({ ...prev, categoryId: value }))}
              >
                <SelectTrigger>
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

            <div className="space-y-2">
              <Label>Brand</Label>
              <Select
                key={brands.length}
                value={productFormData.brandId}
                onValueChange={(value) => setProductFormData(prev => ({ ...prev, brandId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
              <Label htmlFor="isActive">Visible on public page</Label>
            </div>

            <Separator />

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowProductDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  'Saving...'
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {editingProduct ? 'Update' : 'Add'} Product
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
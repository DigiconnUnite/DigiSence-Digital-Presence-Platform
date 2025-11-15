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
import { Checkbox } from '@/components/ui/checkbox'
import { DialogFooter } from '@/components/ui/dialog'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar'
import {
  Plus,
  Edit,
  Trash2,
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
  Menu
} from 'lucide-react'
import Link from 'next/link'

interface Business {
  id: string
  name: string
  slug: string
  description?: string
  logo?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  admin: {
    id: string
    email: string
    name?: string
  }
  category?: {
    id: string
    name: string
  }
  _count: {
    products: number
    inquiries: number
  }
}

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  parentId?: string
  _count: {
    businesses: number
  }
}

interface AdminStats {
  totalBusinesses: number
  totalInquiries: number
  totalUsers: number
  activeBusinesses: number
  totalProducts: number
  totalActiveProducts: number
}

export default function SuperAdminDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [inquiries, setInquiries] = useState<any[]>([])
  const [stats, setStats] = useState<AdminStats>({
    totalBusinesses: 0,
    totalInquiries: 0,
    totalUsers: 0,
    activeBusinesses: 0,
    totalProducts: 0,
    totalActiveProducts: 0,
  })
  const [showAddBusiness, setShowAddBusiness] = useState(false)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null)
  const [showEditBusiness, setShowEditBusiness] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [showRightPanel, setShowRightPanel] = useState(false)
  const [rightPanelContent, setRightPanelContent] = useState<'add-business' | 'edit-business' | 'add-category' | 'edit-category' | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [currentView, setCurrentView] = useState('dashboard')
  const [selectedBusinesses, setSelectedBusinesses] = useState<string[]>([])
  const [deleteBusiness, setDeleteBusiness] = useState<Business | null>(null)
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!loading && (!user || user.role !== 'SUPER_ADMIN')) {
      router.push('/login')
      return
    }

    if (user?.role === 'SUPER_ADMIN') {
      fetchData()
    }
  }, [user, loading, router])

  const fetchData = async () => {
    try {
      setIsLoading(true)

      // Fetch businesses
      const businessesRes = await fetch('/api/admin/businesses')
      if (businessesRes.ok) {
        const data = await businessesRes.json()
        setBusinesses(data.businesses)

        // Calculate stats
        const totalInquiries = data.businesses.reduce((sum: number, b: Business) => sum + b._count.inquiries, 0)
        const totalProducts = data.businesses.reduce((sum: number, b: Business) => sum + b._count.products, 0)
        const activeBusinesses = data.businesses.filter(b => b.isActive).length
        const totalActiveProducts = data.businesses.filter(b => b.isActive).reduce((sum: number, b: Business) => sum + b._count.products, 0)

        const totalUsers = data.businesses.length

        setStats({
          totalBusinesses: data.businesses.length,
          totalInquiries,
          totalUsers,
          activeBusinesses,
          totalProducts,
          totalActiveProducts,
        })
      }

      // Fetch categories
      const categoriesRes = await fetch('/api/admin/categories')
      if (categoriesRes.ok) {
        const data = await categoriesRes.json()
        setCategories(data.categories)
      }

      // Fetch inquiries
      const inquiriesRes = await fetch('/api/inquiries')
      if (inquiriesRes.ok) {
        const data = await inquiriesRes.json()
        setInquiries(data.inquiries)
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = 'Adm@'
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  const [generatedPassword, setGeneratedPassword] = useState('')
  const [generatedUsername, setGeneratedUsername] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleGenerateCredentials = (businessName: string, adminName: string) => {
    const baseUsername = adminName.toLowerCase().replace(/[^a-z0-9]/g, '') || businessName.toLowerCase().replace(/[^a-z0-9]/g, '')
    const username = `${baseUsername}_${Date.now().toString().slice(-4)}`
    const password = generatePassword()
    setGeneratedPassword(password)
    setGeneratedUsername(username)
  }

  const handleAddBusiness = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const manualUsername = formData.get('username') as string
    const manualPassword = formData.get('password') as string

    const businessData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: manualPassword || generatedPassword || generatePassword(),
      adminName: formData.get('adminName') as string,
      categoryId: formData.get('categoryId') as string,
      description: formData.get('description') as string,
      address: formData.get('address') as string,
      phone: formData.get('phone') as string,
      website: formData.get('website') as string,
    }

    console.log('Creating business:', businessData)

    try {
      const response = await fetch('/api/admin/businesses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(businessData),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Business creation successful')
        alert(`Business created successfully!\n\nLogin credentials:\nEmail: ${businessData.email}\nPassword: ${businessData.password}`)
        setShowRightPanel(false)
        setRightPanelContent(null)
        setGeneratedPassword('')
        setGeneratedUsername('')
        fetchData()
        e.currentTarget.reset()
      } else {
        const error = await response.json()
        console.error('Business creation failed:', error)
        alert(`Failed to create business: ${error.error}`)
      }
    } catch (error) {
      console.error('Business creation error:', error)
      alert('Failed to create business. Please try again.')
    }
  }

  const handleEditBusiness = (business: Business) => {
    setEditingBusiness(business)
    setRightPanelContent('edit-business')
    setShowRightPanel(true)
  }

  const handleUpdateBusiness = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingBusiness) return

    setIsLoading(true)
    const formData = new FormData(e.currentTarget)

    const updateData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      logo: formData.get('logo') as string,
      address: formData.get('address') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      website: formData.get('website') as string,
      categoryId: formData.get('categoryId') as string,
    }

    console.log('Updating business:', editingBusiness.id, updateData)

    try {
      const response = await fetch(`/api/admin/businesses/${editingBusiness.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        console.log('Update successful')
        await fetchData()
        setShowRightPanel(false)
        setRightPanelContent(null)
        alert('Business updated successfully!')
      } else {
        const error = await response.json()
        console.error('Update failed:', error)
        alert(`Failed to update business: ${error.error}`)
      }
    } catch (error) {
      console.error('Update error:', error)
      alert('Failed to update business. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteBusiness = async (business: Business) => {
    if (!confirm(`Are you sure you want to delete "${business.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/businesses/${business.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchData()
        alert('Business deleted successfully')
      } else {
        const error = await response.json()
        alert(`Failed to delete business: ${error.error}`)
      }
    } catch (error) {
      alert('Failed to delete business. Please try again.')
    }
  }

  const handleToggleBusinessStatus = async (business: Business) => {
    console.log('Toggling business status for:', business.id, 'current isActive:', business.isActive)
    try {
      const response = await fetch(`/api/admin/businesses/${business.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !business.isActive }),
      })

      if (response.ok) {
        console.log('Toggle successful')
        await fetchData()
      } else {
        const error = await response.json()
        console.error('Toggle failed:', error)
        alert(`Failed to update business status: ${error.error}`)
      }
    } catch (error) {
      console.error('Toggle error:', error)
      alert('Failed to toggle business status. Please try again.')
    }
  }

  const handleAddCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const categoryData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      parentId: formData.get('parentId') as string || undefined,
    }

    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      })

      if (response.ok) {
        const result = await response.json()
        alert('Category created successfully!')
        setShowRightPanel(false)
        setRightPanelContent(null)
        fetchData()
        e.currentTarget.reset()
      } else {
        const error = await response.json()
        alert(`Failed to create category: ${error.error}`)
      }
    } catch (error) {
      alert('Failed to create category. Please try again.')
    }
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setRightPanelContent('edit-category')
    setShowRightPanel(true)
  }

  const handleUpdateCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingCategory) return

    const formData = new FormData(e.currentTarget)

    const updateData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      parentId: formData.get('parentId') as string || null,
    }

    console.log('Updating category:', editingCategory.id, updateData)

    try {
      const response = await fetch(`/api/admin/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        console.log('Category update successful')
        fetchData()
        setShowRightPanel(false)
        setRightPanelContent(null)
        alert('Category updated successfully!')
      } else {
        const error = await response.json()
        console.error('Category update failed:', error)
        alert(`Failed to update category: ${error.error}`)
      }
    } catch (error) {
      console.error('Category update error:', error)
      alert('Failed to update category. Please try again.')
    }
  }

  const handleDeleteCategory = async (category: Category) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
      return
    }

    console.log('Deleting category:', category.id)

    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        console.log('Category delete successful')
        fetchData()
        alert('Category deleted successfully')
      } else {
        const error = await response.json()
        console.error('Category delete failed:', error)
        alert(`Failed to delete category: ${error.error}`)
      }
    } catch (error) {
      console.error('Category delete error:', error)
      alert('Failed to delete category. Please try again.')
    }
  }

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && business.isActive) ||
      (filterStatus === 'inactive' && !business.isActive)
    return matchesSearch && matchesStatus
  })

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredStats = {
    total: filteredBusinesses.length,
    active: filteredBusinesses.filter(b => b.isActive).length,
    inactive: filteredBusinesses.filter(b => !b.isActive).length,
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user || user.role !== 'SUPER_ADMIN') {
    return null
  }

  const menuItems = [
    {
      title: 'Dashboard',
      icon: BarChart3,
      value: 'dashboard',
    },
    {
      title: 'Businesses',
      icon: Building,
      value: 'businesses',
    },
    {
      title: 'Categories',
      icon: Settings,
      value: 'categories',
    },
    {
      title: 'Inquiries',
      icon: MessageSquare,
      value: 'inquiries',
    },
    {
      title: 'Analytics',
      icon: TrendingUp,
      value: 'analytics',
    },
    {
      title: 'Settings',
      icon: Settings,
      value: 'settings',
    },
  ]

  const renderMiddleContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">Total Businesses</CardTitle>
                  <Building className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalBusinesses}</div>
                  <p className="text-xs text-gray-500">Registered businesses</p>
                </CardContent>
              </Card>
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">Active Businesses</CardTitle>
                  <UserCheck className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stats.activeBusinesses}</div>
                  <p className="text-xs text-gray-500">Currently active</p>
                </CardContent>
              </Card>
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">Total Products</CardTitle>
                  <Package className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalProducts}</div>
                  <p className="text-xs text-gray-500">All products & services</p>
                </CardContent>
              </Card>
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">Platform Health</CardTitle>
                  <Activity className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.activeBusinesses > 0 ? 'Excellent' : 'Growing'}
                  </div>
                  <p className="text-xs text-gray-500">System status</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              {/* <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-900">Quick Actions</CardTitle>
                  <CardDescription className="text-gray-600">Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={() => setShowAddBusiness(true)} className="w-full justify-start bg-black hover:bg-gray-800 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Business
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentView('businesses')} className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50">
                    <Building className="h-4 w-4 mr-2" />
                    Manage Businesses
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentView('categories')} className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure Categories
                  </Button>
                </CardContent>
              </Card> */}

              {/* Platform Analytics */}
              {/* <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-900">Platform Analytics</CardTitle>
                  <CardDescription className="text-gray-600">Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">+{Math.floor(stats.totalBusinesses * 1.2)}%</div>
                      <p className="text-sm text-gray-600">Growth Rate</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Users className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-600">{stats.totalUsers}</div>
                      <p className="text-sm text-gray-600">Active Admins</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Mail className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-600">{stats.totalInquiries}</div>
                      <p className="text-sm text-gray-600">Total Inquiries</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Activity className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-600">{stats.totalProducts}</div>
                      <p className="text-sm text-gray-600">Total Products</p>
                    </div>
                  </div>
                </CardContent>
              </Card> */}
            </div>
          </div>
        )
      case 'businesses':
        return (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 shadow-sm rounded-lg">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">ALL BUSINESSES</h2>
                <p className="text-gray-600">Manage all business accounts and their administrators</p>
              </div>
              <div className="p-6">
                {/* Search and Filters */}
                <div className="flex space-x-4 mb-6">
                  <Button onClick={() => { setRightPanelContent('add-business'); setShowRightPanel(true); }} className="bg-black hover:bg-gray-800 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New
                  </Button>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by Status: Active v" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All ({filteredStats.total})</SelectItem>
                      <SelectItem value="active">Active ({filteredStats.active})</SelectItem>
                      <SelectItem value="inactive">Inactive ({filteredStats.inactive})</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-900">Business Name</TableHead>
                      <TableHead className="text-gray-900">Admin Email</TableHead>
                      <TableHead className="text-gray-900">Category</TableHead>
                      <TableHead className="text-gray-900">Status</TableHead>
                      <TableHead className="text-gray-900">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBusinesses.map((business) => (
                      <TableRow key={business.id}>
                        <TableCell className="text-gray-900 font-medium">{business.name}</TableCell>
                        <TableCell className="text-gray-900">{business.admin.email}</TableCell>
                        <TableCell className="text-gray-900">{business.category?.name || 'None'}</TableCell>
                        <TableCell>
                          <Badge variant={business.isActive ? "default" : "secondary"}>
                            {business.isActive ? 'Active' : 'Suspended'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleEditBusiness(business)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteBusiness(business)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )
      case 'categories':
        return (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 shadow-sm rounded-lg">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">CATEGORY MANAGER</h2>
                <p className="text-gray-600">Configure business categories and classifications</p>
              </div>
              <div className="p-6">
                <Button onClick={() => { setRightPanelContent('add-category'); setShowRightPanel(true); }} variant="outline" className="mb-6">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Category
                </Button>

                <div className="space-y-4">
                  {filteredCategories.filter(c => !c.parentId).map((parentCategory) => (
                    <div key={parentCategory.id}>
                      <div className="flex items-center space-x-2 p-2 border rounded-lg">
                        <span className="text-lg">📁</span>
                        <span className="font-medium">{parentCategory.name}</span>
                        <div className="ml-auto flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditCategory(parentCategory)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteCategory(parentCategory)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {filteredCategories.filter(c => c.parentId === parentCategory.id).map((childCategory) => (
                        <div key={childCategory.id} className="ml-8 flex items-center space-x-2 p-2 border-l-2 border-gray-200">
                          <span className="text-sm">📄</span>
                          <span className="text-sm">{childCategory.name}</span>
                          <div className="ml-auto flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditCategory(childCategory)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteCategory(childCategory)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      case 'inquiries':
        return (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 shadow-sm rounded-lg">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">INQUIRIES MANAGEMENT</h2>
                <p className="text-gray-600">View and manage customer inquiries</p>
              </div>
              <div className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-900">Customer</TableHead>
                      <TableHead className="text-gray-900">Business</TableHead>
                      <TableHead className="text-gray-900">Message</TableHead>
                      <TableHead className="text-gray-900">Status</TableHead>
                      <TableHead className="text-gray-900">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inquiries.map((inquiry) => (
                      <TableRow key={inquiry.id}>
                        <TableCell className="text-gray-900">
                          <div>
                            <div className="font-medium">{inquiry.name}</div>
                            <div className="text-sm text-gray-500">{inquiry.email}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-900">{inquiry.business?.name}</TableCell>
                        <TableCell className="text-gray-900 max-w-xs truncate">{inquiry.message}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{inquiry.status}</Badge>
                        </TableCell>
                        <TableCell className="text-gray-900">{new Date(inquiry.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )
      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 shadow-sm rounded-lg">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">PLATFORM ANALYTICS</h2>
                <p className="text-gray-600">Detailed analytics and insights</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Total Inquiries</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{inquiries.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Active Businesses</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.activeBusinesses}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Total Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalProducts}</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        )
      case 'settings':
        return (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 shadow-sm rounded-lg">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">SYSTEM SETTINGS</h2>
                <p className="text-gray-600">Configure system preferences</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <Label>Platform Name</Label>
                    <Input defaultValue="DigiSence" />
                  </div>
                  <div>
                    <Label>Admin Email</Label>
                    <Input defaultValue="admin@digisence.com" />
                  </div>
                  <Button>Save Settings</Button>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return <div>Select a menu item</div>
    }
  }

  const renderRightPanel = () => {
    if (!showRightPanel) return null

    if (rightPanelContent === 'add-business') {
      return (
        <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">ADD BUSINESS</h3>
            <form onSubmit={handleAddBusiness} className="space-y-4">
              <div className="space-y-2">
                <Label>Business Name</Label>
                <Input name="name" required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea name="description" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select name="categoryId">
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
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
                <Label>Address</Label>
                <Input name="address" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input name="phone" />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input name="website" />
              </div>
              <div className="space-y-2">
                <Label>--- Admin Account ---</Label>
              </div>
              <div className="space-y-2">
                <Label>Admin Name</Label>
                <Input name="adminName" required />
              </div>
              <div className="space-y-2">
                <Label>Admin Email</Label>
                <Input name="email" type="email" required />
              </div>
              <Button type="button" onClick={(e) => {
                e.preventDefault()
                const form = e.currentTarget.closest('form') as HTMLFormElement
                const businessName = (form.querySelector('input[name="name"]') as HTMLInputElement)?.value || ''
                const adminName = (form.querySelector('input[name="adminName"]') as HTMLInputElement)?.value || ''
                handleGenerateCredentials(businessName, adminName)
              }}>Generate Credentials</Button>
              <div className="space-y-2">
                <Label>Username</Label>
                <Input name="username" value={generatedUsername} onChange={(e) => setGeneratedUsername(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Input name="password" type={showPassword ? 'text' : 'password'} value={generatedPassword} onChange={(e) => setGeneratedPassword(e.target.value)} className="pr-10" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">(Leave empty to use generated or enter manually)</p>
              </div>
              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={() => { setShowRightPanel(false); setRightPanelContent(null); setGeneratedPassword(''); setGeneratedUsername(''); }}>Cancel</Button>
                <Button type="submit">Create Business</Button>
              </div>
            </form>
          </div>
        </div>
      )
    }

    if (rightPanelContent === 'edit-business' && editingBusiness) {
      return (
        <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">EDIT BUSINESS</h3>
            <form onSubmit={handleUpdateBusiness} className="space-y-4">
              <div className="space-y-2">
                <Label>Business Name</Label>
                <Input name="name" defaultValue={editingBusiness.name} required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea name="description" defaultValue={editingBusiness.description} />
              </div>
              <div className="space-y-2">
                <Label>Logo URL</Label>
                <Input name="logo" defaultValue={editingBusiness.logo} />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input name="address" defaultValue={editingBusiness.address} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input name="phone" defaultValue={editingBusiness.phone} />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input name="website" defaultValue={editingBusiness.website} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select name="categoryId" defaultValue={editingBusiness.category?.id}>
                  <SelectTrigger>
                    <SelectValue />
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
                <Label>Admin Email</Label>
                <Input name="email" defaultValue={editingBusiness.admin.email} type="email" />
              </div>
              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={() => { setShowRightPanel(false); setRightPanelContent(null); }}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )
    }

    if (rightPanelContent === 'add-category') {
      return (
        <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">ADD CATEGORY</h3>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div className="space-y-2">
                <Label>Category Name</Label>
                <Input name="name" required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea name="description" />
              </div>
              <div className="space-y-2">
                <Label>Parent Category</Label>
                <Select name="parentId">
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No parent</SelectItem>
                    {categories.filter(c => !c.parentId).map((category) => (
                      <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={() => { setShowRightPanel(false); setRightPanelContent(null); }}>Cancel</Button>
                <Button type="submit">Create Category</Button>
              </div>
            </form>
          </div>
        </div>
      )
    }

    if (rightPanelContent === 'edit-category' && editingCategory) {
      return (
        <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">EDIT CATEGORY</h3>
            <form onSubmit={handleUpdateCategory} className="space-y-4">
              <div className="space-y-2">
                <Label>Category Name</Label>
                <Input name="name" defaultValue={editingCategory.name} required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea name="description" defaultValue={editingCategory.description} />
              </div>
              <div className="space-y-2">
                <Label>Parent Category</Label>
                <Select name="parentId" defaultValue={editingCategory.parentId || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No parent</SelectItem>
                    {categories.filter(c => !c.parentId && c.id !== editingCategory.id).map((category) => (
                      <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={() => { setShowRightPanel(false); setRightPanelContent(null); }}>Cancel</Button>
                <Button type="submit">Update Category</Button>
              </div>
            </form>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header Bar */}
      <div className="bg-white  border-b border-gray-200">
        <div className="flex justify-between items-center px-6 py-3">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-black rounded-xl">
              {/* <Crown className="h-8 w-8 text-white" /> */}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">DigiSence Logo.</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                className="pl-10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name || 'Super Admin'}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
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
              <Crown className="h-6 w-6" />
              <span className="font-semibold">Super Admin</span>
            </div>
          </div>
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.value}>
                  <button
                    onClick={() => setCurrentView(item.value)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      currentView === item.value
                        ? 'bg-black text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Middle Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-6 overflow-auto">
            {renderMiddleContent()}
          </div>
        </div>

        {/* Right Editor Panel */}
        <div className={`w-80 bg-white border-l border-gray-200 flex flex-col transition-transform duration-300 ease-in-out ${
          showRightPanel ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex-1 overflow-auto">
            {renderRightPanel()}
          </div>
        </div>
      </div>
    </div>
  )
}

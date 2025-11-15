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
  Switch
} from '@/components/ui/switch'
import ImageUpload from '@/components/ui/image-upload'
import {
  Plus,
  Edit,
  Trash2,
  Save,
  Eye,
  Image as ImageIcon,
  Package,
  MessageCircle,
  ExternalLink
} from 'lucide-react'

interface Product {
  id: string
  name: string
  description?: string
  image?: string
  category?: { id: string; name: string }
  brand?: { id: string; name: string }
  inStock: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function ProductsManagementPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([])
  const [business, setBusiness] = useState<{ id: string; slug: string; name: string; phone?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    categoryId: '',
    brandId: '',
    inStock: true,
    isActive: true,
  })

  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    if (!loading && (!user || user.role !== 'BUSINESS_ADMIN')) {
      router.push('/dashboard')
      return
    }

    if (user?.role === 'BUSINESS_ADMIN') {
      fetchProducts()
      fetchCategories()
      fetchBrands()
      fetchBusiness()
    }
  }, [user, loading, router])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/business/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products)
        setImages([...new Set(data.products.map(p => p.image).filter(Boolean))] as string[])
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
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
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/brands')
      if (response.ok) {
        const data = await response.json()
        setBrands(data.brands)
      }
    } catch (error) {
      console.error('Failed to fetch brands:', error)
    }
  }

  const fetchBusiness = async () => {
    try {
      const response = await fetch('/api/business')
      if (response.ok) {
        const data = await response.json()
        setBusiness(data.business)
      }
    } catch (error) {
      console.error('Failed to fetch business:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
      categoryId: '',
      brandId: '',
      inStock: true,
      isActive: true,
    })
    setEditingProduct(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

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
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchProducts()
        setShowAddDialog(false)
        resetForm()
        alert(editingProduct ? 'Product updated successfully!' : 'Product added successfully!')
      } else {
        const error = await response.json()
        alert(`Failed to ${editingProduct ? 'update' : 'add'} product: ${error.error}`)
      }
    } catch (error) {
      alert(`Failed to ${editingProduct ? 'update' : 'add'} product. Please try again.`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      image: product.image || '',
      categoryId: product.category?.id || '',
      brandId: product.brand?.id || '',
      inStock: product.inStock,
      isActive: product.isActive,
    })
    setShowAddDialog(true)
  }

  const handleDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/business/products/${product.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchProducts()
        alert('Product deleted successfully!')
      } else {
        const error = await response.json()
        alert(`Failed to delete product: ${error.error}`)
      }
    } catch (error) {
      alert('Failed to delete product. Please try again.')
    }
  }

  const handleWhatsAppEnquiry = (product: Product) => {
    if (!business?.phone) {
      alert('Business phone number not available')
      return
    }

    const message = `Hi, I'm interested in your product: ${product.name}. Can you provide more information?`
    const whatsappUrl = `https://wa.me/${business.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleProductLink = (product: Product) => {
    if (!business?.slug) {
      alert('Business link not available')
      return
    }

    const productUrl = `${window.location.origin}/${business.slug}#products`
    navigator.clipboard.writeText(productUrl).then(() => {
      alert('Product link copied to clipboard!')
    }).catch(() => {
      // Fallback: open in new tab
      window.open(productUrl, '_blank')
    })
  }

  const openAddDialog = () => {
    resetForm()
    setShowAddDialog(true)
  }

  if (loading || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user || user.role !== 'BUSINESS_ADMIN') {
    return null
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Products & Services</h1>
          <p className="text-gray-600">Manage your products and services</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">All products and services</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter(p => p.inStock).length}
            </div>
            <p className="text-xs text-muted-foreground">Available for purchase</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter(p => !p.inStock).length}
            </div>
            <p className="text-xs text-muted-foreground">Currently unavailable</p>
          </CardContent>
        </Card>
      </div>

      {/* Products List */}
      <Card>
        <CardHeader>
          <CardTitle>Products & Services</CardTitle>
          <CardDescription>Manage your product offerings</CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-600 mb-4">Add your first product or service to get started</p>
              <Button onClick={openAddDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  {product.image && (
                    <div className="h-48 bg-gray-200">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {product.category && (
                            <Badge variant="secondary">
                              {product.category.name}
                            </Badge>
                          )}
                          {product.brand && (
                            <Badge variant="outline">
                              {product.brand.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge variant={product.isActive ? "default" : "secondary"}>
                          {product.isActive ? 'Visible' : 'Hidden'}
                        </Badge>
                        <Badge variant={product.inStock ? "default" : "destructive"}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4 line-clamp-3">
                      {product.description || 'No description available'}
                    </CardDescription>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(product)}
                        className="flex-1 min-w-0"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleWhatsAppEnquiry(product)}
                        className="flex-1 min-w-0"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        WhatsApp
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleProductLink(product)}
                        className="flex-1 min-w-0"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Link
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(product)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? 'Update the product information below'
                : 'Fill in the details to add a new product or service'
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your product or service"
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Category and Brand Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Category & Brand</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Select Category</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
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
                  <Label htmlFor="brand">Select Brand</Label>
                  <Select
                    value={formData.brandId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, brandId: value }))}
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
              </div>
            </div>

            {/* Product Image */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Product Image</h3>
              <div className="space-y-2">
                <Label>Select Existing Image</Label>
                <Select
                  value={formData.image}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, image: value }))}
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
                <Label>Upload Product Image</Label>
                <ImageUpload
                  onUpload={(url) => setFormData(prev => ({ ...prev, image: url }))}
                />
                {formData.image && (
                  <div className="mt-4">
                    <Label className="text-sm text-gray-600">Image Preview:</Label>
                    <div className="mt-2">
                      <img
                        src={formData.image}
                        alt="Product preview"
                        className="w-48 h-48 object-cover rounded-lg border-2 border-gray-200"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Product Status Toggles */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Product Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label htmlFor="inStock" className="text-sm font-medium">Stock Status</Label>
                    <p className="text-sm text-gray-600">Is this product currently in stock?</p>
                  </div>
                  <Switch
                    id="inStock"
                    checked={formData.inStock}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, inStock: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label htmlFor="isActive" className="text-sm font-medium">Visibility</Label>
                    <p className="text-sm text-gray-600">Should this product be visible on the public page?</p>
                  </div>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
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
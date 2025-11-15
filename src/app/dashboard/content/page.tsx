'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
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
  Plus,
  Edit,
  Trash2,
  Save,
  Eye,
  Upload,
  FileText,
  Package,
  MessageSquare,
  ChevronUp,
  ChevronDown
} from 'lucide-react'
import RichTextEditor from '@/components/ui/rich-text-editor'
import ImageUpload from '@/components/ui/image-upload'

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
  categoryId?: string
  heroContent: any
  brandContent: any
  additionalContent?: string
  category?: {
    id: string
    name: string
  }
}

interface Category {
  id: string
  name: string
  slug: string
  parentId?: string
}

export default function ContentManagementPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [business, setBusiness] = useState<Business | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showHeroEditor, setShowHeroEditor] = useState(false)
  const [showBrandEditor, setShowBrandEditor] = useState(false)
  const [showContentEditor, setShowContentEditor] = useState(false)
  const [editorContent, setEditorContent] = useState('')
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState('content')
  const [sectionTitles, setSectionTitles] = useState({ hero: 'Hero Section' })
  const [heroContent, setHeroContent] = useState<any>({ slides: [], autoPlay: true, transitionSpeed: 5, transitionEffect: 'fade', showDots: true, showArrows: true })
  const [isUploadingMedia, setIsUploadingMedia] = useState(false)
  const [stats, setStats] = useState({
    products: 0,
    inquiries: 0,
    views: 0,
  })

  useEffect(() => {
    if (!loading && (!user || user.role !== 'BUSINESS_ADMIN')) {
      router.push('/dashboard')
      return
    }

    if (user?.role === 'BUSINESS_ADMIN') {
      fetchData()
    }
  }, [user, loading, router])

  const fetchData = async () => {
    try {
      // Fetch business data
      const businessRes = await fetch('/api/business')
      if (businessRes.ok) {
        const data = await businessRes.json()
        setBusiness(data.business)
        setEditorContent(data.business.additionalContent || '')
        setHeroContent(data.business.heroContent || { slides: [], autoPlay: true, transitionSpeed: 5, transitionEffect: 'fade', showDots: true, showArrows: true })
      }

      // Fetch categories
      const categoriesRes = await fetch('/api/categories')
      if (categoriesRes.ok) {
        const data = await categoriesRes.json()
        setCategories(data.categories)
      }

      // Fetch stats
      const statsRes = await fetch('/api/business/stats')
      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const [isUploading, setIsUploading] = useState(false)

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

    setIsSaving(true)
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
      setIsSaving(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await fetch('/api/business/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()

        // Update the logo field with the new image URL
        setBusiness(prev => {
          if (!prev) return prev
          return {
            ...prev,
            logo: result.url
          }
        })

        alert('Image uploaded successfully!')
      } else {
        const error = await response.json()
        alert(`Failed to upload image: ${error.error}`)
      }
    } catch (error) {
      alert('Failed to upload image. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleHeroContentSave = async () => {
    if (!business) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/business', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ heroContent }),
      })

      if (response.ok) {
        const result = await response.json()
        setBusiness(result.business)
        setShowHeroEditor(false)
        alert('Hero content updated successfully!')
      } else {
        const error = await response.json()
        alert(`Failed to update: ${error.error}`)
      }
    } catch (error) {
      alert('Failed to update hero content. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCloseEditor = () => {
    setShowHeroEditor(false)
    setSelectedSlideIndex(null)
    setActiveTab('content')
  }

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || selectedSlideIndex === null) return

    setIsUploadingMedia(true)

    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await fetch('/api/business/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        const newSlides = [...heroContent.slides]
        newSlides[selectedSlideIndex] = { ...newSlides[selectedSlideIndex], media: result.url }
        setHeroContent(prev => ({ ...prev, slides: newSlides }))
        alert('Media uploaded successfully!')
      } else {
        const error = await response.json()
        alert(`Failed to upload media: ${error.error}`)
      }
    } catch (error) {
      alert('Failed to upload media. Please try again.')
    } finally {
      setIsUploadingMedia(false)
    }
  }

  const handleBrandContentSave = async (brandContent: any) => {
    if (!business) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/business', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ brandContent }),
      })

      if (response.ok) {
        const result = await response.json()
        setBusiness(result.business)
        setShowBrandEditor(false)
        alert('Brand content updated successfully!')
      } else {
        const error = await response.json()
        alert(`Failed to update: ${error.error}`)
      }
    } catch (error) {
      alert('Failed to update brand content. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAdditionalContentSave = async () => {
    if (!business) return

    setIsSaving(true)
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
      setIsSaving(false)
    }
  }


  if (loading || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user || user.role !== 'BUSINESS_ADMIN' || !business) {
    return null
  }


  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Content Management</h1>
          <p className="text-gray-600">Manage your business profile content</p>
        </div>
        <Button variant="outline" asChild>
          <a href={`/${business.slug}`} target="_blank" rel="noopener noreferrer">
            <Eye className="h-4 w-4 mr-2" />
            View Public Page
          </a>
        </Button>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Update your business details and contact information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBasicInfoSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Business Name *</Label>
                <Input id="name" name="name" defaultValue={business.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <Select name="categoryId" defaultValue={business.categoryId || ''}>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Logo URL</Label>
              <div className="flex space-x-2">
                <Input id="logo" name="logo" defaultValue={business.logo || ''} placeholder="https://..." />
                <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('logo-upload')?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" defaultValue={business.address || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" defaultValue={business.phone || ''} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={business.email || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" name="website" defaultValue={business.website || ''} placeholder="https://..." />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>


      {/* Hero Slider */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Hero Slider</CardTitle>
              <CardDescription>Manage your main hero section slides</CardDescription>
            </div>
            <Dialog open={showHeroEditor} onOpenChange={setShowHeroEditor}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Slides
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Hero Section</DialogTitle>
                  <DialogDescription>
                    Configure your hero section with advanced styling and settings
                  </DialogDescription>
                </DialogHeader>
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

                 {/* Row 1: Slide Selector */}
                 <div className="w-full">
                   <Label className="text-sm font-medium">Select Slide</Label>
                   <Select
                     value={selectedSlideIndex?.toString()}
                     onValueChange={(value) => {
                       if (value === 'add') {
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
                       } else {
                         setSelectedSlideIndex(parseInt(value))
                       }
                     }}
                   >
                     <SelectTrigger className="w-full">
                       <SelectValue placeholder="Select a slide to edit" />
                     </SelectTrigger>
                     <SelectContent>
                       {heroContent.slides?.map((slide: any, index: number) => (
                         <SelectItem key={index} value={index.toString()}>
                            {index + 1}: {slide.headline || 'Untitled'}
                         </SelectItem>
                       ))}
                       <SelectItem value="add">
                         <div className="flex items-center">
                           <Plus className="h-4 w-4 mr-2" />
                           Add New Slide
                         </div>
                       </SelectItem>
                     </SelectContent>
                   </Select>
                 </div>

                 {/* Row 2: Slide Management Buttons */}
                 {selectedSlideIndex !== null && (
                   <div className="flex items-center justify-start gap-3 mt-6 p-4 bg-gray-50 rounded-lg border">
                     <span className="text-sm font-medium text-gray-700 mr-2">Manage Selected Slide:</span>
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
                       title="Move slide up"
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
                       title="Move slide down"
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
                       title="Delete slide"
                       className="ml-4 text-red-600 hover:text-red-700"
                     >
                       <Trash2 className="h-4 w-4" />
                     </Button>
                   </div>
                 )}

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
                                  <Button variant="outline" className="w-full" onClick={() => document.getElementById('media-upload')?.click()}>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload Media
                                  </Button>
                                  <input
                                    id="media-upload"
                                    type="file"
                                    accept="image/*,video/*"
                                    onChange={handleMediaUpload}
                                    className="hidden"
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
                    <Button onClick={handleHeroContentSave} disabled={isSaving}>
                      {isSaving ? 'Saving...' : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {heroContent.slides?.map((slide: any, index: number) => (
              <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0">
                  {slide.media && (
                    <img
                      src={slide.media}
                      alt={slide.headline}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{slide.headline}</h4>
                  <p className="text-sm text-gray-600">{slide.subtext}</p>
                  <p className="text-sm text-blue-600">CTA: {slide.cta}</p>
                </div>
              </div>
            ))}
            {heroContent.slides?.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No hero slides configured yet. Click "Edit Slides" to add some.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Brand Content */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Brand Content</CardTitle>
              <CardDescription>Manage your trusted brands and partners</CardDescription>
            </div>
            <Dialog open={showBrandEditor} onOpenChange={setShowBrandEditor}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Brands
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Brands</DialogTitle>
                  <DialogDescription>
                    Configure your trusted brands and partners
                  </DialogDescription>
                </DialogHeader>
                <BrandEditor
                  brands={business.brandContent?.brands || []}
                  onSave={handleBrandContentSave}
                  onCancel={() => setShowBrandEditor(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(business.brandContent?.brands || []).map((brand: any, index: number) => (
              <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0">
                  {brand.logo && (
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{brand.name}</h4>
                </div>
              </div>
            ))}
            {(business.brandContent?.brands || []).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No brands configured yet. Click "Edit Brands" to add some.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional Content */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Additional Content</CardTitle>
              <CardDescription>Add testimonials, FAQ, or "How It Works" content</CardDescription>
            </div>
            <Dialog open={showContentEditor} onOpenChange={setShowContentEditor}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Edit Content
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Additional Content</DialogTitle>
                  <DialogDescription>
                    Add rich text content for testimonials, FAQ, or additional information
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAdditionalContentSave} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <RichTextEditor
                      content={editorContent}
                      onChange={setEditorContent}
                      placeholder="Add your additional content here..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Upload Images</Label>
                    <ImageUpload
                      onUpload={(url) => {
                        // Insert image into rich text editor
                        setEditorContent(prev => prev + `<img src="${url}" alt="Image" />`)
                      }}
                      maxFiles={5}
                    />
                  </div>
                  <Separator />
                  <div className="flex justify-end space-x-3">
                    <Button type="button" variant="outline" onClick={() => setShowContentEditor(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>Saving...</>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Content
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ __html: business.additionalContent || '' }} />
          </div>
        </CardContent>
      </Card>


      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.products}</div>
            <p className="text-xs text-muted-foreground">Products and services</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inquiries}</div>
            <p className="text-xs text-muted-foreground">Customer inquiries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Completion</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {[
                business.name ? 25 : 0,
                business.description ? 25 : 0,
                business.logo ? 25 : 0,
                business.address ? 25 : 0,
                business.phone ? 25 : 0,
                business.email ? 25 : 0,
                business.website ? 25 : 0,
                heroContent.slides?.length > 0 ? 25 : 0,
                business.brandContent?.brands?.length > 0 ? 25 : 0,
                business.additionalContent ? 25 : 0,
              ].reduce((sum, val) => sum + val, 0)}%
            </div>
            <p className="text-xs text-muted-foreground">Profile completion</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


// Brand Editor Component
function BrandEditor({ brands, onSave, onCancel }: { 
  brands: any[], 
  onSave: (brands: any) => void, 
  onCancel: () => void 
}) {
  const [currentBrands, setCurrentBrands] = useState(brands)

  const addBrand = () => {
    setCurrentBrands([...currentBrands, {
      name: '',
      logo: ''
    }])
  }

  const updateBrand = (index: number, field: string, value: string) => {
    const updatedBrands = [...currentBrands]
    updatedBrands[index] = { ...updatedBrands[index], [field]: value }
    setCurrentBrands(updatedBrands)
  }

  const removeBrand = (index: number) => {
    setCurrentBrands(currentBrands.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    onSave({ brands: currentBrands })
  }

  return (
    <div className="space-y-6">
      {currentBrands.map((brand, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Brand {index + 1}</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => removeBrand(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Brand Name</Label>
              <Input 
                value={brand.name} 
                onChange={(e) => updateBrand(index, 'name', e.target.value)}
                placeholder="Brand name"
              />
            </div>
            <div className="space-y-2">
              <Label>Logo URL</Label>
              <Input 
                value={brand.logo} 
                onChange={(e) => updateBrand(index, 'logo', e.target.value)}
                placeholder="https://..."
              />
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-between">
        <Button variant="outline" onClick={addBrand}>
          <Plus className="h-4 w-4 mr-2" />
          Add Brand
        </Button>
        <div className="space-x-3">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave}>Save Brands</Button>
        </div>
      </div>
    </div>
  )
}
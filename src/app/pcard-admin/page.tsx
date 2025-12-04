'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getOptimizedImageUrl } from '@/lib/cloudinary'
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  User,
  Briefcase,
  MapPin,
  Mail,
  Phone,
  Globe,
  Upload,
  X
} from 'lucide-react'

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
  createdAt: Date
  updatedAt: Date
  adminId: string
  workExperience: any
  education: any
  skills: any
  servicesOffered: any
  contactInfo: any
  portfolio: any
  contactDetails: any
  ctaButton: any
}

interface ProfessionalFormData {
  name: string
  professionalHeadline: string
  aboutMe: string
  profilePicture: string
  banner: string
  location: string
  phone: string
  email: string
  website: string
  facebook: string
  twitter: string
  instagram: string
  linkedin: string
  workExperience: any[]
  education: any[]
  skills: string[]
  servicesOffered: any[]
  portfolio: any[]
  contactDetails: any
  ctaButton: any
}

export default function PcardAdminPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [filteredProfessionals, setFilteredProfessionals] = useState<Professional[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null)
  const [formData, setFormData] = useState<ProfessionalFormData>({
    name: '',
    professionalHeadline: '',
    aboutMe: '',
    profilePicture: '',
    banner: '',
    location: '',
    phone: '',
    email: '',
    website: '',
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: '',
    workExperience: [],
    education: [],
    skills: [],
    servicesOffered: [],
    portfolio: [],
    contactDetails: {},
    ctaButton: {}
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = editingProfessional
        ? `/api/professionals/${editingProfessional.id}`
        : '/api/professionals'

      const method = editingProfessional ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchProfessionals()
        setModalOpen(false)
        resetForm()
      } else {
        console.error('Failed to save professional')
      }
    } catch (error) {
      console.error('Error saving professional:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (professional: Professional) => {
    setEditingProfessional(professional)
    setFormData({
      name: professional.name,
      professionalHeadline: professional.professionalHeadline || '',
      aboutMe: professional.aboutMe || '',
      profilePicture: professional.profilePicture || '',
      banner: professional.banner || '',
      location: professional.location || '',
      phone: professional.phone || '',
      email: professional.email || '',
      website: professional.website || '',
      facebook: professional.facebook || '',
      twitter: professional.twitter || '',
      instagram: professional.instagram || '',
      linkedin: professional.linkedin || '',
      workExperience: professional.workExperience || [],
      education: professional.education || [],
      skills: professional.skills || [],
      servicesOffered: professional.servicesOffered || [],
      portfolio: professional.portfolio || [],
      contactDetails: professional.contactDetails || {},
      ctaButton: professional.ctaButton || {}
    })
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this professional profile?')) return

    try {
      const response = await fetch(`/api/professionals/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchProfessionals()
      } else {
        console.error('Failed to delete professional')
      }
    } catch (error) {
      console.error('Error deleting professional:', error)
    }
  }

  const resetForm = () => {
    setEditingProfessional(null)
    setFormData({
      name: '',
      professionalHeadline: '',
      aboutMe: '',
      profilePicture: '',
      banner: '',
      location: '',
      phone: '',
      email: '',
      website: '',
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: '',
      workExperience: [],
      education: [],
      skills: [],
      servicesOffered: [],
      portfolio: [],
      contactDetails: {},
      ctaButton: {}
    })
  }

  const handleViewProfile = (slug: string) => {
    router.push(`/pcard/${slug}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Professional Card Admin</h1>
            <p className="text-gray-600 mt-2">Manage professional profiles</p>
          </div>
          <Button onClick={() => setModalOpen(true)} className="bg-cyan-600 hover:bg-cyan-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Professional
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search professionals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Professionals Table */}
        <Card>
          <CardHeader>
            <CardTitle>Professionals ({filteredProfessionals.length})</CardTitle>
            <CardDescription>
              Manage all professional profiles in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Professional</TableHead>
                    <TableHead>Headline</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfessionals.map((professional) => (
                    <TableRow key={professional.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {professional.profilePicture ? (
                            <img
                              src={getOptimizedImageUrl(professional.profilePicture, {
                                width: 40,
                                height: 40,
                                quality: 85,
                                format: 'auto',
                                crop: 'fill',
                                gravity: 'center'
                              })}
                              alt={professional.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-500" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{professional.name}</div>
                            <div className="text-sm text-gray-500">{professional.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {professional.professionalHeadline || 'No headline'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {professional.location ? (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                            {professional.location}
                          </div>
                        ) : (
                          'Not specified'
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={professional.isActive ? "default" : "secondary"}>
                          {professional.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewProfile(professional.slug)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(professional)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(professional.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProfessional ? 'Edit Professional' : 'Add Professional'}
              </DialogTitle>
              <DialogDescription>
                {editingProfessional ? 'Update professional profile information' : 'Create a new professional profile'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="professionalHeadline">Professional Headline</Label>
                  <Input
                    id="professionalHeadline"
                    value={formData.professionalHeadline}
                    onChange={(e) => setFormData(prev => ({ ...prev, professionalHeadline: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="aboutMe">About Me</Label>
                <Textarea
                  id="aboutMe"
                  value={formData.aboutMe}
                  onChange={(e) => setFormData(prev => ({ ...prev, aboutMe: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  />
                </div>
              </div>

              {/* Social Media */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={formData.linkedin}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={formData.facebook}
                    onChange={(e) => setFormData(prev => ({ ...prev, facebook: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    value={formData.twitter}
                    onChange={(e) => setFormData(prev => ({ ...prev, twitter: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={formData.instagram}
                    onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                  />
                </div>
              </div>

              {/* Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="profilePicture">Profile Picture URL</Label>
                  <Input
                    id="profilePicture"
                    value={formData.profilePicture}
                    onChange={(e) => setFormData(prev => ({ ...prev, profilePicture: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="banner">Banner Image URL</Label>
                  <Input
                    id="banner"
                    value={formData.banner}
                    onChange={(e) => setFormData(prev => ({ ...prev, banner: e.target.value }))}
                  />
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  value={formData.skills.join(', ')}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  }))}
                  placeholder="JavaScript, React, Node.js, etc."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setModalOpen(false)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : (editingProfessional ? 'Update' : 'Create')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
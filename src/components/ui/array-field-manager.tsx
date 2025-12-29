'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Edit, X } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import ImageUpload from '@/components/ui/image-upload'

interface ArrayFieldManagerProps<T> {
  title: string
  items: T[]
  onChange: (items: T[]) => void
  renderItem: (item: T, index: number) => React.ReactNode
  createNewItem: () => T
  renderForm: (item: T | null, onSave: (item: T) => void, onCancel: () => void) => React.ReactNode
  itemName: string
}

export function ArrayFieldManager<T>({
  title,
  items,
  onChange,
  renderItem,
  createNewItem,
  renderForm,
  itemName
}: ArrayFieldManagerProps<T>) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<T | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const handleAdd = () => {
    setEditingItem(createNewItem())
    setEditingIndex(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (item: T, index: number) => {
    setEditingItem(item)
    setEditingIndex(index)
    setIsDialogOpen(true)
  }

  const handleDelete = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    onChange(newItems)
  }

  const handleSave = (item: T) => {
    let newItems: T[]
    if (editingIndex !== null) {
      // Edit existing
      newItems = [...items]
      newItems[editingIndex] = item
    } else {
      // Add new
      newItems = [...items, item]
    }
    onChange(newItems)
    setIsDialogOpen(false)
    setEditingItem(null)
    setEditingIndex(null)
  }

  const handleCancel = () => {
    setIsDialogOpen(false)
    setEditingItem(null)
    setEditingIndex(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-base font-semibold">{title}</Label>
        <Button type="button" onClick={handleAdd} size="sm" className="rounded-2xl">
          <Plus className="h-4 w-4 mr-2" />
          Add {itemName}
        </Button>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-2xl">
            No {itemName.toLowerCase()} added yet. Click "Add {itemName}" to get started.
          </div>
        ) : (
          items.map((item, index) => (
            <Card key={index} className="rounded-2xl">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {renderItem(item, index)}
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(item, index)}
                      className="rounded-xl"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(index)}
                      className="rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? `Edit ${itemName}` : `Add ${itemName}`}
            </DialogTitle>
            <DialogDescription>
              {editingIndex !== null ? `Update the ${itemName.toLowerCase()} details below.` : `Fill in the details for the new ${itemName.toLowerCase()}.`}
            </DialogDescription>
          </DialogHeader>
          {renderForm(editingItem, handleSave, handleCancel)}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Specific form components for different data types

export function WorkExperienceForm({ item, onSave, onCancel }: {
  item: any
  onSave: (item: any) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState(item || {
    position: '',
    company: '',
    duration: '',
    description: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Position/Title</Label>
        <Input
          value={formData.position}
          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Company/Organization</Label>
        <Input
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Duration</Label>
        <Input
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
          placeholder="e.g., Jan 2020 - Present"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe your role and achievements..."
          rows={4}
        />
      </div>
      <div className="flex space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          {item ? 'Update' : 'Add'} Experience
        </Button>
      </div>
    </form>
  )
}

export function EducationForm({ item, onSave, onCancel }: {
  item: any
  onSave: (item: any) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState(item || {
    degree: '',
    institution: '',
    year: '',
    description: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Degree/Certificate</Label>
        <Input
          value={formData.degree}
          onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
          placeholder="e.g., Bachelor of Science in Computer Science"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Institution</Label>
        <Input
          value={formData.institution}
          onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
          placeholder="e.g., University Name"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Year</Label>
        <Input
          value={formData.year}
          onChange={(e) => setFormData({ ...formData, year: e.target.value })}
          placeholder="e.g., 2020"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Description (Optional)</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Additional details about your education..."
          rows={3}
        />
      </div>
      <div className="flex space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          {item ? 'Update' : 'Add'} Education
        </Button>
      </div>
    </form>
  )
}

export function SkillForm({ item, onSave, onCancel }: {
  item: {name: string, level: 'beginner' | 'intermediate' | 'expert' | 'master'} | null
  onSave: (item: {name: string, level: 'beginner' | 'intermediate' | 'expert' | 'master'}) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState(item || {
    name: '',
    level: 'intermediate' as const
  })

  const skillSuggestions = [
    'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Python', 'Java', 'C++', 'C#',
    'Project Management', 'Agile', 'Scrum', 'Digital Marketing', 'SEO', 'Content Writing',
    'UI/UX Design', 'Graphic Design', 'Photography', 'Video Editing', 'Data Analysis',
    'Machine Learning', 'DevOps', 'AWS', 'Docker', 'Kubernetes', 'SQL', 'MongoDB',
    'Communication', 'Leadership', 'Problem Solving', 'Team Collaboration'
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name.trim()) {
      onSave(formData)
    }
  }

  const proficiencyLevels = [
    { value: 'beginner', label: 'Beginner', color: 'bg-gray-100 text-gray-800' },
    { value: 'intermediate', label: 'Intermediate', color: 'bg-blue-100 text-blue-800' },
    { value: 'expert', label: 'Expert', color: 'bg-purple-100 text-purple-800' },
    { value: 'master', label: 'Master', color: 'bg-amber-100 text-amber-800' }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Skill Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., JavaScript, Project Management"
          required
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {skillSuggestions.slice(0, 8).map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setFormData({ ...formData, name: suggestion })}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label>Proficiency Level</Label>
        <div className="grid grid-cols-2 gap-3">
          {proficiencyLevels.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => setFormData({ ...formData, level: level.value as any })}
              className={`p-3 rounded-xl border-2 transition-all ${
                formData.level === level.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${level.color}`}>
                {level.label}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {level.value === 'beginner' && 'Basic understanding'}
                {level.value === 'intermediate' && 'Working knowledge'}
                {level.value === 'expert' && 'Advanced skills'}
                {level.value === 'master' && 'Expert level'}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          {item ? 'Update' : 'Add'} Skill
        </Button>
      </div>
    </form>
  )
}

export function ServiceForm({ item, onSave, onCancel }: {
  item: any
  onSave: (item: any) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState(item || {
    name: '',
    description: '',
    price: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Service Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Web Development, Consulting"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the service you offer..."
          rows={3}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Price (Optional)</Label>
        <Input
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          placeholder="e.g., $50/hour, Contact for pricing"
        />
      </div>
      <div className="flex space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          {item ? 'Update' : 'Add'} Service
        </Button>
      </div>
    </form>
  )
}

export function PortfolioItemForm({ item, onSave, onCancel }: {
  item: any
  onSave: (item: any) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState(item || {
    title: '',
    description: '',
    url: '',
    type: 'image'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleImageUpload = (url: string) => {
    setFormData({ ...formData, url })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Portfolio item title"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Description (Optional)</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe this portfolio item..."
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label>Media Type</Label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="image">Image</option>
          <option value="video">Video</option>
        </select>
      </div>
      {formData.type === 'image' ? (
        <div className="space-y-2">
          <Label>Portfolio Image</Label>
          <ImageUpload
            onUpload={handleImageUpload}
            className="max-w-md"
            uploadUrl="/api/professionals/upload"
            uploadType="portfolio"
          />
          {formData.url && (
            <p className="text-sm text-gray-600">Image uploaded successfully</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <Label>Video URL</Label>
          <Input
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder="Video URL (YouTube, Vimeo, etc.)"
            required
          />
        </div>
      )}
      <div className="flex space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          {item ? 'Update' : 'Add'} Portfolio Item
        </Button>
      </div>
    </form>
  )
}
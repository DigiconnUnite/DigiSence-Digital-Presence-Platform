'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Eye, EyeOff, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { generateSecurePassword } from '@/lib/slug-helpers'

interface Category {
  id: string
  name: string
  parentId?: string | null
}

interface AddBusinessPanelProps {
  categories: Category[]
  onSuccess: (credentials: { email: string; password: string; name: string }) => void
  onCancel: () => void
}

export default function AddBusinessPanel({ categories, onSuccess, onCancel }: AddBusinessPanelProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: generateSecurePassword(),
    adminName: '',
    categoryId: '',
    description: '',
    address: '',
    phone: '',
    website: '',
  })

  const set = (field: keyof typeof form) => (
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }))
  )

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Business name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email'
    if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters'
    if (!form.adminName.trim()) errs.adminName = 'Admin name is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const response = await fetch('/api/admin/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          adminName: form.adminName.trim(),
          categoryId: form.categoryId || undefined,
          description: form.description.trim() || undefined,
          address: form.address.trim() || undefined,
          phone: form.phone.trim() || undefined,
          website: form.website.trim() || undefined,
        }),
      })

      if (response.ok) {
        onSuccess({ email: form.email, password: form.password, name: form.name })
      } else {
        const err = await response.json()
        toast({ title: 'Error', description: err.error || 'Failed to create business', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error. Please try again.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const parentCategories = categories.filter(c => !c.parentId)

  return (
    <form id="add-business-form" onSubmit={handleSubmit} className="space-y-5">
      {/* Business Name */}
      <div className="space-y-1.5">
        <Label>Business Name <span className="text-red-500">*</span></Label>
        <Input value={form.name} onChange={set('name')} placeholder="Jakson Enterprises"
          className={errors.name ? 'border-red-400' : ''} />
        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <Label>Category</Label>
        <Select value={form.categoryId} onValueChange={v => setForm(f => ({ ...f, categoryId: v }))}>
          <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
          <SelectContent>
            {parentCategories.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea value={form.description} onChange={set('description')}
          placeholder="Brief description of the business..." rows={3} />
      </div>

      <div className="border-t pt-4">
        <p className="text-sm font-medium text-gray-700 mb-4">Admin Account</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Admin Name */}
          <div className="space-y-1.5">
            <Label>Admin Name <span className="text-red-500">*</span></Label>
            <Input value={form.adminName} onChange={set('adminName')} placeholder="John Doe"
              className={errors.adminName ? 'border-red-400' : ''} />
            {errors.adminName && <p className="text-xs text-red-500">{errors.adminName}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label>Email <span className="text-red-500">*</span></Label>
            <Input type="email" value={form.email} onChange={set('email')}
              placeholder="admin@business.com"
              className={errors.email ? 'border-red-400' : ''} />
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Password <span className="text-red-500">*</span></Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  className={`pr-10 font-mono ${errors.password ? 'border-red-400' : ''}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button type="button" variant="outline" size="icon"
                onClick={() => setForm(f => ({ ...f, password: generateSecurePassword() }))}
                title="Generate new password">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="border-t pt-4">
        <p className="text-sm font-medium text-gray-700 mb-4">Contact Information (Optional)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
          </div>
          <div className="space-y-1.5">
            <Label>Website</Label>
            <Input value={form.website} onChange={set('website')} placeholder="https://example.com" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Address</Label>
            <Input value={form.address} onChange={set('address')} placeholder="Full address" />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 rounded-xl">
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="flex-1 rounded-xl bg-slate-800 text-white hover:bg-slate-700">
          {loading ? (
            <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Creating...</>
          ) : 'Create Business'}
        </Button>
      </div>
    </form>
  )
}

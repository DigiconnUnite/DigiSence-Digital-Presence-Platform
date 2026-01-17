'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Edit, Save, X, ChevronDown, ChevronUp, Search, CheckCircle, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface BusinessInfoCardProps {
  title: string
  fields: Array<{
    id: string
    label: string
    value: string
    type: 'text' | 'textarea' | 'email' | 'url'
    placeholder?: string
    validation?: (value: string) => string | null
  }>
  onSave: (updatedFields: Record<string, string>) => Promise<void>
}

export default function BusinessInfoCard({ title, fields, onSave }: BusinessInfoCardProps) {
  const { toast } = useToast()
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [expanded, setExpanded] = useState(true)
  const [saving, setSaving] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<Record<string, 'saved' | 'saving' | 'error' | null>>({})

  const handleEditClick = (fieldId: string) => {
    setEditingField(fieldId)
    setEditValues(prev => ({ ...prev, [fieldId]: fields.find(f => f.id === fieldId)?.value || '' }))
  }

  const handleCancelClick = (fieldId: string) => {
    setEditingField(null)
    setErrors(prev => ({ ...prev, [fieldId]: '' }))
  }

  const handleSaveClick = async (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId)
    if (!field) return

    // Validate
    if (field.validation) {
      const validationError = field.validation(editValues[fieldId] || '')
      if (validationError) {
        setErrors(prev => ({ ...prev, [fieldId]: validationError }))
        return
      }
    }

    setSaving(true)
    setAutoSaveStatus(prev => ({ ...prev, [fieldId]: 'saving' }))

    try {
      await onSave({ [fieldId]: editValues[fieldId] || '' })
      setEditingField(null)
      setAutoSaveStatus(prev => ({ ...prev, [fieldId]: 'saved' }))
      
      // Clear status after 2 seconds
      setTimeout(() => {
        setAutoSaveStatus(prev => ({ ...prev, [fieldId]: null }))
      }, 2000)
    } catch (error) {
      setAutoSaveStatus(prev => ({ ...prev, [fieldId]: 'error' }))
      toast({
        title: 'Error',
        description: 'Failed to save changes',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (fieldId: string, value: string) => {
    setEditValues(prev => ({ ...prev, [fieldId]: value }))
    
    // Clear error when user types
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }))
    }
  }

  const filteredFields = fields.filter(field => 
    field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (typeof field.value === 'string' && field.value.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <Card className="rounded-3xl shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          <button
            onClick={() => setExpanded(!expanded)}
            className="hover:text-blue-600 transition-colors"
          >
            {title}
          </button>
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search fields..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8 w-40 rounded-full text-sm"
            />
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          {filteredFields.length > 0 ? (
            <div className="space-y-4">
              {filteredFields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      {field.label}
                      {editingField === field.id && (
                        <span className="text-xs text-gray-500">
                          {field.type === 'email' ? '(Email)' : field.type === 'url' ? '(URL)' : ''}
                        </span>
                      )}
                    </Label>
                    {autoSaveStatus[field.id] && (
                      <div className="flex items-center gap-1 text-xs">
                        {autoSaveStatus[field.id] === 'saved' && (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        )}
                        {autoSaveStatus[field.id] === 'saving' && (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                        )}
                        {autoSaveStatus[field.id] === 'error' && (
                          <AlertCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span className={`capitalize ${
                          autoSaveStatus[field.id] === 'saved' ? 'text-green-500' :
                          autoSaveStatus[field.id] === 'error' ? 'text-red-500' : 'text-blue-500'
                        }`}>
                          {autoSaveStatus[field.id]}
                        </span>
                      </div>
                    )}
                  </div>

                  {editingField === field.id ? (
                    <div className="space-y-2">
                      {field.type === 'textarea' ? (
                        <Textarea
                          value={editValues[field.id] || ''}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          placeholder={field.placeholder}
                          rows={3}
                          className={`rounded-2xl ${errors[field.id] ? 'border-red-500' : 'border-gray-300'}`}
                        />
                      ) : (
                        <Input
                          type={field.type}
                          value={editValues[field.id] || ''}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          placeholder={field.placeholder}
                          className={`rounded-2xl ${errors[field.id] ? 'border-red-500' : 'border-gray-300'}`}
                        />
                      )}
                      {errors[field.id] && (
                        <p className="text-xs text-red-500 mt-1">{errors[field.id]}</p>
                      )}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSaveClick(field.id)}
                          disabled={saving}
                          className="rounded-2xl h-8 px-3 text-sm"
                        >
                          {saving ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-3 w-3 mr-1" />
                              Save
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => handleCancelClick(field.id)}
                          variant="outline"
                          className="rounded-2xl h-8 px-3 text-sm"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        {field.type === 'textarea' ? (
                          <div className="min-h-[60px] bg-gray-50 rounded-2xl p-3 text-sm whitespace-pre-wrap">
                            {field.value || <span className="text-gray-400">No content</span>}
                          </div>
                        ) : (
                          <div className="bg-gray-50 rounded-2xl p-3 text-sm">
                            {field.value || <span className="text-gray-400">Not set</span>}
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={() => handleEditClick(field.id)}
                        variant="ghost"
                        size="sm"
                        className="rounded-full h-8 w-8 p-0 ml-2 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4 text-blue-500" />
                        <span className="sr-only">Edit {field.label}</span>
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No fields match your search</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
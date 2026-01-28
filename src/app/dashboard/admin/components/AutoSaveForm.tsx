'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useAutoSaveDraft, formatDraftAge } from '@/lib/hooks/useAutoSaveDraft'
import { FormField } from '@/components/ui/FormField'
import { Loader2, Save, RefreshCw } from 'lucide-react'

interface BusinessFormData {
  name: string
  description: string
  phone: string
  email: string
  website: string
  address: string
  categoryId: string
  adminName: string
  adminEmail: string
  adminPhone: string
}

interface AutoSaveFormProps {
  initialData?: Partial<BusinessFormData>
  onSubmit: (data: BusinessFormData) => Promise<void>
  formId: string
  isEditing?: boolean
}

export default function AutoSaveForm({ 
  initialData, 
  onSubmit, 
  formId,
  isEditing = false 
}: AutoSaveFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<BusinessFormData>({
    defaultValues: initialData || {},
  })

  // Auto-save functionality
  const {
    autoSaveState,
    saveDraft,
    clearDraft,
  } = useAutoSaveDraft({
    storageKey: 'business-form',
    formId,
    onDraftSaved: (timestamp) => {
      console.log('Draft saved:', timestamp)
    },
    onDraftLoaded: (data) => {
      if (data && !isEditing) {
        reset(data)
      }
    },
  })

  // Watch form changes for auto-save
  const formData = watch()

  useEffect(() => {
    if (isDirty) {
      saveDraft(formData)
    }
  }, [formData, isDirty, saveDraft])

  // Reset form from draft if needed
  const handleReset = useCallback(() => {
    clearDraft()
    reset(initialData || {})
    setShowResetConfirm(false)
  }, [clearDraft, reset, initialData])

  const handleFormSubmit = async (data: BusinessFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      clearDraft() // Clear draft after successful submit
    } finally {
      setIsSubmitting(false)
    }
  }

  // Draft status display
  const getStatusText = () => {
    if (autoSaveState.isSaving) return 'Saving...'
    if (autoSaveState.lastSaved) {
      const age = autoSaveState.draftAge ? formatDraftAge(autoSaveState.draftAge) : 'Just now'
      return `Last saved ${age}`
    }
    return 'Not saved yet'
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Business' : 'Add New Business'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            All changes are automatically saved as drafts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm ${autoSaveState.isSaving ? 'text-amber-600' : 'text-gray-500'}`}>
            {getStatusText()}
          </span>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            title="Reset form"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(handleFormSubmit)} className="p-4 space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Business Name"
              name="name"
              type="text"
              register={register}
              errors={errors}
              placeholder="Enter business name"
              required
            />

            <FormField
              label="Category"
              name="categoryId"
              type="select"
              register={register}
              errors={errors}
              required
            >
              <option value="">Select category</option>
              <option value="cat1">Technology</option>
              <option value="cat2">Healthcare</option>
              <option value="cat3">Education</option>
            </FormField>
          </div>

          <div className="mt-4">
            <FormField
              label="Description"
              name="description"
              type="textarea"
              register={register}
              errors={errors}
              placeholder="Enter business description"
              rows={4}
            />
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Phone"
              name="phone"
              type="tel"
              register={register}
              errors={errors}
              placeholder="+91 98765 43210"
            />

            <FormField
              label="Website"
              name="website"
              type="url"
              register={register}
              errors={errors}
              placeholder="https://example.com"
            />

            <div className="md:col-span-2">
              <FormField
                label="Address"
                name="address"
                type="textarea"
                register={register}
                errors={errors}
                placeholder="Enter full address"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Admin Account */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Admin Account</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Admin Name"
              name="adminName"
              type="text"
              register={register}
              errors={errors}
              placeholder="Enter admin name"
              required
            />

            <FormField
              label="Admin Email"
              name="adminEmail"
              type="email"
              register={register}
              errors={errors}
              placeholder="admin@example.com"
              required
            />

            <FormField
              label="Admin Phone"
              name="adminPhone"
              type="tel"
              register={register}
              errors={errors}
              placeholder="+91 98765 43210"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t flex items-center justify-end gap-3">
          {isDirty && (
            <span className="text-sm text-amber-600 flex items-center gap-1">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              Unsaved changes
            </span>
          )}
          
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditing ? 'Update Business' : 'Create Business'}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reset Form?</h3>
            <p className="text-sm text-gray-600 mb-4">
              This will discard all unsaved changes and restore the original form. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                Reset Form
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

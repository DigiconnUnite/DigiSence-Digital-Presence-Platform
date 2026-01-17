"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Plus, X, Save } from 'lucide-react'
import ImageUpload from '@/components/ui/image-upload'

interface Slide {
  mediaType: 'image' | 'video'
  media: string
  headline: string
  headlineSize: string
  headlineColor: string
  headlineAlignment: 'left' | 'center' | 'right'
  subtext: string
  subtextSize: string
  subtextColor: string
  subtextAlignment: 'left' | 'center' | 'right'
  cta: string
  ctaLink: string
  showText?: boolean
}

interface BannerEditorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingSlide: Slide | null
  onSave: (slide: Slide) => void
  onCancel: () => void
}

const headlineSizeOptions = [
  { value: 'text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl', label: 'Small' },
  { value: 'text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl', label: 'Medium' },
  { value: 'text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl', label: 'Large' },
  { value: 'text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl', label: 'Extra Large' },
  { value: 'text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl', label: 'Huge' }
]

const subtextSizeOptions = [
  { value: 'text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl', label: 'Small' },
  { value: 'text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl', label: 'Medium' },
  { value: 'text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl', label: 'Large' },
  { value: 'text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl', label: 'Extra Large' },
  { value: 'text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl', label: 'Huge' }
]

const alignmentOptions = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' }
]

export default function BannerEditorModal({
  open,
  onOpenChange,
  editingSlide,
  onSave,
  onCancel
}: BannerEditorModalProps) {
  const [slideData, setSlideData] = useState<Slide>({
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
    ctaLink: '',
    showText: true
  })

  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'settings'>('content')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (open && editingSlide) {
      setSlideData(editingSlide)
    } else if (open) {
      setSlideData({
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
        ctaLink: '',
        showText: true
      })
    }
  }, [open, editingSlide])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      onSave(slideData)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save banner:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    onCancel()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95%] h-[90vh] border overflow-hidden bg-white p-0 top-4 bottom-4 left-1/2 translate-x-[-50%] translate-y-0">
        <div className="flex flex-col h-[90vh] relative">
          {/* Fixed Header */}
          <DialogHeader className="px-6 pt-4 pb-2 border-b shrink-0 space-y-1.5 bg-white z-10">
            <div className="flex justify-between items-start w-full">
              <div>
                <DialogTitle className="text-md font-semibold leading-none tracking-tight">
                  {editingSlide ? 'Edit Banner' : 'Add New Banner'}
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500 font-normal">
                  {editingSlide ? 'Update banner details' : 'Create a new hero banner'}
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Tabs */}
          <div className="border-b bg-white">
            <div className="flex space-x-8 px-6 overflow-x-auto">
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

          {/* Scrollable Body */}
          <div className="flex-1 px-6 py-4 min-h-0">
            <div className="h-full px-2 overflow-y-auto hide-scrollbar">
              <div className="space-y-4">
                {activeTab === 'content' && (
                  <div className="space-y-6">
                    {/* Background Media */}
                    <div>
                      <Label className="text-sm font-medium">Background Media</Label>
                      <div className="mt-2 space-y-3">
                        <Select
                          value={slideData.mediaType}
                          onValueChange={(value) => setSlideData(prev => ({ ...prev, mediaType: value as 'image' | 'video' }))}
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
                          value={slideData.media}
                          onChange={(e) => setSlideData(prev => ({ ...prev, media: e.target.value }))}
                          className="bg-white rounded-2xl"
                        />
                        <ImageUpload
                          allowVideo={true}
                          aspectRatio={16/9}
                          onUpload={(url) => setSlideData(prev => ({ ...prev, media: url }))}
                        />
                      </div>
                    </div>

                    {/* Headline */}
                    <div>
                      <Label className="text-sm font-medium">Headline</Label>
                      <Input
                        placeholder="Enter headline"
                        value={slideData.headline}
                        onChange={(e) => setSlideData(prev => ({ ...prev, headline: e.target.value }))}
                        className="mt-2 bg-white rounded-2xl"
                      />
                    </div>

                    {/* Subtext */}
                    <div>
                      <Label className="text-sm font-medium">Subtext</Label>
                      <Textarea
                        placeholder="Enter subtext"
                        rows={3}
                        value={slideData.subtext}
                        onChange={(e) => setSlideData(prev => ({ ...prev, subtext: e.target.value }))}
                        className="mt-2 bg-white rounded-2xl"
                      />
                    </div>

                    {/* CTA */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">CTA Text</Label>
                        <Input
                          placeholder="Call to action text"
                          value={slideData.cta}
                          onChange={(e) => setSlideData(prev => ({ ...prev, cta: e.target.value }))}
                          className="mt-2 bg-white rounded-2xl"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">CTA Link</Label>
                        <Input
                          placeholder="https://..."
                          value={slideData.ctaLink}
                          onChange={(e) => setSlideData(prev => ({ ...prev, ctaLink: e.target.value }))}
                          className="mt-2 bg-white rounded-2xl"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'style' && (
                  <div className="space-y-6">
                    {/* Headline Style */}
                    <div>
                      <h3 className="text-sm font-medium mb-4">Headline Style</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm">Size</Label>
                          <Select
                            value={slideData.headlineSize}
                            onValueChange={(value) => setSlideData(prev => ({ ...prev, headlineSize: value }))}
                          >
                            <SelectTrigger className="mt-2 rounded-2xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {headlineSizeOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm">Color</Label>
                          <div className="flex items-center gap-2 mt-2">
                            <Input
                              type="color"
                              value={slideData.headlineColor}
                              onChange={(e) => setSlideData(prev => ({ ...prev, headlineColor: e.target.value }))}
                              className="w-12 h-10 p-1 rounded-2xl"
                            />
                            <Input
                              value={slideData.headlineColor}
                              onChange={(e) => setSlideData(prev => ({ ...prev, headlineColor: e.target.value }))}
                              placeholder="#ffffff"
                              className="rounded-2xl"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm">Alignment</Label>
                          <Select
                            value={slideData.headlineAlignment}
                            onValueChange={(value) => setSlideData(prev => ({ ...prev, headlineAlignment: value as 'left' | 'center' | 'right' }))}
                          >
                            <SelectTrigger className="mt-2 rounded-2xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {alignmentOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
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
                            value={slideData.subtextSize}
                            onValueChange={(value) => setSlideData(prev => ({ ...prev, subtextSize: value }))}
                          >
                            <SelectTrigger className="mt-2 rounded-2xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {subtextSizeOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm">Color</Label>
                          <div className="flex items-center gap-2 mt-2">
                            <Input
                              type="color"
                              value={slideData.subtextColor}
                              onChange={(e) => setSlideData(prev => ({ ...prev, subtextColor: e.target.value }))}
                              className="w-12 h-10 p-1 rounded-2xl"
                            />
                            <Input
                              value={slideData.subtextColor}
                              onChange={(e) => setSlideData(prev => ({ ...prev, subtextColor: e.target.value }))}
                              placeholder="#ffffff"
                              className="rounded-2xl"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm">Alignment</Label>
                          <Select
                            value={slideData.subtextAlignment}
                            onValueChange={(value) => setSlideData(prev => ({ ...prev, subtextAlignment: value as 'left' | 'center' | 'right' }))}
                          >
                            <SelectTrigger className="mt-2 rounded-2xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {alignmentOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-medium">Slider Settings</h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="showText" className="text-sm">Show Text Overlay</Label>
                        <Switch
                          id="showText"
                          checked={slideData.showText !== false}
                          onCheckedChange={(checked) => setSlideData(prev => ({ ...prev, showText: checked }))}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Fixed Footer */}
          <DialogFooter className="px-6 py-3 flex flex-row justify-end border-t bg-white z-10 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-xl"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

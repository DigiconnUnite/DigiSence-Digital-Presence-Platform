"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Plus, X, Save } from 'lucide-react'
import ImageUpload from '@/components/ui/image-upload'

interface Slide {
  mediaType: 'image' | 'video'
  media: string
  videoUrl: string
}

interface BannerEditorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingSlide: Slide | null
  onSave: (slide: Slide) => void
  onCancel: () => void
  // Slider settings props
  autoPlay?: boolean
  interval?: number
  showDots?: boolean
  showArrows?: boolean
  onSliderSettingsChange?: (settings: { autoPlay: boolean; interval: number; showDots: boolean; showArrows: boolean }) => void
}

export default function BannerEditorModal({
  open,
  onOpenChange,
  editingSlide,
  onSave,
  onCancel,
  autoPlay = true,
  interval = 5000,
  showDots = true,
  showArrows = true,
  onSliderSettingsChange
}: BannerEditorModalProps) {
  const [slideData, setSlideData] = useState<Slide>({
    mediaType: 'image',
    media: '',
    videoUrl: ''
  })

  const [sliderSettings, setSliderSettings] = useState({
    autoPlay,
    interval,
    showDots,
    showArrows
  })

  const [activeTab, setActiveTab] = useState<'content' | 'sliderSettings'>('content')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (open && editingSlide) {
      setSlideData(editingSlide)
    } else if (open) {
      setSlideData({
        mediaType: 'image',
        media: '',
        videoUrl: ''
      })
    }
  }, [open, editingSlide])

  useEffect(() => {
    setSliderSettings({
      autoPlay,
      interval,
      showDots,
      showArrows
    })
  }, [autoPlay, interval, showDots, showArrows])

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

  const handleSliderSettingChange = (key: string, value: boolean | number) => {
    const newSettings = { ...sliderSettings, [key]: value }
    setSliderSettings(newSettings)
    if (onSliderSettingsChange) {
      onSliderSettingsChange(newSettings)
    }
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
                className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'sliderSettings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                onClick={() => setActiveTab('sliderSettings')}
              >
                Slider Settings
              </button>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 px-6 py-4 min-h-0">
            <div className="h-full px-2 overflow-y-auto hide-scrollbar">
              <div className="space-y-4">
                {activeTab === 'content' && (
                  <div className="space-y-6">
                    {/* Media Type */}
                    <div>
                      <Label className="text-sm font-medium">Media Type</Label>
                      <Select
                        value={slideData.mediaType}
                        onValueChange={(value) => setSlideData(prev => ({ ...prev, mediaType: value as 'image' | 'video' }))}
                      >
                        <SelectTrigger className="mt-2 rounded-2xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="image">Image</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Media Upload */}
                    <div>
                      <Label className="text-sm font-medium">
                        {slideData.mediaType === 'video' ? 'Video Thumbnail (Image)' : 'Background Image'}
                      </Label>
                      <div className="mt-2 space-y-3">
                        <Input
                          placeholder="Media URL"
                          value={slideData.media}
                          onChange={(e) => setSlideData(prev => ({ ...prev, media: e.target.value }))}
                          className="bg-white rounded-2xl"
                        />
                        <ImageUpload
                          allowVideo={false}
                          aspectRatio={16/9}
                          onUpload={(url) => setSlideData(prev => ({ ...prev, media: url }))}
                        />
                      </div>
                    </div>

                    {/* Video URL */}
                    {slideData.mediaType === 'video' && (
                      <div>
                        <Label className="text-sm font-medium">Video URL</Label>
                        <Input
                          placeholder="https://example.com/video.mp4"
                          value={slideData.videoUrl}
                          onChange={(e) => setSlideData(prev => ({ ...prev, videoUrl: e.target.value }))}
                          className="mt-2 bg-white rounded-2xl"
                        />
                        <p className="text-xs text-gray-500 mt-1">Enter the direct URL to your video file</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'sliderSettings' && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-medium">Slider Settings</h3>

                    {/* Auto-play */}
                    <div className="flex items-center justify-between">
                      <Label htmlFor="autoPlay" className="text-sm">Auto-play</Label>
                      <Switch
                        id="autoPlay"
                        checked={sliderSettings.autoPlay}
                        onCheckedChange={(checked) => handleSliderSettingChange('autoPlay', checked)}
                      />
                    </div>

                    {/* Interval */}
                    <div>
                      <Label htmlFor="interval" className="text-sm">Interval (ms)</Label>
                      <Input
                        id="interval"
                        type="number"
                        min={1000}
                        max={10000}
                        step={100}
                        value={sliderSettings.interval}
                        onChange={(e) => handleSliderSettingChange('interval', parseInt(e.target.value) || 5000)}
                        className="mt-2 bg-white rounded-2xl"
                      />
                      <p className="text-xs text-gray-500 mt-1">Time between slides in milliseconds (1000-10000)</p>
                    </div>

                    {/* Show Dots */}
                    <div className="flex items-center justify-between">
                      <Label htmlFor="showDots" className="text-sm">Show Navigation Dots</Label>
                      <Switch
                        id="showDots"
                        checked={sliderSettings.showDots}
                        onCheckedChange={(checked) => handleSliderSettingChange('showDots', checked)}
                      />
                    </div>

                    {/* Show Arrows */}
                    <div className="flex items-center justify-between">
                      <Label htmlFor="showArrows" className="text-sm">Show Navigation Arrows</Label>
                      <Switch
                        id="showArrows"
                        checked={sliderSettings.showArrows}
                        onCheckedChange={(checked) => handleSliderSettingChange('showArrows', checked)}
                      />
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

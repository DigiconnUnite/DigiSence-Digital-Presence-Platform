import { useState, useCallback } from 'react'
import { v2 as cloudinary } from 'cloudinary'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Upload, 
  X, 
  Image as ImageIcon,
  Loader2
} from 'lucide-react'

interface ImageUploadProps {
  onUpload: (url: string) => void
  maxFiles?: number
  accept?: string
  className?: string
}

export default function ImageUpload({ 
  onUpload, 
  maxFiles = 1,
  accept = 'image/*',
  className = ''
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)

  const handleFileUpload = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files).slice(0, maxFiles)
    
    if (fileArray.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    try {
      // Configure Cloudinary
      const result = await cloudinary.uploader.upload(fileArray[0], {
        resource_type: 'auto',
        folder: 'bdpp-uploads',
      })

      if (result.secure_url) {
        onUpload(result.secure_url)
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [onUpload, maxFiles])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    handleFileUpload(files)
  }, [handleFileUpload, maxFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent) => {
    const files = e.target.files
    handleFileUpload(files)
  }, [handleFileUpload, maxFiles])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Upload Images
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-colors ${
            dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {uploading ? (
            <div className="space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto" />
              <p className="text-sm text-gray-600">Uploading image...</p>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="w-12 h-12 mx-auto text-gray-400" />
              <p className="text-sm text-gray-600 mb-4">
                Drag and drop an image here, or click to select
              </p>
              <div className="flex items-center justify-center">
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <div className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                    Select Image
                  </div>
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept={accept}
                  multiple={maxFiles > 1}
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
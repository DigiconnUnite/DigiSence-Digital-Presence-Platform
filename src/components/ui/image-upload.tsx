import { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  FileVideo,
  File
} from 'lucide-react'

interface ImageUploadProps {
  onUpload: (url: string) => void
  onError?: (error: string) => void
  maxFiles?: number
  accept?: string
  className?: string
  allowVideo?: boolean
}

export default function ImageUpload({
  onUpload,
  onError,
  maxFiles = 1,
  accept = 'image/*',
  className = '',
  allowVideo = false
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string>('')
  const [mediaUrl, setMediaUrl] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isPdf = accept.includes('pdf') || accept.includes('application/pdf')
  const mediaAccept = allowVideo ? 'image/*,video/*' : isPdf ? accept : accept
  const mediaTypeText = allowVideo ? 'images and videos' : isPdf ? 'images or PDFs' : 'images'

  const handleFileUpload = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files).slice(0, maxFiles)

    if (fileArray.length === 0) return

    const file = fileArray[0]

    // Validate file size (50MB for videos, 10MB for images/PDFs)
    const maxSize = allowVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      const sizeText = allowVideo ? '50MB' : '10MB'
      const errorMsg = `File size must be less than ${sizeText}`
      if (onError) {
        onError(errorMsg)
      } else {
        alert(errorMsg)
      }
      return
    }

    // Validate file type
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff', 'image/svg+xml']
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg']
    const allowedPdfTypes = ['application/pdf']
    let allowedTypes = allowVideo ? [...allowedImageTypes, ...allowedVideoTypes] : allowedImageTypes

    // If accept includes PDF, allow PDF types
    if (accept.includes('pdf') || accept.includes('application/pdf')) {
      allowedTypes = [...allowedTypes, ...allowedPdfTypes]
    }

    if (!allowedTypes.includes(file.type)) {
      const typeText = allowVideo ? 'images (JPEG, JPG, PNG, GIF, WebP, BMP, TIFF, SVG), videos (MP4, WebM, OGG), or PDFs' : accept.includes('pdf') ? 'images (JPEG, JPG, PNG, GIF, WebP, BMP, TIFF, SVG) or PDFs' : 'images (JPEG, JPG, PNG, GIF, WebP, BMP, TIFF, SVG)'
      const errorMsg = `Invalid file type. Please select ${typeText}.`
      if (onError) {
        onError(errorMsg)
      } else {
        alert(errorMsg)
      }
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setUploadStatus('Preparing upload...')

    try {
      setUploadProgress(25)
      setUploadStatus('Uploading to server...')

      const formData = new FormData()
      formData.append('file', file)

      // Use business-specific upload API if available, fallback to general upload
      const uploadUrl = '/api/business/upload'
      let response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      })

      // If business upload fails, try general upload
      if (!response.ok) {
        response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
      }

      setUploadProgress(75)
      setUploadStatus('Processing...')

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()
      setUploadProgress(100)
      setUploadStatus('Upload complete!')
      const url = data.url || data.secure_url
      setMediaUrl(url)
      onUpload(url)

      // Clear status after a moment
      setTimeout(() => {
        setUploadStatus('')
      }, 2000)
    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload media. Please try again.'
      setUploadStatus('Upload failed')
      if (onError) {
        onError(errorMessage)
      } else {
        alert(errorMessage)
      }
    } finally {
      setUploading(false)
      setUploadProgress(0)
      // Keep error status visible for a moment
      if (uploadStatus === 'Upload failed') {
        setTimeout(() => setUploadStatus(''), 3000)
      }
    }
  }, [onUpload, maxFiles, allowVideo])

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

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      handleFileUpload(files)
    }
  }, [handleFileUpload, maxFiles])

  // New function to handle opening the file dialog
  const openFileDialog = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  }, []);

  // Function to clear the uploaded media
  const clearMedia = useCallback(() => {
    setMediaUrl('');
    // Optional: Call a callback to notify parent component
    // onClear();
  }, []);

  // Determine if the uploaded media is a video
  const isVideo = mediaUrl && (mediaUrl.includes('.mp4') || mediaUrl.includes('.webm') || mediaUrl.includes('.ogg'));
  // Determine if the uploaded media is a PDF
  const isPdfFile = mediaUrl && mediaUrl.includes('.pdf');

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Upload {allowVideo ? 'Media' : isPdf ? 'Files' : 'Images'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left side: Upload controls */}
          <div className="flex-1">
            <div
              className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-colors cursor-pointer ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={openFileDialog}
            >
              {uploading ? (
                <div className="space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                  <p className="text-sm text-gray-600">{uploadStatus || 'Uploading...'}</p>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-12 h-12 mx-auto text-gray-400" />
                  <p className="text-sm text-gray-600 mb-4">
                    Drag and drop {mediaTypeText} here, or click to select
                  </p>
                  <div className="flex items-center justify-center">
                      <Button
                        onClick={openFileDialog}
                        variant="secondary"
                      >
                      Select {allowVideo ? 'Media' : isPdf ? 'File' : 'Image'}
                    </Button>
                    <Input
                      ref={fileInputRef}
                      id="file-upload"
                      type="file"
                      accept={mediaAccept}
                      multiple={maxFiles > 1}
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side: Preview */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-gray-200">
              {mediaUrl ? (
                <div className="relative w-full h-full">
                  {isVideo ? (
                    <video
                      src={mediaUrl}
                      className="w-full h-full object-cover"
                      controls={false}
                    />
                  ) : isPdfFile ? (
                    <div className="flex items-center justify-center h-full">
                      <File className="w-12 h-12 text-gray-400" />
                    </div>
                  ) : (
                    <img
                      src={mediaUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-0 right-0 rounded-full p-1 h-6 w-6"
                    onClick={clearMedia}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  {allowVideo ? (
                    <FileVideo className="w-10 h-10" />
                  ) : isPdf ? (
                    <File className="w-10 h-10" />
                  ) : (
                    <ImageIcon className="w-10 h-10" />
                  )}
                  <span className="text-xs mt-2">No media</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
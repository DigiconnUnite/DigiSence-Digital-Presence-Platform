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
  uploadUrl?: string
  uploadType?: string
}

export default function ImageUpload({
  onUpload,
  onError,
  maxFiles = 1,
  accept = 'image/*',
  className = '',
  allowVideo = false,
  uploadUrl,
  uploadType
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

      // Add upload type if provided
      if (uploadType) {
        formData.append('type', uploadType)
      }

      // Use custom upload URL if provided, otherwise fallback to business/general upload
      let uploadUrlToUse = uploadUrl || '/api/business/upload'
      let response = await fetch(uploadUrlToUse, {
        method: 'POST',
        body: formData,
      })

      // If custom upload URL fails or not provided, try business upload
      if (!response.ok && !uploadUrl) {
        response = await fetch('/api/business/upload', {
          method: 'POST',
          body: formData,
        })
      }

      // If business upload fails, try general upload
      if (!response.ok && !uploadUrl) {
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
  }, [onUpload, maxFiles, allowVideo, uploadUrl, uploadType])

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
            <div className="flex gap-4 items-center">
              {/* Upload logo/avatar/preview */}
              <div
                className={`w-20 h-20 flex items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-100 transition-colors ${dragActive ? 'border-blue-400 bg-blue-50' : ''
                  } cursor-pointer`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={openFileDialog}
                role="button"
                tabIndex={0}
              >
                {uploading ? (
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                ) : mediaUrl ? (
                  isVideo ? (
                    <video src={mediaUrl} className="w-full h-full object-cover rounded-full" controls={false} />
                  ) : isPdfFile ? (
                    <File className="w-8 h-8 text-gray-400" />
                  ) : (
                    <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover rounded-full" />
                  )
                ) : (
                  allowVideo ? (
                    <FileVideo className="w-8 h-8 text-gray-400" />
                  ) : isPdf ? (
                    <File className="w-8 h-8 text-gray-400" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  )
                )}
                {mediaUrl && (
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute top-0 right-0 rounded-full p-1 h-6 w-6 translate-x-2 -translate-y-2"
                    onClick={e => {
                      e.stopPropagation();
                      clearMedia();
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              {/* Upload Button + Label */}
              <div>
                <div className="mb-2 flex items-center justify-between min-w-[230px]">
                  <span className="text-xs text-gray-600">
                    {uploading
                      ? uploadStatus || 'Uploading...'
                      : (
                        <>
                          Drag {mediaTypeText} here
                        </>
                      )
                    }
                  </span>
                  {!uploading && (
                    <Button
                      type="button"
                      onClick={openFileDialog}
                      variant="secondary"
                      size="sm"
                      className="align-middle ml-3"
                      disabled={uploading}
                    >
                      Select {allowVideo ? 'Media' : isPdf ? 'File' : 'Image'}
                    </Button>
                  )}
                </div>
                {uploading && <Progress value={uploadProgress} className="w-40" />}
                <Input
                  ref={fileInputRef}
                  id="file-upload"
                  type="file"
                  accept={mediaAccept}
                  multiple={maxFiles > 1}
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploading}
                />
                {!uploading && (
                  <p className="text-[11px] text-gray-400 mt-1">
                    Supported: {mediaTypeText}
                  </p>
                )}
              </div>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  )
}
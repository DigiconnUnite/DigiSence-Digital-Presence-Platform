import { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import ReactImageCrop, { Crop, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

import {
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  FileVideo,
  File,
  Ratio
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
  aspectRatio?: number
}

export default function ImageUpload({
  onUpload,
  onError,
  maxFiles = 1,
  accept = 'image/*',
  className = '',
  allowVideo = false,
  uploadUrl,
  uploadType,
  aspectRatio = 16/9
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string>('')
  const [mediaUrl, setMediaUrl] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  // Ref for the image element inside the cropper to access natural dimensions
  const imgRef = useRef<HTMLImageElement>(null)
  
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  // Initialize crop state
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    x: 25,
    y: 25,
    width: 50,
    height: 50,
  })
  
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null)
  const [selectedAspect, setSelectedAspect] = useState<number>(aspectRatio)

  const isPdf = accept.includes('pdf') || accept.includes('application/pdf')
  const mediaAccept = allowVideo ? 'image/*,video/*' : isPdf ? accept : accept
  const mediaTypeText = allowVideo ? 'images and videos' : isPdf ? 'images or PDFs' : 'images'

  const handleFileUpload = useCallback(async (files: File[]) => {
    const fileArray = files.slice(0, maxFiles)

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
  }, [onUpload, maxFiles, allowVideo, uploadUrl, uploadType, uploadStatus, accept])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)

    const files = e.dataTransfer.files
    handleFileUpload(Array.from(files))
  }, [handleFileUpload])

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
      const fileArray = Array.from(files)
      if (fileArray.length > 0 && fileArray[0].type.startsWith('image/')) {
        setSelectedFile(fileArray[0])
        setCropModalOpen(true)
      } else {
        handleFileUpload(fileArray)
      }
    }
  }, [handleFileUpload])

  const openFileDialog = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  }, []);

  const clearMedia = useCallback(() => {
    setMediaUrl('');
  }, []);

  // FIXED CROP FUNCTION
  const cropImage = useCallback(async (): Promise<Blob> => {
    const image = imgRef.current
    if (!image || !croppedAreaPixels) {
      throw new Error('Crop canvas does not exist')
    }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('No 2d context')
    }

    // Get the actual natural size of the image
    const naturalWidth = image.naturalWidth
    const naturalHeight = image.naturalHeight

    // Calculate the scaling factor between the displayed image and the natural image
    const scaleX = naturalWidth / image.width
    const scaleY = naturalHeight / image.height

    // Log the natural dimensions and cropped area for debugging
    console.log('Natural image dimensions:', { width: naturalWidth, height: naturalHeight })
    console.log('Cropped area pixels:', croppedAreaPixels)
    console.log('Image display dimensions:', { width: image.width, height: image.height })
    console.log('Scaling factors:', { scaleX, scaleY })

    // Scale the cropped area coordinates to match the natural image dimensions
    const scaledCropX = croppedAreaPixels.x * scaleX
    const scaledCropY = croppedAreaPixels.y * scaleY
    const scaledCropWidth = croppedAreaPixels.width * scaleX
    const scaledCropHeight = croppedAreaPixels.height * scaleY

    console.log('Scaled cropped area:', { x: scaledCropX, y: scaledCropY, width: scaledCropWidth, height: scaledCropHeight })

    // Set canvas size to the size of the cropped area in natural pixels
    canvas.width = scaledCropWidth
    canvas.height = scaledCropHeight

    // Draw the image using the scaled coordinates
    ctx.drawImage(
      image,
      scaledCropX,
      scaledCropY,
      scaledCropWidth,
      scaledCropHeight,
      0,
      0,
      scaledCropWidth,
      scaledCropHeight
    )

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Canvas blob failed')
        }
        resolve(blob)
      }, selectedFile?.type || 'image/jpeg')
    })
  }, [croppedAreaPixels, selectedFile])

  const handleConfirmCrop = useCallback(async () => {
    if (!selectedFile) return;
    
    try {
        const croppedBlob = await cropImage();
        if (!croppedBlob) return;
        
        // Cleanup object URL to free memory
        if (imgRef.current?.src) {
            URL.revokeObjectURL(imgRef.current.src);
        }

        const croppedFile = new window.File([croppedBlob], selectedFile.name, { type: selectedFile.type });
        
        setCropModalOpen(false);
        setSelectedFile(null);
        setCroppedAreaPixels(null);
        
        await handleFileUpload([croppedFile]);
    } catch (error) {
        console.error("Error cropping image:", error);
        alert("Failed to crop image.");
    }
  }, [selectedFile, cropImage, handleFileUpload]);

  // Determine if the uploaded media is a video
  const isVideo = mediaUrl && (mediaUrl.includes('.mp4') || mediaUrl.includes('.webm') || mediaUrl.includes('.ogg'));
  // Determine if the uploaded media is a PDF
  const isPdfFile = mediaUrl && mediaUrl.includes('.pdf');

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Upload {allowVideo ? "Media" : isPdf ? "Files" : "Images"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left side: Upload controls */}
            <div className="flex-1">
              <div className="flex gap-4 items-center">
                {/* Upload logo/avatar/preview */}
                <div
                  className={`w-20 h-20 flex items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-100 transition-colors ${dragActive ? "border-blue-400 bg-blue-50" : ""
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
                        <video
                          src={mediaUrl}
                          className="w-full h-full object-cover rounded-full"
                          controls={false}
                        />
                      ) : isPdfFile ? (
                        <File className="w-8 h-8 text-gray-400" />
                      ) : (
                        <img
                          src={mediaUrl}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-full"
                        />
                      )
                    ) : allowVideo ? (
                    <FileVideo className="w-8 h-8 text-gray-400" />
                  ) : isPdf ? (
                    <File className="w-8 h-8 text-gray-400" />
                  ) : (
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                  )}
                  {mediaUrl && (
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute top-0 right-0 rounded-full p-1 h-6 w-6 translate-x-2 -translate-y-2"
                      onClick={(e) => {
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
                      {uploading ? (
                        uploadStatus || "Uploading..."
                      ) : (
                        <>Drag {mediaTypeText} here</>
                      )}
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
                        Select {allowVideo ? "Media" : isPdf ? "File" : "Image"}
                      </Button>
                    )}
                  </div>
                  {uploading && (
                    <Progress value={uploadProgress} className="w-40" />
                  )}
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
      <Dialog open={cropModalOpen} onOpenChange={setCropModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Crop Image</DialogTitle>
          </DialogHeader>
          {selectedFile && (
            <div className="flex flex-col h-[calc(100vh-200px)] max-h-[70vh] w-full">
              <div className="flex flex-col gap-4 flex-1 overflow-hidden">
                <div className="flex gap-1 mb-4 flex-wrap">
                  <Button
                    variant={selectedAspect === 16/9 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedAspect(16/9)}
                  >
                    <Ratio className="w-3 h-3 mr-1" />
                    16:9
                  </Button>
                  <Button
                    variant={selectedAspect === 4/3 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedAspect(4/3)}
                  >
                    <Ratio className="w-3 h-3 mr-1" />
                    4:3
                  </Button>
                  <Button
                    variant={selectedAspect === 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedAspect(1)}
                  >
                    <Ratio className="w-3 h-3 mr-1" />
                    1:1
                  </Button>
                  <Button
                    variant={selectedAspect === 3/1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedAspect(3/1)}
                  >
                    <Ratio className="w-3 h-3 mr-1" />
                    3:1
                  </Button>
                  <Button
                    variant={selectedAspect === 4/1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedAspect(4/1)}
                  >
                    <Ratio className="w-3 h-3 mr-1" />
                    4:1
                  </Button>
                  <Button
                    variant={selectedAspect === aspectRatio ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedAspect(aspectRatio)}
                  >
                    <Ratio className="w-3 h-3 mr-1" />
                    Default
                  </Button>
                </div>
                <div className="flex-1 overflow-hidden relative">
                  <ReactImageCrop
                    crop={crop}
                    onChange={(_pixelCrop, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCroppedAreaPixels(c)}
                    aspect={selectedAspect}
                    className="absolute inset-0"
                  >
                    <img
                      ref={imgRef}
                      src={URL.createObjectURL(selectedFile)}
                      alt="Crop me"
                      className="max-h-full max-w-full block"
                    />
                  </ReactImageCrop>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setCropModalOpen(false);
                setSelectedFile(null);
                setCroppedAreaPixels(null);
                if (imgRef.current?.src) URL.revokeObjectURL(imgRef.current.src);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmCrop} disabled={!croppedAreaPixels}>
              Confirm Crop
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
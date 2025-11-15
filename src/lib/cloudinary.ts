import { v2 as cloudinary } from 'cloudinary'

// Cloudinary configuration
const cloudinaryConfig = {
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || 'demo',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'demo',
}

// Create Cloudinary instance
export const cloudinaryUploader = cloudinary.uploader

// Utility functions for image optimization
export const getOptimizedImageUrl = (url: string, options?: {
  width?: number
  height?: number
  quality?: number
  format?: string
}) => {
  if (!url) return url

  const params = new URLSearchParams()
  
  if (options?.width) params.append('w', options.width.toString())
  if (options?.height) params.append('h', options.height.toString())
  if (options?.quality) params.append('q', options.quality.toString())
  if (options?.format) params.append('f', options.format)
  if (options?.format === 'auto') params.append('auto', 'format')

  const baseUrl = url.split('?')[0]
  return `${baseUrl}?${params.toString()}`
}

// Function to generate responsive image URLs
export const generateResponsiveImages = (url: string) => {
  return {
    thumbnail: getOptimizedImageUrl(url, { width: 150, height: 150, quality: 80 }),
    medium: getOptimizedImageUrl(url, { width: 600, height: 400, quality: 85 }),
    large: getOptimizedImageUrl(url, { width: 1200, height: 800, quality: 90 }),
  }
}

// Function to validate image before upload
export const validateImageFile = (file: File) => {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  
  if (file.size > maxSize) {
    throw new Error('File size must be less than 10MB')
  }
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('File must be a valid image format (JPEG, PNG, WebP, or GIF)')
  }
  
  return true
}

// Function to upload multiple images
export const uploadMultipleImages = async (files: File[]) => {
  const uploadPromises = files.map(async (file, index) => {
    try {
      const result = await cloudinaryUploader.upload(file, {
        resource_type: 'auto',
        folder: 'bdpp-uploads',
        public_id: `image_${Date.now()}_${index}`,
      })
      
      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        originalName: file.name,
      }
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error)
      return {
        success: false,
        error: error.message,
        originalName: file.name,
      }
    }
  })

  const results = await Promise.all(uploadPromises)
  return results
}
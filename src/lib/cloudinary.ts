import { v2 as cloudinary } from 'cloudinary'

// Cloudinary configuration
const cloudinaryConfig = {
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dycm4ujkn',
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '587749428528119',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'QJLOTo9wDxk5MnjtAfS1m5JzPBk',
}

// Initialize Cloudinary
cloudinary.config(cloudinaryConfig)

// Create Cloudinary instance
export const cloudinaryUploader = cloudinary.uploader

// Utility functions for image optimization
export const getOptimizedImageUrl = (url: string, options?: {
  width?: number
  height?: number
  quality?: number
  format?: string
  crop?: string
  gravity?: string
  effect?: string
  blur?: number
  brightness?: number
  contrast?: number
}) => {
  if (!url || !url.includes('cloudinary.com')) return url

  // Extract the base URL and public ID from Cloudinary URL
  const urlParts = url.split('/upload/')
  if (urlParts.length !== 2) return url

  const baseUrl = urlParts[0] + '/upload/'
  const imagePath = urlParts[1]

  // Build transformation string
  const transformations: string[] = []

  // Basic transformations
  if (options?.width) transformations.push(`w_${options.width}`)
  if (options?.height) transformations.push(`h_${options.height}`)
  if (options?.crop) transformations.push(`c_${options.crop}`)
  if (options?.gravity) transformations.push(`g_${options.gravity}`)
  if (options?.quality) transformations.push(`q_${options.quality}`)
  if (options?.format) {
    if (options.format === 'auto') {
      transformations.push('f_auto')
    } else {
      transformations.push(`f_${options.format}`)
    }
  }

  // Advanced transformations
  if (options?.effect) transformations.push(`e_${options.effect}`)
  if (options?.blur) transformations.push(`e_blur:${options.blur}`)
  if (options?.brightness) transformations.push(`e_brightness:${options.brightness}`)
  if (options?.contrast) transformations.push(`e_contrast:${options.contrast}`)

  // Add default optimizations if no specific options provided
  if (transformations.length === 0) {
    transformations.push('f_auto', 'q_auto')
  }

  const transformationString = transformations.join(',')

  return `${baseUrl}${transformationString}/${imagePath}`
}

// Function to generate responsive image URLs
export const generateResponsiveImages = (url: string) => {
  return {
    thumbnail: getOptimizedImageUrl(url, { width: 150, height: 150, quality: 80, format: 'auto' }),
    small: getOptimizedImageUrl(url, { width: 400, height: 300, quality: 85, format: 'auto' }),
    medium: getOptimizedImageUrl(url, { width: 600, height: 400, quality: 85, format: 'auto' }),
    large: getOptimizedImageUrl(url, { width: 1200, height: 800, quality: 90, format: 'auto' }),
  }
}

// Function to generate srcset for responsive images
export const generateSrcSet = (url: string) => {
  const images = generateResponsiveImages(url)
  return `${images.small} 400w, ${images.medium} 600w, ${images.large} 1200w`
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

// Function to upload multiple images (expects file paths, not File objects)
export const uploadMultipleImages = async (filePaths: string[]) => {
  const uploadPromises = filePaths.map(async (filePath, index) => {
    try {
      const result = await cloudinaryUploader.upload(filePath, {
        resource_type: 'auto',
        folder: 'bdpp-uploads',
        public_id: `image_${Date.now()}_${index}`,
      })

      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        originalName: filePath.split('/').pop() || 'unknown',
      }
    } catch (error) {
      console.error(`Failed to upload ${filePath}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        originalName: filePath.split('/').pop() || 'unknown',
      }
    }
  })

  const results = await Promise.all(uploadPromises)
  return results
}
// Utility functions for image optimization (client-safe)

// Function to generate optimized image URLs for CloudFront/S3
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
  // Temporarily disable transformations to fix access denied errors
  // Return original URL without any transformations
  return url
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

// Function to generate sizes attribute for responsive images
export const generateSizes = (containerMaxWidth: number = 800): string => {
  return `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, ${Math.min(containerMaxWidth, 800)}px`
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

// Function to handle image loading errors with fallback
export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
  const target = event.target as HTMLImageElement
  // Set a fallback image or hide the image
  target.src = '/placeholder.png'
  target.onerror = null // Prevent infinite loop
}

// Function to check if URL is valid
export const isValidImageUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
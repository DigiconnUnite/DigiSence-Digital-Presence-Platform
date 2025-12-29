import { getOptimizedImageUrl } from './s3-upload'

export interface OptimizedImageUrls {
  original: string
  webp: {
    small: string
    medium: string
    large: string
  }
  responsive: {
    thumbnail: string
    small: string
    medium: string
    large: string
  }
}

/**
 * Generate optimized image URLs for different sizes and formats
 */
export function generateOptimizedImageUrls(originalUrl: string): OptimizedImageUrls {
  return {
    original: originalUrl,
    webp: {
      small: getOptimizedImageUrl(originalUrl, { width: 300, height: 300, format: 'webp', quality: 85 }),
      medium: getOptimizedImageUrl(originalUrl, { width: 600, height: 600, format: 'webp', quality: 85 }),
      large: getOptimizedImageUrl(originalUrl, { width: 1200, height: 1200, format: 'webp', quality: 85 }),
    },
    responsive: {
      thumbnail: getOptimizedImageUrl(originalUrl, { width: 150, height: 150, format: 'webp', quality: 80 }),
      small: getOptimizedImageUrl(originalUrl, { width: 400, height: 400, format: 'webp', quality: 85 }),
      medium: getOptimizedImageUrl(originalUrl, { width: 800, height: 800, format: 'webp', quality: 85 }),
      large: getOptimizedImageUrl(originalUrl, { width: 1600, height: 1600, format: 'webp', quality: 90 }),
    }
  }
}

/**
 * Get the best optimized image URL based on container size
 */
export function getResponsiveImageUrl(
  optimizedUrls: OptimizedImageUrls | null,
  containerWidth: number,
  containerHeight: number = containerWidth
): string {
  if (!optimizedUrls) return ''

  // For profile pictures and small images
  if (containerWidth <= 150 || containerHeight <= 150) {
    return optimizedUrls.responsive.thumbnail
  }

  // For medium images
  if (containerWidth <= 400 || containerHeight <= 400) {
    return optimizedUrls.responsive.small
  }

  // For large images
  if (containerWidth <= 800 || containerHeight <= 800) {
    return optimizedUrls.responsive.medium
  }

  // For very large images
  return optimizedUrls.responsive.large
}

/**
 * Generate srcSet for responsive images
 */
export function generateSrcSet(optimizedUrls: OptimizedImageUrls | null): string {
  if (!optimizedUrls) return ''

  return [
    `${optimizedUrls.responsive.thumbnail} 150w`,
    `${optimizedUrls.responsive.small} 400w`,
    `${optimizedUrls.responsive.medium} 800w`,
    `${optimizedUrls.responsive.large} 1600w`,
  ].join(', ')
}

/**
 * Generate sizes attribute for responsive images
 */
export function generateSizes(containerMaxWidth: number = 800): string {
  return `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, ${Math.min(containerMaxWidth, 800)}px`
}

/**
 * React hook for lazy loading optimized images
 */
export function useOptimizedImage(
  originalUrl: string | null,
  containerWidth: number = 400,
  containerHeight: number = 400
) {
  const optimizedUrls = originalUrl ? generateOptimizedImageUrls(originalUrl) : null
  const src = getResponsiveImageUrl(optimizedUrls, containerWidth, containerHeight)
  const srcSet = generateSrcSet(optimizedUrls)
  const sizes = generateSizes(containerWidth)

  return {
    src,
    srcSet,
    sizes,
    optimizedUrls,
    originalUrl
  }
}
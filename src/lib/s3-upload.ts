import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { s3Client, S3_CONFIG } from './aws'
import { v4 as uuidv4 } from 'uuid'

export interface UploadResult {
  success: boolean
  url?: string
  key?: string
  error?: string
  originalName?: string
}

export interface UploadOptions {
  folder?: string
  contentType?: string
  acl?: 'private' | 'public-read'
  entityType?: 'business' | 'professional' | 'brand' | 'product' | 'user' | 'general'
  entityId?: string
  imageType?: 'logo' | 'banner' | 'profile' | 'product' | 'hero' | 'brand' | 'portfolio' | 'catalog'
}

/**
 * Upload a file buffer to S3
 */
export async function uploadToS3(
  fileBuffer: Buffer | Uint8Array,
  fileName: string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  try {
    const {
      folder,
      contentType,
      acl = 'public-read',
      entityType = 'general',
      entityId,
      imageType = 'general'
    } = options

    // Build folder structure: mydigisenceimage/{entityType}/{entityId}/{imageType}/
    let uploadFolder = 'mydigisenceimage'

    if (entityType !== 'general') {
      uploadFolder += `/${entityType}`
      if (entityId) {
        uploadFolder += `/${entityId}`
      }
      if (imageType !== 'general') {
        uploadFolder += `/${imageType}`
      }
    } else if (folder) {
      // Fallback to custom folder if provided
      uploadFolder += `/${folder}`
    } else {
      uploadFolder += '/general'
    }

    // Generate unique key
    const fileExtension = fileName.split('.').pop() || ''
    const uniqueId = uuidv4()
    const key = `${uploadFolder}/${uniqueId}.${fileExtension}`

    // Upload using multipart for large files
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: S3_CONFIG.bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
        // ACL removed - use bucket policy or CloudFront for public access
      },
    })

    await upload.done()

    // Generate CloudFront URL if configured, otherwise S3 URL
    const url = S3_CONFIG.cloudFrontUrl
      ? `${S3_CONFIG.cloudFrontUrl}/${key}`
      : `https://${S3_CONFIG.bucketName}.s3.${S3_CONFIG.region}.amazonaws.com/${key}`

    return {
      success: true,
      url,
      key,
      originalName: fileName,
    }
  } catch (error) {
    console.error('S3 upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown upload error',
      originalName: fileName,
    }
  }
}

/**
 * Upload multiple files to S3
 */
export async function uploadMultipleToS3(
  files: { buffer: Buffer | Uint8Array; name: string; contentType?: string }[],
  folder: string = 'uploads'
): Promise<UploadResult[]> {
  const uploadPromises = files.map(async (file) => {
    return uploadToS3(file.buffer, file.name, {
      folder,
      contentType: file.contentType,
    })
  })

  return Promise.all(uploadPromises)
}

/**
 * Generate optimized image URL using CloudFront behaviors
 */
export function getOptimizedImageUrl(
  originalUrl: string,
  options: {
    width?: number
    height?: number
    quality?: number
    format?: 'auto' | 'webp' | 'jpg' | 'png'
  } = {}
): string {
  if (!S3_CONFIG.cloudFrontUrl || !originalUrl.includes(S3_CONFIG.cloudFrontUrl)) {
    return originalUrl
  }

  const { width, height, quality = 80, format = 'auto' } = options
  const transforms: string[] = []

  if (width) transforms.push(`w_${width}`)
  if (height) transforms.push(`h_${height}`)
  if (quality !== 80) transforms.push(`q_${quality}`)
  if (format !== 'auto') transforms.push(`f_${format}`)

  if (transforms.length === 0) return originalUrl

  const transformString = transforms.join(',')
  const key = originalUrl.replace(`${S3_CONFIG.cloudFrontUrl}/`, '')

  return `${S3_CONFIG.cloudFrontUrl}/${transformString}/${key}`
}

/**
 * Generate optimized video URL using CloudFront behaviors
 */
export function getOptimizedVideoUrl(
  originalUrl: string,
  options: {
    width?: number
    height?: number
    bitrate?: number
    format?: 'auto' | 'mp4' | 'webm'
  } = {}
): string {
  if (!S3_CONFIG.cloudFrontUrl || !originalUrl.includes(S3_CONFIG.cloudFrontUrl)) {
    return originalUrl
  }

  const { width, height, bitrate, format = 'auto' } = options
  const transforms: string[] = []

  if (width) transforms.push(`w_${width}`)
  if (height) transforms.push(`h_${height}`)
  if (bitrate) transforms.push(`br_${bitrate}`)
  if (format !== 'auto') transforms.push(`f_${format}`)

  if (transforms.length === 0) return originalUrl

  const transformString = transforms.join(',')
  const key = originalUrl.replace(`${S3_CONFIG.cloudFrontUrl}/`, '')

  return `${S3_CONFIG.cloudFrontUrl}/${transformString}/${key}`
}

/**
 * Upload business logo
 */
export async function uploadBusinessLogo(
  fileBuffer: Buffer | Uint8Array,
  fileName: string,
  businessId: string
): Promise<UploadResult> {
  return uploadToS3(fileBuffer, fileName, {
    entityType: 'business',
    entityId: businessId,
    imageType: 'logo',
    contentType: 'image/png'
  })
}

/**
 * Upload business banner/hero image
 */
export async function uploadBusinessBanner(
  fileBuffer: Buffer | Uint8Array,
  fileName: string,
  businessId: string
): Promise<UploadResult> {
  return uploadToS3(fileBuffer, fileName, {
    entityType: 'business',
    entityId: businessId,
    imageType: 'banner',
    contentType: 'image/jpeg'
  })
}

/**
 * Upload business portfolio image
 */
export async function uploadBusinessPortfolio(
  fileBuffer: Buffer | Uint8Array,
  fileName: string,
  businessId: string
): Promise<UploadResult> {
  return uploadToS3(fileBuffer, fileName, {
    entityType: 'business',
    entityId: businessId,
    imageType: 'portfolio',
    contentType: 'image/jpeg'
  })
}

/**
 * Upload business catalog PDF
 */
export async function uploadBusinessCatalog(
  fileBuffer: Buffer | Uint8Array,
  fileName: string,
  businessId: string
): Promise<UploadResult> {
  return uploadToS3(fileBuffer, fileName, {
    entityType: 'business',
    entityId: businessId,
    imageType: 'catalog',
    contentType: 'application/pdf'
  })
}

/**
 * Upload professional profile picture
 */
export async function uploadProfessionalProfilePicture(
  fileBuffer: Buffer | Uint8Array,
  fileName: string,
  professionalId: string
): Promise<UploadResult> {
  return uploadToS3(fileBuffer, fileName, {
    entityType: 'professional',
    entityId: professionalId,
    imageType: 'profile',
    contentType: 'image/jpeg'
  })
}

/**
 * Upload professional banner
 */
export async function uploadProfessionalBanner(
  fileBuffer: Buffer | Uint8Array,
  fileName: string,
  professionalId: string
): Promise<UploadResult> {
  return uploadToS3(fileBuffer, fileName, {
    entityType: 'professional',
    entityId: professionalId,
    imageType: 'banner',
    contentType: 'image/jpeg'
  })
}

/**
 * Upload professional portfolio image
 */
export async function uploadProfessionalPortfolio(
  fileBuffer: Buffer | Uint8Array,
  fileName: string,
  professionalId: string
): Promise<UploadResult> {
  return uploadToS3(fileBuffer, fileName, {
    entityType: 'professional',
    entityId: professionalId,
    imageType: 'portfolio',
    contentType: 'image/jpeg'
  })
}

/**
 * Upload brand logo
 */
export async function uploadBrandLogo(
  fileBuffer: Buffer | Uint8Array,
  fileName: string,
  brandId: string
): Promise<UploadResult> {
  return uploadToS3(fileBuffer, fileName, {
    entityType: 'brand',
    entityId: brandId,
    imageType: 'logo',
    contentType: 'image/png'
  })
}

/**
 * Upload product image
 */
export async function uploadProductImage(
  fileBuffer: Buffer | Uint8Array,
  fileName: string,
  productId: string
): Promise<UploadResult> {
  return uploadToS3(fileBuffer, fileName, {
    entityType: 'product',
    entityId: productId,
    imageType: 'product',
    contentType: 'image/jpeg'
  })
}
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { s3Client, S3_CONFIG } from './aws'
import { v4 as uuidv4 } from 'uuid'

/**
 * Common MIME type extensions mapping
 */
const MIME_TYPE_EXTENSIONS: Record<string, string> = {
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'gif': 'image/gif',
  'webp': 'image/webp',
  'svg': 'image/svg+xml',
  'bmp': 'image/bmp',
  'ico': 'image/x-icon',
  'tiff': 'image/tiff',
  'tif': 'image/tiff',
  'pdf': 'application/pdf',
  'doc': 'application/msword',
  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'xls': 'application/vnd.ms-excel',
  'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'ppt': 'application/vnd.ms-powerpoint',
  'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'zip': 'application/zip',
  'txt': 'text/plain',
  'html': 'text/html',
  'css': 'text/css',
  'js': 'application/javascript',
  'json': 'application/json',
  'xml': 'application/xml',
}

/**
 * Magic bytes signatures for common file types
 */
const MAGIC_BYTES_SIGNATURES: Array<{ signature: number[]; mimeType: string }> = [
  // PNG (89 50 4E 47 0D 0A 1A 0A)
  { signature: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], mimeType: 'image/png' },
  // JPEG (FF D8 FF)
  { signature: [0xFF, 0xD8, 0xFF], mimeType: 'image/jpeg' },
  // GIF87a (47 49 46 38 37 61)
  { signature: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], mimeType: 'image/gif' },
  // GIF89a (47 49 46 38 39 61)
  { signature: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], mimeType: 'image/gif' },
  // WebP (52 49 46 46 XX XX XX XX 57 45 42 50)
  { signature: [0x52, 0x49, 0x46, 0x46], mimeType: 'image/webp' },
  // BMP (42 4D)
  { signature: [0x42, 0x4D], mimeType: 'image/bmp' },
  // TIFF little endian (49 49 2A 00)
  { signature: [0x49, 0x49, 0x2A, 0x00], mimeType: 'image/tiff' },
  // TIFF big endian (4D 4D 00 2A)
  { signature: [0x4D, 0x4D, 0x00, 0x2A], mimeType: 'image/tiff' },
  // PDF (25 50 44 46)
  { signature: [0x25, 0x50, 0x44, 0x46], mimeType: 'application/pdf' },
  // ZIP (50 4B 03 04)
  { signature: [0x50, 0x4B, 0x03, 0x04], mimeType: 'application/zip' },
  // SVG (3C 73 76 67) - text-based, check start of file
  { signature: [0x3C, 0x73, 0x76, 0x67], mimeType: 'image/svg+xml' },
  // ICO (00 00 01 00)
  { signature: [0x00, 0x00, 0x01, 0x00], mimeType: 'image/x-icon' },
]

/**
 * Detect MIME type from file buffer using magic bytes (file signatures)
 * @param buffer - The file buffer to analyze
 * @returns Detected MIME type or null if not recognized
 */
function detectMimeTypeFromBuffer(buffer: Buffer | Uint8Array): string | null {
  if (!buffer || buffer.length < 4) {
    return null
  }

  // Convert Uint8Array to Buffer if needed
  const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer)
  
  // Check each magic byte signature
  for (const { signature, mimeType } of MAGIC_BYTES_SIGNATURES) {
    if (buf.length >= signature.length) {
      let matches = true
      for (let i = 0; i < signature.length; i++) {
        if (buf[i] !== signature[i]) {
          matches = false
          break
        }
      }
      if (matches) {
        return mimeType
      }
    }
  }

  // Special handling for WebP (RIFF....WEBP)
  if (buf.length >= 12 && 
      buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 && // RIFF
      buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) { // WEBP
    return 'image/webp'
  }

  // Special handling for SVG (text-based, starts with <?xml or <svg)
  if (buf.length >= 5) {
    const start = buf.slice(0, 5).toString('ascii').toLowerCase()
    if (start.startsWith('<?xml') || start.startsWith('<svg')) {
      return 'image/svg+xml'
    }
  }

  return null
}

/**
 * Detect MIME type from file extension
 * @param filename - The filename to extract extension from
 * @returns MIME type based on extension or 'application/octet-stream' as fallback
 */
function getMimeTypeFromExtension(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  return MIME_TYPE_EXTENSIONS[ext || ''] || 'application/octet-stream'
}

/**
 * Detect MIME type from file buffer with fallback to extension-based detection
 * @param buffer - The file buffer to analyze
 * @param filename - The filename (used as fallback for extension detection)
 * @returns Detected MIME type
 */
export function detectMimeType(buffer: Buffer | Uint8Array, filename: string): string {
  // First, try to detect from magic bytes
  const detectedFromBuffer = detectMimeTypeFromBuffer(buffer)
  if (detectedFromBuffer) {
    return detectedFromBuffer
  }

  // Fall back to extension-based detection
  return getMimeTypeFromExtension(filename)
}

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
  imageType?: 'logo' | 'banner' | 'profile' | 'product' | 'hero' | 'brand' | 'portfolio' | 'catalog' | 'resume'
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
    crop?: string
    gravity?: string
  } = {}
): string {
  if (!S3_CONFIG.cloudFrontUrl || !originalUrl.includes(S3_CONFIG.cloudFrontUrl)) {
    return originalUrl
  }

  const { width, height, quality = 85, format = 'auto', crop, gravity } = options
  const transforms: string[] = []

  // Build transformation string matching CloudFront behavior patterns
  if (width) transforms.push(`w_${width}`)
  if (height) transforms.push(`h_${height}`)
  if (quality !== 85) transforms.push(`q_${quality}`)
  if (format !== 'auto') transforms.push(`f_${format}`)
  if (crop) transforms.push(`c_${crop}`)
  if (gravity) transforms.push(`g_${gravity}`)

  if (transforms.length === 0) return originalUrl

  const transformString = transforms.join(',')
  const key = originalUrl.replace(`${S3_CONFIG.cloudFrontUrl}/`, '')

  // Use 'resize' prefix to match CloudFront behavior configuration
  return `${S3_CONFIG.cloudFrontUrl}/resize/${transformString}/${key}`
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
  const contentType = detectMimeType(fileBuffer, fileName)
  return uploadToS3(fileBuffer, fileName, {
    entityType: 'business',
    entityId: businessId,
    imageType: 'logo',
    contentType
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
  const contentType = detectMimeType(fileBuffer, fileName)
  return uploadToS3(fileBuffer, fileName, {
    entityType: 'business',
    entityId: businessId,
    imageType: 'banner',
    contentType
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
  const contentType = detectMimeType(fileBuffer, fileName)
  return uploadToS3(fileBuffer, fileName, {
    entityType: 'business',
    entityId: businessId,
    imageType: 'portfolio',
    contentType
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
  const contentType = detectMimeType(fileBuffer, fileName)
  return uploadToS3(fileBuffer, fileName, {
    entityType: 'business',
    entityId: businessId,
    imageType: 'catalog',
    contentType
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
  const contentType = detectMimeType(fileBuffer, fileName)
  return uploadToS3(fileBuffer, fileName, {
    entityType: 'professional',
    entityId: professionalId,
    imageType: 'profile',
    contentType
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
  const contentType = detectMimeType(fileBuffer, fileName)
  return uploadToS3(fileBuffer, fileName, {
    entityType: 'professional',
    entityId: professionalId,
    imageType: 'banner',
    contentType
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
  const contentType = detectMimeType(fileBuffer, fileName)
  return uploadToS3(fileBuffer, fileName, {
    entityType: 'professional',
    entityId: professionalId,
    imageType: 'portfolio',
    contentType
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
  const contentType = detectMimeType(fileBuffer, fileName)
  return uploadToS3(fileBuffer, fileName, {
    entityType: 'brand',
    entityId: brandId,
    imageType: 'logo',
    contentType
  })
}

/**
 * Upload professional resume PDF
 */
export async function uploadProfessionalResume(
  fileBuffer: Buffer | Uint8Array,
  fileName: string,
  professionalId: string
): Promise<UploadResult> {
  const contentType = detectMimeType(fileBuffer, fileName)
  return uploadToS3(fileBuffer, fileName, {
    entityType: 'professional',
    entityId: professionalId,
    imageType: 'resume',
    contentType
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
  const contentType = detectMimeType(fileBuffer, fileName)
  return uploadToS3(fileBuffer, fileName, {
    entityType: 'product',
    entityId: productId,
    imageType: 'product',
    contentType
  })
}
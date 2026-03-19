import { NextRequest, NextResponse } from 'next/server'
import { uploadToS3, getOptimizedImageUrl, getOptimizedVideoUrl } from '@/lib/s3-upload'
import { getTokenFromRequest, verifyToken } from '@/lib/jwt'

// Auth guard for upload route
function authenticateRequest(request: NextRequest): { userId: string; role: string } | null {
  const token = getTokenFromRequest(request) ?? request.cookies.get('auth-token')?.value
  if (!token) return null
  const payload = verifyToken(token) as { userId: string; role: string } | null
  return payload
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const user = authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file
    const maxSize = 50 * 1024 * 1024 // 50MB for videos
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff', 'image/svg+xml']
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov']
    const allowedPdfTypes = ['application/pdf']
    const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes, ...allowedPdfTypes]

    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size must be less than 50MB' }, { status: 400 })
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        error: 'File must be a valid format (Images: JPEG, JPG, PNG, WebP, GIF, BMP, TIFF, SVG; Videos: MP4, WebM, OGG, AVI, MOV; PDFs: PDF)'
      }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Determine if it's video or image for folder organization
    const isVideo = allowedVideoTypes.includes(file.type)
    const isPdf = allowedPdfTypes.includes(file.type)
    const folder = 'bdpp-uploads'

    // Upload to S3 - FAIL loudly instead of silently falling back to mock
    let uploadResult;
    try {
      uploadResult = await uploadToS3(buffer, file.name, {
        folder,
        contentType: file.type,
      })
    } catch (s3Error) {
      // Fail loudly - don't silently use mock URLs in production
      console.error('S3 upload failed:', s3Error)
      return NextResponse.json({
        error: 'File upload service is currently unavailable. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? (s3Error instanceof Error ? s3Error.message : 'S3 error') : undefined
      }, { status: 503 })
    }

    if (!uploadResult.success) {
      return NextResponse.json({
        error: 'Failed to upload media',
        details: uploadResult.error
      }, { status: 500 })
    }

    // Generate optimized URLs for videos
    let optimizedUrls = {}
    if (isVideo && uploadResult.url) {
      optimizedUrls = {
        optimized_720p: getOptimizedVideoUrl(uploadResult.url, { width: 720, height: 480 }),
        optimized_480p: getOptimizedVideoUrl(uploadResult.url, { width: 480, height: 320 }),
      }
    }

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      filename: file.name,
      size: file.size,
      type: file.type,
      resourceType: isVideo ? 'video' : isPdf ? 'raw' : 'image',
      optimizedUrls,
      message: `${isVideo ? 'Video' : isPdf ? 'PDF' : 'Image'} uploaded successfully!`
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({
      error: 'Failed to upload media',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
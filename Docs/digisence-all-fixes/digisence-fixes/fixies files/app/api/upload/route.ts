import { NextRequest, NextResponse } from 'next/server'
import { uploadToS3, getOptimizedVideoUrl } from '@/lib/s3-upload'
import { requireAuth, unauthorized } from '@/lib/auth-helpers'

/**
 * POST /api/upload
 * 
 * FIXED:
 * 1. Added authentication — previously anyone could upload to S3 with no auth check
 * 2. Removed silent mock upload fallback — S3 failures now return proper errors
 *    (previously fake URLs like mock-s3.example.com got saved to the database)
 */
export async function POST(request: NextRequest) {
  try {
    // FIXED: Auth guard — previously missing entirely
    const user = await requireAuth(request)
    if (!user) return unauthorized()

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const maxSize = 50 * 1024 * 1024 // 50MB
    const allowedImageTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
      'image/gif', 'image/bmp', 'image/tiff', 'image/svg+xml',
    ]
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov']
    const allowedPdfTypes = ['application/pdf']
    const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes, ...allowedPdfTypes]

    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size must be less than 50MB' }, { status: 400 })
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF, MP4, WebM, PDF',
      }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const isVideo = allowedVideoTypes.includes(file.type)
    const isPdf = allowedPdfTypes.includes(file.type)

    // FIXED: No more silent mock fallback — fail loudly if S3 is misconfigured
    const uploadResult = await uploadToS3(buffer, file.name, {
      folder: 'bdpp-uploads',
      contentType: file.type,
    })

    if (!uploadResult.success || !uploadResult.url) {
      console.error('S3 upload failed:', uploadResult.error)
      return NextResponse.json({
        error: 'Failed to upload file. Please check storage configuration.',
        details: process.env.NODE_ENV === 'development' ? uploadResult.error : undefined,
      }, { status: 500 })
    }

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
      message: `${isVideo ? 'Video' : isPdf ? 'PDF' : 'Image'} uploaded successfully!`,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({
      error: 'Failed to upload file',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { writeFile, unlink, mkdir } from 'fs/promises'
import { join } from 'path'
import { v2 as cloudinary } from 'cloudinary'

// Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dycm4ujkn',
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '587749428528119',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'QJLOTo9wDxk5MnjtAfS1m5JzPBk',
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file
    const maxSize = 50 * 1024 * 1024 // 50MB for videos
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov']
    const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes]

    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size must be less than 50MB' }, { status: 400 })
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        error: 'File must be a valid format (Images: JPEG, PNG, WebP, GIF; Videos: MP4, WebM, OGG, AVI, MOV)'
      }, { status: 400 })
    }

    // Create temp directory if it doesn't exist
    const tempDir = join(process.cwd(), 'temp')
    try {
      await mkdir(tempDir, { recursive: true })
    } catch (error) {
      // Directory might already exist, continue
    }

    // Create a temporary file
    const bytes = await file.arrayBuffer()
    const tempFilePath = join(tempDir, `upload_${Date.now()}_${file.name}`)
    await writeFile(tempFilePath, Buffer.from(bytes))

    // Determine resource type
    const isVideo = allowedVideoTypes.includes(file.type)
    const resourceType = isVideo ? 'video' : 'image'

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(tempFilePath, {
      resource_type: resourceType,
      folder: 'bdpp-uploads',
      use_filename: true,
      unique_filename: true,
      // Video-specific options
      ...(isVideo && {
        eager: [
          { width: 720, height: 480, crop: 'fill' },
          { width: 480, height: 320, crop: 'fill' }
        ]
      })
    })

    // Clean up temp file
    try {
      await unlink(tempFilePath)
    } catch (error) {
      console.warn('Failed to clean up temp file:', error)
    }

    if (result.secure_url) {
      return NextResponse.json({
        success: true,
        url: result.secure_url,
        filename: result.original_filename,
        size: file.size,
        type: file.type,
        resourceType: result.resource_type,
        message: `${isVideo ? 'Video' : 'Image'} uploaded successfully!`
      })
    } else {
      return NextResponse.json({ error: 'Failed to upload media' }, { status: 500 })
    }
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({
      error: 'Failed to upload media',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
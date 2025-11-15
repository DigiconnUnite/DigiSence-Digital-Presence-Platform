import { NextRequest, NextResponse } from 'next/server'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { v2 as cloudinary } from 'cloudinary'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
    }
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'File must be a valid image format (JPEG, PNG, WebP, or GIF)' }, { status: 400 })
    }

    // Create a temporary file
    const bytes = await file.arrayBuffer()
    const tempFilePath = join(process.cwd(), 'temp', file.name)
    await writeFile(tempFilePath, Buffer.from(bytes))

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(tempFilePath, {
      resource_type: 'auto',
      folder: 'bdpp-uploads',
      use_filename: true,
      unique_filename: true,
    })

    // Clean up temp file
    await unlink(tempFilePath)

    if (result.secure_url) {
      return NextResponse.json({
        success: true,
        url: result.secure_url,
        filename: result.original_filename,
        size: file.size,
        type: file.type,
        message: 'Image uploaded successfully!'
      })
    } else {
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
    }
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}
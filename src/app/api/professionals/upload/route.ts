import { NextRequest, NextResponse } from 'next/server'
import { uploadProfessionalProfilePicture, uploadProfessionalBanner, uploadProfessionalPortfolio, getOptimizedImageUrl } from '@/lib/s3-upload'
import { db } from '@/lib/db'
import { getTokenFromRequest, verifyToken } from '@/lib/jwt'

async function getProfessionalAdmin(request: NextRequest) {
  const token = getTokenFromRequest(request) || request.cookies.get('auth-token')?.value

  if (!token) {
    return null
  }

  const payload = verifyToken(token)
  if (!payload || payload.role !== 'PROFESSIONAL_ADMIN') {
    return null
  }

  return payload
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const admin = await getProfessionalAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const uploadType = formData.get('type') as 'profile' | 'banner' | 'portfolio' // Add type parameter

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file
    const maxSize = 10 * 1024 * 1024 // 10MB for images
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff', 'image/svg+xml']

    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
    }

    if (!allowedImageTypes.includes(file.type)) {
      return NextResponse.json({
        error: 'File must be a valid image format (JPEG, JPG, PNG, WebP, GIF, BMP, TIFF, SVG)'
      }, { status: 400 })
    }

    // Find the professional associated with this user
    const professional = await db.professional.findFirst({
      where: { adminId: admin.userId }
    })

    if (!professional) {
      return NextResponse.json({ error: 'Professional profile not found' }, { status: 404 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    let uploadResult

    // Upload based on type
    switch (uploadType) {
      case 'profile':
        uploadResult = await uploadProfessionalProfilePicture(buffer, file.name, professional.id)
        break
      case 'banner':
        uploadResult = await uploadProfessionalBanner(buffer, file.name, professional.id)
        break
      case 'portfolio':
        uploadResult = await uploadProfessionalPortfolio(buffer, file.name, professional.id)
        break
      default:
        return NextResponse.json({ error: 'Invalid upload type' }, { status: 400 })
    }

    if (!uploadResult.success) {
      return NextResponse.json({
        error: 'Failed to upload image',
        details: uploadResult.error
      }, { status: 500 })
    }

    // Update professional record with the new image URL
    const updateData: any = {}
    if (uploadType === 'profile') {
      updateData.profilePicture = uploadResult.url
    } else if (uploadType === 'banner') {
      updateData.banner = uploadResult.url
    }

    if (Object.keys(updateData).length > 0) {
      await db.professional.update({
        where: { id: professional.id },
        data: updateData
      })
    }

    // Generate optimized URLs for different sizes and formats
    const optimizedUrls = uploadResult.url ? {
      original: uploadResult.url,
      webp: {
        small: getOptimizedImageUrl(uploadResult.url, { width: 300, height: 300, format: 'webp', quality: 85 }),
        medium: getOptimizedImageUrl(uploadResult.url, { width: 600, height: 600, format: 'webp', quality: 85 }),
        large: getOptimizedImageUrl(uploadResult.url, { width: 1200, height: 1200, format: 'webp', quality: 85 }),
      },
      responsive: {
        thumbnail: getOptimizedImageUrl(uploadResult.url, { width: 150, height: 150, format: 'webp', quality: 80 }),
        small: getOptimizedImageUrl(uploadResult.url, { width: 400, height: 400, format: 'webp', quality: 85 }),
        medium: getOptimizedImageUrl(uploadResult.url, { width: 800, height: 800, format: 'webp', quality: 85 }),
        large: getOptimizedImageUrl(uploadResult.url, { width: 1600, height: 1600, format: 'webp', quality: 90 }),
      }
    } : null

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      optimizedUrls,
      filename: file.name,
      size: file.size,
      type: file.type,
      message: 'Image uploaded successfully!'
    })
  } catch (error) {
    console.error('Professional upload error:', error)
    return NextResponse.json({
      error: 'Failed to upload image',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromRequest, verifyToken } from '@/lib/jwt'
import { z } from 'zod'

async function getBusinessAdmin(request: NextRequest) {
  const token = getTokenFromRequest(request) || request.cookies.get('auth-token')?.value
  
  if (!token) {
    return null
  }
  
  const payload = verifyToken(token)
  if (!payload || payload.role !== 'BUSINESS_ADMIN') {
    return null
  }
  
  return payload
}

async function getBusinessId(adminId: string) {
  const business = await db.business.findUnique({
    where: { adminId },
    select: { id: true }
  })
  return business?.id
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getBusinessAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const businessId = await getBusinessId(admin.userId)
    if (!businessId) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const contentType = request.headers.get('content-type')
    
    // Check if it's a multipart/form-data (file upload)
    if (contentType && contentType.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await request.formData()
      const file = formData.get('image') as File
      
      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed' }, { status: 400 })
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        return NextResponse.json({ error: 'File too large. Maximum size is 5MB' }, { status: 400 })
      }

      // Generate a unique filename
      const timestamp = Date.now()
      const fileExtension = file.type.split('/')[1]
      const filename = `${timestamp}_${file.name.replace(/\.[^/.]+$/, '')}.${fileExtension}`
      
      // For now, we'll store files in public/uploads directory
      // In production, you would use a cloud storage service like Cloudinary
      const fs = require('fs').promises
      const path = require('path')
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads')

      // Ensure uploads directory exists
      try {
        await fs.mkdir(uploadsDir, { recursive: true })
      } catch (error) {
        console.error('Failed to create uploads directory:', error)
      }

      const filePath = path.join(uploadsDir, filename)

      // Save file to filesystem
      const buffer = Buffer.from(await file.arrayBuffer())
      await fs.writeFile(filePath, buffer)

      // Return the URL for the uploaded file
      const fileUrl = `/uploads/${filename}`
      
      return NextResponse.json({
        success: true,
        url: fileUrl,
        message: 'Image uploaded successfully'
      })
    } else {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
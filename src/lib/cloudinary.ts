import { v2 as cloudinary } from 'cloudinary'

// Cloudinary configuration
const cloudinaryConfig = {
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dycm4ujkn',
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '587749428528119',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'QJLOTo9wDxk5MnjtAfS1m5JzPBk',
}

// Initialize Cloudinary
cloudinary.config(cloudinaryConfig)

// Create Cloudinary instance
export const cloudinaryUploader = cloudinary.uploader

// Function to upload multiple images (expects file paths, not File objects)
export const uploadMultipleImages = async (filePaths: string[]) => {
  const uploadPromises = filePaths.map(async (filePath, index) => {
    try {
      const result = await cloudinaryUploader.upload(filePath, {
        resource_type: 'auto',
        folder: 'bdpp-uploads',
        public_id: `image_${Date.now()}_${index}`,
      })

      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        originalName: filePath.split('/').pop() || 'unknown',
      }
    } catch (error) {
      console.error(`Failed to upload ${filePath}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        originalName: filePath.split('/').pop() || 'unknown',
      }
    }
  })

  const results = await Promise.all(uploadPromises)
  return results
}
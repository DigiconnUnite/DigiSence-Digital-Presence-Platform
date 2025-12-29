import { S3Client } from '@aws-sdk/client-s3'

// AWS S3 Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

// Bucket configuration
export const S3_CONFIG = {
  bucketName: process.env.AWS_S3_BUCKET_NAME || 'digisence-uploads',
  cloudFrontUrl: process.env.AWS_CLOUDFRONT_URL || '',
  region: process.env.AWS_REGION || 'ap-south-1',
}

export { s3Client }
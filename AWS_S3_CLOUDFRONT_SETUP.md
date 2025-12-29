# AWS S3 + CloudFront Setup Guide for DigiSence Media Uploads

This guide provides step-by-step instructions to set up AWS S3 and CloudFront for replacing Cloudinary in your DigiSence project.

## Prerequisites

1. **AWS Account**: Create an AWS account at https://aws.amazon.com/
2. **Enable Billing**: Set up billing and add a payment method
3. **AWS CLI** (optional): Install AWS CLI for easier management

## Step 1: Create IAM User with S3 and CloudFront Permissions

1. Go to AWS IAM Console: https://console.aws.amazon.com/iam/
2. Click "Users" → "Create user"
3. User name: `digisence-media-user`
4. Select "Attach policies directly"
5. Attach these policies:
   - `AmazonS3FullAccess`
   - `CloudFrontFullAccess`
6. Create user and save the Access Key ID and Secret Access Key

## Step 2: Create S3 Bucket

1. Go to S3 Console: https://console.aws.amazon.com/s3/
2. Click "Create bucket"
3. Bucket name: `digisence-uploads` (must be globally unique)
4. AWS Region: `Asia Pacific (Mumbai) ap-south-1`
5. **Block Public Access settings**:
   - Uncheck "Block all public access" (we'll use CloudFront for access)
6. **CORS configuration** (under Permissions tab after creation):
   ```json
   [
       {
           "AllowedHeaders": ["*"],
           "AllowedMethods": ["GET", "PUT", "POST"],
           "AllowedOrigins": ["*"],
           "ExposeHeaders": []
       }
   ]
   ```

## Step 3: Create CloudFront Distribution

1. Go to CloudFront Console: https://console.aws.amazon.com/cloudfront/
2. Click "Create distribution"
3. **Origin settings**:
   - Origin domain: Select your S3 bucket
   - Origin access: Select "Origin access control settings (recommended)"
   - Create new OAC and grant read permissions
4. **Default cache behavior**:
   - Viewer protocol policy: "Redirect HTTP to HTTPS"
   - Allowed HTTP methods: "GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE"
5. **Cache key and origin requests**:
   - Cache policy: "CachingOptimized"
6. **Function associations** (optional - for advanced optimization):
   - Add Lambda@Edge functions if needed
7. Create distribution and note the distribution domain (e.g., `d1234567890.cloudfront.net`)

## Step 4: Configure CloudFront Behaviors for Optimization

1. Go to your CloudFront distribution
2. Click "Behaviors" tab → "Create behavior"
3. **Path pattern**: `resize/w_*/h_*/*` (for image resizing)
4. **Origin and origin groups**: Select your S3 origin
5. **Cache policy**: Create custom policy with query strings allowed
6. **Origin request policy**: Create policy to forward query parameters
7. Add similar behaviors for video optimization:
   - `video/w_*/h_*/*`
   - `video/br_*/*`

## Step 5: Update Environment Variables

Update your `.env` file with the AWS credentials:

```env
# AWS S3 Configuration (Media Upload & Storage)
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=digisence-uploads
AWS_CLOUDFRONT_URL=https://your-distribution-id.cloudfront.net
```

## Step 6: Test the Setup

1. Start your Next.js application
2. Try uploading an image through your upload endpoints:
   - `POST /api/upload`
   - `POST /api/business/upload`
3. Verify files are uploaded to S3
4. Test CloudFront URLs for optimization:
   - Original: `https://your-distribution.cloudfront.net/bdpp-uploads/image.jpg`
   - Resized: `https://your-distribution.cloudfront.net/resize/w_300,h_200/bdpp-uploads/image.jpg`

## Cost Estimation

### AWS Free Tier (First 12 months)
- **S3 Storage**: 5GB free
- **S3 Requests**: 20,000 GET + 2,000 PUT requests free
- **CloudFront Data Transfer**: 1TB free (to internet)
- **CloudFront Requests**: 10,000,000 requests free

### After Free Tier (ap-south-1 region)
- **S3 Storage**: $0.023 per GB/month
- **S3 Standard-IA**: $0.0125 per GB/month (cheaper for infrequently accessed data)
- **S3 Requests**: $0.005 per 1,000 requests (GET/PUT/POST)
- **CloudFront Data Transfer**:
  - First 10TB: $0.085 per GB
  - Next 40TB: $0.080 per GB
  - Next 100TB: $0.060 per GB
- **CloudFront Requests**: $0.009 per 10,000 requests

### Example Cost Scenarios

**Small Application (50GB storage, 500K requests/month, 50GB transfer)**
- S3 Storage: 50GB × $0.023 = $1.15
- S3 Requests: 500K × $0.005/1000 = $2.50
- CloudFront Transfer: 50GB × $0.085 = $4.25
- CloudFront Requests: 500K × $0.009/10K = $0.45
- **Total**: ~$8.35/month

**Medium Application (500GB storage, 5M requests/month, 500GB transfer)**
- S3 Storage: 500GB × $0.023 = $11.50
- S3 Requests: 5M × $0.005/1000 = $25.00
- CloudFront Transfer: 500GB × $0.085 = $42.50
- CloudFront Requests: 5M × $0.009/10K = $4.50
- **Total**: ~$83.50/month

**Large Application (5TB storage, 50M requests/month, 5TB transfer)**
- S3 Storage: 5TB × $0.023 = $115.00
- S3 Requests: 50M × $0.005/1000 = $250.00
- CloudFront Transfer: 5TB × $0.085 = $425.00
- CloudFront Requests: 50M × $0.009/10K = $45.00
- **Total**: ~$835.00/month

### Cost Optimization Tips
1. **Use S3 Storage Classes**: Move old data to Standard-IA or Glacier
2. **Compress Images**: Reduce file sizes before upload
3. **Cache Effectively**: Use appropriate CloudFront cache settings
4. **Monitor Usage**: Set up billing alerts in AWS
5. **Data Transfer**: Keep users in same region to reduce transfer costs

## Security Best Practices

1. **Use IAM roles** instead of access keys in production
2. **Enable S3 versioning** for backup
3. **Set up CloudTrail** for audit logging
4. **Use signed URLs** for private content if needed
5. **Regular credential rotation**

## Troubleshooting

### Upload Fails
- Check AWS credentials in `.env`
- Verify S3 bucket permissions
- Check CloudWatch logs for errors

### CloudFront Not Serving Content
- Wait for distribution deployment (15-30 minutes)
- Check origin access control settings
- Verify S3 bucket CORS configuration

### Optimization Not Working
- Ensure CloudFront behaviors are correctly configured
- Check that URLs match the path patterns
- Verify Lambda@Edge functions if used

## Migration Notes

- All existing Cloudinary URLs will break - plan for data migration
- File structure maintained: `bdpp-uploads/` and `bdpp-business/{id}/`
- Video optimization now uses CloudFront behaviors instead of eager transformations
- Remove all Cloudinary-related code after testing

## Support

For AWS support, visit: https://aws.amazon.com/support/
For CloudFront documentation: https://docs.aws.amazon.com/AmazonCloudFront/
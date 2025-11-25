# DigiSence API Documentation

This document provides comprehensive documentation for all API endpoints in the DigiSence system.

## Table of Contents
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
  - [Root API](#root-api)
  - [Authentication](#authentication-1)
  - [Admin APIs](#admin-apis)
  - [Business APIs](#business-apis)
  - [Public APIs](#public-apis)
- [Testing Instructions](#testing-instructions)

## Authentication

The API uses JWT-based authentication with cookies. Authentication is required for most endpoints.

### Roles
- `SUPER_ADMIN`: Full system access
- `BUSINESS_ADMIN`: Business-specific access

### Authentication Headers
- `Authorization: Bearer <token>` (optional, token can also be in cookies)
- Cookie: `auth-token=<token>`

## API Endpoints

### Root API

#### GET /api
- **Description**: Basic API health check
- **Authentication**: None
- **Response**: `{ "message": "Hello, world!" }`

#### GET /api/health
- **Description**: Comprehensive system health check
- **Authentication**: None
- **Response**: Detailed health report with status of database and key APIs
- **Response Format**:
  ```json
  {
    "status": "healthy|unhealthy",
    "timestamp": "ISO string",
    "uptime": number,
    "version": "string",
    "checks": [
      {
        "service": "string",
        "status": "healthy|unhealthy",
        "responseTime": number,
        "error": "string (optional)",
        "details": object
      }
    ],
    "summary": {
      "total": number,
      "healthy": number,
      "unhealthy": number
    }
  }
  ```
- **Testing**: `curl http://localhost:3000/api/health`

### Authentication

#### POST /api/auth/login
- **Description**: User login
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "email": "string (email)",
    "password": "string (min 6 chars)"
  }
  ```
- **Response**: User object with token
- **Testing**: `curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"password123"}'`

#### POST /api/auth/logout
- **Description**: User logout
- **Authentication**: Required
- **Response**: `{ "message": "Logged out successfully" }`
- **Testing**: `curl -X POST http://localhost:3000/api/auth/logout -H "Cookie: auth-token=<token>"`

#### GET /api/auth/me
- **Description**: Get current user info
- **Authentication**: Required
- **Response**: User object
- **Testing**: `curl http://localhost:3000/api/auth/me -H "Cookie: auth-token=<token>"`

### Admin APIs

#### GET /api/admin/businesses
- **Description**: Get all businesses (admin view)
- **Authentication**: SUPER_ADMIN required
- **Response**: Array of businesses with admin and category info
- **Testing**: `curl http://localhost:3000/api/admin/businesses -H "Cookie: auth-token=<super_admin_token>"`

#### POST /api/admin/businesses
- **Description**: Create new business
- **Authentication**: SUPER_ADMIN required
- **Request Body**:
  ```json
  {
    "name": "string (min 2)",
    "email": "string (email)",
    "password": "string (min 6)",
    "adminName": "string (min 2)",
    "categoryId": "string (optional)",
    "description": "string (optional)",
    "address": "string (optional)",
    "phone": "string (optional)",
    "website": "string (optional)"
  }
  ```
- **Response**: Created business with login credentials
- **Testing**: `curl -X POST http://localhost:3000/api/admin/businesses -H "Content-Type: application/json" -H "Cookie: auth-token=<super_admin_token>" -d '{"name":"Test Business","email":"business@example.com","password":"password123","adminName":"Admin User"}'`

#### PUT /api/admin/businesses
- **Description**: Toggle business active status
- **Authentication**: SUPER_ADMIN required
- **Query Parameters**: `id=<business_id>`
- **Request Body**: `{ "isActive": boolean }`
- **Response**: Updated business
- **Testing**: `curl -X PUT "http://localhost:3000/api/admin/businesses?id=<business_id>" -H "Content-Type: application/json" -H "Cookie: auth-token=<super_admin_token>" -d '{"isActive":true}'`

#### DELETE /api/admin/businesses
- **Description**: Delete business
- **Authentication**: SUPER_ADMIN required
- **Query Parameters**: `id=<business_id>`
- **Response**: Success message
- **Testing**: `curl -X DELETE "http://localhost:3000/api/admin/businesses?id=<business_id>" -H "Cookie: auth-token=<super_admin_token>"`

#### POST /api/admin/businesses/[id]
- **Description**: Update business details
- **Authentication**: SUPER_ADMIN required
- **Request Body**: Business update data (partial)
- **Response**: Updated business
- **Testing**: `curl -X POST http://localhost:3000/api/admin/businesses/<business_id> -H "Content-Type: application/json" -H "Cookie: auth-token=<super_admin_token>" -d '{"name":"Updated Name"}'`

#### DELETE /api/admin/businesses/[id]
- **Description**: Delete business by ID
- **Authentication**: SUPER_ADMIN required
- **Response**: Success message
- **Testing**: `curl -X DELETE http://localhost:3000/api/admin/businesses/<business_id> -H "Cookie: auth-token=<super_admin_token>"`

#### PUT /api/admin/businesses/[id]
- **Description**: Toggle business active status by ID
- **Authentication**: SUPER_ADMIN required
- **Request Body**: `{ "isActive": boolean }`
- **Response**: Updated business
- **Testing**: `curl -X PUT http://localhost:3000/api/admin/businesses/<business_id> -H "Content-Type: application/json" -H "Cookie: auth-token=<super_admin_token>" -d '{"isActive":true}'`

#### GET /api/admin/categories
- **Description**: Get all business categories
- **Authentication**: SUPER_ADMIN required
- **Response**: Array of categories with counts
- **Testing**: `curl http://localhost:3000/api/admin/categories -H "Cookie: auth-token=<super_admin_token>"`

#### POST /api/admin/categories
- **Description**: Create new category
- **Authentication**: SUPER_ADMIN required
- **Request Body**:
  ```json
  {
    "name": "string (min 2)",
    "description": "string (optional)",
    "parentId": "string (optional)"
  }
  ```
- **Response**: Created category
- **Testing**: `curl -X POST http://localhost:3000/api/admin/categories -H "Content-Type: application/json" -H "Cookie: auth-token=<super_admin_token>" -d '{"name":"New Category"}'`

#### PUT /api/admin/categories
- **Description**: Update category
- **Authentication**: SUPER_ADMIN required
- **Query Parameters**: `id=<category_id>`
- **Request Body**: Category update data
- **Response**: Updated category
- **Testing**: `curl -X PUT "http://localhost:3000/api/admin/categories?id=<category_id>" -H "Content-Type: application/json" -H "Cookie: auth-token=<super_admin_token>" -d '{"name":"Updated Category"}'`

#### DELETE /api/admin/categories
- **Description**: Delete category
- **Authentication**: SUPER_ADMIN required
- **Query Parameters**: `id=<category_id>`
- **Response**: Success message
- **Testing**: `curl -X DELETE "http://localhost:3000/api/admin/categories?id=<category_id>" -H "Cookie: auth-token=<super_admin_token>"`

#### PUT /api/admin/categories/[id]
- **Description**: Update category by ID
- **Authentication**: SUPER_ADMIN required
- **Request Body**: Category update data
- **Response**: Updated category
- **Testing**: `curl -X PUT http://localhost:3000/api/admin/categories/<category_id> -H "Content-Type: application/json" -H "Cookie: auth-token=<super_admin_token>" -d '{"name":"Updated Category"}'`

#### DELETE /api/admin/categories/[id]
- **Description**: Delete category by ID
- **Authentication**: SUPER_ADMIN required
- **Response**: Success message
- **Testing**: `curl -X DELETE http://localhost:3000/api/admin/categories/<category_id> -H "Cookie: auth-token=<super_admin_token>"`

#### POST /api/admin/password-reset
- **Description**: Reset business admin password
- **Authentication**: SUPER_ADMIN required
- **Request Body**: `{ "newPassword": "string (min 6)" }`
- **Response**: Success message
- **Testing**: `curl -X POST http://localhost:3000/api/admin/password-reset -H "Content-Type: application/json" -H "Cookie: auth-token=<super_admin_token>" -d '{"newPassword":"newpassword123"}'`

### Business APIs

#### GET /api/business
- **Description**: Get business profile
- **Authentication**: BUSINESS_ADMIN required
- **Response**: Business details with content
- **Testing**: `curl http://localhost:3000/api/business -H "Cookie: auth-token=<business_admin_token>"`

#### PUT /api/business
- **Description**: Update business profile (rate limited)
- **Authentication**: BUSINESS_ADMIN required
- **Request Body**: Business update data (extensive schema)
- **Response**: Updated business
- **Testing**: `curl -X PUT http://localhost:3000/api/business -H "Content-Type: application/json" -H "Cookie: auth-token=<business_admin_token>" -d '{"name":"Updated Business"}'`

#### POST /api/business
- **Description**: Reset business admin password
- **Authentication**: BUSINESS_ADMIN required
- **Request Body**: `{ "newPassword": "string (min 6)" }`
- **Response**: Success message with new password
- **Testing**: `curl -X POST http://localhost:3000/api/business -H "Content-Type: application/json" -H "Cookie: auth-token=<business_admin_token>" -d '{"newPassword":"newpassword123"}'`

#### GET /api/business/categories
- **Description**: Get business product categories
- **Authentication**: BUSINESS_ADMIN required
- **Response**: Array of product categories
- **Testing**: `curl http://localhost:3000/api/business/categories -H "Cookie: auth-token=<business_admin_token>"`

#### POST /api/business/categories
- **Description**: Create product category
- **Authentication**: BUSINESS_ADMIN required
- **Request Body**:
  ```json
  {
    "name": "string (min 2)",
    "description": "string (optional)",
    "parentId": "string (optional)"
  }
  ```
- **Response**: Created category
- **Testing**: `curl -X POST http://localhost:3000/api/business/categories -H "Content-Type: application/json" -H "Cookie: auth-token=<business_admin_token>" -d '{"name":"New Product Category"}'`

#### PUT /api/business/categories
- **Description**: Update product category
- **Authentication**: BUSINESS_ADMIN required
- **Query Parameters**: `id=<category_id>`
- **Request Body**: Category update data
- **Response**: Updated category
- **Testing**: `curl -X PUT "http://localhost:3000/api/business/categories?id=<category_id>" -H "Content-Type: application/json" -H "Cookie: auth-token=<business_admin_token>" -d '{"name":"Updated Category"}'`

#### DELETE /api/business/categories
- **Description**: Delete product category
- **Authentication**: BUSINESS_ADMIN required
- **Query Parameters**: `id=<category_id>`
- **Response**: Success message
- **Testing**: `curl -X DELETE "http://localhost:3000/api/business/categories?id=<category_id>" -H "Cookie: auth-token=<business_admin_token>"`

#### GET /api/business/inquiries
- **Description**: Get business inquiries
- **Authentication**: BUSINESS_ADMIN required
- **Query Parameters**: `status=<status>` (optional)
- **Response**: Array of inquiries
- **Testing**: `curl "http://localhost:3000/api/business/inquiries?status=NEW" -H "Cookie: auth-token=<business_admin_token>"`

#### PUT /api/business/inquiries/[id]
- **Description**: Update inquiry status
- **Authentication**: BUSINESS_ADMIN required
- **Request Body**: `{ "status": "NEW|READ|REPLIED|CLOSED" }`
- **Response**: Updated inquiry
- **Testing**: `curl -X PUT http://localhost:3000/api/business/inquiries/<inquiry_id> -H "Content-Type: application/json" -H "Cookie: auth-token=<business_admin_token>" -d '{"status":"READ"}'`

#### GET /api/business/products
- **Description**: Get business products
- **Authentication**: BUSINESS_ADMIN required
- **Response**: Array of products
- **Testing**: `curl http://localhost:3000/api/business/products -H "Cookie: auth-token=<business_admin_token>"`

#### POST /api/business/products
- **Description**: Create product
- **Authentication**: BUSINESS_ADMIN required
- **Request Body**:
  ```json
  {
    "name": "string (min 2)",
    "description": "string (optional)",
    "price": "string (optional)",
    "image": "string (optional)",
    "categoryId": "string (optional)",
    "brandName": "string (optional)",
    "inStock": "boolean (default true)",
    "isActive": "boolean (default true)"
  }
  ```
- **Response**: Created product
- **Testing**: `curl -X POST http://localhost:3000/api/business/products -H "Content-Type: application/json" -H "Cookie: auth-token=<business_admin_token>" -d '{"name":"New Product"}'`

#### PUT /api/business/products
- **Description**: Update product
- **Authentication**: BUSINESS_ADMIN required
- **Query Parameters**: `id=<product_id>`
- **Request Body**: Product update data
- **Response**: Updated product
- **Testing**: `curl -X PUT "http://localhost:3000/api/business/products?id=<product_id>" -H "Content-Type: application/json" -H "Cookie: auth-token=<business_admin_token>" -d '{"name":"Updated Product"}'`

#### DELETE /api/business/products
- **Description**: Delete product
- **Authentication**: BUSINESS_ADMIN required
- **Query Parameters**: `id=<product_id>`
- **Response**: Success message
- **Testing**: `curl -X DELETE "http://localhost:3000/api/business/products?id=<product_id>" -H "Cookie: auth-token=<business_admin_token>"`

#### PUT /api/business/products/[id]
- **Description**: Update product by ID
- **Authentication**: BUSINESS_ADMIN required
- **Request Body**: Product update data
- **Response**: Updated product
- **Testing**: `curl -X PUT http://localhost:3000/api/business/products/<product_id> -H "Content-Type: application/json" -H "Cookie: auth-token=<business_admin_token>" -d '{"name":"Updated Product"}'`

#### DELETE /api/business/products/[id]
- **Description**: Delete product by ID
- **Authentication**: BUSINESS_ADMIN required
- **Response**: Success message
- **Testing**: `curl -X DELETE http://localhost:3000/api/business/products/<product_id> -H "Cookie: auth-token=<business_admin_token>"`

#### PUT /api/business/products/[id]/toggle
- **Description**: Toggle product active status
- **Authentication**: BUSINESS_ADMIN required
- **Response**: Updated product
- **Testing**: `curl -X PUT http://localhost:3000/api/business/products/<product_id>/toggle -H "Cookie: auth-token=<business_admin_token>"`

#### GET /api/business/stats
- **Description**: Get business statistics
- **Authentication**: BUSINESS_ADMIN required
- **Response**: Statistics object with products, inquiries, views
- **Testing**: `curl http://localhost:3000/api/business/stats -H "Cookie: auth-token=<business_admin_token>"`

#### POST /api/business/upload
- **Description**: Upload files for business
- **Authentication**: BUSINESS_ADMIN required
- **Request**: Multipart form data with 'file'
- **Response**: Upload result with URL
- **Testing**: `curl -X POST http://localhost:3000/api/business/upload -F "file=@image.jpg" -H "Cookie: auth-token=<business_admin_token>"`

### Public APIs

#### GET /api/businesses
- **Description**: Get businesses (public view)
- **Query Parameters**: `slug=<slug>` or `id=<id>` (optional)
- **Response**: Business details or list of businesses
- **Testing**: `curl "http://localhost:3000/api/businesses?slug=test-business"`

#### GET /api/businesses/[id]
- **Description**: Get business details by ID
- **Authentication**: BUSINESS_ADMIN for own business required
- **Response**: Business details
- **Testing**: `curl http://localhost:3000/api/businesses/<business_id> -H "Cookie: auth-token=<business_admin_token>"`

#### PUT /api/businesses/[id]
- **Description**: Update business by ID
- **Authentication**: BUSINESS_ADMIN for own business required
- **Request Body**: Business update data
- **Response**: Updated business
- **Testing**: `curl -X PUT http://localhost:3000/api/businesses/<business_id> -H "Content-Type: application/json" -H "Cookie: auth-token=<business_admin_token>" -d '{"name":"Updated Business"}'`

#### GET /api/businesses/[id]/inquiries
- **Description**: Get inquiries for business
- **Authentication**: BUSINESS_ADMIN for own business required
- **Response**: Array of inquiries
- **Testing**: `curl http://localhost:3000/api/businesses/<business_id>/inquiries -H "Cookie: auth-token=<business_admin_token>"`

#### PUT /api/businesses/[id]/inquiries
- **Description**: Update inquiry status
- **Authentication**: BUSINESS_ADMIN for own business required
- **Query Parameters**: `inquiryId=<inquiry_id>`
- **Request Body**: `{ "status": "NEW|READ|REPLIED|CLOSED" }`
- **Response**: Updated inquiry
- **Testing**: `curl -X PUT "http://localhost:3000/api/businesses/<business_id>/inquiries?inquiryId=<inquiry_id>" -H "Content-Type: application/json" -H "Cookie: auth-token=<business_admin_token>" -d '{"status":"READ"}'`

#### PUT /api/businesses/[id]/inquiries/[inquiryId]
- **Description**: Update inquiry status by ID
- **Authentication**: BUSINESS_ADMIN for own business required
- **Request Body**: `{ "status": "NEW|READ|REPLIED|CLOSED" }`
- **Response**: Updated inquiry
- **Testing**: `curl -X PUT http://localhost:3000/api/businesses/<business_id>/inquiries/<inquiry_id> -H "Content-Type: application/json" -H "Cookie: auth-token=<business_admin_token>" -d '{"status":"READ"}'`

#### GET /api/businesses/[id]/products
- **Description**: Get products for business
- **Authentication**: BUSINESS_ADMIN for own business required
- **Response**: Array of products
- **Testing**: `curl http://localhost:3000/api/businesses/<business_id>/products -H "Cookie: auth-token=<business_admin_token>"`

#### POST /api/businesses/[id]/products
- **Description**: Create product for business
- **Authentication**: BUSINESS_ADMIN for own business required
- **Request Body**:
  ```json
  {
    "name": "string (min 2)",
    "description": "string (optional)",
    "image": "string (optional)"
  }
  ```
- **Response**: Created product
- **Testing**: `curl -X POST http://localhost:3000/api/businesses/<business_id>/products -H "Content-Type: application/json" -H "Cookie: auth-token=<business_admin_token>" -d '{"name":"New Product"}'`

#### PUT /api/businesses/[id]/products/[productId]
- **Description**: Update product
- **Authentication**: BUSINESS_ADMIN for own business required
- **Request Body**: Product update data
- **Response**: Updated product
- **Testing**: `curl -X PUT http://localhost:3000/api/businesses/<business_id>/products/<product_id> -H "Content-Type: application/json" -H "Cookie: auth-token=<business_admin_token>" -d '{"name":"Updated Product"}'`

#### DELETE /api/businesses/[id]/products/[productId]
- **Description**: Delete product
- **Authentication**: BUSINESS_ADMIN for own business required
- **Response**: Success message
- **Testing**: `curl -X DELETE http://localhost:3000/api/businesses/<business_id>/products/<product_id> -H "Cookie: auth-token=<business_admin_token>"`

#### PUT /api/businesses/[id]/products/[productId]/toggle
- **Description**: Toggle product active status
- **Authentication**: BUSINESS_ADMIN for own business required
- **Response**: Updated product
- **Testing**: `curl -X PUT http://localhost:3000/api/businesses/<business_id>/products/<product_id>/toggle -H "Cookie: auth-token=<business_admin_token>"`

#### GET /api/categories
- **Description**: Get all categories
- **Authentication**: None
- **Response**: Array of categories
- **Testing**: `curl http://localhost:3000/api/categories`

#### GET /api/brands
- **Description**: Get all brands
- **Authentication**: None
- **Response**: Array of brands
- **Testing**: `curl http://localhost:3000/api/brands`

#### POST /api/brands
- **Description**: Create brand
- **Authentication**: BUSINESS_ADMIN or SUPER_ADMIN required
- **Request Body**:
  ```json
  {
    "name": "string (min 2)",
    "description": "string (optional)",
    "logo": "string (optional)"
  }
  ```
- **Response**: Created brand
- **Testing**: `curl -X POST http://localhost:3000/api/brands -H "Content-Type: application/json" -H "Cookie: auth-token=<admin_token>" -d '{"name":"New Brand"}'`

#### PUT /api/brands
- **Description**: Update brand
- **Authentication**: BUSINESS_ADMIN or SUPER_ADMIN required
- **Request Body**: `{ "id": "string", ...updateData }`
- **Response**: Updated brand
- **Testing**: `curl -X PUT http://localhost:3000/api/brands -H "Content-Type: application/json" -H "Cookie: auth-token=<admin_token>" -d '{"id":"<brand_id>","name":"Updated Brand"}'`

#### DELETE /api/brands
- **Description**: Delete brand
- **Authentication**: BUSINESS_ADMIN or SUPER_ADMIN required
- **Query Parameters**: `id=<brand_id>`
- **Response**: Success message
- **Testing**: `curl -X DELETE "http://localhost:3000/api/brands?id=<brand_id>" -H "Cookie: auth-token=<admin_token>"`

#### GET /api/inquiries
- **Description**: Get all inquiries (admin view)
- **Authentication**: SUPER_ADMIN required
- **Response**: Array of inquiries
- **Testing**: `curl http://localhost:3000/api/inquiries -H "Cookie: auth-token=<super_admin_token>"`

#### POST /api/inquiries
- **Description**: Create inquiry
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "name": "string (min 2)",
    "email": "string (email)",
    "phone": "string (optional)",
    "message": "string (min 10)",
    "businessId": "string",
    "productId": "string (optional)"
  }
  ```
- **Response**: Created inquiry
- **Testing**: `curl -X POST http://localhost:3000/api/inquiries -H "Content-Type: application/json" -d '{"name":"John Doe","email":"john@example.com","message":"Interested in your product","businessId":"<business_id>"}'`

#### GET /api/business-listing-inquiries
- **Description**: Get business listing inquiries
- **Authentication**: SUPER_ADMIN required
- **Response**: Array of business listing inquiries
- **Testing**: `curl http://localhost:3000/api/business-listing-inquiries -H "Cookie: auth-token=<super_admin_token>"`

#### POST /api/business-listing-inquiries
- **Description**: Create business listing inquiry
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "businessName": "string (min 2)",
    "businessDescription": "string (optional)",
    "contactName": "string (min 2)",
    "email": "string (email)",
    "phone": "string (optional)",
    "requirements": "string (min 10)",
    "inquiryType": "string (optional)"
  }
  ```
- **Response**: Created inquiry
- **Testing**: `curl -X POST http://localhost:3000/api/business-listing-inquiries -H "Content-Type: application/json" -d '{"businessName":"My Business","contactName":"John Doe","email":"john@example.com","requirements":"Need a business listing"}'`

#### PUT /api/business-listing-inquiries/[id]
- **Description**: Update business listing inquiry
- **Authentication**: SUPER_ADMIN required
- **Request Body**:
  ```json
  {
    "status": "PENDING|UNDER_REVIEW|APPROVED|REJECTED|COMPLETED (optional)",
    "assignedTo": "string (optional)",
    "notes": "string (optional)"
  }
  ```
- **Response**: Updated inquiry
- **Testing**: `curl -X PUT http://localhost:3000/api/business-listing-inquiries/<inquiry_id> -H "Content-Type: application/json" -H "Cookie: auth-token=<super_admin_token>" -d '{"status":"UNDER_REVIEW"}'`

#### DELETE /api/business-listing-inquiries/[id]
- **Description**: Delete business listing inquiry
- **Authentication**: SUPER_ADMIN required
- **Response**: Success message
- **Testing**: `curl -X DELETE http://localhost:3000/api/business-listing-inquiries/<inquiry_id> -H "Cookie: auth-token=<super_admin_token>"`

#### POST /api/upload
- **Description**: Upload files (general)
- **Authentication**: None
- **Request**: Multipart form data with 'file'
- **Response**: Upload result with URL
- **Testing**: `curl -X POST http://localhost:3000/api/upload -F "file=@image.jpg"`

#### POST /api/notifications
- **Description**: Send notifications (internal)
- **Authentication**: None (internal use)
- **Request Body**:
  ```json
  {
    "type": "inquiry|businessListingInquiry|general",
    "inquiryId": "string (optional)",
    "businessListingInquiryId": "string (optional)",
    "statusUpdate": "boolean (optional)",
    "message": "string (optional)"
  }
  ```
- **Response**: Success status
- **Testing**: `curl -X POST http://localhost:3000/api/notifications -H "Content-Type: application/json" -d '{"type":"inquiry","inquiryId":"<inquiry_id>"}'`

## Testing Instructions

1. **Setup**: Ensure the development server is running on `http://localhost:3000`

2. **Authentication**: For protected endpoints, obtain a token by logging in first:
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"your-email@example.com","password":"your-password"}'
   ```

3. **Use the token**: Include the token in subsequent requests:
   ```bash
   curl -H "Cookie: auth-token=<your-token>" http://localhost:3000/api/protected-endpoint
   ```

4. **Common Test Scenarios**:
   - Test authentication flow
   - Test CRUD operations for businesses, products, categories
   - Test file uploads
   - Test inquiry submissions
   - Test admin operations

5. **Error Handling**: All endpoints return appropriate HTTP status codes and error messages in JSON format.

## Health Check Endpoint

See `/api/health` for comprehensive API health monitoring.
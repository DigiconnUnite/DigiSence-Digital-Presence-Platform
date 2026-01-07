# Dual-Mode Account Creation Workflow Implementation

## Overview

This implementation provides a complete dual-mode account creation workflow for both professionals and businesses in the DigiSence project. The system supports two modes:

1. **Direct Creation**: Super admin creates accounts directly through the dashboard
2. **Request-Based Creation**: Users submit registration requests that require admin approval

## Features Implemented

### 1. Registration Request System
- **Registration Form** (`/register`): Users can submit business or professional registration requests
- **Request Storage**: All requests are stored in the `RegistrationInquiry` database model
- **Status Tracking**: Requests have PENDING, APPROVED, REJECTED, and COMPLETED statuses
- **Email Verification**: Users can check their application status using their email

### 2. Admin Dashboard Integration
- **Registration Requests Section**: New section in admin dashboard for managing requests
- **Approval Workflow**: Admins can approve requests and create accounts
- **Rejection System**: Admins can reject requests with persistent rejection tags
- **Account Creation Sidebar**: Dedicated sidebar for completing account setup from approved requests

### 3. Account Creation System
- **Business Account Creation**: Creates business profiles with admin accounts
- **Professional Account Creation**: Creates professional profiles with admin accounts
- **Automatic Credentials**: Generates secure passwords and sends them via email
- **Email Notifications**: Sends welcome emails with login credentials

## Technical Implementation

### Database Schema Updates

#### RegistrationInquiry Model
```prisma
model RegistrationInquiry {
  id            String               @id @default(cuid()) @map("_id")
  type          RegistrationType
  name          String
  businessName  String?
  location      String?
  email         String
  phone         String?
  status        RegistrationStatus   @default(PENDING)
  createdAt     DateTime             @default(now())
  updatedAt     DateTime             @updatedAt

  @@map("registration_inquiries")
}

enum RegistrationType {
  BUSINESS
  PROFESSIONAL
}

enum RegistrationStatus {
  PENDING
  APPROVED
  REJECTED
  COMPLETED
}
```

### API Endpoints

#### Registration Inquiries API (`/api/registration-inquiries`)
- **GET**: Fetch all registration requests (admin only)
- **POST**: Submit new registration request
- **PUT**: Update request status (admin only)
- **DELETE**: Delete request (admin only)

#### Test Workflow API (`/api/test-workflow`)
- **POST**: Create test data for workflow testing
- **GET**: Fetch test data
- **DELETE**: Clean up test data

### Frontend Components

#### Registration Page (`/register`)
- Toggle between business and professional registration
- Form validation and submission
- Status checking for existing requests
- Visual feedback for different application statuses

#### Admin Dashboard (`/dashboard/admin`)
- Registration requests management section
- Approval/rejection workflow with visual indicators
- Account creation sidebar for completing setups
- Persistent rejection tags with warning icons

## Workflow Process

### Request-Based Creation Flow

1. **User Submits Request**
   - User visits `/register` page
   - Selects business or professional type
   - Fills out registration form
   - Request is stored with PENDING status

2. **Admin Reviews Request**
   - Admin visits `/dashboard/admin` → "Registration Requests"
   - Reviews submitted requests in the table
   - Can see request details and status

3. **Admin Approves Request**
   - Admin clicks "Create Account" button
   - Account creation sidebar opens with pre-filled data
   - Admin can customize account settings
   - System generates secure password
   - Account is created in the database
   - Request status is updated to COMPLETED
   - Welcome email is sent to user

4. **Admin Rejects Request**
   - Admin clicks "Reject" button
   - Request status is updated to REJECTED
   - Rejection is persistent and visible to user
   - User sees rejection status when checking application

5. **User Checks Status**
   - User can visit `/register` to check status
   - System automatically checks for existing requests
   - Different visual feedback based on status:
     - PENDING: Clock icon with "Under Review"
     - APPROVED/COMPLETED: Check icon with "Account Created"
     - REJECTED: X icon with "Application Rejected"

### Direct Creation Flow

1. **Admin Creates Account Directly**
   - Admin visits `/dashboard/admin` → "Businesses" or "Professionals"
   - Clicks "Add New" button
   - Fills out account creation form
   - System creates account with generated credentials
   - Admin can view and manage the account

## Security Features

- **Authentication Required**: All admin operations require super admin authentication
- **Secure Password Generation**: Uses cryptographically secure password generation
- **Email Verification**: Users must provide valid email addresses
- **Status Protection**: Only admins can update request statuses
- **Data Validation**: All inputs are validated using Zod schemas

## Email Notifications

### Account Creation Email
- Welcome message with account type
- Login credentials (email and password)
- Security reminder to change password
- Link to login page
- Professional support contact information

### Email Template Features
- Responsive design
- Brand consistency with DigiSence
- Clear call-to-action buttons
- Security-focused messaging

## UI/UX Features

### Consistent Design
- Uses existing component library (shadcn/ui)
- Consistent color scheme and typography
- Responsive design for mobile and desktop
- Loading states and error handling

### Visual Indicators
- Status badges with appropriate colors
- Icons for different actions and states
- Clear feedback for user actions
- Professional and trustworthy appearance

### User Experience
- Intuitive form layouts
- Clear instructions and labels
- Helpful error messages
- Smooth transitions and animations

## Testing

### Test Data Creation
Use the test workflow API to create sample data:
```bash
POST /api/test-workflow
```

### Test Scenarios
1. Submit registration request
2. Review in admin dashboard
3. Approve and create account
4. Check user status
5. Test rejection workflow
6. Verify email notifications

### Cleanup
Remove test data after testing:
```bash
DELETE /api/test-workflow
```

## Integration Points

### Existing Systems
- **Authentication**: Integrates with existing JWT-based auth
- **Database**: Uses existing Prisma schema and models
- **Email**: Uses existing nodemailer configuration
- **Admin Dashboard**: Extends existing dashboard structure

### Future Enhancements
- **Bulk Operations**: Approve/reject multiple requests at once
- **Custom Categories**: Allow admins to assign custom categories
- **Advanced Filtering**: Filter requests by date, type, status
- **Audit Logs**: Track all admin actions on requests
- **SMS Notifications**: Send SMS notifications in addition to email

## Files Modified/Created

### New Files
- `src/app/api/registration-inquiries/route.ts` - Registration API
- `src/app/api/test-workflow/route.ts` - Test workflow API
- `src/app/register/page.tsx` - Updated registration page

### Modified Files
- `src/app/dashboard/admin/page.tsx` - Enhanced admin dashboard
- `src/lib/email.ts` - Added account creation notifications
- `prisma/schema.prisma` - Added RegistrationInquiry model

## Usage Instructions

### For Users
1. Visit `/register` to submit a registration request
2. Check status by revisiting `/register` or using the status check button
3. Wait for admin approval and check email for credentials

### For Admins
1. Visit `/dashboard/admin` to access the admin panel
2. Navigate to "Registration Requests" section
3. Review pending requests and take appropriate action
4. Use the account creation sidebar for detailed setup
5. Monitor the system for new requests

## Troubleshooting

### Common Issues
1. **Email not received**: Check spam folder and email configuration
2. **Status not updating**: Refresh the page or check network connection
3. **Form validation errors**: Ensure all required fields are filled correctly
4. **Permission errors**: Verify admin authentication and role

### Debug Information
- Check browser console for JavaScript errors
- Review server logs for API errors
- Verify database connections and permissions
- Test email configuration independently

This implementation provides a robust, user-friendly dual-mode account creation system that integrates seamlessly with the existing DigiSence platform while maintaining high standards for security, usability, and maintainability.
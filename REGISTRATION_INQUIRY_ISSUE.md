# Registration Inquiry Issue Analysis

## Problem Description
The POST endpoint `/api/registration-inquiries` is failing with a 500 error due to a PrismaClientValidationError. The error indicates that the `password` argument is missing when attempting to create a new `RegistrationInquiry` record.

## Error Details
- **Endpoint**: POST /api/registration-inquiries
- **Status**: 500 Internal Server Error
- **Error Type**: PrismaClientValidationError
- **Message**: Argument `password` is missing in `db.registrationInquiry.create()` invocation

## Code Analysis
### Route Handler (`src/app/api/registration-inquiries/route.ts`)
- The POST handler validates incoming data using Zod schema (`registrationInquirySchema`)
- The schema does **not** include a `password` field
- When creating the inquiry, the `data` object passed to `db.registrationInquiry.create()` does **not** include a `password` field
- Comment in code: "password will be generated during admin approval"

### Prisma Schema (`prisma/schema.prisma`)
- Model: `RegistrationInquiry`
- Field: `password String` (required, no `?`)
- Comment: "Hashed password"

## Root Cause Hypothesis
The Prisma schema defines `password` as a required field for `RegistrationInquiry`, but the API endpoint does not provide this field during creation. The intended flow appears to be:
1. User submits registration inquiry without password
2. Admin reviews and approves
3. Password is generated/set during approval process

However, the schema enforces `password` as required, causing the validation error.

## Possible Solutions
1. **Make password optional in schema**: Change `password String` to `password String?` in the Prisma schema
2. **Provide placeholder password**: Set a temporary/dummy password during inquiry creation
3. **Update code to handle password**: Modify the API to accept and hash a user-provided password
4. **Separate models**: Use different models for inquiry vs. approved registration

## Validation Needed
- Confirm if password should be required or optional for registration inquiries
- Determine the intended user flow for password handling
- Check if admin approval process properly sets passwords for approved inquiries

## Next Steps
- Add logging to confirm data being passed to Prisma create operation
- Update schema or code based on confirmed requirements
- Test the fix with a sample registration request
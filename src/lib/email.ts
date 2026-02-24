import nodemailer from 'nodemailer'
import {
  generateInquiryEmailTemplate,
  generateProfessionalInquiryEmailTemplate,
  generateWelcomeEmailTemplate,
  generatePasswordResetEmailTemplate,
  generateRegistrationConfirmationTemplate,
  generateRegistrationApprovedTemplate,
  generateRegistrationRejectedTemplate,
  generateBusinessListingInquiryTemplate,
  generateBulkImportTemplate,
  generateStatusChangeTemplate,
  generateTestEmailTemplate,
  generateOTPEmailTemplate,
} from './email-templates'

// Create transporter with environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
})

// Helper to get from address
const getFromAddress = () => process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@digisence.com'

// ============================================
// INQUIRY NOTIFICATIONS
// ============================================

export interface InquiryNotificationData {
  businessName: string
  businessEmail: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  message: string
  productName?: string
  inquiryUrl: string
}

/**
 * Send inquiry notification to business
 */
export const sendInquiryNotification = async (data: InquiryNotificationData): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: getFromAddress(),
      to: data.businessEmail,
      subject: `New Customer Inquiry from ${data.customerName} - DigiSence`,
      html: generateInquiryEmailTemplate({
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        message: data.message,
        productName: data.productName,
        businessName: data.businessName,
        inquiryUrl: data.inquiryUrl,
      }),
    })
    console.log('Inquiry notification sent to:', data.businessEmail)
    return true
  } catch (error) {
    console.error('Error sending inquiry notification:', error)
    return false
  }
}

// ============================================
// PROFESSIONAL INQUIRY NOTIFICATIONS
// ============================================

export interface ProfessionalInquiryNotificationData {
  professionalName: string
  professionalEmail: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  message: string
  serviceName?: string
  inquiryUrl: string
}

/**
 * Send inquiry notification to professional
 */
export const sendProfessionalInquiryNotification = async (data: ProfessionalInquiryNotificationData): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: getFromAddress(),
      to: data.professionalEmail,
      subject: `New Service Inquiry from ${data.customerName} - DigiSence`,
      html: generateProfessionalInquiryEmailTemplate({
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        message: data.message,
        serviceName: data.serviceName,
        professionalName: data.professionalName,
        inquiryUrl: data.inquiryUrl,
      }),
    })
    console.log('Professional inquiry notification sent to:', data.professionalEmail)
    return true
  } catch (error) {
    console.error('Error sending professional inquiry notification:', error)
    return false
  }
}

// ============================================
// ACCOUNT CREATION / WELCOME EMAILS
// ============================================

export interface AccountCreationData {
  name: string
  email: string
  password: string
  accountType: 'business' | 'professional'
  loginUrl: string
}

/**
 * Send welcome email with login credentials
 */
export const sendAccountCreationNotification = async (data: AccountCreationData): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: getFromAddress(),
      to: data.email,
      subject: `Welcome to DigiSence - Your ${data.accountType === 'business' ? 'Business' : 'Professional'} Account is Ready`,
      html: generateWelcomeEmailTemplate({
        name: data.name,
        email: data.email,
        password: data.password,
        accountType: data.accountType,
        loginUrl: data.loginUrl,
      }),
    })
    console.log('Account creation email sent to:', data.email)
    return true
  } catch (error) {
    console.error('Error sending account creation email:', error)
    return false
  }
}

// ============================================
// REGISTRATION EMAILS
// ============================================

export interface RegistrationConfirmationData {
  name: string
  email: string
  accountType: 'business' | 'professional'
}

/**
 * Send registration confirmation (pending review)
 */
export const sendRegistrationConfirmation = async (data: RegistrationConfirmationData): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: getFromAddress(),
      to: data.email,
      subject: `Registration Received - DigiSence`,
      html: generateRegistrationConfirmationTemplate({
        name: data.name,
        email: data.email,
        accountType: data.accountType,
      }),
    })
    console.log('Registration confirmation sent to:', data.email)
    return true
  } catch (error) {
    console.error('Error sending registration confirmation:', error)
    return false
  }
}

export interface RegistrationApprovedData {
  name: string
  email: string
  password: string
  accountType: 'business' | 'professional'
  loginUrl: string
}

/**
 * Send registration approved email with credentials
 */
export const sendRegistrationApproved = async (data: RegistrationApprovedData): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: getFromAddress(),
      to: data.email,
      subject: `Congratulations! Your DigiSence Account is Approved`,
      html: generateRegistrationApprovedTemplate({
        name: data.name,
        email: data.email,
        password: data.password,
        accountType: data.accountType,
        loginUrl: data.loginUrl,
      }),
    })
    console.log('Registration approved email sent to:', data.email)
    return true
  } catch (error) {
    console.error('Error sending registration approved email:', error)
    return false
  }
}

export interface RegistrationRejectedData {
  name: string
  email: string
  reason?: string
}

/**
 * Send registration rejected email
 */
export const sendRegistrationRejected = async (data: RegistrationRejectedData): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: getFromAddress(),
      to: data.email,
      subject: `Registration Update - DigiSence`,
      html: generateRegistrationRejectedTemplate({
        name: data.name,
        email: data.email,
        reason: data.reason,
      }),
    })
    console.log('Registration rejected email sent to:', data.email)
    return true
  } catch (error) {
    console.error('Error sending registration rejected email:', error)
    return false
  }
}

// ============================================
// PASSWORD RESET
// ============================================

export interface PasswordResetData {
  name: string
  email: string
  resetUrl: string
}

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email: string, token: string): Promise<boolean> => {
  try {
    // Get user name from database if needed, or use generic
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://mydigisence.com'}/reset-password?token=${token}`
    
    await transporter.sendMail({
      from: getFromAddress(),
      to: email,
      subject: 'Reset Your Password - DigiSence',
      html: generatePasswordResetEmailTemplate({
        name: email.split('@')[0], // Use email prefix as name
        resetUrl,
      }),
    })
    console.log('Password reset email sent to:', email)
    return true
  } catch (error) {
    console.error('Error sending password reset email:', error)
    return false
  }
}

// ============================================
// OTP EMAILS
// ============================================

export interface OTPEmailData {
  name: string
  email: string
  otp: string
  purpose: 'password_reset' | 'email_verification' | 'login_verification'
  expiryMinutes?: number
}

/**
 * Send OTP email for password reset, email verification, or login verification
 */
export const sendOTPEmail = async (data: OTPEmailData): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: getFromAddress(),
      to: data.email,
      subject: data.purpose === 'password_reset' 
        ? 'Your Password Reset Code - DigiSence'
        : data.purpose === 'email_verification'
        ? 'Verify Your Email - DigiSence'
        : 'Your Login Verification Code - DigiSence',
      html: generateOTPEmailTemplate({
        name: data.name,
        otp: data.otp,
        purpose: data.purpose,
        expiryMinutes: data.expiryMinutes,
      }),
    })
    console.log(`OTP email (${data.purpose}) sent to:`, data.email)
    return true
  } catch (error) {
    console.error('Error sending OTP email:', error)
    return false
  }
}

// ============================================
// BUSINESS LISTING INQUIRY (ADMIN)
// ============================================

export interface BusinessListingInquiryData {
  adminEmail: string
  businessName: string
  businessDescription?: string
  contactName: string
  email: string
  phone?: string
  requirements: string
  inquiryUrl: string
}

/**
 * Send business listing inquiry notification to admin
 */
export const sendBusinessListingInquiryNotification = async (data: BusinessListingInquiryData): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: getFromAddress(),
      to: data.adminEmail,
      subject: `New Business Listing Inquiry from ${data.businessName} - DigiSence`,
      html: generateBusinessListingInquiryTemplate({
        businessName: data.businessName,
        businessDescription: data.businessDescription,
        contactName: data.contactName,
        email: data.email,
        phone: data.phone,
        requirements: data.requirements,
        inquiryUrl: data.inquiryUrl,
      }),
    })
    console.log('Business listing inquiry notification sent to:', data.adminEmail)
    return true
  } catch (error) {
    console.error('Error sending business listing inquiry notification:', error)
    return false
  }
}

// ============================================
// BULK IMPORT NOTIFICATIONS
// ============================================

export interface BulkImportNotificationData {
  adminEmail: string
  successCount: number
  failedCount: number
  failedRows?: any[]
  importType: 'business' | 'professional'
  adminUrl: string
}

/**
 * Send bulk import results notification to admin
 */
export const sendBulkImportNotification = async (data: BulkImportNotificationData): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: getFromAddress(),
      to: data.adminEmail,
      subject: `Bulk ${data.importType === 'business' ? 'Business' : 'Professional'} Import Complete - DigiSence`,
      html: generateBulkImportTemplate({
        successCount: data.successCount,
        failedCount: data.failedCount,
        failedRows: data.failedRows,
        importType: data.importType,
        adminUrl: data.adminUrl,
      }),
    })
    console.log('Bulk import notification sent to:', data.adminEmail)
    return true
  } catch (error) {
    console.error('Error sending bulk import notification:', error)
    return false
  }
}

// ============================================
// STATUS CHANGE NOTIFICATIONS
// ============================================

export interface StatusChangeNotificationData {
  name: string
  email: string
  entityType: 'business' | 'professional'
  entityName: string
  oldStatus: string
  newStatus: string
  adminName?: string
  reason?: string
  dashboardUrl: string
}

/**
 * Send status change notification to user
 */
export const sendStatusChangeNotification = async (data: StatusChangeNotificationData): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: getFromAddress(),
      to: data.email,
      subject: `Account Status Update - DigiSence`,
      html: generateStatusChangeTemplate({
        name: data.name,
        email: data.email,
        entityType: data.entityType,
        entityName: data.entityName,
        oldStatus: data.oldStatus,
        newStatus: data.newStatus,
        adminName: data.adminName,
        reason: data.reason,
        dashboardUrl: data.dashboardUrl,
      }),
    })
    console.log('Status change notification sent to:', data.email)
    return true
  } catch (error) {
    console.error('Error sending status change notification:', error)
    return false
  }
}

// ============================================
// TEST EMAIL
// ============================================

export interface TestEmailData {
  email: string
}

/**
 * Send test email to verify SMTP configuration
 */
export const sendTestEmail = async (data: TestEmailData): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    // Verify connection first
    await transporter.verify()
    
    const info = await transporter.sendMail({
      from: getFromAddress(),
      to: data.email,
      subject: 'SMTP Test - DigiSence',
      html: generateTestEmailTemplate({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || '587',
        secure: process.env.SMTP_SECURE || 'false',
        from: getFromAddress(),
      }),
    })
    console.log('Test email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending test email:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// ============================================
// EXPORTS
// ============================================

export default transporter

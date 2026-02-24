/**
 * Email Templates for DigiSence
 * 
 * This module provides consistent email templates that match
 * the website's design with the Archivo font and primary blue/cyan color scheme.
 * 
 * Color Scheme:
 * - Primary: #0ea5e9 (Sky Blue)
 * - Secondary: #0f172a (Dark Slate)
 * - Background: #ffffff
 * - Text: #1e293b
 * 
 * Font: Archivo (matches website)
 */

export const emailStyles = {
  fontFamily: '"Archivo", Arial, sans-serif',
  primaryColor: '#0ea5e9',
  secondaryColor: '#0f172a',
  textColor: '#1e293b',
  mutedColor: '#64748b',
  backgroundColor: '#f8fafc',
  borderColor: '#e2e8f0',
};

/**
 * Base email template with consistent styling
 */
export const baseEmailTemplate = (content: string, footer?: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DigiSence</title>
  <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; font-family: ${emailStyles.fontFamily}; background-color: ${emailStyles.backgroundColor};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${emailStyles.backgroundColor}; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          <!-- Header -->
          <tr>
            <td style="padding: 30px 40px; border-bottom: 1px solid ${emailStyles.borderColor};">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: ${emailStyles.secondaryColor};">
                      Digi<span style="color: ${emailStyles.primaryColor};">Sense</span>
                    </h1>
                    <p style="margin: 5px 0 0 0; font-size: 14px; color: ${emailStyles.mutedColor};">
                      Digital Presence Platform
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid ${emailStyles.borderColor}; background-color: ${emailStyles.backgroundColor}; border-radius: 0 0 12px 12px;">
              ${footer || `
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center">
                      <p style="margin: 0; font-size: 13px; color: ${emailStyles.mutedColor};">
                        &copy; ${new Date().getFullYear()} DigiSence. All rights reserved.
                      </p>
                      <p style="margin: 8px 0 0 0; font-size: 12px; color: ${emailStyles.mutedColor};">
                        Digiconn Unite Pvt Ltd
                      </p>
                      <p style="margin: 15px 0 0 0; font-size: 12px; color: ${emailStyles.mutedColor};">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://mydigisence.com'}" style="color: ${emailStyles.primaryColor}; text-decoration: none;">Visit Website</a> | 
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://mydigisence.com'}/support" style="color: ${emailStyles.primaryColor}; text-decoration: none;">Support</a>
                      </p>
                    </td>
                  </tr>
                </table>
              `}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * Button styles for email
 */
export const buttonStyle = `
  display: inline-block;
  padding: 14px 28px;
  background-color: ${emailStyles.primaryColor};
  color: #ffffff;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 15px;
  margin-top: 20px;
`;

/**
 * Card style for email content
 */
export const cardStyle = `
  background-color: ${emailStyles.backgroundColor};
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  border-left: 4px solid ${emailStyles.primaryColor};
`;

/**
 * Generate inquiry notification email template
 */
export const generateInquiryEmailTemplate = (data: {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  message: string;
  productName?: string;
  businessName: string;
  inquiryUrl: string;
}) => {
  const content = `
    <h2 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 600; color: ${emailStyles.secondaryColor};">
      New Inquiry Received! 📬
    </h2>
    
    <p style="margin: 0 0 20px 0; font-size: 15px; color: ${emailStyles.textColor}; line-height: 1.6;">
      You have received a new inquiry for your business. Here are the details:
    </p>
    
    <div style="${cardStyle}">
      <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: ${emailStyles.secondaryColor};">
        Customer Information
      </h3>
      <p style="margin: 8px 0; font-size: 14px; color: ${emailStyles.textColor};">
        <strong>Name:</strong> ${data.customerName}
      </p>
      <p style="margin: 8px 0; font-size: 14px; color: ${emailStyles.textColor};">
        <strong>Email:</strong> ${data.customerEmail}
      </p>
      ${data.customerPhone ? `
      <p style="margin: 8px 0; font-size: 14px; color: ${emailStyles.textColor};">
        <strong>Phone:</strong> ${data.customerPhone}
      </p>
      ` : ''}
      <p style="margin: 8px 0; font-size: 14px; color: ${emailStyles.textColor};">
        <strong>Product/Service:</strong> ${data.productName || 'General Inquiry'}
      </p>
    </div>
    
    <div style="${cardStyle}">
      <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: ${emailStyles.secondaryColor};">
        Message
      </h3>
      <p style="margin: 0; font-size: 14px; color: ${emailStyles.textColor}; line-height: 1.6; white-space: pre-wrap;">
        ${data.message}
      </p>
    </div>
    
    <p style="margin: 30px 0 10px 0; font-size: 14px; color: ${emailStyles.mutedColor};">
      Please respond to this inquiry as soon as possible to provide the best customer experience.
    </p>
    
    <a href="${data.inquiryUrl}" style="${buttonStyle}">
      View Inquiry Details
    </a>
  `;

  return baseEmailTemplate(content);
};

/**
 * Generate professional inquiry notification email template
 */
export const generateProfessionalInquiryEmailTemplate = (data: {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  message: string;
  serviceName?: string;
  professionalName: string;
  inquiryUrl: string;
}) => {
  const content = `
    <h2 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 600; color: ${emailStyles.secondaryColor};">
      New Service Inquiry! 📬
    </h2>
    
    <p style="margin: 0 0 20px 0; font-size: 15px; color: ${emailStyles.textColor}; line-height: 1.6;">
      You have received a new inquiry for your professional services. Here are the details:
    </p>
    
    <div style="${cardStyle}">
      <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: ${emailStyles.secondaryColor};">
        Customer Information
      </h3>
      <p style="margin: 8px 0; font-size: 14px; color: ${emailStyles.textColor};">
        <strong>Name:</strong> ${data.customerName}
      </p>
      <p style="margin: 8px 0; font-size: 14px; color: ${emailStyles.textColor};">
        <strong>Email:</strong> ${data.customerEmail}
      </p>
      ${data.customerPhone ? `
      <p style="margin: 8px 0; font-size: 14px; color: ${emailStyles.textColor};">
        <strong>Phone:</strong> ${data.customerPhone}
      </p>
      ` : ''}
      ${data.serviceName ? `
      <p style="margin: 8px 0; font-size: 14px; color: ${emailStyles.textColor};">
        <strong>Service:</strong> ${data.serviceName}
      </p>
      ` : ''}
    </div>
    
    <div style="${cardStyle}">
      <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: ${emailStyles.secondaryColor};">
        Message
      </h3>
      <p style="margin: 0; font-size: 14px; color: ${emailStyles.textColor}; line-height: 1.6; white-space: pre-wrap;">
        ${data.message}
      </p>
    </div>
    
    <p style="margin: 30px 0 10px 0; font-size: 14px; color: ${emailStyles.mutedColor};">
      Please respond to this inquiry as soon as possible.
    </p>
    
    <a href="${data.inquiryUrl}" style="${buttonStyle}">
      View Inquiry Details
    </a>
  `;

  return baseEmailTemplate(content);
};

/**
 * Generate account creation / welcome email template
 */
export const generateWelcomeEmailTemplate = (data: {
  name: string;
  email: string;
  password: string;
  accountType: 'business' | 'professional';
  loginUrl: string;
}) => {
  const accountTypeLabel = data.accountType === 'business' ? 'Business' : 'Professional';
  const content = `
    <h2 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 600; color: ${emailStyles.secondaryColor};">
      Welcome to DigiSence! 🎉
    </h2>
    
    <p style="margin: 0 0 20px 0; font-size: 15px; color: ${emailStyles.textColor}; line-height: 1.6;">
      Congratulations! Your ${accountTypeLabel} account has been successfully created. You can now start building your digital presence and connecting with customers.
    </p>
    
    <div style="${cardStyle}">
      <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: ${emailStyles.secondaryColor};">
        Your Account Details
      </h3>
      <p style="margin: 8px 0; font-size: 14px; color: ${emailStyles.textColor};">
        <strong>Name:</strong> ${data.name}
      </p>
      <p style="margin: 8px 0; font-size: 14px; color: ${emailStyles.textColor};">
        <strong>Email:</strong> ${data.email}
      </p>
      <p style="margin: 8px 0; font-size: 14px; color: ${emailStyles.textColor};">
        <strong>Account Type:</strong> ${accountTypeLabel}
      </p>
    </div>
    
    <div style="${cardStyle}">
      <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: ${emailStyles.secondaryColor};">
        🔐 Login Credentials
      </h3>
      <p style="margin: 8px 0; font-size: 14px; color: ${emailStyles.textColor};">
        <strong>Email:</strong> ${data.email}
      </p>
      <p style="margin: 8px 0; font-size: 14px; color: ${emailStyles.textColor};">
        <strong>Password:</strong> ${data.password}
      </p>
    </div>
    
    <div style="background-color: #fef3c7; border-radius: 8px; padding: 15px; margin: 20px 0; border-left: 4px solid #f59e0b;">
      <p style="margin: 0; font-size: 14px; color: #92400e; font-weight: 500;">
        ⚠️ Important: Please change your password after first login for security.
      </p>
    </div>
    
    <h3 style="margin: 30px 0 15px 0; font-size: 16px; font-weight: 600; color: ${emailStyles.secondaryColor};">
      What's Next?
    </h3>
    <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: ${emailStyles.textColor}; line-height: 1.8;">
      <li>Complete your ${accountTypeLabel.toLowerCase()} profile with all relevant details</li>
      <li>Add your products, services, or portfolio items</li>
      <li>Customize your business page to attract customers</li>
      <li>Start responding to inquiries and grow your network</li>
    </ul>
    
    <a href="${data.loginUrl}" style="${buttonStyle}">
      Login to Dashboard
    </a>
  `;

  return baseEmailTemplate(content);
};

/**
 * Generate password reset email template
 */
export const generatePasswordResetEmailTemplate = (data: {
  name: string;
  resetUrl: string;
}) => {
  const content = `
    <h2 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 600; color: ${emailStyles.secondaryColor};">
      Reset Your Password 🔐
    </h2>
    
    <p style="margin: 0 0 20px 0; font-size: 15px; color: ${emailStyles.textColor}; line-height: 1.6;">
      Hi ${data.name},
    </p>
    
    <p style="margin: 0 0 20px 0; font-size: 15px; color: ${emailStyles.textColor}; line-height: 1.6;">
      We received a request to reset your password. Click the button below to create a new password:
    </p>
    
    <a href="${data.resetUrl}" style="${buttonStyle}">
      Reset Password
    </a>
    
    <div style="background-color: #fef3c7; border-radius: 8px; padding: 15px; margin: 20px 0; border-left: 4px solid #f59e0b;">
      <p style="margin: 0; font-size: 14px; color: #92400e; font-weight: 500;">
        ⚠️ This password reset link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have questions.
      </p>
    </div>
    
    <p style="margin: 30px 0 0 0; font-size: 14px; color: ${emailStyles.mutedColor};">
      If the button above doesn't work, copy and paste this link into your browser:<br>
      <a href="${data.resetUrl}" style="color: ${emailStyles.primaryColor}; word-break: break-all;">${data.resetUrl}</a>
    </p>
  `;

  return baseEmailTemplate(content);
};

/**
 * Generate registration submission confirmation email template
 */
export const generateRegistrationConfirmationTemplate = (data: {
  name: string;
  email: string;
  accountType: 'business' | 'professional';
}) => {
  const accountTypeLabel = data.accountType === 'business' ? 'Business' : 'Professional';
  const content = `
    <h2 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 600; color: ${emailStyles.secondaryColor};">
      Registration Received! ✓
    </h2>
    
    <p style="margin: 0 0 20px 0; font-size: 15px; color: ${emailStyles.textColor}; line-height: 1.6;">
      Hi ${data.name},
    </p>
    
    <p style="margin: 0 0 20px 0; font-size: 15px; color: ${emailStyles.textColor}; line-height: 1.6;">
      Thank you for registering your ${accountTypeLabel.toLowerCase()} with DigiSence. We have received your registration request and our team is currently reviewing it.
    </p>
    
    <div style="${cardStyle}">
      <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: ${emailStyles.secondaryColor};">
        Registration Details
      </h3>
      <p style="margin: 8px 0; font-size: 14px; color: ${emailStyles.textColor};">
        <strong>Email:</strong> ${data.email}
      </p>
      <p style="margin: 8px 0; font-size: 14px; color: ${emailStyles.textColor};">
        <strong>Account Type:</strong> ${accountTypeLabel}
      </p>
      <p style="margin: 8px 0; font-size: 14px; color: ${emailStyles.textColor};">
        <strong>Status:</strong> Pending Review
      </p>
    </div>
    
    <p style="margin: 20px 0; font-size: 14px; color: ${emailStyles.mutedColor};">
      Our team typically reviews all registrations within 24 hours. You will receive an email with your login credentials once your registration is approved.
    </p>
    
    <p style="margin: 30px 0 0 0; font-size: 14px; color: ${emailStyles.mutedColor};">
      If you have any questions in the meantime, please contact our support team.
    </p>
  `;

  return baseEmailTemplate(content);
};

/**
 * Generate registration approved email template
 */
export const generateRegistrationApprovedTemplate = (data: {
  name: string;
  email: string;
  password: string;
  accountType: 'business' | 'professional';
  loginUrl: string;
}) => {
  const accountTypeLabel = data.accountType === 'business' ? 'Business' : 'Professional';
  const content = `
    <h2 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 600; color: ${emailStyles.secondaryColor};">
      🎉 Congratulations! Your Registration is Approved!
    </h2>
    
    <p style="margin: 0 0 20px 0; font-size: 15px; color: ${emailStyles.textColor}; line-height: 1.6;">
      Hi ${data.name},
    </p>
    
    <p style="margin: 0 0 20px 0; font-size: 15px; color: ${emailStyles.textColor}; line-height: 1.6;">
      Great news! Your ${accountTypeLabel.toLowerCase()} registration has been approved. You can now access your dashboard and start building your digital presence.
    </p>
    
    <div style="${cardStyle}">
      <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: ${emailStyles.secondaryColor};">
        🔐 Your Login Credentials
      </h3>
      <p style="margin: 8px 0; font-size: 14px; color: ${emailStyles.textColor};">
        <strong>Email:</strong> ${data.email}
      </p>
      <p style="margin: 8px 0; font-size: 14px; color: ${emailStyles.textColor};">
        <strong>Password:</strong> ${data.password}
      </p>
    </div>
    
    <div style="background-color: #dcfce7; border-radius: 8px; padding: 15px; margin: 20px 0; border-left: 4px solid #22c55e;">
      <p style="margin: 0; font-size: 14px; color: #166534; font-weight: 500;">
        ✓ Your account is now active! Please login and change your password for security.
      </p>
    </div>
    
    <h3 style="margin: 30px 0 15px 0; font-size: 16px; font-weight: 600; color: ${emailStyles.secondaryColor};">
      Getting Started
    </h3>
    <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: ${emailStyles.textColor}; line-height: 1.8;">
      <li>Complete your ${accountTypeLabel.toLowerCase()} profile</li>
      <li>Add your products, services, or portfolio</li>
      <li>Customize your business page</li>
      <li>Start connecting with customers</li>
    </ul>
    
    <a href="${data.loginUrl}" style="${buttonStyle}">
      Login to Dashboard
    </a>
  `;

  return baseEmailTemplate(content);
};

/**
 * Generate registration rejected email template
 */
export const generateRegistrationRejectedTemplate = (data: {
  name: string;
  email: string;
  reason?: string;
}) => {
  const content = `
    <h2 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 600; color: ${emailStyles.secondaryColor};">
      Registration Update 📋
    </h2>
    
    <p style="margin: 0 0 20px 0; font-size: 15px; color: ${emailStyles.textColor}; line-height: 1.6;">
      Hi ${data.name},
    </p>
    
    <p style="margin: 0 0 20px 0; font-size: 15px; color: ${emailStyles.textColor}; line-height: 1.6;">
      Thank you for your interest in DigiSence. After reviewing your registration request, we regret to inform you that we are unable to approve your application at this time.
    </p>
    
    ${data.reason ? `
    <div style="${cardStyle}">
      <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: ${emailStyles.secondaryColor};">
        Reason for Rejection
      </h3>
      <p style="margin: 0; font-size: 14px; color: ${emailStyles.textColor}; line-height: 1.6;">
        ${data.reason}
      </p>
    </div>
    ` : ''}
    
    <p style="margin: 20px 0; font-size: 14px; color: ${emailStyles.mutedColor};">
      If you believe this was a mistake or would like to discuss further, please contact our support team with your registration details.
    </p>
    
    <p style="margin: 30px 0 0 0; font-size: 14px; color: ${emailStyles.mutedColor};">
      We appreciate your understanding and hope to serve you in the future.
    </p>
  `;

  return baseEmailTemplate(content);
};

/**
 * Generate business listing inquiry notification email template (for admin)
 */
export const generateBusinessListingInquiryTemplate = (data: {
  businessName: string;
  businessDescription?: string;
  contactName: string;
  email: string;
  phone?: string;
  requirements: string;
  inquiryUrl: string;
}) => {
  const content = `
    <h2 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 600; color: ${emailStyles.secondaryColor};">
      New Business Listing Inquiry 🏢
    </h2>
    
    <p style="margin: 0 0 20px 0; font-size: 15px; color: ${emailStyles.textColor}; line-height: 1.6;">
      A new business listing inquiry has been submitted. Here are the details:
    </p>
    
    <div style="${cardStyle}">
      <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: ${emailStyles.secondaryColor};">
        Business Information
      </h3>
      <p style="margin: 8px 0; font-size: 14px; color: ${emailStyles.textColor};">
        <strong>Business Name:</strong> ${data.businessName}
      </p>
      ${data.businessDescription ? `
      <p style="margin: 8px 0; font-size: 14px; color: ${emailStyles.textColor};">
        <strong>Description:</strong> ${data.businessDescription}
      </p>
      ` : ''}
    </div>
    
    <div style="${cardStyle}">
      <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: ${emailStyles.secondaryColor};">
        Contact Information
      </h3>
      <p style="margin: 8px 0; font-size: 14px; color: ${emailStyles.textColor};">
        <strong>Contact Name:</strong> ${data.contactName}
      </p>
      <p style="margin: 8px 0; font-size: 14px; color: ${emailStyles.textColor};">
        <strong>Email:</strong> ${data.email}
      </p>
      ${data.phone ? `
      <p style="margin: 8px 0; font-size: 14px; color: ${emailStyles.textColor};">
        <strong>Phone:</strong> ${data.phone}
      </p>
      ` : ''}
    </div>
    
    <div style="${cardStyle}">
      <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: ${emailStyles.secondaryColor};">
        Requirements
      </h3>
      <p style="margin: 0; font-size: 14px; color: ${emailStyles.textColor}; line-height: 1.6; white-space: pre-wrap;">
        ${data.requirements}
      </p>
    </div>
    
    <a href="${data.inquiryUrl}" style="${buttonStyle}">
      View Inquiry Details
    </a>
  `;

  return baseEmailTemplate(content);
};

/**
 * Generate bulk import results email template
 */
export const generateBulkImportTemplate = (data: {
  successCount: number;
  failedCount: number;
  failedRows?: Array<{ row: number; error: string }>;
  importType: 'business' | 'professional';
  adminUrl: string;
}) => {
  const content = `
    <h2 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 600; color: ${emailStyles.secondaryColor};">
      Bulk Import Complete 📊
    </h2>
    
    <p style="margin: 0 0 20px 0; font-size: 15px; color: ${emailStyles.textColor}; line-height: 1.6;">
      Your bulk ${data.importType} import has been completed. Here are the results:
    </p>
    
    <div style="${cardStyle}">
      <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: ${emailStyles.secondaryColor};">
        Import Results
      </h3>
      <p style="margin: 8px 0; font-size: 14px; color: #16a34a; font-weight: 600;">
        ✓ Successfully imported: ${data.successCount} ${data.importType}(s)
      </p>
      ${data.failedCount > 0 ? `
      <p style="margin: 8px 0; font-size: 14px; color: #dc2626; font-weight: 600;">
        ✗ Failed: ${data.failedCount} ${data.importType}(s)
      </p>
      ` : ''}
    </div>
    
    ${data.failedRows && data.failedRows.length > 0 ? `
    <div style="${cardStyle}">
      <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: ${emailStyles.secondaryColor};">
        Failed Rows
      </h3>
      ${data.failedRows.slice(0, 10).map((row: any) => `
      <p style="margin: 5px 0; font-size: 13px; color: ${emailStyles.textColor};">
        <strong>Row ${row.row}:</strong> ${row.error || row.errors?.map((e: any) => e.message).join(', ') || 'Unknown error'}
      </p>
      `).join('')}
      ${data.failedRows.length > 10 ? `
      <p style="margin: 10px 0 0 0; font-size: 13px; color: ${emailStyles.mutedColor};">
        ...and ${data.failedRows.length - 10} more failures
      </p>
      ` : ''}
    </div>
    ` : ''}
    
    <a href="${data.adminUrl}" style="${buttonStyle}">
      View in Dashboard
    </a>
  `;

  return baseEmailTemplate(content);
};

/**
 * Generate account status change notification email template
 */
export const generateStatusChangeTemplate = (data: {
  name: string;
  email: string;
  entityType: 'business' | 'professional';
  entityName: string;
  oldStatus: string;
  newStatus: string;
  adminName?: string;
  reason?: string;
  dashboardUrl: string;
}) => {
  const statusColor = data.newStatus === 'ACTIVE' ? '#16a34a' : '#dc2626';
  const content = `
    <h2 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 600; color: ${emailStyles.secondaryColor};">
      Account Status Update 📋
    </h2>
    
    <p style="margin: 0 0 20px 0; font-size: 15px; color: ${emailStyles.textColor}; line-height: 1.6;">
      Hi ${data.name},
    </p>
    
    <p style="margin: 0 0 20px 0; font-size: 15px; color: ${emailStyles.textColor}; line-height: 1.6;">
      Your ${data.entityType} account status has been updated. Here are the details:
    </p>
    
    <div style="${cardStyle}">
      <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: ${emailStyles.secondaryColor};">
        Status Change
      </h3>
      <p style="margin: 8px 0; font-size: 14px; color: ${emailStyles.textColor};">
        <strong>${data.entityType === 'business' ? 'Business' : 'Professional'} Name:</strong> ${data.entityName}
      </p>
      <p style="margin: 8px 0; font-size: 14px; color: ${emailStyles.textColor};">
        <strong>Previous Status:</strong> ${data.oldStatus}
      </p>
      <p style="margin: 8px 0; font-size: 14px; color: ${emailStyles.textColor};">
        <strong>New Status:</strong> <span style="color: ${statusColor}; font-weight: 600;">${data.newStatus}</span>
      </p>
      ${data.adminName ? `
      <p style="margin: 8px 0; font-size: 14px; color: ${emailStyles.textColor};">
        <strong>Updated By:</strong> ${data.adminName}
      </p>
      ` : ''}
      ${data.reason ? `
      <p style="margin: 8px 0; font-size: 14px; color: ${emailStyles.textColor};">
        <strong>Reason:</strong> ${data.reason}
      </p>
      ` : ''}
    </div>
    
    <p style="margin: 20px 0; font-size: 14px; color: ${emailStyles.mutedColor};">
      ${data.newStatus === 'ACTIVE' 
        ? 'Great news! Your account is now active and visible to customers.' 
        : 'Your account has been deactivated. Please contact support for more information.'}
    </p>
    
    <a href="${data.dashboardUrl}" style="${buttonStyle}">
      View Dashboard
    </a>
  `;

  return baseEmailTemplate(content);
};

/**
 * Generate test email template
 */
export const generateTestEmailTemplate = (data: {
  host: string;
  port: string;
  secure: string;
  from: string;
}) => {
  const content = `
    <h2 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 600; color: ${emailStyles.secondaryColor};">
      SMTP Test Successful! ✅
    </h2>
    
    <p style="margin: 0 0 20px 0; font-size: 15px; color: ${emailStyles.textColor}; line-height: 1.6;">
      This is a test email from DigiSence to verify your SMTP configuration is working correctly.
    </p>
    
    <div style="${cardStyle}">
      <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: ${emailStyles.secondaryColor};">
        SMTP Configuration Details
      </h3>
      <p style="margin: 8px 0; font-size: 14px; color: ${emailStyles.textColor};">
        <strong>Host:</strong> ${data.host}
      </p>
      <p style="margin: 8px 0; font-size: 14px; color: ${emailStyles.textColor};">
        <strong>Port:</strong> ${data.port}
      </p>
      <p style="margin: 8px 0; font-size: 14px; color: ${emailStyles.textColor};">
        <strong>Secure:</strong> ${data.secure}
      </p>
      <p style="margin: 8px 0; font-size: 14px; color: ${emailStyles.textColor};">
        <strong>From:</strong> ${data.from}
      </p>
    </div>
    
    <div style="background-color: #dcfce7; border-radius: 8px; padding: 15px; margin: 20px 0; border-left: 4px solid #22c55e;">
      <p style="margin: 0; font-size: 14px; color: #166534; font-weight: 500;">
        ✓ Your SMTP configuration is working correctly!
      </p>
    </div>
  `;

  return baseEmailTemplate(content);
};

/**
 * Generate OTP email template for password reset
 */
export const generateOTPEmailTemplate = (data: {
  name: string;
  otp: string;
  purpose: 'password_reset' | 'email_verification' | 'login_verification';
  expiryMinutes?: number;
}) => {
  const purposeText = {
    password_reset: 'reset your password',
    email_verification: 'verify your email address',
    login_verification: 'complete your login'
  }[data.purpose];
  
  const expiryTime = data.expiryMinutes || 10;
  
  const content = `
    <h2 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 600; color: ${emailStyles.secondaryColor};">
      Your Verification Code 🔐
    </h2>
    
    <p style="margin: 0 0 20px 0; font-size: 15px; color: ${emailStyles.textColor}; line-height: 1.6;">
      Hi ${data.name},
    </p>
    
    <p style="margin: 0 0 20px 0; font-size: 15px; color: ${emailStyles.textColor}; line-height: 1.6;">
      We received a request to ${purposeText}. Use the verification code below:
    </p>
    
    <div style="background-color: #f0f9ff; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center; border: 2px solid ${emailStyles.primaryColor};">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: ${emailStyles.mutedColor}; text-transform: uppercase; letter-spacing: 1px;">
        Verification Code
      </p>
      <p style="margin: 0; font-size: 36px; font-weight: 700; color: ${emailStyles.primaryColor}; letter-spacing: 8px; font-family: monospace;">
        ${data.otp}
      </p>
    </div>
    
    <div style="background-color: #fef3c7; border-radius: 8px; padding: 15px; margin: 20px 0; border-left: 4px solid #f59e0b;">
      <p style="margin: 0; font-size: 14px; color: #92400e; font-weight: 500;">
        ⚠️ This code will expire in ${expiryTime} minutes. If you didn't request this, please ignore this email or contact support if you have questions.
      </p>
    </div>
    
    <p style="margin: 30px 0 0 0; font-size: 14px; color: ${emailStyles.mutedColor};">
      For security reasons, never share this code with anyone. Our team will never ask for your verification code.
    </p>
  `;

  return baseEmailTemplate(content);
};

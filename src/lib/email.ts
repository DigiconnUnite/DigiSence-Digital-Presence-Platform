import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

interface InquiryNotificationData {
  businessName: string
  businessEmail: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  message: string
  productName?: string
  inquiryUrl: string
}

interface AccountCreationData {
  name: string
  email: string
  password: string
  accountType: 'business' | 'professional'
  loginUrl: string
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
})

const sendInquiryNotification = async (data: InquiryNotificationData) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: data.businessEmail,
      subject: `New Customer Inquiry from ${data.customerName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #333333; margin-bottom: 20px;">New Customer Inquiry</h1>
            
            <div style="margin-bottom: 20px;">
              <h2 style="color: #333333; margin-bottom: 10px;">Customer Information</h2>
              <p><strong>Name:</strong> ${data.customerName}</p>
              <p><strong>Email:</strong> ${data.customerEmail}</p>
              ${data.customerPhone ? `<p><strong>Phone:</strong> ${data.customerPhone}</p>` : ''}
              <p><strong>Product:</strong> ${data.productName || 'General Inquiry'}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <h2 style="color: #333333; margin-bottom: 10px;">Message</h2>
              <p style="white-space: pre-wrap; background-color: #f8f9fa; padding: 15px; border-radius: 4px;">${data.message}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <h2 style="color: #333333; margin-bottom: 10px;">Business Details</h2>
              <p><strong>Business:</strong> ${data.businessName}</p>
              <p><strong>Email:</strong> ${data.businessEmail}</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${data.inquiryUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Inquiry in Dashboard
              </a>
            </div>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log('Email notification sent to:', data.businessEmail)
  } catch (error) {
    console.error('Error sending email:', error)
  }
}

const sendAccountCreationNotification = async (data: AccountCreationData) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: data.email,
      subject: `Welcome to DigiSence - Your ${data.accountType.charAt(0).toUpperCase() + data.accountType.slice(1)} Account is Ready`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #333333; margin-bottom: 20px;">Welcome to DigiSence!</h1>

            <div style="margin-bottom: 20px;">
              <h2 style="color: #333333; margin-bottom: 10px;">Your Account Details</h2>
              <p><strong>Name:</strong> ${data.name}</p>
              <p><strong>Email:</strong> ${data.email}</p>
              <p><strong>Account Type:</strong> ${data.accountType.charAt(0).toUpperCase() + data.accountType.slice(1)}</p>
            </div>

            <div style="margin-bottom: 20px;">
              <h2 style="color: #333333; margin-bottom: 10px;">Login Credentials</h2>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; border-left: 4px solid #007bff;">
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Password:</strong> ${data.password}</p>
              </div>
              <p style="color: #dc3545; font-size: 14px; margin-top: 10px;">
                <strong>Important:</strong> Please change your password after first login for security.
              </p>
            </div>

            <div style="margin-bottom: 20px;">
              <h2 style="color: #333333; margin-bottom: 10px;">Getting Started</h2>
              <p>You can now access your dashboard to manage your ${data.accountType} profile and services.</p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${data.loginUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Login to Your Dashboard
              </a>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center;">
              <p style="color: #6c757d; font-size: 14px;">
                If you have any questions, please contact our support team.
              </p>
            </div>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log('Account creation email sent to:', data.email)
  } catch (error) {
    console.error('Error sending account creation email:', error)
  }
}

export { sendInquiryNotification, sendAccountCreationNotification }
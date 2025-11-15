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

export { sendInquiryNotification }
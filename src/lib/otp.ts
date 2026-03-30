/**
 * OTP (One-Time Password) Utility
 * 
 * This module provides functions for generating, storing, and verifying OTPs.
 * For production, consider using Redis for OTP storage with TTL support.
 */

import { sendOTPEmail } from './email'

// OTP Configuration
const OTP_LENGTH = 6
const OTP_EXPIRY_MINUTES = 10
const MAX_ATTEMPTS = 3

// In-memory OTP storage (for development - use Redis in production)
// Map<email, { otp: string, expiresAt: number, attempts: number, purpose: string }>
interface OTPEntry {
  otp: string
  expiresAt: number
  attempts: number
  purpose: 'password_reset' | 'email_verification' | 'login_verification'
  createdAt: number
}

const otpStore = new Map<string, OTPEntry>()

/**
 * Generate a random OTP
 */
export const generateOTP = (): string => {
  let otp = ''
  for (let i = 0; i < OTP_LENGTH; i++) {
    otp += Math.floor(Math.random() * 10).toString()
  }
  return otp
}

/**
 * Store OTP for an email
 */
export const storeOTP = (
  email: string,
  otp: string,
  purpose: 'password_reset' | 'email_verification' | 'login_verification'
): void => {
  const expiresAt = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
  
  otpStore.set(email.toLowerCase(), {
    otp,
    expiresAt,
    attempts: 0,
    purpose,
    createdAt: Date.now(),
  })
}

/**
 * Get stored OTP data for an email
 */
export const getOTPData = (email: string): OTPEntry | undefined => {
  return otpStore.get(email.toLowerCase())
}

/**
 * Delete OTP for an email
 */
export const deleteOTP = (email: string): boolean => {
  return otpStore.delete(email.toLowerCase())
}

/**
 * Validate OTP for an email without consuming/deleting it
 * Used for checking OTP validity during verification
 * Returns: { valid: boolean, message: string }
 */
export const validateOTP = (
  email: string,
  otp: string,
  purpose?: 'password_reset' | 'email_verification' | 'login_verification'
): { valid: boolean; message: string } => {
  const normalizedEmail = email.toLowerCase()
  const storedOTP = otpStore.get(normalizedEmail)
  
  if (!storedOTP) {
    return { valid: false, message: 'No OTP found. Please request a new OTP.' }
  }
  
  // Check if OTP has expired
  if (Date.now() > storedOTP.expiresAt) {
    otpStore.delete(normalizedEmail)
    return { valid: false, message: 'OTP has expired. Please request a new OTP.' }
  }
  
  // Check purpose match
  if (purpose && storedOTP.purpose !== purpose) {
    return { valid: false, message: 'Invalid OTP purpose.' }
  }
  
  // Check max attempts
  if (storedOTP.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(normalizedEmail)
    return { valid: false, message: 'Too many failed attempts. Please request a new OTP.' }
  }
  
  // Verify OTP
  if (storedOTP.otp !== otp) {
    storedOTP.attempts++
    return { valid: false, message: `Invalid OTP. ${MAX_ATTEMPTS - storedOTP.attempts} attempts remaining.` }
  }
  
  // OTP is valid - do NOT delete it, just return validation result
  return { valid: true, message: 'OTP verified successfully.' }
}

/**
 * Verify OTP for an email and consume it
 * Used for final password reset - verifies and deletes OTP
 * Returns: { valid: boolean, message: string }
 */
export const verifyOTP = (
  email: string,
  otp: string,
  purpose?: 'password_reset' | 'email_verification' | 'login_verification'
): { valid: boolean; message: string } => {
  const normalizedEmail = email.toLowerCase()
  const storedOTP = otpStore.get(normalizedEmail)
  
  if (!storedOTP) {
    return { valid: false, message: 'No OTP found. Please request a new OTP.' }
  }
  
  // Check if OTP has expired
  if (Date.now() > storedOTP.expiresAt) {
    otpStore.delete(normalizedEmail)
    return { valid: false, message: 'OTP has expired. Please request a new OTP.' }
  }
  
  // Check purpose match
  if (purpose && storedOTP.purpose !== purpose) {
    return { valid: false, message: 'Invalid OTP purpose.' }
  }
  
  // Check max attempts
  if (storedOTP.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(normalizedEmail)
    return { valid: false, message: 'Too many failed attempts. Please request a new OTP.' }
  }
  
  // Verify OTP
  if (storedOTP.otp !== otp) {
    storedOTP.attempts++
    return { valid: false, message: `Invalid OTP. ${MAX_ATTEMPTS - storedOTP.attempts} attempts remaining.` }
  }
  
  // OTP is valid - delete it after successful verification
  otpStore.delete(normalizedEmail)
  return { valid: true, message: 'OTP verified successfully.' }
}

/**
 * Send OTP via email
 */
export const sendOTP = async (
  email: string,
  name: string,
  purpose: 'password_reset' | 'email_verification' | 'login_verification'
): Promise<{ success: boolean; message: string }> => {
  try {
    // Generate new OTP
    const otp = generateOTP()
    
    // Store OTP
    storeOTP(email.toLowerCase(), otp, purpose)
    
    // Send OTP via email
    const emailSent = await sendOTPEmail({
      email,
      name,
      otp,
      purpose,
      expiryMinutes: OTP_EXPIRY_MINUTES,
    })
    
    if (!emailSent) {
      return { success: false, message: 'Failed to send OTP email. Please try again.' }
    }
    
    return { success: true, message: 'OTP sent successfully. Please check your email.' }
  } catch (error) {
    console.error('Error sending OTP:', error)
    return { success: false, message: 'An error occurred while sending OTP.' }
  }
}

/**
 * Check if OTP can be resent (rate limiting)
 * Returns true if 1 minute has passed since last OTP creation
 */
export const canResendOTP = (email: string): boolean => {
  const storedOTP = otpStore.get(email.toLowerCase())
  if (!storedOTP) return true
  
  const timeSinceCreation = Date.now() - storedOTP.createdAt
  const cooldownPeriod = 60 * 1000 // 1 minute cooldown
  
  return timeSinceCreation >= cooldownPeriod
}

/**
 * Get remaining time before OTP expires (in seconds)
 */
export const getOTPExpirySeconds = (email: string): number => {
  const storedOTP = otpStore.get(email.toLowerCase())
  if (!storedOTP) return 0
  
  const remaining = storedOTP.expiresAt - Date.now()
  return Math.max(0, Math.floor(remaining / 1000))
}

/**
 * Cleanup expired OTPs (call periodically)
 */
export const cleanupExpiredOTPs = (): number => {
  let cleaned = 0
  const now = Date.now()
  
  for (const [email, otpData] of otpStore.entries()) {
    if (now > otpData.expiresAt) {
      otpStore.delete(email)
      cleaned++
    }
  }
  
  return cleaned
}

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const cleaned = cleanupExpiredOTPs()
    if (cleaned > 0) {
      console.log(`Cleaned up ${cleaned} expired OTPs`)
    }
  }, 5 * 60 * 1000)
}

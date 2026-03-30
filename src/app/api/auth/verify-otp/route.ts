import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateOTP, canResendOTP, getOTPExpirySeconds } from '@/lib/otp';

const verifyOTPSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
  purpose: z.enum(['password_reset', 'email_verification', 'login_verification']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp, purpose } = verifyOTPSchema.parse(body);

    // Validate OTP without consuming it
    const result = validateOTP(email, otp, purpose);

    if (!result.valid) {
      return NextResponse.json(
        { valid: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { valid: true, message: result.message },
      { status: 200 }
    );

  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check OTP status without consuming it
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const hasOTP = canResendOTP(email);
    const expirySeconds = getOTPExpirySeconds(email);

    // We don't reveal if OTP exists, just whether user can request a new one
    return NextResponse.json(
      { 
        canResend: hasOTP,
        expirySeconds: expirySeconds > 0 ? expirySeconds : null
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Get OTP status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

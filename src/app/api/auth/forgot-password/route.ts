import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db as prisma } from '@/lib/db';
import { sendOTP, canResendOTP, getOTPExpirySeconds } from '@/lib/otp';

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json(
        { message: "If an account exists with this email, a reset code has been sent." },
        { status: 200 }
      );
    }

    // Check if OTP can be resent (rate limiting)
    if (!canResendOTP(email)) {
      const remainingSeconds = getOTPExpirySeconds(email);
      return NextResponse.json(
        { 
          message: "Please wait before requesting another OTP.",
          cooldown: remainingSeconds > 0 ? remainingSeconds : 60
        },
        { status: 429 }
      );
    }

    // Get user name for the email
    const name = user.name || user.email.split('@')[0];

    // Send OTP via email
    const result = await sendOTP(email, name, 'password_reset');

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: "Password reset code sent successfully. Please check your email.",
        email: email.replace(/(.{2})(.*)(@.*)/, "$1***$3") // Mask email for display
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Generate a random CSRF token
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// CSRF middleware for API routes
export function withCsrf(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    // Skip CSRF check for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return handler(request);
    }
    
    // Check for CSRF token in headers
    const csrfToken = request.headers.get('x-csrf-token');
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    
    // Allow requests from same origin
    if (origin && referer) {
      const url = new URL(referer);
      if (url.origin === origin) {
        return handler(request);
      }
    }
    
    // For cookie-based auth, verify CSRF token
    const cookieToken = request.cookies.get('csrf-token')?.value;
    
    if (!csrfToken || !cookieToken || csrfToken !== cookieToken) {
      return NextResponse.json(
        { error: 'CSRF validation failed' },
        { status: 403 }
      );
    }
    
    return handler(request);
  };
}

// Helper to set CSRF cookie
export function setCsrfCookie(response: NextResponse): NextResponse {
  const token = generateCsrfToken();
  response.cookies.set('csrf-token', token, {
    httpOnly: false, // Allow JavaScript access for frontend
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
  return response;
}

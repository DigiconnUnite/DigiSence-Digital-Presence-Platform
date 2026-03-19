import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest, verifyToken } from '@/lib/jwt'

export interface AuthPayload {
  userId: string
  role: 'SUPER_ADMIN' | 'BUSINESS_ADMIN' | 'PROFESSIONAL_ADMIN'
  email: string
}

/**
 * Verifies the request has a valid SUPER_ADMIN token.
 * Returns the decoded payload or null if unauthorized.
 * Usage: const admin = await requireSuperAdmin(request)
 *        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 */
export async function requireSuperAdmin(request: NextRequest): Promise<AuthPayload | null> {
  const token = getTokenFromRequest(request) ?? request.cookies.get('auth-token')?.value
  if (!token) return null
  const payload = verifyToken(token) as AuthPayload | null
  if (!payload || payload.role !== 'SUPER_ADMIN') return null
  return payload
}

/**
 * Verifies the request has any valid auth token (any role).
 */
export async function requireAuth(request: NextRequest): Promise<AuthPayload | null> {
  const token = getTokenFromRequest(request) ?? request.cookies.get('auth-token')?.value
  if (!token) return null
  const payload = verifyToken(token) as AuthPayload | null
  return payload ?? null
}

/**
 * Verifies the request has a valid BUSINESS_ADMIN token.
 */
export async function requireBusinessAdmin(request: NextRequest): Promise<AuthPayload | null> {
  const token = getTokenFromRequest(request) ?? request.cookies.get('auth-token')?.value
  if (!token) return null
  const payload = verifyToken(token) as AuthPayload | null
  if (!payload || payload.role !== 'BUSINESS_ADMIN') return null
  return payload
}

/**
 * Verifies the request has a valid PROFESSIONAL_ADMIN token.
 */
export async function requireProfessionalAdmin(request: NextRequest): Promise<AuthPayload | null> {
  const token = getTokenFromRequest(request) ?? request.cookies.get('auth-token')?.value
  if (!token) return null
  const payload = verifyToken(token) as AuthPayload | null
  if (!payload || payload.role !== 'PROFESSIONAL_ADMIN') return null
  return payload
}

/**
 * Standard unauthorized response.
 */
export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

/**
 * Standard not found response.
 */
export function notFound(message = 'Not found') {
  return NextResponse.json({ error: message }, { status: 404 })
}

/**
 * Standard server error response.
 */
export function serverError(message = 'Internal server error') {
  return NextResponse.json({ error: message }, { status: 500 })
}

/**
 * Standard bad request response.
 */
export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

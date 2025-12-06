import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '@/lib/db'
import type { User as PrismaUser } from '@prisma/client'

/**
 * Import the Prisma enums for role safety.
 * Will use type compatible with Prisma UserRole
 */
import type { $Enums } from '@prisma/client'

export type UserRole = $Enums.UserRole

export interface AuthUser {
  id: string
  email: string
  name?: string
  role: UserRole
  businessId?: string
  createdAt?: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createUser(email: string, password: string, name?: string, role: UserRole = 'BUSINESS_ADMIN'): Promise<AuthUser> {
  const hashedPassword = await hashPassword(password)
  
  const user = await db.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role,
    },
    include: {
      business: true,
    },
  })

  return {
    id: user.id,
    email: user.email,
    name: user.name || undefined,
    role: user.role as UserRole,
    businessId: user.business?.id,
    createdAt: user.createdAt.toISOString(),
  }
}

export async function authenticateUser(email: string, password: string): Promise<AuthUser | null> {
  const user = await db.user.findUnique({
    where: { email },
    include: {
      business: true,
    },
  })

  if (!user || !user.password) {
    return null
  }

  const isValid = await verifyPassword(password, user.password)
  
  if (!isValid) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name || undefined,
    role: user.role as UserRole,
    businessId: user.business?.id,
    createdAt: user.createdAt.toISOString(),
  }
}

export async function getUserById(id: string): Promise<AuthUser | null> {
  const user = await db.user.findUnique({
    where: { id },
    include: {
      business: true,
    },
  })

  if (!user) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name || undefined,
    role: user.role as UserRole,
    businessId: user.business?.id,
  }
}

export function isSuperAdmin(user: AuthUser): boolean {
  return user.role === 'SUPER_ADMIN'
}

export function isBusinessAdmin(user: AuthUser): boolean {
  return user.role === 'BUSINESS_ADMIN'
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export function generateToken(user: AuthUser): string {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    businessId: user.businessId,
  }

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}
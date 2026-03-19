import { db } from '@/lib/db'

/**
 * Generates a URL-safe slug from a string.
 */
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * Generates a unique slug for a business using a single batch DB query.
 * Previously used a while-loop with sequential DB calls (N+1 problem).
 */
export async function generateUniqueBusinessSlug(name: string): Promise<string> {
  const baseSlug = toSlug(name)
  
  // Single query to find all conflicting slugs
  const existing = await db.business.findMany({
    where: { slug: { startsWith: baseSlug } },
    select: { slug: true },
  })
  
  const slugSet = new Set(existing.map((b) => b.slug))
  
  if (!slugSet.has(baseSlug)) return baseSlug
  
  let i = 1
  while (slugSet.has(`${baseSlug}-${i}`)) i++
  return `${baseSlug}-${i}`
}

/**
 * Generates a unique slug for a professional using a single batch DB query.
 */
export async function generateUniqueProfessionalSlug(name: string): Promise<string> {
  const baseSlug = toSlug(name)
  
  const existing = await db.professional.findMany({
    where: { slug: { startsWith: baseSlug } },
    select: { slug: true },
  })
  
  const slugSet = new Set(existing.map((p) => p.slug))
  
  if (!slugSet.has(baseSlug)) return baseSlug
  
  let i = 1
  while (slugSet.has(`${baseSlug}-${i}`)) i++
  return `${baseSlug}-${i}`
}

/**
 * Generates a unique slug for a category using a single batch DB query.
 */
export async function generateUniqueCategorySlug(name: string): Promise<string> {
  const baseSlug = toSlug(name)
  
  const existing = await db.category.findMany({
    where: { slug: { startsWith: baseSlug } },
    select: { slug: true },
  })
  
  const slugSet = new Set(existing.map((c) => c.slug))
  
  if (!slugSet.has(baseSlug)) return baseSlug
  
  let i = 1
  while (slugSet.has(`${baseSlug}-${i}`)) i++
  return `${baseSlug}-${i}`
}

/**
 * Generates a secure random password.
 */
export function generateSecurePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = 'Adm@'
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

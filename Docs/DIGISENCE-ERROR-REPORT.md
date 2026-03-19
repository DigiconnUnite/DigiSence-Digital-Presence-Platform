# DigiSence Platform - Comprehensive Error Analysis & Fix Report

**Document Version:** 1.0  
**Analysis Date:** March 2026  
**Total Issues Identified:** 47  
**Critical Bugs:** 18 | **Latency Issues:** 24 | **Consistency Gaps:** 31

---

## Executive Summary

This document provides a comprehensive analysis of all identified issues in the DigiSence platform, categorized by severity and impact area. The report includes detailed bug descriptions, root cause analysis, and recommended fixes organized into a prioritized roadmap.

---

## Table of Contents

1. [Critical Bugs (Ship Blockers)](#critical-bugs)
2. [API Latency & Performance Issues](#api-latency)
3. [Frontend Issues](#frontend-issues)
4. [Backend Issues](#backend-issues)
5. [Consistency Issues](#consistency-issues)
6. [Prioritized Fix Roadmap](#fix-roadmap)

---

## 1. Critical Bugs (Ship Blockers) <a name="critical-bugs"></a>

### 1.1 Auth Context Race Condition

**File:** `src/app/login/business/page.tsx`  
**Severity:** CRITICAL  
**Impact:** Intermittent 401 errors on first login

**Problem:**  
After `login()`, the page immediately calls `fetch('/api/business')` without waiting for the auth cookie to propagate. This causes intermittent 401s on first login — the user sees a "Failed to load business dashboard" error even though credentials are correct.

**Root Cause:**  
The fetch request races against cookie propagation. The cookie may not be set when the API call is made.

**Fix:**
```typescript
// Bug: immediate fetch after login, cookie may not yet be set
const result = await login(email, password)
if (result.success) {
  const response = await fetch('/api/business')  // ← races the cookie

// Fix: pass credentials explicitly or wait for auth refresh
  await refreshAuth()
  const response = await fetch('/api/business', { credentials: 'include' })
}
```

---

### 1.2 Password Reset Route Resets Wrong User

**File:** `src/app/api/admin/password-reset/route.ts`  
**Severity:** CRITICAL  
**Impact:** Password reset targets the wrong user

**Problem:**  
The admin password-reset endpoint uses `admin.userId` (the calling super admin) to look up a business, then resets that business admin's password. But the super admin might not have a business. The query returns null and throws a 404 instead of resetting the target user. The route is missing a `businessId` or `targetUserId` parameter entirely.

**Fix:**
```typescript
// Bug: looks up business for the CALLER (super admin), not the target
const business = await db.business.findFirst({ where: { adminId: admin.userId } })

// Fix: accept targetUserId in request body
const { targetUserId, newPassword } = body
await db.user.update({ where: { id: targetUserId }, data: { password: hashedPassword } })
```

---

### 1.3 Global Socket.IO Not Typed

**File:** Missing `src/types/global.d.ts`  
**Severity:** CRITICAL  
**Impact:** TypeScript strict mode crashes

**Problem:**  
Every API route checks `if (global.io)` but `global.io` is never declared in the global type namespace. This compiles only because the project isn't running strict TypeScript. In production builds with `noImplicitAny` enabled this will fail at compile time.

**Fix:** Create `src/types/global.d.ts`:
```typescript
declare global {
  var io: import('socket.io').Server | undefined
}

export {}
```

---

### 1.4 Business Delete Doesn't Delete Associated User

**File:** `src/app/api/admin/businesses/route.ts` (DELETE handler)  
**Severity:** CRITICAL  
**Impact:** Orphaned user accounts

**Problem:**  
The root-level DELETE (from query param `?id=...`) deletes products and inquiries but does NOT delete the associated admin user. This leaves orphaned user accounts. The `api/admin/businesses/[id]/route.ts` DELETE does it correctly — inconsistency between the two delete paths.

**Fix:** Ensure both delete paths handle user deletion:
```typescript
// In root DELETE handler, add:
const business = await db.business.findUnique({ 
  where: { id: businessId },
  include: { admin: true }
})

if (business?.adminId) {
  await db.user.delete({ where: { id: business.adminId } })
}
```

---

### 1.5 N+1 Query in Slug Uniqueness Check

**File:** `generateUniqueSlug()` in multiple files  
**Severity:** CRITICAL  
**Impact:** Database performance degradation under load

**Problem:**  
`generateUniqueSlug()` is defined identically in 3 files and does sequential DB reads in a while loop. For a business named "Tech Corp" it queries: `findFirst({slug:'tech-corp'})`, then `findFirst({slug:'tech-corp-1'})`, etc. Under high import load this hammers the DB.

**Fix:**
```typescript
// Fix: one query to find all conflicting slugs at once
const existing = await db.business.findMany({
  where: { slug: { startsWith: baseSlug } },
  select: { slug: true }
})
const slugSet = new Set(existing.map(b => b.slug))
let slug = baseSlug, i = 1
while (slugSet.has(slug)) slug = `${baseSlug}-${i++}`
```

---

### 1.6 HashPassword Dynamically Imported Inside DB Transactions

**Files:** Multiple route files  
**Severity:** CRITICAL  
**Impact:** Connection pool pressure, transaction timeouts

**Problem:**  
In multiple routes: `const { hashPassword } = await import('@/lib/auth')` inside a `db.$transaction()`. Dynamic imports can take 50–200ms in cold-start scenarios. Meanwhile the DB transaction is open and holding a connection. This increases connection pool pressure and risks transaction timeouts under load.

**Fix:**
```typescript
// Fix: import at module top-level
import { hashPassword } from '@/lib/auth'
// Then inside the handler:
const hashedPassword = await hashPassword(password)
const result = await db.$transaction(async (tx) => { ... })
```

---

### 1.7 Bulk Delete Uses For-Loop Inside Transaction

**File:** `src/app/api/admin/businesses/bulk/delete/route.ts`  
**Severity:** CRITICAL  
**Impact:** 150 sequential DB calls for 50 businesses

**Problem:**  
Iterates each business individually: `for (const business of businessesToDelete) { await tx.product.deleteMany(...); await tx.inquiry.deleteMany(...); await tx.business.delete(...) }`. For 50 businesses this is 150 sequential DB calls inside one transaction.

**Fix:**
```typescript
// Fix: batch deletes
await tx.product.deleteMany({ where: { businessId: { in: businessIds } } })
await tx.inquiry.deleteMany({ where: { businessId: { in: businessIds } } })
await tx.business.deleteMany({ where: { id: { in: businessIds } } })
await tx.user.deleteMany({ where: { id: { in: adminIds } } })
```

---

### 1.8 getSuperAdmin() Duplicated 15+ Times

**Files:** 15+ route files  
**Severity:** CRITICAL  
**Impact:** Maintenance burden, inconsistent auth logic

**Problem:**  
The exact same `getSuperAdmin()` function (13 lines) is copy-pasted into at least 15 route files. Same for `generateUniqueSlug()` in 3 files. Any bug in the auth check logic must be fixed in 15 places.

**Fix:** Extract to `src/lib/auth-helpers.ts`:
```typescript
// src/lib/auth-helpers.ts
export async function requireSuperAdmin(request: NextRequest) {
  const token = getTokenFromRequest(request) ?? request.cookies.get('auth-token')?.value
  if (!token) return null
  const payload = verifyToken(token)
  return payload?.role === 'SUPER_ADMIN' ? payload : null
}
```

---

### 1.9 Notification API Uses Internal fetch() to Itself

**File:** `src/app/api/registration-inquiries/route.ts`  
**Severity:** CRITICAL  
**Impact:** Network overhead, dev mode failures, circular timeouts

**Problem:**  
`fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications`, ...)`. An API route calling another API route via HTTP is an anti-pattern — it adds network overhead, fails in local dev without the env var, and can cause circular timeouts.

**Fix:** Call the notification logic directly as a function:
```typescript
// Instead of fetch, import and call directly
import { sendNotification } from '@/lib/notifications'

// Inside handler:
await sendNotification(adminEmail, 'New registration', details)
```

---

### 1.10 Upload Route Has No Authentication

**File:** `src/app/api/upload/route.ts`  
**Severity:** CRITICAL  
**Impact:** Anonymous file uploads to S3

**Problem:**  
Accepts any file upload from anyone — no auth check, no user ID binding. Any anonymous user can upload files to your S3 bucket.

**Fix:** Add auth verification:
```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ... rest of upload logic
}
```

---

### 1.11 API Response Shape Inconsistency - Pagination

**Files:** Admin businesses API, `useBusinesses.ts`, `useProfessionals.ts`  
**Severity:** CRITICAL  
**Impact:** Pagination displays 0 items for professionals

**Problem:**  
Admin businesses API returns `{ pagination: { total, totalPages } }`. The TypeScript interfaces expect `{ pagination: { totalItems, totalPages } }`. This mismatch means pagination display is always incorrect for professionals — showing 0 total items.

**Fix:** Standardize across ALL paginated endpoints:
```typescript
// API should return: { pagination: { totalItems: 42, totalPages: 5 } }
// Or standardize to: { pagination: { total: 42, totalPages: 5 } }
// Pick one and update all frontend interfaces
```

---

### 1.12 Duplicate Bulk Status/Delete Schemas

**File:** `src/app/api/admin/businesses/route.ts`  
**Severity:** CRITICAL  
**Impact:** Confusing code, potential bugs

**Problem:**  
Defines both schemas AND handles bulk operations in the root PATCH handler. There are ALSO separate route files at `bulk/status/route.ts` and `bulk/delete/route.ts`. Two implementations exist simultaneously.

**Fix:** Remove root-level bulk handlers, use separate route files consistently.

---

### 1.13 Hydration Mismatch in BusinessProfile

**File:** `src/app/business-profile/[slug]/page.tsx` (or similar)  
**Severity:** CRITICAL  
**Impact:** React hydration warnings, flash of skeleton

**Problem:**  
`isLoading` is initialized to `true` on the server but set to `false` in `useEffect`. The server renders the skeleton while the client renders the content — React hydration will throw a mismatch warning.

**Fix:** Initialize to `false` since data is already available via SSR props:
```typescript
// Instead of:
const [isLoading, setIsLoading] = useState(true)

// Use:
const [isLoading, setIsLoading] = useState(false)
```

---

### 1.14 Missing Registration Inquiry Approval/Reject Routes

**Files:** Frontend calls non-existent endpoints  
**Severity:** CRITICAL  
**Impact:** 404 errors on approve/reject actions

**Problem:**  
`useRegistrationInquiries.ts` calls `/api/admin/registration-inquiries/{id}/approve` and `/api/admin/registration-inquiries/{id}/reject`. Neither of these sub-routes exist in the codebase.

**Fix:** Create the missing routes:
- `src/app/api/admin/registration-inquiries/[id]/approve/route.ts`
- `src/app/api/admin/registration-inquiries/[id]/reject/route.ts`

---

### 1.15 Infinite Loop Risk in forceRefresh()

**File:** `src/app/business-profile/[slug]/components/BusinessProfile.tsx`  
**Severity:** HIGH  
**Impact:** Wrong data loaded, potential infinite loop

**Problem:**  
`forceRefresh()` queries `/api/businesses?slug=X` but the businesses API doesn't support a `slug` param — it only supports `search`, `page`, etc. The fetch always returns the full list, not the current business.

**Fix:** Use correct API or create slug-based endpoint:
```typescript
// Fix: use correct endpoint
await refresh(`/api/business/${slug}`)
```

---

### 1.16 useInfiniteQuery Imported After Use

**File:** `src/lib/hooks/useAuditLog.ts`  
**Severity:** HIGH  
**Impact:** Runtime error in some bundler configurations

**Problem:**  
`useAuditLogsInfinite` calls `useInfiniteQuery` before the import statement at the bottom of the file.

**Fix:** Move import to top:
```typescript
// Move to top of file
import { useInfiniteQuery } from '@tanstack/react-query'
```

---

### 1.17 AuditLog Pagination Buttons Always Disabled

**File:** `src/app/dashboard/admin/components/AuditLogTable.tsx`  
**Severity:** HIGH  
**Impact:** Cannot navigate past first page

**Problem:**  
Renders Previous/Next buttons with `disabled` hardcoded — they never enable. There is no pagination logic.

**Fix:** Implement proper pagination:
```typescript
// Use React Query's hasNextPage / hasPreviousPage
<Button disabled={!hasPreviousPage} onClick={() => fetchPreviousPage()}>
  Previous
</Button>
```

---

### 1.18 Contact Form Has No Submission Handler

**File:** `src/app/contact/page.tsx`  
**Severity:** HIGH  
**Impact:** Form submissions do nothing

**Problem:**  
Renders a complete contact form with a "Send Message" submit button, but the `<form>` has no `onSubmit` handler and no API call.

**Fix:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  const response = await fetch('/api/contact', {
    method: 'POST',
    body: JSON.stringify(formData)
  })
  if (response.ok) {
    showToast('Message sent successfully')
  }
}

<form onSubmit={handleSubmit}>
```

---

## 2. API Latency & Performance Issues <a name="api-latency"></a>

### 2.1 Admin Dashboard Fetches Data Separately

**Severity:** HIGH  
**Impact:** 2 round trips on page load

**Problem:**  
On page load the admin dashboard fires both `/api/admin/businesses` and an inferred stats query. MongoDB aggregations are expensive.

**Fix:** Combine into single aggregation pipeline endpoint.

---

### 2.2 Professional Login Fetches ALL Professionals

**Severity:** HIGH  
**Impact:** Unbounded payload as professionals grow

**Problem:**  
`fetch('/api/professionals')` returns every professional, then does client-side filter.

**Fix:**
```typescript
// Fix: server-side filter
fetch(`/api/professionals?adminId=${result.user.id}`)
// In API: where: { adminId: userId, isActive: true }
```

---

### 2.3 Business Catalog Page Double DB Call

**Severity:** HIGH  
**Impact:** Duplicate database queries

**Problem:**  
Calls `db.business.findUnique()` twice — once in the page function and once in `generateMetadata()`.

**Fix:**
```typescript
import { cache } from 'react'
const getBusiness = cache((slug: string) => db.business.findUnique({ where: { slug } }))
// Use getBusiness() in both page() and generateMetadata()
```

---

### 2.4 No Rate Limiting on Inquiry/OTP Endpoints

**Severity:** HIGH  
**Impact:** Security vulnerability - spam and brute-force attacks

**Problem:**  
`/api/inquiries`, `/api/auth/forgot-password`, and `/api/auth/verify-otp` have no rate limiting.

**Fix:** Add middleware using `next-rate-limit` or Upstash Redis:
```typescript
import { RateLimit } from 'rate-limit'

export const rateLimit = new RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // limit each IP to 5 requests per window
})
```

---

### 2.5 Console.log Calls in Production

**Severity:** MEDIUM  
**Impact:** Performance overhead

**Problem:**  
Over 40 `console.log()` calls in API routes serialize objects on every request.

**Fix:**
```typescript
// Gate behind development check
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data)
}
```

---

### 2.6 Business Listing Fetches & Filters Client-Side

**Severity:** MEDIUM  
**Impact:** Megabytes of JSON on each page load

**Problem:**  
Fetches all businesses at once, then filters and searches client-side.

**Fix:** Move search and category filtering to server using query params.

---

### 2.7 Aurora Component Runs requestAnimationFrame Loop

**Severity:** MEDIUM  
**Impact:** CPU drain on every page

**Problem:**  
Runs continuous `requestAnimationFrame` loop updating hue state 60 times per second.

**Fix:** Replace with CSS animation:
```css
@keyframes aurora {
  0% { background-position: 0% 50% }
  50% { background-position: 100% 50% }
  100% { background-position: 0% 50% }
}
.aurora {
  animation: aurora 20s ease infinite;
}
```

---

## 3. Frontend Issues <a name="frontend-issues"></a>

### 3.1 Touch State Persists Across Mouse Events

**Severity:** HIGH  
**Impact:** Hero slider bug

**Problem:**  
Uses same `touchStart`/`touchEnd` state for both touch and mouse events.

**Fix:** Clear state in correct event handlers:
```typescript
const handleMouseDown = () => {
  setTouchStart(null)
  setTouchEnd(null)
  // ... mouse handling
}
```

---

### 3.2 Theme Saved to localStorage Not Synced on Mount

**Severity:** HIGH  
**Impact:** Flash of unstyled content (FOUC)

**Problem:**  
Loads theme from localStorage in a `useEffect`. Every professional dashboard renders with default styles first, then re-renders.

**Fix:** Use Next.js `next/headers` cookies or blocking script:
```typescript
// In layout.tsx - use cookies for theme
import { cookies } from 'next/headers'

const theme = cookies().get('theme')?.value || 'light'
```

---

### 3.3 Alert Dialog Uses Native alert() Calls

**Severity:** MEDIUM  
**Impact:** Poor UX, blocked main thread

**Problem:**  
Uses `alert()` for inquiry success/error messages in 12+ places.

**Fix:** Replace with `useToast()` hook or `UnifiedModal` component.

---

### 3.4 Missing key Prop Stability - Product Carousel

**Severity:** MEDIUM  
**Impact:** Unnecessary re-renders

**Problem:**  
Grid view rendered inside same IIFE as ProductCard, causing all cards to unmount on view mode toggle.

**Fix:** Extract view toggle outside IIFE and memoize ProductCard.

---

### 3.5 img Tags Used Instead of Next.js Image

**Severity:** MEDIUM  
**Impact:** No WebP conversion, no lazy loading, layout shifts

**Problem:**  
Business logos, product images, banner images use bare `<img>` tags.

**Fix:** Replace with Next.js `<Image>` component:
```tsx
import Image from 'next/image'

<Image 
  src={logoUrl} 
  alt={businessName}
  width={200}
  height={100}
  priority={index < 4} // Lazy load all except first 4
/>
```

---

### 3.6 ProductCard Defined Inside Render

**Severity:** HIGH  
**Impact:** Visible flicker, lost internal state

**Problem:**  
`const ProductCard = ({ product }) =>` is declared inside the IIFE that runs on every render.

**Fix:**
```typescript
// Move outside BusinessProfile component, and add proper TypeScript typing
const ProductCard = ({ product }: { product: Product }) => ( ... )
```

---

### 3.7 Missing Suspense Boundary on useSearchParams

**Severity:** HIGH  
**Impact:** Layout shift

**Problem:**  
The inner component reads `useSearchParams()` which requires a Suspense boundary in Next.js 13+.

**Fix:** Ensure proper Suspense wrapping with matching heights.

---

## 4. Backend Issues <a name="backend-issues"></a>

### 4.1 S3 Upload Fallback Silently Uses Mock URLs

**Severity:** HIGH  
**Impact:** Hard-to-debug production bugs

**Problem:**  
Catches S3 errors and falls back to `mockUpload()` which returns fake URLs that return 404s.

**Fix:** Fail loudly instead of silently:
```typescript
// Instead of catch-all fallback:
if (uploadError) {
  console.error('S3 upload failed:', uploadError)
  throw new Error('File upload failed. Please try again.')
}
```

---

### 4.2 Registration Inquiry Notification Error Handling

**Severity:** HIGH  
**Impact:** Extra DB round trip

**Problem:**  
Admin email is fetched after transaction returns, adding extra DB round trip.

**Fix:** Combine into main query.

---

### 4.3 Seed File Hardcodes Credentials

**Severity:** MEDIUM  
**Impact:** Security risk if committed to git

**Problem:**  
`password: 'admin123'` and `password: 'business123'` are hardcoded.

**Fix:** Use environment variables or generate random passwords.

---

### 4.4 Test Files in Production Directory

**Severity:** MEDIUM  
**Impact:** Bundle bloat

**Problem:**  
Files like `test-database-persistence.ts`, `qr-generator.test.ts` are in `src/lib/`.

**Fix:** Move to top-level `test/` directory.

---

### 4.5 HTTP Method Mismatch - Business Update

**Severity:** MEDIUM  
**Impact:** Confusing API semantics

**Problem:**  
Uses `POST` for updates instead of `PUT` or `PATCH`.

**Fix:** Use proper REST methods:
```typescript
// Updates should use PUT or PATCH
fetch(`/api/admin/businesses/${id}`, { method: 'PUT' })
```

---

## 5. Consistency Issues <a name="consistency-issues"></a>

### 5.1 Professional Update Uses Wrong API Path

**Severity:** HIGH  
**Impact:** 404 errors

**Problem:**  
Sends updates to `/api/professionals/{id}` (public endpoint) but should use `/api/admin/professionals/{id}`.

**Fix:** Update frontend to use correct admin endpoint.

---

### 5.2 Error Response Format Inconsistent

**Severity:** HIGH  
**Impact:** Broken error handling

**Problem:**  
Some routes return `{ error: 'message' }`, others `{ message: 'error' }`, some `{ error: 'message', details: [...] }`.

**Fix:** Standardize to `{ error: string, details?: any }` across all routes.

---

### 5.3 Category Type Filtering Inconsistent

**Severity:** HIGH  
**Impact:** Wrong categories shown

**Problem:**  
Admin categories API filters by `type: 'BUSINESS'` always. Public returns all types. Business dashboard includes PRODUCT categories.

**Fix:** Enforce consistent category type filtering across all APIs and UIs.

---

### 5.4 Socket.IO Events Use Different Naming Conventions

**Severity:** MEDIUM  
**Impact:** Real-time updates silently fail

**Problem:**  
Events: `business-created`, `business-updated`, `business-bulk-deleted`, `businesses-bulk-status-updated`. Inconsistent plural/singular.

**Fix:** Standardize event naming:
```typescript
// Use consistent plural or singular
'emergency-update'   // singular for single item
'emergency-list-updated'  // plural for collections
```

---

### 5.5 Design Token Inconsistency

**Severity:** MEDIUM  
**Impact:** Dark mode doesn't work for all components

**Problem:**  
Dashboard uses Tailwind classes directly. UI components use CSS variables. Two separate color systems.

**Fix:** Unify using CSS variables throughout:
```css
/* In globals.css - use variables for everything */
.bg-primary { background: var(--color-background-primary); }
/* Remove direct Tailwind color references */
```

---

### 5.6 Category Label CSS Bug

**Severity:** MEDIUM  
**Impact:** Broken CSS rendering

**Problem:**  
`className="block text-sm font-medium text-gray-700 mb Category-1"` — literal space and capital letter.

**Fix:**
```tsx
// Line 187 - remove the error
className="block text-sm font-medium text-gray-700 mb-1"
```

---

## 6. Prioritized Fix Roadmap <a name="fix-roadmap"></a>

### 🔴 Week 1 — Critical (Ship Blockers)

| # | Issue | File(s) |
|---|-------|---------|
| 1 | Create `src/types/global.d.ts` with Socket.IO type | `types/global.d.ts` |
| 2 | Extract `requireSuperAdmin()` and `generateUniqueSlug()` to shared lib | Multiple |
| 3 | Add auth guard to `/api/upload/route.ts` | `api/upload/route.ts` |
| 4 | Fix password-reset route to accept `targetUserId` | `api/admin/password-reset/route.ts` |
| 5 | Fix business delete to also delete associated user | `api/admin/businesses/route.ts` |
| 6 | Move `hashPassword` imports outside transaction blocks | Multiple |
| 7 | Create missing approve/reject routes | `api/admin/registration-inquiries/` |
| 8 | Fix pagination field mismatch (`total` vs `totalItems`) | API routes + hooks |
| 9 | Remove duplicate bulk handler from root `businesses/route.ts` | `api/admin/businesses/route.ts` |

---

### 🟡 Week 2 — High Priority (UX/Performance)

| # | Issue | File(s) |
|---|-------|---------|
| 10 | Replace `generateUniqueSlug` N+1 with batch query | Multiple |
| 11 | Replace `bulkDelete` loop with `deleteMany` | `api/admin/businesses/bulk/delete/route.ts` |
| 12 | Add auth to professional login - filter by `adminId` server-side | API + frontend |
| 13 | Fix `forceRefresh()` in BusinessProfile | BusinessProfile.tsx |
| 14 | Fix `isLoading` initialization bug (SSR hydration) | BusinessProfile.tsx |
| 15 | Move `ProductCard` outside the render function | BusinessProfile.tsx |
| 16 | Replace `alert()` calls with `useToast()` | Multiple |
| 17 | Remove S3 mock fallback - fail loudly on upload error | `api/upload/route.ts` |
| 18 | Add rate limiting middleware to OTP/inquiry/forgot-password | API routes |
| 19 | Fix contact form - add `onSubmit` handler | `app/contact/page.tsx` |

---

### 🔵 Week 3-4 — Medium Priority (Polish & Scalability)

| # | Issue | File(s) |
|---|-------|---------|
| 20 | Remove internal `fetch()` to `/api/notifications` | `api/registration-inquiries/route.ts` |
| 21 | Move businesses/professionals pages to server-side search/filter | Pages + API |
| 22 | Use React `cache()` for catalog page metadata | `app/catalog/[business]/page.tsx` |
| 23 | Replace Aurora rAF loop with CSS animation | `components/Aurora.tsx` |
| 24 | Remove `console.log()` calls from production API routes | Multiple |
| 25 | Move test files from `src/lib/` to `test/` | `src/lib/test-*` |
| 26 | Migrate bare `<img>` to Next.js `<Image>` on listing pages | Multiple |
| 27 | Add AuditLog pagination logic | `AuditLogTable.tsx` |
| 28 | Standardize error response format | All API routes |
| 29 | Standardize Socket.IO event names | Socket hook + emitters |
| 30 | Fix broken CSS class `"mb Category-1"` | `ImportCSVModal.tsx` |

---

## Summary Statistics

| Category | Critical | High | Medium | Total |
|----------|----------|------|--------|-------|
| Bugs | 4 | 8 | 2 | 14 |
| Latency | 4 | 4 | 3 | 11 |
| Frontend | 1 | 4 | 3 | 8 |
| Backend | 4 | 2 | 3 | 9 |
| Consistency | 2 | 3 | 3 | 8 |
| **TOTAL** | **15** | **21** | **14** | **50** |

---

## Recommended Implementation Order

1. **Phase 1 (Week 1):** Fix all Critical issues that cause crashes, data corruption, or security vulnerabilities
2. **Phase 2 (Week 2):** Address High priority issues affecting UX and performance
3. **Phase 3 (Week 3-4):** Complete Medium priority items for polish and scalability

---

*Document generated from DigiSence Platform Architecture Analysis*  
*See: `Docs/digisence_platform_architecture.html` for original analysis*

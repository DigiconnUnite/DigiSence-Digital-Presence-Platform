import { NextResponse } from 'next/server';

/**
 * Standardized Cache Headers for API Responses
 * 
 * These headers ensure consistent caching behavior across all API endpoints.
 * Admin APIs should use no-store to prevent caching of sensitive data.
 * Public APIs can use short cache durations for performance.
 */

// Cache header configurations
export const cacheHeaders = {
  // No caching - for admin APIs and sensitive data
  noStore: {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store',
  },
  
  // Short cache with revalidation - for frequently updated public data
  shortCache: {
    'Cache-Control': 'public, max-age=10, stale-while-revalidate=30',
  },
  
  // Medium cache - for moderately stable data
  mediumCache: {
    'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
  },
  
  // Long cache - for static reference data
  longCache: {
    'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
  },
  
  // Immutable - for versioned/static assets
  immutable: {
    'Cache-Control': 'public, max-age=31536000, immutable',
  },
} as const;

/**
 * Get no-store headers for admin APIs
 */
export function getNoStoreHeaders(): Record<string, string> {
  return { ...cacheHeaders.noStore };
}

/**
 * Get short cache headers for dynamic public data
 */
export function getShortCacheHeaders(): Record<string, string> {
  return { ...cacheHeaders.shortCache };
}

/**
 * Get medium cache headers for moderately stable data
 */
export function getMediumCacheHeaders(): Record<string, string> {
  return { ...cacheHeaders.mediumCache };
}

/**
 * Get long cache headers for static reference data
 */
export function getLongCacheHeaders(): Record<string, string> {
  return { ...cacheHeaders.longCache };
}

/**
 * Create a NextResponse with standardized no-store headers
 * For admin APIs that should never be cached
 */
export function adminResponse(data: any, status: number = 200): NextResponse {
  return NextResponse.json(data, {
    status,
    headers: getNoStoreHeaders(),
  });
}

/**
 * Create a NextResponse with short cache headers
 * For public APIs with moderate update frequency
 */
export function publicCacheResponse(data: any, status: number = 200): NextResponse {
  return NextResponse.json(data, {
    status,
    headers: getShortCacheHeaders(),
  });
}

/**
 * Create a NextResponse with long cache headers
 * For static reference data (categories, etc.)
 */
export function staticCacheResponse(data: any, status: number = 200): NextResponse {
  return NextResponse.json(data, {
    status,
    headers: getLongCacheHeaders(),
  });
}

/**
 * Add cache invalidation hint for frontend
 * Custom header to signal when cache should be invalidated
 */
export function getInvalidationHeaders(action: 'create' | 'update' | 'delete'): Record<string, string> {
  return {
    'X-Cache-Invalidation': action,
    'X-Invalidation-Time': new Date().toISOString(),
  };
}

/**
 * Add ETag for conditional requests
 * Supports If-None-Match / If-Match headers
 */
export function addETag(headers: Record<string, string>, etag: string): Record<string, string> {
  return {
    ...headers,
    'ETag': etag,
  };
}

/**
 * Generate a simple ETag from data
 */
export function generateETag(data: any): string {
  const json = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < json.length; i++) {
    const char = json.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `"${hash.toString(16)}"`;
}

/**
 * Check if client has fresh content using ETag
 */
export function isFreshContent(request: Request, etag: string): boolean {
  const ifNoneMatch = request.headers.get('if-none-match');
  return ifNoneMatch === etag;
}

/**
 * Create 304 Not Modified response
 */
export function notModifiedResponse(): NextResponse {
  return new NextResponse(null, {
    status: 304,
    headers: {
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}

/**
 * Create response with cache headers based on endpoint type
 */
export function createResponse(
  data: any,
  options: {
    status?: number;
    isAdmin?: boolean;
    isStatic?: boolean;
    etag?: string;
    customHeaders?: Record<string, string>;
  } = {}
): NextResponse {
  const { status = 200, isAdmin = true, isStatic = false, etag, customHeaders } = options;
  
  let headers = isAdmin 
    ? getNoStoreHeaders() 
    : isStatic 
      ? getLongCacheHeaders() 
      : getShortCacheHeaders();
  
  if (etag) {
    headers = addETag(headers, etag);
  }
  
  if (customHeaders) {
    headers = { ...headers, ...customHeaders };
  }
  
  return NextResponse.json(data, { status, headers });
}

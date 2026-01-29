import { useQueryClient, QueryClient } from '@tanstack/react-query';

/**
 * Cache Invalidation Utilities
 * 
 * Provides centralized cache invalidation functions for all data types.
 * These functions ensure consistent cache management across the application.
 */

export interface InvalidationOptions {
  includeStats?: boolean;
  includeDetails?: boolean;
}

/**
 * Invalidate all business-related caches
 */
export function invalidateBusinesses(queryClient: QueryClient, options: InvalidationOptions = {}) {
  const { includeStats = true, includeDetails = true } = options;
  
  // Invalidate list queries
  queryClient.invalidateQueries({ queryKey: ['businesses', 'list'] });
  queryClient.invalidateQueries({ queryKey: ['admin-businesses'] });
  
  // Invalidate detail queries if enabled
  if (includeDetails) {
    queryClient.invalidateQueries({ queryKey: ['businesses', 'detail'] });
    queryClient.invalidateQueries({ queryKey: ['business'] });
  }
  
  // Invalidate stats if enabled
  if (includeStats) {
    queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    queryClient.invalidateQueries({ queryKey: ['stats'] });
  }
  
  console.log('[CacheInvalidation] Business caches invalidated');
}

/**
 * Invalidate all category-related caches
 */
export function invalidateCategories(queryClient: QueryClient, options: InvalidationOptions = {}) {
  const { includeStats = false } = options;
  
  queryClient.invalidateQueries({ queryKey: ['categories'] });
  queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
  
  // Categories affect business listings
  queryClient.invalidateQueries({ queryKey: ['businesses', 'list'] });
  
  if (includeStats) {
    queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
  }
  
  console.log('[CacheInvalidation] Category caches invalidated');
}

/**
 * Invalidate all inquiry-related caches
 */
export function invalidateInquiries(queryClient: QueryClient, options: InvalidationOptions = {}) {
  const { includeStats = true } = options;
  
  queryClient.invalidateQueries({ queryKey: ['inquiries'] });
  queryClient.invalidateQueries({ queryKey: ['admin-inquiries'] });
  queryClient.invalidateQueries({ queryKey: ['business-inquiries'] });
  
  if (includeStats) {
    queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
  }
  
  console.log('[CacheInvalidation] Inquiry caches invalidated');
}

/**
 * Invalidate all professional-related caches
 */
export function invalidateProfessionals(queryClient: QueryClient, options: InvalidationOptions = {}) {
  const { includeStats = true, includeDetails = true } = options;
  
  queryClient.invalidateQueries({ queryKey: ['professionals'] });
  queryClient.invalidateQueries({ queryKey: ['admin-professionals'] });
  
  if (includeDetails) {
    queryClient.invalidateQueries({ queryKey: ['professionals', 'detail'] });
  }
  
  if (includeStats) {
    queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
  }
  
  console.log('[CacheInvalidation] Professional caches invalidated');
}

/**
 * Invalidate all registration inquiry caches
 */
export function invalidateRegistrationInquiries(queryClient: QueryClient, options: InvalidationOptions = {}) {
  const { includeStats = true } = options;
  
  queryClient.invalidateQueries({ queryKey: ['registration-inquiries'] });
  queryClient.invalidateQueries({ queryKey: ['admin-registration-inquiries'] });
  
  if (includeStats) {
    queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
  }
  
  console.log('[CacheInvalidation] Registration inquiry caches invalidated');
}

/**
 * Invalidate all audit log caches
 */
export function invalidateAuditLogs(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
  queryClient.invalidateQueries({ queryKey: ['admin-audit-logs'] });
  
  console.log('[CacheInvalidation] Audit log caches invalidated');
}

/**
 * Invalidate all admin-related caches
 */
export function invalidateAllAdminCaches(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ['admin'] });
  queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
  queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
  
  console.log('[CacheInvalidation] All admin caches invalidated');
}

/**
 * Invalidate user-related caches (after login/logout/profile update)
 */
export function invalidateUserCaches(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ['user'] });
  queryClient.invalidateQueries({ queryKey: ['me'] });
  queryClient.invalidateQueries({ queryKey: ['profile'] });
  
  console.log('[CacheInvalidation] User caches invalidated');
}

/**
 * Prefetch specific data to warm the cache
 */
export async function prefetchBusinesses(
  queryClient: QueryClient,
  fetchFn: () => Promise<any>
) {
  await queryClient.prefetchQuery({
    queryKey: ['businesses', 'list'],
    queryFn: fetchFn,
    staleTime: 30 * 1000, // 30 seconds
  });
  
  console.log('[CacheInvalidation] Businesses prefetched');
}

/**
 * Clear all caches (use with caution)
 */
export function clearAllCaches(queryClient: QueryClient) {
  queryClient.clear();
  console.log('[CacheInvalidation] All caches cleared');
}

/**
 * Hook wrapper for cache invalidation
 * Provides easy access to invalidation functions
 */
export function useCacheInvalidation() {
  const queryClient = useQueryClient();
  
  return {
    invalidateBusinesses: () => invalidateBusinesses(queryClient),
    invalidateCategories: () => invalidateCategories(queryClient),
    invalidateInquiries: () => invalidateInquiries(queryClient),
    invalidateProfessionals: () => invalidateProfessionals(queryClient),
    invalidateRegistrationInquiries: () => invalidateRegistrationInquiries(queryClient),
    invalidateAuditLogs: () => invalidateAuditLogs(queryClient),
    invalidateAllAdmin: () => invalidateAllAdminCaches(queryClient),
    invalidateUser: () => invalidateUserCaches(queryClient),
    clearAll: () => clearAllCaches(queryClient),
  };
}

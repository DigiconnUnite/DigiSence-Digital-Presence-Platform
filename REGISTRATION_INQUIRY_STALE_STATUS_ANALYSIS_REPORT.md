# Registration Inquiry Stale Status Analysis Report

**Date:** January 31, 2026  
**Author:** Orchestrator Analysis  
**Status:** Analysis Complete - Implementation Pending

---

## Executive Summary

The registration inquiry section in the admin panel exhibits stale status issues where:
- UI does not update after accepting/rejecting requests
- API changes are not reflected in the UI
- No confirmation dialog when rejecting requests

## Root Cause Analysis

### 1. Missing Registration Inquiry Hook

**Issue:** The admin page uses `useBusinesses` hook for registration inquiries, which is incorrect.

```typescript
// Current code in src/app/dashboard/admin/page.tsx
const { data: businessesData } = useBusinesses();
```

**Problem:** `useBusinesses` is designed for business listings, not registration inquiries. It queries `['admin-businesses']` which is a different endpoint than registration inquiries.

### 2. No Cache Invalidation After Status Updates

**Issue:** After accepting/rejecting registration inquiries, the cache is not invalidated.

```typescript
// Current code - no cache invalidation
const handleAccept = async (inquiryId: string) => {
  await updateRegistrationStatus(inquiryId, 'approved');
  // UI NOT refreshed - cache still has stale data
};
```

**Problem:** React Query caches the API response. Without `queryClient.invalidateQueries()`, the cached data is never refreshed.

### 3. No Real-time Updates via Socket Events

**Issue:** No socket event listeners for registration inquiry status changes.

**Problem:** Other parts of the system use socket events to update UI in real-time, but registration inquiries lack this integration.

### 4. Using window.confirm() Instead of UI Dialog

**Issue:** Reject action uses `window.confirm()` for confirmation.

```typescript
// Current code
const handleReject = async (inquiryId: string) => {
  if (confirm('Are you sure you want to reject this registration?')) {
    await updateRegistrationStatus(inquiryId, 'rejected');
  }
};
```

**Problem:** This is a browser native dialog, not integrated with the app's UI design system.

### 5. Error in fetchData Function

**Issue:** The `fetchData` function references undefined variables.

```typescript
// Current code - BROKEN
const fetchData = async () => {
  const [professionals, categories, businesses] = await Promise.all([
    fetchProfessionals(),
    fetchCategories(),
    fetchBusinesses(),
  ]);

  setProfessionalsData(professionals);
  setCategoriesData(categories);
  // ❌ businessesData is never set - references undefined variable
  // ❌ professionalsData is never set - references undefined variable
};
```

**Problem:** Variables `businessesData` and `professionalsData` are referenced in filters but never initialized from the fetch results.

## Impact

| Issue | Severity | User Impact |
|-------|----------|-------------|
| Missing cache invalidation | High | UI shows outdated data after status changes |
| No socket integration | Medium | No real-time updates between admin sessions |
| Wrong hook usage | High | Wrong data being displayed |
| Dialog issue | Low | Inconsistent UI experience |
| fetchData error | High | Potential crash or undefined behavior |

## Required Fixes

### Fix 1: Create useRegistrationInquiries Hook

Create a new hook `src/lib/hooks/useRegistrationInquiries.ts` that:
- Queries the correct API endpoint for registration inquiries
- Provides status update functions with cache invalidation
- Includes optimistic updates for better UX

### Fix 2: Add Cache Invalidation Calls

After each status update, invalidate the registration inquiries cache:

```typescript
import { invalidateRegistrationInquiries } from '@/lib/cacheInvalidation';

const handleStatusUpdate = async (inquiryId: string, status: string) => {
  await updateRegistrationStatus(inquiryId, status);
  invalidateRegistrationInquiries(queryClient); // Add this line
};
```

### Fix 3: Add Socket Event Handlers

Integrate with the existing SocketProvider:

```typescript
useEffect(() => {
  const handleRegistrationUpdate = (data: { id: string; status: string }) => {
    queryClient.setQueryData(
      ['registration-inquiries', data.id],
      (old: any) => ({ ...old, status: data.status })
    );
  };

  socket?.on('registration:inquiry:updated', handleRegistrationUpdate);
  
  return () => {
    socket?.off('registration:inquiry:updated', handleRegistrationUpdate);
  };
}, [socket, queryClient]);
```

### Fix 4: Replace confirm() with Dialog Component

Replace `window.confirm()` with the existing `UnifiedModal` or `dialog.tsx` component:

```typescript
import { useState } from 'react';
import { UnifiedModal } from '@/components/ui/UnifiedModal';

const [rejectModalOpen, setRejectModalOpen] = useState(false);
const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);

const handleRejectClick = (inquiryId: string) => {
  setSelectedInquiryId(inquiryId);
  setRejectModalOpen(true);
};

const confirmReject = async () => {
  if (selectedInquiryId) {
    await updateRegistrationStatus(selectedInquiryId, 'rejected');
  }
  setRejectModalOpen(false);
};

<UnifiedModal
  open={rejectModalOpen}
  onOpenChange={setRejectModalOpen}
  title="Reject Registration"
  description="Are you sure you want to reject this registration request?"
  confirmText="Reject"
  onConfirm={confirmReject}
/>
```

### Fix 5: Fix fetchData Function

Correct the fetchData function to properly set state variables:

```typescript
const fetchData = async () => {
  try {
    const [professionals, categories, businesses] = await Promise.all([
      fetchProfessionals(),
      fetchCategories(),
      fetchBusinesses(),
    ]);

    // Properly set state from all fetched data
    setProfessionalsData(professionals || []);
    setCategoriesData(categories || []);
    setBusinessesData(businesses || []); // Add this line
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/hooks/useRegistrationInquiries.ts` | Create new hook |
| `src/app/dashboard/admin/page.tsx` | Fix hook usage, add cache invalidation, add dialog |
| `src/lib/cacheInvalidation.ts` | Export `invalidateRegistrationInquiries` (already exists) |
| `src/components/providers/SocketProvider.tsx` | Add registration inquiry socket events |

## Recommended Implementation Order

1. **Fix 5:** Fix `fetchData` function (quick fix, prevents crashes)
2. **Fix 1:** Create `useRegistrationInquiries` hook
3. **Fix 2:** Add cache invalidation calls
4. **Fix 3:** Add socket event handlers
5. **Fix 4:** Replace `confirm()` with dialog

## Testing Checklist

- [ ] Accept registration inquiry → UI updates immediately
- [ ] Reject registration inquiry → Confirmation dialog appears
- [ ] Reject with confirmation → UI updates immediately
- [ ] Multiple admin sessions → Real-time sync via socket
- [ ] Page refresh → Data is correctly loaded
- [ ] Error handling → Graceful handling of API failures

---

## Decision Required

**User Decision Needed:**

Please review this analysis and confirm if you would like me to proceed with implementing the fixes. I recommend implementing fixes in the order listed above, starting with the critical cache invalidation issue.

**Estimated Implementation Time:** 2-3 hours for complete fix

**Risk Level:** Low - All changes are localized to the admin page and related hooks

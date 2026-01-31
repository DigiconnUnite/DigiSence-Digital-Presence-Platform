import { useState, useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  invalidateRegistrationInquiries, 
  invalidateBusinesses, 
  invalidateProfessionals 
} from '@/lib/cacheInvalidation';

export interface RegistrationInquiry {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  companyName: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountData {
  email: string;
  fullName: string;
  phone: string;
  companyName: string;
  categoryId: string;
  subcategoryId?: string;
  password: string;
  confirmPassword: string;
  inquiryId: string;
}

interface UseRegistrationInquiriesOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useRegistrationInquiries(options: UseRegistrationInquiriesOptions = {}) {
  const { autoRefresh = true, refreshInterval = 30000 } = options;

  const [inquiries, setInquiries] = useState<RegistrationInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<RegistrationInquiry | null>(null);
  const queryClient = useQueryClient();
  
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchInquiries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/registration-inquiries');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch inquiries: ${response.status}`);
      }

      const data = await response.json();
      setInquiries(data.inquiries || []);
    } catch (err) {
      console.error('Error fetching registration inquiries:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch inquiries');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleApprove = useCallback(async (inquiryId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/registration-inquiries/${inquiryId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to approve inquiry: ${response.status}`);
      }

      // Invalidate cache for registration inquiries
      invalidateRegistrationInquiries(queryClient);
      
      // Also invalidate businesses to reflect new accounts
      invalidateBusinesses(queryClient);
      invalidateProfessionals(queryClient);

      // Refresh the inquiries list
      await fetchInquiries();
      
      return true;
    } catch (err) {
      console.error('Error approving inquiry:', err);
      setError(err instanceof Error ? err.message : 'Failed to approve inquiry');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchInquiries, queryClient]);

  const handleReject = useCallback(async (inquiryId: string, reason: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/registration-inquiries/${inquiryId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        throw new Error(`Failed to reject inquiry: ${response.status}`);
      }

      // Invalidate cache for registration inquiries
      invalidateRegistrationInquiries(queryClient);
      
      // Refresh the inquiries list
      await fetchInquiries();
      
      return true;
    } catch (err) {
      console.error('Error rejecting inquiry:', err);
      setError(err instanceof Error ? err.message : 'Failed to reject inquiry');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchInquiries, queryClient]);

  const handleCreateAccount = useCallback(async (data: CreateAccountData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/registration-inquiries/create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to create account: ${response.status}`);
      }

      // Invalidate all relevant caches
      invalidateRegistrationInquiries(queryClient);
      invalidateBusinesses(queryClient);
      invalidateProfessionals(queryClient);

      // Refresh the inquiries list
      await fetchInquiries();
      
      return true;
    } catch (err) {
      console.error('Error creating account:', err);
      setError(err instanceof Error ? err.message : 'Failed to create account');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchInquiries, queryClient]);

  // Set up auto-refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshTimerRef.current = setInterval(() => {
        fetchInquiries();
      }, refreshInterval);
    }

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, fetchInquiries]);

  // Initial fetch
  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  return {
    inquiries,
    loading,
    error,
    selectedInquiry,
    setSelectedInquiry,
    refresh: fetchInquiries,
    approveInquiry: handleApprove,
    rejectInquiry: handleReject,
    createAccount: handleCreateAccount,
  };
}

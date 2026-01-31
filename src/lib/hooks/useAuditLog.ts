'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface AuditLogEntry {
  id: string
  action: string
  entityType: string
  entityId: string
  userId: string
  userEmail: string | null
  userName: string | null
  oldData: Record<string, any> | null
  newData: Record<string, any> | null
  ipAddress: string | null
  userAgent: string | null
  metadata: Record<string, any> | null
  createdAt: string
}

export interface AuditLogResponse {
  data: AuditLogEntry[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface AuditLogParams {
  entityType?: string
  entityId?: string
  userId?: string
  action?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

async function fetchAuditLogs(params: AuditLogParams): Promise<AuditLogResponse> {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value))
    }
  })
  
  const response = await fetch(`/api/admin/audit-logs?${searchParams.toString()}`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch audit logs')
  }
  
  return response.json()
}

export function useAuditLogs(params: AuditLogParams = {}) {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => fetchAuditLogs(params),
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useAuditLogsInfinite(params: AuditLogParams = {}) {
  return useInfiniteQuery({
    queryKey: ['audit-logs', params],
    queryFn: ({ pageParam = 1 }) => fetchAuditLogs({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1
      }
      return undefined
    },
  })
}

import { useInfiniteQuery } from '@tanstack/react-query'

export function useCreateAuditLog() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: {
      action: string
      entityType: string
      entityId: string
      userId: string
      userEmail?: string
      userName?: string
      oldData?: Record<string, any>
      newData?: Record<string, any>
      metadata?: Record<string, any>
    }) => {
      const response = await fetch('/api/admin/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw new Error('Failed to create audit log')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
    },
  })
}

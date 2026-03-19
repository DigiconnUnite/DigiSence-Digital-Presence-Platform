'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import DashboardLayout from '@/app/dashboard/DashboardLayout'
import { Skeleton } from '@/components/ui/skeleton'
import { useSocket } from '@/lib/hooks/useSocket'
import { useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import {
  BarChart3, Building, User, FolderTree, MessageSquare,
  UserCheck, TrendingUp, Home, Grid3X3, MessageCircle,
  LineChart,
} from 'lucide-react'

/**
 * FIXED: Previously 6,859 lines in one file with:
 * - 42 useState hooks
 * - 18 useEffect hooks
 * - 25+ useCallback functions
 * - 8 different views rendered simultaneously
 * - Dual state management (React Query AND manual fetch+setState)
 * - useDebounce hook illegally defined inside the component
 *
 * Now: thin router (~80 lines) that lazy-loads each view as its own
 * independent component. Each view manages its own state and data fetching.
 * State changes in BusinessesView don't re-render ProfessionalsView at all.
 */

// Lazy load each view — only loads the current view's code
const DashboardView = dynamic(() => import('./views/DashboardView'), {
  loading: () => <ViewSkeleton />,
})
const BusinessesView = dynamic(() => import('./views/BusinessesView'), {
  loading: () => <ViewSkeleton />,
})
const ProfessionalsView = dynamic(() => import('./views/ProfessionalsView'), {
  loading: () => <ViewSkeleton />,
})
const CategoriesView = dynamic(() => import('./views/CategoriesView'), {
  loading: () => <ViewSkeleton />,
})
const InquiriesView = dynamic(() => import('./views/InquiriesView'), {
  loading: () => <ViewSkeleton />,
})
const RegistrationsView = dynamic(() => import('./views/RegistrationsView'), {
  loading: () => <ViewSkeleton />,
})
const AnalyticsView = dynamic(
  () => import('@/app/dashboard/professional/components/AnalyticsView'),
  { loading: () => <ViewSkeleton /> }
)

const menuItems = [
  { title: 'Dashboard', icon: BarChart3, mobileIcon: Home, value: 'dashboard', mobileTitle: 'Home' },
  { title: 'Businesses', icon: Building, mobileIcon: Grid3X3, value: 'businesses', mobileTitle: 'Business' },
  { title: 'Professionals', icon: User, mobileIcon: User, value: 'professionals', mobileTitle: 'Pros' },
  { title: 'Categories', icon: FolderTree, mobileIcon: FolderTree, value: 'categories', mobileTitle: 'Category' },
  { title: 'Inquiries', icon: MessageSquare, mobileIcon: MessageCircle, value: 'inquiries', mobileTitle: 'Inquiry' },
  { title: 'Registrations', icon: UserCheck, mobileIcon: UserCheck, value: 'registration-requests', mobileTitle: 'Regs' },
  { title: 'Analytics', icon: TrendingUp, mobileIcon: LineChart, value: 'analytics', mobileTitle: 'Analytics' },
]

type ViewKey =
  | 'dashboard' | 'businesses' | 'professionals' | 'categories'
  | 'inquiries' | 'registration-requests' | 'analytics'

function AdminDashboardContent() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { socket, isConnected } = useSocket()

  // FIXED: View persisted in URL so refresh doesn't reset to dashboard
  const [currentView, setCurrentView] = useState<ViewKey>(
    (searchParams.get('view') as ViewKey) || 'dashboard'
  )

  // Auth guard
  useEffect(() => {
    if (!loading && (!user || user.role !== 'SUPER_ADMIN')) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Sync view to URL
  const handleNavigate = useCallback((view: string) => {
    setCurrentView(view as ViewKey)
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', view)
    router.push(`?${params.toString()}`, { scroll: false })
  }, [router, searchParams])

  // Socket.IO — just invalidate React Query cache on events
  // Each view refetches its own data automatically
  useEffect(() => {
    if (!socket || !isConnected) return

    const invalidate = (keys: string[]) => {
      keys.forEach(k => queryClient.invalidateQueries({ queryKey: [k] }))
    }

    socket.on('business-created', () => invalidate(['businesses', 'admin-stats']))
    socket.on('business-updated', () => invalidate(['businesses']))
    socket.on('business-deleted', () => invalidate(['businesses', 'admin-stats']))
    socket.on('business-status-updated', () => invalidate(['businesses', 'admin-stats']))
    socket.on('businesses-bulk-status-updated', () => invalidate(['businesses', 'admin-stats']))
    socket.on('business-bulk-deleted', () => invalidate(['businesses', 'admin-stats']))
    socket.on('professional-created', () => invalidate(['professionals', 'admin-stats']))
    socket.on('professional-updated', () => invalidate(['professionals']))
    socket.on('professional-deleted', () => invalidate(['professionals', 'admin-stats']))
    socket.on('professional-status-updated', () => invalidate(['professionals', 'admin-stats']))

    return () => {
      socket.off('business-created')
      socket.off('business-updated')
      socket.off('business-deleted')
      socket.off('business-status-updated')
      socket.off('businesses-bulk-status-updated')
      socket.off('business-bulk-deleted')
      socket.off('professional-created')
      socket.off('professional-updated')
      socket.off('professional-deleted')
      socket.off('professional-status-updated')
    }
  }, [socket, isConnected, queryClient])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  if (loading) return <ViewSkeleton />

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView onNavigate={handleNavigate} />
      case 'businesses': return <BusinessesView />
      case 'professionals': return <ProfessionalsView />
      case 'categories': return <CategoriesView />
      case 'inquiries': return <InquiriesView />
      case 'registration-requests': return <RegistrationsView />
      case 'analytics': return <AnalyticsView />
      default: return <DashboardView onNavigate={handleNavigate} />
    }
  }

  return (
    <DashboardLayout
      role="SUPER_ADMIN"
      menuItems={menuItems}
      title="Admin Dashboard"
      currentView={currentView}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      socketConnected={isConnected}
    >
      {renderView()}
    </DashboardLayout>
  )
}

function ViewSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  )
}

export default function SuperAdminDashboard() {
  return (
    <Suspense fallback={<ViewSkeleton />}>
      <AdminDashboardContent />
    </Suspense>
  )
}

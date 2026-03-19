'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Building, Users, MessageSquare, Package,
  TrendingUp, CheckCircle, Clock, UserCheck,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface AdminStats {
  totalBusinesses: number
  activeBusinesses: number
  inactiveBusinesses: number
  totalProfessionals: number
  activeProfessionals: number
  totalInquiries: number
  pendingRegistrations: number
  totalProducts: number
  activeProducts: number
  totalUsers: number
}

interface DashboardViewProps {
  onNavigate: (view: string) => void
}

/**
 * Extracted from the 6,859-line admin page.tsx.
 * This component is responsible ONLY for the overview dashboard tab.
 * Has its own data fetching via the new /api/admin/stats endpoint.
 */
export default function DashboardView({ onNavigate }: DashboardViewProps) {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentBusinesses, setRecentBusinesses] = useState<any[]>([])
  const [recentProfessionals, setRecentProfessionals] = useState<any[]>([])
  const [pendingRegistrations, setPendingRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [statsRes, businessRes, proRes, regRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/businesses?limit=5&sortBy=createdAt&sortOrder=desc'),
        fetch('/api/admin/professionals?limit=5&sortBy=createdAt&sortOrder=desc'),
        fetch('/api/registration-inquiries?status=PENDING&limit=5'),
      ])

      if (statsRes.ok) setStats(await statsRes.json())
      if (businessRes.ok) {
        const d = await businessRes.json()
        setRecentBusinesses(d.businesses || [])
      }
      if (proRes.ok) {
        const d = await proRes.json()
        setRecentProfessionals(d.professionals || [])
      }
      if (regRes.ok) {
        const d = await regRes.json()
        setPendingRegistrations(d.inquiries || [])
      }
    } catch (err) {
      console.error('Dashboard data fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <DashboardSkeleton />

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Real-time statistics and recent activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Businesses"
          value={stats?.totalBusinesses ?? 0}
          subtitle={`${stats?.activeBusinesses ?? 0} active`}
          icon={<Building className="h-5 w-5 text-blue-500" />}
          onClick={() => onNavigate('businesses')}
        />
        <StatCard
          title="Professionals"
          value={stats?.totalProfessionals ?? 0}
          subtitle={`${stats?.activeProfessionals ?? 0} active`}
          icon={<Users className="h-5 w-5 text-purple-500" />}
          onClick={() => onNavigate('professionals')}
        />
        <StatCard
          title="Total Inquiries"
          value={stats?.totalInquiries ?? 0}
          subtitle="All time"
          icon={<MessageSquare className="h-5 w-5 text-green-500" />}
          onClick={() => onNavigate('inquiries')}
        />
        <StatCard
          title="Pending Registrations"
          value={stats?.pendingRegistrations ?? 0}
          subtitle="Awaiting review"
          icon={<Clock className="h-5 w-5 text-amber-500" />}
          onClick={() => onNavigate('registration-requests')}
          highlight={stats?.pendingRegistrations ? stats.pendingRegistrations > 0 : false}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Businesses */}
        <Card className="border border-gray-200 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Recent Businesses</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('businesses')} className="text-xs">
              View all →
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentBusinesses.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No businesses yet</p>
            ) : recentBusinesses.map((b) => (
              <div key={b.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 shrink-0">
                  {b.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{b.name}</p>
                  <p className="text-xs text-gray-400">{b.admin?.email}</p>
                </div>
                <Badge variant={b.isActive ? 'default' : 'secondary'} className="text-xs shrink-0">
                  {b.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Professionals */}
        <Card className="border border-gray-200 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Recent Professionals</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('professionals')} className="text-xs">
              View all →
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentProfessionals.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No professionals yet</p>
            ) : recentProfessionals.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-600 shrink-0">
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.professionalHeadline || p.admin?.email}</p>
                </div>
                <Badge variant={p.isActive ? 'default' : 'secondary'} className="text-xs shrink-0">
                  {p.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>

      {/* Pending Registrations */}
      {pendingRegistrations.length > 0 && (
        <Card className="border border-amber-200 bg-amber-50 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold text-amber-800 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Registration Requests ({pendingRegistrations.length})
            </CardTitle>
            <Button size="sm" onClick={() => onNavigate('registration-requests')}
              className="text-xs bg-amber-600 hover:bg-amber-700 text-white">
              Review All
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingRegistrations.slice(0, 3).map((r) => (
              <div key={r.id} className="flex items-center gap-3 bg-white rounded-xl p-3">
                <Badge variant="outline" className="text-xs shrink-0 border-amber-300 text-amber-700">
                  {r.type}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{r.name}</p>
                  <p className="text-xs text-gray-400">{r.email}</p>
                </div>
                <p className="text-xs text-gray-400 shrink-0">
                  {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="border border-gray-200 rounded-2xl">
        <CardHeader><CardTitle className="text-base font-semibold">Quick Actions</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button size="sm" onClick={() => onNavigate('businesses')}
            className="rounded-full bg-slate-800 text-white hover:bg-slate-700">
            + Add Business
          </Button>
          <Button size="sm" onClick={() => onNavigate('professionals')}
            className="rounded-full bg-slate-800 text-white hover:bg-slate-700">
            + Add Professional
          </Button>
          <Button size="sm" variant="outline" onClick={() => onNavigate('categories')} className="rounded-full">
            Manage Categories
          </Button>
          <Button size="sm" variant="outline" onClick={() => onNavigate('registration-requests')} className="rounded-full">
            Registration Requests
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ title, value, subtitle, icon, onClick, highlight = false }: {
  title: string; value: number; subtitle: string; icon: React.ReactNode;
  onClick?: () => void; highlight?: boolean;
}) {
  return (
    <Card
      className={`border rounded-2xl cursor-pointer transition-shadow hover:shadow-md ${highlight ? 'border-amber-300 bg-amber-50' : 'border-gray-200'}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</div>
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div><Skeleton className="h-7 w-48 mb-2" /><Skeleton className="h-4 w-64" /></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => (
          <Card key={i} className="border border-gray-200 rounded-2xl">
            <CardHeader className="pb-2"><Skeleton className="h-4 w-32" /></CardHeader>
            <CardContent><Skeleton className="h-8 w-16 mb-1" /><Skeleton className="h-3 w-24" /></CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1,2].map(i => (
          <Card key={i} className="border border-gray-200 rounded-2xl">
            <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
            <CardContent className="space-y-3">
              {[1,2,3].map(j => (
                <div key={j} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1"><Skeleton className="h-4 w-32 mb-1" /><Skeleton className="h-3 w-24" /></div>
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

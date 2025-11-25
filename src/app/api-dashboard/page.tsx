'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, Clock, Zap } from 'lucide-react'

interface HealthCheckResult {
  service: string
  status: 'healthy' | 'unhealthy'
  responseTime?: number
  error?: string
  details?: any
}

interface HealthReport {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  uptime: number
  version: string
  checks: HealthCheckResult[]
  summary: {
    total: number
    healthy: number
    unhealthy: number
  }
}

interface ApiEndpoint {
  path: string
  methods: string[]
  description: string
  category: string
  authRequired: boolean
  authRole?: string
  status?: 'healthy' | 'unhealthy' | 'unknown'
  responseTime?: number
  error?: string
  lastChecked?: string
}

const API_ENDPOINTS: ApiEndpoint[] = [
  // Root API
  { path: '/api', methods: ['GET'], description: 'Basic API health check', category: 'Root', authRequired: false },

  // Authentication
  { path: '/api/auth/login', methods: ['POST'], description: 'User login', category: 'Authentication', authRequired: false },
  { path: '/api/auth/logout', methods: ['POST'], description: 'User logout', category: 'Authentication', authRequired: true },
  { path: '/api/auth/me', methods: ['GET'], description: 'Get current user info', category: 'Authentication', authRequired: true },

  // Admin APIs
  { path: '/api/admin/businesses', methods: ['GET', 'POST', 'PUT', 'DELETE'], description: 'Business management', category: 'Admin', authRequired: true, authRole: 'SUPER_ADMIN' },
  { path: '/api/admin/businesses/[id]', methods: ['POST', 'DELETE', 'PUT'], description: 'Business CRUD operations', category: 'Admin', authRequired: true, authRole: 'SUPER_ADMIN' },
  { path: '/api/admin/categories', methods: ['GET', 'POST', 'PUT', 'DELETE'], description: 'Category management', category: 'Admin', authRequired: true, authRole: 'SUPER_ADMIN' },
  { path: '/api/admin/categories/[id]', methods: ['PUT', 'DELETE'], description: 'Category operations', category: 'Admin', authRequired: true, authRole: 'SUPER_ADMIN' },
  { path: '/api/admin/password-reset', methods: ['POST'], description: 'Reset business admin password', category: 'Admin', authRequired: true, authRole: 'SUPER_ADMIN' },

  // Business APIs
  { path: '/api/business', methods: ['GET', 'PUT', 'POST'], description: 'Business profile management', category: 'Business', authRequired: true, authRole: 'BUSINESS_ADMIN' },
  { path: '/api/business/categories', methods: ['GET', 'POST', 'PUT', 'DELETE'], description: 'Product categories', category: 'Business', authRequired: true, authRole: 'BUSINESS_ADMIN' },
  { path: '/api/business/inquiries', methods: ['GET'], description: 'Business inquiries', category: 'Business', authRequired: true, authRole: 'BUSINESS_ADMIN' },
  { path: '/api/business/inquiries/[id]', methods: ['PUT'], description: 'Update inquiry status', category: 'Business', authRequired: true, authRole: 'BUSINESS_ADMIN' },
  { path: '/api/business/products', methods: ['GET', 'POST', 'PUT', 'DELETE'], description: 'Product management', category: 'Business', authRequired: true, authRole: 'BUSINESS_ADMIN' },
  { path: '/api/business/products/[id]', methods: ['PUT', 'DELETE'], description: 'Product operations', category: 'Business', authRequired: true, authRole: 'BUSINESS_ADMIN' },
  { path: '/api/business/products/[id]/toggle', methods: ['PUT'], description: 'Toggle product status', category: 'Business', authRequired: true, authRole: 'BUSINESS_ADMIN' },
  { path: '/api/business/stats', methods: ['GET'], description: 'Business statistics', category: 'Business', authRequired: true, authRole: 'BUSINESS_ADMIN' },
  { path: '/api/business/upload', methods: ['POST'], description: 'File upload for business', category: 'Business', authRequired: true, authRole: 'BUSINESS_ADMIN' },

  // Public APIs
  { path: '/api/businesses', methods: ['GET'], description: 'List businesses', category: 'Public', authRequired: false },
  { path: '/api/businesses/[id]', methods: ['GET', 'PUT'], description: 'Business details', category: 'Public', authRequired: true, authRole: 'BUSINESS_ADMIN' },
  { path: '/api/businesses/[id]/inquiries', methods: ['GET', 'PUT'], description: 'Business inquiries', category: 'Public', authRequired: true, authRole: 'BUSINESS_ADMIN' },
  { path: '/api/businesses/[id]/inquiries/[inquiryId]', methods: ['PUT'], description: 'Inquiry operations', category: 'Public', authRequired: true, authRole: 'BUSINESS_ADMIN' },
  { path: '/api/businesses/[id]/products', methods: ['GET', 'POST'], description: 'Business products', category: 'Public', authRequired: true, authRole: 'BUSINESS_ADMIN' },
  { path: '/api/businesses/[id]/products/[productId]', methods: ['PUT', 'DELETE'], description: 'Product operations', category: 'Public', authRequired: true, authRole: 'BUSINESS_ADMIN' },
  { path: '/api/businesses/[id]/products/[productId]/toggle', methods: ['PUT'], description: 'Toggle product', category: 'Public', authRequired: true, authRole: 'BUSINESS_ADMIN' },
  { path: '/api/categories', methods: ['GET'], description: 'List categories', category: 'Public', authRequired: false },
  { path: '/api/brands', methods: ['GET', 'POST', 'PUT', 'DELETE'], description: 'Brand management', category: 'Public', authRequired: true, authRole: 'BUSINESS_ADMIN/SUPER_ADMIN' },
  { path: '/api/inquiries', methods: ['GET', 'POST'], description: 'Inquiry management', category: 'Public', authRequired: false },
  { path: '/api/business-listing-inquiries', methods: ['GET', 'POST'], description: 'Business listing inquiries', category: 'Public', authRequired: false },
  { path: '/api/business-listing-inquiries/[id]', methods: ['PUT', 'DELETE'], description: 'Inquiry operations', category: 'Public', authRequired: true, authRole: 'SUPER_ADMIN' },
  { path: '/api/upload', methods: ['POST'], description: 'General file upload', category: 'Public', authRequired: false },
  { path: '/api/notifications', methods: ['POST'], description: 'Send notifications', category: 'Public', authRequired: false },

  // Health
  { path: '/api/health', methods: ['GET'], description: 'System health check', category: 'Health', authRequired: false },
]

export default function ApiDashboard() {
  const [healthReport, setHealthReport] = useState<HealthReport | null>(null)
  const [apiStatuses, setApiStatuses] = useState<ApiEndpoint[]>(API_ENDPOINTS)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  const fetchHealthData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/health')
      const data: HealthReport = await response.json()
      setHealthReport(data)
      setLastUpdated(new Date().toLocaleString())

      // Update API statuses based on health checks
      const updatedStatuses = apiStatuses.map(api => {
        const healthCheck = data.checks.find(check =>
          check.service === api.path.replace('/api/', '').replace(/\//g, '-') + '-api' ||
          check.service === api.path.replace('/api/', '') ||
          (api.path === '/api' && check.service === 'root-api')
        )

        if (healthCheck) {
          return {
            ...api,
            status: healthCheck.status,
            responseTime: healthCheck.responseTime,
            error: healthCheck.error,
            lastChecked: data.timestamp
          }
        }

        return { ...api, status: 'unknown' as const }
      })

      setApiStatuses(updatedStatuses)
    } catch (error) {
      console.error('Failed to fetch health data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealthData()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealthData, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'unhealthy':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="default" className="bg-green-100 text-green-800">Healthy</Badge>
      case 'unhealthy':
        return <Badge variant="destructive">Unhealthy</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getMethodBadges = (methods: string[]) => {
    return methods.map(method => {
      const colorClass = {
        GET: 'bg-blue-100 text-blue-800',
        POST: 'bg-green-100 text-green-800',
        PUT: 'bg-yellow-100 text-yellow-800',
        DELETE: 'bg-red-100 text-red-800'
      }[method] || 'bg-gray-100 text-gray-800'

      return (
        <Badge key={method} variant="outline" className={`mr-1 ${colorClass}`}>
          {method}
        </Badge>
      )
    })
  }

  const categories = ['All', ...Array.from(new Set(API_ENDPOINTS.map(api => api.category)))]

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Monitoring Dashboard</h1>
          <p className="text-muted-foreground">Monitor all API endpoints and their health status</p>
        </div>
        <Button onClick={fetchHealthData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overall Health Summary */}
      {healthReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {healthReport.status === 'healthy' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              System Health: {healthReport.status === 'healthy' ? 'Healthy' : 'Unhealthy'}
            </CardTitle>
            <CardDescription>
              Last updated: {lastUpdated} | Uptime: {Math.floor(healthReport.uptime / 1000 / 60)}m
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{healthReport.summary.total}</div>
                <div className="text-sm text-muted-foreground">Total APIs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{healthReport.summary.healthy}</div>
                <div className="text-sm text-muted-foreground">Healthy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{healthReport.summary.unhealthy}</div>
                <div className="text-sm text-muted-foreground">Unhealthy</div>
              </div>
            </div>
            <Progress
              value={(healthReport.summary.healthy / healthReport.summary.total) * 100}
              className="w-full"
            />
          </CardContent>
        </Card>
      )}

      {/* API Endpoints by Category */}
      <Tabs defaultValue="All" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          {categories.slice(0, 6).map(category => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map(category => (
          <TabsContent key={category} value={category}>
            <Card>
              <CardHeader>
                <CardTitle>{category} APIs</CardTitle>
                <CardDescription>
                  {apiStatuses.filter(api => category === 'All' || api.category === category).length} endpoints
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Endpoint</TableHead>
                      <TableHead>Methods</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Auth</TableHead>
                      <TableHead>Response Time</TableHead>
                      <TableHead>Issues</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiStatuses
                      .filter(api => category === 'All' || api.category === category)
                      .map(api => (
                        <TableRow key={api.path}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(api.status || 'unknown')}
                              {getStatusBadge(api.status || 'unknown')}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{api.path}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {getMethodBadges(api.methods)}
                            </div>
                          </TableCell>
                          <TableCell>{api.description}</TableCell>
                          <TableCell>
                            {api.authRequired ? (
                              <Badge variant="outline">
                                {api.authRole || 'Required'}
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Public</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {api.responseTime ? (
                              <div className="flex items-center gap-1">
                                <Zap className="h-3 w-3" />
                                {api.responseTime}ms
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {api.error ? (
                              <Alert className="border-red-200">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                <AlertTitle className="text-red-800">Error</AlertTitle>
                                <AlertDescription className="text-red-700 text-sm">
                                  {api.error}
                                </AlertDescription>
                              </Alert>
                            ) : (
                              <span className="text-muted-foreground">No issues</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Detailed Health Checks */}
      {healthReport && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Health Checks</CardTitle>
            <CardDescription>Individual service health status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {healthReport.checks.map(check => (
                <div key={check.service} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(check.status)}
                    <div>
                      <div className="font-medium">{check.service}</div>
                      {check.details && (
                        <div className="text-sm text-muted-foreground">
                          Status Code: {check.details.statusCode || 'N/A'}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm">
                      {check.responseTime ? `${check.responseTime}ms` : 'N/A'}
                    </div>
                    {check.error && (
                      <div className="text-sm text-red-600 mt-1">
                        {check.error}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
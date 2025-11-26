import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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

const START_TIME = Date.now()

async function checkDatabase(): Promise<HealthCheckResult> {
  const startTime = Date.now()
  try {
    // Simple database connectivity check for MongoDB
    await db.user.count()
    return {
      service: 'database',
      status: 'healthy',
      responseTime: Date.now() - startTime,
      details: { message: 'Database connection successful' }
    }
  } catch (error) {
    return {
      service: 'database',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Database connection failed'
    }
  }
}

async function checkApiEndpoint(url: string, method: string = 'GET', serviceName: string): Promise<HealthCheckResult> {
  const startTime = Date.now()
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const response = await fetch(url, {
      method,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    clearTimeout(timeoutId)

    if (response.ok) {
      return {
        service: serviceName,
        status: 'healthy',
        responseTime: Date.now() - startTime,
        details: { statusCode: response.status }
      }
    } else {
      return {
        service: serviceName,
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: `HTTP ${response.status}: ${response.statusText}`
      }
    }
  } catch (error) {
    return {
      service: serviceName,
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Request failed'
    }
  }
}

async function performHealthChecks(): Promise<HealthReport> {
  const checks: HealthCheckResult[] = []

  // Check database
  checks.push(await checkDatabase())

  // Check key public API endpoints
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

  const endpointsToCheck = [
    { url: `${baseUrl}/api`, method: 'GET', name: 'root-api' },
    { url: `${baseUrl}/api/categories`, method: 'GET', name: 'categories-api' },
    { url: `${baseUrl}/api/brands`, method: 'GET', name: 'brands-api' },
    { url: `${baseUrl}/api/businesses`, method: 'GET', name: 'businesses-api' },
    { url: `${baseUrl}/api/inquiries`, method: 'GET', name: 'inquiries-api' },
    { url: `${baseUrl}/api/business-listing-inquiries`, method: 'GET', name: 'business-listing-inquiries-api' },
  ]

  // Run endpoint checks in parallel
  const endpointChecks = await Promise.all(
    endpointsToCheck.map(endpoint =>
      checkApiEndpoint(endpoint.url, endpoint.method, endpoint.name)
    )
  )

  checks.push(...endpointChecks)

  // Calculate summary
  const healthy = checks.filter(check => check.status === 'healthy').length
  const unhealthy = checks.filter(check => check.status === 'unhealthy').length
  const total = checks.length

  const overallStatus = unhealthy === 0 ? 'healthy' : 'unhealthy'

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: Date.now() - START_TIME,
    version: process.env.npm_package_version || '1.0.0',
    checks,
    summary: {
      total,
      healthy,
      unhealthy
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const healthReport = await performHealthChecks()

    // Return appropriate HTTP status based on health
    const statusCode = healthReport.status === 'healthy' ? 200 : 503

    return NextResponse.json(healthReport, { status: statusCode })
  } catch (error) {
    console.error('Health check failed:', error)

    const errorReport: HealthReport = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: Date.now() - START_TIME,
      version: process.env.npm_package_version || '1.0.0',
      checks: [{
        service: 'health-check-system',
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Health check system failed'
      }],
      summary: {
        total: 1,
        healthy: 0,
        unhealthy: 1
      }
    }

    return NextResponse.json(errorReport, { status: 503 })
  }
}
import { db } from '@/lib/db'
import { headers } from 'next/headers'

export type AuditAction = 
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'VIEW'
  | 'LOGIN'
  | 'LOGOUT'
  | 'EXPORT'
  | 'IMPORT'
  | 'BULK_DELETE'
  | 'DUPLICATE'
  | 'STATUS_CHANGE'
  | 'PASSWORD_CHANGE'

export interface AuditLogInput {
  action: AuditAction
  entityType: string
  entityId: string
  userId: string
  userEmail?: string
  userName?: string
  oldData?: Record<string, any>
  newData?: Record<string, any>
  metadata?: Record<string, any>
}

export async function createAuditLog(input: AuditLogInput): Promise<void> {
  try {
    const headersList = await headers()
    const ipAddress = headersList.get('x-forwarded-for') || 
                      headersList.get('x-real-ip') || 
                      'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'

    await db.auditLog.create({
      data: {
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        userId: input.userId,
        userEmail: input.userEmail,
        userName: input.userName,
        oldData: input.oldData || null,
        newData: input.newData || null,
        ipAddress,
        userAgent,
        metadata: input.metadata || null,
      },
    })
  } catch (error) {
    // Don't throw - audit logging should not break main functionality
    console.error('Failed to create audit log:', error)
  }
}

export async function getAuditLogs(params: {
  entityType?: string
  entityId?: string
  userId?: string
  action?: AuditAction
  startDate?: Date
  endDate?: Date
  page?: number
  limit?: number
}) {
  const {
    entityType,
    entityId,
    userId,
    action,
    startDate,
    endDate,
    page = 1,
    limit = 50,
  } = params

  const where: any = {}

  if (entityType) where.entityType = entityType
  if (entityId) where.entityId = entityId
  if (userId) where.userId = userId
  if (action) where.action = action
  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) where.createdAt.gte = startDate
    if (endDate) where.createdAt.lte = endDate
  }

  const [data, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.auditLog.count({ where }),
  ])

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function getEntityAuditHistory(
  entityType: string,
  entityId: string
) {
  return db.auditLog.findMany({
    where: { entityType, entityId },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
}

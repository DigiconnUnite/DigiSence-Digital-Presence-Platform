import { db } from '@/lib/db'
import { AuthUser } from '@/lib/auth'

export interface SessionData {
  id: string
  userId: string
  token: string
  expiresAt: Date
}

export async function createSession(user: AuthUser, token: string): Promise<SessionData> {
  // Set expiration to match JWT expiration (7 days)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const session = await (db as any).session.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    },
  })

  return {
    id: session.id,
    userId: session.userId,
    token: session.token,
    expiresAt: session.expiresAt,
  }
}

export async function getSessionByToken(token: string): Promise<SessionData | null> {
  const session = await (db as any).session.findUnique({
    where: { token },
  })

  if (!session || session.expiresAt < new Date()) {
    return null
  }

  return {
    id: session.id,
    userId: session.userId,
    token: session.token,
    expiresAt: session.expiresAt,
  }
}

export async function invalidateUserSessions(userId: string): Promise<void> {
  await (db as any).session.deleteMany({
    where: { userId },
  })
}

export async function invalidateSession(token: string): Promise<void> {
  await (db as any).session.deleteMany({
    where: { token },
  })
}

export async function cleanupExpiredSessions(): Promise<void> {
  await (db as any).session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  })
}

export async function getUserActiveSessions(userId: string): Promise<SessionData[]> {
  const sessions = await (db as any).session.findMany({
    where: {
      userId,
      expiresAt: { gt: new Date() }
    },
    orderBy: { createdAt: 'desc' }
  })

  return sessions.map(session => ({
    id: session.id,
    userId: session.userId,
    token: session.token,
    expiresAt: session.expiresAt,
  }))
}
/**
 * Global type definitions for DigiSence Platform
 * This file extends the global namespace with platform-wide types
 */

import type { Server } from 'socket.io'

declare global {
  /**
   * Socket.IO server instance - available globally for real-time notifications
   * Must be initialized in server.js before use
   */
  var io: Server | undefined

  /**
   * Prisma database client - used for database operations
   */
  var prisma: import('@prisma/client').PrismaClient | undefined
}

export {}

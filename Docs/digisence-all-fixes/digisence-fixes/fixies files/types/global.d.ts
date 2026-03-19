import type { Server as SocketIOServer } from 'socket.io'

declare global {
  // Socket.IO server instance attached to the Node.js global
  // Used across API routes to emit real-time events
  var io: SocketIOServer | undefined
}

export {}

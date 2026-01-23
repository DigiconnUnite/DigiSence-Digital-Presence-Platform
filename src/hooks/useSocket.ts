import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export function useSocket(roomId?: string) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io({
      path: '/api/socket', // Must match the server path
    })

    socketInstance.on('connect', () => {
      setIsConnected(true)
      console.log('Connected to WebSocket')

      if (roomId) {
        socketInstance.emit('join-room', roomId)
      }
    })

    socketInstance.on('disconnect', () => {
      setIsConnected(false)
    })

    setSocket(socketInstance)

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect()
    }
  }, [roomId])

  return { socket, isConnected }
}
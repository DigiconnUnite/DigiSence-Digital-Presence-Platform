const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
const { Server } = require('socket.io')

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  // Initialize Socket.io
  const io = new Server(server, {
    path: '/api/socket', // Custom path to avoid conflicts
    addTrailingSlash: false,
  })

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    // Join a specific room based on business ID (useful for multi-tenant)
    socket.on('join-room', (roomId) => {
      socket.join(roomId)
      console.log(`Socket ${socket.id} joined room ${roomId}`)
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })

  // Expose io instance globally so API routes can access it
  global.io = io

  server.listen(3000, (err) => {
    if (err) throw err
    console.log('> Ready on http://localhost:3000')
  })
})
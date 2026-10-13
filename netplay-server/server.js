/**
 * EmulatorJS Netplay signaling server (based on EmulatorJS/EmulatorJS-Netplay).
 * Relays room listing + WebRTC signals; game sync is peer-to-peer.
 */
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

const app = express()
const server = http.createServer(app)

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  }),
)

app.get('/', (_req, res) => {
  res.type('text').send('VTR EmulatorJS Netplay OK')
})

app.get('/health', (_req, res) => {
  res.json({ ok: true, rooms: Object.keys(rooms).length })
})

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  // Cloud Run / proxies
  allowEIO3: true,
  transports: ['websocket', 'polling'],
})

const PORT = Number(process.env.PORT) || 3000
/** @type {Record<string, any>} */
let rooms = {}

const getClientIp = (socket) => {
  const forwarded = socket.handshake.headers['x-forwarded-for']
  if (forwarded) return String(forwarded).split(',')[0].trim()
  return socket.handshake.headers['x-real-ip'] || socket.handshake.address
}

setInterval(() => {
  for (const sessionId of Object.keys(rooms)) {
    if (!rooms[sessionId] || Object.keys(rooms[sessionId].players).length === 0) {
      delete rooms[sessionId]
    }
  }
}, 60_000)

app.get('/list', (req, res) => {
  const gameId = req.query.game_id
  const openRooms = Object.keys(rooms)
    .filter((sessionId) => {
      const room = rooms[sessionId]
      return (
        room &&
        Object.keys(room.players).length < room.maxPlayers &&
        String(room.gameId) === String(gameId)
      )
    })
    .reduce((acc, sessionId) => {
      const room = rooms[sessionId]
      const ownerPlayerId = Object.keys(room.players).find(
        (playerId) => room.players[playerId].socketId === room.owner,
      )
      const playerName = ownerPlayerId ? room.players[ownerPlayerId].player_name : 'Unknown'
      acc[sessionId] = {
        room_name: room.roomName,
        current: Object.keys(room.players).length,
        max: room.maxPlayers,
        player_name: playerName,
        hasPassword: !!room.password,
      }
      return acc
    }, {})
  res.json(openRooms)
})

io.on('connection', (socket) => {
  getClientIp(socket)

  socket.on('open-room', (data, callback) => {
    let sessionId
    let playerId
    let roomName
    let gameId
    let maxPlayers
    let playerName
    let roomPassword
    if (data?.extra) {
      sessionId = data.extra.sessionid
      playerId = data.extra.userid || data.extra.playerId
      roomName = data.extra.room_name
      gameId = data.extra.game_id
      maxPlayers = data.maxPlayers || 4
      playerName = data.extra.player_name || 'Unknown'
      roomPassword = data.extra.room_password || 'none'
    }
    if (!sessionId || !playerId) {
      return callback?.('Invalid data: sessionId and playerId required')
    }
    if (rooms[sessionId]) {
      return callback?.('Room already exists')
    }

    let finalDomain = data.extra?.domain
    if (finalDomain === undefined || finalDomain === null) finalDomain = 'unknown'

    rooms[sessionId] = {
      owner: socket.id,
      players: { [playerId]: { ...data.extra, socketId: socket.id, player_name: playerName } },
      peers: [],
      roomName: roomName || `Room ${sessionId}`,
      gameId: gameId || 'default',
      domain: finalDomain,
      password: data.password || (roomPassword !== 'none' ? roomPassword : null),
      maxPlayers,
    }
    socket.join(sessionId)
    socket.sessionId = sessionId
    socket.playerId = playerId
    io.to(sessionId).emit('users-updated', rooms[sessionId].players)
    callback?.(null)
  })

  socket.on('join-room', (data, callback) => {
    const { sessionid: sessionId, userid: playerId, player_name: playerName = 'Unknown' } =
      data?.extra || {}

    if (!sessionId || !playerId) {
      if (typeof callback === 'function') callback('Invalid data: sessionId and playerId required')
      return
    }

    const room = rooms[sessionId]
    if (!room) {
      if (typeof callback === 'function') callback('Room not found')
      return
    }

    const roomPassword = data.password || null
    if (room.password && room.password !== roomPassword) {
      if (typeof callback === 'function') callback('Incorrect password')
      return
    }

    if (Object.keys(room.players).length >= room.maxPlayers) {
      if (typeof callback === 'function') callback('Room full')
      return
    }

    room.players[playerId] = { ...data.extra, socketId: socket.id, player_name: playerName }
    socket.join(sessionId)
    socket.sessionId = sessionId
    socket.playerId = playerId

    io.to(sessionId).emit('users-updated', room.players)

    if (typeof callback === 'function') callback(null, room.players)
  })

  socket.on('leave-room', () => {
    if (!socket.sessionId || !socket.playerId) return
    const sessionId = socket.sessionId
    const playerId = socket.playerId
    if (!rooms[sessionId]) return

    delete rooms[sessionId].players[playerId]
    rooms[sessionId].peers = rooms[sessionId].peers.filter(
      (peer) => peer.source !== socket.id && peer.target !== socket.id,
    )
    io.to(sessionId).emit('users-updated', rooms[sessionId].players)

    if (Object.keys(rooms[sessionId].players).length === 0) {
      delete rooms[sessionId]
    } else if (socket.id === rooms[sessionId].owner) {
      const remainingPlayers = Object.keys(rooms[sessionId].players)
      if (remainingPlayers.length > 0) {
        const newOwnerId = rooms[sessionId].players[remainingPlayers[0]].socketId
        rooms[sessionId].owner = newOwnerId
        rooms[sessionId].peers = rooms[sessionId].peers.map((peer) => {
          if (peer.source === socket.id) return { source: newOwnerId, target: peer.target }
          return peer
        })
        if (rooms[sessionId].peers.length > 0) {
          io.to(newOwnerId).emit('webrtc-signal', {
            target: rooms[sessionId].peers[0].target,
            requestRenegotiate: true,
          })
        }
        io.to(sessionId).emit('users-updated', rooms[sessionId].players)
      }
    }
    socket.leave(sessionId)
    delete socket.sessionId
    delete socket.playerId
  })

  socket.on('webrtc-signal', (data) => {
    try {
      const { target, candidate, offer, answer, requestRenegotiate } = data || {}
      if (!target && !requestRenegotiate) {
        throw new Error('Target ID missing unless requesting renegotiation')
      }
      if (requestRenegotiate) {
        const targetSocket = io.sockets.sockets.get(target)
        if (targetSocket) {
          targetSocket.emit('webrtc-signal', {
            sender: socket.id,
            requestRenegotiate: true,
          })
        }
      } else {
        io.to(target).emit('webrtc-signal', {
          sender: socket.id,
          candidate,
          offer,
          answer,
        })
      }
    } catch (error) {
      console.error(`WebRTC signal error: ${error.message}`)
    }
  })

  socket.on('data-message', (data) => {
    if (socket.sessionId) socket.to(socket.sessionId).emit('data-message', data)
  })

  socket.on('snapshot', (data) => {
    if (socket.sessionId) socket.to(socket.sessionId).emit('snapshot', data)
  })

  socket.on('input', (data) => {
    if (socket.sessionId) socket.to(socket.sessionId).emit('input', data)
  })

  socket.on('disconnect', () => {
    const sessionId = socket.sessionId
    const playerId = socket.playerId
    if (!sessionId || !playerId || !rooms[sessionId]) return

    delete rooms[sessionId].players[playerId]
    rooms[sessionId].peers = rooms[sessionId].peers.filter(
      (peer) => peer.source !== socket.id && peer.target !== socket.id,
    )
    io.to(sessionId).emit('users-updated', rooms[sessionId].players)

    if (Object.keys(rooms[sessionId].players).length === 0) {
      delete rooms[sessionId]
    } else if (socket.id === rooms[sessionId].owner) {
      const remainingPlayers = Object.keys(rooms[sessionId].players)
      if (remainingPlayers.length > 0) {
        const newOwnerId = rooms[sessionId].players[remainingPlayers[0]].socketId
        rooms[sessionId].owner = newOwnerId
        rooms[sessionId].peers = rooms[sessionId].peers.map((peer) => {
          if (peer.source === socket.id) return { source: newOwnerId, target: peer.target }
          return peer
        })
        if (rooms[sessionId].peers.length > 0) {
          io.to(newOwnerId).emit('webrtc-signal', {
            target: rooms[sessionId].peers[0].target,
            requestRenegotiate: true,
          })
        }
        io.to(sessionId).emit('users-updated', rooms[sessionId].players)
      }
    }
  })
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`VTR Netplay listening on 0.0.0.0:${PORT}`)
})

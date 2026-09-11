// backend/src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { CORS_ORIGINS, PORT, IS_TEST } from './config';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: CORS_ORIGINS, methods: ['GET', 'POST'] },
});

app.use(cors({ origin: CORS_ORIGINS, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

import { systemDesignRouter } from './systemDesign';
import { infraRouter } from './infra';

// Simple health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
// Standardized API Routing
app.use('/api/v1/system-design', systemDesignRouter);
app.use('/api/v1/infra', infraRouter);

// Questions and answers are served via production authenticated APIs in backend/index.ts.
// Unfinished placeholder endpoints (/api/questions, /api/answers) removed to eliminate unrestricted echo and reduce attack surface (Issues 18 & 19).

import { getJwtSecret } from './config';
import jwt from 'jsonwebtoken';

// Issue 17: Socket.IO security hardening
// 1. Connection authentication middleware using JWT
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
  if (!token) {
    return next(new Error('Authentication error: Token required'));
  }
  jwt.verify(token, getJwtSecret(), (err: any, decoded: any) => {
    if (err || !decoded?.userId) {
      return next(new Error('Authentication error: Invalid or expired token'));
    }
    (socket as any).userId = decoded.userId;
    (socket as any).userRole = decoded.role;
    next();
  });
});

// WebSocket for collaborative canvas with room isolation, rate-limiting & payload validation
const socketMessageCounts = new Map<string, { count: number; resetTime: number }>();

io.on('connection', (socket: any) => {
  const userId = socket.userId;
  console.log(`[Socket] Authenticated client connected: ${socket.id} (user: ${userId})`);

import { collaborationEngine } from './collaboration';

  // Room authorization & join
  socket.on('canvas:join', (roomId: string) => {
    if (typeof roomId !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(roomId)) {
      socket.emit('error', { message: 'Invalid room ID' });
      return;
    }
    if (!collaborationEngine.isAuthorized(roomId, userId)) {
      socket.emit('error', { message: 'Unauthorized: Access to this canvas room is restricted' });
      return;
    }
    socket.join(`canvas:${roomId}`);
    socket.currentRoom = `canvas:${roomId}`;
  });

  // Collaborative canvas update with payload validation & rate limiting
  socket.on('canvas:update', (payload: any) => {
    // 1. Must be joined to a room
    if (!socket.currentRoom) {
      socket.emit('error', { message: 'Must join a canvas room before broadcasting updates' });
      return;
    }

    // 2. Per-socket sliding window rate limiting (max 50 canvas updates/second)
    const now = Date.now();
    const rateRecord = socketMessageCounts.get(socket.id) || { count: 0, resetTime: now + 1000 };
    if (now > rateRecord.resetTime) {
      rateRecord.count = 0;
      rateRecord.resetTime = now + 1000;
    }
    rateRecord.count++;
    socketMessageCounts.set(socket.id, rateRecord);
    if (rateRecord.count > 50) {
      socket.emit('error', { message: 'Rate limit exceeded: too many canvas updates' });
      return;
    }

    // 3. Payload schema validation
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return;
    }

    // Payload size cap (max 256 KB per update)
    if (JSON.stringify(payload).length > 256 * 1024) {
      socket.emit('error', { message: 'Payload size limit exceeded' });
      return;
    }

    // Safe scoped broadcast to verified room members only (not global broadcast)
    socket.to(socket.currentRoom).emit('canvas:update', {
      ...payload,
      senderId: userId,
      timestamp: now
    });
  });

  socket.on('disconnect', () => {
    socketMessageCounts.delete(socket.id);
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// Auxiliary Socket.IO server is opt-in. The production API is backend/index.ts.
// Starting both on PORT would bind-conflict and expose unauthenticated placeholder routes.
const SERVER_PORT = PORT;
if (!IS_TEST && process.env.CODEARENA_AUX_SERVER === "true") {
  httpServer.listen(SERVER_PORT, () => {
    console.log(`Auxiliary backend listening on http://localhost:${SERVER_PORT}`);
  });
}

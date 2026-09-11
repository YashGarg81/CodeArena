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
app.get('/api/v1/health', (_req, res) => res.json({ status: 'ok' }));

// Mount System Design API
app.use('/api/v1/system-design', systemDesignRouter);

// Mount Phase 4 Core Infrastructure API
app.use('/api/v1/infra', infraRouter);
app.use('/api/v1', infraRouter);

// Placeholder routes – will be expanded later
app.get('/api/questions', (_req, res) => {
  res.json({ message: 'Question list endpoint – to be implemented' });
});

app.post('/api/answers', (req, res) => {
  // In real implementation, validate and trigger scoring service
  res.json({ message: 'Answer received', data: req.body });
});

// WebSocket for collaborative canvas
io.on('connection', (socket: any) => {
  console.log('Client connected:', socket.id);
  socket.on('canvas:update', (payload: any) => {
    socket.broadcast.emit('canvas:update', payload);
  });
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

// Auxiliary Socket.IO server is opt-in. The production API is backend/index.ts.
// Starting both on PORT would bind-conflict and expose unauthenticated placeholder routes.
const SERVER_PORT = PORT;
if (!IS_TEST && process.env.CODEARENA_AUX_SERVER === "true") {
  httpServer.listen(SERVER_PORT, () => {
    console.log(`Auxiliary backend listening on http://localhost:${SERVER_PORT}`);
  });
}

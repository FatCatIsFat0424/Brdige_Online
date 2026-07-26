// ─── Server 進入點 ───

import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@shared/types';
import { setupConnectionHandler } from './socket/connection';
import { setupGameCallbacks } from './socket/game-handler';

const PORT = process.env.PORT ?? 3001;

// 1. 建立 Express app
const app = express();
app.use(cors());

// 健康檢查端點
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// 2. 建立 HTTP server
const httpServer = createServer(app);

// 3. 建立 Socket.IO server
const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
});

// 4. 設定遊戲 callbacks 與連線處理
setupGameCallbacks(io);
setupConnectionHandler(io);

// 5. 啟動 HTTP server
httpServer.listen(PORT, () => {
  console.warn(`[server] Bridge Online server running on port ${PORT}`);
});

export { io, httpServer };

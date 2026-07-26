// ─── Socket.IO Client 初始化 ───

import { io, Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '@shared/types';

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3001';

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SERVER_URL, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

/**
 * 連線到伺服器
 */
export function connectSocket(): void {
  if (!socket.connected) {
    socket.connect();
  }
}

/**
 * 斷開連線
 */
export function disconnectSocket(): void {
  if (socket.connected) {
    socket.disconnect();
  }
}

/**
 * 嘗試重連（使用 reconnectToken）
 */
export function attemptReconnect(token: string): Promise<{
  success: boolean;
  error?: string;
}> {
  return new Promise((resolve) => {
    socket.emit('player:reconnect', { token }, (response) => {
      resolve(response);
    });
  });
}

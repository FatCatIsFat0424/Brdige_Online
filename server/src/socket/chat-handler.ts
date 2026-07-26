// ─── Chat Handler：聊天事件處理（膠水層） ───

import type { Server as SocketIOServer, Socket } from 'socket.io';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@shared/types';
import * as playerManager from '../managers/player-manager';
import * as chatManager from '../managers/chat-manager';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type TypedServer = SocketIOServer<ClientToServerEvents, ServerToClientEvents>;

export function registerChatHandlers(_io: TypedServer, socket: TypedSocket): void {
  socket.on('chat:send', (payload, callback) => {
    const playerId = playerManager.getPlayerIdBySocketId(socket.id);
    if (!playerId) {
      return callback({ success: false, error: 'Player not found' });
    }

    const state = playerManager.getPlayerState(playerId);
    if (!state?.currentRoomCode) {
      return callback({ success: false, error: 'Not in a room' });
    }

    const playerInfo = playerManager.getPlayerInfo(playerId);
    if (!playerInfo) {
      return callback({ success: false, error: 'Player info not found' });
    }

    if (!payload.message || payload.message.trim().length === 0) {
      return callback({ success: false, error: 'Message is empty' });
    }

    const message = chatManager.addMessage(
      state.currentRoomCode,
      playerInfo,
      payload.message.trim(),
    );

    callback({ success: true });

    // 廣播給房間所有人（含發送者，以確認顯示）
    socket.to(state.currentRoomCode).emit('chat:received', { message });
  });
}

// ─── Connection Handler：連線管理 ───

import type { Server as SocketIOServer, Socket } from 'socket.io';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@shared/types';
import { RECONNECT_TIMEOUT_MS } from '@shared/constants';
import * as playerManager from '../managers/player-manager';
import * as roomManager from '../managers/room-manager';
import * as gameManager from '../managers/game-manager';
import { registerRoomHandlers } from './room-handler';
import { registerChatHandlers } from './chat-handler';
import { registerGameHandlers } from './game-handler';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type TypedServer = SocketIOServer<ClientToServerEvents, ServerToClientEvents>;

/** 斷線 timeout 計時器 */
const disconnectTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

export function setupConnectionHandler(io: TypedServer): void {
  io.on('connection', (socket: TypedSocket) => {
    console.warn(`[connection] Client connected: ${socket.id}`);

    // 註冊所有 handler
    registerRoomHandlers(io, socket);
    registerChatHandlers(io, socket);
    registerGameHandlers(io, socket);

    // ─── player:reconnect ───
    socket.on('player:reconnect', (payload, callback) => {
      const result = playerManager.attemptReconnect(socket.id, payload.token);

      if (!result.success) {
        return callback({ success: false, error: result.reason });
      }

      const { playerId, roomCode } = result;

      // 清除斷線計時器
      if (disconnectTimers.has(playerId)) {
        clearTimeout(disconnectTimers.get(playerId)!);
        disconnectTimers.delete(playerId);
      }

      // 如果在房間中，重新加入 socket room
      if (roomCode) {
        socket.join(roomCode);
        const seat = roomManager.getPlayerSeat(roomCode, playerId);
        if (seat) {
          socket.to(roomCode).emit('player:reconnected', { seat });
        }

        const room = roomManager.getRoomInfo(roomCode);
        const gameState = gameManager.hasActiveGame(roomCode) && seat
          ? gameManager.getPlayerVisibleState(roomCode, seat)
          : undefined;

        return callback({
          success: true,
          room: room ?? undefined,
          gameState: gameState ?? undefined,
        });
      }

      callback({ success: true });
    });

    // ─── 斷線處理 ───
    socket.on('disconnect', (reason) => {
      console.warn(`[connection] Client disconnected: ${socket.id}, reason: ${reason}`);

      const result = playerManager.markDisconnected(socket.id);
      if (!result) return;

      const { playerId } = result;
      const state = playerManager.getPlayerState(playerId);

      if (state?.currentRoomCode) {
        const seat = roomManager.getPlayerSeat(state.currentRoomCode, playerId);
        if (seat) {
          // 通知房間其他人有人斷線
          socket.to(state.currentRoomCode).emit('player:disconnected', { seat });
        }

        const roomInfo = roomManager.getRoomInfo(state.currentRoomCode);

        if (roomInfo && roomInfo.status === 'waiting') {
          // 等待中直接離開
          const { seat: leftSeat } = roomManager.leaveRoom(state.currentRoomCode, playerId);
          playerManager.setPlayerRoom(playerId, null);
          playerManager.removePlayer(playerId);

          if (leftSeat) {
            socket.to(state.currentRoomCode).emit('room:playerLeft', { playerId, seat: leftSeat });
          }
          const updatedRoom = roomManager.getRoomInfo(state.currentRoomCode);
          if (updatedRoom) {
            io.to(state.currentRoomCode).emit('room:updated', { room: updatedRoom });
          }
        } else if (roomInfo && roomInfo.status === 'playing') {
          // 遊戲中：啟動重連倒數
          const timer = setTimeout(() => {
            // 超時未重連 → 中止遊戲
            if (playerManager.isDisconnectTimedOut(playerId, RECONNECT_TIMEOUT_MS)) {
              const playerInfo = playerManager.getPlayerInfo(playerId);
              const name = playerInfo?.nickname ?? playerId;
              gameManager.abortGame(state.currentRoomCode!, `玩家 ${name} 斷線超時`);

              // 清理所有玩家狀態
              const seatMap = roomManager.getSeatPlayerMap(state.currentRoomCode!);
              for (const [, pid] of Object.entries(seatMap)) {
                if (pid) {
                  roomManager.leaveRoom(state.currentRoomCode!, pid);
                  playerManager.setPlayerRoom(pid, null);
                }
              }

              const updatedRoom = roomManager.getRoomInfo(state.currentRoomCode!);
              if (updatedRoom) {
                io.to(state.currentRoomCode!).emit('room:updated', { room: updatedRoom });
              }
            }
            disconnectTimers.delete(playerId);
          }, RECONNECT_TIMEOUT_MS);

          disconnectTimers.set(playerId, timer);
        }
      } else {
        // 不在任何房間，直接移除
        playerManager.removePlayer(playerId);
      }
    });
  });
}

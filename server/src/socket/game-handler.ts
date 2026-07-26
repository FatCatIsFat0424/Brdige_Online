// ─── Game Handler：遊戲事件處理（膠水層） ───

import type { Server as SocketIOServer, Socket } from 'socket.io';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  Seat,
} from '@shared/types';
import * as playerManager from '../managers/player-manager';
import * as roomManager from '../managers/room-manager';
import * as gameManager from '../managers/game-manager';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type TypedServer = SocketIOServer<ClientToServerEvents, ServerToClientEvents>;

/**
 * 設定遊戲 callbacks（在伺服器啟動時呼叫）
 */
export function setupGameCallbacks(io: TypedServer): void {
  gameManager.registerCallbacks({
    onDealt: (roomCode, hands) => {
      const seatMap = roomManager.getSeatPlayerMap(roomCode);
      const seats: Seat[] = ['N', 'E', 'S', 'W'];
      for (const seat of seats) {
        const pid = seatMap[seat];
        if (pid) {
          const state = playerManager.getPlayerState(pid);
          if (state) {
            io.to(state.socketId).emit('game:dealt', { hand: hands[seat] });
          }
        }
      }
    },

    onRedealAvailable: (roomCode, seat) => {
      io.to(roomCode).emit('game:redealAvailable', { seat });
    },

    onRedealt: (roomCode, hands) => {
      const seatMap = roomManager.getSeatPlayerMap(roomCode);
      const seats: Seat[] = ['N', 'E', 'S', 'W'];
      for (const seat of seats) {
        const pid = seatMap[seat];
        if (pid) {
          const state = playerManager.getPlayerState(pid);
          if (state) {
            io.to(state.socketId).emit('game:redealt', { hand: hands[seat] });
          }
        }
      }
    },

    onBiddingStart: (roomCode, startSeat) => {
      io.to(roomCode).emit('game:biddingStart', { startSeat });
    },

    onBidMade: (roomCode, seat, action) => {
      io.to(roomCode).emit('game:bidMade', { seat, action });
    },

    onBiddingEnd: (roomCode, contract) => {
      io.to(roomCode).emit('game:biddingEnd', { contract });
    },

    onTurnStart: (roomCode, seat, validCards) => {
      // 傳送合法出牌給當前玩家
      const pid = roomManager.getPlayerIdBySeat(roomCode, seat);
      if (pid) {
        const state = playerManager.getPlayerState(pid);
        if (state) {
          io.to(state.socketId).emit('game:turnStart', { seat, validCards });
        }
      }
      // 通知其他人輪到誰（不含合法牌）
      const seatMap = roomManager.getSeatPlayerMap(roomCode);
      const seats: Seat[] = ['N', 'E', 'S', 'W'];
      for (const s of seats) {
        if (s === seat) continue;
        const otherPid = seatMap[s];
        if (otherPid) {
          const otherState = playerManager.getPlayerState(otherPid);
          if (otherState) {
            io.to(otherState.socketId).emit('game:turnStart', { seat });
          }
        }
      }
    },

    onCardPlayed: (roomCode, seat, card) => {
      io.to(roomCode).emit('game:cardPlayed', { seat, card });
    },

    onTrickEnd: (roomCode, winner, cards, trickCountEW, trickCountNS) => {
      io.to(roomCode).emit('game:trickEnd', {
        winner,
        cards,
        trickCountEW,
        trickCountNS,
      });
    },

    onGameEnded: (roomCode, result) => {
      io.to(roomCode).emit('game:ended', { result });
      roomManager.setRoomStatus(roomCode, 'waiting');
      roomManager.resetAllReady(roomCode);
    },

    onGameAborted: (roomCode, reason) => {
      io.to(roomCode).emit('game:aborted', { reason });
      roomManager.setRoomStatus(roomCode, 'waiting');
      roomManager.resetAllReady(roomCode);
      gameManager.removeGame(roomCode);
    },

    onLogEntry: (roomCode, entry) => {
      io.to(roomCode).emit('game:logEntry', { entry });
    },
  });
}

/**
 * 註冊遊戲事件 handler
 */
export function registerGameHandlers(_io: TypedServer, socket: TypedSocket): void {
  // ─── game:redealResponse ───
  socket.on('game:redealResponse', (payload, callback) => {
    const playerId = playerManager.getPlayerIdBySocketId(socket.id);
    if (!playerId) return callback({ success: false, error: 'Player not found' });

    const state = playerManager.getPlayerState(playerId);
    if (!state?.currentRoomCode) return callback({ success: false, error: 'Not in a room' });

    const seat = roomManager.getPlayerSeat(state.currentRoomCode, playerId);
    if (!seat) return callback({ success: false, error: 'Not seated' });

    const result = gameManager.handleRedealResponse(state.currentRoomCode, seat, payload.accept);
    if (!result.success) return callback({ success: false, error: result.reason });

    callback({ success: true });
  });

  // ─── game:bid ───
  socket.on('game:bid', (payload, callback) => {
    const playerId = playerManager.getPlayerIdBySocketId(socket.id);
    if (!playerId) return callback({ success: false, error: 'Player not found' });

    const state = playerManager.getPlayerState(playerId);
    if (!state?.currentRoomCode) return callback({ success: false, error: 'Not in a room' });

    const seat = roomManager.getPlayerSeat(state.currentRoomCode, playerId);
    if (!seat) return callback({ success: false, error: 'Not seated' });

    const result = gameManager.handleBid(state.currentRoomCode, seat, payload.bid);
    if (!result.success) return callback({ success: false, error: result.reason });

    callback({ success: true });
  });

  // ─── game:playCard ───
  socket.on('game:playCard', (payload, callback) => {
    const playerId = playerManager.getPlayerIdBySocketId(socket.id);
    if (!playerId) return callback({ success: false, error: 'Player not found' });

    const state = playerManager.getPlayerState(playerId);
    if (!state?.currentRoomCode) return callback({ success: false, error: 'Not in a room' });

    const seat = roomManager.getPlayerSeat(state.currentRoomCode, playerId);
    if (!seat) return callback({ success: false, error: 'Not seated' });

    const result = gameManager.handlePlayCard(state.currentRoomCode, seat, payload.card);
    if (!result.success) return callback({ success: false, error: result.reason });

    callback({ success: true });
  });

  // ─── game:continue ───
  socket.on('game:continue', (callback) => {
    const playerId = playerManager.getPlayerIdBySocketId(socket.id);
    if (!playerId) return callback({ success: false, error: 'Player not found' });

    const state = playerManager.getPlayerState(playerId);
    if (!state?.currentRoomCode) return callback({ success: false, error: 'Not in a room' });

    // 清除舊遊戲，等待重新準備
    gameManager.removeGame(state.currentRoomCode);
    callback({ success: true });
  });
}

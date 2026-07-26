// ─── Room Handler：房間事件處理（膠水層） ───

import type { Server as SocketIOServer, Socket } from 'socket.io';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  Seat,
} from '@shared/types';
import { NICKNAME_MAX_LENGTH } from '@shared/constants';
import * as playerManager from '../managers/player-manager';
import * as roomManager from '../managers/room-manager';
import * as chatManager from '../managers/chat-manager';
import * as gameManager from '../managers/game-manager';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type TypedServer = SocketIOServer<ClientToServerEvents, ServerToClientEvents>;

export function registerRoomHandlers(io: TypedServer, socket: TypedSocket): void {
  // ─── player:setNickname ───
  socket.on('player:setNickname', (payload, callback) => {
    const { nickname, color } = payload;

    if (!nickname || nickname.trim().length === 0) {
      return callback({ success: false, error: 'Nickname is required' });
    }
    if (nickname.length > NICKNAME_MAX_LENGTH) {
      return callback({ success: false, error: `Nickname must be ${NICKNAME_MAX_LENGTH} characters or less` });
    }

    // 如果此 socket 已有玩家，不允許重複設定
    const existingId = playerManager.getPlayerIdBySocketId(socket.id);
    if (existingId) {
      return callback({ success: false, error: 'Already registered' });
    }

    const { playerId, reconnectToken } = playerManager.createPlayer(
      socket.id,
      nickname.trim(),
      color,
    );

    callback({ success: true, playerId, reconnectToken });
  });

  // ─── room:create ───
  socket.on('room:create', (payload, callback) => {
    const playerId = playerManager.getPlayerIdBySocketId(socket.id);
    if (!playerId) {
      return callback({ success: false, error: 'Player not found' });
    }

    const state = playerManager.getPlayerState(playerId);
    if (state?.currentRoomCode) {
      return callback({ success: false, error: 'Already in a room' });
    }

    const roomCode = roomManager.createRoom(payload.gameType);
    chatManager.initRoomChat(roomCode);
    playerManager.setPlayerRoom(playerId, roomCode);
    socket.join(roomCode);

    callback({ success: true, roomCode });
  });

  // ─── room:join ───
  socket.on('room:join', (payload, callback) => {
    const playerId = playerManager.getPlayerIdBySocketId(socket.id);
    if (!playerId) {
      return callback({ success: false, error: 'Player not found' });
    }

    const state = playerManager.getPlayerState(playerId);
    if (state?.currentRoomCode) {
      return callback({ success: false, error: 'Already in a room' });
    }

    const result = roomManager.joinRoom(payload.roomCode, playerId);
    if (!result.success) {
      return callback({ success: false, error: result.reason });
    }

    playerManager.setPlayerRoom(playerId, payload.roomCode);
    socket.join(payload.roomCode);

    const room = roomManager.getRoomInfo(payload.roomCode);
    callback({ success: true, room: room ?? undefined });

    // 廣播給房間其他人
    if (room) {
      socket.to(payload.roomCode).emit('room:updated', { room });
    }
  });

  // ─── room:leave ───
  socket.on('room:leave', (callback) => {
    const playerId = playerManager.getPlayerIdBySocketId(socket.id);
    if (!playerId) {
      return callback({ success: false, error: 'Player not found' });
    }

    const state = playerManager.getPlayerState(playerId);
    if (!state?.currentRoomCode) {
      return callback({ success: false, error: 'Not in a room' });
    }

    const roomCode = state.currentRoomCode;
    const { seat } = roomManager.leaveRoom(roomCode, playerId);
    playerManager.setPlayerRoom(playerId, null);
    socket.leave(roomCode);

    callback({ success: true });

    // 廣播離開事件
    if (seat) {
      socket.to(roomCode).emit('room:playerLeft', { playerId, seat });
    }
    // 廣播更新的房間狀態
    const updatedRoom = roomManager.getRoomInfo(roomCode);
    if (updatedRoom) {
      socket.to(roomCode).emit('room:updated', { room: updatedRoom });
    }
  });

  // ─── room:changeSeat ───
  socket.on('room:changeSeat', (payload, callback) => {
    const playerId = playerManager.getPlayerIdBySocketId(socket.id);
    if (!playerId) {
      return callback({ success: false, error: 'Player not found' });
    }

    const state = playerManager.getPlayerState(playerId);
    if (!state?.currentRoomCode) {
      return callback({ success: false, error: 'Not in a room' });
    }

    const validSeats: Seat[] = ['N', 'E', 'S', 'W'];
    if (!validSeats.includes(payload.seat)) {
      return callback({ success: false, error: 'Invalid seat' });
    }

    const result = roomManager.changeSeat(state.currentRoomCode, playerId, payload.seat);
    if (!result.success) {
      return callback({ success: false, error: result.reason });
    }

    callback({ success: true });

    // 廣播更新
    const room = roomManager.getRoomInfo(state.currentRoomCode);
    if (room) {
      io.to(state.currentRoomCode).emit('room:updated', { room });
    }
  });

  // ─── room:ready ───
  socket.on('room:ready', (callback) => {
    const playerId = playerManager.getPlayerIdBySocketId(socket.id);
    if (!playerId) {
      return callback({ success: false, error: 'Player not found' });
    }

    const state = playerManager.getPlayerState(playerId);
    if (!state?.currentRoomCode) {
      return callback({ success: false, error: 'Not in a room' });
    }

    const result = roomManager.setReady(state.currentRoomCode, playerId, true);
    if (!result.success) {
      return callback({ success: false, error: result.reason });
    }

    callback({ success: true });

    const room = roomManager.getRoomInfo(state.currentRoomCode);
    if (room) {
      io.to(state.currentRoomCode).emit('room:updated', { room });
    }

    // 檢查是否全部準備 → 開始遊戲
    if (roomManager.isAllReady(state.currentRoomCode)) {
      roomManager.setRoomStatus(state.currentRoomCode, 'playing');
      gameManager.startGame(state.currentRoomCode);
    }
  });

  // ─── room:unready ───
  socket.on('room:unready', (callback) => {
    const playerId = playerManager.getPlayerIdBySocketId(socket.id);
    if (!playerId) {
      return callback({ success: false, error: 'Player not found' });
    }

    const state = playerManager.getPlayerState(playerId);
    if (!state?.currentRoomCode) {
      return callback({ success: false, error: 'Not in a room' });
    }

    const result = roomManager.setReady(state.currentRoomCode, playerId, false);
    if (!result.success) {
      return callback({ success: false, error: result.reason });
    }

    callback({ success: true });

    const room = roomManager.getRoomInfo(state.currentRoomCode);
    if (room) {
      io.to(state.currentRoomCode).emit('room:updated', { room });
    }
  });
}

// ─── Room Manager：房間生命週期管理 ───

import type {
  RoomCode,
  GameType,
  RoomStatus,
  RoomInfo,
  SeatMap,
  Seat,
  PlayerId,
} from '@shared/types';
import { generateRoomCode } from '../utils/id-generator';
import { getPlayerInfo } from './player-manager';

// ─── 模組私有狀態 ───

interface RoomState {
  info: RoomInfo;
  playerIdToSeat: Map<PlayerId, Seat>;
}

/** roomCode → 房間完整狀態 */
const rooms: Map<RoomCode, RoomState> = new Map();

// ─── 輔助函式 ───

function createEmptySeatMap(): SeatMap {
  return {
    N: { player: null, isReady: false },
    E: { player: null, isReady: false },
    S: { player: null, isReady: false },
    W: { player: null, isReady: false },
  };
}

function rebuildSeatMap(room: RoomState): SeatMap {
  const seats = createEmptySeatMap();
  for (const [playerId, seat] of room.playerIdToSeat) {
    const playerInfo = getPlayerInfo(playerId);
    if (playerInfo) {
      seats[seat] = { player: playerInfo, isReady: seats[seat].isReady };
    }
  }
  return seats;
}

// ─── 匯出函式 ───

/**
 * 建立新房間
 */
export function createRoom(gameType: GameType): RoomCode {
  let code: RoomCode;
  do {
    code = generateRoomCode();
  } while (rooms.has(code));

  const room: RoomState = {
    info: {
      code,
      gameType,
      status: 'waiting',
      seats: createEmptySeatMap(),
      createdAt: Date.now(),
    },
    playerIdToSeat: new Map(),
  };

  rooms.set(code, room);
  return code;
}

/**
 * 取得房間資訊
 */
export function getRoomInfo(roomCode: RoomCode): RoomInfo | null {
  const room = rooms.get(roomCode);
  if (!room) return null;
  // 重建 seats 以確保玩家資訊最新
  room.info = { ...room.info, seats: rebuildSeatMap(room) };
  return room.info;
}

/**
 * 玩家加入房間（尚未選座位）
 */
export function joinRoom(
  roomCode: RoomCode,
  playerId: PlayerId,
): { success: true } | { success: false; reason: string } {
  const room = rooms.get(roomCode);
  if (!room) {
    return { success: false, reason: 'Room not found' };
  }
  if (room.info.status === 'playing') {
    return { success: false, reason: 'Game is in progress' };
  }
  // 檢查是否已在房間
  if (room.playerIdToSeat.has(playerId)) {
    return { success: false, reason: 'Already in room' };
  }
  return { success: true };
}

/**
 * 玩家離開房間
 */
export function leaveRoom(
  roomCode: RoomCode,
  playerId: PlayerId,
): { seat: Seat | null; roomEmpty: boolean } {
  const room = rooms.get(roomCode);
  if (!room) return { seat: null, roomEmpty: true };

  const seat = room.playerIdToSeat.get(playerId) ?? null;
  if (seat) {
    room.info = {
      ...room.info,
      seats: {
        ...room.info.seats,
        [seat]: { player: null, isReady: false },
      },
    };
    room.playerIdToSeat.delete(playerId);
  }

  const roomEmpty = room.playerIdToSeat.size === 0;
  if (roomEmpty) {
    rooms.delete(roomCode);
  }

  return { seat, roomEmpty };
}

/**
 * 玩家更換座位
 */
export function changeSeat(
  roomCode: RoomCode,
  playerId: PlayerId,
  targetSeat: Seat,
): { success: true } | { success: false; reason: string } {
  const room = rooms.get(roomCode);
  if (!room) return { success: false, reason: 'Room not found' };
  if (room.info.status === 'playing') {
    return { success: false, reason: 'Cannot change seat during game' };
  }

  // 檢查目標座位是否為空
  const seatInfo = room.info.seats[targetSeat];
  if (seatInfo.player !== null) {
    // 如果是同一位玩家，不需要做任何事
    const currentSeat = room.playerIdToSeat.get(playerId);
    if (currentSeat === targetSeat) {
      return { success: true };
    }
    return { success: false, reason: 'Seat is occupied' };
  }

  const playerInfo = getPlayerInfo(playerId);
  if (!playerInfo) return { success: false, reason: 'Player not found' };

  // 清除舊座位
  const oldSeat = room.playerIdToSeat.get(playerId);
  const newSeats = { ...room.info.seats };
  if (oldSeat) {
    newSeats[oldSeat] = { player: null, isReady: false };
  }

  // 設定新座位
  newSeats[targetSeat] = { player: playerInfo, isReady: false };
  room.info = { ...room.info, seats: newSeats };
  room.playerIdToSeat.set(playerId, targetSeat);

  return { success: true };
}

/**
 * 設定玩家準備狀態
 */
export function setReady(
  roomCode: RoomCode,
  playerId: PlayerId,
  ready: boolean,
): { success: true } | { success: false; reason: string } {
  const room = rooms.get(roomCode);
  if (!room) return { success: false, reason: 'Room not found' };

  const seat = room.playerIdToSeat.get(playerId);
  if (!seat) return { success: false, reason: 'Not seated' };

  const currentSeatInfo = room.info.seats[seat];
  room.info = {
    ...room.info,
    seats: {
      ...room.info.seats,
      [seat]: { ...currentSeatInfo, isReady: ready },
    },
  };

  return { success: true };
}

/**
 * 檢查是否所有座位已滿且全部準備
 */
export function isAllReady(roomCode: RoomCode): boolean {
  const room = rooms.get(roomCode);
  if (!room) return false;

  const seats = room.info.seats;
  const seatKeys: Seat[] = ['N', 'E', 'S', 'W'];
  return seatKeys.every((s) => seats[s].player !== null && seats[s].isReady);
}

/**
 * 取得玩家在房間中的座位
 */
export function getPlayerSeat(roomCode: RoomCode, playerId: PlayerId): Seat | null {
  const room = rooms.get(roomCode);
  if (!room) return null;
  return room.playerIdToSeat.get(playerId) ?? null;
}

/**
 * 取得座位上的玩家 ID
 */
export function getPlayerIdBySeat(roomCode: RoomCode, seat: Seat): PlayerId | null {
  const room = rooms.get(roomCode);
  if (!room) return null;
  for (const [pid, s] of room.playerIdToSeat) {
    if (s === seat) return pid;
  }
  return null;
}

/**
 * 設定房間狀態（waiting / playing）
 */
export function setRoomStatus(roomCode: RoomCode, status: RoomStatus): void {
  const room = rooms.get(roomCode);
  if (room) {
    room.info = { ...room.info, status };
  }
}

/**
 * 重設所有玩家的準備狀態為 false
 */
export function resetAllReady(roomCode: RoomCode): void {
  const room = rooms.get(roomCode);
  if (!room) return;

  const newSeats = { ...room.info.seats };
  const seatKeys: Seat[] = ['N', 'E', 'S', 'W'];
  for (const s of seatKeys) {
    newSeats[s] = { ...newSeats[s], isReady: false };
  }
  room.info = { ...room.info, seats: newSeats };
}

/**
 * 移除空房間
 */
export function removeRoom(roomCode: RoomCode): void {
  rooms.delete(roomCode);
}

/**
 * 取得房間內的座位到玩家ID映射
 */
export function getSeatPlayerMap(roomCode: RoomCode): Record<Seat, PlayerId | null> {
  const room = rooms.get(roomCode);
  const result: Record<Seat, PlayerId | null> = { N: null, E: null, S: null, W: null };
  if (!room) return result;

  for (const [pid, seat] of room.playerIdToSeat) {
    result[seat] = pid;
  }
  return result;
}

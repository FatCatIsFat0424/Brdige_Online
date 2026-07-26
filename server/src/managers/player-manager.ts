// ─── Player Manager：玩家狀態管理 ───

import type {
  PlayerId,
  ReconnectToken,
  PlayerInfo,
  PlayerColor,
  ConnectionStatus,
  RoomCode,
} from '@shared/types';
import { generatePlayerId, generateReconnectToken } from '../utils/id-generator';

// ─── 模組私有狀態 ───

interface PlayerState {
  info: PlayerInfo;
  socketId: string;
  reconnectToken: ReconnectToken;
  connectionStatus: ConnectionStatus;
  currentRoomCode: RoomCode | null;
  disconnectedAt: number | null;
}

/** socketId → PlayerId 映射 */
const socketToPlayer: Map<string, PlayerId> = new Map();

/** PlayerId → 玩家完整狀態 */
const players: Map<PlayerId, PlayerState> = new Map();

/** reconnectToken → PlayerId 映射（快速查詢用） */
const tokenToPlayer: Map<ReconnectToken, PlayerId> = new Map();

// ─── 匯出函式 ───

/**
 * 建立新玩家
 */
export function createPlayer(
  socketId: string,
  nickname: string,
  color: PlayerColor,
): { playerId: PlayerId; reconnectToken: ReconnectToken } {
  const playerId = generatePlayerId();
  const reconnectToken = generateReconnectToken();

  const state: PlayerState = {
    info: { id: playerId, nickname, color },
    socketId,
    reconnectToken,
    connectionStatus: 'connected',
    currentRoomCode: null,
    disconnectedAt: null,
  };

  players.set(playerId, state);
  socketToPlayer.set(socketId, playerId);
  tokenToPlayer.set(reconnectToken, playerId);

  return { playerId, reconnectToken };
}

/**
 * 透過 socket ID 取得玩家 ID
 */
export function getPlayerIdBySocketId(socketId: string): PlayerId | null {
  return socketToPlayer.get(socketId) ?? null;
}

/**
 * 取得玩家資訊
 */
export function getPlayerInfo(playerId: PlayerId): PlayerInfo | null {
  return players.get(playerId)?.info ?? null;
}

/**
 * 取得玩家完整狀態（含連線狀態、房間等）
 */
export function getPlayerState(playerId: PlayerId): PlayerState | null {
  return players.get(playerId) ?? null;
}

/**
 * 設定玩家當前所在房間
 */
export function setPlayerRoom(playerId: PlayerId, roomCode: RoomCode | null): void {
  const state = players.get(playerId);
  if (state) {
    state.currentRoomCode = roomCode;
  }
}

/**
 * 標記玩家斷線
 */
export function markDisconnected(socketId: string): {
  playerId: PlayerId;
  disconnectedAt: number;
} | null {
  const playerId = socketToPlayer.get(socketId);
  if (!playerId) return null;

  const state = players.get(playerId);
  if (!state) return null;

  const disconnectedAt = Date.now();
  state.connectionStatus = 'disconnected';
  state.disconnectedAt = disconnectedAt;
  socketToPlayer.delete(socketId);

  return { playerId, disconnectedAt };
}

/**
 * 嘗試重連：驗證 token 並更新 socket ID
 */
export function attemptReconnect(
  newSocketId: string,
  token: ReconnectToken,
): { success: true; playerId: PlayerId; roomCode: RoomCode | null }
  | { success: false; reason: string } {
  const playerId = tokenToPlayer.get(token);
  if (!playerId) {
    return { success: false, reason: 'Invalid reconnect token' };
  }

  const state = players.get(playerId);
  if (!state) {
    return { success: false, reason: 'Player not found' };
  }

  // 更新 socket 映射
  state.socketId = newSocketId;
  state.connectionStatus = 'connected';
  state.disconnectedAt = null;
  socketToPlayer.set(newSocketId, playerId);

  return { success: true, playerId, roomCode: state.currentRoomCode };
}

/**
 * 檢查玩家是否已斷線超時
 */
export function isDisconnectTimedOut(playerId: PlayerId, timeoutMs: number): boolean {
  const state = players.get(playerId);
  if (!state || state.connectionStatus !== 'disconnected' || !state.disconnectedAt) {
    return false;
  }
  return Date.now() - state.disconnectedAt >= timeoutMs;
}

/**
 * 移除玩家（徹底清除，非斷線）
 */
export function removePlayer(playerId: PlayerId): void {
  const state = players.get(playerId);
  if (!state) return;

  socketToPlayer.delete(state.socketId);
  tokenToPlayer.delete(state.reconnectToken);
  players.delete(playerId);
}

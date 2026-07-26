// ─── ID 生成工具 ───

import { v4 as uuidv4 } from 'uuid';
import type { PlayerId, ReconnectToken, RoomCode } from '@shared/types';
import { ROOM_CODE_LENGTH } from '@shared/constants';

/**
 * 生成唯一的玩家 ID
 * 格式：UUID v4
 */
export function generatePlayerId(): PlayerId {
  return uuidv4();
}

/**
 * 生成房間代碼
 * 格式：6 碼大寫英數字（排除易混淆字元 0/O/I/1）
 * 碰撞檢查由呼叫者負責
 */
export function generateRoomCode(): RoomCode {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * 生成重連 token
 * 格式：UUID v4
 */
export function generateReconnectToken(): ReconnectToken {
  return uuidv4();
}

/**
 * 生成聊天訊息 ID
 * 格式：UUID v4
 */
export function generateMessageId(): string {
  return uuidv4();
}

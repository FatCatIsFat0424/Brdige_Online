// ─── 房間型別定義 ───

import type { PlayerInfo, Seat } from './player';

/** 房間代碼（6 碼英數字） */
export type RoomCode = string;

/** 遊戲類型 */
export type GameType = 'bridge';

/** 房間狀態 */
export type RoomStatus = 'waiting' | 'playing';

/** 座位資訊 */
export interface SeatInfo {
  readonly player: PlayerInfo | null;
  readonly isReady: boolean;
}

/** 座位表：四個方位的座位狀態 */
export type SeatMap = Record<Seat, SeatInfo>;

/** 房間資訊（對外暴露） */
export interface RoomInfo {
  readonly code: RoomCode;
  readonly gameType: GameType;
  readonly status: RoomStatus;
  readonly seats: SeatMap;
  readonly createdAt: number;
}

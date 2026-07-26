// ─── 玩家型別定義 ───

/** 玩家唯一識別碼（由伺服器生成） */
export type PlayerId = string;

/** 重連用 token */
export type ReconnectToken = string;

/** 座位方位 */
export type Seat = 'N' | 'E' | 'S' | 'W';

/** 玩家代表顏色（十六進制色碼） */
export type PlayerColor = string;

/** 玩家資訊 */
export interface PlayerInfo {
  readonly id: PlayerId;
  readonly nickname: string;
  readonly color: PlayerColor;
}

/** 玩家連線狀態 */
export type ConnectionStatus = 'connected' | 'disconnected';

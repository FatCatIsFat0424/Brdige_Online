// ─── 聊天型別定義 ───

import type { PlayerInfo } from './player';

/** 聊天訊息 */
export interface ChatMessage {
  readonly id: string;
  readonly sender: PlayerInfo;
  readonly content: string;
  readonly timestamp: number;
}

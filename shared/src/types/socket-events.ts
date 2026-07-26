// ─── Socket 事件定義 ───

import type { PlayerId, PlayerColor, ReconnectToken, Seat } from './player';
import type { RoomCode, RoomInfo, GameType } from './room';
import type {
  Card,
  BidAction,
  Contract,
  GameResult,
  GameLogEntry,
  PlayerVisibleGameState,
} from './game';
import type { ChatMessage } from './chat';

// ─── Client → Server 事件 ───

export interface ClientToServerEvents {
  'player:setNickname': (
    payload: { nickname: string; color: PlayerColor },
    callback: (response: {
      success: boolean;
      error?: string;
      playerId?: PlayerId;
      reconnectToken?: ReconnectToken;
    }) => void,
  ) => void;

  'room:create': (
    payload: { gameType: GameType },
    callback: (response: {
      success: boolean;
      error?: string;
      roomCode?: RoomCode;
    }) => void,
  ) => void;

  'room:join': (
    payload: { roomCode: RoomCode },
    callback: (response: {
      success: boolean;
      error?: string;
      room?: RoomInfo;
    }) => void,
  ) => void;

  'room:leave': (
    callback: (response: { success: boolean; error?: string }) => void,
  ) => void;

  'room:changeSeat': (
    payload: { seat: Seat },
    callback: (response: { success: boolean; error?: string }) => void,
  ) => void;

  'room:ready': (
    callback: (response: { success: boolean; error?: string }) => void,
  ) => void;

  'room:unready': (
    callback: (response: { success: boolean; error?: string }) => void,
  ) => void;

  'game:redealResponse': (
    payload: { accept: boolean },
    callback: (response: { success: boolean; error?: string }) => void,
  ) => void;

  'game:bid': (
    payload: { bid: BidAction },
    callback: (response: { success: boolean; error?: string }) => void,
  ) => void;

  'game:playCard': (
    payload: { card: Card },
    callback: (response: { success: boolean; error?: string }) => void,
  ) => void;

  'game:continue': (
    callback: (response: { success: boolean; error?: string }) => void,
  ) => void;

  'chat:send': (
    payload: { message: string },
    callback: (response: { success: boolean; error?: string }) => void,
  ) => void;

  'player:reconnect': (
    payload: { token: ReconnectToken },
    callback: (response: {
      success: boolean;
      error?: string;
      room?: RoomInfo;
      gameState?: PlayerVisibleGameState;
    }) => void,
  ) => void;
}

// ─── Server → Client 事件 ───

export interface ServerToClientEvents {
  'room:updated': (payload: { room: RoomInfo }) => void;
  'room:playerLeft': (payload: { playerId: PlayerId; seat: Seat }) => void;

  'game:started': (payload: { gameState: PlayerVisibleGameState }) => void;
  'game:dealt': (payload: { hand: Card[] }) => void;
  'game:redealAvailable': (payload: { seat: Seat }) => void;
  'game:redealt': (payload: { hand: Card[] }) => void;
  'game:biddingStart': (payload: { startSeat: Seat }) => void;
  'game:bidMade': (payload: { seat: Seat; action: BidAction }) => void;
  'game:biddingEnd': (payload: { contract: Contract }) => void;
  'game:turnStart': (payload: { seat: Seat; validCards?: Card[] }) => void;
  'game:cardPlayed': (payload: { seat: Seat; card: Card }) => void;
  'game:trickEnd': (payload: {
    winner: Seat;
    cards: Record<Seat, Card>;
    trickCountEW: number;
    trickCountNS: number;
  }) => void;
  'game:ended': (payload: { result: GameResult }) => void;
  'game:aborted': (payload: { reason: string }) => void;
  'game:logEntry': (payload: { entry: GameLogEntry }) => void;

  'chat:received': (payload: { message: ChatMessage }) => void;

  'player:disconnected': (payload: { seat: Seat }) => void;
  'player:reconnected': (payload: { seat: Seat }) => void;
}

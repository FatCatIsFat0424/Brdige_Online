// ─── Types 統一匯出 ───

export type {
  PlayerId,
  ReconnectToken,
  Seat,
  PlayerColor,
  PlayerInfo,
  ConnectionStatus,
} from './player';

export type {
  RoomCode,
  GameType,
  RoomStatus,
  SeatInfo,
  SeatMap,
  RoomInfo,
} from './room';

export type {
  Suit,
  BidSuit,
  Rank,
  Card,
  BidLevel,
  BidAction,
  Contract,
  GamePhase,
  TrickRecord,
  GameLogEntry,
  GameResult,
  Team,
  PlayingState,
  BiddingState,
  GameState,
  PlayerVisibleGameState,
} from './game';

export type { ChatMessage } from './chat';

export type {
  ClientToServerEvents,
  ServerToClientEvents,
} from './socket-events';

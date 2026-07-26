// ─── Playing Engine：出牌規則引擎 ───

import type {
  Card,
  Seat,
  Suit,
  BidSuit,
  PlayingState,
  TrickRecord,
} from '@shared/types';
import { TOTAL_TRICKS, SEAT_ORDER_CLOCKWISE, TEAM_SEATS } from '@shared/constants';
import { getNextSeat } from './bidding';

/**
 * 建立初始出牌狀態
 */
export function createPlayingState(leadSeat: Seat): PlayingState {
  return {
    currentTrick: {},
    trickLeadSeat: leadSeat,
    currentTurnSeat: leadSeat,
    completedTricks: [],
    trickCountEW: 0,
    trickCountNS: 0,
  };
}

/**
 * 取得合法出牌（跟牌規則）
 * - 首出牌者可出任何牌
 * - 後續必須跟主花色，若無主花色則可出任意牌
 */
export function getValidPlays(
  hand: readonly Card[],
  state: PlayingState,
): Card[] {
  // 首出牌者可出任何牌
  if (Object.keys(state.currentTrick).length === 0) {
    return [...hand];
  }

  // 取得主花色
  const leadCard = state.currentTrick[state.trickLeadSeat];
  if (!leadCard) return [...hand];
  const leadSuit = leadCard.suit;

  // 手中有主花色的牌嗎？
  const sameSuitCards = hand.filter((c) => c.suit === leadSuit);
  if (sameSuitCards.length > 0) {
    return sameSuitCards;
  }

  // 無主花色：可出任意牌
  return [...hand];
}

/**
 * 驗證出牌是否合法
 */
export function validatePlay(
  hand: readonly Card[],
  state: PlayingState,
  seat: Seat,
  card: Card,
): { valid: true } | { valid: false; reason: string } {
  if (seat !== state.currentTurnSeat) {
    return { valid: false, reason: 'Not your turn' };
  }

  // 檢查牌是否在手中
  const hasCard = hand.some((c) => c.suit === card.suit && c.rank === card.rank);
  if (!hasCard) {
    return { valid: false, reason: 'Card not in hand' };
  }

  // 檢查跟牌規則
  const validPlays = getValidPlays(hand, state);
  const isValid = validPlays.some((c) => c.suit === card.suit && c.rank === card.rank);
  if (!isValid) {
    return { valid: false, reason: 'Must follow suit' };
  }

  return { valid: true };
}

/**
 * 套用出牌，回傳新狀態
 */
export function applyPlay(
  state: PlayingState,
  seat: Seat,
  card: Card,
): PlayingState {
  const newTrick = { ...state.currentTrick, [seat]: card };

  // 是否四人都出牌了？
  if (Object.keys(newTrick).length === 4) {
    // 墩結束 — 但不在這裡結算，先記錄
    return {
      ...state,
      currentTrick: newTrick,
      currentTurnSeat: getNextSeat(seat), // 暫時設定，結算時會覆蓋
    };
  }

  return {
    ...state,
    currentTrick: newTrick,
    currentTurnSeat: getNextSeat(seat),
  };
}

/**
 * 比較兩張牌的大小（在同一墩中）
 * @param a 待比較的牌
 * @param b 基準牌
 * @param leadSuit 主花色（該墩首出的花色）
 * @param trumpSuit 王牌花色（叫牌確定的）。'nt' 表示無王牌
 * @returns > 0 表示 a 贏 b
 */
export function compareCards(
  a: Card,
  b: Card,
  leadSuit: Suit,
  trumpSuit: BidSuit,
): number {
  const aIsTrump = trumpSuit !== 'nt' && a.suit === trumpSuit;
  const bIsTrump = trumpSuit !== 'nt' && b.suit === trumpSuit;
  const aIsLead = a.suit === leadSuit;
  const bIsLead = b.suit === leadSuit;

  // 王牌 vs 非王牌
  if (aIsTrump && !bIsTrump) return 1;
  if (!aIsTrump && bIsTrump) return -1;

  // 都是王牌：比牌面
  if (aIsTrump && bIsTrump) return a.rank - b.rank;

  // 主花色 vs 非主花色
  if (aIsLead && !bIsLead) return 1;
  if (!aIsLead && bIsLead) return -1;

  // 都是主花色：比牌面
  if (aIsLead && bIsLead) return a.rank - b.rank;

  // 都不是主花色也不是王牌：比牌面（但實際上都不贏）
  return 0;
}

/**
 * 判定墩贏家
 */
export function determineTrickWinner(
  trick: Record<Seat, Card>,
  leadSeat: Seat,
  trumpSuit: BidSuit,
): Seat {
  const leadCard = trick[leadSeat];
  const leadSuit = leadCard.suit;

  let winnerSeat = leadSeat;
  let winnerCard = leadCard;

  const seats = SEAT_ORDER_CLOCKWISE;
  const startIdx = seats.indexOf(leadSeat);

  for (let i = 1; i < 4; i++) {
    const seat = seats[(startIdx + i) % 4];
    const card = trick[seat];

    if (compareCards(card, winnerCard, leadSuit, trumpSuit) > 0) {
      winnerSeat = seat;
      winnerCard = card;
    }
  }

  return winnerSeat;
}

/**
 * 完成一墩，更新狀態
 */
export function completeTrick(
  state: PlayingState,
  winnerSeat: Seat,
  trick: Record<Seat, Card>,
  leadSeat: Seat,
): PlayingState {
  const trickRecord: TrickRecord = {
    cards: trick,
    leadSeat,
    winnerSeat,
  };

  const isWinnerEW = TEAM_SEATS.EW.includes(winnerSeat);

  return {
    currentTrick: {},
    trickLeadSeat: winnerSeat,
    currentTurnSeat: winnerSeat,
    completedTricks: [...state.completedTricks, trickRecord],
    trickCountEW: state.trickCountEW + (isWinnerEW ? 1 : 0),
    trickCountNS: state.trickCountNS + (isWinnerEW ? 0 : 1),
  };
}

/**
 * 檢查出牌階段是否結束（13 墩全部完成）
 */
export function isPlayingComplete(state: PlayingState): boolean {
  return state.completedTricks.length >= TOTAL_TRICKS;
}

/**
 * 從手牌中移除一張牌
 */
export function removeCardFromHand(hand: readonly Card[], card: Card): Card[] {
  const idx = hand.findIndex((c) => c.suit === card.suit && c.rank === card.rank);
  if (idx === -1) return [...hand];
  const newHand = [...hand];
  newHand.splice(idx, 1);
  return newHand;
}

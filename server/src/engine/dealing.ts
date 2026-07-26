// ─── Dealing Engine：發牌、排序、倒牌重洗 ───

import type { Card, Seat } from '@shared/types';
import {
  SUIT_DISPLAY_ORDER,
  RANK_ORDER_DESC,
  REDEAL_MAX_POINTS,
  SEAT_ORDER_CLOCKWISE,
  HIGH_CARD_POINTS,
} from '@shared/constants';

/**
 * 將洗好的牌組分發給四位玩家
 * @param deck - 52 張牌
 * @returns 四位玩家的手牌（各 13 張）
 */
export function dealCards(deck: readonly Card[]): Record<Seat, Card[]> {
  const hands: Record<Seat, Card[]> = {
    N: [],
    E: [],
    S: [],
    W: [],
  };

  const seats = SEAT_ORDER_CLOCKWISE;
  for (let i = 0; i < deck.length; i++) {
    hands[seats[i % 4]].push(deck[i]);
  }

  return hands;
}

/**
 * 手牌排序：先按花色順序，同花色內按牌面大小遞減
 * 花色順序：♠ → ♥ → ♣ → ♦
 * 牌面順序：A → K → Q → J → 10 → ... → 2
 */
export function sortHand(hand: readonly Card[]): Card[] {
  return [...hand].sort((a, b) => {
    const suitDiff = SUIT_DISPLAY_ORDER.indexOf(a.suit) - SUIT_DISPLAY_ORDER.indexOf(b.suit);
    if (suitDiff !== 0) return suitDiff;
    return RANK_ORDER_DESC.indexOf(a.rank) - RANK_ORDER_DESC.indexOf(b.rank);
  });
}

/**
 * 計算手牌的高牌點數（HCP）
 * A=4, K=3, Q=2, J=1，其餘=0
 */
export function calculateHandPoints(hand: readonly Card[]): number {
  return hand.reduce((sum, card) => sum + HIGH_CARD_POINTS[card.rank], 0);
}

/**
 * 檢查手牌是否有 Ace
 */
function hasAce(hand: readonly Card[]): boolean {
  return hand.some((card) => card.rank === 14);
}

/**
 * 檢查玩家是否符合倒牌重洗條件
 * 條件：不含任何 A 且總 HCP ≤ 4
 */
export function isRedealEligible(hand: readonly Card[]): boolean {
  if (hasAce(hand)) return false;
  return calculateHandPoints(hand) <= REDEAL_MAX_POINTS;
}

/**
 * 從指定玩家開始，按順時鐘檢查倒牌重洗資格
 * 回傳第一位符合條件的玩家座位，若都不符合則回傳 null
 */
export function findRedealEligibleSeat(
  hands: Record<Seat, readonly Card[]>,
  startSeat: Seat,
): Seat | null {
  const startIdx = SEAT_ORDER_CLOCKWISE.indexOf(startSeat);

  for (let i = 0; i < 4; i++) {
    const seat = SEAT_ORDER_CLOCKWISE[(startIdx + i) % 4];
    if (isRedealEligible(hands[seat])) {
      return seat;
    }
  }

  return null;
}

// ─── Deck Engine：牌組生成與洗牌 ───

import type { Card, Suit, Rank } from '@shared/types';

const SUITS: readonly Suit[] = ['spades', 'hearts', 'clubs', 'diamonds'];
const RANKS: readonly Rank[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

/**
 * 建立一副標準 52 張撲克牌
 * 按花色、牌面排列：♠A-2, ♥A-2, ♣A-2, ♦A-2
 */
export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank });
    }
  }
  return deck;
}

/**
 * Fisher-Yates 洗牌演算法
 * @param deck - 原始牌組（不修改）
 * @param randomFn - 隨機數生成函式（預設 Math.random），可注入種子以確保可重現
 * @returns 洗牌後的新陣列
 */
export function shuffleDeck(
  deck: readonly Card[],
  randomFn: () => number = Math.random,
): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

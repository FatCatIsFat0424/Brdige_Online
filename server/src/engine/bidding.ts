// ─── Bidding Engine：叫牌規則引擎 ───

import type { Seat, BidAction, BidLevel, BidSuit, BiddingState } from '@shared/types';
import { SEAT_ORDER_CLOCKWISE, BID_SUIT_ORDER } from '@shared/constants';

/**
 * 取得順時鐘下一個座位
 */
export function getNextSeat(seat: Seat): Seat {
  const idx = SEAT_ORDER_CLOCKWISE.indexOf(seat);
  return SEAT_ORDER_CLOCKWISE[(idx + 1) % 4];
}

/**
 * 建立初始叫牌狀態
 */
export function createBiddingState(startSeat: Seat): BiddingState {
  return {
    bids: [],
    currentBidderSeat: startSeat,
    highestBid: null,
    consecutivePassCount: 0,
    isFirstRound: true,
  };
}

/**
 * 比較兩個叫牌大小
 * 回傳 > 0 表示 a > b，< 0 表示 a < b，= 0 表示相等
 */
export function compareBids(
  a: { level: BidLevel; suit: BidSuit },
  b: { level: BidLevel; suit: BidSuit },
): number {
  if (a.level !== b.level) return a.level - b.level;
  return BID_SUIT_ORDER.indexOf(a.suit) - BID_SUIT_ORDER.indexOf(b.suit);
}

/**
 * 取得當前可以叫的所有合法叫牌
 */
export function getValidBids(state: BiddingState): BidAction[] {
  const validBids: BidAction[] = [{ type: 'pass' }];
  const levels: BidLevel[] = [1, 2, 3, 4, 5, 6, 7];
  const suits: BidSuit[] = ['clubs', 'diamonds', 'hearts', 'spades', 'nt'];

  for (const level of levels) {
    for (const suit of suits) {
      const bid = { level, suit };
      if (!state.highestBid || compareBids(bid, state.highestBid) > 0) {
        validBids.push({ type: 'bid', level, suit });
      }
    }
  }

  return validBids;
}

/**
 * 驗證叫牌是否合法
 */
export function validateBid(
  state: BiddingState,
  seat: Seat,
  action: BidAction,
): { valid: true } | { valid: false; reason: string } {
  // 必須輪到你
  if (seat !== state.currentBidderSeat) {
    return { valid: false, reason: 'Not your turn' };
  }

  // pass 永遠合法
  if (action.type === 'pass') {
    return { valid: true };
  }

  // 有最高叫牌時，新叫牌必須更高
  if (state.highestBid) {
    if (compareBids({ level: action.level, suit: action.suit }, state.highestBid) <= 0) {
      return { valid: false, reason: 'Bid must be higher than current highest bid' };
    }
  }

  return { valid: true };
}

/**
 * 套用叫牌動作，回傳新狀態
 */
export function applyBid(
  state: BiddingState,
  seat: Seat,
  action: BidAction,
): BiddingState {
  const newBids = [...state.bids, { seat, action }];
  const nextSeat = getNextSeat(seat);
  const isNewRound = state.isFirstRound && newBids.length >= 4;

  if (action.type === 'pass') {
    return {
      bids: newBids,
      currentBidderSeat: nextSeat,
      highestBid: state.highestBid,
      consecutivePassCount: state.consecutivePassCount + 1,
      isFirstRound: isNewRound ? false : state.isFirstRound,
    };
  }

  // type === 'bid'
  return {
    bids: newBids,
    currentBidderSeat: nextSeat,
    highestBid: { level: action.level, suit: action.suit, seat },
    consecutivePassCount: 0,
    isFirstRound: isNewRound ? false : state.isFirstRound,
  };
}

/**
 * 檢查叫牌是否結束
 * 回傳結果：
 * - 'continue': 叫牌繼續
 * - 'all_pass': 首輪四人全 pass → 需要重發
 * - 'contract': 有人叫牌後連續 3 pass → 合約確定
 */
export function checkBiddingEnd(
  state: BiddingState,
): 'continue' | 'all_pass' | 'contract' {
  // 首輪四人全 pass
  if (state.bids.length === 4 && state.consecutivePassCount === 4) {
    return 'all_pass';
  }

  // 有人叫牌後連續 3 人 pass
  if (state.highestBid && state.consecutivePassCount >= 3) {
    return 'contract';
  }

  return 'continue';
}

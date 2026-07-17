---
name: testing-patterns
description: 測試撰寫規範。定義 Vitest 使用模式、測試結構、assertion 風格、邊界條件測試要求，確保遊戲引擎的所有規則都有充分的測試覆蓋。
---

# 測試撰寫規範

本 Skill 定義 Bridge Online 專案的測試撰寫標準，使用 Vitest 框架。

---

## 測試範圍

### 必須測試（Engine 層）
- `server/src/engine/deck.ts` → `server/tests/engine/deck.test.ts`
- `server/src/engine/dealing.ts` → `server/tests/engine/dealing.test.ts`
- `server/src/engine/bidding.ts` → `server/tests/engine/bidding.test.ts`
- `server/src/engine/playing.ts` → `server/tests/engine/playing.test.ts`
- `server/src/engine/scoring.ts` → `server/tests/engine/scoring.test.ts`

### 建議測試（可選）
- Manager 層的核心邏輯
- Utils 工具函式

---

## 測試檔案結構

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import {
  createBiddingState,
  validateBid,
  applyBid,
  checkBiddingEnd,
  getValidBids,
  compareBids,
  getNextSeat,
} from '../../src/engine/bidding';

describe('bidding engine', () => {

  describe('createBiddingState', () => {
    it('should create initial state with correct start seat', () => {
      const state = createBiddingState('N');
      expect(state.currentBidderSeat).toBe('N');
      expect(state.bids).toHaveLength(0);
      expect(state.highestBid).toBeNull();
      expect(state.consecutivePassCount).toBe(0);
      expect(state.isFirstRound).toBe(true);
    });
  });

  describe('compareBids', () => {
    it('should rank higher level above lower level', () => {
      expect(compareBids(
        { level: 2, suit: 'clubs' },
        { level: 1, suit: 'nt' }
      )).toBeGreaterThan(0);
    });

    it('should rank NT above spades at same level', () => {
      expect(compareBids(
        { level: 1, suit: 'nt' },
        { level: 1, suit: 'spades' }
      )).toBeGreaterThan(0);
    });
  });

  // ...
});
```

---

## 命名規範

### describe 區塊
- 第一層：模組名（如 `'bidding engine'`）
- 第二層：函式名（如 `'validateBid'`）
- 可選第三層：場景分類（如 `'when first round'`）

### it 描述
- 使用 `should` 開頭描述預期行為
- 描述具體而非抽象

```typescript
// ✅ 具體描述
it('should return false when hand contains an Ace', () => {});
it('should return all_pass when four consecutive passes on first round', () => {});

// ❌ 模糊描述
it('should work correctly', () => {});
it('should handle edge case', () => {});
```

---

## Assertion 風格

### 基本斷言
```typescript
expect(result).toBe(value);           // 嚴格相等
expect(result).toEqual(object);       // 深層相等
expect(result).toBeDefined();
expect(result).toBeNull();
expect(result).toBeTruthy();
expect(result).toBeFalsy();
```

### 陣列斷言
```typescript
expect(cards).toHaveLength(13);
expect(deck).toContainEqual({ suit: 'spades', rank: 14 });
```

### 結構斷言（推薦用於複雜物件）
```typescript
expect(result).toEqual(expect.objectContaining({
  valid: false,
  reason: expect.stringContaining('Not your turn'),
}));
```

---

## 必要的測試案例類型

### 1. 正常路徑（Happy Path）
```typescript
it('should deal 13 cards to each of 4 players', () => {
  const hands = dealCards(shuffledDeck);
  for (const seat of ['N', 'E', 'S', 'W'] as Seat[]) {
    expect(hands[seat]).toHaveLength(13);
  }
});
```

### 2. 邊界條件（Boundary）
```typescript
it('should return true when HCP is exactly 4 (1K + 1J)', () => {
  const hand = createHandWithPoints(4, false); // no Ace
  expect(isRedealEligible(hand)).toBe(true);
});

it('should return false when HCP is exactly 5 (1K + 1Q)', () => {
  const hand = createHandWithPoints(5, false);
  expect(isRedealEligible(hand)).toBe(false);
});
```

### 3. 錯誤案例（Error Cases）
```typescript
it('should reject bid from wrong seat', () => {
  const state = createBiddingState('N');
  const result = validateBid(state, 'E', { type: 'bid', level: 1, suit: 'clubs' });
  expect(result).toEqual({ valid: false, reason: expect.any(String) });
});
```

### 4. 不變量（Invariants）
```typescript
it('should produce 52 unique cards in a full deck', () => {
  const deck = createDeck();
  const uniqueCards = new Set(deck.map(c => `${c.suit}-${c.rank}`));
  expect(uniqueCards.size).toBe(52);
});
```

---

## 測試輔助工具

### 建立測試用的固定資料

```typescript
// 在測試檔案中建立 helper 函式
function createTestHand(cards: Array<{ suit: Suit; rank: Rank }>): Card[] {
  return cards.map(c => ({ suit: c.suit, rank: c.rank }));
}

function createBiddingStateAfterBids(
  startSeat: Seat,
  bids: BidAction[]
): BiddingState {
  let state = createBiddingState(startSeat);
  let currentSeat = startSeat;
  for (const action of bids) {
    state = applyBid(state, currentSeat, action);
    currentSeat = getNextSeat(currentSeat);
  }
  return state;
}
```

### 確定性隨機

```typescript
// 注入種子隨機以確保可重現
function createSeededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

it('should produce consistent shuffle with seeded random', () => {
  const deck = createDeck();
  const random = createSeededRandom(42);
  const shuffled1 = shuffleDeck(deck, random);
  // ...
});
```

---

## 執行測試

```bash
# 執行所有測試
cd server && npx vitest run

# 執行特定測試檔案
cd server && npx vitest run tests/engine/bidding.test.ts

# Watch 模式
cd server && npx vitest

# 含覆蓋率報告
cd server && npx vitest run --coverage
```

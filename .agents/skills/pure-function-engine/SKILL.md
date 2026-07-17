---
name: pure-function-engine
description: Engine 層純函式撰寫規範。確保遊戲引擎模組（deck、dealing、bidding、playing、scoring）全部為無副作用的純函式，便於獨立測試。
---

# Engine 層純函式規範

本 Skill 定義 `server/src/engine/` 目錄下所有模組的撰寫規範。Engine 層是橋牌遊戲規則的核心，必須嚴格遵循純函式原則。

---

## 核心原則

### 1. 無副作用（No Side Effects）
```typescript
// ✅ 回傳新物件，不修改輸入
export function applyBid(
  state: BiddingState,
  seat: Seat,
  action: BidAction
): BiddingState {
  return {
    ...state,
    bids: [...state.bids, { seat, action }],
    currentBidderSeat: getNextSeat(seat),
    // ...
  };
}

// ❌ 直接修改輸入狀態
export function applyBid(state: BiddingState, seat: Seat, action: BidAction): void {
  state.bids.push({ seat, action });  // 修改了原始物件
  state.currentBidderSeat = getNextSeat(seat);
}
```

### 2. 不持有狀態（Stateless）
```typescript
// ❌ 模組級可變狀態
let currentDeck: Card[] = [];

// ✅ 所有狀態透過參數傳入，透過回傳值輸出
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  // ...
  return shuffled;
}
```

### 3. 確定性輸出（Deterministic）
- 相同輸入必須產生相同輸出
- 隨機性透過可選的 `randomFn` 參數注入：

```typescript
// ✅ 預設使用 Math.random，測試時可注入確定性函式
export function shuffleDeck(
  deck: Card[],
  randomFn: () => number = Math.random
): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
```

---

## 模組規範

### 每個 Engine 模組的結構

```typescript
// 1. Import：僅來自 shared/types 和 shared/constants
import { Card, Seat, BidAction } from '@shared/types/game';
import { SEAT_ORDER_CLOCKWISE } from '@shared/constants/game-rules';

// 2. 模組內部輔助函式（不匯出）
function internalHelper(): void { }

// 3. 匯出的公開函式（全部為純函式）
export function publicFunction(input: Input): Output { }
```

### 禁止事項

| 禁止 | 原因 |
|------|------|
| `import` manager 或 socket 模組 | 違反依賴方向 |
| 模組級 `let`/`var` 變數 | 破壞無狀態原則 |
| `console.log` / `console.error` | Engine 不應有 I/O |
| `setTimeout` / `setInterval` | 不應有非同步操作 |
| `Math.random()`（直接使用） | 應透過參數注入 |
| 修改傳入參數 | 破壞純函式原則 |
| 拋出 Error（for flow control） | 使用回傳值表達錯誤 |

### 錯誤處理風格

```typescript
// ✅ 使用回傳值表達驗證結果
export function validateBid(
  state: BiddingState,
  seat: Seat,
  action: BidAction
): { valid: true } | { valid: false; reason: string } {
  if (seat !== state.currentBidderSeat) {
    return { valid: false, reason: 'Not your turn' };
  }
  return { valid: true };
}

// ❌ 拋出異常
export function validateBid(...): void {
  if (seat !== state.currentBidderSeat) {
    throw new Error('Not your turn');
  }
}
```

---

## 各模組職責摘要

| 模組 | 職責 | 純函式數量 |
|------|------|-----------|
| `deck.ts` | 牌組生成（52 張）、Fisher-Yates 洗牌 | 2 |
| `dealing.ts` | 發牌、手牌排序、HCP 計算、倒牌重洗判定 | 5 |
| `bidding.ts` | 叫牌狀態、比較、驗證、套用、結束判定 | 7 |
| `playing.ts` | 出牌狀態、跟牌、驗證、套用、墩贏家判定 | 8 |
| `scoring.ts` | 隊伍判定、結算計算 | 2 |

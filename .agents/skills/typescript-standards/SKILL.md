---
name: typescript-standards
description: TypeScript 編碼標準與規範。定義命名慣例、型別使用風格、export 規範、禁止規則等，確保整個專案程式碼風格一致。
---

# TypeScript 編碼標準

本 Skill 定義 Bridge Online 專案的 TypeScript 編碼標準，所有 Agent 在撰寫 TypeScript 程式碼時必須遵循。

---

## 型別定義規則

### 使用 `type` 的場景
- 聯合型別（Union Types）：`type Seat = 'N' | 'E' | 'S' | 'W';`
- 型別別名（Type Aliases）：`type PlayerId = string;`
- 字面量型別（Literal Types）：`type BidLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;`
- 映射型別（Mapped Types）：`type SeatMap = Record<Seat, SeatInfo>;`

### 使用 `interface` 的場景
- 物件結構定義：`interface PlayerInfo { id: PlayerId; nickname: string; }`
- 回呼介面：`interface GameCallbacks { onDealt: (...) => void; }`
- Socket 事件定義：`interface ClientToServerEvents { ... }`

### 禁止事項
```typescript
// ❌ 禁止使用 any
function process(data: any): any { }

// ✅ 使用 unknown 並進行型別收窄
function process(data: unknown): string {
  if (typeof data === 'string') return data;
  throw new Error('Invalid data type');
}

// ❌ 禁止使用 class
class RoomManager { }

// ✅ 使用模組函式
export function createRoom(gameType: GameType): RoomCode { }

// ❌ 禁止 default export
export default function createRoom() { }

// ✅ 使用具名匯出
export function createRoom() { }
```

---

## 函式規範

### 必須標注型別
```typescript
// ✅ 明確標注參數與回傳型別
export function dealCards(deck: Card[]): Record<Seat, Card[]> {
  // ...
}

// ❌ 缺少回傳型別
export function dealCards(deck: Card[]) {
  // ...
}
```

### 回傳值風格
- 成功/失敗結果使用 discriminated union：
```typescript
type Result =
  | { success: true; data: RoomInfo }
  | { success: false; reason: string };
```

- 驗證結果使用明確的型別：
```typescript
type ValidationResult =
  | { valid: true }
  | { valid: false; reason: string };
```

### 純函式要求（Engine 層）
```typescript
// ✅ 不修改原陣列，回傳新陣列
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  // Fisher-Yates...
  return shuffled;
}

// ❌ 修改原陣列
export function shuffleDeck(deck: Card[]): Card[] {
  // 直接修改 deck...
  return deck;
}
```

---

## 命名慣例

| 類別 | 風格 | 範例 |
|------|------|------|
| 檔案名 | kebab-case | `player-manager.ts`, `game-rules.ts` |
| 型別/介面 | PascalCase | `PlayerInfo`, `BiddingState` |
| 函式 | camelCase | `createPlayer`, `handleBid` |
| 變數 | camelCase | `currentSeat`, `highestBid` |
| 常數 | UPPER_SNAKE_CASE | `HAND_SIZE`, `TOTAL_TRICKS` |
| 列舉值 | 小寫字串 | `'clubs'`, `'waiting'` |
| 泛型參數 | 單大寫字母或描述性名稱 | `T`, `TPayload` |

---

## Import 順序

```typescript
// 1. Node.js 內建模組
import { randomUUID } from 'crypto';

// 2. 第三方套件
import { Server as SocketIOServer } from 'socket.io';

// 3. shared 層（型別、常數）
import { Card, Seat } from '@shared/types/game';
import { HAND_SIZE } from '@shared/constants/game-rules';

// 4. 同層其他模組
import { createDeck, shuffleDeck } from '../engine/deck';

// 5. 同目錄模組
import { generatePlayerId } from './id-generator';
```

---

## 格式化規則

- 字串：單引號 `'hello'`
- 語句結尾：加分號 `;`
- 縮排：2 個空格
- 行寬上限：100 字元
- 尾隨逗號：多行時加尾隨逗號
- 大括號：同行開始（K&R 風格）

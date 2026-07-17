# Component: Project Setup (Phase 0)

> **依賴**: 無（此為所有其他 component 的前置條件）
> **建議順序**: 最先執行

---

## 概述

初始化 monorepo 結構（shared / server / client），設定開發工具鏈，建立共用型別與常數定義。

---

## 子任務

### 1. Monorepo 結構初始化

- [ ] 建立 `shared/`, `server/`, `client/` 目錄結構
- [ ] 建立根層級 `package.json`（含 workspaces 設定）
- [ ] 建立 `.gitignore` 規則更新

### 2. TypeScript 設定

- [ ] 建立根層級 `tsconfig.json`（base config）
- [ ] 建立 `shared/tsconfig.json`
- [ ] 建立 `server/tsconfig.json`（引用 shared）
- [ ] 建立 `client/tsconfig.json`（引用 shared）

### 3. 開發工具鏈

- [ ] 設定 ESLint 規則
- [ ] 設定 Prettier 格式化規則
- [ ] 設定 Vite（client 開發伺服器與打包）
- [ ] 設定 tsx/ts-node（server 執行環境）
- [ ] 建立開發腳本：`dev`, `build`, `test`

### 4. Shared 型別定義 (`shared/src/types/`)

#### 4.1 `player.ts`

- [ ] 定義 `PlayerId` 型別（string）
- [ ] 定義 `ReconnectToken` 型別（string）
- [ ] 定義 `Seat` 型別（`'N' | 'E' | 'S' | 'W'`）
- [ ] 定義 `PlayerColor` 型別（string，十六進制色碼）
- [ ] 定義 `PlayerInfo` 介面（id, nickname, color）
- [ ] 定義 `ConnectionStatus` 型別（`'connected' | 'disconnected'`）

#### 4.2 `room.ts`

- [ ] 定義 `RoomCode` 型別（string，6 碼英數字）
- [ ] 定義 `GameType` 型別（`'bridge'`）
- [ ] 定義 `RoomStatus` 型別（`'waiting' | 'playing'`）
- [ ] 定義 `SeatInfo` 介面（player, isReady）
- [ ] 定義 `SeatMap` 型別（`Record<Seat, SeatInfo>`）
- [ ] 定義 `RoomInfo` 介面（code, gameType, status, seats, createdAt）

#### 4.3 `game.ts`

- [ ] 定義 `Suit` 型別（clubs, diamonds, hearts, spades）
- [ ] 定義 `BidSuit` 型別（`Suit | 'nt'`）
- [ ] 定義 `Rank` 型別（2~14）
- [ ] 定義 `Card` 介面（suit, rank）
- [ ] 定義 `BidLevel` 型別（1~7）
- [ ] 定義 `BidAction` 型別（bid | pass）
- [ ] 定義 `Contract` 介面（level, suit, declarer）
- [ ] 定義 `GamePhase` 型別（dealing, redeal_pending, bidding, playing, scoring）
- [ ] 定義 `TrickRecord` 介面（cards, leadSeat, winnerSeat）
- [ ] 定義 `GameLogEntry` 型別（bid, play, trick_end, redeal, system）
- [ ] 定義 `GameResult` 介面（contract, declarerTeamTricks, defenderTeamTricks, requiredTricks, declarerTeamWins）
- [ ] 定義 `Team` 型別（`'EW' | 'NS'`）
- [ ] 定義 `PlayingState` 介面
- [ ] 定義 `BiddingState` 介面
- [ ] 定義 `GameState` 介面（完整遊戲狀態）
- [ ] 定義 `PlayerVisibleGameState` 介面（隱藏他人手牌）

#### 4.4 `chat.ts`

- [ ] 定義 `ChatMessage` 介面（id, sender, content, timestamp）

#### 4.5 `socket-events.ts`

- [ ] 定義 `ClientToServerEvents` 介面（所有 client→server 事件與 payload）
- [ ] 定義 `ServerToClientEvents` 介面（所有 server→client 事件與 payload）

### 5. Shared 常數定義 (`shared/src/constants/`)

#### 5.1 `cards.ts`

- [ ] 定義 `SUIT_DISPLAY_ORDER`（黑桃→紅心→梅花→方塊）
- [ ] 定義 `RANK_ORDER_DESC`（A→K→...→2）
- [ ] 定義 `SUIT_SYMBOLS`（Unicode 花色符號）
- [ ] 定義 `RANK_DISPLAY`（數字→顯示文字映射）
- [ ] 定義 `HIGH_CARD_POINTS`（高牌點數映射）

#### 5.2 `game-rules.ts`

- [ ] 定義 `HAND_SIZE`（13）
- [ ] 定義 `TOTAL_TRICKS`（13）
- [ ] 定義 `CONTRACT_BASE_TRICKS`（6）
- [ ] 定義 `SEAT_ORDER_CLOCKWISE`（N→E→S→W）
- [ ] 定義 `TEAM_SEATS`（EW / NS 座位對應）
- [ ] 定義 `BID_SUIT_ORDER`（叫牌花色大小順序）
- [ ] 定義 `REDEAL_MAX_POINTS`（4）
- [ ] 定義 `RECONNECT_TIMEOUT_MS`（60000）
- [ ] 定義 `ROOM_CODE_LENGTH`（6）

### 6. Server Utils (`server/src/utils/`)

#### 6.1 `id-generator.ts`

- [ ] 實作 `generatePlayerId()`（UUID v4）
- [ ] 實作 `generateRoomCode()`（6 碼大寫英數字，排除 0/O/I/1）
- [ ] 實作 `generateReconnectToken()`（UUID v4）
- [ ] 實作 `generateMessageId()`（UUID v4）

### 7. Server 進入點框架

- [ ] 建立 `server/src/index.ts` 基礎框架（Express + HTTP + Socket.IO 初始化）
- [ ] 設定 CORS 與傳輸選項

### 8. Client 初始化

- [ ] 使用 Vite + React + TypeScript 初始化 client 專案
- [ ] 設定 `client/vite.config.ts`（含 shared 路徑別名）
- [ ] 建立 `client/src/main.tsx` 進入點
- [ ] 建立 `client/src/App.tsx` 根元件框架
- [ ] 建立 `client/src/socket.ts`（Socket.IO client 初始化）
- [ ] 建立 `client/src/styles/global.css`（全域樣式與 CSS 變數）

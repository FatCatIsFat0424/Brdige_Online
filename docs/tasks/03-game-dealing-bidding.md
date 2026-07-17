# Component: Game Engine — Dealing & Bidding (Phase 3)

> **依賴**: `00-project-setup`（shared 型別與常數）、`01-lobby-room`（room-manager、player-manager、socket 連線）
> **建議順序**: 在 Lobby & Room 之後，可與 Phase 2 (Chat) 並行開發

---

## 概述

實作遊戲引擎的發牌與叫牌部分，包含牌組生成、洗牌、發牌、倒牌重洗、叫牌規則引擎等純函式模組，以及 Game Manager 的前半段流程（發牌→叫牌）和對應的前端 UI。

---

## 子任務

### 1. 後端 Engine：Deck (`server/src/engine/deck.ts`)

- [ ] 實作 `createDeck()` → `Card[52]`（生成 52 張標準撲克牌，固定順序）
- [ ] 實作 `shuffleDeck(deck, randomFn?)` → `Card[]`（Fisher-Yates 洗牌，不修改原陣列）

### 2. 後端 Engine：Dealing (`server/src/engine/dealing.ts`)

- [ ] 實作 `dealCards(deck)` → `Record<Seat, Card[]>`（將 52 張牌分給 4 人，每人 13 張，已排序）
- [ ] 實作 `sortHand(hand)` → `Card[]`（按花色 ♠→♥→♣→♦、同花色內 A→K→...→2 排序）
- [ ] 實作 `calculateHandPoints(hand)` → `number`（計算高牌點數 HCP）
- [ ] 實作 `isRedealEligible(hand)` → `boolean`（無 A 且 HCP ≤ 4）
- [ ] 實作 `findRedealEligibleSeat(hands, startSeat)` → `Seat | null`（從 startSeat 開始順時鐘檢查）

### 3. 後端 Engine：Bidding (`server/src/engine/bidding.ts`)

- [ ] 實作 `createBiddingState(startSeat)` → `BiddingState`（初始叫牌狀態）
- [ ] 實作 `compareBids(a, b)` → `number`（先比數字，再比花色）
- [ ] 實作 `getValidBids(state)` → `BidAction[]`（大於最高叫牌的選項 + pass）
- [ ] 實作 `validateBid(state, seat, action)` → `{ valid } | { valid, reason }`
- [ ] 實作 `applyBid(state, seat, action)` → `BiddingState`（更新狀態，回傳新物件）
- [ ] 實作 `checkBiddingEnd(state)` → `{ ended: false } | { ended, result, contract? }`
- [ ] 實作 `getNextSeat(currentSeat)` → `Seat`（順時鐘取下一座位）

### 4. 後端：Game Manager — 發牌與叫牌流程 (`server/src/managers/game-manager.ts`)

- [ ] 建立模組私有狀態：`games` Map（RoomCode → GameState）
- [ ] 定義 `GameCallbacks` 介面
- [ ] 實作 `registerCallbacks(cb)` → `void`
- [ ] 實作 `startGame(roomCode)` → 執行發牌 → 檢查倒牌重洗 → 進入適當階段
- [ ] 實作 `handleRedealResponse(roomCode, seat, accept)` → accept=true 重洗，false 檢查下一位
- [ ] 實作 `handleBid(roomCode, seat, action)` → 驗證 → applyBid → 檢查結束 → all_pass 重發牌 / contract 進出牌
- [ ] 實作 `getPlayerVisibleState(roomCode, seat)` → `PlayerVisibleGameState | null`
- [ ] 實作 `getGameState(roomCode)` → `GameState | null`
- [ ] 實作 `removeGame(roomCode)` → `void`
- [ ] 實作 `hasActiveGame(roomCode)` → `boolean`

### 5. 後端：Game Handler — 發牌與叫牌事件 (`server/src/socket/game-handler.ts`)

- [ ] 實作 `registerGameHandlers(io, socket)` 函式骨架
- [ ] 實作 `setupGameCallbacks(io)` → 綁定 game-manager 回呼到 Socket.IO 廣播
- [ ] 處理 `game:redealResponse` 事件 → 查詢座位 → 呼叫 `gameManager.handleRedealResponse()`
- [ ] 處理 `game:bid` 事件 → 查詢座位 → 呼叫 `gameManager.handleBid()`
- [ ] 實作 `onDealt` callback → 分別發送各玩家自己的手牌
- [ ] 實作 `onRedealAvailable` callback → 通知特定玩家
- [ ] 實作 `onBiddingStart` callback → 廣播叫牌開始
- [ ] 實作 `onBidMade` callback → 廣播叫牌動作
- [ ] 實作 `onBiddingEnd` callback → 廣播合約確定
- [ ] 實作 `onLogEntry` callback → 廣播遊戲日誌

### 6. 後端：Server 進入點整合

- [ ] 在 `server/src/index.ts` 中呼叫 `setupGameCallbacks(io)`
- [ ] 在 `room-handler.ts` 的 `isAllReady()` 後呼叫 `gameManager.startGame()`

### 7. 前端：Game Store (`client/src/stores/game-store.ts`)

- [ ] 定義遊戲狀態（phase, myHand, mySeat, bidding, contract, playing, result, log 等）
- [ ] 實作 `setGameState(state)` action
- [ ] 實作 `setMyHand(hand)` action
- [ ] 實作 `updateBidding(bidding)` action
- [ ] 實作 `addLogEntry(entry)` action
- [ ] 實作 `clearGame()` action

### 8. 前端：Game Hook (`client/src/hooks/useGameState.ts`)

- [ ] 封裝遊戲狀態的便捷存取（isMyTurn, currentPhase 等計算屬性）

### 9. 前端：遊戲頁面 — 發牌與叫牌 UI

#### 9.1 `client/src/pages/GamePage.tsx`

- [ ] 建立 `GamePage` 頁面元件框架

#### 9.2 `client/src/components/game/GameBoard.tsx`

- [ ] 建立遊戲桌面主容器元件

#### 9.3 `client/src/components/game/HandCards.tsx`

- [ ] 建立手牌區域元件（展示 13 張手牌，可選擇出牌）

#### 9.4 `client/src/components/game/Card.tsx`

- [ ] 建立單張牌元件（顯示花色、數字，可點擊）

#### 9.5 `client/src/components/game/BiddingPanel.tsx`

- [ ] 建立叫牌面板元件（7×5 叫牌格 + pass 按鈕）

#### 9.6 `client/src/components/game/BiddingButton.tsx`

- [ ] 建立單個叫牌按鈕元件（顯示數字+花色，disabled 狀態）

#### 9.7 `client/src/components/game/RedealPrompt.tsx`

- [ ] 建立倒牌重洗提示元件（接受/拒絕按鈕）

#### 9.8 `client/src/components/game/GameInfo.tsx`

- [ ] 建立遊戲資訊元件（顯示當前階段、叫牌起始者等）

#### 9.9 樣式

- [ ] 建立 `GamePage.module.css`
- [ ] 建立遊戲元件相關 CSS Module 樣式

### 10. 前端整合

- [ ] 在 `useSocket.ts` 中註冊遊戲相關事件監聽（game:dealt, game:redealAvailable, game:biddingStart, game:bidMade, game:biddingEnd, game:logEntry）
- [ ] 在 `App.tsx` 中新增 `/game/:roomCode` 路由
- [ ] 4 人準備後自動跳轉至 GamePage

### 11. 單元測試

#### 11.1 `server/tests/engine/dealing.test.ts`

- [ ] 測試 `dealCards()` 回傳 4 組各 13 張，共 52 張不重複
- [ ] 測試 `sortHand()` 花色順序 ♠→♥→♣→♦，同花色內 A→K→...→2
- [ ] 測試 `calculateHandPoints()` 各種手牌組合的點數正確
- [ ] 測試 `isRedealEligible()` — 無 A、HCP ≤ 4 → true
- [ ] 測試 `isRedealEligible()` — 有 A → false
- [ ] 測試 `isRedealEligible()` — 無 A 但 HCP > 4 → false
- [ ] 測試邊界：HCP 恰好 4（1K+1J）→ true
- [ ] 測試邊界：HCP 恰好 5（1K+1Q）→ false

#### 11.2 `server/tests/engine/bidding.test.ts`

- [ ] 測試首位可自由叫牌
- [ ] 測試後續叫牌必須 > 最高叫牌
- [ ] 測試 pass 永遠合法
- [ ] 測試叫牌比較 — 數字優先（2♣ > 1NT）
- [ ] 測試叫牌比較 — 花色次之（1♠ > 1♥ > 1♦ > 1♣）
- [ ] 測試叫牌比較 — NT 最大（1NT > 1♠）
- [ ] 測試首輪 4 pass → all_pass
- [ ] 測試叫牌後 3 pass → contract
- [ ] 測試莊家判定（最後一位叫非 pass 的玩家）
- [ ] 測試 `getValidBids()` 回傳正確的合法選項
- [ ] 測試順時鐘輪轉 N→E→S→W→N

### 12. 驗收

- [ ] 可完成從 4 人準備 → 發牌 → 收到手牌的完整流程
- [ ] 倒牌重洗提示正確觸發與處理
- [ ] 叫牌面板正確顯示合法選項
- [ ] 叫牌流程正確進行（輪轉、pass、結束條件）
- [ ] 所有 dealing.test.ts 測試通過
- [ ] 所有 bidding.test.ts 測試通過

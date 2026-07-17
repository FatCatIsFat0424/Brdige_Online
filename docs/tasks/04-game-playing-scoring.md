# Component: Game Engine — Playing & Scoring (Phase 4)

> **依賴**: `03-game-dealing-bidding`（叫牌結束後進入出牌，需要 game-manager 前半段、Engine 的 deck/dealing/bidding 模組）
> **建議順序**: 必須在 Phase 3 之後

---

## 概述

實作遊戲引擎的出牌與結算部分，包含出牌規則引擎（跟牌、墩贏家判定）、結算引擎，以及 Game Manager 的後半段流程（出牌→結算），和對應的前端 UI（出牌區、結算畫面、動作日誌）。

---

## 子任務

### 1. 後端 Engine：Playing (`server/src/engine/playing.ts`)

- [ ] 實作 `createPlayingState(contract)` → `PlayingState`（首墩由莊家逆時鐘第一位出牌）
- [ ] 實作 `getValidPlays(hand, currentTrick, trickLeadSeat)` → `Card[]`（跟牌規則）
- [ ] 實作 `validatePlay(hand, card, state, seat)` → `{ valid } | { valid, reason }`
- [ ] 實作 `applyPlay(state, seat, card, trumpSuit)` → `{ state, trickCompleted, trickResult? }`
- [ ] 實作 `determineTrickWinner(trick, leadSeat, trumpSuit)` → `Seat`（墩贏家判定）
- [ ] 實作 `compareCards(a, b, leadSuit, trumpSuit)` → `number`（牌比較：王牌 > 主花色 > 其他）
- [ ] 實作 `isPlayingComplete(state)` → `boolean`（13 墩完成判定）
- [ ] 實作 `removeCardFromHand(hand, card)` → `Card[]`（移除手牌，不修改原陣列）

### 2. 後端 Engine：Scoring (`server/src/engine/scoring.ts`)

- [ ] 實作 `getSeatTeam(seat)` → `Team`（E/W 同隊，N/S 同隊）
- [ ] 實作 `calculateGameResult(contract, completedTricks)` → `GameResult`（莊家方需 6+level 墩）

### 3. 後端：Game Manager — 出牌與結算流程（補完 `game-manager.ts`）

- [ ] 實作 `handlePlayCard(roomCode, seat, card)` → 驗證 → 移除手牌 → applyPlay → 觸發回呼
- [ ] 實作出牌後流程：trickCompleted → onTrickEnd → 檢查 isPlayingComplete → 進入結算或下一墩
- [ ] 實作進入結算流程：呼叫 `calculateGameResult()` → phase='scoring' → 觸發 onGameEnd
- [ ] 實作 `abortGame(roomCode, reason)` → 中止遊戲，觸發 onGameAborted

### 4. 後端：Game Handler — 出牌與結算事件（補完 `game-handler.ts`）

- [ ] 處理 `game:playCard` 事件 → 查詢座位 → 呼叫 `gameManager.handlePlayCard()`
- [ ] 處理 `game:continue` 事件 → 重設準備狀態 → 移除遊戲 → 回到房間
- [ ] 實作 `onTurnStart` callback → 僅向該玩家發送合法出牌 + 向其他人發送輪到誰
- [ ] 實作 `onCardPlayed` callback → 廣播出牌
- [ ] 實作 `onTrickEnd` callback → 廣播墩結果（winner, cards, 墩數統計）
- [ ] 實作 `onGameEnd` callback → 廣播結算結果
- [ ] 實作 `onGameAborted` callback → 廣播遊戲中止

### 5. 前端：遊戲頁面 — 出牌與結算 UI

#### 5.1 `client/src/components/game/TrickArea.tsx`

- [ ] 建立當前墩牌桌元件（顯示 4 個位置已出的牌）

#### 5.2 `client/src/components/game/TrickCard.tsx`

- [ ] 建立墩中已出的牌元件（顯示花色、數字、出牌者方位）

#### 5.3 `client/src/components/game/ScoreBoard.tsx`

- [ ] 建立結算畫面元件（顯示合約、雙方墩數、勝負結果）
- [ ] 實作「繼續」與「離開」按鈕

#### 5.4 `client/src/components/common/ActionLog.tsx`

- [ ] 建立遊戲動作日誌元件（顯示所有叫牌、出牌、墩結果的時間軸）

#### 5.5 樣式

- [ ] 建立出牌與結算相關 CSS Module 樣式

### 6. 前端：Game Store 補完

- [ ] 實作 `updatePlaying(playing)` action
- [ ] 實作 `setResult(result)` action
- [ ] 實作 `setContract(contract)` action
- [ ] 實作 `updateTrickCount(ew, ns)` action

### 7. 前端整合

- [ ] 在 `useSocket.ts` 中註冊出牌相關事件監聽（game:turnStart, game:cardPlayed, game:trickEnd, game:ended, game:aborted）
- [ ] 實作手牌可點擊出牌邏輯（僅在自己回合、僅合法牌可出）
- [ ] 結算後點擊「繼續」→ 回到 RoomPage 準備階段
- [ ] 結算後點擊「離開」→ 回到 LobbyPage

### 8. 單元測試

#### 8.1 `server/tests/engine/playing.test.ts`

- [ ] 測試首墩出牌者正確（莊家逆時鐘第一位）
- [ ] 測試必須跟牌（有主花色時只能出主花色）
- [ ] 測試可自由出牌（無主花色時可出任意牌）
- [ ] 測試墩贏家 — 同花色比數字（♠A > ♠K）
- [ ] 測試墩贏家 — 王牌勝主花色（王牌♥2 > 主花色♠A）
- [ ] 測試墩贏家 — NT 無王牌
- [ ] 測試墩贏家 — 非主花色且非王牌永遠不贏
- [ ] 測試下一墩由墩主開始
- [ ] 測試 13 墩後 `isPlayingComplete()` 回傳 true
- [ ] 測試 `removeCardFromHand()` 正確移除且不修改原陣列

#### 8.2 `server/tests/engine/scoring.test.ts`

- [ ] 測試莊家方獲勝（墩數 ≥ 6+level）
- [ ] 測試防守方獲勝（墩數 < 6+level）
- [ ] 測試邊界：恰好達標 → 莊家方勝
- [ ] 測試隊伍判定（E/W 同隊、N/S 同隊）
- [ ] 測試合約等級 1~7 的所需墩數計算

### 9. 驗收

- [ ] 可完成一整局橋牌遊戲（發牌→叫牌→出牌→結算）
- [ ] 出牌規則正確（跟牌、王牌）
- [ ] 墩贏家判定正確
- [ ] 結算結果正確顯示
- [ ] 動作日誌正確記錄所有動作
- [ ] 「繼續」按鈕正確回到準備階段
- [ ] 所有 playing.test.ts 測試通過
- [ ] 所有 scoring.test.ts 測試通過

# Component: Disconnect & Reconnect (Phase 5)

> **依賴**: `01-lobby-room`（player-manager、room-manager）、`04-game-playing-scoring`（game-manager 完整流程，因需處理遊戲中斷線）
> **建議順序**: 在 Phase 4 之後

---

## 概述

實作玩家斷線偵測、重連 token 機制、遊戲狀態恢復。玩家斷線後可在 60 秒內重新連線回到遊戲；超時則遊戲中止，所有玩家回到房間大廳。

---

## 子任務

### 1. 後端：Player Manager 擴展（補完 `player-manager.ts`）

- [ ] 實作 `markDisconnected(socketId)` → `{ playerId, disconnectedAt } | null`（標記斷線時間戳）
- [ ] 實作 `attemptReconnect(newSocketId, token)` → `{ success, playerId, roomCode } | { success, reason }`
- [ ] 實作 `isDisconnectTimedOut(playerId, timeoutMs)` → `boolean`（檢查是否超時）

### 2. 後端：Connection Handler 擴展（補完 `connection.ts`）

- [ ] 完善 `disconnect` 事件處理：呼叫 `markDisconnected()` → 通知房間 `player:disconnected`
- [ ] 實作 60 秒重連計時器（`setTimeout`）
- [ ] 計時器到期邏輯：檢查 `isDisconnectTimedOut()` → 若仍斷線 → 中止遊戲 → 移除玩家 → 廣播
- [ ] 若無進行中遊戲：僅移除玩家出房間 → 廣播 `room:updated`
- [ ] 若有進行中遊戲：呼叫 `gameManager.abortGame()` → `setRoomStatus('waiting')` → `resetAllReady()` → 廣播 `game:aborted` + `room:updated`

### 3. 後端：Room Handler 擴展（補完 `room-handler.ts`）

- [ ] 處理 `player:reconnect` 事件 → 呼叫 `attemptReconnect()` → socket join room → 回傳完整狀態
- [ ] 重連成功：回傳 `room` + `gameState`（若遊戲進行中）
- [ ] 廣播 `player:reconnected` 給房間其他人

### 4. 前端：重連機制

- [ ] 在 `client/src/socket.ts` 中實作 reconnectToken 的 localStorage 存儲
- [ ] 在 Socket 連線時檢查是否有已存的 reconnectToken
- [ ] 若有 token → 自動發送 `player:reconnect` 事件
- [ ] 重連成功 → 恢復 player store、room store、game store 狀態
- [ ] 重連失敗 → 清除 token，回到大廳

### 5. 前端：重連 UI

- [ ] 建立重連中提示 UI（Loading / 重連中...）
- [ ] 建立斷線提示 UI（其他玩家斷線時的通知）
- [ ] 建立遊戲中止提示 UI（斷線超時導致遊戲結束的通知）

### 6. 前端整合

- [ ] 在 `useSocket.ts` 中註冊 `player:disconnected` 事件監聽
- [ ] 在 `useSocket.ts` 中註冊 `player:reconnected` 事件監聯
- [ ] 在 `useSocket.ts` 中處理 Socket 自動重連後的 token 恢復流程

### 7. 驗收

- [ ] 遊戲中斷線後，重新整理瀏覽器可回到遊戲
- [ ] 重連後手牌、叫牌/出牌狀態完整恢復
- [ ] 其他玩家看到斷線玩家的狀態提示
- [ ] 斷線超過 60 秒，遊戲正確中止
- [ ] 中止後所有玩家回到房間等待頁面
- [ ] 非遊戲中斷線（房間等待中），正確移除玩家出房間

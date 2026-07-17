# Component: Chat System (Phase 2)

> **依賴**: `01-lobby-room`（需要 player-manager、room-manager、socket 連線、房間頁面已完成）
> **建議順序**: 在 Lobby & Room 之後，可與 Phase 3 並行開發

---

## 概述

實作房間級別的即時聊天功能，包含後端的聊天訊息管理與 Socket 事件處理，以及前端的聊天面板 UI。聊天在進入房間後即可使用，遊戲中持續可用。

---

## 子任務

### 1. 後端：Chat Manager (`server/src/managers/chat-manager.ts`)

- [ ] 建立模組私有狀態：`chatHistory` Map（RoomCode → ChatMessage[]）
- [ ] 實作 `initRoomChat(roomCode)` → 初始化空聊天記錄
- [ ] 實作 `addMessage(roomCode, sender, content)` → `ChatMessage`（生成 id 與 timestamp）
- [ ] 實作 `getChatHistory(roomCode)` → `ChatMessage[]`
- [ ] 實作 `clearRoomChat(roomCode)` → 清除房間聊天記錄

### 2. 後端：Chat Handler (`server/src/socket/chat-handler.ts`)

- [ ] 實作 `registerChatHandlers(io, socket)` 函式
- [ ] 處理 `chat:send` 事件 → 查詢玩家資訊 → 呼叫 `chatManager.addMessage()` → 廣播 `chat:received`

### 3. 後端整合

- [ ] 在 `room-handler.ts` 的 `room:create` 中呼叫 `chatManager.initRoomChat()`
- [ ] 在 `room-handler.ts` 的房間銷毀邏輯中呼叫 `chatManager.clearRoomChat()`

### 4. 前端：Chat Store (`client/src/stores/chat-store.ts`)

- [ ] 定義聊天狀態（messages 陣列）
- [ ] 實作 `addMessage(message)` action
- [ ] 實作 `clearMessages()` action
- [ ] 實作 `setMessages(messages)` action（用於重連時恢復歷史）

### 5. 前端：Chat 元件 (`client/src/components/chat/`)

- [ ] 建立 `ChatPanel` 元件（聊天面板容器，含訊息列表與輸入框）
- [ ] 建立 `ChatMessage` 元件（單則訊息：顯示暱稱顏色、內容、時間）
- [ ] 建立 `ChatInput` 元件（訊息輸入框 + 發送按鈕）
- [ ] 建立聊天相關 CSS Module 樣式

### 6. 前端整合

- [ ] 在 `useSocket.ts` 中註冊 `chat:received` 事件監聽 → 更新 chat store
- [ ] 在 `RoomPage` 中嵌入 `ChatPanel`
- [ ] 在之後的 `GamePage` 中同樣嵌入 `ChatPanel`（此步驟在 Phase 3/4 執行）

### 7. 驗收

- [ ] 房間內玩家可發送訊息
- [ ] 所有房間內玩家即時收到訊息
- [ ] 訊息顯示發送者暱稱、顏色標記和時間
- [ ] 離開房間後聊天記錄清除

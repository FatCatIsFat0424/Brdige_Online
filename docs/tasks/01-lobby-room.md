# Component: Lobby & Room System (Phase 1)

> **依賴**: `00-project-setup`（shared 型別、常數、server 框架、client 框架皆需完成）
> **建議順序**: 在 Project Setup 之後立即開始

---

## 概述

實作大廳與房間系統，包含玩家 Session 管理、房間生命週期管理、相關 Socket 事件處理，以及前端的大廳頁面（暱稱+顏色+房間操作）與房間頁面（座位+準備）。

---

## 子任務

### 1. 後端：Player Manager (`server/src/managers/player-manager.ts`)

- [ ] 建立模組私有狀態：`socketToPlayer` Map（socketId → PlayerId）
- [ ] 建立模組私有狀態：`players` Map（PlayerId → 玩家完整狀態）
- [ ] 建立模組私有狀態：`tokenToPlayer` Map（ReconnectToken → PlayerId）
- [ ] 實作 `createPlayer(socketId, nickname, color)` → `{ playerId, reconnectToken }`
- [ ] 實作 `getPlayerIdBySocketId(socketId)` → `PlayerId | null`
- [ ] 實作 `getPlayerInfo(playerId)` → `PlayerInfo | null`
- [ ] 實作 `getPlayerState(playerId)` → `PlayerState | null`
- [ ] 實作 `setPlayerRoom(playerId, roomCode)` → `void`
- [ ] 實作 `removePlayer(playerId)` → `void`

> 注意：`markDisconnected`、`attemptReconnect`、`isDisconnectTimedOut` 歸屬於 `05-reconnect` component

### 2. 後端：Room Manager (`server/src/managers/room-manager.ts`)

- [ ] 建立模組私有狀態：`rooms` Map（RoomCode → 房間完整狀態）
- [ ] 實作 `createRoom(gameType)` → `RoomCode`
- [ ] 實作 `getRoomInfo(roomCode)` → `RoomInfo | null`
- [ ] 實作 `joinRoom(roomCode, playerId)` → `{ success } | { success, reason }`
- [ ] 實作 `leaveRoom(roomCode, playerId)` → `{ seat, roomEmpty }`
- [ ] 實作 `changeSeat(roomCode, playerId, targetSeat)` → `{ success } | { success, reason }`
- [ ] 實作 `setReady(roomCode, playerId, ready)` → `{ success } | { success, reason }`
- [ ] 實作 `isAllReady(roomCode)` → `boolean`
- [ ] 實作 `getPlayerSeat(roomCode, playerId)` → `Seat | null`
- [ ] 實作 `getPlayerIdBySeat(roomCode, seat)` → `PlayerId | null`
- [ ] 實作 `setRoomStatus(roomCode, status)` → `void`
- [ ] 實作 `resetAllReady(roomCode)` → `void`
- [ ] 實作 `removeRoom(roomCode)` → `void`
- [ ] 實作 `getSeatPlayerMap(roomCode)` → `Record<Seat, PlayerId | null>`

### 3. 後端：Socket 連線管理 (`server/src/socket/connection.ts`)

- [ ] 實作 `setupConnectionHandler(io)` — 註冊 `io.on('connection')` 事件
- [ ] 在 connection 中呼叫 `registerRoomHandlers(io, socket)`
- [ ] 在 connection 中呼叫 `registerGameHandlers(io, socket)`
- [ ] 在 connection 中呼叫 `registerChatHandlers(io, socket)`
- [ ] 實作 `disconnect` 事件基礎處理（標記斷線，詳細重連邏輯見 `05-reconnect`）

### 4. 後端：Room Handler (`server/src/socket/room-handler.ts`)

- [ ] 實作 `registerRoomHandlers(io, socket)` 函式骨架
- [ ] 處理 `player:setNickname` 事件 → 呼叫 `playerManager.createPlayer()`
- [ ] 處理 `room:create` 事件 → 呼叫 `roomManager.createRoom()` + socket join room
- [ ] 處理 `room:join` 事件 → 呼叫 `roomManager.joinRoom()` + `playerManager.setPlayerRoom()` + 廣播 `room:updated`
- [ ] 處理 `room:leave` 事件 → 呼叫 `roomManager.leaveRoom()` + 清除 + 廣播
- [ ] 處理 `room:changeSeat` 事件 → 呼叫 `roomManager.changeSeat()` + 廣播 `room:updated`
- [ ] 處理 `room:ready` 事件 → 呼叫 `roomManager.setReady(true)` + 檢查 `isAllReady()` + 廣播
- [ ] 處理 `room:unready` 事件 → 呼叫 `roomManager.setReady(false)` + 廣播

### 5. 後端：Server 進入點整合

- [ ] 在 `server/src/index.ts` 中呼叫 `setupConnectionHandler(io)`
- [ ] 確保 Socket.IO server 正確綁定到 Express HTTP server

### 6. 前端：Zustand Stores

#### 6.1 `client/src/stores/player-store.ts`

- [ ] 定義玩家自身狀態（nickname, color, playerId, reconnectToken）
- [ ] 實作 `setNickname(nickname)` action
- [ ] 實作 `setColor(color)` action
- [ ] 實作 `setPlayerIdentity(playerId, reconnectToken)` action

#### 6.2 `client/src/stores/room-store.ts`

- [ ] 定義房間狀態（roomInfo, mySeat）
- [ ] 實作 `setRoom(roomInfo)` action
- [ ] 實作 `updateRoom(roomInfo)` action
- [ ] 實作 `clearRoom()` action
- [ ] 實作 `setMySeat(seat)` action

### 7. 前端：Socket Hook

#### 7.1 `client/src/hooks/useSocket.ts`

- [ ] 封裝 Socket.IO 連線初始化與清理
- [ ] 註冊 `room:updated` 事件監聽 → 更新 room store
- [ ] 註冊 `room:playerLeft` 事件監聽 → 更新 room store
- [ ] 提供 emit 方法封裝（帶 callback 的 Promise 包裝）

### 8. 前端：大廳頁面 (`client/src/pages/LobbyPage.tsx`)

- [ ] 建立 `LobbyPage` 頁面元件
- [ ] 建立 `NicknameForm` 元件（暱稱輸入，≤10 字，不得為空）
- [ ] 建立 `ColorPicker` 元件（選擇代表顏色）
- [ ] 建立 `RoomCreateForm` 元件（指定遊戲類型，建立房間）
- [ ] 建立 `RoomJoinForm` 元件（輸入房間代碼，加入房間）
- [ ] 建立 `LobbyPage.module.css` 樣式

### 9. 前端：房間頁面 (`client/src/pages/RoomPage.tsx`)

- [ ] 建立 `RoomPage` 頁面元件
- [ ] 建立 `SeatLayout` 元件（東西南北四個座位佈局）
- [ ] 建立 `SeatSlot` 元件（單個座位：顯示玩家或空位，可點擊切換）
- [ ] 建立 `PlayerInfo` 元件（顯示玩家暱稱、顏色、準備狀態）
- [ ] 建立 `ReadyButton` 元件（準備/取消準備按鈕）
- [ ] 建立 `RoomPage.module.css` 樣式

### 10. 前端：路由設定

- [ ] 在 `App.tsx` 中設定路由：`/` → LobbyPage，`/room/:roomCode` → RoomPage
- [ ] 實作頁面間導航邏輯（建立/加入房間 → 跳轉至 RoomPage）

### 11. 驗收

- [ ] 多個瀏覽器分頁可建立房間
- [ ] 多個瀏覽器分頁可透過代碼加入房間
- [ ] 玩家可選擇座位並切換
- [ ] 4 人全部準備後觸發遊戲開始（此階段僅確認事件觸發，實際遊戲邏輯見後續 component）

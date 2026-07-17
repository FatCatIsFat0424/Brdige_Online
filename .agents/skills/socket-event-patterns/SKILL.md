---
name: socket-event-patterns
description: Socket.IO 事件處理模式規範。定義膠水層角色、callback pattern、錯誤處理、廣播規範，確保 Socket 層程式碼一致且不包含業務邏輯。
---

# Socket.IO 事件處理模式

本 Skill 定義 `server/src/socket/` 目錄下所有事件處理器的撰寫規範。

---

## 膠水層角色

Socket 層**只負責**：
1. 接收 Socket.IO 事件
2. 從 socket 解析玩家身份
3. 驗證/轉換 payload
4. 呼叫 Manager 函式
5. 將結果透過 callback 或 emit 回傳前端

Socket 層**不應該**：
- 包含任何業務邏輯判斷
- 直接操作遊戲狀態
- 直接呼叫 Engine 函式
- 持有任何狀態 Map

---

## 事件處理標準模式

### Client → Server 事件（帶 callback）

```typescript
socket.on('room:join', (payload: { roomCode: RoomCode }, callback) => {
  // 1. 取得玩家身份
  const playerId = playerManager.getPlayerIdBySocketId(socket.id);
  if (!playerId) {
    return callback({ success: false, error: 'Player not found' });
  }

  // 2. 呼叫 Manager
  const result = roomManager.joinRoom(payload.roomCode, playerId);
  if (!result.success) {
    return callback({ success: false, error: result.reason });
  }

  // 3. 更新相關狀態
  playerManager.setPlayerRoom(playerId, payload.roomCode);
  socket.join(payload.roomCode);

  // 4. 回傳成功
  const room = roomManager.getRoomInfo(payload.roomCode);
  callback({ success: true, room });

  // 5. 廣播給房間其他人
  socket.to(payload.roomCode).emit('room:updated', { room });
});
```

### 標準流程順序

1. **驗證玩家身份** → 透過 `playerManager.getPlayerIdBySocketId(socket.id)`
2. **執行業務操作** → 呼叫對應 Manager 函式
3. **處理錯誤** → 透過 callback 回傳 `{ success: false, error }`
4. **更新關聯狀態** → 如 `setPlayerRoom`、`socket.join`
5. **回傳成功結果** → 透過 callback 回傳 `{ success: true, ... }`
6. **廣播通知** → 透過 `socket.to(room).emit()` 或 `io.to(room).emit()`

---

## 廣播規則

### 廣播方式選擇

| 方式 | 使用場景 |
|------|---------|
| `callback(result)` | 回傳給發起請求的玩家 |
| `socket.to(room).emit()` | 廣播給房間內除發送者外的所有人 |
| `io.to(room).emit()` | 廣播給房間內所有人（含發送者） |
| `io.to(socketId).emit()` | 發送給特定玩家（如個人手牌） |

### 敏感資訊處理

```typescript
// ✅ 手牌只發給對應玩家
for (const seat of SEATS) {
  const playerId = roomManager.getPlayerIdBySeat(roomCode, seat);
  const state = playerManager.getPlayerState(playerId);
  if (state) {
    io.to(state.socketId).emit('game:dealt', { hand: hands[seat] });
  }
}

// ✅ 合法出牌只發給當前出牌者
io.to(currentPlayerSocketId).emit('game:turnStart', { seat, validCards });
// 其他人只知道輪到誰
socket.to(roomCode).emit('game:turnStart', { seat });
```

---

## 錯誤處理規範

### callback 錯誤格式

```typescript
// 統一格式
callback({ success: false, error: '錯誤描述' });
```

### 常見錯誤回傳

```typescript
// 玩家未找到
{ success: false, error: 'Player not found' }

// 房間不存在
{ success: false, error: 'Room not found' }

// 非玩家回合
{ success: false, error: 'Not your turn' }

// 操作不合法
{ success: false, error: 'Invalid action: <reason>' }
```

---

## Game Callbacks 綁定模式

```typescript
export function setupGameCallbacks(io: SocketIOServer): void {
  gameManager.registerCallbacks({
    onDealt: (roomCode, hands) => {
      // 分別發送各玩家自己的手牌
    },
    onBidMade: (roomCode, seat, action) => {
      io.to(roomCode).emit('game:bidMade', { seat, action });
    },
    onLogEntry: (roomCode, entry) => {
      io.to(roomCode).emit('game:logEntry', { entry });
    },
    // ...
  });
}
```

---

## Handler 函式簽名

```typescript
// 每個 handler 檔案匯出一個註冊函式
export function registerRoomHandlers(
  io: SocketIOServer,
  socket: Socket
): void {
  socket.on('room:create', (payload, callback) => { /* ... */ });
  socket.on('room:join', (payload, callback) => { /* ... */ });
  // ...
}
```

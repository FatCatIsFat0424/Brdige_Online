# 系統架構

> [返回目錄](./index.md)

---

## 高層架構

```
┌─────────────────────────────────────────────────┐
│                  Client (React SPA)              │
│  ┌──────────┐  ┌────────────┐  ┌──────────────┐ │
│  │  Pages   │→│ Components │→│ Hooks/Stores │ │
│  └──────────┘  └────────────┘  └──────┬───────┘ │
│                                       │          │
│                              Socket.IO Client    │
└───────────────────────────────┬─────────────────┘
                                │ WebSocket
┌───────────────────────────────┴─────────────────┐
│                  Server (Node.js)                │
│  ┌──────────────────────────────────────────┐    │
│  │  socket/ (膠水層 — 事件路由)              │    │
│  │  ├── connection.ts                       │    │
│  │  ├── room-handler.ts                     │    │
│  │  ├── game-handler.ts                     │    │
│  │  └── chat-handler.ts                     │    │
│  └─────────────────┬────────────────────────┘    │
│                    ↓                              │
│  ┌──────────────────────────────────────────┐    │
│  │  managers/ (狀態 + 業務流程)              │    │
│  │  ├── player-manager.ts                   │    │
│  │  ├── room-manager.ts                     │    │
│  │  ├── game-manager.ts                     │    │
│  │  └── chat-manager.ts                     │    │
│  └─────────────────┬────────────────────────┘    │
│                    ↓                              │
│  ┌──────────────────────────────────────────┐    │
│  │  engine/ (純函式 — 遊戲規則)              │    │
│  │  ├── deck.ts                             │    │
│  │  ├── dealing.ts                          │    │
│  │  ├── bidding.ts                          │    │
│  │  ├── playing.ts                          │    │
│  │  └── scoring.ts                          │    │
│  └──────────────────────────────────────────┘    │
└──────────────────────────────────────────────────┘
                    ↕
┌──────────────────────────────────────────────────┐
│                 shared/ (共用層)                   │
│  ├── types/ (TypeScript 型別定義)                  │
│  └── constants/ (遊戲規則常數)                     │
└──────────────────────────────────────────────────┘
```

---

## 模組依賴規則

### 嚴格單向依賴

```
Socket 層 → Manager 層 → Engine 層 → Shared (types/constants)
```

| 模組 | 可依賴 | 禁止依賴 |
|------|--------|---------|
| `engine/*` | `shared/types`, `shared/constants` | `managers/*`, `socket/*` |
| `managers/*` | `shared/*`, `engine/*` | `socket/*`, 其他 `managers/*` |
| `socket/*` | `shared/types`, `managers/*` | `engine/*`（直接呼叫） |

### 特殊規則

- Engine 模組間互不依賴（`bidding.ts` 不 import `playing.ts`）
- Manager 模組間不直接呼叫，跨 Manager 協調由 Socket 層負責
- `game-manager` 可依賴所有 Engine 模組（唯一例外）

---

## 設計原則

### 1. 不使用 Class

以模組（module）為邊界，使用函式與模組私有狀態：

```typescript
// ✅ 模組函式
const players: Map<PlayerId, PlayerState> = new Map();
export function createPlayer(...): { playerId, reconnectToken } { }

// ❌ Class
class PlayerManager { }
```

### 2. Engine 層為純函式

- 無副作用、不持有狀態
- 輸入 → 輸出
- 隨機性透過 `randomFn` 參數注入

### 3. Manager 層管理狀態

- 維護記憶體中的 `Map`/`Object`
- 對外暴露函式介面
- 不呼叫其他 Manager

### 4. Socket 層為膠水層

- 僅負責事件路由與 payload 轉換
- 不含業務邏輯
- 負責協調多個 Manager

### 5. Server-Authoritative

- 所有遊戲邏輯在後端執行
- 前端僅負責顯示與輸入
- 前端狀態為後端同步的投影

---

## 前端架構

```
Pages → Components → Hooks → Stores → Socket Client
```

| 層級 | 職責 |
|------|------|
| Pages | 頁面組合（Lobby、Room、Game） |
| Components | 可重用 UI 元件 |
| Hooks | 封裝 Socket 連線管理與狀態存取 |
| Stores (Zustand) | 接收 Socket 事件、驅動 UI 重繪 |
| Socket Client | Socket.IO 連線管理 |

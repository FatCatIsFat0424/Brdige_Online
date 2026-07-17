---
name: project-structure
description: 專案目錄結構規範與模組依賴規則。定義 monorepo 布局、檔案放置規則、模組間依賴方向的強制約束。
---

# 專案結構規範

本 Skill 定義 Bridge Online 專案的目錄結構與模組依賴規則。

---

## Monorepo 結構

```
Bridge_Online/
├── shared/                        # 前後端共用（型別 + 常數）
│   └── src/
│       ├── types/                 # TypeScript 型別定義
│       │   ├── player.ts
│       │   ├── room.ts
│       │   ├── game.ts
│       │   ├── chat.ts
│       │   └── socket-events.ts
│       └── constants/             # 共用常數
│           ├── cards.ts
│           └── game-rules.ts
├── server/                        # 後端
│   ├── src/
│   │   ├── index.ts               # 進入點
│   │   ├── socket/                # Socket 事件處理（膠水層）
│   │   │   ├── connection.ts
│   │   │   ├── room-handler.ts
│   │   │   ├── game-handler.ts
│   │   │   └── chat-handler.ts
│   │   ├── managers/              # 業務邏輯（狀態管理）
│   │   │   ├── room-manager.ts
│   │   │   ├── game-manager.ts
│   │   │   ├── player-manager.ts
│   │   │   └── chat-manager.ts
│   │   ├── engine/                # 遊戲引擎（純函式）
│   │   │   ├── deck.ts
│   │   │   ├── dealing.ts
│   │   │   ├── bidding.ts
│   │   │   ├── playing.ts
│   │   │   └── scoring.ts
│   │   └── utils/
│   │       └── id-generator.ts
│   └── tests/
│       └── engine/
│           ├── dealing.test.ts
│           ├── bidding.test.ts
│           ├── playing.test.ts
│           └── scoring.test.ts
└── client/                        # 前端
    ├── public/
    │   └── locales/               # i18n 翻譯檔
    ├── src/
    │   ├── main.tsx
    │   ├── App.tsx
    │   ├── i18n.ts
    │   ├── socket.ts
    │   ├── stores/                # Zustand 狀態管理
    │   ├── pages/                 # 頁面元件
    │   ├── components/            # UI 元件
    │   │   ├── lobby/
    │   │   ├── room/
    │   │   ├── game/
    │   │   ├── chat/
    │   │   └── common/
    │   ├── hooks/
    │   └── styles/
    └── vite.config.ts
```

---

## 模組依賴規則

### 後端依賴方向（嚴格單向）

```
socket/ → managers/ → engine/ → shared/
```

| 來源模組 | 可依賴 | 不可依賴 |
|---------|--------|---------|
| `engine/*` | `shared/types`, `shared/constants` | `managers/*`, `socket/*` |
| `managers/*` | `shared/types`, `shared/constants`, `engine/*` | `socket/*`, 其他 `managers/*` |
| `socket/*` | `shared/types`, `managers/*` | `engine/*`（直接呼叫）|

### 特殊規則

- **Engine 模組間互不依賴**：`bidding.ts` 不得 import `playing.ts`
- **Manager 模組間不直接呼叫**：跨 Manager 協調由 Socket 層負責
- **game-manager 是唯一例外**：可依賴所有 Engine 模組（它是 Engine 的唯一調用者）

### 前端依賴方向

```
pages/ → components/ → hooks/ → stores/ → socket client
```

- Pages 負責組合 Components
- Components 透過 Hooks 存取 Stores
- Stores 接收 Socket 事件更新狀態

---

## 檔案放置規則

### 新增檔案時的判斷流程

1. **是前後端都需要的型別或常數嗎？** → `shared/src/types/` 或 `shared/src/constants/`
2. **是純遊戲規則邏輯嗎？** → `server/src/engine/`
3. **是管理狀態的業務邏輯嗎？** → `server/src/managers/`
4. **是 Socket 事件處理嗎？** → `server/src/socket/`
5. **是工具函式嗎？** → `server/src/utils/` 或 `client/src/utils/`
6. **是頁面嗎？** → `client/src/pages/`
7. **是可重用 UI 元件嗎？** → `client/src/components/<category>/`
8. **是狀態管理嗎？** → `client/src/stores/`
9. **是 React Hook 嗎？** → `client/src/hooks/`
10. **是樣式嗎？** → `client/src/styles/` 或與元件同目錄的 `.module.css`

### 測試檔案

- 後端 Engine 測試：`server/tests/engine/<module>.test.ts`
- 命名：與被測模組同名加 `.test.ts` 後綴

---
name: wiki-auto-update
description: 自動更新 repo wiki 的 skill。任何程式碼或文件的新增、刪除、修改都必須同步更新 docs/wiki/ 目錄下的對應 wiki 頁面。
---

# Wiki 自動更新規範

本 Skill 定義 Bridge Online 專案的 wiki 自動更新規則。所有 Agent 在進行程式碼或文件異動時，必須同步更新 `docs/wiki/` 下的對應頁面。

---

## Wiki 結構

```
docs/wiki/
├── index.md              # Wiki 首頁：目錄與導覽
├── architecture.md       # 系統架構：高層架構、模組依賴、設計原則
├── api-events.md         # API 事件：Socket.IO 事件定義與 payload
├── game-rules.md         # 遊戲規則：橋牌規則、狀態機、流程
└── components.md         # 元件清單：所有模組/元件的清單與職責
```

---

## 更新觸發規則

### 必須更新 wiki 的情境

| 異動類型 | 更新的 wiki 頁面 |
|---------|-----------------|
| 新增/刪除 `.ts` 或 `.tsx` 檔案 | `components.md`（更新元件清單） |
| 修改 `shared/src/types/socket-events.ts` | `api-events.md`（更新事件定義） |
| 修改 `server/src/engine/*` | `game-rules.md`（更新規則說明） |
| 修改系統架構相關模組 | `architecture.md`（更新架構說明） |
| 任何 wiki 相關頁面的子項異動 | `index.md`（更新目錄） |

### 追蹤的檔案類型

- `.ts` / `.tsx` — TypeScript 原始碼
- `.md` — Markdown 文件
- `.css` — 樣式檔案（僅更新 `components.md` 的元件清單）
- `.json` — 設定檔（如 i18n 翻譯檔）

### 不追蹤的檔案

- `node_modules/`
- `dist/`
- `.git/`
- `*.log`
- `*.lock`

---

## Wiki 頁面格式

### index.md（首頁）

```markdown
# Bridge Online Wiki

## 目錄

- [系統架構](./architecture.md)
- [API 事件定義](./api-events.md)
- [遊戲規則](./game-rules.md)
- [元件清單](./components.md)

## 快速導覽

[專案概述、技術棧、如何開始開發...]

## 最近更新

[記錄最近的重大異動]
```

### components.md（元件清單）

按模組分類列出所有檔案及其職責：

```markdown
## Shared 層
| 檔案 | 職責 |
|------|------|
| `shared/src/types/player.ts` | 玩家相關型別定義 |
| ... | ... |

## Server — Engine 層
| 檔案 | 職責 | 匯出函式 |
|------|------|---------|
| `server/src/engine/deck.ts` | 牌組生成與洗牌 | `createDeck`, `shuffleDeck` |
| ... | ... | ... |

## Client — Pages
| 檔案 | 職責 |
|------|------|
| `client/src/pages/LobbyPage.tsx` | 大廳頁面 |
| ... | ... |
```

### api-events.md（API 事件）

列出所有 Socket.IO 事件及其 payload：

```markdown
## Client → Server 事件
| 事件名 | Payload | 說明 |
|--------|---------|------|
| `player:setNickname` | `{ nickname, color }` | 設定暱稱與顏色 |
| ... | ... | ... |

## Server → Client 事件
| 事件名 | Payload | 說明 |
|--------|---------|------|
| `room:updated` | `{ room: RoomInfo }` | 房間狀態更新 |
| ... | ... | ... |
```

---

## 更新原則

1. **即時性**：異動發生後立即更新 wiki，不要累積
2. **準確性**：wiki 內容必須與程式碼保持一致
3. **完整性**：新增的模組/函式/事件必須出現在 wiki 中
4. **簡潔性**：wiki 是摘要，不是完整文件的複製品
5. **可讀性**：使用表格、列表、程式碼區塊增加可讀性

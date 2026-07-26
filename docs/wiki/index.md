# Bridge Online Wiki

> 本 Wiki 自動維護，與程式碼保持同步。任何程式碼的新增、刪除、修改都會觸發對應頁面的更新。

---

## 目錄

- [系統架構](./architecture.md) — 高層架構、模組依賴、設計原則
- [API 事件定義](./api-events.md) — Socket.IO 事件定義與 Payload
- [遊戲規則](./game-rules.md) — 橋牌規則、狀態機、遊戲流程
- [元件清單](./components.md) — 所有模組/元件的清單與職責

---

## 快速導覽

### 專案概述

Bridge Online 是一款線上橋牌 PvP 網頁遊戲。玩家透過瀏覽器進入遊戲，輸入暱稱後即可建立或加入房間，與其他玩家進行標準橋牌對局。

### 技術棧

| 層級 | 技術 |
|------|------|
| 前端 | React 18+ (Vite) + TypeScript + Zustand + CSS Modules |
| 後端 | Node.js + Express + Socket.IO + TypeScript |
| 共用 | shared/ 型別與常數 |
| 測試 | Vitest |
| i18n | react-i18next |

### 核心設計原則

1. **前後端分離** — 前端為 SPA，後端為 WebSocket 服務
2. **Server-Authoritative** — 所有遊戲邏輯在後端執行
3. **純函式 Engine** — 遊戲規則引擎為無副作用的純函式
4. **事件驅動** — 所有即時互動透過 Socket.IO 事件
5. **模組化** — 不使用 Class，以模組為邊界

### 開發順序

```
Phase 0 (Setup) → Phase 1 (Lobby & Room) → Phase 2+3 (Chat + Dealing & Bidding)
→ Phase 4 (Playing & Scoring) → Phase 5+6 (Reconnect + i18n) → Phase 7 (Polish)
```

---

## 最近更新

| 日期 | 異動 |
|------|------|
| 2026-07-18 | 初始化 Wiki 結構 |

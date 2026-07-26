# 🃏 Bridge Online

> 線上橋牌 PvP 網頁遊戲 — Online Bridge Card Game

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-black)](https://socket.io/)
[![Vitest](https://img.shields.io/badge/Vitest-66%20tests-green)](https://vitest.dev/)

## 📋 概述

Bridge Online 是一款即時線上橋牌遊戲，支援 4 人 PvP 對局。採用前後端分離的 monorepo 架構，以 Socket.IO 實現即時通訊，所有遊戲邏輯在伺服器端執行（Server-Authoritative）。

### 主要功能

- 🏠 **大廳系統**：建立/加入房間、暱稱設定、顏色選擇
- 💺 **座位系統**：四方位（N/E/S/W）自由選座、準備機制
- 🎴 **完整橋牌流程**：發牌 → 倒牌重洗 → 叫牌 → 出牌 → 結算
- 💬 **即時聊天**：房間內文字聊天
- 🔄 **斷線重連**：60 秒重連窗口，遊戲中斷線自動恢復
- 🌐 **多語系**：中文 / English 即時切換

## 🏗️ 技術架構

```
Bridge_Online/
├── shared/          # 共用型別與常數
│   └── src/
│       ├── types/   # TypeScript 型別定義
│       └── constants/ # 遊戲規則常數
├── server/          # Node.js + Express + Socket.IO
│   └── src/
│       ├── engine/   # 純函式遊戲引擎
│       ├── managers/ # 狀態管理層
│       ├── socket/   # Socket.IO 事件處理
│       └── utils/    # 工具函式
├── client/          # React 19 + Vite + Zustand
│   └── src/
│       ├── components/ # UI 元件
│       ├── pages/      # 頁面
│       ├── stores/     # Zustand 狀態
│       └── hooks/      # Custom Hooks
└── docs/            # 文件
```

### 模組依賴方向

```
Socket 層 → Manager 層 → Engine 層 → Shared (types/constants)
```

- **Engine 層**：純函式，無副作用，輸入→輸出
- **Manager 層**：維護記憶體中的 Map/Object 狀態
- **Socket 層**：膠水層，僅事件路由與 payload 轉換

## 🚀 快速開始

### 環境需求

- Node.js ≥ 18
- npm ≥ 9

### 安裝

```bash
# Clone
git clone <repo-url>
cd Bridge_Online

# 安裝所有依賴（npm workspaces）
npm install
```

### 開發模式

```bash
# 啟動後端（port 3001）
cd server
npm run dev

# 啟動前端（port 5173）
cd client
npm run dev
```

### 測試

```bash
cd server
npx vitest run
```

## 🧪 測試覆蓋

| 模組 | 測試案例 | 說明 |
|------|---------|------|
| `deck.ts` | 9 | 牌組生成、洗牌、可確定性 |
| `dealing.ts` | 12 | 發牌、排序、HCP 計算、倒牌重洗 |
| `bidding.ts` | 20 | 叫牌驗證、比較、結束條件 |
| `playing.ts` | 18 | 出牌驗證、跟牌、墩贏家 |
| `scoring.ts` | 7 | 結算、隊伍判定 |
| **合計** | **66** | **全部通過** |

## 🎮 遊戲規則

1. **發牌**：52 張牌平均分配給 4 位玩家（每人 13 張）
2. **倒牌重洗**：無 A 且 HCP ≤ 4 的玩家可申請重洗
3. **叫牌**：莊家右方開始，依序叫牌（1♣-7NT），連續 3 pass 結束
4. **出牌**：莊家左方首引，必須跟出首引花色，王牌可切牌
5. **結算**：莊家方達到 6+合約等級 的墩數即獲勝

## 📝 API 事件

### Client → Server

| 事件 | 說明 |
|------|------|
| `player:setNickname` | 設定暱稱與顏色 |
| `room:create` | 建立房間 |
| `room:join` | 加入房間 |
| `room:changeSeat` | 換座位 |
| `room:ready` / `room:unready` | 準備/取消 |
| `game:bid` | 叫牌 |
| `game:playCard` | 出牌 |
| `game:redealResponse` | 倒牌重洗回應 |
| `chat:send` | 發送聊天訊息 |
| `player:reconnect` | 斷線重連 |

### Server → Client

| 事件 | 說明 |
|------|------|
| `room:updated` | 房間資訊更新 |
| `game:dealt` | 發牌完成 |
| `game:biddingStart` | 叫牌開始 |
| `game:bidMade` | 有人叫牌 |
| `game:biddingEnd` | 叫牌結束 |
| `game:turnStart` | 輪到出牌 |
| `game:cardPlayed` | 有人出牌 |
| `game:trickEnd` | 一墩結束 |
| `game:ended` | 遊戲結束 |
| `chat:received` | 收到聊天訊息 |

## 📚 文件

- [需求文件](docs/agents.md)
- [工程計劃](docs/proposal.md)
- [詳細設計](docs/design.md)
- [Wiki 首頁](docs/wiki/index.md)
- [元件清單](docs/wiki/components.md)
- [任務進度](docs/tasks/progress.md)

## 📄 授權

MIT License

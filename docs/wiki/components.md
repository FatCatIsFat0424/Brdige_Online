# 元件清單

> [返回目錄](./index.md)

本頁面列出專案中所有已實作的模組與元件清單及職責。

---

## Shared 層 — 型別定義 (`shared/src/types/`)

| 檔案 | 職責 | 主要匯出 |
|------|------|---------|
| `player.ts` | 玩家相關型別 | `PlayerId`, `ReconnectToken`, `Seat`, `PlayerColor`, `PlayerInfo`, `ConnectionStatus` |
| `room.ts` | 房間相關型別 | `RoomCode`, `GameType`, `RoomStatus`, `SeatInfo`, `SeatMap`, `RoomInfo` |
| `game.ts` | 遊戲相關型別 | `Suit`, `BidSuit`, `Rank`, `Card`, `BidLevel`, `BidAction`, `Contract`, `GamePhase`, `TrickRecord`, `GameLogEntry`, `GameResult`, `Team`, `PlayingState`, `BiddingState`, `GameState`, `PlayerVisibleGameState` |
| `chat.ts` | 聊天相關型別 | `ChatMessage` |
| `socket-events.ts` | Socket 事件定義 | `ClientToServerEvents`, `ServerToClientEvents` |

## Shared 層 — 常數定義 (`shared/src/constants/`)

| 檔案 | 職責 | 主要匯出 |
|------|------|---------|
| `cards.ts` | 牌組常數 | `SUIT_DISPLAY_ORDER`, `RANK_ORDER_DESC`, `SUIT_SYMBOLS`, `RANK_DISPLAY`, `HIGH_CARD_POINTS` |
| `game-rules.ts` | 遊戲規則常數 | `HAND_SIZE`, `TOTAL_TRICKS`, `CONTRACT_BASE_TRICKS`, `SEAT_ORDER_CLOCKWISE`, `TEAM_SEATS`, `BID_SUIT_ORDER`, `REDEAL_MAX_POINTS`, `RECONNECT_TIMEOUT_MS`, `ROOM_CODE_LENGTH`, `NICKNAME_MAX_LENGTH` |

---

## Server — Engine 層 (`server/src/engine/`)

| 檔案 | 職責 | 匯出函式 |
|------|------|---------|
| `deck.ts` | 牌組生成與洗牌 | `createDeck`, `shuffleDeck` |
| `dealing.ts` | 發牌、排序、倒牌重洗 | `dealCards`, `sortHand`, `calculateHandPoints`, `isRedealEligible`, `findRedealEligibleSeat` |
| `bidding.ts` | 叫牌規則引擎 | `createBiddingState`, `compareBids`, `getValidBids`, `validateBid`, `applyBid`, `checkBiddingEnd`, `getNextSeat` |
| `playing.ts` | 出牌規則引擎 | `createPlayingState`, `getValidPlays`, `validatePlay`, `applyPlay`, `determineTrickWinner`, `compareCards`, `completeTrick`, `isPlayingComplete`, `removeCardFromHand` |
| `scoring.ts` | 結算引擎 | `getSeatTeam`, `calculateGameResult` |

## Server — Manager 層 (`server/src/managers/`)

| 檔案 | 職責 | 匯出函式 |
|------|------|---------|
| `player-manager.ts` | 玩家 Session 管理 | `createPlayer`, `getPlayerIdBySocketId`, `getPlayerInfo`, `getPlayerState`, `setPlayerRoom`, `markDisconnected`, `attemptReconnect`, `isDisconnectTimedOut`, `removePlayer` |
| `room-manager.ts` | 房間生命週期管理 | `createRoom`, `getRoomInfo`, `joinRoom`, `leaveRoom`, `changeSeat`, `setReady`, `isAllReady`, `getPlayerSeat`, `getPlayerIdBySeat`, `setRoomStatus`, `resetAllReady`, `removeRoom`, `getSeatPlayerMap` |
| `game-manager.ts` | 遊戲流程管理 | `registerCallbacks`, `startGame`, `handleRedealResponse`, `handleBid`, `handlePlayCard`, `abortGame`, `getPlayerVisibleState`, `getGameState`, `removeGame`, `hasActiveGame` |
| `chat-manager.ts` | 聊天訊息管理 | `initRoomChat`, `addMessage`, `getChatHistory`, `clearRoomChat` |

## Server — Socket 層 (`server/src/socket/`)

| 檔案 | 職責 | 匯出函式 |
|------|------|---------|
| `connection.ts` | 連線/斷線處理 | `setupConnectionHandler` |
| `room-handler.ts` | 房間事件處理 | `registerRoomHandlers` |
| `game-handler.ts` | 遊戲事件處理 | `registerGameHandlers`, `setupGameCallbacks` |
| `chat-handler.ts` | 聊天事件處理 | `registerChatHandlers` |

## Server — Utils (`server/src/utils/`)

| 檔案 | 職責 | 匯出函式 |
|------|------|---------|
| `id-generator.ts` | ID 生成 | `generatePlayerId`, `generateRoomCode`, `generateReconnectToken`, `generateMessageId` |

## Server — 進入點

| 檔案 | 職責 |
|------|------|
| `index.ts` | Express + HTTP + Socket.IO 初始化，setupGameCallbacks + setupConnectionHandler |

---

## Server — 測試 (`server/tests/engine/`)

| 檔案 | 測試對象 | 測試數量 |
|------|---------|---------|
| `deck.test.ts` | `deck.ts` — 牌組生成、洗牌、可確定性 | 9 |
| `dealing.test.ts` | `dealing.ts` — 發牌、排序、HCP、倒牌重洗 | 12 |
| `bidding.test.ts` | `bidding.ts` — 叫牌驗證、比較、結束條件 | 20 |
| `playing.test.ts` | `playing.ts` — 出牌驗證、跟牌、墩贏家 | 18 |
| `scoring.test.ts` | `scoring.ts` — 結算、隊伍判定 | 7 |

**總計：5 個測試檔案，66 個測試案例，全部通過**

---

## Client — Pages (`client/src/pages/`)

| 檔案 | 職責 |
|------|------|
| `LobbyPage.tsx` + `.module.css` | 大廳頁面：暱稱輸入、顏色選擇、房間建立/加入 |
| `RoomPage.tsx` + `.module.css` | 房間頁面：四座位佈局、準備按鈕、聊天面板、遊戲開始自動跳轉 |
| `GamePage.tsx` + `.module.css` | 遊戲頁面：桌面佈局、手牌、叫牌、出牌、結算覆蓋 |

## Client — Components (`client/src/components/`)

| 檔案 | 職責 |
|------|------|
| `CardHand.tsx` + `.module.css` | 手牌顯示，支援可出牌高亮與點選 |
| `BiddingPanel.tsx` + `.module.css` | 叫牌面板，7×5 叫牌格子 + Pass 按鈕 |
| `TrickArea.tsx` + `.module.css` | 當前墩四方向出牌顯示 + 得墩計分 |
| `ChatPanel.tsx` + `.module.css` | 聊天面板，訊息列表 + 輸入送出 |
| `LanguageSwitch.tsx` + `.module.css` | 語系切換按鈕（zh-TW / en） |

## Client — Stores (`client/src/stores/`)

| 檔案 | 職責 |
|------|------|
| `player-store.ts` | 玩家自身狀態（暱稱、顏色、ID、token） |
| `room-store.ts` | 房間狀態（房間代碼、座位、我的座位） |
| `game-store.ts` | 遊戲狀態（階段、手牌、叫牌、出牌、結果） |
| `chat-store.ts` | 聊天訊息列表 |
| `i18n-store.ts` | 語系狀態管理（locale、t 函式） |

## Client — Hooks (`client/src/hooks/`)

| 檔案 | 職責 |
|------|------|
| `use-game-events.ts` | 監聽 Socket.IO 遊戲事件並同步到 game-store |
| `use-reconnect.ts` | 自動重連 hook，連線恢復時以 token 重新認證 |

## Client — 其他

| 檔案 | 職責 |
|------|------|
| `main.tsx` | React 進入點 |
| `App.tsx` | 根元件、路由（`/`, `/room/:roomCode`, `/game/:roomCode`） |
| `socket.ts` | Socket.IO client 初始化 + 重連配置 |
| `i18n.ts` | 多語系翻譯系統（zh-TW, en），支援參數插值 |
| `styles/global.css` | 全域樣式、CSS 變數、深色主題、動畫 |

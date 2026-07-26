# API 事件定義

> [返回目錄](./index.md)

本頁面列出所有 Socket.IO 事件定義，包含事件名稱、Payload 結構與說明。

---

## Client → Server 事件

所有 Client → Server 事件都使用 callback 回傳結果。

### 玩家事件

| 事件名 | Payload | Callback | 說明 |
|--------|---------|----------|------|
| `player:setNickname` | `{ nickname: string, color: PlayerColor }` | `{ success, error?, playerId?, reconnectToken? }` | 設定暱稱與顏色 |
| `player:reconnect` | `{ token: ReconnectToken }` | `{ success, error?, room?, gameState? }` | 嘗試重連 |

### 房間事件

| 事件名 | Payload | Callback | 說明 |
|--------|---------|----------|------|
| `room:create` | `{ gameType: GameType }` | `{ success, error?, roomCode? }` | 建立房間 |
| `room:join` | `{ roomCode: RoomCode }` | `{ success, error?, room? }` | 加入房間 |
| `room:leave` | — | `{ success, error? }` | 離開房間 |
| `room:changeSeat` | `{ seat: Seat }` | `{ success, error? }` | 更換座位 |
| `room:ready` | — | `{ success, error? }` | 按下準備 |
| `room:unready` | — | `{ success, error? }` | 取消準備 |

### 遊戲事件

| 事件名 | Payload | Callback | 說明 |
|--------|---------|----------|------|
| `game:redealResponse` | `{ accept: boolean }` | `{ success, error? }` | 回應倒牌重洗 |
| `game:bid` | `{ bid: BidAction }` | `{ success, error? }` | 叫牌 |
| `game:playCard` | `{ card: Card }` | `{ success, error? }` | 出牌 |
| `game:continue` | — | `{ success, error? }` | 繼續下一局 |

### 聊天事件

| 事件名 | Payload | Callback | 說明 |
|--------|---------|----------|------|
| `chat:send` | `{ message: string }` | `{ success, error? }` | 發送聊天訊息 |

---

## Server → Client 事件

### 房間事件

| 事件名 | Payload | 說明 |
|--------|---------|------|
| `room:updated` | `{ room: RoomInfo }` | 房間狀態更新（座位、準備等） |
| `room:playerLeft` | `{ playerId: PlayerId, seat: Seat }` | 有玩家離開 |

### 遊戲事件

| 事件名 | Payload | 說明 |
|--------|---------|------|
| `game:started` | `{ gameState: PlayerVisibleGameState }` | 遊戲開始 |
| `game:dealt` | `{ hand: Card[] }` | 發牌結果（僅自己的手牌） |
| `game:redealAvailable` | `{ seat: Seat }` | 通知可倒牌重洗 |
| `game:redealt` | `{ hand: Card[] }` | 重洗後的新手牌 |
| `game:biddingStart` | `{ startSeat: Seat }` | 叫牌階段開始 |
| `game:bidMade` | `{ seat: Seat, action: BidAction }` | 某玩家叫牌 |
| `game:biddingEnd` | `{ contract: Contract }` | 叫牌結束，合約確定 |
| `game:turnStart` | `{ seat: Seat, validCards?: Card[] }` | 輪到某玩家出牌 |
| `game:cardPlayed` | `{ seat: Seat, card: Card }` | 某玩家出牌 |
| `game:trickEnd` | `{ winner: Seat, cards: Record<Seat, Card>, trickCountEW: number, trickCountNS: number }` | 一墩結束 |
| `game:ended` | `{ result: GameResult }` | 遊戲結束結算 |
| `game:aborted` | `{ reason: string }` | 遊戲中止 |
| `game:logEntry` | `{ entry: GameLogEntry }` | 遊戲動作日誌 |

### 聊天事件

| 事件名 | Payload | 說明 |
|--------|---------|------|
| `chat:received` | `{ message: ChatMessage }` | 收到聊天訊息 |

### 連線事件

| 事件名 | Payload | 說明 |
|--------|---------|------|
| `player:disconnected` | `{ seat: Seat }` | 有玩家斷線 |
| `player:reconnected` | `{ seat: Seat }` | 有玩家重連 |

---

## 型別參考

### 基礎型別

```typescript
type PlayerId = string;
type ReconnectToken = string;
type Seat = 'N' | 'E' | 'S' | 'W';
type PlayerColor = string;           // 十六進制色碼
type RoomCode = string;              // 6 碼英數字
type GameType = 'bridge';
type RoomStatus = 'waiting' | 'playing';
```

### 遊戲型別

```typescript
type Suit = 'clubs' | 'diamonds' | 'hearts' | 'spades';
type BidSuit = Suit | 'nt';
type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;
type BidLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type GamePhase = 'dealing' | 'redeal_pending' | 'bidding' | 'playing' | 'scoring';
type Team = 'EW' | 'NS';

interface Card { suit: Suit; rank: Rank; }
type BidAction = { type: 'bid'; level: BidLevel; suit: BidSuit } | { type: 'pass' };
interface Contract { level: BidLevel; suit: BidSuit; declarer: Seat; }
```

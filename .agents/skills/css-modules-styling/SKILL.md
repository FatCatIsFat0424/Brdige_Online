---
name: css-modules-styling
description: CSS Modules 樣式撰寫規範。定義命名慣例、CSS 變數使用、元件級樣式隔離規則，確保前端視覺一致性。
---

# CSS Modules 樣式規範

本 Skill 定義 Bridge Online 前端的樣式撰寫規範。使用 CSS Modules 實現元件級樣式隔離。

---

## 檔案組織

### 全域樣式
- `client/src/styles/global.css` — CSS 變數、Reset、全域基礎樣式
- 在 `main.tsx` 中引入

### 頁面樣式
- `client/src/styles/LobbyPage.module.css`
- `client/src/styles/RoomPage.module.css`
- `client/src/styles/GamePage.module.css`

### 元件樣式
- 與元件同目錄或在 `client/src/styles/components/` 下
- 命名與元件對應：`ChatPanel.module.css`

---

## CSS 變數定義（global.css）

```css
:root {
  /* 色彩 */
  --color-primary: #1a73e8;
  --color-primary-hover: #1557b0;
  --color-success: #34a853;
  --color-danger: #ea4335;
  --color-warning: #fbbc04;

  /* 背景 */
  --bg-page: #0f1923;
  --bg-card: #1e2d3d;
  --bg-input: #2a3a4a;

  /* 文字 */
  --text-primary: #e8eaed;
  --text-secondary: #9aa0a6;
  --text-muted: #5f6368;

  /* 撲克牌花色 */
  --suit-spades: #1a1a2e;
  --suit-hearts: #e74c3c;
  --suit-clubs: #1a1a2e;
  --suit-diamonds: #e74c3c;

  /* 間距 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* 圓角 */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-pill: 999px;

  /* 陰影 */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.4);

  /* 字體 */
  --font-primary: 'Inter', 'Noto Sans TC', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* 過渡 */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow: 400ms ease;
}
```

---

## 命名慣例

### CSS Module class 名稱：camelCase

```css
/* ✅ camelCase */
.seatSlot { }
.playerInfo { }
.handCards { }
.biddingPanel { }

/* ❌ 不使用 kebab-case 或 BEM */
.seat-slot { }
.player-info__name { }
```

### 狀態 class

```css
/* 使用語義化的狀態名稱 */
.isActive { }
.isDisabled { }
.isReady { }
.isMyTurn { }
.isEmpty { }
```

### 在 JSX 中使用

```tsx
import styles from './SeatSlot.module.css';

// 單一 class
<div className={styles.seatSlot}>

// 多個 class（使用 template literal）
<div className={`${styles.seatSlot} ${isActive ? styles.isActive : ''}`}>

// 條件 class（推薦使用陣列 filter join）
<div className={[styles.seatSlot, isActive && styles.isActive].filter(Boolean).join(' ')}>
```

---

## 設計規範

### 佈局
- 使用 CSS Grid 或 Flexbox，避免 float
- 遊戲桌面使用 CSS Grid 配置四個方位

### 互動反饋
```css
.button {
  transition: var(--transition-fast);
}

.button:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.button:active {
  transform: translateY(0);
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
```

### 撲克牌樣式
```css
.card {
  width: 60px;
  height: 90px;
  border-radius: var(--radius-md);
  background: white;
  border: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition-fast);
}

.card:hover {
  transform: translateY(-8px);
}

.card.isPlayable {
  box-shadow: 0 0 8px var(--color-primary);
}

.suitRed {
  color: var(--suit-hearts);
}

.suitBlack {
  color: var(--suit-spades);
}
```

---

## 禁止事項

| 禁止 | 替代方案 |
|------|---------|
| 內聯 style（`style={{...}}`） | 使用 CSS Module class |
| 全域 CSS class（非 global.css） | 使用 `.module.css` |
| `!important` | 調整 CSS 特異性 |
| 固定像素值（尺寸、間距） | 使用 CSS 變數 |
| 硬編碼顏色值 | 使用 CSS 變數 |

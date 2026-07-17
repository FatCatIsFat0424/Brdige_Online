---
name: self-check
description: 程式碼自我檢測規範。定義每個任務完成前必須執行的檢測項目（lint、type check、test），確保程式碼品質。
---

# 程式碼自我檢測規範

本 Skill 定義每個 Agent 在完成任務前必須執行的自我檢測流程。

---

## 檢測流程

每個子任務完成前，必須依序通過以下檢測：

### Step 1: TypeScript 型別檢查

```bash
# 檢查 shared
cd shared && npx tsc --noEmit

# 檢查 server
cd server && npx tsc --noEmit

# 檢查 client
cd client && npx tsc --noEmit
```

**通過條件**：零型別錯誤

### Step 2: ESLint 程式碼風格檢查

```bash
# 檢查所有程式碼
npx eslint "shared/src/**/*.ts" "server/src/**/*.ts" "client/src/**/*.{ts,tsx}"
```

**通過條件**：零 error（warning 可接受但應盡量修復）

### Step 3: 單元測試

```bash
# 執行所有測試
cd server && npx vitest run
```

**通過條件**：所有測試通過（0 failures）

### Step 4: 建置驗證（視情況）

```bash
# 前端建置驗證
cd client && npx vite build

# 後端啟動驗證
cd server && npx tsx src/index.ts
```

**通過條件**：無建置錯誤

---

## 檢測時機

| 時機 | 必要檢測 |
|------|---------|
| 完成一個子任務 | Step 1 (型別檢查) |
| 完成一個 Component (Phase) | Step 1 + 2 + 3 |
| 提交程式碼前 | Step 1 + 2 + 3 |
| 完成所有開發 | Step 1 + 2 + 3 + 4 |

---

## 檢測範圍對應

| 異動範圍 | 需要檢測的模組 |
|---------|---------------|
| 僅修改 `shared/` | shared + server + client（因為都依賴 shared） |
| 僅修改 `server/src/engine/` | shared + server |
| 僅修改 `server/src/managers/` | shared + server |
| 僅修改 `server/src/socket/` | shared + server |
| 僅修改 `client/` | shared + client |

---

## 失敗處理

1. **型別錯誤**：立即修復，不得跳過
2. **Lint 錯誤**：立即修復
3. **測試失敗**：分析原因 →
   - 若是實作 bug → 修復程式碼
   - 若是測試本身有問題 → 修復測試（但需確認測試邏輯正確）
4. **建置失敗**：分析原因，通常是 import 路徑或設定問題

---

## 自動化提示

Agent 在結束一個任務單元時，應主動：

1. 執行上述檢測命令
2. 確認結果
3. 若失敗則修復後重新檢測
4. 在任務紀錄中標注檢測結果

### 報告格式

```
✅ TypeScript: 0 errors
✅ ESLint: 0 errors, 2 warnings
✅ Tests: 24 passed, 0 failed
✅ Build: success
```

或

```
❌ TypeScript: 3 errors
  - server/src/engine/bidding.ts:42 — Type 'string' is not assignable to 'Seat'
  - ...
```

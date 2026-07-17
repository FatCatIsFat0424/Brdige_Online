# Hook: Pre-Commit Check

> **觸發時機**: 程式碼提交前（或完成一個 Component/Phase 前）
> **類型**: 阻斷性（必須通過才可繼續）

---

## 行為描述

在程式碼提交或完成一個開發階段前，自動執行以下檢查序列。全部通過後才可標記任務為完成。

---

## 檢查序列

### 1. ESLint 程式碼風格檢查

```bash
npx eslint "shared/src/**/*.ts" "server/src/**/*.ts" "client/src/**/*.{ts,tsx}" --max-warnings 0
```

- **通過條件**: 0 errors, 0 warnings
- **失敗處理**: 自動修復（`--fix`）後重新檢查，無法自動修復的需手動處理

### 2. TypeScript 型別檢查

```bash
cd shared && npx tsc --noEmit
cd server && npx tsc --noEmit
cd client && npx tsc --noEmit
```

- **通過條件**: 0 type errors
- **失敗處理**: 修復型別錯誤後重新檢查

### 3. 單元測試

```bash
cd server && npx vitest run
```

- **通過條件**: 所有測試通過（0 failures）
- **失敗處理**: 修復失敗的測試或對應的程式碼

---

## 輸出格式

```
[pre-commit-check] Starting checks...
[pre-commit-check] ✅ ESLint: passed (0 errors, 0 warnings)
[pre-commit-check] ✅ TypeScript: passed (0 errors)
[pre-commit-check] ✅ Tests: passed (24/24)
[pre-commit-check] All checks passed ✅
```

或

```
[pre-commit-check] Starting checks...
[pre-commit-check] ❌ ESLint: FAILED (2 errors)
[pre-commit-check] Blocking commit. Fix errors and retry.
```

---

## 跳過條件

- 僅修改 `.md` 文件（文件類型更新不需要程式碼檢查）
- 僅修改 `.agents/` 目錄下的設定文件

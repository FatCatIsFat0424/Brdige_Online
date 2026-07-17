# Hook: Post-Task-Complete

> **觸發時機**: 子任務完成後
> **類型**: 非阻斷性（在背景執行）

---

## 行為描述

當一個子任務被標記為完成（`[x]`）時，自動更新 `docs/tasks/progress.md` 中的進度統計。

---

## 更新內容

### 1. 更新對應 Component 的任務統計

```markdown
| Component | 子任務數 | 完成數 | 進度 |
|-----------|---------|--------|------|
| 00 Project Setup | 60 | 15 | 25% |  ← 更新完成數與進度
| 01 Lobby & Room | 52 | 0 | 0% |
| ...
```

### 2. 更新合計列

```markdown
| **合計** | **294** | **15** | **5%** |  ← 更新總計
```

### 3. 更新 Component 進度勾選

```markdown
- [x] [00 — Project Setup](./00-project-setup.md)  ← 全部完成時勾選
- [ ] [01 — Lobby & Room System](./01-lobby-room.md)
```

### 4. 更新最後更新日期

```markdown
> **最後更新**: 2026-07-18  ← 更新為當前日期
```

---

## 計算邏輯

### 完成數計算

掃描對應的任務檔案（如 `00-project-setup.md`），計算所有 `- [x]` 的行數。

### 進度百分比

```
進度 = floor(完成數 / 子任務數 * 100)
```

### Component 完成判定

當一個 Component 的所有子任務都標記為 `[x]` 時，在 `progress.md` 的 Component 進度列表中將 `[ ]` 改為 `[x]`。

---

## 觸發方式

Agent 在完成任務後，應主動：

1. 將任務檔案中對應的 `- [ ]` 改為 `- [x]`
2. 執行 post-task-complete hook 邏輯更新 progress.md
3. 確認更新結果正確

---

## 範例

```
[post-task-complete] Task completed in 00-project-setup.md
[post-task-complete] Updated progress: 00 Project Setup — 15/60 (25%)
[post-task-complete] Updated total: 15/294 (5%)
[post-task-complete] progress.md updated ✅
```

# Hook: Post-File-Change

> **觸發時機**: 任何 `.ts`、`.tsx`、`.css`、`.json`、`.md` 檔案新增、刪除或修改後
> **類型**: 非阻斷性（在背景執行）

---

## 行為描述

當專案中的程式碼或文件發生異動後，自動觸發 `wiki-auto-update` skill，更新 `docs/wiki/` 下的對應頁面，確保 wiki 與程式碼保持同步。

---

## 觸發條件

### 追蹤的異動類型

| 異動 | 更新目標 |
|------|---------|
| 新增 `.ts`/`.tsx` 檔案 | `docs/wiki/components.md` — 新增元件條目 |
| 刪除 `.ts`/`.tsx` 檔案 | `docs/wiki/components.md` — 移除元件條目 |
| 修改 `shared/src/types/socket-events.ts` | `docs/wiki/api-events.md` — 更新事件定義 |
| 修改 `server/src/engine/*` | `docs/wiki/game-rules.md` — 更新規則描述 |
| 修改架構相關檔案 | `docs/wiki/architecture.md` — 更新架構描述 |
| 新增/刪除/修改任何追蹤檔案 | `docs/wiki/index.md` — 更新「最近更新」記錄 |

### 忽略的路徑

- `node_modules/`
- `dist/`
- `.git/`
- `docs/wiki/`（避免無限遞迴觸發）
- `*.log`
- `*.lock`

---

## 執行流程

```
1. 偵測異動檔案清單
2. 判斷影響的 wiki 頁面
3. 讀取當前 wiki 頁面內容
4. 根據異動類型更新內容：
   - 新增 → 在對應區塊加入新條目
   - 刪除 → 從對應區塊移除條目
   - 修改 → 更新對應條目的描述
5. 更新 index.md 的「最近更新」區段
6. 寫入更新後的 wiki 頁面
```

---

## 注意事項

- wiki 更新不應觸發自身的 post-file-change hook（避免遞迴）
- 若同一批次有多個檔案異動，應合併為一次 wiki 更新
- wiki 更新失敗不應阻斷主要開發工作

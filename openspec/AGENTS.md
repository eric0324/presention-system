# OpenSpec AGENTS.md

本專案使用 Spec-Driven Development (SDD) + Test-Driven Development (TDD)。

## 目錄結構

```
openspec/
  AGENTS.md          ← 本檔案，AI 工作說明
  changes/           ← 進行中的變更
    [change-name]/
      proposal.md    ← 問題與方向
      specs.md       ← 功能規格（含 scenarios）
      design.md      ← 技術設計與架構
      tasks.md       ← 可執行的工作清單
  archive/           ← 已完成的變更
```

## AI 工作規則

1. 開始前先讀本檔案
2. 確認 `changes/` 下有無進行中的 change
3. 未有 spec 前不得寫程式碼
4. 每完成一個 task 回報進度
5. spec 與程式碼衝突時，以 spec 為準

## 當前進行中的 Change

- `changes/presentation-system/` → 簡報系統初始建置

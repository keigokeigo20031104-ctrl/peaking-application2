# CLAUDE.md — peaking-application2 開発ルール

このリポジトリ（体重管理アプリ v2）で作業するときの共通ルール。
developer / reviewer / release-manager の各エージェントはこのルールに従うこと。

## 対象

- 対象リポジトリは **peaking-application2** のみ。
- 旧リポジトリ **peaking-application は絶対に触らない**（別ディレクトリ）。

## 技術構成（維持する）

- React + Vite + Tailwind CSS + shadcn/ui 構成を維持する。
- React Router はまだ使わない。**`location.pathname` によるルーティング**（`src/App.jsx`）を維持する。
- shadcn/ui の既存設定（`components.json`、`src/components/ui/*`、Tailwind テーマ）を壊さない。
- 外部グラフライブラリなど、npm パッケージの追加は**必要最小限**にする。

## URL構造（維持する）

- `/`
- `/tracker/`
- `/solo/`
- `/admin/`
- `/feedback/`

## データ / ストレージ

- localStorage キー
  - tracker: `weight-log-v2-tracker-records`
  - solo: `weight-log-v2-solo-records`
- 保存データは `record[]`（`date` でユニーク）。`date` は `YYYY-MM-DD`。
- 保存形式（共通）:
  ```
  { user, date, weight, calories|null, note, meals:[{time,text}], training:[{parts:[],exercise,sets:[{weight|null,reps|null,note}]}] }
  ```

## 品質ゲート

- **build が失敗した状態で commit しない。**
- **push 前に `npm run build` と `npm run test:e2e` の両方を確認する。**
- 既存の v2 最小機能（tracker/solo のローカル記録）を壊さない。

## まだやらないこと

- `/api/records` 送信・管理者連携・KV 連携はまだ実装しない。
- API/KV 連携を入れるまでは **`_worker.js` を不用意に作り込まない**。
- 認証・PWA はまだ入れない。

## 開発フロー

半自動フロー（developer → reviewer → release-manager）は `docs/agent-workflow.md` を参照。

## Release-Manager の自動安全装置

- **`npm run check` が成功した場合のみ commit & push する。**
  - `npm run check` = `npm run build && npm run test:e2e`
  - ローカル hooks で commit/push 前に自動実行
  - GitHub Actions CI でも push/PR 時に検証
- **失敗時は developer に差し戻す。**
  - build 失敗 → developer が fix
  - e2e テスト失敗 → developer が fix
- commit message: `<type>: <description>`（例: `fix: バグ修正` など）

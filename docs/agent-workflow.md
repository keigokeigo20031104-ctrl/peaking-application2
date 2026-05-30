# 完全自動開発フロー

## 全体フロー

```
developer (実装)
  ↓
  git add & git commit
    ↓ (ローカル hooks で自動check)
  ✓ npm run check 成功
    ↓
  release-manager (自動実行)
    ↓
    git push
      ↓ (GitHub Actions で再検証)
      ✓ build & e2e OK
        ↓
        Cloudflare デプロイ
```

## 各ロール詳細

### 1. Developer
- 実装・修正を完了
- `git add <files>`
- `git commit -m "type: description"`

**ローカル hooks が自動実行：**
- commit 前に `npm run check` (build + e2e test)
- 失敗したら commit が止まる → fix → 再度 commit

### 2. Reviewer
- **ほぼ不要** → hooks と CI が自動検証
- 必要に応じて code review（PR コメント）

### 3. Release-Manager
- `npm run check` 成功を確認
- `git push` を実行

**ローカル hooks が自動実行：**
- push 前に再度 `npm run check`
- 失敗したら push が止まる

### 4. GitHub Actions CI
- main push & PR 時に実行
- `npm ci` → `npm run build` → `npm run test:e2e`
- 失敗したら赤バッジ

### 5. Cloudflare Deployment
- main への push 後に自動デプロイ
- `.github/workflows/ci.yml` 完了後

## ローカル安全装置

**`.claude/settings.json`:**
- PreToolUse hooks で `git commit` & `git push` 前に `npm run check` を実行
- 失敗したら command が stop

## CI 安全装置

**`.github/workflows/ci.yml`:**
- Node.js 18 で実行
- `npm ci` (clean install)
- `npm run build`
- `npm run test:e2e`
- 失敗したら赤になる

## 注意事項

- 旧リポジトリ `peaking-application` は絶対に触らない
- API/KV 連携はまだ実装しない
- 既存の v2 最小機能を壊さない

## ターミナル構成（参考）

- 左: developer（実装）
- 右: reviewer（監視 - 自動化で不要になることも）
- CI/CD: GitHub Actions（自動）

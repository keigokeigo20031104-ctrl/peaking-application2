# 半自動開発フロー

1. developer が実装
2. reviewer が `npm run build` と `npm run test:e2e` を実行
3. 不具合があれば developer に戻す
4. 問題がなければ release-manager が commit & push
5. push 後に Cloudflare デプロイを確認

## ターミナル構成

- 左: developer
- 右: reviewer
- 必要時: release-manager

## コマンド早見表

| 役割 | 主なコマンド |
|---|---|
| developer | `npm run build` |
| reviewer | `npm run build` / `npm run test:e2e`（= `npm run check`） |
| release-manager | `npm run check` → `git add` / `commit` / `push` |

## 禁止事項

- reviewer は原則ファイル編集しない
- build 失敗中に commit しない
- test:e2e 失敗中に push しない
- 旧リポジトリ peaking-application を触らない

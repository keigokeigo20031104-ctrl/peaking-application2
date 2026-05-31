# Claude Code 自動開発ループ

このプロジェクトで Claude Code を非対話実行し、developer / reviewer / release-manager の流れを自動化するための土台です。

## できること

`scripts/auto-dev-loop.ps1` は次の順番で処理します。

1. `.claude/commands/developer.md` を読み込み、実装方針を `.auto-plan.md` に保存
2. `.claude/commands/reviewer.md` を読み込み、方針レビューを `.auto-review.md` に保存
3. developer がレビュー内容を踏まえて実装し、ログを `.auto-implement.md` に保存
4. `npm run build` を実行し、結果を `.auto-build.log` に保存
5. build が失敗した場合、ログを developer に渡して修正
6. 最大回数まで build / 修正を繰り返す
7. `.claude/commands/release-manager.md` を読み込み、最終レポートを `.auto-final-report.md` に保存

## 実行例

PowerShell から直接実行します。

```powershell
powershell -ExecutionPolicy Bypass -File scripts/auto-dev-loop.ps1 -Task "トップページUIを参照サイトに近づける" -MaxRounds 3
```

npm script からも実行できます。

```powershell
npm run auto:dev -- -Task "トップページUIを参照サイトに近づける" -MaxRounds 3
```

サンプル実行:

```powershell
npm run auto:dev:sample
```

## 生成されるログ

- `.auto-plan.md`: developer の実装方針
- `.auto-review.md`: reviewer の指摘
- `.auto-implement.md`: developer の実装ログ
- `.auto-fix-round-1.md`: build 失敗後の修正ログ。ラウンドごとに番号が増えます
- `.auto-build.log`: `npm run build` の実行ログ
- `.auto-diff-stat.md`: 自動ループ前後の `git status` / `git diff --stat` / 変更ファイル一覧
- `.auto-safety.md`: ガード対象ファイルの監視ログ
- `.auto-final-report.md`: release-manager の最終レポート

これらは `.gitignore` に追加しているため、通常はコミット対象になりません。

## エラー時の見方

まず `.auto-build.log` を確認してください。`Build round N` ごとに `npm run build` の出力と終了コードが残ります。

Claude 側の実行で止まった場合は、直前に作られた `.auto-plan.md`、`.auto-review.md`、`.auto-implement.md`、または `.auto-fix-round-N.md` を確認してください。

最大回数に達しても build が成功しない場合、スクリプトは終了コード `1` で終了します。その場合でも `.auto-final-report.md` に残課題がまとめられます。

Windows の実行ポリシーで `npm.ps1` が止まる環境があるため、スクリプト内では `npm.cmd` を優先して `npm run build` を実行します。手動確認で同じエラーが出る場合は、次のように実行してください。

```powershell
npm.cmd run build
```

## 安全装置

自動ループは、実装前後と修正ラウンド後に差分スナップショットを `.auto-diff-stat.md` へ保存します。想定より変更ファイルが多い場合は、このログでどの段階から差分が広がったか確認できます。

また、既定で次のファイルをガード対象として監視します。

- `_worker.js`
- `wrangler.toml`
- `package-lock.json`

これらが自動ループ中に変更された場合、スクリプトは停止します。監視対象を変えたい場合は `-GuardedFiles` を指定してください。

```powershell
powershell -ExecutionPolicy Bypass -File scripts/auto-dev-loop.ps1 -Task "..." -GuardedFiles "_worker.js","wrangler.toml"
```

## Claude CLI の確認

このスクリプトは Claude CLI の非対話モード `-p` / `--print` を使います。利用できるか確認するには、以下を実行してください。

```powershell
claude --help
```

ヘルプに `-p, --print` または `--print` が表示されれば利用できます。

もし `-p` や `--print` が使えない Claude CLI の場合は、`scripts/auto-dev-loop.ps1` の `Assert-ClaudePrintMode` と `Invoke-ClaudeRole` を、手元の CLI が提供する非対話実行方法に合わせて調整してください。

## 注意点

- このループはアプリ機能修正そのものではなく、開発自動化の土台です。
- `_worker.js` の API 仕様、KV Binding 名 `WEIGHT_LOGS`、保存データの `date` 形式 `YYYY-MM-DD` は変更しない前提です。
- script 内で commit / push は禁止しています。
- 実装後の確認は `npm run build` までです。必要に応じて `npm run test:e2e` を別途実行してください。

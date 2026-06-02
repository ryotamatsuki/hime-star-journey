# BUGS

## 現在の未解決バグ

### ENV-001: PowerShellで `npm run ...` がExecution Policyにより失敗する

- 発生日: 2026-06-02
- フェーズ: P1
- 内容: `npm run typecheck` と `npm run lint` が、PowerShellの `npm.ps1` 実行ポリシーにより拒否された。
- 再現手順: PowerShellで `npm run typecheck` または `npm run lint` を実行する。
- 期待される挙動: npm scriptが実行される。
- 実際の挙動: `npm.ps1` がExecution Policyで拒否される。
- 暫定対応: Windowsでは `npm.cmd run typecheck`、`npm.cmd run lint`、`npm.cmd run build`、`npm.cmd run dev` を使う。
- 状態: 環境要因。プロジェクト側のscriptは正常。

### ENV-002: BrowserプラグインでUI操作検証ができない

- 発生日: 2026-06-02
- フェーズ: P1 / P2 / P3 / P3方針変更
- 内容: Browserプラグインはnode_repl kernel起動に失敗し、P3方針変更対応でもBrowserプラグイン接続時に `windows sandbox failed: spawn setup refresh` でkernelが終了した。Edge headless/CDPはサンドボックス外許可により補助確認に利用できた。
- 再現手順: Browserプラグイン接続、またはEdge headlessで `http://127.0.0.1:5173` を検証する。
- 期待される挙動: Browserプラグインでタイトル表示、はじめからクリック、localStorage保存、リロード後のつづきから有効化を自動確認できる。
- 実際の挙動: Browserプラグインの自動操作環境が起動しない。P3方針変更対応ではEdge headless/CDPで補助確認は実施できた。
- 暫定対応: devサーバーのHTTP 200、typecheck、lint、buildを確認済み。Edge headless/CDPでTitleScreen表示、Prologue経由Explore遷移、必須生成アセット表示、MiniMap表示、localStorage保存を補助確認する。
- 状態: 未解決。実装コード側の既知不具合ではない。

### ENV-003: `Start-Process` が `Path/PATH` 重複でdevサーバー起動に失敗する

- 発生日: 2026-06-02
- フェーズ: P3方針変更
- 内容: PowerShellの `Start-Process` 実行時に `項目は既に追加されています。辞書のキー: 'Path' 追加されるキー:'PATH'` が発生し、devサーバーの常駐起動に失敗した。
- 再現手順: PowerShellで `Start-Process -FilePath npm.cmd ...` を実行する。
- 期待される挙動: Vite devサーバーがバックグラウンドで起動する。
- 実際の挙動: `Path/PATH` の重複により `Start-Process` が失敗する。
- 暫定対応: 検証スクリプト内で `npm.cmd run dev` を一時起動し、HTTP 200とEdge headless/CDP確認後にプロセスツリーを終了した。
- 状態: 環境要因。実装コード側の既知不具合ではない。

## 解決済み

### BUG-001: P0文書の文字化け

- 発生日: 2026-06-02
- フェーズ: P0
- 内容: `README.md`、`AGENTS.md`、`docs/` 配下の複数Markdownが文字化けし、仕様・進捗・アセット情報として読めない状態だった。
- 対応: P0対象文書をUTF-8の日本語Markdownとして再作成。
- 状態: 解決済み

## 記録テンプレート

### BUG-XXX

- 発生日:
- フェーズ:
- 内容:
- 再現手順:
- 期待される挙動:
- 実際の挙動:
- 暫定対応:
- 状態:








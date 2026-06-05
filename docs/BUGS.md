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

### P4-001: 一部P4生成UI素材の透過細部調整が未完了

- 発生日: 2026-06-03
- フェーズ: P4
- 内容: `star_icon_unlocked.png` と `star_map_panel_frame.png` はP4再実行で画像生成・配置済みだが、クロマキー透過の細部処理はユーザー指示により後回しにした。
- 再現手順: StarMapScreenで解放済み星アイコンまたは星地図パネル枠を表示する。
- 期待される挙動: 透明背景PNGとして周囲の背景になじむ。
- 実際の挙動: 画像生成済みRuntime Assetとして表示できるが、透過品質は後続調整対象。
- 暫定対応: StarMapScreen実装とビルドを優先し、P5前またはUI仕上げ時に透過処理を再開する。
- 状態: 未解決。ユーザー指示で後回し。

### P3.5-001: 道後温泉collisionRectsは完全一致ではない

- 発生日: 2026-06-05
- フェーズ: P3.5
- 内容: `dogo_map_base.png` の見た目に合わせて `collisionRects` を調整し、`walkableRects` とdebug overlayを追加したが、生成背景の石畳・植え込み・建物形状に対する完全一致ではない。
- 再現手順: 道後温泉ExploreScreenでGキーのdebug overlayを表示し、マップ全体を歩く。
- 期待される挙動: 見た目上の建物、植え込み、橋の外、湯釜などは通れず、石畳の道は自然に歩ける。
- 実際の挙動: 大きな矛盾は減らしたが、細部の角や装飾まわりでまだ微調整が必要になる可能性がある。
- 暫定対応: P3.5で追加したGキーdebug overlayを使い、実プレイで見つけた箇所を矩形単位で再調整する。
- 状態: 未解決。手動プレイでの追加調整待ち。

### P3.5-002: G/Hキーのブラウザ実操作確認が未完了

- 発生日: 2026-06-05
- フェーズ: P3.5
- 内容: `npm.cmd install`、`typecheck`、`lint`、`build` は成功したが、ヘッドレスブラウザでのExplore到達とG/Hキー確認はdev起動待ちでタイムアウトし、再確認コマンドはユーザー中断となった。
- 再現手順: `npm.cmd run dev -- --host 127.0.0.1 --port 5173` で起動し、TitleScreenから道後温泉ExploreScreenへ進んでG/Hを押す。
- 期待される挙動: Gキーでdebug overlayが表示/非表示になり、Hキーまたは道しるべボタンで2.8秒の道しるべ表示が出る。
- 実際の挙動: コード実装とビルドは成功しているが、ブラウザ上の実操作確認は未完了。
- 暫定対応: 後続の手動確認でG/H動作を確認する。
- 状態: 未解決。手動確認待ち。

## 解決済み

### ENV-004: P4必須画像生成を実行できない

- 発生日: 2026-06-03
- 解決日: 2026-06-03
- フェーズ: P4
- 内容: 初回P4では `star_map_bg`、星アイコン3種、星地図パネル、道後/松山城バッジの画像生成が必須だったが、組み込み `image_gen` ツールが利用可能ツールとして公開されておらず、`imagegen` CLIフォールバックも `OPENAI_API_KEY` 未設定で実行できなかった。
- 再現手順: P4作業で画像生成ツールの利用可否を確認し、環境変数 `OPENAI_API_KEY` を確認する。
- 期待される挙動: 画像生成ツールでP4必須7アセットを生成し、`public/assets/generated/` に配置できる。
- 実際の挙動: 初回は画像生成を実行できず、P4停止条件に該当した。
- 対応: P4再実行で組み込み画像生成ツールを利用できたため、必須7アセットを生成し `public/assets/generated/` に配置した。`docs/ASSET_TRACKER.md` の最新状態も `generated` に更新した。
- 状態: 解決済み。前回停止履歴として記録は残す。

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








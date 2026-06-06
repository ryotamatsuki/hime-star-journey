# BUGS

## 現在の未解決バグ

### P3.5-001: walkableRectsは石畳の斜め形状に完全一致していない

- 発生日: 2026-06-05
- フェーズ: P3.5
- 内容: 道後温泉探索マップの歩行可能領域は矩形ベースで定義しているため、背景画像上の斜め道、曲がった石畳、橋周辺の輪郭とは完全一致しない。
- 再現手順: ExploreScreenでGキーを押し、緑の `walkableRects` と背景の石畳を比較する。
- 期待される挙動: 歩行可能領域が背景の道と自然に一致する。
- 実際の挙動: 小学3年生が大きく迷わない程度には改善したが、斜め道の端は矩形の角が残る。
- 暫定対応: `walkablePolygons` 型を用意済み。プレイテスト後、必要な箇所だけpolygon化する。
- 状態: 未解決。P3.5時点では許容。

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
- フェーズ: P1 / P2 / P3 / P3方針変更 / P4仕上げ / P4.5
- 内容: Browserプラグインはnode_repl kernel起動に失敗し、P3方針変更対応でもBrowserプラグイン接続時に `windows sandbox failed: spawn setup refresh` でkernelが終了した。P4仕上げとP4.5でもBrowserプラグインは同じ理由で利用できなかった。
- 再現手順: Browserプラグイン接続、またはEdge headlessで `http://127.0.0.1:5173` を検証する。
- 期待される挙動: Browserプラグインでタイトル表示、はじめからクリック、localStorage保存、リロード後のつづきから有効化を自動確認できる。
- 実際の挙動: Browserプラグインの自動操作環境が起動しない。P3方針変更対応とP4仕上げではEdge headless/CDPで補助確認を実施できた。
- 暫定対応: BrowserプラグインではなくEdge headless/CDPまたは一時同一オリジンテストでdevサーバーHTTP 200、P4/P4.5必須アセットHTTP 200、P3.5/P4/P4.5の主要操作、typecheck、lint、build、distコピー確認を行う。
- 状態: 未解決。実装コード側の既知不具合ではない。

### ENV-005: サンドボックス内のVite dev起動で親ディレクトリ読み取りエラーが出る

- 発生日: 2026-06-05
- フェーズ: P4仕上げ
- 内容: サンドボックス内で `npm.cmd run dev` を起動すると、Vite/esbuildが `vite.config.ts` 解決時にワークスペース親ディレクトリの読み取りで `Access is denied` を出す場合がある。
- 再現手順: 制限付きサンドボックス内で `npm.cmd run dev -- --host 127.0.0.1 --port <port>` を実行する。
- 期待される挙動: Vite devサーバーが起動し、`/hime-star-journey/` でHTTP 200を返す。
- 実際の挙動: サンドボックス内では設定ファイル解決で停止する。サンドボックス外許可では正常起動し、`http://127.0.0.1:5187/hime-star-journey/` およびP4仕上げ再確認時の `http://127.0.0.1:5199/hime-star-journey/` がHTTP 200を返した。
- 暫定対応: dev確認が必要な場合は承認済みのサンドボックス外実行で起動する。実装コード側の既知不具合ではない。
- 状態: 環境要因。

### ENV-003: `Start-Process` が `Path/PATH` 重複でdevサーバー起動に失敗する

- 発生日: 2026-06-02
- フェーズ: P3方針変更
- 内容: PowerShellの `Start-Process` 実行時に `項目は既に追加されています。辞書のキー: 'Path' 追加されるキー:'PATH'` が発生し、devサーバーの常駐起動に失敗した。
- 再現手順: PowerShellで `Start-Process -FilePath npm.cmd ...` を実行する。
- 期待される挙動: Vite devサーバーがバックグラウンドで起動する。
- 実際の挙動: `Path/PATH` の重複により `Start-Process` が失敗する。
- 暫定対応: 検証スクリプト内で `npm.cmd run dev` を一時起動し、HTTP 200とEdge headless/CDP確認後にプロセスツリーを終了した。
- 状態: 環境要因。実装コード側の既知不具合ではない。

### P3.5-001: 道後温泉collisionRectsは完全一致ではない

- 発生日: 2026-06-05
- フェーズ: P3.5
- 内容: `dogo_map_base.png` の見た目に合わせて `collisionRects` を調整し、`walkableRects` とdebug overlayを追加したが、生成背景の石畳・植え込み・建物形状に対する完全一致ではない。
- 再現手順: 道後温泉ExploreScreenでGキーのdebug overlayを表示し、マップ全体を歩く。
- 期待される挙動: 見た目上の建物、植え込み、橋の外、湯釜などは通れず、石畳の道は自然に歩ける。
- 実際の挙動: 大きな矛盾は減らしたが、細部の角や装飾まわりでまだ微調整が必要になる可能性がある。
- 暫定対応: P3.5で追加したGキーdebug overlayを使い、実プレイで見つけた箇所を矩形単位で再調整する。
- 状態: 未解決。手動プレイでの追加調整待ち。

## 解決済み

### P4-001: 一部P4生成UI素材の透過細部調整が未完了

- 発生日: 2026-06-03
- 解決日: 2026-06-06
- フェーズ: P4 / P4.6
- 内容: `star_icon_unlocked.png` と `star_map_panel_frame.png` はP4再実行で画像生成・配置済みだったが、クロマキー透過の細部処理を後回しにしていた。
- 再現手順: StarMapScreenで解放済み星アイコンまたは星地図パネル枠を表示する。
- 期待される挙動: 透明背景PNGとして周囲の星地図背景になじむ。
- 対応: `public/assets/generated/_backup/p4_6/` に元画像を退避し、ローカルのクロマキー除去で `star_icon_unlocked.png` の緑背景、`star_map_panel_frame.png` のマゼンタ背景を透明化した。両PNGは `Format32bppArgb` になり、四隅alpha 0を確認した。
- 確認: 星地図背景上の合成プレビュー `C:\tmp\p4_6_star_map_preview.png` で、不要な四角い背景とクロマキー残りが出ないことを確認した。
- 状態: 解決済み。

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

### P3.5-002: G/Hキーのブラウザ実操作確認が未完了

- 発生日: 2026-06-05
- 解決日: 2026-06-05
- フェーズ: P3.5 / P4仕上げ
- 内容: 初回P3.5ではヘッドレスブラウザでのExplore到達とG/Hキー確認が未完了だった。
- 再現手順: `npm.cmd run dev -- --host 127.0.0.1 --port 5199` で起動し、TitleScreenから道後温泉ExploreScreenへ進んでG/Hを押す。
- 期待される挙動: Gキーでdebug overlayが表示/非表示になり、Hキーまたは道しるべボタンで2.8秒の道しるべ表示が出る。
- 対応: P4仕上げでEdge headless/CDPにより、Title -> Prologue -> StarMap -> Exploreへ到達後、Hキーで「道しるべ表示中」になり自動で戻ること、Gキーでdebug overlayによるcanvas差分と赤/緑サンプル増加が出ることを確認した。
- 状態: 解決済み。

### P4.5-001: 会話終了直後にNPC近接UIが更新されない

- 発生日: 2026-06-05
- 解決日: 2026-06-05
- フェーズ: P4.5
- 内容: `dogo_intro_auto` などの会話を閉じた直後、次のフレームまで `nearbyNpc` / `nearbyInteractable` が再計算されず、「話す」ボタンがすぐ表示されない場合があった。
- 再現手順: 道後温泉ExploreScreenへ入り、自動会話を閉じた直後に案内人NPCの近接表示を確認する。
- 期待される挙動: 会話終了後すぐに近接NPCの「話す」ヒントとボタンが表示される。
- 対応: `ExploreScreen.advanceDialogue()` の会話終了処理で `findNearbyInteractable()` と `findNearbyNpc()` を呼び、`updateUi()` 前に近接対象を再計算するよう修正した。
- 状態: 解決済み。

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








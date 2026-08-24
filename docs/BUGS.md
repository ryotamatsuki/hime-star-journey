# BUGS

このファイルは現在有効な既知問題と、再発防止に必要な解決済み不具合を管理します。詳細な過去経緯はGit履歴と `docs/PROGRESS.md` を参照してください。

## 未解決

### PLAY-001: 道後温泉の歩行領域と背景輪郭が完全一致ではない

- 初回確認: 2026-06-05
- 内容: `walkableRects` / `collisionRects` は生成背景の斜め道、曲線、装飾物の輪郭と完全一致ではない。
- 影響: 現時点で進行不能は確認されていないが、細部で引っかかりや見た目とのズレが出る可能性がある。
- 対応方針: P10の新規セーブMVP通しプレイでGキーdebug overlayを使って実操作し、必要箇所だけpolygon/rectを調整する。
- 状態: プレイ品質調整待ち。

### PERF-001: 起動時にAssetManifest全画像を一括ロードする

- 初回確認: 2026-06-05
- 内容: `GameApp.start()` がAssetManifest全体の読み込み完了を待ってからTitleScreenへ進む。
- 影響: P8/P9で画像が増えるとタイトル表示までの時間が伸びる可能性がある。
- 対応方針: P8/P9追加後に実測し、許容範囲を超えた場合のみboot/area/battle/ending単位の段階ロードへ変更する。
- 状態: 実測待ち。現時点では機能Release Gateを阻害しない。

### ARCH-001: ExploreScreenの責務が大きい

- 初回確認: 2026-08-25
- 内容: 探索描画、DOM UI、入力、会話、クエスト進行、道後/松山城特殊イベント、戦闘遷移が `ExploreScreen` に集中している。
- 影響: 新しい探索クエストを同クラスへ直接追加し続けると条件分岐・回帰範囲が拡大する。
- 対応方針: P8で探索進行を追加する場合は、その前にクエスト進行/特殊イベントをcontroller/serviceへ抽出する。P7.1では既存挙動を大規模に動かす全面リファクタリングは行わない。
- 状態: P8開始時の設計Gate。

## P7.1で解決

### P7H-001: DOM「話す」経路でクエストヒント既読が更新されない

- 発見日: 2026-08-25
- 内容: Enter/SpaceでNPCへ話す場合は `markQuestHintSeen()` を通る一方、DOMの「話す」ボタンはDialogue開始だけを行っていた。
- 影響: マウス/タッチ中心の操作では `dogo_quest_hint_seen` / `castle_hint_seen` が立たず、道後の湯の星取得など後続条件を満たせない可能性があった。
- 対応: `interactWithNearbyNpc()` を追加し、キーボードとDOMボタンを同一処理へ統一。
- 再発防止: P7ブラウザ回帰契約とP10のマウス/タッチE2EをRelease checklistへ追加。
- 状態: 解決。

### P7H-002: カゲマサを通常ダメージだけで倒せる可能性

- 発見日: 2026-08-25
- 内容: GDDでは星封じによる再封印が勝利条件だが、旧 `isBattleVictory()` はボスでも敵HP全0を勝利扱いできた。
- 影響: P8をそのまま接続すると、星封じを使わず通常攻撃だけで章ボスを突破できる可能性があった。
- 対応: 封印未完了のボスHPを最低1に保持し、ボス戦の勝利条件を `sealGauge <= 0` のみに変更。
- 再発防止: P7 browser verifierに通常攻撃非勝利・星封じ勝利テストを追加。
- 状態: 解決。

### P7H-003: BattleSystem公開actionがUI側validationへ依存

- 発見日: 2026-08-25
- 内容: `applyBattleCard()` はphaseやアンロック状態を自分で十分検証せず、UI側 `canUseCard()` が正しく呼ばれる前提だった。また不正target IDが先頭敵へフォールバックした。
- 対応: `applyBattleCard()` 内でも `canUseCard()` を必須化し、アンロック済みカード、phase、MPを再検証。不正な明示targetは拒否。
- 状態: 解決。

### P7H-004: SaveDataの値域・型正規化が不十分

- 発見日: 2026-08-25
- 内容: 破損/手編集localStorageから `hp > maxHp`、負MP、負の所持数、非boolean flag、未知のscreen ID等が入る余地があった。
- 対応: HP/MP/max値のclamp、ID配列dedupe、アイテム数sanitize、boolean flag限定、既知ScreenId限定fallbackを実装。
- 状態: 解決。

### P7H-005: P7 browser verifierがCanvasをfakeしていた

- 発見日: 2026-08-25
- 内容: verifierがCanvas contextと `toDataURL()` をダミーに差し替えており、「Canvas描画継続」のassertionが実描画を確認していなかった。
- 対応: fake Canvasを削除して実Canvasを使用。Chrome/Chromium実行環境もWindows固定パスから環境変数/Linux候補に対応。
- 状態: 解決。

### P7H-006: CIがゲーム固有回帰をRelease Gateに含めていない

- 発見日: 2026-08-25
- 内容: 旧workflowは `typecheck` / `lint` / `build` のみで、map validation、editor smoke、P7 browser regressionを実行していなかった。
- 対応: PR/main双方で `maps:validate`、`editor:smoke`、実Chrome `p7:browser` を追加。mainでは全Gate成功後だけPages deployする。
- 状態: 実装解決。GitHub Actions上の実行確認はP7.1 PRで行う。

### P7H-007: 進捗・GDD・runtimeのID体系が不整合

- 発見日: 2026-08-25
- 内容: README/ROADMAP/TASKSはP7完了だった一方、PROGRESS冒頭はP6.5/P7未着手。GDDは旧 `M0〜M6` / `M-E01〜M-E08`、runtimeは `castle/C0` / `C-E01〜C-E05` だった。
- 対応: PROGRESS/ROADMAP/README/TASKS/BUILD_CHECKLIST/GDDをP7.1正本へ同期し、runtime IDとP7/P8責務境界を明記。
- 状態: 解決。

## 過去の主要解決事項

### P6-001: 湯の星地点が衝突矩形内で到達不能

- 対応: 到達可能な中央通り奥へInteractable/markerを移動。
- 状態: 解決。

### P6-002: 湯の星取得済み旧セーブから松山城解放が補完されない

- 対応: `SaveManager.normalizeSaveData()` で道後星取得済み状態から道後クエストクリア、星地図、松山城解放を補完。
- 状態: 解決。

### P6-003: runtime会話に「星のかけら」表現が残っていた

- 対応: 完成した一つの「湯の星」という正本へ文言を統一。
- 状態: 解決。

## 環境メモ

- Windows PowerShellで `npm.ps1` がExecution Policyに拒否される環境では `npm.cmd` を使用する。
- 旧Browserプラグイン固有のsandbox問題はゲームコードのRelease Gateにしない。GitHub Actions/Linux ChromeとローカルChromium/CDPの再現可能な検証を正本とする。

# 進捗管理: ひめの小さな星めぐり MVP

## 現在の状態

- 完了フェーズ: **P7.1 Release Hardening / Dogo D0 walkability alignment**
- P7基準main: `88510a95877cced3f793ed5b6b91843eb58db9f7`
- P7.1作業ブランチ: `fix/p7-release-hardening`
- P7.1 PR: #3 `fix(p7.1): harden release gate before P8`
- 状態: Runtime修正、仕様同期、CI Release Gate強化、道後D0の背景準拠歩行ポリゴン調整を完了。GitHub Actions run #14で全検証PASSを確認し、今回のD0修正では追加の実Chrome回帰も組み込む。
- 次フェーズ: P8 カゲマサ戦・みかん星の核奪還・MVPエンディング
- 最終更新日: 2026-08-25

## フェーズ別進捗

| ID | フェーズ | 状態 | 検証状態 |
|---|---|---|---|
| P0 | リポジトリ初期化 | 完了 | 文書・開発基盤確認済み |
| P1 | TypeScript/Vite/Canvas/DOM/セーブ基盤 | 完了 | typecheck/lint/build確認済み |
| P2 | アセット・アニメーション基盤 | 完了 | Runtime Asset・fallback・描画基盤確認済み |
| P3/P3.5 | 道後温泉探索・歩行領域改善 | 実装完了 | D0は背景準拠のwalkablePolygonsをruntime移動判定へ接続。G/H・衝突・探索導線確認済み |
| P4/P4.5/P4.6 | 星地図・会話・UI仕上げ | 完了 | 星地図遷移、会話、Pages base確認済み |
| P5/P5.1 | 複数敵カードバトル・戦闘UI | 完了 | 1対1/1対2ロジック確認済み |
| P5.9 | ストーリー正本復元 | 完了 | 企画/GDD/要件/実装仕様へ反映済み |
| P6 | プロローグ・道後温泉クエスト・湯の星 | 実装完了 | 自動/補助ブラウザ確認済み。全手動通しはP10へ統合 |
| P6.5 | ローカルマップエディタ | 完了 | maps:validate/editor:smoke/実ブラウザ補助確認済み |
| P7 | 松山城探索・松山城クエスト | 完了 | `p7:browser`、map validation、build確認済み |
| P7.1 | Release Hardening | 完了 | PR Actions run #14 build job success |
| P8 | カゲマサ戦・核奪還・MVPエンディング | 未着手 | P7.1 merge後に開始 |
| P9 | 旅の手帳・BGM/SE・セーブ調整 | 未着手 | - |
| P10 | 通しプレイ・難易度調整・公開確認 | 未着手 | - |

## P7 runtime正本

- 星地図から松山城 `locationId: "castle"` / `areaId: "C0"` へ移動できる。
- 松山城のruntimeシンボルIDは `C-E01`〜`C-E05`。
- `C-E01`〜`C-E03` は必須戦闘、`C-E04` はくらやみ井戸イベント戦、`C-E05` は任意戦闘。
- 必須戦闘後にくらやみ井戸へ進み、天守前の祠で「城山のまもり」を取得する。
- 取得後は `shiroyama_guard_obtained`、`castle_boss_route_unlocked`、`p8_kagemasa_route_unlocked` を保存する。
- P7では `collectedStars` に `castle` を追加しない。
- P7では `gameCompleted` を設定しない。
- 城の星、みかん星の核奪還、カゲマサ戦、エンディングはP8の責務。

## 2026-08-25 P7.1 Release Hardening 完了内容

1. **NPC入力経路の統一**
   - ExploreScreenのEnter/Space操作とDOM「話す」ボタンを `interactWithNearbyNpc()` に統一。
   - ボタン操作でも道後の `dogo_quest_hint_seen`、松山城の `castle_hint_seen` が同じように更新されるよう修正。

2. **プレイヤー向け文言の修正**
   - P7完了目的から内部開発フェーズ名「P8」を除去。

3. **BattleSystemの不変条件強化**
   - `applyBattleCard()` 内でもphase、MP、アンロック済みカード、targetを検証。
   - 明示された不正target IDを先頭敵へフォールバックせず拒否。
   - ボスは封印未完了時に通常ダメージでHP0にならない。
   - ボス戦正式勝利条件を `sealGauge <= 0` のみに固定。

4. **SaveData正規化強化**
   - HP/MP/maxの値域を保証。
   - ID配列をdedupe。
   - アイテム所持数を有限の非負整数へsanitize。
   - flagsをboolean限定で採用。
   - 不正ScreenIdを既知画面へfallback。
   - chapter/location/areaの不正文字列を既定値へfallback。

5. **P7ブラウザ検証強化**
   - fake Canvas context / fake `toDataURL()` を削除し、実Canvasを使用。
   - P7完了UI、SaveData破損値、カゲマサ星封じ必須勝利を回帰検証へ追加。
   - Windows固定Chromium依存を緩和しLinux Chrome/Chromiumでも実行可能にした。

6. **GitHub Actions Release Gate強化**
   - PR/main双方で `npm ci`、typecheck、lint、maps:validate、editor:smoke、build、実Chrome `p7:browser` を実行。
   - PRではPages configure/upload/deployをskip。
   - mainでは全Gate成功後だけPagesへdeploy。

7. **仕様同期**
   - GDDの旧 `M0〜M6` / `M-E01〜M-E08` をruntimeの `castle/C0` / `C-E01〜C-E05` へ同期。
   - README/ROADMAP/PROGRESS/TASKS/BUILD_CHECKLIST/BUGSのP7/P8境界を統一。

## 2026-08-25 道後D0歩行領域の背景整合

- 生成背景の斜め・曲線の石畳に対して、従来の大きな矩形 `walkableRects` を廃止し、D0の石畳に沿った `walkablePolygons` へ置換。
- 道後温泉のruntime移動だけは、プレイヤーコライダーの四隅と中心が歩行領域内にあることを確認して移動する方式へ変更。松山城の矩形collision挙動は維持。
- 開始位置、敵、NPC、道しるべ、イベント位置を背景上の石畳へ補正し、開始地点から全配置先への到達性と開始コライダーの収まりを `maps:validate` で検証。
- P7 browser verifierにもD0レイアウトの歩行ポリゴン・実探索画面の前後移動確認を追加。

## GitHub Actions P7.1検証結果

PR #3 / run #14 のbuild jobで以下を確認しました。

| Gate | 結果 |
|---|---|
| Checkout / Setup Node | PASS |
| `npm ci` | PASS |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run maps:validate` | PASS |
| `npm run editor:smoke` | PASS |
| `npm run build` | PASS |
| verifier dev server起動 | PASS |
| Linux Chrome `npm run p7:browser` | PASS |
| PR Pages configure/upload | SKIPPED（設計どおり） |
| PR deploy job | SKIPPED（設計どおり） |

## 既知の残課題

### P10で確認するプレイ品質

- 道後D0の主要な歩行領域と配置点の背景ずれは今回解消した。P10では新規セーブで石畳端の操作感、全敵接触、マウス/タッチ経路を最終確認する。
- P6の「4戦闘を人手で操作して湯の星まで歩く」確認は、P10の新規セーブMVP通しプレイに統合する。

### アセットロード

- 現状は起動時にAssetManifest全画像を読む。P8/P9の追加後に実測し、必要ならboot/area/battle/ending単位の段階ロードへ変更する。

### ExploreScreenの責務

- 探索描画、DOM UI、会話、クエスト進行、特殊演出が集約されている。
- P8で新しい探索進行を追加する場合は、クエスト進行・特殊イベントを別controller/serviceへ抽出してから追加する。

## 次の判断

P7.1 PRをmainへmergeし、main pushのRelease GateとGitHub Pages deploy成功を確認した後、P8へ進む。

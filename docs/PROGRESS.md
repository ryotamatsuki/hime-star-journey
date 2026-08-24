# 進捗管理: ひめの小さな星めぐり MVP

## 現在の状態

- 現在フェーズ: **P7.1 Release Hardening**
- 基準main: `88510a95877cced3f793ed5b6b91843eb58db9f7`（P7 松山城探索・クエスト実装済み）
- 作業ブランチ: `fix/p7-release-hardening`
- 状態: P7機能実装後の回帰防止、入力経路整合、セーブ不変条件、CI Release Gate、P8ボス戦不変条件、仕様同期を実施中。
- 次フェーズ: P8 カゲマサ戦・みかん星の核奪還・MVPエンディング
- 最終更新日: 2026-08-25

## フェーズ別進捗

| ID | フェーズ | 状態 | 検証状態 |
|---|---|---|---|
| P0 | リポジトリ初期化 | 完了 | 文書・開発基盤確認済み |
| P1 | TypeScript/Vite/Canvas/DOM/セーブ基盤 | 完了 | typecheck/lint/build確認済み |
| P2 | アセット・アニメーション基盤 | 完了 | Runtime Asset・fallback・描画基盤確認済み |
| P3/P3.5 | 道後温泉探索・歩行領域改善 | 実装完了 | G/H・衝突・探索導線確認済み。細部の歩行領域調整余地あり |
| P4/P4.5/P4.6 | 星地図・会話・UI仕上げ | 完了 | 星地図遷移、会話、Pages base確認済み |
| P5/P5.1 | 複数敵カードバトル・戦闘UI | 完了 | 1対1/1対2ロジック確認済み |
| P5.9 | ストーリー正本復元 | 完了 | 企画/GDD/要件/実装仕様へ反映済み |
| P6 | プロローグ・道後温泉クエスト・湯の星 | 実装完了 | 自動/補助ブラウザ確認済み。全戦闘を含む人手通しはP10で統合実施 |
| P6.5 | ローカルマップエディタ | 完了 | maps:validate/editor:smoke/実ブラウザ補助確認済み |
| P7 | 松山城探索・松山城クエスト | 完了 | `p7:browser`、map validation、build確認済み |
| P7.1 | Release Hardening | 実装中 | PR/CIで最終確認予定 |
| P8 | カゲマサ戦・核奪還・MVPエンディング | 未着手 | P7.1通過後に開始 |
| P9 | 旅の手帳・BGM/SE・セーブ調整 | 未着手 | - |
| P10 | 通しプレイ・難易度調整・公開確認 | 未着手 | - |

## P7 実装済みの正本

- 星地図から松山城 `locationId: "castle"` / `areaId: "C0"` へ移動できる。
- 松山城のruntimeシンボルIDは `C-E01`〜`C-E04` を使用する。
- `C-E01`〜`C-E03` は必須戦闘、`C-E04` はくらやみ井戸のイベント戦。
- 必須戦闘後にくらやみ井戸へ進み、天守前の祠で「城山のまもり」を取得する。
- 取得後は `shiroyama_guard_obtained`、`castle_boss_route_unlocked`、`p8_kagemasa_route_unlocked` を保存する。
- P7では `collectedStars` に `castle` を追加しない。
- P7では `gameCompleted` を設定しない。
- 城の星、みかん星の核奪還、カゲマサ戦、エンディングはP8の責務。

## 2026-08-25 P7.1 Release Hardening

### 修正内容

1. **NPC入力経路の統一**
   - ExploreScreenのEnter/Space操作とDOM「話す」ボタンを `interactWithNearbyNpc()` に統一。
   - ボタン操作でも道後の `dogo_quest_hint_seen`、松山城の `castle_hint_seen` が同じように更新されるよう修正。
   - タッチ/マウス利用時だけクエスト進行条件が立たない経路差を解消。

2. **プレイヤー向け文言から内部フェーズ名を除去**
   - 「P8でカゲマサのもとへ向かおう」を「カゲマサのもとへ進む準備が整った」へ変更。

3. **BattleSystemのドメイン不変条件強化**
   - `applyBattleCard()` 内でもphase、MP、アンロック済みカードを検証。
   - 明示された不正target IDを先頭敵へフォールバックせず拒否。
   - ボス戦は通常攻撃だけでHP 0・勝利にならないよう、封印未完了時のカゲマサHPを最低1に保持。
   - `isBattleVictory()` はボス戦では `sealGauge <= 0` のみを勝利条件とする。
   - P8の「星封じで再封印する」という物語・戦闘ルールをコード上の不変条件にした。

4. **SaveData正規化強化**
   - `maxHp >= 1`、`maxMp >= 0`。
   - `hp`、`mp` を各最大値の範囲へclamp。
   - ID配列の重複を除去。
   - `acquiredItems` は有限・非負の整数だけを保持。

5. **P7ブラウザ検証強化**
   - Canvas 2D contextと`toDataURL()`のfake差し替えを削除し、実Canvas描画を検証。
   - P7完了後UIに内部フェーズ名が出ないことを検証。
   - SaveDataの破損値正規化を検証。
   - カゲマサ通常攻撃HP0禁止・星封じ必須勝利を検証。

6. **browser verifierのCI可搬性改善**
   - Windows固定Chromiumパスだけでなく、`P7_BROWSER_PATH`、Linux Chrome/Chromium候補から実行ファイルを探索。
   - GitHub Actions Ubuntu上で実行可能な構成へ変更。

7. **GitHub Actions Release Gate強化**
   - `pull_request` でもbuild jobを実行。
   - `typecheck`、`lint`、`maps:validate`、`editor:smoke`、`build`、実ブラウザ `p7:browser` を全て通過条件化。
   - PRではPages deployを行わず検証のみ実行。
   - main pushでは同じ検証を通過した後だけPagesへdeployする。

### P7.1 完了条件

- [ ] GitHub Actionsで typecheck PASS
- [ ] GitHub Actionsで lint PASS
- [ ] GitHub Actionsで maps:validate PASS
- [ ] GitHub Actionsで editor:smoke PASS
- [ ] GitHub Actionsで build PASS
- [ ] GitHub Actions Ubuntu/Chromeで p7:browser PASS
- [ ] GDD/ROADMAP/TASKS/BUILD_CHECKLIST/READMEのP7/P8境界がruntime実装と一致
- [ ] PRレビュー後にmainへmerge

## 既知の残課題

### P10で確認するプレイ品質

- 道後温泉のwalkableRects/collisionRectsは生成背景の斜め形状と完全一致ではない。ゲーム進行不能ではなく、通しプレイ時の操作感調整事項として扱う。
- P6の「4戦闘を人手で操作して湯の星まで歩く」確認は、P7/P8/P9と分断して再実施するのではなく、P10の新規セーブMVP通しプレイに統合する。

### アセットロード

- 現状は起動時にAssetManifest全画像を読むため、アセット増加に伴い初期表示が重くなる可能性がある。
- P8の新規アセット追加量を確認し、実測でタイトル表示が許容範囲を超える場合は boot/area/battle/ending 単位の段階ロードへ変更する。
- 現時点では機能不具合ではないため、Release Gateの阻害要因とはしない。

### ExploreScreenの責務

- ExploreScreenには探索描画、DOM UI、会話、クエスト進行、特殊演出が集約されている。
- P7.1では回帰リスクの高い全面リファクタリングを行わず、入力経路の統一と不変条件修正を優先する。
- P8で新しい探索クエストを追加する場合は、クエスト進行・特殊イベントを別controller/serviceへ抽出してから追加する。

## 次の判断

P7.1のCI Release Gateが全てPASSし、仕様書のID体系とP7/P8境界が同期した時点でP8へ進む。P8では「カゲマサはHP削り切りでは勝利せず、星封じゲージ完了でのみ再封印成功」というBattleSystem不変条件を変更しない。

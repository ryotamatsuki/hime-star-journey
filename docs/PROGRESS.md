# 進捗管理: ひめの小さな星めぐり MVP

## 現在の状態

- 現在フェーズ: **P8 カゲマサ戦・みかん星の核奪還・MVPエンディング**
- 作業開始時main: `10fc9518df8bc5e68c17c8e407c2c881e0d53bc4`
- 作業ブランチ: `feature/p8-kagemasa-ending`
- PR: #5 `feat(p8): add Kagemasa finale and MVP ending`
- 状態: P8 runtime・Ending・専用ブラウザ回帰・CI Gateを実装済み。最終PR headのRelease Gate確認中。
- 次フェーズ: P9 旅の手帳・BGM/SE・セーブ調整
- 最終更新日: 2026-08-25

## フェーズ別進捗

| ID | フェーズ | 状態 | 検証状態 |
|---|---|---|---|
| P0〜P5.9 | 基盤・探索・星地図・会話・複数敵バトル・ストーリー整合 | 完了 | 既存Gate確認済み |
| P6 | プロローグ・道後温泉クエスト・湯の星 | 完了 | 自動/補助ブラウザ確認済み。全手動通しはP10 |
| P6.5 | ローカルマップエディタ | 完了 | maps:validate/editor:smoke確認済み |
| P7 | 松山城探索・松山城クエスト | 完了 | p7:browser確認済み |
| P7.1 | Release Hardening | 完了 | Save/Battle/Input/CI不変条件を固定 |
| P7.2 | 道後D0歩行領域の実景整合 | 完了 | 背景準拠walkable polygon + 回帰確認 |
| P8 | カゲマサ戦・核奪還・MVPエンディング | 実装完了・Gate確認中 | p8:browserをCIへ追加 |
| P9 | 旅の手帳・BGM/SE・セーブ調整 | 未着手 | - |
| P10 | 通しプレイ・難易度調整・公開確認 | 未着手 | - |

## P8実装内容

1. **P8進行の責務分離**
   - 45KB超のExploreScreenへP8条件分岐を追加せず、`src/systems/P8FlowController.ts` を新設。
   - `p8_kagemasa_route_unlocked` を入口に、Explore/StarMapで「天守奥へ進む」を表示。
   - 状態監視は200ms intervalとし、localStorageを毎描画フレーム読み込まない。

2. **カゲマサ戦開始**
   - 開始時にHP/MPを全回復。
   - `card_star_seal` を解放。
   - `enc_boss_kagemasa` / `B-E01` / `isBoss: true` でBattleScreenへ遷移。
   - `kagemasa_battle_started` を保存。

3. **ボス勝利条件**
   - P7.1で固定したBattleSystem不変条件を再利用。
   - 通常ダメージではカゲマサHPを0にできず、通常攻撃だけでは勝利不可。
   - `sealGauge <= 0` の星封じ完成のみ正式勝利。

4. **P8 finalization**
   - `completeP8Save()` で最終状態を一括保存。
   - B-E01撃破、カゲマサ再封印、みかん星の核、城の星、ペンダント光回復、道後/松山城回復、P8完了、MVP完了を同時更新。
   - `collectedStars` に `castle` を追加。
   - `acquiredItems.mikan_star_core >= 1`。
   - `gameCompleted === true`。
   - P8完了直後は `EndingScreen`。
   - 誤ってB-E01だけが混入したセーブでは完了せず、`kagemasa_battle_started` も必須とした。

5. **EndingScreen**
   - 既存星地図背景を使い、回復したペンダント、ひめ、シロ、取得済み星と空白星をCanvas合成。
   - 「小さな星めぐりは、まだ続く」と、未解放の空白星を示す。
   - 星地図またはタイトルへ戻れる。
   - タイトルへ戻る際はEnding checkpointを上書きせず、「つづきから」でEndingへ復帰可能。

6. **P8 browser Release Gate**
   - `p8-browser-verifier.html`、`src/p8BrowserVerifier.ts`、`scripts/verify-p8-browser.mjs` を追加。
   - 状態遷移、星封じ勝利、P7完了→ボス導線、実Battle表示、Ending表示、タイトル→Ending再開を検証。
   - GitHub Actionsへ `npm run p8:browser` を追加し、既存P7 browser gateも維持。

## P8最終Save契約

- `defeatedEnemyIds` includes `B-E01`
- `flags.kagemasa_sealed === true`
- `flags.mikan_core_recovered === true`
- `acquiredItems.mikan_star_core >= 1`
- `flags.castle_star_obtained === true`
- `collectedStars` includes `castle`
- `flags.pendant_light_restored === true`
- `flags.dogo_restored === true`
- `flags.castle_restored === true`
- `flags.p8_completed === true`
- `flags.gameCompleted === true`

## Release Gate

PR #5の最終headで以下を全て確認後にsquash mergeする。

- `npm ci`
- `npm run typecheck`
- `npm run lint`
- `npm run maps:validate`
- `npm run editor:smoke`
- `npm run build`
- Linux Chrome `npm run p7:browser`
- Linux Chrome `npm run p8:browser`
- PR Pages deployはskip

## P9/P10へ残す事項

- 旅の手帳10項目、カード一覧、地域メモ、あらすじ。
- BGM/SEの最小実装。
- オートセーブ最終調整。
- AssetManifest一括ロード時間をP9で実測し、必要なら段階ロード化。
- P10で新規localStorageからタイトル→Endingまで人手を含む完全通し、マウス/タッチ・キーボード双方、公開Pages E2E、難易度・低年齢向け文言を最終確認。

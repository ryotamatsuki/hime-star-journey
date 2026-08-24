# 進捗管理: ひめの小さな星めぐり MVP

## 現在の状態

- 現在フェーズ: **P8 カゲマサ戦・みかん星の核奪還・MVPエンディング**
- 作業開始時main: `10fc9518df8bc5e68c17c8e407c2c881e0d53bc4`
- 作業ブランチ: `feature/p8-kagemasa-ending`
- PR: #5 `feat(p8): add Kagemasa finale and MVP ending`
- 状態: P8 runtime・Ending・専用ブラウザ回帰・CI Gateを実装済み。PR #5 run #33でP7/P8実Chromeを含む全Gate PASS。
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
| P8 | カゲマサ戦・核奪還・MVPエンディング | 実装完了・PR Gate PASS | run #33全Gate PASS |
| P9 | 旅の手帳・BGM/SE・セーブ調整 | 未着手 | - |
| P10 | 通しプレイ・難易度調整・公開確認 | 未着手 | - |

## P8実装内容

1. `P8FlowController` を新設し、肥大化したExploreScreenへP8分岐を追加しない構造にした。
2. `p8_kagemasa_route_unlocked` から「天守奥へ進む」を表示し、ボス開始時にHP/MP全回復・`card_star_seal` 解放・`kagemasa_battle_started` 保存。
3. `enc_boss_kagemasa` / `B-E01` / `isBoss: true` でBattleScreenへ接続。
4. P7.1のBattleSystem不変条件を再利用し、通常ダメージではカゲマサHPを0にできず、`sealGauge <= 0` のみ正式勝利。
5. `completeP8Save()` でB-E01撃破、カゲマサ再封印、みかん星の核、城の星、ペンダント光回復、道後/松山城回復、P8完了、MVP完了を一括更新。
6. `collectedStars` に `castle`、`acquiredItems.mikan_star_core >= 1`、`gameCompleted === true` を保証。
7. `EndingScreen` を追加し、回復したペンダント・取得済み星・未解放の空白星を表示。星地図/タイトルへ戻れ、タイトルの「つづきから」でEndingへ復帰可能。
8. P8監視は200ms intervalとし、localStorageを描画フレームごとに読み込まない。
9. `p8-browser-verifier.html` / `src/p8BrowserVerifier.ts` / `scripts/verify-p8-browser.mjs` を追加し、実Chrome回帰をCIへ組み込んだ。

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
- 完了直後 `currentScreenId === "ending"`

## PR #5 Release Gate

run #33で以下を確認済み。

| Gate | 結果 |
|---|---|
| `npm ci` | PASS |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run maps:validate` | PASS |
| `npm run editor:smoke` | PASS |
| `npm run build` | PASS |
| verifier dev server | PASS |
| Linux Chrome `npm run p7:browser` | PASS |
| Linux Chrome `npm run p8:browser` | PASS |
| PR Pages configure/upload/deploy | SKIPPED（設計どおり） |

## P9/P10へ残す事項

- P9: 旅の手帳10項目、カード一覧、地域メモ、あらすじ、BGM/SE、オートセーブ最終調整、初期ロード時間実測。
- P10: 新規localStorageからタイトル→Endingまでの完全通し、マウス/タッチ・キーボード双方、公開Pages E2E、難易度・低年齢向け文言の最終確認。

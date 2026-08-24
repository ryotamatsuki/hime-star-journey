# 進捗管理: ひめの小さな星めぐり MVP

## 現在の状態

- 完了フェーズ: **P8 カゲマサ戦・みかん星の核奪還・MVPエンディング**
- P8作業開始時main: `10fc9518df8bc5e68c17c8e407c2c881e0d53bc4`
- P8 PR: #5 `feat(p8): add Kagemasa finale and MVP ending`
- P8 main SHA: `22b9cc2d30dcfbc2b41e5936b68f67717a195912`
- 検証: PR #5 run #33および最終docs head run #36でP7/P8実Chromeを含む全Release Gate PASS。
- 次フェーズ: **P9 旅の手帳・BGM/SE・セーブ調整**
- 最終更新日: 2026-08-25

## フェーズ別進捗

| ID | フェーズ | 状態 |
|---|---|---|
| P0〜P5.9 | 基盤・探索・星地図・会話・複数敵バトル・ストーリー整合 | 完了 |
| P6 | プロローグ・道後温泉クエスト・湯の星 | 完了 |
| P6.5 | ローカルマップエディタ | 完了 |
| P7 | 松山城探索・松山城クエスト | 完了 |
| P7.1 | Release Hardening | 完了 |
| P7.2 | 道後D0歩行領域の実景整合 | 完了 |
| P8 | カゲマサ戦・核奪還・MVPエンディング | 完了 |
| P9 | 旅の手帳・BGM/SE・セーブ調整 | 次フェーズ |
| P10 | 通しプレイ・難易度調整・公開確認 | 未着手 |

## P8完了内容

- `P8FlowController` に最終章の導線・状態遷移を分離。
- `p8_kagemasa_route_unlocked` から「天守奥へ進む」を表示。
- ボス開始時にHP/MP全回復、`card_star_seal` 解放、`kagemasa_battle_started` 保存。
- `enc_boss_kagemasa` / `B-E01` / `isBoss: true` でBattleScreenへ接続。
- カゲマサは通常ダメージでは勝利できず、`sealGauge <= 0` の星封じ完成のみ正式勝利。
- `completeP8Save()` でB-E01撃破、再封印、みかん星の核、城の星、ペンダント光回復、道後/松山城回復、P8/MVP完了を一括保存。
- `collectedStars` に `castle`、`acquiredItems.mikan_star_core >= 1`、`gameCompleted === true` を保証。
- `EndingScreen` を追加し、回復したペンダント、取得済み星、未解放の空白星を表示。
- Ending→タイトル→「つづきから」でEnding checkpointへ復帰可能。
- P8監視は200ms intervalとし、localStorageの毎フレームreadを避けた。

## Release Gate

PR #5 run #33 / final docs head run #36:

| Gate | 結果 |
|---|---|
| `npm ci` | PASS |
| typecheck | PASS |
| lint | PASS |
| maps:validate | PASS |
| editor:smoke | PASS |
| build | PASS |
| P7 browser | PASS |
| P8 browser | PASS |
| PR Pages deploy | SKIPPED（設計どおり） |

## 次の判断

P9へ進む。旅の手帳10項目、カード一覧、地域メモ、あらすじ、オートセーブ最終調整、BGM/SE、起動時アセットロード時間の実測を行う。P10で新規localStorageからタイトル→Endingまでの完全通しとGitHub Pages production E2Eを実施する。

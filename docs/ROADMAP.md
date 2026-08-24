# ROADMAP

## フェーズ一覧

| ID | フェーズ | 目的 | 状態 |
|---|---|---|---|
| P0 | リポジトリ初期化 | ルール、仕様、進捗管理、アセット管理、プロンプト整備 | 完了 |
| P1 | 基盤実装 | TypeScript + Vite + Canvas + DOM UI + セーブ基盤 | 完了 |
| P2 | アセット・アニメーション基盤 | 生成アセット、SpriteAnimator、2.5D風表現 | 完了 |
| P3 | 探索画面 | ひめ移動、シロ追従、敵シンボル、接触判定 | 完了 |
| P4 | 星地図 | 道後温泉、松山城、未解放星、目的地選択 | 完了 |
| P5 | 複数敵対応バトル | EncounterData、BattleActor配列、ターゲット選択、カード効果 | 完了 |
| P5.1 | 戦闘画面レイアウト改善 | 道後温泉通常戦闘専用背景、配置、カードUI、可読性調整 | 完了 |
| P5.9 | ストーリー正本復元・企画書整合 | 星守り、みかん星の核、シロ、カゲマサ、くろぼし設定を整合 | 完了 |
| P6 | プロローグ／道後温泉体験版 | ペンダント、シロ、核奪取、道後異変、湯の星、松山城解放 | 完了 |
| P6.5 | ローカル開発用マップエディタ | 道後D0/松山城C0の歩行・衝突・配置・道しるべ編集 | 完了 |
| P7 | 松山城探索・松山城クエスト | `castle/C0`、C-E01〜C-E04、くらやみ井戸、城山のまもり | 完了 |
| P7.1 | Release Hardening | 入力経路整合、Save/Battle不変条件、仕様同期、CI Release Gate | 完了 |
| P7.2 | 道後歩行領域実景整合 | 背景上の地面とwalkable polygonを一致させる | 完了 |
| P8 | カゲマサ戦・みかん星の核奪還・MVPエンディング | 星封じ、再封印、核奪還、城の星、終了演出 | 完了 |
| P9 | 旅の手帳・BGM/SE・セーブ調整 | 手帳、進行メモ、オートセーブ、音まわりの最小整理 | 次フェーズ |
| P10 | 通しプレイ・体験版調整・GitHub Pages公開確認 | 新規セーブMVP通し、難易度・操作感、公開URL、Release確認 | 未着手 |

## P8 runtime正本

- P8開始条件は `flags.p8_kagemasa_route_unlocked === true`。
- P7完了後、探索画面または星地図に「天守奥へ進む」を表示する。
- ボス開始時にHP/MPを全回復し、`card_star_seal` を解放する。
- カゲマサ戦は `enc_boss_kagemasa` / `B-E01` / `isBoss: true`。
- カゲマサは通常ダメージだけではHP 0にならず、`sealGauge <= 0` のみ正式勝利。
- 勝利後は `collectedStars` に `castle` を追加し、`acquiredItems.mikan_star_core >= 1` とする。
- `kagemasa_sealed`、`mikan_core_recovered`、`castle_star_obtained`、`pendant_light_restored`、`p8_completed`、`gameCompleted` を保存する。
- P8完了直後の `currentScreenId` は `ending`。
- EndingScreenでは道後・松山城の回復と、未解放の空白の星を示して次の冒険へつなぐ。

## P8完了確認

- PR #5を `22b9cc2d30dcfbc2b41e5936b68f67717a195912` としてsquash merge済み。
- PR #5 run #33および最終docs head run #36で、`npm ci`、typecheck、lint、maps:validate、editor:smoke、build、P7 browser、P8 browserが全てPASS。
- PR上のPages configure/upload/deployは設計どおりskip。

## 次フェーズ

次はP9です。旅の手帳、進行メモ、オートセーブの最終調整、BGM/SEの最小実装を行い、P10の新規セーブ通しプレイへ接続します。

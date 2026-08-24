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
| P6 | プロローグ／道後温泉体験版 | ペンダント、シロ、核奪取、道後異変、湯の星、松山城解放 | 実装完了 |
| P6.5 | ローカル開発用マップエディタ | 道後D0/松山城C0の歩行・衝突・配置・道しるべ編集 | 完了 |
| P7 | 松山城探索・松山城クエスト | `castle/C0`、C-E01〜C-E04、くらやみ井戸、城山のまもり | 完了 |
| P7.1 | Release Hardening | 入力経路整合、Save/Battle不変条件、仕様同期、CI Release Gate | 実装中 |
| P8 | カゲマサ戦・みかん星の核奪還・MVPエンディング | 星封じ、再封印、核奪還、城の星、終了演出 | 未着手 |
| P9 | 旅の手帳・BGM/SE・セーブ調整 | 手帳、進行メモ、オートセーブ、音まわりの最小整理 | 未着手 |
| P10 | 通しプレイ・体験版調整・GitHub Pages公開確認 | 新規セーブMVP通し、難易度・操作感、公開URL、Release確認 | 未着手 |

## P7 runtime正本

- 松山城は `locationId: "castle"` / `areaId: "C0"` の1マップ構成。
- 必須敵は `C-E01`〜`C-E03`、くらやみ井戸イベント戦は `C-E04`。
- `C-E05` は任意戦闘。
- P7報酬は「城山のまもり」。
- P7完了時は `p8_kagemasa_route_unlocked` を保存するが、`collectedStars` に `castle` は追加しない。
- みかん星の核奪還、城の星、カゲマサ再封印、`gameCompleted` はP8の責務。

## P7.1 完了条件

- DOM/キーボードのNPC interactionが同じ進行処理を通る。
- SaveDataがHP/MP、重複ID、不正アイテム数を正規化する。
- ボス戦は通常ダメージでは勝利せず、`sealGauge <= 0` のみで勝利する。
- `MVP詳細GDD.md`、README、ROADMAP、PROGRESS、TASKS、BUILD_CHECKLISTのID体系とP7/P8境界がruntimeと一致する。
- PRで `typecheck`、`lint`、`maps:validate`、`editor:smoke`、`build`、`p7:browser` が全て成功する。
- main push時は同じGateを通過した場合のみGitHub Pagesへdeployする。

## 次フェーズ

P7.1のRelease Gate通過後にP8へ進みます。P8はP7で保存した `p8_kagemasa_route_unlocked` を入口に、カゲマサ戦、みかん星の核奪還、城の星取得、MVPエンディングを実装します。カゲマサ戦では「通常攻撃でHPを削り切る」ことを勝利条件にせず、星封じゲージ完了による再封印のみを正式勝利とします。

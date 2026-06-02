# TASKS

## P0 リポジトリ初期化

- [x] P0-01: ローカルGitリポジトリ初期化
- [x] P0-02: README.md 整備
- [x] P0-03: AGENTS.md 整備
- [x] P0-04: docs/specs/企画書.md 整備
- [x] P0-05: docs/specs/MVP詳細GDD.md 整備
- [x] P0-06: docs/specs/MVP要件定義書.md 整備
- [x] P0-07: docs/specs/MVP実装仕様書.md 整備
- [x] P0-08: docs/ROADMAP.md 整備
- [x] P0-09: docs/PROGRESS.md 整備
- [x] P0-10: docs/BUILD_CHECKLIST.md 整備
- [x] P0-11: docs/ASSET_TRACKER.md 整備
- [x] P0-12: docs/asset-prompts/style-guide.md 整備
- [x] P0-13: docs/asset-prompts/asset-manifest.md 整備
- [x] P0-14: 主要ビジュアル参照の整理
- [x] P0-15: 生成済み背景・UI画像の配置確認

注: GitHubリモート作成、コミット、PR作成は所有者アカウントと公開先の判断が必要なため、このローカルP0作業では未実行。

## P1 基盤実装

- [x] TypeScript + Vite
- [x] `package.json`
- [x] Canvas
- [x] DOM UI root
- [x] GameApp
- [x] GameLoop
- [x] ScreenManager
- [x] InputManager
- [x] SaveManager
- [x] AssetLoader
- [x] TitleScreen
- [x] PrologueScreen仮実装
- [ ] ブラウザ操作による保存フロー自動検証

## P2 アセット・アニメーション基盤

- [ ] 生成アセットの追加
- [ ] ひめ歩行スプライト
- [ ] ひめバトルスプライト
- [ ] シロ浮遊スプライト
- [ ] 通常敵8種
- [ ] カゲマサ
- [ ] カードアイコン
- [ ] UIフレーム
- [ ] SpriteAnimator
- [ ] Y座標による奥行き描画
- [ ] 足元影
- [ ] 簡易エフェクト

## P3 探索画面

- [ ] ひめ移動
- [ ] シロ追従
- [ ] 敵シンボル表示
- [ ] 敵シンボル接触判定
- [ ] 一度しずめた敵の非復活
- [ ] 会話UI
- [ ] 調べ物

## P4 星地図

- [ ] 道後温泉解放済み表示
- [ ] 松山城初期未解放表示
- [ ] 道後温泉クリア後の松山城解放
- [ ] 未解放星表示

## P5 複数敵対応バトル

- [ ] EncounterData
- [ ] EnemySymbolDataの `encounterId`
- [ ] BattleActor
- [ ] BattleState
- [ ] `partyMembers: BattleActor[]`
- [ ] `enemies: BattleActor[]`
- [ ] 1対1
- [ ] 1対2
- [ ] ターゲット選択UI
- [ ] カード効果
- [ ] カゲマサ封印ゲージ

## P6 道後温泉クエスト

- [ ] プロローグ
- [ ] 道後温泉探索
- [ ] 湯の星入手
- [ ] 松山城解放

## P7 松山城クエスト・カゲマサ戦

- [ ] 松山城探索
- [ ] 複数敵必須戦闘
- [ ] 星封じカード
- [ ] カゲマサ戦
- [ ] 城の星入手
- [ ] MVPエンディング

## P8 旅の手帳・セーブ調整

- [ ] 旅の手帳10項目
- [ ] 解放済みカード一覧
- [ ] 地域メモ
- [ ] あらすじ
- [ ] オートセーブ調整

## P9 通しプレイ・プレイテスト

- [ ] MVP通しプレイ
- [ ] プレイテスト記録
- [ ] 難易度調整
- [ ] ビルド確認
- [ ] リリース前チェック








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
- [x] ブラウザ操作による保存フロー自動検証

## P2 アセット・アニメーション基盤

- [x] 生成アセットの追加
- [x] ひめ歩行スプライト
- [ ] ひめバトルスプライト
- [x] シロ浮遊スプライト
- [ ] 通常敵8種
- [x] カゲマサ
- [ ] カードアイコン
- [x] UIフレーム
- [x] SpriteAnimator
- [x] Y座標による奥行き描画
- [x] 足元影
- [x] 簡易エフェクト

## P3 探索画面

- [x] ひめ移動
- [x] シロ追従
- [x] 敵シンボル表示
- [x] 敵シンボル接触判定
- [x] 一度しずめた敵の非復活
- [ ] 会話UI
- [x] 調べ物

## P3.5 道後温泉歩行可能領域の視認性改善

- [x] `walkableRects` の追加
- [x] Gキー開発者用debug overlay
- [x] Hキー道しるべ表示
- [x] collisionRectsの軽微調整
- [x] G/Hキーの実ブラウザ確認

## P4 星地図

- [x] StarMapScreen本実装
- [x] PrologueScreenからStarMapScreenへ遷移
- [x] ExploreScreenからMキー/UIでStarMapScreenへ遷移
- [x] StarMapScreenから道後温泉ExploreScreenへ遷移
- [x] 手動セーブ
- [x] つづきから `starMap` / `explore` 再開
- [x] 道後温泉解放済み表示
- [x] 松山城初期未解放表示
- [x] 道後温泉クリア後の松山城解放
- [x] 未解放星表示
- [x] GitHub Pages向けbuild設定
- [x] GitHub Pages deploy workflow
- [x] P4全ルートの実ブラウザ確認

## P4.5 DialogueBox・DialogueSystem・NPC基盤

- [x] DialogueBox
- [x] DialogueSystem
- [x] NPC基盤
- [x] 道後温泉NPC配置
- [x] 会話イベント接続

## P5 複数敵対応バトル

- [x] EncounterData
- [x] EnemySymbolDataの `encounterId`
- [x] BattleActor
- [x] BattleState
- [x] `partyMembers: BattleActor[]`
- [x] `enemies: BattleActor[]`
- [x] 1対1
- [x] 1対2
- [x] ターゲット選択UI
- [x] カード効果
- [x] カゲマサ封印ゲージ

## P5.1 戦闘専用背景＋戦闘画面レイアウト改善

- [x] 道後温泉通常戦闘専用背景の再生成
- [x] 旧 `dogo_battle_bg.png` のバックアップ
- [x] BattleScreenのひめ・敵配置改善
- [x] 1体敵・2体敵の表示位置整理
- [x] ターゲット選択ハイライト改善
- [x] カードUIの読みやすさ改善
- [x] 戦闘メッセージ表示改善
- [x] 戦闘関連文言の文字化け修正
- [x] P5 BattleSystemロジック維持確認

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








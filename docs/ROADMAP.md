# ROADMAP

## フェーズ一覧

| ID | フェーズ | 目的 | 状態 |
|---|---|---|---|
| P0 | リポジトリ初期化 | ルール、仕様、進捗管理、アセット管理、プロンプト整備 | 完了 |
| P1 | 基盤実装 | TypeScript + Vite + Canvas + DOM UI + セーブ基盤 | 実装完了・ブラウザ操作検証未完了 |
| P2 | アセット・アニメーション基盤 | 生成アセット、SpriteAnimator、2.5D風表現 | 未着手 |
| P3 | 探索画面 | ひめ移動、シロ追従、敵シンボル、接触判定 | 未着手 |
| P4 | 星地図 | 道後温泉、松山城、未解放星、目的地選択 | 未着手 |
| P5 | 複数敵対応バトル | EncounterData、BattleActor配列、ターゲット選択、カード効果 | 未着手 |
| P6 | 道後温泉クエスト | チュートリアル、湯の星、松山城解放 | 未着手 |
| P7 | 松山城クエスト・カゲマサ戦 | 城探索、星封じ、ボス戦、MVPエンディング | 未着手 |
| P8 | 旅の手帳・セーブ調整 | 手帳10項目、進行メモ、オートセーブ調整 | 未着手 |
| P9 | 通しプレイ・プレイテスト | MVP通し確認、難易度調整、リリース前チェック | 未着手 |

## フェーズ0の完了定義

- `README.md` がMVP範囲と技術方針を説明している。
- `AGENTS.md` が作業ルールと実装上の重要方針を定義している。
- `docs/specs/` に企画、GDD、要件、実装仕様が揃っている。
- `docs/ROADMAP.md`、`docs/PROGRESS.md`、`docs/TASKS.md`、`docs/BUILD_CHECKLIST.md` が揃っている。
- `docs/ASSET_TRACKER.md` と `docs/asset-prompts/` が揃っている。
- `docs/visual-reference/key-visuals/` に主要参照画像とマニフェストがある。
- ローカルGitリポジトリが初期化されている。

## 次フェーズ

P2では、生成アセットとアニメーション基盤を実装します。P1で追加したAssetLoaderとAssetManifestを使い、画像読み込み失敗時の代替表示を維持しながらSpriteAnimatorの最小実装へ進みます。








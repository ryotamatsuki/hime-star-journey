# ひめの小さな星めぐり（仮）

愛媛県内20市町への将来拡張を見据えた、手描き絵本風2.5D探索RPGのMVP開発リポジトリです。MVPでは松山市内の「道後温泉エリア」と「松山城エリア」に範囲を絞り、探索、星地図、シンボルエンカウント、カード式ターン制バトル、旅の手帳、オートセーブを実装対象にします。

## 現在のフェーズ

現在は **P3: 道後温泉探索画面** の実装完了状態です。次は **P4: StarMapScreen本実装** です。

- プロジェクトルール、技術制約、仕様書、ロードマップ、進捗管理、アセット台帳、生成プロンプトを整備済み。
- `picture/` の主要ビジュアルを `docs/visual-reference/key-visuals/` に整理済み。
- 一部の背景・UI参照画像を `public/assets/generated/` に配置済み。
- TypeScript/Vite/Canvas/DOM UI/localStorageの最小基盤を実装済み。
- 優先度AのRuntime Asset、優先度Bの仮PNG、SpriteAnimator、Y座標奥行き描画、Canvasエフェクト、ScreenShakeを実装済み。
- 道後温泉ExploreScreen、Player、Companion、EnemySymbol、Interactable、CollisionSystem、仮BattleScreenを実装済み。
- Browserプラグイン検証は環境都合で未完了ですが、Edge headless/CDPで補助確認済みです。

## 技術方針

ゲームエンジンやゲームフレームワークは使いません。

- 言語: TypeScript
- ビルド: Vite
- 描画: HTML Canvas 2D API
- UI: DOM / CSS
- セーブ: localStorage
- ループ: requestAnimationFrame

Canvas描画、DOM UI、ゲームロジック、データ、セーブ処理、アニメーション処理は分離します。

## MVP範囲

- タイトル画面
- プロローグ
- 道後温泉探索
- 松山城探索
- 星地図
- 敵シンボル接触による戦闘
- 1対1および1対2のカード式ターン制バトル
- カゲマサとの1対1ボス戦
- 旅の手帳
- オートセーブと「つづきから」

## 戦闘設計の重要ルール

- 味方はMVPではひめ1人。ただし内部的には `partyMembers: BattleActor[]` で管理します。
- 敵は `enemies: BattleActor[]` で管理します。
- 敵シンボルは `enemyId` ではなく `encounterId` を参照します。
- `EncounterData` は敵1体または2体を生成できます。
- MVPでは1対3以上の戦闘は実装しません。
- 攻撃カードで敵が複数いる場合はターゲット選択UIを表示します。
- 回復・防御カードはひめ自身に自動適用します。
- ボス戦はカゲマサ1体です。

## 主要ドキュメント

- [AGENTS.md](AGENTS.md)
- [企画書](docs/specs/企画書.md)
- [MVP詳細GDD](docs/specs/MVP詳細GDD.md)
- [MVP要件定義書](docs/specs/MVP要件定義書.md)
- [MVP実装仕様書](docs/specs/MVP実装仕様書.md)
- [ROADMAP](docs/ROADMAP.md)
- [PROGRESS](docs/PROGRESS.md)
- [TASKS](docs/TASKS.md)
- [ASSET_TRACKER](docs/ASSET_TRACKER.md)
- [BUILD_CHECKLIST](docs/BUILD_CHECKLIST.md)

## アセット管理

- アセット生成プロンプト: `docs/asset-prompts/`
- 参照画像: `docs/visual-reference/key-visuals/`
- ゲーム内で読む生成画像: `public/assets/generated/`

画像読み込みに失敗しても、実装側ではCanvasの代替図形を描いてゲームを停止させない方針です。

## 開発コマンド

以下のコマンドを検証対象にします。Windows PowerShellで `npm.ps1` のExecution Policyに止められる場合は、`npm.cmd run ...` を使ってください。

```bash
npm install
npm run typecheck
npm run lint
npm run build
npm run dev
```








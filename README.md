# ひめの小さな星めぐり（仮）

愛媛県内20市町への将来拡張を見据えた、手描き絵本風2.5D探索RPGのMVP開発リポジトリです。MVPでは松山市内の「道後温泉エリア」と「松山城エリア」に範囲を絞り、探索、星地図、シンボルエンカウント、カード式ターン制バトル、旅の手帳、オートセーブを実装対象にします。

## 現在のフェーズ

現在は **P5.1: 戦闘専用背景＋戦闘画面レイアウト改善** まで実装済みです。次は **P6: 道後温泉クエスト本体** です。

- プロジェクトルール、技術制約、仕様書、ロードマップ、進捗管理、アセット台帳、生成プロンプトを整備済み。
- `picture/` の主要ビジュアルを `docs/visual-reference/key-visuals/` に整理済み。
- 一部の背景・UI参照画像を `public/assets/generated/` に配置済み。
- TypeScript/Vite/Canvas/DOM UI/localStorageの最小基盤を実装済み。
- 優先度AのRuntime Asset、優先度Bの仮PNG、SpriteAnimator、Y座標奥行き描画、Canvasエフェクト、ScreenShakeを実装済み。
- 道後温泉ExploreScreen、Player、Companion、EnemySymbol、Interactable、CollisionSystem、仮BattleScreenを実装済み。
- P3.5でGキー開発者用オーバーレイ、Hキー/ボタン道しるべ、walkableRectsを追加済み。
- P4でStarMapScreen、TravelSystem、星地図ノード、手動セーブ、ExploreScreenとのMキー遷移を実装済み。
- P4.5でDOM/CSSのDialogueBox、DialogueSystem、自動会話、道後温泉NPC2人、NPC会話、会話既読flag保存を実装済み。
- P5で複数敵対応BattleScreen、BattleSystem、カード効果、ターゲット選択、勝利/敗北処理を実装済み。
- P5.1で道後温泉通常戦闘専用背景を生成し、戦闘画面の配置、カードUI、メッセージ、ターゲット表示、戦闘関連文言を改善済み。
- 会話本文は画像ではなくDOM上の実テキストとして表示し、会話枠画像は使わない方針に変更済み。
- GitHub Pages向けにVite `base: "/hime-star-journey/"`、public assetのbase付き解決、Pages workflowを追加済み。
- Browserプラグインは環境都合で利用できませんが、Edge headlessでP4.5の初回自動会話、既読flag保存、案内人NPC会話開始を確認しています。

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

Windows PowerShellでは次の形が安定します。

```bash
npm.cmd install
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
npm.cmd run dev
```

ViteのbaseをGitHub Pages用に設定しているため、ローカルdevサーバーの確認URLは以下です。

```text
http://127.0.0.1:5173/hime-star-journey/
```

## GitHub Pages

公開予定URL:

```text
https://ryotamatsuki.github.io/hime-star-journey/
```

`.github/workflows/deploy.yml` を追加済みです。`main` へpush後、GitHub PagesのActionsデプロイで `dist/` が公開される想定です。








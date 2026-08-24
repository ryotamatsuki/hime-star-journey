# ひめの小さな星めぐり（仮）

愛媛県内20市町への将来拡張を見据えた、手描き絵本風2.5D探索RPGのMVP開発リポジトリです。MVPでは松山市内の「道後温泉エリア」と「松山城エリア」に範囲を絞り、探索、星地図、シンボルエンカウント、カード式ターン制バトル、旅の手帳、オートセーブを実装対象にします。

## 現在のフェーズ

P7「松山城探索・松山城クエスト」は実装済みで、現在は **P7.1 Release Hardening** です。P8着手前に、入力経路差による進行不整合、セーブ正規化、ボス戦勝利条件、仕様書のID体系、GitHub ActionsのRelease Gateを整備しています。

P7 runtimeの正本は次のとおりです。

- 松山城は `locationId: "castle"` / `areaId: "C0"` の1枚の探索マップ。
- 必須戦闘は `C-E01`〜`C-E03`、くらやみ井戸は `C-E04`、`C-E05` は任意戦闘。
- 城山のまもり取得後に `p8_kagemasa_route_unlocked` を保存する。
- P7では `collectedStars` に `castle` を追加せず、`gameCompleted` も設定しない。
- カゲマサ再封印、みかん星の核奪還、城の星、MVPエンディングはP8で実装する。

主な実装状況:

- TypeScript / Vite / HTML Canvas 2D / DOM UI / localStorageの基盤を実装済み。
- P6で画像付き6シーンプロローグ、道後温泉クエスト、湯の星取得、星地図・松山城解放を実装済み。
- P6.5で `map-editor.html` を追加し、道後D0/松山城C0のレイアウトJSONを視覚編集・検証・保存できるようにしています。
- P7で星地図→松山城C0、城内戦闘、NPC/調べるヒント、くらやみ井戸、城山のまもり取得まで接続済み。
- P7.1でキーボードとDOMボタンのNPC interactionを同一処理へ統一し、マウス/タッチでも同じクエストフラグが更新されるよう修正しています。
- SaveDataはHP/MP上限、ID重複、不正な所持数を正規化します。
- ボス戦は通常ダメージだけでは勝利せず、`sealGauge <= 0` による再封印のみを正式勝利条件とします。
- GitHub ActionsはPR/mainの双方で、型・lint・マップ検証・エディタsmoke・build・実ブラウザ回帰検証をRelease Gateとして実行します。

## 技術方針

ゲームエンジンやゲームフレームワークは使いません。

- 言語: TypeScript
- ビルド: Vite
- 描画: HTML Canvas 2D API
- UI: DOM / CSS
- セーブ: localStorage
- ループ: requestAnimationFrame

Canvas描画、DOM UI、ゲームロジック、データ、セーブ処理、アニメーション処理は分離します。P8で探索クエストの新規ロジックを追加する場合は、肥大化したExploreScreenへ直接条件分岐を積み増さず、クエスト進行・特殊イベントをcontroller/serviceへ抽出してから追加します。

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
- MVPエンディング

## 戦闘設計の重要ルール

- 味方はMVPではひめ1人。ただし内部的には `partyMembers: BattleActor[]` で管理します。
- 敵は `enemies: BattleActor[]` で管理します。
- 敵シンボルは `enemyId` ではなく `encounterId` を参照します。
- `EncounterData` は敵1体または2体を生成できます。
- MVPでは1対3以上の戦闘は実装しません。
- 攻撃カードで敵が複数いる場合はターゲット選択UIを表示します。
- 回復・防御カードはひめ自身に自動適用します。
- 通常戦闘は敵全員のHPが0以下で勝利します。
- カゲマサ戦はHPを削るだけでは勝利せず、星封じゲージを0にして再封印した場合のみ勝利します。

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
- [P6.5 マップエディタ取扱説明書](docs/MAP_EDITOR_MANUAL.md)

## アセット管理

- アセット生成プロンプト: `docs/asset-prompts/`
- 参照画像: `docs/visual-reference/key-visuals/`
- ゲーム内で読む生成画像: `public/assets/generated/`

画像読み込みに失敗しても、実装側ではCanvasの代替図形を描いてゲームを停止させない方針です。起動時は現状AssetManifestを一括ロードします。P8でアセット追加後にタイトル表示時間を再計測し、必要ならboot/area/battle/ending単位の段階ロードへ変更します。

## 開発・検証コマンド

```bash
npm ci
npm run typecheck
npm run lint
npm run maps:validate
npm run editor:smoke
npm run build
npm run dev
npm run p7:browser
```

Windows PowerShellで `npm.ps1` のExecution Policyに止められる場合は、`npm.cmd run ...` を使用してください。`p7:browser` は `P7_BROWSER_PATH` を指定でき、Windowsの既存Chromiumに加えてLinuxのChrome/Chromiumも探索します。

ViteのbaseをGitHub Pages用に設定しているため、ローカルdevサーバーの確認URLは次のとおりです。

```text
http://127.0.0.1:5173/hime-star-journey/
```

ローカル開発用マップエディタ:

```text
http://127.0.0.1:5173/hime-star-journey/map-editor.html
```

エディタの保存APIはVite開発サーバー専用です。保存時は `.map-editor-backups/` にバックアップを作成し、production buildではファイル書き込みAPIを持ちません。

## GitHub Pages / Release Gate

公開URL:

```text
https://ryotamatsuki.github.io/hime-star-journey/
```

`.github/workflows/deploy.yml` はPRで検証のみを行い、main pushでは同じ検証を全て通過した場合のみPagesへdeployします。Gateは `typecheck`、`lint`、`maps:validate`、`editor:smoke`、`build`、`p7:browser` です。

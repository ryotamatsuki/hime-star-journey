# ひめの小さな星めぐり（仮）

愛媛県内20市町への将来拡張を見据えた、手描き絵本風2.5D探索RPGのMVP開発リポジトリです。MVPでは松山市内の「道後温泉エリア」と「松山城エリア」に範囲を絞り、探索、星地図、シンボルエンカウント、カード式ターン制バトル、旅の手帳、オートセーブを実装対象にします。

## 現在のフェーズ

P8「カゲマサ戦・みかん星の核奪還・MVPエンディング」を実装し、PR Release Gateを確認中です。P8通過後の次フェーズはP9「旅の手帳・BGM/SE・セーブ調整」です。

P8 runtimeの正本:

- P7完了時の `p8_kagemasa_route_unlocked` から「天守奥へ進む」導線が出る。
- P8進行は肥大化したExploreScreenへ追加せず、`P8FlowController` に分離。
- カゲマサ戦開始時にHP/MPを回復し、`card_star_seal` を解放する。
- ボス戦は `enc_boss_kagemasa` / `B-E01` / `isBoss: true`。
- 通常ダメージだけではカゲマサを倒せず、`sealGauge <= 0` による星封じ完成のみ正式勝利。
- 勝利後にみかん星の核、城の星、ペンダントの光を回復し、`gameCompleted` を保存する。
- P8完了直後は `EndingScreen` へ進み、未解放の空白の星を残して次の冒険を示す。

主な実装状況:

- TypeScript / Vite / HTML Canvas 2D / DOM UI / localStorage基盤。
- P6: 画像付き6シーンプロローグ、道後温泉クエスト、湯の星、星地図・松山城解放。
- P6.5: `map-editor.html` による道後D0/松山城C0レイアウトの視覚編集・検証・保存。
- P7: 星地図→松山城C0、城内戦闘、NPC/調べるヒント、くらやみ井戸、城山のまもり。
- P7.1: NPC入力経路統一、Save/Battle不変条件、実ブラウザCI Release Gate。
- P7.2: 道後D0の背景上の地面とwalkable polygonを整合。
- P8: カゲマサ戦、星封じ、核奪還、城の星、MVP完了保存、EndingScreen。

## 技術方針

ゲームエンジンやゲームフレームワークは使いません。

- 言語: TypeScript
- ビルド: Vite
- 描画: HTML Canvas 2D API
- UI: DOM / CSS
- セーブ: localStorage
- ループ: requestAnimationFrame

Canvas描画、DOM UI、ゲームロジック、データ、セーブ処理、アニメーション処理を分離します。P8ではExploreScreenへ条件分岐を積み増さず、最終章の導線と状態遷移を専用controllerへ切り出しています。

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

- 味方はMVPではひめ1人。ただし内部的には `partyMembers: BattleActor[]` で管理。
- 敵は `enemies: BattleActor[]` で管理。
- 敵シンボルは `enemyId` ではなく `encounterId` を参照。
- `EncounterData` は敵1体または2体を生成可能。
- MVPでは1対3以上の戦闘は実装しない。
- 攻撃カードで敵が複数いる場合はターゲット選択UIを表示。
- 回復・防御カードはひめ自身に自動適用。
- 通常戦闘は敵全員のHPが0以下で勝利。
- カゲマサ戦はHPを削るだけでは勝利せず、星封じゲージを0にして再封印した場合のみ勝利。

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
- [P8 implementation contract](docs/P8_IMPLEMENTATION.md)

## アセット管理

- アセット生成プロンプト: `docs/asset-prompts/`
- 参照画像: `docs/visual-reference/key-visuals/`
- ゲーム内で読む生成画像: `public/assets/generated/`

画像読み込みに失敗してもCanvas代替描画でゲームを停止させない方針です。現状はAssetManifestを起動時に一括ロードしており、P9で実測して必要なら段階ロードへ変更します。

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
npm run p8:browser
```

Windows PowerShellで `npm.ps1` のExecution Policyに止められる場合は `npm.cmd run ...` を使用してください。ブラウザ回帰は `P7_BROWSER_PATH` / `P8_BROWSER_PATH` を指定でき、Windows ChromiumとLinux Chrome/Chromiumの双方に対応します。

ローカルゲーム:

```text
http://127.0.0.1:5173/hime-star-journey/
```

ローカル開発用マップエディタ:

```text
http://127.0.0.1:5173/hime-star-journey/map-editor.html
```

## GitHub Pages / Release Gate

公開URL:

```text
https://ryotamatsuki.github.io/hime-star-journey/
```

`.github/workflows/deploy.yml` はPRで検証のみを行い、main pushでは同じ検証を全て通過した場合のみPagesへdeployします。P8時点のGateは `typecheck`、`lint`、`maps:validate`、`editor:smoke`、`build`、`p7:browser`、`p8:browser` です。

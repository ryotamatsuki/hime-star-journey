# Codex `/goal` 実験用プロンプト

以下は、設計文書をローカルリポジトリに配置したうえで、Codexの`/goal`に投げるための試験用プロンプトです。

```text
/goal

このリポジトリ内の設計関係書類に従い、「ひめの小さな星めぐり（仮）」MVPを、ゲームエンジンを使わずに、ブラウザで遊べる状態まで一気通貫で実装してください。画像生成、アセット管理、2.5D風アニメーション、探索、星地図、複数敵対応カードバトル、道後温泉クエスト、松山城クエスト、カゲマサ戦、旅の手帳、セーブ、通し確認までを、ひとつのMVP完成目標として扱ってください。

必ず最初に読むファイル：
- AGENTS.md
- README.md
- docs/specs/企画書.md
- docs/specs/MVP詳細GDD.md
- docs/specs/MVP要件定義書.md
- docs/specs/MVP実装仕様書.md
- docs/ROADMAP.md
- docs/PROGRESS.md
- docs/TASKS.md
- docs/BUILD_CHECKLIST.md
- docs/ASSET_TRACKER.md
- docs/DECISIONS.md
- docs/BUGS.md
- docs/asset-prompts/style-guide.md
- docs/asset-prompts/asset-manifest.md

最重要制約：
- Unity、Godot、Unreal、Phaser、PixiJS、Kaboom.js、その他ゲームエンジン・ゲームフレームワークは使用禁止。
- TypeScript + Vite + HTML Canvas 2D API + DOM UI + CSS + localStorage で実装する。
- Canvas描画、DOM UI、ゲームロジック、データ、セーブ、アニメーションを分離する。
- 仕様書にない大規模機能を追加しない。
- MVP完成を優先し、過剰な作り込みは避ける。
- 画像生成を使う場合は、生成プロンプトを docs/asset-prompts/ に保存し、生成物を public/assets/generated/ に整理する。
- 作業中の設計判断は docs/DECISIONS.md に記録する。
- 進捗は docs/PROGRESS.md に更新する。
- 発見した不具合や未解決事項は docs/BUGS.md に記録する。

完了条件：
- npm install が成功する。
- npm run dev でブラウザ起動できる。
- npm run build が成功する。
- TypeScriptの型エラーがない。
- タイトル画面から新規開始できる。
- セーブデータがあれば続きから再開できる。
- プロローグを見られる。
- 道後温泉エリアを探索できる。
- 松山城エリアを探索できる。
- 星地図で道後温泉と松山城の解放状態が確認できる。
- 道後温泉クリア後に松山城が解放される。
- 敵シンボルに接触するとBattleScreenへ遷移する。
- 1対1戦闘が動く。
- 1対2戦闘が動く。
- 複数敵戦闘でターゲット選択ができる。
- カード6枚が機能する。
- 敵撃破後、defeatedEnemyIds により敵が復活しない。
- 星Lv1〜3が機能する。
- 旅の手帳10項目が条件に応じて解放される。
- カゲマサを星封じで再封印できる。
- EndingScreenまで通しプレイできる。
- 画像が読み込めない場合でもゲームが止まらない。
- docs/PROGRESS.md、docs/BUILD_CHECKLIST.md、docs/ASSET_TRACKER.md が更新されている。
```








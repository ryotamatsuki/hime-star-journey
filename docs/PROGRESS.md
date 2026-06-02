# 進捗管理: ひめの小さな星めぐり MVP

## 現在の状態

- 現在フェーズ: P3 道後温泉探索画面（P2トップページ画像生成必須版の不足対応完了）
- 状態: P2/P3実装完了、Browserプラグイン検証は環境都合で未完了、Edge headless/CDPで補助確認済み
- 次に進むフェーズ: P4 StarMapScreen本実装
- 最終更新日: 2026-06-02

## フェーズ別進捗

| ID | フェーズ | 進捗 | 状態 | 検証状態 |
|---|---|---:|---|---|
| P0 | リポジトリ初期化 | 100% | 完了 | ドキュメント確認済み |
| P1 | 基盤実装 | 90% | 実装完了 | 型・lint・build・HTTP起動確認済み、ブラウザ操作検証未完了 |
| P2 | トップページ用手描き風アセット生成・表示実装＋2.5Dアニメーション基盤 | 100% | 実装完了 | 型・lint・build・HTTP起動・Edge headless/CDP確認済み |
| P3 | 探索画面 | 95% | 実装完了 | 型・lint・build・HTTP起動・Edge headless/CDP確認済み、Browserプラグイン検証未完了 |
| P4 | 星地図 | 0% | 未着手 | 未実行 |
| P5 | 複数敵対応バトル | 0% | 未着手 | 未実行 |
| P6 | 道後温泉クエスト | 0% | 未着手 | 未実行 |
| P7 | 松山城クエスト・カゲマサ戦 | 0% | 未着手 | 未実行 |
| P8 | 旅の手帳・セーブ調整 | 0% | 未着手 | 未実行 |
| P9 | 通しプレイ・プレイテスト | 0% | 未着手 | 未実行 |

## 2026-06-02 P0完了作業

- `AGENTS.md` をUTF-8の日本語で再整備。
- `README.md` をMVP範囲、技術方針、現在フェーズが分かる内容に更新。
- `docs/specs/` の企画書、MVP詳細GDD、MVP要件定義書、MVP実装仕様書を再整備。
- `docs/ROADMAP.md`、`docs/TASKS.md`、`docs/BUILD_CHECKLIST.md`、`docs/ASSET_TRACKER.md` を再整備。
- `docs/DECISIONS.md`、`docs/BUGS.md`、`docs/PLAYTEST_LOG.md` を再整備。
- `docs/asset-prompts/` のプロンプトとアセットマニフェストを再整備。
- `docs/visual-reference/key-visuals/` のREADMEとマニフェストを再整備。
- `picture/` 由来の8枚の主要ビジュアル参照を整理済みであることを確認。
- 生成済み背景6枚とUI参照2枚を `public/assets/generated/` に配置済みであることを確認。
- ローカルGitリポジトリを `phase0-repository-foundation` ブランチ名で初期化。
- サンドボックス由来のGit所有者差分に対応するため、この作業ディレクトリをGitの `safe.directory` に追加。
- Windows PowerShellの通常 `Get-Content` でも日本語が読めるように、Markdown文書をUTF-8 BOM付きへ統一。

## 2026-06-02 P1実装作業

- TypeScript + Vite のプロジェクト基盤を追加。
- `package.json`、`package-lock.json`、`tsconfig.json`、`vite.config.ts`、`eslint.config.js` を追加。
- `index.html` にCanvas描画領域とDOM UIルートを追加。
- `src/main.ts` と `src/styles.css` を追加。
- `src/core/GameApp.ts` を追加し、Canvas、UIルート、InputManager、SaveManager、AssetLoader、ScreenManager、GameLoopを初期化。
- `src/core/GameLoop.ts` を追加し、`requestAnimationFrame`、`deltaTime`、Screenの `update` / `render` 呼び出しを実装。
- `src/core/ScreenManager.ts` を追加し、`register`、`change`、`update`、`render`、`enter` / `exit` 呼び出しを実装。
- `src/core/InputManager.ts` を追加し、矢印キー、WASD、Enter、Space、Esc、N、M、数字1〜6、PointerEventの基本入力を実装。
- `src/core/SaveManager.ts` を追加し、`localStorage` 1スロット保存、`save`、`load`、`exists`、`clear`、`createInitialSaveData` を実装。
- `src/core/AssetLoader.ts` を追加し、画像アセット読み込み、失敗記録、Canvas代替表示を実装。
- `src/types/game.ts`、`src/types/save.ts`、`src/types/battle.ts`、`src/types/assets.ts` を追加。
- `SaveData` に `partyMemberIds` と `activePartyMemberIds` を定義し、初期値を `["hime"]` に設定。
- 将来の複数敵戦闘に備えて `EncounterData`、`EncounterEnemyData`、`BattleActor`、`BattleState`、`SkillTargetType` を定義。
- `src/data/assets.ts` に既存生成済み背景・UI参照画像のAssetManifestを追加。
- `src/screens/TitleScreen.ts` を追加し、タイトル、はじめから、つづきから有効/無効、初期SaveData作成、仮Prologue遷移を実装。
- `src/screens/PrologueScreen.ts` を追加し、仮画面表示、Escまたはボタンでタイトルへ戻る導線を実装。
- `src/ui/`、`src/entities/`、`src/systems/`、`src/animation/` の空ディレクトリ保持用 `.gitkeep` を追加。
- `.gitignore` に `.tmp/` を追加。

## 2026-06-02 P2実装作業

- 必須読込対象の仕様・進捗・アセット・判断・不具合文書を確認。
- 主要ビジュアル8枚を直接確認し、画風・構図・UI密度をRuntime Asset方針へ反映。
- 画像生成機能を利用し、`hime_idle`、`shiro_idle`、`boss_kagemasa`、`ui_card_frame` を生成して `public/assets/generated/` に配置。
- 既存の背景6枚、会話フレーム、手帳フレームをP2 Runtime Assetとして再登録。
- `public/assets/generated/placeholders/`、`effects/` などP2で必要な出力フォルダを確認・作成。
- `scripts/generate-runtime-placeholders.mjs` を追加し、外部ライブラリなしで優先度B、仮シート、エフェクト、共通プレースホルダーのPNGを生成。
- `docs/asset-prompts/runtime-assets/` にP2指定のRuntime Asset生成プロンプト12件を保存。
- `src/types/assets.ts` を拡張し、`AssetLoadStatus`、`LoadedAsset`、`AssetLoadingProgress`、fallback用のAsset定義を追加。
- `src/core/AssetLoader.ts` を拡張し、一括画像ロード、成功/失敗記録、`getImage`、`getFailedAssetIds`、`getLoadingProgress`、fallback対応を実装。
- `src/data/assets.ts` を更新し、背景、主人公、相棒、敵、ボス、カード、UI、エフェクト、プレースホルダーのRuntime Asset IDを登録。
- `src/types/animation.ts` を追加し、`AnimationFrame`、`AnimationClip`、`SpriteAnimationSet`、`AnimationState` を定義。
- `src/animation/SpriteAnimator.ts` を追加し、clip切替、loop/non-loop、1フレームclip、flip、scale、opacity描画を実装。
- `src/animation/AnimationRegistry.ts` を追加し、ひめ、シロ、通常敵、カゲマサの仮AnimationSetを集約。
- `src/systems/RenderDepthSystem.ts` を追加し、Y座標奥行き用の安定ソートと描画ヘルパーを実装。
- `src/animation/Effects.ts` を追加し、楕円影、fade、blink、knockback、floating、particle、star hit、heal mist、shirasagi light、seal lightを実装。
- `src/animation/ScreenShake.ts` を追加し、duration、magnitude、update、offset取得を実装。
- `src/screens/TitleScreen.ts` を更新し、`bg_title` 背景表示に加えて星、みかん、湯けむりのCanvas装飾を追加。DOMメニューとSaveManager挙動は維持。

## 2026-06-02 P2方針変更対応

- P2名を「トップページ用手描き風アセット生成・表示実装＋2.5Dアニメーション基盤」として扱う方針に更新。
- 前回P2の「画像生成できない場合はCanvas/CSS/汎用プレースホルダーで完了扱いにできる」方針を、TitleScreen必須5アセットについて撤回。
- 画像生成機能を使用し、TitleScreenで実際に使う必須Runtime Assets 5件を生成・配置。
  - `public/assets/generated/backgrounds/title_bg.png`
  - `public/assets/generated/characters/hime_idle.png`
  - `public/assets/generated/characters/shiro_idle.png`
  - `public/assets/generated/ui/title_menu_frame.png`
  - `public/assets/generated/effects/title_star_particles.png`
- ひめ、シロ、メニュー枠、星粒子はクロマキー生成後に透過PNG化して配置。
- `docs/asset-prompts/runtime-assets/title_bg.prompt.md`、`hime_idle.prompt.md`、`shiro_idle.prompt.md`、`title_menu_frame.prompt.md`、`title_star_particles.prompt.md` を今回実際に使ったプロンプトへ更新・追加。
- `src/data/assets.ts` に `ui_title_menu_frame` と `fx_title_star_particles` を追加し、TitleScreen必須アセットを `required: true` として登録。
- `src/core/AssetLoader.ts` に `getRequiredFailedAssetIds()` を追加し、必須アセット読み込み失敗を検出できるようにした。
- `src/animation/Effects.ts` に `simpleParticleBurst()` を追加し、指示名どおりの呼び出し口を用意。
- `src/screens/TitleScreen.ts` を更新し、生成背景、生成メニュー枠、生成ひめ、生成シロ、生成星粒子をCanvas描画へ接続。
- TitleScreen上で、ひめはSpriteAnimatorとCanvas変換によるidle揺れ、シロは `floatingMotion` による上下左右の浮遊を実装。
- `src/styles.css` を更新し、DOMメニューを生成メニュー枠に重ねる配置・手描き絵本風ボタンへ調整。

## P2 画像確認

- `docs/visual-reference/key-visuals/01_title_screen.png` から `08_travel_notebook.png` まで8枚を直接確認済み。
- P2で生成した `hime_idle.png`、`shiro_idle.png`、`boss_kagemasa.png`、`card_frame.png` を直接確認済み。
- プレースホルダー代表として `placeholder_background.png`、`dogo_oni.png`、`card_mikan_attack.png`、`hime_walk_sheet.png` を直接確認済み。

## P2 Runtime Assets

### generated

- 背景: `title_bg.png`、`dogo_explore_bg.png`、`castle_explore_bg.png`、`dogo_battle_bg.png`、`castle_battle_bg.png`、`star_map_bg.png`
- キャラクター: `hime_idle.png`、`shiro_idle.png`
- ボス: `boss_kagemasa.png`
- UI: `dialogue_frame.png`、`card_frame.png`、`notebook_frame.png`、`title_menu_frame.png`
- エフェクト: `title_star_particles.png`

## P2方針変更対応 確認結果

- `npm.cmd install`、`npm.cmd run typecheck`、`npm.cmd run lint`、`npm.cmd run build` は成功。
- `npm.cmd run dev -- --host 127.0.0.1` はdevサーバーとして起動し、`http://127.0.0.1:5173` がHTTP 200を返した。
- 必須5アセットはdevサーバー経由でHTTP 200取得を確認。
- Edge headless screenshotで、生成背景、生成メニュー枠、ひめ、シロ、星素材がTitleScreenに表示されることを確認。
- 時間差スクリーンショットのSHA256が異なることを確認し、Canvasの時間ベース描画が動いていることを確認。
- Edge CDPで、セーブなし初期状態では「つづきから」がdisabled、`はじめから` で `localStorage` に `hime_star_journey_mvp_save_v1` が作成されることを確認。
- Edge CDPで、リロード後に「つづきから」が有効になり、クリックでPrologueScreenへ遷移することを確認。
- Browserプラグインは `windows sandbox failed: spawn setup refresh` で今回も利用できなかったため、Edge headless/CDPで補助確認した。

### pending（旧P2で仮PNG配置済み、完成品質化は後続）

- 仮スプライトシート: `hime_walk_sheet.png`、`hime_battle_sheet.png`、`shiro_fly_sheet.png`、`boss_kagemasa_sheet.png`
- 通常敵: `dogo_oni.png`、`dogo_lantern.png`、`dogo_armor.png`、`dogo_mouse.png`、`castle_soldier.png`、`castle_oni.png`、`castle_well.png`、`castle_crow.png`
- カード: `card_mikan_attack.png`、`card_shirasagi_ofuda.png`、`card_dogo_drop.png`、`card_yukemuri_veil.png`、`card_castle_guard.png`、`card_star_seal.png`
- UI: `quest_panel_frame.png`、`star_icon_locked.png`、`star_icon_unlocked.png`、`star_icon_cleared.png`
- エフェクト: `fx_star_hit.png`、`fx_yukemuri_heal.png`、`fx_shirasagi_light.png`、`fx_seal_light.png`
- 共通代替: `placeholder_background.png`、`placeholder_character.png`、`placeholder_enemy.png`、`placeholder_card.png`、`placeholder_ui_frame.png`（AssetLoader fallback用。P2方針変更後の必須5件完了判定には使わない）

## 2026-06-02 P3実装作業

- 必須読込対象の仕様・進捗・アセット・判断・不具合文書を確認。
- `docs/visual-reference/key-visuals/02_dogo_exploration.png`、`07_dialogue_event.png`、`01_title_screen.png` を直接確認。
- 道後温泉探索で最低限使うRuntime Assetsの存在を確認。
- P3では不足画像がなかったため追加画像生成は行わず、既存generatedとP2 pending仮PNGを使用。
- `docs/asset-prompts/runtime-assets/dogo_enemies.prompt.md` と `dogo_explore_ui.prompt.md` を追加。
- `src/systems/CollisionSystem.ts` を追加し、AABB、bounds clamp、obstacle判定、X/Y分割移動を実装。
- `src/data/maps.ts` を追加し、道後温泉 `locationId: "dogo"`、`areaId: "D0"`、1280x720 bounds、collisionRects、playerStartを定義。
- `src/data/enemySymbols.ts` を追加し、`D-E01`、`D-E02`、`D-E03`、`D-E05` を `encounterId` 参照で配置。
- `src/data/interactables.ts` を追加し、`dogo_start_sign`、`dogo_steam_spot`、`dogo_star_placeholder` を配置。
- `src/entities/Player.ts` を追加し、WASD/矢印移動、斜め移動正規化、lastDirection、SpriteAnimator、足元collider、楕円影、画像/fallback描画を実装。
- `src/entities/Companion.ts` を追加し、シロの遅延追従、floating motion、画像/fallback描画を実装。
- `src/entities/EnemySymbol.ts` を追加し、`symbolId`、`encounterId`、`defeatedFlag`、`openedPathFlag`、簡易アニメーション、collider、撃破判定を実装。
- `src/entities/Interactable.ts` を追加し、調べるポイント、近接判定、ラベル、Canvas markerを実装。
- `src/screens/ExploreScreen.ts` を追加し、道後温泉背景、Player/Companion/EnemySymbol/Interactable管理、Y座標順描画、敵接触、調べる処理、探索UI、SaveData接続を実装。
- `src/screens/BattleScreen.ts` を追加し、仮バトル画面、BattleStartParams表示、仮勝利、`defeatedEnemyIds` 保存、ExploreScreen復帰を実装。
- `src/core/GameApp.ts` を更新し、ExploreScreenとBattleScreenを登録。
- `src/screens/PrologueScreen.ts` を更新し、「道後温泉へ進む」ボタンとEnter導線を追加。
- `src/styles.css` を更新し、探索UI、目的パネル、ステータスパネル、メッセージ、仮バトルパネルを追加。

## P3 Runtime Assets

### 使用したgenerated

- `public/assets/generated/backgrounds/dogo_explore_bg.png`
- `public/assets/generated/characters/hime_idle.png`
- `public/assets/generated/characters/shiro_idle.png`
- `public/assets/generated/ui/dialogue_frame.png`

### 使用したpending仮PNG

- `public/assets/generated/enemies/dogo_oni.png`
- `public/assets/generated/enemies/dogo_lantern.png`
- `public/assets/generated/enemies/dogo_mouse.png`
- `public/assets/generated/ui/quest_panel_frame.png`
- `public/assets/generated/characters/hime_walk_sheet.png`

## P3 確認結果

- `npm.cmd install`、`npm.cmd run typecheck`、`npm.cmd run lint`、`npm.cmd run build` は成功。
- `npm.cmd run dev -- --port 5173` は長時間起動コマンドのためタイムアウト扱いになったが、ViteのNodeプロセスが起動し、`http://127.0.0.1:5173` がHTTP 200を返した。
- BrowserプラグインはP3でも `windows sandbox failed: spawn setup refresh` で失敗。
- Edge headless screenshotでタイトル画面表示を確認。
- Edge CDPでタイトルから新規開始、Prologue経由でExplore保存、仮勝利後の `defeatedEnemyIds: ["D-E05"]` 保存、リロード後の「つづきから」有効化、撃破ID保持を確認。
- Edge CDP screenshotで道後温泉ExploreScreen、目的UI、ステータスUI、メッセージ、ひめ、シロ、敵シンボル、Interactable表示を確認。

## 未実装・次フェーズ送り

- StarMapScreen、NotebookScreen、EndingScreenの本実装は未着手。
- BattleScreenは仮実装。BattleSystem、カード効果、HP処理、複数敵本体は未実装。
- 道後温泉ExploreScreenは仮マップで実装済み。道後温泉クエスト完了処理、湯の星取得処理、星Lv2処理は未実装。
- 松山城マップ、松山城ExploreScreen、松山城クエスト、カゲマサ戦は未実装。
- 完成品質のスプライトシート制作は未実装。P2では仮シートとSpriteAnimator基盤のみ実装。
- 道後温泉敵、カード、星アイコン、エフェクトはpending仮PNG。完成品質化は後続フェーズ。
- Browserプラグインによる操作確認は環境問題により未完了。Edge headless/CDPで補助確認済み。
- GitHubリモート作成、コミット、PR作成は所有者アカウントと公開先判断が必要なため未実行。

## 検証メモ

| コマンド | 結果 | 備考 |
|---|---|---|
| `git init -b phase0-repository-foundation` | 成功 | P0でローカルリポジトリを初期化 |
| `git config --global --add safe.directory C:/Users/Owner/Desktop/workspace_new/proj_y_game/hime-star-journey` | 成功 | `git status` 実行のため |
| `git branch --show-current` | 成功 | `phase0-repository-foundation` |
| `git status --short` | 成功 | 初期リポジトリのため全ファイル未追跡 |
| `node -e "JSON.parse(...manifest.json...)"` | 成功 | 主要ビジュアルmanifestのJSON妥当性確認 |
| 文字化けパターン検索 | 成功 | 既知の文字化け断片は検出なし |
| Markdown UTF-8 BOM変換 | 成功 | Windows PowerShell標準読み取り対策 |
| `npm install` | 成功 | 118 packages、0 vulnerabilities |
| `npm.cmd run typecheck` | 成功 | `tsc -p tsconfig.json --noEmit` |
| `npm.cmd run lint` | 成功 | `eslint .` |
| `npm.cmd run build` | 成功 | `tsc` + `vite build` |
| `npm.cmd run dev -- --port 5173` | 成功 | devサーバー起動、`http://127.0.0.1:5173` がHTTP 200 |
| `node scripts\generate-runtime-placeholders.mjs` | 成功 | 31件のRuntime placeholder PNGを生成 |
| `npm.cmd install` | 成功 | up to date、119 packages、0 vulnerabilities |
| `npm.cmd run typecheck` | 成功 | P2新規TSファイルを含め型エラーなし |
| `npm.cmd run lint` | 成功 | P2新規scriptを含めlintエラーなし |
| `npm.cmd run build` | 成功 | Vite build成功、13 modules transformed |
| `npm.cmd run dev -- --port 5173` | 成功 | `http://127.0.0.1:5173` がHTTP 200 |
| `npm.cmd install` | 成功 | up to date、119 packages、0 vulnerabilities |
| `npm.cmd run typecheck` | 成功 | P3新規TSファイルを含め型エラーなし |
| `npm.cmd run lint` | 成功 | P3新規ファイルを含めlintエラーなし |
| `npm.cmd run build` | 成功 | Vite build成功、27 modules transformed |
| `npm.cmd run dev -- --port 5173` | 起動確認 | 長時間プロセスのためshellはtimeout。Vite Nodeプロセス起動後、HTTP 200を確認 |
| P2必須5アセットHTTP確認 | 成功 | `title_bg`、`hime_idle`、`shiro_idle`、`title_menu_frame`、`title_star_particles` がHTTP 200 |
| Edge headless screenshot | 成功 | `C:\tmp\hime-p2-title.png` でP2生成アセット反映後のTitleScreenを確認 |
| Edge headless時間差確認 | 成功 | `C:\tmp\hime-p2-title.png` と `C:\tmp\hime-p2-title-later.png` のSHA256差分を確認 |
| Edge CDP TitleScreen確認 | 成功 | はじめから保存、リロード後つづきから有効化、つづきからPrologue遷移を確認 |
| Edge headless screenshot | 成功 | `C:\tmp\hime-p3-title.png` でタイトル画面表示を確認 |
| Edge CDP補助確認 | 一部成功 | Explore保存、仮勝利後の `D-E05` 保存、リロード後の続きから有効化、撃破ID保持、Explore screenshotを確認 |
| `npm run typecheck` / `npm run lint` | 環境要因で失敗 | PowerShellが `npm.ps1` をExecution Policyで拒否。`npm.cmd` では成功 |
| Browserプラグイン確認 | 失敗 | P3でもnode_repl kernelが `windows sandbox failed: spawn setup refresh` で起動失敗 |
| Edge headless確認 | 成功 | サンドボックス外許可でscreenshot/CDPを利用 |

## 次の判断

P4ではStarMapScreen本実装に入る。P3で保存される `currentLocationId`、`currentAreaId`、`defeatedEnemyIds`、`flags` を前提に、道後温泉から星地図へ戻る導線と、松山城未解放表示を接続する。

## P3 方針変更対応: 道後温泉2.5D探索マップ生成・歩行探索実装

- 状態: 完了。
- 旧P3の単一背景 `bg_dogo_explore` 前提から、`dogo_map_base` / `dogo_map_foreground` / `dogo_map_overlay_steam` の2.5D探索マップ構成へ変更。
- 画像生成必須方針に従い、Canvas図形・CSS・汎用プレースホルダーのみでは完了扱いにしていない。
- 主参照画像: `docs/visual-reference/key-visuals/02_dogo_exploration.png`。補助参照として `01_title_screen.png`、`07_dialogue_event.png` を確認。

### 生成・配置した必須Runtime Asset

- `public/assets/generated/backgrounds/dogo_map_base.png`
- `public/assets/generated/backgrounds/dogo_map_foreground.png`
- `public/assets/generated/backgrounds/dogo_map_overlay_steam.png`
- `public/assets/generated/characters/hime_walk_sheet.png`
- `public/assets/generated/characters/shiro_fly_sheet.png`
- `public/assets/generated/enemies/dogo_oni.png`
- `public/assets/generated/enemies/dogo_lantern.png`
- `public/assets/generated/enemies/dogo_armor.png`
- `public/assets/generated/enemies/dogo_mouse.png`
- `public/assets/generated/ui/quest_panel_frame.png`

### 実装した主なファイル

- `src/core/Camera.ts`: 1920x1080ワールドを1280x720ビューへ切り出すカメラ追従。
- `src/data/assets.ts`: P3必須Asset IDを追加し、必須生成アセットは `required: true` に設定。
- `src/data/maps.ts`: 道後温泉 `D0` を `worldWidth: 1920` / `worldHeight: 1080` の2.5D探索マップデータへ更新。
- `src/data/enemySymbols.ts`: `D-E01` から `D-E06` までの道後敵シンボルを `encounterId` 基準で配置。
- `src/data/encounters.ts`: 道後温泉用 `EncounterData` を追加し、ゆげネズミ2体エンカウントを定義。
- `src/entities/Player.ts`: `hime_walk_sheet` を4方向x4フレームとして描画し、カメラ座標変換に対応。
- `src/entities/Companion.ts`: `shiro_fly_sheet` を横4フレームとして描画し、追従と浮遊に対応。
- `src/entities/EnemySymbol.ts`: 敵ごとのwander / blink / scurry / shakeアニメーションとカメラ描画に対応。
- `src/entities/Interactable.ts`: Interactableの描画をカメラ座標へ対応。
- `src/screens/ExploreScreen.ts`: base / foreground / steam overlay、Y座標順描画、StatusPanel、QuestPanel、MiniMap、敵接触検出を実装。
- `src/styles.css`: 生成 `quest_panel_frame.png` を使うQuestPanelとMiniMap表示を追加。

### できるようになったこと

- PrologueScreenから道後温泉ExploreScreenへ進める。
- 2.5D探索マップをカメラで切り出して表示できる。
- ひめがWASD / 矢印キーで移動し、歩行シートの方向・フレームが変わる。
- シロがひめをふわふわ追従する。
- 敵シンボルが複数表示され、敵ごとに簡易アニメーションする。
- `enemySymbolId` / `encounterId` を接触時に取得し、既存の仮BattleScreenへ渡せる。
- `defeatedEnemyIds` に含まれる敵シンボルは生成対象から外れる。
- StatusPanel、QuestPanel、MiniMapをDOM UIとして表示する。

### 検証結果

| コマンド | 結果 | 備考 |
|---|---|---|
| `npm.cmd install` | 成功 | up to date、119 packages、0 vulnerabilities |
| `npm.cmd run typecheck` | 成功 | `tsc -p tsconfig.json --noEmit` |
| `npm.cmd run lint` | 成功 | `eslint .` |
| `npm.cmd run build` | 成功 | Vite build成功、29 modules transformed |
| `npm.cmd run dev -- --host 127.0.0.1 --port 5173` | 成功 | 一時起動しHTTP 200を確認後、検証スクリプトで終了 |
| P3必須10アセットHTTP確認 | 成功 | 全件HTTP 200 |
| Edge headless/CDP確認 | 成功 | TitleScreenからPrologue経由でExploreへ遷移、`currentScreenId: "explore"` / `currentLocationId: "dogo"` 保存、MiniMap表示、右移動入力後のスクリーンショットを確認 |
| Browserプラグイン確認 | 失敗 | `node_repl` が `windows sandbox failed: spawn setup refresh` で起動不可。Edge headless/CDPで補助確認 |

### 未解決・次フェーズ送り

- BattleScreenは仮実装のまま。本格BattleSystem、カード効果、HP処理はP5以降。
- 道後温泉クエスト完了、湯の星取得、星Lv2処理は未実装。
- 松山城、StarMapScreen、NotebookScreen、EndingScreenは未実装。
- 完成品質の歩行シート細部調整、敵シンボルの本格アニメーションは後続で差し替え可能な構造に留めた。

## 2026-06-03 GitHub push preparation

- `picture/` を `.gitignore` に追加し、重複元画像をpush対象から除外。
- `node_modules/`、`dist/`、`.tmp/`、`picture/` は未追跡または生成物として除外。
- `npm.cmd run typecheck`: 成功。
- `npm.cmd run lint`: 成功。
- `npm.cmd run build`: 成功。








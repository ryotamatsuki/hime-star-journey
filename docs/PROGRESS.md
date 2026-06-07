# 進捗管理: ひめの小さな星めぐり MVP

## 現在の状態

- 現在フェーズ: P5.1 戦闘専用背景＋戦闘画面レイアウト改善
- 状態: P5.1実装完了。道後温泉通常戦闘専用背景を生成・配置し、BattleScreenの敵配置、ひめ配置、カードUI、ターゲット選択、戦闘メッセージ、文字化け文言を改善済み
- 次に進むフェーズ: P6 道後温泉クエスト本体
- 最終更新日: 2026-06-07

## フェーズ別進捗

| ID | フェーズ | 進捗 | 状態 | 検証状態 |
|---|---|---:|---|---|
| P0 | リポジトリ初期化 | 100% | 完了 | ドキュメント確認済み |
| P1 | 基盤実装 | 90% | 実装完了 | 型・lint・build・HTTP起動確認済み、ブラウザ操作検証未完了 |
| P2 | トップページ用手描き風アセット生成・表示実装＋2.5Dアニメーション基盤 | 100% | 実装完了 | 型・lint・build・HTTP起動・Edge headless/CDP確認済み |
| P3 | 探索画面 | 95% | 実装完了 | 型・lint・build・HTTP起動・Edge headless/CDP確認済み、Browserプラグイン検証未完了 |
| P3.5 | 道後温泉歩行可能領域改善 | 100% | 実装完了 | 型・lint・build・HTTP確認済み、Edge headless/CDPでG/H確認済み |
| P4 | 星地図 | 100% | 実装完了 | 画像生成・型・lint・build・HTTP確認済み、Edge headless/CDPで通し確認済み |
| P4.5 | DialogueBox・DialogueSystem・NPC基盤 | 100% | 実装完了 | 画像生成・型・lint・build・HTTP確認済み、Edge headlessで自動会話/NPC会話確認済み |
| P4.6 | P4生成UIアセットの透過処理・表示品質仕上げ | 100% | 実装完了 | 透過PNG化・星地図背景上の合成プレビュー・型・lint・build・HTTP確認済み |
| P5 | 複数敵対応バトル | 100% | 実装完了 | 型・lint・build・HTTP確認済み、Browserプラグイン検証は環境エラー |
| P5.1 | 戦闘専用背景＋戦闘画面レイアウト改善 | 100% | 実装完了 | 画像生成・型・lint・build・HTTP確認済み、Browserプラグイン検証は環境エラー |
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

P5では複数敵対応BattleScreen本実装に入る。P4で整備した `StarMapScreen`、`TravelSystem`、`flags.location_castle_unlocked`、`collectedStars`、`unlockedLocations` と、P4.5で整備した `DialogueSystem`、NPC会話、会話既読flagを前提に、道後温泉クエストと戦闘導線へ接続できる状態を維持する。

## 2026-06-05 P4.5 DialogueBox・DialogueSystem・NPC基盤

- 状態: 完了。
- 会話UIは画像生成せず、`src/ui/DialogueBox.ts` と `src/styles.css` のDOM/CSSで実装した。
- 会話本文、話者名、次へ/閉じるボタンはすべて実テキストとして表示し、画像内文字にはしていない。
- 日本語会話文のfont-familyは `"Yu Gothic", "Yu Gothic UI", "Hiragino Maru Gothic ProN", "Hiragino Sans", "Meiryo", sans-serif` を使用。
- `src/types/dialogue.ts`、`src/data/dialogues.ts`、`src/systems/DialogueSystem.ts` を追加し、自動会話、NPC会話、調べる会話、既読flag、完了時flag更新を実装した。
- `src/entities/NPC.ts` と `src/data/npcs.ts` を追加し、道後温泉に案内人と湯守のおばあさんを配置した。
- `src/screens/ExploreScreen.ts` にDialogueSystem、DialogueBox、NPCを統合し、会話中はPlayer移動を止めるようにした。
- `dogo_intro_auto` は道後温泉初回入場時に自動発火し、完了時に `flags.dialogue_dogo_intro_seen = true` を保存する。
- `dogo_first_enemy_hint_auto` は初回敵近接時に呼べる構造として実装し、発火時は `flags.dialogue_first_enemy_hint_seen = true` を保存する。
- `dogo_steam_spot` はDialogueSystemの `interactable_steam_hint` へ統合した。その他Interactableは現行の短文message方式を残している。
- NPC近接時は「Enter：話す」ヒントに加え、DOMの「案内人と話す」ボタンを表示して話しかけられるようにした。Enter/Spaceのconfirm処理も維持している。
- 会話終了直後に近接対象を再計算し、会話後すぐNPC会話へ戻れるようにした。

### P4.5 生成・配置した必須Runtime Asset

- `public/assets/generated/characters/portrait_hime.png`
- `public/assets/generated/characters/portrait_shiro.png`
- `public/assets/generated/characters/npc_dogo_guide.png`
- `public/assets/generated/characters/npc_yumori_grandma.png`

### P4.5 実装・更新ファイル

- 追加: `src/types/dialogue.ts`
- 追加: `src/data/dialogues.ts`
- 追加: `src/systems/DialogueSystem.ts`
- 追加: `src/ui/DialogueBox.ts`
- 追加: `src/entities/NPC.ts`
- 追加: `src/data/npcs.ts`
- 更新: `src/data/assets.ts`
- 更新: `src/screens/ExploreScreen.ts`
- 更新: `src/styles.css`

### P4.5 確認結果

- `npm.cmd install`: 成功。up to date、119 packages、0 vulnerabilities。
- `npm.cmd run typecheck`: 成功。
- `npm.cmd run lint`: 成功。
- `npm.cmd run build`: 成功。
- `npm.cmd run dev -- --host 127.0.0.1 --port 5201 --strictPort`: HTTP 200確認。
- P4.5必須4アセットはdevサーバー経由でHTTP 200確認済み。
- Edge headlessの一時同一オリジンテストで、Title -> Prologue -> StarMap -> Explore到達、`dogo_intro_auto` 表示、`dialogue_dogo_intro_seen` 保存、案内人NPC会話開始を確認した。
- Browserプラグインとnode_replは引き続き `windows sandbox failed: spawn setup refresh` で利用できないため、Edge headlessとHTTP確認で補助した。

### P4.5 未解決事項

- NPC会話は2人分の短い会話のみ。選択肢、履歴、長文解説、ボイスは未実装。
- Interactableは湯けむりのみDialogueSystemへ統合済み。看板と湯の星の気配は現行message方式を残し、後続で統合可能。

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

## 2026-06-05 P3.5実装作業

- フェーズ名: 道後温泉探索マップの歩行可能領域の視認性改善。
- 対象外指定に従い、BattleScreen本実装、NPC会話、旅の手帳、松山城探索、StarMapScreen新規機能追加、新しい背景画像の全面再生成には入っていない。
- `src/data/maps.ts` に `WalkableRect` / `WalkablePolygon` 型を追加し、道後温泉 `D0` に `walkableRects` を追加。
- `walkableRects` は中央の石畳、下の広場、左の提灯通り、左下入口道、橋の手前の道、右の湯けむり通り、右下路地の7矩形で構成。
- 将来polygon化できるよう、`walkablePolygons?: WalkablePolygon[]` も `MapAreaData` に追加。
- `collisionRects` を `dogo_map_base.png` の建物、植え込み、橋、湯釜、画面境界に合わせて再調整。
- `playerStart` を左端寄りから中央下の歩行可能路へ移動し、開始直後に地形との関係が分かりやすいようにした。
- `src/core/InputManager.ts` に `debugOverlay` (`G`) と `pathGuide` (`H`) を追加。
- `src/screens/ExploreScreen.ts` に開発者用debug overlayを追加。Gキーで表示/非表示を切り替え、collisionRectsを赤、walkableRectsを緑、walkablePolygonsを青でカメラ追従描画する。
- debug overlayには `DEV DEBUG ONLY` 表示を入れ、本番プレイ用ではなく開発調整用であることを明記。
- `src/screens/ExploreScreen.ts` にプレイヤー用「道しるべ」を追加。HキーまたはDOMの「道しるべ」ボタンで2.8秒だけ歩行可能領域を金色/みかん色の淡い光と星粒子で表示する。
- 道しるべ表示は背景の上、キャラクター/敵/前景/湯けむりの下に描画し、移動や接触判定を妨げない。
- `src/styles.css` に道しるべボタンの見た目とdisabled状態を追加。

### P3.5 walkableRects

| ID | x | y | width | height | 用途 |
|---|---:|---:|---:|---:|---|
| `dogo_walk_center_road` | 760 | 176 | 292 | 820 | 中央の石畳 |
| `dogo_walk_lower_plaza` | 520 | 725 | 520 | 270 | 下の広場 |
| `dogo_walk_left_lantern_street` | 72 | 330 | 620 | 152 | 左の提灯通り |
| `dogo_walk_left_entry` | 520 | 560 | 250 | 320 | 左下の入口道 |
| `dogo_walk_upper_bridge` | 1060 | 170 | 620 | 210 | 橋の手前の道 |
| `dogo_walk_right_steam_lane` | 1320 | 615 | 500 | 220 | 右の湯けむり通り |
| `dogo_walk_south_east_lane` | 1135 | 840 | 520 | 156 | 右下の路地 |

### P3.5 検証結果

| コマンド | 結果 | 備考 |
|---|---|---|
| `npm.cmd install` | 成功 | up to date、119 packages、0 vulnerabilities |
| `npm.cmd run typecheck` | 成功 | 初回はpolygon先頭点のundefined型で失敗。guard追加後成功 |
| `npm.cmd run lint` | 成功 | `eslint .` |
| `npm.cmd run build` | 成功 | Vite build成功、32 modules transformed |
| `npm.cmd run dev` | 成功 | P4仕上げ時に `http://127.0.0.1:5199/hime-star-journey/` でHTTP 200確認 |
| Edge headless/CDP G/H確認 | 成功 | Hキーで「道しるべ表示中」になり2.8秒後に戻ること、Gキーでdebug overlayのcanvas差分が出ることを確認 |

### P3.5 未解決・次フェーズ送り

- collisionRectsは生成背景に対する完全一致ではないため、実プレイで細部の引っかかりが見つかればGキーdebug overlayを使って追加調整する。
- collisionRectsは背景に合わせて大きく調整したが、完全一致ではない。実プレイで細かい引っかかりを見つけたらdebug overlayで再調整する。

## 2026-06-03 P4停止記録

- フェーズ4名: 星地図画面の画像生成・StarMapScreen本実装。
- 必須読込対象の仕様、進捗、アセット、判断、不具合、スタイルガイド、アセットマニフェスト、主要ビジュアルREADME/manifestを確認。
- `docs/visual-reference/key-visuals/06_star_map.png`、`01_title_screen.png`、`02_dogo_exploration.png`、`03_matsuyama_castle_exploration.png` を直接確認。
- P4では `star_map_bg`、星アイコン3種、星地図パネル、道後/松山城バッジの画像生成が必須。
- このセッションでは組み込み `image_gen` ツールが利用可能ツールとして公開されていない。
- `imagegen` CLIフォールバックは存在するが、`OPENAI_API_KEY` が未設定であり、画像生成を実行できない。
- ユーザー指示の停止条件に従い、Canvas図形、CSS、単色矩形、汎用プレースホルダーによる代替実装には進んでいない。
- StarMapScreen、TravelSystem、AssetManifest更新、既存画面遷移更新は未実装のまま停止した。

### P4 必須Runtime Asset状況

| ID | 保存先 | 状態 | 備考 |
|---|---|---|---|
| bg_star_map | `public/assets/generated/backgrounds/star_map_bg.png` | failed | 旧生成ファイルは存在するが、P4必須の今回画像生成を実行できていないため完了扱いしない |
| ui_star_icon_locked | `public/assets/generated/ui/star_icon_locked.png` | failed | 旧pending画像は存在するが、P4必須の今回画像生成を実行できていない |
| ui_star_icon_unlocked | `public/assets/generated/ui/star_icon_unlocked.png` | failed | 旧pending画像は存在するが、P4必須の今回画像生成を実行できていない |
| ui_star_icon_cleared | `public/assets/generated/ui/star_icon_cleared.png` | failed | 旧pending画像は存在するが、P4必須の今回画像生成を実行できていない |
| ui_star_map_panel_frame | `public/assets/generated/ui/star_map_panel_frame.png` | failed | 画像生成不可のため未作成 |
| ui_location_badge_dogo | `public/assets/generated/ui/location_badge_dogo.png` | failed | 画像生成不可のため未作成 |
| ui_location_badge_castle | `public/assets/generated/ui/location_badge_castle.png` | failed | 画像生成不可のため未作成 |

### P4 検証結果

| コマンド | 結果 | 備考 |
|---|---|---|
| P4画像生成 | 失敗 | 組み込み `image_gen` ツールが利用不可、`OPENAI_API_KEY` 未設定 |
| `npm install` | 未実行 | 停止条件により実装・検証へ進まず |
| `npm run typecheck` | 未実行 | 停止条件により実装・検証へ進まず |
| `npm run lint` | 未実行 | 停止条件により実装・検証へ進まず |
| `npm run build` | 未実行 | 停止条件により実装・検証へ進まず |
| `npm run dev` | 未実行 | 停止条件により実装・検証へ進まず |

## 2026-06-03 P4再実行: 星地図画面の画像生成・StarMapScreen本実装

- 状態: 実装完了。ヘッドレスブラウザでの自動遷移確認はユーザー指示によりスキップ。
- 前回停止理由 `ENV-004` は、今回の再実行で組み込み画像生成ツールを利用できたため解消。
- 前回の `failed` 記録は履歴として残し、最新状態は `generated` として更新。
- `docs/visual-reference/key-visuals/06_star_map.png` を主参照、`01_title_screen.png`、`02_dogo_exploration.png`、`03_matsuyama_castle_exploration.png` を補助参照として確認済み。

### P4で生成・配置した必須Runtime Asset

- `public/assets/generated/backgrounds/star_map_bg.png`
- `public/assets/generated/ui/star_icon_locked.png`
- `public/assets/generated/ui/star_icon_unlocked.png`
- `public/assets/generated/ui/star_icon_cleared.png`
- `public/assets/generated/ui/star_map_panel_frame.png`
- `public/assets/generated/ui/location_badge_dogo.png`
- `public/assets/generated/ui/location_badge_castle.png`

### P4で保存した生成プロンプト

- `docs/asset-prompts/runtime-assets/star_map_bg.prompt.md`
- `docs/asset-prompts/runtime-assets/star_icon_locked.prompt.md`
- `docs/asset-prompts/runtime-assets/star_icon_unlocked.prompt.md`
- `docs/asset-prompts/runtime-assets/star_icon_cleared.prompt.md`
- `docs/asset-prompts/runtime-assets/star_map_panel_frame.prompt.md`
- `docs/asset-prompts/runtime-assets/location_badge_dogo.prompt.md`
- `docs/asset-prompts/runtime-assets/location_badge_castle.prompt.md`

### P4で実装した主なファイル

- `src/data/starMap.ts`: 星地図ノード定義、道後温泉、松山城、未解放3エリアの座標と説明。
- `src/systems/TravelSystem.ts`: SaveDataからノード状態、選択可否、現在目的、あらすじ、遷移先を計算。
- `src/screens/StarMapScreen.ts`: 生成背景、星ノード、バッジ、現在目的、あらすじ、手動セーブ、戻る導線、開発用道後クリア扱いボタンを実装。
- `src/core/GameApp.ts`: `StarMapScreen` を登録。
- `src/core/SaveManager.ts`: 初期 `currentLocationId` / `unlockedLocations` を `dogo` 系へ補正し、`location_castle_unlocked` 初期falseを明示。
- `src/screens/PrologueScreen.ts`: Prologue後にStarMapScreenへ進む導線へ変更。
- `src/screens/ExploreScreen.ts`: MキーとUIボタンでStarMapScreenへ遷移する導線を追加。
- `src/styles.css`: StarMapScreen用DOM UI、生成パネル枠、探索画面の星地図ボタンを追加。
- `src/vite-env.d.ts`: `import.meta.env.DEV` 型を追加。
- `eslint.config.js`: 中断したヘッドレスブラウザ検証で生成された `.tmp` 配下をlint対象外に追加。

### P4でできるようになったこと

- StarMapScreenに生成 `star_map_bg` を背景として表示する。
- 道後温泉、松山城、しまなみ方面、石鎚方面、南予方面の星ノードを表示する。
- ノード状態に応じて `star_icon_locked` / `star_icon_unlocked` / `star_icon_cleared` を使い分ける。
- 道後温泉は初期状態で選択可能。
- 松山城は初期状態でロックされ、`flags.location_castle_unlocked` または `unlockedLocations.includes("castle")` で解放表示になる。
- 道後温泉ノード選択で既存ExploreScreenへ遷移できる。
- 松山城は解放後も今回マップ未実装のため、後続フェーズ実装予定メッセージを表示する。
- 現在目的、あらすじ、選択中ノード名、説明、手動セーブUIを表示する。
- 星ノードに点滅、発光、浮遊、選択時の拡大縮小を付ける。
- ExploreScreenからMキーまたはUIボタンでStarMapScreenへ戻れる。

### P4 検証結果

| コマンド | 結果 | 備考 |
|---|---|---|
| P4画像生成 | 成功 | 必須7アセットを組み込み画像生成で作成し、`public/assets/generated/` に配置 |
| P4必須7アセットファイル確認 | 成功 | 7件すべて存在し、PNGとして読み取り可能 |
| `npm.cmd install` | 成功 | up to date、119 packages、0 vulnerabilities |
| `npm.cmd run typecheck` | 成功 | `tsc -p tsconfig.json --noEmit` |
| `npm.cmd run lint` | 成功 | 初回は `.tmp` のEdge検証生成物を拾って失敗。`.tmp` をESLint ignoreに追加後、`eslint .` 成功 |
| `npm.cmd run build` | 成功 | Vite build成功、32 modules transformed |
| `npm.cmd run dev` | スキップ | ユーザー指示によりヘッドレスブラウザ自動遷移確認をスキップ。起動確認は後続で実施可能 |

### P4 未解決・次フェーズ送り

- 松山城ExploreScreen本体は未実装。P7で実装予定。
- 道後温泉クエスト完全進行、湯の星取得、松山城解放フラグ付与はP6で実装予定。
- BattleScreen本体と複数敵戦闘はP5で実装予定。
- `star_icon_unlocked.png` と `star_map_panel_frame.png` の透過細部調整はユーザー指示により後回し。画像生成済みRuntime Assetとしては配置済み。
- ヘッドレスブラウザによる自動遷移確認はユーザー指示によりスキップ。typecheck、lint、buildは成功済み。

## 2026-06-05 P4仕上げ: StarMapScreen接続確認・GitHub Pages対応

- P3.5実装とP4 StarMapScreen実装がmain上に存在することを確認。
- `src/core/GameApp.ts` で `StarMapScreen` がimport/registerされていることを確認。
- `ScreenId` に `starMap` が含まれ、`PrologueScreen -> StarMapScreen`、`ExploreScreen -> StarMapScreen`、`StarMapScreen -> ExploreScreen` の遷移実装があることを確認。
- P4必須7アセットが実ファイルとして存在し、`src/data/assets.ts` のAssetManifestと `StarMapScreen` の参照IDが一致することを確認。
- `vite.config.ts` に GitHub Pages用 `base: "/hime-star-journey/"` を追加。
- `src/core/AssetPath.ts` を追加し、AssetLoaderとDOM背景画像が `import.meta.env.BASE_URL` を使ってpublic assetsを解決するように修正。
- `src/styles.css` の固定 `/assets/...` CSS背景をCSS変数経由へ変更し、GitHub Pages配下でもフレーム画像を読めるようにした。
- `.github/workflows/deploy.yml` を追加し、main push時にtypecheck、lint、build、Pages artifact upload、deployを実行する構成にした。
- `dist/index.html` が `/hime-star-journey/assets/...` を参照し、`dist/assets/generated/` にP4必須7アセットが含まれることを確認。

### P4仕上げ 検証結果

| コマンド / 確認 | 結果 | 備考 |
|---|---|---|
| `npm.cmd install` | 成功 | up to date、119 packages、0 vulnerabilities |
| `npm.cmd run typecheck` | 成功 | `tsc -p tsconfig.json --noEmit` |
| `npm.cmd run lint` | 成功 | `eslint .` |
| `npm.cmd run build` | 成功 | Vite build成功、33 modules transformed |
| `npm.cmd run dev -- --host 127.0.0.1 --port 5187 --strictPort` | 成功 | サンドボックス内ではVite config解決が拒否されたため、許可付きで一時起動。`/hime-star-journey/` がHTTP 200 |
| P4必須7アセットHTTP確認 | 成功 | devサーバー上の `/hime-star-journey/assets/generated/...` で7件すべてHTTP 200 |
| dist asset確認 | 成功 | P4必須7アセットが `dist/assets/generated/` に含まれる |
| GitHub Pages公開URL確認 | 成功 | `https://ryotamatsuki.github.io/hime-star-journey/` がHTTP 200 |
| Edge headless/CDP通し確認 | 成功 | Title -> Prologue -> StarMap -> Explore -> H道しるべ -> G debug overlay -> MでStarMap -> 手動セーブ -> つづきからStarMap/Explore再開を確認 |
| Edge headless/CDP GitHub Pages通し確認 | 成功 | 公開URL上で同じ通し遷移、G/H、手動セーブ、つづきから、松山城解放/道後クリア表示を確認 |
| StarMap進行判定確認 | 成功 | 松山城初期ロック、`flags.location_castle_unlocked`、`unlockedLocations.includes("castle")` による解放、`collectedStars.includes("dogo")` による道後クリア済み表示を確認 |

### P4仕上げ 未解決・次フェーズ送り

- 起動時に全AssetManifest画像を読み込むため、headlessではTitleScreen表示まで30秒以上かかることがある。P4.5以降で必要なら初期ロード対象の分割を検討する。

## 2026-06-05 P3.5: 道後温泉探索マップの歩行可能領域の視認性改善

- 状態: 実装完了。
- 対象外指定に従い、BattleScreen本実装、NPC会話、StarMapScreen新規機能、松山城探索、新しい背景画像の全面再生成には入っていない。
- P4仕上げ時のEdge headless/CDP確認で、Title -> Prologue -> StarMap -> Explore -> H道しるべ -> G debug overlay -> MでStarMap の通し動作を確認済み。

### 実装した内容

- `src/data/maps.ts` に `WalkableRect`、`WalkablePolygon` 型を追加し、`MapAreaData` に `walkableRects` / `walkablePolygons` を追加。
- 道後温泉 `D0` に歩行可能な石畳・広場・橋手前・湯けむり通りを示す `walkableRects` 7件を追加。
- `collisionRects` を `dogo_map_base.png` の建物、庭、池、柵、湯釜周辺に合わせて再調整。
- `playerStart` を歩行可能領域内の下側広場へ移動し、開始直後に植え込みへ見える位置へ出ないよう調整。
- `InputManager` に `debugOverlay`（Gキー）と `pathGuide`（Hキー）を追加。
- `ExploreScreen` に開発者用デバッグオーバーレイを追加。
  - Gキーで表示/非表示を切り替え。
  - 赤: `collisionRects`。
  - 緑: `walkableRects`。
  - 青: 将来用 `walkablePolygons`。
  - カメラ座標に追従して描画。
  - 画面左上に `DEV DEBUG ONLY` と用途を明記。
- `ExploreScreen` にプレイヤー用「道しるべ」を追加。
  - HキーまたはDOMボタンで発動。
  - 約2.8秒だけ歩行可能領域をみかん色・金色・星粒子で淡く光らせる。
  - 背景の上、キャラクターの下に描画し、移動や敵接触を妨げない。
- `styles.css` に「道しるべ」ボタンの見た目を追加。

### walkableRects

- `dogo_walk_center_road`: 中央の石畳。
- `dogo_walk_lower_plaza`: 下の広場。
- `dogo_walk_left_lantern_street`: 左の提灯通り。
- `dogo_walk_left_entry`: 左下の入口道。
- `dogo_walk_upper_bridge`: 橋の手前の道。
- `dogo_walk_right_steam_lane`: 右の湯けむり通り。
- `dogo_walk_south_east_lane`: 右下の路地。

### P3.5 検証結果

| コマンド | 結果 | 備考 |
|---|---|---|
| `npm.cmd install` | 成功 | up to date、119 packages、0 vulnerabilities |
| `npm.cmd run typecheck` | 成功 | `tsc -p tsconfig.json --noEmit` |
| `npm.cmd run lint` | 成功 | `eslint .` |
| `npm.cmd run build` | 成功 | Vite build成功、32 modules transformed |
| `npm.cmd run dev -- --host 127.0.0.1 --port 5182 --strictPort` | 起動確認 | コマンドは常駐のためtimeout。ポート5182のListenを確認し、検証用プロセスを停止 |
| Gキー debug overlay | 成功 | P4仕上げのEdge headless/CDP通し確認で、ExploreScreen上のGキー押下を確認済み |
| Hキー 道しるべ | 成功 | P4仕上げのEdge headless/CDP通し確認で、ExploreScreen上のHキー押下を確認済み |

### P3.5 未解決・次フェーズ送り

- `walkableRects` は矩形ベースの初期調整であり、背景画像の石畳輪郭と完全一致はしていない。
- 将来、実際のプレイ感に合わせて `walkablePolygons` 化すると、道の斜め形状により自然に合わせられる。

## 2026-06-06 P4.6: P4生成UIアセットの透過処理・表示品質仕上げ

- 状態: 実装完了。
- 対象外指定に従い、P5 BattleScreen本実装、カード効果、NPC会話追加、新しい星地図機能、松山城探索、道後クエスト完了処理には入っていない。
- `public/assets/generated/ui/star_icon_unlocked.png` と `public/assets/generated/ui/star_map_panel_frame.png` を直接確認し、緑/マゼンタのクロマキー背景が残っていることを確認。
- 元画像を `public/assets/generated/_backup/p4_6/` にバックアップした。
- ローカルのクロマキー除去で、`star_icon_unlocked.png` の緑背景と `star_map_panel_frame.png` のマゼンタ背景を透明化した。
- 両PNGが `Format32bppArgb` になり、四隅alphaが `0,0,0,0` であることを確認した。
- 星地図背景上の合成プレビュー `C:\tmp\p4_6_star_map_preview.png` を作成し、解放済み星アイコンと星地図パネル枠が背景になじむことを確認した。
- `docs/BUGS.md` の `P4-001` を未解決から解決済みに移動した。

### P4.6 対象画像

| ファイル | 処理内容 | 結果 |
|---|---|---|
| `public/assets/generated/ui/star_icon_unlocked.png` | 緑クロマキー背景を透明化、境界をsoft matte化、despill適用 | 解放済み星ノード用の透明PNGとして確認済み |
| `public/assets/generated/ui/star_map_panel_frame.png` | マゼンタクロマキー背景を透明化、境界をsoft matte化、despill適用 | StarMapScreenのDOMパネル背景用の透明PNGとして確認済み |

### P4.6 検証結果

| コマンド / 確認 | 結果 | 備考 |
|---|---|---|
| `star_icon_unlocked.png` 透過処理 | 成功 | key color `#02f805`、透明ピクセル 1188070、半透明ピクセル 2870 |
| `star_map_panel_frame.png` 透過処理 | 成功 | key color `#fd03fa`、透明ピクセル 554672、半透明ピクセル 6988 |
| アルファ確認 | 成功 | 2件とも `Format32bppArgb`、四隅alpha `0,0,0,0` |
| StarMapScreen相当の合成プレビュー | 成功 | `C:\tmp\p4_6_star_map_preview.png` で背景なじみを確認 |
| `npm.cmd run typecheck` | 成功 | `tsc -p tsconfig.json --noEmit` |
| `npm.cmd run lint` | 成功 | `eslint .` |
| `npm.cmd run build` | 成功 | Vite build成功、38 modules transformed |
| `npm.cmd run dev -- --host 127.0.0.1 --port 5206 --strictPort` | 成功 | `/hime-star-journey/` がHTTP 200 |

### P4.6 未解決・次フェーズ送り

- P4.6対象2画像の透過残りは今回解消済み。
- StarMapScreenの新規機能追加やP5 BattleScreen本実装は未着手。次フェーズで実装する。

## 2026-06-07 P5: 複数敵対応BattleScreen・カードバトル本実装

- 状態: 実装完了。
- 添付テキストは文字化けしており、内容もこのリポジトリのP5ではなく別ゲームの指示に見えたため、P5はリポジトリ内の `MVP詳細GDD.md`、`MVP実装仕様書.md`、既存 `BattleStartParams` / `EncounterData` に従って実装した。
- `src/data/enemies.ts` を追加し、道後温泉敵、松山城敵、カゲマサのBattleActor生成用ステータスとasset IDを定義した。
- `src/data/cards.ts` を追加し、カード6種の対象、MPコスト、攻撃、回復、防御、星封じ効果を定義した。
- `src/systems/BattleSystem.ts` を追加し、`partyMembers: BattleActor[]` と `enemies: BattleActor[]` を使うBattleState生成、カード解決、敵ターン、勝利/敗北判定を実装した。
- `src/screens/BattleScreen.ts` を仮勝利画面から本実装へ差し替えた。
- `src/data/encounters.ts` を更新し、道後温泉6件、松山城8件、ボス1件のEncounterDataを日本語名で整理した。複数敵エンカウントは `enc_dogo_mouse_pair_01`、`enc_castle_soldier_pair_01`、`enc_castle_crow_soldier_01` を定義済み。
- `src/data/enemySymbols.ts` の道後温泉敵シンボルラベルを日本語へ整理した。
- `src/core/SaveManager.ts` の初期カードをP5の道後温泉戦闘で使う4枚に更新した。
- `src/styles.css` にBattleScreenのカード手札、ターゲット選択、メッセージ、終了ボタンのDOM UIを追加した。

### P5でできるようになったこと

- 敵シンボル接触時に `encounterId` からBattleStateを生成する。
- ひめは `partyMembers` 配列、敵は `enemies` 配列で管理する。
- 敵1体の戦闘と敵2体の戦闘を同じBattleSystemで扱う。
- 攻撃カードで敵が2体いる場合、ターゲット選択UIを表示する。
- 敵1体だけをしずめた場合、残りの敵との戦闘が続く。
- 敵全員をしずめると勝利になる。
- 勝利時に `defeatedEnemyIds`、敵シンボルの `defeatedFlag`、必要な `openedPathFlag` を保存し、ExploreScreenへ戻る。
- ひめのHPが0になると敗北扱いになり、撃破保存せず探索地点へ戻る。
- 回復カード、防御カード、星封じカードの効果を実装した。
- カゲマサ用の封印ゲージをBattleStateに保持し、星封じ/白鷺のおふだで削れる。

### P5 検証結果

| コマンド / 確認 | 結果 | 備考 |
|---|---|---|
| `npm.cmd install` | 成功 | up to date、119 packages、0 vulnerabilities |
| `npm.cmd run typecheck` | 成功 | `tsc -p tsconfig.json --noEmit` |
| `npm.cmd run lint` | 成功 | `eslint .` |
| `npm.cmd run build` | 成功 | Vite build成功、42 modules transformed |
| `npm.cmd run dev -- --host 127.0.0.1 --port 5211` | 成功 | `/hime-star-journey/` がHTTP 200。確認後、一時Viteプロセスを停止 |
| Browserプラグイン確認 | 失敗 | `windows sandbox failed: spawn setup refresh` により接続不可。既知のENV-002として継続 |

### P5 未解決・次フェーズ送り

- BattleScreen本体は実装済みだが、Browserプラグインでの実操作確認は環境問題により未完了。
- 松山城探索マップ、松山城敵シンボル配置、カゲマサ戦への本導線はP7以降で接続する。
- 道後温泉クエスト完了処理、湯の星取得、カード/星/手帳の進行解放はP6で実装する。
- カードアイコン、ひめバトルスプライト、松山城敵画像は既存generated/pending画像を使用し、完成品質化は後続で調整する。

## 2026-06-07 P5.1: 戦闘専用背景＋戦闘画面レイアウト改善

- 状態: 実装完了。
- 参照画像そのものに近かった `public/assets/generated/backgrounds/dogo_battle_bg.png` を、UI・文字・キャラクター・敵を含まない道後温泉通常戦闘専用背景として画像生成し直した。
- 旧背景は `public/assets/generated/_backup/p5_1/dogo_battle_bg_before_p5_1.png` に退避した。
- 生成プロンプトを `docs/asset-prompts/runtime-assets/dogo_battle_bg.prompt.md` に保存した。
- `src/screens/BattleScreen.ts` を更新し、ひめを左下、敵1体を右中央、敵2体を右側の上下ずらし配置に調整した。
- 敵名とHPバー、ひめのHP/MP、ターン/フェーズ表示、ターゲット選択中の番号付きハイライトを読みやすくした。
- DOM/CSSのカードUIを下部中央に広く配置し、カード名、説明、MPコストを実テキストとして表示するよう改善した。
- P5実装時に残っていたカード名、敵名、エンカウント名、戦闘ログ、敵シンボルラベル、初期あらすじの文字化けを修正した。
- `src/data/assets.ts` の `bg_dogo_battle` 説明をP5.1生成背景として更新した。
- BattleSystemの計算ロジックは維持し、表示と文言の改善に限定した。

### P5.1 検証結果

| コマンド / 確認 | 結果 | 備考 |
|---|---|---|
| `dogo_battle_bg.png` 生成 | 成功 | 1672x941、16:9相当。UI・文字・キャラ・敵を含まない戦闘専用背景 |
| `npm.cmd install` | 成功 | up to date、119 packages、0 vulnerabilities |
| `npm.cmd run typecheck` | 成功 | `tsc -p tsconfig.json --noEmit` |
| `npm.cmd run lint` | 成功 | `eslint .` |
| `npm.cmd run build` | 成功 | Vite build成功、42 modules transformed |
| `npm.cmd run dev -- --host 127.0.0.1 --port 5221` | 成功 | `/hime-star-journey/` がHTTP 200。サンドボックス内起動はENV-005に該当したため、サンドボックス外で補助確認 |
| Browserプラグイン確認 | 失敗 | `windows sandbox failed: spawn setup refresh` により接続不可。既知のENV-002として継続 |

### P5.1 未解決・次フェーズ送り

- BrowserプラグインでのBattleScreen実操作確認は環境問題により未完了。
- カードアイコンは既存の簡易生成/仮画像を使用し、完成品質カードアイコン制作は後続で調整する。
- `hime_battle_sheet` は品質が低いためP5.1では使用せず、BattleScreenでは手描き品質の高い `hime_idle` を継続利用する。完成品質バトルスプライトは後続で制作する。

## 2026-06-03 起動用bat追加

- `start_game.bat` を追加し、Windowsからダブルクリックまたは `cmd` でゲーム開発サーバーを起動できるようにした。
- PowerShellのExecution Policyに影響されにくいよう、bat内では `npm.cmd` を直接呼び出す。
- `node_modules/` が存在しない場合のみ `npm.cmd install` を実行し、その後 `npm.cmd run dev -- --port 5173` で起動する。

### 起動用bat 検証結果

| コマンド | 結果 | 備考 |
|---|---|---|
| `npm.cmd install` | 未実行 | `node_modules/` が存在し、今回変更はbatと進捗記録のみのため |
| `npm.cmd run typecheck` | 成功 | `tsc -p tsconfig.json --noEmit` |
| `npm.cmd run lint` | 成功 | `eslint .` |
| `npm.cmd run build` | 成功 | Vite build成功、32 modules transformed |
| `cmd.exe /d /c start_game.bat` | 成功 | サンドボックス外で短時間起動し、`http://127.0.0.1:5173` のHTTP 200を確認。検証後に停止 |








# BUILD_CHECKLIST

## P0 ドキュメント基盤

- [x] READMEが現在フェーズとMVP範囲を説明している。
- [x] AGENTSが技術制約と作業ルールを説明している。
- [x] 企画書が作品概要と成功条件を説明している。
- [x] MVP詳細GDDが画面、エリア、敵、カード、プレイ観点を説明している。
- [x] MVP要件定義書が含めるもの／含めないものを説明している。
- [x] MVP実装仕様書が主要データ型と戦闘設計を説明している。
- [x] ROADMAP、TASKS、PROGRESSが整備されている。
- [x] ASSET_TRACKERとasset-promptsが整備されている。
- [x] 参照画像READMEとmanifestが整備されている。

## P1 基盤

- [x] `npm install` が通る。
- [x] `npm run dev` が通る。補足: このPowerShell環境では `npm.cmd run dev -- --port 5173` で確認。
- [x] `npm run build` が通る。補足: `npm.cmd run build` で確認。
- [x] `npm run typecheck` が通る。補足: `npm.cmd run typecheck` で確認。
- [x] `npm run lint` が通る。補足: `npm.cmd run lint` で確認。
- [x] タイトル画面が表示される。補足: Edge headless screenshotで確認。
- [x] 新規開始で初期セーブが作られる。補足: Edge CDPで確認。
- [x] つづきからが有効になる。補足: Edge CDPで確認。

## P2 トップページ用手描き風アセット生成・表示実装＋2.5Dアニメーション基盤

- [x] `title_bg.png` が画像生成により作成されている。
- [x] `hime_idle.png` が画像生成により作成されている。
- [x] `shiro_idle.png` が画像生成により作成されている。
- [x] `title_menu_frame.png` が画像生成により作成されている。
- [x] `title_star_particles.png` が画像生成により作成されている。
- [x] 必須5アセットの生成プロンプトが `docs/asset-prompts/runtime-assets/` に保存されている。
- [x] 必須5アセットがdevサーバー経由でHTTP 200を返す。
- [x] 優先度A Runtime Assetsが `public/assets/generated/` に配置されている。
- [x] 優先度A Runtime Assetsの生成プロンプトが `docs/asset-prompts/runtime-assets/` に保存されている。
- [x] 優先度B、仮シート、エフェクトのpending仮PNGが配置されている。
- [x] AssetLoaderがAssetManifestを一括読み込みできる。
- [x] AssetLoaderが失敗しても起動を止めない。
- [x] AssetLoaderが `getImage`、`getFailedAssetIds`、`getLoadingProgress` を提供している。
- [x] AssetLoaderが `getRequiredFailedAssetIds` を提供している。
- [x] TitleScreenが生成 `title_bg` をCanvas背景として表示する。
- [x] TitleScreenに生成 `hime_idle` が表示される。
- [x] TitleScreenでひめがidleアニメーションする。
- [x] TitleScreenに生成 `shiro_idle` が表示される。
- [x] TitleScreenでシロが浮遊アニメーションする。
- [x] TitleScreenが生成 `title_menu_frame` をメニュー枠に使う。
- [x] TitleScreenが生成 `title_star_particles` を星きらめきに使う。
- [x] TitleScreenのメニューUIが手描き絵本風に調整されている。
- [x] TitleScreenの「はじめから」「つづきから」DOM UIを維持している。
- [x] セーブなしでは「つづきから」が無効表示になる。補足: Edge CDPで確認。
- [x] 「はじめから」でSaveDataがlocalStorageに保存される。補足: Edge CDPで確認。
- [x] リロード後「つづきから」が有効になる。補足: Edge CDPで確認。
- [x] 「つづきから」でPrologueScreenへ遷移する。補足: Edge CDPで確認。
- [x] SpriteAnimatorが1フレームclip、loop/non-loop、flip、scale、opacityに対応している。
- [x] AnimationRegistryがひめ、シロ、通常敵、カゲマサの仮定義を持つ。
- [x] RenderDepthSystemの `sortByDepth` が安定ソートでY座標順に並べる。
- [x] 楕円影描画ユーティリティがある。
- [x] fade、blink、knockback、floating、particle、star hit、heal mist、seal lightのCanvasエフェクト基盤がある。
- [x] ScreenShakeの基本動作が実装されている。
- [x] `npm install` が通る。補足: `npm.cmd install` で確認。
- [x] `npm run typecheck` が通る。補足: `npm.cmd run typecheck` で確認。
- [x] `npm run lint` が通る。補足: `npm.cmd run lint` で確認。
- [x] `npm run build` が通る。補足: `npm.cmd run build` で確認。
- [x] `npm run dev` がHTTP応答する。補足: `http://127.0.0.1:5173` がHTTP 200。
- [x] ブラウザ操作による「はじめから」「つづきから」localStorageフローの自動確認。補足: Browserプラグインは環境エラー、Edge CDPで確認。

## P3 道後温泉ExploreScreen

- [x] 道後温泉探索用アセットが存在する。補足: 背景、ひめ、シロ、道後敵、会話枠、クエスト枠を確認。
- [x] 不足画像があっても代替表示で動く。補足: 敵とクエスト枠はpending仮PNG、描画側にもCanvas fallbackあり。
- [x] ExploreScreenが登録され、PrologueScreenから遷移できる。
- [x] ExploreScreenが `bg_dogo_explore` を表示できる。
- [x] ひめがWASD / 矢印キーで移動できる。
- [x] シロがひめをふわふわ追従する。
- [x] CollisionSystemがAABB、bounds clamp、obstacle判定を持つ。
- [x] PlayerのX/Y分割移動でcollisionRectsに衝突する。
- [x] 敵シンボルが複数表示される。
- [x] 敵シンボルが `encounterId` を持つ。
- [x] 敵接触で仮BattleScreenへ遷移する。
- [x] BattleStartParamsに `enemySymbolId` と `encounterId` が含まれる。
- [x] 仮勝利後、`defeatedEnemyIds` に保存される。補足: Edge CDPで `D-E05` 保存確認。
- [x] ExploreScreenに戻ると撃破済み敵が生成対象から外れる。
- [x] リロード後、「つづきから」が有効になる。補足: Edge CDPで確認。
- [x] リロード後も `defeatedEnemyIds` が保持される。補足: Edge CDPで確認。
- [x] Interactableが3つ配置されている。
- [x] Enter / Spaceで調べる処理がある。
- [x] `npm install` が通る。補足: `npm.cmd install` で確認。
- [x] `npm run typecheck` が通る。補足: `npm.cmd run typecheck` で確認。
- [x] `npm run lint` が通る。補足: `npm.cmd run lint` で確認。
- [x] `npm run build` が通る。補足: `npm.cmd run build` で確認。
- [x] `npm run dev` がHTTP応答する。補足: Vite起動後 `http://127.0.0.1:5173` がHTTP 200。
- [x] タイトル画面が表示される。補足: Edge headless screenshotで確認。
- [x] 道後温泉ExploreScreenが表示される。補足: Edge CDP screenshotで確認。
- [ ] Browserプラグインでの操作確認。補足: P3でも環境エラーで未完了。

## 探索

- [x] ひめが上下左右に歩く。
- [x] 歩行アニメーションが出る。
- [x] シロが追従する。
- [x] 敵シンボルが表示される。
- [x] 敵接触でバトルへ入る。
- [x] 一度しずめた敵が復活しない。

## P3 方針変更: 道後温泉2.5D探索マップ

- [x] `public/assets/generated/backgrounds/dogo_map_base.png` が存在する。
- [x] `public/assets/generated/backgrounds/dogo_map_foreground.png` が存在する。
- [x] `public/assets/generated/backgrounds/dogo_map_overlay_steam.png` が存在する。
- [x] `public/assets/generated/characters/hime_walk_sheet.png` が存在する。
- [x] `public/assets/generated/characters/shiro_fly_sheet.png` が存在する。
- [x] `public/assets/generated/enemies/dogo_oni.png` が存在する。
- [x] `public/assets/generated/enemies/dogo_lantern.png` が存在する。
- [x] `public/assets/generated/enemies/dogo_armor.png` が存在する。
- [x] `public/assets/generated/enemies/dogo_mouse.png` が存在する。
- [x] `public/assets/generated/ui/quest_panel_frame.png` が存在する。
- [x] P3必須10アセットがdevサーバーでHTTP 200を返す。
- [x] ExploreScreenに道後温泉ベースマップが表示される。
- [x] 前景レイヤーが表示される。
- [x] 湯けむりオーバーレイが表示される。
- [x] ひめが上下左右に移動できる。
- [x] ひめの歩行シートが方向別に切り替わる。
- [x] シロがひめを追従する。
- [x] 敵シンボルが表示される。
- [x] 敵シンボルが簡易アニメーションする。
- [x] 敵シンボル接触を検出できる。
- [x] 接触時に `enemySymbolId` / `encounterId` を取得できる。
- [x] カメラがひめを追従する。
- [x] カメラがマップ外に出ない。
- [x] `collisionRects` が機能する。
- [x] Y座標順描画が使われている。
- [x] 楕円影が表示される。
- [x] StatusPanel、QuestPanel、MiniMapが表示される。
- [x] `npm.cmd install` が通る。
- [x] `npm.cmd run typecheck` が通る。
- [x] `npm.cmd run lint` が通る。
- [x] `npm.cmd run build` が通る。
- [x] `npm.cmd run dev -- --host 127.0.0.1 --port 5173` がHTTP 200を返す。
- [x] Edge headless/CDPでTitleScreenからPrologue経由でExploreScreenへ進める。
- [x] Edge headless/CDPで右方向移動後のExploreScreenスクリーンショットを確認した。

## P4 星地図画面の画像生成・StarMapScreen本実装

- [x] `public/assets/generated/backgrounds/star_map_bg.png` が画像生成により作成されている。
- [x] `public/assets/generated/ui/star_icon_locked.png` が画像生成により作成されている。
- [x] `public/assets/generated/ui/star_icon_unlocked.png` が画像生成により作成されている。
- [x] `public/assets/generated/ui/star_icon_cleared.png` が画像生成により作成されている。
- [x] `public/assets/generated/ui/star_map_panel_frame.png` が画像生成により作成されている。
- [x] `public/assets/generated/ui/location_badge_dogo.png` が画像生成により作成されている。
- [x] `public/assets/generated/ui/location_badge_castle.png` が画像生成により作成されている。
- [x] P4必須7アセットの生成プロンプトが `docs/asset-prompts/runtime-assets/` に保存されている。
- [x] `src/data/assets.ts` に `bg_star_map`、星アイコン3種、星地図パネル、道後/松山城バッジのAsset IDが登録されている。
- [x] `src/data/starMap.ts` に道後温泉、松山城、未解放3エリア以上のノードが定義されている。
- [x] `src/systems/TravelSystem.ts` がSaveDataからノード状態と選択可否を判定できる。
- [x] StarMapScreenに星地図背景が表示される実装がある。
- [x] 道後温泉ノードが表示される実装がある。
- [x] 松山城ノードが表示される実装がある。
- [x] 未解放ノードが3つ以上表示される実装がある。
- [x] 道後温泉ノードを選択できる実装がある。
- [x] 道後温泉ノードからExploreScreenへ遷移できる実装がある。
- [x] 松山城ノードは初期状態でロックされる。
- [x] `location_castle_unlocked=true` のとき松山城ノードが解放表示になる。
- [x] 手動セーブボタンがある。
- [x] ExploreScreenからMキーまたはUIでStarMapScreenへ遷移できる。
- [x] 星ノードに点滅、浮遊、発光、選択時拡大の簡易アニメーションがある。
- [x] `npm.cmd install` が通る。
- [x] `npm.cmd run typecheck` が通る。
- [x] `npm.cmd run lint` が通る。
- [x] `npm.cmd run build` が通る。
- [ ] `npm.cmd run dev` とブラウザ自動遷移確認。補足: ユーザー指示により今回スキップ。

## 星地図

- [x] 道後温泉が解放済み。
- [x] 松山城が初期未解放。
- [x] 道後クリア後に松山城が解放される。
- [x] 未解放星が表示される。

## バトル

- [ ] 1対1が動く。
- [ ] 1対2が動く。
- [ ] ターゲット選択UIが動く。
- [ ] 敵1体を倒しても残りの敵と戦闘が続く。
- [ ] 敵全員撃破で勝利になる。
- [ ] カード効果が機能する。
- [ ] 星封じが動く。

## MVP通し

- [ ] プロローグ。
- [ ] 道後温泉。
- [ ] 湯の星。
- [ ] 星地図。
- [ ] 松山城。
- [ ] カゲマサ戦。
- [ ] EndingScreen。








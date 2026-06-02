# DECISIONS

## 2026-06-01

### ゲームエンジン不使用

Unity、Godot、Unreal、Phaser、PixiJS、Kaboom.jsなどのゲームエンジン／ゲームフレームワークは使わない。TypeScript、Vite、Canvas 2D API、DOM UI、CSS、localStorageで実装する。

### MVPの味方はひめ1人

MVPでは味方はひめ1人。ただし内部データは `partyMembers: BattleActor[]` とし、将来の味方追加に備える。

### MVP段階から複数敵を実装

敵側はMVPから1体または2体を扱う。1対3以上はMVPでは実装しない。

### 敵シンボルはEncounterDataを参照

敵シンボルは `enemyId` ではなく `encounterId` を持つ。`EncounterData` が1体または2体の敵構成を持つ。

## 2026-06-02

### P0ではアプリ本体を実装しない

P0はリポジトリ初期化、仕様、進捗管理、アセット管理、プロンプト整理のフェーズとする。`package.json`、Vite、TypeScript設定、Canvas実装はP1で追加する。

### ローカルGit初期化までをP0対象にする

この作業環境には `.git` がなかったため、ローカルGitリポジトリを `phase0-repository-foundation` ブランチ名で初期化した。GitHubリモート作成、コミット、PR作成は所有者アカウントと公開先判断が必要なため未実行とする。

### Git safe.directoryを設定する

ローカルGit初期化後、サンドボックス由来の所有者差分により `git status` がdubious ownershipで停止した。P0検証のため、この作業ディレクトリをGitの `safe.directory` に追加した。

### MarkdownはUTF-8 BOM付きにする

Windows PowerShellの通常 `Get-Content` でも日本語文書を読めるように、Markdown文書はUTF-8 BOM付きで保存する。JSONはパーサ互換性を優先し、BOMなしUTF-8のままにする。

### 文字化け文書を再作成する

P0文書群が文字化けしていたため、既存の意図を保ちながらUTF-8の日本語Markdownとして再作成した。

### P1基盤ではViteと直接Canvas/DOMだけを使う

ゲームエンジン、ゲームフレームワーク、描画フレームワークは追加しない。P1ではVite、TypeScript、Canvas 2D API、DOM UI、CSS、localStorageだけでタイトル画面と仮プロローグを構成する。

### npm script検証はWindowsではnpm.cmdを使う

このPowerShell環境では `npm run ...` が `npm.ps1` のExecution Policyで止まる場合がある。プロジェクトのscript自体は通常のnpm scriptとして定義し、検証はWindows互換の `npm.cmd run ...` で行う。

### TitleScreenとPrologueScreenだけを登録する

P1の対象外である探索、星地図、バトル、手帳、エンディング画面は登録しない。保存された `currentScreenId` が未登録画面を指す場合は、P1では仮の `prologue` へフォールバックする。

### アセット読み込み失敗は描画停止にしない

AssetLoaderは画像読み込みに失敗してもPromise全体をrejectせず、失敗状態として記録する。描画側は `drawImageOrFallback` で代替図形を表示する。

### P2では画像生成を優先度Aに集中する

画像生成機能は利用できた。P2では不足していた優先度Aの `hime_idle`、`shiro_idle`、`boss_kagemasa`、`ui_card_frame` を画像生成し、既存の背景6枚、会話フレーム、手帳フレームと合わせてRuntime Assetとして配置する。優先度Bの敵、カード、星アイコン、仮スプライトシート、エフェクトはP2の範囲では完成品質の生成対象にせず、個別PNGプレースホルダーで準備する。

### キービジュアルはRuntime Assetとして直接使わない

`docs/visual-reference/key-visuals/` の8枚は構図、色、UI密度の参照に留める。Runtime Assetは `public/assets/generated/` に別ファイルとして配置し、参照画像は上書きしない。

### 実画像がない場合はAssetManifest fallbackとCanvas描画で代替する

不足・読み込み失敗アセットは、AssetManifestの `fallbackAssetId` で共通プレースホルダーへ戻す。描画箇所では `drawImageOrFallback` とCanvas図形を使い、画像失敗でゲーム進行を止めない。

### SpriteAnimatorは秒単位deltaTimeを受け取る

GameLoopが秒単位の `deltaTime` を渡すため、SpriteAnimatorも秒単位を受け取り内部でミリ秒へ変換する。clipは1フレームでも動作し、non-loop clipは `nextClipId`、再生時指定、または `defaultClipId` へ戻れる設計にする。

### P2では探索・バトル本体に入らない

P2はAssetLoader、AssetManifest、SpriteAnimator、AnimationRegistry、Y座標奥行き描画、楕円影、簡易エフェクト、ScreenShake、TitleScreen背景接続までに限定する。ExploreScreen、BattleScreen、StarMapScreen、NotebookScreen、クエスト本体、敵・カード効果本体はP3以降で実装する。

### P2の動作検証もnpm.cmdを使う

PowerShellのExecution Policyにより `npm run ...` が止まる可能性があるため、P2検証はP1と同じく `npm.cmd install`、`npm.cmd run typecheck`、`npm.cmd run lint`、`npm.cmd run build`、`npm.cmd run dev` で行う。

### P3の道後温泉仮マップはTypeScriptデータで実装する

フェーズ3ではタイルマップエディタや外部マップ形式を導入しない。`src/data/maps.ts` に `MapAreaData` と矩形collisionを直接定義し、P3の目的である「歩ける探索画面」の実装速度とレビュー容易性を優先する。

### P3ではタイルマップエディタを使わない

MVP初期は固定背景と矩形障害物で十分に探索導線を検証できるため、Tiledなどのマップエディタ、タイルマップローダー、専用ランタイムは導入しない。後続で必要になった場合も、まずTypeScriptデータから移行できる構造に留める。

### P3では仮BattleScreenを導入する

EnemySymbol接触から戦闘へ入る入口と、勝利後に `defeatedEnemyIds` を保存して探索へ戻る流れを先に確定する。本格BattleSystem、カード効果、HP処理はフェーズ5以降に実装する。

### P3の道後探索アセットは既存generatedとpending仮PNGを使う

`dogo_explore_bg`、`hime_idle`、`shiro_idle`、`ui_dialogue_frame` は既存generatedを使用する。`dogo_oni`、`dogo_lantern`、`dogo_mouse`、`ui_quest_panel_frame` はP2で配置したpending仮PNGを使用する。必要ファイルは全て存在したため、P3では追加画像生成を行わない。

### P3の自動ブラウザ確認はEdge headless/CDPを補助的に使う

BrowserプラグインはP3でもnode_repl kernelが環境エラーで停止したため、Edge headlessとDevTools Protocolで補助確認した。タイトル表示、スクリーンショット取得、localStorageの `dogo/D0/explore` 保存、仮勝利後の `defeatedEnemyIds` 保存、リロード後の「つづきから」有効化を確認した。

### P2方針変更ではTitleScreen用画像生成を必須にする

前回P2では、画像生成できない場合にCanvas/CSS/汎用プレースホルダーで代替して完了扱いにできる余地を残していた。今回のP2方針変更では、TitleScreenで実際に使う `title_bg`、`hime_idle`、`shiro_idle`、`title_menu_frame`、`title_star_particles` を画像生成必須とし、これら5件はプレースホルダー代替だけでは完了扱いにしない。

### P2方針変更で生成したTitleScreen用アセットの保存先

生成した必須アセットは `public/assets/generated/backgrounds/title_bg.png`、`public/assets/generated/characters/hime_idle.png`、`public/assets/generated/characters/shiro_idle.png`、`public/assets/generated/ui/title_menu_frame.png`、`public/assets/generated/effects/title_star_particles.png` に配置する。プロンプトは `docs/asset-prompts/runtime-assets/` 配下の対応する `.prompt.md` に保存する。

### 透過が必要なTitleScreen用アセットはクロマキーから透過PNG化する

ひめ、シロ、メニュー枠、星粒子は生成画像をそのまま矩形背景付きで使わず、単色クロマキー背景で生成し、ローカルの透過処理でPNG化してRuntime Assetにする。背景は16:9の通常PNGとして生成する。

### SpriteAnimatorはTitleScreenでも1フレームclipを実際に使う

TitleScreenの `hime_idle` と `shiro_idle` は完成スプライトシートではなく単体PNGだが、画像の自然サイズから1フレームAnimationSetを作り、SpriteAnimator経由で描画する。呼吸感や浮遊感はCanvas変換と `floatingMotion` を重ねて表現し、後続フェーズのスプライトシート差し替えを妨げない。

### キービジュアルは参照に留めRuntime Assetを分離する

`docs/visual-reference/key-visuals/` の画像は構図、色、UI密度、キャラクター見え方の参照に留める。Runtime Assetは `public/assets/generated/` に分離し、キービジュアルは上書きしない。

### P2方針変更でも探索・バトル本体には入らない

今回のP2修正対象はTitleScreenの手描き風表示実装、AssetLoader接続、SpriteAnimator/Effects/RenderDepthSystem/ScreenShake等の基盤に限定する。ExploreScreenやBattleScreenの本体はP3/P5以降の範囲であり、既存P3実装は維持するがP2修正で拡張しない。

### P3方針変更では単一背景ではなく2.5D探索マップ構成にする

旧P3の `dogo_explore_bg.png` 1枚背景前提では、ひめが2.5D空間を歩いている構造が弱くなるため、P3方針変更では `dogo_map_base`、`dogo_map_foreground`、`dogo_map_overlay_steam` の3レイヤー構成へ変更する。baseは地形、foregroundはキャラクター手前に重なる軒・枝・橋・湯けむり、overlayはCanvas上で透明度とドリフトを付ける湯けむり/光として扱う。

### P3方針変更でも画像生成を必須にする

道後温泉探索用の必須10アセットは画像生成で作成し、Canvas図形・CSS・単色矩形・汎用プレースホルダーのみでは完了扱いにしない。画像生成できなかった場合はP3未完了として記録する方針だが、今回はすべて生成・配置・HTTP 200確認まで成功した。

### P3生成アセットの保存先

生成した道後温泉探索用Runtime Assetは `public/assets/generated/backgrounds/`、`public/assets/generated/characters/`、`public/assets/generated/enemies/`、`public/assets/generated/ui/` に用途別に保存する。生成プロンプトは `docs/asset-prompts/runtime-assets/` の対応ファイルに保存する。`docs/visual-reference/key-visuals/` は参照資料として保持し、上書きしない。

### hime_walk_sheetの形式

`hime_walk_sheet.png` は4方向x4フレーム相当の単一PNGとして扱う。Player側では画像の `naturalWidth / 4`、`naturalHeight / 4` でセルを切り、row 0をdown、row 1をleft、row 2をright、row 3をupとして描画する。完成品質の細部調整は後続で同じ形式の画像差し替えで対応する。

### shiro_fly_sheetの形式

`shiro_fly_sheet.png` は横4フレーム相当の単一PNGとして扱う。Companion側では `naturalWidth / 4` をセル幅にして、フレーム更新とsin波の浮遊を重ねる。後続で案内状態や演出フレームを追加する場合も、この構成を拡張する。

### カメラ追従の実装方針

`src/core/Camera.ts` を追加し、ワールド座標とスクリーン座標の変換、ひめ中心の追従、マップ端でのクランプを集約する。Canvas表示は1280x720を基本とし、道後温泉マップは1920x1080のworldとして管理する。

### collisionRectsの初期設定方針

P3ではタイルマップやピクセル完全一致の通行判定を導入せず、TypeScriptデータ上の矩形collisionで建物、柵、橋の外側、湯釜、路地通行止め、境界を表現する。衝突はX/Y軸別移動で処理し、壁に引っかかりにくい構造を維持する。

### 敵シンボルの簡易アニメーション方針

EnemySymbolは `encounterId` を持つシンボルとして扱い、敵種ごとに描画オフセットを変える。湯どろぼう鬼は左右wander、あお提灯はblinkとfloating、ゆげネズミはscurry、さびよろいはshakeを使う。接触判定は基準座標のcolliderに残し、アニメーション表示とバトル入口を分離する。

### BattleScreen本体は後続フェーズに回す

P3では敵接触時に `enemySymbolId` / `encounterId` を取得し、既存の仮BattleScreenへ渡せる入口までを対象にする。本格BattleSystem、複数敵バトル処理、カード効果、HP処理はP5以降に実装する。

### TitleScreenからExploreScreenへの遷移方法

フェーズ2のTitleScreenは維持し、「はじめから」で初期セーブを作成してPrologueScreenへ進む。PrologueScreenの「道後温泉へ進む」からExploreScreenへ遷移する。TitleScreenからの直接デバッグボタンは追加しない。








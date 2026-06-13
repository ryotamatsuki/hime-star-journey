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

## 2026-06-03

### P4でも画像生成を必須としプレースホルダー代替で完了扱いにしない

StarMapScreenで使用する `star_map_bg`、星アイコン3種、星地図パネル、道後/松山城バッジは画像生成必須とする。Canvas図形、CSS、単色矩形、汎用プレースホルダー、既存pending画像だけではP4完了扱いにしない。

### P4は画像生成不可のため停止する

このセッションでは組み込み `image_gen` ツールが利用可能ツールとして公開されていなかった。`imagegen` CLIフォールバックは存在するが、`OPENAI_API_KEY` が未設定だったため画像生成を実行できない。ユーザー指定の停止条件に従い、StarMapScreen実装、TravelSystem実装、AssetManifest更新、画面遷移更新には進まず、P4未完了として記録する。

### 既存の星地図関連画像はP4必須生成の代替にしない

`public/assets/generated/backgrounds/star_map_bg.png` と星アイコン3種の旧ファイルは存在するが、今回のP4必須画像生成を実行できていないため、P4完了条件の充足には使わない。画像生成機能が復旧したら、P4要件に沿って再生成し、保存プロンプトとHTTP読み込み確認を行う。

### P4再実行では画像生成必須方針を維持して実装へ進む

前回は画像生成不可で停止したが、今回の再実行では組み込み画像生成ツールを利用できた。Canvas図形、CSS、単色矩形、汎用プレースホルダーで代替完了する方針には戻さず、P4必須7アセットを生成した後にStarMapScreen実装へ進む。

### P4生成アセットの保存先

P4必須アセットは用途別に `public/assets/generated/backgrounds/star_map_bg.png`、`public/assets/generated/ui/star_icon_locked.png`、`public/assets/generated/ui/star_icon_unlocked.png`、`public/assets/generated/ui/star_icon_cleared.png`、`public/assets/generated/ui/star_map_panel_frame.png`、`public/assets/generated/ui/location_badge_dogo.png`、`public/assets/generated/ui/location_badge_castle.png` に保存する。生成プロンプトは `docs/asset-prompts/runtime-assets/` 配下に保存する。

### StarMapScreenのノード配置方針

StarMapScreenは1280x720のCanvas座標でノードを配置する。道後温泉を中央左寄り、松山城をその上側、しまなみ方面・石鎚方面・南予方面を未解放の将来エリアとして周辺に置き、生成背景上で視認しやすい余白を優先する。

### 松山城の解放判定

松山城ノードは `flags.location_castle_unlocked === true` または `unlockedLocations.includes("castle")` のどちらかで解放表示にする。道後温泉は初期状態で選択可能、`collectedStars.includes("dogo")` または `flags.star_dogo_collected` でクリア済み表示にする。

### Prologue / Explore / StarMap の遷移方針

P4では案Aを採用し、PrologueScreen後にStarMapScreenへ遷移する。道後温泉ノードを選ぶと既存のExploreScreenへ進む。既存の探索導線を壊さないため、ExploreScreenからはMキーとUIボタンでStarMapScreenへ戻れるようにする。

### 開発用の道後クリア扱いボタン

松山城解放判定をP4単体で確認できるよう、StarMapScreenに `import.meta.env.DEV` 限定の「デバッグ：道後クリア扱い」ボタンを追加する。本番ビルドでは表示されない開発用導線として扱う。

### 松山城探索本体は後続フェーズに回す

P4ではStarMapScreen上の松山城解放表示と選択時メッセージまでを実装し、松山城2.5D探索マップ本体、敵配置、クエスト、カゲマサ戦は後続フェーズに回す。

### P4ブラウザ自動遷移確認はユーザー指示でスキップする

ヘッドレスブラウザでの自動遷移確認は実行途中でユーザーからスキップ指示があったため、P4ではtypecheck、lint、build、ファイル配置確認を優先し、ブラウザ自動確認は後続で再開できる状態として記録する。

### P3.5では常時ラインではなく任意の道しるべ表示にする

道後温泉探索画面は手描き絵本風の2.5Dマップを見せる画面なので、常時太い境界線やナビ線を表示すると世界観と探索感を壊す。通常時は背景の石畳、柵、植え込み、影で自然に歩ける道を示し、プレイヤーが迷ったときだけHキーまたは「道しるべ」ボタンで2〜3秒の控えめな光を出す方針にする。

### P3.5のwalkable領域は矩形から始める

`collisionRects` は通れない場所、`walkableRects` は歩ける場所の見える化として分離する。P3.5では調整速度を優先して矩形で定義するが、`walkablePolygons` 型も用意し、将来の斜め道や曲がった石畳に合わせてpolygon化できるようにする。

### P3.5 debug overlayは開発者用に限定する

Gキーのdebug overlayはcollisionとwalkableを調整するための開発表示であり、本番プレイ用の恒常UIにはしない。画面左上に `DEV DEBUG ONLY` を描き、赤をcollision、緑をwalkableとして明示する。

## 2026-06-05

### P3.5では常時ラインではなく任意の道しるべ表示にする

道後温泉探索画面の通常表示では、手描き絵本風の地図を優先し、歩行可能領域を太いラインや常時塗りで表示しない。プレイヤー向けにはHキーまたは「道しるべ」ボタンで2.8秒だけ淡く光る補助表示を出し、必要な時だけ道幅を理解できるようにする。これにより、探索画面の雰囲気を壊さず、小学3年生でも迷いにくい補助を提供する。

### 開発者用debug overlayはGキーで分離する

collisionRectsとwalkableRectsの調整には常時確認できる可視化が必要だが、これは本番プレイ用UIではない。P3.5ではGキーの開発者用debug overlayとして分離し、赤をcollisionRects、緑をwalkableRects、青を将来のwalkablePolygonsに割り当てる。画面内にも `DEV DEBUG ONLY` を表示し、プレイヤー用の道しるべと役割を明確に分ける。

### walkable領域は矩形から始めpolygonへ拡張できる型にする

現在の道後温泉マップは生成画像ベースで、厳密なタイルやナビメッシュは持たない。P3.5ではレビューしやすい `walkableRects` から始め、将来細かい道の形に合わせられるよう `walkablePolygons` 型も `MapAreaData` に含める。

### P3.5では背景画像を再生成しない

今回の目的は既存 `dogo_map_base.png` 上で歩ける場所を理解しやすくし、当たり判定を調整しやすくすることに限定する。新しい背景画像の全面再生成は対象外とし、collisionRects、walkableRects、debug overlay、道しるべ表示で改善する。

### P4仕上げではP3.5をmain反映済みとして扱う

`main` 上で道後温泉ExploreScreenのGキーdebug overlay、Hキー道しるべ、walkableRects、collisionRects、ひめ歩行、シロ追従、敵シンボル表示が実装済みであることを確認した。今回のP4仕上げでは、これらを再設計せず、StarMapScreen接続とGitHub Pages対応の確認・軽微修正に集中する。

### P4仕上げでは既存生成アセットを再生成しない

P4必須7アセットは `public/assets/generated/` に存在し、AssetManifest登録、StarMapScreen参照、devサーバーHTTP 200、build後のdistコピーを確認できた。今回の目的は接続確認であり、新しい画像生成や全面差し替えは行わない。

### GitHub Pagesのbaseはリポジトリ名に合わせる

GitHub Pagesではリポジトリ配下 `/hime-star-journey/` で配信されるため、`vite.config.ts` の `base` を `/hime-star-journey/` に設定する。ローカルdevも同じbaseで確認し、テストURLは `http://127.0.0.1:<port>/hime-star-journey/` を使う。

### publicアセット参照はBASE_URLで解決する

AssetManifestとCSS由来の `/assets/generated/...` 参照は、GitHub Pagesのサブパス配信で壊れないよう `import.meta.env.BASE_URL` を使って解決する。AssetLoaderには `resolvePublicAssetPath` を通し、DOMパネルの背景画像はCSS変数で解決済みURLを渡す。

### GitHub Pages workflowを追加する

`.github/workflows/deploy.yml` が存在しなかったため、`main` pushと手動実行で `npm ci`、`npm run typecheck`、`npm run lint`、`npm run build`、Pages artifact upload、Pages deployを行うworkflowを追加する。GitHub側ではPagesのSourceをGitHub Actionsに設定する前提とする。

### P4仕上げのブラウザ確認はEdge headless/CDPで行う

Browserプラグインは今回も `windows sandbox failed: spawn setup refresh` で利用できなかったため、専用プロファイルのEdge headlessとDevTools Protocolで確認する。P4仕上げではTitle -> Prologue -> StarMap -> Explore -> H道しるべ -> G debug overlay -> MでStarMap -> 手動セーブ -> つづきからStarMap/Explore再開までを確認し、松山城ロック/解放、道後クリア済み表示も同じ経路で確認する。

### P4.5をP5前に挟む

MVPは会話なしの探索ゲームではないため、複数敵対応BattleScreenへ進む前に、ひめとシロの自動会話、NPC会話、調べる対象の短文会話を扱う基盤をP4.5として実装する。P5以降の戦闘・クエストはこのDialogueSystemとSaveData.flagsを使って接続する。

### DialogueSystemは自動イベント会話とNPC会話の2系統にする

自動導入や初回敵ヒントは `triggerType: "auto"`、町の人物との短い会話は `triggerType: "npc"` として分ける。調べる対象は `triggerType: "interactable"` として同じデータ構造に乗せ、後続でクエスト進行へ接続しやすくする。

### 会話UIは画像生成せずDOM/CSSで実装する

会話枠、話者名、本文、次へボタンは画像ではなくDOM/CSSで実装する。日本語テキストを画像化すると修正性・可読性・アクセシビリティが下がるため、会話本文は必ずHTML上の実テキストとして表示する。

### 会話文の見た目はCSS font-familyで制御する

P4.5では外部フォントファイルを追加しない。会話文には `"Yu Gothic", "Yu Gothic UI", "Hiragino Maru Gothic ProN", "Hiragino Sans", "Meiryo", sans-serif` を指定し、読みやすさを優先する。絵本風日本語フォント導入はライセンス確認後の後続判断とする。

### 会話中はプレイヤー移動を停止する

DialogueSystemがactiveの間、ExploreScreenはPlayerの移動更新、敵接触、調べる入力を進めない。会話中でもシロ、敵、NPCの軽いアニメーションとカメラ追従は維持し、会話終了後に探索へ戻す。

### Interactable統合は湯けむりから始める

P4.5では既存Interactableのうち `dogo_steam_spot` を `interactable_steam_hint` としてDialogueSystemに統合した。看板と湯の星の気配は現行の短文message方式を残し、P6道後温泉クエストで必要に応じてDialogueSystemへ移す。

### 初回敵ヒント会話は敵近接時に呼ぶ

`dogo_first_enemy_hint_auto` は初回敵シンボル近接時に発火できる構造としてExploreScreenへ組み込む。発火後は `dialogue_first_enemy_hint_seen` を保存し、繰り返し発火しない。

### NPC近接時のDOM話すボタンを追加する

Enter/Spaceで話す入力は維持するが、ヘッドレス確認とプレイヤーの分かりやすさのため、NPC近接時だけDOMの「話す」ボタンも表示する。これはNPC会話開始の補助UIであり、P4.5以降の大規模機能追加には含めない。

### ポートレートとNPC画像は画像生成必須とする

P4.5では `portrait_hime`、`portrait_shiro`、`npc_dogo_guide`、`npc_yumori_grandma` の4件を画像生成必須とし、Canvas図形や汎用プレースホルダーだけで完了扱いにしない。会話枠画像は不要で、`dialogue_frame` はDOM/CSS実装へ置き換える。

### P4.5ブラウザ確認は一時同一オリジンテストで補助する

Browserプラグインとnode_replは引き続き `windows sandbox failed: spawn setup refresh` で使えなかった。P4.5では一時的な同一オリジンHTMLを使い、Edge headlessで実アプリをiframe操作して、Title -> Prologue -> StarMap -> Explore、初回自動会話、既読flag保存、案内人NPC会話開始を確認した。一時HTMLは確認後に削除した。

## 2026-06-06

### P4.6では既存生成画像を再生成せず透過処理で仕上げる

`star_icon_unlocked.png` と `star_map_panel_frame.png` はP4で生成済みで、絵柄そのものはStarMapScreenの画風に合っていた。今回の問題は緑/マゼンタのクロマキー背景と境界の透過品質に限定されるため、新規画像生成ではなく、元画像をバックアップしたうえでローカルのクロマキー除去、soft matte、despillにより透明PNGへ仕上げる方針にした。

### P4.6ではStarMapScreenの機能追加をしない

今回の目的はP5前の表示品質仕上げであり、星地図ノード、進行判定、遷移、手動セーブなどのP4機能は変更しない。P5 BattleScreen本実装、カード効果、NPC会話追加、松山城探索、道後クエスト完了処理も対象外として維持する。

## 2026-06-07

### P5ではBattleSystemをScreenから分離する

BattleScreenはCanvas描画とDOM UIに集中し、戦闘状態生成、カード効果、敵ターン、勝利/敗北判定は `src/systems/BattleSystem.ts` に分離する。これにより、P6以降のクエスト報酬、P7のカゲマサ戦、P8の手帳連携を追加するときに、画面描画を大きく崩さず戦闘処理だけを拡張できるようにする。

### P5では既存セーブでも道後温泉バトル用スターター4枚を使えるようにする

既存セーブはP1/P3時点の `unlockedCards` を持つ場合があり、カードが2枚だけだとP5の防御・おふだ練習が成立しにくい。P5では `normalizeBattleCardIds()` により、既存セーブでも `みかん星アタック`、`白鷺のおふだ`、`道後の湯しずく`、`湯けむりヴェール` の4枚をBattleScreen上で使えるようにする。`城山のまもり` と `星封じ` は効果本体を実装しつつ、後続フェーズの進行解放に残す。

### P5では敵1体固定のハードコードを避ける

BattleStateは仕様どおり `partyMembers` と `enemies` の配列で管理する。敵1体戦も2体戦も同じ処理で扱い、攻撃カードは敵が複数いる場合だけターゲット選択UIを出す。敵1体だけをしずめた場合も即勝利にせず、`enemies.every(enemy.hp <= 0)` で勝利を判定する。

### P5のブラウザ自動操作確認は環境問題として扱う

BrowserプラグインはP5でも `windows sandbox failed: spawn setup refresh` により接続できなかった。実装検証は `npm.cmd install`、`npm.cmd run typecheck`、`npm.cmd run lint`、`npm.cmd run build`、一時devサーバーのHTTP 200で行い、実ブラウザ操作の不足は既存のENV-002に追記する。

### P5.1では探索背景・参照キービジュアルの流用をやめ、戦闘専用背景を使う

既存の `dogo_battle_bg.png` は参照キービジュアルに近く、UI、キャラクター、敵、カードが画像内に含まれていたため、実装用背景としてはBattleScreen上の表示と重複していた。P5.1では背景を再生成し、Runtime Assetは `public/assets/generated/backgrounds/dogo_battle_bg.png` に配置する。参照画像は構図と画風の参考に留め、Runtime Assetとして直接使わない。

### P5.1の背景生成方針

道後温泉通常戦闘の背景は、左下にひめ、右側に敵1〜2体、下部にカードUI、上部中央にメッセージを重ねる前提で生成した。画像内には文字、UI、カード、ひめ、シロ、敵、HPバーを含めない。旧背景は `public/assets/generated/_backup/p5_1/dogo_battle_bg_before_p5_1.png` に退避する。

### P5.1の戦闘画面配置方針

ひめは左下寄り、シロはひめ近く、敵1体は右中央、敵2体は右側で上下にずらして表示する。敵が複数いる場合は番号付きのターゲットマーカーとDOMの対象選択ボタンを併用し、どの敵を選んでいるかを分かりやすくする。カードUIは下部中央に広げ、背景やキャラクターと重なりにくい領域に固定する。

### P5.1ではカード名・説明を画像文字ではなくDOM実テキストで表示する

カード画像はアイコンとして扱い、カード名、説明、MPコストはDOM/CSSで表示する。画像内文字に依存すると読みやすさと修正性が下がるため、BattleScreenのカードUIは実テキストを優先する。

### P5.1ではBattleSystemロジックを大きく変更しない

今回の目的は背景、配置、カードUI、メッセージ、ターゲット選択の視認性改善であるため、P5で実装したカード効果、敵ターン、勝利/敗北、撃破保存の処理は維持した。文字化けしていた戦闘ログ、カード名、敵名などは表示品質に関わるため修正した。

### P5.1では `hime_battle_sheet` ではなく `hime_idle` を継続利用する

既存の `hime_battle_sheet.png` はラフな仮画像で、P5.1の表示品質改善には不向きだった。完成品質のバトルスプライト制作は後続に残し、P5.1では既に手描き品質が高くBattleScreen上でも視認しやすい `hime_idle.png` をひめ表示に使う。

## 2026-06-13

### 旧企画書 v0.7 のストーリーを正本として復元する

現在の企画書はP0再作成時に簡略化され、家族旅行、おばあちゃん、星守りの家系、白鷺のお守り、ペンダント、みかん星の核、シロ、カゲマサ、くろぼしの物語上の役割が弱くなっていた。P6の画像生成とアニメーション付きプロローグに入る前に、旧企画書 v0.7 のストーリーを正本として復元する。

### P6前に動機を補強する

簡略版企画書では、ひめが冒険へ入る理由が「星を集める」寄りで、個人的な動機が弱かった。P6ではプロローグを実装するため、冒険の最初の目的を「おばあちゃんにもらったペンダントの光を取り返すこと」として明確化する。

### おばあちゃんからペンダントを託される導入を正式採用する

ひめは家族旅行で道後温泉へ向かう前に、おばあちゃんから小さなみかん色の星がついたペンダントを受け取る。この導入を正式採用し、ペンダントをひめ個人にとって大切なものとして扱う。

### ペンダントは白鷺のお守りかつ星地図の器とする

ペンダントは、おばあちゃんの家に昔から伝わる白鷺のお守りであり、同時に愛媛各地の「土地の星」を映す星地図の器とする。シロはこのペンダントに宿っていた守り鳥として扱う。

### みかん星の核だけが奪われる設定を正式採用する

P6以降もカードと星地図を使えるよう、カゲマサの手下が奪うのはペンダント全体ではなく、中央の「みかん星の核」とする。外枠と鎖はひめの手元に残り、弱い星地図機能と星のカードは残る。子ども向けの会話では「ペンダントの光を取られちゃった」と表現してよい。

### 星守りの家系設定を正式採用する

ひめの家は、かつて愛媛各地の土地の星を見守った「星守り」の家系につながっている。ただし、現在の家族やおばあちゃんは詳しい役目を知らない。P6では説明過多にせず、ペンダントが代々受け継がれた大切なお守りであることを優先して伝える。

### カゲマサはMVP章ボス、くろぼしは全体黒幕候補とする

カゲマサは松山城編で再封印されるMVP章ボスであり、物語全体の最終黒幕ではない。全体黒幕候補は、空から落ちてきた小さな黒い星「くろぼし」とする。ただし、MVPではくろぼしの正体を完全には明かさず、次の冒険へつながる謎として残す。

### 旧企画書のPhaser記述は採用しない

旧企画書 v0.7 に含まれていた Phaser 3 + TypeScript + Vite の技術記述は、現在のプロジェクト方針と矛盾するため復元しない。引き続き、Unity、Godot、Unreal、Phaser、PixiJS、Kaboom.jsなどのゲームエンジン／ゲームフレームワークは禁止し、TypeScript、Vite、HTML Canvas 2D API、DOM UI、CSS、localStorageで実装する。







# TASKS

このファイルは現在フェーズ以降の実行タスクを管理します。完了済みフェーズの詳細履歴は `docs/PROGRESS.md` とGit履歴を参照してください。

## P10 通しプレイ・体験版調整・公開確認

- [x] 新規localStorageからMVP通しプレイ（最終CI #84）
- [x] タイトル→プロローグ→道後全必須戦闘→湯の星→星地図→松山城→城山のまもり→カゲマサ→エンディングを確認
- [x] 旅の手帳を序盤/道後完了/P7完了/P8完了の各時点で確認
- [x] キーボード中心の通常操作とDOMボタン操作、390px相当タッチ操作を確認
- [x] 旧セーブ移行を確認
- [x] 道後walkable/collisionの細部をCI検証し、中央接続路を最小調整
- [x] BGM/SEのミュート・画面切替・runtime errorを確認
- [x] 1対2ターゲット確定と必須連戦の難易度を調整
- [x] GitHub Pages公開URLでproduction E2E（title→道後、Notebook pointer、ミュート／閉じる、reload→Continue）
- [ ] 公開環境の初期ロード時間を数値計測し、必要なら段階ロードへ変更（P12 lazy loading設計へ引継ぎ。Release blockerではない）
- [x] コンソールエラー/404/必須アセット欠落なしを確認

P10最終判定: **Release PASS**。

## P11 Full Game Design / 本編基盤設計

- [x] 作業開始時に最新 `origin/main` SHAを確認し記録
- [x] open PR / 既存作業branchを確認し競合・重複を回避
- [x] `docs/specs/企画書.md` を物語・世界観・ゲーム構造の正本として精読
- [x] `docs/specs/MVP詳細GDD.md` を精読
- [x] `docs/specs/MVP要件定義書.md` を精読
- [x] `docs/ROADMAP.md` / `PROGRESS.md` / `TASKS.md` / `DECISIONS.md` / `README.md` を確認
- [x] 類似RPGの探索・field・再訪・navigation・battle・子どもUXを比較調査
- [x] 愛媛県全体の地形・自然・歴史・文化・産業を調査
- [x] 11市9町の20市町すべてをゲームデザイン観点で調査
- [x] MVPをPrologue「はじめての星めぐり」として再定義
- [x] 20市町=20小ステージ方式を不採用とするDecisionを確定
- [x] 8 Adventure Area（A0〜A7）を確定
- [x] 全20市町をAdventure Areaへ重複なく割り当て
- [x] Adventure Areaごとのテーマ・異変・field構成・ルート・再訪・Boss・星・時間を設計
- [x] 探索密度KPI（20〜45秒、無発見60秒原則上限）を定量化
- [x] 1 Subarea 10〜18分、1 Adventure Area 45〜80分中心を基準化
- [x] field abilityを `あたため` / `風よみ` / `星みち` / `ほしあかり` / `潮よみ` の5系統に制限
- [x] 星地図・旅の手帳を使った再訪候補の自動記録方式を設計
- [x] 星Lv、HP/MP、カード、カード強化、お守りを含む簡潔な成長systemを設計
- [x] 地域固有ruleを使うカードbattle拡張方針を設計
- [x] Prologue / 中予編 / 東予編 / 南予編 / Finaleの全体章構成を設計
- [x] くろぼしの起源・目的・星守りとの関係・最終解決を確定
- [x] シロ・星守り・おばあちゃん・ひめの位置付けを確定
- [x] 完成版プレイ時間をメイン8〜10時間、寄り道込み12〜15時間へ再設計
- [x] smartphone横画面を基準とした操作・UI・navigation Hard Constraintを設計
- [x] Canvas + DOM UIのFull Game拡張性を評価
- [x] chunk/subarea、lazy asset、Quest/Objective Service、Save migration、spatial indexing等の技術方針を設計
- [x] `docs/specs/FULL_GAME_DESIGN.md` を作成
- [x] `docs/specs/ADVENTURE_AREA_SPEC.md` を作成
- [x] `docs/research/RPG_DESIGN_RESEARCH.md` を作成
- [x] `docs/research/EHIME_GAME_DESIGN_RESEARCH.md` を作成
- [x] `docs/ROADMAP.md` をP12〜P17まで更新
- [x] `docs/DECISIONS.md` にP11主要Decisionを記録
- [x] P0〜P10 Decision Logを `docs/archive/DECISIONS_PRE_P11.md` に保存
- [x] `docs/PROGRESS.md` をP11完了・P12次フェーズへ更新
- [x] P12を「しまなみ Adventure Area Vertical Slice」として具体化
- [x] P11最終時点で最新mainとのbehind/aheadを再確認し、競合なしを確認

P11最終判定: **設計完了**。P12へ進む前にP11 PRをreview/mergeする。

## P12 しまなみ Adventure Area Vertical Slice

### Git / Release前提

- [ ] P12開始時に最新 `origin/main` を取得し、開始SHAを記録
- [ ] P11 merge後の正本文書とP10 Release Gateを基準として固定
- [ ] 既存open PR / branchを確認し競合・重複を避ける

### Architecture

- [ ] `AdventureAreaDefinition` の最小data modelを設計・実装
- [ ] `SubareaDefinition` の最小data modelを設計・実装
- [ ] 今治・上島をArea bundleとしてdata-drivenに登録
- [ ] `ExploreScreen` から地域固有quest分岐を剥がす最小Quest/Objective Serviceを導入
- [ ] Subarea/chunk遷移を実装
- [ ] Area単位lazy asset loadingを実装
- [ ] 次Subareaの先読みを実装
- [ ] SaveData versioning / migrationを追加
- [ ] checkpoint / fast travel / autosave / reload ContinueをArea構造へ対応
- [ ] 必要に応じentity spatial indexingを導入し、導入前後の計測値を残す
- [ ] map editorをexit/checkpoint/ability gateへ最小拡張

### Shimanami Field

- [ ] 今治港Hubを実装
- [ ] 4〜5 Subareaを実装
- [ ] Boss spaceを実装
- [ ] 橋route / 小舟routeの軽い分岐と再合流を実装
- [ ] `風よみ`取得前の視認可能なability gateを1〜2か所配置
- [ ] `風よみ`取得後に既訪地点の意味が変わる再訪を実装
- [ ] 帆・風車・旗・霧・風道を使った環境gimmickを実装
- [ ] 小環境puzzle 2〜4件
- [ ] 任意event 1〜2件
- [ ] 景勝ポイント1件
- [ ] 星のかけら等の探索報酬を必要最小限配置

### Battle

- [ ] 全敵シンボル6〜10体
- [ ] 必須戦闘3〜5件
- [ ] 地域rule「風」を戦闘へ統合
- [ ] 風ruleをUI上で一目で理解できるようにする
- [ ] 通常戦45〜90秒目標を実測
- [ ] しまなみ地域Bossを実装
- [ ] Boss戦3〜5分目標を実測
- [ ] 単純なHP増加だけで難易度を作らないことをreview

### Smartphone / UX

- [ ] 横画面joystick移動を実機相当viewportで確認
- [ ] Interact buttonを導入または既存confirm導線をtouch向けに統合
- [ ] Shiro Searchをtouchから1操作で利用可能にする
- [ ] Battle card UIを最大6枚で操作可能にする
- [ ] Notebook / 星地図 / Safe Areaとjoystickの干渉を確認
- [ ] iOS Safari相当viewportでsafe-areaを確認
- [ ] Android Chrome相当viewportで確認
- [ ] 長時間joystickを押し続ける空白移動をなくす

### Exploration Hard Gate

- [ ] メイン攻略60〜80分
- [ ] 意味ある発見の中央値20〜45秒
- [ ] 通常の無発見移動60秒超を原則0件にする
- [ ] 3〜8分以内に分岐routeの手掛かりまたは報酬が返る
- [ ] checkpoint/autosave間隔5〜8分以内
- [ ] 1 Subarea 10〜18分程度
- [ ] 子どもが次の目的を忘れた場合にシロの短いヒントで復帰できる
- [ ] 目的地矢印・星地図・landmarkの情報量が過剰でないことを確認
- [ ] 再訪候補が手帳/星地図へ自動記録される

### Regression / Release Gate

- [ ] `npm ci`
- [ ] typecheck
- [ ] lint
- [ ] maps:validate
- [ ] editor:smoke
- [ ] build
- [ ] P7/P8/P9/P10 browser回帰
- [ ] P12専用browser verifier
- [ ] P10 Prologue title→Ending回帰を維持
- [ ] P10から引き継いだ公開環境初期ロード時間を定量計測
- [ ] initial load / Area transition / Subarea transition時間を記録
- [ ] runtime error / asset 404 / save migration error 0件
- [ ] GitHub Pages production QA

### P12 Go / No-Go

以下を満たさなければA3以降を量産しない。

- [ ] 探索密度がHard Gate内
- [ ] 小学3年生相当のnavigationで迷子から自己復帰可能
- [ ] smartphone移動が苦痛にならない
- [ ] `風よみ`取得前後で再訪の意味が変わる
- [ ] 地域性がfield / battle / storyへ同じruleとして統合される
- [ ] lazy loadingでP10よりFull Game規模の初期ロードを悪化させない
- [ ] Prologue回帰を壊さない

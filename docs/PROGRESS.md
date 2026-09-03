# 進捗管理: ひめの小さな星めぐり

## 現在の状態

- 現在のフェーズ: **P12.1 Shimanami Visual Completion & Manual Hard Gate — READY FOR MANUAL HARD GATE**。
- P12.1作業開始時 `origin/main`: `8bccc0941cbd57a89480406ce5ea1d64e766bdfa`。
- P12.1作業branch: `feature/p12-1-shimanami-final-validation`、PR #16を継続する。mergeはまだ行わない。
- Actions #104のP10 failureは、P12.1で導入した安全なbattle return positionに対してP10 verifierが旧帰路を前提としていた **verifier regression / stale navigation assumption** と確定した。runtime battle return自体は戻さず、実道・実interaction・Star Map→松山城→Notebookの現行UI contractへverifierを追随させた。
- 2026-09-03のcode candidate HEAD `7e9fb2da52108ca620e2bb640594d5d2b2ca7c5d` では、Actions #123 / run `33696821948` で `git diff --check`、`npm ci`、typecheck、lint、maps:validate、editor:smoke、build、P7、P8、P9、P10、P11、P12が **同一HEAD・同一runで全PASS** した。
- P12 visual QA bundleから本番背景6枚、地域敵3種、Boss、NPCの実PNGを表示して確認し、A2-0〜A2-5のwalkable/collision/guide path overlayをレビューした。A2-0の小舟route walkableが船体へ食い込むHighを検出し、岸壁側へportalを移して船体側walkable枝を撤去した。
- A2-3の風車／上島portalはproduction-ground上で分離し、progression interactionを任意interactionが奪うHighを解消した。A2-2の星のかけら／portalも分離済みで、星のかけらは重複取得できないよう所持数を1個へ正規化した。
- battle returnはwalkable内・collision外・enemy collider外のsemantic validationを追加し、A2-E03を含むcritical pathでPASSした。Area-scoped lazy loadingはTitleでP12全画像を一括loadせず、現在A2 Areaのbackground/enemy/NPCのみをloadする構造を維持している。
- 8つの独立reviewer roleでruntime/save、P10 compatibility、map/geometry、production visual、interaction、battle/wind/battle-return、lazy loading、PR full diff/test adequacyを分離監査した。**Critical 0 / High 0**。残るMedium/Observationは、人手での小舟route完全E2E、A2-4能力shortcutの視覚理解、非同期asset load時の一時fallback可能性などであり、Manual Hard Gateで確認する。
- **60〜80分人手通し、探索KPI本計測、iOS/Android実機相当Final QA、merge後production QA、Final P12 PASSは未実施**。これらを自動CIの代替で完了扱いにしない。
- P13 / A3は開始しない。PR #16はmergeしない。
- 最終更新日: 2026-09-03。

## P12.1 現時点の実装・判定

### Final Candidateまでに完了した実装・QA

- A2-0〜A2-5を固有の本番背景へ接続し、主要画面の旧 `bg_shimanami` procedural fallback依存を外した。
- `docs/asset-prompts/p12.1/manifest.json` と `docs/asset-sources/p12.1/` に、生成prompt・source・runtime・SHA・使用場所を記録した。
- 風車、帆パズル、景勝点、星のかけら、上島の風守、風の近道をruntimeへ統合した。
- `風よみ`取得後の風道・風車変化、風battle rule、風のコンパス報酬、上島の物理的な風壁ゲートを追加した。
- A2全域のwalkable polygon、collisionRects、guide path、playerStart、敵・NPC・interactableをproduction背景へoverlayして再監査し、Critical/Highを解消した。
- `maps:validate`へA2全域の開始地点、敵コライダー、主要object中心、guide pathのプレイヤーコライダー監査を追加した。
- core assetとP12 Area assetを分離し、P12入場時は現在Areaに必要な背景・敵・NPCだけを遅延ロードする形へ変更した。
- 390px横画面のsafe-area、手帳幅、星地図の縦はみ出し、Battle 6-cardの最小可読性を修正した。
- 戦闘前の安全な復帰位置、勝利時即時保存、route選択／必須敵の進行ゲート、P12 area／battle／Boss／autosave／checkpoint／reloadイベントログを追加した。
- A2-0〜A2-4の任意敵をcritical guide pathから退避し、A2-4は風の近道→A2-E03→風の灯台の順になるよう調整した。
- A2-0小舟routeの船体walkable High、A2-3 windmill/portal High、A2-2 reward重複取得Mediumを修正した。
- GitHub Actions #123でP7〜P12を同一HEAD・同一runでFull PASSし、`git diff --check`もCI gateへ追加した。

### 次工程へ残すHard Gate

- 通常操作による60〜80分の人手通しプレイ。
- discovery interval全件、中央値、最大値、60秒超区間、longest empty walkの実測。
- 分岐→手掛かり／報酬、checkpoint/autosave、Subarea時間、通常戦、Boss時間の実測。
- 小舟routeを含むalternate pathの通常操作E2E確認。
- iOS Safari相当／Android Chrome相当の横画面実機相当操作、joystick疲労、safe-area、Boss視認。
- merge後のGitHub Pages production load、initial/Area transition時間、404、console error、reload/Continue確認。
- exploration KPIを踏まえたFinal P12 PASS / NO-GO判定。

結論: **READY FOR MANUAL HARD GATE**。これは **P12 FINAL PASSではない**。PR #16をmergeせず、60〜80分人手Hard Gateの開始直前で停止する。

## フェーズ別進捗

| ID | フェーズ | 状態 |
|---|---|---|
| P0〜P5.9 | 基盤・探索・星地図・会話・複数敵バトル・ストーリー整合 | 完了 |
| P6 | プロローグ・道後温泉クエスト・湯の星 | 完了 |
| P6.5 | ローカルマップエディタ | 完了 |
| P7 | 松山城探索・松山城クエスト | 完了 |
| P7.1 | Release Hardening | 完了 |
| P7.2 | 道後D0歩行領域の実景整合 | 完了 |
| P8 | カゲマサ戦・核奪還・MVPエンディング | 完了 |
| P9 | 旅の手帳・BGM/SE・セーブ調整 | 完了 |
| P10 | 通しプレイ・難易度調整・公開確認 | 完了（Release PASS） |
| P11 | Full Game Design / 本編基盤設計 | 完了（設計） |
| P12 | しまなみ Adventure Area Vertical Slice | 前段実装は完了（探索KPIは人手計測待ち） |
| P12.1 | Shimanami Visual Completion & Manual Hard Gate | **READY FOR MANUAL HARD GATE / 人手Hard Gate未実施** |
| P13〜P17 | Full Game Foundation〜Finale / Release Gate | 未着手 |

## P10 Release基準

P10では以下を確認済みであり、P11以降もPrologueの回帰基準とする。

- 新規localStorageからEndingまでの通常操作フルプレイ: PASS（最終CI #84、P10 browser）。
- 道後必須4戦、湯の星、松山城必須3戦、くらやみ井戸、城山のまもり、カゲマサ戦: PASS。
- Notebook、旧save fail-safe、autosave/reload/Continue、battle途中checkpoint、ミュート: PASS。
- 1対2ターゲット確定と必須連戦時MP回復を調整済み。
- `npm audit` / `npm audit --omit=dev`: 0 vulnerabilities。
- GitHub Pages本番でtitle、新規開始、道後到達、Notebook pointer、ミュート、閉じる、reload→Continueを確認。
- 本番URLでEndingまでの手動キー保持のみCloud Browser制約で未実施だが、Endingまでの通常操作は実Chrome CIで確認済み。

## P11 完了内容

### 1. MVPの完成版での位置付け

- P1〜P10のMVPを **A0 松山・道後 / Prologue「はじめての星めぐり」** として正式に残す。
- 既存Endingは完成版でChapter Transitionへ接続する。
- Chapter Transitionでは松山市周辺の星地図から愛媛全域へzoom-outし、「今まで遊んだ範囲は愛媛のほんの一部だった」と認識させる。

### 2. Full Game構造

20市町=20小ステージ方式を採用せず、地形・水系・暮らし・文化の連続性で8 Adventure Areaへ統合した。

| Area | 名称 | 対象市町 |
|---|---|---|
| A0 | 松山・道後 | 松山市 |
| A1 | ちゅうよの水と器 | 伊予市・松前町・砥部町 |
| A2 | しまなみ・島風の航路 | 今治市・上島町 |
| A3 | 石鎚・水脈の道 | 西条市・東温市・久万高原町 |
| A4 | 別子・紙の回廊 | 新居浜市・四国中央市 |
| A5 | 肱川・灯りの町 | 内子町・大洲市 |
| A6 | 岬と大地の境目 | 八幡浜市・伊方町・西予市 |
| A7 | 宇和海・森の境 | 宇和島市・松野町・鬼北町・愛南町 |

20市町は重複なく全て含む。

### 3. 探索KPI

- メインルートの意味ある発見: 20〜45秒。
- 通常の無発見歩行: 原則60秒以内。
- 任意脇道の報酬到達: 30〜75秒。
- checkpoint / autosave: 5〜8分程度＋重要イベント後。
- 1 Subarea: 10〜18分。
- 1 Adventure Area: 45〜80分中心、最大90分程度。
- 1回のプレイセッション: 15〜30分。
- 完成版: メイン8〜10時間、寄り道込み12〜15時間。

### 4. Field Ability / 再訪

5つのglobal field abilityに制限する。

1. `あたため`
2. `風よみ`
3. `星みち`
4. `ほしあかり`
5. `潮よみ`

取得前に見つけた再訪候補は星地図・旅の手帳へ自動記録し、能力取得後に再訪iconを出す。1 Adventure Areaの既知再訪候補は最大2程度とする。

### 5. 成長・戦闘

- 星Lvは5段階。
- HP/MPは自動成長。
- カード所持は完成版約18枚、Active deck最大6枚。
- カード強化は原則1段階。
- お守りは1枠、約6種。
- 通常戦闘は主に敵1〜2体、45〜90秒目標。
- 地域差は敵HP増加ではなく、風・黒霧・潮流等の「1つの見える地域rule」で出す。
- 敵は倒すのではなく引き続き「しずめる」。

### 6. 物語設定

- くろぼしは単純な悪の魔王ではなく、星守りが土地へすぐ戻せない悲しみ・怖さ・後悔を一時的に受け止めるための「影の器」を起源とする。
- 星守りは勇者集団ではなく、土地を歩き、声を聞き、濁った記憶を土地へ戻す世話役・道案内役。
- シロは導きと記憶を土地へ戻す側の存在。
- ひめは血筋だけで選ばれた勇者ではなく、各地で助ける選択を積み重ねることで星守りの役目を引き継ぐ。
- Finaleではくろぼしを殺すのではなく「しずめる」ことを最終解決とする。

### 7. 技術評価

Canvas + DOM UI構成は維持し、現時点でゲームエンジン移行は行わない。Full Game規模へ向け、P12以降に以下を検証・導入する。

- `AdventureAreaDefinition` / `SubareaDefinition` のdata-driven化。
- Subarea/chunk単位のmap管理。
- Area bundle lazy asset loadingと次Subarea先読み。
- Quest / Objective Serviceの分離。
- SaveData versioning / migration。
- entity spatial indexing。
- map editorのexit/checkpoint/ability gate対応。
- browser verifierのArea単位拡張。

## P11 正本文書

- `docs/specs/FULL_GAME_DESIGN.md`
- `docs/specs/ADVENTURE_AREA_SPEC.md`
- `docs/research/RPG_DESIGN_RESEARCH.md`
- `docs/research/EHIME_GAME_DESIGN_RESEARCH.md`
- `docs/ROADMAP.md`
- `docs/DECISIONS.md`

P0〜P10の旧Decision Logは `docs/archive/DECISIONS_PRE_P11.md` に保存する。

## P12 しまなみ Adventure Area Vertical Slice

P12では今治市・上島町の1 Areaだけを実装し、完成版本編の探索方式を量産前に実証する。

Hard Gate:

- メイン60〜80分。
- 今治港Hub + 4〜5 Subarea + Boss space。
- `風よみ`取得前後で同じ地点の意味が変わる。
- 意味ある発見の中央値20〜45秒。
- 60秒超の無発見移動を原則作らない。
- 分岐routeの手掛かりまたは報酬が3〜8分以内に返る。
- autosave/checkpoint間隔5〜8分以内。
- 横画面スマホで長時間joystickを押し続ける空白移動を要求しない。
- P10 Prologue回帰を壊さない。

P12で探索密度・迷子・操作疲労・ロード性能のHard Gateを満たさない場合、A3以降を量産せずAdventure Area規格を修正する。

### P12実装・Chrome CI判定

run #95（2026-08-26 JST）で、`npm run p7:browser`〜`npm run p12:browser`、typecheck、lint、maps/editor検証、buildをPASSした。P12 verifierは、6エリア、橋道route、必須敵、見張り台、`風よみ`、同一風車の再訪、上島、Boss、save telemetry、390px touch UI、runtime error 0件を通しで確認する。

P12.1の最新code candidateではさらにActions #123（2026-09-03 JST）で、`git diff --check`、`npm ci`、typecheck、lint、maps:validate、editor:smoke、build、P7〜P12 browserを同一HEAD・同一runでFull PASSした。したがって実装／回帰candidateのblocking issueは解消済みである。

一方、CI verifierはseed済みcritical pathであり、60〜80分の人手通しプレイ、発見間隔中央値20〜45秒、無発見移動60秒以内、checkpoint/autosave 5〜8分を直接測定しない。したがって探索KPI Hard Gateは人手計測まで未確定とする。A3以降の量産は、人手プレイの定量記録後にGo/No-Goを決める。

## 残課題

- 60〜80分人手Hard Gate、探索KPI本計測、iOS/Android実機相当Final QA、merge後production QAを実施し、P12 Final Go/No-Goを判定する。
- P10から残る「公開環境の初期ロード時間の定量計測」は、P12のlazy loading効果と合わせてmerge後production QAで記録する。
- Adventure Areaの地域編ラベルと地理的境界が完全一致しない箇所は、P12以降の章構造実装時に星地図上の見せ方を検証する。

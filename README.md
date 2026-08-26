# ひめの小さな星めぐり（仮）

愛媛県20市町を舞台にした、手描き絵本風2.5D探索カードRPGです。

P1〜P10で松山市内の「道後温泉→松山城→カゲマサ→Ending」までを遊べるMVPを完成し、P11でこのMVPを完成版の **Prologue「はじめての星めぐり」** として再定義しました。完成版では20市町を20個の同型ステージにはせず、複数市町を地形・水系・文化・産業のつながりで束ねたAdventure Areaを巡ります。

## 現在のフェーズ

P11「Full Game Design / 本編基盤設計」を土台に、P12.1「Shimanami Visual Completion & Manual Hard Gate」を専用branchで進行中です。しまなみ本番背景6枚、敵3種、Boss、NPC、Area単位asset loading、walkable/collision整合、風rule、再訪報酬、スマホUI修正まで実装しました。ただし60〜80分の人手通しプレイ、production QA、実機相当のiOS/Android確認、探索KPIの実測が未完了のため、P12 Final Gateは **NO-GO / REVISION REQUIRED** としています。

P11では大規模runtime実装を行わず、以下を確定しました。

- MVPをA0 松山・道後 / Prologueとして維持する。
- 20市町=20小ステージ方式を採用しない。
- 全20市町を8 Adventure Area（A0〜A7）へ重複なく割り当てる。
- 探索KPIを「意味ある発見20〜45秒、通常の無発見歩行は原則60秒以内」とする。
- global field abilityを `あたため` / `風よみ` / `星みち` / `ほしあかり` / `潮よみ` の5つに制限する。
- 完成版をメイン8〜10時間、寄り道込み12〜15時間に再設計する。
- くろぼし、星守り、シロの完成版設定を確定する。
- Canvas + DOM UIを維持し、P12以降にSubarea/chunk、lazy asset loading、Quest/Objective Service、Save migration等を実証する。

P11の正本文書:

- `docs/specs/FULL_GAME_DESIGN.md`
- `docs/specs/ADVENTURE_AREA_SPEC.md`
- `docs/research/RPG_DESIGN_RESEARCH.md`
- `docs/research/EHIME_GAME_DESIGN_RESEARCH.md`
- `docs/ROADMAP.md`
- `docs/DECISIONS.md`

P0〜P10の旧Decision Logは `docs/archive/DECISIONS_PRE_P11.md` に保存しています。

## Adventure Area

| ID | Adventure Area | 対象市町 |
|---|---|---|
| A0 | 松山・道後「はじめての星めぐり」 | 松山市 |
| A1 | ちゅうよの水と器 | 伊予市・松前町・砥部町 |
| A2 | しまなみ・島風の航路 | 今治市・上島町 |
| A3 | 石鎚・水脈の道 | 西条市・東温市・久万高原町 |
| A4 | 別子・紙の回廊 | 新居浜市・四国中央市 |
| A5 | 肱川・灯りの町 | 内子町・大洲市 |
| A6 | 岬と大地の境目 | 八幡浜市・伊方町・西予市 |
| A7 | 宇和海・森の境 | 宇和島市・松野町・鬼北町・愛南町 |

## P12 Vertical Slice

P12では今治市・上島町の「しまなみ・島風の航路」だけを実装し、完成版本編の方式を量産前に検証します。

主なHard Gate:

- メイン60〜80分。
- 今治港Hub + 4〜5 Subarea + Boss space。
- `風よみ`取得前後で同じ地点の意味が変わる。
- 意味ある発見の中央値20〜45秒。
- 60秒超の無発見移動を原則作らない。
- checkpoint/autosave間隔5〜8分以内。
- 横画面スマホで長時間joystickを押し続ける空白移動を要求しない。
- P10 Prologue回帰を壊さない。

Hard Gateを満たさない場合、後続Adventure Areaを量産せず規格を修正します。

### P12 Hard Gate判定（P12.1暫定）

GitHub ActionsのChrome CI run #95（2026-08-26 JST）で、次をPASSしました。

- `npm run p7:browser`〜`npm run p12:browser` の全Chromeゲート。
- Hub→橋道→橋の記憶→必須戦闘→見張り台→`風よみ`→同じ風車の再訪→上島→必須戦闘→風の灯台→Bossのcritical path。
- 6エリア、橋道／小舟道の分岐、能力取得前後の同一風車、checkpoint/autosave、発見・経過時間telemetry。
- 390px幅でのtouch移動UIとInteract導線。
- typecheck、lint、map/editor検証、build、P10 Prologue回帰。

このCI verifierはseed済みcritical pathの機械検証であり、60〜80分の人手通しプレイ、発見間隔中央値20〜45秒、無発見移動60秒以内、checkpoint間隔5〜8分を直接測定しません。P12.1でコードと本番画像は更新しましたが、現時点の判定は **実装／回帰は候補PASS、探索・スマホ・production Hard Gateは未成立** です。A3以降の量産とP13移行は、実測完了まで禁止します。

P12.1開始時の最新 `origin/main` は `8bccc0941cbd57a89480406ce5ea1d64e766bdfa`、作業branchは `feature/p12-1-shimanami-final-validation` です。生成物のprovenanceは `docs/asset-prompts/p12.1/` に保存しています。

## P10 runtime baseline

P10「通しプレイ・体験版調整・GitHub Pages公開確認」はRelease PASSです。実Chromeの新規セーブ通しプレイ、P7〜P10回帰、GitHub Pages本番QAを完了しています。

主な実装状況:

- P6: 画像付き6シーンプロローグ、道後温泉クエスト、湯の星、星地図・松山城解放。
- P6.5: `map-editor.html` による道後D0/松山城C0レイアウトの視覚編集・検証・保存。
- P7: 星地図→松山城C0、城内戦闘、NPC/調べるヒント、くらやみ井戸、城山のまもり。
- P7.1: NPC入力経路統一、Save/Battle不変条件、実ブラウザCI Release Gate。
- P7.2: 道後D0の背景上の地面とwalkable polygonを整合。
- P8: カゲマサ戦、星封じ、核奪還、城の星、MVP完了保存、EndingScreen。
- P9: 旅の手帳、Web Audio BGM/SE、安全画面オートセーブ、P9実Chrome Gate。
- P10: 実Chrome full-play verifier、1対2ターゲット確定、連戦時MP調整、production QA。
- P10後: smartphone/coarse-pointer探索を4方向D-padから左側drag joystickへ変更し、斜め移動・release時virtual input解除・Notebook右側配置に対応。keyboard操作は維持。

## 技術方針

- 言語: TypeScript
- ビルド: Vite
- 描画: HTML Canvas 2D API
- UI: DOM / CSS
- 音: Web Audio API
- セーブ: localStorage
- ループ: requestAnimationFrame

ゲームエンジンやゲームフレームワークは使用しません。現時点ではこの方針を維持し、Full Game規模で必要なdata-driven化とstreaming/lazy loadingをP12で検証します。

## Prologue / MVP範囲

- タイトル画面
- プロローグ
- 道後温泉探索
- 松山城探索
- 星地図
- 敵シンボル接触による戦闘
- 1対1および1対2のカード式ターン制バトル
- カゲマサとの1対1ボス戦
- 旅の手帳
- BGM/SE
- オートセーブと「つづきから」
- MVP Ending / 完成版Chapter Transition起点

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
npm run p9:browser
npm run p10:browser
npm run p11:browser
npm run p12:browser
npm audit
```

公開URL:

```text
https://ryotamatsuki.github.io/hime-star-journey/
```

P10最終CI #84（P7起動フレークの失敗ジョブ再実行後）は `npm ci`、typecheck、lint、map/editor検証、build、P7/P8/P9/P10実Chrome回帰、Pages deployをすべてPASSしています。GitHub Pages本番QAではtitle、新規開始、道後到達、手帳のpointer操作、ミュート、閉じる、reload後のContinueを確認しました。P12 Chrome CI #95ではP7〜P12を全てPASSしています。

P12ではruntime codeを追加し、P10 Release GateをPrologue回帰基準として維持しました。P12.1ではActions #100/#102で見つかった導線不整合を修正中です。P12.1候補のChrome CI、60〜80分の人手通し、探索KPI、スマホ実操作、production QAが完了するまで、最終判定は **P12 NO-GO / REVISION REQUIRED** とします。

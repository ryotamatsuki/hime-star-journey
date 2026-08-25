# ひめの小さな星めぐり（仮）

愛媛県20市町を舞台にした、手描き絵本風2.5D探索カードRPGです。

P1〜P10で松山市内の「道後温泉→松山城→カゲマサ→Ending」までを遊べるMVPを完成し、P11でこのMVPを完成版の **Prologue「はじめての星めぐり」** として再定義しました。完成版では20市町を20個の同型ステージにはせず、複数市町を地形・水系・文化・産業のつながりで束ねたAdventure Areaを巡ります。

## 現在のフェーズ

P11「Full Game Design / 本編基盤設計」は設計完了です。次フェーズは **P12「しまなみ Adventure Area Vertical Slice」** です。

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
npm audit
```

公開URL:

```text
https://ryotamatsuki.github.io/hime-star-journey/
```

P10最終CI #84（P7起動フレークの失敗ジョブ再実行後）は `npm ci`、typecheck、lint、map/editor検証、build、P7/P8/P9/P10実Chrome回帰、Pages deployをすべてPASSしています。GitHub Pages本番QAではtitle、新規開始、道後到達、手帳のpointer操作、ミュート、閉じる、reload後のContinueを確認しました。

P11は設計文書のみを変更し、runtime codeは変更しません。P12実装時もP10 Release GateをPrologue回帰基準として維持します。

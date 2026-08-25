# 進捗管理: ひめの小さな星めぐり

## 現在の状態

- 現在のフェーズ: **P11 Full Game Design / 本編基盤設計 完了（設計）**
- P11作業開始時 `origin/main`: `92bad8aa2b2e9c3aab1b9d6c34bb0dd482abb00c`
- P11作業branch: `docs/p11-full-game-design`
- P11では大規模runtime実装を行わず、完成版本編の構造・探索・成長・戦闘・物語・愛媛20市町・技術基盤を設計した。
- P1〜P10で完成したMVPは削除せず、完成版の **Prologue「はじめての星めぐり」** として維持する。
- 次フェーズ: **P12 しまなみ Adventure Area Vertical Slice**
- P10 runtime Release Gateは引き続きPrologue回帰基準として維持する。
- 最終更新日: 2026-08-25

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
| P12 | しまなみ Adventure Area Vertical Slice | 次フェーズ |
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

## 残課題

- P10から残る「公開環境の初期ロード時間の定量計測」はRelease blockerではないが、P12のlazy loading設計時に必ず再計測する。
- Adventure Areaの地域編ラベルと地理的境界が完全一致しない箇所は、P12以降の章構造実装時に星地図上の見せ方を検証する。
- P11は設計フェーズのためruntime build内容そのものは変更していない。P12で初めてFull Game基盤のruntime検証に入る。

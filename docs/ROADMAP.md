# ROADMAP

## フェーズ一覧

| ID | フェーズ | 目的 | 状態 |
|---|---|---|---|
| P0 | リポジトリ初期化 | ルール、仕様、進捗管理、アセット管理、プロンプト整備 | 完了 |
| P1 | 基盤実装 | TypeScript + Vite + Canvas + DOM UI + セーブ基盤 | 完了 |
| P2 | アセット・アニメーション基盤 | 生成アセット、SpriteAnimator、2.5D風表現 | 完了 |
| P3 | 探索画面 | ひめ移動、シロ追従、敵シンボル、接触判定 | 完了 |
| P4 | 星地図 | 道後温泉、松山城、未解放星、目的地選択 | 完了 |
| P5 | 複数敵対応バトル | EncounterData、BattleActor配列、ターゲット選択、カード効果 | 完了 |
| P5.1 | 戦闘画面レイアウト改善 | 道後温泉通常戦闘専用背景、配置、カードUI、可読性調整 | 完了 |
| P5.9 | ストーリー正本復元・企画書整合 | 星守り、みかん星の核、シロ、カゲマサ、くろぼし設定を整合 | 完了 |
| P6 | プロローグ／道後温泉体験版 | ペンダント、シロ、核奪取、道後異変、湯の星、松山城解放 | 完了 |
| P6.5 | ローカル開発用マップエディタ | 道後D0/松山城C0の歩行・衝突・配置・道しるべ編集 | 完了 |
| P7 | 松山城探索・松山城クエスト | `castle/C0`、C-E01〜C-E04、くらやみ井戸、城山のまもり | 完了 |
| P7.1 | Release Hardening | 入力経路整合、Save/Battle不変条件、仕様同期、CI Release Gate | 完了 |
| P7.2 | 道後歩行領域実景整合 | 背景上の地面とwalkable polygonを一致させる | 完了 |
| P8 | カゲマサ戦・みかん星の核奪還・MVPエンディング | 星封じ、再封印、核奪還、城の星、終了演出 | 完了 |
| P9 | 旅の手帳・BGM/SE・セーブ調整 | 手帳、進行メモ、オートセーブ、音まわりの最小整理 | 完了 |
| P10 | 通しプレイ・体験版調整・GitHub Pages公開確認 | 新規セーブMVP通し、難易度・操作感、公開URL、Release確認 | 完了（Release PASS） |
| P11 | Full Game Design / 本編基盤設計 | RPG/子どもUX/愛媛20市町調査、Adventure Area、探索・成長・戦闘・物語・技術ロードマップを確定 | 完了（設計） |
| P12 | しまなみ Adventure Area Vertical Slice | 完成版探索ループ、風よみ、Subarea/chunk、lazy asset、save/fast travel、スマホUXを1地域で実証 | 次フェーズ |
| P13 | Full Game Foundation | P12結果を反映してAdventure Area data model、Quest/Objective Service、Save migration、editor拡張を共通基盤化 | 未着手 |
| P14 | 東予編 Completion | 石鎚・水脈の道、別子・紙の回廊を完成版品質で実装 | 未着手 |
| P15 | 中予編 Completion | ちゅうよの水と器を実装し、Prologueから本編へのChapter Transitionを完成 | 未着手 |
| P16 | 南予編 Completion | 肱川・灯り、岬と大地、宇和海・森の境を完成版品質で実装 | 未着手 |
| P17 | Finale / Full Game Release Gate | くろぼし最終章、全20市町星地図、全章E2E、難易度・性能・production QA | 未着手 |

## P10 Release Gate完了

- PR #8〜#11でP10のRelease Candidate、Production QA修正、手帳操作修正を実施。最終mainラン #84はP7起動フレークの失敗ジョブ再実行後に全GateとPages deployをPASS。
- P10 verifierは新規セーブからタイトル→プロローグ→道後必須4戦→湯の星→星地図→松山城必須3戦→くらやみ井戸→城山のまもり→カゲマサ→Endingを通常のDOM/キーボード操作で完走。
- 手帳の段階解放、旧save fail-safe、autosave/reload/Continue、battle途中checkpoint、Ending後Continue、ミュート切替、390px相当タッチ操作、runtime asset path、runtime error 0件を確認。
- `npm audit` / `npm audit --omit=dev` はともに0 vulnerabilities。
- P11以降もP10 browser/production GateをPrologue回帰基準として維持する。

## P11 Full Game Design確定事項

### 完成版の位置付け

- P1〜P10のMVPは削除せず **Prologue「はじめての星めぐり」** とする。
- 既存Endingは完成版ではChapter Transitionへ接続し、松山市周辺の星地図から愛媛全域へzoom-outする。
- 20市町=20小マップ方式は採用しない。20市町は8 Adventure Area（A0〜A7）に統合し、地域の地形・暮らし・文化をゲームプレイの違いとして表現する。
- 完成版目標はメイン8〜10時間、寄り道込み12〜15時間。1回15〜30分で中断しやすい構造を維持する。

### Adventure Area

- A0 松山・道後: 松山市。既存MVP / Prologue。
- A1 ちゅうよの水と器: 伊予市・松前町・砥部町。
- A2 しまなみ・島風の航路: 今治市・上島町。
- A3 石鎚・水脈の道: 西条市・東温市・久万高原町。
- A4 別子・紙の回廊: 新居浜市・四国中央市。
- A5 肱川・灯りの町: 内子町・大洲市。
- A6 岬と大地の境目: 八幡浜市・伊方町・西予市。
- A7 宇和海・森の境: 宇和島市・松野町・鬼北町・愛南町。

### 密度とフィールド能力

- メインルートの意味ある発見は20〜45秒を目標とし、通常の無発見歩行は原則60秒を超えない。
- 1 Subareaは10〜18分、1 Adventure Areaは45〜80分中心、最大90分程度。
- global field abilityは5つに制限: `あたため`、`風よみ`、`星みち`、`ほしあかり`、`潮よみ`。
- 新能力取得後の再訪候補は星地図・手帳へ自動記録し、1 Area最大2か所を目安とする。

### P11正本

- `docs/specs/FULL_GAME_DESIGN.md`
- `docs/specs/ADVENTURE_AREA_SPEC.md`
- `docs/research/RPG_DESIGN_RESEARCH.md`
- `docs/research/EHIME_GAME_DESIGN_RESEARCH.md`

## P12 しまなみ Adventure Area Vertical Slice

### 目的

完成版全地域を量産する前に、「探索そのものが面白いか」「スマホで広いAreaを歩けるか」「新能力で再訪したくなるか」「地域性と戦闘が同じルールでつながるか」を今治市・上島町の1 Areaだけで実証する。

### 実装対象

1. `AdventureAreaDefinition` / `SubareaDefinition` の最小data model。
2. 今治港Hub + 4〜5 Subarea + Boss space。
3. 橋route / 小舟routeの軽い分岐と再合流。
4. 風の星とfield ability `風よみ`。
5. 帆・風車・旗・霧・風道のenvironment gimmick。
6. 必須戦闘3〜5、全敵シンボル6〜10、地域rule付きboss。
7. 小環境puzzle 2〜4、任意event 1〜2、景勝ポイント1、再訪gate 1〜2。
8. checkpoint / fast travel / autosave / reload Continue。
9. Area単位のlazy asset loadingと次Subarea先読み。
10. `ExploreScreen` から地域固有quest分岐を剥がす最小Quest/Objective Service。
11. 横画面スマホでjoystick、Interact、Shiro Search、最大6cardを操作できるUI。
12. P10 Prologue回帰を維持するbrowser verifier。

### Hard Gate

- メイン60〜80分。
- 意味ある発見の中央値20〜45秒、60秒超の無発見移動を原則作らない。
- 3〜8分以内に分岐routeの手掛かりまたは報酬が返る。
- autosave/checkpoint間隔5〜8分以内。
- 風よみ取得前後で通過済み地点の意味が変わる。
- 横画面スマホで長時間joystickを押し続ける移動を要求しない。
- P10のタイトル→Prologue→Ending回帰を壊さない。

P12で密度・操作・迷子・ロードのHard Gateを満たせない場合、A3以降を量産せず、Adventure Area規格そのものを修正する。

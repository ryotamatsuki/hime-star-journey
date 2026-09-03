# DECISIONS

> P0〜P10までのDecision Logは内容を一切変更せず `docs/archive/DECISIONS_PRE_P11.md` に保存した。P11開始時main `92bad8aa2b2e9c3aab1b9d6c34bb0dd482abb00c` 時点の `docs/DECISIONS.md` と同一blobである。P11以降の主要Decisionは本ファイルへ追記する。

## 2026-08-25 P11 Full Game Design / 本編基盤設計

### DEC-P11-01 MVPをPrologueとして正式に残す

**既存企画**: P1〜P10で「道後温泉→湯の星→松山城→カゲマサ→みかん星の核奪還→Ending」のMVPが完成している。

**問題点**: 完成版へそのまま接続すると、既存Endingが冒険全体の終了に見え、その後の愛媛全域へのscale-upが弱い。

**決定**: MVPは削除せず **Prologue「はじめての星めぐり」** とする。既存Endingは完成版ではChapter Transitionへ接続し、松山市周辺の星地図から愛媛全域へzoom-outする。

**理由**: 完成済み体験を壊さず、P10までに学んだ操作・物語を本編のtutorialとして活用できる。小さな世界から大きな愛媛へ広がる感覚も作れる。

### DEC-P11-02 20市町=20ステージ方式を採用しない

**既存企画**: 愛媛20市町の土地の星を巡る。

**問題点**: 1市町1小マップにすると「NPC→必須敵→目的地→イベント→星」を20回反復しやすく、地域差が背景・名物skinに留まる。

**決定**: 20市町は維持するが、複数市町を地形・水系・産業・文化の連続性で束ねた **8 Adventure Area（A0〜A7、Prologue含む）** を基本単位とする。

- A0 松山・道後: 松山市。
- A1 ちゅうよの水と器: 伊予市・松前町・砥部町。
- A2 しまなみ・島風の航路: 今治市・上島町。
- A3 石鎚・水脈の道: 西条市・東温市・久万高原町。
- A4 別子・紙の回廊: 新居浜市・四国中央市。
- A5 肱川・灯りの町: 内子町・大洲市。
- A6 岬と大地の境目: 八幡浜市・伊方町・西予市。
- A7 宇和海・森の境: 宇和島市・松野町・鬼北町・愛南町。

**理由**: 行政区分ではなく「その土地をどう遊ぶか」でゲームを区切り、20市町を無理なく全て扱うため。

### DEC-P11-03 探索密度を面積より優先する

**既存企画**: MVPは小さなmap中心で、完成版本編のfield規格は未確定。

**問題点**: 「本番版は広くする」だけでは、スマホでjoystickを長時間押す空白fieldになりうる。

**決定**: fieldの主要KPIを意味ある発見までの時間とする。

- メインルートの意味ある発見: 20〜45秒。
- 通常の無発見歩行: 原則60秒を超えない。
- 任意脇道の報酬到達: 30〜75秒。
- 敵視認: 45〜90秒程度。
- 実際の通常戦: 90〜150秒程度。
- checkpoint/autosave: 5〜8分程度＋重要イベント後。
- 1 Subarea: 10〜18分。
- 1 Adventure Area: 45〜80分中心、最大90分程度。

**理由**: Pokémon等の大規模open worldを縮小コピーせず、Paper Mario、Mario & Luigi、A Short Hike等の「小さめでも発見が続く」設計を本作の対象年齢・smartphoneへ合わせるため。

### DEC-P11-04 global field abilityは5つに制限する

**既存企画**: 土地の星20個を集めるが、星取得後のfield gameplayへの影響は限定的。

**問題点**: 20個すべてに能力を付けると小学3年生には覚えることが多すぎ、ability selection UIも複雑化する。

**決定**: 鍵となる土地の星だけが5つのglobal field abilityを与える。

1. 湯の星 `あたため`
2. 風の星 `風よみ`
3. 山の星 `星みち`
4. 灯りの星 `ほしあかり`
5. 海の星 `潮よみ`

能力一覧から毎回選ばせず、星印の対象へ近づいたときのcontext actionとして使う。20の土地の星自体は物語・星地図上の意味を維持する。

**理由**: 星集め、探索、再訪、地域battle ruleを一つの語彙へ統合しながら認知負荷を抑えるため。

### DEC-P11-05 再訪は記憶力テストにしない

**決定**: ability不足で開けなかった場所は発見時に星地図・旅の手帳へ自動記録し、必要能力取得後に再訪iconを点灯する。1 Adventure Areaの既知再訪候補は最大2を目安とし、main story必須の大規模backtrackingにはしない。

**理由**: 「あそこへ戻れば何かある」という探索の期待だけを残し、TUNICや本格Metroidvaniaのような高い記憶要求は避けるため。

### DEC-P11-06 完成版のプレイ時間を8〜10時間へ変更する

**既存企画**: 完成版6〜7時間。

**問題点**: Adventure Area、脇道、再訪、地域固有battle ruleを追加しながら6〜7時間に固定すると、各地域が短すぎるか、発見密度を落とすことになる。

**決定**: **メイン8〜10時間、寄り道込み12〜15時間** を目標とする。1回15〜30分で中断しやすい構造は維持する。

**理由**: 長時間化そのものを目的にせず、各Adventure Area 45〜80分とSubarea 10〜18分の「遊びの違い」を成立させるため。

### DEC-P11-07 成長は星Lv・カード・お守りに絞る

**決定**:

- 星Lv 1〜5。主要章clearで自動上昇しHP/MPを自動成長。
- 完成版card所持目安18枚、戦闘時Active Card最大6枚。
- card強化は原則1段階。
- お守りはpassive 1枠、全体約6種。
- Shiroは別level/装備を持たずstory進行でsupport能力が増える。
- XP grind、複数装備slot、rare tier、craft素材treeは導入しない。

**理由**: 小学3年生が「何が強くなったか」を説明できる複雑さに留め、探索とcard選択へ注意を集中するため。

### DEC-P11-08 地域差は敵HPではなくrule差で出す

**決定**: 現在のcard式turn battleを維持し、通常敵1〜2体を標準とする。通常戦45〜90秒、boss3〜5分を目標とし、地域ごとに1つの見えるruleを持たせる。複雑な属性相性表は作らず、敵1体につき基本1つの弱点markとする。

**理由**: Areaが変わるたびHPだけが増える単調さを避けつつ、新ruleを同時に複数覚えさせないため。

### DEC-P11-09 くろぼしを「忘れられた影の器」として確定する

**既存企画**: くろぼしは全体黒幕候補。詳細未確定。

**問題点**: 「土地の星を濁らせる悪い魔王」だけでは、本作の `しずめる`、土地の記憶、星守りという主題と分離する。

**決定**: くろぼしは、昔の星守りが、土地へすぐ戻すには重すぎる悲しみ・怖さ・後悔・失われた記憶を一時的に受け止めるために生まれた **影の器** とする。星守りが忘れられ、記憶を戻す役目が途絶えたため濁りを抱え続け、「失うくらいなら、最初から光らせなければいい」と考えるようになった。

みかん星の核を使い20の土地の星を一つの静かな闇へ閉じようとする。Finaleでは消滅させず、星封じを「閉じ込める技」から「濁りをほどいて土地へ返す技」へ反転して、くろぼし自身をしずめる。

**理由**: 最終戦まで `敵をしずめる` を一貫させ、「悲しい記憶も消す必要はない」という結論へつなげるため。

### DEC-P11-10 カゲマサは章ボスのままにする

**決定**: カゲマサは最終ボスへ昇格させない。くろぼしが古い「守る」記憶から形づくった執行役で、「星を止めれば傷つかない」という間違った守り方を実行した存在とする。

**理由**: 既存企画の根幹を守りつつ、PrologueのbossをFinaleの主題へ伏線として再利用するため。

### DEC-P11-11 星守りを戦士・王家ではなく世話役として確定する

**決定**: 星守りは地域を歩き、土地の変化を聞き、人々の話を集め、濁った星をしずめ、記憶を土地へ返していた世話役・道案内役とする。ペンダントは王家の証ではなく星地図を安全に持ち運ぶ古い道具。おばあちゃんは詳細を知らない既存設定を維持する。

ひめは血筋だけで選ばれた勇者ではない。家系とのつながりはペンダントが応じる条件の一部だが、各地で「困っているものを見て、しずめて、話を聞く」選択を続けることで主人公になる。

**理由**: 既存の「選ばれた勇者にしない」を完成版の設定として成立させるため。

### DEC-P11-12 シロとくろぼしは善悪の対ではなく役割の対とする

**決定**:

- シロ: 人と土地の間を導き、記憶を見つけ、戻す方向を示す働き。
- くろぼし: すぐには戻せない重い記憶を一時的に受け止める働き。

シロは古代から同じ個体が生き続けた万能案内役ではなく、星地図に受け継がれた白鷺の「導く働き」が、ひめとの接触で再び形を取った守り鳥とする。

**理由**: シロも物語の答えを最初から知る説明装置にせず、ひめと一緒に星守りの役目を思い出す物語にするため。

### DEC-P11-13 Canvas + DOMを維持し、data-driven化で拡張する

**既存構成**: TypeScript + Vite + Canvas 2D + DOM UI + localStorage。`ExploreScreen` は道後／松山城固有分岐を持ち、`AssetLoader.loadManifest()` はmanifest全画像を一括loadする。

**決定**: P11ではgame engine移行を行わない。P12以降、必要な順に以下を導入する。

1. `AdventureAreaDefinition` / `SubareaDefinition`。
2. Quest/Objective Service分離。
3. Area bundle lazy loading + next Subarea preload。
4. chunked map。
5. entity spatial indexing（第一候補はsimple uniform grid）。
6. map editorへexit/checkpoint/ability gate/secret/landmarkを追加。
7. SaveData schema versioning/migration。
8. Area単位audio bundle。
9. browser verifierのarea critical path化。

**理由**: 現行architectureを捨てるほどの根拠はない一方、8 Adventure Area規模で現在の一括load・地域hard-codeを続けるのは負債になるため。

### DEC-P11-14 smartphoneは横画面を正式な主プレイ姿勢とする

**決定**: field/battleは横画面を正式姿勢とする。既存左joystickを維持し、run buttonは追加しない。主Interact約56 CSS px、補助button 48 CSS px以上を設計目標とする。Active Card最大6枚、小さい横画面では3×2配置を優先する。必須drag/long-press/pinch操作は導入しない。

**理由**: 広いfieldを縦画面に圧縮せず、P10のtouch操作資産を生かしながら小学生の誤tapと長距離操作疲労を抑えるため。

### DEC-P11-15 P12は「しまなみ Adventure Area Vertical Slice」とする

**決定**: P12は今治市・上島町を対象にした **A2 しまなみ・島風の航路** をVertical Sliceとして実装する。

検証項目はHub→複数Subarea→再合流、`風よみ`、橋・帆・風車・潮、再訪gate、少数side content、fast travel、lazy asset、SaveData拡張、横画面smartphone、P10回帰。

**Hard Gate**:

- 60〜80分で土地の星まで通せる。
- 意味ある発見の中央値20〜45秒、通常の無発見歩行60秒超を原則作らない。
- 必須戦闘3〜5、全敵symbol 6〜10。
- 小puzzle 2〜4、任意event 1〜2、再訪gate 1〜2。
- route分岐後3〜8分以内に手掛かりまたは報酬が返る。
- checkpoint/autosave 5〜8分以内。
- `風よみ`取得前後で同じ地点の意味が変わる。
- smartphone横画面で移動・Interact・Shiro Search・最大6cardを安全に操作できる。
- P10 Prologue回帰を壊さない。

**理由**: 完成版本編で新たに必要な探索・地域差・能力・再訪・map分割・mobile UXを、1地域で最も多く検証できるため。

## 2026-08-26 P12 Chrome CI / Hard Gate判定

### DEC-P12-01 P12 vertical sliceは条件付きPASSでmainへ統合する

P12のChrome CI run #95で、P7〜P12の全browser gate、typecheck、lint、map/editor検証、buildをPASSした。P12専用verifierは、6エリアのcritical path、橋道route、必須敵、`風よみ`取得、同じ風車の再訪、Boss、save telemetry、390px touch UI、runtime error 0件を確認した。

この結果から、P12の実装・操作・Prologue回帰Hard GateはPASSと判定する。ただしCI verifierはseed済みcritical pathであり、60〜80分の人手通しプレイ、発見間隔中央値20〜45秒、無発見移動60秒以内、checkpoint/autosave 5〜8分を直接測定しない。したがって探索KPI Hard Gateは条件付きPASSとし、A3以降の量産開始前に人手プレイで定量確認する。

**理由**: 縦切りのruntime統合と既存MVP回帰はmainへ取り込める状態だが、P11で定めた探索密度KPIを未計測のまま量産判断へ進めないため。

## P11参照文書

- `docs/specs/FULL_GAME_DESIGN.md`
- `docs/specs/ADVENTURE_AREA_SPEC.md`
- `docs/research/RPG_DESIGN_RESEARCH.md`
- `docs/research/EHIME_GAME_DESIGN_RESEARCH.md`
- `docs/ROADMAP.md`
- `docs/archive/DECISIONS_PRE_P11.md`（P0〜P10 Decision Log）

## 2026-08-26 P12.1 Shimanami Visual Completion & Manual Hard Gate

### DEC-P12.1-01 本番画像統合とHard Gate未成立を明示する

P12.1では、procedural fallbackを主要なA2背景から外し、A2-0〜A2-5の本番背景、地域敵、Boss、NPCをsource/runtime/provenance/SHA付きで管理する。Areaへ入った時点で、そのAreaに必要な背景・敵・NPCだけを遅延ロードする。

walkable polygon、collisionRects、guide pathは画像上の道へ合わせ、`風よみ`取得後の風車変化・風battle rule・風のコンパス報酬・上島の風壁ゲートをruntimeへ接続する。横画面ではsafe-area、手帳、星地図、6-card可読性の候補修正を入れる。

ただし、CI verifier・静的監査・sub-agent監査は人手60〜80分通しプレイの代替ではない。P12.1 branchは未デプロイで、production load、iOS/Android相当操作、探索KPI、通常戦／Boss時間も未計測である。したがって現時点の正式判定は **P12 NO-GO / REVISION REQUIRED** とし、P13の基盤共通化・A3以降の量産・main mergeを保留する。

**開始SHA**: `8bccc0941cbd57a89480406ce5ea1d64e766bdfa`
**Branch**: `feature/p12-1-shimanami-final-validation`

### DEC-P12.1-02 背景の地面をwalkableの正本にする

P12.1の本番背景を座標グリッドと重ねて確認した結果、旧geometryには海面・空・建物を歩行可能として扱う箇所があった。A2-0〜A2-5の `playerStart`、walkable polygon、guide path、collision rectangle、敵・NPC・interactableの主要位置を、背景上の港の舗装、橋道、集落の石道、見張り台のテラス、上島の島道、灯台広場へ再配置する。

上島では、任意敵をguide pathから外し、`風の近道`を開く前だけ風壁collisionを残す。必須敵とportalは、選択route・必要flag・必須敵撃破の順序をruntimeで強制する。

**理由**: static schema validationだけでは、見た目の地面と実際の歩行領域のずれを検出できないため。背景とgeometryの対応を、P12.1のvisual completionの必須条件とする。

### DEC-P12.1-03 戦闘復帰と検証telemetryを実プレイに近づける

戦闘開始時に安全な復帰位置を保存し、勝利結果は勝利入力直後に保存する。P12 telemetryにはarea enter/exit、発見、route choice、checkpoint、save、reload、battle start/end、Boss start/endを記録する。browser verifierは想定外のbattleを移動完了と扱わず、必要なbattle・Boss・autosaveイベントをfail-closedで確認する。

ただしbrowser verifierは通常操作の代替ではなく、keyboard eventとDOM buttonを使う契約検証である。60〜80分の人手通し、実機smartphone、production load/performanceは別Hard Gateとして残す。

**当時の判定**: geometry/runtime修正候補を追加した段階ではChrome CI再実行と人手Hard Gateが未完了だったため、**P12 NO-GO / REVISION REQUIRED** とした。この判定は2026-09-03のDEC-P12.1-06で候補準備状態のみ更新する。

## 2026-09-03 P12.1 Final Candidate QA

### DEC-P12.1-04 production backgroundの可視地面を最終geometryの正本とする

Actionsのvisual QA bundleから本番背景6枚・敵3種・Boss・NPCの実PNGを表示し、A2-0〜A2-5へwalkable/collision/guide/objectを重ねて確認する。manifestやschemaだけではvisual PASSとしない。

A2-0では、小舟route用walkable branchがフェリー船体側へ食い込んでいたためHighと判定した。船体側branchを撤去し、歩行域を石畳岸壁へ限定し、小舟portalを岸壁側へ移した。`maps:validate`が移動後portal中心の4px境界外を検出したため、portalをさらに可歩行域内へ調整した。

**理由**: schema上到達可能でも、背景上で海・船・建物を歩ける状態は本作の探索品質として不合格だからである。production画像と実geometryの整合を最終候補判定のHard Constraintとする。

### DEC-P12.1-05 browser verifierは固定座標ではなくruntimeの意味契約を検証する

Actions #104のP10失敗は、safe battle return導入後もP10 verifierがD-E03戦後の旧直線導線を仮定していたことが直接原因だった。途中runではruntime上「湯の星の気配」が通常interaction可能な地点まで到達できていたため、Dogo runtimeを巻き戻さず、verifierを実道・interaction可能状態・現行StarMap contractへ追随させた。

P12でも、A2-E03戦後の復帰は単一の期待座標ではなく、walkable内・collision外・enemy collider外であることを意味的に検証する。

**理由**: verifier座標をゲーム仕様の正本にすると、安全復帰やgeometry改善を誤ってregression扱いし、逆に実runtime bugを隠す可能性があるため。

### DEC-P12.1-06 READY FOR MANUAL HARD GATEとP12 FINAL PASSを分離する

Actions #123 (`33696821948`) のcode candidate HEAD `7e9fb2da52108ca620e2bb640594d5d2b2ca7c5d` で、`git diff --check`、npm ci、typecheck、lint、maps:validate、editor:smoke、build、P7〜P12 browserを同一runですべてPASSした。実画像visual/geometry reviewと8つの独立review passではCritical 0、High 0となった。

したがってP12.1 candidateは **READY FOR MANUAL HARD GATE** とする。ただしこれはP12 FINAL PASSではない。60〜80分の人手通常操作、exploration KPI本計測、iOS/Android実機相当Final QA、production merge後QAを完了するまでPR #16はmergeせず、P13/A3量産を開始しない。

**理由**: 自動CI・静的検証・画像レビューで保証できる範囲と、人間の探索時間・迷子復帰・操作疲労・実機性能でしか保証できない範囲を明確に分離するため。

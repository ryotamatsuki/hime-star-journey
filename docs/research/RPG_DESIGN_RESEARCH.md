# RPG DESIGN RESEARCH

## 0. 調査目的と読み方

P11では、人気作の見た目やシステムをコピーするのではなく、完成版 `hime-star-journey` の探索密度、誘導、再訪、成長、子ども向けUXへ転用できる設計原則を抽出する。

ユーザー指定の20分析項目を次の5群にまとめ、各タイトルについて必ず評価した。

- A = **1〜4** フィールド規模、探索密度、寄り道頻度、発見間隔。
- B = **5〜9** メイン／脇道、一本道感、移動、fast travel、map。
- C = **10〜14** 秘密、NPC、サブクエスト、敵密度、encounter方式。
- D = **15〜18** 自由と一本道、子どもの誘導、再訪、新能力による過去地域拡張。
- E = **19〜20** チュートリアルからのscale-up、1地域の時間／区切り。

注意: 多くの作品は「30秒ごとに宝箱」のような公式数値を公表していない。本書の「発見間隔」は公式値ではなく、公開されたゲーム構造と既知のプレイ構成からP11比較用に置いた **設計上の相対評価** である。正確な秒数を事実として扱わない。P12では本作自身のログで実測する。

## 1. タイトル別比較

### 1.1 Pokémon Scarlet / Violet

- **A (1〜4)**: 非常に大きいopen world。都市、湖、山、荒地を連続的に移動し、寄り道は高頻度。発見はポケモン、素材、景観、目的地など多層だが、移動だけの時間も生じる。
- **B (5〜9)**: 「決まった道がない」こと自体が売り。3ストーリーを自由順で進め、rideで陸・水・空を短縮する。地図は広域ナビの中心。
- **C (10〜14)**: 野生ポケモン自体が探索報酬兼encounter。町・トレーナー・アイテムが広範囲に分散。
- **D (15〜18)**: 自由度は非常に高い。移動能力の拡張で以前行けなかった地形へ届く。小3向け本作にそのまま移すと「選択肢が多すぎて次が分からない」危険がある。
- **E (19〜20)**: 導入後に地方全体が開くscale-upは強力。本作はPrologue後の全県zoom-outだけ採用し、完全open worldは採用しない。
- **採用**: 「狭い導入→世界全体が見える」演出、複数の行き先候補、移動能力で再訪。
- **不採用**: レベル順まで自由な全県open world、大量の採集物、長距離ride前提。

### 1.2 Pokémon Legends: Arceus

- **A**: 1枚の完全連続世界ではなく、拠点から大きな調査地域へ出る。地域内の発見密度は高い。
- **B**: Base Campが出発・回復・切替拠点。Ride Pokémonで陸、水、空を移動し、移動能力自体が探索の更新になる。
- **C**: 生物の分布、採集、依頼が探索を支える。戦闘を必ずしも全部行う必要はない。
- **D**: 地域を再訪すると新しいride能力で届く場所が増える。
- **E**: Hub→調査Areaという単位が「今日はここまで」を作りやすい。
- **採用**: Adventure Area内checkpoint、能力取得後の短い再訪、拠点から再出発。
- **不採用**: 捕獲・素材・クラフトの大量反復。

### 1.3 Paper Mario 系列（主に The Thousand-Year Door）

- **A**: 章ごとの中規模地域。密度は高く、狭い画面にもNPC、仕掛け、隠し物を置く。
- **B**: chapter hubと各地域を明確に分け、Switch版ではquick-travel pipesを改善。field abilityで隙間、段差、障害を越える。
- **C**: Star Pieces、Shine Sprites、Trouble、NPC会話、partner能力による秘密。
- **D**: ZL一発のpartner hintが「迷ったら助けを呼べる」設計として非常に重要。能力取得後の再訪も自然。
- **E**: 星を集める章構造が分かりやすく、1章ごとに物語の区切りがある。
- **採用**: シロのワンボタンヒント、少数のフィールド能力、chapter collection、明確なfast travel。
- **不採用**: Badgeの大量組合せ、partner切替をそのまま追加すること。

### 1.4 Mario & Luigi 系列（主に Brothership）

- **A**: 海上hubから複数の島を発見し、島ごとに独自課題を持つ。小〜中Areaの連鎖。
- **B**: Ocean Mapで複数の発見地点から行き先を選べる。島をつなぐと新Area・side questが増える。
- **C**: 島固有のパズル、NPC、戦闘、side quest。再訪時の新発見が明示される。
- **D**: Adventure Logでmain storyを再確認できる。開発者も「1島／1ストーリーを区切りに家族で少しずつ遊ぶ」考えを述べている。
- **E**: 本作のAdventure Area方式に最も近い比較対象。Hub→島→接続→変化→再訪のloopが強い。
- **採用**: しまなみP12のHub/島方式、Area clearを中断点にする、再訪でside eventを増やす。
- **不採用**: レベル上げ前提、gear/plug/rank-up等の多層growth。

### 1.5 The Legend of Zelda 系列（BOTW / TOTKを含む）

- **A**: 大規模open fieldで遠景ランドマークが探索を誘う。発見密度を「地形の気になる形」まで広げている。
- **B**: プレイヤーが自分でルートを決める。移動自体に登る、滑空する、組み立てる等の判断がある。
- **C**: shrine、cave、Korok、NPC、素材、敵拠点など極めて多層。
- **D**: 能力と物理システムにより一つの問題へ複数解を持たせる。
- **E**: 世界の大きさを早期に見せるscale-upは参考になる。
- **採用**: 遠景ランドマーク、複数解の「考え方」、過去地域が新能力で再解釈される感覚。
- **不採用**: 自由climb、物理sandbox、数百収集物、広大な空白移動。

### 1.6 Zelda: Link's Awakening

- **A**: 一つの島に町、野外、dungeonが密に詰まる。大世界より「戻ると意味が変わる島」。
- **B**: 収集する楽器が大目標。各dungeon能力で島の通行可能範囲が広がる。
- **C**: 隠し洞窟、heart、NPC交換等を短い距離で配置。
- **D**: Metroidvania的な再訪は強いが、能力数と記憶要求をそのまま小3向けにすると複雑。
- **E**: 小さな地理を繰り返し使うため、世界が広くなくても冒険感を出せる。
- **採用**: 「小さめだが密な地域」、新能力後の既知地点再解釈。
- **不採用**: 主進行で大量のバックトラック、交換イベントの長い記憶鎖。

### 1.7 Zelda: Echoes of Wisdom

- **A**: 複数地域を自由に巡り、echoで障害へ多様な解法を持つ。
- **B**: waypoint・horseで長距離移動を圧縮。
- **C**: side quest/minigame/treasureがルート外にある。
- **D**: bedを積む、water blockを使う等、同じ問題へ複数解。開発者インタビューでも自由と直感性の両立が重視される。
- **E**: 初期能力が増えても基本操作の語彙が大きく変わらない。
- **採用**: 「星の力」単一ボタンから文脈に応じた能力を使う、ルートに2通り程度の解法。
- **不採用**: 大量echoの記憶・選択UI。

### 1.8 Dragon Quest XI

- **A**: 町→広いfield→dungeonの伝統的構造。fieldは時間・天候・採取を含む。
- **B**: 馬で長距離を短縮し、campが休憩・saveの節になる。
- **C**: 町で情報を得てfieldへ出る。宝箱・採取・monsterが標準的な探索報酬。
- **D**: 主筋は分かりやすく、field側に自由を持たせる「guided openness」。
- **E**: 町・field・camp・dungeonの呼吸が明瞭。
- **採用**: Hubで状況理解→field→Deep Spot、checkpointを見える休憩点にする。
- **不採用**: 長時間RPGの大量装備・skill panel・経験値grind。

### 1.9 Dragon Quest Monsters 系（The Dark Prince）

- **A**: 複数の環境Areaが季節で変化する。
- **B**: 季節・天候が道とmonster出現を変え、同じ場所の再訪価値を生む。
- **C**: monster collectionとsynthesisが大きな寄り道動機。
- **D**: 「世界状態が変わると道が開く」という再訪原理が強い。
- **E**: 系統的な変化で少ないmapを再利用できる。
- **採用**: 土地の星取得前後で同じSubareaの通路・NPC・敵配置が変わる。
- **不採用**: 500体級collection、synthesis、複雑party building。

### 1.10 Ni no Kuni

- **A**: 多数のlocation、quest、secretを持つ大きなfantasy world。
- **B**: companion Drippyが物語と案内の両方を担う。
- **C**: familiar、quest、secretの量が多い。
- **D**: 絵本／animation的な世界へ感情的ストーリーを統合する点は本作と親和性が高い。
- **E**: 見た目の優しさに対しsystemは深い。
- **採用**: シロを世界観説明役ではなく「一緒に冒険して迷いを解く相棒」にする。
- **不採用**: familiar育成、複数character切替、systemの多層化。

### 1.11 Fantasy Life 系（Fantasy Life i）

- **A**: open world的な大陸をclimb、swim、rideで移動。
- **B**: minimap・採集点等、生活系活動と探索が同居。
- **C**: 仕事・採集・craft・戦闘の活動密度が高い。
- **D**: 「何をしても小さな進捗」がある一方、自由な活動選択は本作には過剰。
- **E**: camera視野拡張がcommunity feedbackで行われた例から、広いfieldほど視認範囲がUXを左右する。
- **採用**: 探索中に小さな反応を絶やさない、スマホでは視界とlandmarkを優先。
- **不採用**: 多職業・craft・採集の常時parallel progression。

### 1.12 Yo-kai Watch

- **A**: 生活圏の街を歩き、路地・建物・小さな秘密を探す。子どもに身近なscale。
- **B**: mapにObjective、Direction to objective、Quest location、talkable人物、敵等を表示できる。
- **C**: 妖怪探索とNPC questが日常空間へ埋め込まれる。
- **D**: 「目的は見失わせないが寄り道できる」が本作に非常に適合。
- **E**: 町の小さな異変から冒険へ広げる導入も参考になる。
- **採用**: 主目的矢印ON/OFF、ランドマークmap、近所の寄り道。
- **不採用**: 大量の妖怪収集・gacha的collection loop。

### 1.13 Sea of Stars

- **A**: classic RPG的worldだが、field内で泳ぐ・登る・跳ぶ等の移動を増やす。
- **B**: 移動の小actionを増やし、通路をただ歩くだけにしない。
- **C**: 宝箱、謎、戦闘が短い区間で交互に来る。
- **D**: traversal能力は分かりやすいが、本作ではplatforming精度を要求しない形へ落とす必要がある。
- **E**: 一本道寄りでも移動の触感を変えて退屈を減らせる。
- **採用**: 風・水・灯りなど、歩行途中に1操作を挟む環境反応。
- **不採用**: smartphoneで精密入力を要求するplatforming。

### 1.14 Chained Echoes

- **A**: 広いfield、隠し洞窟、徒歩／mech／airshipのscale change。
- **B**: random encounterを避け、field上のbattleと探索を連続化。
- **C**: 多数のquest、装備、skill、探索報酬。
- **D**: 移動形態が増えると過去fieldの意味が変わる。
- **E**: JRPGの重厚さは本作の対象年齢には過剰。
- **採用**: symbol encounter継続、移動能力で同じ地域を再解釈。
- **不採用**: 複雑なgear/skill/mech combat、長大playtime。

### 1.15 CrossCode

- **A**: 大きいfield、高密度secret、複雑environment puzzle。
- **B**: 多層pathと高低差で一本道感を消す。
- **C**: 100超quest級の大量side content、enemy、chest。
- **D**: puzzle masteryと探索が強く結びつくが、認知負荷が非常に高い。
- **E**: HTML5/Canvas系の高度なbrowser game実例として技術面は参考になる。
- **採用**: browserでも地域差のあるfieldを作れるという技術的示唆、visible secretへの脇道。
- **不採用**: 複雑な高低差puzzle、100 quest、長時間action combat。

### 1.16 Bug Fables

- **A**: chapter型worldで3人のfield abilityを使い分ける。
- **B**: field abilityとturn battleが同じcharacter identityに結びつく。
- **C**: 30以上のside quest規模。
- **D**: 新能力で既存地域の道が広がる。
- **E**: abilityとbattleが分離しない点が参考。
- **採用**: 星能力をfieldだけでなく地域battle ruleにも出す。
- **不採用**: 3人partyの常時切替、side quest量。

### 1.17 Child of Light

- **A**: fairy-tale worldを飛行で探索し、比較的小さな空間にsecretを置く。
- **B**: companion Igniculusが探索・戦闘双方で補助する。
- **C**: storybook visualとturn-based battleを融合。
- **D**: 子どもにも読める幻想性と重いテーマの両立。
- **E**: 太陽・月・星を戻す大目標が視覚的に分かりやすい。
- **採用**: シロがfield/battle両方で同じ役割語彙を持つ、星の復旧を視覚化。
- **不採用**: companion cursorの独立操作。

### 1.18 Undertale

- **A**: field規模は比較的小さく、物語・NPC・敵固有interactionの密度が高い。
- **B**: main routeは比較的guided。
- **C**: enemyを殺さない独自解決が各戦闘のcharacter性になる。
- **D**: 「敵を倒す」以外の意味を戦闘systemへ直接載せる。
- **E**: 短めのRPGでも強い余韻を作れる。
- **採用**: `しずめる` を文言だけでなくboss勝利条件へ反映する。
- **不採用**: 高難度bullet action、meta構造のコピー。

### 1.19 EarthBound / MOTHER 2

- **A**: 街と道を連続的に探索し、現代的な生活空間をRPG fieldへする。
- **B**: 町の看板、店、NPCそのものが地理理解を助ける。
- **C**: 変なNPC、日用品、敵が寄り道の発見になる。
- **D**: 日常と奇妙さの混在が土地への愛着を作る。
- **E**: 小さな町から世界規模へ広げる。
- **採用**: 愛媛の「普通の暮らし」を名所と同じくらいfield素材にする。
- **不採用**: 大量の店・item管理、昔ながらのgrind。

### 1.20 OMORI

- **A**: 現実／記憶的worldの対比と、場所そのものが心理・記憶を表す構造。
- **B**: explorationがstory revealにつながる。
- **C**: hidden interactionが過去理解に結びつく。
- **D**: 記憶と場所をつなぐ表現は参考になるが、psychological horror、重い主題は小学3年生向け本作に不適合。
- **E**: worldの再解釈を物語の進展に使う。
- **採用**: `ほしあかり` で同じ場所の過去の輪郭が短く見える表現。
- **不採用**: horror、トラウマ中心のtone、隠された重大情報を読み解かないと理解できない構造。

### 1.21 TUNIC

- **A**: compact worldに大量のhidden routeとperspective secret。
- **B**: 手に入るmanual pages自体がmap/hintとなる。
- **C**: 「見えていたが意味を知らなかったもの」をsecretへする。
- **D**: 発見の快感は非常に強い一方、意図的な不親切・暗号性は対象年齢に不適合。
- **E**: 既知のworldが知識で拡張される。
- **採用**: 隠し道を完全不可視にせず、あとで「そういう意味だったのか」と分かる視覚印。
- **不採用**: manual解読、暗号、目的非表示、長時間の自力推理。

### 1.22 Lil Gator Game

- **A**: 小さなopen areaを自由に回り、各地にcharacterと短いactivityを置く。
- **B**: 移動の楽しさと友だちとの遊びが中心。
- **C**: health bar等の圧力を弱め、失敗不安より発見を優先。
- **D**: 子どもらしい遊びの目的がfield行動と直結。
- **E**: 短いsessionで1つの小さな出来事を終えやすい。
- **採用**: failure penaltyを低く、寄り道を「作業」ではなく短い遊びにする。
- **不採用**: 本作のstory/battleまで完全に無圧力にすること。

### 1.23 A Short Hike

- **A**: 小さな島を高密度に使い、道を外れるとNPC、item、景観、shortcutが見つかる。
- **B**: 山頂という明瞭な大目標がありつつ、行き方は自由。
- **C**: 短い会話・小さな依頼・移動能力強化が寄り道報酬。
- **D**: 開発者は「移動だけのopen world」よりunique/organic discoveryを重視している。全contentを見なくてもよいという設計が重要。
- **E**: 短時間の中で「大目標＋寄り道」を完成させる好例。
- **採用**: 明確な主目的、任意contentは見逃してよい、歩く途中の有機的発見。
- **不採用**: 自由climbをそのままsmartphone 2D fieldへ移植。

## 2. 20分析項目からの横断結論

1. **fieldの広さより密度**: 本作はopen world競争をしない。1 Areaを4〜7 Subareaへ分割する。
2. **探索密度**: 子ども向けでは景色だけの長距離移動を避ける。
3. **寄り道頻度**: 1〜4分で完結する小脇道を多数ではなく適量。
4. **発見間隔**: P12仮説を20〜45秒、60秒を通常空白上限として計測する。
5. **main/side**: 大目標は1つ、sideは見えるが必須にしない。
6. **一本道感対策**: 2ルート程度の軽い選択→短時間再合流が小3向けに適切。
7. **移動の退屈対策**: joystickを押すだけでなく、風、灯り、潮等の文脈actionを挟む。
8. **fast travel**: Area clear後だけでなく、初回攻略中も8〜12分程度ごとにcheckpointを解放する。
9. **map**: objectiveとlandmarkを同時に示し、詳細行政地図にしない。
10. **secret**: 完全不可視ではなく、色・音・風・星印の少なくとも1手掛かり。
11. **NPC**: 等間隔配置よりHub cluster＋field anchor。
12. **side quest**: 1〜3／Area。大量task boardは不要。
13. **enemy density**: 見える敵は45〜90秒程度、実戦は90〜150秒程度を目安。
14. **encounter**: 現行symbol encounterを維持。random encounterへ戻さない。
15. **guided freedom**: 進む方向は見えるが、途中の順番と寄り道は自分で決める。
16. **child guidance**: Paper Mario/Yo-kai Watch型の任意hintとobjective markerを採用。
17. **revisit**: ability取得後にmapへ自動印を付け、記憶力テストにしない。
18. **new abilities**: global field abilityは5つまで。選択menuでなくcontext action。
19. **scale-up**: MVP Ending→全県zoom-outはSV型の「世界が急に広がる」感覚だけを採る。
20. **地域時間**: 1 Area 45〜80分、1 Subarea 10〜18分。15〜30分sessionで中断しやすくする。

## 3. 小学3年生向けUX研究

### 3.1 Wayfinding / 認知負荷

子どもの空間navigationは成人と同じ前提にしない。研究では、子どもは分岐点近くのdistinctive landmarkに強く依存し、複雑・似た通路ではwayfindingが難しくなることが示されている。8歳程度でも一度見ただけの多数turn routeを正確に再現するのは容易ではない。

P11への変換:

- 「北東へ」より「赤い橋」「大きな風車」「白い窯」などのlandmark語。
- 似た分岐を3つ以上連続させない。
- 2つの意味ある分岐の間に目的再確認またはlandmark。
- main objectiveは1つ。
- 迷ったらShiro Hintを何度でも呼べる。
- map上に現在地、主目的、発見済みcheckpoint、再訪gateだけを優先表示。

### 3.2 読字量

小学3年生では学年別漢字習得途中であり、愛媛固有名詞は読みが難しいものも多い。

- 1吹き出し1〜2文。
- 固有名詞は初出でふりがな、または平仮名補助。
- 重要語は絵／iconとセット。
- 読まなくても背景変化・矢印・NPC motionで主目的が推測できる。
- 手帳は百科事典にせず、自動記録の短文＋任意詳細とする。

### 3.3 選択肢

- 通常prompt最大3択。
- battle Active Card最大6枚。
- field ability menuを5つ並べずcontext自動選択。
- subquestをHUDへ同時表示しない。

### 3.4 Touch target / 入力

Appleのdesign guidanceはbutton等のhit regionとして44×44pt以上を推奨し、WCAG 2.2もpointer targetのminimumとenhanced基準を持つ。本作はゲーム操作の誤タップ余裕を見て、主Interact約56 CSS px、補助48 CSS px以上を設計目標とする。

- 左joystickを継続。
- 右Interactを大きく固定。
- dragだけで解くpuzzleを必須にしない。
- visual feedbackを押下直後に出す。
- audio cueだけに依存せず、視覚cueを併記する。

### 3.5 失敗・save・session

- 戦闘負け→戦闘直前retry。
- currency/XP lossなし。
- 重要発見・戦闘・checkpoint後autosave。
- 5〜8分をsave機会上限の目安。
- 10〜18分Subarea、15〜30分で章の小区切り。
- boss直前に「ここから大きな戦い」表示とsave。

## 4. 採用する設計 / 採用しない設計

### 採用

- Paper Mario: 章構造、能力再訪、ワンボタンhint、fast travel。
- Mario & Luigi: Hub→島、島ごとの異なる遊び、再訪で変化、区切りやすさ。
- Yo-kai Watch: objective direction、生活圏scale、子どもが迷いにくいmap。
- Link's Awakening: 小さく密な地理とability revisit。
- Echoes of Wisdom: 一つの問題へ複数の軽い解法、waypoint。
- DQXI: Hub/field/deep spot/checkpointの呼吸。
- DQ Monsters: world state変化で再訪価値。
- Undertale: 敵を消すのでなく別の方法で決着する意味。
- A Short Hike / Lil Gator Game: 大目標は明瞭、side contentは見逃してよい、低い失敗penalty。

### 採用しない

- Pokémon SV/BOTW級の全県seamless open world。
- Zelda型自由climb・physics sandbox。
- CrossCode級の高難度environment puzzle。
- Pokémon/DQM級collection数。
- DQXI/Chained Echoes級のgear/skill/XP layer。
- TUNIC型の意図的不親切・暗号navigation。
- OMORIのpsychological horror tone。
- 全Area同一collectible checklist。

## 5. P11で導出する本作の定量仮説

| 指標 | 仮説 | 検証フェーズ |
|---|---:|---|
| 意味ある発見 | 20〜45秒 | P12 play log |
| 通常の無発見歩行上限 | 60秒 | P12 play log |
| 敵視認 | 45〜90秒 | P12 |
| 通常戦間隔 | 90〜150秒 | P12 |
| 通常戦時間 | 45〜90秒 | P12 |
| 小puzzle hint開始 | 20〜30秒停滞後に任意hint | P12 |
| checkpoint | 5〜8分 | P12 |
| fast-travel node | 初回8〜12分進行ごと | P12 |
| Subarea | 10〜18分 | P12 |
| Adventure Area | 45〜80分中心 | P12以降 |
| main全体 | 8〜10時間 | Full Game |
| side込み | 12〜15時間 | Full Game |

## 6. 主な出典

### Nintendo / Pokémon

- Pokémon Scarlet/Violet: https://www.nintendo.com/jp/topics/article/1e69cb9c-875f-40c8-98da-ffcdd66fe7bd
- Pokémon Scarlet/Violet official product: https://www.nintendo.com/us/store/products/pokemon-scarlet-114549/
- Pokémon Legends: Arceus ride: https://www.nintendo.com/us/store/products/pokemontm-legends-arceus/
- Pokémon Legends: Arceus base camps: https://www.nintendo.com/jp/topics/article/63f89cc7-c746-47c0-85ac-fa157939c9df

### Nintendo / Mario RPG

- Paper Mario TTYD official: https://www.nintendo.com/us/store/products/paper-mario-the-thousand-year-door-switch/
- Paper Mario partner hints/abilities: https://play.nintendo.com/news-tips/tips-tricks/swappable-partners-paper-mario-the-thousand-year-door/
- Paper Mario quick travel/hints: https://www.nintendo.com/au/news-and-articles/7-new-details-in-paper-mario-the-thousand-year-door/
- Mario & Luigi: Brothership field: https://www.nintendo.com/jp/switch/a8e6a/field/index.html
- Mario & Luigi: Brothership overview: https://www.nintendo.com/us/whatsnew/set-sail-for-adventure-in-mario-and-luigi-brothership/
- Ask the Developer Vol.15 Part 3: https://www.nintendo.com/us/whatsnew/ask-the-developer-vol-15-mario-and-luigi-brothership-part-3/
- Ask the Developer Vol.15 Part 4: https://www.nintendo.com/en-ca/whatsnew/ask-the-developer-vol-15-mario-and-luigi-brothership-part-4/

### Nintendo / Zelda

- Link's Awakening: https://zelda.nintendo.com/links-awakening/
- Echoes of Wisdom: https://www.nintendo.com/us/store/products/the-legend-of-zelda-echoes-of-wisdom-switch/
- Nintendo Ask the Developer / Echoes of Wisdom: https://www.nintendo.com/us/whatsnew/ask-the-developer-vol-13-the-legend-of-zelda-echoes-of-wisdom-part-1/

### Square Enix / Level-5 / Bandai Namco

- DQ Monsters: The Dark Prince: https://dragonquest.square-enix-games.com/games/en-us/dqmonsters/
- DQ Monsters Steam feature description: https://gb.store.square-enix-games.com/dragon-quest-monsters_-the-dark-prince---digital
- Ni no Kuni: https://www.bandainamcoent.com/games/ni-no-kuni-wrath-of-the-white-witch
- Fantasy Life i: https://www.fantasylife.jp/fli/en/

### Indie / other official sources

- Sea of Stars press kit: https://sabotagestudio.com/presskits/sea-of-stars/
- CrossCode: https://www.cross-code.com/en/home
- Bug Fables: https://bugfables.com/
- Undertale: https://undertale.com/
- TUNIC / Finji: https://www.finji.co/games/tunic
- A Short Hike: https://ashorthike.com/
- Lil Gator Game: https://www.nintendo.com/us/store/products/lil-gator-game-switch/
- OMORI: https://store.steampowered.com/app/1150690/OMORI/

### 子ども向けUX / Accessibility

- Apple Human Interface Guidelines, Buttons: https://developer.apple.com/design/human-interface-guidelines/buttons
- Apple Accessibility: https://developer.apple.com/design/human-interface-guidelines/accessibility
- WCAG 2.2 Target Size: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- 文部科学省 学習指導要領関連: https://www.mext.go.jp/a_menu/shotou/new-cs/
- Child landmark / wayfinding research（Frontiers）: https://www.frontiersin.org/journals/psychology

## 7. 出典の扱い

公式情報で確認できるもの（open world、story order、field ability、waypoint、side quest、map marker等）は公式sourceを優先した。探索の秒数や「密度が高い／低い」は公式公表値ではなくP11の比較評価であり、`hime-star-journey` の定量値はP12で実測して修正する。

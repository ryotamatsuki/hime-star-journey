# MVP実装仕様書

## 実装方針

MVPでは、プレイヤー側はひめ1人、敵側は1体または2体とします。ただし、BattleSystemは最初から **味方配列 vs 敵配列** の構造で実装します。これにより、MVPでは分かりやすい1人旅を維持しつつ、将来の仲間追加や複数味方に対応できる設計にします。

## ストーリー実装前提

P5.9以降は、`docs/specs/企画書.md` を物語、世界観、MVP範囲の正本として扱います。

- ひめは家族旅行で道後温泉へ向かう。
- 出発前に、おばあちゃんからみかん星のペンダントを受け取る。
- ひめの家は、忘れられた星守りの家系につながっている。
- ペンダントは白鷺のお守りであり、土地の星を映す星地図の器である。
- カゲマサの手下が奪うのは、ペンダント全体ではなく中央の「みかん星の核」である。
- 外枠と鎖はひめの手元に残り、弱い星地図機能と星のカードは使える。
- P6では、みかん星の核の完全奪還、松山城探索、カゲマサ戦、城の星取得、MVPエンディングは実装しない。

## 採用技術

| 区分 | 採用 |
|---|---|
| 実行環境 | ブラウザ |
| 言語 | TypeScript |
| ビルド | Vite |
| 描画 | HTML Canvas 2D API |
| UI | HTML / CSS / DOM |
| ループ | requestAnimationFrame |
| 入力 | KeyboardEvent / PointerEvent |
| セーブ | localStorage |
| アセット | PNG、スプライトシート |
| ゲームエンジン | 使用しない |
| ゲームフレームワーク | 使用しない |

## 推奨ディレクトリ構成

```text
src/
  main.ts
  core/
    GameApp.ts
    GameLoop.ts
    ScreenManager.ts
    InputManager.ts
    AssetLoader.ts
    SaveManager.ts
    EventBus.ts
  screens/
    TitleScreen.ts
    PrologueScreen.ts
    StarMapScreen.ts
    ExploreScreen.ts
    BattleScreen.ts
    NotebookScreen.ts
    EndingScreen.ts
  entities/
    Player.ts
    Companion.ts
    EnemySymbol.ts
    NPC.ts
    Interactable.ts
  animation/
    SpriteAnimator.ts
    AnimationClip.ts
    AnimationRegistry.ts
    Effects.ts
    ScreenShake.ts
  systems/
    CollisionSystem.ts
    BattleSystem.ts
    QuestSystem.ts
    ProgressFlagSystem.ts
    StarLevelSystem.ts
    TravelSystem.ts
    RenderDepthSystem.ts
  ui/
    DialogueBox.ts
    StatusPanel.ts
    QuestPanel.ts
    MiniMap.ts
    CardHand.ts
    NotebookView.ts
    StarMapView.ts
  data/
    locations.ts
    maps.ts
    quests.ts
    enemies.ts
    encounters.ts
    enemySymbols.ts
    skills.ts
    items.ts
    lore.ts
    starMap.ts
    assets.ts
    animations.ts
  types/
    game.ts
    save.ts
    battle.ts
    map.ts
    animation.ts
    assets.ts
public/assets/generated/
  backgrounds/
  characters/
  enemies/
  bosses/
  cards/
  ui/
  effects/
```

## Screen仕様

```ts
export type ScreenId =
  | "title"
  | "prologue"
  | "starMap"
  | "explore"
  | "battle"
  | "notebook"
  | "ending";

export interface GameScreen {
  id: ScreenId;
  enter(params?: unknown): void;
  update(deltaTime: number): void;
  render(ctx: CanvasRenderingContext2D): void;
  exit(): void;
}
```

## データ型

### EncounterData

```ts
export type EncounterEnemyData = {
  enemyId: string;
  label?: string;
};

export type EncounterData = {
  id: string;
  name: string;
  enemies: EncounterEnemyData[];
  isBoss?: boolean;
  required?: boolean;
};
```

### EnemySymbolData

```ts
export type EnemySymbolData = {
  symbolId: string;
  encounterId: string;
  locationId: string;
  areaId: string;
  required: boolean;
  position: { x: number; y: number };
  defeatedFlag: string;
  openedPathFlag?: string;
};
```

### BattleActor / BattleState

```ts
export type BattleActorType = "player" | "ally" | "enemy" | "boss";

export type BattleActor = {
  instanceId: string;
  characterId: string;
  name: string;
  actorType: BattleActorType;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense?: number;
  speed?: number;
  status: { blind?: boolean; guarded?: boolean; charging?: boolean };
  availableCardIds?: string[];
  isCommandable: boolean;
};

export type BattleState = {
  partyMembers: BattleActor[];
  enemies: BattleActor[];
  activeActorInstanceId: string;
  selectedTargetInstanceId?: string;
  turnCount: number;
  phase: "playerCommand" | "targetSelect" | "actorAction" | "enemyAction" | "victory" | "defeat";
  isBossBattle: boolean;
  sealGauge?: { targetInstanceId: string; value: number; max: number };
};
```

### SkillTargetType

```ts
export type SkillTargetType =
  | "singleEnemy"
  | "allEnemies"
  | "self"
  | "singleAlly"
  | "allAllies"
  | "bossSeal";
```

MVPでは `allEnemies`、`singleAlly`、`allAllies` は予約のみです。

## エンカウント定義

```ts
export const encounters: EncounterData[] = [
  { id: "enc_dogo_oni_01", name: "湯どろぼう鬼", enemies: [{ enemyId: "dogo_oni" }], required: true },
  { id: "enc_dogo_oni_02", name: "湯どろぼう鬼", enemies: [{ enemyId: "dogo_oni" }], required: true },
  { id: "enc_dogo_lantern_01", name: "あお提灯", enemies: [{ enemyId: "dogo_lantern" }], required: true },
  { id: "enc_dogo_armor_01", name: "さびよろい", enemies: [{ enemyId: "dogo_armor" }], required: true },
  { id: "enc_dogo_mouse_pair_01", name: "ゆげネズミたち", enemies: [{ enemyId: "dogo_mouse", label: "A" }, { enemyId: "dogo_mouse", label: "B" }], required: false },
  { id: "enc_dogo_mouse_01", name: "ゆげネズミ", enemies: [{ enemyId: "dogo_mouse" }], required: false },
  { id: "enc_castle_soldier_01", name: "影足軽", enemies: [{ enemyId: "castle_soldier" }], required: true },
  { id: "enc_castle_soldier_pair_01", name: "影足軽たち", enemies: [{ enemyId: "castle_soldier", label: "A" }, { enemyId: "castle_soldier", label: "B" }], required: true },
  { id: "enc_castle_oni_01", name: "石垣鬼", enemies: [{ enemyId: "castle_oni" }], required: true },
  { id: "enc_castle_oni_02", name: "石垣鬼", enemies: [{ enemyId: "castle_oni" }], required: true },
  { id: "enc_castle_well_01", name: "くらやみ井戸", enemies: [{ enemyId: "castle_well" }], required: true },
  { id: "enc_castle_crow_soldier_01", name: "黒羽ガラスと影足軽", enemies: [{ enemyId: "castle_crow" }, { enemyId: "castle_soldier" }], required: false },
  { id: "enc_castle_crow_01", name: "黒羽ガラス", enemies: [{ enemyId: "castle_crow" }], required: false },
  { id: "enc_castle_soldier_02", name: "影足軽", enemies: [{ enemyId: "castle_soldier" }], required: true },
  { id: "enc_boss_kagemasa", name: "黒よろいの大将カゲマサ", enemies: [{ enemyId: "boss_kagemasa" }], isBoss: true, required: true }
];
```

## BattleScreen初期化

BattleScreenは `encounterId` を受け取り、`EncounterData` から敵配列を生成します。

```ts
function createBattleState(encounter: EncounterData, save: SaveData): BattleState {
  const partyMembers = createPartyMembers(save);
  const enemies = encounter.enemies.map((entry, index) => {
    const base = getEnemyData(entry.enemyId);
    const suffix = entry.label ?? String(index + 1);
    return {
      instanceId: `${entry.enemyId}_${suffix}`,
      characterId: entry.enemyId,
      name: entry.label ? `${base.name}${entry.label}` : base.name,
      actorType: encounter.isBoss ? "boss" : "enemy",
      hp: base.maxHp,
      maxHp: base.maxHp,
      mp: 0,
      maxMp: 0,
      attack: base.attack,
      status: {},
      isCommandable: false
    };
  });

  return {
    partyMembers,
    enemies,
    activeActorInstanceId: partyMembers[0].instanceId,
    turnCount: 1,
    phase: "playerCommand",
    isBossBattle: !!encounter.isBoss,
    sealGauge: encounter.isBoss ? { targetInstanceId: enemies[0].instanceId, value: 6, max: 6 } : undefined
  };
}
```

MVPの `createPartyMembers` はひめ1人を返します。

```ts
function createPartyMembers(save: SaveData): BattleActor[] {
  return [{
    instanceId: "party_hime",
    characterId: "hime",
    name: "ひめ",
    actorType: "player",
    hp: save.hp,
    maxHp: save.maxHp,
    mp: save.mp,
    maxMp: save.maxMp,
    attack: 0,
    status: {},
    availableCardIds: save.unlockedCards,
    isCommandable: true
  }];
}
```

## カード対象処理

- `singleEnemy`: 敵が1体なら自動選択。2体ならターゲット選択UIを表示する。
- `self`: ひめ自身に即時適用する。
- `bossSeal`: ボス戦のみ使用可能。カゲマサの封印ゲージを削る。
- MVPでは味方対象選択UIを表示しない。

## 勝利・敗北判定

```ts
const isVictory = battleState.enemies.every(enemy => enemy.hp <= 0);
const isDefeat = battleState.partyMembers.every(member => member.hp <= 0);
```

## SaveData

```ts
export type SaveData = {
  version: string;
  currentChapterId: string;
  currentLocationId: string;
  currentAreaId: string;
  currentScreenId: ScreenId;
  partyMemberIds: string[];
  activePartyMemberIds: string[];
  starLevel: number;
  hp: number;
  mp: number;
  maxHp: number;
  maxMp: number;
  unlockedCards: string[];
  collectedStars: string[];
  unlockedLoreIds: string[];
  defeatedEnemyIds: string[];
  clearedQuestIds: string[];
  unlockedLocations: string[];
  openedPaths: string[];
  acquiredItems: Record<string, number>;
  acquiredCharms: string[];
  flags: Record<string, boolean>;
  lastSynopsis: string;
  savedAt: string;
};
```

MVP初期値:

```ts
partyMemberIds: ["hime"];
activePartyMemberIds: ["hime"];
```

localStorageキー:

```text
hime_star_journey_mvp_save_v1
```

## AssetLoader方針

- 起動時に必須アセットを読み込む。
- 画像読み込み失敗時は、該当アセットIDを失敗リストに記録する。
- 描画側は失敗アセットを検知して代替図形を描く。
- 画像失敗を理由にゲーム全体を停止させない。

## 2.5D表現

本作の2.5Dは3Dモデルではなく、手描き風スプライト、フレームアニメーション、Y座標による奥行き順、足元の柔らかい影、歩行時の上下揺れ、敵の浮遊や点滅、攻撃時の前進・後退で表現します。

## 受入条件

- 敵シンボルが `encounterId` を参照している。
- `EncounterData` により、1体または2体の敵を生成できる。
- MVP内に複数敵エンカウントが3件以上ある。
- 複数敵バトルで攻撃対象を選択できる。
- 敵1体だけを倒した場合、残りの敵との戦闘が続く。
- 敵全員をしずめると勝利する。
- BattleSystemが `partyMembers` と `enemies` の配列で動作する。
- 味方1人固定、敵1体固定のハードコードを避ける。
- アセット読み込み失敗時もゲームが止まらない。
- カゲマサを星封じで再封印できる。
- MVPエンディングまで通して遊べる。








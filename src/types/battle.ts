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

export type BattleActorType = "player" | "ally" | "enemy" | "boss";

export type BattleActor = {
  instanceId: string;
  characterId: string;
  name: string;
  actorType: BattleActorType;
  assetId?: string;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense?: number;
  speed?: number;
  status: {
    blind?: boolean;
    guarded?: boolean;
    charging?: boolean;
    guardTurns?: number;
    guardDamageReduction?: number;
  };
  availableCardIds?: string[];
  isCommandable: boolean;
};

export type BattlePhase =
  | "playerCommand"
  | "targetSelect"
  | "actorAction"
  | "enemyAction"
  | "victory"
  | "defeat";

export type BattleState = {
  partyMembers: BattleActor[];
  enemies: BattleActor[];
  activeActorInstanceId: string;
  selectedTargetInstanceId?: string;
  turnCount: number;
  phase: BattlePhase;
  isBossBattle: boolean;
  sealGauge?: {
    targetInstanceId: string;
    value: number;
    max: number;
  };
};

export type SkillTargetType =
  | "singleEnemy"
  | "allEnemies"
  | "self"
  | "singleAlly"
  | "allAllies"
  | "bossSeal";

export type CardId =
  | "card_mikan_attack"
  | "card_shirasagi_ofuda"
  | "card_dogo_drop"
  | "card_yukemuri_veil"
  | "card_castle_guard"
  | "card_star_seal";

export type BattleCardRole = "attack" | "heal" | "guard" | "seal";

export type BattleCardData = {
  id: CardId;
  name: string;
  shortName: string;
  description: string;
  targetType: SkillTargetType;
  role: BattleCardRole;
  assetId: string;
  mpCost: number;
  power: number;
  guardDamageReduction?: number;
  guardTurns?: number;
  bossSealDamage?: number;
};

export type BattleStartParams = {
  enemySymbolId: string;
  encounterId: string;
  returnLocationId: string;
  returnAreaId: string;
  isBoss: boolean;
};

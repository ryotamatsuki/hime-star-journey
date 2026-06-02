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

export type BattleStartParams = {
  enemySymbolId: string;
  encounterId: string;
  returnLocationId: string;
  returnAreaId: string;
  isBoss: boolean;
};

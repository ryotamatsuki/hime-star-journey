import { getBattleCard, normalizeBattleCardIds } from "../data/cards";
import { getEnemyData } from "../data/enemies";
import type {
  BattleActor,
  BattleCardData,
  BattleState,
  CardId,
  EncounterData
} from "../types/battle";
import type { SaveData } from "../types/save";

export type BattleEffectKind = "attack" | "heal" | "guard" | "seal" | "enemyAttack";

export type BattleEffect = {
  kind: BattleEffectKind;
  sourceInstanceId: string;
  targetInstanceId: string;
};

export type BattleActionResult = {
  state: BattleState;
  logs: string[];
  effect?: BattleEffect;
};

export function createBattleState(encounter: EncounterData, save: SaveData): BattleState {
  const partyMembers = createPartyMembers(save);
  const enemies = encounter.enemies.map((entry, index): BattleActor => {
    const base = getEnemyData(entry.enemyId);
    const suffix = entry.label ?? (encounter.enemies.length > 1 ? String(index + 1) : "");
    const enemyName = base?.name ?? entry.enemyId;

    return {
      instanceId: `${entry.enemyId}_${index + 1}`,
      characterId: entry.enemyId,
      name: suffix ? `${enemyName}${suffix}` : enemyName,
      actorType: encounter.isBoss || base?.actorType === "boss" ? "boss" : "enemy",
      assetId: base?.assetId,
      hp: base?.maxHp ?? 16,
      maxHp: base?.maxHp ?? 16,
      mp: 0,
      maxMp: 0,
      attack: base?.attack ?? 4,
      defense: base?.defense ?? 0,
      speed: base?.speed ?? 6,
      status: {},
      isCommandable: false
    };
  });

  return {
    partyMembers,
    enemies,
    activeActorInstanceId: partyMembers[0]?.instanceId ?? "party_hime",
    turnCount: 1,
    phase: "playerCommand",
    isBossBattle: Boolean(encounter.isBoss),
    sealGauge: encounter.isBoss
      ? {
          targetInstanceId: enemies[0]?.instanceId ?? "boss",
          value: 6,
          max: 6
        }
      : undefined
  };
}

export function getAliveEnemies(state: BattleState): BattleActor[] {
  return state.enemies.filter((enemy) => enemy.hp > 0);
}

export function getPartyLeader(state: BattleState): BattleActor | undefined {
  return state.partyMembers.find((member) => member.hp > 0) ?? state.partyMembers[0];
}

export function getAvailableBattleCards(state: BattleState): BattleCardData[] {
  const partyLeader = getPartyLeader(state);
  const cardIds = normalizeBattleCardIds(partyLeader?.availableCardIds ?? []);

  return cardIds
    .map((cardId) => getBattleCard(cardId))
    .filter((card): card is BattleCardData => card !== undefined);
}

export function canUseCard(state: BattleState, card: BattleCardData): boolean {
  const actor = getPartyLeader(state);

  if (!actor || actor.hp <= 0 || actor.mp < card.mpCost || state.phase !== "playerCommand") {
    return false;
  }

  if (card.targetType === "self") {
    return true;
  }

  return getAliveEnemies(state).length > 0;
}

export function requiresTargetSelection(state: BattleState, card: BattleCardData): boolean {
  if (card.targetType !== "singleEnemy" && card.targetType !== "bossSeal") {
    return false;
  }

  return getAliveEnemies(state).length > 1;
}

export function applyBattleCard(
  state: BattleState,
  cardId: CardId,
  targetInstanceId?: string
): BattleActionResult {
  const card = getBattleCard(cardId);
  const actor = getPartyLeader(state);

  if (!card || !actor) {
    return { state, logs: ["カードを使えません。"] };
  }

  if (actor.mp < card.mpCost) {
    return { state, logs: [`MPが足りません。${card.name}は使えません。`] };
  }

  const nextState = cloneBattleState(state);
  const nextActor = getPartyLeader(nextState);

  if (!nextActor) {
    return { state, logs: ["ひめが行動できません。"] };
  }

  nextActor.mp = Math.max(0, nextActor.mp - card.mpCost);

  if (card.role === "heal") {
    const before = nextActor.hp;
    nextActor.hp = Math.min(nextActor.maxHp, nextActor.hp + card.power);
    const healed = nextActor.hp - before;
    finalizePlayerAction(nextState);
    return {
      state: nextState,
      logs: [`${nextActor.name}は${card.name}を使った。`, `HPが${healed}回復した。`],
      effect: { kind: "heal", sourceInstanceId: nextActor.instanceId, targetInstanceId: nextActor.instanceId }
    };
  }

  if (card.role === "guard") {
    nextActor.status.guarded = true;
    nextActor.status.guardTurns = card.guardTurns ?? 1;
    nextActor.status.guardDamageReduction = card.guardDamageReduction ?? 4;
    finalizePlayerAction(nextState);
    return {
      state: nextState,
      logs: [`${nextActor.name}は${card.name}を使った。`, "湯けむりの守りがひめを包んだ。"],
      effect: { kind: "guard", sourceInstanceId: nextActor.instanceId, targetInstanceId: nextActor.instanceId }
    };
  }

  const target = chooseTarget(nextState, targetInstanceId);
  if (!target) {
    return { state, logs: ["対象を選べません。"] };
  }

  const damage = calculateCardDamage(nextActor, target, card);
  target.hp = Math.max(0, target.hp - damage);

  const logs = [`${nextActor.name}は${card.name}を使った。`, `${target.name}に${damage}ダメージ。`];
  let effectKind: BattleEffectKind = card.role === "seal" ? "seal" : "attack";

  if (nextState.isBossBattle && nextState.sealGauge && card.bossSealDamage) {
    nextState.sealGauge.value = Math.max(0, nextState.sealGauge.value - card.bossSealDamage);
    logs.push(`封印の光が${card.bossSealDamage}つ進んだ。`);
    effectKind = "seal";

    if (nextState.sealGauge.value <= 0) {
      target.hp = 0;
      logs.push("星封じが完成した。");
    }
  }

  if (target.hp <= 0) {
    logs.push(`${target.name}はしずまった。`);
  }

  finalizePlayerAction(nextState);
  return {
    state: nextState,
    logs,
    effect: {
      kind: effectKind,
      sourceInstanceId: nextActor.instanceId,
      targetInstanceId: target.instanceId
    }
  };
}

export function resolveEnemyTurn(state: BattleState): BattleActionResult {
  const nextState = cloneBattleState(state);
  const logs: string[] = [];
  const partyLeader = getPartyLeader(nextState);

  if (!partyLeader || partyLeader.hp <= 0) {
    nextState.phase = "defeat";
    return { state: nextState, logs: ["ひめは動けない。"] };
  }

  let lastEffect: BattleEffect | undefined;

  for (const enemy of getAliveEnemies(nextState)) {
    if (partyLeader.hp <= 0) {
      break;
    }

    const damage = calculateEnemyDamage(enemy, partyLeader);
    partyLeader.hp = Math.max(0, partyLeader.hp - damage);
    logs.push(`${enemy.name}の攻撃。ひめは${damage}ダメージを受けた。`);
    lastEffect = {
      kind: "enemyAttack",
      sourceInstanceId: enemy.instanceId,
      targetInstanceId: partyLeader.instanceId
    };
  }

  tickGuardStatus(partyLeader);

  if (partyLeader.hp <= 0) {
    nextState.phase = "defeat";
    logs.push("ひめは星の光に包まれて、いったん退いた。");
    return { state: nextState, logs, effect: lastEffect };
  }

  partyLeader.mp = Math.min(partyLeader.maxMp, partyLeader.mp + 1);
  nextState.turnCount += 1;
  nextState.phase = "playerCommand";
  logs.push("ひめの番です。");

  return { state: nextState, logs, effect: lastEffect };
}

export function isBattleVictory(state: BattleState): boolean {
  if (state.isBossBattle && state.sealGauge && state.sealGauge.value <= 0) {
    return true;
  }

  return state.enemies.every((enemy) => enemy.hp <= 0);
}

export function isBattleDefeat(state: BattleState): boolean {
  return state.partyMembers.every((member) => member.hp <= 0);
}

export function getActorByInstanceId(
  state: BattleState,
  instanceId: string
): BattleActor | undefined {
  return [...state.partyMembers, ...state.enemies].find((actor) => actor.instanceId === instanceId);
}

function createPartyMembers(save: SaveData): BattleActor[] {
  const availableCardIds = normalizeBattleCardIds(save.unlockedCards);

  return [
    {
      instanceId: "party_hime",
      characterId: "hime",
      name: "ひめ",
      actorType: "player",
      assetId: "hime_idle",
      hp: Math.min(save.hp, save.maxHp),
      maxHp: save.maxHp,
      mp: Math.min(save.mp, save.maxMp),
      maxMp: save.maxMp,
      attack: 2,
      defense: 1,
      speed: 10,
      status: {},
      availableCardIds,
      isCommandable: true
    }
  ];
}

function cloneBattleState(state: BattleState): BattleState {
  return {
    ...state,
    partyMembers: state.partyMembers.map(cloneActor),
    enemies: state.enemies.map(cloneActor),
    sealGauge: state.sealGauge ? { ...state.sealGauge } : undefined
  };
}

function cloneActor(actor: BattleActor): BattleActor {
  return {
    ...actor,
    status: { ...actor.status },
    availableCardIds: actor.availableCardIds ? [...actor.availableCardIds] : undefined
  };
}

function chooseTarget(state: BattleState, targetInstanceId?: string): BattleActor | undefined {
  const aliveEnemies = getAliveEnemies(state);

  if (targetInstanceId) {
    const target = aliveEnemies.find((enemy) => enemy.instanceId === targetInstanceId);
    if (target) {
      return target;
    }
  }

  return aliveEnemies[0];
}

function calculateCardDamage(actor: BattleActor, target: BattleActor, card: BattleCardData): number {
  const rawDamage = card.power + actor.attack - (target.defense ?? 0);
  return Math.max(1, rawDamage);
}

function calculateEnemyDamage(enemy: BattleActor, target: BattleActor): number {
  const guardReduction = target.status.guarded ? target.status.guardDamageReduction ?? 4 : 0;
  const rawDamage = enemy.attack - (target.defense ?? 0) - guardReduction;
  return Math.max(1, rawDamage);
}

function tickGuardStatus(actor: BattleActor): void {
  if (!actor.status.guarded) {
    return;
  }

  const nextTurns = Math.max(0, (actor.status.guardTurns ?? 1) - 1);
  actor.status.guardTurns = nextTurns;

  if (nextTurns <= 0) {
    actor.status.guarded = false;
    actor.status.guardDamageReduction = undefined;
  }
}

function finalizePlayerAction(state: BattleState): void {
  if (isBattleVictory(state)) {
    state.phase = "victory";
    return;
  }

  state.phase = "enemyAction";
}

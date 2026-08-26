import type { SaveData } from "../types/save";

export const P12_LOCATION_ID = "shimanami";

export const P12_AREA_IDS = ["A2-0", "A2-1", "A2-2", "A2-3", "A2-4", "A2-5"] as const;
export type P12AreaId = (typeof P12_AREA_IDS)[number];

export type P12AreaMeta = {
  id: P12AreaId;
  name: string;
  kind: "hub" | "subarea" | "deepSpot" | "boss";
  minutes: string;
  objective: string;
};

export const p12AreaMeta: Record<P12AreaId, P12AreaMeta> = {
  "A2-0": {
    id: "A2-0",
    name: "今治港Hub",
    kind: "hub",
    minutes: "5〜8分",
    objective: "橋道か小舟道、どちらから風の手がかりを探す？"
  },
  "A2-1": {
    id: "A2-1",
    name: "来島の橋道",
    kind: "subarea",
    minutes: "10〜15分",
    objective: "橋を渡る風の記憶を見つけ、海城の見張り台へ向かおう"
  },
  "A2-2": {
    id: "A2-2",
    name: "島の坂道・集落",
    kind: "subarea",
    minutes: "10〜15分",
    objective: "島の暮らしに残る風の手がかりを見つけよう"
  },
  "A2-3": {
    id: "A2-3",
    name: "海城の見張り台",
    kind: "deepSpot",
    minutes: "10〜12分",
    objective: "風の星を見つけて、風よみを受け取ろう"
  },
  "A2-4": {
    id: "A2-4",
    name: "上島の島道",
    kind: "subarea",
    minutes: "10〜15分",
    objective: "風を最後の灯台へ届ける道をひらこう"
  },
  "A2-5": {
    id: "A2-5",
    name: "風の灯台",
    kind: "boss",
    minutes: "8〜12分",
    objective: "しまかぜ大だこに風を返し、島の星をしずめよう"
  }
};

export const P12_REQUIRED_ENEMY_IDS = ["A2-E01", "A2-E02", "A2-E03"] as const;
export const P12_BOSS_ENEMY_ID = "A2-B01" as const;

export const P12_DISCOVERY_IDS = [
  "hub_route",
  "hub_scenic",
  "bridge_memory",
  "bridge_wind_puzzle",
  "island_memory",
  "island_star_reward",
  "wind_ability",
  "wind_revisit",
  "wind_revisit_reward",
  "kamijima_memory",
  "kamijima_shortcut",
  "watchtower_scenic",
  "boss_clear"
] as const;

export function isP12Area(areaId: string): areaId is P12AreaId {
  return (P12_AREA_IDS as readonly string[]).includes(areaId);
}

export function isP12Location(locationId: string): boolean {
  return locationId === P12_LOCATION_ID;
}

export function getP12AreaMeta(areaId: string): P12AreaMeta | undefined {
  return isP12Area(areaId) ? p12AreaMeta[areaId] : undefined;
}

export function p12RequiredEnemiesCleared(save: SaveData): boolean {
  const routeEnemyId = save.flags.p12_route_boat ? "A2-E02" : "A2-E01";
  const defeated = (enemyId: string): boolean => save.defeatedEnemyIds.includes(enemyId)
    || save.flags[`enemy_defeated_${enemyId}`] === true
    || save.flags[`enemy_defeated_${enemyId.replace("-", "_")}`] === true;
  return [routeEnemyId, "A2-E03"].every(defeated);
}

export function p12DiscoveryCount(save: SaveData): number {
  return save.p12DiscoveryIds?.length ?? 0;
}

export function markP12Discovery(save: SaveData, discoveryId: string, elapsedMs: number): SaveData {
  const ids = Array.from(new Set(save.p12DiscoveryIds ?? []));
  if (ids.includes(discoveryId)) return save;

  const previous = save.p12LastDiscoveryElapsedMs ?? 0;
  const interval = previous > 0 ? Math.max(0, elapsedMs - previous) : Math.max(0, elapsedMs);

  return {
    ...save,
    p12DiscoveryIds: [...ids, discoveryId],
    p12DiscoveryIntervalsMs: [...(save.p12DiscoveryIntervalsMs ?? []), interval],
    p12LastDiscoveryElapsedMs: elapsedMs,
    flags: {
      ...save.flags,
      [`p12_discovery_${discoveryId}`]: true
    }
  };
}

export function markP12Checkpoint(save: SaveData, checkpointId: string, elapsedMs: number): SaveData {
  const ids = Array.from(new Set(save.p12CheckpointIds ?? []));
  const previous = save.p12CheckpointElapsedMs ?? 0;
  const checkpointTimes = [...(save.p12CheckpointElapsedMsList ?? []), elapsedMs];
  const intervals = previous > 0
    ? [...(save.p12CheckpointIntervalsMs ?? []), Math.max(0, elapsedMs - previous)]
    : save.p12CheckpointIntervalsMs ?? [];
  return {
    ...save,
    p12CheckpointIds: ids.includes(checkpointId) ? ids : [...ids, checkpointId],
    p12CheckpointElapsedMs: elapsedMs,
    p12CheckpointElapsedMsList: checkpointTimes,
    p12CheckpointIntervalsMs: intervals,
    flags: {
      ...save.flags,
      [`p12_checkpoint_${checkpointId}`]: true
    }
  };
}

export function completeP12(save: SaveData): SaveData {
  return {
    ...save,
    currentChapterId: "p12_completed",
    starLevel: Math.max(4, save.starLevel),
    collectedStars: Array.from(new Set([...save.collectedStars, P12_LOCATION_ID])),
    unlockedLocations: Array.from(new Set([...save.unlockedLocations, P12_LOCATION_ID])),
    clearedQuestIds: Array.from(new Set([...save.clearedQuestIds, "quest_shimanami_wind"])),
    flags: {
      ...save.flags,
      p12_unlocked: true,
      p12_started: true,
      p12_completed: true,
      p12_wind_ability: true,
      p12_windmill_revisited: true,
      star_shimanami_collected: true
    },
    lastSynopsis: "しまなみの風を灯台へ届け、今治と上島の星を取り戻しました。"
  };
}

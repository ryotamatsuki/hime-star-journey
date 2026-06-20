import type { SaveData } from "../types/save";

export const SAVE_KEY = "hime_star_journey_mvp_save_v1";
const SAVE_VERSION = "0.2.0";

const stringArray = (value: unknown, fallback: string[] = []): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : fallback;
const finiteNumber = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

export class SaveManager {
  exists(): boolean {
    return localStorage.getItem(SAVE_KEY) !== null;
  }

  load(): SaveData | null {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    try {
      return this.normalizeSaveData(JSON.parse(raw) as Partial<SaveData>);
    } catch {
      return null;
    }
  }

  save(data: SaveData): SaveData {
    const nextData = this.normalizeSaveData({ ...data, savedAt: new Date().toISOString() });
    localStorage.setItem(SAVE_KEY, JSON.stringify(nextData));
    return nextData;
  }

  clear(): void {
    localStorage.removeItem(SAVE_KEY);
  }

  createInitialSaveData(): SaveData {
    return {
      version: SAVE_VERSION,
      currentChapterId: "prologue",
      currentLocationId: "dogo",
      currentAreaId: "D0",
      currentScreenId: "prologue",
      partyMemberIds: ["hime"],
      activePartyMemberIds: ["hime"],
      starLevel: 0,
      hp: 30,
      mp: 10,
      maxHp: 30,
      maxMp: 10,
      unlockedCards: ["card_mikan_attack", "card_shirasagi_ofuda", "card_dogo_drop", "card_yukemuri_veil"],
      collectedStars: [],
      unlockedLoreIds: [],
      defeatedEnemyIds: [],
      clearedQuestIds: [],
      unlockedLocations: ["dogo"],
      openedPaths: [],
      acquiredItems: {},
      acquiredCharms: [],
      flags: {
        location_castle_unlocked: false,
        prologue_started: true
      },
      dogoQuestStatus: "notStarted",
      lastSynopsis: "家族旅行の前、おばあちゃんから不思議なペンダントを託されました。",
      savedAt: new Date().toISOString()
    };
  }

  normalizeSaveData(source: Partial<SaveData>): SaveData {
    const initial = this.createInitialSaveData();
    const flags = source.flags && typeof source.flags === "object" ? { ...source.flags } : {};
    const collectedStars = stringArray(source.collectedStars);
    const unlockedLocations = Array.from(new Set(["dogo", ...stringArray(source.unlockedLocations).map((id) => id === "dogo_onsen" ? "dogo" : id)]));
    const dogoCollected = collectedStars.includes("dogo") || flags.star_dogo_collected === true;
    const castleUnlocked = unlockedLocations.includes("castle") || flags.location_castle_unlocked === true;
    if (dogoCollected) {
      flags.star_dogo_collected = true;
      flags.yuno_star_obtained = true;
      flags.yuno_star_event_seen = true;
      flags.dogo_quest_cleared = true;
      flags.star_map_unlocked = true;
    }
    if (castleUnlocked) {
      flags.location_castle_unlocked = true;
      flags.star_map_unlocked = true;
      if (!unlockedLocations.includes("castle")) unlockedLocations.push("castle");
    }
    const progressed = dogoCollected || castleUnlocked || stringArray(source.defeatedEnemyIds).length > 0 ||
      source.currentChapterId === "dogo_explore" || source.currentScreenId === "explore" || source.currentScreenId === "battle";
    if (progressed) {
      flags.prologue_completed = true;
      flags.shiro_met = true;
      flags.mikan_core_stolen = true;
      flags.dogo_anomaly_started = true;
      flags.dogo_quest_started = true;
    }
    const validQuestStates: SaveData["dogoQuestStatus"][] = [
      "notStarted", "started", "hintSeen", "enemiesCalmed", "yunoStarReady", "yunoStarObtained", "cleared"
    ];
    let dogoQuestStatus = validQuestStates.includes(source.dogoQuestStatus as SaveData["dogoQuestStatus"])
      ? source.dogoQuestStatus as SaveData["dogoQuestStatus"]
      : progressed ? "started" : "notStarted";
    if (dogoCollected) dogoQuestStatus = "cleared";
    const currentScreenId = progressed && source.currentScreenId === "prologue" ? "explore" : source.currentScreenId ?? initial.currentScreenId;
    return {
      ...initial,
      ...source,
      version: SAVE_VERSION,
      currentScreenId,
      currentLocationId: source.currentLocationId === "dogo_onsen" ? "dogo" : source.currentLocationId ?? initial.currentLocationId,
      partyMemberIds: stringArray(source.partyMemberIds, initial.partyMemberIds),
      activePartyMemberIds: stringArray(source.activePartyMemberIds, initial.activePartyMemberIds),
      starLevel: dogoCollected ? Math.max(2, finiteNumber(source.starLevel, 2)) : finiteNumber(source.starLevel, initial.starLevel),
      hp: finiteNumber(source.hp, initial.hp),
      mp: finiteNumber(source.mp, initial.mp),
      maxHp: finiteNumber(source.maxHp, initial.maxHp),
      maxMp: finiteNumber(source.maxMp, initial.maxMp),
      unlockedCards: stringArray(source.unlockedCards, initial.unlockedCards),
      collectedStars: Array.from(new Set(collectedStars)),
      unlockedLoreIds: stringArray(source.unlockedLoreIds),
      defeatedEnemyIds: stringArray(source.defeatedEnemyIds),
      clearedQuestIds: stringArray(source.clearedQuestIds),
      unlockedLocations,
      openedPaths: stringArray(source.openedPaths),
      acquiredItems: source.acquiredItems && typeof source.acquiredItems === "object" ? source.acquiredItems : {},
      acquiredCharms: stringArray(source.acquiredCharms),
      flags: { ...initial.flags, ...flags },
      dogoQuestStatus,
      lastSynopsis: typeof source.lastSynopsis === "string" ? source.lastSynopsis : initial.lastSynopsis,
      savedAt: typeof source.savedAt === "string" ? source.savedAt : initial.savedAt
    };
  }
}

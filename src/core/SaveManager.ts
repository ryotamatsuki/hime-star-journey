import type { SaveData } from "../types/save";

export const SAVE_KEY = "hime_star_journey_mvp_save_v1";
const SAVE_VERSION = "0.3.0";

const stringArray = (value: unknown, fallback: string[] = []): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : fallback;
const finiteNumber = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;
const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));
const itemCounts = (value: unknown): Record<string, number> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter((entry): entry is [string, number] =>
        typeof entry[1] === "number" && Number.isFinite(entry[1]) && entry[1] >= 0
      )
      .map(([key, count]) => [key, Math.floor(count)])
  );
};

export class SaveManager {
  constructor(private readonly saveKey: string = SAVE_KEY) {}

  exists(): boolean {
    return localStorage.getItem(this.saveKey) !== null;
  }

  load(): SaveData | null {
    const raw = localStorage.getItem(this.saveKey);
    if (!raw) return null;
    try {
      return this.normalizeSaveData(JSON.parse(raw) as Partial<SaveData>);
    } catch {
      return null;
    }
  }

  save(data: SaveData): SaveData {
    const nextData = this.normalizeSaveData({ ...data, savedAt: new Date().toISOString() });
    localStorage.setItem(this.saveKey, JSON.stringify(nextData));
    return nextData;
  }

  clear(): void {
    localStorage.removeItem(this.saveKey);
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
      castleQuestStatus: "notStarted",
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
      flags.location_castle_unlocked = true;
      if (!unlockedLocations.includes("castle")) unlockedLocations.push("castle");
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
    const clearedQuestIds = stringArray(source.clearedQuestIds);
    if (dogoCollected && !clearedQuestIds.includes("quest_dogo_yukemuri_star")) {
      clearedQuestIds.push("quest_dogo_yukemuri_star");
    }
    const sourceAcquiredCharms = stringArray(source.acquiredCharms);
    const shiroyamaGuardObtained =
      flags.shiroyama_guard_obtained === true ||
      sourceAcquiredCharms.includes("shiroyama_guard") ||
      clearedQuestIds.includes("quest_castle_shiroyama_guard");
    if (shiroyamaGuardObtained) {
      flags.shiroyama_guard_obtained = true;
      flags.castle_boss_route_unlocked = true;
      flags.p8_kagemasa_route_unlocked = true;
      if (!clearedQuestIds.includes("quest_castle_shiroyama_guard")) {
        clearedQuestIds.push("quest_castle_shiroyama_guard");
      }
    }
    const castleProgressed = castleUnlocked || source.currentLocationId === "castle" ||
      stringArray(source.defeatedEnemyIds).some((id) => id.startsWith("C-E")) ||
      flags.castle_quest_started === true ||
      flags.castle_hint_seen === true ||
      flags.castle_required_enemies_cleared === true ||
      flags.castle_dark_well_cleared === true ||
      shiroyamaGuardObtained;
    const validCastleQuestStates: SaveData["castleQuestStatus"][] = [
      "notStarted", "started", "hintSeen", "enemiesCleared", "darkWellCleared", "guardReady", "guardObtained", "cleared"
    ];
    let castleQuestStatus = validCastleQuestStates.includes(source.castleQuestStatus as SaveData["castleQuestStatus"])
      ? source.castleQuestStatus as SaveData["castleQuestStatus"]
      : castleProgressed ? "started" : "notStarted";
    if (flags.castle_hint_seen && castleQuestStatus === "started") castleQuestStatus = "hintSeen";
    if (flags.castle_required_enemies_cleared) castleQuestStatus = "enemiesCleared";
    if (flags.castle_dark_well_cleared) castleQuestStatus = "darkWellCleared";
    if (flags.castle_guard_ready) castleQuestStatus = "guardReady";
    if (shiroyamaGuardObtained) castleQuestStatus = "cleared";
    const currentScreenId = progressed && source.currentScreenId === "prologue" ? "explore" : source.currentScreenId ?? initial.currentScreenId;
    const maxHp = Math.max(1, Math.floor(finiteNumber(source.maxHp, initial.maxHp)));
    const maxMp = Math.max(0, Math.floor(finiteNumber(source.maxMp, initial.maxMp)));
    const hp = clamp(Math.floor(finiteNumber(source.hp, initial.hp)), 0, maxHp);
    const mp = clamp(Math.floor(finiteNumber(source.mp, initial.mp)), 0, maxMp);
    return {
      ...initial,
      ...source,
      version: SAVE_VERSION,
      currentScreenId,
      currentLocationId: source.currentLocationId === "dogo_onsen" ? "dogo" : source.currentLocationId ?? initial.currentLocationId,
      partyMemberIds: stringArray(source.partyMemberIds, initial.partyMemberIds),
      activePartyMemberIds: stringArray(source.activePartyMemberIds, initial.activePartyMemberIds),
      starLevel: dogoCollected ? Math.max(2, finiteNumber(source.starLevel, 2)) : Math.max(0, finiteNumber(source.starLevel, initial.starLevel)),
      hp,
      mp,
      maxHp,
      maxMp,
      unlockedCards: stringArray(source.unlockedCards, initial.unlockedCards),
      collectedStars: Array.from(new Set(collectedStars)),
      unlockedLoreIds: stringArray(source.unlockedLoreIds),
      defeatedEnemyIds: Array.from(new Set(stringArray(source.defeatedEnemyIds))),
      clearedQuestIds: Array.from(new Set(clearedQuestIds)),
      unlockedLocations: Array.from(new Set(unlockedLocations)),
      openedPaths: Array.from(new Set(stringArray(source.openedPaths))),
      acquiredItems: itemCounts(source.acquiredItems),
      acquiredCharms: Array.from(new Set(shiroyamaGuardObtained
        ? [...sourceAcquiredCharms, "shiroyama_guard"]
        : sourceAcquiredCharms)),
      flags: { ...initial.flags, ...flags },
      dogoQuestStatus,
      castleQuestStatus,
      lastSynopsis: typeof source.lastSynopsis === "string" ? source.lastSynopsis : initial.lastSynopsis,
      savedAt: typeof source.savedAt === "string" ? source.savedAt : initial.savedAt
    };
  }
}

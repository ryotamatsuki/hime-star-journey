import type { ScreenId } from "../types/game";
import type { SaveData } from "../types/save";

export const SAVE_KEY = "hime_star_journey_mvp_save_v1";
const SAVE_VERSION = "0.3.0";
const VALID_SCREEN_IDS = new Set<ScreenId>([
  "title", "prologue", "starMap", "explore", "battle", "notebook", "ending"
]);

const stringArray = (value: unknown, fallback: string[] = []): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : fallback;
const finiteNumber = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;
const finiteString = (value: unknown, fallback: string): string =>
  typeof value === "string" && value.length > 0 ? value : fallback;
const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));
const booleanRecord = (value: unknown): Record<string, boolean> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, boolean] => typeof entry[1] === "boolean")
  );
};
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
const nonNegativeNumberArray = (value: unknown): number[] =>
  Array.isArray(value)
    ? value.filter((item): item is number => typeof item === "number" && Number.isFinite(item) && item >= 0)
    : [];
const screenId = (value: unknown, fallback: ScreenId): ScreenId =>
  typeof value === "string" && VALID_SCREEN_IDS.has(value as ScreenId) ? value as ScreenId : fallback;

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
        prologue_started: true,
        p12_unlocked: false,
        p12_started: false,
        p12_completed: false,
        p12_wind_ability: false,
        p12_windmill_revisited: false
      },
      dogoQuestStatus: "notStarted",
      castleQuestStatus: "notStarted",
      lastSynopsis: "家族旅行の前、おばあちゃんから不思議なペンダントを託されました。",
      savedAt: new Date().toISOString(),
      p12SessionElapsedMs: 0,
      p12LastDiscoveryElapsedMs: 0,
      p12DiscoveryIds: [],
      p12DiscoveryIntervalsMs: [],
      p12CheckpointElapsedMs: 0,
      p12CheckpointIds: []
    };
  }

  normalizeSaveData(source: Partial<SaveData>): SaveData {
    const initial = this.createInitialSaveData();
    const flags = booleanRecord(source.flags);
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
    const p12Collected = collectedStars.includes("shimanami")
      || flags.star_shimanami_collected === true
      || flags.p12_completed === true;
    const p12Progressed = source.currentLocationId === "shimanami"
      || finiteString(source.currentChapterId, "").startsWith("p12")
      || stringArray(source.defeatedEnemyIds).some((id) => id.startsWith("A2-"))
      || flags.p12_started === true
      || flags.p12_wind_ability === true;
    const p12Unlocked = p12Collected || p12Progressed || flags.p12_unlocked === true || flags.gameCompleted === true;
    if (p12Unlocked) {
      flags.p12_unlocked = true;
      flags.star_map_unlocked = true;
      if (!unlockedLocations.includes("shimanami")) unlockedLocations.push("shimanami");
    }
    if (p12Progressed || p12Collected) flags.p12_started = true;
    if (p12Collected) {
      flags.p12_completed = true;
      flags.star_shimanami_collected = true;
      if (!collectedStars.includes("shimanami")) collectedStars.push("shimanami");
    }
    const sourceScreenId = screenId(source.currentScreenId, initial.currentScreenId);
    const progressed = dogoCollected || castleUnlocked || stringArray(source.defeatedEnemyIds).length > 0 ||
      source.currentChapterId === "dogo_explore" || sourceScreenId === "explore" || sourceScreenId === "battle";
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
    if (p12Collected && !clearedQuestIds.includes("quest_shimanami_wind")) {
      clearedQuestIds.push("quest_shimanami_wind");
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
    const currentScreenId = progressed && sourceScreenId === "prologue" ? "explore" : sourceScreenId;
    const maxHp = Math.max(1, Math.floor(finiteNumber(source.maxHp, initial.maxHp)));
    const maxMp = Math.max(0, Math.floor(finiteNumber(source.maxMp, initial.maxMp)));
    const hp = clamp(Math.floor(finiteNumber(source.hp, initial.hp)), 0, maxHp);
    const mp = clamp(Math.floor(finiteNumber(source.mp, initial.mp)), 0, maxMp);
    const sourceLocationId = finiteString(source.currentLocationId, initial.currentLocationId);
    return {
      ...initial,
      ...source,
      version: SAVE_VERSION,
      currentChapterId: finiteString(source.currentChapterId, initial.currentChapterId),
      currentScreenId,
      currentLocationId: sourceLocationId === "dogo_onsen" ? "dogo" : sourceLocationId,
      currentAreaId: finiteString(source.currentAreaId, initial.currentAreaId),
      partyMemberIds: stringArray(source.partyMemberIds, initial.partyMemberIds),
      activePartyMemberIds: stringArray(source.activePartyMemberIds, initial.activePartyMemberIds),
      starLevel: p12Collected
        ? Math.max(4, finiteNumber(source.starLevel, 4))
        : dogoCollected
          ? Math.max(2, finiteNumber(source.starLevel, 2))
          : Math.max(0, finiteNumber(source.starLevel, initial.starLevel)),
      hp,
      mp,
      maxHp,
      maxMp,
      unlockedCards: Array.from(new Set(stringArray(source.unlockedCards, initial.unlockedCards))),
      collectedStars: Array.from(new Set(collectedStars)),
      unlockedLoreIds: Array.from(new Set(stringArray(source.unlockedLoreIds))),
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
      savedAt: typeof source.savedAt === "string" ? source.savedAt : initial.savedAt,
      p12SessionElapsedMs: Math.max(0, finiteNumber(source.p12SessionElapsedMs, initial.p12SessionElapsedMs ?? 0)),
      p12LastDiscoveryElapsedMs: Math.max(0, finiteNumber(source.p12LastDiscoveryElapsedMs, initial.p12LastDiscoveryElapsedMs ?? 0)),
      p12DiscoveryIds: Array.from(new Set(stringArray(source.p12DiscoveryIds))),
      p12DiscoveryIntervalsMs: nonNegativeNumberArray(source.p12DiscoveryIntervalsMs),
      p12CheckpointElapsedMs: Math.max(0, finiteNumber(source.p12CheckpointElapsedMs, initial.p12CheckpointElapsedMs ?? 0)),
      p12CheckpointIds: Array.from(new Set(stringArray(source.p12CheckpointIds)))
    };
  }
}

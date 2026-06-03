import type { SaveData } from "../types/save";

export const SAVE_KEY = "hime_star_journey_mvp_save_v1";

export class SaveManager {
  exists(): boolean {
    return localStorage.getItem(SAVE_KEY) !== null;
  }

  load(): SaveData | null {
    const raw = localStorage.getItem(SAVE_KEY);

    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as SaveData;
      return parsed;
    } catch {
      return null;
    }
  }

  save(data: SaveData): SaveData {
    const nextData: SaveData = {
      ...data,
      savedAt: new Date().toISOString()
    };

    localStorage.setItem(SAVE_KEY, JSON.stringify(nextData));
    return nextData;
  }

  clear(): void {
    localStorage.removeItem(SAVE_KEY);
  }

  createInitialSaveData(): SaveData {
    const now = new Date().toISOString();

    return {
      version: "0.1.0",
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
      unlockedCards: ["card_mikan_attack", "card_dogo_drop"],
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
        prologueStarted: true
      },
      lastSynopsis: "ひめは小さな星をめぐる旅に出るところです。",
      savedAt: now
    };
  }
}

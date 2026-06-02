import type { ScreenId } from "./game";

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

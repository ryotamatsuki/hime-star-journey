import type { ScreenId } from "./game";

export type P12TelemetryEventType =
  | "area_enter"
  | "area_exit"
  | "discovery"
  | "route_choice"
  | "reward"
  | "checkpoint"
  | "save_write"
  | "reload"
  | "battle_start"
  | "battle_end"
  | "boss_start"
  | "boss_end";

export type P12TelemetryEvent = {
  type: P12TelemetryEventType;
  id: string;
  areaId: string;
  elapsedMs: number;
  durationMs?: number;
  outcome?: "victory" | "defeat";
};

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
  dogoQuestStatus:
    | "notStarted"
    | "started"
    | "hintSeen"
    | "enemiesCalmed"
    | "yunoStarReady"
    | "yunoStarObtained"
    | "cleared";
  castleQuestStatus:
    | "notStarted"
    | "started"
    | "hintSeen"
    | "enemiesCleared"
    | "darkWellCleared"
    | "guardReady"
    | "guardObtained"
    | "cleared";
  lastSynopsis: string;
  savedAt: string;
  /** P12 telemetry is intentionally small and remains backward-compatible with v1 saves. */
  p12SessionElapsedMs?: number;
  p12LastDiscoveryElapsedMs?: number;
  p12DiscoveryIds?: string[];
  p12DiscoveryIntervalsMs?: number[];
  p12CheckpointElapsedMs?: number;
  p12CheckpointIds?: string[];
  p12CheckpointElapsedMsList?: number[];
  p12CheckpointIntervalsMs?: number[];
  p12AreaIds?: string[];
  p12AreaEnterElapsedMs?: number[];
  p12BattleDurationsMs?: number[];
  p12BattleKinds?: Array<"normal" | "boss">;
  /** Last safe field position for Continue and battle recovery. */
  playerPosition?: {
    x: number;
    y: number;
  };
  /** Whether the star map was opened from an active exploration screen. */
  starMapReturnScreenId?: "explore" | "title";
  /** Append-only P12 event evidence used to reconcile manual KPI logs. */
  p12EventLog?: P12TelemetryEvent[];
};

import type { Rect } from "../systems/CollisionSystem";
import type { SaveData } from "../types/save";

export type EnemySymbolAnimationType = "wander" | "float" | "blink" | "shake" | "scurry";

export type EnemySymbolData = {
  symbolId: string;
  encounterId: string;
  locationId: string;
  areaId: string;
  required: boolean;
  x: number;
  y: number;
  defeatedFlag: string;
  openedPathFlag?: string;
  collider: Rect;
  animationType: EnemySymbolAnimationType;
  assetId: string;
  label: string;
};

export const enemySymbols: EnemySymbolData[] = [
  {
    symbolId: "D-E01",
    encounterId: "enc_dogo_oni_01",
    locationId: "dogo",
    areaId: "D0",
    required: true,
    x: 760,
    y: 682,
    defeatedFlag: "enemy_defeated_D-E01",
    openedPathFlag: "dogo_main_path_open",
    collider: { x: -26, y: -30, width: 52, height: 38 },
    animationType: "wander",
    assetId: "enemy_dogo_oni",
    label: "湯どろぼう鬼"
  },
  {
    symbolId: "D-E02",
    encounterId: "enc_dogo_oni_02",
    locationId: "dogo",
    areaId: "D0",
    required: true,
    x: 1114,
    y: 522,
    defeatedFlag: "enemy_defeated_D-E02",
    collider: { x: -26, y: -30, width: 52, height: 38 },
    animationType: "wander",
    assetId: "enemy_dogo_oni",
    label: "湯どろぼう鬼"
  },
  {
    symbolId: "D-E03",
    encounterId: "enc_dogo_lantern_01",
    locationId: "dogo",
    areaId: "D0",
    required: true,
    x: 1360,
    y: 712,
    defeatedFlag: "enemy_defeated_D-E03",
    collider: { x: -22, y: -26, width: 44, height: 34 },
    animationType: "blink",
    assetId: "enemy_dogo_lantern",
    label: "あお提灯"
  },
  {
    symbolId: "D-E04",
    encounterId: "enc_dogo_armor_01",
    locationId: "dogo",
    areaId: "D0",
    required: true,
    x: 938,
    y: 456,
    defeatedFlag: "enemy_defeated_D-E04",
    openedPathFlag: "dogo_steam_lane_open",
    collider: { x: -24, y: -28, width: 48, height: 36 },
    animationType: "shake",
    assetId: "enemy_dogo_armor",
    label: "さびよろい"
  },
  {
    symbolId: "D-E05",
    encounterId: "enc_dogo_mouse_pair_01",
    locationId: "dogo",
    areaId: "D0",
    required: false,
    x: 530,
    y: 818,
    defeatedFlag: "enemy_defeated_D-E05",
    collider: { x: -24, y: -22, width: 48, height: 30 },
    animationType: "scurry",
    assetId: "enemy_dogo_mouse",
    label: "ゆげネズミたち"
  },
  {
    symbolId: "D-E06",
    encounterId: "enc_dogo_mouse_01",
    locationId: "dogo",
    areaId: "D0",
    required: false,
    x: 1600,
    y: 790,
    defeatedFlag: "enemy_defeated_D-E06",
    collider: { x: -22, y: -20, width: 44, height: 28 },
    animationType: "scurry",
    assetId: "enemy_dogo_mouse",
    label: "ゆげネズミ"
  }
];

export function getEnemySymbolsForArea(locationId: string, areaId: string): EnemySymbolData[] {
  return enemySymbols.filter(
    (symbol) => symbol.locationId === locationId && symbol.areaId === areaId
  );
}

export function getEnemySymbolById(symbolId: string): EnemySymbolData | undefined {
  return enemySymbols.find((symbol) => symbol.symbolId === symbolId);
}

export function isEnemySymbolDefeated(symbol: EnemySymbolData, saveData: SaveData): boolean {
  return (
    saveData.defeatedEnemyIds.includes(symbol.symbolId) ||
    saveData.flags[symbol.defeatedFlag] === true
  );
}

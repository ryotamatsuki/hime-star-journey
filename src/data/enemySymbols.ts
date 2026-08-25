import { getMapLayout, getPositionedObject, normalizeLocationId } from "./mapLayoutRegistry";
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

type EnemySymbolDefinition = Omit<EnemySymbolData, "x" | "y">;

const enemySymbolDefinitions: EnemySymbolDefinition[] = [
  {
    symbolId: "D-E01",
    encounterId: "enc_dogo_oni_01",
    locationId: "dogo",
    areaId: "D0",
    required: true,
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
    defeatedFlag: "enemy_defeated_D-E06",
    collider: { x: -22, y: -20, width: 44, height: 28 },
    animationType: "scurry",
    assetId: "enemy_dogo_mouse",
    label: "ゆげネズミ"
  },
  {
    symbolId: "C-E01",
    encounterId: "enc_castle_soldier_01",
    locationId: "castle",
    areaId: "C0",
    required: true,
    defeatedFlag: "enemy_defeated_C-E01",
    collider: { x: -24, y: -28, width: 48, height: 36 },
    animationType: "wander",
    assetId: "enemy_castle_soldier",
    label: "影足軽"
  },
  {
    symbolId: "C-E02",
    encounterId: "enc_castle_oni_01",
    locationId: "castle",
    areaId: "C0",
    required: true,
    defeatedFlag: "enemy_defeated_C-E02",
    collider: { x: -28, y: -32, width: 56, height: 42 },
    animationType: "shake",
    assetId: "enemy_castle_oni",
    label: "石垣鬼"
  },
  {
    symbolId: "C-E03",
    encounterId: "enc_castle_crow_soldier_01",
    locationId: "castle",
    areaId: "C0",
    required: true,
    defeatedFlag: "enemy_defeated_C-E03",
    collider: { x: -24, y: -28, width: 48, height: 36 },
    animationType: "float",
    assetId: "enemy_castle_crow",
    label: "黒羽ガラス"
  },
  {
    symbolId: "C-E04",
    encounterId: "enc_castle_well_01",
    locationId: "castle",
    areaId: "C0",
    required: true,
    defeatedFlag: "enemy_defeated_C-E04",
    openedPathFlag: "castle_dark_well_cleared_path",
    collider: { x: -30, y: -32, width: 60, height: 44 },
    animationType: "blink",
    assetId: "enemy_castle_well",
    label: "くらやみ井戸"
  },
  {
    symbolId: "C-E05",
    encounterId: "enc_castle_soldier_02",
    locationId: "castle",
    areaId: "C0",
    required: false,
    defeatedFlag: "enemy_defeated_C-E05",
    collider: { x: -24, y: -28, width: 48, height: 36 },
    animationType: "wander",
    assetId: "enemy_castle_soldier",
    label: "影足軽"
  },
  {
    symbolId: "A2-E01",
    encounterId: "enc_shimanami_wind_thief",
    locationId: "shimanami",
    areaId: "A2-1",
    required: true,
    defeatedFlag: "enemy_defeated_A2-E01",
    collider: { x: -26, y: -30, width: 52, height: 38 },
    animationType: "scurry",
    assetId: "enemy_shimanami_wind_thief",
    label: "かぜぬすみ"
  },
  {
    symbolId: "A2-E02",
    encounterId: "enc_shimanami_tide_crab",
    locationId: "shimanami",
    areaId: "A2-2",
    required: true,
    defeatedFlag: "enemy_defeated_A2-E02",
    collider: { x: -28, y: -25, width: 56, height: 36 },
    animationType: "wander",
    assetId: "enemy_shimanami_tide_crab",
    label: "しおガニ"
  },
  {
    symbolId: "A2-E03",
    encounterId: "enc_shimanami_gull",
    locationId: "shimanami",
    areaId: "A2-4",
    required: true,
    defeatedFlag: "enemy_defeated_A2-E03",
    collider: { x: -24, y: -28, width: 48, height: 36 },
    animationType: "float",
    assetId: "enemy_shimanami_gull",
    label: "くろほガモメ"
  },
  {
    symbolId: "A2-B01",
    encounterId: "enc_boss_shimanami_octopus",
    locationId: "shimanami",
    areaId: "A2-5",
    required: true,
    defeatedFlag: "enemy_defeated_A2-B01",
    animationType: "blink",
    assetId: "boss_shimanami_octopus",
    label: "しまかぜ大だこ",
    collider: { x: -38, y: -40, width: 76, height: 54 }
  }
];

export const enemySymbols: EnemySymbolData[] = enemySymbolDefinitions.flatMap((definition) => {
  const position = getLayoutPosition(definition.locationId, definition.areaId, definition.symbolId);
  return position ? [{ ...definition, x: position.x, y: position.y }] : [];
});

export function getEnemySymbolsForArea(locationId: string, areaId: string): EnemySymbolData[] {
  const normalized = normalizeLocationId(locationId);
  return enemySymbolDefinitions
    .filter((symbol) => symbol.locationId === normalized && symbol.areaId === areaId)
    .flatMap((definition) => {
      const position = getLayoutPosition(normalized, areaId, definition.symbolId);
      return position ? [{ ...definition, x: position.x, y: position.y }] : [];
    });
}

export function getEnemySymbolById(symbolId: string): EnemySymbolData | undefined {
  const definition = enemySymbolDefinitions.find((symbol) => symbol.symbolId === symbolId);
  if (!definition) return undefined;
  const position = getLayoutPosition(definition.locationId, definition.areaId, definition.symbolId);
  return position ? { ...definition, x: position.x, y: position.y } : undefined;
}

export function isEnemySymbolDefeated(symbol: EnemySymbolData, saveData: SaveData): boolean {
  return (
    saveData.defeatedEnemyIds.includes(symbol.symbolId) ||
    saveData.flags[symbol.defeatedFlag] === true
  );
}

function getLayoutPosition(locationId: string, areaId: string, symbolId: string): { x: number; y: number } | undefined {
  const layout = getMapLayout(locationId, areaId);
  return layout ? getPositionedObject(layout.enemySpawns, symbolId) : undefined;
}

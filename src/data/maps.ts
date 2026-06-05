import type { Rect } from "../systems/CollisionSystem";

export type Point = {
  x: number;
  y: number;
};

export type MapInteractableType = "talk" | "item" | "event" | "transition";

export type MapInteractableMarker = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: MapInteractableType;
  label: string;
};

export type WalkableRect = Rect & {
  id: string;
  label?: string;
};

export type WalkablePolygon = {
  id: string;
  label?: string;
  points: Point[];
};

export type MapAreaData = {
  id: string;
  locationId: string;
  name: string;
  worldWidth: number;
  worldHeight: number;
  backgroundAssetId: string;
  foregroundAssetId?: string;
  overlayAssetId?: string;
  playerStart: Point;
  cameraBounds: Rect;
  collisionRects: Rect[];
  walkableRects: WalkableRect[];
  walkablePolygons?: WalkablePolygon[];
  enemySymbolIds: string[];
  interactableIds: string[];
  interactables?: MapInteractableMarker[];
};

export const dogoArea: MapAreaData = {
  id: "D0",
  locationId: "dogo",
  name: "Dogo Onsen",
  worldWidth: 1920,
  worldHeight: 1080,
  backgroundAssetId: "bg_dogo_map_base",
  foregroundAssetId: "bg_dogo_map_foreground",
  overlayAssetId: "bg_dogo_map_overlay_steam",
  playerStart: { x: 720, y: 820 },
  cameraBounds: { x: 0, y: 0, width: 1920, height: 1080 },
  collisionRects: [
    { x: 0, y: 0, width: 1920, height: 84 },
    { x: 0, y: 996, width: 1920, height: 84 },
    { x: 0, y: 0, width: 72, height: 1080 },
    { x: 1848, y: 0, width: 72, height: 1080 },
    { x: 0, y: 100, width: 500, height: 230 },
    { x: 585, y: 0, width: 300, height: 178 },
    { x: 960, y: 0, width: 408, height: 178 },
    { x: 1485, y: 0, width: 435, height: 150 },
    { x: 165, y: 365, width: 610, height: 218 },
    { x: 640, y: 230, width: 360, height: 236 },
    { x: 1090, y: 330, width: 330, height: 210 },
    { x: 1375, y: 472, width: 255, height: 145 },
    { x: 1660, y: 386, width: 260, height: 255 },
    { x: 0, y: 690, width: 520, height: 306 },
    { x: 975, y: 608, width: 342, height: 214 },
    { x: 1130, y: 822, width: 232, height: 174 },
    { x: 1398, y: 692, width: 252, height: 206 },
    { x: 1610, y: 846, width: 310, height: 150 }
  ],
  walkableRects: [
    { id: "dogo_walk_center_road", label: "中央の石畳", x: 760, y: 176, width: 292, height: 820 },
    { id: "dogo_walk_lower_plaza", label: "下の広場", x: 520, y: 725, width: 520, height: 270 },
    { id: "dogo_walk_left_lantern_street", label: "左の提灯通り", x: 72, y: 330, width: 620, height: 152 },
    { id: "dogo_walk_left_entry", label: "左下の入口道", x: 520, y: 560, width: 250, height: 320 },
    { id: "dogo_walk_upper_bridge", label: "橋の手前の道", x: 1060, y: 170, width: 620, height: 210 },
    { id: "dogo_walk_right_steam_lane", label: "右の湯けむり通り", x: 1320, y: 615, width: 500, height: 220 },
    { id: "dogo_walk_south_east_lane", label: "右下の路地", x: 1135, y: 840, width: 520, height: 156 }
  ],
  enemySymbolIds: ["D-E01", "D-E02", "D-E03", "D-E04", "D-E05", "D-E06"],
  interactableIds: ["dogo_start_sign", "dogo_steam_spot", "dogo_star_placeholder"],
  interactables: [
    {
      id: "dogo_start_sign",
      x: 95,
      y: 650,
      width: 96,
      height: 90,
      type: "talk",
      label: "Dogo Onsen"
    },
    {
      id: "dogo_steam_spot",
      x: 878,
      y: 470,
      width: 132,
      height: 102,
      type: "event",
      label: "Steam"
    },
    {
      id: "dogo_star_placeholder",
      x: 1492,
      y: 724,
      width: 112,
      height: 92,
      type: "event",
      label: "Star Sign"
    }
  ]
};

export const mapAreas: MapAreaData[] = [dogoArea];

export function getMapArea(locationId: string, areaId: string): MapAreaData {
  const normalizedLocationId = locationId === "dogo_onsen" ? "dogo" : locationId;
  return (
    mapAreas.find((area) => area.locationId === normalizedLocationId && area.id === areaId) ??
    dogoArea
  );
}

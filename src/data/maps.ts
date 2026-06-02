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
  playerStart: { x: 260, y: 760 },
  cameraBounds: { x: 0, y: 0, width: 1920, height: 1080 },
  collisionRects: [
    { x: 0, y: 0, width: 1920, height: 84 },
    { x: 0, y: 996, width: 1920, height: 84 },
    { x: 0, y: 0, width: 72, height: 1080 },
    { x: 1848, y: 0, width: 72, height: 1080 },
    { x: 0, y: 110, width: 520, height: 210 },
    { x: 592, y: 118, width: 328, height: 235 },
    { x: 1040, y: 88, width: 376, height: 212 },
    { x: 1512, y: 180, width: 360, height: 216 },
    { x: 160, y: 392, width: 376, height: 210 },
    { x: 710, y: 370, width: 180, height: 112 },
    { x: 1168, y: 392, width: 150, height: 120 },
    { x: 1408, y: 612, width: 236, height: 116 },
    { x: 1640, y: 652, width: 252, height: 188 },
    { x: 1036, y: 762, width: 210, height: 150 },
    { x: 1320, y: 810, width: 245, height: 142 },
    { x: 615, y: 820, width: 256, height: 154 },
    { x: 274, y: 874, width: 168, height: 122 },
    { x: 0, y: 662, width: 150, height: 208 },
    { x: 1228, y: 492, width: 452, height: 64 },
    { x: 1288, y: 604, width: 410, height: 58 }
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

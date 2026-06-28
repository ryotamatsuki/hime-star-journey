import { getMapLayout, mapLayoutRegistry, normalizeLocationId } from "./mapLayoutRegistry";
import type { Rect } from "../systems/CollisionSystem";
import type { MapGuidePath, MapLayoutData } from "../types/mapLayout";

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
  guidePaths?: MapGuidePath[];
  enemySymbolIds: string[];
  interactableIds: string[];
  interactables?: MapInteractableMarker[];
};

export const dogoArea: MapAreaData = createAreaFromLayout(
  mapLayoutRegistry["dogo-D0"] as MapLayoutData
);

export const mapAreas: MapAreaData[] = Object.values(mapLayoutRegistry).map(createAreaFromLayout);

export function getMapArea(locationId: string, areaId: string): MapAreaData {
  const layout = getMapLayout(normalizeLocationId(locationId), areaId);
  return layout ? createAreaFromLayout(layout) : dogoArea;
}

function createAreaFromLayout(layout: MapLayoutData): MapAreaData {
  return {
    id: layout.areaId,
    locationId: layout.locationId,
    name: layout.name,
    worldWidth: layout.worldWidth,
    worldHeight: layout.worldHeight,
    backgroundAssetId: layout.backgroundAssetId,
    foregroundAssetId: layout.foregroundAssetId,
    overlayAssetId: layout.overlayAssetId,
    playerStart: layout.playerStart,
    cameraBounds: layout.cameraBounds,
    collisionRects: layout.collisionRects,
    walkableRects: layout.walkableRects,
    walkablePolygons: layout.walkablePolygons,
    guidePaths: layout.guidePaths,
    enemySymbolIds: layout.enemySpawns.map((spawn) => spawn.id),
    interactableIds: layout.interactablePositions.map((position) => position.id),
    interactables: layout.markers.map((marker) => ({
      id: marker.id,
      x: marker.x,
      y: marker.y,
      width: marker.width ?? 64,
      height: marker.height ?? 64,
      type: inferMarkerType(marker.id),
      label: marker.label ?? marker.id
    }))
  };
}

function inferMarkerType(id: string): MapInteractableType {
  if (id.includes("star") || id.includes("steam")) return "event";
  return "talk";
}

export type MapPoint = {
  x: number;
  y: number;
};

export type MapRect = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
};

export type MapPolygon = {
  id: string;
  label?: string;
  points: MapPoint[];
};

export type PositionedMapObject = {
  id: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  label?: string;
};

export type MapGuidePath = {
  id: string;
  label?: string;
  points: MapPoint[];
};

export type MapLayoutData = {
  version: number;
  locationId: string;
  areaId: string;
  name: string;
  worldWidth: number;
  worldHeight: number;
  backgroundAssetId: string;
  foregroundAssetId?: string;
  overlayAssetId?: string;
  playerStart: MapPoint;
  cameraBounds: MapRect;
  walkableRects: MapRect[];
  walkablePolygons: MapPolygon[];
  collisionRects: MapRect[];
  guidePaths: MapGuidePath[];
  enemySpawns: PositionedMapObject[];
  npcPositions: PositionedMapObject[];
  interactablePositions: PositionedMapObject[];
  eventPositions: PositionedMapObject[];
  markers: PositionedMapObject[];
};

export type MapLayoutSummary = {
  id: string;
  label: string;
  locationId: string;
  areaId: string;
};

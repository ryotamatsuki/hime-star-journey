import type { MapLayoutData, MapPoint, MapRect } from "../types/mapLayout";

export type EditorLayer =
  | "cameraBounds"
  | "walkableRects"
  | "walkablePolygons"
  | "collisionRects"
  | "playerStart"
  | "enemySpawns"
  | "npcPositions"
  | "interactablePositions"
  | "eventPositions"
  | "guidePaths"
  | "markers";

export type EditorTool = "select" | "move" | "rect" | "polygon" | "path";

export type Selection = {
  layer: EditorLayer;
  id: string;
  pointIndex?: number;
};

export type LayerSettings = Record<EditorLayer, { visible: boolean; locked: boolean }>;

export type EditorState = {
  mapId: string;
  layout: MapLayoutData;
  zoom: number;
  pan: MapPoint;
  gridSize: number;
  showGrid: boolean;
  snap: boolean;
  tool: EditorTool;
  activeLayer: EditorLayer;
  selection: Selection | null;
  dirty: boolean;
  validationTargetIds: string[];
  layers: LayerSettings;
};

export const layerLabels: Record<EditorLayer, string> = {
  cameraBounds: "カメラ範囲",
  walkableRects: "歩行可能領域",
  walkablePolygons: "歩行ポリゴン",
  collisionRects: "衝突領域",
  playerStart: "開始位置",
  enemySpawns: "敵",
  npcPositions: "NPC",
  interactablePositions: "調べる対象",
  eventPositions: "イベント",
  guidePaths: "道しるべ",
  markers: "マーカー"
};

export function createDefaultLayers(): LayerSettings {
  return {
    cameraBounds: { visible: true, locked: false },
    walkableRects: { visible: true, locked: false },
    walkablePolygons: { visible: true, locked: false },
    collisionRects: { visible: true, locked: false },
    playerStart: { visible: true, locked: false },
    enemySpawns: { visible: true, locked: false },
    npcPositions: { visible: true, locked: false },
    interactablePositions: { visible: true, locked: false },
    eventPositions: { visible: true, locked: false },
    guidePaths: { visible: true, locked: false },
    markers: { visible: true, locked: false }
  };
}

export function cloneLayout(layout: MapLayoutData): MapLayoutData {
  return JSON.parse(JSON.stringify(layout)) as MapLayoutData;
}

export function createRect(id: string, x: number, y: number): MapRect {
  return { id, x, y, width: 96, height: 72 };
}

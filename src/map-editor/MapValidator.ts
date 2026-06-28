import type { MapLayoutData, MapPoint, MapRect, PositionedMapObject } from "../types/mapLayout";

export type ValidationSeverity = "ok" | "warning" | "error";

export type ValidationIssue = {
  severity: ValidationSeverity;
  message: string;
  targetId?: string;
};

const PLAYER_RADIUS = 24;
const REQUIRED_DOGO_TARGETS = ["D-E01", "D-E02", "D-E03", "D-E04"];

export function validateMapLayout(layout: MapLayoutData, gridSize = 24): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const ids = new Set<string>();

  const registerId = (id: string | undefined, label: string): void => {
    if (!id) {
      issues.push({ severity: "error", message: `${label} に空のIDがあります。` });
      return;
    }
    if (ids.has(id)) issues.push({ severity: "error", message: `IDが重複しています: ${id}`, targetId: id });
    ids.add(id);
  };

  for (const rect of [...layout.walkableRects, ...layout.collisionRects]) {
    registerId(rect.id, "矩形");
    if (rect.width <= 0 || rect.height <= 0) {
      issues.push({ severity: "error", message: `${rect.id} の幅または高さが不正です。`, targetId: rect.id });
    }
    if (!rectInsideWorld(rect, layout)) {
      issues.push({ severity: "error", message: `${rect.id} がワールド範囲外に出ています。`, targetId: rect.id });
    }
    if (Math.min(rect.width, rect.height) < PLAYER_RADIUS * 2) {
      issues.push({ severity: "warning", message: `${rect.id} は道幅がやや狭いです（推奨: 48px以上）。`, targetId: rect.id });
    }
  }

  for (const polygon of layout.walkablePolygons) {
    registerId(polygon.id, "ポリゴン");
    if (polygon.points.length < 3) {
      issues.push({ severity: "error", message: `${polygon.id} は3点以上必要です。`, targetId: polygon.id });
    }
    for (const point of polygon.points) {
      if (!pointInsideWorld(point, layout)) {
        issues.push({ severity: "error", message: `${polygon.id} の頂点がワールド範囲外です。`, targetId: polygon.id });
      }
    }
  }

  for (const path of layout.guidePaths) {
    registerId(path.id, "道しるべ");
    if (path.points.length < 2) {
      issues.push({ severity: "warning", message: `${path.id} は2点以上あるとゲーム内で見やすくなります。`, targetId: path.id });
    }
    for (const point of path.points) {
      if (!pointInsideWorld(point, layout)) {
        issues.push({ severity: "error", message: `${path.id} の経路点がワールド範囲外です。`, targetId: path.id });
      }
    }
  }

  const objects = [
    ...layout.enemySpawns,
    ...layout.npcPositions,
    ...layout.interactablePositions,
    ...layout.eventPositions
  ];
  for (const object of objects) {
    registerId(object.id, "配置オブジェクト");
    validateObject(object, layout, issues);
  }
  const markerIds = new Set<string>();
  for (const marker of layout.markers) {
    if (markerIds.has(marker.id)) issues.push({ severity: "error", message: `マーカーIDが重複しています: ${marker.id}`, targetId: marker.id });
    markerIds.add(marker.id);
    validateObject(marker, layout, issues);
  }

  if (!pointInsideWorld(layout.playerStart, layout)) {
    issues.push({ severity: "error", message: "プレイヤー開始位置がワールド範囲外です。", targetId: "playerStart" });
  }
  if (!isWalkable(layout.playerStart, layout)) {
    issues.push({ severity: "error", message: "プレイヤー開始位置が歩行可能領域内にありません。", targetId: "playerStart" });
  }
  if (isColliding(layout.playerStart, layout)) {
    issues.push({ severity: "error", message: "プレイヤー開始位置が衝突領域に重なっています。", targetId: "playerStart" });
  }

  const targets = [
    ...layout.enemySpawns.filter((enemy) => REQUIRED_DOGO_TARGETS.includes(enemy.id)),
    ...layout.npcPositions,
    ...layout.interactablePositions,
    ...layout.eventPositions
  ];
  for (const target of targets) {
    if (!isWalkable(target, layout)) {
      issues.push({ severity: "error", message: `${target.id} が歩行可能領域に接していません。`, targetId: target.id });
    } else if (!isReachable(layout.playerStart, target, layout, gridSize)) {
      issues.push({ severity: "error", message: `${target.id} にプレイヤー開始位置から到達できません。`, targetId: target.id });
    }
  }

  if (issues.length === 0) {
    return [
      { severity: "ok", message: "歩行可能領域がマップ内に収まっています。" },
      { severity: "ok", message: "孤立領域は見つかりませんでした。" },
      { severity: "ok", message: "経路がプレイヤー開始位置から到達可能です。" }
    ];
  }

  return issues;
}

function validateObject(object: PositionedMapObject, layout: MapLayoutData, issues: ValidationIssue[]): void {
  if (!pointInsideWorld(object, layout)) {
    issues.push({ severity: "error", message: `${object.id} がワールド範囲外です。`, targetId: object.id });
  }
  if (object.width !== undefined && object.width <= 0) {
    issues.push({ severity: "error", message: `${object.id} の幅が不正です。`, targetId: object.id });
  }
  if (object.height !== undefined && object.height <= 0) {
    issues.push({ severity: "error", message: `${object.id} の高さが不正です。`, targetId: object.id });
  }
}

function rectInsideWorld(rect: MapRect, layout: MapLayoutData): boolean {
  return rect.x >= 0
    && rect.y >= 0
    && rect.x + rect.width <= layout.worldWidth
    && rect.y + rect.height <= layout.worldHeight;
}

function pointInsideWorld(point: MapPoint, layout: MapLayoutData): boolean {
  return point.x >= 0 && point.y >= 0 && point.x <= layout.worldWidth && point.y <= layout.worldHeight;
}

function isWalkable(point: MapPoint, layout: MapLayoutData): boolean {
  return layout.walkableRects.some((rect) => pointInRect(point, rect))
    || layout.walkablePolygons.some((polygon) => pointInPolygon(point, polygon.points));
}

function isColliding(point: MapPoint, layout: MapLayoutData): boolean {
  return layout.collisionRects.some((rect) => pointInRect(point, rect));
}

function pointInRect(point: MapPoint, rect: MapRect): boolean {
  return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
}

function pointInPolygon(point: MapPoint, polygon: MapPoint[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const a = polygon[i];
    const b = polygon[j];
    if (!a || !b) continue;
    const intersects = ((a.y > point.y) !== (b.y > point.y))
      && point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x;
    if (intersects) inside = !inside;
  }
  return inside;
}

function isReachable(start: MapPoint, target: MapPoint, layout: MapLayoutData, gridSize: number): boolean {
  const startCell = toCell(start, gridSize);
  const targetCell = toCell(target, gridSize);
  const queue = [startCell];
  const visited = new Set([cellKey(startCell)]);
  const maxCells = Math.ceil(layout.worldWidth / gridSize) * Math.ceil(layout.worldHeight / gridSize);
  const directions = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 }
  ];

  while (queue.length > 0 && visited.size <= maxCells) {
    const cell = queue.shift();
    if (!cell) break;
    if (cell.x === targetCell.x && cell.y === targetCell.y) return true;
    for (const direction of directions) {
      const next = { x: cell.x + direction.x, y: cell.y + direction.y };
      const key = cellKey(next);
      if (visited.has(key)) continue;
      const point = { x: next.x * gridSize + gridSize / 2, y: next.y * gridSize + gridSize / 2 };
      if (!pointInsideWorld(point, layout) || !isWalkable(point, layout) || isColliding(point, layout)) continue;
      visited.add(key);
      queue.push(next);
    }
  }

  return false;
}

function toCell(point: MapPoint, gridSize: number): MapPoint {
  return { x: Math.floor(point.x / gridSize), y: Math.floor(point.y / gridSize) };
}

function cellKey(point: MapPoint): string {
  return `${point.x},${point.y}`;
}

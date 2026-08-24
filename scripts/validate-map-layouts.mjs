/* global console, process */
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const mapIds = ["dogo-D0", "castle-C0"];
let hasError = false;

for (const mapId of mapIds) {
  const file = path.join(root, "src", "data", "map-layouts", `${mapId}.json`);
  const layout = JSON.parse(await readFile(file, "utf8"));
  const issues = validate(layout);
  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");
  console.log(`${mapId}: ${errors.length} errors, ${warnings.length} warnings`);
  for (const issue of issues) console.log(`  [${issue.severity}] ${issue.message}`);
  if (errors.length > 0) hasError = true;
}

if (hasError) process.exit(1);

function validate(layout) {
  const issues = [];
  const ids = new Set();
  const markerIds = new Set();
  const mapId = `${layout.locationId}-${layout.areaId}`;
  const arrays = ["walkableRects", "walkablePolygons", "collisionRects", "guidePaths", "enemySpawns", "npcPositions", "interactablePositions", "eventPositions", "markers"];

  assertRequiredIds(layout, issues);

  for (const key of arrays) {
    if (!Array.isArray(layout[key])) issues.push({ severity: "error", message: `${key} は配列である必要があります。` });
  }
  for (const rect of [...(layout.walkableRects ?? []), ...(layout.collisionRects ?? [])]) {
    register(rect.id, issues, ids);
    if (rect.width <= 0 || rect.height <= 0) issues.push({ severity: "error", message: `${rect.id} のサイズが不正です。` });
    if (!inside(rect.x, rect.y, layout) || !inside(rect.x + rect.width, rect.y + rect.height, layout)) issues.push({ severity: "error", message: `${rect.id} が範囲外です。` });
    if (Math.min(rect.width, rect.height) < 48) issues.push({ severity: "warning", message: `${rect.id} は通路幅が狭い可能性があります。` });
  }
  for (const polygon of layout.walkablePolygons ?? []) {
    register(polygon.id, issues, ids);
    if ((polygon.points ?? []).length < 3) issues.push({ severity: "error", message: `${polygon.id} は3点以上必要です。` });
    for (const point of polygon.points ?? []) {
      if (!inside(point.x, point.y, layout)) issues.push({ severity: "error", message: `${polygon.id} の頂点が範囲外です。` });
    }
  }
  for (const object of [...(layout.enemySpawns ?? []), ...(layout.npcPositions ?? []), ...(layout.interactablePositions ?? []), ...(layout.eventPositions ?? [])]) {
    register(object.id, issues, ids);
    if (!inside(object.x, object.y, layout)) issues.push({ severity: "error", message: `${object.id} が範囲外です。` });
  }
  for (const marker of layout.markers ?? []) {
    register(marker.id, issues, markerIds);
    if (!inside(marker.x, marker.y, layout)) issues.push({ severity: "error", message: `${marker.id} が範囲外です。` });
  }
  for (const pathData of layout.guidePaths ?? []) {
    register(pathData.id, issues, ids);
    if ((pathData.points ?? []).length < 2) issues.push({ severity: "warning", message: `${pathData.id} は経路点が少なすぎます。` });
  }
  if (mapId === "dogo-D0") validateDogoWalkability(layout, issues);
  return issues.length > 0 ? issues : [{ severity: "ok", message: "マップレイアウト検証OK" }];
}

function validateDogoWalkability(layout, issues) {
  const criticalPoints = [
    { id: "playerStart", ...layout.playerStart },
    ...(layout.enemySpawns ?? []),
    ...(layout.npcPositions ?? []),
    ...(layout.interactablePositions ?? []),
    ...(layout.eventPositions ?? []),
    ...(layout.guidePaths ?? []).flatMap((pathData) => pathData.points ?? [])
  ];

  for (const point of criticalPoints) {
    if (!isWalkable(point, layout)) {
      issues.push({ severity: "error", message: `${point.id ?? "guide point"} がDogoの歩行ポリゴン外です。` });
    }
  }

  const playerCollider = {
    x: layout.playerStart.x - 21,
    y: layout.playerStart.y - 18,
    width: 42,
    height: 28
  };
  if (!isWalkableRect(playerCollider, layout)) {
    issues.push({ severity: "error", message: "Dogoのプレイヤー開始コライダーが歩行ポリゴン内に収まりません。" });
  }
}

function isWalkable(point, layout) {
  return (layout.walkableRects ?? []).some((rect) => pointInRect(point, rect))
    || (layout.walkablePolygons ?? []).some((polygon) => pointInPolygon(point, polygon.points ?? []));
}

function isWalkableRect(rect, layout) {
  const points = [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.width, y: rect.y },
    { x: rect.x, y: rect.y + rect.height },
    { x: rect.x + rect.width, y: rect.y + rect.height },
    { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
  ];
  return points.every((point) => isWalkable(point, layout));
}

function pointInRect(point, rect) {
  return point.x >= rect.x
    && point.x <= rect.x + rect.width
    && point.y >= rect.y
    && point.y <= rect.y + rect.height;
}

function pointInPolygon(point, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const a = polygon[i];
    const b = polygon[j];
    if (!a || !b) continue;
    if (pointOnSegment(point, a, b)) return true;
    const crosses = ((a.y > point.y) !== (b.y > point.y))
      && point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x;
    if (crosses) inside = !inside;
  }
  return inside;
}

function pointOnSegment(point, start, end) {
  const cross = (point.y - start.y) * (end.x - start.x)
    - (point.x - start.x) * (end.y - start.y);
  if (Math.abs(cross) > 0.001) return false;
  return point.x >= Math.min(start.x, end.x) - 0.001
    && point.x <= Math.max(start.x, end.x) + 0.001
    && point.y >= Math.min(start.y, end.y) - 0.001
    && point.y <= Math.max(start.y, end.y) + 0.001;
}

function assertRequiredIds(layout, issues) {
  const mapId = `${layout.locationId}-${layout.areaId}`;
  const requiredByMap = {
    "dogo-D0": ["D-E01", "D-E02", "D-E03", "D-E04", "npc_dogo_guide", "npc_yumori_grandma"],
    "castle-C0": ["C-E01", "C-E02", "C-E03", "C-E04", "npc_castle_scout", "castle_gate_hint", "castle_dark_well", "castle_guard_shrine", "castle_guard_event"]
  };
  const requiredIds = requiredByMap[mapId] ?? [];
  const positionedObjects = [
    ...(layout.enemySpawns ?? []),
    ...(layout.npcPositions ?? []),
    ...(layout.interactablePositions ?? []),
    ...(layout.eventPositions ?? [])
  ];

  for (const id of requiredIds) {
    if (!positionedObjects.some((item) => item.id === id)) {
      issues.push({ severity: "error", message: `${id} が見つかりません。` });
    }
  }
}

function register(id, issues, ids) {
  if (!id) {
    issues.push({ severity: "error", message: "空IDがあります。" });
    return;
  }
  if (ids.has(id)) issues.push({ severity: "error", message: `IDが重複しています: ${id}` });
  ids.add(id);
}

function inside(x, y, layout) {
  return Number.isFinite(x) && Number.isFinite(y) && x >= 0 && y >= 0 && x <= layout.worldWidth && y <= layout.worldHeight;
}

/* global console, process */
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const mapIds = [
  "dogo-D0",
  "castle-C0",
  "shimanami-A2-0",
  "shimanami-A2-1",
  "shimanami-A2-2",
  "shimanami-A2-3",
  "shimanami-A2-4",
  "shimanami-A2-5"
];
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
  if (layout.locationId === "shimanami") validateShimanamiWalkability(layout, issues);
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

function validateShimanamiWalkability(layout, issues) {
  const playerCollider = {
    x: layout.playerStart.x - 21,
    y: layout.playerStart.y - 18,
    width: 42,
    height: 28
  };
  if (!isWalkableRect(playerCollider, layout)) {
    issues.push({ severity: "error", message: `${layout.areaId}のプレイヤー開始コライダーが歩行ポリゴン内に収まりません。` });
  }

  const enemyColliderOffsets = {
    "A2-E01": { x: -26, y: -30, width: 52, height: 38 },
    "A2-E02": { x: -28, y: -25, width: 56, height: 36 },
    "A2-E03": { x: -24, y: -28, width: 48, height: 36 },
    "A2-E04": { x: -28, y: -25, width: 56, height: 36 },
    "A2-E05": { x: -26, y: -30, width: 52, height: 38 },
    "A2-E06": { x: -24, y: -28, width: 48, height: 36 },
    "A2-E07": { x: -28, y: -25, width: 56, height: 36 },
    "A2-E08": { x: -26, y: -30, width: 52, height: 38 },
    "A2-B01": { x: -38, y: -40, width: 76, height: 54 }
  };

  for (const enemy of layout.enemySpawns ?? []) {
    const offset = enemyColliderOffsets[enemy.id];
    if (!offset) continue;
    const collider = {
      x: enemy.x + offset.x,
      y: enemy.y + offset.y,
      width: offset.width,
      height: offset.height
    };
    if (!isWalkableRect(collider, layout)) {
      issues.push({ severity: "error", message: `${enemy.id}の敵コライダーが歩行ポリゴン内に収まりません。` });
    }
    if ((layout.collisionRects ?? []).some((rect) => intersects(collider, rect))) {
      issues.push({ severity: "error", message: `${enemy.id}の敵コライダーが固定collisionと重なっています。` });
    }
  }

  for (const object of [
    ...(layout.npcPositions ?? []),
    ...(layout.eventPositions ?? [])
  ]) {
    if (!isWalkable(object, layout)) {
      issues.push({ severity: "error", message: `${object.id}の中心が歩行ポリゴン外です。` });
    }
  }
  for (const object of layout.interactablePositions ?? []) {
    const center = {
      x: object.x + object.width / 2,
      y: object.y + object.height / 2
    };
    if (!isWalkable(center, layout)) {
      issues.push({ severity: "error", message: `${object.id}の中心が歩行ポリゴン外です。` });
    }
  }

  for (const pathData of layout.guidePaths ?? []) {
    for (let index = 1; index < pathData.points.length; index += 1) {
      const from = pathData.points[index - 1];
      const to = pathData.points[index];
      const distance = Math.hypot(to.x - from.x, to.y - from.y);
      const samples = Math.max(1, Math.ceil(distance / 16));
      for (let sample = 0; sample <= samples; sample += 1) {
        const progress = sample / samples;
        const x = from.x + (to.x - from.x) * progress;
        const y = from.y + (to.y - from.y) * progress;
        const collider = { x: x - 21, y: y - 18, width: 42, height: 28 };
        if (!isWalkableRect(collider, layout)) {
          issues.push({ severity: "error", message: `${pathData.id}のguide path上にプレイヤーが通れない点があります。` });
          break;
        }
        if ((layout.collisionRects ?? []).some((rect) => intersects(collider, rect))) {
          issues.push({ severity: "error", message: `${pathData.id}が固定collisionを横切っています。` });
          break;
        }
      }
    }
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

function intersects(a, b) {
  return a.x < b.x + b.width
    && a.x + a.width > b.x
    && a.y < b.y + b.height
    && a.y + a.height > b.y;
}

function assertRequiredIds(layout, issues) {
  const mapId = `${layout.locationId}-${layout.areaId}`;
  const requiredByMap = {
    "dogo-D0": ["D-E01", "D-E02", "D-E03", "D-E04", "npc_dogo_guide", "npc_yumori_grandma"],
    "castle-C0": ["C-E01", "C-E02", "C-E03", "C-E04", "npc_castle_scout", "castle_gate_hint", "castle_dark_well", "castle_guard_shrine", "castle_guard_event"],
    "shimanami-A2-0": ["npc_p12_port_master", "p12_hub_log", "p12_hub_bridge_route", "p12_hub_boat_route", "p12_hub_windmill"],
    "shimanami-A2-1": ["A2-E01", "npc_p12_bridge_keeper", "p12_bridge_discovery", "p12_bridge_to_watchtower"],
    "shimanami-A2-2": ["A2-E02", "npc_p12_island_keeper", "p12_island_discovery", "p12_island_to_watchtower"],
    "shimanami-A2-3": ["npc_p12_watchkeeper", "p12_wind_memory", "p12_windmill", "p12_watchtower_to_island"],
    "shimanami-A2-4": ["A2-E03", "p12_kamijima_discovery", "p12_kamijima_to_boss"],
    "shimanami-A2-5": ["A2-B01", "p12_boss_altar", "p12_boss_to_island"]
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

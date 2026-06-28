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
  const arrays = ["walkableRects", "walkablePolygons", "collisionRects", "guidePaths", "enemySpawns", "npcPositions", "interactablePositions", "eventPositions", "markers"];
  if (`${layout.locationId}-${layout.areaId}` === "dogo-D0") {
    for (const id of ["D-E01", "D-E02", "D-E03", "D-E04", "npc_dogo_guide", "npc_yumori_grandma"]) {
      if (![...layout.enemySpawns, ...layout.npcPositions, ...layout.interactablePositions, ...layout.eventPositions].some((item) => item.id === id)) {
        issues.push({ severity: "error", message: `${id} が見つかりません。` });
      }
    }
  }
  for (const key of arrays) {
    if (!Array.isArray(layout[key])) issues.push({ severity: "error", message: `${key} は配列である必要があります。` });
  }
  for (const rect of [...(layout.walkableRects ?? []), ...(layout.collisionRects ?? [])]) {
    register(rect.id, issues, ids);
    if (rect.width <= 0 || rect.height <= 0) issues.push({ severity: "error", message: `${rect.id} のサイズが不正です。` });
    if (!inside(rect.x, rect.y, layout) || !inside(rect.x + rect.width, rect.y + rect.height, layout)) issues.push({ severity: "error", message: `${rect.id} が範囲外です。` });
    if (Math.min(rect.width, rect.height) < 48) issues.push({ severity: "warning", message: `${rect.id} は道幅が狭い可能性があります。` });
  }
  for (const object of [...(layout.enemySpawns ?? []), ...(layout.npcPositions ?? []), ...(layout.interactablePositions ?? []), ...(layout.eventPositions ?? [])]) {
    register(object.id, issues, ids);
    if (!inside(object.x, object.y, layout)) issues.push({ severity: "error", message: `${object.id} が範囲外です。` });
  }
  for (const marker of layout.markers ?? []) {
    register(marker.id, issues, markerIds);
    if (!inside(marker.x, marker.y, layout)) issues.push({ severity: "error", message: `${marker.id} が範囲外です。` });
  }
  for (const path of layout.guidePaths ?? []) {
    register(path.id, issues, ids);
    if ((path.points ?? []).length < 2) issues.push({ severity: "warning", message: `${path.id} は経路点が少なすぎます。` });
  }
  return issues.length > 0 ? issues : [{ severity: "ok", message: "マップレイアウト検証OK" }];
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

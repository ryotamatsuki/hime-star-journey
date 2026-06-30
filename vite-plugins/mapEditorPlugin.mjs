/* global Buffer, URL, process, setTimeout */
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

const allowedMaps = new Set(["dogo-D0", "castle-C0"]);

export function mapEditorPlugin() {
  let root = process.cwd();
  return {
    name: "hime-map-editor-dev-api",
    apply: "serve",
    configResolved(config) {
      root = config.root;
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/__map-editor/")) return next();
        try {
          const url = new URL(req.url, "http://127.0.0.1");
          if (url.pathname === "/__map-editor/maps") {
            return sendJson(res, [...allowedMaps]);
          }
          if (url.pathname === "/__map-editor/load") {
            const mapId = assertMapId(url.searchParams.get("map"));
            return sendJson(res, JSON.parse(await readFile(mapPath(root, mapId), "utf8")));
          }
          if (url.pathname === "/__map-editor/save" && req.method === "POST") {
            const body = JSON.parse(await readBody(req));
            const mapId = assertMapId(body.mapId);
            assertLayout(mapId, body.layout);
            const file = mapPath(root, mapId);
            const nextContent = `${JSON.stringify(body.layout, null, 2)}\n`;
            const currentContent = await readFile(file, "utf8").catch(() => "");
            if (currentContent !== nextContent) {
              server.watcher.unwatch(file);
              await backup(root, mapId, file);
              await writeAtomic(file, nextContent);
              setTimeout(() => server.watcher.add(file), 250);
            }
            return sendJson(res, { ok: true, mapId });
          }
          if (url.pathname === "/__map-editor/validate" && req.method === "POST") {
            const body = JSON.parse(await readBody(req));
            assertLayout(assertMapId(body.mapId), body.layout);
            return sendJson(res, { ok: true });
          }
          res.statusCode = 404;
          res.end("Not found");
        } catch (error) {
          res.statusCode = 400;
          res.setHeader("content-type", "text/plain; charset=utf-8");
          res.end(error instanceof Error ? error.message : "Map editor API error");
        }
      });
    }
  };
}

function mapPath(root, mapId) {
  return path.join(root, "src", "data", "map-layouts", `${mapId}.json`);
}

function assertMapId(mapId) {
  if (typeof mapId !== "string" || !allowedMaps.has(mapId)) throw new Error("許可されていないマップIDです。");
  return mapId;
}

function assertLayout(mapId, layout) {
  if (!layout || typeof layout !== "object") throw new Error("layout が不正です。");
  if (mapId !== `${layout.locationId}-${layout.areaId}`) throw new Error("mapId と layout の locationId/areaId が一致しません。");
  for (const key of ["worldWidth", "worldHeight"]) {
    if (!Number.isFinite(layout[key]) || layout[key] <= 0) throw new Error(`${key} が不正です。`);
  }
  for (const key of ["walkableRects", "walkablePolygons", "collisionRects", "guidePaths", "enemySpawns", "npcPositions", "interactablePositions", "eventPositions", "markers"]) {
    if (!Array.isArray(layout[key])) throw new Error(`${key} は配列である必要があります。`);
  }
  assertPoint(layout.playerStart, layout, "playerStart");
  assertRect(layout.cameraBounds, layout, "cameraBounds");
  const ids = new Set();
  const markerIds = new Set();
  for (const rect of [...layout.walkableRects, ...layout.collisionRects]) {
    assertId(rect.id, ids);
    assertRect(rect, layout, rect.id);
  }
  for (const polygon of layout.walkablePolygons) {
    assertId(polygon.id, ids);
    if (!Array.isArray(polygon.points) || polygon.points.length < 3) throw new Error(`${polygon.id} は3点以上必要です。`);
    for (const point of polygon.points) assertPoint(point, layout, polygon.id);
  }
  for (const path of layout.guidePaths) {
    assertId(path.id, ids);
    if (!Array.isArray(path.points)) throw new Error(`${path.id} のpointsが不正です。`);
    for (const point of path.points) assertPoint(point, layout, path.id);
  }
  for (const object of [...layout.enemySpawns, ...layout.npcPositions, ...layout.interactablePositions, ...layout.eventPositions]) {
    assertId(object.id, ids);
    assertPoint(object, layout, object.id);
  }
  for (const marker of layout.markers) {
    assertId(marker.id, markerIds);
    assertPoint(marker, layout, marker.id);
  }
  if (!isWalkable(layout.playerStart, layout)) throw new Error("playerStart が歩行可能領域内にありません。");
  if (isColliding(layout.playerStart, layout)) throw new Error("playerStart が衝突領域内にあります。");
}

function assertId(id, ids) {
  if (typeof id !== "string" || id.length === 0) throw new Error("空のIDがあります。");
  if (ids.has(id)) throw new Error(`IDが重複しています: ${id}`);
  ids.add(id);
}

function assertRect(rect, layout, label) {
  if (!rect || !Number.isFinite(rect.x) || !Number.isFinite(rect.y) || !Number.isFinite(rect.width) || !Number.isFinite(rect.height)) {
    throw new Error(`${label} の矩形値が不正です。`);
  }
  if (rect.width <= 0 || rect.height <= 0) throw new Error(`${label} の幅または高さが不正です。`);
  if (rect.x < 0 || rect.y < 0 || rect.x + rect.width > layout.worldWidth || rect.y + rect.height > layout.worldHeight) {
    throw new Error(`${label} がワールド範囲外です。`);
  }
}

function assertPoint(point, layout, label) {
  if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) throw new Error(`${label} の座標が不正です。`);
  if (point.x < 0 || point.y < 0 || point.x > layout.worldWidth || point.y > layout.worldHeight) {
    throw new Error(`${label} がワールド範囲外です。`);
  }
}

function isWalkable(point, layout) {
  return layout.walkableRects.some((rect) => pointInRect(point, rect))
    || layout.walkablePolygons.some((polygon) => pointInPolygon(point, polygon.points));
}

function isColliding(point, layout) {
  return layout.collisionRects.some((rect) => pointInRect(point, rect));
}

function pointInRect(point, rect) {
  return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
}

function pointInPolygon(point, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const a = polygon[i];
    const b = polygon[j];
    const crosses = ((a.y > point.y) !== (b.y > point.y))
      && point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x;
    if (crosses) inside = !inside;
  }
  return inside;
}

async function backup(root, mapId, file) {
  const backupDir = path.join(root, ".map-editor-backups", mapId);
  await mkdir(backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  try {
    await writeFile(path.join(backupDir, `${stamp}.json`), await readFile(file, "utf8"));
  } catch {
    // First save can proceed even if no previous file exists.
  }
}

async function writeAtomic(file, content) {
  const temp = `${file}.${process.pid}.tmp`;
  await writeFile(temp, content, "utf8");
  await rename(temp, file);
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 1_000_000) throw new Error("リクエストが大きすぎます。");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function sendJson(res, value) {
  res.statusCode = 200;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(value));
}

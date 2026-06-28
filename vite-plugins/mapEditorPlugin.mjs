/* global Buffer, URL, process */
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
            await backup(root, mapId, file);
            await writeAtomic(file, `${JSON.stringify(body.layout, null, 2)}\n`);
            server.ws.send({ type: "full-reload" });
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

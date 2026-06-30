/* global console, process */
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const checks = [];

const read = (file) => readFile(path.join(root, file), "utf8");

function check(label, condition, detail = "") {
  checks.push({ label, ok: Boolean(condition), detail });
}

const [
  html,
  app,
  state,
  canvas,
  validator,
  plugin,
  dogo,
  castle,
  packageJson
] = await Promise.all([
  read("map-editor.html"),
  read("src/map-editor/MapEditorApp.ts"),
  read("src/map-editor/EditorState.ts"),
  read("src/map-editor/EditorCanvas.ts"),
  read("src/map-editor/MapValidator.ts"),
  read("vite-plugins/mapEditorPlugin.mjs"),
  read("src/data/map-layouts/dogo-D0.json"),
  read("src/data/map-layouts/castle-C0.json"),
  read("package.json")
]);

const requiredLayers = [
  "cameraBounds",
  "walkableRects",
  "walkablePolygons",
  "collisionRects",
  "playerStart",
  "enemySpawns",
  "npcPositions",
  "interactablePositions",
  "eventPositions",
  "guidePaths",
  "markers"
];

const requiredActions = [
  "validate",
  "save",
  "preview",
  "export",
  "copy-json",
  "import",
  "undo",
  "redo",
  "duplicate",
  "delete",
  "add-vertex",
  "delete-vertex",
  "split-edge",
  "reverse-polygon"
];

const dogoJson = JSON.parse(dogo);
const castleJson = JSON.parse(castle);
const pkg = JSON.parse(packageJson);

check("map-editor.html mounts map editor module", html.includes("/src/map-editor/main.ts"));
check("dev:editor script exists", pkg.scripts?.["dev:editor"]?.includes("map-editor.html"));
check("maps:validate script exists", pkg.scripts?.["maps:validate"] === "node scripts/validate-map-layouts.mjs");
check("Dogo D0 layout exists", dogoJson.locationId === "dogo" && dogoJson.areaId === "D0");
check("Castle C0 layout exists", castleJson.locationId === "castle" && castleJson.areaId === "C0");
check("Dogo has guide path data", Array.isArray(dogoJson.guidePaths) && dogoJson.guidePaths.length > 0);
check("Dogo has required enemy spawns", ["D-E01", "D-E02", "D-E03", "D-E04"].every((id) => dogoJson.enemySpawns.some((enemy) => enemy.id === id)));
check("preview save key is isolated", app.includes("__hime_star_map_editor_preview_save__") || (await read("src/main.ts")).includes("__hime_star_map_editor_preview_save__"));
check("client save blocks validation errors", app.includes("検証エラーあり") && app.includes("severity === \"error\""));
check("preview iframe is implemented", app.includes("game-preview-frame") && app.includes("preview-open"));
check("JSON clipboard copy action exists", app.includes("copyJson") && app.includes("copy-json"));
check("all required actions are wired", requiredActions.every((action) => app.includes(action)), requiredActions.filter((action) => !app.includes(action)).join(", "));
check("all required layers are defined", requiredLayers.every((layer) => state.includes(`"${layer}"`)), requiredLayers.filter((layer) => !state.includes(`"${layer}"`)).join(", "));
check("canvas handles camera bounds", canvas.includes("cameraBounds") && canvas.includes("drawRect(state.layout.cameraBounds"));
check("canvas handles markers", canvas.includes("\"markers\"") && canvas.includes("this.drawObjects(state, \"markers\""));
check("validator checks reachability", validator.includes("isReachable") && validator.includes("REQUIRED_DOGO_TARGETS"));
check("validator rejects collision targets", validator.includes("が衝突領域内にあります"));
check("dev API is serve-only", plugin.includes("apply: \"serve\""));
check("dev API whitelists maps", plugin.includes("allowedMaps") && plugin.includes("dogo-D0") && plugin.includes("castle-C0"));
check("dev API backs up before save", plugin.includes(".map-editor-backups") && plugin.includes("await backup"));
check("dev API validates schema before save", plugin.includes("assertLayout(mapId, body.layout)") && plugin.includes("assertPoint(layout.playerStart"));
check("dev API rejects duplicate IDs", plugin.includes("IDが重複しています"));
check("dev API avoids editor full reload on save", plugin.includes("server.watcher.unwatch(file)") && !plugin.includes("full-reload"));

const failed = checks.filter((item) => !item.ok);
for (const item of checks) {
  console.log(`${item.ok ? "OK" : "NG"} ${item.label}${item.detail ? ` (${item.detail})` : ""}`);
}

if (failed.length > 0) {
  console.error(`Map editor smoke verification failed: ${failed.length} issue(s).`);
  process.exit(1);
}

console.log("Map editor smoke verification passed.");

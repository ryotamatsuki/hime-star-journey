import { GameApp } from "./core/GameApp";
import { SaveManager } from "./core/SaveManager";
import "./styles.css";

const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas");
const uiRoot = document.querySelector<HTMLElement>("#ui-root");

if (!canvas || !uiRoot) {
  throw new Error("CanvasまたはUIルートが見つかりません。");
}

const params = new URLSearchParams(window.location.search);
const previewMap = import.meta.env.DEV ? params.get("himeDevMap") : null;
const previewSaveKey = "__hime_star_map_editor_preview_save__";

if (previewMap) {
  const [locationId = "dogo", areaId = "D0"] = previewMap.split("-");
  const previewSaveManager = new SaveManager(previewSaveKey);
  previewSaveManager.save({
    ...previewSaveManager.createInitialSaveData(),
    currentScreenId: "explore",
    currentChapterId: `${locationId}_preview`,
    currentLocationId: locationId,
    currentAreaId: areaId,
    flags: {
      ...previewSaveManager.createInitialSaveData().flags,
      prologue_completed: true,
      shiro_met: true,
      mikan_core_stolen: true,
      dogo_anomaly_started: true,
      dogo_quest_started: true,
      dogo_quest_hint_seen: true,
      dialogue_dogo_intro_seen: true,
      dialogue_first_enemy_hint_seen: true
    },
    dogoQuestStatus: "hintSeen",
    lastSynopsis: "マップエディタの確認用プレビューです。通常セーブには保存されません。"
  });
}

const app = new GameApp({
  canvas,
  uiRoot,
  saveKey: previewMap ? previewSaveKey : undefined,
  initialScreenId: previewMap ? "explore" : "title"
});

app.start().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  uiRoot.innerHTML = "";
  const errorView = document.createElement("div");
  errorView.className = "app-error";
  errorView.textContent = `起動に失敗しました: ${message}`;
  document.body.append(errorView);
  console.error(error);
});

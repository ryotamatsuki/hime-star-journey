import { GameApp } from "./core/GameApp";
import { SaveManager } from "./core/SaveManager";
import { getUnlockedNotebookEntries, notebookEntries } from "./data/notebook";
import type { SaveData } from "./types/save";

const SAVE_KEY = "__p9_browser_verifier_save__";
const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas");
const uiRoot = document.querySelector<HTMLElement>("#ui-root");
const status = document.querySelector<HTMLElement>("#p9-verifier-status");
const results = document.querySelector<HTMLOListElement>("#p9-verifier-results");

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

function record(message: string): void {
  const item = document.createElement("li");
  item.textContent = `OK ${message}`;
  results?.append(item);
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
  record(message);
}

function setStatus(value: "pass" | "fail", message = ""): void {
  if (!status) return;
  status.textContent = value === "pass"
    ? "P9_BROWSER_VERIFICATION:PASS"
    : `P9_BROWSER_VERIFICATION:FAIL ${message}`;
}

function p9CompleteSave(overrides: Partial<SaveData> = {}): SaveData {
  const base: SaveData = {
    version: "0.3.0",
    currentChapterId: "post_mvp_star_map",
    currentLocationId: "castle",
    currentAreaId: "C0",
    currentScreenId: "starMap",
    partyMemberIds: ["hime"],
    activePartyMemberIds: ["hime"],
    starLevel: 3,
    hp: 80,
    mp: 20,
    maxHp: 80,
    maxMp: 20,
    unlockedCards: [
      "card_mikan_attack",
      "card_shirasagi_ofuda",
      "card_dogo_drop",
      "card_yukemuri_veil",
      "card_castle_guard",
      "card_star_seal"
    ],
    collectedStars: ["dogo", "castle"],
    unlockedLoreIds: [],
    defeatedEnemyIds: ["C-E01", "C-E02", "C-E03", "C-E04", "B-E01"],
    clearedQuestIds: ["quest_dogo_yukemuri_star", "quest_castle_shiroyama_guard"],
    unlockedLocations: ["dogo", "castle"],
    openedPaths: ["castle_dark_well_cleared_path"],
    acquiredItems: { shiroyama_guard: 1, mikan_star_core: 1 },
    acquiredCharms: ["shiroyama_guard"],
    flags: {
      prologue_completed: true,
      shiro_met: true,
      mikan_core_stolen: true,
      dogo_quest_started: true,
      dogo_quest_hint_seen: true,
      yuno_star_obtained: true,
      star_dogo_collected: true,
      location_castle_unlocked: true,
      castle_quest_started: true,
      castle_dark_well_cleared: true,
      shiroyama_guard_obtained: true,
      p8_kagemasa_route_unlocked: true,
      kagemasa_battle_started: true,
      kagemasa_sealed: true,
      mikan_core_recovered: true,
      castle_star_obtained: true,
      pendant_light_restored: true,
      p8_completed: true,
      gameCompleted: true
    },
    dogoQuestStatus: "cleared",
    castleQuestStatus: "cleared",
    lastSynopsis: "カゲマサを再封印し、みかん星の核と城の星を取り戻しました。",
    savedAt: new Date().toISOString()
  };
  return { ...base, ...overrides, flags: { ...base.flags, ...(overrides.flags ?? {}) } };
}

async function waitFor(predicate: () => boolean, message: string, timeoutMs = 8000): Promise<void> {
  const started = performance.now();
  while (performance.now() - started < timeoutMs) {
    if (predicate()) return;
    await sleep(80);
  }
  throw new Error(`Timed out: ${message}`);
}

function verifyNotebookData(): void {
  const save = p9CompleteSave();
  assert(notebookEntries.length === 10, "旅の手帳は10項目で構成される");
  assert(getUnlockedNotebookEntries(save).length === 10, "MVP完了セーブでは手帳10項目がすべて解放される");
  const early = p9CompleteSave({ flags: { shiro_met: true }, collectedStars: [], defeatedEnemyIds: [], acquiredItems: {} });
  assert(getUnlockedNotebookEntries(early).length < notebookEntries.length, "未進行セーブでは未解放ページを残す");
}

async function verifyLiveP9(): Promise<void> {
  if (!canvas || !uiRoot) throw new Error("verifier canvas/ui missing");
  const manager = new SaveManager(SAVE_KEY);
  manager.clear();
  manager.save(p9CompleteSave());

  const startedAt = performance.now();
  const app = new GameApp({
    canvas,
    uiRoot,
    saveKey: SAVE_KEY,
    initialScreenId: "explore",
    initialParams: { saveData: manager.load(), locationId: "castle", areaId: "C0" }
  });
  await app.start();
  record(`GameApp起動 ${Math.round(performance.now() - startedAt)}ms`);

  await waitFor(() => Boolean(document.querySelector("[data-notebook-open='true']")), "notebook open button");
  assert(document.body.innerText.includes("旅の手帳 N"), "探索画面に旅の手帳ボタンを表示する");

  await waitFor(() => manager.load()?.flags.autosave_enabled === true, "autosave flag", 5000);
  const autosaved = manager.load();
  assert(autosaved?.currentScreenId === "explore", "安全な探索画面をオートセーブの再開地点に同期する");
  assert(autosaved?.flags.autosave_enabled === true, "オートセーブ有効状態を保存する");

  document.querySelector<HTMLButtonElement>("[data-notebook-open='true']")?.click();
  await waitFor(() => Boolean(document.querySelector(".notebook-screen-ui")), "NotebookScreen");
  assert(document.body.innerText.includes("ひめの旅の手帳"), "旅の手帳画面を開く");
  assert(document.body.innerText.includes("旅の記録 10/10"), "MVP完了時の手帳解放数を表示する");
  assert(document.body.innerText.includes("星封じと取り戻した光"), "カゲマサ再封印の記録を表示する");
  assert(document.body.innerText.includes("使えるカード"), "解放済みカード一覧を表示する");
  assert(document.body.innerText.includes("地域メモ：松山城 / C0"), "地域メモを表示する");
  assert(document.body.innerText.includes("オートセーブ"), "手帳にオートセーブ情報を表示する");
  assert(manager.load()?.currentScreenId === "explore", "手帳を開いてもセーブの再開地点をnotebookへ上書きしない");

  const muteButton = [...document.querySelectorAll<HTMLButtonElement>("button")].find((button) => button.textContent === "音を消す");
  assert(Boolean(muteButton), "手帳に音量ミュート操作を表示する");
  muteButton?.click();
  await waitFor(() => document.body.innerText.includes("音を出す"), "audio mute toggle");
  assert(document.body.innerText.includes("音を出す"), "BGM/SEのミュート状態をUIで切り替えられる");

  const closeButton = [...document.querySelectorAll<HTMLButtonElement>("button")].find((button) => button.textContent === "手帳を閉じる");
  closeButton?.click();
  await waitFor(() => Boolean(document.querySelector("[data-notebook-open='true']")), "return from notebook");
  assert(!document.querySelector(".notebook-screen-ui"), "手帳を閉じて元の探索画面へ戻る");

  app.stop();
  manager.clear();
}

async function main(): Promise<void> {
  try {
    verifyNotebookData();
    await verifyLiveP9();
    setStatus("pass");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(error);
    setStatus("fail", message);
    throw error;
  }
}

void main();

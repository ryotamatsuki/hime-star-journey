import "./styles.css";
import { assetManifest } from "./data/assets";
import { notebookEntries, getUnlockedNotebookEntries } from "./data/notebook";
import { AssetPathError } from "./p10BrowserVerifierTypes";
import { GameApp } from "./core/GameApp";
import { resolvePublicAssetPath } from "./core/AssetPath";
import { SaveManager } from "./core/SaveManager";
import { resolveContinueTarget } from "./screens/TitleScreen";

const SAVE_KEY = "__p10_browser_verifier_save__";
const PHASE_KEY = "__p10_browser_verifier_phase__";
const WORLD_WIDTH = 1920;
const WORLD_HEIGHT = 1080;

const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas");
const uiRoot = document.querySelector<HTMLElement>("#ui-root");
const status = document.querySelector<HTMLElement>("#p10-verifier-status");
const results = document.querySelector<HTMLOListElement>("#p10-verifier-results");

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));
let app: GameApp | null = null;
const runtimeErrors: string[] = [];

window.addEventListener("error", (event) => {
  const message = event.error instanceof Error ? event.error.message : event.message;
  if (message) runtimeErrors.push(message);
});
window.addEventListener("unhandledrejection", (event) => {
  runtimeErrors.push(`unhandled rejection: ${String(event.reason)}`);
});

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
    ? "P10_BROWSER_VERIFICATION:PASS"
    : `P10_BROWSER_VERIFICATION:FAIL ${message}`;
}

async function waitFor(predicate: () => boolean, message: string, timeoutMs = 10000): Promise<void> {
  const started = performance.now();
  while (performance.now() - started < timeoutMs) {
    if (predicate()) return;
    await sleep(80);
  }
  throw new Error(`Timed out: ${message}`);
}

function bodyText(): string {
  return document.body.innerText;
}

function visible<T extends HTMLElement>(element: T | null): element is T {
  return Boolean(element && !element.hidden && getComputedStyle(element).display !== "none");
}

function button(label: string, exact = true): HTMLButtonElement | undefined {
  return [...document.querySelectorAll<HTMLButtonElement>("button")]
    .find((candidate) => {
      const text = candidate.textContent?.trim() ?? "";
      return exact ? text === label : text.includes(label);
    });
}

async function clickButton(label: string, exact = true): Promise<void> {
  const target = button(label, exact);
  if (!target) throw new Error(`Button not found: ${label}`);
  target.click();
  await sleep(120);
}

function isDialogueVisible(): boolean {
  const dialogue = document.querySelector<HTMLElement>(".dialogue-box");
  return Boolean(dialogue && !dialogue.classList.contains("is-hidden"));
}

async function finishDialogue(): Promise<void> {
  for (let index = 0; index < 24 && isDialogueVisible(); index += 1) {
    const next = document.querySelector<HTMLButtonElement>(".dialogue-next");
    if (!next) throw new Error("Dialogue is visible without a next button");
    next.click();
    await sleep(120);
  }
  assert(!isDialogueVisible(), "会話を通常の次へ／閉じる操作で完了する");
}

async function tapKey(code: string, key: string): Promise<void> {
  window.dispatchEvent(new KeyboardEvent("keydown", { code, key, bubbles: true, cancelable: true }));
  await sleep(90);
  window.dispatchEvent(new KeyboardEvent("keyup", { code, key, bubbles: true, cancelable: true }));
  await sleep(120);
}

async function holdKeys(keys: Array<{ code: string; key: string }>, durationMs: number): Promise<void> {
  for (const key of keys) {
    window.dispatchEvent(new KeyboardEvent("keydown", { ...key, bubbles: true, cancelable: true }));
  }
  await sleep(durationMs);
  for (const key of [...keys].reverse()) {
    window.dispatchEvent(new KeyboardEvent("keyup", { ...key, bubbles: true, cancelable: true }));
  }
  await sleep(120);
}

function playerPosition(): { x: number; y: number } | null {
  const dot = document.querySelector<HTMLElement>(".player-dot");
  if (!dot) return null;
  const x = Number.parseFloat(dot.style.left);
  const y = Number.parseFloat(dot.style.top);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return { x: (x / 100) * WORLD_WIDTH, y: (y / 100) * WORLD_HEIGHT };
}

async function moveTo(target: { x: number; y: number }, label: string, tolerance = 28): Promise<void> {
  for (let attempt = 0; attempt < 42; attempt += 1) {
    if (isDialogueVisible()) {
      await finishDialogue();
      continue;
    }
    if (document.querySelector(".battle-ui")) return;

    const current = playerPosition();
    if (!current) throw new Error(`Player position unavailable while moving to ${label}`);
    const dx = target.x - current.x;
    const dy = target.y - current.y;
    if (Math.hypot(dx, dy) <= tolerance) return;

    const keys: Array<{ code: string; key: string }> = [];
    if (Math.abs(dx) > tolerance * 0.45) keys.push(dx > 0
      ? { code: "KeyD", key: "d" }
      : { code: "KeyA", key: "a" });
    if (Math.abs(dy) > tolerance * 0.45) keys.push(dy > 0
      ? { code: "KeyS", key: "s" }
      : { code: "KeyW", key: "w" });
    if (keys.length === 0) return;

    const duration = Math.min(520, Math.max(140, Math.round(Math.hypot(dx, dy) / 190 * 1000)));
    await holdKeys(keys, duration);
  }
  throw new Error(`Could not reach ${label}; position=${JSON.stringify(playerPosition())}`);
}

async function moveAlong(points: Array<{ x: number; y: number }>, label: string): Promise<void> {
  for (const point of points) {
    await moveTo(point, label);
    if (document.querySelector(".battle-ui")) return;
  }
}

async function waitForExplore(location: string): Promise<void> {
  await waitFor(() => Boolean(document.querySelector(".explore-ui")), `${location} exploration`);
  await waitFor(() => bodyText().includes(`現在地：${location}`), `${location} location label`);
}

async function openAndVerifyNotebook(expectedProgress: string, expectedTitle?: string): Promise<void> {
  const open = document.querySelector<HTMLButtonElement>("[data-notebook-open='true']");
  if (!open) throw new Error("Notebook open button is missing");
  open.click();
  await waitFor(() => Boolean(document.querySelector(".notebook-screen-ui")), "Notebook screen");
  assert(bodyText().includes("ひめの旅の手帳"), "旅の手帳画面を開ける");
  assert(bodyText().includes(expectedProgress), `旅の手帳の進行表示 ${expectedProgress}`);
  if (expectedTitle) assert(bodyText().includes(expectedTitle), `旅の手帳に「${expectedTitle}」を表示する`);
  const close = button("手帳を閉じる");
  if (!close) throw new Error("Notebook close button is missing");
  close.click();
  await waitFor(() => !document.querySelector(".notebook-screen-ui"), "return from Notebook");
}

async function fightEnemy(symbolId: string, label: string, boss = false): Promise<void> {
  await waitFor(() => Boolean(document.querySelector(".battle-ui")), `${label} battle screen`);
  assert(bodyText().includes("カードを選んで"), `${label} battle instructions`);

  for (let turn = 0; turn < 55; turn += 1) {
    const end = document.querySelector<HTMLButtonElement>(".battle-end-button");
    if (end) {
      end.click();
      await sleep(500);
      break;
    }

    const target = document.querySelector<HTMLButtonElement>(".battle-target-button");
    if (target) {
      target.click();
      await sleep(900);
      continue;
    }

    const preferredName = boss ? "星封じ" : "みかん星";
    const card = [...document.querySelectorAll<HTMLButtonElement>(".battle-card-button")]
      .find((candidate) => (candidate.querySelector(".battle-card-name")?.textContent ?? "").includes(preferredName)
        && !candidate.disabled);
    if (!card) {
      await sleep(180);
      continue;
    }
    card.click();
    await sleep(900);
  }

  await waitFor(() => Boolean(document.querySelector(".explore-ui") || document.querySelector(".ending-screen-ui")), `${label} battle return`, 12000);
  const save = new SaveManager(SAVE_KEY).load();
  assert(save?.defeatedEnemyIds.includes(symbolId), `${label} の勝利結果をセーブする`);
}

async function verifyAssetPaths(): Promise<void> {
  const checks = await Promise.all(assetManifest.images.map(async (definition) => {
    const url = resolvePublicAssetPath(definition.src);
    try {
      const response = await fetch(url, { cache: "no-store" });
      return response.ok ? null : `${definition.id} ${response.status} ${url}`;
    } catch (error) {
      return `${definition.id} ${String(error)} ${url}`;
    }
  }));
  const failures = checks.filter((value): value is string => Boolean(value));
  if (failures.length > 0) throw new AssetPathError(failures.join("; "));
  record(`runtime image asset ${assetManifest.images.length}件のパスを確認する`);
}

function verifyNotebookData(): void {
  const manager = new SaveManager("__p10_notebook_fixture__");
  const initial = manager.createInitialSaveData();
  assert(notebookEntries.length === 10, "旅の手帳は10項目で構成される");
  assert(getUnlockedNotebookEntries(initial).length < notebookEntries.length, "未進行セーブでは未解放ページを残す");
  manager.clear();
}

function verifySaveCompatibility(): void {
  const key = "__p10_legacy_fixture__";
  const manager = new SaveManager(key);
  localStorage.setItem(key, "{broken");
  assert(manager.load() === null, "壊れた旧セーブをfail-safeに無視する");
  localStorage.setItem(key, JSON.stringify({
    currentScreenId: "explore",
    currentLocationId: "dogo_onsen",
    currentAreaId: "D0",
    flags: { prologue_completed: true },
    defeatedEnemyIds: []
  }));
  const normalized = manager.load();
  assert(Boolean(normalized && normalized.version === "0.3.0" && normalized.currentLocationId === "dogo"), "不足項目のある旧セーブを正規化する");
  const battleCheckpoint = manager.createInitialSaveData();
  battleCheckpoint.currentScreenId = "battle";
  battleCheckpoint.currentLocationId = "castle";
  battleCheckpoint.currentAreaId = "C0";
  assert(resolveContinueTarget(battleCheckpoint, () => true) === "explore", "戦闘途中のセーブをつづきから探索へ安全復帰させる");
  manager.clear();
}

async function startApp(): Promise<void> {
  if (!canvas || !uiRoot) throw new Error("verifier canvas/ui missing");
  app = new GameApp({ canvas, uiRoot, saveKey: SAVE_KEY });
  await app.start();
}

async function continueFromTitle(target: "explore" | "ending"): Promise<void> {
  await waitFor(() => Boolean(document.querySelector(".title-screen-ui")), "title screen after reload");
  const continueButton = button("つづきから");
  assert(Boolean(continueButton && !continueButton.disabled), "セーブがあると「つづきから」が有効になる");
  continueButton?.click();
  if (target === "explore") {
    await waitFor(() => Boolean(document.querySelector(".explore-ui")), "safe explore continue");
    const save = new SaveManager(SAVE_KEY).load();
    assert(save?.currentScreenId === "explore", "道後の安全な探索地点からつづきを再開する");
    assert(!document.querySelector(".notebook-screen-ui"), "手帳を開いた状態を再開地点にしない");
  } else {
    await waitFor(() => Boolean(document.querySelector(".ending-screen-ui")), "ending continue");
    const save = new SaveManager(SAVE_KEY).load();
    assert(save?.currentScreenId === "ending" && save.flags.gameCompleted === true, "エンディング後のクリア状態をつづきから維持する");
  }
}

async function runFreshPlaythrough(): Promise<void> {
  const manager = new SaveManager(SAVE_KEY);
  manager.clear();
  localStorage.removeItem(PHASE_KEY);

  await startApp();
  await verifyAssetPaths();
  await waitFor(() => Boolean(document.querySelector(".title-screen-ui")), "title screen");
  assert(bodyText().includes("ひめの小さな星めぐり"), "タイトルを表示する");
  const disabledContinue = button("つづきから");
  assert(Boolean(disabledContinue?.disabled), "初回タイトルでは「つづきから」を無効にする");

  await clickButton("はじめから");
  for (let index = 0; index < 100 && document.querySelector(".prologue-ui"); index += 1) {
    await clickButton("つぎへ");
  }
  await waitForExplore("Dogo Onsen");
  assert(manager.load()?.flags.prologue_completed === true, "プロローグ完了フラグを通常操作で保存する");
  const touchControls = document.querySelector<HTMLElement>(".explore-touch-controls");
  const viewport = `${window.innerWidth}x${window.innerHeight} / ${document.documentElement.clientWidth}`;
  assert(Boolean(touchControls && getComputedStyle(touchControls).display === "grid"), `狭いviewportでタッチ移動パッドを表示する（${viewport}）`);
  assert(document.querySelectorAll("[data-touch-action]").length === 4, "タッチ移動パッドに4方向の入力を用意する");
  await finishDialogue();
  await openAndVerifyNotebook("旅の記録 4/10");

  const guideButton = button("道しるべ");
  if (!guideButton) throw new Error("道しるべ button is missing");
  guideButton.click();
  await sleep(160);
  assert(bodyText().includes("道しるべ表示中"), "道しるべ表示中の状態を表示する");
  await sleep(3000);

  await moveAlong([{ x: 800, y: 720 }], "道後の案内人");
  await finishDialogue();
  await waitFor(() => visible(document.querySelector<HTMLButtonElement>(".explore-talk-button")), "案内人の会話ボタン");
  await clickButton("案内人と話す");
  await finishDialogue();
  assert(manager.load()?.flags.dogo_quest_hint_seen === true, "道後の案内人との会話で必須クエスト条件を立てる");
  await openAndVerifyNotebook("旅の記録 5/10", "湯の星への手がかり");
  await waitFor(() => manager.load()?.flags.autosave_enabled === true, "道後オートセーブ", 5000);

  localStorage.setItem(PHASE_KEY, "earlyReload");
  window.location.reload();
}

async function runAfterEarlyReload(): Promise<void> {
  await startApp();
  await continueFromTitle("explore");
  await waitForExplore("Dogo Onsen");
  await runRemainderAfterEarlyReload();
}

async function runRemainderAfterEarlyReload(): Promise<void> {
  const manager = new SaveManager(SAVE_KEY);
  assert(manager.load()?.currentScreenId === "explore", "道後探索中のreload後に安全地点から復帰する");

  const dogoRoutes: Array<{ id: string; label: string; points: Array<{ x: number; y: number }> }> = [
    { id: "D-E01", label: "道後の影1", points: [{ x: 800, y: 720 }, { x: 760, y: 682 }] },
    { id: "D-E04", label: "道後の影4", points: [{ x: 800, y: 720 }, { x: 900, y: 620 }, { x: 938, y: 500 }] },
    { id: "D-E02", label: "道後の影2", points: [{ x: 800, y: 720 }, { x: 900, y: 620 }, { x: 1050, y: 500 }, { x: 1090, y: 450 }] },
    {
      id: "D-E03",
      label: "道後の影3",
      points: [
        { x: 840, y: 700 },
        { x: 900, y: 620 },
        { x: 960, y: 560 },
        { x: 1020, y: 520 },
        { x: 1080, y: 500 },
        { x: 1140, y: 500 },
        { x: 1200, y: 500 },
        { x: 1260, y: 530 },
        { x: 1320, y: 570 },
        { x: 1380, y: 620 },
        { x: 1440, y: 620 },
        { x: 1500, y: 690 },
        { x: 1520, y: 700 }
      ]
    }
  ];
  for (const route of dogoRoutes) {
    await moveAlong(route.points, route.label);
    await fightEnemy(route.id, route.label);
  }
  await moveAlong([{ x: 900, y: 620 }, { x: 1015, y: 520 }], "湯の星");
  await tapKey("Enter", "Enter");
  await waitFor(() => Boolean(document.querySelector(".star-map-ui")), "星地図", 12000);
  await openAndVerifyNotebook("旅の記録 6/10", "湯の星");
  for (let index = 0; index < 5 && !bodyText().includes("松山城 / "); index += 1) await tapKey("ArrowRight", "ArrowRight");
  assert(bodyText().includes("松山城 / "), "星地図で松山城を選択できる");
  await tapKey("Enter", "Enter");
  await waitForExplore("松山城 C0");
  await finishDialogue();
  await moveAlong([{ x: 500, y: 610 }], "松山城の見回り");
  await waitFor(() => visible(document.querySelector<HTMLButtonElement>(".explore-talk-button")), "城山の見回り");
  await clickButton("城山の見回りと話す");
  await finishDialogue();
  const castleRoutes: Array<{ id: string; label: string; point: { x: number; y: number } }> = [
    { id: "C-E01", label: "松山城の影1", point: { x: 660, y: 690 } },
    { id: "C-E02", label: "松山城の影2", point: { x: 1160, y: 620 } },
    { id: "C-E03", label: "松山城の影3", point: { x: 900, y: 405 } }
  ];
  for (const route of castleRoutes) {
    await moveAlong([route.point], route.label);
    await fightEnemy(route.id, route.label);
  }
  await moveAlong([{ x: 1120, y: 780 }, { x: 1180, y: 800 }], "くらやみ井戸");
  await tapKey("Enter", "Enter");
  await fightEnemy("C-E04", "くらやみ井戸");
  await moveAlong([{ x: 1180, y: 800 }], "井戸の再確認");
  await tapKey("Enter", "Enter");
  await finishDialogue();
  await moveAlong([{ x: 900, y: 405 }, { x: 930, y: 270 }], "城山のまもりの祠");
  await tapKey("Enter", "Enter");
  await waitFor(() => new SaveManager(SAVE_KEY).load()?.flags.shiroyama_guard_obtained === true, "城山のまもり", 9000);
  await waitFor(() => Boolean(document.querySelector("[data-p8-boss-entry='true']")), "カゲマサ入口");
  await clickButton("天守奥へ進む");
  await fightEnemy("B-E01", "カゲマサ", true);
  await waitFor(() => Boolean(document.querySelector(".ending-screen-ui")), "エンディング", 12000);
  const endingSave = manager.load();
  assert(endingSave?.flags.gameCompleted === true, "エンディング後のクリア状態を保存する");
  await openAndVerifyNotebook("旅の記録 10/10", "星封じと取り戻した光");
  const mute = button("音を消す");
  if (!mute) throw new Error("Ending Notebook mute button is missing");
  mute.click();
  await waitFor(() => Boolean(button("音を出す")), "mute state");
  await clickButton("音を出す");
  assert(manager.load()?.currentScreenId !== "battle", "戦闘途中をオートセーブ再開地点にしない");
  localStorage.setItem(PHASE_KEY, "endingReload");
  window.location.reload();
}

async function runAfterEndingReload(): Promise<void> {
  await startApp();
  await continueFromTitle("ending");
  assert(runtimeErrors.length === 0, `ページruntime error 0件（${runtimeErrors.join(" | ")})`);
  localStorage.removeItem(PHASE_KEY);
  app?.stop();
  app = null;
}

async function main(): Promise<void> {
  try {
    verifyNotebookData();
    verifySaveCompatibility();
    const phase = localStorage.getItem(PHASE_KEY);
    if (phase === "endingReload") {
      await runAfterEndingReload();
    } else if (phase === "earlyReload") {
      await runAfterEarlyReload();
    } else {
      await runFreshPlaythrough();
    }
    setStatus("pass");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(error);
    setStatus("fail", message);
  }
}

void main();

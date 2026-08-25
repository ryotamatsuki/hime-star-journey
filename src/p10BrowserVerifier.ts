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

    const statusText = document.querySelector<HTMLElement>(".battle-status-summary")?.textContent ?? "";
    const hpMatch = statusText.match(/HP\s+(\d+)\s*\/\s*(\d+)/);
    const hp = hpMatch ? Number(hpMatch[1]) : 0;
    const maxHp = hpMatch ? Number(hpMatch[2]) : 0;
    const healCard = [...document.querySelectorAll<HTMLButtonElement>(".battle-card-button")]
      .find((candidate) => (candidate.querySelector(".battle-card-name")?.textContent ?? "").includes("湯しずく")
        && !candidate.disabled);
    if (!boss && healCard && maxHp > 0 && hp <= Math.floor(maxHp / 2)) {
      healCard.click();
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

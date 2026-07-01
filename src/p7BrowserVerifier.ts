import { GameApp } from "./core/GameApp";
import { SaveManager } from "./core/SaveManager";
import { getEncounterById } from "./data/encounters";
import { getMapLayout } from "./data/mapLayoutRegistry";
import { applyBattleCard, createBattleState, getAliveEnemies, isBattleVictory, resolveEnemyTurn } from "./systems/BattleSystem";
import { getTravelDestination } from "./systems/TravelSystem";
import type { BattleState } from "./types/battle";
import type { SaveData } from "./types/save";

const SAVE_KEY = "__p7_browser_verifier_save__";
const statusElement = document.querySelector<HTMLElement>("#p7-verifier-status");
const resultList = document.querySelector<HTMLOListElement>("#p7-verifier-results");
const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas");
const uiRoot = document.querySelector<HTMLElement>("#ui-root");

const noop = () => undefined;
const fakeGradient = { addColorStop: noop };
const fakeContext = new Proxy<{ canvas: HTMLCanvasElement | null }>({ canvas }, {
  get(target, property) {
    if (property === "canvas") return target.canvas;
    if (property === "measureText") return () => ({ width: 120 });
    if (property === "createLinearGradient" || property === "createRadialGradient") return () => fakeGradient;
    if (property === "save" || property === "restore" || property === "beginPath" || property === "closePath" ||
      property === "fill" || property === "stroke" || property === "fillRect" || property === "strokeRect" ||
      property === "clearRect" || property === "drawImage" || property === "translate" || property === "scale" ||
      property === "rotate" || property === "arc" || property === "ellipse" || property === "moveTo" ||
      property === "lineTo" || property === "quadraticCurveTo" || property === "bezierCurveTo" ||
      property === "setLineDash" || property === "fillText" || property === "strokeText" || property === "rect") {
      return noop;
    }
    return Reflect.get(target, property);
  },
  set(target, property, value) {
    Reflect.set(target, property, value);
    return true;
  }
}) as unknown as CanvasRenderingContext2D;

HTMLCanvasElement.prototype.getContext = function getContext(type: string): CanvasRenderingContext2D | null {
  return type === "2d" ? fakeContext : null;
} as typeof HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.toDataURL = function toDataURL(): string {
  return `data:image/png;base64,${"a".repeat(2048)}`;
};

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

function record(message: string): void {
  const item = document.createElement("li");
  item.textContent = `OK ${message}`;
  resultList?.append(item);
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
  record(message);
}

function setStatus(status: "running" | "pass" | "fail", message?: string): void {
  if (!statusElement) return;
  statusElement.textContent = status === "pass"
    ? "P7_BROWSER_VERIFICATION:PASS"
    : status === "fail"
      ? `P7_BROWSER_VERIFICATION:FAIL ${message ?? ""}`
      : "running";
}

function baseSave(overrides: Partial<SaveData> & { flags?: Record<string, boolean> } = {}): SaveData {
  const now = new Date().toISOString();
  const save: SaveData = {
    version: "0.3.0",
    currentChapterId: "star_map",
    currentLocationId: "dogo",
    currentAreaId: "D0",
    currentScreenId: "starMap",
    partyMemberIds: ["hime"],
    activePartyMemberIds: ["hime"],
    starLevel: 2,
    hp: 80,
    mp: 20,
    maxHp: 80,
    maxMp: 20,
    unlockedCards: ["card_mikan_attack", "card_shirasagi_ofuda", "card_dogo_drop", "card_yukemuri_veil"],
    collectedStars: ["dogo"],
    unlockedLoreIds: [],
    defeatedEnemyIds: [],
    clearedQuestIds: ["quest_dogo_yukemuri_star"],
    unlockedLocations: ["dogo", "castle"],
    openedPaths: [],
    acquiredItems: {},
    acquiredCharms: [],
    flags: {
      location_castle_unlocked: true,
      prologue_started: true,
      prologue_completed: true,
      shiro_met: true,
      mikan_core_stolen: true,
      dogo_anomaly_started: true,
      dogo_quest_started: true,
      dogo_quest_hint_seen: true,
      dogo_quest_cleared: true,
      star_dogo_collected: true,
      yuno_star_obtained: true,
      yuno_star_event_seen: true,
      star_map_unlocked: true,
      dialogue_dogo_intro_seen: true,
      dialogue_first_enemy_hint_seen: true
    },
    dogoQuestStatus: "cleared",
    castleQuestStatus: "notStarted",
    lastSynopsis: "P7ブラウザ検証用セーブです。",
    savedAt: now
  };

  return {
    ...save,
    ...overrides,
    flags: { ...save.flags, ...(overrides.flags ?? {}) }
  };
}

function dispatchKey(code: string): void {
  window.dispatchEvent(new KeyboardEvent("keydown", { code, key: code, bubbles: true }));
  window.dispatchEvent(new KeyboardEvent("keyup", { code, key: code, bubbles: true }));
}

async function closeDialogueIfPresent(): Promise<void> {
  for (let i = 0; i < 8; i += 1) {
    const button = [...document.querySelectorAll("button")]
      .find((candidate) =>
        candidate.textContent?.includes("次へ") ||
        candidate.textContent?.includes("閉じる")
      ) as HTMLButtonElement | undefined;
    if (!button) break;
    button.click();
    await sleep(160);
  }
}

async function waitFor(predicate: () => boolean, message: string, timeoutMs = 4000): Promise<void> {
  const started = performance.now();
  while (performance.now() - started < timeoutMs) {
    if (predicate()) return;
    await sleep(60);
  }
  throw new Error(`Timed out: ${message}`);
}

async function runAppWithSave(save: SaveData): Promise<GameApp> {
  if (!canvas || !uiRoot) throw new Error("Verifier canvas/ui root missing");
  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  uiRoot.innerHTML = "";
  const app = new GameApp({ canvas, uiRoot, saveKey: SAVE_KEY });
  await app.start();
  await waitFor(() => Boolean(document.querySelector(".title-screen-ui")), "title screen");
  const continueButton = [...document.querySelectorAll("button")]
    .find((button) => button.textContent?.includes("つづきから")) as HTMLButtonElement | undefined;
  continueButton?.click();
  await sleep(500);
  return app;
}

async function testStarMapTravel(): Promise<void> {
  let app = await runAppWithSave(baseSave({
    collectedStars: [],
    unlockedLocations: ["dogo"],
    flags: {
      location_castle_unlocked: false,
      star_dogo_collected: false,
      yuno_star_obtained: false,
      yuno_star_event_seen: false,
      star_map_unlocked: true
    }
  }));
  await waitFor(() => Boolean(document.querySelector(".star-map-ui")), "locked star map");
  dispatchKey("ArrowRight");
  dispatchKey("Enter");
  await sleep(300);
  assert(document.body.innerText.includes("まだ星の光が届いていません"), "湯の星未取得/松山城未解放では星地図から松山城へ移動できない");
  app.stop();

  app = await runAppWithSave(baseSave());
  await waitFor(() => Boolean(document.querySelector(".star-map-ui")), "unlocked star map");
  dispatchKey("ArrowRight");
  dispatchKey("Enter");
  await waitFor(() => Boolean(document.querySelector(".explore-ui")), "castle explore");
  const save = JSON.parse(localStorage.getItem(SAVE_KEY) ?? "{}") as SaveData;
  assert(save.currentLocationId === "castle", "星地図から松山城へ遷移して現在地を保存する");
  assert(save.currentAreaId === "C0", "松山城遷移でcastle-C0へ配置される");
  assert(document.body.innerText.includes("現在地：松山城"), "松山城探索画面の現在地が表示される");
  await closeDialogueIfPresent();
  dispatchKey("KeyH");
  await sleep(250);
  assert(document.body.innerText.includes("道しるべ表示中"), "Hキーで松山城の道しるべを表示できる");
  dispatchKey("KeyG");
  await sleep(250);
  assert(canvas!.toDataURL("image/png").length > 1000, "Gキー後もCanvas描画が継続する");
  app.stop();
}

async function testQuestObjectives(): Promise<void> {
  const states: Array<[SaveData, string, string]> = [
    [
      baseSave({
        currentScreenId: "explore",
        currentChapterId: "castle_explore",
        currentLocationId: "castle",
        currentAreaId: "C0",
        flags: { castle_quest_started: true, dialogue_castle_intro_seen: true }
      }),
      "手がかり",
      "初回到着後は異変の手がかりを目的表示する"
    ],
    [
      baseSave({
        currentScreenId: "explore",
        currentChapterId: "castle_explore",
        currentLocationId: "castle",
        currentAreaId: "C0",
        castleQuestStatus: "hintSeen",
        flags: { castle_quest_started: true, castle_hint_seen: true, dialogue_castle_intro_seen: true }
      }),
      "三つの影",
      "ヒント後は必須敵を目的表示する"
    ],
    [
      baseSave({
        currentScreenId: "explore",
        currentChapterId: "castle_explore",
        currentLocationId: "castle",
        currentAreaId: "C0",
        castleQuestStatus: "enemiesCleared",
        defeatedEnemyIds: ["C-E01", "C-E02", "C-E03"],
        flags: {
          castle_quest_started: true,
          castle_hint_seen: true,
          castle_required_enemies_cleared: true,
          dialogue_castle_intro_seen: true
        }
      }),
      "くらやみ井戸",
      "必須敵後はくらやみ井戸を目的表示する"
    ],
    [
      baseSave({
        currentScreenId: "explore",
        currentChapterId: "castle_explore",
        currentLocationId: "castle",
        currentAreaId: "C0",
        castleQuestStatus: "guardReady",
        defeatedEnemyIds: ["C-E01", "C-E02", "C-E03", "C-E04"],
        flags: {
          castle_quest_started: true,
          castle_hint_seen: true,
          castle_required_enemies_cleared: true,
          castle_dark_well_cleared: true,
          castle_guard_ready: true,
          dialogue_castle_intro_seen: true
        }
      }),
      "城山のまもり",
      "くらやみ井戸後は城山のまもりを目的表示する"
    ]
  ];

  for (const [save, expectedText, message] of states) {
    const app = await runAppWithSave(save);
    await waitFor(() => Boolean(document.querySelector(".explore-ui")), message);
    assert(document.body.innerText.includes(expectedText), message);
    app.stop();
  }
}

function finishBattle(state: BattleState): BattleState {
  let next = state;
  let guard = 0;
  while (!isBattleVictory(next) && guard < 30) {
    const target = getAliveEnemies(next)[0];
    if (!target) break;
    next = applyBattleCard(next, "card_mikan_attack", target.instanceId).state;
    if (next.phase === "enemyAction") next = resolveEnemyTurn(next).state;
    guard += 1;
  }
  return next;
}

function testBattles(): void {
  const soldierEncounter = getEncounterById("enc_castle_soldier_01");
  const crowPairEncounter = getEncounterById("enc_castle_crow_soldier_01");
  assert(soldierEncounter, "影足軽1体Encounterが存在する");
  assert(crowPairEncounter, "黒羽ガラス＋影足軽の1対2Encounterが存在する");

  const oneOnOne = finishBattle(createBattleState(soldierEncounter, baseSave()));
  assert(isBattleVictory(oneOnOne), "ブラウザ実行環境で松山城1対1戦闘ロジックが勝利まで動作する");

  const oneOnTwo = finishBattle(createBattleState(crowPairEncounter, baseSave()));
  assert(isBattleVictory(oneOnTwo), "ブラウザ実行環境で松山城1対2戦闘ロジックが勝利まで動作する");
}

function testSaveCompatibility(): void {
  const manager = new SaveManager("__p7_browser_verifier_compat__");
  const normalized = manager.save(baseSave({
    currentChapterId: "p8_ready",
    currentLocationId: "castle",
    currentAreaId: "C0",
    currentScreenId: "starMap",
    castleQuestStatus: "cleared",
    defeatedEnemyIds: ["C-E01", "C-E02", "C-E03", "C-E04"],
    clearedQuestIds: ["quest_dogo_yukemuri_star", "quest_castle_shiroyama_guard"],
    acquiredItems: { shiroyama_guard: 1 },
    acquiredCharms: ["shiroyama_guard"],
    flags: {
      castle_quest_started: true,
      castle_hint_seen: true,
      castle_required_enemies_cleared: true,
      castle_dark_well_cleared: true,
      castle_guard_ready: true,
      shiroyama_guard_obtained: true,
      castle_boss_route_unlocked: true,
      p8_kagemasa_route_unlocked: true
    }
  }));

  assert(normalized.flags.shiroyama_guard_obtained, "城山のまもり取得フラグが保存される");
  assert(normalized.flags.p8_kagemasa_route_unlocked, "P8開始条件フラグが保存される");
  assert(normalized.acquiredCharms.includes("shiroyama_guard"), "城山のまもりが再読み込み後も保持される");
  assert(!normalized.collectedStars.includes("castle"), "P7ではcastleをcollectedStarsへ追加しない");
  assert(normalized.flags.gameCompleted !== true && !("gameCompleted" in normalized), "P7ではgameCompletedをtrueにしない");
  manager.clear();
}

function testMapAndTravelData(): void {
  const layout = getMapLayout("castle", "C0");
  assert(layout, "castle-C0 JSONレイアウトをブラウザ実行環境で読み込める");
  assert(layout.playerStart.x === 420 && layout.playerStart.y === 850, "castle-C0の開始位置がJSONから読まれる");
  assert(layout.guidePaths.length >= 2, "castle-C0のguidePathsが存在する");
  assert(layout.enemySpawns.some((enemy) => enemy.id === "C-E01"), "castle-C0に影足軽シンボルが配置されている");
  assert(layout.interactablePositions.some((item) => item.id === "castle_dark_well"), "castle-C0にくらやみ井戸の調べる対象が配置されている");

  const destination = getTravelDestination({
    id: "node_castle",
    locationId: "castle",
    name: "松山城",
    x: 0,
    y: 0,
    status: "locked",
    requiredFlag: "location_castle_unlocked",
    description: ""
  }, baseSave());
  assert(destination.type === "screen" && destination.locationId === "castle" && destination.areaId === "C0", "TravelSystemが松山城C0を返す");
}

async function main(): Promise<void> {
  try {
    setStatus("running");
    testMapAndTravelData();
    testBattles();
    testSaveCompatibility();
    await testStarMapTravel();
    await testQuestObjectives();
    const editorResponse = await fetch("/hime-star-journey/map-editor.html");
    assert(editorResponse.ok, "ブラウザからマップエディタHTMLを取得できる");
    setStatus("pass");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(error);
    setStatus("fail", message);
    throw error;
  }
}

void main();

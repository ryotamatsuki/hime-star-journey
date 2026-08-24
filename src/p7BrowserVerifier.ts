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

async function holdKey(code: string, durationMs: number): Promise<void> {
  window.dispatchEvent(new KeyboardEvent("keydown", { code, key: code, bubbles: true }));
  await sleep(durationMs);
  window.dispatchEvent(new KeyboardEvent("keyup", { code, key: code, bubbles: true }));
  await sleep(100);
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
  const rendered = canvas!.toDataURL("image/png");
  assert(rendered.startsWith("data:image/png;base64,") && rendered.length > 1000, "Gキー後も実Canvas描画が継続する");
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
    ],
    [
      baseSave({
        currentScreenId: "explore",
        currentChapterId: "p8_ready",
        currentLocationId: "castle",
        currentAreaId: "C0",
        castleQuestStatus: "cleared",
        acquiredCharms: ["shiroyama_guard"],
        flags: {
          castle_quest_started: true,
          castle_hint_seen: true,
          castle_required_enemies_cleared: true,
          castle_dark_well_cleared: true,
          castle_guard_ready: true,
          shiroyama_guard_obtained: true,
          p8_kagemasa_route_unlocked: true,
          dialogue_castle_intro_seen: true
        }
      }),
      "カゲマサのもとへ進む準備が整った",
      "P7完了後の目的表示に内部フェーズ名を出さない"
    ]
  ];

  for (const [save, expectedText, message] of states) {
    const app = await runAppWithSave(save);
    await waitFor(() => Boolean(document.querySelector(".explore-ui")), message);
    assert(document.body.innerText.includes(expectedText), message);
    assert(!document.body.innerText.includes("P8で"), "プレイヤー向けUIに内部フェーズ名を表示しない");
    app.stop();
  }
}

async function testDogoExploreRuntime(): Promise<void> {
  const app = await runAppWithSave(baseSave({
    currentScreenId: "explore",
    currentChapterId: "dogo_explore",
    currentLocationId: "dogo",
    currentAreaId: "D0"
  }));
  await waitFor(() => Boolean(document.querySelector(".explore-ui")), "dogo explore");
  await closeDialogueIfPresent();

  const runtime = app as unknown as {
    screenManager: {
      currentScreen?: {
        player?: { x: number; y: number };
      };
    };
  };
  const player = runtime.screenManager.currentScreen?.player;
  assert(player, "道後温泉の実探索画面にプレイヤーが生成される");
  const startY = player.y;
  await holdKey("ArrowUp", 360);
  assert(player.y < startY, "道後温泉の実探索画面で石畳上を歩ける");
  const movedY = player.y;
  await holdKey("ArrowDown", 360);
  assert(player.y > movedY, "道後温泉の歩行ポリゴン上で反対方向にも戻れる");
  app.stop();
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

function testBossSealInvariant(): void {
  const encounter = getEncounterById("enc_boss_kagemasa");
  assert(encounter, "カゲマサEncounterが存在する");
  let state = createBattleState(encounter, baseSave({
    hp: 999,
    maxHp: 999,
    mp: 999,
    maxMp: 999,
    unlockedCards: ["card_mikan_attack", "card_star_seal"]
  }));
  const boss = state.enemies[0];
  assert(boss, "カゲマサBattleActorが生成される");

  for (let i = 0; i < 40 && !isBattleVictory(state); i += 1) {
    const result = applyBattleCard(state, "card_mikan_attack", boss.instanceId);
    state = result.state;
    if (state.phase === "enemyAction") state = resolveEnemyTurn(state).state;
    if (state.enemies[0]?.hp === 1) break;
  }
  assert(state.enemies[0]?.hp === 1, "通常攻撃ではカゲマサHPを0にできず封印待ちになる");
  assert(!isBattleVictory(state), "カゲマサはHPを削り切るだけでは勝利にならない");

  for (let i = 0; i < 10 && !isBattleVictory(state); i += 1) {
    const result = applyBattleCard(state, "card_star_seal", boss.instanceId);
    state = result.state;
    if (state.phase === "enemyAction") state = resolveEnemyTurn(state).state;
  }
  assert(isBattleVictory(state), "星封じゲージ完了時だけカゲマサ戦勝利になる");
}

function testSaveCompatibility(): void {
  const manager = new SaveManager("__p7_browser_verifier_compat__");
  const normalized = manager.save(baseSave({
    currentChapterId: "p8_ready",
    currentLocationId: "castle",
    currentAreaId: "C0",
    currentScreenId: "starMap",
    castleQuestStatus: "cleared",
    defeatedEnemyIds: ["C-E01", "C-E02", "C-E03", "C-E04", "C-E04"],
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
  assert(normalized.defeatedEnemyIds.filter((id) => id === "C-E04").length === 1, "セーブ配列の重複を除去する");

  const corrupted = manager.normalizeSaveData({
    ...baseSave(),
    hp: 999,
    maxHp: 30,
    mp: -12,
    maxMp: 10,
    acquiredItems: { good: 2.9, negative: -5, invalid: Number.NaN }
  });
  assert(corrupted.hp === 30, "HPをmaxHp以内に正規化する");
  assert(corrupted.mp === 0, "MPを0以上に正規化する");
  assert(corrupted.acquiredItems.good === 2, "所持数を非負整数へ正規化する");
  assert(!("negative" in corrupted.acquiredItems) && !("invalid" in corrupted.acquiredItems), "不正な所持数を除去する");
  manager.clear();
}

function testMapAndTravelData(): void {
  const dogoLayout = getMapLayout("dogo", "D0");
  assert(dogoLayout, "dogo-D0 JSONレイアウトをブラウザ実行環境で読み込める");
  assert(dogoLayout.walkableRects.length === 0 && dogoLayout.walkablePolygons.length >= 10, "dogo-D0が背景に沿った歩行ポリゴンを使用する");
  const dogoCriticalPoints = [
    dogoLayout.playerStart,
    ...dogoLayout.enemySpawns,
    ...dogoLayout.npcPositions,
    ...dogoLayout.interactablePositions,
    ...dogoLayout.eventPositions,
    ...dogoLayout.guidePaths.flatMap((path) => path.points)
  ];
  assert(
    dogoCriticalPoints.every((point) => isWalkablePoint(point, dogoLayout)),
    "dogo-D0の開始位置・配置物・道しるべが歩行ポリゴン上にある"
  );

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

function isWalkablePoint(point: { x: number; y: number }, layout: ReturnType<typeof getMapLayout>): boolean {
  if (!layout) return false;
  return layout.walkableRects.some((rect) => point.x >= rect.x
    && point.x <= rect.x + rect.width
    && point.y >= rect.y
    && point.y <= rect.y + rect.height)
    || layout.walkablePolygons.some((polygon) => pointInPolygon(point, polygon.points));
}

function pointInPolygon(point: { x: number; y: number }, polygon: { x: number; y: number }[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const a = polygon[i];
    const b = polygon[j];
    if (!a || !b) continue;
    const crosses = ((a.y > point.y) !== (b.y > point.y))
      && point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x;
    if (crosses) inside = !inside;
  }
  return inside;
}

async function main(): Promise<void> {
  try {
    setStatus("running");
    testMapAndTravelData();
    testBattles();
    testBossSealInvariant();
    testSaveCompatibility();
    await testStarMapTravel();
    await testQuestObjectives();
    await testDogoExploreRuntime();
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

import { GameApp } from "./core/GameApp";
import { SaveManager } from "./core/SaveManager";
import { getEncounterById } from "./data/encounters";
import { applyBattleCard, createBattleState, isBattleVictory, resolveEnemyTurn } from "./systems/BattleSystem";
import {
  completeP8Save,
  isP8BossReady,
  isP8BossVictoryPending,
  prepareP8BossSave
} from "./systems/P8FlowController";
import type { SaveData } from "./types/save";

const SAVE_KEY = "__p8_browser_verifier_save__";
const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas");
const uiRoot = document.querySelector<HTMLElement>("#ui-root");
const status = document.querySelector<HTMLElement>("#p8-verifier-status");
const results = document.querySelector<HTMLOListElement>("#p8-verifier-results");

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
    ? "P8_BROWSER_VERIFICATION:PASS"
    : `P8_BROWSER_VERIFICATION:FAIL ${message}`;
}

function p7CompleteSave(overrides: Partial<SaveData> = {}): SaveData {
  const now = new Date().toISOString();
  const base: SaveData = {
    version: "0.3.0",
    currentChapterId: "p8_ready",
    currentLocationId: "castle",
    currentAreaId: "C0",
    currentScreenId: "explore",
    partyMemberIds: ["hime"],
    activePartyMemberIds: ["hime"],
    starLevel: 2,
    hp: 80,
    mp: 20,
    maxHp: 80,
    maxMp: 20,
    unlockedCards: ["card_mikan_attack", "card_shirasagi_ofuda", "card_dogo_drop", "card_yukemuri_veil", "card_castle_guard"],
    collectedStars: ["dogo"],
    unlockedLoreIds: [],
    defeatedEnemyIds: ["C-E01", "C-E02", "C-E03", "C-E04"],
    clearedQuestIds: ["quest_dogo_yukemuri_star", "quest_castle_shiroyama_guard"],
    unlockedLocations: ["dogo", "castle"],
    openedPaths: ["castle_dark_well_cleared_path"],
    acquiredItems: { shiroyama_guard: 1 },
    acquiredCharms: ["shiroyama_guard"],
    flags: {
      location_castle_unlocked: true,
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
      castle_quest_started: true,
      castle_hint_seen: true,
      castle_required_enemies_cleared: true,
      castle_dark_well_cleared: true,
      castle_guard_ready: true,
      shiroyama_guard_obtained: true,
      castle_boss_route_unlocked: true,
      p8_kagemasa_route_unlocked: true
    },
    dogoQuestStatus: "cleared",
    castleQuestStatus: "cleared",
    lastSynopsis: "P8ブラウザ検証用セーブです。",
    savedAt: now
  };

  return {
    ...base,
    ...overrides,
    flags: { ...base.flags, ...(overrides.flags ?? {}) }
  };
}

async function waitFor(predicate: () => boolean, message: string, timeoutMs = 6000): Promise<void> {
  const started = performance.now();
  while (performance.now() - started < timeoutMs) {
    if (predicate()) return;
    await sleep(60);
  }
  throw new Error(`Timed out: ${message}`);
}

function testPureP8StateTransitions(): void {
  const p7 = p7CompleteSave();
  assert(isP8BossReady(p7), "P7完了セーブはカゲマサ戦開始条件を満たす");

  const prepared = prepareP8BossSave(p7);
  assert(prepared.currentScreenId === "battle", "ボス開始時はcurrentScreenIdがbattleになる");
  assert(prepared.unlockedCards.includes("card_star_seal"), "ボス開始時に星封じカードを解放する");
  assert(prepared.flags.star_seal_unlocked === true, "星封じ解放flagを保存する");
  assert(prepared.hp === prepared.maxHp && prepared.mp === prepared.maxMp, "ボス前にHP/MPを回復する");

  const defeated: SaveData = {
    ...prepared,
    currentScreenId: "explore",
    defeatedEnemyIds: [...prepared.defeatedEnemyIds, "B-E01"]
  };
  assert(isP8BossVictoryPending(defeated), "B-E01撃破後はP8完了保存待ちと判定する");

  const completed = completeP8Save(defeated);
  assert(completed.currentScreenId === "ending", "P8完了時はEndingScreenへ保存する");
  assert(completed.flags.kagemasa_sealed === true, "カゲマサ再封印flagを保存する");
  assert(completed.flags.mikan_core_recovered === true, "みかん星の核奪還flagを保存する");
  assert(completed.flags.gameCompleted === true, "MVP完了flagを保存する");
  assert(completed.collectedStars.includes("castle"), "城の星をcollectedStarsへ追加する");
  assert((completed.acquiredItems.mikan_star_core ?? 0) >= 1, "みかん星の核を所持品へ追加する");
}

function testBossBattleInvariant(): void {
  const encounter = getEncounterById("enc_boss_kagemasa");
  assert(encounter?.isBoss === true, "カゲマサEncounterがbossとして存在する");
  if (!encounter) return;

  let state = createBattleState(encounter, prepareP8BossSave(p7CompleteSave()));
  let guard = 0;
  while (!isBattleVictory(state) && guard < 18) {
    const result = applyBattleCard(state, "card_star_seal", state.enemies[0]?.instanceId);
    state = result.state;
    if (state.phase === "enemyAction") state = resolveEnemyTurn(state).state;
    guard += 1;
  }
  assert(isBattleVictory(state), "星封じカードでsealGaugeを削り切るとカゲマサ戦に勝利する");
  assert((state.sealGauge?.value ?? 1) === 0, "カゲマサ勝利時のsealGaugeは0である");
}

async function testLiveBossEntryAndEnding(): Promise<void> {
  if (!canvas || !uiRoot) throw new Error("verifier canvas/ui missing");
  const manager = new SaveManager(SAVE_KEY);
  manager.clear();
  manager.save(p7CompleteSave());

  const app = new GameApp({
    canvas,
    uiRoot,
    saveKey: SAVE_KEY,
    initialScreenId: "explore",
    initialParams: { saveData: manager.load(), locationId: "castle", areaId: "C0" }
  });
  await app.start();
  await waitFor(() => Boolean(document.querySelector("[data-p8-boss-entry='true']")), "P8 boss entry button");
  assert(document.body.innerText.includes("天守奥へ進む"), "P7完了後の探索画面に天守奥への導線が表示される");

  document.querySelector<HTMLButtonElement>("[data-p8-boss-entry='true']")?.click();
  await waitFor(() => document.body.innerText.includes("黒よろいの大将カゲマサ"), "Kagemasa battle screen");
  assert(document.body.innerText.includes("星封じ"), "カゲマサ戦で星封じカード/ゲージが表示される");
  const startedSave = manager.load();
  assert(startedSave?.flags.kagemasa_battle_started === true, "カゲマサ戦開始flagを実ブラウザで保存する");
  app.stop();

  const postBoss = completeP8Save({
    ...prepareP8BossSave(p7CompleteSave()),
    defeatedEnemyIds: [...p7CompleteSave().defeatedEnemyIds, "B-E01"]
  });
  manager.save(postBoss);

  const endingApp = new GameApp({
    canvas,
    uiRoot,
    saveKey: SAVE_KEY,
    initialScreenId: "ending",
    initialParams: { saveData: postBoss }
  });
  await endingApp.start();
  await waitFor(() => Boolean(document.querySelector(".ending-screen-ui")), "EndingScreen");
  assert(document.body.innerText.includes("小さな星めぐりは、まだ続く"), "EndingScreenでMVP終了演出を表示する");
  assert(document.body.innerText.includes("空白の星"), "EndingScreenで次の冒険につながる空白の星を示す");
  endingApp.stop();
  manager.clear();
}

async function main(): Promise<void> {
  try {
    testPureP8StateTransitions();
    testBossBattleInvariant();
    await testLiveBossEntryAndEnding();
    setStatus("pass");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(error);
    setStatus("fail", message);
    throw error;
  }
}

void main();

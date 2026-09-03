import "./styles.css";
import { GameApp } from "./core/GameApp";
import { SaveManager } from "./core/SaveManager";
import { getEnemySymbolById } from "./data/enemySymbols";
import { getMapLayout } from "./data/mapLayoutRegistry";
import { P12_AREA_IDS, p12DiscoveryCount } from "./data/p12";
import { Player } from "./entities/Player";
import { intersects, isRectWithinWalkableAreas, wouldCollide } from "./systems/CollisionSystem";
import type { SaveData } from "./types/save";

const SAVE_KEY = "__p12_browser_verifier_save__";
const WORLD_WIDTH = 1920;
const WORLD_HEIGHT = 1080;
const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas");
const uiRoot = document.querySelector<HTMLElement>("#ui-root");
const status = document.querySelector<HTMLElement>("#p12-verifier-status");
const results = document.querySelector<HTMLOListElement>("#p12-verifier-results");
const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));
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
    ? "P12_BROWSER_VERIFICATION:PASS"
    : `P12_BROWSER_VERIFICATION:FAIL ${message}`;
}

function bodyText(): string {
  return document.body.innerText;
}

function button(label: string, exact = true): HTMLButtonElement | undefined {
  return [...document.querySelectorAll<HTMLButtonElement>("button")].find((candidate) => {
    const text = candidate.textContent?.trim() ?? "";
    return exact ? text === label : text.includes(label);
  });
}

function isDialogueVisible(): boolean {
  const dialogue = document.querySelector<HTMLElement>(".dialogue-box");
  return Boolean(dialogue && !dialogue.classList.contains("is-hidden"));
}

async function waitFor(predicate: () => boolean, message: string, timeoutMs = 10000): Promise<void> {
  const started = performance.now();
  while (performance.now() - started < timeoutMs) {
    if (predicate()) return;
    await sleep(80);
  }
  throw new Error(`Timed out: ${message}`);
}

async function finishDialogue(): Promise<void> {
  for (let index = 0; index < 24 && isDialogueVisible(); index += 1) {
    const next = document.querySelector<HTMLButtonElement>(".dialogue-next");
    if (!next) throw new Error("Dialogue is visible without a next button");
    next.click();
    await sleep(120);
  }
  assert(!isDialogueVisible(), "P12導入会話を通常の次へ／閉じる操作で完了する");
}

async function holdKeys(keys: Array<{ code: string; key: string }>, durationMs: number): Promise<void> {
  for (const key of keys) window.dispatchEvent(new KeyboardEvent("keydown", { ...key, bubbles: true, cancelable: true }));
  await sleep(durationMs);
  for (const key of [...keys].reverse()) window.dispatchEvent(new KeyboardEvent("keyup", { ...key, bubbles: true, cancelable: true }));
  await sleep(120);
}

function playerPosition(): { x: number; y: number } | null {
  const dot = document.querySelector<HTMLElement>(".player-dot");
  if (!dot) return null;
  const x = Number.parseFloat(dot.style.left);
  const y = Number.parseFloat(dot.style.top);
  return Number.isFinite(x) && Number.isFinite(y)
    ? { x: (x / 100) * WORLD_WIDTH, y: (y / 100) * WORLD_HEIGHT }
    : null;
}

function isSafeBattleReturnPosition(position: { x: number; y: number }, symbolId: string): boolean {
  const enemy = getEnemySymbolById(symbolId);
  if (!enemy) return false;
  const layout = getMapLayout(enemy.locationId, enemy.areaId);
  if (!layout) return false;

  const playerCollider = new Player(position.x, position.y).getCollider();
  const bounds = layout.cameraBounds;
  const withinBounds = playerCollider.x >= bounds.x
    && playerCollider.y >= bounds.y
    && playerCollider.x + playerCollider.width <= bounds.x + bounds.width
    && playerCollider.y + playerCollider.height <= bounds.y + bounds.height;
  if (!withinBounds || wouldCollide(playerCollider, layout.collisionRects ?? [])) return false;

  const walkableRects = layout.walkableRects ?? [];
  const walkablePolygons = layout.walkablePolygons ?? [];
  const withinWalkable = walkableRects.length === 0 && walkablePolygons.length === 0
    ? true
    : isRectWithinWalkableAreas(playerCollider, walkableRects, walkablePolygons);
  if (!withinWalkable) return false;

  const enemyCollider = {
    x: enemy.x + enemy.collider.x,
    y: enemy.y + enemy.collider.y,
    width: enemy.collider.width,
    height: enemy.collider.height
  };
  return !intersects(playerCollider, enemyCollider);
}

async function moveTo(
  target: { x: number; y: number },
  label: string,
  tolerance = 34,
  allowBattle = false
): Promise<void> {
  for (let attempt = 0; attempt < 48; attempt += 1) {
    if (isDialogueVisible()) {
      await finishDialogue();
      continue;
    }
    if (document.querySelector(".battle-ui")) {
      if (allowBattle) return;
      throw new Error(`Unexpected battle while moving to ${label}; position=${JSON.stringify(playerPosition())}`);
    }
    const current = playerPosition();
    if (!current) throw new Error(`Player position unavailable while moving to ${label}`);
    const dx = target.x - current.x;
    const dy = target.y - current.y;
    if (Math.hypot(dx, dy) <= tolerance) return;
    const keys: Array<{ code: string; key: string }> = [];
    if (Math.abs(dx) > tolerance * 0.45) keys.push(dx > 0 ? { code: "KeyD", key: "d" } : { code: "KeyA", key: "a" });
    if (Math.abs(dy) > tolerance * 0.45) keys.push(dy > 0 ? { code: "KeyS", key: "s" } : { code: "KeyW", key: "w" });
    const duration = Math.min(560, Math.max(140, Math.round(Math.hypot(dx, dy) / 190 * 1000)));
    await holdKeys(keys, duration);
  }
  throw new Error(`Could not reach ${label}; position=${JSON.stringify(playerPosition())}`);
}

async function inspect(label: string): Promise<void> {
  const target = button(label, false);
  if (!target || target.hidden || target.disabled) {
    throw new Error(`Interactable button unavailable: ${label}`);
  }
  target.click();
  await sleep(180);
}

async function fightEnemy(symbolId: string, label: string, boss = false): Promise<void> {
  await waitFor(() => Boolean(document.querySelector(".battle-ui")), `${label} battle screen`);
  assert(new SaveManager(SAVE_KEY).load()?.currentScreenId === "battle", `${label}開始時に戦闘再開地点を保存する`);
  assert(bodyText().includes("カードを選んで"), `${label}にカード選択UIを表示する`);
  assert(bodyText().includes("風："), `${label}にしまなみの風ruleを表示する`);
  let sealUses = 0;

  for (let turn = 0; turn < 80; turn += 1) {
    const end = document.querySelector<HTMLButtonElement>(".battle-end-button");
    if (end) {
      end.click();
      await sleep(550);
      break;
    }

    const target = document.querySelector<HTMLButtonElement>(".battle-target-button");
    if (target) {
      target.click();
      await sleep(720);
      continue;
    }

    const summary = document.querySelector<HTMLElement>(".battle-status-summary")?.textContent ?? "";
    const hpMatch = summary.match(/HP\s+(\d+)\s*\/\s*(\d+)/);
    const hp = hpMatch ? Number(hpMatch[1]) : 0;
    const maxHp = hpMatch ? Number(hpMatch[2]) : 0;
    const heal = [...document.querySelectorAll<HTMLButtonElement>(".battle-card-button")]
      .find((candidate) => (candidate.querySelector(".battle-card-name")?.textContent ?? "").includes("湯しずく") && !candidate.disabled);
    if (heal && maxHp > 0 && hp <= Math.floor(maxHp * 0.48)) {
      heal.click();
      await sleep(900);
      continue;
    }

    const preferred = [...document.querySelectorAll<HTMLButtonElement>(".battle-card-button")]
      .find((candidate) => {
        const name = candidate.querySelector(".battle-card-name")?.textContent ?? "";
        return !candidate.disabled && (boss && sealUses < 6 ? name.includes("星封じ") : name.includes("みかん星"));
      });
    if (!preferred) {
      await sleep(220);
      continue;
    }
    if (boss && (preferred.querySelector(".battle-card-name")?.textContent ?? "").includes("星封じ")) sealUses += 1;
    preferred.click();
    await sleep(920);
  }

  await waitFor(() => Boolean(document.querySelector(".explore-ui")), `${label} battle return`, 14000);
  const save = new SaveManager(SAVE_KEY).load();
  assert(save?.defeatedEnemyIds.includes(symbolId), `${label}の勝利結果をセーブする`);
  if (symbolId === "A2-E03") {
    await waitFor(() => playerPosition() !== null, `${label} safe return position`, 3000);
    const returned = playerPosition();
    const savedReturn = save?.playerPosition;
    assert(
      Boolean(returned && isSafeBattleReturnPosition(returned, symbolId)),
      `上島の必須敵戦後にwalkable内・collision外・敵collider外へ安全復帰する position=${JSON.stringify(returned)} saved=${JSON.stringify(savedReturn)}`
    );
    assert(
      Boolean(savedReturn && isSafeBattleReturnPosition(savedReturn, symbolId)),
      `上島の必須敵戦後の安全復帰位置をsaveにも保持する saved=${JSON.stringify(savedReturn)}`
    );
    const enemy = getEnemySymbolById(symbolId);
    const returnDistance = returned && enemy ? Math.hypot(returned.x - enemy.x, returned.y - enemy.y) : Number.POSITIVE_INFINITY;
    assert(
      returnDistance <= 420,
      `上島の必須敵戦後に戦闘地点付近へ復帰する position=${JSON.stringify(returned)} distance=${Math.round(returnDistance)}`
    );
  }
}

function p12Fixture(manager: SaveManager): SaveData {
  const save = manager.createInitialSaveData();
  save.currentChapterId = "p12_shimanami";
  save.currentLocationId = "shimanami";
  save.currentAreaId = "A2-0";
  save.currentScreenId = "explore";
  save.starLevel = 4;
  save.hp = 80;
  save.maxHp = 80;
  save.mp = 30;
  save.maxMp = 30;
  save.unlockedCards = [...new Set([...save.unlockedCards, "card_star_seal"] )];
  save.unlockedLocations = [...new Set([...save.unlockedLocations, "shimanami"] )];
  save.flags = {
    ...save.flags,
    prologue_completed: true,
    star_map_unlocked: true,
    p12_unlocked: true,
    p12_started: true
  };
  return save;
}

async function verify(): Promise<void> {
  if (!canvas || !uiRoot) throw new Error("verifier canvas/ui missing");
  assert(P12_AREA_IDS.length === 6, "P12の6エリア契約をロードする");
  assert(P12_AREA_IDS.every((areaId) => Boolean(getMapLayout("shimanami", areaId))), "P12全エリアのレイアウトを解決する");

  const manager = new SaveManager(SAVE_KEY);
  manager.clear();
  const seed = manager.save(p12Fixture(manager));
  const app = new GameApp({
    canvas,
    uiRoot,
    saveKey: SAVE_KEY,
    initialScreenId: "explore",
    initialParams: { saveData: seed, locationId: "shimanami", areaId: "A2-0" }
  });
  await app.start();

  await waitFor(() => Boolean(document.querySelector(".explore-ui")), "今治港Hub探索画面");
  await waitFor(() => bodyText().includes("現在地：今治港Hub"), "Hubの現在地表示");
  assert(Boolean(document.querySelector(".explore-touch-controls--visible")), "390px幅でタッチ移動UIを表示する");
  assert(Boolean(button("シロ検索")), "探索UIにシロ検索を表示する");
  await finishDialogue();

  await moveTo({ x: 1140, y: 766 }, "橋道の入口");
  await inspect("橋道の入口");
  await waitFor(() => bodyText().includes("現在地：来島の橋道"), "橋道へのエリア遷移");
  assert(new SaveManager(SAVE_KEY).load()?.flags.p12_route_bridge === true, "Hubで橋道ルートを選択して保存する");

  await moveTo({ x: 556, y: 806 }, "橋の記憶");
  await inspect("橋の記憶");
  assert(bodyText().includes("橋の欄干") || new SaveManager(SAVE_KEY).load()?.flags.p12_discovery_bridge_memory === true, "橋の記憶を発見する");
  await moveTo({ x: 816, y: 696 }, "帆の向き合わせ");
  await inspect("帆の向き合わせ");
  assert(new SaveManager(SAVE_KEY).load()?.flags.p12_bridge_sail_aligned === true, "橋道の風パズルを保存する");
  await moveTo({ x: 1000, y: 600 }, "かぜぬすみ", 34, true);
  await fightEnemy("A2-E01", "かぜぬすみ");
  await moveTo({ x: 1200, y: 520 }, "橋道の出口へ戻る");
  await moveTo({ x: 1460, y: 421 }, "見張り台への道");
  await inspect("見張り台への道");
  await waitFor(() => bodyText().includes("現在地：海城の見張り台"), "見張り台へのエリア遷移");

  await moveTo({ x: 1336, y: 818 }, "風よみ前の風車");
  await inspect("見張り台の風車");
  assert(bodyText().includes("風車は止まっている"), "風よみ前の風車が停止していることを確認する");
  await moveTo({ x: 416, y: 828 }, "風よみの星");
  await inspect("風よみの星");
  let save = new SaveManager(SAVE_KEY).load();
  assert(save?.flags.p12_wind_ability === true, "風よみの取得をセーブする");
  await moveTo({ x: 1336, y: 818 }, "風よみ後の同じ風車");
  await inspect("見張り台の風車");
  save = new SaveManager(SAVE_KEY).load();
  assert(save?.flags.p12_windmill_revisited === true, "風よみ後に同じ風車を再訪する");
  assert(bodyText().includes("違う音"), "同じ風車の反応が風よみ前後で変化する");
  await moveTo({ x: 1570, y: 666 }, "上島への道");
  await inspect("上島への道");
  await waitFor(() => bodyText().includes("現在地：上島の島道"), "上島へのエリア遷移");

  await moveTo({ x: 756, y: 786 }, "上島の記憶");
  await inspect("上島の記憶");
  await moveTo({ x: 850, y: 900 }, "風の近道への島道");
  await moveTo({ x: 1050, y: 830 }, "風の近道への枝道");
  await moveTo({ x: 1230, y: 820 }, "風の近道");
  await inspect("風の近道");
  assert(new SaveManager(SAVE_KEY).load()?.flags.p12_kamijima_shortcut_open === true, "風の近道を開く");
  await moveTo({ x: 1500, y: 850 }, "くろほガモメ", 34, true);
  await fightEnemy("A2-E03", "くろほガモメ");
  await moveTo({ x: 1690, y: 850 }, "風の灯台への道");
  await inspect("風の灯台への道");
  await waitFor(() => bodyText().includes("現在地：風の灯台"), "Boss空間へのエリア遷移");

  await moveTo({ x: 1050, y: 820 }, "しまかぜ大だこ", 34, true);
  await fightEnemy("A2-B01", "しまかぜ大だこ", true);

  save = new SaveManager(SAVE_KEY).load();
  assert(save?.flags.p12_completed === true, "P12 Bossクリアをセーブする");
  assert(save?.collectedStars.includes("shimanami"), "しまなみの星を回収する");
  assert((save?.p12DiscoveryIds ?? []).includes("wind_ability"), "風よみ取得を発見ログへ記録する");
  assert((save?.p12DiscoveryIds ?? []).includes("wind_revisit"), "風車再訪を発見ログへ記録する");
  assert(p12DiscoveryCount(save as SaveData) >= 5, "P12の意味ある発見を5件以上記録する");
  assert((save?.p12CheckpointIds ?? []).length >= 3, "Hub／分岐／見張り台／上島のチェックポイントを記録する");
  assert((save?.p12DiscoveryIntervalsMs ?? []).every((interval) => interval >= 0), "発見間隔メトリクスを非負で保存する");
  assert((save?.p12EventLog ?? []).some((event) => event.type === "battle_start" && event.id === "A2-E01"), "P12通常戦の開始イベントを記録する");
  assert((save?.p12EventLog ?? []).some((event) => event.type === "battle_end" && event.id === "A2-E03" && event.outcome === "victory"), "P12通常戦の終了イベントを記録する");
  assert((save?.p12EventLog ?? []).some((event) => event.type === "boss_start" && event.id === "A2-B01"), "P12 Boss開始イベントを記録する");
  assert((save?.p12EventLog ?? []).some((event) => event.type === "boss_end" && event.id === "A2-B01" && event.outcome === "victory"), "P12 Boss終了イベントを記録する");
  assert((save?.p12EventLog ?? []).some((event) => event.type === "save_write" && event.id === "autosave"), "P12 autosaveイベントを記録する");
  assert(runtimeErrors.length === 0, `P12通しプレイ中のランタイムエラーがない（${runtimeErrors.join(" / ")}）`);
}

verify().then(() => setStatus("pass")).catch((error: unknown) => {
  setStatus("fail", error instanceof Error ? error.message : String(error));
});
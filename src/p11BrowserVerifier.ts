import { getMapLayout, mapLayoutRegistry } from "./data/mapLayoutRegistry";
import { P12_AREA_IDS, P12_REQUIRED_ENEMY_IDS, getP12AreaMeta } from "./data/p12";

const status = document.querySelector<HTMLElement>("#p11-verifier-status");
const results = document.querySelector<HTMLOListElement>("#p11-verifier-results");

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
    ? "P11_BROWSER_VERIFICATION:PASS"
    : `P11_BROWSER_VERIFICATION:FAIL ${message}`;
}

async function readSpec(path: string): Promise<string> {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) throw new Error(`仕様書を取得できません: ${path} ${response.status}`);
  return response.text();
}

async function verify(): Promise<void> {
  assert(P12_AREA_IDS.length === 6, "P11設計はHub・4 Subarea・Boss空間の6エリアで構成される");
  assert(getP12AreaMeta("A2-0")?.kind === "hub", "A2-0を今治港Hubとして定義する");
  assert(getP12AreaMeta("A2-3")?.kind === "deepSpot", "A2-3を海城の見張り台Deep Spotとして定義する");
  assert(getP12AreaMeta("A2-5")?.kind === "boss", "A2-5を風の灯台Boss空間として定義する");

  for (const areaId of P12_AREA_IDS) {
    const layout = getMapLayout("shimanami", areaId);
    assert(Boolean(layout), `${areaId}のデータ駆動レイアウトを登録する`);
    assert(Boolean(layout?.walkableRects.length), `${areaId}に歩行可能領域を持たせる`);
    assert(layout?.backgroundAssetId === "bg_shimanami", `${areaId}をしまなみ背景契約へ接続する`);
  }

  const allIds = P12_AREA_IDS.flatMap((areaId) => {
    const layout = getMapLayout("shimanami", areaId);
    return [
      ...(layout?.enemySpawns ?? []),
      ...(layout?.npcPositions ?? []),
      ...(layout?.interactablePositions ?? [])
    ].map((object) => object.id);
  });
  for (const enemyId of P12_REQUIRED_ENEMY_IDS) {
    assert(allIds.includes(enemyId), `${enemyId}の地域敵を配置する`);
  }
  assert(allIds.includes("A2-B01"), "A2-B01の地域Bossを配置する");
  assert(allIds.includes("p12_hub_bridge_route") && allIds.includes("p12_hub_boat_route"), "Hubに橋道／小舟道の分岐を配置する");
  assert(allIds.includes("p12_wind_memory") && allIds.includes("p12_windmill"), "風よみ取得地点と再訪対象の風車を配置する");
  assert(Object.keys(mapLayoutRegistry).filter((id) => id.startsWith("shimanami-")).length === 6, "しまなみ6エリアをレジストリへ登録する");

  const [fullDesign, areaSpec] = await Promise.all([
    readSpec("../docs/specs/FULL_GAME_DESIGN.md"),
    readSpec("../docs/specs/ADVENTURE_AREA_SPEC.md")
  ]);
  assert(fullDesign.includes("P12"), "P11フルゲーム設計書をブラウザから取得できる");
  assert(areaSpec.includes("しまなみ") && areaSpec.includes("風よみ"), "Adventure Area仕様書にしまなみ／風よみの契約がある");
}

verify().then(() => setStatus("pass")).catch((error: unknown) => {
  setStatus("fail", error instanceof Error ? error.message : String(error));
});

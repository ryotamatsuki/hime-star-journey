import { getMapLayout, getPositionedObject, normalizeLocationId } from "./mapLayoutRegistry";
import type { Rect } from "../systems/CollisionSystem";

export type InteractableKind =
  | "sign"
  | "steam"
  | "star_hint"
  | "castle_hint"
  | "dark_well"
  | "castle_guard"
  | "p12_windmill"
  | "p12_portal";

export type InteractableData = {
  id: string;
  locationId: string;
  areaId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  kind: InteractableKind;
  requiredFlags?: string[];
  message: string;
};

type InteractableDefinition = Omit<InteractableData, "x" | "y" | "width" | "height"> & {
  width: number;
  height: number;
};

const interactableDefinitions: InteractableDefinition[] = [
  {
    id: "dogo_start_sign",
    locationId: "dogo",
    areaId: "D0",
    width: 96,
    height: 90,
    label: "道後温泉",
    kind: "sign",
    message: "木の札には「道後温泉」と書かれている。湯けむりの奥で、小さな星がまたたいた気がした。"
  },
  {
    id: "dogo_steam_spot",
    locationId: "dogo",
    areaId: "D0",
    width: 132,
    height: 102,
    label: "湯けむり",
    kind: "steam",
    message: "ふわりと温かい湯けむりが立ちのぼる。シロが気持ちよさそうに羽をふくらませた。"
  },
  {
    id: "dogo_star_placeholder",
    locationId: "dogo",
    areaId: "D0",
    width: 112,
    height: 92,
    label: "湯の星の気配",
    kind: "star_hint",
    message: "ここに湯の星の気配が集まっている。"
  },
  {
    id: "castle_gate_hint",
    locationId: "castle",
    areaId: "C0",
    width: 120,
    height: 92,
    label: "登城口の石碑",
    kind: "castle_hint",
    message: "石碑の文字が黒くにじんでいる。『三つの影をしずめ、井戸の闇をほどけ』と読めた。"
  },
  {
    id: "castle_dark_well",
    locationId: "castle",
    areaId: "C0",
    width: 128,
    height: 112,
    label: "くらやみ井戸",
    kind: "dark_well",
    requiredFlags: ["castle_required_enemies_cleared"],
    message: "井戸の底で、くろぼしの影がまだ揺れている。"
  },
  {
    id: "castle_guard_shrine",
    locationId: "castle",
    areaId: "C0",
    width: 128,
    height: 112,
    label: "城山のまもり",
    kind: "castle_guard",
    requiredFlags: ["castle_dark_well_cleared"],
    message: "小さな祠に、石垣色の光をまとったお守りが置かれている。"
  },
  {
    id: "p12_hub_log",
    locationId: "shimanami",
    areaId: "A2-0",
    width: 112,
    height: 90,
    label: "港の航路図",
    kind: "sign",
    message: "航路図には、橋道と小舟道が同じ見張り台へ集まると記されている。"
  },
  {
    id: "p12_hub_bridge_route",
    locationId: "shimanami",
    areaId: "A2-0",
    width: 120,
    height: 92,
    label: "橋道の入口",
    kind: "p12_portal",
    message: "橋道へ進む。潮風の向こうから、細い鈴の音が聞こえた。"
  },
  {
    id: "p12_hub_boat_route",
    locationId: "shimanami",
    areaId: "A2-0",
    width: 120,
    height: 92,
    label: "小舟の桟橋",
    kind: "p12_portal",
    message: "小舟道へ進む。島影の間に、見張り台の灯りが見える。"
  },
  {
    id: "p12_hub_windmill",
    locationId: "shimanami",
    areaId: "A2-0",
    width: 112,
    height: 116,
    label: "港の風車",
    kind: "p12_windmill",
    message: "風車の羽根は止まっている。風を読む力があれば、別の音が聞こえそうだ。"
  },
  {
    id: "p12_bridge_discovery",
    locationId: "shimanami",
    areaId: "A2-1",
    width: 112,
    height: 92,
    label: "橋の記憶",
    kind: "star_hint",
    message: "橋の欄干に、昔の旅人が結んだ星形の紐が残っている。"
  },
  {
    id: "p12_bridge_to_watchtower",
    locationId: "shimanami",
    areaId: "A2-1",
    width: 120,
    height: 92,
    label: "見張り台への道",
    kind: "p12_portal",
    message: "橋の先に、海城の見張り台へ続く道が見えた。"
  },
  {
    id: "p12_island_discovery",
    locationId: "shimanami",
    areaId: "A2-2",
    width: 112,
    height: 92,
    label: "島の記憶",
    kind: "star_hint",
    message: "集落の石垣に、潮の満ち引きを刻んだ小さな星印がある。"
  },
  {
    id: "p12_island_to_watchtower",
    locationId: "shimanami",
    areaId: "A2-2",
    width: 120,
    height: 92,
    label: "見張り台への坂",
    kind: "p12_portal",
    message: "坂道を上ると、風の向きを測る旗が見えてきた。"
  },
  {
    id: "p12_wind_memory",
    locationId: "shimanami",
    areaId: "A2-3",
    width: 112,
    height: 96,
    label: "風よみの星",
    kind: "star_hint",
    message: "星の音が風の流れを示している。風よみの力を受け取れそうだ。"
  },
  {
    id: "p12_windmill",
    locationId: "shimanami",
    areaId: "A2-3",
    width: 112,
    height: 116,
    label: "見張り台の風車",
    kind: "p12_windmill",
    message: "風車の羽根が、さっきとは違う向きで止まっている。"
  },
  {
    id: "p12_watchtower_to_island",
    locationId: "shimanami",
    areaId: "A2-3",
    width: 120,
    height: 92,
    label: "上島への道",
    kind: "p12_portal",
    message: "風の道がひらいた。上島へ渡る準備ができた。"
  },
  {
    id: "p12_kamijima_discovery",
    locationId: "shimanami",
    areaId: "A2-4",
    width: 112,
    height: 92,
    label: "上島の記憶",
    kind: "star_hint",
    message: "島道の石に、風を待つ人たちの願いが淡く残っている。"
  },
  {
    id: "p12_kamijima_to_boss",
    locationId: "shimanami",
    areaId: "A2-4",
    width: 120,
    height: 92,
    label: "風の灯台への道",
    kind: "p12_portal",
    message: "風の灯台へ向かう道が、海の上にまっすぐ伸びた。"
  },
  {
    id: "p12_boss_altar",
    locationId: "shimanami",
    areaId: "A2-5",
    width: 112,
    height: 96,
    label: "灯台の祭壇",
    kind: "star_hint",
    message: "祭壇の向こうで、しまかぜ大だこが星の光を抱えている。"
  },
  {
    id: "p12_boss_to_island",
    locationId: "shimanami",
    areaId: "A2-5",
    width: 120,
    height: 92,
    label: "島道へ戻る",
    kind: "p12_portal",
    message: "上島の島道へ戻る。"
  }
];

export const interactables: InteractableData[] = interactableDefinitions.flatMap((definition) => {
  const position = getLayoutPosition(definition.locationId, definition.areaId, definition.id);
  return position
    ? [{ ...definition, x: position.x, y: position.y, width: position.width ?? definition.width, height: position.height ?? definition.height }]
    : [];
});

export function getInteractablesForArea(locationId: string, areaId: string): InteractableData[] {
  const normalized = normalizeLocationId(locationId);
  return interactableDefinitions
    .filter((interactable) => interactable.locationId === normalized && interactable.areaId === areaId)
    .flatMap((definition) => {
      const position = getLayoutPosition(normalized, areaId, definition.id);
      return position
        ? [{ ...definition, x: position.x, y: position.y, width: position.width ?? definition.width, height: position.height ?? definition.height }]
        : [];
    });
}

export function toRect(interactable: InteractableData): Rect {
  return {
    x: interactable.x,
    y: interactable.y,
    width: interactable.width,
    height: interactable.height
  };
}

function getLayoutPosition(
  locationId: string,
  areaId: string,
  interactableId: string
): { x: number; y: number; width?: number; height?: number } | undefined {
  const layout = getMapLayout(locationId, areaId);
  return layout ? getPositionedObject(layout.interactablePositions, interactableId) : undefined;
}

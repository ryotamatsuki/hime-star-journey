import { getMapLayout, getPositionedObject, normalizeLocationId } from "./mapLayoutRegistry";
import type { Rect } from "../systems/CollisionSystem";

export type InteractableKind = "sign" | "steam" | "star_hint" | "castle_hint" | "dark_well" | "castle_guard";

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

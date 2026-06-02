import type { Rect } from "../systems/CollisionSystem";

export type InteractableKind = "sign" | "steam" | "star_hint";

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

export const interactables: InteractableData[] = [
  {
    id: "dogo_start_sign",
    locationId: "dogo",
    areaId: "D0",
    x: 95,
    y: 650,
    width: 96,
    height: 90,
    label: "道後温泉",
    kind: "sign",
    message:
      "木の札には「道後温泉」と書かれている。湯けむりの奥で、小さな星がまたたいた気がした。"
  },
  {
    id: "dogo_steam_spot",
    locationId: "dogo",
    areaId: "D0",
    x: 878,
    y: 470,
    width: 132,
    height: 102,
    label: "湯けむり",
    kind: "steam",
    message:
      "ふわりと温かい湯けむりが立ちのぼる。シロが気持ちよさそうに羽をふくらませた。"
  },
  {
    id: "dogo_star_placeholder",
    locationId: "dogo",
    areaId: "D0",
    x: 1492,
    y: 724,
    width: 112,
    height: 92,
    label: "湯の星の気配",
    kind: "star_hint",
    message:
      "ここに湯の星の気配が集まっている。正式な取得処理は後続フェーズで接続する。"
  }
];

export function getInteractablesForArea(locationId: string, areaId: string): InteractableData[] {
  return interactables.filter(
    (interactable) => interactable.locationId === locationId && interactable.areaId === areaId
  );
}

export function toRect(interactable: InteractableData): Rect {
  return {
    x: interactable.x,
    y: interactable.y,
    width: interactable.width,
    height: interactable.height
  };
}

import type { StarMapNodeData, StarMapNodeStatus } from "../data/starMap";
import type { ScreenId } from "../types/game";
import type { SaveData } from "../types/save";

export type TravelDestination =
  | {
      type: "screen";
      screenId: ScreenId;
      locationId: string;
      areaId: string;
    }
  | {
      type: "message";
      message: string;
    };

export function getNodeStatus(node: StarMapNodeData, save: SaveData): StarMapNodeStatus {
  if (save.collectedStars.includes(node.locationId)) {
    return "cleared";
  }

  if (node.locationId === "dogo" && save.flags.star_dogo_collected) {
    return "cleared";
  }

  if (node.locationId === "dogo") {
    return "unlocked";
  }

  if (node.locationId === "castle") {
    return isLocationUnlocked("castle", save) || save.flags.location_castle_unlocked
      ? save.flags.castle_boss_route_unlocked ? "inProgress" : "unlocked"
      : "locked";
  }

  if (node.requiredFlag && !save.flags[node.requiredFlag]) {
    return "locked";
  }

  if (isLocationUnlocked(node.locationId, save)) {
    return node.status === "cleared" ? "cleared" : "unlocked";
  }

  return node.status === "cleared" ? "cleared" : "locked";
}

export function isNodeSelectable(node: StarMapNodeData, save: SaveData): boolean {
  const status = getNodeStatus(node, save);
  return status === "unlocked" || status === "inProgress" || status === "cleared";
}

export function getCurrentObjective(save: SaveData): string {
  if (save.flags.shiroyama_guard_obtained || save.flags.castle_boss_route_unlocked) {
    return "城山のまもりを手に入れた。カゲマサのいる場所へ向かう準備ができた。";
  }

  if (save.currentLocationId === "castle" || save.flags.castle_quest_started) {
    if (!save.flags.castle_hint_seen) return "松山城を調べ、城内の異変の手がかりを見つけよう";
    if (!save.flags.castle_required_enemies_cleared) return "松山城の三つの影をしずめよう";
    if (!save.flags.castle_dark_well_cleared) return "くらやみ井戸の闇をほどこう";
    return "天守前の祠で城山のまもりを受け取ろう";
  }

  if (!save.flags.star_dogo_collected && !save.collectedStars.includes("dogo")) {
    return "道後温泉で湯の星の気配を探そう";
  }

  if (save.flags.location_castle_unlocked || save.unlockedLocations.includes("castle")) {
    return "星地図から松山城へ向かおう";
  }

  return "星地図で次の行き先を確かめよう";
}

export function getSynopsis(save: SaveData): string {
  return save.lastSynopsis || "ひめとシロは、小さな星を探す旅を続けています。";
}

export function getTravelDestination(
  node: StarMapNodeData,
  save: SaveData
): TravelDestination {
  if (!isNodeSelectable(node, save)) {
    return {
      type: "message",
      message: `${node.name}には、まだ星の光が届いていません。`
    };
  }

  if (node.locationId === "dogo") {
    return {
      type: "screen",
      screenId: "explore",
      locationId: "dogo",
      areaId: "D0"
    };
  }

  if (node.locationId === "castle") {
    return {
      type: "screen",
      screenId: "explore",
      locationId: "castle",
      areaId: "C0"
    };
  }

  return {
    type: "message",
    message: `${node.name}はMVPでは未解放です。`
  };
}

function isLocationUnlocked(locationId: string, save: SaveData): boolean {
  return save.unlockedLocations.includes(locationId);
}

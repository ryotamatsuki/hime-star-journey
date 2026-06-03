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
      ? "unlocked"
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
  if (!save.flags.star_dogo_collected && !save.collectedStars.includes("dogo")) {
    return "道後温泉で湯の星の気配を探そう";
  }

  if (save.flags.location_castle_unlocked || save.unlockedLocations.includes("castle")) {
    return "星地図で松山城を確認しよう";
  }

  return "星地図で次の行き先を確かめよう";
}

export function getSynopsis(save: SaveData): string {
  return save.lastSynopsis || "ひめとシロは、愛媛にちらばる小さな星を探しています。";
}

export function getTravelDestination(
  node: StarMapNodeData,
  save: SaveData
): TravelDestination {
  if (!isNodeSelectable(node, save)) {
    return {
      type: "message",
      message: `${node.name}はまだ星の光が届いていません。`
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
      type: "message",
      message: "松山城エリアは後続フェーズで実装します。"
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

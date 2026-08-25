import { getMapLayout, getPositionedObject, normalizeLocationId } from "./mapLayoutRegistry";

export type NpcData = {
  id: string;
  name: string;
  locationId: string;
  areaId: string;
  x: number;
  y: number;
  assetId: string;
  dialogueId: string;
  interactionRadius: number;
  direction: "up" | "down" | "left" | "right";
  animationType?: "idle" | "float";
};

type NpcDefinition = Omit<NpcData, "x" | "y">;

const npcDefinitions: NpcDefinition[] = [
  {
    id: "npc_dogo_guide",
    name: "案内人",
    locationId: "dogo",
    areaId: "D0",
    assetId: "npc_dogo_guide",
    dialogueId: "npc_dogo_guide_default",
    interactionRadius: 110,
    direction: "down",
    animationType: "idle"
  },
  {
    id: "npc_yumori_grandma",
    name: "湯守のおばあさん",
    locationId: "dogo",
    areaId: "D0",
    assetId: "npc_yumori_grandma",
    dialogueId: "npc_yumori_grandma_default",
    interactionRadius: 80,
    direction: "left",
    animationType: "idle"
  },
  {
    id: "npc_castle_scout",
    name: "城山の見回り",
    locationId: "castle",
    areaId: "C0",
    assetId: "npc_dogo_guide",
    dialogueId: "npc_castle_scout_default",
    interactionRadius: 96,
    direction: "down",
    animationType: "idle"
  },
  {
    id: "npc_p12_port_master",
    name: "港の船大工",
    locationId: "shimanami",
    areaId: "A2-0",
    assetId: "npc_dogo_guide",
    dialogueId: "npc_p12_port_master",
    interactionRadius: 96,
    direction: "down",
    animationType: "idle"
  },
  {
    id: "npc_p12_bridge_keeper",
    name: "橋道の見張り",
    locationId: "shimanami",
    areaId: "A2-1",
    assetId: "npc_dogo_guide",
    dialogueId: "npc_p12_bridge_keeper",
    interactionRadius: 88,
    direction: "right",
    animationType: "idle"
  },
  {
    id: "npc_p12_island_keeper",
    name: "島の船守",
    locationId: "shimanami",
    areaId: "A2-2",
    assetId: "npc_yumori_grandma",
    dialogueId: "npc_p12_island_keeper",
    interactionRadius: 88,
    direction: "right",
    animationType: "idle"
  },
  {
    id: "npc_p12_watchkeeper",
    name: "見張り台の子",
    locationId: "shimanami",
    areaId: "A2-3",
    assetId: "npc_dogo_guide",
    dialogueId: "npc_p12_watchkeeper",
    interactionRadius: 88,
    direction: "down",
    animationType: "float"
  }
];

export const npcs: NpcData[] = npcDefinitions.flatMap((definition) => {
  const position = getLayoutPosition(definition.locationId, definition.areaId, definition.id);
  return position ? [{ ...definition, x: position.x, y: position.y }] : [];
});

export function getNpcsForArea(locationId: string, areaId: string): NpcData[] {
  const normalized = normalizeLocationId(locationId);
  return npcDefinitions
    .filter((npc) => npc.locationId === normalized && npc.areaId === areaId)
    .flatMap((definition) => {
      const position = getLayoutPosition(normalized, areaId, definition.id);
      return position ? [{ ...definition, x: position.x, y: position.y }] : [];
    });
}

function getLayoutPosition(locationId: string, areaId: string, npcId: string): { x: number; y: number } | undefined {
  const layout = getMapLayout(locationId, areaId);
  return layout ? getPositionedObject(layout.npcPositions, npcId) : undefined;
}

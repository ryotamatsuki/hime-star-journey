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

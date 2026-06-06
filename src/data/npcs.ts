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

export const npcs: NpcData[] = [
  {
    id: "npc_dogo_guide",
    name: "案内人",
    locationId: "dogo",
    areaId: "D0",
    x: 620,
    y: 760,
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
    x: 990,
    y: 900,
    assetId: "npc_yumori_grandma",
    dialogueId: "npc_yumori_grandma_default",
    interactionRadius: 80,
    direction: "left",
    animationType: "idle"
  }
];

export function getNpcsForArea(locationId: string, areaId: string): NpcData[] {
  return npcs.filter((npc) => npc.locationId === locationId && npc.areaId === areaId);
}

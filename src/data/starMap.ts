export type StarMapNodeStatus = "locked" | "unlocked" | "inProgress" | "cleared";

export type StarMapNodeData = {
  id: string;
  locationId: string;
  name: string;
  x: number;
  y: number;
  status: StarMapNodeStatus;
  requiredFlag?: string;
  description: string;
  badgeAssetId?: string;
};

export const starMapNodes: StarMapNodeData[] = [
  {
    id: "node_dogo",
    locationId: "dogo",
    name: "道後温泉",
    x: 520,
    y: 360,
    status: "unlocked",
    description: "湯けむりの町にねむる、はじめの星。",
    badgeAssetId: "ui_location_badge_dogo"
  },
  {
    id: "node_castle",
    locationId: "castle",
    name: "松山城",
    x: 640,
    y: 280,
    status: "locked",
    requiredFlag: "location_castle_unlocked",
    description: "城山にのびる黒い影を追いかけよう。",
    badgeAssetId: "ui_location_badge_castle"
  },
  {
    id: "node_shimanami",
    locationId: "shimanami",
    name: "しまなみ方面",
    x: 760,
    y: 210,
    status: "locked",
    description: "海と島をつなぐ星。MVPでは未解放。"
  },
  {
    id: "node_ishizuchi",
    locationId: "ishizuchi",
    name: "石鎚方面",
    x: 760,
    y: 430,
    status: "locked",
    description: "山にねむる星。MVPでは未解放。"
  },
  {
    id: "node_nanyo",
    locationId: "nanyo",
    name: "南予方面",
    x: 420,
    y: 520,
    status: "locked",
    description: "海と城下町の星。MVPでは未解放。"
  }
];

export function getStarMapNodeById(nodeId: string): StarMapNodeData | undefined {
  return starMapNodes.find((node) => node.id === nodeId);
}

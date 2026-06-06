import type { BattleCardData, CardId } from "../types/battle";

export const starterBattleCardIds: CardId[] = [
  "card_mikan_attack",
  "card_shirasagi_ofuda",
  "card_dogo_drop",
  "card_yukemuri_veil"
];

export const battleCards: Record<CardId, BattleCardData> = {
  card_mikan_attack: {
    id: "card_mikan_attack",
    name: "みかん星アタック",
    shortName: "みかん星",
    description: "みかん色の星を飛ばして、敵1体をしずめる基本攻撃。",
    targetType: "singleEnemy",
    role: "attack",
    assetId: "card_mikan_attack",
    mpCost: 0,
    power: 9
  },
  card_shirasagi_ofuda: {
    id: "card_shirasagi_ofuda",
    name: "白鷺のおふだ",
    shortName: "白鷺札",
    description: "白い光のおふだ。敵1体に効き、ボスの封印にも少し効く。",
    targetType: "singleEnemy",
    role: "attack",
    assetId: "card_shirasagi_ofuda",
    mpCost: 1,
    power: 7,
    bossSealDamage: 1
  },
  card_dogo_drop: {
    id: "card_dogo_drop",
    name: "道後の湯しずく",
    shortName: "湯しずく",
    description: "やさしい湯の力で、ひめのHPを回復する。",
    targetType: "self",
    role: "heal",
    assetId: "card_dogo_drop",
    mpCost: 2,
    power: 10
  },
  card_yukemuri_veil: {
    id: "card_yukemuri_veil",
    name: "湯けむりヴェール",
    shortName: "湯けむり",
    description: "次の敵の攻撃を軽く受け流す。",
    targetType: "self",
    role: "guard",
    assetId: "card_yukemuri_veil",
    mpCost: 1,
    power: 0,
    guardDamageReduction: 4,
    guardTurns: 1
  },
  card_castle_guard: {
    id: "card_castle_guard",
    name: "城山のまもり",
    shortName: "城山守り",
    description: "石垣の力で、少し長く守りを固める。",
    targetType: "self",
    role: "guard",
    assetId: "card_castle_guard",
    mpCost: 3,
    power: 0,
    guardDamageReduction: 7,
    guardTurns: 2
  },
  card_star_seal: {
    id: "card_star_seal",
    name: "星封じ",
    shortName: "星封じ",
    description: "ボスの封印ゲージを大きく削る。通常敵にも光の一撃になる。",
    targetType: "bossSeal",
    role: "seal",
    assetId: "card_star_seal",
    mpCost: 4,
    power: 8,
    bossSealDamage: 2
  }
};

export function getBattleCard(cardId: string): BattleCardData | undefined {
  return battleCards[cardId as CardId];
}

export function normalizeBattleCardIds(cardIds: string[]): CardId[] {
  const normalized = new Set<CardId>(starterBattleCardIds);

  for (const cardId of cardIds) {
    if (getBattleCard(cardId)) {
      normalized.add(cardId as CardId);
    }
  }

  return [...normalized];
}

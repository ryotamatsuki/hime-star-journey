import type { BattleActorType } from "../types/battle";

export type EnemyData = {
  id: string;
  name: string;
  actorType?: BattleActorType;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  assetId: string;
};

export const enemyData: Record<string, EnemyData> = {
  dogo_oni: {
    id: "dogo_oni",
    name: "湯どろぼう鬼",
    maxHp: 20,
    attack: 5,
    defense: 1,
    speed: 8,
    assetId: "enemy_dogo_oni"
  },
  dogo_lantern: {
    id: "dogo_lantern",
    name: "あお提灯",
    maxHp: 16,
    attack: 4,
    defense: 0,
    speed: 10,
    assetId: "enemy_dogo_lantern"
  },
  dogo_armor: {
    id: "dogo_armor",
    name: "さびよろい",
    maxHp: 26,
    attack: 6,
    defense: 3,
    speed: 5,
    assetId: "enemy_dogo_armor"
  },
  dogo_mouse: {
    id: "dogo_mouse",
    name: "ゆげネズミ",
    maxHp: 12,
    attack: 3,
    defense: 0,
    speed: 12,
    assetId: "enemy_dogo_mouse"
  },
  castle_soldier: {
    id: "castle_soldier",
    name: "影足軽",
    maxHp: 22,
    attack: 6,
    defense: 1,
    speed: 9,
    assetId: "enemy_castle_soldier"
  },
  castle_oni: {
    id: "castle_oni",
    name: "石垣鬼",
    maxHp: 34,
    attack: 8,
    defense: 3,
    speed: 5,
    assetId: "enemy_castle_oni"
  },
  castle_well: {
    id: "castle_well",
    name: "くらやみ井戸",
    maxHp: 28,
    attack: 7,
    defense: 2,
    speed: 4,
    assetId: "enemy_castle_well"
  },
  castle_crow: {
    id: "castle_crow",
    name: "黒羽ガラス",
    maxHp: 18,
    attack: 6,
    defense: 0,
    speed: 13,
    assetId: "enemy_castle_crow"
  },
  boss_kagemasa: {
    id: "boss_kagemasa",
    name: "黒よろいの大将カゲマサ",
    actorType: "boss",
    maxHp: 80,
    attack: 8,
    defense: 3,
    speed: 6,
    assetId: "boss_kagemasa"
  }
};

export function getEnemyData(enemyId: string): EnemyData | undefined {
  return enemyData[enemyId];
}

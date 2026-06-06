import type { EncounterData } from "../types/battle";

export const encounters: EncounterData[] = [
  {
    id: "enc_dogo_oni_01",
    name: "湯どろぼう鬼",
    required: true,
    enemies: [{ enemyId: "dogo_oni" }]
  },
  {
    id: "enc_dogo_oni_02",
    name: "湯どろぼう鬼",
    required: true,
    enemies: [{ enemyId: "dogo_oni" }]
  },
  {
    id: "enc_dogo_lantern_01",
    name: "あお提灯",
    required: true,
    enemies: [{ enemyId: "dogo_lantern" }]
  },
  {
    id: "enc_dogo_armor_01",
    name: "さびよろい",
    required: true,
    enemies: [{ enemyId: "dogo_armor" }]
  },
  {
    id: "enc_dogo_mouse_pair_01",
    name: "ゆげネズミたち",
    required: false,
    enemies: [
      { enemyId: "dogo_mouse", label: "A" },
      { enemyId: "dogo_mouse", label: "B" }
    ]
  },
  {
    id: "enc_dogo_mouse_01",
    name: "ゆげネズミ",
    required: false,
    enemies: [{ enemyId: "dogo_mouse" }]
  },
  {
    id: "enc_castle_soldier_01",
    name: "影足軽",
    required: true,
    enemies: [{ enemyId: "castle_soldier" }]
  },
  {
    id: "enc_castle_soldier_pair_01",
    name: "影足軽たち",
    required: true,
    enemies: [
      { enemyId: "castle_soldier", label: "A" },
      { enemyId: "castle_soldier", label: "B" }
    ]
  },
  {
    id: "enc_castle_oni_01",
    name: "石垣鬼",
    required: true,
    enemies: [{ enemyId: "castle_oni" }]
  },
  {
    id: "enc_castle_oni_02",
    name: "石垣鬼",
    required: true,
    enemies: [{ enemyId: "castle_oni" }]
  },
  {
    id: "enc_castle_well_01",
    name: "くらやみ井戸",
    required: true,
    enemies: [{ enemyId: "castle_well" }]
  },
  {
    id: "enc_castle_crow_soldier_01",
    name: "黒羽ガラスと影足軽",
    required: false,
    enemies: [{ enemyId: "castle_crow" }, { enemyId: "castle_soldier" }]
  },
  {
    id: "enc_castle_crow_01",
    name: "黒羽ガラス",
    required: false,
    enemies: [{ enemyId: "castle_crow" }]
  },
  {
    id: "enc_castle_soldier_02",
    name: "影足軽",
    required: true,
    enemies: [{ enemyId: "castle_soldier" }]
  },
  {
    id: "enc_boss_kagemasa",
    name: "黒よろいの大将カゲマサ",
    required: true,
    isBoss: true,
    enemies: [{ enemyId: "boss_kagemasa" }]
  }
];

export function getEncounterById(encounterId: string): EncounterData | undefined {
  return encounters.find((encounter) => encounter.id === encounterId);
}

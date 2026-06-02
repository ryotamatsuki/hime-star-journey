import type { EncounterData } from "../types/battle";

export const encounters: EncounterData[] = [
  {
    id: "enc_dogo_oni_01",
    name: "湯どろぼう鬼 x1",
    required: true,
    enemies: [{ enemyId: "dogo_oni", label: "湯どろぼう鬼" }]
  },
  {
    id: "enc_dogo_oni_02",
    name: "湯どろぼう鬼 x1",
    required: true,
    enemies: [{ enemyId: "dogo_oni", label: "湯どろぼう鬼" }]
  },
  {
    id: "enc_dogo_lantern_01",
    name: "あお提灯 x1",
    required: true,
    enemies: [{ enemyId: "dogo_lantern", label: "あお提灯" }]
  },
  {
    id: "enc_dogo_armor_01",
    name: "さびよろい x1",
    required: true,
    enemies: [{ enemyId: "dogo_armor", label: "さびよろい" }]
  },
  {
    id: "enc_dogo_mouse_pair_01",
    name: "ゆげネズミ x2",
    required: false,
    enemies: [
      { enemyId: "dogo_mouse", label: "ゆげネズミ" },
      { enemyId: "dogo_mouse", label: "ゆげネズミ" }
    ]
  },
  {
    id: "enc_dogo_mouse_01",
    name: "ゆげネズミ x1",
    required: false,
    enemies: [{ enemyId: "dogo_mouse", label: "ゆげネズミ" }]
  }
];

export function getEncounterById(encounterId: string): EncounterData | undefined {
  return encounters.find((encounter) => encounter.id === encounterId);
}

import type { DialogueEventData } from "../types/dialogue";

export const dialogueEvents: DialogueEventData[] = [
  {
    id: "dogo_intro_auto",
    triggerType: "auto",
    once: true,
    setFlagsOnComplete: {
      dialogue_dogo_intro_seen: true,
      dogo_quest_started: true
    },
    lines: [
      {
        speakerId: "shiro",
        speakerName: "シロ",
        portraitAssetId: "portrait_shiro",
        text: "黒い影は、町の奥へ逃げたみたい。"
      },
      {
        speakerId: "hime",
        speakerName: "ひめ",
        portraitAssetId: "portrait_hime",
        text: "まずは、道後の星を弱らせている影たちをしずめよう。"
      },
      {
        speakerId: "hime",
        speakerName: "ひめ",
        portraitAssetId: "portrait_hime",
        text: "うん。湯の星を取り戻して、星地図を開けるようにしよう。"
      }
    ]
  },
  {
    id: "dogo_first_enemy_hint_auto",
    triggerType: "auto",
    once: true,
    setFlagsOnComplete: {
      dialogue_first_enemy_hint_seen: true
    },
    lines: [
      {
        speakerId: "shiro",
        speakerName: "シロ",
        portraitAssetId: "portrait_shiro",
        text: "あの子、こわい敵というより、町の星にまよっているみたい。"
      },
      {
        speakerId: "hime",
        speakerName: "ひめ",
        portraitAssetId: "portrait_hime",
        text: "倒すんじゃなくて、しずめるんだね。"
      },
      {
        speakerId: "shiro",
        speakerName: "シロ",
        portraitAssetId: "portrait_shiro",
        text: "カードを選んで、やさしく星の力を返してあげよう。"
      }
    ]
  },
  {
    id: "npc_dogo_guide_default",
    triggerType: "npc",
    once: false,
    lines: [
      {
        speakerId: "dogo_guide",
        speakerName: "案内人",
        portraitAssetId: "npc_dogo_guide",
        text: "湯けむり通りをまっすぐ行くと、古いお湯のしるしがあるよ。"
      },
      {
        speakerId: "shiro",
        speakerName: "シロ",
        portraitAssetId: "portrait_shiro",
        text: "そこに、土地の星の手がかりがありそうだね。"
      }
    ]
  },
  {
    id: "npc_yumori_grandma_default",
    triggerType: "npc",
    once: false,
    lines: [
      {
        speakerId: "yumori_grandma",
        speakerName: "湯守のおばあさん",
        portraitAssetId: "npc_yumori_grandma",
        text: "道後の湯は、昔からたくさんの人をあたためてきたんよ。"
      },
      {
        speakerId: "hime",
        speakerName: "ひめ",
        portraitAssetId: "portrait_hime",
        text: "お湯にも、思い出があるんだね。"
      },
      {
        speakerId: "yumori_grandma",
        speakerName: "湯守のおばあさん",
        portraitAssetId: "npc_yumori_grandma",
        text: "そうそう。やさしく耳をすませば、町の星もこたえてくれるよ。"
      }
    ]
  },
  {
    id: "interactable_steam_hint",
    triggerType: "interactable",
    once: false,
    lines: [
      {
        speakerId: "shiro",
        speakerName: "シロ",
        portraitAssetId: "portrait_shiro",
        text: "この湯けむり、ただの湯けむりじゃないみたい。"
      },
      {
        speakerId: "hime",
        speakerName: "ひめ",
        portraitAssetId: "portrait_hime",
        text: "湯の星の光みたいに、きらっと光ったよ。"
      }
    ]
  },
  {
    id: "castle_intro_auto",
    triggerType: "auto",
    once: true,
    setFlagsOnComplete: {
      dialogue_castle_intro_seen: true,
      castle_quest_started: true
    },
    lines: [
      {
        speakerId: "shiro",
        speakerName: "シロ",
        portraitAssetId: "portrait_shiro",
        text: "ここが松山城だよ。石垣の奥から、くろぼしの影がにじんでいる。"
      },
      {
        speakerId: "hime",
        speakerName: "ひめ",
        portraitAssetId: "portrait_hime",
        text: "湯の星で開いた道の先に、こんなに暗い気配があるなんて……。"
      },
      {
        speakerId: "shiro",
        speakerName: "シロ",
        portraitAssetId: "portrait_shiro",
        text: "まずは城の中の影をしずめよう。カゲマサのところへ向かうには、守りの力が必要だ。"
      }
    ]
  },
  {
    id: "npc_castle_scout_default",
    triggerType: "npc",
    once: false,
    setFlagsOnComplete: {
      castle_hint_seen: true
    },
    lines: [
      {
        speakerId: "castle_scout",
        speakerName: "城山の見回り",
        portraitAssetId: "npc_dogo_guide",
        text: "今夜の城はおかしい。影足軽、石垣鬼、黒羽ガラス……三つの影が道をふさいでいる。"
      },
      {
        speakerId: "shiro",
        speakerName: "シロ",
        portraitAssetId: "portrait_shiro",
        text: "三つの影をしずめれば、くらやみ井戸に近づけるはずだよ。"
      }
    ]
  },
  {
    id: "castle_guard_ready_hint",
    triggerType: "interactable",
    once: false,
    requiredFlags: {
      castle_dark_well_cleared: true
    },
    lines: [
      {
        speakerId: "shiro",
        speakerName: "シロ",
        portraitAssetId: "portrait_shiro",
        text: "井戸の闇がほどけた。天守前の祠に、城山のまもりが戻っているよ。"
      }
    ]
  },
  {
    id: "p12_intro_auto",
    triggerType: "auto",
    once: true,
    setFlagsOnComplete: {
      p12_intro_seen: true,
      p12_started: true
    },
    lines: [
      {
        speakerId: "shiro",
        speakerName: "シロ",
        portraitAssetId: "portrait_shiro",
        text: "海の星が、しまなみの風にさらわれている。ここは今治港Hubだよ。"
      },
      {
        speakerId: "hime",
        speakerName: "ひめ",
        portraitAssetId: "portrait_hime",
        text: "橋道と小舟道……どちらを通っても、海城の見張り台へ行けるんだね。"
      },
      {
        speakerId: "shiro",
        speakerName: "シロ",
        portraitAssetId: "portrait_shiro",
        text: "風の手がかりを集めて、灯台の星を取り戻そう。"
      }
    ]
  },
  {
    id: "npc_p12_port_master",
    triggerType: "npc",
    once: false,
    lines: [
      {
        speakerId: "port_master",
        speakerName: "港の船大工",
        portraitAssetId: "npc_shimanami_keeper",
        text: "橋道は風の記憶が残りやすい。小舟道は潮の音が手がかりになるよ。"
      },
      {
        speakerId: "hime",
        speakerName: "ひめ",
        portraitAssetId: "portrait_hime",
        text: "二つの道が、同じ見張り台につながっているんだね。"
      }
    ]
  },
  {
    id: "npc_p12_bridge_keeper",
    triggerType: "npc",
    once: false,
    lines: [
      {
        speakerId: "bridge_keeper",
        speakerName: "橋道の見張り",
        portraitAssetId: "npc_shimanami_keeper",
        text: "橋の上では、風が昔の旅人の声を運んでくる。星の紐を探してごらん。"
      }
    ]
  },
  {
    id: "npc_p12_island_keeper",
    triggerType: "npc",
    once: false,
    lines: [
      {
        speakerId: "island_keeper",
        speakerName: "島の船守",
        portraitAssetId: "npc_shimanami_keeper",
        text: "集落の石垣に、風を待つ人の記憶が残っとる。急がず、音を聞いて進みんさい。"
      }
    ]
  },
  {
    id: "npc_p12_watchkeeper",
    triggerType: "npc",
    once: false,
    lines: [
      {
        speakerId: "watchkeeper",
        speakerName: "見張り台の子",
        portraitAssetId: "npc_shimanami_keeper",
        text: "風の星は、風車が止まった場所にあるよ。受け取ったら、同じ羽根をもう一度見て。"
      },
      {
        speakerId: "shiro",
        speakerName: "シロ",
        portraitAssetId: "portrait_shiro",
        text: "風よみを手に入れる前と後で、同じ場所の意味が変わるんだね。"
      }
    ]
  },
  {
    id: "npc_p12_kamijima_guide",
    triggerType: "npc",
    once: false,
    lines: [
      {
        speakerId: "kamijima_keeper",
        speakerName: "上島の風守",
        portraitAssetId: "npc_shimanami_keeper",
        text: "上島では、風をつかまえずに待つんだよ。風が通る道を残しておくのさ。"
      },
      {
        speakerId: "shiro",
        speakerName: "シロ",
        portraitAssetId: "portrait_shiro",
        text: "だから、風よみは道を閉じる力じゃなくて、道を見つける力なんだね。"
      }
    ]
  }
];

export function getDialogueEvent(dialogueId: string): DialogueEventData | undefined {
  return dialogueEvents.find((event) => event.id === dialogueId);
}

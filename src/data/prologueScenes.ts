import type { PrologueScene } from "../types/prologue";

export const prologueScenes: PrologueScene[] = [
  {
    id: "grandma_gift",
    title: "おばあちゃんのお守り",
    backgroundAssetId: "prologue_grandma_room",
    grandma: true,
    hime: "normal",
    pendant: "full",
    lines: [
      { speaker: "おばあちゃん", text: "これはね、おばあちゃんが小さいころから持っていたお守り。" },
      { speaker: "おばあちゃん", text: "家に伝わる白鷺のお守りでね。道にまよったとき、きっとひめを守ってくれるよ。" },
      { speaker: "おばあちゃん", text: "むかし土地の星を見守った人たちにつながるそうだけど、くわしいことはもう誰も知らないの。" },
      { speaker: "ひめ", text: "きれいな、みかん色の星……。ありがとう、おばあちゃん。" }
    ]
  },
  {
    id: "family_trip",
    title: "家族旅行",
    backgroundAssetId: "prologue_family_trip_dogo",
    hime: "normal",
    lines: [
      { speaker: "ナレーション", text: "ひめは家族といっしょに、道後温泉へやってきました。" },
      { speaker: "ひめ", text: "湯けむりが、町じゅうをふわふわしてる！" }
    ]
  },
  {
    id: "meet_shiro",
    title: "シロとの出会い",
    backgroundAssetId: "prologue_dogo_night",
    hime: "surprised",
    shiro: true,
    pendant: "full",
    steam: true,
    lines: [
      { speaker: "ひめ", text: "いま、ペンダントが光った？" },
      { speaker: "シロ", text: "やっと会えた。ぼくはシロ。このお守りの中で、ずっと眠っていたんだ。" },
      { speaker: "ひめ", text: "鳥が、しゃべった……！？" },
      { speaker: "シロ", text: "ぼくの姿は、いまはひめにしか見えないみたい。" }
    ]
  },
  {
    id: "core_stolen",
    title: "奪われた光",
    backgroundAssetId: "prologue_core_stolen",
    hime: "surprised",
    shiro: true,
    shadow: true,
    pendant: "empty",
    lines: [
      { speaker: "ひめ", text: "ペンダントの光が……！" },
      { speaker: "シロ", text: "みかん星の核を取られたんだ！" },
      { speaker: "ひめ", text: "外枠と鎖は残ってる。でも、おばあちゃんにもらった大切なお守りなのに……。" }
    ]
  },
  {
    id: "dogo_anomaly",
    title: "道後温泉の異変",
    backgroundAssetId: "prologue_dogo_anomaly",
    hime: "surprised",
    shiro: true,
    shadow: true,
    steam: true,
    anomaly: true,
    lines: [
      { speaker: "ナレーション", text: "提灯は青くかげり、湯けむりは乱れ、あたたかい湯までぬるくなりました。" },
      { speaker: "シロ", text: "黒い影が松山城の方へ伸びている……。ぼくの力も、うまく出せない。" }
    ]
  },
  {
    id: "hime_decision",
    title: "ひめの決意",
    backgroundAssetId: "prologue_hime_decision",
    hime: "normal",
    shiro: true,
    pendant: "empty",
    lines: [
      { speaker: "ひめ", text: "ペンダントの光を取り返す。" },
      { speaker: "ひめ", text: "シロも、道後温泉も、わたしが助けるよ。" },
      { speaker: "シロ", text: "ありがとう、ひめ。まずは町で迷っている影を、やさしくしずめよう。" }
    ]
  }
];

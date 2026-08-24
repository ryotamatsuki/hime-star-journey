import type { SaveData } from "../types/save";

export type NotebookEntry = {
  id: string;
  title: string;
  region: "旅のはじまり" | "道後温泉" | "松山城" | "星守り";
  text: string;
  unlocked: (save: SaveData) => boolean;
};

export const notebookEntries: NotebookEntry[] = [
  {
    id: "grandmother_pendant",
    title: "おばあちゃんのペンダント",
    region: "旅のはじまり",
    text: "旅行の前、おばあちゃんから星の形の不思議なペンダントを託された。小さな光が、ひめの旅を導いている。",
    unlocked: () => true
  },
  {
    id: "meet_shiro",
    title: "白い子ぎつね・シロ",
    region: "旅のはじまり",
    text: "道後で白い子ぎつねのシロと出会った。星の異変に気づき、ひめと一緒に進んでくれる。",
    unlocked: (save) => save.flags.shiro_met === true
  },
  {
    id: "mikan_core_stolen",
    title: "奪われたみかん星の核",
    region: "星守り",
    text: "黒よろいの大将カゲマサに、ペンダントの中心にあった『みかん星の核』を奪われた。土地の星の力も弱まり始めた。",
    unlocked: (save) => save.flags.mikan_core_stolen === true
  },
  {
    id: "dogo_anomaly",
    title: "道後の湯けむり異変",
    region: "道後温泉",
    text: "道後の湯けむりが乱れ、影のようなものたちが現れた。町の人の話を聞きながら、異変の原因を追った。",
    unlocked: (save) => save.flags.dogo_quest_started === true
  },
  {
    id: "dogo_hint",
    title: "湯の星への手がかり",
    region: "道後温泉",
    text: "道後の人から、散らばった星の力と湯けむりの関係を教えてもらった。影をしずめれば、星の光が戻るかもしれない。",
    unlocked: (save) => save.flags.dogo_quest_hint_seen === true
  },
  {
    id: "yuno_star",
    title: "湯の星",
    region: "道後温泉",
    text: "道後の異変をしずめ、『湯の星』を取り戻した。星地図が光り、次の目的地・松山城への道が開いた。",
    unlocked: (save) => save.flags.yuno_star_obtained === true || save.collectedStars.includes("dogo")
  },
  {
    id: "castle_arrival",
    title: "松山城の影",
    region: "松山城",
    text: "松山城にも黒い影が広がっていた。城内の影足軽たちをしずめ、天守へ続く道を探した。",
    unlocked: (save) => save.flags.castle_quest_started === true
  },
  {
    id: "dark_well",
    title: "くらやみ井戸",
    region: "松山城",
    text: "城の奥にあるくらやみ井戸の異変をしずめた。石垣に宿る守りの力が、少しずつ戻ってきた。",
    unlocked: (save) => save.flags.castle_dark_well_cleared === true
  },
  {
    id: "shiroyama_guard",
    title: "城山のまもり",
    region: "松山城",
    text: "天守前の祠で『城山のまもり』を授かった。これでカゲマサのいる天守奥へ進める。",
    unlocked: (save) => save.flags.shiroyama_guard_obtained === true
  },
  {
    id: "kagemasa_sealed",
    title: "星封じと取り戻した光",
    region: "星守り",
    text: "星封じを完成させてカゲマサを再封印し、みかん星の核と城の星を取り戻した。星地図には、まだ名前のない空白の星が残っている。",
    unlocked: (save) => save.flags.gameCompleted === true || save.flags.kagemasa_sealed === true
  }
];

export function getUnlockedNotebookEntries(save: SaveData): NotebookEntry[] {
  return notebookEntries.filter((entry) => entry.unlocked(save));
}

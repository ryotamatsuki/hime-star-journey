export const dogoQuest = {
  id: "quest_dogo_yukemuri_star",
  name: "湯けむりにまよった星",
  finalObjective: "道後温泉の「湯の星」を取り戻す",
  requiredEnemySymbolIds: ["D-E01", "D-E02", "D-E03", "D-E04"] as const
};

export const castleQuest = {
  id: "quest_castle_shiroyama_guard",
  name: "城山をおおう黒い影",
  finalObjective: "松山城の異変をしずめ、「城山のまもり」を受け取ろう",
  requiredEnemySymbolIds: ["C-E01", "C-E02", "C-E03"] as const,
  darkWellEnemySymbolId: "C-E04",
  rewardCharmId: "shiroyama_guard"
};

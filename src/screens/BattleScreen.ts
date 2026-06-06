import { drawEllipseShadow, drawHealMistEffect, drawSealLightEffect, drawStarHitEffect } from "../animation/Effects";
import { ScreenShake } from "../animation/ScreenShake";
import { AssetLoader } from "../core/AssetLoader";
import { InputManager } from "../core/InputManager";
import { SaveManager } from "../core/SaveManager";
import { ScreenManager } from "../core/ScreenManager";
import { getBattleCard } from "../data/cards";
import { getEncounterById } from "../data/encounters";
import { getEnemySymbolById } from "../data/enemySymbols";
import {
  applyBattleCard,
  canUseCard,
  createBattleState,
  getActorByInstanceId,
  getAliveEnemies,
  getAvailableBattleCards,
  getPartyLeader,
  isBattleDefeat,
  isBattleVictory,
  requiresTargetSelection,
  resolveEnemyTurn
} from "../systems/BattleSystem";
import type { BattleActor, BattleCardData, BattleStartParams, BattleState, CardId } from "../types/battle";
import type { GameScreen, ScreenId } from "../types/game";
import type { SaveData } from "../types/save";

type BattleScreenOptions = {
  uiRoot: HTMLElement;
  screenManager: ScreenManager;
  saveManager: SaveManager;
  inputManager: InputManager;
  assetLoader: AssetLoader;
};

type BattleScreenParams = BattleStartParams & {
  saveData?: SaveData;
};

type ActorLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type BattleVisualEffect = {
  kind: "attack" | "heal" | "guard" | "seal" | "enemyAttack";
  sourceInstanceId: string;
  targetInstanceId: string;
  ageMs: number;
  durationMs: number;
};

const CARD_ACTIONS: Array<`card${1 | 2 | 3 | 4 | 5 | 6}`> = [
  "card1",
  "card2",
  "card3",
  "card4",
  "card5",
  "card6"
];

export class BattleScreen implements GameScreen {
  readonly id: ScreenId = "battle";

  private saveData: SaveData | null = null;
  private battleParams: BattleStartParams | null = null;
  private battleState: BattleState | null = null;
  private selectedCardId: CardId | null = null;
  private messages: string[] = [];
  private elapsedMs = 0;
  private enemyTurnDelayMs = 0;
  private visualEffect: BattleVisualEffect | null = null;
  private readonly screenShake = new ScreenShake();

  constructor(private readonly options: BattleScreenOptions) {}

  enter(params?: unknown): void {
    const typedParams = params as BattleScreenParams | undefined;
    this.saveData = typedParams?.saveData ?? this.options.saveManager.load();
    this.battleParams = typedParams
      ? {
          enemySymbolId: typedParams.enemySymbolId,
          encounterId: typedParams.encounterId,
          returnLocationId: typedParams.returnLocationId,
          returnAreaId: typedParams.returnAreaId,
          isBoss: typedParams.isBoss
        }
      : null;

    const encounter = this.battleParams ? getEncounterById(this.battleParams.encounterId) : undefined;
    if (!this.saveData || !this.battleParams || !encounter) {
      this.battleState = null;
      this.messages = ["バトル開始情報が見つかりません。探索へ戻ります。"];
      this.renderUi();
      return;
    }

    this.battleState = createBattleState(encounter, this.saveData);
    this.selectedCardId = null;
    this.enemyTurnDelayMs = 0;
    this.visualEffect = null;
    this.messages = [`${encounter.name}があらわれた。`, "カードを選んで、敵をしずめよう。"];
    this.renderUi();
  }

  update(deltaTime: number): void {
    this.elapsedMs += deltaTime * 1000;
    this.screenShake.update(deltaTime);
    this.updateVisualEffect(deltaTime);

    if (!this.battleState) {
      if (this.options.inputManager.isActionStarted("confirm")) {
        this.returnToExploreAfterDefeat();
      }
      return;
    }

    if (this.battleState.phase === "enemyAction") {
      this.enemyTurnDelayMs -= deltaTime * 1000;
      if (this.enemyTurnDelayMs <= 0) {
        this.resolveEnemyAction();
      }
      return;
    }

    if (this.battleState.phase === "victory" || this.battleState.phase === "defeat") {
      if (
        this.options.inputManager.isActionStarted("confirm") ||
        this.options.inputManager.isActionStarted("cancel")
      ) {
        if (this.battleState.phase === "victory") {
          this.completeVictory();
        } else {
          this.returnToExploreAfterDefeat();
        }
      }
      return;
    }

    if (this.battleState.phase === "targetSelect") {
      if (this.options.inputManager.isActionStarted("cancel")) {
        this.cancelTargetSelection();
      } else if (this.options.inputManager.isActionStarted("confirm")) {
        const firstTarget = getAliveEnemies(this.battleState)[0];
        if (firstTarget) {
          this.confirmTarget(firstTarget.instanceId);
        }
      }
      return;
    }

    this.handleCardKeyboardInput();
  }

  render(ctx: CanvasRenderingContext2D): void {
    const { canvas } = ctx;
    const shake = this.screenShake.getOffset();

    ctx.save();
    ctx.translate(shake.x, shake.y);
    this.renderBackground(ctx, canvas.width, canvas.height);

    if (this.battleState) {
      this.renderActors(ctx);
      this.renderBattleHeader(ctx);
      this.renderVisualEffect(ctx);
    } else {
      this.renderMissingBattleFallback(ctx);
    }

    ctx.restore();
  }

  exit(): void {
    this.options.uiRoot.innerHTML = "";
  }

  private renderBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const backgroundAssetId =
      this.battleParams?.returnLocationId === "castle" || this.battleParams?.isBoss
        ? "bg_castle_battle"
        : "bg_dogo_battle";

    this.options.assetLoader.drawImageOrFallback(ctx, backgroundAssetId, 0, 0, width, height, "battle");

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "rgba(22, 26, 45, 0.18)");
    gradient.addColorStop(0.55, "rgba(48, 35, 38, 0.12)");
    gradient.addColorStop(1, "rgba(32, 21, 22, 0.42)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  private renderActors(ctx: CanvasRenderingContext2D): void {
    if (!this.battleState) {
      return;
    }

    const hime = getPartyLeader(this.battleState);
    if (hime) {
      const layout = this.getActorLayout(hime);
      this.renderActor(ctx, hime, layout);
      this.options.assetLoader.drawImageOrFallback(ctx, "shiro_idle", 324, 262, 78, 78, "shiro");
    }

    for (const enemy of this.battleState.enemies) {
      const layout = this.getActorLayout(enemy);
      this.renderActor(ctx, enemy, layout);
    }
  }

  private renderActor(ctx: CanvasRenderingContext2D, actor: BattleActor, layout: ActorLayout): void {
    const centerX = layout.x + layout.width / 2;
    const footY = layout.y + layout.height - 8;
    const isDefeated = actor.hp <= 0;
    const isTargeted =
      this.battleState?.phase === "targetSelect" &&
      actor.actorType !== "player" &&
      actor.actorType !== "ally";

    drawEllipseShadow(ctx, centerX, footY, layout.width * 0.62, 28, isDefeated ? 0.08 : 0.22);

    ctx.save();
    if (isDefeated) {
      ctx.globalAlpha = 0.35;
    }

    const floatOffset =
      actor.actorType === "enemy" || actor.actorType === "boss"
        ? Math.sin(this.elapsedMs / 420 + layout.x * 0.01) * 4
        : Math.sin(this.elapsedMs / 540) * 3;

    this.options.assetLoader.drawImageOrFallback(
      ctx,
      actor.assetId ?? actor.characterId,
      layout.x,
      layout.y + floatOffset,
      layout.width,
      layout.height,
      actor.name
    );
    ctx.restore();

    if (isTargeted && !isDefeated) {
      ctx.save();
      ctx.strokeStyle = "rgba(255, 223, 103, 0.9)";
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.ellipse(centerX, footY - layout.height * 0.42, layout.width * 0.58, layout.height * 0.42, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    this.renderHpBar(ctx, actor, centerX - 62, layout.y - 34, 124);
  }

  private renderHpBar(
    ctx: CanvasRenderingContext2D,
    actor: BattleActor,
    x: number,
    y: number,
    width: number
  ): void {
    const ratio = Math.max(0, Math.min(1, actor.hp / actor.maxHp));

    ctx.save();
    ctx.fillStyle = "rgba(30, 22, 20, 0.68)";
    ctx.fillRect(x, y, width, 24);
    ctx.fillStyle = actor.actorType === "player" ? "#f5a65a" : "#7cc4d8";
    ctx.fillRect(x + 3, y + 3, (width - 6) * ratio, 18);
    ctx.strokeStyle = "rgba(255, 248, 214, 0.86)";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, 24);
    ctx.fillStyle = "#fff8df";
    ctx.font = "600 13px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${actor.name} ${actor.hp}/${actor.maxHp}`, x + width / 2, y + 12);
    ctx.restore();
  }

  private renderBattleHeader(ctx: CanvasRenderingContext2D): void {
    if (!this.battleState || !this.battleParams) {
      return;
    }

    ctx.save();
    ctx.fillStyle = "rgba(42, 29, 33, 0.55)";
    ctx.fillRect(24, 22, 560, 78);
    ctx.strokeStyle = "rgba(255, 232, 166, 0.72)";
    ctx.lineWidth = 2;
    ctx.strokeRect(25, 23, 558, 76);
    ctx.fillStyle = "#fff8df";
    ctx.font = "700 24px sans-serif";
    ctx.fillText(`ターン ${this.battleState.turnCount}`, 48, 52);
    ctx.font = "16px sans-serif";
    ctx.fillText(this.getPhaseLabel(), 48, 78);

    if (this.battleState.sealGauge) {
      const gauge = this.battleState.sealGauge;
      const ratio = gauge.max === 0 ? 0 : gauge.value / gauge.max;
      ctx.fillStyle = "rgba(28, 20, 32, 0.7)";
      ctx.fillRect(796, 28, 330, 30);
      ctx.fillStyle = "#ffe37b";
      ctx.fillRect(800, 32, 322 * ratio, 22);
      ctx.strokeStyle = "rgba(255, 248, 224, 0.86)";
      ctx.strokeRect(796, 28, 330, 30);
      ctx.fillStyle = "#fff8df";
      ctx.font = "600 15px sans-serif";
      ctx.fillText(`星封じ ${gauge.value}/${gauge.max}`, 814, 80);
    }

    ctx.restore();
  }

  private renderVisualEffect(ctx: CanvasRenderingContext2D): void {
    if (!this.visualEffect || !this.battleState) {
      return;
    }

    const target = getActorByInstanceId(this.battleState, this.visualEffect.targetInstanceId);
    if (!target) {
      return;
    }

    const layout = this.getActorLayout(target);
    const x = layout.x + layout.width / 2;
    const y = layout.y + layout.height * 0.42;
    const progress = this.visualEffect.ageMs / this.visualEffect.durationMs;

    if (this.visualEffect.kind === "heal" || this.visualEffect.kind === "guard") {
      drawHealMistEffect(ctx, x, y, progress, 76);
    } else if (this.visualEffect.kind === "seal") {
      drawSealLightEffect(ctx, x, y, progress, 92);
    } else {
      drawStarHitEffect(ctx, x, y, progress, 68);
    }
  }

  private renderMissingBattleFallback(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.fillStyle = "rgba(26, 18, 22, 0.62)";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = "#fff8e9";
    ctx.font = "700 32px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("バトル情報がありません", ctx.canvas.width / 2, 320);
    ctx.font = "18px sans-serif";
    ctx.fillText("Enterで探索へ戻ります", ctx.canvas.width / 2, 362);
    ctx.restore();
  }

  private renderUi(): void {
    this.options.uiRoot.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "battle-ui";

    const messagePanel = document.createElement("section");
    messagePanel.className = "battle-message-panel";
    messagePanel.innerHTML = this.messages
      .slice(-3)
      .map((message) => `<p>${message}</p>`)
      .join("");

    const commandPanel = document.createElement("section");
    commandPanel.className = "battle-command-panel";

    if (this.battleState) {
      commandPanel.append(this.createStatusSummary());

      if (this.battleState.phase === "targetSelect") {
        commandPanel.append(this.createTargetSelectUi());
      } else if (this.battleState.phase === "victory") {
        commandPanel.append(this.createEndBattleButton("探索へ戻る", () => this.completeVictory()));
      } else if (this.battleState.phase === "defeat") {
        commandPanel.append(this.createEndBattleButton("入口へ戻る", () => this.returnToExploreAfterDefeat()));
      } else {
        commandPanel.append(this.createCardHandUi());
      }
    } else {
      commandPanel.append(this.createEndBattleButton("探索へ戻る", () => this.returnToExploreAfterDefeat()));
    }

    wrapper.append(messagePanel, commandPanel);
    this.options.uiRoot.append(wrapper);
  }

  private createStatusSummary(): HTMLElement {
    const summary = document.createElement("div");
    summary.className = "battle-status-summary";
    const hime = this.battleState ? getPartyLeader(this.battleState) : undefined;
    const aliveEnemyCount = this.battleState ? getAliveEnemies(this.battleState).length : 0;

    summary.innerHTML = `
      <span>ひめ HP ${hime?.hp ?? 0}/${hime?.maxHp ?? 0}</span>
      <span>MP ${hime?.mp ?? 0}/${hime?.maxMp ?? 0}</span>
      <span>敵 ${aliveEnemyCount}</span>
    `;
    return summary;
  }

  private createCardHandUi(): HTMLElement {
    const hand = document.createElement("div");
    hand.className = "battle-card-hand";

    if (!this.battleState || this.battleState.phase !== "playerCommand") {
      const waiting = document.createElement("p");
      waiting.className = "battle-waiting-text";
      waiting.textContent = this.getPhaseLabel();
      hand.append(waiting);
      return hand;
    }

    const cards = getAvailableBattleCards(this.battleState);
    cards.slice(0, 6).forEach((card, index) => {
      const button = document.createElement("button");
      button.className = "battle-card-button";
      button.type = "button";
      button.disabled = !canUseCard(this.battleState as BattleState, card);
      button.addEventListener("click", () => this.selectCard(card));

      const imageSrc = this.options.assetLoader.getImageAsset(card.assetId)?.src;
      button.innerHTML = `
        <span class="battle-card-number">${index + 1}</span>
        ${imageSrc ? `<img src="${imageSrc}" alt="">` : ""}
        <span class="battle-card-name">${card.shortName}</span>
        <span class="battle-card-cost">MP ${card.mpCost}</span>
      `;

      hand.append(button);
    });

    return hand;
  }

  private createTargetSelectUi(): HTMLElement {
    const panel = document.createElement("div");
    panel.className = "battle-target-panel";

    const title = document.createElement("p");
    title.className = "battle-target-title";
    const selectedCard = this.selectedCardId ? getBattleCard(this.selectedCardId) : undefined;
    title.textContent = selectedCard
      ? `${selectedCard.name} の対象を選んでください`
      : "対象を選んでください";
    panel.append(title);

    if (this.battleState) {
      getAliveEnemies(this.battleState).forEach((enemy) => {
        const button = document.createElement("button");
        button.className = "battle-target-button";
        button.type = "button";
        button.textContent = `${enemy.name} HP ${enemy.hp}/${enemy.maxHp}`;
        button.addEventListener("click", () => this.confirmTarget(enemy.instanceId));
        panel.append(button);
      });
    }

    const cancelButton = document.createElement("button");
    cancelButton.className = "battle-sub-button";
    cancelButton.type = "button";
    cancelButton.textContent = "カード選択へ戻る";
    cancelButton.addEventListener("click", () => this.cancelTargetSelection());
    panel.append(cancelButton);

    return panel;
  }

  private createEndBattleButton(label: string, onClick: () => void): HTMLElement {
    const button = document.createElement("button");
    button.className = "battle-end-button";
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", onClick);
    return button;
  }

  private selectCard(card: BattleCardData): void {
    if (!this.battleState || !canUseCard(this.battleState, card)) {
      return;
    }

    if (requiresTargetSelection(this.battleState, card)) {
      this.selectedCardId = card.id;
      this.battleState = {
        ...this.battleState,
        phase: "targetSelect"
      };
      this.messages = [`${card.name} の対象を選んでください。`];
      this.renderUi();
      return;
    }

    this.applyCard(card.id);
  }

  private confirmTarget(targetInstanceId: string): void {
    if (!this.selectedCardId) {
      return;
    }

    this.applyCard(this.selectedCardId, targetInstanceId);
  }

  private cancelTargetSelection(): void {
    if (!this.battleState) {
      return;
    }

    this.battleState = {
      ...this.battleState,
      phase: "playerCommand"
    };
    this.selectedCardId = null;
    this.messages = ["カードを選び直してください。"];
    this.renderUi();
  }

  private applyCard(cardId: CardId, targetInstanceId?: string): void {
    if (!this.battleState) {
      return;
    }

    const result = applyBattleCard(this.battleState, cardId, targetInstanceId);
    this.battleState = result.state;
    this.messages = result.logs;
    this.selectedCardId = null;
    this.startVisualEffect(result.effect);

    if (isBattleVictory(this.battleState)) {
      this.battleState = { ...this.battleState, phase: "victory" };
      this.messages = [...this.messages, "敵はすべてしずまりました。"];
    } else if (this.battleState.phase === "enemyAction") {
      this.enemyTurnDelayMs = 720;
    }

    this.renderUi();
  }

  private resolveEnemyAction(): void {
    if (!this.battleState) {
      return;
    }

    const result = resolveEnemyTurn(this.battleState);
    this.battleState = result.state;
    this.messages = result.logs;
    this.startVisualEffect(result.effect);

    if (isBattleDefeat(this.battleState)) {
      this.battleState = { ...this.battleState, phase: "defeat" };
    }

    this.renderUi();
  }

  private handleCardKeyboardInput(): void {
    if (!this.battleState || this.battleState.phase !== "playerCommand") {
      return;
    }

    const cards = getAvailableBattleCards(this.battleState);
    const actionIndex = CARD_ACTIONS.findIndex((action) =>
      this.options.inputManager.isActionStarted(action)
    );

    if (actionIndex < 0) {
      return;
    }

    const card = cards[actionIndex];
    if (card) {
      this.selectCard(card);
    }
  }

  private completeVictory(): void {
    if (!this.saveData || !this.battleParams || !this.battleState) {
      this.returnToExploreAfterDefeat();
      return;
    }

    const hime = getPartyLeader(this.battleState);
    const symbol = getEnemySymbolById(this.battleParams.enemySymbolId);
    const defeatedEnemyIds = Array.from(
      new Set([...this.saveData.defeatedEnemyIds, this.battleParams.enemySymbolId])
    );
    const flags = {
      ...this.saveData.flags,
      ...(symbol ? { [symbol.defeatedFlag]: true } : {})
    };
    const openedPaths =
      symbol?.openedPathFlag && !this.saveData.openedPaths.includes(symbol.openedPathFlag)
        ? [...this.saveData.openedPaths, symbol.openedPathFlag]
        : this.saveData.openedPaths;

    const nextSave = this.options.saveManager.save({
      ...this.saveData,
      currentScreenId: "explore",
      currentLocationId: this.battleParams.returnLocationId,
      currentAreaId: this.battleParams.returnAreaId,
      hp: Math.max(1, hime?.hp ?? this.saveData.hp),
      mp: Math.max(0, hime?.mp ?? this.saveData.mp),
      defeatedEnemyIds,
      openedPaths,
      flags,
      lastSynopsis: `${symbol?.label ?? "敵"}をしずめました。`
    });

    this.options.screenManager.change("explore", {
      saveData: nextSave,
      locationId: this.battleParams.returnLocationId,
      areaId: this.battleParams.returnAreaId
    });
  }

  private returnToExploreAfterDefeat(): void {
    const saveData = this.saveData ?? this.options.saveManager.createInitialSaveData();
    const returnLocationId = this.battleParams?.returnLocationId ?? saveData.currentLocationId ?? "dogo";
    const returnAreaId = this.battleParams?.returnAreaId ?? saveData.currentAreaId ?? "D0";

    const nextSave = this.options.saveManager.save({
      ...saveData,
      currentScreenId: "explore",
      currentLocationId: returnLocationId,
      currentAreaId: returnAreaId,
      hp: saveData.maxHp,
      mp: Math.max(saveData.mp, Math.min(saveData.maxMp, 4)),
      lastSynopsis: "ひめはいったん探索地点へ戻りました。"
    });

    this.options.screenManager.change("explore", {
      saveData: nextSave,
      locationId: returnLocationId,
      areaId: returnAreaId
    });
  }

  private startVisualEffect(effect?: { kind: BattleVisualEffect["kind"]; sourceInstanceId: string; targetInstanceId: string }): void {
    if (!effect) {
      return;
    }

    this.visualEffect = {
      ...effect,
      ageMs: 0,
      durationMs: effect.kind === "guard" || effect.kind === "heal" ? 760 : 620
    };

    if (effect.kind === "enemyAttack" || effect.kind === "attack" || effect.kind === "seal") {
      this.screenShake.start(effect.kind === "enemyAttack" ? 180 : 120, effect.kind === "seal" ? 7 : 4);
    }
  }

  private updateVisualEffect(deltaTime: number): void {
    if (!this.visualEffect) {
      return;
    }

    const ageMs = this.visualEffect.ageMs + deltaTime * 1000;
    if (ageMs >= this.visualEffect.durationMs) {
      this.visualEffect = null;
      return;
    }

    this.visualEffect = {
      ...this.visualEffect,
      ageMs
    };
  }

  private getActorLayout(actor: BattleActor): ActorLayout {
    if (actor.actorType === "player" || actor.actorType === "ally") {
      return { x: 158, y: 322, width: 188, height: 188 };
    }

    const enemyCount = this.battleState?.enemies.length ?? 1;
    const enemyIndex = this.battleState?.enemies.findIndex((enemy) => enemy.instanceId === actor.instanceId) ?? 0;

    if (actor.actorType === "boss") {
      return { x: 808, y: 196, width: 270, height: 320 };
    }

    if (enemyCount <= 1) {
      return { x: 842, y: 286, width: 194, height: 194 };
    }

    return enemyIndex === 0
      ? { x: 748, y: 282, width: 178, height: 178 }
      : { x: 976, y: 328, width: 168, height: 168 };
  }

  private getPhaseLabel(): string {
    if (!this.battleState) {
      return "バトル情報なし";
    }

    switch (this.battleState.phase) {
      case "playerCommand":
        return "カードを選ぶ";
      case "targetSelect":
        return "対象を選ぶ";
      case "enemyAction":
        return "敵の行動";
      case "victory":
        return "勝利";
      case "defeat":
        return "撤退";
      case "actorAction":
      default:
        return "行動中";
    }
  }
}

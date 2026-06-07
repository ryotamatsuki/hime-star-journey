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

const BASE_WIDTH = 1280;
const BASE_HEIGHT = 720;

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
  private canvasWidth = BASE_WIDTH;
  private canvasHeight = BASE_HEIGHT;
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
    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;

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

    const topVignette = ctx.createLinearGradient(0, 0, 0, height);
    topVignette.addColorStop(0, "rgba(11, 18, 38, 0.28)");
    topVignette.addColorStop(0.45, "rgba(38, 28, 28, 0.04)");
    topVignette.addColorStop(1, "rgba(35, 20, 16, 0.34)");
    ctx.fillStyle = topVignette;
    ctx.fillRect(0, 0, width, height);

    const bottomPanelShade = ctx.createLinearGradient(0, height * 0.72, 0, height);
    bottomPanelShade.addColorStop(0, "rgba(48, 29, 18, 0)");
    bottomPanelShade.addColorStop(1, "rgba(42, 25, 19, 0.38)");
    ctx.fillStyle = bottomPanelShade;
    ctx.fillRect(0, height * 0.7, width, height * 0.3);
  }

  private renderActors(ctx: CanvasRenderingContext2D): void {
    if (!this.battleState) {
      return;
    }

    const hime = getPartyLeader(this.battleState);
    const renderables: Array<{ actor: BattleActor; layout: ActorLayout }> = [];

    if (hime) {
      renderables.push({ actor: hime, layout: this.getActorLayout(hime) });
    }

    for (const enemy of this.battleState.enemies) {
      renderables.push({ actor: enemy, layout: this.getActorLayout(enemy) });
    }

    renderables
      .sort((a, b) => a.layout.y + a.layout.height - (b.layout.y + b.layout.height))
      .forEach(({ actor, layout }) => this.renderActor(ctx, actor, layout));

    if (hime) {
      this.renderShiro(ctx);
    }
  }

  private renderShiro(ctx: CanvasRenderingContext2D): void {
    const t = this.elapsedMs / 1000;
    const x = this.toScreenX(348 + Math.cos(t * 1.1) * 5);
    const y = this.toScreenY(392 + Math.sin(t * 2.1) * 9);
    const width = this.toScreenWidth(70);
    const height = this.toScreenHeight(70);

    ctx.save();
    ctx.globalAlpha = 0.9;
    this.options.assetLoader.drawImageOrFallback(ctx, "shiro_idle", x, y, width, height, "シロ");
    ctx.restore();
  }

  private renderActor(ctx: CanvasRenderingContext2D, actor: BattleActor, layout: ActorLayout): void {
    const x = this.toScreenX(layout.x);
    const y = this.toScreenY(layout.y);
    const width = this.toScreenWidth(layout.width);
    const height = this.toScreenHeight(layout.height);
    const centerX = x + width / 2;
    const footY = y + height - this.toScreenHeight(10);
    const isDefeated = actor.hp <= 0;
    const isEnemy = actor.actorType === "enemy" || actor.actorType === "boss";
    const aliveEnemyIndex =
      this.battleState && isEnemy
        ? getAliveEnemies(this.battleState).findIndex((enemy) => enemy.instanceId === actor.instanceId)
        : -1;

    drawEllipseShadow(ctx, centerX, footY, width * 0.62, this.toScreenHeight(isEnemy ? 30 : 34), isDefeated ? 0.08 : 0.24);

    ctx.save();
    if (isDefeated) {
      ctx.globalAlpha = 0.28;
    }

    const floatOffset =
      isEnemy
        ? Math.sin(this.elapsedMs / 420 + layout.x * 0.01) * this.toScreenHeight(4)
        : Math.sin(this.elapsedMs / 760) * this.toScreenHeight(3);

    this.options.assetLoader.drawImageOrFallback(
      ctx,
      actor.assetId ?? actor.characterId,
      x,
      y + floatOffset,
      width,
      height,
      actor.name
    );
    ctx.restore();

    if (isEnemy && this.battleState?.phase === "targetSelect" && !isDefeated) {
      this.renderTargetMarker(ctx, centerX, y, width, height, aliveEnemyIndex);
    }

    this.renderActorStatus(ctx, actor, layout);
  }

  private renderTargetMarker(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    y: number,
    width: number,
    height: number,
    aliveEnemyIndex: number
  ): void {
    const pulse = 1 + Math.sin(this.elapsedMs / 170) * 0.05;
    const markerY = y + height * 0.44;

    ctx.save();
    ctx.strokeStyle = "rgba(255, 223, 103, 0.95)";
    ctx.fillStyle = "rgba(255, 244, 182, 0.1)";
    ctx.lineWidth = this.toScreenWidth(4);
    ctx.setLineDash([this.toScreenWidth(9), this.toScreenWidth(7)]);
    ctx.beginPath();
    ctx.ellipse(centerX, markerY, width * 0.58 * pulse, height * 0.42 * pulse, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);

    if (aliveEnemyIndex >= 0) {
      const badgeSize = this.toScreenWidth(34);
      const badgeX = centerX - badgeSize / 2;
      const badgeY = y - this.toScreenHeight(42);
      ctx.fillStyle = "rgba(74, 46, 21, 0.88)";
      ctx.strokeStyle = "rgba(255, 229, 126, 0.95)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, badgeY + badgeSize / 2, badgeSize / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#fff7d3";
      ctx.font = `700 ${Math.round(this.toScreenWidth(18))}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(aliveEnemyIndex + 1), badgeX + badgeSize / 2, badgeY + badgeSize / 2);
    }
    ctx.restore();
  }

  private renderActorStatus(ctx: CanvasRenderingContext2D, actor: BattleActor, layout: ActorLayout): void {
    const isPlayer = actor.actorType === "player" || actor.actorType === "ally";
    const width = isPlayer ? 220 : 190;
    const x = isPlayer ? layout.x + 8 : layout.x + layout.width / 2 - width / 2;
    const y = isPlayer ? layout.y - 82 : layout.y - 68;
    const screenX = this.toScreenX(x);
    const screenY = this.toScreenY(y);
    const screenWidth = this.toScreenWidth(width);
    const hpRatio = Math.max(0, Math.min(1, actor.hp / actor.maxHp));

    ctx.save();
    ctx.fillStyle = "rgba(42, 27, 23, 0.78)";
    ctx.strokeStyle = "rgba(255, 226, 154, 0.82)";
    ctx.lineWidth = 2;
    this.roundRect(ctx, screenX, screenY, screenWidth, this.toScreenHeight(isPlayer ? 58 : 48), this.toScreenWidth(8));
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#fff5d7";
    ctx.font = `700 ${Math.round(this.toScreenWidth(isPlayer ? 16 : 15))}px sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(actor.name, screenX + this.toScreenWidth(12), screenY + this.toScreenHeight(15));

    const barX = screenX + this.toScreenWidth(12);
    const barY = screenY + this.toScreenHeight(isPlayer ? 28 : 25);
    const barWidth = screenWidth - this.toScreenWidth(24);
    this.renderMeter(ctx, barX, barY, barWidth, this.toScreenHeight(10), hpRatio, "#e65e52", "rgba(42, 20, 18, 0.75)");

    ctx.fillStyle = "#fff5d7";
    ctx.font = `700 ${Math.round(this.toScreenWidth(12))}px sans-serif`;
    ctx.textAlign = "right";
    ctx.fillText(`HP ${actor.hp}/${actor.maxHp}`, screenX + screenWidth - this.toScreenWidth(12), barY + this.toScreenHeight(5));

    if (isPlayer) {
      const mpRatio = actor.maxMp === 0 ? 0 : Math.max(0, Math.min(1, actor.mp / actor.maxMp));
      const mpY = screenY + this.toScreenHeight(42);
      this.renderMeter(ctx, barX, mpY, barWidth, this.toScreenHeight(8), mpRatio, "#6fa7e8", "rgba(18, 28, 45, 0.72)");
      ctx.fillStyle = "#fff5d7";
      ctx.fillText(`MP ${actor.mp}/${actor.maxMp}`, screenX + screenWidth - this.toScreenWidth(12), mpY + this.toScreenHeight(4));
    }

    if (actor.hp <= 0) {
      ctx.fillStyle = "rgba(255, 246, 211, 0.86)";
      ctx.font = `800 ${Math.round(this.toScreenWidth(14))}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("しずまった", screenX + screenWidth / 2, screenY + this.toScreenHeight(isPlayer ? 72 : 62));
    }

    ctx.restore();
  }

  private renderMeter(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    ratio: number,
    fill: string,
    background: string
  ): void {
    ctx.fillStyle = background;
    this.roundRect(ctx, x, y, width, height, height / 2);
    ctx.fill();
    ctx.fillStyle = fill;
    this.roundRect(ctx, x, y, width * ratio, height, height / 2);
    ctx.fill();
  }

  private renderBattleHeader(ctx: CanvasRenderingContext2D): void {
    if (!this.battleState) {
      return;
    }

    const x = this.toScreenX(440);
    const y = this.toScreenY(20);
    const width = this.toScreenWidth(400);
    const height = this.toScreenHeight(this.battleState.sealGauge ? 84 : 58);

    ctx.save();
    ctx.fillStyle = "rgba(42, 29, 33, 0.64)";
    ctx.strokeStyle = "rgba(255, 232, 166, 0.72)";
    ctx.lineWidth = 2;
    this.roundRect(ctx, x, y, width, height, this.toScreenWidth(8));
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fff8df";
    ctx.font = `700 ${Math.round(this.toScreenWidth(20))}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`ターン ${this.battleState.turnCount} ${this.getPhaseLabel()}`, x + width / 2, y + this.toScreenHeight(29));

    if (this.battleState.sealGauge) {
      const gauge = this.battleState.sealGauge;
      const ratio = gauge.max === 0 ? 0 : gauge.value / gauge.max;
      const gaugeX = x + this.toScreenWidth(46);
      const gaugeY = y + this.toScreenHeight(53);
      this.renderMeter(ctx, gaugeX, gaugeY, width - this.toScreenWidth(92), this.toScreenHeight(12), ratio, "#ffe37b", "rgba(30, 20, 34, 0.78)");
      ctx.fillStyle = "#fff8df";
      ctx.font = `700 ${Math.round(this.toScreenWidth(13))}px sans-serif`;
      ctx.fillText(`星封じ ${gauge.value}/${gauge.max}`, x + width / 2, gaugeY + this.toScreenHeight(6));
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
    const x = this.toScreenX(layout.x + layout.width / 2);
    const y = this.toScreenY(layout.y + layout.height * 0.42);
    const progress = this.visualEffect.ageMs / this.visualEffect.durationMs;

    if (this.visualEffect.kind === "heal" || this.visualEffect.kind === "guard") {
      drawHealMistEffect(ctx, x, y, progress, this.toScreenWidth(70));
    } else if (this.visualEffect.kind === "seal") {
      drawSealLightEffect(ctx, x, y, progress, this.toScreenWidth(86));
    } else {
      drawStarHitEffect(ctx, x, y, progress, this.toScreenWidth(58));
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

    const cardFrameImage = this.options.assetLoader.getImage("ui_card_frame")?.src;
    if (cardFrameImage) {
      wrapper.style.setProperty("--battle-card-frame-image", `url("${cardFrameImage}")`);
    }

    const messagePanel = document.createElement("section");
    messagePanel.className = "battle-message-panel";
    for (const message of this.messages.slice(-3)) {
      const paragraph = document.createElement("p");
      paragraph.textContent = message;
      messagePanel.append(paragraph);
    }

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

    const hp = document.createElement("span");
    hp.textContent = `ひめ HP ${hime?.hp ?? 0}/${hime?.maxHp ?? 0}`;
    const mp = document.createElement("span");
    mp.textContent = `MP ${hime?.mp ?? 0}/${hime?.maxMp ?? 0}`;
    const enemy = document.createElement("span");
    enemy.textContent = `敵 ${aliveEnemyCount}`;

    summary.append(hp, mp, enemy);
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
      const canUse = canUseCard(this.battleState as BattleState, card);
      button.className = "battle-card-button";
      button.type = "button";
      button.disabled = !canUse;
      button.title = canUse ? card.description : `MPが足りないか、今は使えません。${card.description}`;
      button.addEventListener("click", () => this.selectCard(card));

      const number = document.createElement("span");
      number.className = "battle-card-number";
      number.textContent = String(index + 1);

      const image = document.createElement("img");
      image.alt = "";
      image.src = this.options.assetLoader.getImage(card.assetId)?.src ?? "";
      image.className = "battle-card-icon";

      const name = document.createElement("span");
      name.className = "battle-card-name";
      name.textContent = card.shortName;

      const description = document.createElement("span");
      description.className = "battle-card-description";
      description.textContent = card.description;

      const cost = document.createElement("span");
      cost.className = "battle-card-cost";
      cost.textContent = card.mpCost === 0 ? "MP 0" : `MP ${card.mpCost}`;

      button.append(number, image, name, description, cost);
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
      ? `${selectedCard.name} の対象を選んでね`
      : "対象を選んでね";
    panel.append(title);

    if (this.battleState) {
      getAliveEnemies(this.battleState).forEach((enemy, index) => {
        const button = document.createElement("button");
        button.className = "battle-target-button";
        button.type = "button";
        button.textContent = `${index + 1}. ${enemy.name} HP ${enemy.hp}/${enemy.maxHp}`;
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
      this.messages = [`${card.name} の対象を選んでね。`, "数字キー1〜2、または敵のボタンで選べます。"];
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
    this.messages = ["カードを選び直してね。"];
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
      lastSynopsis: "ひめは探索地点へ戻りました。"
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
      durationMs: effect.kind === "guard" || effect.kind === "heal" ? 700 : 560
    };

    if (effect.kind === "enemyAttack" || effect.kind === "attack" || effect.kind === "seal") {
      this.screenShake.start(effect.kind === "enemyAttack" ? 140 : 100, effect.kind === "seal" ? 5 : 3);
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
      return { x: 218, y: 278, width: 190, height: 292 };
    }

    const enemyCount = this.battleState?.enemies.length ?? 1;
    const enemyIndex = this.battleState?.enemies.findIndex((enemy) => enemy.instanceId === actor.instanceId) ?? 0;

    if (actor.actorType === "boss") {
      return { x: 805, y: 182, width: 270, height: 320 };
    }

    if (enemyCount <= 1) {
      return { x: 870, y: 258, width: 210, height: 210 };
    }

    return enemyIndex === 0
      ? { x: 768, y: 232, width: 190, height: 190 }
      : { x: 988, y: 316, width: 178, height: 178 };
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
        return "退却";
      case "actorAction":
      default:
        return "行動中";
    }
  }

  private toScreenX(value: number): number {
    return (value / BASE_WIDTH) * this.getCanvasWidth();
  }

  private toScreenY(value: number): number {
    return (value / BASE_HEIGHT) * this.getCanvasHeight();
  }

  private toScreenWidth(value: number): number {
    return (value / BASE_WIDTH) * this.getCanvasWidth();
  }

  private toScreenHeight(value: number): number {
    return (value / BASE_HEIGHT) * this.getCanvasHeight();
  }

  private getCanvasWidth(): number {
    return this.canvasWidth;
  }

  private getCanvasHeight(): number {
    return this.canvasHeight;
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    const cappedRadius = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + cappedRadius, y);
    ctx.lineTo(x + width - cappedRadius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + cappedRadius);
    ctx.lineTo(x + width, y + height - cappedRadius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - cappedRadius, y + height);
    ctx.lineTo(x + cappedRadius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - cappedRadius);
    ctx.lineTo(x, y + cappedRadius);
    ctx.quadraticCurveTo(x, y, x + cappedRadius, y);
  }
}

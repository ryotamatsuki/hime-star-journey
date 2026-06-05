import { renderDepthSorted, type Renderable } from "../systems/RenderDepthSystem";
import { AssetLoader } from "../core/AssetLoader";
import { Camera } from "../core/Camera";
import { InputManager } from "../core/InputManager";
import { SaveManager } from "../core/SaveManager";
import { ScreenManager } from "../core/ScreenManager";
import { Companion } from "../entities/Companion";
import { EnemySymbol } from "../entities/EnemySymbol";
import { Interactable } from "../entities/Interactable";
import { Player } from "../entities/Player";
import { getEnemySymbolsForArea } from "../data/enemySymbols";
import { getEncounterById } from "../data/encounters";
import { getInteractablesForArea } from "../data/interactables";
import { dogoArea, getMapArea, type MapAreaData, type WalkablePolygon } from "../data/maps";
import { expandRect, intersects, type Rect } from "../systems/CollisionSystem";
import type { BattleStartParams } from "../types/battle";
import type { GameScreen, ScreenId } from "../types/game";
import type { SaveData } from "../types/save";

type ExploreScreenOptions = {
  uiRoot: HTMLElement;
  screenManager: ScreenManager;
  saveManager: SaveManager;
  inputManager: InputManager;
  assetLoader: AssetLoader;
};

type ExploreScreenParams = {
  saveData?: SaveData;
  locationId?: string;
  areaId?: string;
};

type EnemyContactInfo = {
  enemySymbolId: string;
  encounterId: string;
  encounterName: string;
};

const PATH_GUIDE_DURATION_MS = 2800;

export class ExploreScreen implements GameScreen {
  readonly id: ScreenId = "explore";

  private saveData: SaveData | null = null;
  private area: MapAreaData = dogoArea;
  private camera = new Camera(1280, 720, dogoArea.worldWidth, dogoArea.worldHeight);
  private player = new Player(dogoArea.playerStart.x, dogoArea.playerStart.y);
  private companion = new Companion(dogoArea.playerStart.x + 62, dogoArea.playerStart.y - 42);
  private enemySymbols: EnemySymbol[] = [];
  private interactables: Interactable[] = [];
  private nearbyInteractable: Interactable | null = null;
  private message = "道後温泉に着いた。湯けむり通りをすすもう。";
  private transitioningToBattle = false;
  private elapsedTimeMs = 0;
  private lastEnemyContact: EnemyContactInfo | null = null;
  private debugOverlayVisible = false;
  private pathGuideRemainingMs = 0;
  private messageElement: HTMLElement | null = null;
  private nearbyElement: HTMLElement | null = null;
  private statusElement: HTMLElement | null = null;
  private miniMapElement: HTMLElement | null = null;
  private pathGuideButton: HTMLButtonElement | null = null;

  constructor(private readonly options: ExploreScreenOptions) {}

  enter(params?: unknown): void {
    const typedParams = params as ExploreScreenParams | undefined;
    const loadedSave = typedParams?.saveData ?? this.options.saveManager.load();
    const nextSave = loadedSave ?? this.options.saveManager.createInitialSaveData();
    const locationId = typedParams?.locationId ?? nextSave.currentLocationId;
    const areaId = typedParams?.areaId ?? nextSave.currentAreaId;

    this.area = getMapArea(locationId, areaId);
    this.camera.setWorldSize(this.area.worldWidth, this.area.worldHeight);
    this.saveData = this.options.saveManager.save({
      ...nextSave,
      currentScreenId: "explore",
      currentChapterId: "dogo_explore",
      currentLocationId: this.area.locationId,
      currentAreaId: this.area.id
    });

    this.player = new Player(this.area.playerStart.x, this.area.playerStart.y);
    this.companion = new Companion(this.player.x + 62, this.player.y - 42);
    this.camera.follow(this.player.x, this.player.y);
    this.enemySymbols = getEnemySymbolsForArea(this.area.locationId, this.area.id)
      .map((symbol) => new EnemySymbol(symbol))
      .filter((symbol) => !this.saveData || !symbol.isDefeated(this.saveData));
    this.interactables = getInteractablesForArea(this.area.locationId, this.area.id).map(
      (interactable) => new Interactable(interactable, (target) => this.showMessage(target.message))
    );
    this.transitioningToBattle = false;
    this.nearbyInteractable = null;
    this.lastEnemyContact = null;
    this.debugOverlayVisible = false;
    this.pathGuideRemainingMs = 0;
    this.message = "道後温泉に着いた。湯けむり通りをすすもう。";
    this.renderUi();
    this.updateUi();
  }

  update(deltaTime: number): void {
    if (!this.saveData) {
      return;
    }

    this.elapsedTimeMs += deltaTime * 1000;

    if (this.options.inputManager.isActionStarted("cancel")) {
      this.options.screenManager.change("title");
      return;
    }

    if (this.options.inputManager.isActionStarted("map")) {
      this.goToStarMap();
      return;
    }

    if (this.options.inputManager.isActionStarted("debugOverlay")) {
      this.debugOverlayVisible = !this.debugOverlayVisible;
      this.updateUi();
    }

    if (this.options.inputManager.isActionStarted("pathGuide")) {
      this.showPathGuide();
    }

    this.pathGuideRemainingMs = Math.max(0, this.pathGuideRemainingMs - deltaTime * 1000);

    this.player.update(
      deltaTime,
      this.options.inputManager,
      this.area.collisionRects,
      this.area.cameraBounds
    );
    this.companion.update(deltaTime, this.player);

    for (const enemy of this.enemySymbols) {
      enemy.update(deltaTime);
    }

    this.camera.follow(this.player.x, this.player.y);
    this.nearbyInteractable = this.findNearbyInteractable();

    if (this.nearbyInteractable && this.options.inputManager.isActionStarted("confirm")) {
      this.nearbyInteractable.interact();
    }

    const touchedEnemy = this.findTouchedEnemy();
    if (touchedEnemy) {
      this.startBattle(touchedEnemy);
      return;
    }

    this.updateUi();
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.camera.resize(ctx.canvas.width, ctx.canvas.height);
    this.camera.follow(this.player.x, this.player.y);

    ctx.imageSmoothingEnabled = true;
    this.renderMapLayer(ctx, this.area.backgroundAssetId, 1);
    this.renderPathGuide(ctx);
    this.renderDepthSortedWorldObjects(ctx);
    this.renderMapLayer(ctx, this.area.foregroundAssetId, 0.86);
    this.renderSteamOverlay(ctx);
    this.renderDebugOverlay(ctx);
  }

  exit(): void {
    this.options.uiRoot.innerHTML = "";
    this.messageElement = null;
    this.nearbyElement = null;
    this.statusElement = null;
    this.miniMapElement = null;
    this.pathGuideButton = null;
  }

  private renderMapLayer(
    ctx: CanvasRenderingContext2D,
    assetId: string | undefined,
    opacity: number,
    sourceOffsetX = 0,
    sourceOffsetY = 0
  ): void {
    const { canvas } = ctx;
    const image = assetId ? this.options.assetLoader.getImage(assetId) : undefined;

    if (!image) {
      this.drawMissingMapLayer(ctx, assetId ?? "missing_map_layer", opacity);
      return;
    }

    const sourceWidth = (this.camera.width / this.area.worldWidth) * image.naturalWidth;
    const sourceHeight = (this.camera.height / this.area.worldHeight) * image.naturalHeight;
    const maxSourceX = Math.max(0, image.naturalWidth - sourceWidth);
    const maxSourceY = Math.max(0, image.naturalHeight - sourceHeight);
    const sourceX = Math.min(
      Math.max(0, ((this.camera.x + sourceOffsetX) / this.area.worldWidth) * image.naturalWidth),
      maxSourceX
    );
    const sourceY = Math.min(
      Math.max(0, ((this.camera.y + sourceOffsetY) / this.area.worldHeight) * image.naturalHeight),
      maxSourceY
    );

    ctx.save();
    ctx.globalAlpha *= opacity;
    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );
    ctx.restore();
  }

  private renderSteamOverlay(ctx: CanvasRenderingContext2D): void {
    const opacity = 0.26 + Math.sin(this.elapsedTimeMs / 1800) * 0.06;
    const driftX = Math.sin(this.elapsedTimeMs / 4200) * 22;
    const driftY = Math.cos(this.elapsedTimeMs / 5200) * 10;

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    this.renderMapLayer(ctx, this.area.overlayAssetId, opacity, driftX, driftY);
    ctx.restore();
  }

  private renderDepthSortedWorldObjects(ctx: CanvasRenderingContext2D): void {
    const renderables: Renderable[] = [
      ...this.interactables.map((interactable): Renderable => ({
        id: interactable.id,
        depthY: interactable.getDepthY(),
        render: (targetCtx) =>
          interactable.render(targetCtx, interactable === this.nearbyInteractable, this.camera)
      })),
      ...this.enemySymbols.map((enemy): Renderable => ({
        id: enemy.symbolId,
        depthY: enemy.getDepthY(),
        render: (targetCtx) => enemy.render(targetCtx, this.options.assetLoader, this.camera)
      })),
      {
        id: "companion_shiro",
        depthY: this.companion.getDepthY(),
        render: (targetCtx) => this.companion.render(targetCtx, this.options.assetLoader, this.camera)
      },
      {
        id: "player_hime",
        depthY: this.player.getDepthY(),
        render: (targetCtx) => this.player.render(targetCtx, this.options.assetLoader, this.camera)
      }
    ];

    renderDepthSorted(ctx, renderables);
  }

  private drawMissingMapLayer(ctx: CanvasRenderingContext2D, label: string, opacity: number): void {
    const { canvas } = ctx;

    ctx.save();
    ctx.globalAlpha *= opacity;
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#26324a");
    gradient.addColorStop(0.55, "#8b6a45");
    gradient.addColorStop(1, "#d3a85d");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(255, 248, 220, 0.82)";
    ctx.font = "700 24px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, canvas.width / 2, canvas.height / 2);
    ctx.restore();
  }

  private renderUi(): void {
    this.options.uiRoot.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "explore-ui";

    const status = document.createElement("section");
    status.className = "explore-status-panel";
    this.statusElement = status;

    const quest = document.createElement("section");
    quest.className = "explore-quest-panel generated-quest-panel";
    const location = document.createElement("p");
    location.className = "ui-kicker";
    location.textContent = "現在地：道後温泉";
    const objective = document.createElement("h2");
    objective.textContent = "湯けむり通りをすすもう";
    const hints = document.createElement("p");
    hints.className = "explore-hints";
    hints.textContent =
      "移動：WASD / 矢印　調べる：Enter / Space　道しるべ：H　開発表示：G　星地図：M　戻る：Esc";
    this.nearbyElement = document.createElement("p");
    this.nearbyElement.className = "nearby-note";
    this.pathGuideButton = document.createElement("button");
    this.pathGuideButton.className = "menu-button explore-guide-button";
    this.pathGuideButton.type = "button";
    this.pathGuideButton.textContent = "道しるべ";
    this.pathGuideButton.addEventListener("click", () => this.showPathGuide());
    const mapButton = document.createElement("button");
    mapButton.className = "menu-button explore-map-button";
    mapButton.type = "button";
    mapButton.textContent = "星地図";
    mapButton.addEventListener("click", () => this.goToStarMap());
    quest.append(location, objective, hints, this.nearbyElement, this.pathGuideButton, mapButton);

    const minimap = document.createElement("section");
    minimap.className = "explore-minimap";
    this.miniMapElement = minimap;

    const message = document.createElement("section");
    message.className = "explore-message";
    this.messageElement = document.createElement("p");
    message.append(this.messageElement);

    wrapper.append(status, quest, minimap, message);
    this.options.uiRoot.append(wrapper);
  }

  private updateUi(): void {
    if (!this.saveData) {
      return;
    }

    if (this.statusElement) {
      const starLevel = Math.max(1, this.saveData.starLevel);
      this.statusElement.innerHTML = `
        <p class="ui-kicker">ひめ</p>
        <h2>星Lv${starLevel}</h2>
        <p>HP ${this.saveData.hp} / ${this.saveData.maxHp}</p>
        <p>MP ${this.saveData.mp} / ${this.saveData.maxMp}</p>
      `;
    }

    if (this.nearbyElement) {
      this.nearbyElement.textContent = this.nearbyInteractable
        ? `近く：${this.nearbyInteractable.label}`
        : "気になる場所に近づくと調べられます。";
    }

    if (this.messageElement) {
      this.messageElement.textContent = this.lastEnemyContact
        ? `接触：${this.lastEnemyContact.enemySymbolId} / ${this.lastEnemyContact.encounterId}`
        : this.message;
    }

    if (this.pathGuideButton) {
      this.pathGuideButton.disabled = this.pathGuideRemainingMs > 0;
      this.pathGuideButton.textContent =
        this.pathGuideRemainingMs > 0 ? "道しるべ表示中" : "道しるべ";
    }

    this.updateMiniMap();
  }

  private updateMiniMap(): void {
    if (!this.miniMapElement) {
      return;
    }

    const playerLeft = (this.player.x / this.area.worldWidth) * 100;
    const playerTop = (this.player.y / this.area.worldHeight) * 100;
    const enemyDots = this.enemySymbols
      .map((enemy) => {
        const left = (enemy.x / this.area.worldWidth) * 100;
        const top = (enemy.y / this.area.worldHeight) * 100;
        return `<span class="minimap-dot enemy-dot" style="left:${left}%;top:${top}%"></span>`;
      })
      .join("");

    this.miniMapElement.innerHTML = `
      <p>MAP</p>
      <div class="minimap-world">
        <span class="minimap-camera" style="
          left:${(this.camera.x / this.area.worldWidth) * 100}%;
          top:${(this.camera.y / this.area.worldHeight) * 100}%;
          width:${(this.camera.width / this.area.worldWidth) * 100}%;
          height:${(this.camera.height / this.area.worldHeight) * 100}%;
        "></span>
        ${enemyDots}
        <span class="minimap-dot player-dot" style="left:${playerLeft}%;top:${playerTop}%"></span>
      </div>
    `;
  }

  private findNearbyInteractable(): Interactable | null {
    const interactionRect = expandRect(this.player.getCollider(), 42);
    return (
      this.interactables.find((interactable) =>
        intersects(interactionRect, interactable.getInteractionRect())
      ) ?? null
    );
  }

  private findTouchedEnemy(): EnemySymbol | null {
    const playerCollider = this.player.getCollider();
    return this.enemySymbols.find((enemy) => intersects(playerCollider, enemy.getCollider())) ?? null;
  }

  private showMessage(message: string): void {
    this.message = message;
    this.lastEnemyContact = null;
    this.updateUi();
  }

  private showPathGuide(): void {
    this.pathGuideRemainingMs = PATH_GUIDE_DURATION_MS;
    this.message = "星とみかん色の光が、歩ける石畳をそっと照らしました。";
    this.lastEnemyContact = null;
    this.updateUi();
  }

  private renderPathGuide(ctx: CanvasRenderingContext2D): void {
    if (this.pathGuideRemainingMs <= 0) {
      return;
    }

    const progress = this.pathGuideRemainingMs / PATH_GUIDE_DURATION_MS;
    const ease = Math.sin(progress * Math.PI);
    const baseAlpha = 0.08 + ease * 0.2;

    ctx.save();
    ctx.globalCompositeOperation = "screen";

    for (const rect of this.area.walkableRects) {
      const screenRect = this.toScreenRect(rect);
      const gradient = ctx.createLinearGradient(
        screenRect.x,
        screenRect.y,
        screenRect.x + screenRect.width,
        screenRect.y + screenRect.height
      );
      gradient.addColorStop(0, `rgba(255, 181, 71, ${baseAlpha * 0.35})`);
      gradient.addColorStop(0.48, `rgba(255, 224, 126, ${baseAlpha})`);
      gradient.addColorStop(1, `rgba(255, 248, 207, ${baseAlpha * 0.28})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(screenRect.x, screenRect.y, screenRect.width, screenRect.height);
      this.drawGuideSparkles(ctx, rect, ease);
    }

    for (const polygon of this.area.walkablePolygons ?? []) {
      this.drawWalkablePolygon(ctx, polygon, `rgba(255, 224, 126, ${baseAlpha})`, true);
    }

    ctx.restore();
  }

  private renderDebugOverlay(ctx: CanvasRenderingContext2D): void {
    if (!this.debugOverlayVisible) {
      return;
    }

    ctx.save();

    for (const rect of this.area.walkableRects) {
      this.drawWorldRect(ctx, rect, "rgba(63, 210, 156, 0.22)", "rgba(120, 255, 205, 0.82)");
      this.drawWorldLabel(ctx, rect.label ?? rect.id, rect.x, rect.y);
    }

    for (const polygon of this.area.walkablePolygons ?? []) {
      this.drawWalkablePolygon(ctx, polygon, "rgba(63, 190, 255, 0.22)", false);
      this.drawWorldLabel(
        ctx,
        polygon.label ?? polygon.id,
        polygon.points[0]?.x ?? 0,
        polygon.points[0]?.y ?? 0
      );
    }

    for (const rect of this.area.collisionRects) {
      this.drawWorldRect(ctx, rect, "rgba(255, 72, 72, 0.26)", "rgba(255, 125, 125, 0.9)");
    }

    ctx.fillStyle = "rgba(24, 18, 14, 0.76)";
    ctx.fillRect(14, 14, 410, 62);
    ctx.fillStyle = "#fff8df";
    ctx.font = "700 15px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("DEV DEBUG ONLY: Gで表示切替", 28, 38);
    ctx.font = "13px sans-serif";
    ctx.fillText("赤: collisionRects / 緑: walkableRects / カメラ追従", 28, 60);

    ctx.restore();
  }

  private drawGuideSparkles(ctx: CanvasRenderingContext2D, rect: Rect, ease: number): void {
    const span = rect.width >= rect.height ? rect.width : rect.height;
    const count = Math.max(2, Math.min(8, Math.round(span / 120)));

    for (let index = 0; index < count; index += 1) {
      const t = (index + 0.5) / count;
      const wave = Math.sin(this.elapsedTimeMs / 360 + index * 1.7) * 0.5 + 0.5;
      const worldX =
        rect.width >= rect.height
          ? rect.x + rect.width * t
          : rect.x + rect.width * (0.5 + Math.sin(index * 2.3) * 0.18);
      const worldY =
        rect.width >= rect.height
          ? rect.y + rect.height * (0.5 + Math.cos(index * 1.9) * 0.2)
          : rect.y + rect.height * t;
      const screen = this.camera.worldToScreen({ x: worldX, y: worldY });
      const size = 4 + wave * 4;
      const alpha = (0.18 + wave * 0.34) * ease;

      this.drawTinyStar(ctx, screen.x, screen.y, size, `rgba(255, 226, 126, ${alpha})`);
      ctx.fillStyle = `rgba(255, 150, 57, ${alpha * 0.42})`;
      ctx.beginPath();
      ctx.ellipse(screen.x, screen.y + size * 1.2, size * 1.7, size * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawTinyStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(this.elapsedTimeMs / 1200);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(size * 0.28, -size * 0.28);
    ctx.lineTo(size, 0);
    ctx.lineTo(size * 0.28, size * 0.28);
    ctx.lineTo(0, size);
    ctx.lineTo(-size * 0.28, size * 0.28);
    ctx.lineTo(-size, 0);
    ctx.lineTo(-size * 0.28, -size * 0.28);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  private drawWorldRect(
    ctx: CanvasRenderingContext2D,
    rect: Rect,
    fillStyle: string,
    strokeStyle: string
  ): void {
    const screenRect = this.toScreenRect(rect);

    ctx.fillStyle = fillStyle;
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = 1.5;
    ctx.fillRect(screenRect.x, screenRect.y, screenRect.width, screenRect.height);
    ctx.strokeRect(screenRect.x, screenRect.y, screenRect.width, screenRect.height);
  }

  private drawWalkablePolygon(
    ctx: CanvasRenderingContext2D,
    polygon: WalkablePolygon,
    fillStyle: string,
    guideOnly: boolean
  ): void {
    if (polygon.points.length < 3) {
      return;
    }

    const firstPoint = polygon.points[0];
    if (!firstPoint) {
      return;
    }

    const first = this.camera.worldToScreen(firstPoint);
    ctx.beginPath();
    ctx.moveTo(first.x, first.y);

    for (const point of polygon.points.slice(1)) {
      const screen = this.camera.worldToScreen(point);
      ctx.lineTo(screen.x, screen.y);
    }

    ctx.closePath();
    ctx.fillStyle = fillStyle;
    ctx.fill();

    if (!guideOnly) {
      ctx.strokeStyle = "rgba(120, 220, 255, 0.82)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  private drawWorldLabel(ctx: CanvasRenderingContext2D, label: string, worldX: number, worldY: number): void {
    const screen = this.camera.worldToScreen({ x: worldX, y: worldY });

    ctx.fillStyle = "rgba(25, 20, 16, 0.78)";
    ctx.fillRect(screen.x + 4, screen.y + 4, Math.max(76, label.length * 10), 20);
    ctx.fillStyle = "#fff8df";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(label, screen.x + 8, screen.y + 18);
  }

  private toScreenRect(rect: Rect): Rect {
    const screen = this.camera.worldToScreen({ x: rect.x, y: rect.y });
    return {
      x: screen.x,
      y: screen.y,
      width: rect.width,
      height: rect.height
    };
  }

  private startBattle(enemy: EnemySymbol): void {
    if (!this.saveData || this.transitioningToBattle) {
      return;
    }

    const encounter = getEncounterById(enemy.encounterId);
    this.lastEnemyContact = {
      enemySymbolId: enemy.symbolId,
      encounterId: enemy.encounterId,
      encounterName: encounter?.name ?? enemy.encounterId
    };
    console.info("Enemy symbol contact", this.lastEnemyContact);
    this.updateUi();

    this.transitioningToBattle = true;
    const params: BattleStartParams & { saveData: SaveData } = {
      enemySymbolId: enemy.symbolId,
      encounterId: enemy.encounterId,
      returnLocationId: this.area.locationId,
      returnAreaId: this.area.id,
      isBoss: false,
      saveData: this.saveData
    };

    this.options.screenManager.change("battle", params);
  }

  private goToStarMap(): void {
    if (!this.saveData) {
      return;
    }

    const nextSave = this.options.saveManager.save({
      ...this.saveData,
      currentScreenId: "starMap",
      currentLocationId: this.area.locationId,
      currentAreaId: this.area.id
    });

    this.options.screenManager.change("starMap", { saveData: nextSave });
  }
}

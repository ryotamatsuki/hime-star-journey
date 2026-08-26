import { renderDepthSorted, type Renderable } from "../systems/RenderDepthSystem";
import { AssetLoader } from "../core/AssetLoader";
import { resolvePublicAssetPath } from "../core/AssetPath";
import { Camera } from "../core/Camera";
import { InputManager, type InputAction } from "../core/InputManager";
import { SaveManager } from "../core/SaveManager";
import { ScreenManager } from "../core/ScreenManager";
import { Companion } from "../entities/Companion";
import { EnemySymbol } from "../entities/EnemySymbol";
import { Interactable } from "../entities/Interactable";
import { NPC } from "../entities/NPC";
import { Player } from "../entities/Player";
import { getEnemySymbolsForArea } from "../data/enemySymbols";
import { getEncounterById } from "../data/encounters";
import { p12AssetManifest } from "../data/assets";
import { getInteractablesForArea } from "../data/interactables";
import { dogoArea, getMapArea, type MapAreaData, type WalkablePolygon } from "../data/maps";
import { getNpcsForArea } from "../data/npcs";
import {
  P12_BOSS_ENEMY_ID,
  completeP12,
  getP12AreaMeta,
  markP12Checkpoint,
  markP12Discovery,
  p12RequiredEnemiesCleared
} from "../data/p12";
import { castleQuest, dogoQuest } from "../data/quests";
import { expandRect, intersects, type Rect } from "../systems/CollisionSystem";
import { DialogueSystem } from "../systems/DialogueSystem";
import type { BattleStartParams } from "../types/battle";
import type { GameScreen, ScreenId } from "../types/game";
import type { SaveData } from "../types/save";
import { DialogueBox } from "../ui/DialogueBox";

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
const FIRST_ENEMY_HINT_RADIUS = 132;
const YUNO_EVENT_DURATION_MS = 6400;
const CASTLE_GUARD_EVENT_DURATION_MS = 5200;
const P12_KAMIJIMA_WIND_BARRIER: Rect = {
  x: 1380,
  y: 388,
  width: 120,
  height: 342
};

function interactionPriority(id: string): number {
  if (id === "p12_windmill") return 3;
  if (id === "p12_bridge_wind_puzzle") return 3;
  if (id.includes("p12_") && (id.includes("puzzle") || id.includes("reward") || id.includes("scenic") || id.includes("shortcut"))) return 2;
  if (id.includes("p12_") && id.includes("discovery")) return 2;
  if (id.includes("p12_") && (id.includes("_route") || id.includes("_to_"))) return 1;
  if (id === "dogo_star_placeholder") return 2;
  if (id === "dogo_steam_spot") return 1;
  return 0;
}

export class ExploreScreen implements GameScreen {
  readonly id: ScreenId = "explore";

  private readonly dialogueSystem = new DialogueSystem();
  private saveData: SaveData | null = null;
  private area: MapAreaData = dogoArea;
  private camera = new Camera(1280, 720, dogoArea.worldWidth, dogoArea.worldHeight);
  private player = new Player(dogoArea.playerStart.x, dogoArea.playerStart.y);
  private companion = new Companion(dogoArea.playerStart.x + 62, dogoArea.playerStart.y - 42);
  private enemySymbols: EnemySymbol[] = [];
  private interactables: Interactable[] = [];
  private npcs: NPC[] = [];
  private nearbyInteractable: Interactable | null = null;
  private nearbyNpc: NPC | null = null;
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
  private talkButton: HTMLButtonElement | null = null;
  private pathGuideButton: HTMLButtonElement | null = null;
  private interactButton: HTMLButtonElement | null = null;
  private dialogueBox: DialogueBox | null = null;
  private objectiveElement: HTMLElement | null = null;
  private mapButton: HTMLButtonElement | null = null;
  private yunoEventMs = 0;
  private castleGuardEventMs = 0;
  private p12PlaytimeMs = 0;
  private p12PersistAccumulatorMs = 0;
  private windRevealRemainingMs = 0;
  private shiroSearchButton: HTMLButtonElement | null = null;

  constructor(private readonly options: ExploreScreenOptions) {}

  enter(params?: unknown): void {
    const typedParams = params as ExploreScreenParams | undefined;
    const loadedSave = typedParams?.saveData ?? this.options.saveManager.load();
    const nextSave = loadedSave ?? this.options.saveManager.createInitialSaveData();
    const locationId = typedParams?.locationId ?? nextSave.currentLocationId;
    const areaId = typedParams?.areaId ?? nextSave.currentAreaId;

    this.area = getMapArea(locationId, areaId);
    if (
      this.area.locationId === "shimanami" &&
      this.area.id === "A2-4" &&
      !nextSave.flags.p12_kamijima_shortcut_open
    ) {
      this.area = {
        ...this.area,
        collisionRects: [...this.area.collisionRects, P12_KAMIJIMA_WIND_BARRIER]
      };
    }
    if (this.area.locationId === "shimanami") {
      const areaAssetIds = new Set([
        this.area.backgroundAssetId,
        ...getEnemySymbolsForArea(this.area.locationId, this.area.id).map((symbol) => symbol.assetId),
        ...getNpcsForArea(this.area.locationId, this.area.id).map((npc) => npc.assetId)
      ]);
      const areaAssets = p12AssetManifest.images.filter((asset) => areaAssetIds.has(asset.id));
      void this.options.assetLoader.loadAreaAssets(areaAssets).then(() => this.updateUi());
    }
    this.camera.setWorldSize(this.area.worldWidth, this.area.worldHeight);
    this.saveData = this.options.saveManager.save({
      ...nextSave,
      currentScreenId: "explore",
      currentChapterId: this.area.locationId === "castle"
        ? "castle_explore"
        : this.area.locationId === "shimanami"
          ? `p12_${this.area.id}`
          : "dogo_explore",
      currentLocationId: this.area.locationId,
      currentAreaId: this.area.id
    });
    if (this.area.locationId === "shimanami") {
      const areaIds = [...(this.saveData.p12AreaIds ?? [])];
      const areaTimes = [...(this.saveData.p12AreaEnterElapsedMs ?? [])];
      if (areaIds.at(-1) !== this.area.id) {
        areaIds.push(this.area.id);
        areaTimes.push(Math.round(this.saveData.p12SessionElapsedMs ?? 0));
        this.saveData = this.options.saveManager.save({
          ...this.saveData,
          p12AreaIds: areaIds,
          p12AreaEnterElapsedMs: areaTimes
        });
      }
    }

    this.player = new Player(this.area.playerStart.x, this.area.playerStart.y);
    this.companion = new Companion(this.player.x + 62, this.player.y - 42);
    this.camera.follow(this.player.x, this.player.y);
    this.enemySymbols = getEnemySymbolsForArea(this.area.locationId, this.area.id)
      .map((symbol) => new EnemySymbol(symbol))
      .filter((symbol) => !this.saveData || !symbol.isDefeated(this.saveData));
    this.interactables = getInteractablesForArea(this.area.locationId, this.area.id).map(
      (interactable) => new Interactable(interactable, (target) => this.showMessage(target.message))
    );
    this.interactables.forEach((interactable) => {
      interactable.setWindAwake(Boolean(this.saveData?.flags.p12_wind_ability));
    });
    this.npcs = getNpcsForArea(this.area.locationId, this.area.id).map((npc) => new NPC(npc));
    this.transitioningToBattle = false;
    this.nearbyInteractable = null;
    this.nearbyNpc = null;
    this.lastEnemyContact = null;
    this.debugOverlayVisible = false;
    this.pathGuideRemainingMs = 0;
    this.windRevealRemainingMs = 0;
    this.p12PlaytimeMs = this.area.locationId === "shimanami" ? this.saveData.p12SessionElapsedMs ?? 0 : 0;
    this.p12PersistAccumulatorMs = 0;
    this.message = this.getAreaIntroMessage();
    this.syncQuestProgress();
    this.renderUi();
    this.dialogueBox = new DialogueBox({
      uiRoot: this.options.uiRoot,
      assetLoader: this.options.assetLoader,
      onAdvance: () => this.advanceDialogue()
    });
    this.updateUi();
    this.tryStartAreaIntroDialogue();
  }

  update(deltaTime: number): void {
    if (!this.saveData) {
      return;
    }

    this.elapsedTimeMs += deltaTime * 1000;

    if (this.area.locationId === "shimanami") {
      this.p12PlaytimeMs += deltaTime * 1000;
      this.p12PersistAccumulatorMs += deltaTime * 1000;
      if (this.p12PersistAccumulatorMs >= 2000) {
        this.p12PersistAccumulatorMs = 0;
        this.saveData = this.options.saveManager.save({
          ...this.saveData,
          p12SessionElapsedMs: Math.round(this.p12PlaytimeMs)
        });
      }
    }

    if (this.yunoEventMs > 0) {
      this.yunoEventMs += deltaTime * 1000;
      if (this.yunoEventMs >= YUNO_EVENT_DURATION_MS) this.completeYunoStarEvent();
      this.updateUi();
      return;
    }

    if (this.castleGuardEventMs > 0) {
      this.castleGuardEventMs += deltaTime * 1000;
      if (this.castleGuardEventMs >= CASTLE_GUARD_EVENT_DURATION_MS) this.completeCastleGuardEvent();
      this.updateUi();
      return;
    }

    if (this.dialogueSystem.isActive()) {
      if (this.options.inputManager.isActionStarted("confirm")) {
        this.advanceDialogue();
      }

      this.companion.update(deltaTime, this.player);
      for (const enemy of this.enemySymbols) {
        enemy.update(deltaTime);
      }
      for (const npc of this.npcs) {
        npc.update(deltaTime);
      }
      this.camera.follow(this.player.x, this.player.y);
      this.updateUi();
      return;
    }

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
    this.windRevealRemainingMs = Math.max(0, this.windRevealRemainingMs - deltaTime * 1000);

    this.player.update(
      deltaTime,
      this.options.inputManager,
      this.area.collisionRects,
      this.area.cameraBounds,
      this.area.locationId === "dogo" || this.area.locationId === "shimanami" ? this.area.walkableRects : undefined,
      this.area.locationId === "dogo" || this.area.locationId === "shimanami" ? this.area.walkablePolygons ?? [] : undefined
    );
    this.companion.update(deltaTime, this.player);

    for (const enemy of this.enemySymbols) {
      enemy.update(deltaTime);
    }

    for (const npc of this.npcs) {
      npc.update(deltaTime);
    }

    this.camera.follow(this.player.x, this.player.y);
    this.nearbyInteractable = this.findNearbyInteractable();
    this.nearbyNpc = this.findNearbyNpc();

    if (this.nearbyNpc && this.options.inputManager.isActionStarted("confirm")) {
      this.interactWithNearbyNpc();
      return;
    }

    if (this.nearbyInteractable && this.options.inputManager.isActionStarted("confirm")) {
      this.interactWithNearbyInteractable();
    }

    if (this.shouldStartFirstEnemyHint()) {
      this.tryStartDialogue("dogo_first_enemy_hint_auto");
      this.updateUi();
      return;
    }

    const touchedEnemy = this.findTouchedEnemy();
    if (touchedEnemy) {
      if (!this.canStartTouchedEnemy(touchedEnemy)) {
        this.updateUi();
        return;
      }
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
    this.renderWindPaths(ctx);
    this.renderKamijimaWindBarrier(ctx);
    this.renderDepthSortedWorldObjects(ctx);
    this.renderMapLayer(ctx, this.area.foregroundAssetId, 0.86);
    this.renderSteamOverlay(ctx);
    this.renderYunoStarEvent(ctx);
    this.renderCastleGuardEvent(ctx);
    this.renderDebugOverlay(ctx);
  }

  exit(): void {
    this.options.uiRoot.innerHTML = "";
    this.messageElement = null;
    this.nearbyElement = null;
    this.statusElement = null;
    this.miniMapElement = null;
    this.talkButton = null;
    this.pathGuideButton = null;
    this.shiroSearchButton = null;
    this.interactButton = null;
    this.dialogueBox?.destroy();
    this.dialogueBox = null;
    this.objectiveElement = null;
    this.mapButton = null;
  }

  private renderMapLayer(
    ctx: CanvasRenderingContext2D,
    assetId: string | undefined,
    opacity: number,
    sourceOffsetX = 0,
    sourceOffsetY = 0
  ): void {
    const { canvas } = ctx;
    if (!assetId) {
      return;
    }

    const image = assetId ? this.options.assetLoader.getImage(assetId) : undefined;

    if (!image) {
      if (this.area.locationId === "shimanami" && assetId === "bg_shimanami") {
        this.drawShimanamiBackground(ctx, opacity);
        return;
      }
      this.drawMissingMapLayer(ctx, assetId, opacity);
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
      ...this.npcs.map((npc): Renderable => ({
        id: npc.id,
        depthY: npc.getDepthY(),
        render: (targetCtx) =>
          npc.render(targetCtx, this.options.assetLoader, this.camera, npc === this.nearbyNpc)
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

  private drawShimanamiBackground(ctx: CanvasRenderingContext2D, opacity: number): void {
    const { canvas } = ctx;
    ctx.save();
    ctx.globalAlpha *= opacity;

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#143d5b");
    gradient.addColorStop(0.58, "#2e8da0");
    gradient.addColorStop(1, "#d1a760");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.globalAlpha *= 0.28;
    ctx.strokeStyle = "#bce9e5";
    ctx.lineWidth = 2;
    for (let index = 0; index < 8; index += 1) {
      const y = 54 + index * 88;
      ctx.beginPath();
      ctx.moveTo(0, y + Math.sin(this.elapsedTimeMs / 900 + index) * 8);
      ctx.bezierCurveTo(canvas.width * 0.3, y - 14, canvas.width * 0.7, y + 18, canvas.width, y);
      ctx.stroke();
    }

    ctx.globalAlpha = 0.92 * opacity;
    const islands = [
      { x: 300, y: 260, rx: 230, ry: 98, color: "#4b886e" },
      { x: 820, y: 760, rx: 320, ry: 110, color: "#5f9b72" },
      { x: 1450, y: 300, rx: 270, ry: 92, color: "#3e7869" }
    ];
    for (const island of islands) {
      const center = this.camera.worldToScreen({ x: island.x, y: island.y });
      const scaleX = canvas.width / this.camera.width;
      const scaleY = canvas.height / this.camera.height;
      ctx.fillStyle = island.color;
      ctx.beginPath();
      ctx.ellipse(center.x, center.y, island.rx * scaleX, island.ry * scaleY, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 0.72 * opacity;
    ctx.strokeStyle = "#e5c27c";
    ctx.lineWidth = Math.max(6, 12 * (canvas.width / this.camera.width));
    const route = [
      { x: 120, y: 760 },
      { x: 680, y: 680 },
      { x: 1160, y: 560 },
      { x: 1780, y: 520 }
    ];
    ctx.beginPath();
    route.forEach((point, index) => {
      const screen = this.camera.worldToScreen(point);
      if (index === 0) ctx.moveTo(screen.x, screen.y);
      else ctx.lineTo(screen.x, screen.y);
    });
    ctx.stroke();

    const label = this.area.name;
    const labelPoint = this.camera.worldToScreen({ x: 160, y: 170 });
    ctx.globalAlpha = 0.92 * opacity;
    ctx.fillStyle = "rgba(12, 34, 48, 0.7)";
    ctx.fillRect(labelPoint.x, labelPoint.y, Math.max(160, label.length * 18), 34);
    ctx.fillStyle = "#fff4c7";
    ctx.font = "700 18px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(label, labelPoint.x + 12, labelPoint.y + 17);

    if (this.area.id === "A2-3" || this.area.id === "A2-5") {
      const tower = this.camera.worldToScreen({ x: 1110, y: 370 });
      ctx.fillStyle = "#e5ddbd";
      ctx.fillRect(tower.x - 18, tower.y - 62, 36, 74);
      ctx.fillStyle = "#d0704d";
      ctx.beginPath();
      ctx.moveTo(tower.x - 28, tower.y - 62);
      ctx.lineTo(tower.x, tower.y - 94);
      ctx.lineTo(tower.x + 28, tower.y - 62);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#fff1a5";
      ctx.beginPath();
      ctx.arc(tower.x, tower.y - 30, 7 + Math.sin(this.elapsedTimeMs / 260) * 2, 0, Math.PI * 2);
      ctx.fill();
    }

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
    quest.style.setProperty(
      "--quest-panel-frame-image",
      `url("${resolvePublicAssetPath("/assets/generated/ui/quest_panel_frame.png")}")`
    );
    const location = document.createElement("p");
    location.className = "ui-kicker";
    location.textContent = `現在地：${this.area.name}`;
    const objective = document.createElement("h2");
    this.objectiveElement = objective;
    const hints = document.createElement("p");
    hints.className = "explore-hints";
    hints.textContent =
      "移動：WASD / 矢印　調べる：Enter / Space　道しるべ：H　開発表示：G　星地図：M　戻る：Esc";
    this.nearbyElement = document.createElement("p");
    this.nearbyElement.className = "nearby-note";
    this.talkButton = document.createElement("button");
    this.talkButton.className = "menu-button explore-talk-button";
    this.talkButton.type = "button";
    this.talkButton.textContent = "話す";
    this.talkButton.hidden = true;
    this.talkButton.addEventListener("click", () => this.interactWithNearbyNpc());
    this.interactButton = document.createElement("button");
    this.interactButton.className = "menu-button explore-interact-button";
    this.interactButton.type = "button";
    this.interactButton.textContent = "調べる";
    this.interactButton.hidden = true;
    this.interactButton.addEventListener("click", () => this.interactWithNearbyInteractable());
    this.pathGuideButton = document.createElement("button");
    this.pathGuideButton.className = "menu-button explore-guide-button";
    this.pathGuideButton.type = "button";
    this.pathGuideButton.textContent = "道しるべ";
    this.pathGuideButton.addEventListener("click", () => this.showPathGuide());
    this.shiroSearchButton = document.createElement("button");
    this.shiroSearchButton.className = "menu-button explore-shiro-search-button";
    this.shiroSearchButton.type = "button";
    this.shiroSearchButton.textContent = "シロ検索";
    this.shiroSearchButton.title = "シロに今の目的を聞く";
    this.shiroSearchButton.addEventListener("click", () => this.showShiroSearch());
    const mapButton = document.createElement("button");
    this.mapButton = mapButton;
    mapButton.className = "menu-button explore-map-button";
    mapButton.type = "button";
    mapButton.textContent = "星地図";
    mapButton.addEventListener("click", () => this.goToStarMap());
    quest.append(
      location,
      objective,
      hints,
      this.nearbyElement,
      this.talkButton,
      this.interactButton,
      this.shiroSearchButton,
      this.pathGuideButton,
      mapButton
    );

    const minimap = document.createElement("section");
    minimap.className = "explore-minimap";
    this.miniMapElement = minimap;

    const message = document.createElement("section");
    message.className = "explore-message";
    this.messageElement = document.createElement("p");
    message.append(this.messageElement);

    wrapper.append(status, quest, minimap, message);
    wrapper.append(this.createTouchControls());
    this.options.uiRoot.append(wrapper);
  }

  private createTouchControls(): HTMLElement {
    const controls = document.createElement("div");
    controls.className = "explore-touch-controls";
    const compactViewport =
      document.documentElement.clientWidth <= 760 ||
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(hover: none)").matches;
    if (compactViewport) controls.classList.add("explore-touch-controls--visible");
    controls.setAttribute("aria-label", "タッチ移動");

    const buttons: Array<{ action: InputAction; label: string; symbol: string }> = [
      { action: "up", label: "上へ移動", symbol: "▲" },
      { action: "left", label: "左へ移動", symbol: "◀" },
      { action: "down", label: "下へ移動", symbol: "▼" },
      { action: "right", label: "右へ移動", symbol: "▶" }
    ];

    for (const definition of buttons) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "explore-touch-button";
      button.dataset.touchAction = definition.action;
      button.setAttribute("aria-label", definition.label);
      button.textContent = definition.symbol;

      const release = (event: PointerEvent): void => {
        if (button.hasPointerCapture(event.pointerId)) button.releasePointerCapture(event.pointerId);
        this.options.inputManager.setVirtualAction(definition.action, false);
      };

      button.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        button.setPointerCapture(event.pointerId);
        this.options.inputManager.setVirtualAction(definition.action, true);
      });
      button.addEventListener("pointerup", release);
      button.addEventListener("pointercancel", release);
      button.addEventListener("lostpointercapture", () => {
        this.options.inputManager.setVirtualAction(definition.action, false);
      });
      button.addEventListener("click", () => {
        this.options.inputManager.tapVirtualAction(definition.action);
      });
      controls.append(button);
    }

    return controls;
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
      if (this.dialogueSystem.isActive()) {
        this.nearbyElement.textContent = "会話中：Enter / Spaceで次へ";
      } else if (this.nearbyNpc) {
        this.nearbyElement.textContent = `Enter：話す ${this.nearbyNpc.name}`;
      } else if (this.nearbyInteractable) {
        this.nearbyElement.textContent = `Enter：調べる ${this.nearbyInteractable.label}`;
      } else {
        this.nearbyElement.textContent = "気になる場所や人に近づくと、話したり調べたりできます。";
      }
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

    if (this.objectiveElement) this.objectiveElement.textContent = this.getQuestObjective();
    if (this.mapButton) {
      const unlocked = this.saveData.flags.star_map_unlocked === true;
      this.mapButton.hidden = !unlocked;
      this.mapButton.disabled = !unlocked || this.yunoEventMs > 0;
    }

    if (this.talkButton) {
      const canTalk = !this.dialogueSystem.isActive() && this.nearbyNpc !== null;
      this.talkButton.hidden = !canTalk;
      this.talkButton.disabled = !canTalk;
      this.talkButton.textContent = this.nearbyNpc ? `${this.nearbyNpc.name}と話す` : "話す";
    }

    if (this.interactButton) {
      const canInteract = !this.dialogueSystem.isActive() && this.nearbyNpc === null && this.nearbyInteractable !== null;
      this.interactButton.hidden = !canInteract;
      this.interactButton.disabled = !canInteract;
      this.interactButton.textContent = this.nearbyInteractable ? `${this.nearbyInteractable.label}を調べる` : "調べる";
    }
    if (this.shiroSearchButton) {
      this.shiroSearchButton.disabled = this.dialogueSystem.isActive();
    }

    this.syncDialogueBox();
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
    const nearby = this.interactables.filter((interactable) =>
      intersects(interactionRect, interactable.getInteractionRect())
    );
    nearby.sort((left, right) => interactionPriority(right.id) - interactionPriority(left.id));
    return nearby[0] ?? null;
  }

  private findNearbyNpc(): NPC | null {
    const interactionRect = this.player.getCollider();
    return this.npcs.find((npc) => intersects(interactionRect, npc.getInteractionRect())) ?? null;
  }

  private interactWithNearbyNpc(): void {
    if (!this.nearbyNpc || this.dialogueSystem.isActive()) return;
    if (this.area.locationId !== "shimanami") this.markQuestHintSeen();
    this.tryStartDialogue(this.nearbyNpc.dialogueId);
    this.updateUi();
  }

  private interactWithNearbyInteractable(): void {
    if (!this.nearbyInteractable || this.dialogueSystem.isActive()) return;

    if (this.area.locationId === "castle") {
      this.handleCastleInteractable(this.nearbyInteractable.id);
      this.updateUi();
      return;
    }

    if (this.area.locationId === "shimanami") {
      this.handleShimanamiInteractable(this.nearbyInteractable.id);
      this.updateUi();
      return;
    }

    if (this.nearbyInteractable.id === "dogo_steam_spot") {
      this.markQuestHintSeen();
      this.tryStartDialogue("interactable_steam_hint");
      this.updateUi();
      return;
    }

    if (this.nearbyInteractable.id === "dogo_star_placeholder") {
      this.tryStartYunoStarEvent();
    } else {
      this.nearbyInteractable.interact();
    }
  }

  private findTouchedEnemy(): EnemySymbol | null {
    const playerCollider = this.player.getCollider();
    return this.enemySymbols.find((enemy) => intersects(playerCollider, enemy.getCollider())) ?? null;
  }

  private shouldStartFirstEnemyHint(): boolean {
    if (this.area.locationId !== "dogo") {
      return false;
    }

    if (!this.saveData || this.saveData.flags.dialogue_first_enemy_hint_seen) {
      return false;
    }

    const hintRect = expandRect(this.player.getCollider(), FIRST_ENEMY_HINT_RADIUS);
    return this.enemySymbols.some((enemy) => intersects(hintRect, enemy.getCollider()));
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

  private showShiroSearch(): void {
    this.pathGuideRemainingMs = PATH_GUIDE_DURATION_MS;
    this.message = `シロ検索：${this.getQuestObjective().replace(/^もくてき：/, "")}`;
    this.lastEnemyContact = null;
    this.updateUi();
  }

  private tryStartDialogue(dialogueId: string): boolean {
    if (!this.saveData) {
      return false;
    }

    const started = this.dialogueSystem.start(dialogueId, this.saveData);
    if (started) {
      this.lastEnemyContact = null;
      this.syncDialogueBox();
    }

    return started;
  }

  private advanceDialogue(): void {
    if (!this.saveData || !this.dialogueSystem.isActive()) {
      return;
    }

    this.dialogueSystem.next(this.saveData);

    if (this.dialogueSystem.isFinished()) {
      this.saveData = this.options.saveManager.save(this.saveData);
      this.nearbyInteractable = this.findNearbyInteractable();
      this.nearbyNpc = this.findNearbyNpc();
      this.dialogueBox?.hide();
    } else {
      this.syncDialogueBox();
    }

    this.updateUi();
  }

  private syncDialogueBox(): void {
    const line = this.dialogueSystem.getCurrentLine();

    if (!line) {
      this.dialogueBox?.hide();
      return;
    }

    this.dialogueBox?.show(line, this.dialogueSystem.isCurrentLineLast());
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

    for (const path of this.area.guidePaths ?? []) {
      this.drawGuidePath(ctx, path.points, ease);
    }

    ctx.restore();
  }

  private drawGuidePath(ctx: CanvasRenderingContext2D, points: { x: number; y: number }[], ease: number): void {
    if (points.length < 2) return;
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = `rgba(105, 170, 255, ${0.35 + ease * 0.4})`;
    ctx.lineWidth = 5;
    ctx.beginPath();
    points.forEach((point, index) => {
      const screen = this.camera.worldToScreen(point);
      if (index === 0) ctx.moveTo(screen.x, screen.y);
      else ctx.lineTo(screen.x, screen.y);
    });
    ctx.stroke();
    for (const point of points) {
      const screen = this.camera.worldToScreen(point);
      ctx.fillStyle = `rgba(255, 236, 138, ${0.42 + ease * 0.42})`;
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, 4 + ease * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private renderWindPaths(ctx: CanvasRenderingContext2D): void {
    if (!this.saveData) return;
    const bridgePuzzleActive = this.area.id === "A2-1" && this.saveData.flags.p12_bridge_sail_aligned === true;
    if (!this.saveData.flags.p12_wind_ability && !bridgePuzzleActive) return;
    const persistent = Boolean(this.saveData.flags.p12_windmill_revisited) || bridgePuzzleActive;
    if (!persistent && this.windRevealRemainingMs <= 0) return;

    const revealProgress = this.windRevealRemainingMs > 0
      ? Math.sin((this.windRevealRemainingMs / 4200) * Math.PI)
      : 0.72;
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (const path of this.area.guidePaths ?? []) {
      this.drawGuidePath(ctx, path.points, 0.45 + revealProgress * 0.45);
    }
    ctx.restore();
  }

  private renderKamijimaWindBarrier(ctx: CanvasRenderingContext2D): void {
    if (
      this.area.id !== "A2-4" ||
      this.saveData?.flags.p12_kamijima_shortcut_open
    ) {
      return;
    }

    const top = this.camera.worldToScreen({ x: P12_KAMIJIMA_WIND_BARRIER.x + 20, y: P12_KAMIJIMA_WIND_BARRIER.y + 18 });
    const bottom = this.camera.worldToScreen({ x: P12_KAMIJIMA_WIND_BARRIER.x + 20, y: P12_KAMIJIMA_WIND_BARRIER.y + P12_KAMIJIMA_WIND_BARRIER.height - 18 });
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.strokeStyle = "rgba(132, 225, 255, 0.76)";
    ctx.shadowColor = "rgba(98, 214, 255, 0.88)";
    ctx.shadowBlur = 18;
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    for (let index = 0; index < 3; index += 1) {
      const offset = index * 28;
      ctx.beginPath();
      ctx.moveTo(top.x + offset, top.y);
      ctx.bezierCurveTo(top.x + offset - 28, top.y + 54, bottom.x + offset + 28, bottom.y - 54, bottom.x + offset, bottom.y);
      ctx.stroke();
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
    ctx.fillText("赤: collisionRects / 青: walkable areas / カメラ追従", 28, 60);

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

  private canStartTouchedEnemy(enemy: EnemySymbol): boolean {
    if (!this.saveData || this.area.locationId !== "castle") return true;

    if (
      enemy.symbolId === castleQuest.darkWellEnemySymbolId &&
      !this.saveData.flags.castle_required_enemies_cleared
    ) {
      this.message = "くらやみ井戸の闇が強すぎる。先に三つの影をしずめよう。";
      return false;
    }

    return true;
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
      isBoss: encounter?.isBoss === true,
      saveData: this.saveData
    };

    this.options.screenManager.change("battle", params);
  }

  private syncQuestProgress(): void {
    if (this.area.locationId === "shimanami") {
      this.syncP12Progress();
      return;
    }

    if (this.area.locationId === "castle") {
      this.syncCastleQuestProgress();
      return;
    }

    if (!this.saveData || this.saveData.flags.yuno_star_obtained) return;
    const allCalmed = dogoQuest.requiredEnemySymbolIds.every((id) => this.saveData?.defeatedEnemyIds.includes(id));
    let status = this.saveData.dogoQuestStatus;
    if (status === "notStarted" && this.saveData.flags.prologue_completed) status = "started";
    if (this.saveData.flags.dogo_quest_hint_seen && status === "started") status = "hintSeen";
    if (allCalmed) {
      status = "yunoStarReady";
      this.saveData.flags.dogo_required_enemies_calmed = true;
    }
    if (status !== this.saveData.dogoQuestStatus) {
      this.saveData = this.options.saveManager.save({ ...this.saveData, dogoQuestStatus: status });
    }
  }

  private syncP12Progress(): void {
    if (!this.saveData) return;

    const nextFlags: Record<string, boolean> = {
      ...this.saveData.flags,
      p12_unlocked: true,
      p12_started: true
    };
    if (p12RequiredEnemiesCleared(this.saveData)) nextFlags.p12_required_enemies_cleared = true;

    const bossDefeated = this.saveData.defeatedEnemyIds.includes(P12_BOSS_ENEMY_ID)
      || nextFlags.enemy_defeated_A2_B01 === true
      || nextFlags["enemy_defeated_A2-B01"] === true;
    if (bossDefeated && !nextFlags.p12_completed) {
      const withDiscovery = markP12Discovery(this.saveData, "boss_clear", this.p12PlaytimeMs);
      const completed = completeP12(withDiscovery);
      this.saveData = this.options.saveManager.save({
        ...completed,
        flags: {
          ...completed.flags,
          ...nextFlags,
          p12_completed: true,
          star_shimanami_collected: true
        }
      });
      return;
    }

    const flagsChanged = Object.entries(nextFlags).some(([key, value]) => this.saveData?.flags[key] !== value);
    if (flagsChanged) {
      this.saveData = this.options.saveManager.save({ ...this.saveData, flags: nextFlags });
    }
  }

  private markQuestHintSeen(): void {
    if (this.area.locationId === "castle") {
      this.markCastleHintSeen();
      return;
    }

    if (!this.saveData || this.saveData.flags.dogo_quest_hint_seen) return;
    this.saveData = this.options.saveManager.save({
      ...this.saveData,
      dogoQuestStatus: this.saveData.dogoQuestStatus === "started" ? "hintSeen" : this.saveData.dogoQuestStatus,
      flags: { ...this.saveData.flags, dogo_quest_hint_seen: true }
    });
  }

  private getQuestObjective(): string {
    if (this.area.locationId === "shimanami") {
      return this.getP12QuestObjective();
    }

    if (this.area.locationId === "castle") {
      return this.getCastleQuestObjective();
    }

    if (!this.saveData) return "もくてき：道後温泉を見てまわろう";
    if (this.saveData.flags.yuno_star_obtained) return "もくてき：星地図で松山城を確かめよう";
    if (!this.saveData.flags.dogo_quest_hint_seen) return "もくてき：町の人に話を聞こう";
    const remaining = dogoQuest.requiredEnemySymbolIds.filter((id) => !this.saveData?.defeatedEnemyIds.includes(id)).length;
    if (remaining > 0) return `もくてき：迷っている影をしずめよう（あと${remaining}）`;
    return "もくてき：湯けむりの奥で、湯の星を取り戻そう";
  }

  private getAreaIntroMessage(): string {
    if (this.area.locationId === "shimanami") {
      const meta = getP12AreaMeta(this.area.id);
      return `${meta?.name ?? this.area.name}に着いた。${meta?.objective ?? "風の手がかりを探そう"}。`;
    }
    return this.area.locationId === "castle"
      ? "松山城に着いた。石垣の道に、くろぼしの影が落ちている。"
      : "道後温泉に着いた。湯けむり通りをすすもう。";
  }

  private tryStartAreaIntroDialogue(): void {
    if (this.area.locationId === "shimanami") {
      this.tryStartDialogue("p12_intro_auto");
      return;
    }

    if (this.area.locationId === "castle") {
      this.tryStartDialogue("castle_intro_auto");
      return;
    }

    this.tryStartDialogue("dogo_intro_auto");
  }

  private getP12QuestObjective(): string {
    if (!this.saveData) return "もくてき：しまなみの風の手がかりを探そう";
    if (this.saveData.flags.p12_completed || this.saveData.flags.star_shimanami_collected) {
      return "もくてき：しまなみの星を取り戻した。星地図へ戻ろう";
    }

    switch (this.area.id) {
      case "A2-0":
        return "もくてき：橋道か小舟道を選び、風の手がかりを探そう";
      case "A2-1": {
        const found = this.saveData.flags.p12_discovery_bridge_memory === true;
        return found ? "もくてき：見張り台への道を進もう" : "もくてき：橋の記憶を見つけよう";
      }
      case "A2-2": {
        const found = this.saveData.flags.p12_discovery_island_memory === true;
        return found ? "もくてき：見張り台への坂を進もう" : "もくてき：集落に残る島の記憶を見つけよう";
      }
      case "A2-3":
        if (!this.saveData.flags.p12_wind_ability) return "もくてき：風の星から風よみを受け取ろう";
        if (!this.saveData.flags.p12_windmill_revisited) return "もくてき：同じ風車をもう一度調べ、変化を確かめよう";
        return "もくてき：上島の島道へ進もう";
      case "A2-4": {
        const required = this.saveData.flags.p12_route_boat ? "A2-E02" : "A2-E01";
        const remaining = [required, "A2-E03"].filter((id) => !this.saveData?.defeatedEnemyIds.includes(id)).length;
        return remaining > 0 ? `もくてき：島道の影をしずめよう（あと${remaining}体）` : "もくてき：風の灯台へ向かおう";
      }
      case "A2-5":
        return "もくてき：しまかぜ大だこに風を返し、島の星を取り戻そう";
      default:
        return "もくてき：しまなみの風の手がかりを探そう";
    }
  }

  private recordP12Discovery(discoveryId: string, message: string): void {
    if (!this.saveData) return;
    this.saveData = this.options.saveManager.save(
      markP12Discovery(
        { ...this.saveData, p12SessionElapsedMs: Math.round(this.p12PlaytimeMs) },
        discoveryId,
        Math.round(this.p12PlaytimeMs)
      )
    );
    this.message = message;
    this.lastEnemyContact = null;
  }

  private activateP12WindmillRevisit(): void {
    if (!this.saveData) return;
    const rewardAlreadyClaimed = Boolean(this.saveData.flags.p12_windmill_rewarded);
    this.saveData = this.options.saveManager.save({
      ...this.saveData,
      acquiredItems: rewardAlreadyClaimed
        ? this.saveData.acquiredItems
        : {
            ...this.saveData.acquiredItems,
            p12_wind_compass: (this.saveData.acquiredItems.p12_wind_compass ?? 0) + 1
          },
      flags: {
        ...this.saveData.flags,
        p12_windmill_revisited: true,
        p12_windmill_rewarded: true
      }
    });
    this.windRevealRemainingMs = 4200;
    this.interactables.forEach((interactable) => interactable.setWindAwake(true));
    this.recordP12Discovery(
      "wind_revisit",
      rewardAlreadyClaimed
        ? "同じ風車の羽根が、風よみの前とは違う音を奏でた。道がひらく。"
        : "同じ風車の羽根が風を返し、風のコンパスを落とした。戻ってきた道に、確かな報酬がある。"
    );
    if (!rewardAlreadyClaimed) {
      this.recordP12Discovery("wind_revisit_reward", "風のコンパスを手に入れた。風道の向きが、手帳にも記録された。");
    }
  }

  private checkpointP12(checkpointId: string): void {
    if (!this.saveData) return;
    this.saveData = this.options.saveManager.save(
      markP12Checkpoint(
        { ...this.saveData, p12SessionElapsedMs: Math.round(this.p12PlaytimeMs) },
        checkpointId,
        Math.round(this.p12PlaytimeMs)
      )
    );
  }

  private transitionP12(areaId: string): void {
    if (!this.saveData) return;
    const nextSave = this.options.saveManager.save({
      ...this.saveData,
      currentScreenId: "explore",
      currentChapterId: `p12_${areaId}`,
      currentLocationId: "shimanami",
      currentAreaId: areaId,
      p12SessionElapsedMs: Math.round(this.p12PlaytimeMs)
    });
    this.options.screenManager.change("explore", {
      saveData: nextSave,
      locationId: "shimanami",
      areaId
    });
  }

  private handleShimanamiInteractable(interactableId: string): void {
    if (!this.saveData) return;

    switch (interactableId) {
      case "p12_hub_log":
        this.recordP12Discovery("hub_route", "航路図に、橋道と小舟道が同じ見張り台へ集まることが記されている。");
        return;
      case "p12_hub_bridge_route":
        this.saveData = this.options.saveManager.save({
          ...this.saveData,
          flags: { ...this.saveData.flags, p12_route_bridge: true, p12_started: true }
        });
        this.recordP12Discovery("hub_route", "橋道を選んだ。細い鈴の音が、風の記憶へ導いている。");
        this.checkpointP12("hub");
        this.transitionP12("A2-1");
        return;
      case "p12_hub_boat_route":
        this.saveData = this.options.saveManager.save({
          ...this.saveData,
          flags: { ...this.saveData.flags, p12_route_boat: true, p12_started: true }
        });
        this.recordP12Discovery("hub_route", "小舟道を選んだ。潮の音が、島の暮らしの記憶へ導いている。");
        this.checkpointP12("hub");
        this.transitionP12("A2-2");
        return;
      case "p12_hub_windmill":
        if (!this.saveData.flags.p12_wind_ability) {
          this.message = "港の風車はまだ止まっている。風よみを得たあとなら、羽根の意味が変わりそうだ。";
        } else {
          this.activateP12WindmillRevisit();
        }
        return;
      case "p12_hub_scenic_point":
        this.recordP12Discovery("hub_scenic", "港の景勝点から、橋と島の位置が一つの旅の地図として見えた。");
        return;
      case "p12_bridge_discovery":
        this.recordP12Discovery("bridge_memory", "橋の欄干に残った星形の紐が、昔の風の記憶を見せてくれた。");
        return;
      case "p12_bridge_wind_puzzle":
        this.saveData = this.options.saveManager.save({
          ...this.saveData,
          flags: { ...this.saveData.flags, p12_bridge_sail_aligned: true }
        });
        this.windRevealRemainingMs = 4200;
        this.recordP12Discovery("bridge_wind_puzzle", "帆を海峡の風へ合わせた。短い風道が橋の先を照らした。");
        return;
      case "p12_bridge_to_watchtower":
        this.recordP12Discovery("bridge_memory", "橋の記憶を胸に、海城の見張り台へ向かう。");
        this.checkpointP12("bridge");
        this.transitionP12("A2-3");
        return;
      case "p12_island_discovery":
        this.recordP12Discovery("island_memory", "集落の石垣に刻まれた潮の星が、島の人々の記憶をつないだ。");
        return;
      case "p12_island_star_reward":
        this.saveData = this.options.saveManager.save({
          ...this.saveData,
          acquiredItems: {
            ...this.saveData.acquiredItems,
            p12_star_shard: (this.saveData.acquiredItems.p12_star_shard ?? 0) + 1
          }
        });
        this.recordP12Discovery("island_star_reward", "星のかけらを手に入れた。島の寄り道が、灯台へ向かう光を増やした。");
        return;
      case "p12_island_to_watchtower":
        this.recordP12Discovery("island_memory", "島の記憶を胸に、海城の見張り台へ向かう。");
        this.checkpointP12("island");
        this.transitionP12("A2-3");
        return;
      case "p12_wind_memory":
        if (this.saveData.flags.p12_wind_ability) {
          this.message = "風よみの星は、ひめの中で静かに回っている。";
          return;
        }
        this.saveData = this.options.saveManager.save({
          ...this.saveData,
          flags: { ...this.saveData.flags, p12_started: true, p12_wind_ability: true }
        });
        this.windRevealRemainingMs = 4200;
        this.interactables.forEach((interactable) => interactable.setWindAwake(true));
        this.recordP12Discovery("wind_ability", "風よみを受け取った。止まった風車の羽根が、遠くでひとつだけ動いた。");
        this.checkpointP12("watchtower");
        return;
      case "p12_windmill":
        if (!this.saveData.flags.p12_wind_ability) {
          this.message = "風車は止まっている。先に見張り台の風の星を調べよう。";
          return;
        }
        this.activateP12WindmillRevisit();
        return;
      case "p12_watchtower_to_island":
        if (!this.saveData.flags.p12_wind_ability || !this.saveData.flags.p12_windmill_revisited) {
          this.message = "風車の変化を確かめるまで、上島への風の道は見えない。";
          return;
        }
        this.checkpointP12("watchtower_exit");
        this.transitionP12("A2-4");
        return;
      case "p12_kamijima_discovery":
        this.recordP12Discovery("kamijima_memory", "上島の石に、灯台へ風を返す願いが残っている。");
        return;
      case "p12_watchtower_scenic":
        this.recordP12Discovery("watchtower_scenic", "見張り台から海を読む知恵を受け取った。風と潮の向きが灯台へ重なる。");
        return;
      case "p12_kamijima_shortcut":
        if (!this.saveData.flags.p12_wind_ability) {
          this.message = "この細道は風よみを手に入れてから見えるようになる。";
          return;
        }
        this.saveData = this.options.saveManager.save({
          ...this.saveData,
          flags: { ...this.saveData.flags, p12_kamijima_shortcut_open: true }
        });
        this.windRevealRemainingMs = 4200;
        this.recordP12Discovery("kamijima_shortcut", "風よみで見つけた近道が、以前の島道を灯台へつないだ。");
        return;
      case "p12_kamijima_to_boss":
        if (!this.saveData.flags.p12_kamijima_shortcut_open) {
          this.message = "風の近道をひらくと、灯台への風道がつながる。青い風の壁を調べよう。";
          return;
        }
        if (!p12RequiredEnemiesCleared(this.saveData)) {
          this.message = "島道の影をまだ感じる。選んだ道の影と、上島の影をしずめよう。";
          return;
        }
        this.checkpointP12("upper_island");
        this.transitionP12("A2-5");
        return;
      case "p12_boss_altar":
        this.message = this.saveData.flags.p12_completed
          ? "灯台の祭壇に、しまなみの星が静かに戻っている。"
          : "祭壇の向こうで、しまかぜ大だこが星の光を抱えている。";
        return;
      case "p12_boss_to_island":
        this.transitionP12("A2-4");
        return;
      default:
        this.nearbyInteractable?.interact();
    }
  }

  private handleCastleInteractable(interactableId: string): void {
    if (!this.saveData) return;

    if (interactableId === "castle_gate_hint") {
      this.markCastleHintSeen();
      this.message = "石碑には『三つの影をしずめ、井戸の闇をほどけ』と刻まれている。";
      return;
    }

    if (interactableId === "castle_dark_well") {
      this.tryStartCastleDarkWell();
      return;
    }

    if (interactableId === "castle_guard_shrine") {
      this.tryStartCastleGuardEvent();
      return;
    }

    this.nearbyInteractable?.interact();
  }

  private syncCastleQuestProgress(): void {
    if (!this.saveData) return;

    const nextFlags: Record<string, boolean> = { ...this.saveData.flags, castle_quest_started: true };
    const requiredEnemiesCleared = castleQuest.requiredEnemySymbolIds.every((id) =>
      this.saveData?.defeatedEnemyIds.includes(id)
    );
    const darkWellCleared =
      this.saveData.defeatedEnemyIds.includes(castleQuest.darkWellEnemySymbolId) ||
      nextFlags.castle_dark_well_cleared === true;
    const guardObtained =
      nextFlags.shiroyama_guard_obtained === true ||
      this.saveData.acquiredCharms.includes(castleQuest.rewardCharmId);

    let status = this.saveData.castleQuestStatus;
    if (status === "notStarted") status = "started";
    if (nextFlags.castle_hint_seen && status === "started") status = "hintSeen";
    if (requiredEnemiesCleared) {
      nextFlags.castle_required_enemies_cleared = true;
      status = "enemiesCleared";
    }
    if (darkWellCleared) {
      nextFlags.castle_dark_well_cleared = true;
      nextFlags.castle_guard_ready = true;
      status = "guardReady";
    }
    if (guardObtained) {
      nextFlags.shiroyama_guard_obtained = true;
      nextFlags.castle_boss_route_unlocked = true;
      nextFlags.p8_kagemasa_route_unlocked = true;
      status = "cleared";
    }

    const flagsChanged = Object.entries(nextFlags).some(
      ([key, value]) => this.saveData?.flags[key] !== value
    );
    if (flagsChanged || status !== this.saveData.castleQuestStatus) {
      this.saveData = this.options.saveManager.save({
        ...this.saveData,
        castleQuestStatus: status,
        flags: nextFlags
      });
    }
  }

  private markCastleHintSeen(): void {
    if (!this.saveData || this.saveData.flags.castle_hint_seen) return;
    this.saveData = this.options.saveManager.save({
      ...this.saveData,
      castleQuestStatus: this.saveData.castleQuestStatus === "started" ? "hintSeen" : this.saveData.castleQuestStatus,
      flags: {
        ...this.saveData.flags,
        castle_quest_started: true,
        castle_hint_seen: true
      }
    });
  }

  private getCastleQuestObjective(): string {
    if (!this.saveData) return "もくてき：松山城を調べよう";
    if (this.saveData.flags.shiroyama_guard_obtained) {
      return "もくてき：城山のまもりを手に入れた。カゲマサのもとへ進む準備が整った";
    }
    if (!this.saveData.flags.castle_hint_seen) {
      return "もくてき：城山の見回りか登城口の石碑から手がかりを得よう";
    }
    const remaining = castleQuest.requiredEnemySymbolIds.filter((id) => !this.saveData?.defeatedEnemyIds.includes(id)).length;
    if (remaining > 0) return `もくてき：松山城の三つの影をしずめよう（あと${remaining}体）`;
    if (!this.saveData.flags.castle_dark_well_cleared) return "もくてき：くらやみ井戸の闇をほどこう";
    return "もくてき：天守前の祠で城山のまもりを受け取ろう";
  }

  private tryStartCastleDarkWell(): void {
    if (!this.saveData) return;
    this.syncCastleQuestProgress();

    if (!this.saveData.flags.castle_required_enemies_cleared) {
      this.message = "井戸の闇が強すぎる。先に、松山城をふさぐ三つの影をしずめよう。";
      return;
    }

    if (!this.saveData.defeatedEnemyIds.includes(castleQuest.darkWellEnemySymbolId)) {
      const wellEnemy = this.enemySymbols.find((enemy) => enemy.symbolId === castleQuest.darkWellEnemySymbolId);
      if (wellEnemy) {
        this.message = "井戸の底から黒い影が立ちのぼった。くらやみ井戸と向き合おう。";
        this.startBattle(wellEnemy);
        return;
      }
    }

    this.saveData = this.options.saveManager.save({
      ...this.saveData,
      castleQuestStatus: "guardReady",
      flags: {
        ...this.saveData.flags,
        castle_dark_well_cleared: true,
        castle_guard_ready: true
      },
      lastSynopsis: "松山城のくらやみ井戸をしずめ、天守前に守りの光が戻りました。"
    });
    this.tryStartDialogue("castle_guard_ready_hint");
    this.message = "井戸の闇がほどけた。天守前の祠へ向かおう。";
  }

  private tryStartCastleGuardEvent(): void {
    if (!this.saveData) return;
    this.syncCastleQuestProgress();

    if (!this.saveData.flags.castle_dark_well_cleared) {
      this.message = "祠はまだ暗いままだ。くらやみ井戸の闇をほどく必要がありそうだ。";
      return;
    }

    if (this.saveData.flags.shiroyama_guard_obtained) {
      this.message = "城山のまもりは、ひめのペンダントのそばで静かに光っている。";
      return;
    }

    this.castleGuardEventMs = 1;
    this.message = "祠から、石垣色のやさしい光がこぼれはじめた。";
    this.nearbyInteractable = null;
    this.nearbyNpc = null;
  }

  private renderCastleGuardEvent(ctx: CanvasRenderingContext2D): void {
    if (this.castleGuardEventMs <= 0) return;
    const { canvas } = ctx;
    const t = this.castleGuardEventMs / CASTLE_GUARD_EVENT_DURATION_MS;
    ctx.save();
    ctx.fillStyle = `rgba(80, 58, 110, ${Math.min(0.34, t * 0.52)})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const pulse = Math.sin(this.elapsedTimeMs / 180) * 0.5 + 0.5;
    const size = 150 + pulse * 18;
    const image = this.options.assetLoader.getImage("card_castle_guard");
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = Math.min(1, t * 2.8);
    ctx.translate(canvas.width / 2, canvas.height / 2 - 24);
    if (image) {
      ctx.drawImage(image, -size / 2, -size / 2, size, size);
    } else {
      this.drawTinyStar(ctx, 0, 0, size / 4, "rgba(210, 220, 255, 0.9)");
    }
    ctx.restore();

    if (t > 0.2 && t < 0.55) this.message = "シロ「それが城山のまもり。影の道を通るための、小さな守りだよ。」";
    else if (t >= 0.55) this.message = "ひめ「これで、カゲマサのいる場所へ進めるんだね。」";
  }

  private completeCastleGuardEvent(): void {
    if (!this.saveData || this.saveData.flags.shiroyama_guard_obtained) {
      this.castleGuardEventMs = 0;
      return;
    }

    const acquiredCharms = Array.from(new Set([...this.saveData.acquiredCharms, castleQuest.rewardCharmId]));
    const clearedQuestIds = Array.from(new Set([...this.saveData.clearedQuestIds, castleQuest.id]));
    const unlockedCards = Array.from(new Set([...this.saveData.unlockedCards, "card_castle_guard"]));
    this.saveData = this.options.saveManager.save({
      ...this.saveData,
      castleQuestStatus: "cleared",
      currentChapterId: "p8_ready",
      acquiredCharms,
      acquiredItems: {
        ...this.saveData.acquiredItems,
        shiroyama_guard: 1
      },
      unlockedCards,
      clearedQuestIds,
      flags: {
        ...this.saveData.flags,
        castle_quest_started: true,
        castle_required_enemies_cleared: true,
        castle_dark_well_cleared: true,
        castle_guard_ready: true,
        shiroyama_guard_obtained: true,
        castle_boss_route_unlocked: true,
        p8_kagemasa_route_unlocked: true
      },
      lastSynopsis: "松山城で城山のまもりを受け取り、カゲマサがいる場所へ進む条件が整いました。"
    });
    this.castleGuardEventMs = 0;
    this.message = "城山のまもりを手に入れた。カゲマサがいる場所への道が開いた。";
  }

  private tryStartYunoStarEvent(): void {
    if (!this.saveData || this.saveData.flags.yuno_star_event_seen) return;
    this.syncQuestProgress();
    const ready = this.saveData.flags.prologue_completed === true &&
      this.saveData.flags.mikan_core_stolen === true &&
      this.saveData.flags.dogo_quest_started === true &&
      this.saveData.flags.dogo_quest_hint_seen === true &&
      dogoQuest.requiredEnemySymbolIds.every((id) => this.saveData?.defeatedEnemyIds.includes(id));
    if (!ready) {
      this.message = this.saveData.flags.dogo_quest_hint_seen
        ? "湯の星の光はまだ弱い。町で迷っている影を、先にしずめよう。"
        : "湯けむりの奥に光を感じる。まずは町の人に話を聞いてみよう。";
      this.updateUi();
      return;
    }
    this.yunoEventMs = 1;
    this.message = "シロ「ひめ、見て。湯けむりの中に星があるよ。」";
    this.nearbyInteractable = null;
    this.nearbyNpc = null;
  }

  private renderYunoStarEvent(ctx: CanvasRenderingContext2D): void {
    if (this.yunoEventMs <= 0) return;
    const { canvas } = ctx;
    const t = this.yunoEventMs / YUNO_EVENT_DURATION_MS;
    ctx.save();
    ctx.fillStyle = `rgba(255,244,210,${Math.min(.34, t * .5)})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const draw = (id: string, size: number, alpha: number, spin = 0) => {
      const image = this.options.assetLoader.getImage(id);
      if (!image) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.globalCompositeOperation = "screen";
      ctx.translate(canvas.width / 2, canvas.height / 2 - 20);
      ctx.rotate(spin);
      ctx.drawImage(image, -size / 2, -size / 2, size, size);
      ctx.restore();
    };
    if (t > .08) draw("fx_yuno_star_burst", 430, Math.min(1, (t - .08) * 5), t * .5);
    if (t > .18) draw("fx_yuno_star_glow", 360, .8, -t * .25);
    if (t > .28) draw("fx_yuno_star_particles", 510, .9, t * .3);
    if (t > .42) draw("fx_yuno_star", 220 + Math.sin(this.elapsedTimeMs / 180) * 7, Math.min(1, (t - .42) * 5));
    if (t > .72) {
      ctx.fillStyle = `rgba(255,255,255,${Math.sin((t - .72) / .28 * Math.PI) * .75})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.restore();
    if (t > .2 && t < .4) this.message = "ひめ「これが、道後温泉の湯の星？」";
    else if (t >= .4 && t < .62) this.message = "シロ「町のあたたかい思いが、ひとつの星になったものだよ。」";
    else if (t >= .62) this.message = "ひめ「黒い影が向かった、松山城へ行こう。」";
  }

  private completeYunoStarEvent(): void {
    if (!this.saveData || this.saveData.flags.yuno_star_event_seen) {
      this.yunoEventMs = 0;
      return;
    }
    const collectedStars = Array.from(new Set([...this.saveData.collectedStars, "dogo"]));
    const unlockedLocations = Array.from(new Set([...this.saveData.unlockedLocations, "dogo", "castle"]));
    const clearedQuestIds = Array.from(new Set([...this.saveData.clearedQuestIds, dogoQuest.id]));
    const nextSave = this.options.saveManager.save({
      ...this.saveData,
      currentScreenId: "starMap",
      currentChapterId: "star_map",
      starLevel: Math.max(2, this.saveData.starLevel),
      collectedStars,
      unlockedLocations,
      clearedQuestIds,
      dogoQuestStatus: "cleared",
      flags: {
        ...this.saveData.flags,
        yuno_star_obtained: true,
        yuno_star_event_seen: true,
        star_dogo_collected: true,
        dogo_quest_cleared: true,
        star_map_unlocked: true,
        location_castle_unlocked: true
      },
      lastSynopsis: "道後温泉で湯の星を取り戻し、星地図と松山城への道が開きました。"
    });
    this.yunoEventMs = 0;
    this.options.screenManager.change("starMap", { saveData: nextSave });
  }

  private goToStarMap(): void {
    if (!this.saveData) {
      return;
    }

    if (!this.saveData.flags.star_map_unlocked) {
      this.message = "シロ「ペンダントの光が弱くて、まだ星地図を開けないみたい。」";
      this.updateUi();
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

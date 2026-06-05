import { floatingMotion } from "../animation/Effects";
import { AssetLoader } from "../core/AssetLoader";
import { resolvePublicAssetPath } from "../core/AssetPath";
import { InputManager } from "../core/InputManager";
import { SaveManager } from "../core/SaveManager";
import { ScreenManager } from "../core/ScreenManager";
import { starMapNodes, type StarMapNodeData, type StarMapNodeStatus } from "../data/starMap";
import {
  getCurrentObjective,
  getNodeStatus,
  getSynopsis,
  getTravelDestination,
  isNodeSelectable
} from "../systems/TravelSystem";
import type { GameScreen, ScreenId } from "../types/game";
import type { SaveData } from "../types/save";

type StarMapScreenOptions = {
  uiRoot: HTMLElement;
  screenManager: ScreenManager;
  saveManager: SaveManager;
  inputManager: InputManager;
  assetLoader: AssetLoader;
};

type StarMapScreenParams = {
  saveData?: SaveData;
};

const NODE_RADIUS = 38;

export class StarMapScreen implements GameScreen {
  readonly id: ScreenId = "starMap";

  private saveData: SaveData | null = null;
  private selectedNodeId = "node_dogo";
  private hoveredNodeId: string | null = null;
  private elapsedTimeMs = 0;
  private message = "行き先の星を選んでください。";
  private objectiveElement: HTMLElement | null = null;
  private synopsisElement: HTMLElement | null = null;
  private selectedTitleElement: HTMLElement | null = null;
  private selectedDescriptionElement: HTMLElement | null = null;
  private messageElement: HTMLElement | null = null;
  private saveButton: HTMLButtonElement | null = null;
  private castleDebugButton: HTMLButtonElement | null = null;

  constructor(private readonly options: StarMapScreenOptions) {}

  enter(params?: unknown): void {
    const typedParams = params as StarMapScreenParams | undefined;
    const loadedSave = typedParams?.saveData ?? this.options.saveManager.load();
    const nextSave = this.normalizeSaveData(loadedSave ?? this.options.saveManager.createInitialSaveData());

    this.saveData = this.options.saveManager.save({
      ...nextSave,
      currentScreenId: "starMap",
      currentChapterId: "star_map"
    });
    this.selectedNodeId = this.pickInitialNodeId();
    this.hoveredNodeId = null;
    this.message = "行き先の星を選んでください。";
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

    if (this.options.inputManager.isActionStarted("left") || this.options.inputManager.isActionStarted("up")) {
      this.moveSelection(-1);
    }

    if (this.options.inputManager.isActionStarted("right") || this.options.inputManager.isActionStarted("down")) {
      this.moveSelection(1);
    }

    if (this.options.inputManager.isActionStarted("confirm")) {
      this.activateNodeById(this.selectedNodeId);
      return;
    }

    this.updatePointerSelection();
    this.updateUi();
  }

  render(ctx: CanvasRenderingContext2D): void {
    const { canvas } = ctx;
    const background = this.options.assetLoader.getImage("bg_star_map");

    if (background) {
      this.drawCoverImage(ctx, background, 0, 0, canvas.width, canvas.height);
    } else {
      this.options.assetLoader.drawImageOrFallback(
        ctx,
        "bg_star_map",
        0,
        0,
        canvas.width,
        canvas.height,
        "star map"
      );
    }

    this.drawMapAtmosphere(ctx);
    this.drawNodeConnections(ctx);
    this.drawNodes(ctx);
  }

  exit(): void {
    this.options.uiRoot.innerHTML = "";
    this.objectiveElement = null;
    this.synopsisElement = null;
    this.selectedTitleElement = null;
    this.selectedDescriptionElement = null;
    this.messageElement = null;
    this.saveButton = null;
    this.castleDebugButton = null;
  }

  private renderUi(): void {
    this.options.uiRoot.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "star-map-ui";

    const panel = document.createElement("section");
    panel.className = "star-map-panel generated-star-map-panel";
    panel.style.setProperty(
      "--star-map-panel-frame-image",
      `url("${resolvePublicAssetPath("/assets/generated/ui/star_map_panel_frame.png")}")`
    );

    const title = document.createElement("p");
    title.className = "ui-kicker";
    title.textContent = "星地図";

    this.objectiveElement = document.createElement("h2");
    this.synopsisElement = document.createElement("p");
    this.synopsisElement.className = "star-map-synopsis";

    this.selectedTitleElement = document.createElement("h3");
    this.selectedDescriptionElement = document.createElement("p");
    this.selectedDescriptionElement.className = "star-map-description";

    this.messageElement = document.createElement("p");
    this.messageElement.className = "star-map-message";

    const actions = document.createElement("div");
    actions.className = "star-map-actions";

    this.saveButton = document.createElement("button");
    this.saveButton.className = "menu-button";
    this.saveButton.type = "button";
    this.saveButton.textContent = "手動セーブ";
    this.saveButton.addEventListener("click", () => this.manualSave());

    const backButton = document.createElement("button");
    backButton.className = "menu-button secondary-button";
    backButton.type = "button";
    backButton.textContent = "タイトルへ戻る";
    backButton.addEventListener("click", () => this.options.screenManager.change("title"));

    actions.append(this.saveButton, backButton);

    if (import.meta.env.DEV) {
      this.castleDebugButton = document.createElement("button");
      this.castleDebugButton.className = "menu-button star-map-debug-button";
      this.castleDebugButton.type = "button";
      this.castleDebugButton.textContent = "デバッグ：道後クリア扱い";
      this.castleDebugButton.addEventListener("click", () => this.markDogoClearedForDebug());
      actions.append(this.castleDebugButton);
    }

    const hints = document.createElement("p");
    hints.className = "star-map-hints";
    hints.textContent = "選択：クリック / Enter　移動：矢印　戻る：Esc";

    panel.append(
      title,
      this.objectiveElement,
      this.synopsisElement,
      this.selectedTitleElement,
      this.selectedDescriptionElement,
      this.messageElement,
      actions,
      hints
    );
    wrapper.append(panel);
    this.options.uiRoot.append(wrapper);
  }

  private updateUi(): void {
    if (!this.saveData) {
      return;
    }

    const selectedNode = this.getSelectedNode();
    const selectedStatus = selectedNode ? getNodeStatus(selectedNode, this.saveData) : "locked";

    if (this.objectiveElement) {
      this.objectiveElement.textContent = getCurrentObjective(this.saveData);
    }

    if (this.synopsisElement) {
      this.synopsisElement.textContent = getSynopsis(this.saveData);
    }

    if (this.selectedTitleElement) {
      this.selectedTitleElement.textContent = selectedNode
        ? `${selectedNode.name} / ${this.getStatusLabel(selectedStatus)}`
        : "星を選択";
    }

    if (this.selectedDescriptionElement) {
      this.selectedDescriptionElement.textContent = selectedNode?.description ?? "";
    }

    if (this.messageElement) {
      this.messageElement.textContent = this.message;
    }
  }

  private updatePointerSelection(): void {
    const pointer = this.options.inputManager.getPointer();
    const hoveredNode = this.findNodeAt(pointer.x, pointer.y);
    this.hoveredNodeId = hoveredNode?.id ?? null;

    if (hoveredNode) {
      this.selectedNodeId = hoveredNode.id;
    }

    if (hoveredNode && pointer.started) {
      this.activateNodeById(hoveredNode.id);
    }
  }

  private activateNodeById(nodeId: string): void {
    if (!this.saveData) {
      return;
    }

    const node = starMapNodes.find((candidate) => candidate.id === nodeId);

    if (!node) {
      return;
    }

    const destination = getTravelDestination(node, this.saveData);

    if (destination.type === "message") {
      this.message = destination.message;
      this.updateUi();
      return;
    }

    const nextSave = this.options.saveManager.save({
      ...this.saveData,
      currentScreenId: destination.screenId,
      currentLocationId: destination.locationId,
      currentAreaId: destination.areaId
    });

    this.options.screenManager.change(destination.screenId, {
      saveData: nextSave,
      locationId: destination.locationId,
      areaId: destination.areaId
    });
  }

  private manualSave(): void {
    if (!this.saveData) {
      return;
    }

    this.saveData = this.options.saveManager.save({
      ...this.saveData,
      currentScreenId: "starMap"
    });
    this.message = "星地図の状態を保存しました。";
    this.updateUi();
  }

  private markDogoClearedForDebug(): void {
    if (!this.saveData) {
      return;
    }

    this.saveData = this.options.saveManager.save({
      ...this.saveData,
      collectedStars: Array.from(new Set([...this.saveData.collectedStars, "dogo"])),
      unlockedLocations: Array.from(new Set([...this.saveData.unlockedLocations, "dogo", "castle"])),
      flags: {
        ...this.saveData.flags,
        star_dogo_collected: true,
        location_castle_unlocked: true
      },
      lastSynopsis: "道後温泉で湯の星の光を見つけ、松山城へ向かう道が星地図に浮かびました。"
    });
    this.message = "デバッグ：道後クリア扱いにしました。";
    this.updateUi();
  }

  private normalizeSaveData(saveData: SaveData): SaveData {
    const normalizedLocations = saveData.unlockedLocations.map((locationId) =>
      locationId === "dogo_onsen" ? "dogo" : locationId
    );

    return {
      ...saveData,
      currentLocationId: saveData.currentLocationId === "dogo_onsen" ? "dogo" : saveData.currentLocationId,
      unlockedLocations: Array.from(new Set(["dogo", ...normalizedLocations])),
      flags: {
        location_castle_unlocked: false,
        ...saveData.flags
      }
    };
  }

  private pickInitialNodeId(): string {
    if (!this.saveData) {
      return "node_dogo";
    }

    const selectedNode =
      starMapNodes.find((node) => isNodeSelectable(node, this.saveData as SaveData)) ??
      starMapNodes[0];

    return selectedNode?.id ?? "node_dogo";
  }

  private moveSelection(direction: 1 | -1): void {
    const currentIndex = Math.max(0, starMapNodes.findIndex((node) => node.id === this.selectedNodeId));
    const nextIndex = (currentIndex + direction + starMapNodes.length) % starMapNodes.length;
    this.selectedNodeId = starMapNodes[nextIndex]?.id ?? "node_dogo";
  }

  private getSelectedNode(): StarMapNodeData | undefined {
    return starMapNodes.find((node) => node.id === this.selectedNodeId);
  }

  private findNodeAt(x: number, y: number): StarMapNodeData | undefined {
    return starMapNodes.find((node) => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.hypot(dx, dy) <= NODE_RADIUS;
    });
  }

  private drawNodeConnections(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.strokeStyle = "rgba(255, 226, 135, 0.42)";
    ctx.lineWidth = 2;
    ctx.setLineDash([9, 12]);

    const dogo = starMapNodes[0];
    if (dogo) {
      for (const node of starMapNodes.slice(1)) {
        ctx.beginPath();
        ctx.moveTo(dogo.x, dogo.y);
        ctx.quadraticCurveTo((dogo.x + node.x) / 2, dogo.y - 95, node.x, node.y);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  private drawNodes(ctx: CanvasRenderingContext2D): void {
    if (!this.saveData) {
      return;
    }

    for (const node of starMapNodes) {
      const status = getNodeStatus(node, this.saveData);
      const selected = node.id === this.selectedNodeId;
      const hovered = node.id === this.hoveredNodeId;
      this.drawNode(ctx, node, status, selected || hovered);
    }
  }

  private drawNode(
    ctx: CanvasRenderingContext2D,
    node: StarMapNodeData,
    status: StarMapNodeStatus,
    selected: boolean
  ): void {
    const image = this.options.assetLoader.getImage(this.getIconAssetId(status));
    const badge = node.badgeAssetId ? this.options.assetLoader.getImage(node.badgeAssetId) : undefined;
    const motion = floatingMotion(this.elapsedTimeMs + node.x * 3 + node.y, status === "locked" ? 2 : 5, 2100);
    const pulse = this.getNodePulse(status, selected);
    const x = node.x + motion.x;
    const y = node.y + motion.y;
    const size = NODE_RADIUS * 1.62 * pulse;

    ctx.save();
    ctx.globalCompositeOperation = status === "locked" ? "source-over" : "lighter";
    ctx.globalAlpha = this.getNodeGlowAlpha(status, selected);
    const glow = ctx.createRadialGradient(x, y, 4, x, y, NODE_RADIUS * 2.1 * pulse);
    glow.addColorStop(0, status === "locked" ? "rgba(80, 75, 98, 0.35)" : "rgba(255, 216, 92, 0.62)");
    glow.addColorStop(1, "rgba(255, 216, 92, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, NODE_RADIUS * 2.1 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (image) {
      ctx.save();
      ctx.globalAlpha = status === "locked" ? 0.86 : 1;
      ctx.drawImage(image, x - size / 2, y - size / 2, size, size);
      ctx.restore();
    } else {
      this.drawFallbackStar(ctx, x, y, size, status);
    }

    if (badge) {
      const badgeSize = 42 * (selected ? 1.08 : 1);
      ctx.drawImage(badge, x + 20, y + 18, badgeSize, badgeSize);
    }

    ctx.save();
    ctx.fillStyle = status === "locked" ? "rgba(48, 43, 51, 0.86)" : "rgba(75, 43, 21, 0.9)";
    ctx.strokeStyle = "rgba(255, 247, 220, 0.72)";
    ctx.lineWidth = 4;
    ctx.font = "700 18px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.strokeText(node.name, x, y + NODE_RADIUS + 12);
    ctx.fillText(node.name, x, y + NODE_RADIUS + 12);
    ctx.restore();
  }

  private drawMapAtmosphere(ctx: CanvasRenderingContext2D): void {
    const { canvas } = ctx;

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (let i = 0; i < 12; i += 1) {
      const x = ((i * 173 + this.elapsedTimeMs * 0.018) % (canvas.width + 80)) - 40;
      const y = 74 + ((i * 47) % 520);
      const radius = 2.8 + (i % 4);
      const alpha = 0.16 + Math.sin(this.elapsedTimeMs / 900 + i) * 0.08;
      ctx.globalAlpha = Math.max(0.06, alpha);
      ctx.fillStyle = "#fff1a5";
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private getIconAssetId(status: StarMapNodeStatus): string {
    if (status === "cleared") {
      return "ui_star_icon_cleared";
    }

    if (status === "unlocked" || status === "inProgress") {
      return "ui_star_icon_unlocked";
    }

    return "ui_star_icon_locked";
  }

  private getNodePulse(status: StarMapNodeStatus, selected: boolean): number {
    const selectedScale = selected ? 1.12 + Math.sin(this.elapsedTimeMs / 260) * 0.035 : 1;

    if (status === "locked") {
      return selectedScale * (0.92 + Math.sin(this.elapsedTimeMs / 1200) * 0.02);
    }

    if (status === "cleared") {
      return selectedScale * (1.04 + Math.sin(this.elapsedTimeMs / 1900) * 0.015);
    }

    return selectedScale * (1 + Math.sin(this.elapsedTimeMs / 780) * 0.05);
  }

  private getNodeGlowAlpha(status: StarMapNodeStatus, selected: boolean): number {
    const selectedBoost = selected ? 0.22 : 0;

    if (status === "locked") {
      return 0.24 + Math.sin(this.elapsedTimeMs / 1400) * 0.08 + selectedBoost;
    }

    if (status === "cleared") {
      return 0.48 + selectedBoost;
    }

    return 0.42 + Math.sin(this.elapsedTimeMs / 650) * 0.18 + selectedBoost;
  }

  private getStatusLabel(status: StarMapNodeStatus): string {
    switch (status) {
      case "cleared":
        return "クリア済み";
      case "unlocked":
        return "選択できます";
      case "inProgress":
        return "探索中";
      case "locked":
        return "未解放";
    }
  }

  private drawFallbackStar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    status: StarMapNodeStatus
  ): void {
    const outer = size / 2;
    const inner = outer * 0.44;

    ctx.save();
    ctx.fillStyle = status === "locked" ? "#443d4f" : "#f4b647";
    ctx.strokeStyle = "rgba(255, 245, 209, 0.88)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < 10; i += 1) {
      const radius = i % 2 === 0 ? outer : inner;
      const angle = -Math.PI / 2 + (i * Math.PI) / 5;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawCoverImage(
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const imageRatio = image.naturalWidth / image.naturalHeight;
    const targetRatio = width / height;
    let sourceWidth = image.naturalWidth;
    let sourceHeight = image.naturalHeight;
    let sourceX = 0;
    let sourceY = 0;

    if (imageRatio > targetRatio) {
      sourceWidth = image.naturalHeight * targetRatio;
      sourceX = (image.naturalWidth - sourceWidth) / 2;
    } else {
      sourceHeight = image.naturalWidth / targetRatio;
      sourceY = (image.naturalHeight - sourceHeight) / 2;
    }

    ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
  }
}

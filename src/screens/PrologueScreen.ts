import { AssetLoader } from "../core/AssetLoader";
import { InputManager } from "../core/InputManager";
import { SaveManager } from "../core/SaveManager";
import { ScreenManager } from "../core/ScreenManager";
import { prologueScenes } from "../data/prologueScenes";
import type { GameScreen, ScreenId } from "../types/game";
import type { SaveData } from "../types/save";

type PrologueScreenOptions = {
  uiRoot: HTMLElement;
  screenManager: ScreenManager;
  saveManager: SaveManager;
  inputManager: InputManager;
  assetLoader: AssetLoader;
};

export class PrologueScreen implements GameScreen {
  readonly id: ScreenId = "prologue";
  private saveData: SaveData | null = null;
  private sceneIndex = 0;
  private lineIndex = 0;
  private elapsedMs = 0;
  private speakerElement: HTMLElement | null = null;
  private textElement: HTMLElement | null = null;
  private progressElement: HTMLElement | null = null;

  constructor(private readonly options: PrologueScreenOptions) {}

  enter(params?: unknown): void {
    const typed = params as { saveData?: SaveData } | undefined;
    this.saveData = typed?.saveData ?? this.options.saveManager.load() ??
      this.options.saveManager.createInitialSaveData();
    if (this.saveData.flags.prologue_completed) {
      this.goToDogo();
      return;
    }
    this.sceneIndex = 0;
    this.lineIndex = 0;
    this.elapsedMs = 0;
    this.saveData = this.options.saveManager.save({
      ...this.saveData,
      currentScreenId: "prologue",
      currentChapterId: "prologue",
      flags: { ...this.saveData.flags, prologue_started: true }
    });
    this.renderUi();
    this.updateUi();
  }

  update(deltaTime: number): void {
    this.elapsedMs += deltaTime * 1000;
    if (this.options.inputManager.isActionStarted("cancel")) {
      this.completePrologue(true);
    } else if (this.options.inputManager.isActionStarted("confirm")) {
      this.advance();
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const scene = prologueScenes[this.sceneIndex];
    if (!scene) return;
    const { canvas } = ctx;
    const zoom = 1.025 + Math.min(0.035, this.elapsedMs / 45000);
    this.drawCover(ctx, scene.backgroundAssetId, zoom, Math.sin(this.elapsedMs / 4200) * 8);
    ctx.save();
    ctx.fillStyle = scene.anomaly ? "rgba(24,44,100,.24)" : "rgba(38,22,12,.08)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (scene.steam) this.drawSteam(ctx);
    if (scene.grandma) this.drawLayer(ctx, "prologue_grandma", 40, 80, 430, 640);
    if (scene.hime) {
      const asset = scene.hime === "surprised" ? "prologue_hime_surprised" : "prologue_hime_normal";
      this.drawLayer(ctx, asset, canvas.width - 440, 96, 360, 570);
    }
    if (scene.shiro) {
      const frame = Math.floor(this.elapsedMs / 260) % 2 === 0 ? "prologue_shiro_fly_01" : "prologue_shiro_fly_02";
      const floatY = Math.sin(this.elapsedMs / 520) * 10;
      this.drawLayer(ctx, frame, canvas.width * .48, 130 + floatY, 250, 220);
    }
    if (scene.shadow) {
      const slide = Math.min(1, this.elapsedMs / 900);
      this.drawLayer(ctx, "prologue_minion_shadow", canvas.width - 340 + (1 - slide) * 260, 90, 330, 420);
    }
    if (scene.pendant) {
      const pulse = scene.pendant === "full" ? 1 + Math.sin(this.elapsedMs / 270) * .05 : 1;
      const asset = scene.pendant === "full" ? "prologue_pendant_full" : "prologue_pendant_empty";
      ctx.save();
      if (scene.pendant === "full") {
        ctx.globalCompositeOperation = "screen";
        ctx.shadowColor = "#ffd66b";
        ctx.shadowBlur = 28 + Math.sin(this.elapsedMs / 250) * 10;
      }
      this.drawLayer(ctx, asset, canvas.width / 2 - 80 * pulse, 280 - 80 * pulse, 160 * pulse, 160 * pulse);
      ctx.restore();
    }
    if (scene.id === "core_stolen") {
      const t = Math.min(1, this.elapsedMs / 1300);
      ctx.strokeStyle = `rgba(255,224,125,${1 - t})`;
      ctx.lineWidth = 12 * (1 - t) + 2;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 360);
      ctx.quadraticCurveTo(canvas.width * .7, 250, canvas.width * .88, 160);
      ctx.stroke();
    }
    const fade = Math.max(0, 1 - this.elapsedMs / 420);
    if (fade > 0) {
      ctx.fillStyle = `rgba(255,250,230,${fade})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.restore();
  }

  exit(): void {
    this.options.uiRoot.innerHTML = "";
  }

  private renderUi(): void {
    this.options.uiRoot.innerHTML = "";
    const wrapper = document.createElement("div");
    wrapper.className = "prologue-ui";
    const panel = document.createElement("section");
    panel.className = "prologue-dialogue";
    this.progressElement = document.createElement("p");
    this.progressElement.className = "prologue-progress";
    this.speakerElement = document.createElement("h2");
    this.textElement = document.createElement("p");
    this.textElement.className = "prologue-text";
    const actions = document.createElement("div");
    actions.className = "prologue-actions";
    const next = document.createElement("button");
    next.className = "menu-button";
    next.textContent = "つぎへ";
    next.addEventListener("click", () => this.advance());
    const skip = document.createElement("button");
    skip.className = "menu-button secondary-button";
    skip.textContent = "プロローグをスキップ";
    skip.addEventListener("click", () => this.completePrologue(true));
    actions.append(next, skip);
    panel.append(this.progressElement, this.speakerElement, this.textElement, actions);
    wrapper.append(panel);
    this.options.uiRoot.append(wrapper);
  }

  private updateUi(): void {
    const scene = prologueScenes[this.sceneIndex];
    const line = scene?.lines[this.lineIndex];
    if (!scene || !line) return;
    if (this.progressElement) this.progressElement.textContent = `${this.sceneIndex + 1} / ${prologueScenes.length} - ${scene.title}`;
    if (this.speakerElement) this.speakerElement.textContent = line.speaker;
    if (this.textElement) this.textElement.textContent = line.text;
  }

  private advance(): void {
    const scene = prologueScenes[this.sceneIndex];
    if (!scene) return;
    if (this.lineIndex < scene.lines.length - 1) {
      this.lineIndex++;
      this.updateUi();
      return;
    }
    if (this.sceneIndex < prologueScenes.length - 1) {
      this.sceneIndex++;
      this.lineIndex = 0;
      this.elapsedMs = 0;
      this.updateUi();
      return;
    }
    this.completePrologue(false);
  }

  private completePrologue(skipped: boolean): void {
    if (!this.saveData) return;
    this.saveData = this.options.saveManager.save({
      ...this.saveData,
      currentScreenId: "explore",
      currentChapterId: "dogo_explore",
      dogoQuestStatus: "started",
      flags: {
        ...this.saveData.flags,
        prologue_completed: true,
        prologue_skipped: skipped,
        shiro_met: true,
        mikan_core_stolen: true,
        dogo_anomaly_started: true,
        dogo_quest_started: true
      },
      lastSynopsis: "道後温泉でシロと出会い、奪われたみかん星の核を追うことになりました。"
    });
    this.goToDogo();
  }

  private goToDogo(): void {
    if (!this.saveData) return;
    this.options.screenManager.change("explore", {
      saveData: this.saveData,
      locationId: "dogo",
      areaId: "D0"
    });
  }

  private drawCover(ctx: CanvasRenderingContext2D, assetId: string, zoom: number, offsetX: number): void {
    const image = this.options.assetLoader.getImage(assetId);
    const { canvas } = ctx;
    if (!image) {
      this.options.assetLoader.drawImageOrFallback(ctx, assetId, 0, 0, canvas.width, canvas.height, assetId);
      return;
    }
    const targetRatio = canvas.width / canvas.height;
    const imageRatio = image.naturalWidth / image.naturalHeight;
    let sw = image.naturalWidth;
    let sh = image.naturalHeight;
    if (imageRatio > targetRatio) sw = sh * targetRatio;
    else sh = sw / targetRatio;
    sw /= zoom;
    sh /= zoom;
    const sx = (image.naturalWidth - sw) / 2 - offsetX;
    const sy = (image.naturalHeight - sh) / 2;
    ctx.drawImage(image, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  }

  private drawLayer(ctx: CanvasRenderingContext2D, assetId: string, x: number, y: number, width: number, height: number): void {
    const image = this.options.assetLoader.getImage(assetId);
    if (image) ctx.drawImage(image, x, y, width, height);
  }

  private drawSteam(ctx: CanvasRenderingContext2D): void {
    const { canvas } = ctx;
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (let i = 0; i < 7; i++) {
      const x = ((i * 230 + this.elapsedMs * .025) % (canvas.width + 300)) - 150;
      const y = 160 + (i % 3) * 110 + Math.sin(this.elapsedMs / 700 + i) * 24;
      ctx.fillStyle = "rgba(235,245,255,.1)";
      ctx.beginPath();
      ctx.ellipse(x, y, 180, 48, -.12, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

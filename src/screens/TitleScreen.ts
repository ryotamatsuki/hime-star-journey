import { SpriteAnimator } from "../animation/SpriteAnimator";
import { createSingleFrameAnimationSet } from "../animation/AnimationRegistry";
import { drawEllipseShadow, floatingMotion } from "../animation/Effects";
import { AssetLoader } from "../core/AssetLoader";
import { SaveManager } from "../core/SaveManager";
import { ScreenManager } from "../core/ScreenManager";
import type { GameScreen, ScreenId } from "../types/game";
import type { SaveData } from "../types/save";

type TitleScreenOptions = {
  uiRoot: HTMLElement;
  screenManager: ScreenManager;
  saveManager: SaveManager;
  assetLoader: AssetLoader;
};

export class TitleScreen implements GameScreen {
  readonly id: ScreenId = "title";
  private elapsedTimeMs = 0;
  private himeAnimator: SpriteAnimator | undefined;
  private himeAnimatorSize = "";
  private shiroAnimator: SpriteAnimator | undefined;
  private shiroAnimatorSize = "";

  constructor(private readonly options: TitleScreenOptions) {}

  enter(): void {
    this.renderUi();
  }

  update(deltaTime: number): void {
    this.elapsedTimeMs += deltaTime * 1000;
    this.himeAnimator?.update(deltaTime);
    this.shiroAnimator?.update(deltaTime);
  }

  render(ctx: CanvasRenderingContext2D): void {
    const { canvas } = ctx;
    const background = this.options.assetLoader.getImage("bg_title");

    if (background) {
      this.drawCoverImage(ctx, background, 0, 0, canvas.width, canvas.height);
    } else {
      this.options.assetLoader.drawImageOrFallback(ctx, "bg_title", 0, 0, canvas.width, canvas.height, "title");
    }

    ctx.save();
    ctx.fillStyle = "rgba(18, 20, 26, 0.16)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.drawTitleDecorations(ctx);
    this.drawGeneratedStarParticles(ctx);
    this.drawTitleMenuFrame(ctx);
    this.drawTitleCharacters(ctx);
    ctx.restore();
  }

  exit(): void {
    this.options.uiRoot.innerHTML = "";
  }

  private renderUi(): void {
    const hasSave = this.options.saveManager.exists();
    this.options.uiRoot.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "screen-ui title-screen-ui";

    const menu = document.createElement("section");
    menu.className = "title-menu";

    const title = document.createElement("h1");
    title.className = "screen-title";
    title.textContent = "ひめの小さな星めぐり（仮）";

    const copy = document.createElement("p");
    copy.className = "screen-copy";
    copy.textContent = "小さな星をたどる旅の入口です。";

    const actions = document.createElement("div");
    actions.className = "menu-actions";

    const startButton = document.createElement("button");
    startButton.className = "menu-button";
    startButton.type = "button";
    startButton.textContent = "はじめから";
    startButton.addEventListener("click", () => this.startNewGame());

    const continueButton = document.createElement("button");
    continueButton.className = "menu-button secondary-button";
    continueButton.type = "button";
    continueButton.textContent = "つづきから";
    continueButton.disabled = !hasSave;
    continueButton.addEventListener("click", () => this.continueGame());

    const note = document.createElement("p");
    note.className = "save-note";
    note.textContent = hasSave
      ? "セーブデータが見つかりました。"
      : "セーブデータはまだありません。";

    actions.append(startButton, continueButton);
    menu.append(title, copy, actions, note);
    wrapper.append(menu);
    this.options.uiRoot.append(wrapper);
  }

  private startNewGame(): void {
    const saveData = this.options.saveManager.save(
      this.options.saveManager.createInitialSaveData()
    );

    this.options.screenManager.change("prologue", { saveData });
  }

  private continueGame(): void {
    const saveData = this.options.saveManager.load();

    if (!saveData) {
      this.renderUi();
      return;
    }

    const targetScreen = this.resolveContinueTarget(saveData);
    this.options.screenManager.change(targetScreen, { saveData });
  }

  private resolveContinueTarget(saveData: SaveData): ScreenId {
    if (saveData.currentScreenId === "title") {
      return "prologue";
    }

    if (this.options.screenManager.has(saveData.currentScreenId)) {
      return saveData.currentScreenId;
    }

    return "prologue";
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

  private drawTitleMenuFrame(ctx: CanvasRenderingContext2D): void {
    const frame = this.options.assetLoader.getImage("ui_title_menu_frame");
    const { canvas } = ctx;
    const width = Math.min(470, canvas.width * 0.39);
    const height = Math.min(610, canvas.height * 0.86);
    const x = Math.max(34, canvas.width * 0.045);
    const y = Math.max(28, canvas.height * 0.055);

    if (frame) {
      ctx.save();
      ctx.globalAlpha = 0.98;
      ctx.drawImage(frame, x, y, width, height);
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.fillStyle = "rgba(255, 244, 214, 0.78)";
    ctx.strokeStyle = "rgba(89, 61, 31, 0.72)";
    ctx.lineWidth = 4;
    ctx.fillRect(x + 32, y + 32, width - 64, height - 64);
    ctx.strokeRect(x + 32, y + 32, width - 64, height - 64);
    ctx.restore();
  }

  private drawTitleCharacters(ctx: CanvasRenderingContext2D): void {
    const { canvas } = ctx;
    const hime = this.options.assetLoader.getImage("hime_idle");
    const shiro = this.options.assetLoader.getImage("shiro_idle");
    const himeMotion = floatingMotion(this.elapsedTimeMs, 4, 2600);
    const shiroMotion = floatingMotion(this.elapsedTimeMs + 420, 16, 1900);
    const himeX = canvas.width * 0.76;
    const himeY = canvas.height * 0.925 + himeMotion.y * 0.35;
    const himeWidth = Math.min(215, canvas.width * 0.17);
    const himeHeight = himeWidth * 1.5;
    const himeScale = 1 + Math.sin(this.elapsedTimeMs / 1350) * 0.014;
    const shiroX = canvas.width * 0.62 + shiroMotion.x;
    const shiroY = canvas.height * 0.82 + shiroMotion.y;
    const shiroWidth = Math.min(120, canvas.width * 0.1);
    const shiroHeight = shiroWidth;

    drawEllipseShadow(ctx, himeX, canvas.height * 0.935, himeWidth * 0.58, 23, 0.32);

    if (shiro) {
      drawEllipseShadow(ctx, shiroX, canvas.height * 0.9, shiroWidth * 0.5, 15, 0.14);
      this.getShiroAnimator(shiro).render(ctx, shiro, shiroX, shiroY, {
        anchorX: 0.5,
        anchorY: 1,
        width: shiroWidth,
        height: shiroHeight,
        opacity: 0.98
      });
    } else {
      this.drawMissingCharacter(ctx, shiroX, shiroY - shiroHeight, shiroWidth, shiroHeight, "シロ");
    }

    if (hime) {
      this.getHimeAnimator(hime).render(ctx, hime, himeX + himeMotion.x * 0.2, himeY, {
        anchorX: 0.5,
        anchorY: 1,
        width: himeWidth * himeScale,
        height: himeHeight * himeScale,
        opacity: 0.99
      });
    } else {
      this.drawMissingCharacter(ctx, himeX - himeWidth / 2, himeY - himeHeight, himeWidth, himeHeight, "ひめ");
    }
  }

  private getHimeAnimator(image: HTMLImageElement): SpriteAnimator {
    const sizeKey = `${image.naturalWidth}x${image.naturalHeight}`;
    if (!this.himeAnimator || this.himeAnimatorSize !== sizeKey) {
      this.himeAnimator = new SpriteAnimator(
        createSingleFrameAnimationSet("hime_idle", image.naturalWidth, image.naturalHeight, "idle"),
        "idle"
      );
      this.himeAnimatorSize = sizeKey;
    }

    return this.himeAnimator;
  }

  private getShiroAnimator(image: HTMLImageElement): SpriteAnimator {
    const sizeKey = `${image.naturalWidth}x${image.naturalHeight}`;
    if (!this.shiroAnimator || this.shiroAnimatorSize !== sizeKey) {
      this.shiroAnimator = new SpriteAnimator(
        createSingleFrameAnimationSet("shiro_idle", image.naturalWidth, image.naturalHeight, "idle"),
        "idle"
      );
      this.shiroAnimatorSize = sizeKey;
    }

    return this.shiroAnimator;
  }

  private drawGeneratedStarParticles(ctx: CanvasRenderingContext2D): void {
    const particles = this.options.assetLoader.getImage("fx_title_star_particles");
    if (!particles) {
      return;
    }

    const { canvas } = ctx;
    const columns = 4;
    const rows = 4;
    const cellWidth = particles.naturalWidth / columns;
    const cellHeight = particles.naturalHeight / rows;
    const placements = [
      { x: 0.55, y: 0.12, cell: 0, size: 46, phase: 0 },
      { x: 0.66, y: 0.18, cell: 1, size: 36, phase: 1.4 },
      { x: 0.84, y: 0.2, cell: 3, size: 42, phase: 2.1 },
      { x: 0.52, y: 0.36, cell: 4, size: 38, phase: 0.7 },
      { x: 0.9, y: 0.43, cell: 7, size: 34, phase: 1.9 },
      { x: 0.58, y: 0.68, cell: 9, size: 44, phase: 2.7 },
      { x: 0.86, y: 0.72, cell: 14, size: 40, phase: 3.3 },
      { x: 0.34, y: 0.11, cell: 2, size: 32, phase: 2.4 },
      { x: 0.21, y: 0.78, cell: 12, size: 34, phase: 4.1 },
      { x: 0.74, y: 0.52, cell: 6, size: 46, phase: 3.8 }
    ];

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    for (const placement of placements) {
      const alpha = 0.42 + Math.sin(this.elapsedTimeMs / 650 + placement.phase) * 0.18;
      const bob = Math.sin(this.elapsedTimeMs / 1200 + placement.phase) * 5;
      const cellX = (placement.cell % columns) * cellWidth;
      const cellY = Math.floor(placement.cell / rows) * cellHeight;
      const size = placement.size * (1 + Math.sin(this.elapsedTimeMs / 1500 + placement.phase) * 0.08);

      ctx.globalAlpha = Math.max(0.18, alpha);
      ctx.drawImage(
        particles,
        cellX,
        cellY,
        cellWidth,
        cellHeight,
        canvas.width * placement.x - size / 2,
        canvas.height * placement.y + bob - size / 2,
        size,
        size
      );
    }

    ctx.restore();
  }

  private drawMissingCharacter(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    label: string
  ): void {
    ctx.save();
    ctx.fillStyle = "rgba(255, 242, 210, 0.76)";
    ctx.strokeStyle = "rgba(88, 60, 32, 0.7)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#3a2a1d";
    ctx.font = "18px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x + width / 2, y + height / 2);
    ctx.restore();
  }

  private drawTitleDecorations(ctx: CanvasRenderingContext2D): void {
    const { canvas } = ctx;
    const drift = Math.sin(this.elapsedTimeMs / 1100) * 6;

    ctx.save();
    ctx.globalAlpha = 0.9;

    this.drawSteam(ctx, canvas.width * 0.18, canvas.height * 0.72, drift);
    this.drawSteam(ctx, canvas.width * 0.78, canvas.height * 0.74, -drift * 0.7);
    this.drawMikan(ctx, canvas.width * 0.82, canvas.height * 0.18 + drift * 0.4, 26);

    for (let i = 0; i < 9; i += 1) {
      const x = (canvas.width * (0.1 + i * 0.1)) % canvas.width;
      const y = 90 + ((i * 53) % 210) + Math.sin(this.elapsedTimeMs / 900 + i) * 5;
      this.drawStar(ctx, x, y, i % 3 === 0 ? 13 : 8);
    }

    ctx.restore();
  }

  private drawSteam(ctx: CanvasRenderingContext2D, x: number, y: number, drift: number): void {
    ctx.save();
    ctx.strokeStyle = "rgba(255, 248, 232, 0.58)";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";

    for (let i = 0; i < 3; i += 1) {
      const offsetX = i * 22 - 22;
      ctx.beginPath();
      ctx.moveTo(x + offsetX, y);
      ctx.bezierCurveTo(
        x + offsetX + 20 + drift,
        y - 28,
        x + offsetX - 18 - drift,
        y - 54,
        x + offsetX + 14,
        y - 82
      );
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawMikan(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number): void {
    ctx.save();
    ctx.fillStyle = "rgba(239, 145, 44, 0.9)";
    ctx.strokeStyle = "rgba(93, 57, 28, 0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x, y, radius, radius * 0.82, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "rgba(255, 221, 128, 0.55)";
    ctx.beginPath();
    ctx.moveTo(x, y - radius * 0.68);
    ctx.lineTo(x, y + radius * 0.68);
    ctx.stroke();
    ctx.fillStyle = "rgba(117, 145, 68, 0.85)";
    ctx.beginPath();
    ctx.ellipse(x + radius * 0.42, y - radius * 0.78, radius * 0.34, radius * 0.16, -0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number): void {
    ctx.save();
    ctx.fillStyle = "rgba(255, 219, 99, 0.86)";
    ctx.beginPath();

    for (let i = 0; i < 10; i += 1) {
      const currentRadius = i % 2 === 0 ? radius : radius * 0.42;
      const angle = -Math.PI / 2 + (i * Math.PI) / 5;
      const px = x + Math.cos(angle) * currentRadius;
      const py = y + Math.sin(angle) * currentRadius;

      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }

    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

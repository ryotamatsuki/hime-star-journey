import { floatingMotion, drawEllipseShadow } from "../animation/Effects";
import { AssetLoader } from "../core/AssetLoader";
import type { Camera } from "../core/Camera";
import { Player } from "./Player";

export type CompanionState = "follow" | "guide";

export class Companion {
  x: number;
  y: number;
  state: CompanionState = "follow";

  private elapsedTimeMs = 0;
  private frameIndex = 0;
  private frameTimerMs = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  update(deltaTime: number, player: Player): void {
    this.elapsedTimeMs += deltaTime * 1000;
    this.frameTimerMs += deltaTime * 1000;

    if (this.frameTimerMs >= 160) {
      this.frameTimerMs = 0;
      this.frameIndex = (this.frameIndex + 1) % 4;
    }

    const targetOffset = this.getTargetOffset(player);
    const targetX = player.x + targetOffset.x;
    const targetY = player.y + targetOffset.y;
    const followRate = this.state === "guide" ? 4.8 : 3.2;
    const t = 1 - Math.exp(-followRate * deltaTime);

    this.x += (targetX - this.x) * t;
    this.y += (targetY - this.y) * t;
  }

  render(ctx: CanvasRenderingContext2D, assetLoader: AssetLoader, camera?: Camera): void {
    const float = floatingMotion(this.elapsedTimeMs, 8, 1450);
    const screen =
      camera?.worldToScreen({ x: this.x + float.x, y: this.y + float.y }) ?? {
        x: this.x + float.x,
        y: this.y + float.y
      };
    const shadow = camera?.worldToScreen({ x: this.x, y: this.y }) ?? { x: this.x, y: this.y };
    const flyImage = assetLoader.getImage("shiro_fly_sheet");
    const idleImage = assetLoader.getImage("shiro_idle");

    drawEllipseShadow(ctx, shadow.x, shadow.y + 4, 34, 10, 0.14);

    if (flyImage) {
      this.renderFlySheet(ctx, flyImage, screen.x, screen.y);
      return;
    }

    if (idleImage) {
      ctx.drawImage(idleImage, screen.x - 34, screen.y - 62, 68, 68);
      return;
    }

    this.drawFallback(ctx, screen.x, screen.y);
  }

  getDepthY(): number {
    return this.y;
  }

  private getTargetOffset(player: Player): { x: number; y: number } {
    if (player.lastDirection === "left") {
      return { x: 58, y: -30 };
    }

    if (player.lastDirection === "right") {
      return { x: -58, y: -32 };
    }

    if (player.lastDirection === "up") {
      return { x: 58, y: 36 };
    }

    return { x: 62, y: -44 };
  }

  private renderFlySheet(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number): void {
    const columns = 4;
    const frameWidth = image.naturalWidth / columns;
    const frameHeight = image.naturalHeight;

    ctx.drawImage(
      image,
      this.frameIndex * frameWidth,
      0,
      frameWidth,
      frameHeight,
      x - 35,
      y - 64,
      70,
      70
    );
  }

  private drawFallback(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.save();
    ctx.fillStyle = "#fff9ed";
    ctx.strokeStyle = "rgba(86, 58, 32, 0.45)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x, y - 30, 28, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(x - 24, y - 28, 18, 8, -0.2, 0, Math.PI * 2);
    ctx.ellipse(x + 24, y - 28, 18, 8, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#22201d";
    ctx.beginPath();
    ctx.arc(x - 8, y - 34, 3, 0, Math.PI * 2);
    ctx.arc(x + 8, y - 34, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

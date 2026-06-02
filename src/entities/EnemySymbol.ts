import { blink, drawEllipseShadow, floatingMotion } from "../animation/Effects";
import { AssetLoader } from "../core/AssetLoader";
import type { Camera } from "../core/Camera";
import type { EnemySymbolData } from "../data/enemySymbols";
import { isEnemySymbolDefeated } from "../data/enemySymbols";
import type { Rect } from "../systems/CollisionSystem";
import type { SaveData } from "../types/save";

export class EnemySymbol {
  readonly symbolId: string;
  readonly encounterId: string;
  readonly locationId: string;
  readonly areaId: string;
  readonly required: boolean;
  readonly defeatedFlag: string;
  readonly openedPathFlag?: string;
  readonly animationType: EnemySymbolData["animationType"];
  readonly assetId: string;
  readonly label: string;

  x: number;
  y: number;

  private elapsedTimeMs = 0;
  private readonly collider: Rect;

  constructor(private readonly data: EnemySymbolData) {
    this.symbolId = data.symbolId;
    this.encounterId = data.encounterId;
    this.locationId = data.locationId;
    this.areaId = data.areaId;
    this.required = data.required;
    this.defeatedFlag = data.defeatedFlag;
    this.openedPathFlag = data.openedPathFlag;
    this.animationType = data.animationType;
    this.assetId = data.assetId;
    this.label = data.label;
    this.x = data.x;
    this.y = data.y;
    this.collider = data.collider;
  }

  update(deltaTime: number): void {
    this.elapsedTimeMs += deltaTime * 1000;
  }

  render(ctx: CanvasRenderingContext2D, assetLoader: AssetLoader, camera?: Camera): void {
    const offset = this.getAnimationOffset();
    const worldX = this.x + offset.x;
    const worldY = this.y + offset.y;
    const screen = camera?.worldToScreen({ x: worldX, y: worldY }) ?? { x: worldX, y: worldY };
    const shadow = camera?.worldToScreen({ x: this.x, y: this.y }) ?? { x: this.x, y: this.y };
    const opacity = this.animationType === "blink" ? blink(this.elapsedTimeMs, 420, 0.56, 1) : 1;
    const image = assetLoader.getImage(this.assetId);
    const drawSize = this.assetId.includes("mouse") ? 62 : this.assetId.includes("lantern") ? 72 : 82;

    drawEllipseShadow(ctx, shadow.x, shadow.y + 4, drawSize * 0.68, 14, 0.2);

    ctx.save();
    ctx.globalAlpha *= opacity;

    if (image) {
      ctx.drawImage(image, screen.x - drawSize / 2, screen.y - drawSize, drawSize, drawSize);
      ctx.restore();
      return;
    }

    this.drawFallback(ctx, screen.x, screen.y);
    ctx.restore();
  }

  getCollider(): Rect {
    return {
      x: this.x + this.collider.x,
      y: this.y + this.collider.y,
      width: this.collider.width,
      height: this.collider.height
    };
  }

  getDepthY(): number {
    return this.y;
  }

  isDefeated(saveData: SaveData): boolean {
    return isEnemySymbolDefeated(this.data, saveData);
  }

  private getAnimationOffset(): { x: number; y: number } {
    if (this.animationType === "float" || this.animationType === "blink") {
      return floatingMotion(this.elapsedTimeMs, 8, 1200);
    }

    if (this.animationType === "wander") {
      return {
        x: Math.sin(this.elapsedTimeMs / 760) * 10,
        y: Math.sin(this.elapsedTimeMs / 410) * 2
      };
    }

    if (this.animationType === "scurry") {
      return {
        x: Math.sin(this.elapsedTimeMs / 118) * 4 + Math.sin(this.elapsedTimeMs / 760) * 7,
        y: Math.cos(this.elapsedTimeMs / 132) * 2
      };
    }

    if (this.animationType === "shake") {
      return {
        x: Math.sin(this.elapsedTimeMs / 74) * 2.2,
        y: Math.cos(this.elapsedTimeMs / 220) * 2
      };
    }

    return { x: 0, y: 0 };
  }

  private drawFallback(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const fillColor = this.assetId.includes("lantern")
      ? "#d77938"
      : this.assetId.includes("mouse")
        ? "#b9a783"
        : this.assetId.includes("armor")
          ? "#7f8b92"
          : "#91629a";

    ctx.fillStyle = fillColor;
    ctx.strokeStyle = "rgba(45, 28, 28, 0.52)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x, y - 38, 28, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fff2a0";
    ctx.beginPath();
    ctx.arc(x - 9, y - 42, 4, 0, Math.PI * 2);
    ctx.arc(x + 9, y - 42, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

import { drawEllipseShadow, floatingMotion } from "../animation/Effects";
import type { AssetLoader } from "../core/AssetLoader";
import type { Camera } from "../core/Camera";
import type { NpcData } from "../data/npcs";
import type { Rect } from "../systems/CollisionSystem";

export class NPC {
  readonly id: string;
  readonly name: string;
  readonly assetId: string;
  readonly dialogueId: string;
  readonly interactionRadius: number;
  readonly direction: NpcData["direction"];
  readonly animationType?: NpcData["animationType"];

  x: number;
  y: number;

  private elapsedTimeMs = 0;

  constructor(data: NpcData) {
    this.id = data.id;
    this.name = data.name;
    this.assetId = data.assetId;
    this.dialogueId = data.dialogueId;
    this.interactionRadius = data.interactionRadius;
    this.direction = data.direction;
    this.animationType = data.animationType;
    this.x = data.x;
    this.y = data.y;
  }

  update(deltaTime: number): void {
    this.elapsedTimeMs += deltaTime * 1000;
  }

  render(ctx: CanvasRenderingContext2D, assetLoader: AssetLoader, camera: Camera, isNearby: boolean): void {
    const float =
      this.animationType === "float" ? floatingMotion(this.elapsedTimeMs, 4, 1800) : { x: 0, y: 0 };
    const screen = camera.worldToScreen({ x: this.x + float.x, y: this.y + float.y });
    const image = assetLoader.getImage(this.assetId);
    const drawHeight = this.id === "npc_yumori_grandma" ? 126 : 132;
    const drawWidth = image
      ? Math.min(108, (image.naturalWidth / image.naturalHeight) * drawHeight)
      : 82;

    drawEllipseShadow(ctx, screen.x, screen.y + 4, 48, 15, 0.24);

    ctx.save();
    if (image) {
      ctx.drawImage(image, screen.x - drawWidth / 2, screen.y - drawHeight, drawWidth, drawHeight);
    } else {
      this.drawFallback(ctx, screen.x, screen.y, drawWidth, drawHeight);
    }

    if (isNearby) {
      this.drawInteractionLabel(ctx, screen.x, screen.y - drawHeight - 12);
    }
    ctx.restore();
  }

  getInteractionRect(): Rect {
    return {
      x: this.x - this.interactionRadius,
      y: this.y - this.interactionRadius,
      width: this.interactionRadius * 2,
      height: this.interactionRadius * 2
    };
  }

  getDepthY(): number {
    return this.y;
  }

  private drawInteractionLabel(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const label = `Enter：話す ${this.name}`;
    const width = Math.max(132, label.length * 13);
    const left = x - width / 2;

    ctx.fillStyle = "rgba(255, 248, 218, 0.94)";
    ctx.strokeStyle = "rgba(99, 67, 34, 0.72)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(left, y, width, 30, 9);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#3a2b20";
    ctx.font = "700 14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x, y + 15);
  }

  private drawFallback(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
    ctx.fillStyle = this.id.includes("grandma") ? "#b992c9" : "#6f7f98";
    ctx.strokeStyle = "rgba(50, 34, 24, 0.55)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x, y - height + 24, width * 0.28, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillRect(x - width * 0.28, y - height + 42, width * 0.56, height - 42);
  }
}

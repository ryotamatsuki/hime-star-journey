import type { InteractableData } from "../data/interactables";
import type { Camera } from "../core/Camera";
import { expandRect, type Rect } from "../systems/CollisionSystem";

export type InteractHandler = (interactable: Interactable) => void;

export class Interactable {
  readonly id: string;
  readonly locationId: string;
  readonly areaId: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly label: string;
  readonly kind: InteractableData["kind"];
  readonly requiredFlags?: string[];
  readonly message: string;

  constructor(
    data: InteractableData,
    private readonly onInteract: InteractHandler
  ) {
    this.id = data.id;
    this.locationId = data.locationId;
    this.areaId = data.areaId;
    this.x = data.x;
    this.y = data.y;
    this.width = data.width;
    this.height = data.height;
    this.label = data.label;
    this.kind = data.kind;
    this.requiredFlags = data.requiredFlags;
    this.message = data.message;
  }

  interact(): void {
    this.onInteract(this);
  }

  render(ctx: CanvasRenderingContext2D, isNearby: boolean, camera?: Camera): void {
    const centerWorldX = this.x + this.width / 2;
    const centerWorldY = this.y + this.height / 2;
    const screen =
      camera?.worldToScreen({ x: centerWorldX, y: centerWorldY }) ?? {
        x: centerWorldX,
        y: centerWorldY
      };

    ctx.save();
    ctx.globalAlpha = isNearby ? 0.98 : 0.68;

    if (this.kind === "steam") {
      this.drawSteam(ctx, screen.x, screen.y);
    } else if (this.kind === "star_hint") {
      this.drawStarHint(ctx, screen.x, screen.y);
    } else {
      this.drawSign(ctx, screen.x, screen.y);
    }

    if (isNearby) {
      ctx.fillStyle = "rgba(255, 248, 218, 0.92)";
      ctx.strokeStyle = "rgba(99, 67, 34, 0.65)";
      ctx.lineWidth = 1.5;
      const labelWidth = Math.max(96, this.label.length * 16 + 24);
      const labelX = screen.x - labelWidth / 2;
      const labelY = screen.y - this.height / 2 - 38;
      ctx.beginPath();
      ctx.roundRect(labelX, labelY, labelWidth, 28, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#3a2b20";
      ctx.font = "700 15px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.label, screen.x, labelY + 14);
    }

    ctx.restore();
  }

  getCollider(): Rect {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }

  getInteractionRect(): Rect {
    return expandRect(this.getCollider(), 34);
  }

  getDepthY(): number {
    return this.y + this.height;
  }

  private drawSign(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.fillStyle = "#8f653c";
    ctx.fillRect(x - 26, y - 28, 52, 42);
    ctx.fillStyle = "#4e3322";
    ctx.fillRect(x - 4, y + 12, 8, 34);
    ctx.strokeStyle = "rgba(255, 232, 160, 0.65)";
    ctx.strokeRect(x - 20, y - 22, 40, 30);
  }

  private drawSteam(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.strokeStyle = "rgba(255, 255, 245, 0.72)";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";

    for (let i = 0; i < 3; i += 1) {
      const offset = i * 22 - 22;
      ctx.beginPath();
      ctx.moveTo(x + offset, y + 28);
      ctx.bezierCurveTo(x + offset + 18, y, x + offset - 18, y - 20, x + offset + 10, y - 48);
      ctx.stroke();
    }
  }

  private drawStarHint(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.fillStyle = "rgba(255, 220, 94, 0.84)";
    ctx.strokeStyle = "rgba(255, 247, 192, 0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 10; i += 1) {
      const radius = i % 2 === 0 ? 26 : 10;
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
  }
}

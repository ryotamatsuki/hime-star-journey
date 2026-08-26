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
  private windAwake = false;

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

  setWindAwake(value: boolean): void {
    this.windAwake = value;
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
    } else if (this.kind === "p12_windmill") {
      this.drawWindmill(ctx, screen.x, screen.y);
    } else if (this.kind === "p12_portal") {
      this.drawPortal(ctx, screen.x, screen.y);
    } else if (this.kind === "p12_puzzle") {
      this.drawPuzzle(ctx, screen.x, screen.y);
    } else if (this.kind === "p12_reward") {
      this.drawReward(ctx, screen.x, screen.y);
    } else if (this.kind === "p12_scenic") {
      this.drawScenic(ctx, screen.x, screen.y);
    } else if (this.kind === "p12_shortcut") {
      this.drawShortcut(ctx, screen.x, screen.y);
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

  private drawWindmill(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.strokeStyle = this.windAwake ? "rgba(255, 248, 164, 0.98)" : "rgba(245, 239, 196, 0.88)";
    ctx.fillStyle = "rgba(57, 93, 103, 0.94)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x, y + 42);
    ctx.lineTo(x, y - 6);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y - 10, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    for (let index = 0; index < 4; index += 1) {
      const angle = index * Math.PI / 2 + Math.PI / 4 + (this.windAwake ? 0.22 : 0);
      ctx.beginPath();
      ctx.moveTo(x, y - 10);
      ctx.lineTo(x + Math.cos(angle) * 34, y - 10 + Math.sin(angle) * 34);
      ctx.stroke();
    }
  }

  private drawPortal(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.fillStyle = "rgba(38, 111, 132, 0.9)";
    ctx.strokeStyle = "rgba(255, 235, 158, 0.9)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(x - 34, y - 20, 68, 40, 12);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fff1b2";
    ctx.beginPath();
    ctx.moveTo(x - 12, y);
    ctx.lineTo(x + 10, y - 12);
    ctx.lineTo(x + 10, y - 4);
    ctx.lineTo(x + 18, y - 4);
    ctx.lineTo(x + 18, y + 4);
    ctx.lineTo(x + 10, y + 4);
    ctx.lineTo(x + 10, y + 12);
    ctx.closePath();
    ctx.fill();
  }

  private drawPuzzle(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.save();
    ctx.strokeStyle = "rgba(255, 246, 194, 0.95)";
    ctx.fillStyle = "rgba(58, 127, 143, 0.92)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - 34, y + 20);
    ctx.lineTo(x - 34, y - 22);
    ctx.lineTo(x + 34, y - 22);
    ctx.lineTo(x + 34, y + 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 24, y - 8);
    ctx.lineTo(x, y - 20);
    ctx.lineTo(x + 24, y - 8);
    ctx.lineTo(x, y + 4);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  private drawReward(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.save();
    ctx.fillStyle = "rgba(255, 222, 104, 0.96)";
    ctx.shadowColor = "rgba(255, 226, 120, 0.78)";
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(x, y - 4, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#fff7c1";
    ctx.beginPath();
    ctx.arc(x - 6, y - 10, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawScenic(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.save();
    ctx.strokeStyle = "rgba(255, 248, 212, 0.92)";
    ctx.fillStyle = "rgba(47, 118, 135, 0.82)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - 36, y + 24);
    ctx.lineTo(x - 24, y - 28);
    ctx.lineTo(x + 24, y - 28);
    ctx.lineTo(x + 36, y + 24);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 18, y - 4);
    ctx.lineTo(x, y - 18);
    ctx.lineTo(x + 18, y - 4);
    ctx.stroke();
    ctx.restore();
  }

  private drawShortcut(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.save();
    ctx.strokeStyle = "rgba(255, 239, 142, 0.95)";
    ctx.lineWidth = 5;
    ctx.setLineDash([8, 7]);
    ctx.beginPath();
    ctx.moveTo(x - 36, y + 18);
    ctx.bezierCurveTo(x - 8, y - 28, x + 10, y + 28, x + 36, y - 18);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }
}

import { drawEllipseShadow } from "../animation/Effects";
import { AssetLoader } from "../core/AssetLoader";
import type { Camera } from "../core/Camera";
import { InputManager } from "../core/InputManager";
import { moveRectWithCollisions, type Rect } from "../systems/CollisionSystem";

export type Direction = "up" | "down" | "left" | "right";

export type PlayerCollider = Rect;

const walkRowByDirection: Record<Direction, number> = {
  down: 0,
  left: 1,
  right: 2,
  up: 3
};

export class Player {
  x: number;
  y: number;
  width = 94;
  height = 128;
  speed = 190;
  lastDirection: Direction = "down";

  private isMoving = false;
  private frameIndex = 0;
  private frameTimerMs = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  update(
    deltaTime: number,
    inputManager: InputManager,
    collisionRects: Rect[],
    bounds: Rect
  ): void {
    const xAxis =
      (inputManager.isActionDown("right") ? 1 : 0) -
      (inputManager.isActionDown("left") ? 1 : 0);
    const yAxis =
      (inputManager.isActionDown("down") ? 1 : 0) -
      (inputManager.isActionDown("up") ? 1 : 0);
    const length = Math.hypot(xAxis, yAxis);
    this.isMoving = length > 0;

    if (this.isMoving) {
      const normalizedX = xAxis / length;
      const normalizedY = yAxis / length;
      const currentCollider = this.getCollider();
      const movement = moveRectWithCollisions(
        currentCollider,
        normalizedX * this.speed * deltaTime,
        normalizedY * this.speed * deltaTime,
        collisionRects,
        bounds
      );

      this.x += movement.rect.x - currentCollider.x;
      this.y += movement.rect.y - currentCollider.y;

      if (Math.abs(normalizedX) > Math.abs(normalizedY)) {
        this.lastDirection = normalizedX > 0 ? "right" : "left";
      } else {
        this.lastDirection = normalizedY > 0 ? "down" : "up";
      }

      this.frameTimerMs += deltaTime * 1000;
      if (this.frameTimerMs >= 135) {
        this.frameTimerMs = 0;
        this.frameIndex = (this.frameIndex + 1) % 4;
      }
    } else {
      this.frameTimerMs = 0;
      this.frameIndex = 0;
    }
  }

  render(ctx: CanvasRenderingContext2D, assetLoader: AssetLoader, camera?: Camera): void {
    const screen = camera?.worldToScreen({ x: this.x, y: this.y }) ?? { x: this.x, y: this.y };

    drawEllipseShadow(ctx, screen.x, screen.y + 4, 54, 18, 0.28);

    const walkImage = assetLoader.getImage("hime_walk_sheet");
    if (walkImage) {
      this.renderWalkSheet(ctx, walkImage, screen.x, screen.y);
      return;
    }

    const idleImage = assetLoader.getImage("hime_idle");
    if (idleImage) {
      ctx.drawImage(idleImage, screen.x - this.width / 2, screen.y - this.height, this.width, this.height);
      return;
    }

    this.drawFallback(ctx, screen.x, screen.y);
  }

  getCollider(): PlayerCollider {
    return {
      x: this.x - 21,
      y: this.y - 18,
      width: 42,
      height: 28
    };
  }

  getDepthY(): number {
    return this.y;
  }

  private renderWalkSheet(
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    x: number,
    y: number
  ): void {
    const columns = 4;
    const rows = 4;
    const frameWidth = image.naturalWidth / columns;
    const frameHeight = image.naturalHeight / rows;
    const row = walkRowByDirection[this.lastDirection];
    const frame = this.isMoving ? this.frameIndex : 0;

    ctx.drawImage(
      image,
      frame * frameWidth,
      row * frameHeight,
      frameWidth,
      frameHeight,
      x - this.width / 2,
      y - this.height,
      this.width,
      this.height
    );
  }

  private drawFallback(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.save();
    ctx.fillStyle = "#d86d2f";
    ctx.beginPath();
    ctx.ellipse(x, y - 82, 28, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f5c79a";
    ctx.beginPath();
    ctx.ellipse(x, y - 66, 25, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2c2b28";
    ctx.fillRect(x - 24, y - 48, 48, 58);
    ctx.fillStyle = "#8d9860";
    ctx.fillRect(x - 34, y - 48, 16, 44);
    ctx.fillRect(x + 18, y - 48, 16, 44);
    ctx.restore();
  }
}

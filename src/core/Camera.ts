import type { Rect } from "../systems/CollisionSystem";

export type Point = {
  x: number;
  y: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export class Camera {
  x = 0;
  y = 0;

  constructor(
    public width: number,
    public height: number,
    public worldWidth: number,
    public worldHeight: number
  ) {}

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.clampToWorld();
  }

  setWorldSize(worldWidth: number, worldHeight: number): void {
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.clampToWorld();
  }

  follow(targetX: number, targetY: number): void {
    this.x = targetX - this.width / 2;
    this.y = targetY - this.height / 2;
    this.clampToWorld();
  }

  worldToScreen(point: Point): Point {
    return {
      x: point.x - this.x,
      y: point.y - this.y
    };
  }

  screenToWorld(point: Point): Point {
    return {
      x: point.x + this.x,
      y: point.y + this.y
    };
  }

  getViewRect(): Rect {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }

  private clampToWorld(): void {
    this.x = clamp(this.x, 0, Math.max(0, this.worldWidth - this.width));
    this.y = clamp(this.y, 0, Math.max(0, this.worldHeight - this.height));
  }
}

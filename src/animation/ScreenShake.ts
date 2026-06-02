import type { Point2D } from "./Effects";

export class ScreenShake {
  private durationMs = 0;
  private magnitude = 0;
  private elapsedMs = 0;

  start(durationMs: number, magnitude: number): void {
    this.durationMs = Math.max(durationMs, 0);
    this.magnitude = Math.max(magnitude, 0);
    this.elapsedMs = 0;
  }

  update(deltaTime: number): void {
    if (!this.isActive()) {
      return;
    }

    this.elapsedMs = Math.min(this.elapsedMs + deltaTime * 1000, this.durationMs);
  }

  getOffset(): Point2D {
    if (!this.isActive()) {
      return { x: 0, y: 0 };
    }

    const progress = this.elapsedMs / this.durationMs;
    const strength = this.magnitude * (1 - progress);
    const phase = this.elapsedMs * 0.075;

    return {
      x: Math.sin(phase * 1.7) * strength,
      y: Math.cos(phase * 2.3) * strength
    };
  }

  isActive(): boolean {
    return this.durationMs > 0 && this.elapsedMs < this.durationMs && this.magnitude > 0;
  }
}

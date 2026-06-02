import { InputManager } from "./InputManager";
import { ScreenManager } from "./ScreenManager";

export class GameLoop {
  private animationFrameId: number | undefined;
  private lastFrameTime = 0;
  private running = false;

  constructor(
    private readonly ctx: CanvasRenderingContext2D,
    private readonly screenManager: ScreenManager,
    private readonly inputManager: InputManager
  ) {}

  start(): void {
    if (this.running) {
      return;
    }

    this.running = true;
    this.lastFrameTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    if (this.animationFrameId !== undefined) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.animationFrameId = undefined;
    this.running = false;
  }

  private readonly tick = (timestamp: number): void => {
    if (!this.running) {
      return;
    }

    const deltaTime = Math.min((timestamp - this.lastFrameTime) / 1000, 0.1);
    this.lastFrameTime = timestamp;

    this.screenManager.update(deltaTime);
    this.screenManager.render(this.ctx);
    this.inputManager.endFrame();

    this.animationFrameId = requestAnimationFrame(this.tick);
  };
}

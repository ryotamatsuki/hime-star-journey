export type ScreenId =
  | "title"
  | "prologue"
  | "starMap"
  | "explore"
  | "battle"
  | "notebook"
  | "ending";

export interface GameScreen {
  readonly id: ScreenId;
  enter(params?: unknown): void;
  update(deltaTime: number): void;
  render(ctx: CanvasRenderingContext2D): void;
  exit(): void;
}

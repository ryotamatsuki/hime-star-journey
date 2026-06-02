import type { GameScreen, ScreenId } from "../types/game";

export class ScreenManager {
  private readonly screens = new Map<ScreenId, GameScreen>();
  private currentScreen?: GameScreen;

  register(screen: GameScreen): void {
    this.screens.set(screen.id, screen);
  }

  has(screenId: ScreenId): boolean {
    return this.screens.has(screenId);
  }

  getCurrentScreenId(): ScreenId | undefined {
    return this.currentScreen?.id;
  }

  change(screenId: ScreenId, params?: unknown): void {
    const nextScreen = this.screens.get(screenId);

    if (!nextScreen) {
      throw new Error(`未登録の画面です: ${screenId}`);
    }

    this.currentScreen?.exit();
    this.currentScreen = nextScreen;
    nextScreen.enter(params);
  }

  update(deltaTime: number): void {
    this.currentScreen?.update(deltaTime);
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.currentScreen?.render(ctx);
  }
}

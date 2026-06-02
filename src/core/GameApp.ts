import { assetManifest } from "../data/assets";
import { BattleScreen } from "../screens/BattleScreen";
import { ExploreScreen } from "../screens/ExploreScreen";
import { PrologueScreen } from "../screens/PrologueScreen";
import { TitleScreen } from "../screens/TitleScreen";
import { AssetLoader } from "./AssetLoader";
import { GameLoop } from "./GameLoop";
import { InputManager } from "./InputManager";
import { SaveManager } from "./SaveManager";
import { ScreenManager } from "./ScreenManager";

export type GameAppOptions = {
  canvas: HTMLCanvasElement;
  uiRoot: HTMLElement;
};

export class GameApp {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly inputManager: InputManager;
  private readonly saveManager = new SaveManager();
  private readonly assetLoader = new AssetLoader();
  private readonly screenManager = new ScreenManager();
  private readonly gameLoop: GameLoop;

  constructor(private readonly options: GameAppOptions) {
    const ctx = options.canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Canvas 2Dコンテキストを取得できません。");
    }

    this.ctx = ctx;
    this.inputManager = new InputManager(options.canvas);
    this.gameLoop = new GameLoop(this.ctx, this.screenManager, this.inputManager);
  }

  async start(): Promise<void> {
    await this.assetLoader.loadManifest(assetManifest);
    this.registerScreens();
    this.screenManager.change("title");
    this.gameLoop.start();
  }

  stop(): void {
    this.gameLoop.stop();
    this.inputManager.destroy();
  }

  private registerScreens(): void {
    this.screenManager.register(
      new TitleScreen({
        uiRoot: this.options.uiRoot,
        screenManager: this.screenManager,
        saveManager: this.saveManager,
        assetLoader: this.assetLoader
      })
    );

    this.screenManager.register(
      new PrologueScreen({
        uiRoot: this.options.uiRoot,
        screenManager: this.screenManager,
        saveManager: this.saveManager,
        inputManager: this.inputManager,
        assetLoader: this.assetLoader
      })
    );

    this.screenManager.register(
      new ExploreScreen({
        uiRoot: this.options.uiRoot,
        screenManager: this.screenManager,
        saveManager: this.saveManager,
        inputManager: this.inputManager,
        assetLoader: this.assetLoader
      })
    );

    this.screenManager.register(
      new BattleScreen({
        uiRoot: this.options.uiRoot,
        screenManager: this.screenManager,
        saveManager: this.saveManager,
        inputManager: this.inputManager,
        assetLoader: this.assetLoader
      })
    );
  }
}

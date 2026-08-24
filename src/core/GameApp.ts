import { assetManifest } from "../data/assets";
import { BattleScreen } from "../screens/BattleScreen";
import { EndingScreen } from "../screens/EndingScreen";
import { ExploreScreen } from "../screens/ExploreScreen";
import { PrologueScreen } from "../screens/PrologueScreen";
import { StarMapScreen } from "../screens/StarMapScreen";
import { TitleScreen } from "../screens/TitleScreen";
import { P8FlowController } from "../systems/P8FlowController";
import { AssetLoader } from "./AssetLoader";
import { GameLoop } from "./GameLoop";
import { InputManager } from "./InputManager";
import { SaveManager } from "./SaveManager";
import { ScreenManager } from "./ScreenManager";

export type GameAppOptions = {
  canvas: HTMLCanvasElement;
  uiRoot: HTMLElement;
  saveKey?: string;
  initialScreenId?: "title" | "explore" | "starMap" | "ending";
  initialParams?: unknown;
};

export class GameApp {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly inputManager: InputManager;
  private readonly saveManager: SaveManager;
  private readonly assetLoader = new AssetLoader();
  private readonly screenManager = new ScreenManager();
  private readonly gameLoop: GameLoop;
  private readonly p8FlowController: P8FlowController;

  constructor(private readonly options: GameAppOptions) {
    const ctx = options.canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Canvas 2Dコンテキストを取得できません。");
    }

    this.ctx = ctx;
    this.inputManager = new InputManager(options.canvas);
    this.saveManager = new SaveManager(options.saveKey);
    this.gameLoop = new GameLoop(this.ctx, this.screenManager, this.inputManager);
    this.p8FlowController = new P8FlowController({
      uiRoot: options.uiRoot,
      saveManager: this.saveManager,
      screenManager: this.screenManager
    });
  }

  async start(): Promise<void> {
    await this.assetLoader.loadManifest(assetManifest);
    this.registerScreens();
    this.screenManager.change(this.options.initialScreenId ?? "title", this.options.initialParams);
    this.gameLoop.start();
    this.p8FlowController.start();
  }

  stop(): void {
    this.p8FlowController.stop();
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
      new StarMapScreen({
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

    this.screenManager.register(
      new EndingScreen({
        uiRoot: this.options.uiRoot,
        screenManager: this.screenManager,
        saveManager: this.saveManager,
        inputManager: this.inputManager,
        assetLoader: this.assetLoader
      })
    );
  }
}

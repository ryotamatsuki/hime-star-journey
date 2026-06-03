import { AssetLoader } from "../core/AssetLoader";
import { InputManager } from "../core/InputManager";
import { SaveManager } from "../core/SaveManager";
import { ScreenManager } from "../core/ScreenManager";
import type { GameScreen, ScreenId } from "../types/game";
import type { SaveData } from "../types/save";

type PrologueScreenOptions = {
  uiRoot: HTMLElement;
  screenManager: ScreenManager;
  saveManager: SaveManager;
  inputManager: InputManager;
  assetLoader: AssetLoader;
};

type PrologueParams = {
  saveData?: SaveData;
};

export class PrologueScreen implements GameScreen {
  readonly id: ScreenId = "prologue";
  private saveData: SaveData | null = null;

  constructor(private readonly options: PrologueScreenOptions) {}

  enter(params?: unknown): void {
    const typedParams = params as PrologueParams | undefined;
    this.saveData = typedParams?.saveData ?? this.options.saveManager.load();

    if (this.saveData) {
      this.saveData = this.options.saveManager.save({
        ...this.saveData,
        currentScreenId: "prologue",
        currentChapterId: "prologue"
      });
    }

    this.renderUi();
  }

  update(_deltaTime: number): void {
    if (this.options.inputManager.isActionStarted("cancel")) {
      this.options.screenManager.change("title");
      return;
    }

    if (this.options.inputManager.isActionStarted("confirm")) {
      this.goToStarMap();
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const { canvas } = ctx;

    this.options.assetLoader.drawImageOrFallback(
      ctx,
      "bg_dogo_explore",
      0,
      0,
      canvas.width,
      canvas.height,
      "prologue"
    );

    ctx.save();
    ctx.fillStyle = "rgba(35, 28, 22, 0.46)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff8e9";
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 8;
    ctx.font = "700 42px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("プロローグ画面", canvas.width / 2, 260);
    ctx.font = "24px sans-serif";
    ctx.fillText("後続フェーズで実装", canvas.width / 2, 316);
    ctx.restore();
  }

  exit(): void {
    this.options.uiRoot.innerHTML = "";
  }

  private renderUi(): void {
    this.options.uiRoot.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "screen-ui";

    const panel = document.createElement("section");
    panel.className = "prologue-panel";

    const title = document.createElement("h1");
    title.className = "screen-title";
    title.textContent = "プロローグ画面";

    const copy = document.createElement("p");
    copy.className = "screen-copy";
    copy.textContent = "小さな星を探して、まずは道後温泉へ向かいます。";

    const actions = document.createElement("div");
    actions.className = "menu-actions";

    const exploreButton = document.createElement("button");
    exploreButton.className = "menu-button";
    exploreButton.type = "button";
    exploreButton.textContent = "星地図へ進む";
    exploreButton.addEventListener("click", () => this.goToStarMap());

    const backButton = document.createElement("button");
    backButton.className = "menu-button secondary-button";
    backButton.type = "button";
    backButton.textContent = "タイトルへ戻る";
    backButton.addEventListener("click", () => {
      this.options.screenManager.change("title");
    });

    actions.append(exploreButton, backButton);
    panel.append(title, copy, actions);
    wrapper.append(panel);
    this.options.uiRoot.append(wrapper);
  }

  private goToStarMap(): void {
    const saveData =
      this.saveData ??
      this.options.saveManager.save(this.options.saveManager.createInitialSaveData());

    this.options.screenManager.change("starMap", { saveData });
  }
}

import { AssetLoader } from "../core/AssetLoader";
import { InputManager } from "../core/InputManager";
import { SaveManager } from "../core/SaveManager";
import { ScreenManager } from "../core/ScreenManager";
import { getEnemySymbolById } from "../data/enemySymbols";
import type { BattleStartParams } from "../types/battle";
import type { GameScreen, ScreenId } from "../types/game";
import type { SaveData } from "../types/save";

type BattleScreenOptions = {
  uiRoot: HTMLElement;
  screenManager: ScreenManager;
  saveManager: SaveManager;
  inputManager: InputManager;
  assetLoader: AssetLoader;
};

type BattleScreenParams = BattleStartParams & {
  saveData?: SaveData;
};

export class BattleScreen implements GameScreen {
  readonly id: ScreenId = "battle";

  private saveData: SaveData | null = null;
  private battleParams: BattleStartParams | null = null;

  constructor(private readonly options: BattleScreenOptions) {}

  enter(params?: unknown): void {
    const typedParams = params as BattleScreenParams | undefined;
    this.saveData = typedParams?.saveData ?? this.options.saveManager.load();
    this.battleParams = typedParams
      ? {
          enemySymbolId: typedParams.enemySymbolId,
          encounterId: typedParams.encounterId,
          returnLocationId: typedParams.returnLocationId,
          returnAreaId: typedParams.returnAreaId,
          isBoss: typedParams.isBoss
        }
      : null;

    this.renderUi();
  }

  update(_deltaTime: number): void {
    if (this.options.inputManager.isActionStarted("confirm")) {
      this.completeTemporaryVictory();
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const { canvas } = ctx;

    this.options.assetLoader.drawImageOrFallback(
      ctx,
      "bg_dogo_battle",
      0,
      0,
      canvas.width,
      canvas.height,
      "battle"
    );

    ctx.save();
    ctx.fillStyle = "rgba(26, 18, 22, 0.54)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff8e9";
    ctx.shadowColor = "rgba(0, 0, 0, 0.56)";
    ctx.shadowBlur = 8;
    ctx.font = "700 44px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("仮バトル画面", canvas.width / 2, 220);
    ctx.font = "22px sans-serif";
    ctx.fillText("フェーズ5で本格バトルへ差し替えます", canvas.width / 2, 278);

    if (this.battleParams) {
      ctx.font = "20px monospace";
      ctx.fillText(`encounterId: ${this.battleParams.encounterId}`, canvas.width / 2, 340);
      ctx.fillText(`enemySymbolId: ${this.battleParams.enemySymbolId}`, canvas.width / 2, 374);
    }

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
    panel.className = "battle-panel";

    const title = document.createElement("h1");
    title.className = "screen-title";
    title.textContent = "仮バトル画面";

    const details = document.createElement("p");
    details.className = "screen-copy";
    details.textContent = this.battleParams
      ? `${this.battleParams.encounterId} / ${this.battleParams.enemySymbolId}`
      : "バトル開始情報がありません。";

    const button = document.createElement("button");
    button.className = "menu-button";
    button.type = "button";
    button.textContent = "勝ったことにする";
    button.addEventListener("click", () => this.completeTemporaryVictory());

    panel.append(title, details, button);
    wrapper.append(panel);
    this.options.uiRoot.append(wrapper);
  }

  private completeTemporaryVictory(): void {
    if (!this.saveData || !this.battleParams) {
      this.options.screenManager.change("explore", {
        locationId: "dogo",
        areaId: "D0",
        saveData: this.saveData ?? this.options.saveManager.createInitialSaveData()
      });
      return;
    }

    const symbol = getEnemySymbolById(this.battleParams.enemySymbolId);
    const defeatedEnemyIds = Array.from(
      new Set([...this.saveData.defeatedEnemyIds, this.battleParams.enemySymbolId])
    );
    const flags = {
      ...this.saveData.flags,
      ...(symbol ? { [symbol.defeatedFlag]: true } : {})
    };
    const openedPaths =
      symbol?.openedPathFlag && !this.saveData.openedPaths.includes(symbol.openedPathFlag)
        ? [...this.saveData.openedPaths, symbol.openedPathFlag]
        : this.saveData.openedPaths;

    const nextSave = this.options.saveManager.save({
      ...this.saveData,
      currentScreenId: "explore",
      currentLocationId: this.battleParams.returnLocationId,
      currentAreaId: this.battleParams.returnAreaId,
      defeatedEnemyIds,
      openedPaths,
      flags
    });

    this.options.screenManager.change("explore", {
      saveData: nextSave,
      locationId: this.battleParams.returnLocationId,
      areaId: this.battleParams.returnAreaId
    });
  }
}

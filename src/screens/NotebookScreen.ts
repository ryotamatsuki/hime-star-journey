import { AssetLoader } from "../core/AssetLoader";
import { AudioManager } from "../core/AudioManager";
import { InputManager } from "../core/InputManager";
import { SaveManager } from "../core/SaveManager";
import { ScreenManager } from "../core/ScreenManager";
import { getBattleCard } from "../data/cards";
import { getUnlockedNotebookEntries, notebookEntries } from "../data/notebook";
import type { GameScreen, ScreenId } from "../types/game";
import type { SaveData } from "../types/save";

type NotebookScreenOptions = {
  uiRoot: HTMLElement;
  screenManager: ScreenManager;
  saveManager: SaveManager;
  inputManager: InputManager;
  assetLoader: AssetLoader;
  audioManager: AudioManager;
};

type NotebookScreenParams = {
  saveData?: SaveData;
  returnScreenId?: ScreenId;
};

export class NotebookScreen implements GameScreen {
  readonly id: ScreenId = "notebook";
  private saveData: SaveData | null = null;
  private returnScreenId: ScreenId = "explore";

  constructor(private readonly options: NotebookScreenOptions) {}

  enter(params?: unknown): void {
    const typed = params as NotebookScreenParams | undefined;
    this.saveData = typed?.saveData ?? this.options.saveManager.load();
    this.returnScreenId = this.resolveReturnScreen(typed?.returnScreenId, this.saveData);
    this.renderUi();
  }

  update(): void {
    if (
      this.options.inputManager.isActionStarted("notebook") ||
      this.options.inputManager.isActionStarted("cancel")
    ) {
      this.closeNotebook();
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const { canvas } = ctx;
    this.options.assetLoader.drawImageOrFallback(ctx, "bg_star_map", 0, 0, canvas.width, canvas.height, "notebook");
    ctx.save();
    ctx.fillStyle = "rgba(29, 24, 39, 0.58)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  exit(): void {
    this.options.uiRoot.innerHTML = "";
  }

  private renderUi(): void {
    this.options.uiRoot.innerHTML = "";
    const wrapper = document.createElement("div");
    wrapper.className = "screen-ui notebook-screen-ui";
    Object.assign(wrapper.style, {
      position: "absolute",
      inset: "0",
      padding: "24px",
      overflow: "auto",
      background: "rgba(24, 20, 31, 0.36)",
      color: "#3e2d23",
      pointerEvents: "auto"
    });

    const book = document.createElement("section");
    Object.assign(book.style, {
      width: "min(1080px, 96vw)",
      margin: "0 auto",
      padding: "28px",
      borderRadius: "22px",
      background: "linear-gradient(90deg, rgba(248,238,211,.97), rgba(255,249,229,.98) 49%, rgba(239,226,194,.97) 50%, rgba(252,244,220,.98))",
      boxShadow: "0 20px 50px rgba(20,12,28,.42)",
      border: "2px solid rgba(123,86,52,.65)"
    });

    const header = document.createElement("header");
    Object.assign(header.style, { display: "flex", gap: "16px", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" });
    const titleWrap = document.createElement("div");
    const title = document.createElement("h1");
    title.textContent = "ひめの旅の手帳";
    Object.assign(title.style, { margin: "0", fontSize: "clamp(26px, 4vw, 40px)" });
    const progress = document.createElement("p");
    const unlockedCount = this.saveData ? getUnlockedNotebookEntries(this.saveData).length : 0;
    progress.textContent = `旅の記録 ${unlockedCount}/${notebookEntries.length} / N・Esc で閉じる`;
    Object.assign(progress.style, { margin: "5px 0 0", opacity: "0.72" });
    titleWrap.append(title, progress);

    const headerActions = document.createElement("div");
    Object.assign(headerActions.style, { display: "flex", gap: "8px" });
    const muteButton = this.createButton(this.options.audioManager.isMuted() ? "音を出す" : "音を消す", () => {
      this.options.audioManager.setMuted(!this.options.audioManager.isMuted());
      this.renderUi();
    });
    const closeButton = this.createButton("手帳を閉じる", () => this.closeNotebook());
    headerActions.append(muteButton, closeButton);
    header.append(titleWrap, headerActions);

    const columns = document.createElement("div");
    Object.assign(columns.style, {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))",
      gap: "22px",
      marginTop: "24px"
    });

    columns.append(this.createStoryPanel(), this.createStatusPanel());
    book.append(header, columns);
    wrapper.append(book);
    this.options.uiRoot.append(wrapper);
  }

  private createStoryPanel(): HTMLElement {
    const panel = document.createElement("section");
    const heading = document.createElement("h2");
    heading.textContent = "旅の記録";
    panel.append(heading);

    if (!this.saveData) {
      const empty = document.createElement("p");
      empty.textContent = "セーブデータがありません。";
      panel.append(empty);
      return panel;
    }

    for (const entry of notebookEntries) {
      const unlocked = entry.unlocked(this.saveData);
      const card = document.createElement("article");
      Object.assign(card.style, {
        padding: "13px 15px",
        marginBottom: "10px",
        borderRadius: "12px",
        background: unlocked ? "rgba(255,255,255,.55)" : "rgba(92,75,65,.08)",
        border: "1px solid rgba(120,88,61,.24)",
        opacity: unlocked ? "1" : ".6"
      });
      const name = document.createElement("strong");
      name.textContent = unlocked ? entry.title : "？？？";
      const region = document.createElement("small");
      region.textContent = unlocked ? ` / ${entry.region}` : " / まだ見つけていない記録";
      Object.assign(region.style, { opacity: ".66" });
      const text = document.createElement("p");
      text.textContent = unlocked ? entry.text : "旅を進めると、このページに思い出が増えていきます。";
      Object.assign(text.style, { margin: "7px 0 0", lineHeight: "1.65" });
      card.append(name, region, text);
      panel.append(card);
    }
    return panel;
  }

  private createStatusPanel(): HTMLElement {
    const panel = document.createElement("section");
    const heading = document.createElement("h2");
    heading.textContent = "いまの旅";
    panel.append(heading);

    if (!this.saveData) return panel;

    const synopsis = document.createElement("p");
    synopsis.textContent = this.saveData.lastSynopsis || "旅はまだ始まったばかり。";
    Object.assign(synopsis.style, { lineHeight: "1.7", padding: "12px 14px", background: "rgba(255,255,255,.5)", borderRadius: "12px" });
    panel.append(synopsis);

    const region = document.createElement("p");
    const regionName = this.saveData.currentLocationId === "castle" ? "松山城" : "道後温泉";
    region.textContent = `地域メモ: ${regionName} / ${this.saveData.currentAreaId}`;
    panel.append(region);

    const starHeading = document.createElement("h3");
    starHeading.textContent = "集めた星";
    const stars = document.createElement("p");
    const starNames = this.saveData.collectedStars.map((id) => id === "dogo" ? "湯の星" : id === "castle" ? "城の星" : id);
    stars.textContent = starNames.length ? starNames.join("・") : "まだありません";
    panel.append(starHeading, stars);

    const cardHeading = document.createElement("h3");
    cardHeading.textContent = "使えるカード";
    const list = document.createElement("ul");
    for (const id of this.saveData.unlockedCards) {
      const card = getBattleCard(id);
      if (!card) continue;
      const item = document.createElement("li");
      item.textContent = `${card.name}: ${card.description}`;
      Object.assign(item.style, { marginBottom: "7px" });
      list.append(item);
    }
    panel.append(cardHeading, list);

    const saveHeading = document.createElement("h3");
    saveHeading.textContent = "オートセーブ";
    const saveText = document.createElement("p");
    const date = new Date(this.saveData.savedAt);
    saveText.textContent = Number.isNaN(date.getTime()) ? "保存時刻不明" : `最終保存: ${date.toLocaleString("ja-JP")}`;
    panel.append(saveHeading, saveText);
    return panel;
  }

  private createButton(label: string, onClick: () => void): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    Object.assign(button.style, {
      padding: "10px 14px",
      borderRadius: "12px",
      border: "1px solid rgba(92,61,42,.5)",
      background: "#fff8dd",
      color: "#493329",
      fontWeight: "700",
      cursor: "pointer"
    });
    button.addEventListener("click", onClick);
    return button;
  }

  private closeNotebook(): void {
    const save = this.saveData ?? this.options.saveManager.load();
    this.options.audioManager.playSe("cancel");
    this.options.screenManager.change(this.returnScreenId, save ? {
      saveData: save,
      locationId: save.currentLocationId,
      areaId: save.currentAreaId
    } : undefined);
  }

  private resolveReturnScreen(candidate: ScreenId | undefined, save: SaveData | null): ScreenId {
    if (candidate && candidate !== "notebook" && this.options.screenManager.has(candidate)) return candidate;
    if (save?.flags.gameCompleted === true) return "ending";
    if (save?.currentScreenId === "starMap") return "starMap";
    return "explore";
  }
}

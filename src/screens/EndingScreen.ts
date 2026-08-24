import { AssetLoader } from "../core/AssetLoader";
import { InputManager } from "../core/InputManager";
import { SaveManager } from "../core/SaveManager";
import { ScreenManager } from "../core/ScreenManager";
import type { GameScreen, ScreenId } from "../types/game";
import type { SaveData } from "../types/save";

type EndingScreenOptions = {
  uiRoot: HTMLElement;
  screenManager: ScreenManager;
  saveManager: SaveManager;
  inputManager: InputManager;
  assetLoader: AssetLoader;
};

type EndingScreenParams = {
  saveData?: SaveData;
};

export class EndingScreen implements GameScreen {
  readonly id: ScreenId = "ending";
  private saveData: SaveData | null = null;
  private elapsedMs = 0;

  constructor(private readonly options: EndingScreenOptions) {}

  enter(params?: unknown): void {
    const typed = params as EndingScreenParams | undefined;
    const loaded = typed?.saveData ?? this.options.saveManager.load();
    this.saveData = loaded
      ? this.options.saveManager.save({
          ...loaded,
          currentScreenId: "ending",
          currentChapterId: "mvp_ending"
        })
      : null;
    this.elapsedMs = 0;
    this.renderUi();
  }

  update(deltaTime: number): void {
    this.elapsedMs += deltaTime * 1000;
    if (this.options.inputManager.isActionStarted("confirm")) this.goToStarMap();
    if (this.options.inputManager.isActionStarted("cancel")) this.goToTitle();
  }

  render(ctx: CanvasRenderingContext2D): void {
    const { canvas } = ctx;
    this.options.assetLoader.drawImageOrFallback(ctx, "bg_star_map", 0, 0, canvas.width, canvas.height, "ending");

    ctx.save();
    const veil = ctx.createLinearGradient(0, 0, 0, canvas.height);
    veil.addColorStop(0, "rgba(17, 20, 43, 0.34)");
    veil.addColorStop(0.52, "rgba(31, 25, 53, 0.12)");
    veil.addColorStop(1, "rgba(25, 19, 39, 0.5)");
    ctx.fillStyle = veil;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.drawRecoveredPendant(ctx);
    this.drawOpenStars(ctx);
    this.drawCharacters(ctx);
    ctx.restore();
  }

  exit(): void {
    this.options.uiRoot.innerHTML = "";
  }

  private renderUi(): void {
    this.options.uiRoot.innerHTML = "";
    const wrapper = document.createElement("div");
    wrapper.className = "screen-ui ending-screen-ui";
    Object.assign(wrapper.style, {
      position: "absolute",
      inset: "0",
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      padding: "0 24px 34px",
      pointerEvents: "none"
    });

    const panel = document.createElement("section");
    Object.assign(panel.style, {
      width: "min(760px, 92vw)",
      padding: "22px 28px",
      borderRadius: "22px",
      border: "2px solid rgba(255, 230, 151, 0.85)",
      background: "rgba(37, 29, 53, 0.9)",
      color: "#fff8e5",
      boxShadow: "0 14px 38px rgba(20, 12, 30, 0.42)",
      textAlign: "center",
      pointerEvents: "auto"
    });

    const kicker = document.createElement("p");
    kicker.textContent = "みかん星の光が戻った";
    Object.assign(kicker.style, { margin: "0 0 6px", opacity: "0.82", fontWeight: "700" });

    const title = document.createElement("h1");
    title.textContent = "小さな星めぐりは、まだ続く";
    Object.assign(title.style, { margin: "0 0 12px", fontSize: "clamp(26px, 4vw, 40px)" });

    const story = document.createElement("p");
    story.textContent = "カゲマサは再び封じられ、みかん星の核と城の星がペンダントへ戻りました。道後の湯けむりと松山城の光も、少しずつ元の姿を取り戻していきます。";
    Object.assign(story.style, { margin: "0 auto 10px", lineHeight: "1.75", maxWidth: "650px" });

    const next = document.createElement("p");
    next.textContent = "けれど星地図には、まだ名前のない空白の星が残っています。次は、どこの星を探しに行く？";
    Object.assign(next.style, { margin: "0 auto 18px", lineHeight: "1.7", fontWeight: "700", maxWidth: "650px" });

    const actions = document.createElement("div");
    Object.assign(actions.style, { display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" });

    const mapButton = this.createButton("星地図を見る", () => this.goToStarMap());
    const titleButton = this.createButton("タイトルへ", () => this.goToTitle(), true);
    actions.append(mapButton, titleButton);
    panel.append(kicker, title, story, next, actions);
    wrapper.append(panel);
    this.options.uiRoot.append(wrapper);
  }

  private createButton(label: string, onClick: () => void, secondary = false): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    Object.assign(button.style, {
      minWidth: "170px",
      padding: "12px 18px",
      borderRadius: "14px",
      border: "2px solid rgba(255, 230, 151, 0.88)",
      background: secondary ? "rgba(255,255,255,0.08)" : "linear-gradient(180deg, #d88a45, #a85b32)",
      color: "#fff8e5",
      font: "700 16px sans-serif",
      cursor: "pointer"
    });
    button.addEventListener("click", onClick);
    return button;
  }

  private goToStarMap(): void {
    if (!this.saveData) return;
    const nextSave = this.options.saveManager.save({
      ...this.saveData,
      currentScreenId: "starMap",
      currentChapterId: "post_mvp_star_map"
    });
    this.options.screenManager.change("starMap", { saveData: nextSave });
  }

  private goToTitle(): void {
    // Keep the ending checkpoint in localStorage. TitleScreen is only a temporary view;
    // overwriting currentScreenId with "title" would make "つづきから" resolve to prologue.
    this.options.screenManager.change("title");
  }

  private drawRecoveredPendant(ctx: CanvasRenderingContext2D): void {
    const { canvas } = ctx;
    const pulse = 1 + Math.sin(this.elapsedMs / 520) * 0.06;
    const x = canvas.width * 0.5;
    const y = canvas.height * 0.25;
    const radius = 62 * pulse;
    const glow = ctx.createRadialGradient(x, y, 8, x, y, radius * 2.4);
    glow.addColorStop(0, "rgba(255, 244, 172, 0.95)");
    glow.addColorStop(0.35, "rgba(255, 177, 75, 0.62)");
    glow.addColorStop(1, "rgba(255, 177, 75, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, radius * 2.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffd66d";
    ctx.beginPath();
    for (let index = 0; index < 10; index += 1) {
      const angle = -Math.PI / 2 + (index * Math.PI) / 5;
      const r = index % 2 === 0 ? radius : radius * 0.42;
      const px = x + Math.cos(angle) * r;
      const py = y + Math.sin(angle) * r;
      if (index === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }

  private drawOpenStars(ctx: CanvasRenderingContext2D): void {
    const { canvas } = ctx;
    const stars = [
      { x: 0.2, y: 0.2, filled: true },
      { x: 0.78, y: 0.18, filled: true },
      { x: 0.15, y: 0.48, filled: false },
      { x: 0.84, y: 0.48, filled: false },
      { x: 0.68, y: 0.36, filled: false }
    ];
    for (const star of stars) {
      const x = canvas.width * star.x;
      const y = canvas.height * star.y;
      const blink = 0.68 + Math.sin(this.elapsedMs / 700 + star.x * 8) * 0.2;
      ctx.save();
      ctx.globalAlpha = star.filled ? blink : 0.28;
      ctx.strokeStyle = star.filled ? "#fff0a6" : "rgba(255,255,255,0.62)";
      ctx.fillStyle = star.filled ? "#ffd56b" : "rgba(255,255,255,0.05)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, star.filled ? 13 : 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  private drawCharacters(ctx: CanvasRenderingContext2D): void {
    const { canvas } = ctx;
    const hime = this.options.assetLoader.getImage("hime_idle");
    const shiro = this.options.assetLoader.getImage("shiro_idle");
    const bob = Math.sin(this.elapsedMs / 820) * 4;
    if (hime) ctx.drawImage(hime, canvas.width * 0.31, canvas.height * 0.34 + bob, 170, 260);
    if (shiro) ctx.drawImage(shiro, canvas.width * 0.61, canvas.height * 0.4 - bob, 92, 92);
  }
}

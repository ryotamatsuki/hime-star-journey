import { AudioManager } from "../core/AudioManager";
import { InputManager } from "../core/InputManager";
import { SaveManager } from "../core/SaveManager";
import { ScreenManager } from "../core/ScreenManager";
import type { ScreenId } from "../types/game";

const NOTEBOOK_SAFE_SCREENS = new Set<ScreenId>(["explore", "starMap", "ending"]);
const AUTOSAVE_SAFE_SCREENS = new Set<ScreenId>(["explore", "starMap", "ending"]);

export class P9ExperienceController {
  private autosaveTimerId = 0;
  private lastAudioScreen: ScreenId | undefined;
  private lastAudioLocation = "";

  constructor(
    private readonly uiRoot: HTMLElement,
    private readonly screenManager: ScreenManager,
    private readonly saveManager: SaveManager,
    private readonly inputManager: InputManager,
    private readonly audioManager: AudioManager
  ) {}

  start(): void {
    if (this.autosaveTimerId) return;
    this.autosaveTimerId = window.setInterval(() => this.autosaveCheckpoint(), 2000);
  }

  stop(): void {
    if (this.autosaveTimerId) window.clearInterval(this.autosaveTimerId);
    this.autosaveTimerId = 0;
    this.removeNotebookButton();
  }

  beforeFrame(): void {
    const screenId = this.screenManager.getCurrentScreenId();
    const save = this.saveManager.load();
    const locationId = save?.currentLocationId ?? "";

    if (screenId !== this.lastAudioScreen || locationId !== this.lastAudioLocation) {
      this.lastAudioScreen = screenId;
      this.lastAudioLocation = locationId;
      this.audioManager.syncForScreen(screenId, locationId);
    }

    if (screenId && NOTEBOOK_SAFE_SCREENS.has(screenId)) {
      this.ensureNotebookButton();
      if (this.inputManager.isActionStarted("notebook")) this.openNotebook(screenId);
    } else {
      this.removeNotebookButton();
    }
  }

  private openNotebook(returnScreenId: ScreenId): void {
    const save = this.saveManager.load();
    if (!save) return;
    this.audioManager.playSe("openNotebook");
    this.removeNotebookButton();
    this.screenManager.change("notebook", { saveData: save, returnScreenId });
  }

  private ensureNotebookButton(): void {
    if (this.uiRoot.querySelector("[data-notebook-open='true']")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.notebookOpen = "true";
    button.textContent = "旅の手帳 N";
    button.setAttribute("aria-label", "旅の手帳を開く");
    Object.assign(button.style, {
      position: "fixed",
      left: "22px",
      bottom: "22px",
      zIndex: "55",
      padding: "10px 14px",
      borderRadius: "14px",
      border: "2px solid rgba(255,232,169,.9)",
      background: "rgba(63,47,38,.88)",
      color: "#fff8df",
      font: "700 14px sans-serif",
      boxShadow: "0 7px 18px rgba(20,12,18,.3)",
      cursor: "pointer",
      pointerEvents: "auto"
    });
    button.addEventListener("click", () => {
      const current = this.screenManager.getCurrentScreenId();
      if (current && NOTEBOOK_SAFE_SCREENS.has(current)) this.openNotebook(current);
    });
    this.uiRoot.append(button);
  }

  private removeNotebookButton(): void {
    this.uiRoot.querySelector("[data-notebook-open='true']")?.remove();
  }

  private autosaveCheckpoint(): void {
    const current = this.screenManager.getCurrentScreenId();
    if (!current || !AUTOSAVE_SAFE_SCREENS.has(current)) return;
    const save = this.saveManager.load();
    if (!save) return;

    if (save.currentScreenId === current && save.flags.autosave_enabled === true) return;
    this.saveManager.save({
      ...save,
      currentScreenId: current,
      flags: { ...save.flags, autosave_enabled: true }
    });
    this.audioManager.playSe("save");
  }
}

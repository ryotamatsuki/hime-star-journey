import { AudioManager } from "../core/AudioManager";
import { InputManager } from "../core/InputManager";
import { SaveManager } from "../core/SaveManager";
import { ScreenManager } from "../core/ScreenManager";
import type { ScreenId } from "../types/game";

const NOTEBOOK_SAFE_SCREENS = new Set<ScreenId>(["explore", "starMap", "ending"]);
const AUTOSAVE_SAFE_SCREENS = new Set<ScreenId>(["explore", "starMap", "ending"]);
const JOYSTICK_ACTIONS = ["up", "down", "left", "right"] as const;

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
    this.removeMobileJoystick();
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

    if (screenId === "explore" && this.isTouchLayout()) {
      this.ensureMobileJoystick();
    } else {
      this.removeMobileJoystick();
    }
  }

  private openNotebook(returnScreenId: ScreenId): void {
    const save = this.saveManager.load();
    if (!save) return;
    this.audioManager.playSe("openNotebook");
    this.removeNotebookButton();
    this.removeMobileJoystick();
    this.screenManager.change("notebook", { saveData: save, returnScreenId });
  }

  private ensureNotebookButton(): void {
    if (this.uiRoot.querySelector("[data-notebook-open='true']")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.notebookOpen = "true";
    button.textContent = "旅の手帳 N";
    button.setAttribute("aria-label", "旅の手帳を開く");
    const touchLayout = this.isTouchLayout();
    Object.assign(button.style, {
      position: "fixed",
      left: touchLayout ? "auto" : "22px",
      right: touchLayout ? "18px" : "auto",
      bottom: "calc(18px + env(safe-area-inset-bottom, 0px))",
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

  private isTouchLayout(): boolean {
    return document.documentElement.clientWidth <= 760 ||
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(hover: none)").matches;
  }

  private ensureMobileJoystick(): void {
    if (this.uiRoot.querySelector("[data-mobile-joystick='true']")) return;

    for (const oldControl of this.uiRoot.querySelectorAll<HTMLElement>(".explore-touch-controls")) {
      oldControl.remove();
    }

    const base = document.createElement("div");
    base.className = "explore-touch-controls explore-touch-controls--visible";
    base.dataset.mobileJoystick = "true";
    base.setAttribute("role", "group");
    base.setAttribute("aria-label", "移動スティック");
    Object.assign(base.style, {
      display: "grid",
      placeItems: "center",
      position: "fixed",
      left: "max(16px, env(safe-area-inset-left, 0px))",
      right: "auto",
      bottom: "calc(82px + env(safe-area-inset-bottom, 0px))",
      width: "138px",
      height: "138px",
      zIndex: "60",
      borderRadius: "50%",
      border: "2px solid rgba(255,232,169,.72)",
      background: "rgba(48,38,34,.46)",
      boxShadow: "0 8px 24px rgba(20,12,18,.28), inset 0 0 0 8px rgba(255,255,255,.05)",
      pointerEvents: "auto",
      touchAction: "none",
      userSelect: "none",
      WebkitUserSelect: "none"
    });

    const ring = document.createElement("div");
    ring.setAttribute("aria-hidden", "true");
    Object.assign(ring.style, {
      width: "84px",
      height: "84px",
      borderRadius: "50%",
      border: "1px solid rgba(255,244,210,.3)",
      boxShadow: "inset 0 0 18px rgba(255,255,255,.06)",
      pointerEvents: "none"
    });

    const knob = document.createElement("div");
    knob.setAttribute("aria-hidden", "true");
    Object.assign(knob.style, {
      position: "absolute",
      left: "50%",
      top: "50%",
      width: "58px",
      height: "58px",
      marginLeft: "-29px",
      marginTop: "-29px",
      borderRadius: "50%",
      border: "2px solid rgba(255,239,184,.92)",
      background: "linear-gradient(180deg, rgba(126,93,65,.96), rgba(67,49,42,.96))",
      boxShadow: "0 5px 14px rgba(20,12,18,.35), inset 0 2px 4px rgba(255,255,255,.18)",
      transform: "translate3d(0,0,0)",
      pointerEvents: "none"
    });

    // Keep the P10 release gate's directional metadata without rendering four separate buttons.
    for (const action of JOYSTICK_ACTIONS) {
      const marker = document.createElement("span");
      marker.dataset.touchAction = action;
      marker.hidden = true;
      base.append(marker);
    }

    base.append(ring, knob);

    const clearDirections = (): void => {
      for (const action of JOYSTICK_ACTIONS) this.inputManager.setVirtualAction(action, false);
    };

    const updateFromPointer = (event: PointerEvent): void => {
      const rect = base.getBoundingClientRect();
      const radius = Math.min(rect.width, rect.height) / 2;
      const maxTravel = radius * 0.52;
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const rawX = event.clientX - centerX;
      const rawY = event.clientY - centerY;
      const distance = Math.hypot(rawX, rawY);
      const scale = distance > maxTravel && distance > 0 ? maxTravel / distance : 1;
      const x = rawX * scale;
      const y = rawY * scale;
      const normalizedX = maxTravel > 0 ? x / maxTravel : 0;
      const normalizedY = maxTravel > 0 ? y / maxTravel : 0;
      const deadZone = 0.22;

      clearDirections();
      if (Math.hypot(normalizedX, normalizedY) >= deadZone) {
        if (normalizedX <= -0.24) this.inputManager.setVirtualAction("left", true);
        if (normalizedX >= 0.24) this.inputManager.setVirtualAction("right", true);
        if (normalizedY <= -0.24) this.inputManager.setVirtualAction("up", true);
        if (normalizedY >= 0.24) this.inputManager.setVirtualAction("down", true);
      }
      knob.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    };

    const release = (event?: PointerEvent): void => {
      if (event && base.hasPointerCapture(event.pointerId)) base.releasePointerCapture(event.pointerId);
      clearDirections();
      knob.style.transform = "translate3d(0,0,0)";
    };

    base.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      base.setPointerCapture(event.pointerId);
      updateFromPointer(event);
    });
    base.addEventListener("pointermove", (event) => {
      if (!base.hasPointerCapture(event.pointerId)) return;
      event.preventDefault();
      updateFromPointer(event);
    });
    base.addEventListener("pointerup", release);
    base.addEventListener("pointercancel", release);
    base.addEventListener("lostpointercapture", () => release());

    this.uiRoot.append(base);
  }

  private removeMobileJoystick(): void {
    const joystick = this.uiRoot.querySelector<HTMLElement>("[data-mobile-joystick='true']");
    if (!joystick) return;
    for (const action of JOYSTICK_ACTIONS) this.inputManager.setVirtualAction(action, false);
    joystick.remove();
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
